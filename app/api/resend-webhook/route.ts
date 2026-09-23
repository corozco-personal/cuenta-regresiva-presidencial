import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { newsSubmissions, opinions } from "../../../db/schema";
import { sendOperationalAlert } from "../../data/review-email";

function decodeBase64(value: string) {
  const binary = atob(value); return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
function equal(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false; let different = 0;
  for (let index = 0; index < left.length; index += 1) different |= left[index] ^ right[index];
  return different === 0;
}
async function validSignature(body: string, request: Request) {
  const secret = env.RESEND_WEBHOOK_SECRET?.trim(); if (!secret) return false;
  // Resend currently signs webhooks with Svix headers. Keep the legacy names as
  // a compatibility fallback for endpoints created before the header rename.
  const id = request.headers.get("svix-id") ?? request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("svix-timestamp") ?? request.headers.get("webhook-timestamp") ?? "";
  const signature = request.headers.get("svix-signature") ?? request.headers.get("webhook-signature") ?? "";
  if (!id || !timestamp || !signature || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = decodeBase64(secret.replace(/^whsec_/, ""));
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`${id}.${timestamp}.${body}`)));
  return signature.split(" ").some((entry) => { try { return equal(expected, decodeBase64(entry.replace(/^v1,/, ""))); } catch { return false; } });
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!(await validSignature(body, request))) return Response.json({ error: "No autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const event = JSON.parse(body) as { type?: string; data?: { email_id?: string } };
    const messageId = String(event.data?.email_id ?? ""); const deliveryStatus = String(event.type ?? "").replace(/^email\./, "");
    if (!messageId || !["sent", "delivered", "delivery_delayed", "bounced", "complained", "failed", "suppressed"].includes(deliveryStatus)) return Response.json({ received: true });
    const error = ["bounced", "complained", "failed", "suppressed"].includes(deliveryStatus) ? deliveryStatus : null;
    const db = getDb();
    const updates = await Promise.all([
      db.update(opinions).set({ emailDeliveryStatus: deliveryStatus, emailLastError: error }).where(eq(opinions.emailMessageId, messageId)),
      db.update(newsSubmissions).set({ emailDeliveryStatus: deliveryStatus, emailLastError: error }).where(eq(newsSubmissions.emailMessageId, messageId)),
    ]);
    const matched = updates.some((result) => Number(result.meta?.changes ?? 0) > 0);
    if (matched && error) await sendOperationalAlert({ subject: `falló una notificación de revisión (${error})`, detail: `Resend informó el estado ${deliveryStatus} para una notificación de moderación. Identificador del mensaje: ${messageId}.` }).catch(() => undefined);
    return Response.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Evento inválido." }, { status: 400 }); }
}
