"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileDown, RefreshCw } from "lucide-react";

type Item = { id: string; title: string; source: string; url: string; publishedAt: string; scope: string; category: string; stage: string; sources: Array<{ source: string; url: string }> };

export default function NewsDigest() {
  const [items, setItems] = useState<Item[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { fetch("/api/noticias-v2").then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data) => { setItems(data.items ?? []); setUpdatedAt(data.updatedAt ?? null); setState("ready"); }).catch(() => setState("error")); }, []);
  const recent = useMemo(() => { const newest = Math.max(...items.map((item) => Date.parse(item.publishedAt)), 0); return items.filter((item) => Date.parse(item.publishedAt) >= newest - 7 * 86_400_000); }, [items]);
  const categories = useMemo(() => Array.from(new Map(recent.map((item) => [item.category, recent.filter((candidate) => candidate.category === item.category).length])).entries()).sort((a, b) => b[1] - a[1]), [recent]);

  function download() {
    const text = [`RESUMEN SEMANAL · CUENTA PÚBLICA`, `Generado: ${new Date().toLocaleString("es-CO")}`, "", ...recent.map((item) => `${new Date(item.publishedAt).toLocaleDateString("es-CO")} · ${item.scope}\n${item.title}\n${item.source}: ${item.url}\n`) ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "cuenta-publica-resumen-semanal.txt"; link.click(); URL.revokeObjectURL(url);
  }
  if (state === "loading") return <p className="digest-state">Preparando el resumen con la última actualización…</p>;
  if (state === "error") return <p className="digest-state"><RefreshCw size={17} /> El resumen no está disponible temporalmente.</p>;
  return <>
    <section className="digest-summary"><article><strong>{recent.length}</strong><span>hechos reunidos</span></article><article><strong>{recent.filter((item) => item.scope === "Nacional").length}</strong><span>nacionales</span></article><article><strong>{recent.filter((item) => item.scope === "Internacional").length}</strong><span>internacionales</span></article><article><strong>{new Set(recent.flatMap((item) => item.sources?.map((source) => source.source) ?? [item.source])).size}</strong><span>fuentes distintas</span></article></section>
    <div className="digest-actions"><p>Ventana móvil de siete días respecto del hallazgo más reciente. {updatedAt && <>Datos consultados el {new Date(updatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}.</>}</p><button onClick={download}><FileDown size={17} /> Descargar resumen</button></div>
    <section className="digest-topics"><div><p className="section-kicker">TEMAS DE LA SEMANA</p><h2>Qué concentró la cobertura</h2></div><ol>{categories.slice(0, 5).map(([category, count]) => <li key={category}><span>{category}</span><strong>{count}</strong></li>)}</ol></section>
    <section className="digest-list">{recent.length ? recent.map((item) => <article key={item.id}><div><span>{item.scope} · {item.stage}</span><time>{new Date(item.publishedAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}</time></div><h2>{item.title}</h2><p>{item.sources?.length > 1 ? `${item.sources.length} coberturas agrupadas` : item.source}</p><a href={item.url} target="_blank" rel="noreferrer">Consultar fuente <ArrowUpRight size={15} /></a></article>) : <p className="digest-state">No hay registros en la ventana semanal actual.</p>}</section>
  </>;
}
