import { getD1 } from "../../../../db";
function csv(rows: Record<string, unknown>[]) { if (!rows.length) return ""; const keys = Object.keys(rows[0]); const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`; return [keys.map(cell).join(","), ...rows.map((row) => keys.map((key) => cell(row[key])).join(","))].join("\n"); }
export async function GET(request: Request) {
  try { const data = await getD1().prepare("SELECT title,source,url,published_at AS publishedAt,scope,kind,category,stage,evidence_level AS evidenceLevel,process_status AS processStatus,country,language,last_seen_at AS lastSeenAt FROM news_articles ORDER BY published_at DESC LIMIT 1000").all<Record<string, unknown>>(); const rows = data.results;
    if (new URL(request.url).searchParams.get("format") === "csv") return new Response(csv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=cuenta-publica-noticias.csv" } });
    return Response.json({ license: "CC BY 4.0", generatedAt: new Date().toISOString(), count: rows.length, data: rows });
  } catch { return Response.json({ error: "Exportación temporalmente no disponible." }, { status: 503 }); }
}
