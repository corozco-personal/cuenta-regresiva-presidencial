"use client";

import { RadioTower } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getMediaProfile } from "../data/media-transparency";

type Item = { source: string; url: string; scope: "Nacional" | "Internacional"; kind: string; sources?: Array<{ source: string; url: string; kind: string }> };
type Row = { source: string; count: number; scope: string; bias: string; documented: boolean };

export default function MediaPublicationRadar() {
  const [items, setItems] = useState<Item[]>([]);
  const [scope, setScope] = useState("Todos");
  useEffect(() => { void fetch("/api/noticias-v2").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setItems(data.items ?? [])).catch(() => undefined); }, []);
  const rows = useMemo(() => {
    const unique = new Map<string, { source: string; scope: string; kind: string }>();
    items.forEach((item) => {
      const entries = item.sources?.length ? item.sources : [{ source: item.source, url: item.url, kind: item.kind }];
      entries.forEach((entry) => unique.set(entry.url, { source: entry.source, scope: item.scope, kind: entry.kind }));
    });
    const grouped = new Map<string, Row>();
    unique.forEach((entry) => {
      const key = `${entry.scope}:${entry.source.toLocaleLowerCase("es")}`;
      const profile = getMediaProfile(entry.source, entry.kind);
      const current = grouped.get(key);
      grouped.set(key, { source: entry.source, scope: entry.scope, count: (current?.count ?? 0) + 1, bias: profile.bias === "Sin datos" ? "Sin clasificar" : profile.bias, documented: Boolean(profile.ratingSource) });
    });
    return [...grouped.values()].filter((row) => scope === "Todos" || row.scope === scope).sort((a, b) => b.count - a.count).slice(0, 20);
  }, [items, scope]);
  const max = Math.max(1, ...rows.map((row) => row.count));
  return <section className="media-radar" aria-labelledby="media-radar-title">
    <div className="analytics-section-title"><div><p className="section-kicker">RADAR DE MEDIOS</p><h2 id="media-radar-title">Quién publica más y cómo se clasifica</h2></div><RadioTower size={28} /></div>
    <div className="media-radar-controls" aria-label="Filtrar alcance">{["Todos", "Nacional", "Internacional"].map((value) => <button key={value} className={scope === value ? "active" : ""} onClick={() => setScope(value)}>{value}</button>)}</div>
    <div className="media-radar-table"><div className="media-radar-head"><span>Medio</span><span>Publicaciones</span><span>Inclinación</span></div>{rows.map((row) => <div className="media-radar-row" key={`${row.scope}-${row.source}`}><div><strong>{row.source}</strong><small>{row.scope}</small></div><div className="media-volume"><i style={{ width: `${Math.max(5, row.count / max * 100)}%` }} /><strong>{row.count}</strong></div><span className={`media-bias${row.documented ? " is-documented" : ""}`}>{row.bias}</span></div>)}</div>
    <p className="analytics-privacy">La inclinación solo aparece cuando existe una evaluación externa enlazada en la metodología del comparador. “Sin clasificar” evita inferir una orientación política por el tono o volumen de noticias.</p>
  </section>;
}
