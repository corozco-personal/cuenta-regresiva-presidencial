import { getD1 } from "../../../db";
export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    const db = getD1();
    const [run, news] = await Promise.all([
      db.prepare("SELECT completed_at AS completedAt, providers, discovered_count AS discoveredCount, published_count AS publishedCount, countries, languages, status, error_summary AS errorSummary FROM monitor_runs ORDER BY completed_at DESC LIMIT 1").first(),
      db.prepare("SELECT COUNT(*) AS total, MAX(last_seen_at) AS lastSeenAt FROM news_articles").first(),
    ]);
    return Response.json({ status: "operativo", checkedAt, database: "disponible", news, lastMonitorRun: run, refreshIntervalHours: 6 }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  } catch { return Response.json({ status: "degradado", checkedAt, database: "no disponible", refreshIntervalHours: 6 }, { status: 503 }); }
}
