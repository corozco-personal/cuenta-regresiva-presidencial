import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { newsletterSubscriptions } from "../../../../db/schema";
import { hashNewsletterValue } from "../../../data/newsletter-security";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";

async function cancel(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[a-f0-9]{64}$/.test(token)) return Response.redirect(`${SITE_URL}/alertas?estado=invalida`, 303);
  try {
    const tokenHash = await hashNewsletterValue(token);
    const [row] = await getDb().select({ id: newsletterSubscriptions.id }).from(newsletterSubscriptions).where(eq(newsletterSubscriptions.unsubscribeTokenHash, tokenHash)).limit(1);
    if (!row) return Response.redirect(`${SITE_URL}/alertas?estado=invalida`, 303);
    const now = new Date().toISOString();
    await getDb().update(newsletterSubscriptions).set({ status: "unsubscribed", unsubscribedAt: now, updatedAt: now }).where(eq(newsletterSubscriptions.id, row.id));
    return Response.redirect(`${SITE_URL}/alertas?estado=cancelada`, 303);
  } catch {
    return Response.redirect(`${SITE_URL}/alertas?estado=invalida`, 303);
  }
}

export async function GET(request: Request) { return cancel(request); }
export async function POST(request: Request) { return cancel(request); }
