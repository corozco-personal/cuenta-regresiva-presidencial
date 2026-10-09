import { env } from "cloudflare:workers";
import { hasInjectionPattern, safeEmail } from "./input-security";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";

type DigestArticle = { title: string; source: string; url: string; publishedAt: string; category?: string };
type DigestRecipient = { email: string; unsubscribeToken: string; articles?: DigestArticle[] };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] ?? character));
}

function safeMailbox(value: string) {
  if (/[\r\n\u0000-\u001f\u007f]/.test(value)) throw new Error("newsletter-invalid-sender");
  const match = value.trim().match(/^([^<>]{1,80})\s*<([^<>]+)>$/);
  if (!match) return safeEmail(value);
  const displayName = match[1].trim();
  if (!displayName || /["\\]/.test(displayName) || hasInjectionPattern(displayName)) throw new Error("newsletter-invalid-sender");
  return `${displayName} <${safeEmail(match[2])}>`;
}

function safeToken(value: string) {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error("newsletter-invalid-token");
  return value;
}

function cleanEmailText(value: string, max: number) {
  return value.normalize("NFKC").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeArticleUrl(value: string) {
  if (value.length > 2048 || /[\u0000-\u001f\u007f]/.test(value)) throw new Error("newsletter-invalid-article-url");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("newsletter-invalid-article-url");
  return url.toString();
}

function sanitizeArticles(articles: DigestArticle[]) {
  return articles.flatMap((article) => {
    try {
      const title = cleanEmailText(article.title, 300);
      const source = cleanEmailText(article.source, 160);
      if (!title || !source) return [];
      return [{ ...article, title, source, url: safeArticleUrl(article.url) }];
    } catch { return []; }
  });
}

function mailSettings() {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("newsletter-provider-not-configured");
  return {
    apiKey,
    from: safeMailbox(env.NEWSLETTER_FROM_EMAIL?.trim() || env.REVIEW_FROM_EMAIL?.trim() || "Cuenta pública <onboarding@resend.dev>"),
    replyTo: safeEmail(env.NEWSLETTER_REPLY_TO_EMAIL?.trim() || "cuentaregresivapresidencial@gmail.com"),
  };
}

function unsubscribeUrl(token: string) {
  const url = new URL("/api/suscripciones/cancelar", SITE_URL);
  url.searchParams.set("token", safeToken(token));
  return url.toString();
}

export async function sendNewsletterConfirmation(input: { email: string; token: string; preferredHour: number }) {
  const { apiKey, from, replyTo } = mailSettings();
  const recipient = safeEmail(input.email);
  if (!recipient || !Number.isInteger(input.preferredHour) || input.preferredHour < 0 || input.preferredHour > 23) throw new Error("newsletter-invalid-recipient");
  const url = new URL("/api/suscripciones/confirmar", SITE_URL);
  url.searchParams.set("token", safeToken(input.token));
  const hour = `${String(input.preferredHour).padStart(2, "0")}:00`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      reply_to: replyTo,
      to: [recipient],
      subject: "Confirma tu resumen diario de Cuenta pública",
      html: `<div style="background:#edf0e8;padding:28px;font-family:Arial,sans-serif;color:#122b27"><div style="max-width:620px;margin:auto;background:#fff;padding:30px;border:1px solid #c9cec3"><p style="margin:0 0 10px;color:#687571;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Cuenta pública · resumen diario</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:30px;font-weight:400">Confirma que quieres recibir noticias de interés</h1><p style="font-size:16px;line-height:1.6">Elegiste recibir un resumen de las últimas 24 horas todos los días a las <strong>${hour}</strong>, hora de Colombia.</p><a href="${url}" style="display:inline-block;margin:10px 0 20px;padding:14px 18px;background:#143f37;color:#fff;text-decoration:none;font-weight:700">Confirmar suscripción</a><p style="color:#687571;font-size:12px;line-height:1.5">Si no solicitaste este correo, ignóralo. La suscripción no se activará sin tu confirmación.</p></div></div>`,
      text: `Confirma tu resumen diario de Cuenta pública. Recibirás noticias de las últimas 24 horas. Hora elegida: ${hour}, hora de Colombia.\n\n${url}\n\nSi no solicitaste este correo, ignóralo.`,
    }),
  });
  const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
  if (!response.ok) throw new Error(`newsletter-provider-${response.status}:${result.message ?? "unknown"}`);
  return result.id ?? null;
}

