"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe2, Info, Layers3, Share2 } from "lucide-react";
import { biasGroup, getMediaProfile } from "../data/media-transparency";

type Source = { source: string; url: string; kind: string };
type Item = { id: string; title: string; source: string; url: string; publishedAt: string; scope: string; category: string; evidenceLevel: string; sources: Source[] };

function PerspectiveBar({ sources }: { sources: Source[] }) {
  const counts = sources.reduce((acc, source) => {
    acc[biasGroup(getMediaProfile(source.source, source.kind).bias)] += 1;
    return acc;
  }, { left: 0, center: 0, right: 0, unknown: 0 });
  const total = Math.max(1, sources.length);
  const rated = total - counts.unknown;
  const segments = [
    ["left", "Izquierda", counts.left], ["center", "Centro", counts.center],
    ["right", "Derecha", counts.right], ["unknown", "Sin datos", counts.unknown],
  ] as const;
  return <div className="perspective-panel">
    <div className="perspective-heading"><strong>Distribución de perspectivas</strong><span>{rated}/{total} fuentes con calificación externa</span></div>
    <div className="perspective-bar" aria-label="Distribución de orientación de las fuentes">
      {segments.filter(([, , count]) => count > 0).map(([group, label, count]) => <span key={group} className={group} style={{ width: `${count / total * 100}%` }} title={`${label}: ${count}`} />)}
    </div>
    <div className="perspective-legend">{segments.map(([group, label, count]) => <span key={group}><i className={group} />{label} {count}</span>)}</div>
    {rated < 3 && <p><Info size={14} /> No hay suficientes fuentes calificadas para identificar un posible punto ciego de cobertura.</p>}
  </div>;
}

export default function CoverageComparator() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("Cargando comparaciones…");
  const [limit, setLimit] = useState(18);
  useEffect(() => { fetch("/api/noticias-v2").then(r => r.json()).then(d => { setItems(d.items ?? []); setStatus(""); }).catch(() => setStatus("No fue posible cargar el comparador.")); }, []);
  const grouped = useMemo(() => [...items].sort((a, b) => (b.sources?.length ?? 0) - (a.sources?.length ?? 0)), [items]);
  async function share(item: Item) { const url = `${location.origin}/comparador#comparacion-${item.id}`; if (navigator.share) await navigator.share({ title: item.title, url }); else await navigator.clipboard.writeText(url); }
  if (status) return <p className="news-message">{status}</p>;
  return <>
    <div className="comparison-intro"><Layers3 /><p><strong>Perspectiva, factualidad y propiedad con trazabilidad.</strong> Las calificaciones corresponden al medio completo, no certifican cada artículo. Se muestran únicamente cuando existe una evaluación externa documentada; la ausencia de datos nunca se rellena mediante inteligencia artificial.</p></div>
    <div className="rating-method-grid">
      <article><span>01</span><strong>Orientación</strong><p>Promedio publicado por Ground News a partir de AllSides, Ad Fontes Media y Media Bias/Fact Check.</p></article>
      <article><span>02</span><strong>Factualidad</strong><p>Evaluación externa de las prácticas generales del medio: fuentes, contexto y correcciones.</p></article>
      <article><span>03</span><strong>Propiedad</strong><p>Entidad propietaria o financiadora, clasificada con documentación institucional enlazada.</p></article>
    </div>
    <p className="rating-disclaimer">La orientación usa categorías traducidas: “Lean Left/Right” se presenta como “Centro izquierda/derecha”. <a href="https://ground.news/rating-system" target="_blank" rel="noreferrer">Consultar metodología original <ExternalLink size={13} /></a></p>
    <div className="comparison-result-count"><strong>{grouped.length}</strong> historias analizadas · mostrando {Math.min(limit, grouped.length)}</div>
    <div className="comparison-list">{grouped.length ? grouped.slice(0, limit).map(item => <article id={`comparacion-${item.id}`} key={item.id}>
      <header><div><span>{item.category}</span><h2>{item.title}</h2></div><button onClick={() => share(item)} aria-label="Compartir comparación"><Share2 size={17} /></button></header>
      <div className="comparison-summary"><span><Globe2 size={15} />{item.sources.length} {item.sources.length === 1 ? "fuente" : "fuentes"}</span><span>{item.evidenceLevel}</span><span>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.publishedAt))}</span></div>
      <PerspectiveBar sources={item.sources} />
      <div className="comparison-sources">{item.sources.map(source => { const profile = getMediaProfile(source.source, source.kind); return <article key={source.url} className="source-rating-card">
        <small>{source.kind}</small><strong>{source.source}</strong>
        <dl><div><dt>Orientación</dt><dd>{profile.bias}</dd></div><div><dt>Factualidad</dt><dd>{profile.factuality}</dd></div><div><dt>Propiedad</dt><dd>{profile.ownership}</dd></div><div><dt>Entidad</dt><dd>{profile.owner}</dd></div></dl>
        {profile.note && <p>{profile.note}</p>}
        <div className="source-rating-links"><a href={source.url} target="_blank" rel="noreferrer">Abrir cobertura <ExternalLink size={13} /></a>{profile.ratingSource && <a href={profile.ratingSource} target="_blank" rel="noreferrer">Ver calificación</a>}{profile.ownershipSource && <a href={profile.ownershipSource} target="_blank" rel="noreferrer">Ver propiedad</a>}</div>
      </article>; })}</div>
    </article>) : <p className="empty-state">No hay coberturas disponibles para comparar.</p>}</div>
    {grouped.length > limit && <button className="comparison-more" onClick={() => setLimit(value => value + 18)}>Ver 18 historias más</button>}
  </>;
}
