import { NextResponse } from "next/server";
import { correctionLog } from "../../data/corrections";

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cuenta pública · Correcciones</title><link>${origin}/correcciones</link><description>Correcciones y cambios editoriales relevantes.</description><language>es-CO</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${correctionLog.map((item, index) => `<item><guid isPermaLink="false">correccion-${index}-${escapeXml(item.date)}</guid><title>${escapeXml(item.item)}</title><link>${origin}/correcciones</link><description>${escapeXml(`${item.before} → ${item.after}. ${item.reason}`)}</description></item>`).join("")}</channel></rss>`;
  return new NextResponse(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
