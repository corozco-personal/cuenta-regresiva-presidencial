"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleHelp, Clock3, ExternalLink, Search } from "lucide-react";
import { campaignPromises, promiseStatusDefinition, type PromiseStatus } from "../data/campaign-promises";

const statuses: Array<"Todos" | PromiseStatus> = ["Todos", "Cumplida", "En ejecución", "Pendiente", "Vencida", "Incumplida", "Sin evidencia suficiente"];

export default function PromiseExplorer() {
  const [status, setStatus] = useState<(typeof statuses)[number]>("Todos");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return campaignPromises.filter((promise) => (status === "Todos" || promise.status === status)
      && (!needle || `${promise.title} ${promise.category} ${promise.originalPromise}`.toLocaleLowerCase("es").includes(needle)));
  }, [query, status]);

  return <>
    <section className="promise-metrics" aria-label="Resumen de promesas">
      <article><strong>{campaignPromises.length}</strong><span>promesas documentadas</span></article>
      <article><strong>{campaignPromises.filter((item) => item.status === "Cumplida").length}</strong><span>cumplidas</span></article>
      <article><strong>{campaignPromises.filter((item) => item.status === "En ejecución").length}</strong><span>en ejecución</span></article>
      <article><strong>{campaignPromises.filter((item) => ["Pendiente", "Sin evidencia suficiente"].includes(item.status)).length}</strong><span>por comprobar</span></article>
    </section>
    <section className="promise-method-note">
      <CircleHelp size={20} /><p><strong>La unidad de análisis es la promesa, no el anuncio.</strong> Un acto de gobierno puede ser evidencia de ejecución sin demostrar todavía el resultado prometido.</p>
    </section>
    <section className="promise-toolbar" aria-label="Filtrar promesas">
      <label><Search size={17} /><span className="sr-only">Buscar promesa</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar promesa o tema" /></label>
      <label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
    <section className="promise-catalog">
      {filtered.map((promise) => <article key={promise.id} id={promise.id}>
        <div className="promise-card-head"><span>{promise.category}</span><span className={`promise-status status-${promise.status.toLocaleLowerCase("es").replaceAll(" ", "-")}`}>{promise.status === "Cumplida" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}{promise.status}</span></div>
        <h2>{promise.title}</h2>
        <blockquote><span>Promesa original</span>{promise.originalPromise}</blockquote>
        <div className="promise-progress"><div><span>Avance documental</span><strong>{promise.progress} %</strong></div><div className="promise-progress-track"><i style={{ width: `${promise.progress}%` }} /></div></div>
        <p>{promise.assessment}</p>
        <dl><div><dt>Plazo</dt><dd>{promise.deadline}</dd></div><div><dt>Última revisión</dt><dd>{new Date(`${promise.lastReviewed}T12:00:00-05:00`).toLocaleDateString("es-CO", { dateStyle: "medium" })}</dd></div></dl>
        <details><summary>Evidencia y fuente de la promesa</summary><div className="promise-evidence"><a href={promise.campaignSource.url} target="_blank" rel="noreferrer"><span>Promesa · {promise.campaignSource.label}</span><ExternalLink size={14} /></a>{promise.evidence.length ? promise.evidence.map((evidence) => <a key={evidence.url} href={evidence.url} target="_blank" rel="noreferrer"><span>{evidence.kind} · {evidence.label}</span><ExternalLink size={14} /></a>) : <p>No hay evidencia de ejecución admitida en la revisión actual.</p>}</div></details>
      </article>)}
      {!filtered.length && <p className="promise-empty">No hay promesas que coincidan con este filtro.</p>}
    </section>
    <section className="promise-legend"><h2>Qué significa cada estado</h2><div>{Object.entries(promiseStatusDefinition).map(([label, definition]) => <article key={label}><strong>{label}</strong><p>{definition}</p></article>)}</div></section>
  </>;
}
