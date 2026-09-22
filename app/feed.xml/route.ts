import { NextResponse } from "next/server";

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character); }

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let items: Array<{ id: string; title: string; source: string; url: string; publishedAt: string; scope: string; category: string }> = [];
  try { const response = await fetch(`${origin}/api/noticias-v2`, { next: { revalidate: 21600 } }); if (response.ok) items = (await response.json()).items?.slice(0, 50) ?? []; } catch { /* RSS válido aunque el proveedor esté temporalmente caído. */ }
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cuenta pública · Noticias</title><link>${origin}</link><description>Seguimiento documental del presidente de Colombia.</description><language>es-CO</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items.map((item) => `<item><guid isPermaLink="false">${escapeXml(item.id)}</guid><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><description>${escapeXml(`${item.scope} · ${item.category} · ${item.source}`)}</description><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`;
  return new NextResponse(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
