"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock3,
  Download, ExternalLink, History, LogOut, MailCheck, MessageSquareText, Newspaper, RefreshCw,
  RadioTower, Search, ShieldCheck, XCircle,
} from "lucide-react";
import AnalyticsDashboard from "./analytics-dashboard";
import SecurityReport from "./security-report";
import SecurityOperations from "./security-operations";
import MediaPublicationRadar from "./media-publication-radar";

type Audit = { id: string; fromStatus: string; toStatus: string; reason: string; reviewer: string; createdAt: string };
type Email = { notifiedAt?: string | null; expiresAt?: string | null; reviewedAt?: string | null; deliveryStatus?: string | null; lastError?: string | null };
type PrivateAudit = { networkReference: string; browser: string; operatingSystem: string; deviceClass: string; countryCode?: string | null; edgeLocation?: string | null; language?: string | null; contact?: string | null; relatedSubmissions: number };
type Base = { id: string; status: string; displayName: string; country: string; department?: string | null; municipality?: string | null; reason?: string | null; createdAt: string; email: Email; privateAudit?: PrivateAudit | null; audit: Audit[] };
type Opinion = Base & { type: "opinion"; comment: string; stance: string };
type Submission = Base & { type: "news"; title?: string | null; url: string; domain: string; reliability: string };
type Correction = Base & { type: "correction"; requestType: string; subject: string; relatedUrl: string; explanation: string; evidenceUrl?: string | null; classification: string };
type Item = Opinion | Submission | Correction;
type View = "review" | "approved" | "rejected" | "all";
type Section = "opinion" | "news" | "correction" | "reports";
type ReportTab = "activity" | "media";
type Counts = { opinions: Record<string, number>; news: Record<string, number>; corrections: Record<string, number> };

const AUTO_REFRESH_MS = 5 * 60_000;
const LOADING_DELAY_MS = 1100;
const intrusionOptions = [
  ["spam", "Spam, burla o contenido sin valor"], ["bot", "Automatización o bot"], ["injection", "Inyección o código malicioso"],
  ["unsafe_url", "Enlace inseguro"], ["rate_limit", "Abuso de solicitudes"], ["validation", "Información inválida o engañosa"],
];
const statusLabel: Record<string, string> = {
  pending_manual: "Pendiente de aprobación", quarantined: "Cuarentena automática", approved_manual: "Aprobado manualmente", rejected_manual: "Rechazado",
  "Pendiente de revisión": "Pendiente de revisión", "En revisión": "En revisión", Recibida: "Recibida", Resuelta: "Resuelta", Rechazada: "Rechazada",
};
const viewLabel: Record<View, string> = { review: "Por revisar", approved: "Aprobados", rejected: "Rechazados", all: "Todos" };

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function countFor(map: Record<string, number>, view: View, kind: Section) {
  const entries = Object.entries(map);
  return entries.filter(([status]) => {
    if (view === "all") return true;
    if (kind === "correction") {
      if (view === "approved") return status === "Resuelta";
      if (view === "rejected") return status === "Rechazada";
      return !["Resuelta", "Rechazada"].includes(status);
    }
    if (view === "approved") return status === "approved_manual";
    if (view === "rejected") return status === "rejected_manual";
    return !["approved_manual", "rejected_manual"].includes(status);
  }).reduce((sum, [, count]) => sum + count, 0);
}

function totalFor(counts: Counts, view: View) {
  return countFor(counts.opinions, view, "opinion") + countFor(counts.news, view, "news") + countFor(counts.corrections, view, "correction");
}

function risk(item: Item) {
  const text = `${item.reason ?? ""} ${item.status} ${item.type === "correction" ? `${item.subject} ${item.explanation}` : ""}`;
  return /injection|insegur|ofensiv|odio|unsafe|script|iframe/i.test(text) ? "alto" : /quarantined|spam|bot|burla|autom/i.test(text) ? "medio" : "bajo";
}

