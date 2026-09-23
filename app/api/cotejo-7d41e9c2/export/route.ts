import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { moderationActions, newsSubmissions, opinions, securityEvents, correctionRequests } from "../../../../db/schema";
import { getAuthorizedReviewer } from "../../../data/reviewer-auth";

export async function GET() {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return Response.json({ error: "No encontrado." }, { status: 404 });
  try {
    const db = getDb();
    const [opinionRows, newsRows, correctionRows, actions, events] = await Promise.all([
      db.select({ id: opinions.id, displayName: opinions.displayName, isAnonymous: opinions.isAnonymous, country: opinions.country, department: opinions.department, municipality: opinions.municipality, stance: opinions.stance, comment: opinions.comment, status: opinions.status, reason: opinions.moderationReason, createdAt: opinions.createdAt }).from(opinions).orderBy(desc(opinions.createdAt)),
      db.select({ id: newsSubmissions.id, url: newsSubmissions.url, domain: newsSubmissions.domain, title: newsSubmissions.title, country: newsSubmissions.country, department: newsSubmissions.department, municipality: newsSubmissions.municipality, status: newsSubmissions.status, reliability: newsSubmissions.reliability, reason: newsSubmissions.reason, createdAt: newsSubmissions.createdAt }).from(newsSubmissions).orderBy(desc(newsSubmissions.createdAt)),
      db.select({ id: correctionRequests.id, requestType: correctionRequests.requestType, subject: correctionRequests.subject, relatedUrl: correctionRequests.relatedUrl, explanation: correctionRequests.explanation, status: correctionRequests.status, classification: correctionRequests.classification, createdAt: correctionRequests.createdAt }).from(correctionRequests).orderBy(desc(correctionRequests.createdAt)),
      db.select().from(moderationActions).orderBy(desc(moderationActions.createdAt)),
      db.select({ endpoint: securityEvents.endpoint, category: securityEvents.category, severity: securityEvents.severity, reason: securityEvents.reason, createdAt: securityEvents.createdAt }).from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(5000),
    ]);
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), exportedBy: reviewer.displayName, privacy: "No incluye huellas de visitantes ni tokens de revisión.", opinions: opinionRows, newsSubmissions: newsRows, correctionRequests: correctionRows, moderationActions: actions, securityEvents: events }, null, 2);
    return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="cuenta-publica-respaldo-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" } });
  } catch { return Response.json({ error: "No fue posible preparar el respaldo." }, { status: 503 }); }
}
