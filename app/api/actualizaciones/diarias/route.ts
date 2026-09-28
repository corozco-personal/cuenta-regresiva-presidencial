import { env } from "cloudflare:workers";
import { recordRefreshEnd, recordRefreshStart, type RefreshKey } from "../../../data/refresh-runs";

const TASKS: Array<{ key: RefreshKey; path: string }> = [
  { key: "indicadores", path: "/api/contexto-pais?refresh=1" },
  { key: "territorio", path: "/api/territorio?refresh=1" },
  { key: "congreso", path: "/api/congreso?refresh=1" },
  { key: "gabinete", path: "/api/datos/gestion?refresh=1" },
  { key: "gestion", path: "/api/datos/gestion?refresh=1" },
];

function originOf(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("x-cron-secret") !== env.CRON_SECRET) {
    return Response.json({ error: "No autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const origin = originOf(request);
  const results = [];
  for (const task of TASKS) {
    await recordRefreshStart(task.key);
    try {
      const response = await fetch(`${origin}${task.path}`, {
        headers: { "x-cron-secret": env.CRON_SECRET, "user-agent": "CuentaPublica-DailyRefresh/1.0" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({})) as { indicators?: unknown[]; departments?: unknown[]; data?: Record<string, unknown> };
      const count = Array.isArray(payload.indicators) ? payload.indicators.length : Array.isArray(payload.departments) ? payload.departments.length : null;
      await recordRefreshEnd(task.key, { ok: response.ok, recordCount: count, error: response.ok ? null : `HTTP ${response.status}` });
      results.push({ key: task.key, ok: response.ok, status: response.status, count });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      await recordRefreshEnd(task.key, { ok: false, error: message });
      results.push({ key: task.key, ok: false, error: message });
    }
  }
  return Response.json({ ok: results.every((item) => item.ok), ranAt: new Date().toISOString(), results }, { headers: { "Cache-Control": "no-store" } });
}
