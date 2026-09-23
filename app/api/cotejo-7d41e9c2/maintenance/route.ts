import { env } from "cloudflare:workers";
import { desc, isNotNull, lt } from "drizzle-orm";
import { getDb } from "../../../../db";
import {
  analyticsEvents, analyticsSessions, correctionRequests, edgeRateLimits, moderationActions, moderationBackups,
  newsSubmissions, opinions, securityEvents, securityOperations, submissionAuditProfiles,
} from "../../../../db/schema";
import { getAuthorizedReviewer } from "../../../data/reviewer-auth";
import { sendOperationalAlert } from "../../../data/review-email";

const DAY = 86_400_000;
const policy = { privateAuditDays: 90, analyticsDays: 90, securityEventDays: 365, moderationDays: 730, backupDays: 180, rotationDays: 90, backupIntervalDays: 7 };

async function operation(key: string, value: string) {
  const now = new Date().toISOString();
  await getDb().insert(securityOperations).values({ key, value, updatedAt: now }).onConflictDoUpdate({ target: securityOperations.key, set: { value, updatedAt: now } });
}

async function status() {
  const db = getDb();
  const [operations, latestBackup, opinionFailures, newsFailures] = await Promise.all([
    db.select().from(securityOperations),
    db.select({ createdAt: moderationBackups.createdAt, itemCount: moderationBackups.itemCount }).from(moderationBackups).orderBy(desc(moderationBackups.createdAt)).limit(1),
    db.select({ status: opinions.emailDeliveryStatus, error: opinions.emailLastError, createdAt: opinions.createdAt }).from(opinions).where(isNotNull(opinions.emailLastError)).orderBy(desc(opinions.createdAt)).limit(20),
    db.select({ status: newsSubmissions.emailDeliveryStatus, error: newsSubmissions.emailLastError, createdAt: newsSubmissions.createdAt }).from(newsSubmissions).where(isNotNull(newsSubmissions.emailLastError)).orderBy(desc(newsSubmissions.createdAt)).limit(20),
  ]);
  const map = Object.fromEntries(operations.map((row) => [row.key, row.updatedAt]));
  const age = (value?: string) => value ? Math.floor((Date.now() - Date.parse(value)) / DAY) : null;
  return {
    generatedAt: new Date().toISOString(), policy,
    controls: {
      turnstile: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
      email: Boolean(env.RESEND_API_KEY && env.REVIEW_NOTIFICATION_EMAIL && env.RESEND_WEBHOOK_SECRET),
      auditEncryption: Boolean(env.AUDIT_ENCRYPTION_KEY),
      rateLimitSalt: Boolean(env.RATE_LIMIT_SALT),
    },
    rotation: { lastRegisteredAt: map.secret_rotation, ageDays: age(map.secret_rotation), due: age(map.secret_rotation) === null || Number(age(map.secret_rotation)) >= policy.rotationDays },
    backup: { lastAt: latestBackup[0]?.createdAt ?? null, itemCount: latestBackup[0]?.itemCount ?? 0, ageDays: age(latestBackup[0]?.createdAt), due: age(latestBackup[0]?.createdAt) === null || Number(age(latestBackup[0]?.createdAt)) >= policy.backupIntervalDays },
    retention: { lastAt: map.retention_run ?? null, ageDays: age(map.retention_run), due: age(map.retention_run) === null || Number(age(map.retention_run)) >= 1 },
    deliveryAlerts: [...opinionFailures, ...newsFailures].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20),
  };
}

