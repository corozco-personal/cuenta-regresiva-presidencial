import { getD1 } from "../../../db";

export async function GET() {
  try {
    const db = getD1();
    const [daily, news] = await Promise.all([
      db.prepare("SELECT key,label,cadence,status,last_started_at AS lastStartedAt,last_completed_at AS lastCompletedAt,last_success_at AS lastSuccessAt,record_count AS recordCount,error FROM data_refresh_runs ORDER BY key").all(),
      db.prepare("SELECT completed_at AS completedAt, status, published_count AS publishedCount, discovered_count AS discoveredCount FROM monitor_runs ORDER BY completed_at DESC LIMIT 1").first(),
    ]);
    return Response.json({ generatedAt: new Date().toISOString(), daily: daily.results ?? [], news }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ generatedAt: new Date().toISOString(), daily: [], news: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
