import { NextResponse } from "next/server";
import { campaignPromises } from "../../data/campaign-promises";

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const items = [...campaignPromises].sort((a, b) => b.lastReviewed.localeCompare(a.lastReviewed));
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cuenta pública · Promesas</title><link>${origin}/promesas</link><description>Cambios documentados en el seguimiento de promesas presidenciales.</description><language>es-CO</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items.map(item => `<item><guid isPermaLink="false">promesa-${escapeXml(item.id)}-${escapeXml(item.lastReviewed)}-${escapeXml(item.status)}</guid><title>${escapeXml(`${item.status}: ${item.title}`)}</title><link>${origin}/promesas#promesa-${escapeXml(item.id)}</link><description>${escapeXml(`${item.progress}% · ${item.assessment}`)}</description><pubDate>${new Date(`${item.lastReviewed}T12:00:00-05:00`).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`;
  return new NextResponse(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
