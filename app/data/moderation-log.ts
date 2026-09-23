import { getDb } from "../../db";
import { moderationActions, securityEvents } from "../../db/schema";

async function digest(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function recordModerationAction(input: {
  itemType: "opinion" | "news" | "correction";
  itemId: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  reviewer?: string;
}) {
  try {
    await getDb().insert(moderationActions).values({
      id: crypto.randomUUID(),
      itemType: input.itemType,
      itemId: input.itemId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      reason: input.reason.slice(0, 300),
      reviewer: input.reviewer ?? "automatic-policy",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // El envío principal no debe fallar si el registro auxiliar no está disponible.
  }
}

export async function recordSecurityEvent(request: Request, input: {
  endpoint: string;
  category: "rate_limit" | "bot" | "injection" | "spam" | "unsafe_url" | "validation";
  severity: "low" | "medium" | "high";
  reason: string;
  payload?: unknown;
  fingerprintHash?: string | null;
}) {
  try {
    const identity = `${request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}|${request.headers.get("user-agent")?.slice(0, 180) ?? "unknown"}`;
    const serialized = input.payload === undefined ? "" : JSON.stringify(input.payload).slice(0, 12_000);
    await getDb().insert(securityEvents).values({
      id: crypto.randomUUID(),
      requestReference: (request.headers.get("cf-ray")?.split("-")[0] || crypto.randomUUID()).slice(0, 36),
      endpoint: input.endpoint,
      category: input.category,
      severity: input.severity,
      reason: input.reason.slice(0, 300),
      fingerprintHash: input.fingerprintHash || await digest(identity),
      payloadDigest: serialized ? await digest(serialized) : null,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Nunca se conserva el contenido hostil; el registro usa solo huellas irreversibles.
  }
}
