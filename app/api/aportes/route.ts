import { and, desc, eq, gte } from "drizzle-orm";
import { isIP } from "node:net";
import { getDb } from "../../../db";
import { newsSubmissions } from "../../../db/schema";
import { profileFor } from "../noticias/route";
import { countryNames } from "../../data/countries";
import { httpsUrl, plainText } from "../../data/input-security";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicSubmission(row: typeof newsSubmissions.$inferSelect) {
  return { id: row.id, url: row.url, domain: row.domain, title: row.title, status: row.status, reliability: row.reliability, reason: row.reason, country: row.country, createdAt: row.createdAt };
}

function normalizeUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("unsafe");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "localhost" || host.endsWith(".local") || isIP(host)) throw new Error("unsafe");
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
  return { normalized: url.toString(), host };
}

export async function GET() {
  try {
    const rows = await getDb().select().from(newsSubmissions).orderBy(desc(newsSubmissions.createdAt)).limit(30);
    return Response.json({ submissions: rows.map(publicSubmission) });
  } catch {
    return Response.json({ error: "Los aportes no están disponibles temporalmente." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    if (payload.website) return Response.json({ ok: true }, { status: 201 });
    const rawUrl = httpsUrl(payload.url);
    const country = plainText(payload.country, { max: 80 });
    const isAnonymous = payload.isAnonymous !== false;
    const submitterName = isAnonymous ? null : plainText(payload.submitterName, { min: 2, max: 80 });
    if (!countryNames.has(country) || (!isAnonymous && !submitterName)) return Response.json({ error: "Completa el enlace, selecciona un país válido y, si aplica, tu nombre." }, { status: 400 });
    const { normalized, host } = normalizeUrl(rawUrl);
    const urlHash = await digest(normalized);
    const db = getDb();
    const visitorSource = `network:${request.headers.get("cf-connecting-ip") ?? "unknown"}|${request.headers.get("user-agent") ?? "unknown"}`;
    const visitorHash = await digest(visitorSource);
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const recentByVisitor = await db.select({ id: newsSubmissions.id }).from(newsSubmissions)
      .where(and(eq(newsSubmissions.visitorHash, visitorHash), gte(newsSubmissions.createdAt, dayAgo))).limit(5);
    if (recentByVisitor.length >= 5) return Response.json({ error: "Alcanzaste el límite de cinco enlaces por día. Vuelve a intentarlo mañana." }, { status: 429 });
    const existing = await db.select({ id: newsSubmissions.id }).from(newsSubmissions).where(eq(newsSubmissions.urlHash, urlHash)).limit(1);
    if (existing.length) return Response.json({ error: "Este enlace ya fue enviado.", duplicate: true }, { status: 409 });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    let title = host;
    let accessible = false;
    let relevant = false;
    try {
      const response = await fetch(normalized, { signal: controller.signal, redirect: "manual", headers: { "user-agent": "CuentaPublica/1.0 (+public-source-check)" } });
      accessible = response.ok && (response.headers.get("content-type") ?? "").includes("text/html");
      if (accessible) {
        const html = (await response.text()).slice(0, 300_000);
        title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim().slice(0, 240) || host;
        relevant = /abelardo|espriella/i.test(`${title} ${html.slice(0, 120_000)}`);
      }
    } finally { clearTimeout(timeout); }

    const profile = profileFor(host);
    const reliability = profile?.official ? "official" : profile ? "known_media" : "unknown";
    let status = "rejected";
    let reason = "El enlace no pudo verificarse o no se refiere directamente al mandatario.";
    if (accessible && relevant && profile?.official) { status = "publishable"; reason = "Fuente oficial accesible y relacionada; puede considerarse como fuente primaria."; }
    else if (accessible && relevant && profile) { status = "review"; reason = "Medio incluido en el directorio. Se conserva como aporte periodístico pendiente de corroboración independiente."; }
    else if (accessible && relevant) { status = "review"; reason = "Fuente nueva: el enlace es accesible y relevante, pero su confiabilidad aún debe evaluarse."; }

    const row: typeof newsSubmissions.$inferInsert = { id: crypto.randomUUID(), urlHash, url: normalized, domain: host, title, submitterName, isAnonymous: isAnonymous ? "1" : "0", country, status, reliability, reason, visitorHash, createdAt: new Date().toISOString() };
    await db.insert(newsSubmissions).values(row);
    return Response.json({ submission: publicSubmission(row as typeof newsSubmissions.$inferSelect) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "unsafe") return Response.json({ error: "Solo se aceptan enlaces HTTPS públicos y seguros." }, { status: 400 });
    if (error instanceof Error && error.message === "invalid-text") return Response.json({ error: "Uno de los campos contiene formato no permitido. Escribe únicamente texto plano." }, { status: 400 });
    if (error instanceof Error && error.name === "AbortError") return Response.json({ error: "La fuente tardó demasiado en responder. No se guardó el envío." }, { status: 408 });
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return Response.json({ error: "Este enlace ya fue enviado.", duplicate: true }, { status: 409 });
    return Response.json({ error: "No fue posible evaluar el enlace en este momento." }, { status: 503 });
  }
}
