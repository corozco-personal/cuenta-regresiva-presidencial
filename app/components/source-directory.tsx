"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";

type Source = { domain: string; label: string; kind: string; criterion: string; country: string; region: string };

export default function SourceDirectory() {
  const [sources, setSources] = useState<Source[]>([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void fetch("/api/noticias").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => {
      setSources(Array.isArray(data.sourceDirectory) ? data.sourceDirectory : []);
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es");
    return sources.filter((source) => !term || `${source.label} ${source.domain} ${source.country} ${source.region}`.toLocaleLowerCase("es").includes(term));
  }, [query, sources]);

  return <div><label className="search-box source-page-search"><Search size={18} /><span className="sr-only">Buscar fuente, país o región</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar fuente, país o región" /></label>{state === "loading" && <p className="empty-stream">Cargando el directorio…</p>}{state === "error" && <p className="empty-stream">El directorio no está disponible temporalmente.</p>}{state === "ready" && <><p className="source-page-count">{filtered.length} fuentes encontradas</p><div className="subpage-links">{filtered.map((source) => <article key={source.domain}><small>{source.country} · {source.region}</small><h2>{source.label}</h2><p>{source.kind}. {source.criterion}</p><a href={`https://${source.domain}`} target="_blank" rel="noreferrer">{source.domain}<ExternalLink size={14} /></a></article>)}</div></>}</div>;
}
