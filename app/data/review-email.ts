import { env } from "cloudflare:workers";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createReviewToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function hashReviewToken(token: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(hash));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] ?? character));
}

function reviewLink(input: { itemType: "opinion" | "news"; itemId: string; token: string; intent: "approve" | "reject" }) {
  const url = new URL("/revision-movil", SITE_URL);
  url.searchParams.set("tipo", input.itemType);
  url.searchParams.set("id", input.itemId);
  url.searchParams.set("token", input.token);
  url.searchParams.set("decision", input.intent);
  return url.toString();
}

export async function sendReviewNotification(input: {
  itemType: "opinion" | "news";
  itemId: string;
  token: string;
  title: string;
  summary: string;
  source?: string;
}) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.REVIEW_NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !to) return { sent: false, reason: "not_configured" as const };

  const approveUrl = reviewLink({ itemType: input.itemType, itemId: input.itemId, token: input.token, intent: "approve" });
  const rejectUrl = reviewLink({ itemType: input.itemType, itemId: input.itemId, token: input.token, intent: "reject" });
  const safeTitle = escapeHtml(input.title.slice(0, 240));
  const safeSummary = escapeHtml(input.summary.slice(0, 900)).replace(/\n/g, "<br>");
  const safeSource = input.source ? `<p style="margin:0 0 22px;color:#61706d;font-size:13px">${escapeHtml(input.source.slice(0, 240))}</p>` : "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.REVIEW_FROM_EMAIL?.trim() || "Cuenta pública <onboarding@resend.dev>",
      to: [to],
      subject: `Revisión pendiente: ${input.itemType === "opinion" ? "nueva opinión" : "nuevo enlace"}`,
      html: `<div style="background:#edf0e8;padding:28px;font-family:Arial,sans-serif;color:#122b27"><div style="max-width:620px;margin:auto;background:#fff;padding:30px;border:1px solid #c9cec3"><p style="margin:0 0 10px;color:#687571;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Cuenta pública · revisión manual</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:30px;font-weight:400">${safeTitle}</h1><p style="font-family:Georgia,serif;font-size:20px;line-height:1.45">${safeSummary}</p>${safeSource}<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="padding-right:10px"><a href="${approveUrl}" style="display:inline-block;padding:14px 18px;background:#143f37;color:#fff;text-decoration:none;font-weight:700">Revisar y aprobar</a></td><td><a href="${rejectUrl}" style="display:inline-block;padding:13px 18px;border:1px solid #7f342e;color:#7f342e;text-decoration:none;font-weight:700">Revisar y rechazar</a></td></tr></table><p style="margin:24px 0 0;color:#687571;font-size:12px;line-height:1.5">Los enlaces vencen en 48 horas y no ejecutan la decisión hasta que la confirmes en el portal. Esto evita acciones automáticas de los escáneres de correo.</p></div></div>`,
    }),
  });
  return response.ok ? { sent: true as const } : { sent: false as const, reason: `provider_${response.status}` };
}
