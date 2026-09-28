import { env } from "cloudflare:workers";
import { getD1 } from "../../../../db";
import { getAuthorizedReviewer } from "../../../data/reviewer-auth";
import { recordRefreshEnd, recordRefreshStart, type RefreshKey } from "../../../data/refresh-runs";

type JobId = "news-hourly" | "newsletter-hourly" | "daily-indicators" | "daily-territory" | "daily-congress" | "daily-gestion" | "daily-all";

const DAILY_JOBS: Partial<Record<JobId, { key: RefreshKey; path: string }>> = {
  "daily-indicators": { key: "indicadores", path: "/api/contexto-pais?refresh=1" },
  "daily-territory": { key: "territorio", path: "/api/territorio?refresh=1" },
  "daily-congress": { key: "congreso", path: "/api/congreso?refresh=1" },
  "daily-gestion": { key: "gestion", path: "/api/datos/gestion?refresh=1" },
};

const JOBS: Array<{ id: JobId; title: string; cadence: string; description: string; target: string }> = [
  { id: "news-hourly", title: "Noticias globales", cadence: "Cada hora", description: "Consulta fuentes de noticias, clasifica registros, actualiza el mapa global y graba monitor_runs.", target: "noticias" },
  { id: "newsletter-hourly", title: "Boletines por correo", cadence: "Cada hora", description: "Busca suscripciones que vencen en la hora actual y envía noticias de interés de las últimas 24 horas.", target: "boletin" },
  { id: "daily-indicators", title: "Indicadores del país", cadence: "Diario · 00:05", description: "Calienta fuentes oficiales de indicadores y actualiza la bitácora de último barrido.", target: "indicadores" },
  { id: "daily-territory", title: "Mapa territorial", cadence: "Diario · 00:05", description: "Reconstruye agregados por departamento/municipio y menciones territoriales recientes.", target: "territorio" },
  { id: "daily-congress", title: "Congreso", cadence: "Diario · 00:05", description: "Consulta información legislativa y deja marcada la última revisión operativa.", target: "congreso" },
  { id: "daily-gestion", title: "Gestión y gabinete", cadence: "Diario · 00:05", description: "Revalida el tablero de gestión, gabinete, expedientes y fuentes públicas enlazadas.", target: "gestion" },
  { id: "daily-all", title: "Barrido diario completo", cadence: "Manual / Diario · 00:05", description: "Ejecuta en bloque los jobs diarios de indicadores, territorio, Congreso y gestión.", target: "diario" },
];

function originOf(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

async function status() {
  const db = getD1();
  const [daily, news] = await Promise.all([
    db.prepare("SELECT key,label,cadence,status,last_started_at AS lastStartedAt,last_completed_at AS lastCompletedAt,last_success_at AS lastSuccessAt,record_count AS recordCount,error FROM data_refresh_runs ORDER BY key").all(),
    db.prepare("SELECT completed_at AS completedAt, started_at AS startedAt, status, published_count AS publishedCount, discovered_count AS discoveredCount, error_summary AS errorSummary FROM monitor_runs ORDER BY completed_at DESC LIMIT 1").first(),
  ]);
  return { generatedAt: new Date().toISOString(), jobs: JOBS, daily: daily.results ?? [], news };
}

async function runJson(origin: string, path: string, method = "GET") {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: { "x-cron-secret": env.CRON_SECRET ?? "", "user-agent": "CuentaPublica-AdminJob/1.0" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? `HTTP ${response.status}`);
  return payload;
}

async function runDailyJob(origin: string, id: JobId) {
  const job = DAILY_JOBS[id];
  if (!job) throw new Error("Job diario no válido.");
  await recordRefreshStart(job.key, "Manual desde administrador");
  try {
    const payload = await runJson(origin, job.path);
    const count = Array.isArray((payload as { indicators?: unknown[] }).indicators) ? (payload as { indicators: unknown[] }).indicators.length
      : Array.isArray((payload as { departments?: unknown[] }).departments) ? (payload as { departments: unknown[] }).departments.length
      : null;
    await recordRefreshEnd(job.key, { ok: true, recordCount: count });
    return { ok: true, payload };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await recordRefreshEnd(job.key, { ok: false, error: message });
    throw error;
  }
}

export async function GET() {
  if (!(await getAuthorizedReviewer())) return Response.json({ error: "No autorizado." }, { status: 401 });
  return Response.json(await status(), { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const reviewer = await getAuthorizedReviewer();
  if (!reviewer) return Response.json({ error: "No autorizado." }, { status: 401 });
  if (!env.CRON_SECRET) return Response.json({ error: "CRON_SECRET no está configurado en producción." }, { status: 503 });
  try {
    const { jobId } = await request.json() as { jobId?: JobId };
    if (!jobId || !JOBS.some((job) => job.id === jobId)) return Response.json({ error: "Job no válido." }, { status: 400 });
    const origin = originOf(request);
    let result: unknown;
    if (jobId === "news-hourly") result = await runJson(origin, "/api/noticias-v2?refresh=1");
    else if (jobId === "newsletter-hourly") result = await runJson(origin, "/api/boletin/enviar", "POST");
    else if (jobId === "daily-all") result = await runJson(origin, "/api/actualizaciones/diarias", "POST");
    else result = await runDailyJob(origin, jobId);
    return Response.json({ ok: true, ranBy: reviewer.displayName, jobId, ranAt: new Date().toISOString(), result, status: await status() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible ejecutar el job.", status: await status() }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
  }
}
