import { desc, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { correctionRequests, moderationActions, newsSubmissions, opinions, securityEvents } from "../../../db/schema";
import { turnstileConfiguration } from "../../data/edge-security";

export async function GET() {
  const configuration = turnstileConfiguration();
  try {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const db = getDb();
    const [events, opinionRows, newsRows, correctionRows, actions] = await Promise.all([
      db.select().from(securityEvents).where(gte(securityEvents.createdAt, since)).orderBy(desc(securityEvents.createdAt)).limit(2000),
      db.select({ status: opinions.status }).from(opinions),
      db.select({ status: newsSubmissions.status }).from(newsSubmissions),
      db.select({ status: correctionRequests.status }).from(correctionRequests),
      db.select({ createdAt: moderationActions.createdAt }).from(moderationActions).where(gte(moderationActions.createdAt, since)),
    ]);
    const countBy = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((result, value) => { result[value] = (result[value] ?? 0) + 1; return result; }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const daily = Object.values(events.reduce<Record<string, { day: string; blocked: number; high: number }>>((result, event) => {
      const day = event.createdAt.slice(0, 10); const row = result[day] ?? { day, blocked: 0, high: 0 }; row.blocked += 1; if (event.severity === "high") row.high += 1; result[day] = row; return result;
    }, {})).sort((a, b) => a.day.localeCompare(b.day));
    return Response.json({
      ...configuration,
      report: {
        generatedAt: new Date().toISOString(),
        windowDays: 30,
        totalBlocked: events.length,
        highSeverity: events.filter((event) => event.severity === "high").length,
        uniqueFingerprints: new Set(events.map((event) => event.fingerprintHash)).size,
        categories: countBy(events.map((event) => event.category)),
        endpoints: countBy(events.map((event) => event.endpoint)),
        daily,
        queue: {
          pendingOpinions: opinionRows.filter((row) => row.status === "pending").length,
          pendingNews: newsRows.filter((row) => row.status === "pending").length,
          pendingCorrections: correctionRows.filter((row) => row.status === "Pendiente de revisión").length,
          quarantined: opinionRows.filter((row) => row.status === "quarantined").length + newsRows.filter((row) => row.status === "quarantined").length,
          actions30Days: actions.length,
        },
        privacy: "El reporte conserva categorías y huellas irreversibles; no publica contenido enviado, direcciones de red ni identificadores del visitante.",
      },
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch {
    return Response.json({ ...configuration, report: null }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }
}
