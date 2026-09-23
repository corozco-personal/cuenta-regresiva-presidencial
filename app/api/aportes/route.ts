import { and, desc, eq, gte } from "drizzle-orm";
import { isIP } from "node:net";
import { getDb } from "../../../db";
import { newsSubmissions } from "../../../db/schema";
import { profileFor } from "../noticias/route";
import { countryNames } from "../../data/countries";
import { httpsUrl, plainText } from "../../data/input-security";
import { enforceRateLimit, turnstileErrorMessage, verifyTurnstile } from "../../data/edge-security";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";
import { createReviewToken, hashReviewToken, sendReviewNotification } from "../../data/review-email";
import { assertPublicHostname, readHtmlWithin } from "../../data/safe-remote-url";
import { recordPrivateSubmissionAudit } from "../../data/private-submission-audit";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicSubmission(row: typeof newsSubmissions.$inferSelect) {
  return { id: row.id, url: row.url, domain: row.domain, title: row.title, status: row.status, reliability: row.reliability, reason: row.reason, country: row.country, department: row.department, municipality: row.municipality, createdAt: row.createdAt };
}

function normalizeUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("unsafe");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "localhost" || host.endsWith(".local") || isIP(host)) throw new Error("unsafe");
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
  return { normalized: url.toString(), host };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(newsSubmissions)
      .where(eq(newsSubmissions.status, "approved_manual"))
      .orderBy(desc(newsSubmissions.createdAt)).limit(30);
    return Response.json({ submissions: rows.map(publicSubmission) });
  } catch {
    return Response.json({ error: "Los aportes no están disponibles temporalmente." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let auditPayload: unknown;
  try {
    const limited = await enforceRateLimit(request, "aportes", 6, 900);
    if (limited) {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "rate_limit", severity: "medium", reason: "Límite de solicitudes excedido" });
      return limited;
    }
    const payload = await request.json() as Record<string, unknown>;
    auditPayload = payload;
    if (payload.website) {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "bot", severity: "medium", reason: "Campo trampa completado", payload });
      return Response.json({ ok: true }, { status: 202 });
    }
    const challenge = await verifyTurnstile(request, payload.turnstileToken, "submit-news");
    if (!challenge.ok) {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "bot", severity: "medium", reason: `Desafío Turnstile inválido: ${challenge.reason ?? "sin detalle"}` });
      return Response.json({ error: turnstileErrorMessage(challenge.reason) }, { status: 403 });
    }
    const rawUrl = httpsUrl(payload.url);
    const country = plainText(payload.country, { max: 80 });
    const department = country === "Colombia" ? plainText(payload.department, { max: 100, optional: true }) : "";
    const municipality = country === "Colombia" ? plainText(payload.municipality, { max: 100, optional: true }) : "";
    const isAnonymous = payload.isAnonymous !== false;
    const submitterName = isAnonymous ? null : plainText(payload.submitterName, { min: 2, max: 80 });
    if (!countryNames.has(country) || (!isAnonymous && !submitterName)) return Response.json({ error: "Completa el enlace, selecciona un país válido y, si aplica, tu nombre." }, { status: 400 });
    const { normalized, host } = normalizeUrl(rawUrl);
    await assertPublicHostname(host);
    const urlHash = await digest(normalized);
    const db = getDb();
    const visitorSource = `network:${request.headers.get("cf-connecting-ip") ?? "unknown"}|${request.headers.get("user-agent") ?? "unknown"}`;
    const visitorHash = await digest(visitorSource);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const recentByVisitor = await db.select({ id: newsSubmissions.id }).from(newsSubmissions)
      .where(and(eq(newsSubmissions.visitorHash, visitorHash), gte(newsSubmissions.createdAt, dayAgo))).limit(5);
    if (recentByVisitor.length >= 5) return Response.json({ error: "Alcanzaste el límite de cinco enlaces por día. Vuelve a intentarlo mañana." }, { status: 429 });
    const existing = await db.select({ id: newsSubmissions.id }).from(newsSubmissions).where(eq(newsSubmissions.urlHash, urlHash)).limit(1);
    if (existing.length) return Response.json({ error: "Este enlace ya fue enviado.", duplicate: true }, { status: 409 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    let title = host;
    let accessible = false;
    let relevant = false;
    try {
      const response = await fetch(normalized, { signal: controller.signal, redirect: "manual", headers: { "user-agent": "CuentaPublica/1.0 (+public-source-check)" } });
      const html = response.ok ? await readHtmlWithin(response) : "";
      accessible = response.ok && Boolean(html);
      if (accessible) {
        title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim().slice(0, 240) || host;
        relevant = /abelardo|espriella/i.test(`${title} ${html.slice(0, 120_000)}`);
      }
    } finally { clearTimeout(timeout); }

    const profile = profileFor(host);
    const reliability = profile?.official ? "official" : profile ? "known_media" : "unknown";
    let status = "quarantined";
    let reason = "El enlace no pudo verificarse o no se refiere directamente al mandatario.";
    if (accessible && relevant && profile?.official) { status = "pending_manual"; reason = "Fuente oficial accesible y relacionada; pendiente de aprobación manual."; }
    else if (accessible && relevant && profile) { status = "pending_manual"; reason = "Medio incluido en el directorio; pendiente de aprobación manual."; }
    else if (accessible && relevant) { status = "pending_manual"; reason = "Fuente nueva accesible y relevante; requiere aprobación manual y corroboración adicional."; }

    const reviewToken = status === "pending_manual" ? createReviewToken() : null;
    const reviewExpiresAt = reviewToken ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null;
    const row: typeof newsSubmissions.$inferInsert = { id: crypto.randomUUID(), urlHash, url: normalized, domain: host, title, submitterName, isAnonymous: isAnonymous ? "1" : "0", country, department: department || null, municipality: municipality || null, status, reliability, reason, visitorHash, emailReviewTokenHash: reviewToken ? await hashReviewToken(reviewToken) : null, emailReviewExpiresAt: reviewExpiresAt, createdAt: new Date().toISOString() };
    await db.insert(newsSubmissions).values(row);
    await recordPrivateSubmissionAudit(request, { itemType: "news", itemId: row.id });
    await recordModerationAction({ itemType: "news", itemId: row.id, fromStatus: "received", toStatus: status, reason });
    if (status === "quarantined") {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "spam", severity: "medium", reason, payload: { url: normalized, country } });
    } else if (reviewToken) {
      try {
        const notification = await sendReviewNotification({ itemType: "news", itemId: row.id, token: reviewToken, title: title || host, summary: reason, source: `${host} · ${[municipality, department, country].filter(Boolean).join(" · ")}` });
        if (notification.sent) await db.update(newsSubmissions).set({ emailNotifiedAt: new Date().toISOString(), emailMessageId: notification.messageId, emailDeliveryStatus: "sent" }).where(eq(newsSubmissions.id, row.id));
        else await db.update(newsSubmissions).set({ emailDeliveryStatus: "failed", emailLastError: notification.reason }).where(eq(newsSubmissions.id, row.id));
      } catch { await db.update(newsSubmissions).set({ emailDeliveryStatus: "failed", emailLastError: "unexpected_error" }).where(eq(newsSubmissions.id, row.id)).catch(() => undefined); }
    }
    return Response.json({ queued: true, status: "pending_review" }, { status: 202 });
  } catch (error) {
    if (error instanceof Error && ["unsafe", "dns-unavailable"].includes(error.message)) {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "unsafe_url", severity: "high", reason: "URL privada, no HTTPS o con credenciales", payload: auditPayload });
      return Response.json({ error: error.message === "dns-unavailable" ? "No fue posible verificar de forma segura el dominio del enlace." : "Solo se aceptan enlaces HTTPS públicos y seguros." }, { status: 400 });
    }
    if (error instanceof Error && error.message === "invalid-text") {
      await recordSecurityEvent(request, { endpoint: "aportes", category: "injection", severity: "high", reason: "Patrón activo o formato no permitido", payload: auditPayload });
      return Response.json({ error: "Uno de los campos contiene formato no permitido. Escribe únicamente texto plano." }, { status: 400 });
    }
    if (error instanceof Error && error.name === "AbortError") return Response.json({ error: "La fuente tardó demasiado en responder. No se guardó el envío." }, { status: 408 });
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return Response.json({ error: "Este enlace ya fue enviado.", duplicate: true }, { status: 409 });
    return Response.json({ error: "No fue posible evaluar el enlace en este momento." }, { status: 503 });
  }
}
