import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { newsSubmissions, opinions } from "../../../db/schema";
import { recordModerationAction, recordSecurityEvent } from "../../data/moderation-log";
import { hashReviewToken } from "../../data/review-email";

const INTRUSION_TYPES = new Set(["rate_limit", "bot", "injection", "spam", "unsafe_url", "validation"]);
type ItemType = "opinion" | "news";

function validIdentity(itemType: string, itemId: string, token: string): itemType is ItemType {
  return ["opinion", "news"].includes(itemType) && /^[a-f0-9-]{20,80}$/i.test(itemId) && /^[a-f0-9]{64}$/i.test(token);
}

function unavailable() {
  return Response.json({ error: "Este enlace no está disponible o ya fue utilizado." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}

function active(tokenHash: string | null, expectedHash: string, expiresAt: string | null, status: string) {
  return tokenHash === expectedHash && Boolean(expiresAt) && Date.parse(expiresAt as string) > Date.now() && !["approved_manual", "rejected_manual"].includes(status);
}

async function readItem(itemType: ItemType, itemId: string, expectedHash: string) {
  const db = getDb();
  if (itemType === "opinion") {
    const [row] = await db.select().from(opinions).where(eq(opinions.id, itemId)).limit(1);
    if (!row || !active(row.emailReviewTokenHash, expectedHash, row.emailReviewExpiresAt, row.status)) return null;
    return { row, item: { itemType, title: `Opinión ${row.stance.toLowerCase()}`, content: row.comment, source: [row.municipality, row.department, row.country].filter(Boolean).join(" · "), createdAt: row.createdAt } };
  }
  const [row] = await db.select().from(newsSubmissions).where(eq(newsSubmissions.id, itemId)).limit(1);
  if (!row || !active(row.emailReviewTokenHash, expectedHash, row.emailReviewExpiresAt, row.status)) return null;
  return { row, item: { itemType, title: row.title || row.domain, content: row.reason, source: row.domain, url: row.url, createdAt: row.createdAt } };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const itemType = url.searchParams.get("tipo") ?? "";
    const itemId = url.searchParams.get("id") ?? "";
    const token = url.searchParams.get("token") ?? "";
    if (!validIdentity(itemType, itemId, token)) return unavailable();
    const result = await readItem(itemType, itemId, await hashReviewToken(token));
    if (!result) return unavailable();
    return Response.json({ item: result.item }, { headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" } });
  } catch { return unavailable(); }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const itemType = String(payload.itemType ?? "");
    const itemId = String(payload.itemId ?? "");
    const token = String(payload.token ?? "");
    const action = String(payload.action ?? "");
    const intrusionType = String(payload.intrusionType ?? "spam");
    if (!validIdentity(itemType, itemId, token) || !["approve", "reject"].includes(action) || (action === "reject" && !INTRUSION_TYPES.has(intrusionType))) return unavailable();
    const expectedHash = await hashReviewToken(token);
    const result = await readItem(itemType, itemId, expectedHash);
    if (!result) return unavailable();
    const next = action === "approve" ? "approved_manual" : "rejected_manual";
    const reason = action === "approve" ? "Aprobación mediante enlace seguro de correo" : `Rechazo mediante enlace seguro: ${intrusionType}`;
    const reviewedAt = new Date().toISOString();
    const db = getDb();
    if (itemType === "opinion") {
      await db.update(opinions).set({ status: next, moderationReason: reason, emailReviewTokenHash: null, emailReviewExpiresAt: null, emailReviewedAt: reviewedAt }).where(and(eq(opinions.id, itemId), eq(opinions.emailReviewTokenHash, expectedHash)));
    } else {
      await db.update(newsSubmissions).set({ status: next, reason, emailReviewTokenHash: null, emailReviewExpiresAt: null, emailReviewedAt: reviewedAt }).where(and(eq(newsSubmissions.id, itemId), eq(newsSubmissions.emailReviewTokenHash, expectedHash)));
    }
    await recordModerationAction({ itemType, itemId, fromStatus: result.row.status, toStatus: next, reason, reviewer: "secure-email-link" });
    if (action === "reject") await recordSecurityEvent(request, { endpoint: "email-review", category: intrusionType as "rate_limit" | "bot" | "injection" | "spam" | "unsafe_url" | "validation", severity: ["injection", "unsafe_url"].includes(intrusionType) ? "high" : "medium", reason, fingerprintHash: result.row.visitorHash });
    return Response.json({ ok: true, status: next }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return unavailable(); }
}
