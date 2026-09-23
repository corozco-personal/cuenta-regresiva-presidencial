import { and, gte, eq } from "drizzle-orm";
import { isIP } from "node:net";
import { getDb } from "../../../db";
import { correctionRequests } from "../../../db/schema";
import { httpsUrl, plainText, safeEmail } from "../../data/input-security";
import { enforceRateLimit, turnstileErrorMessage, verifyTurnstile } from "../../data/edge-security";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";
import { assertPublicHostname } from "../../data/safe-remote-url";
import { recordPrivateSubmissionAudit } from "../../data/private-submission-audit";

const TYPES = new Set(["Corrección", "Derecho de réplica", "Actualización", "Retiro de datos personales"]);
async function digest(value: string) { const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join(""); }

async function safePublicUrl(value: string) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || isIP(host) || host === "localhost" || host.endsWith(".local")) throw new Error("unsafe");
  await assertPublicHostname(host);
  return url.toString();
}

export async function GET() {
  return Response.json({ requests: [] }, { headers: { "Cache-Control": "no-store" } });
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
    if (!challenge.ok) { await recordSecurityEvent(request, { endpoint: "solicitudes", category: "bot", severity: "medium", reason: `Desafío Turnstile inválido: ${challenge.reason ?? "sin detalle"}` }); return Response.json({ error: turnstileErrorMessage(challenge.reason) }, { status: 403 }); }
    const requestType = plainText(payload.requestType, { max: 40 }); const subject = plainText(payload.subject, { min: 8, max: 160 });
    const relatedUrl = await safePublicUrl(httpsUrl(payload.relatedUrl)); const explanation = plainText(payload.explanation, { min: 40, max: 2000, multiline: true });
    const evidenceUrl = payload.evidenceUrl ? await safePublicUrl(httpsUrl(payload.evidenceUrl)) : null;
    const displayName = plainText(payload.displayName, { min: 2, max: 80, optional: true }) || null; const contact = safeEmail(payload.contact);
    if (!TYPES.has(requestType) || subject.length < 8 || subject.length > 160 || explanation.length < 40 || explanation.length > 2000) return Response.json({ error: "Completa el tipo, asunto, enlace y una explicación de 40 a 2.000 caracteres." }, { status: 400 });
    const visitorHash = await digest(`${request.headers.get("cf-connecting-ip") ?? "unknown"}|${request.headers.get("user-agent") ?? "unknown"}`);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString(); const db = getDb();
    const recent = await db.select({ id: correctionRequests.id }).from(correctionRequests).where(and(eq(correctionRequests.visitorHash, visitorHash), gte(correctionRequests.createdAt, dayAgo))).limit(3);
    if (recent.length >= 3) return Response.json({ error: "Alcanzaste el límite de tres solicitudes por día." }, { status: 429 });
    const row: typeof correctionRequests.$inferInsert = {
      id: crypto.randomUUID(), requestType, subject, relatedUrl, explanation, evidenceUrl, displayName,
      contactHash: contact ? await digest(contact) : null, visitorHash, status: "Pendiente de revisión", classification: requestType,
      publicSummary: "Solicitud recibida y retenida para revisión privada.", createdAt: new Date().toISOString(),
    };
    await db.insert(correctionRequests).values(row);
    await recordPrivateSubmissionAudit(request, { itemType: "correction", itemId: row.id, contact });
    await recordModerationAction({ itemType: "correction", itemId: row.id, fromStatus: "received", toStatus: "Pendiente de revisión", reason: "Solicitud almacenada sin publicación" });
    return Response.json({ queued: true, status: "pending_review" }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "unsafe" || message === "dns-unavailable" || message === "invalid-text") {
      await recordSecurityEvent(request, { endpoint: "solicitudes", category: message === "invalid-text" ? "injection" : "unsafe_url", severity: "high", reason: message === "invalid-text" ? "Patrón activo o formato no permitido" : "URL no segura", payload: auditPayload });
    }
    return Response.json({ error: message === "unsafe" || message === "dns-unavailable" ? "Usa únicamente enlaces HTTPS públicos." : message === "invalid-contact" ? "El correo de contacto no es válido." : message === "invalid-text" ? "Uno de los campos contiene formato no permitido. Escribe únicamente texto plano." : "No fue posible registrar la solicitud." }, { status: 400 });
  }
}
