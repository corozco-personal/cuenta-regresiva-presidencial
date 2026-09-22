import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { opinions } from "../../../db/schema";
import { countryNames } from "../../data/countries";
import { plainText } from "../../data/input-security";
import { classifyOpinion, looksAutomatedOpinion } from "../../data/opinion-moderation";
import { enforceRateLimit, verifyTurnstile } from "../../data/edge-security";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";

const ALLOWED_STANCES = new Set(["A favor", "En contra", "Neutral", "Mixta"]);
const OFFENSIVE = /\b(imb[eé]cil|idiota|est[uú]pido|malparid|hijueput|maric[oó]n|puta|basura humana|rata inmunda|matar|mu[eé]rete)\b/i;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function similarity(left: string, right: string) {
  const a = new Set(normalize(left).split(" ").filter((word) => word.length > 2));
  const b = new Set(normalize(right).split(" ").filter((word) => word.length > 2));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

function publicOpinion(row: typeof opinions.$inferSelect) {
  return {
    id: row.id,
    displayName: row.isAnonymous === "1" ? "Anónimo" : row.displayName,
    country: row.country,
    department: row.department,
    municipality: row.municipality,
    stance: row.stance,
    status: row.status,
    comment: row.comment,
    createdAt: row.createdAt,
  };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(opinions)
      .where(eq(opinions.status, "approved_manual"))
      .orderBy(desc(opinions.createdAt)).limit(100);
    return Response.json(
      { opinions: rows.filter((row) => !looksAutomatedOpinion(row.comment) && classifyOpinion(row.comment).accepted).slice(0, 50).map(publicOpinion) },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "El muro no está disponible temporalmente." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let auditPayload: unknown;
  try {
    const limited = await enforceRateLimit(request, "opiniones", 8, 900);
    if (limited) {
      await recordSecurityEvent(request, { endpoint: "opiniones", category: "rate_limit", severity: "medium", reason: "Límite de solicitudes excedido" });
      return limited;
    }
    const payload = await request.json() as Record<string, unknown>;
    auditPayload = payload;
    if (payload.website) {
      await recordSecurityEvent(request, { endpoint: "opiniones", category: "bot", severity: "medium", reason: "Campo trampa completado", payload });
      return Response.json({ ok: true }, { status: 202 });
    }
    const challenge = await verifyTurnstile(request, payload.turnstileToken, "submit-opinion");
    if (!challenge.ok) {
      await recordSecurityEvent(request, { endpoint: "opiniones", category: "bot", severity: "medium", reason: "Desafío Turnstile inválido" });
      return Response.json({ error: "Completa nuevamente la verificación antiabuso." }, { status: 403 });
    }
    const comment = plainText(payload.comment, { min: 20, max: 1200, multiline: true });
    const country = plainText(payload.country, { max: 80 });
    const department = country === "Colombia" ? plainText(payload.department, { max: 100, optional: true }) : "";
    const municipality = country === "Colombia" ? plainText(payload.municipality, { max: 100, optional: true }) : "";
    const stance = String(payload.stance ?? "Neutral");
    const isAnonymous = payload.isAnonymous !== false;
    const displayName = isAnonymous ? null : plainText(payload.displayName, { min: 2, max: 80 });
    if (!countryNames.has(country)) return Response.json({ error: "Selecciona un país válido de la lista." }, { status: 400 });
    if (!ALLOWED_STANCES.has(stance) || (!isAnonymous && !displayName)) return Response.json({ error: "Revisa la posición y el nombre antes de publicar." }, { status: 400 });
    const classification = classifyOpinion(comment);

    const db = getDb();
    const normalized = normalize(comment);
    const contentHash = await digest(normalized);
    const exact = await db.select({ id: opinions.id }).from(opinions).where(eq(opinions.contentHash, contentHash)).limit(1);
    if (exact.length) return Response.json({ error: "Esta opinión ya fue publicada.", duplicate: true }, { status: 409 });

    const recent = await db.select({ comment: opinions.comment }).from(opinions).orderBy(desc(opinions.createdAt)).limit(100);
    if (recent.some((item) => similarity(comment, item.comment) >= 0.86)) {
      return Response.json({ error: "Ya existe una opinión sustancialmente similar. Puedes aportar un argumento diferente.", duplicate: true }, { status: 409 });
    }

    const contributorId = String(payload.contributorId ?? "").trim().slice(0, 80);
    const network = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = request.headers.get("user-agent")?.slice(0, 220) ?? "unknown";
    const visitorSource = network
      ? `network:${network}|agent:${userAgent}`
      : /^[a-f0-9-]{20,80}$/i.test(contributorId) ? `device:${contributorId}` : `fallback:${userAgent}`;
    const visitorHash = await digest(visitorSource);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const previousByVisitor = await db.select({ id: opinions.id }).from(opinions)
      .where(and(eq(opinions.visitorHash, visitorHash), gte(opinions.createdAt, dayAgo))).limit(1);
    if (previousByVisitor.length) return Response.json({ error: "Ya registramos una opinión desde este navegador durante las últimas 24 horas.", duplicate: true }, { status: 429 });

    const offensive = OFFENSIVE.test(normalized);
    const status = offensive || !classification.accepted ? "quarantined" : "pending_manual";
    const moderationReason = offensive ? "Lenguaje ofensivo o de odio" : classification.reason;
    const row: typeof opinions.$inferInsert = {
      id: crypto.randomUUID(), contentHash, displayName, isAnonymous: isAnonymous ? "1" : "0", country,
      department: department || null, municipality: municipality || null, stance, comment, status,
      moderationReason, visitorHash, createdAt: new Date().toISOString(),
    };
    await db.insert(opinions).values(row);
    await recordModerationAction({ itemType: "opinion", itemId: row.id, fromStatus: "received", toStatus: status, reason: moderationReason });
    if (status === "quarantined") {
      await recordSecurityEvent(request, { endpoint: "opiniones", category: "spam", severity: offensive ? "high" : "low", reason: moderationReason, payload: { comment, country, stance } });
    }
    return Response.json({ queued: true, status: "pending_review" }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return Response.json({ error: "Esta opinión ya fue publicada.", duplicate: true }, { status: 409 });
    if (["invalid-text"].includes(message)) {
      await recordSecurityEvent(request, { endpoint: "opiniones", category: "injection", severity: "high", reason: "Patrón activo o formato no permitido", payload: auditPayload });
      return Response.json({ error: "Uno de los campos contiene formato no permitido. Escribe únicamente texto plano." }, { status: 400 });
    }
    return Response.json({ error: "No fue posible guardar la opinión. Intenta nuevamente." }, { status: 503 });
  }
}
