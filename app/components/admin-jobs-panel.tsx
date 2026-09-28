"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, Play, RefreshCw, XCircle } from "lucide-react";

type Job = { id: string; title: string; cadence: string; description: string; target: string };
type Run = { key: string; label: string; cadence: string; status: string; lastStartedAt?: string | null; lastCompletedAt?: string | null; lastSuccessAt?: string | null; recordCount?: number | null; error?: string | null };
type Data = { generatedAt: string; jobs: Job[]; daily: Run[]; news?: { completedAt?: string; status?: string; publishedCount?: string; discoveredCount?: string; errorSummary?: string | null } | null };

const keyByJob: Record<string, string> = {
  "daily-indicators": "indicadores",
  "daily-territory": "territorio",
  "daily-congress": "congreso",
  "daily-gestion": "gestion",
};

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Sin registro";
}

function statusLabel(value?: string | null) {
  if (value === "success" || value === "operativo") return "Correcto";
  if (value === "running") return "En ejecución";
  if (value === "failed" || value === "degradado") return "Falló";
  if (value === "parcial") return "Parcial";
  return value ?? "Sin registro";
}

export default function AdminJobsPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/cotejo-7d41e9c2/jobs", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }, []);

  useEffect(() => { const frame = requestAnimationFrame(() => void load()); return () => cancelAnimationFrame(frame); }, [load]);

  const runByKey = useMemo(() => new Map((data?.daily ?? []).map((row) => [row.key, row])), [data]);

  async function run(job: Job) {
    setBusy(job.id);
    setMessage("");
    const response = await fetch("/api/cotejo-7d41e9c2/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setData(result.status);
      setMessage(`${job.title}: ejecución solicitada correctamente.`);
    } else {
      if (result.status) setData(result.status);
      setMessage(result.error ?? `${job.title}: no fue posible ejecutar el job.`);
    }
    setBusy("");
  }

  if (!data) return <section className="admin-jobs-panel"><p>Consultando jobs programados…</p></section>;

  return <section className="admin-jobs-panel" aria-labelledby="admin-jobs-title">
    <div className="analytics-section-title"><div><p className="section-kicker">JOBS PROGRAMADOS</p><h2 id="admin-jobs-title">Actualizaciones manuales</h2><p>Ejecuta un job puntual cuando el cron automático se atrase o cuando necesites verificar una fuente después de un cambio.</p></div><CalendarClock size={28} /></div>
    <div className="admin-jobs-grid">{data.jobs.map((job) => {
      const dailyRun = runByKey.get(keyByJob[job.id]);
      const isNews = job.id === "news-hourly";
      const lastAt = isNews ? data.news?.completedAt : dailyRun?.lastSuccessAt ?? dailyRun?.lastCompletedAt;
      const state = isNews ? data.news?.status : dailyRun?.status;
      const count = isNews ? data.news?.publishedCount : dailyRun?.recordCount;
      const error = isNews ? data.news?.errorSummary : dailyRun?.error;
      return <article key={job.id} className={`admin-job-card status-${state ?? "empty"}`}>
        <header><div><span>{job.cadence}</span><h3>{job.title}</h3></div>{state === "failed" || state === "degradado" ? <XCircle /> : <CheckCircle2 />}</header>
        <p>{job.description}</p>
        <dl>
          <div><dt>Última ejecución</dt><dd>{date(lastAt)}</dd></div>
          <div><dt>Estado</dt><dd>{statusLabel(state)}</dd></div>
          <div><dt>Registros</dt><dd>{count ?? "No aplica"}</dd></div>
        </dl>
        {error && <p className="admin-job-error">{error}</p>}
        <button disabled={busy !== ""} onClick={() => void run(job)}>{busy === job.id ? <RefreshCw className="review-spin" /> : <Play />} {busy === job.id ? "Ejecutando" : "Ejecutar ahora"}</button>
      </article>;
    })}</div>
    <p className="admin-jobs-note"><Clock3 size={15} /> La ejecución manual usa las mismas rutas y secretos que el cron. Si falla aquí, el problema también afectaría al job automático.</p>
    {message && <p className="review-message" role="status">{message}</p>}
  </section>;
}
