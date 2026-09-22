import { NextResponse } from "next/server";

type PublicNews = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  kind: "Fuente primaria" | "Cobertura periodística";
};

const ALLOWED_DOMAINS = [
  "presidencia.gov.co",
  "cne.gov.co",
  "registraduria.gov.co",
  "corteconstitucional.gov.co",
  "procuraduria.gov.co",
  "contraloria.gov.co",
  "fiscalia.gov.co",
  "elpais.com",
  "elespectador.com",
  "eltiempo.com",
  "caracol.com.co",
  "noticiascaracol.com",
  "bluradio.com",
  "lasillavacia.com",
  "cuestionpublica.com",
];

const OFFICIAL_DOMAINS = ALLOWED_DOMAINS.slice(0, 7);

function allowed(hostname: string) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  return ALLOWED_DOMAINS.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
}

function official(hostname: string) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  return OFFICIAL_DOMAINS.some((domain) => normalized === domain || normalized.endsWith(`.${domain}`));
}

function idFor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
}

function gdeltDate(value?: string) {
  if (!value || value.length < 8) return new Date().toISOString();
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || "00";
  const minute = value.slice(11, 13) || "00";
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`).toISOString();
}

async function fromNewsApi(apiKey: string): Promise<PublicNews[]> {
  const params = new URLSearchParams({
    q: '"Abelardo de la Espriella"',
    language: "es",
    sortBy: "publishedAt",
    pageSize: "50",
  });
  const response = await fetch(`https://newsapi.org/v2/everything?${params}`, {
    headers: { "X-Api-Key": apiKey },
  });
  if (!response.ok) throw new Error(`NewsAPI ${response.status}`);
  const data = (await response.json()) as { articles?: Array<Record<string, unknown>> };
  return (data.articles ?? []).flatMap((article) => {
    try {
      const url = String(article.url ?? "");
      const hostname = new URL(url).hostname;
      const title = String(article.title ?? "Sin título");
      if (!allowed(hostname) || !/abelardo|espriella/i.test(title)) return [];
      return [{
        id: idFor(url),
        title,
        source: String((article.source as { name?: string } | undefined)?.name ?? hostname.replace(/^www\./, "")),
        url,
        publishedAt: String(article.publishedAt ?? new Date().toISOString()),
        kind: official(hostname) ? "Fuente primaria" as const : "Cobertura periodística" as const,
      }];
    } catch { return []; }
  });
}

async function fromGdelt(): Promise<PublicNews[]> {
  const params = new URLSearchParams({
    query: '"Abelardo de la Espriella"',
    mode: "ArtList",
    maxrecords: "50",
    format: "json",
    sort: "DateDesc",
  });
  const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, {
    headers: { "User-Agent": "CuentaPublica/1.0 (documentary monitoring)" },
  });
  if (!response.ok) throw new Error(`GDELT ${response.status}`);
  const data = (await response.json()) as { articles?: Array<Record<string, unknown>> };
  return (data.articles ?? []).flatMap((article) => {
    try {
      const url = String(article.url ?? "");
      const hostname = new URL(url).hostname;
      const title = String(article.title ?? "Sin título");
      if (!allowed(hostname) || !/abelardo|espriella/i.test(title)) return [];
      return [{
        id: idFor(url),
        title,
        source: String(article.domain ?? hostname.replace(/^www\./, "")),
        url,
        publishedAt: gdeltDate(String(article.seendate ?? "")),
        kind: official(hostname) ? "Fuente primaria" as const : "Cobertura periodística" as const,
      }];
    } catch { return []; }
  });
}

export async function GET() {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    const items = apiKey ? await fromNewsApi(apiKey) : await fromGdelt();
    const unique = Array.from(new Map(items.map((item) => [item.url, item])).values()).slice(0, 12);
    return NextResponse.json(
      { items: unique, updatedAt: new Date().toISOString(), provider: apiKey ? "NewsAPI" : "GDELT" },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    console.error("news-monitor", error);
    return NextResponse.json(
      { items: [], updatedAt: new Date().toISOString(), provider: "unavailable" },
      { headers: { "Cache-Control": "public, s-maxage=900" } },
    );
  }
}