export default function ReviewDashboard({ reviewerName }: { reviewerName: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Counts>({ opinions: {}, news: {}, corrections: {} });
  const [view, setView] = useState<View>("review");
  const [section, setSection] = useState<Section>("opinion");
  const [reportTab, setReportTab] = useState<ReportTab>("activity");
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("todos");
  const [cursor, setCursor] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [message, setMessage] = useState("");
  const [types, setTypes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renderedAt] = useState(() => Date.now());

  const load = useCallback(async (silent = false) => {
    if (section === "reports") {
      if (!silent) setLoading(false);
      return true;
    }
    if (!silent) setLoading(true);
    const params = new URLSearchParams({ type: section, view, limit: "20" });
    if (cursor) params.set("cursor", cursor);
    if (appliedQuery) params.set("q", appliedQuery);
    const response = await fetch(`/api/cotejo-7d41e9c2?${params}`, { cache: "no-store" });
    if (!response.ok) {
      if (!silent) setLoading(false);
      setMessage("La sesión no está disponible o alcanzó temporalmente el límite de seguridad.");
      return false;
    }
    const data = await response.json();
    setItems(data.items ?? []);
    setCounts(data.counts ?? { opinions: {}, news: {}, corrections: {} });
    setNextCursor(data.pagination?.nextCursor ?? null);
    setSelected(new Set());
    if (!silent) setLoading(false);
    return true;
  }, [appliedQuery, cursor, section, view]);

  useEffect(() => { const frame = requestAnimationFrame(() => void load()); return () => cancelAnimationFrame(frame); }, [load]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      void (async () => {
        setRefreshing(true);
        setMessage("");
        await wait(LOADING_DELAY_MS);
        await load(true);
        setRefreshing(false);
      })();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, [autoRefresh, load]);

  const visible = useMemo(() => items.filter((item) => riskFilter === "todos" || risk(item) === riskFilter), [items, riskFilter]);

  function changeContext(nextSection: Section = section, nextView: View = view) {
    setSection(nextSection);
    setView(nextView);
    setCursor("");
    setHistory([]);
    setMessage("");
  }

  async function toggleAutoRefresh() {
    const next = !autoRefresh;
    setAutoRefresh(next);
    setRefreshing(true);
    setMessage("");
    await wait(LOADING_DELAY_MS);
    if (next) await load(true);
    setRefreshing(false);
    setMessage(next ? "La cola se actualizará sola cada 5 minutos." : "Actualización automática desactivada.");
  }

  async function refreshNow() {
    if (refreshing) return;
    setRefreshing(true);
    setMessage("");
    await wait(LOADING_DELAY_MS);
    const ok = await load(true);
    setRefreshing(false);
    if (ok) setMessage("Cola actualizada.");
  }

  async function decide(item: Item, action: "approve" | "reject") {
    setBusy(item.id);
    setMessage("");
    const response = await fetch("/api/cotejo-7d41e9c2", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemType: item.type, itemId: item.id, action, intrusionType: types[item.id] ?? "spam" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "No fue posible registrar la decisión.");
    else await load();
    setBusy(null);
  }

  async function rejectSelected() {
    const chosen = visible.filter((item) => selected.has(item.id));
    if (!chosen.length || !confirm(`Se rechazarán ${chosen.length} elementos. Esta acción quedará registrada. ¿Continuar?`)) return;
    for (const item of chosen) await decide(item, "reject");
  }

  return <main className="review-console">
    <header className="review-console-header">
      <div><span className="brand-mark">07</span><div><small>ESPACIO PRIVADO</small><strong>Centro de cotejo</strong></div></div>
      <div>
        <a href="/api/cotejo-7d41e9c2/export"><Download size={16} />Exportar respaldo</a>
        <span><ShieldCheck size={15} />{reviewerName}</span>
        <a href="/signout-with-chatgpt?return_to=/"><LogOut size={16} />Cerrar sesión</a>
      </div>
    </header>
    <section className="review-intro">
      <div><p className="section-kicker">CONTROL EDITORIAL</p><h1>Decisiones antes<br />de publicar.</h1></div>
      <p>Cola paginada, solicitudes de corrección, reportes de audiencia y señales de abuso. La aprobación siempre es individual.</p>
    </section>
    <section className="review-stats">{(["review", "approved", "rejected", "all"] as View[]).map((item) => (
      <button key={item} className={view === item ? "active" : ""} onClick={() => changeContext(section === "reports" ? "opinion" : section, item)}>
        {item === "review" ? <ShieldCheck /> : item === "approved" ? <CheckCircle2 /> : item === "rejected" ? <XCircle /> : <RefreshCw />}
        {viewLabel[item]}<strong>{totalFor(counts, item)}</strong>
      </button>
    ))}</section>
    <section className="review-workspace">
      <div className="review-tabs">
        <button className={section === "opinion" ? "active" : ""} onClick={() => changeContext("opinion")}><MessageSquareText />Opiniones<strong>{countFor(counts.opinions, view, "opinion")}</strong></button>
        <button className={section === "news" ? "active" : ""} onClick={() => changeContext("news")}><Newspaper />Enlaces<strong>{countFor(counts.news, view, "news")}</strong></button>
        <button className={section === "correction" ? "active" : ""} onClick={() => changeContext("correction")}><ClipboardList />Correcciones<strong>{countFor(counts.corrections, view, "correction")}</strong></button>
        <button className={section === "reports" ? "active" : ""} onClick={() => changeContext("reports")}><BarChart3 />Reportes</button>
        <div className="review-refresh-group">
          <button className={`review-auto${autoRefresh ? " is-active" : ""}`} onClick={() => void toggleAutoRefresh()} aria-pressed={autoRefresh}>
            <Clock3 />Auto · 5 min
          </button>
          <button className={`review-refresh${refreshing ? " is-loading" : ""}`} onClick={() => void refreshNow()} disabled={refreshing}>
            <RefreshCw className={refreshing ? "review-spin" : undefined} />Actualizar
          </button>
        </div>
      </div>

      {section === "reports" ? (
        <div className="review-reports">
          <nav className="report-subtabs" aria-label="Secciones de reportes">
            <button className={reportTab === "activity" ? "active" : ""} onClick={() => setReportTab("activity")}><Activity size={17} />Actividad del sitio</button>
            <button className={reportTab === "media" ? "active" : ""} onClick={() => setReportTab("media")}><RadioTower size={17} />Radar de medios</button>
          </nav>
          {reportTab === "activity" ? <div className="report-tab-panel"><AnalyticsDashboard /><SecurityReport /><SecurityOperations /></div> : <div className="report-tab-panel"><MediaPublicationRadar /></div>}
        </div>
      ) : (
        <>
          <div className="review-toolbar">
            <form onSubmit={(event) => { event.preventDefault(); setCursor(""); setHistory([]); setAppliedQuery(query.trim()); }}>
              <Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={100} placeholder="Buscar texto, dominio, país o nombre" /><button>Buscar</button>
            </form>
            <label>Riesgo
              <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                <option value="todos">Todos</option><option value="alto">Alto</option><option value="medio">Medio</option><option value="bajo">Bajo</option>
              </select>
            </label>
            {selected.size > 0 && <button className="bulk-reject" onClick={() => void rejectSelected()}><XCircle size={15} />Rechazar seleccionados ({selected.size})</button>}
          </div>
          {message && <p className="review-message" role="status">{message}</p>}
          {loading ? <p className="review-empty">Cargando la cola…</p> : visible.length ? <div className="review-list">{visible.map((item) => (
            <article key={item.id}>
              <div className="review-item-meta">
                <label className="review-select">
                  <input type="checkbox" checked={selected.has(item.id)} onChange={(event) => setSelected((current) => { const next = new Set(current); if (event.target.checked) next.add(item.id); else next.delete(item.id); return next; })} />
                  Seleccionar
                </label>
                <span className={`review-status status-${item.status.replace(/\s+/g, "_")}`}>{statusLabel[item.status] ?? item.status}</span>
                <span className={`risk-badge risk-${risk(item)}`}><AlertTriangle size={13} />Riesgo {risk(item)}</span>
                <time>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time>
              </div>
              {item.type === "opinion" && <><h2>{item.displayName} · {item.stance}</h2><p className="review-content">{item.comment}</p></>}
              {item.type === "news" && <><h2>{item.title || item.domain}</h2><a className="review-source" href={item.url} target="_blank" rel="noreferrer">{item.domain}<ExternalLink size={14} /></a></>}
              {item.type === "correction" && (
                <>
                  <h2>{item.requestType}: {item.subject}</h2>
                  <p className="review-content">{item.explanation}</p>
                  <a className="review-source" href={item.relatedUrl} target="_blank" rel="noreferrer">Enlace relacionado<ExternalLink size={14} /></a>
                </>
              )}
              <dl>
                <div><dt>Ubicación o nombre</dt><dd>{[item.displayName, item.municipality, item.department, item.country].filter(Boolean).join(" · ") || "Sin dato público"}</dd></div>
                <div><dt>Filtro previo</dt><dd>{item.reason || "Sin alerta automática"}</dd></div>
                {item.type === "news" && <div><dt>Clasificación de fuente</dt><dd>{item.reliability}</dd></div>}
                {item.type === "correction" && <div><dt>Evidencia adicional</dt><dd>{item.evidenceUrl ? <a href={item.evidenceUrl} target="_blank" rel="noreferrer">Ver prueba</a> : "No adjunta"}</dd></div>}
                {item.type !== "correction" && (
                  <div><dt>Notificación</dt><dd>{item.email.reviewedAt ? <><MailCheck size={14} /> Revisado desde correo</> : item.email.notifiedAt ? <><MailCheck size={14} /> {item.email.deliveryStatus === "delivered" ? "Correo entregado" : item.email.deliveryStatus === "bounced" ? "Correo rebotado" : "Correo enviado"}{item.email.expiresAt && Date.parse(item.email.expiresAt) < renderedAt ? " · enlace vencido" : ""}</> : <><Clock3 size={14} /> {item.email.deliveryStatus === "failed" ? `Fallo de envío · ${item.email.lastError ?? "sin detalle"}` : "Sin correo enviado"}</>}</dd></div>
                )}
              </dl>
              {item.privateAudit && <details className="review-audit private-audit"><summary><ShieldCheck size={15} />Señales privadas del envío</summary><dl><div><dt>Referencia de red</dt><dd>{item.privateAudit.networkReference}</dd></div><div><dt>Dispositivo</dt><dd>{item.privateAudit.deviceClass} · {item.privateAudit.browser} · {item.privateAudit.operatingSystem}</dd></div><div><dt>Contexto técnico</dt><dd>{[item.privateAudit.countryCode, item.privateAudit.edgeLocation, item.privateAudit.language].filter(Boolean).join(" · ") || "No disponible"}</dd></div><div><dt>Envíos relacionados</dt><dd>{item.privateAudit.relatedSubmissions}</dd></div>{item.privateAudit.contact && <div><dt>Contacto aportado</dt><dd>{item.privateAudit.contact}</dd></div>}</dl><p>Estas señales ayudan a correlacionar abuso, pero no prueban la identidad civil de una persona.</p></details>}
              {item.audit.length > 0 && <details className="review-audit"><summary><History size={15} />Historial ({item.audit.length})</summary><ol>{item.audit.map((entry) => <li key={entry.id}><time>{new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.createdAt))}</time><strong>{entry.fromStatus} → {entry.toStatus}</strong><span>{entry.reason} · {entry.reviewer}</span></li>)}</ol></details>}
              <div className="review-actions">
                <button className="approve" disabled={busy === item.id || item.status === "approved_manual" || item.status === "Resuelta"} onClick={() => void decide(item, "approve")}><CheckCircle2 />{item.type === "correction" ? "Marcar resuelta" : "Aprobar y publicar"}</button>
                <div className="reject-control">
                  <select aria-label="Tipo de intrusión" value={types[item.id] ?? "spam"} onChange={(event) => setTypes((current) => ({ ...current, [item.id]: event.target.value }))}>{intrusionOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
                  <button disabled={busy === item.id || item.status === "rejected_manual" || item.status === "Rechazada"} onClick={() => void decide(item, "reject")}><XCircle />{item.status === "approved_manual" || item.status === "Resuelta" ? "Despublicar" : "Rechazar"}</button>
                </div>
              </div>
            </article>
          ))}</div> : <p className="review-empty">No hay elementos en esta vista.</p>}
          <nav className="review-pagination" aria-label="Paginación de la cola">
            <button disabled={!history.length} onClick={() => { const previous = history.at(-1) ?? ""; setHistory((current) => current.slice(0, -1)); setCursor(previous); }}><ChevronLeft />Anterior</button>
            <span>{cursor ? "Página siguiente" : "Primera página"} · máximo 20 registros</span>
            <button disabled={!nextCursor} onClick={() => { setHistory((current) => [...current, cursor]); setCursor(nextCursor ?? ""); }}>Siguiente<ChevronRight /></button>
          </nav>
        </>
      )}
    </section>
  </main>;
}
