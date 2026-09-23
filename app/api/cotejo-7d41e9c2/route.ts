import { and, desc, eq, inArray, like, lt, notInArray, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "../../../db";
import { correctionRequests, moderationActions, newsSubmissions, opinions } from "../../../db/schema";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";
import { getAuthorizedReviewer } from "../../data/reviewer-auth";
import { enforceRateLimit } from "../../data/edge-security";
import { readPrivateSubmissionAudits } from "../../data/private-submission-audit";

const INTRUSION_TYPES = new Set(["rate_limit", "bot", "injection", "spam", "unsafe_url", "validation"]);

function unauthorized() {
  return Response.json({ error: "No encontrado." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}

function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return origin === new URL(request.url).origin; } catch { return false; }
}

export async function GET(request: Request) {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return unauthorized();
  const limited = await enforceRateLimit(request, "owner-dashboard-read", 180, 900);
  if (limited) return limited;
  try {
    const db = getDb();
    const url = new URL(request.url);
    const type = ["news", "correction"].includes(url.searchParams.get("type") ?? "") ? String(url.searchParams.get("type")) : "opinion";
    const view = ["review", "approved", "rejected", "all"].includes(url.searchParams.get("view") ?? "") ? String(url.searchParams.get("view")) : "review";
    const query = String(url.searchParams.get("q") ?? "").replace(/[%_]/g, "").slice(0, 100);
    const cursor = String(url.searchParams.get("cursor") ?? "");
    const limit = Math.min(50, Math.max(10, Number(url.searchParams.get("limit") ?? 20) || 20));
    let mapped: unknown[] = [];
    let hasMore = false;
    let nextCursor: string | null = null;
    if (type === "correction") {
      const statusCondition = view === "approved" ? eq(correctionRequests.status, "Resuelta") : view === "rejected" ? eq(correctionRequests.status, "Rechazada") : view === "review" ? notInArray(correctionRequests.status, ["Resuelta", "Rechazada"]) : undefined;
      const conditions = [statusCondition, cursor ? lt(correctionRequests.createdAt, cursor) : undefined, query ? or(like(correctionRequests.subject, `%${query}%`), like(correctionRequests.explanation, `%${query}%`), like(correctionRequests.requestType, `%${query}%`)) : undefined].filter(Boolean) as SQL[];
      const rows = await db.select().from(correctionRequests).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(correctionRequests.createdAt)).limit(limit + 1);
      hasMore = rows.length > limit;
      const pageRows = rows.slice(0, limit);
      nextCursor = hasMore ? pageRows.at(-1)?.createdAt ?? null : null;
      const ids = pageRows.map((row) => row.id);
      const actions = ids.length ? await db.select().from(moderationActions).where(and(eq(moderationActions.itemType, "correction"), inArray(moderationActions.itemId, ids))).orderBy(desc(moderationActions.createdAt)).limit(500) : [];
      const privateAudits = await readPrivateSubmissionAudits("correction", ids);
      const auditByItem = actions.reduce<Record<string, typeof actions>>((result, action) => { (result[action.itemId] ??= []).push(action); return result; }, {});
      mapped = pageRows.map((row) => ({
        id: row.id, type: "correction", status: row.status, requestType: row.requestType, subject: row.subject,
        relatedUrl: row.relatedUrl, explanation: row.explanation, evidenceUrl: row.evidenceUrl,
        displayName: row.displayName || "Anónimo", country: "", classification: row.classification,
        reason: row.classification, createdAt: row.createdAt, email: {}, privateAudit: privateAudits[row.id] ?? null, audit: auditByItem[row.id] ?? [],
      }));
    } else if (type === "opinion") {
      const statusCondition = view === "approved" ? eq(opinions.status, "approved_manual") : view === "rejected" ? eq(opinions.status, "rejected_manual") : view === "review" ? notInArray(opinions.status, ["approved_manual", "rejected_manual"]) : undefined;
      const conditions = [statusCondition, cursor ? lt(opinions.createdAt, cursor) : undefined, query ? or(like(opinions.comment, `%${query}%`), like(opinions.displayName, `%${query}%`), like(opinions.country, `%${query}%`)) : undefined].filter(Boolean) as SQL[];
      const rows = await db.select().from(opinions).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(opinions.createdAt)).limit(limit + 1);
      hasMore = rows.length > limit;
      const pageRows = rows.slice(0, limit);
      nextCursor = hasMore ? pageRows.at(-1)?.createdAt ?? null : null;
      const ids = pageRows.map((row) => row.id);
      const actions = ids.length ? await db.select().from(moderationActions).where(and(eq(moderationActions.itemType, type), inArray(moderationActions.itemId, ids))).orderBy(desc(moderationActions.createdAt)).limit(500) : [];
      const privateAudits = await readPrivateSubmissionAudits("opinion", ids);
      const auditByItem = actions.reduce<Record<string, typeof actions>>((result, action) => { (result[action.itemId] ??= []).push(action); return result; }, {});
      mapped = pageRows.map((row) => ({
        id: row.id, type: "opinion", status: row.status, comment: row.comment,
        displayName: row.isAnonymous === "1" ? "Anónimo" : row.displayName,
        country: row.country, department: row.department, municipality: row.municipality,
        stance: row.stance, reason: row.moderationReason, createdAt: row.createdAt,
        email: { notifiedAt: row.emailNotifiedAt, expiresAt: row.emailReviewExpiresAt, reviewedAt: row.emailReviewedAt, deliveryStatus: row.emailDeliveryStatus, lastError: row.emailLastError }, privateAudit: privateAudits[row.id] ?? null, audit: auditByItem[row.id] ?? [],
      }));
    } else {
      const statusCondition = view === "approved" ? eq(newsSubmissions.status, "approved_manual") : view === "rejected" ? eq(newsSubmissions.status, "rejected_manual") : view === "review" ? notInArray(newsSubmissions.status, ["approved_manual", "rejected_manual"]) : undefined;
      const conditions = [statusCondition, cursor ? lt(newsSubmissions.createdAt, cursor) : undefined, query ? or(like(newsSubmissions.title, `%${query}%`), like(newsSubmissions.domain, `%${query}%`), like(newsSubmissions.url, `%${query}%`), like(newsSubmissions.country, `%${query}%`)) : undefined].filter(Boolean) as SQL[];
      const rows = await db.select().from(newsSubmissions).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(newsSubmissions.createdAt)).limit(limit + 1);
      hasMore = rows.length > limit;
      const pageRows = rows.slice(0, limit);
      nextCursor = hasMore ? pageRows.at(-1)?.createdAt ?? null : null;
      const ids = pageRows.map((row) => row.id);
      const actions = ids.length ? await db.select().from(moderationActions).where(and(eq(moderationActions.itemType, type), inArray(moderationActions.itemId, ids))).orderBy(desc(moderationActions.createdAt)).limit(500) : [];
      const privateAudits = await readPrivateSubmissionAudits("news", ids);
      const auditByItem = actions.reduce<Record<string, typeof actions>>((result, action) => { (result[action.itemId] ??= []).push(action); return result; }, {});
      mapped = pageRows.map((row) => ({
        id: row.id, type: "news", status: row.status, title: row.title, url: row.url,
        domain: row.domain, displayName: row.isAnonymous === "1" ? "Anónimo" : row.submitterName,
        country: row.country, department: row.department, municipality: row.municipality,
        reliability: row.reliability, reason: row.reason, createdAt: row.createdAt,
        email: { notifiedAt: row.emailNotifiedAt, expiresAt: row.emailReviewExpiresAt, reviewedAt: row.emailReviewedAt, deliveryStatus: row.emailDeliveryStatus, lastError: row.emailLastError }, privateAudit: privateAudits[row.id] ?? null, audit: auditByItem[row.id] ?? [],
      }));
    }
    const [opinionCounts, newsCounts, correctionCounts] = await Promise.all([
      db.select({ status: opinions.status, count: sql<number>`count(*)` }).from(opinions).groupBy(opinions.status),
      db.select({ status: newsSubmissions.status, count: sql<number>`count(*)` }).from(newsSubmissions).groupBy(newsSubmissions.status),
      db.select({ status: correctionRequests.status, count: sql<number>`count(*)` }).from(correctionRequests).groupBy(correctionRequests.status),
    ]);
    return Response.json({
      reviewer: { displayName: reviewer.displayName },
      items: mapped,
      pagination: { hasMore, nextCursor, limit },
      counts: {
        opinions: Object.fromEntries(opinionCounts.map((row) => [row.status, Number(row.count)])),
        news: Object.fromEntries(newsCounts.map((row) => [row.status, Number(row.count)])),
        corrections: Object.fromEntries(correctionCounts.map((row) => [row.status, Number(row.count)])),
      },
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch {
    return Response.json({ error: "No fue posible cargar la cola." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return unauthorized();
  if (!hasValidOrigin(request)) return unauthorized();
  const limited = await enforceRateLimit(request, "owner-dashboard-write", 60, 900);
  if (limited) return limited;
  try {
    const payload = await request.json() as Record<string, unknown>;
    const itemType = String(payload.itemType ?? "");
    const itemId = String(payload.itemId ?? "");
    const action = String(payload.action ?? "");
    const intrusionType = String(payload.intrusionType ?? "spam");
    if (!/^[a-f0-9-]{20,80}$/i.test(itemId) || !["opinion", "news", "correction"].includes(itemType) || !["approve", "reject"].includes(action)) {
      return Response.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    if (action === "reject" && !INTRUSION_TYPES.has(intrusionType)) return Response.json({ error: "Selecciona un tipo de intrusión válido." }, { status: 400 });

    const db = getDb();
    if (itemType === "correction") {
      const [row] = await db.select().from(correctionRequests).where(eq(correctionRequests.id, itemId)).limit(1);
      if (!row) return Response.json({ error: "La solicitud ya no existe." }, { status: 404 });
      const next = action === "approve" ? "Resuelta" : "Rechazada";
      const reason = action === "approve" ? "Solicitud resuelta en revisión privada" : `Rechazo de solicitud: ${intrusionType}`;
      await db.update(correctionRequests).set({ status: next, classification: reason, publicSummary: action === "approve" ? "Una solicitud editorial fue revisada y resuelta." : "Una solicitud fue rechazada tras revisión privada." }).where(eq(correctionRequests.id, itemId));
      await recordModerationAction({ itemType: "correction", itemId, fromStatus: row.status, toStatus: next, reason, reviewer: "owner" });
      if (action === "reject") await recordSecurityEvent(request, { endpoint: "manual-review", category: intrusionType as "rate_limit" | "bot" | "injection" | "spam" | "unsafe_url" | "validation", severity: ["injection", "unsafe_url"].includes(intrusionType) ? "high" : "medium", reason, fingerprintHash: row.visitorHash });
      return Response.json({ ok: true, status: next });
    }
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
