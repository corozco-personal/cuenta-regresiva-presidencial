"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileSearch2, Globe2, Info, Layers3, Scale, Share2 } from "lucide-react";
import { biasGroup, getMediaProfile } from "../data/media-transparency";
import { analyzeHeadlineFrame, contrastLevel, headlineDistance } from "../data/coverage-methodology";

type Source = { source: string; title?: string; url: string; kind: string };
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

function ContrastMatrix({ item }: { item: Item }) {
  const owners = new Set(item.sources.map(source => getMediaProfile(source.source, source.kind).owner).filter(owner => !owner.startsWith("Sin información")));
  const titles = item.sources.map(source => source.title || item.title);
  const distances = titles.flatMap((title, index) => titles.slice(index + 1).map(other => headlineDistance(title, other)));
  const diversity = distances.length ? distances.reduce((sum, value) => sum + value, 0) / distances.length : 0;
  const result = contrastLevel({ sourceCount: item.sources.length, ownerCount: owners.size, hasPrimarySource: item.sources.some(source => /fuente primaria|entidad oficial/i.test(source.kind)), headlineDiversity: diversity });
  return <section className="contrast-matrix" aria-label="Matriz de contraste de la cobertura">
    <header><div><Scale size={18} /><strong>{result.label}</strong></div><span>{result.met}/{result.total} criterios observables</span></header>
    <div><article><strong>{item.sources.length}</strong><span>fuentes</span></article><article><strong>{owners.size || "—"}</strong><span>propietarios documentados</span></article><article><strong>{Math.round(diversity * 100)}%</strong><span>distancia entre titulares</span></article><article><strong>{item.sources.some(source => /fuente primaria|entidad oficial/i.test(source.kind)) ? "Sí" : "No"}</strong><span>fuente primaria</span></article></div>
    <p>Describe la amplitud de la cobertura disponible; no es una puntuación de verdad, calidad o afinidad política.</p>
  </section>;
}

export default function CoverageComparator() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("Cargando comparaciones…");
  const [limit, setLimit] = useState(18);
  useEffect(() => { fetch("/api/noticias-v2?comparison=entman-v1").then(r => r.json()).then(d => { setItems(d.items ?? []); setStatus(""); }).catch(() => setStatus("No fue posible cargar el comparador.")); }, []);
  const grouped = useMemo(() => [...items].sort((a, b) => (b.sources?.length ?? 0) - (a.sources?.length ?? 0)), [items]);
  async function share(item: Item) { const url = `${location.origin}/comparador#comparacion-${item.id}`; if (navigator.share) await navigator.share({ title: item.title, url }); else await navigator.clipboard.writeText(url); }
  if (status) return <p className="news-message">{status}</p>;
  return <>
    <div className="comparison-intro"><Layers3 /><p><strong>Comparación reproducible en dos niveles.</strong> El contexto del medio conserva calificaciones externas; cada titular se analiza por señales observables con el marco general de Entman y la transparencia se organiza con criterios de The Trust Project. La ausencia de datos nunca se rellena mediante inteligencia artificial.</p></div>
    <div className="rating-method-grid">
      <article><span>01</span><strong>Agrupación</strong><p>Coincidencia temática, cercanía temporal y similitud léxica reúnen coberturas del mismo hecho.</p></article>
      <article><span>02</span><strong>Encuadre</strong><p>Entman: definición del problema, atribución causal, evaluación y respuesta propuesta.</p></article>
      <article><span>03</span><strong>Transparencia</strong><p>Tipo de fuente, referencias, propiedad y rendición de cuentas según indicadores observables.</p></article>
      <article><span>04</span><strong>Contexto externo</strong><p>Orientación y factualidad solo cuando una evaluación independiente documentada está disponible.</p></article>
    </div>
    <p className="rating-disclaimer">La matriz nunca convierte el encuadre en una etiqueta ideológica. La orientación usa categorías externas traducidas: “Lean Left/Right” se presenta como “Centro izquierda/derecha”. <a href="https://onlinelibrary.wiley.com/doi/10.1111/j.1460-2466.1993.tb01304.x" target="_blank" rel="noreferrer">Entman <ExternalLink size={13} /></a> · <a href="https://thetrustproject.org/" target="_blank" rel="noreferrer">The Trust Project <ExternalLink size={13} /></a> · <a href="https://ground.news/rating-system" target="_blank" rel="noreferrer">Ground News <ExternalLink size={13} /></a></p>
    <div className="comparison-result-count"><strong>{grouped.length}</strong> historias analizadas · mostrando {Math.min(limit, grouped.length)}</div>
    <div className="comparison-list">{grouped.length ? grouped.slice(0, limit).map(item => <article id={`comparacion-${item.id}`} key={item.id}>
      <header><div><span>{item.category}</span><h2>{item.title}</h2></div><button onClick={() => share(item)} aria-label="Compartir comparación"><Share2 size={17} /></button></header>
      <div className="comparison-summary"><span><Globe2 size={15} />{item.sources.length} {item.sources.length === 1 ? "fuente" : "fuentes"}</span><span>{item.evidenceLevel}</span><span>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.publishedAt))}</span></div>
      <ContrastMatrix item={item} />
      <PerspectiveBar sources={item.sources} />
      <div className="comparison-sources">{item.sources.map(source => { const profile = getMediaProfile(source.source, source.kind); const frame = analyzeHeadlineFrame(source.title || item.title); return <article key={source.url} className="source-rating-card">
        <small>{source.kind}</small><strong>{source.source}</strong>
        <blockquote><FileSearch2 size={14} />{source.title || item.title}</blockquote>
        <div className="frame-tags" aria-label="Encuadre observable del titular"><span>{frame.label}</span>{frame.dimensions.map(dimension => <span key={dimension}>{dimension}</span>)}</div>
        <dl><div><dt>Orientación</dt><dd>{profile.bias}</dd></div><div><dt>Factualidad</dt><dd>{profile.factuality}</dd></div><div><dt>Propiedad</dt><dd>{profile.ownership}</dd></div><div><dt>Entidad</dt><dd>{profile.owner}</dd></div></dl>
        {profile.note && <p>{profile.note}</p>}
        <div className="source-rating-links"><a href={source.url} target="_blank" rel="noreferrer">Abrir cobertura <ExternalLink size={13} /></a>{profile.ratingSource && <a href={profile.ratingSource} target="_blank" rel="noreferrer">Ver calificación</a>}{profile.ownershipSource && <a href={profile.ownershipSource} target="_blank" rel="noreferrer">Ver propiedad</a>}</div>
      </article>; })}</div>
    </article>) : <p className="empty-state">No hay coberturas disponibles para comparar.</p>}</div>
    {grouped.length > limit && <button className="comparison-more" onClick={() => setLimit(value => value + 18)}>Ver 18 historias más</button>}
  </>;
}
