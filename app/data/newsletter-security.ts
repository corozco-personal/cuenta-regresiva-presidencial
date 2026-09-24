import { env } from "cloudflare:workers";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function encryptionKey() {
  const secret = env.AUDIT_ENCRYPTION_KEY?.trim() || env.RATE_LIMIT_SALT?.trim();
  if (!secret) throw new Error("newsletter-encryption-not-configured");
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`newsletter|${secret}`));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function hashNewsletterValue(value: string) {
  const secret = env.RATE_LIMIT_SALT?.trim();
  if (!secret) throw new Error("newsletter-hash-not-configured");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${secret}|newsletter|${value}`));
  return bytesToHex(new Uint8Array(hash));
}

export async function encryptNewsletterValue(value: string) {
  const key = await encryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value)));
  return `${bytesToBase64(iv)}.${bytesToBase64(encrypted)}`;
}

export async function decryptNewsletterValue(value: string) {
  const key = await encryptionKey();
  const [iv, encrypted] = value.split(".");
  if (!iv || !encrypted) throw new Error("newsletter-invalid-ciphertext");
  const clear = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, key, base64ToBytes(encrypted));
  return new TextDecoder().decode(clear);
}

export function createNewsletterToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}
