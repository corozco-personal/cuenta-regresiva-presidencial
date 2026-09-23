"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BellRing, Check, FileText, History, Share2 } from "lucide-react";
import { campaignPromises } from "../data/campaign-promises";

type NewsItem = { id: string; title: string; source: string; url: string; publishedAt: string; category: string; scope: string; evidenceLevel: string; decisionReason: string; sources?: Array<{ source: string }> };
const LAST_VISIT = "cuenta-publica-last-visit";

function evidenceLabel(item: NewsItem) {
  if (item.evidenceLevel === "Documento oficial") return "Hecho documentado en fuente primaria";
  if ((item.sources?.length ?? 0) > 1) return "Cobertura corroborada por varias fuentes";
  return "Reporte atribuido a una fuente";
}

export default function DailyBriefing() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [previousVisit] = useState<number | null>(() => typeof window === "undefined" ? null : Number(localStorage.getItem(LAST_VISIT) || 0) || null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    localStorage.setItem(LAST_VISIT, String(Date.now()));
    fetch("/api/noticias-v2").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => {
      setItems(Array.isArray(data.items) ? data.items : []); setUpdatedAt(data.updatedAt ?? "");
    }).catch(() => undefined);
  }, []);

  const latest = useMemo(() => [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3), [items]);
  const newItems = previousVisit ? items.filter((item) => Date.parse(item.publishedAt) > previousVisit).length : 0;
  const promiseChanges = previousVisit ? campaignPromises.filter((item) => Date.parse(`${item.lastReviewed}T23:59:59-05:00`) > previousVisit).length : 0;

  async function share() {
    const text = `Cuenta pública: ${latest.length} hechos destacados, ${newItems} noticias nuevas desde mi última visita y seguimiento documentado de ${campaignPromises.length} promesas.`;
    try {
      if (navigator.share) await navigator.share({ title: "El mandato en 60 segundos", text, url: `${location.origin}/#hoy` });
      else await navigator.clipboard.writeText(`${text}\n${location.origin}/#hoy`);
      setShared(true); setTimeout(() => setShared(false), 1800);
    } catch { setShared(false); }
  }

  return <section className="daily-briefing section-shell" id="hoy" aria-labelledby="daily-briefing-title">
    <header className="briefing-heading"><div><p className="section-kicker">HOY / LECTURA RÁPIDA</p><h2 id="daily-briefing-title">El mandato en 60 segundos</h2><p>Los hechos más recientes, su nivel de evidencia y lo que cambió desde tu última visita.</p></div><button onClick={share}>{shared ? <Check size={17} /> : <Share2 size={17} />}{shared ? "Enlace copiado" : "Compartir resumen"}</button></header>
    <div className="briefing-change-strip">
      <article><BellRing /><strong>{previousVisit ? newItems : "—"}</strong><span>{previousVisit ? "noticias nuevas" : "primera visita"}</span></article>
      <article><History /><strong>{previousVisit ? promiseChanges : "—"}</strong><span>promesas revisadas</span></article>
      <article><FileText /><strong>{items.filter((item) => item.evidenceLevel === "Documento oficial").length}</strong><span>fuentes primarias activas</span></article>
      <a href="/resumen">Ver resumen semanal <ArrowUpRight size={15} /></a>
    </div>
    <div className="briefing-list">{latest.length ? latest.map((item, index) => <article key={item.id}>
      <span className="briefing-index">0{index + 1}</span><div><small>{item.scope} · {item.category} · {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.publishedAt))}</small><h3>{item.title}</h3><p><strong>{evidenceLabel(item)}.</strong> {item.decisionReason}</p><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ArrowUpRight size={14} /></a></div>
    </article>) : <p className="news-message">El resumen se completará cuando finalice la consulta más reciente.</p>}</div>
    {updatedAt && <p className="briefing-updated">Última consulta: {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}.</p>}
  </section>;
}
