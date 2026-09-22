import { env } from "cloudflare:workers";
import { desc, eq, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { moderationActions, newsSubmissions, opinions } from "../../../db/schema";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";
import { getAuthorizedReviewer } from "../../data/reviewer-auth";

const INTRUSION_TYPES = new Set(["rate_limit", "bot", "injection", "spam", "unsafe_url", "validation"]);

function unauthorized() {
  return Response.json({ error: "No encontrado." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}

function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return origin === new URL(request.url).origin; } catch { return false; }
}

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function GET() {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return unauthorized();
  try {
    const db = getDb();
    const [opinionRows, newsRows] = await Promise.all([
      db.select().from(opinions).orderBy(desc(opinions.createdAt)).limit(300),
      db.select().from(newsSubmissions).orderBy(desc(newsSubmissions.createdAt)).limit(300),
    ]);
    return Response.json({
      reviewer: { displayName: reviewer.displayName },
      opinions: opinionRows.map((row) => ({
        id: row.id, type: "opinion", status: row.status, comment: row.comment,
        displayName: row.isAnonymous === "1" ? "Anónimo" : row.displayName,
        country: row.country, department: row.department, municipality: row.municipality,
        stance: row.stance, reason: row.moderationReason, createdAt: row.createdAt,
      })),
      submissions: newsRows.map((row) => ({
        id: row.id, type: "news", status: row.status, title: row.title, url: row.url,
        domain: row.domain, displayName: row.isAnonymous === "1" ? "Anónimo" : row.submitterName,
        country: row.country, department: row.department, municipality: row.municipality,
        reliability: row.reliability, reason: row.reason, createdAt: row.createdAt,
      })),
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch {
    return Response.json({ error: "No fue posible cargar la cola." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return unauthorized();
  if (!hasValidOrigin(request)) return unauthorized();
  try {
    const payload = await request.json() as Record<string, unknown>;
    const itemType = String(payload.itemType ?? "");
    const itemId = String(payload.itemId ?? "");
    const action = String(payload.action ?? "");
    const intrusionType = String(payload.intrusionType ?? "spam");
    if (!/^[a-f0-9-]{20,80}$/i.test(itemId) || !["opinion", "news"].includes(itemType) || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    if (action === "reject" && !INTRUSION_TYPES.has(intrusionType)) return Response.json({ error: "Selecciona un tipo de intrusión válido." }, { status: 400 });

    const db = getDb();
    if (itemType === "opinion") {
      const [row] = await db.select().from(opinions).where(eq(opinions.id, itemId)).limit(1);
      if (!row) return Response.json({ error: "La opinión ya no existe." }, { status: 404 });
      const next = action === "approve" ? "approved_manual" : "rejected_manual";
      const reason = action === "approve" ? "Aprobación manual del propietario" : `Rechazo manual: ${intrusionType}`;
      await db.update(opinions).set({ status: next, moderationReason: reason, emailReviewTokenHash: null, emailReviewExpiresAt: null, emailReviewedAt: new Date().toISOString() }).where(eq(opinions.id, itemId));
      await recordModerationAction({ itemType: "opinion", itemId, fromStatus: row.status, toStatus: next, reason, reviewer: "owner" });
      if (action === "reject") await recordSecurityEvent(request, { endpoint: "manual-review", category: intrusionType as "rate_limit" | "bot" | "injection" | "spam" | "unsafe_url" | "validation", severity: ["injection", "unsafe_url"].includes(intrusionType) ? "high" : "medium", reason, fingerprintHash: row.visitorHash });
      return Response.json({ ok: true, status: next });
    }

    const [row] = await db.select().from(newsSubmissions).where(eq(newsSubmissions.id, itemId)).limit(1);
    if (!row) return Response.json({ error: "El enlace ya no existe." }, { status: 404 });
    const next = action === "approve" ? "approved_manual" : "rejected_manual";
    const reason = action === "approve" ? "Aprobación manual del propietario" : `Rechazo manual: ${intrusionType}`;
    await db.update(newsSubmissions).set({ status: next, reason, emailReviewTokenHash: null, emailReviewExpiresAt: null, emailReviewedAt: new Date().toISOString() }).where(eq(newsSubmissions.id, itemId));
    await recordModerationAction({ itemType: "news", itemId, fromStatus: row.status, toStatus: next, reason, reviewer: "owner" });
    if (action === "reject") await recordSecurityEvent(request, { endpoint: "manual-review", category: intrusionType as "rate_limit" | "bot" | "injection" | "spam" | "unsafe_url" | "validation", severity: ["injection", "unsafe_url"].includes(intrusionType) ? "high" : "medium", reason, fingerprintHash: row.visitorHash });
    return Response.json({ ok: true, status: next });
  } catch {
    return Response.json({ error: "No fue posible registrar la decisión." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const expected = env.PURGE_SUBMISSIONS_TOKEN?.trim();
  const supplied = request.headers.get("x-purge-token")?.trim();
  if (!expected || !supplied || await digest(expected) !== await digest(supplied)) return unauthorized();
  try {
    const db = getDb();
    const [opinionRows, newsRows] = await Promise.all([
      db.select({ id: opinions.id }).from(opinions),
      db.select({ id: newsSubmissions.id }).from(newsSubmissions),
    ]);
    await db.delete(moderationActions).where(or(eq(moderationActions.itemType, "opinion"), eq(moderationActions.itemType, "news")));
    await db.delete(opinions);
    await db.delete(newsSubmissions);
    await recordSecurityEvent(request, { endpoint: "maintenance-purge", category: "bot", severity: "high", reason: `Limpieza autorizada: ${opinionRows.length} opiniones y ${newsRows.length} enlaces identificados como spam automatizado` });
    return Response.json({ ok: true, deleted: { opinions: opinionRows.length, submissions: newsRows.length } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "No fue posible completar la limpieza." }, { status: 503 });
  }
}
