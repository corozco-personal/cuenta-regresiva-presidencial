"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
type Item = { id:string; title:string; source:string; url:string; publishedAt:string; category:string; scope:string; stage:string; evidenceLevel:string };
export default function TopicDossiers() {
  const [items,setItems]=useState<Item[]>([]); const [query,setQuery]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch("/api/noticias-v2").then(r=>r.json()).then(d=>setItems(d.items??[])).finally(()=>setLoading(false));},[]);
  const groups=useMemo(()=>Object.entries(items.filter(i=>`${i.title} ${i.category} ${i.source}`.toLowerCase().includes(query.toLowerCase())).reduce<Record<string,Item[]>>((a,i)=>{(a[i.category]??=[]).push(i);return a;},{})).sort((a,b)=>b[1].length-a[1].length),[items,query]);
  if(loading)return <p className="news-message">Construyendo expedientes desde el archivo…</p>;
  return <><label className="dossier-search"><Search size={18}/><span className="sr-only">Buscar tema</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar tema, fuente o titular"/></label><div className="dossier-grid">{groups.map(([category,news])=><article key={category}><header><span>{news.length} registros</span><h2>{category}</h2><p>{new Set(news.map(i=>i.source)).size} fuentes · {news.filter(i=>i.scope==="Nacional").length} nacionales · {news.filter(i=>i.scope==="Internacional").length} internacionales</p></header><div>{news.slice(0,5).map(i=><a key={i.id} href={i.url} target="_blank" rel="noreferrer"><small>{new Intl.DateTimeFormat("es-CO",{dateStyle:"medium"}).format(new Date(i.publishedAt))} · {i.source}</small><strong>{i.title}</strong><span>{i.stage} · {i.evidenceLevel}<ExternalLink size={13}/></span></a>)}</div></article>)}</div></>;
}
