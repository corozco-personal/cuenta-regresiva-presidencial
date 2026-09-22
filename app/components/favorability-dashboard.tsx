"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";

type Indicators = {
  updatedAt: string;
  opinions: { total: number; stances: { favorable: number; unfavorable: number; neutral: number; mixed: number }; moderation: { published: number; filtered: number } };
  contributions: { total: number; statuses: { publishable: number; review: number; rejected: number } };
  geography: Array<{ country: string; count: number }>;
};
type News = { title: string; scope: string; kind: string; evidenceLevel: string };

const POSITIVE = /apoya|aprob|acuerdo|avance|logro|mejora|crece|reduce|éxito|cumple|inaugura|fortalece/i;
const CRITICAL = /crisis|rechazo|denuncia|investig|ordena|retira|controvers|conden|protest|alerta|cuestion|revoca|sanción/i;

function percent(value: number, total: number) { return total ? Math.round((value / total) * 100) : 0; }

function Bars({ rows }: { rows: Array<{ label: string; value: number; total: number; tone: string }> }) {
  return <div className="chart-bars">{rows.map((row) => <div className="chart-row" key={row.label}><div><span>{row.label}</span><strong>{row.value} · {percent(row.value, row.total)}%</strong></div><div className="chart-track"><i className={row.tone} style={{ width: `${percent(row.value, row.total)}%` }} /></div></div>)}</div>;
}

export default function FavorabilityDashboard() {
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void Promise.all([fetch("/api/indicadores"), fetch("/api/noticias")]).then(async ([indicatorResponse, newsResponse]) => {
      if (!indicatorResponse.ok || !newsResponse.ok) throw new Error();
      const [indicatorData, newsData] = await Promise.all([indicatorResponse.json(), newsResponse.json()]);
      setIndicators(indicatorData); setNews(Array.isArray(newsData.items) ? newsData.items : []);
    }).catch(() => setFailed(true));
  }, []);

  const tone = useMemo(() => news.reduce((result, item) => {
    if (POSITIVE.test(item.title)) result.positive += 1;
    else if (CRITICAL.test(item.title)) result.critical += 1;
    else result.neutral += 1;
    return result;
  }, { positive: 0, neutral: 0, critical: 0 }), [news]);

  if (failed) return <p className="indicator-message">Los indicadores no están disponibles temporalmente.</p>;
  if (!indicators) return <p className="indicator-message">Calculando indicadores…</p>;

  const { stances, moderation } = indicators.opinions;
  const directional = stances.favorable + stances.unfavorable;
  const favorability = percent(stances.favorable, directional);
  const enoughSample = indicators.opinions.total >= 10;
  const toneTotal = tone.positive + tone.neutral + tone.critical;
  const contributionStatuses = indicators.contributions.statuses;

  return <div className="indicator-dashboard">
    <div className="indicator-summary">
      <article><small>Favorabilidad ciudadana</small><strong>{directional ? `${favorability}%` : "—"}</strong><p>Entre opiniones que tomaron posición a favor o en contra.</p></article>
      <article><small>Muestra de opiniones</small><strong>{indicators.opinions.total}</strong><p>Un aporte único por navegador.</p></article>
      <article><small>Noticias analizadas</small><strong>{toneTotal}</strong><p>Titulares admitidos en la actualización actual.</p></article>
      <article><small>Aportes de noticias</small><strong>{indicators.contributions.total}</strong><p>Enlaces enviados por la comunidad.</p></article>
    </div>

    {!enoughSample && <div className="sample-warning"><AlertCircle size={18} /><p><strong>Muestra insuficiente.</strong> Con menos de 10 opiniones, el porcentaje es descriptivo y no representa a la población colombiana.</p></div>}

    <div className="indicator-grid">
      <section><p className="section-kicker">OPINIONES CIUDADANAS</p><h2>Distribución de posturas</h2><Bars rows={[
        { label: "A favor", value: stances.favorable, total: indicators.opinions.total, tone: "positive" },
        { label: "En contra", value: stances.unfavorable, total: indicators.opinions.total, tone: "critical" },
        { label: "Mixta", value: stances.mixed, total: indicators.opinions.total, tone: "mixed" },
        { label: "Neutral", value: stances.neutral, total: indicators.opinions.total, tone: "neutral" },
      ]} /><p className="chart-note">Incluye aportes únicos. Los textos filtrados conservan su postura declarada, pero no se muestran públicamente.</p></section>

      <section><p className="section-kicker">COBERTURA PERIODÍSTICA</p><h2>Tono de los titulares</h2><Bars rows={[
        { label: "Positivo", value: tone.positive, total: toneTotal, tone: "positive" },
        { label: "Neutro o informativo", value: tone.neutral, total: toneTotal, tone: "neutral" },
        { label: "Crítico", value: tone.critical, total: toneTotal, tone: "critical" },
      ]} /><p className="chart-note">Clasificación automática por palabras del titular. Mide tono de cobertura, no aprobación ciudadana ni veracidad.</p></section>

      <section><p className="section-kicker">APORTES DE NOTICIAS</p><h2>Estado de evaluación</h2><Bars rows={[
        { label: "Fuente primaria publicable", value: contributionStatuses.publishable, total: indicators.contributions.total, tone: "positive" },
        { label: "En evaluación", value: contributionStatuses.review, total: indicators.contributions.total, tone: "mixed" },
        { label: "No incorporado", value: contributionStatuses.rejected, total: indicators.contributions.total, tone: "critical" },
      ]} /><p className="chart-note">Describe el resultado de las reglas editoriales aplicadas a los enlaces enviados.</p></section>

      <section><p className="section-kicker">CONVIVENCIA</p><h2>Moderación del muro</h2><Bars rows={[
        { label: "Publicado", value: moderation.published, total: indicators.opinions.total, tone: "positive" },
        { label: "Texto filtrado", value: moderation.filtered, total: indicators.opinions.total, tone: "critical" },
      ]} /><p className="chart-note">Un texto filtrado se conserva para trazabilidad, pero no se amplifica en el muro.</p></section>
    </div>
    <p className="indicator-updated">Actualizado el {new Date(indicators.updatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}.</p>
  </div>;
}
