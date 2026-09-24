"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, ListFilter, UsersRound } from "lucide-react";
import { accountabilitySources, cabinetRegistry } from "../data/government-accountability";

type Item = { id:string; title:string; source:string; url:string; publishedAt:string; category:string; kind:string; evidenceLevel:string; scope:string };

function classify(item: Item) {
  const text = `${item.title} ${item.category}`;
  if (/consejo de sabios|consejo asesor|asesor para|reuni(?:ó|o)n|banco de talentos|headhunter/i.test(text)) return "Consejos y reuniones";
  if (/contrat(?:a|ación)|banco de talentos|headhunter|\bhiring\b/i.test(text)) return "Contratación";
  return "Nombramientos";
}

export default function AppointmentsMonitor() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  useEffect(() => { fetch("/api/noticias-v2").then((response) => response.json()).then((data) => setItems((data.items ?? []).filter((item: Item) => /nombr(?:a|amiento)|design(?:a|ación)|posesiona|contrat(?:a|ación)|consejo de sabios|consejo asesor|asesor para|banco de talentos|headhunter|definición de su gabinete|\btaps\b|\bappoints?\b|\bhiring\b/i.test(`${item.title} ${item.category}`)))).finally(() => setLoading(false)); }, []);
  const groups = useMemo(() => ["Nombramientos", "Contratación", "Consejos y reuniones"].map((name) => ({ name, count: items.filter((item) => classify(item) === name).length })), [items]);
  const visible = useMemo(() => filter === "Todos" ? items : items.filter((item) => classify(item) === filter), [filter, items]);
  return <>
    <section className="cabinet-register"><header><div><p className="section-kicker">REGISTRO ESTRUCTURADO</p><h2>Altos cargos confirmados</h2><p>Personas, cargos, fechas y respaldo documental. Las noticias funcionan como contexto, no como sustituto del acto de nombramiento.</p></div><UsersRound /></header><div>{cabinetRegistry.map((official) => <article key={official.id}><small>{official.entity}</small><h3>{official.person}</h3><strong>{official.office}</strong><dl><div><dt>Inicio</dt><dd>{new Date(`${official.startedAt}T12:00:00-05:00`).toLocaleDateString("es-CO", { dateStyle: "medium" })}</dd></div><div><dt>Estado</dt><dd>{official.status}</dd></div><div><dt>Base</dt><dd>{official.basis}</dd></div></dl><p>{official.disclosure}</p><a href={official.source} target="_blank" rel="noreferrer">Ver respaldo <ArrowUpRight /></a></article>)}</div><nav><a href={accountabilitySources.appointments} target="_blank" rel="noreferrer">Actos de nombramiento <ArrowUpRight /></a><a href={accountabilitySources.sigep} target="_blank" rel="noreferrer">Directorio SIGEP <ArrowUpRight /></a></nav></section>
    <div className="appointments-principle"><UsersRound /><div><strong>Cobertura relacionada</strong><p>Reuniones, nombramientos y contrataciones detectados en fuentes monitoreadas. Una mención no prueba posesión, relación contractual, irregularidad ni conflicto de interés.</p></div></div>
    <div className="appointment-categories"><button className={filter === "Todos" ? "active" : ""} onClick={() => setFilter("Todos")}><ListFilter size={16} /><strong>{items.length}</strong><span>Todos</span></button>{groups.map((group) => <button className={filter === group.name ? "active" : ""} onClick={() => setFilter(group.name)} key={group.name}><ListFilter size={16} /><strong>{group.count}</strong><span>{group.name}</span></button>)}</div>
    {loading ? <p className="news-message">Consultando cobertura relacionada…</p> : <div className="appointments-list">{visible.length ? visible.map((item) => <article key={item.id}><time>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(item.publishedAt))}</time><div><span>{classify(item)} · {item.scope}</span><h2>{item.title}</h2><p>{item.evidenceLevel} · {item.kind}</p><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ExternalLink size={13} /></a></div></article>) : <div className="empty-state"><strong>Sin registros suficientemente documentados.</strong><p>Los hallazgos aparecerán cuando una fuente trazable publique el acto, la reunión o la contratación.</p></div>}</div>}
  </>;
}
