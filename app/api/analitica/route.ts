import { getD1 } from "../../../db";
import { enforceRateLimit } from "../../data/edge-security";
import { getAuthorizedReviewer } from "../../data/reviewer-auth";

const SESSION_PATTERN = /^[a-f0-9-]{20,80}$/i;
const EVENT_TYPES = new Set(["pageview", "interaction"]);
const ACTIONS = new Set(["heartbeat", "event"]);

function clean(value: unknown, fallback: string, max = 100) {
  return String(value ?? fallback).normalize("NFKC").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) || fallback;
}

function bogotaDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function startDay(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - (days - 1));
  return bogotaDay(date);
}

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "analitica", 240, 60);
    if (limited) return limited;
    const payload = await request.json() as Record<string, unknown>;
    const sessionId = clean(payload.sessionId, "", 80);
    if (!SESSION_PATTERN.test(sessionId)) return Response.json({ error: "Sesión inválida." }, { status: 400 });

    const requestedPage = clean(payload.page, "/", 120).split("?")[0];
    const page = /^\/[a-z0-9/_-]*$/i.test(requestedPage) ? requestedPage : "/";
    const action = clean(payload.action, "heartbeat", 20);
    if (!ACTIONS.has(action)) return Response.json({ error: "Acción inválida." }, { status: 400 });
    const now = new Date().toISOString();
    const db = getD1();
    await db.prepare(`
      INSERT INTO analytics_sessions (session_id, first_seen_at, last_seen_at, current_page)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET last_seen_at = excluded.last_seen_at, current_page = excluded.current_page
    `).bind(sessionId, now, now, page).run();

    if (action === "event") {
      const eventType = clean(payload.eventType, "interaction", 20);
      if (!EVENT_TYPES.has(eventType)) return Response.json({ error: "Evento inválido." }, { status: 400 });
      const eventName = clean(payload.eventName, eventType, 100);
      await db.prepare(`
        INSERT INTO analytics_events (id, session_id, event_type, event_name, page, day, occurred_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), sessionId, eventType, eventName, page, bogotaDay(), now).run();
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "La medición no está disponible temporalmente." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedRange = Number(url.searchParams.get("range") ?? 30);
    const range = [7, 30, 90].includes(requestedRange) ? requestedRange : 30;
    const today = bogotaDay();
    const start = startDay(range);
    const activeSince = new Date(Date.now() - 5 * 60_000).toISOString();
    const db = getD1();
    const [live, todayMetrics, daily, topPages, topInteractions] = await db.batch([
      db.prepare("SELECT COUNT(*) AS value FROM analytics_sessions WHERE last_seen_at >= ?").bind(activeSince),
      db.prepare(`
        SELECT
          COUNT(DISTINCT session_id) AS users,
          SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
          SUM(CASE WHEN event_type = 'interaction' THEN 1 ELSE 0 END) AS interactions
        FROM analytics_events WHERE day = ?
      `).bind(today),
      db.prepare(`
        SELECT day,
          COUNT(DISTINCT session_id) AS users,
          SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
          SUM(CASE WHEN event_type = 'interaction' THEN 1 ELSE 0 END) AS interactions
        FROM analytics_events WHERE day >= ? GROUP BY day ORDER BY day ASC
      `).bind(start),
      db.prepare(`
        SELECT page, COUNT(*) AS value FROM analytics_events
        WHERE day >= ? AND event_type = 'pageview'
        GROUP BY page ORDER BY value DESC LIMIT 8
      `).bind(start),
      db.prepare(`
        SELECT event_name AS name, COUNT(*) AS value FROM analytics_events
        WHERE day >= ? AND event_type = 'interaction'
        GROUP BY event_name ORDER BY value DESC LIMIT 8
      `).bind(start),
    ]);

    const todayRow = (todayMetrics.results?.[0] ?? {}) as Record<string, number>;
    const summary = {
      liveUsers: Number((live.results?.[0] as Record<string, number> | undefined)?.value ?? 0),
      today: { users: Number(todayRow.users ?? 0), pageviews: Number(todayRow.pageviews ?? 0), interactions: Number(todayRow.interactions ?? 0) },
      activeWindowMinutes: 5,
      generatedAt: new Date().toISOString(),
    };
    const reviewer = await getAuthorizedReviewer();
    if (!reviewer) {
      return Response.json(summary, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({
      ...summary,
      daily: daily.results ?? [],
      topPages: topPages.results ?? [],
      topInteractions: topInteractions.results ?? [],
      range,
      privacy: "Métricas anónimas. No se almacenan nombres, textos escritos ni direcciones IP.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Los reportes no están disponibles temporalmente." }, { status: 503 });
  }
}
