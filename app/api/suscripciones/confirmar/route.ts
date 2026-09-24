import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { newsletterSubscriptions } from "../../../../db/schema";
import { hashNewsletterValue } from "../../../data/newsletter-security";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("invalid-token");
    const tokenHash = await hashNewsletterValue(token);
    const now = new Date().toISOString();
    const result = await getDb().update(newsletterSubscriptions).set({ status: "active", confirmationTokenHash: null, verifiedAt: now, unsubscribedAt: null, updatedAt: now }).where(and(eq(newsletterSubscriptions.confirmationTokenHash, tokenHash), eq(newsletterSubscriptions.status, "pending")));
    const state = Number(result.meta?.changes ?? 0) > 0 ? "confirmada" : "invalida";
    return Response.redirect(`${SITE_URL}/alertas?estado=${state}`, 303);
  } catch {
    return Response.redirect(`${SITE_URL}/alertas?estado=invalida`, 303);
  }
}
