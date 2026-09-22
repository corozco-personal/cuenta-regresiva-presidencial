import { and, desc, eq, gte, notLike } from "drizzle-orm";
import { getDb } from "../../../db";
import { opinions } from "../../../db/schema";
import { looksAutomatedOpinion } from "../../data/opinion-moderation";

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
  const mustHideText = row.status === "filtered" || looksAutomatedOpinion(row.comment);
  return {
    id: row.id,
    displayName: row.isAnonymous === "1" ? "Anónimo" : row.displayName,
    country: row.country,
    department: row.department,
    municipality: row.municipality,
    stance: row.stance,
    status: row.status,
    comment: mustHideText ? "Contenido oculto por las políticas de privacidad y moderación." : row.comment,
    createdAt: row.createdAt,
  };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(opinions)
      .where(notLike(opinions.comment, "Opinión generada por%"))
      .orderBy(desc(opinions.createdAt)).limit(100);
    return Response.json(
      { opinions: rows.filter((row) => !looksAutomatedOpinion(row.comment)).slice(0, 50).map(publicOpinion) },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "El muro no está disponible temporalmente." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    if (payload.website) return Response.json({ ok: true }, { status: 201 });
    const comment = String(payload.comment ?? "").trim();
    const country = String(payload.country ?? "").trim();
    const department = String(payload.department ?? "").trim();
    const municipality = String(payload.municipality ?? "").trim();
    const stance = String(payload.stance ?? "Neutral");
    const isAnonymous = payload.isAnonymous !== false;
    const displayName = isAnonymous ? null : String(payload.displayName ?? "").trim();
    if (comment.length < 20 || comment.length > 1200 || !country || country.length > 80 || !ALLOWED_STANCES.has(stance) || (!isAnonymous && !displayName)) {
      return Response.json({ error: "Revisa los campos: la opinión debe tener entre 20 y 1.200 caracteres." }, { status: 400 });
    }
    if (looksAutomatedOpinion(comment)) {
      return Response.json({ error: "El texto parece contenido automático o de prueba y no puede publicarse." }, { status: 400 });
    }

    const db = getDb();
    const normalized = normalize(comment);
    const contentHash = await digest(normalized);
    const exact = await db.select({ id: opinions.id }).from(opinions).where(eq(opinions.contentHash, contentHash)).limit(1);
    if (exact.length) return Response.json({ error: "Esta opinión ya fue publicada.", duplicate: true }, { status: 409 });

    const recent = await db.select({ comment: opinions.comment }).from(opinions).orderBy(desc(opinions.createdAt)).limit(100);
    if (recent.some((item) => similarity(comment, item.comment) >= 0.86)) {
      return Response.json({ error: "Ya existe una opinión sustancialmente similar. Puedes aportar un argumento diferente.", duplicate: true }, { status: 409 });
    }

    const contributorId = String(payload.contributorId ?? "").trim();
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

    const status = OFFENSIVE.test(normalized) ? "filtered" : "published";
    const row: typeof opinions.$inferInsert = {
      id: crypto.randomUUID(), contentHash, displayName, isAnonymous: isAnonymous ? "1" : "0", country,
      department: department || null, municipality: municipality || null, stance, comment, status,
      moderationReason: status === "filtered" ? "Lenguaje ofensivo o de odio" : null, visitorHash, createdAt: new Date().toISOString(),
    };
    await db.insert(opinions).values(row);
    return Response.json({ opinion: publicOpinion(row as typeof opinions.$inferSelect), filtered: status === "filtered" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return Response.json({ error: "Esta opinión ya fue publicada.", duplicate: true }, { status: 409 });
    return Response.json({ error: "No fue posible guardar la opinión. Intenta nuevamente." }, { status: 503 });
  }
}