function articleTime(value: string) {
  const date = new Date(value);
  return `${new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(date)} Colombia · ${date.toISOString().replace(".000Z", "Z")} UTC`;
}

function digestHtml(articles: DigestArticle[], localDate: string, unsubscribeToken: string) {
  const date = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(new Date(`${localDate}T12:00:00-05:00`));
  const list = articles.length
    ? articles.map((article) => `<li style="padding:18px 0;border-top:1px solid #d9ddd5"><p style="margin:0 0 7px;color:#687571;font-size:12px">${escapeHtml(article.source)}</p><h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:21px;font-weight:400;line-height:1.25">${escapeHtml(article.title)}</h2><p style="margin:0 0 10px;color:#687571;font-size:12px">Publicado: ${escapeHtml(articleTime(article.publishedAt))}</p><a href="${escapeHtml(article.url)}" style="color:#143f37;font-size:13px;font-weight:700">Leer la noticia →</a></li>`).join("")
    : `<li style="padding:20px 0;border-top:1px solid #d9ddd5">No se incorporaron noticias nuevas de tus temas durante las últimas 24 horas.</li>`;
  return `<div style="background:#edf0e8;padding:28px;font-family:Arial,sans-serif;color:#122b27"><div style="max-width:650px;margin:auto;background:#fff;padding:30px;border:1px solid #c9cec3"><p style="margin:0 0 10px;color:#687571;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Cuenta pública · ${escapeHtml(date)}</p><h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:400">Noticias de las últimas 24 horas</h1><p style="margin:0 0 24px;color:#687571;line-height:1.5">${articles.length} ${articles.length === 1 ? "noticia incorporada" : "noticias incorporadas"}, con el medio y el enlace a la publicación original.</p><ol style="margin:0;padding:0;list-style:none">${list}</ol><p style="margin:26px 0 8px;color:#687571;font-size:12px;line-height:1.5">Este correo se envía porque confirmaste una suscripción a Cuenta pública. Puedes responder a este mensaje si necesitas ayuda.</p><a href="${unsubscribeUrl(unsubscribeToken)}" style="color:#7f342e;font-size:12px">Cancelar suscripción</a></div></div>`;
}

function digestText(articles: DigestArticle[], localDate: string, unsubscribeToken: string) {
  const body = articles.length ? articles.map((article) => `${article.title}\n${article.source}\nPublicado: ${articleTime(article.publishedAt)}\n${article.url}`).join("\n\n") : "No se incorporaron noticias nuevas de tus temas durante las últimas 24 horas.";
  return `CUENTA PÚBLICA · NOTICIAS DE LAS ÚLTIMAS 24 HORAS · ${localDate}\n\n${body}\n\nCancelar suscripción: ${unsubscribeUrl(unsubscribeToken)}`;
}

export async function sendNewsletterDigestBatch(recipients: DigestRecipient[], articles: DigestArticle[], localDate: string) {
  if (!recipients.length) return [];
  const { apiKey, from, replyTo } = mailSettings();
  const safeArticles = sanitizeArticles(articles);
  const safeRecipients = recipients.map((recipient) => ({ email: safeEmail(recipient.email), unsubscribeToken: safeToken(recipient.unsubscribeToken), articles: recipient.articles ? sanitizeArticles(recipient.articles) : safeArticles }));
  if (safeRecipients.some((recipient) => !recipient.email)) throw new Error("newsletter-invalid-recipient");
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(safeRecipients.map((recipient) => {
      const unsubscribe = unsubscribeUrl(recipient.unsubscribeToken);
      return {
        from,
        reply_to: replyTo,
        to: [recipient.email],
        subject: recipient.articles.length ? `${recipient.articles.length} ${recipient.articles.length === 1 ? "noticia" : "noticias"} de las últimas 24 horas` : "Resumen del día: sin novedades incorporadas",
        html: digestHtml(recipient.articles, localDate, recipient.unsubscribeToken),
        text: digestText(recipient.articles, localDate, recipient.unsubscribeToken),
        headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      };
    })),
  });
  const result = await response.json().catch(() => ({})) as { data?: Array<{ id?: string }>; message?: string };
  if (!response.ok) throw new Error(`newsletter-provider-${response.status}:${result.message ?? "unknown"}`);
  return safeRecipients.map((_, index) => result.data?.[index]?.id ?? null);
}
