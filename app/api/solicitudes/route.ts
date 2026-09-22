import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { isIP } from "node:net";
import { getDb } from "../../../db";
import { correctionRequests } from "../../../db/schema";
import { httpsUrl, plainText, safeEmail } from "../../data/input-security";
import { enforceRateLimit, verifyTurnstile } from "../../data/edge-security";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";

const TYPES = new Set(["Corrección", "Derecho de réplica", "Actualización", "Retiro de datos personales"]);
async function digest(value: string) { const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
function safeUrl(value: string) { const url = new URL(value); const host = url.hostname.toLowerCase(); if (url.protocol !== "https:" || isIP(host) || host === "localhost" || host.endsWith(".local")) throw new Error("unsafe"); return url.toString(); }
function publicRow(row: typeof correctionRequests.$inferSelect) { return { id: row.id, requestType: row.requestType, subject: row.subject, relatedUrl: row.relatedUrl, status: row.status, classification: row.classification, publicSummary: row.publicSummary, createdAt: row.createdAt }; }

async function reviewPendingRequests() {
  const db = getDb();
  const reviewBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  const rows = await db.select().from(correctionRequests)
    .where(and(eq(correctionRequests.status, "Pendiente de revisión"), lte(correctionRequests.createdAt, reviewBefore)))
    .orderBy(correctionRequests.createdAt).limit(20);
  for (const row of rows) {
    await db.update(correctionRequests).set({ status: "Recibida" }).where(eq(correctionRequests.id, row.id));
    await recordModerationAction({ itemType: "correction", itemId: row.id, fromStatus: "Pendiente de revisión", toStatus: "Recibida", reason: "Solicitud validada por estructura, seguridad y pertinencia del formulario" });
  }
}

export async function GET() {
  try { await reviewPendingRequests(); const rows = await getDb().select().from(correctionRequests).where(inArray(correctionRequests.status, ["Recibida", "En revisión", "Resuelta"])).orderBy(desc(correctionRequests.createdAt)).limit(40); return Response.json({ requests: rows.map(publicRow) }); }
  catch { return Response.json({ error: "Las solicitudes no están disponibles temporalmente." }, { status: 503 }); }
}

export async function POST(request: Request) {
  let auditPayload: unknown;
  try {
    const limited = await enforceRateLimit(request, "solicitudes", 8, 900);
    if (limited) { await recordSecurityEvent(request, { endpoint: "solicitudes", category: "rate_limit", severity: "medium", reason: "Límite de solicitudes excedido" }); return limited; }
    const payload = await request.json() as Record<string, unknown>;
    auditPayload = payload;
    if (payload.website) { await recordSecurityEvent(request, { endpoint: "solicitudes", category: "bot", severity: "medium", reason: "Campo trampa completado", payload }); return Response.json({ ok: true }, { status: 202 }); }
    const challenge = await verifyTurnstile(request, payload.turnstileToken, "submit-correction");
    if (!challenge.ok) { await recordSecurityEvent(request, { endpoint: "solicitudes", category: "bot", severity: "medium", reason: "Desafío Turnstile inválido" }); return Response.json({ error: "Completa nuevamente la verificación antiabuso." }, { status: 403 }); }
    const requestType = plainText(payload.requestType, { max: 40 }); const subject = plainText(payload.subject, { min: 8, max: 160 });
    const relatedUrl = safeUrl(httpsUrl(payload.relatedUrl)); const explanation = plainText(payload.explanation, { min: 40, max: 2000, multiline: true });
    const evidenceUrl = payload.evidenceUrl ? safeUrl(httpsUrl(payload.evidenceUrl)) : null;
    const displayName = plainText(payload.displayName, { min: 2, max: 80, optional: true }) || null; const contact = safeEmail(payload.contact);
    if (!TYPES.has(requestType) || subject.length < 8 || subject.length > 160 || explanation.length < 40 || explanation.length > 2000) return Response.json({ error: "Completa el tipo, asunto, enlace y una explicación de 40 a 2.000 caracteres." }, { status: 400 });
    const visitorHash = await digest(`${request.headers.get("cf-connecting-ip") ?? "unknown"}|${request.headers.get("user-agent") ?? "unknown"}`);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString(); const db = getDb();
    const recent = await db.select({ id: correctionRequests.id }).from(correctionRequests).where(and(eq(correctionRequests.visitorHash, visitorHash), gte(correctionRequests.createdAt, dayAgo))).limit(3);
    if (recent.length >= 3) return Response.json({ error: "Alcanzaste el límite de tres solicitudes por día." }, { status: 429 });
    const row: typeof correctionRequests.$inferInsert = { id: crypto.randomUUID(), requestType, subject, relatedUrl, explanation, evidenceUrl, displayName,
      contactHash: contact ? await digest(contact) : null, visitorHash, status: "Pendiente de revisión", classification: requestType,
      publicSummary: `${requestType}: ${subject}`, createdAt: new Date().toISOString() };
    await db.insert(correctionRequests).values(row); await recordModerationAction({ itemType: "correction", itemId: row.id, fromStatus: "received", toStatus: "Pendiente de revisión", reason: "Solicitud almacenada sin publicación inmediata" }); return Response.json({ queued: true, status: "pending_review" }, { status: 202 });
  } catch (error) { const message = error instanceof Error ? error.message : ""; if (message === "unsafe" || message === "invalid-text") await recordSecurityEvent(request, { endpoint: "solicitudes", category: message === "unsafe" ? "unsafe_url" : "injection", severity: "high", reason: message === "unsafe" ? "URL no segura" : "Patrón activo o formato no permitido", payload: auditPayload }); return Response.json({ error: message === "unsafe" ? "Usa únicamente enlaces HTTPS públicos." : message === "invalid-contact" ? "El correo de contacto no es válido." : message === "invalid-text" ? "Uno de los campos contiene formato no permitido. Escribe únicamente texto plano." : "No fue posible registrar la solicitud." }, { status: 400 }); }
}
