"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bot, DatabaseZap, ShieldCheck } from "lucide-react";

type Report = {
  generatedAt: string;
  windowDays: number;
  totalBlocked: number;
  highSeverity: number;
  uniqueFingerprints: number;
  categories: Array<{ name: string; value: number }>;
  endpoints: Array<{ name: string; value: number }>;
  daily: Array<{ day: string; blocked: number; high: number }>;
  queue: { pendingOpinions: number; pendingNews: number; pendingCorrections: number; quarantined: number; actions30Days: number };
  privacy: string;
};

const labels: Record<string, string> = { rate_limit: "Exceso de solicitudes", bot: "Automatización", injection: "Inyección o código", spam: "Spam o burla", unsafe_url: "Enlace inseguro", validation: "Validación" };

export default function SecurityReport() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => { fetch("/api/seguridad", { cache: "no-store" }).then((response) => response.json()).then((data) => setReport(data.report ?? null)).catch(() => undefined); }, []);
  if (!report) return null;
  const max = Math.max(1, ...report.daily.map((row) => row.blocked));
  return <section className="security-report" aria-labelledby="security-report-title">
    <div className="analytics-section-title"><div><p className="section-kicker">SEGURIDAD Y MODERACIÓN</p><h2 id="security-report-title">Señales de abuso bloqueadas</h2></div><ShieldCheck size={28} /></div>
    <div className="security-metrics">
      <article><ShieldCheck /><span>30 días</span><strong>{report.totalBlocked}</strong><p>intentos bloqueados</p></article>
      <article><AlertTriangle /><span>Prioridad</span><strong>{report.highSeverity}</strong><p>señales de severidad alta</p></article>
      <article><Bot /><span>Origen agregado</span><strong>{report.uniqueFingerprints}</strong><p>huellas distintas</p></article>
      <article><DatabaseZap /><span>Trazabilidad</span><strong>{report.queue.quarantined}</strong><p>envíos en cuarentena</p></article>
    </div>
    <div className="security-detail-grid">
      <div><h3>Tipos detectados</h3>{report.categories.length ? <ol>{report.categories.map((item) => <li key={item.name}><span>{labels[item.name] ?? item.name}</span><strong>{item.value}</strong></li>)}</ol> : <p>Sin señales registradas en este periodo.</p>}</div>
      <div><h3>Cola de revisión</h3><dl><div><dt>Opiniones</dt><dd>{report.queue.pendingOpinions}</dd></div><div><dt>Noticias</dt><dd>{report.queue.pendingNews}</dd></div><div><dt>Solicitudes</dt><dd>{report.queue.pendingCorrections}</dd></div><div><dt>Decisiones registradas</dt><dd>{report.queue.actions30Days}</dd></div></dl></div>
      <div className="security-bars"><h3>Actividad diaria</h3>{report.daily.length ? report.daily.slice(-14).map((row) => <div key={row.day}><time>{new Intl.DateTimeFormat("es-CO", { month: "short", day: "numeric" }).format(new Date(`${row.day}T12:00:00Z`))}</time><span><i style={{ width: `${Math.max(4, row.blocked / max * 100)}%` }} /></span><strong>{row.blocked}</strong></div>) : <p>Sin actividad bloqueada.</p>}</div>
    </div>
    <p className="analytics-privacy"><ShieldCheck size={17} />{report.privacy} Actualizado el {new Date(report.generatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}.</p>
  </section>;
}
