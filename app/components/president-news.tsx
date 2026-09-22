"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, Globe2, Search } from "lucide-react";
import ShareOptions from "./share-options";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  scope: "Nacional" | "Internacional";
  stage: "Campaña" | "Transición" | "Presidencia";
  category: string;
  evidenceLevel: string;
  processStatus: string;
};

export default function PresidentNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("Todas");
  const [scope, setScope] = useState("Todos");
  const [category, setCategory] = useState("Todos");
  const [limit, setLimit] = useState(18);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/noticias-v2")
      .then((response) => {
        if (!response.ok) throw new Error("No disponible");
        return response.json();
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setUpdatedAt(data.updatedAt ?? null);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort((a, b) => a.localeCompare(b, "es")),
    [items],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return items.filter((item) => {
      const text = `${item.title} ${item.source} ${item.category}`.toLocaleLowerCase("es");
      return (stage === "Todas" || item.stage === stage)
        && (scope === "Todos" || item.scope === scope)
        && (category === "Todos" || item.category === category)
        && (!needle || text.includes(needle));
    });
  }, [items, query, stage, scope, category]);

  function resetLimit() { setLimit(18); }

  return (
    <section className="president-news" aria-labelledby="president-news-title">
      <div className="president-section-heading">
        <div><p className="section-kicker">HEMEROTECA EN ACTUALIZACIÓN</p><h2 id="president-news-title">Todas las noticias alrededor del presidente</h2></div>
        <p>El sistema reúne cobertura nacional e internacional desde el inicio de la campaña. La presencia de una noticia indica relevancia documental, no aprobación de su contenido.</p>
      </div>

      <div className="president-news-filters" role="search">
        <label className="president-news-search"><Search size={18} /><span className="sr-only">Buscar noticia</span><input value={query} onChange={(event) => { setQuery(event.target.value); resetLimit(); }} placeholder="Buscar titular, medio o tema" /></label>
        <label><span>Etapa</span><select value={stage} onChange={(event) => { setStage(event.target.value); resetLimit(); }}><option>Todas</option><option>Campaña</option><option>Transición</option><option>Presidencia</option></select></label>
        <label><span>Alcance</span><select value={scope} onChange={(event) => { setScope(event.target.value); resetLimit(); }}><option>Todos</option><option>Nacional</option><option>Internacional</option></select></label>
        <label><span>Tema</span><select value={category} onChange={(event) => { setCategory(event.target.value); resetLimit(); }}><option>Todos</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      {state === "loading" && <p className="president-news-state">Consultando la hemeroteca…</p>}
      {state === "error" && <p className="president-news-state">La hemeroteca no está disponible temporalmente. Las fuentes documentales de esta página siguen accesibles.</p>}
      {state === "ready" && (
        <>
          <div className="president-news-count"><strong>{filtered.length}</strong><span>resultados</span><span>·</span><span>{filtered.filter((item) => item.scope === "Nacional").length} nacionales</span><span>·</span><span>{filtered.filter((item) => item.scope === "Internacional").length} internacionales</span></div>
          {filtered.length ? (
            <div className="president-news-grid">
              {filtered.slice(0, limit).map((item) => (
                <article key={item.id} id={`noticia-${item.id}`}>
                  <div className="president-news-meta"><span>{item.stage}</span><span>{item.scope}</span><time>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</time></div>
                  <h3>{item.title}</h3>
                  <div className="president-news-tags"><span>{item.category}</span><span>{item.evidenceLevel}</span><span>{item.processStatus}</span></div>
                  <div className="president-news-actions">
                    <a href={item.url} target="_blank" rel="noreferrer"><span>{item.source}</span><ArrowUpRight size={16} /></a>
                    <ShareOptions title={item.title} url={`/presidente#noticia-${item.id}`} context="news" />
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="president-news-state">No hay noticias que coincidan con estos filtros.</p>}
          {filtered.length > limit && <button className="president-news-more" onClick={() => setLimit((current) => current + 18)}><ChevronDown size={17} /> Mostrar más noticias</button>}
          {updatedAt && <p className="president-news-updated"><Globe2 size={15} /> Última consulta: {new Date(updatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}.</p>}
        </>
      )}
    </section>
  );
}
