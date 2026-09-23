"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import { campaignPromises } from "../data/campaign-promises";
import { navigationGroups } from "../data/navigation";
import { clientPlainText } from "../data/client-input";

type NewsItem = { id: string; title: string; source: string; url: string; publishedAt: string; category: string; scope: string; stage: string; evidenceLevel: string };

export default function GlobalSearch() {
  const [query, setQuery] = useState(""); const [items, setItems] = useState<NewsItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/noticias-v2").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setItems(data.items ?? [])).finally(() => setLoading(false)); }, []);
  const needle = query.trim().toLocaleLowerCase("es");
  const results = useMemo(() => {
    if (needle.length < 2) return { news: [], promises: [], pages: [] };
    return {
      news: items.filter((item) => `${item.title} ${item.source} ${item.category} ${item.stage}`.toLocaleLowerCase("es").includes(needle)).slice(0, 30),
      promises: campaignPromises.filter((item) => `${item.title} ${item.category} ${item.originalPromise} ${item.assessment}`.toLocaleLowerCase("es").includes(needle)),
      pages: navigationGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title }))).filter((item) => `${item.label} ${item.group}`.toLocaleLowerCase("es").includes(needle)),
    };
  }, [items, needle]);
  const total = results.news.length + results.promises.length + results.pages.length;
  return <>
    <label className="global-search-box"><Search size={22} /><span className="sr-only">Buscar en todo el portal</span><input autoFocus value={query} maxLength={120} onChange={(event) => setQuery(clientPlainText(event.target.value))} placeholder="Buscar persona, institución, promesa, tema o fuente" /></label>
    {needle.length < 2 ? <p className="search-guidance">Escribe al menos dos caracteres. La búsqueda consulta páginas, promesas y noticias monitoreadas.</p> : <p className="search-guidance"><strong>{total}</strong> resultados encontrados{loading ? " · consultando noticias…" : ""}.</p>}
    {results.promises.length > 0 && <section className="search-result-section"><h2>Promesas</h2>{results.promises.map((item) => <a href={`/promesas#promesa-${item.id}`} key={item.id}><FileText /><span><small>{item.category} · {item.status}</small><strong>{item.title}</strong><p>{item.assessment}</p></span><ArrowUpRight /></a>)}</section>}
    {results.news.length > 0 && <section className="search-result-section"><h2>Noticias y documentos</h2>{results.news.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.id}><FileText /><span><small>{item.scope} · {item.category} · {item.source}</small><strong>{item.title}</strong><p>{item.evidenceLevel} · {item.stage}</p></span><ArrowUpRight /></a>)}</section>}
    {results.pages.length > 0 && <section className="search-result-section"><h2>Secciones</h2>{results.pages.map((item) => <a href={item.href} key={`${item.group}-${item.href}`}><Search /><span><small>{item.group}</small><strong>{item.label}</strong></span><ArrowUpRight /></a>)}</section>}
    {needle.length >= 2 && !loading && total === 0 && <div className="search-empty"><Search /><h2>Sin coincidencias</h2><p>Prueba con el nombre de una institución, un medio, una política pública o una palabra de la promesa.</p></div>}
  </>;
}
