import { env } from "cloudflare:workers";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../db";
import { submissionAuditProfiles } from "../../db/schema";

function bytesToBase64(bytes: Uint8Array) { let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); }
function base64ToBytes(value: string) { const binary = atob(value); return Uint8Array.from(binary, (character) => character.charCodeAt(0)); }
async function digest(value: string) { const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
async function encryptionKey() { const secret = env.AUDIT_ENCRYPTION_KEY?.trim() || env.RATE_LIMIT_SALT?.trim(); if (!secret) return null; const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`private-audit|${secret}`)); return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]); }
async function encrypt(value?: string | null) { if (!value) return null; const key = await encryptionKey(); if (!key) return null; const iv = crypto.getRandomValues(new Uint8Array(12)); const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value))); return `${bytesToBase64(iv)}.${bytesToBase64(encrypted)}`; }
async function decrypt(value?: string | null) { if (!value) return null; try { const key = await encryptionKey(); if (!key) return null; const [iv, encrypted] = value.split("."); const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, key, base64ToBytes(encrypted)); return new TextDecoder().decode(clear); } catch { return null; } }

function describeAgent(userAgent: string) {
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /CriOS\//.test(userAgent) ? "Chrome iOS" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "Otro navegador";
  const operatingSystem = /Android/.test(userAgent) ? "Android" : /iPhone|iPad/.test(userAgent) ? "iOS/iPadOS" : /Windows/.test(userAgent) ? "Windows" : /Mac OS X/.test(userAgent) ? "macOS" : /Linux/.test(userAgent) ? "Linux" : "Otro sistema";
  const deviceClass = /Mobile|Android|iPhone/.test(userAgent) ? "Móvil" : /iPad|Tablet/.test(userAgent) ? "Tableta" : "Escritorio";
  return { browser, operatingSystem, deviceClass };
}

export async function recordPrivateSubmissionAudit(request: Request, input: { itemType: "opinion" | "news" | "correction"; itemId: string; contact?: string | null }) {
  try {
    const address = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const agent = request.headers.get("user-agent")?.slice(0, 500) ?? "unknown"; const salt = env.RATE_LIMIT_SALT ?? "local-development-only";
    const ray = request.headers.get("cf-ray") ?? ""; const edgeLocation = ray.includes("-") ? ray.split("-").at(-1)?.slice(0, 8) : null;
    await getDb().insert(submissionAuditProfiles).values({
      id: crypto.randomUUID(), itemType: input.itemType, itemId: input.itemId,
      networkHash: await digest(`${salt}|network|${address}`), ...describeAgent(agent),
      countryCode: request.headers.get("cf-ipcountry")?.slice(0, 3) ?? null,
      edgeLocation: edgeLocation || null, language: request.headers.get("accept-language")?.split(",")[0]?.slice(0, 24) ?? null,
      contactCiphertext: await encrypt(input.contact), createdAt: new Date().toISOString(),
    });
  } catch { /* El envío principal no falla si el registro privado no está disponible. */ }
}

export async function readPrivateSubmissionAudits(itemType: string, itemIds: string[]) {
  if (!itemIds.length) return {};
  const rows = await getDb().select().from(submissionAuditProfiles).where(and(eq(submissionAuditProfiles.itemType, itemType), inArray(submissionAuditProfiles.itemId, itemIds)));
  const uniqueNetworks = [...new Set(rows.map((row) => row.networkHash))];
  const counts = new Map(await Promise.all(uniqueNetworks.map(async (networkHash) => {
    const [result] = await getDb().select({ count: sql<number>`count(*)` }).from(submissionAuditProfiles).where(eq(submissionAuditProfiles.networkHash, networkHash));
    return [networkHash, Number(result?.count ?? 1)] as const;
  })));
  return Object.fromEntries(await Promise.all(rows.map(async (row) => [row.itemId, { networkReference: row.networkHash.slice(0, 12), browser: row.browser, operatingSystem: row.operatingSystem, deviceClass: row.deviceClass, countryCode: row.countryCode, edgeLocation: row.edgeLocation, language: row.language, contact: await decrypt(row.contactCiphertext), relatedSubmissions: counts.get(row.networkHash) ?? 1 }] as const)));
}