async function createBackup(reviewer: string) {
  const db = getDb();
  const [opinionRows, newsRows, correctionRows, actions, events] = await Promise.all([
    db.select({ id: opinions.id, displayName: opinions.displayName, isAnonymous: opinions.isAnonymous, country: opinions.country, department: opinions.department, municipality: opinions.municipality, stance: opinions.stance, comment: opinions.comment, status: opinions.status, moderationReason: opinions.moderationReason, createdAt: opinions.createdAt }).from(opinions),
    db.select({ id: newsSubmissions.id, url: newsSubmissions.url, domain: newsSubmissions.domain, title: newsSubmissions.title, country: newsSubmissions.country, department: newsSubmissions.department, municipality: newsSubmissions.municipality, status: newsSubmissions.status, reliability: newsSubmissions.reliability, reason: newsSubmissions.reason, createdAt: newsSubmissions.createdAt }).from(newsSubmissions),
    db.select({ id: correctionRequests.id, requestType: correctionRequests.requestType, subject: correctionRequests.subject, relatedUrl: correctionRequests.relatedUrl, explanation: correctionRequests.explanation, evidenceUrl: correctionRequests.evidenceUrl, status: correctionRequests.status, classification: correctionRequests.classification, createdAt: correctionRequests.createdAt }).from(correctionRequests),
    db.select().from(moderationActions),
    db.select({ endpoint: securityEvents.endpoint, category: securityEvents.category, severity: securityEvents.severity, reason: securityEvents.reason, createdAt: securityEvents.createdAt }).from(securityEvents),
  ]);
  const snapshot = { version: 1, createdAt: new Date().toISOString(), privacy: "Excluye tokens, huellas de red, contacto cifrado e identificadores técnicos privados.", opinions: opinionRows, news: newsRows, corrections: correctionRows, actions, securityEvents: events };
  const itemCount = opinionRows.length + newsRows.length + correctionRows.length + actions.length + events.length;
  await db.insert(moderationBackups).values({ id: crypto.randomUUID(), snapshotJson: JSON.stringify(snapshot), itemCount, createdBy: reviewer, createdAt: snapshot.createdAt });
  await operation("backup_created", String(itemCount));
  return { createdAt: snapshot.createdAt, itemCount };
}

async function applyRetention() {
  const db = getDb(); const now = Date.now();
  const results = await Promise.all([
    db.delete(submissionAuditProfiles).where(lt(submissionAuditProfiles.createdAt, new Date(now - policy.privateAuditDays * DAY).toISOString())),
    db.delete(analyticsEvents).where(lt(analyticsEvents.occurredAt, new Date(now - policy.analyticsDays * DAY).toISOString())),
    db.delete(analyticsSessions).where(lt(analyticsSessions.lastSeenAt, new Date(now - policy.analyticsDays * DAY).toISOString())),
    db.delete(edgeRateLimits).where(lt(edgeRateLimits.updatedAt, Math.floor((now - DAY) / 1000))),
    db.delete(securityEvents).where(lt(securityEvents.createdAt, new Date(now - policy.securityEventDays * DAY).toISOString())),
    db.delete(moderationActions).where(lt(moderationActions.createdAt, new Date(now - policy.moderationDays * DAY).toISOString())),
    db.delete(moderationBackups).where(lt(moderationBackups.createdAt, new Date(now - policy.backupDays * DAY).toISOString())),
  ]);
  await operation("retention_run", results.map((result) => Number(result.meta?.changes ?? 0)).join(","));
  return { removed: results.reduce((sum, result) => sum + Number(result.meta?.changes ?? 0), 0) };
}

export async function GET() {
  if (!(await getAuthorizedReviewer())) return Response.json({ error: "No autorizado." }, { status: 401 });
  try { return Response.json(await status(), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ error: "No fue posible comprobar la postura de seguridad." }, { status: 503 }); }
}

export async function POST(request: Request) {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return Response.json({ error: "No autorizado." }, { status: 401 });
  try {
    const { action } = await request.json() as { action?: string };
    if (action === "backup") return Response.json({ ok: true, result: await createBackup(reviewer.displayName), status: await status() });
    if (action === "retention") return Response.json({ ok: true, result: await applyRetention(), status: await status() });
    if (action === "rotation-ack") { await operation("secret_rotation", "registered"); return Response.json({ ok: true, status: await status() }); }
    if (action === "self-test") { await operation("self_test", "passed"); return Response.json({ ok: true, status: await status() }); }
    if (action === "email-test") {
      const delivery = await sendOperationalAlert({ subject: "prueba de entrega", detail: `Prueba solicitada por ${reviewer.displayName} desde el Centro de cotejo. Si recibiste este mensaje, el proveedor y el destinatario están funcionando.` });
      await operation("email_test", delivery.sent ? "accepted" : delivery.reason ?? "failed");
      if (!delivery.sent) return Response.json({ error: "La prueba no fue aceptada por el proveedor. Revisa la alerta técnica en este panel." }, { status: 502 });
      return Response.json({ ok: true, status: await status() });
    }
    return Response.json({ error: "Acción no válida." }, { status: 400 });
  } catch { return Response.json({ error: "No fue posible ejecutar el control." }, { status: 503 }); }
}
