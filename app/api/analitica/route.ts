import { getD1 } from "../../../db";
import { enforceRateLimit } from "../../data/edge-security";
import { getAuthorizedReviewer } from "../../data/reviewer-auth";

const SESSION_PATTERN = /^[a-f0-9-]{20,80}$/i;
const EVENT_TYPES = new Set(["pageview", "interaction"]);
const ACTIONS = new Set(["heartbeat", "event"]);
const ANALYTICS_RETENTION_DAYS = 90;
const MAX_DAILY_EVENTS = 25_000;
const MAX_DAILY_SESSIONS = 6_000;
const MAX_DAILY_EVENTS_PER_SESSION = 180;

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

function bogotaDayStartIso(day = bogotaDay()) {
  return new Date(`${day}T00:00:00-05:00`).toISOString();
}

async function maybeApplyAnalyticsRetention(db: ReturnType<typeof getD1>) {
  if (Math.random() >= 0.01) return;
  const cutoff = new Date(Date.now() - ANALYTICS_RETENTION_DAYS * 86_400_000).toISOString();
  await db.batch([
    db.prepare("DELETE FROM analytics_events WHERE occurred_at < ?").bind(cutoff),
    db.prepare("DELETE FROM analytics_sessions WHERE last_seen_at < ?").bind(cutoff),
  ]);
}

async function analyticsQuotaExceeded(db: ReturnType<typeof getD1>, sessionId: string, action: string, day: string) {
  const todayStart = bogotaDayStartIso(day);
  const [existingSession, dailySessions] = await Promise.all([
    db.prepare("SELECT session_id AS sessionId FROM analytics_sessions WHERE session_id = ? LIMIT 1").bind(sessionId).first<{ sessionId: string }>(),
    db.prepare("SELECT COUNT(*) AS value FROM analytics_sessions WHERE first_seen_at >= ?").bind(todayStart).first<{ value: number }>(),
  ]);
  if (!existingSession && Number(dailySessions?.value ?? 0) >= MAX_DAILY_SESSIONS) return true;
  if (action !== "event") return false;
  const [dailyEvents, sessionEvents] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS value FROM analytics_events WHERE day = ?").bind(day).first<{ value: number }>(),
    db.prepare("SELECT COUNT(*) AS value FROM analytics_events WHERE session_id = ? AND day = ?").bind(sessionId, day).first<{ value: number }>(),
  ]);
  return Number(dailyEvents?.value ?? 0) >= MAX_DAILY_EVENTS || Number(sessionEvents?.value ?? 0) >= MAX_DAILY_EVENTS_PER_SESSION;
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
    const day = bogotaDay();
    const db = getD1();
    await maybeApplyAnalyticsRetention(db);
    if (await analyticsQuotaExceeded(db, sessionId, action, day)) {
      return Response.json({ ok: true, sampled: false }, { headers: { "Cache-Control": "no-store" } });
    }
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
      `).bind(crypto.randomUUID(), sessionId, eventType, eventName, page, day, now).run();
    }
    return Response.json({ ok: true, sampled: true }, { headers: { "Cache-Control": "no-store" } });
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
    const [live, todayMetrics, todayPages, todayTopPage, hourly, daily, topPages, topInteractions] = await db.batch([
      db.prepare("SELECT COUNT(*) AS value FROM analytics_sessions WHERE last_seen_at >= ?").bind(activeSince),
      db.prepare(`
        SELECT
          COUNT(DISTINCT session_id) AS users,
          SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
          SUM(CASE WHEN event_type = 'interaction' THEN 1 ELSE 0 END) AS interactions
        FROM analytics_events WHERE day = ?
      `).bind(today),
      db.prepare("SELECT COUNT(DISTINCT page) AS pages FROM analytics_events WHERE day = ? AND event_type = 'pageview'").bind(today),
      db.prepare("SELECT page, COUNT(*) AS value FROM analytics_events WHERE day = ? AND event_type = 'pageview' GROUP BY page ORDER BY value DESC LIMIT 1").bind(today),
      db.prepare(`
        SELECT strftime('%H', datetime(occurred_at, '-5 hours')) AS hour,
          COUNT(DISTINCT session_id) AS users,
          SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
          SUM(CASE WHEN event_type = 'interaction' THEN 1 ELSE 0 END) AS interactions
        FROM analytics_events WHERE day = ? GROUP BY hour ORDER BY hour ASC
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
    const pageviews = Number(todayRow.pageviews ?? 0);
    const interactions = Number(todayRow.interactions ?? 0);
    const users = Number(todayRow.users ?? 0);
    const summary = {
      liveUsers: Number((live.results?.[0] as Record<string, number> | undefined)?.value ?? 0),
      today: {
        users,
        pageviews,
        interactions,
        uniquePages: Number((todayPages.results?.[0] as Record<string, number> | undefined)?.pages ?? 0),
        pagesPerUser: users ? Number((pageviews / users).toFixed(2)) : 0,
        interactionRate: pageviews ? Number((interactions / pageviews * 100).toFixed(1)) : 0,
        topPage: (todayTopPage.results?.[0] as Record<string, string | number> | undefined) ?? null,
      },
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
      todayHourly: hourly.results ?? [],
      topPages: topPages.results ?? [],
      topInteractions: topInteractions.results ?? [],
      range,
      privacy: "Métricas anónimas. No se almacenan nombres, textos escritos ni direcciones IP.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Los reportes no están disponibles temporalmente." }, { status: 503 });
  }
}
