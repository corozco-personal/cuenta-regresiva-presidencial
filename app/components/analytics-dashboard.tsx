"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, Download, Eye, MousePointerClick, RefreshCw, Users } from "lucide-react";
import ActivityChart from "./activity-chart";

type Row = { day: string; users: number; pageviews: number; interactions: number };
type Ranked = { page?: string; name?: string; value: number };
type Report = {
  liveUsers: number;
  today: { users: number; pageviews: number; interactions: number };
  daily: Row[];
  topPages: Ranked[];
  topInteractions: Ranked[];
  generatedAt: string;
  activeWindowMinutes: number;
  privacy: string;
};

const number = new Intl.NumberFormat("es-CO");

export default function AnalyticsDashboard() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState<Report | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async (selectedRange = range) => {
    try {
      const response = await fetch(`/api/analitica?range=${selectedRange}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No disponible");
      setData(await response.json());
      setState("ready");
    } catch { setState("error"); }
  }, [range]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void load());
    const interval = window.setInterval(() => void load(), 5 * 60_000);
    return () => { window.cancelAnimationFrame(frame); window.clearInterval(interval); };
  }, [load]);

  const totals = useMemo(() => data?.daily.reduce((sum, row) => ({
    users: sum.users + Number(row.users),
    pageviews: sum.pageviews + Number(row.pageviews),
    interactions: sum.interactions + Number(row.interactions),
  }), { users: 0, pageviews: 0, interactions: 0 }) ?? { users: 0, pageviews: 0, interactions: 0 }, [data]);
  function changeRange(value: number) {
    setRange(value);
    setState("loading");
  }

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["fecha", "visitantes", "vistas", "interacciones"],
      ...data.daily.map((row) => [row.day, row.users, row.pageviews, row.interactions]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cuenta-publica-reporte-${range}-dias.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (state === "error") return <div className="analytics-state"><p>Los reportes no están disponibles temporalmente.</p><button onClick={() => void load()}><RefreshCw size={17} /> Reintentar</button></div>;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-toolbar">
        <div className="range-buttons" aria-label="Periodo del reporte">{[7, 30, 90].map((value) => <button key={value} className={range === value ? "active" : ""} onClick={() => changeRange(value)}><CalendarDays size={15} />{value} días</button>)}</div>
        <button className="export-report" onClick={exportCsv} disabled={!data}><Download size={17} /> Descargar CSV</button>
      </div>

      <section className="analytics-live" aria-label="Actividad actual">
        <article className="live-card"><span><i /> EN VIVO · ÚLTIMOS 5 MIN</span><strong>{data ? number.format(data.liveUsers) : "—"}</strong><p>usuarios activos ahora</p></article>
        <article><Users size={22} /><span>HOY</span><strong>{data ? number.format(data.today.users) : "—"}</strong><p>visitantes distintos</p></article>
        <article><Eye size={22} /><span>HOY</span><strong>{data ? number.format(data.today.pageviews) : "—"}</strong><p>páginas vistas</p></article>
        <article><MousePointerClick size={22} /><span>HOY</span><strong>{data ? number.format(data.today.interactions) : "—"}</strong><p>interacciones</p></article>
      </section>

      {state === "loading" && !data ? <p className="analytics-loading">Preparando el reporte…</p> : data && (
        <>
          <section className="analytics-period-summary">
            <div><span>Periodo</span><strong>{range} días</strong></div>
            <div><span>Visitantes diarios acumulados</span><strong>{number.format(totals.users)}</strong></div>
            <div><span>Vistas</span><strong>{number.format(totals.pageviews)}</strong></div>
            <div><span>Interacciones</span><strong>{number.format(totals.interactions)}</strong></div>
          </section>

          <section className="analytics-chart" aria-labelledby="activity-chart-title">
            <div className="analytics-section-title"><div><p className="section-kicker">TENDENCIA</p><h2 id="activity-chart-title">Actividad por día</h2></div></div>
            {data.daily.length ? <ActivityChart rows={data.daily} /> : <p className="analytics-empty">La medición comienza con esta versión. Los primeros datos aparecerán a medida que lleguen visitas.</p>}
          </section>

          <section className="analytics-rankings">
            <div><div className="analytics-section-title"><div><p className="section-kicker">CONTENIDO</p><h2>Páginas más vistas</h2></div></div>{data.topPages.length ? <ol>{data.topPages.map((row) => <li key={row.page}><span>{pageLabel(row.page)}</span><strong>{number.format(row.value)}</strong></li>)}</ol> : <p className="analytics-empty">Aún no hay suficientes vistas.</p>}</div>
            <div><div className="analytics-section-title"><div><p className="section-kicker">ACCIONES</p><h2>Interacciones frecuentes</h2></div></div>{data.topInteractions.length ? <ol>{data.topInteractions.map((row) => <li key={row.name}><span>{row.name}</span><strong>{number.format(row.value)}</strong></li>)}</ol> : <p className="analytics-empty">Aún no hay suficientes interacciones.</p>}</div>
          </section>

          <p className="analytics-privacy"><Activity size={17} /> {data.privacy} “Activo” significa que el navegador envió actividad durante los últimos {data.activeWindowMinutes} minutos. Actualizado el {new Date(data.generatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}.</p>
        </>
      )}
    </div>
  );
}

function pageLabel(path?: string) {
  const clean = (path ?? "").split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  if (!clean) return "Inicio";
  const labels: Record<string, string> = {
    presidente: "Sobre el presidente",
    reportes: "Reportes",
    favorabilidad: "Indicadores",
    archivo: "Archivo",
    promesas: "Promesas",
    resumen: "Resumen semanal",
    alertas: "Alertas",
    fuentes: "Fuentes",
    metodologia: "Metodología",
    privacidad: "Privacidad",
    correcciones: "Correcciones",
    autor: "Sobre el autor",
  };
  return labels[clean] ?? clean.split("/").filter(Boolean).map((part) => part.replace(/-/g, " ")).join(" · ").replace(/^./, (letter) => letter.toUpperCase());
}
