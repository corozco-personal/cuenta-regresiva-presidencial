"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BellRing, Check, FileText, History, Share2 } from "lucide-react";
import { campaignPromises } from "../data/campaign-promises";
import ShareOptions from "./share-options";

type NewsItem = { id: string; title: string; source: string; url: string; publishedAt: string; category: string; scope: string; kind?: string; evidenceLevel: string; decisionReason: string; sources?: Array<{ source: string }> };
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

  const latestByScope = useMemo(() => {
    const sorted = [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    return {
      Nacional: sorted.filter((item) => item.scope === "Nacional").slice(0, 3),
      Internacional: sorted.filter((item) => item.scope === "Internacional").slice(0, 3),
    };
  }, [items]);
  const latest = [...latestByScope.Nacional, ...latestByScope.Internacional];
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
    <div className="briefing-columns">
      {(["Nacional", "Internacional"] as const).map((scope) => <section className="briefing-column" key={scope} aria-labelledby={`briefing-${scope.toLowerCase()}`}><header><span>{scope === "Nacional" ? "CO" : "INT"}</span><div><h3 id={`briefing-${scope.toLowerCase()}`}>{scope}</h3><p>{scope === "Nacional" ? "Entidades y medios colombianos" : "Cobertura publicada fuera de Colombia"}</p></div></header><div className="briefing-list briefing-card-list">{latestByScope[scope].length ? latestByScope[scope].map((item) => <article className="news-card briefing-news-card" id={`resumen-${item.id}`} key={item.id}>
        <div className="news-card-top"><span>{item.source}</span><span>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.publishedAt))}</span></div>
        <div className="decision-row"><span className="decision">Resumen verificado</span><span>{item.category}</span></div>
        <h3>{item.title}</h3><p className="decision-reason"><strong>{evidenceLabel(item)}.</strong> {item.decisionReason}</p>
        <div className="news-card-bottom"><span>{item.kind ?? "Cobertura periodística"}</span><div><ShareOptions title={item.title} url={`/#resumen-${item.id}`} context="news" /><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir fuente original de ${item.title}`}><ArrowUpRight size={17} /></a></div></div>
      </article>) : <p className="news-message">Sin novedades recientes en esta categoría.</p>}</div></section>)}
    </div>
    {updatedAt && <p className="briefing-updated">Última consulta: {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}.</p>}
  </section>;
}
