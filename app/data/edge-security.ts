import { env } from "cloudflare:workers";
import { getD1 } from "../../db";

type TurnstileResult = { success: boolean; action?: string; hostname?: string; "error-codes"?: string[] };

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function visitorAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const boundary = now - windowSeconds;
    const identity = `${visitorAddress(request)}|${request.headers.get("user-agent")?.slice(0, 160) ?? "unknown"}`;
    const bucketKey = await digest(`${env.RATE_LIMIT_SALT ?? "local-development-only"}|${scope}|${identity}`);
    const db = getD1();
    const row = await db.prepare(`
      INSERT INTO edge_rate_limits (bucket_key, scope, window_started_at, request_count, updated_at)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(bucket_key) DO UPDATE SET
        request_count = CASE WHEN window_started_at <= ? THEN 1 ELSE request_count + 1 END,
        window_started_at = CASE WHEN window_started_at <= ? THEN excluded.window_started_at ELSE window_started_at END,
        updated_at = excluded.updated_at
      RETURNING request_count AS requestCount, window_started_at AS windowStartedAt
    `).bind(bucketKey, scope, now, now, boundary, boundary).first<{ requestCount: number; windowStartedAt: number }>();

    if (Math.random() < 0.01) await db.prepare("DELETE FROM edge_rate_limits WHERE updated_at < ?").bind(now - 86_400).run();

    if (!row || Number(row.requestCount) <= limit) return null;
    const retryAfter = Math.max(1, Number(row.windowStartedAt) + windowSeconds - now);
    return Response.json(
      { error: "Demasiadas solicitudes. Espera unos minutos antes de volver a intentarlo." },
      { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "La protección perimetral no está disponible temporalmente." }, { status: 503 });
  }
}

export function turnstileConfiguration() {
  return { enabled: Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY), siteKey: env.TURNSTILE_SITE_KEY ?? "" };
}

export async function verifyTurnstile(request: Request, token: unknown, expectedAction: string) {
  const secret = env.TURNSTILE_SECRET_KEY;
  const siteKey = env.TURNSTILE_SITE_KEY;
  if (!secret || !siteKey) return { ok: true, configured: false };
  const responseToken = String(token ?? "").trim();
  if (!responseToken || responseToken.length > 2048) return { ok: false, configured: true };

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", responseToken);
  body.set("remoteip", visitorAddress(request));
  body.set("idempotency_key", crypto.randomUUID());
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!response.ok) return { ok: false, configured: true };
  const result = await response.json() as TurnstileResult;
  const requestHost = new URL(request.url).hostname;
  return {
    ok: result.success === true && result.action === expectedAction && (!result.hostname || result.hostname === requestHost),
    configured: true,
  };
}
