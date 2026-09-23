"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, ChartNoAxesCombined, CircleDollarSign, Clock3, ExternalLink, Landmark, Scale, UsersRound } from "lucide-react";

type Indicator = { id:string; label:string; value:number; unit:string; period:string; frequency:string; comparison?:{label:string;value:number;direction:"up"|"down"|"flat"}; detail:string; source:string; url:string; category:string };
type NewsItem = { id:string; title:string; source:string; url:string; publishedAt:string; category:string; kind:string; evidenceLevel:string; scope:string };
const icons:Record<string,typeof Landmark>={Precios:ChartNoAxesCombined,Empleo:BriefcaseBusiness,Actividad:Landmark,Bienestar:UsersRound,Mercados:CircleDollarSign};
const capacityPattern=/consejo de sabios|consejo asesor|asesores? presidenciales?|banco de talentos|headhunter|talento p[uú]blico|meritocracia/i;

function formatValue(item:Indicator){if(item.unit==="COP/USD")return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:2}).format(item.value);return `${new Intl.NumberFormat("es-CO",{maximumFractionDigits:2}).format(item.value)}${item.unit}`}

export default function CountryContextDashboard(){
  const[data,setData]=useState<{updatedAt:string;indicators:Indicator[];notes:string[];methodology:string}|null>(null);
  const[capacity,setCapacity]=useState<NewsItem[]>([]);
  const[category,setCategory]=useState("Todos");
  useEffect(()=>{Promise.all([fetch("/api/contexto-pais").then(r=>r.json()),fetch("/api/noticias-v2").then(r=>r.json())]).then(([context,news])=>{setData(context);setCapacity((news.items??[]).filter((item:NewsItem)=>capacityPattern.test(`${item.title} ${item.category}`)))}).catch(()=>undefined)},[]);
  const visible=useMemo(()=>data?.indicators.filter(item=>category==="Todos"||item.category===category)??[],[data,category]);
  const officialCapacity=capacity.filter(item=>item.kind==="Fuente primaria");
  if(!data)return <p className="news-message">Consultando los últimos cortes oficiales…</p>;
  return <>
    <section className="economic-dashboard" aria-labelledby="economic-title">
      <header className="economic-heading"><div><p className="section-kicker">TABLERO ECONÓMICO</p><h2 id="economic-title">El país en cifras</h2><p>{data.methodology}</p></div><span><Clock3/>Actualización horaria de fuentes · {new Date(data.updatedAt).toLocaleString("es-CO",{dateStyle:"medium",timeStyle:"short"})}</span></header>
      <nav className="indicator-filters" aria-label="Categorías de indicadores">{["Todos","Precios","Empleo","Actividad","Bienestar","Mercados"].map(item=><button className={category===item?"active":""} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</nav>
      <div className="economic-grid">{visible.map(item=>{const Icon=icons[item.category]??Scale;return <article key={item.id}><div className="economic-card-top"><Icon/><span>{item.category} · {item.frequency}</span></div><h3>{item.label}</h3><strong>{formatValue(item)}</strong><time>{item.period}</time>{item.comparison&&<div className={`economic-comparison is-${item.comparison.direction}`}>{item.comparison.direction==="down"?<ArrowDownRight/>:<ArrowUpRight/>}<span>{item.comparison.label}</span></div>}<p>{item.detail}</p><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink/></a></article>})}</div>
      {data.notes.length>0&&<aside className="indicator-notes">{data.notes.map(note=><p key={note}>{note}</p>)}</aside>}
    </section>
    <section className="capacity-dashboard" aria-labelledby="capacity-title">
      <header><div><p className="section-kicker">CAPACIDAD Y ASESORÍA</p><h2 id="capacity-title">Comité de sabios y banco de talentos</h2><p>Seguimiento documental a su creación, integrantes, reuniones, recomendaciones, nombramientos derivados y resultados. No se presume que una mención equivalga a funcionamiento o efectividad.</p></div><UsersRound/></header>
      <div className="capacity-metrics"><article><span>Hallazgos trazables</span><strong>{capacity.length}</strong><p>Menciones admitidas en fuentes monitoreadas.</p></article><article><span>Fuentes primarias</span><strong>{officialCapacity.length}</strong><p>Actos o publicaciones oficiales detectadas.</p></article><article><span>Resultados verificables</span><strong>{officialCapacity.filter(item=>/recomendaci[oó]n|resultado|informe|designaci[oó]n|nombramiento/i.test(item.title)).length}</strong><p>Decisiones o productos con evidencia oficial.</p></article></div>
      {capacity.length?<div className="capacity-list">{capacity.slice(0,8).map(item=><article key={item.id}><time>{new Intl.DateTimeFormat("es-CO",{dateStyle:"medium"}).format(new Date(item.publishedAt))}</time><div><span>{item.kind} · {item.scope}</span><h3>{item.title}</h3><p>{item.evidenceLevel}</p><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink/></a></div></article>)}</div>:<div className="empty-state capacity-empty"><strong>No hay actos oficiales suficientes para afirmar que estos mecanismos estén operando.</strong><p>El portal mantendrá el contador en cero hasta encontrar documentos trazables; no rellenará el vacío con inferencias.</p></div>}
      <a className="capacity-more" href="/nombramientos">Ver todos los nombramientos, contrataciones y reuniones<ArrowUpRight/></a>
    </section>
  </>;
}
