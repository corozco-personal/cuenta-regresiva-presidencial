"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, RefreshCw, Scale } from "lucide-react";

type Data = { updatedAt: string; composition: { senate: number; house: number; period: string }; items: Array<{ id: string; source: string; title: string; summary: string; url: string; publishedAt: string }>; sources: Array<{ label: string; url: string }> };

export default function CongressDashboard() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { void fetch("/api/congreso").then((response) => response.ok ? response.json() : Promise.reject()).then(setData).catch(() => undefined); }, []);
  if (!data) return <p className="news-message">Consultando fuentes legislativas oficiales…</p>;
  return <>
    <div className="congress-composition"><article><Building2 /><span>Senado</span><strong>{data.composition.senate}</strong><p>103 curules: 100 ordinarias, 2 indígenas y 1 del Estatuto de Oposición.</p></article><article><Scale /><span>Cámara de Representantes</span><strong>{data.composition.house}</strong><p>Representantes elegidos para el periodo constitucional {data.composition.period}.</p></article></div>
    <div className="congress-source-links">{data.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14} /></a>)}</div>
    <div className="legislative-heading"><div><p className="section-kicker">ACTUALIZACIÓN DIARIA</p><h2>Proyectos y actividad legislativa</h2><p>Resumen de publicaciones institucionales. Cada elemento conserva el enlace original; no sustituye el estado procesal registrado por el Congreso.</p></div><span><RefreshCw size={14} /> {new Date(data.updatedAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}</span></div>
    <div className="legislative-grid">{data.items.map((item) => <article key={item.id}><div><span>{item.source}</span><time>{new Date(item.publishedAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}</time></div><h3>{item.title}</h3><p>{item.summary || "Consulta la publicación institucional para conocer el objeto, los autores y el estado del trámite."}</p><a href={item.url} target="_blank" rel="noreferrer">Ver publicación oficial<ArrowUpRight size={14} /></a></article>)}</div>
  </>;
}
