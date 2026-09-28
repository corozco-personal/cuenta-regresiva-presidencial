import { env } from "cloudflare:workers";
import { and, desc, eq, gte, isNull, ne, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { newsletterSubscriptions, newsArticles } from "../../../../db/schema";
import { sendNewsletterDigestBatch } from "../../../data/newsletter-email";
import { decryptNewsletterValue } from "../../../data/newsletter-security";

function colombiaClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { localDate: `${value.year}-${value.month}-${value.day}`, localHour: Number(value.hour) };
}

function parseInterests(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [];
  } catch { return []; }
}

export async function POST(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("x-cron-secret") !== env.CRON_SECRET) {
    return Response.json({ error: "No autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const db = getDb();
  const { localDate, localHour } = colombiaClock();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const [subscriptions, articles] = await Promise.all([
    db.select().from(newsletterSubscriptions).where(and(
      eq(newsletterSubscriptions.status, "active"),
      eq(newsletterSubscriptions.preferredHour, localHour),
      or(isNull(newsletterSubscriptions.lastSentLocalDate), ne(newsletterSubscriptions.lastSentLocalDate, localDate)),
    )).limit(500),
    db.select({ title: newsArticles.title, source: newsArticles.source, url: newsArticles.url, finalUrl: newsArticles.finalUrl, publishedAt: newsArticles.publishedAt, category: newsArticles.category })
      .from(newsArticles)
      .where(gte(newsArticles.publishedAt, since))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(120),
  ]);

  const safeArticles = articles.map((article) => ({
    title: article.title,
    source: article.source,
    url: /^https:\/\//i.test(article.finalUrl ?? "") ? article.finalUrl! : article.url,
    publishedAt: article.publishedAt,
    category: article.category,
  }));
  let sent = 0;
  let failed = 0;

  for (let offset = 0; offset < subscriptions.length; offset += 100) {
    const chunk = subscriptions.slice(offset, offset + 100);
    try {
      const recipients = await Promise.all(chunk.map(async (subscription) => ({
        email: await decryptNewsletterValue(subscription.emailCiphertext),
        unsubscribeToken: await decryptNewsletterValue(subscription.unsubscribeTokenCiphertext),
        interests: parseInterests(subscription.interestsJson),
      })));
      const messageIds = await sendNewsletterDigestBatch(recipients.map((recipient) => ({
        email: recipient.email,
        unsubscribeToken: recipient.unsubscribeToken,
        articles: recipient.interests.length ? safeArticles.filter((article) => recipient.interests.some((interest) => new RegExp(interest.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(`${article.title} ${article.category ?? ""}`))).slice(0, 40) : safeArticles.slice(0, 40),
      })), safeArticles, localDate);
      await Promise.all(chunk.map((subscription, index) => db.update(newsletterSubscriptions).set({
        lastSentLocalDate: localDate,
        lastMessageId: messageIds[index],
        deliveryStatus: "sent",
        lastError: null,
        updatedAt: new Date().toISOString(),
      }).where(eq(newsletterSubscriptions.id, subscription.id))));
      sent += chunk.length;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 300) : "unknown";
      await Promise.all(chunk.map((subscription) => db.update(newsletterSubscriptions).set({ deliveryStatus: "failed", lastError: message, updatedAt: new Date().toISOString() }).where(eq(newsletterSubscriptions.id, subscription.id))));
      failed += chunk.length;
      console.error("newsletter-digest", message);
    }
  }

  return Response.json({ ok: failed === 0, localDate, localHour, articles: safeArticles.length, due: subscriptions.length, sent, failed }, { status: failed ? 502 : 200, headers: { "Cache-Control": "no-store" } });
}
