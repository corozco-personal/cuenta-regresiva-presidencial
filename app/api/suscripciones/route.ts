import { getDb } from "../../../db";
import { newsletterSubscriptions } from "../../../db/schema";
import { enforceRateLimit, turnstileErrorMessage, verifyTurnstile } from "../../data/edge-security";
import { safeEmail } from "../../data/input-security";
import { sendNewsletterConfirmation } from "../../data/newsletter-email";
import { createNewsletterToken, encryptNewsletterValue, hashNewsletterValue } from "../../data/newsletter-security";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "newsletter-subscribe", 5, 3_600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  let email: string;
  try {
    body = await request.json() as Record<string, unknown>;
    email = safeEmail(body.email);
  } catch {
    return Response.json({ error: "Escribe una dirección de correo válida." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const preferredHour = Number(body.preferredHour);
  if (!email || !Number.isInteger(preferredHour) || preferredHour < 0 || preferredHour > 23 || body.consent !== true) {
    return Response.json({ error: "Completa el correo, la hora y la autorización de envío." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const challenge = await verifyTurnstile(request, body.turnstileToken, "newsletter_subscribe");
    if (!challenge.ok) return Response.json({ error: turnstileErrorMessage(challenge.reason) }, { status: 400 });

    const confirmationToken = createNewsletterToken();
    const unsubscribeToken = createNewsletterToken();
    const now = new Date().toISOString();
    const emailHash = await hashNewsletterValue(email);
    const values = {
      id: crypto.randomUUID(),
      emailHash,
      emailCiphertext: await encryptNewsletterValue(email),
      preferredHour,
      timezone: "America/Bogota",
      status: "pending",
      confirmationTokenHash: await hashNewsletterValue(confirmationToken),
      unsubscribeTokenHash: await hashNewsletterValue(unsubscribeToken),
      unsubscribeTokenCiphertext: await encryptNewsletterValue(unsubscribeToken),
      verifiedAt: null,
      unsubscribedAt: null,
      lastSentLocalDate: null,
      lastMessageId: null,
      deliveryStatus: "not_sent",
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(newsletterSubscriptions).values(values).onConflictDoUpdate({
      target: newsletterSubscriptions.emailHash,
      set: {
        emailCiphertext: values.emailCiphertext,
        preferredHour,
        timezone: values.timezone,
        status: "pending",
        confirmationTokenHash: values.confirmationTokenHash,
        unsubscribeTokenHash: values.unsubscribeTokenHash,
        unsubscribeTokenCiphertext: values.unsubscribeTokenCiphertext,
        verifiedAt: null,
        unsubscribedAt: null,
        lastSentLocalDate: null,
        lastMessageId: null,
        deliveryStatus: "not_sent",
        lastError: null,
        updatedAt: now,
      },
    });

    await sendNewsletterConfirmation({ email, token: confirmationToken, preferredHour });
    return Response.json({ ok: true, message: "Te enviamos un correo para confirmar la suscripción." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("newsletter-subscribe", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "No fue posible crear la suscripción. Inténtalo nuevamente en unos minutos." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
