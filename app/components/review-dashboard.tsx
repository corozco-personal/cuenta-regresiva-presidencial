"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, LogOut, MessageSquareText, Newspaper, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

type Opinion = { id: string; type: "opinion"; status: string; comment: string; displayName: string; country: string; department?: string | null; municipality?: string | null; stance: string; reason?: string | null; createdAt: string };
type Submission = { id: string; type: "news"; status: string; title?: string | null; url: string; domain: string; displayName: string; country: string; department?: string | null; municipality?: string | null; reliability: string; reason: string; createdAt: string };
type Item = Opinion | Submission;
type View = "review" | "approved" | "rejected" | "all";

const intrusionOptions = [
  ["spam", "Spam, burla o contenido sin valor"], ["bot", "Automatización o bot"], ["injection", "Inyección o código malicioso"],
  ["unsafe_url", "Enlace inseguro"], ["rate_limit", "Abuso de solicitudes"], ["validation", "Información inválida o engañosa"],
];
const statusLabel: Record<string, string> = {
  pending_manual: "Pendiente de aprobación", quarantined: "Cuarentena automática", approved_manual: "Aprobado manualmente",
  rejected_manual: "Rechazado", published: "Publicación anterior · revisar", approved: "Aprobación automática anterior · revisar",
  filtered: "Filtrado anteriormente · revisar", review: "En evaluación anterior · revisar", publishable: "Publicable anteriormente · revisar",
};

export default function ReviewDashboard({ reviewerName }: { reviewerName: string }) {
  const [opinions, setOpinions] = useState<Opinion[]>([]); const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [view, setView] = useState<View>("review"); const [section, setSection] = useState<"opinions" | "news">("opinions");
  const [loading, setLoading] = useState(true); const [message, setMessage] = useState("");
  const [types, setTypes] = useState<Record<string, string>>({}); const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); const response = await fetch("/api/cotejo-7d41e9c2", { cache: "no-store" });
    if (!response.ok) { setMessage("La sesión no está disponible o no tiene autorización."); setLoading(false); return; }
    const data = await response.json(); setOpinions(data.opinions ?? []); setSubmissions(data.submissions ?? []); setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const allItems: Item[] = section === "opinions" ? opinions : submissions;
  const visible = useMemo(() => allItems.filter((item) => view === "all" || (view === "approved" ? item.status === "approved_manual" : view === "rejected" ? item.status === "rejected_manual" : !["approved_manual", "rejected_manual"].includes(item.status))), [allItems, view]);
  const counts = useMemo(() => ({
    review: [...opinions, ...submissions].filter((item) => !["approved_manual", "rejected_manual"].includes(item.status)).length,
    approved: [...opinions, ...submissions].filter((item) => item.status === "approved_manual").length,
    rejected: [...opinions, ...submissions].filter((item) => item.status === "rejected_manual").length,
  }), [opinions, submissions]);

  async function decide(item: Item, action: "approve" | "reject") {
    setBusy(item.id); setMessage("");
    const response = await fetch("/api/cotejo-7d41e9c2", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType: item.type, itemId: item.id, action, intrusionType: types[item.id] ?? "spam" }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "No fue posible registrar la decisión."); else {
      const update = (entry: Item) => entry.id === item.id ? { ...entry, status: data.status } : entry;
      if (item.type === "opinion") setOpinions((rows) => rows.map(update) as Opinion[]); else setSubmissions((rows) => rows.map(update) as Submission[]);
    }
    setBusy(null);
  }

  return <main className="review-console">
    <header className="review-console-header"><div><span className="brand-mark">07</span><div><small>ESPACIO PRIVADO</small><strong>Centro de cotejo</strong></div></div><div><span><ShieldCheck size={15} />{reviewerName}</span><a href="/signout-with-chatgpt?return_to=/"><LogOut size={16} />Cerrar sesión</a></div></header>
    <section className="review-intro"><div><p className="section-kicker">CONTROL EDITORIAL</p><h1>Decisiones antes<br />de publicar.</h1></div><p>Ningún aporte llega al portal sin tu aprobación. Los filtros automáticos envían lo sospechoso a cuarentena; tú decides si se publica o se registra como intrusión.</p></section>
    <section className="review-stats"><button className={view === "review" ? "active" : ""} onClick={() => setView("review")}><ShieldCheck />Por revisar<strong>{counts.review}</strong></button><button className={view === "approved" ? "active" : ""} onClick={() => setView("approved")}><CheckCircle2 />Aprobados<strong>{counts.approved}</strong></button><button className={view === "rejected" ? "active" : ""} onClick={() => setView("rejected")}><XCircle />Rechazados<strong>{counts.rejected}</strong></button><button className={view === "all" ? "active" : ""} onClick={() => setView("all")}><RefreshCw />Todos<strong>{opinions.length + submissions.length}</strong></button></section>
    <section className="review-workspace">
      <div className="review-tabs"><button className={section === "opinions" ? "active" : ""} onClick={() => setSection("opinions")}><MessageSquareText />Opiniones <strong>{opinions.length}</strong></button><button className={section === "news" ? "active" : ""} onClick={() => setSection("news")}><Newspaper />Enlaces aportados <strong>{submissions.length}</strong></button><button className="review-refresh" onClick={() => void load()}><RefreshCw />Actualizar</button></div>
      {message && <p className="review-message" role="alert">{message}</p>}
      {loading ? <p className="review-empty">Cargando la cola…</p> : visible.length ? <div className="review-list">{visible.map((item) => <article key={item.id}>
        <div className="review-item-meta"><span className={`review-status status-${item.status}`}>{statusLabel[item.status] ?? item.status}</span><time>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div>
        {item.type === "opinion" ? <><h2>{item.displayName} · {item.stance}</h2><p className="review-content">{item.comment}</p></> : <><h2>{item.title || item.domain}</h2><a className="review-source" href={item.url} target="_blank" rel="noreferrer">{item.domain}<ExternalLink size={14} /></a></>}
        <dl><div><dt>Ubicación</dt><dd>{[item.municipality, item.department, item.country].filter(Boolean).join(" · ")}</dd></div><div><dt>Filtro previo</dt><dd>{item.reason || "Sin alerta automática"}</dd></div>{item.type === "news" && <div><dt>Clasificación de fuente</dt><dd>{item.reliability}</dd></div>}</dl>
        <div className="review-actions"><button className="approve" disabled={busy === item.id || item.status === "approved_manual"} onClick={() => void decide(item, "approve")}><CheckCircle2 />Aprobar y publicar</button><div className="reject-control"><select aria-label="Tipo de intrusión" value={types[item.id] ?? "spam"} onChange={(event) => setTypes((current) => ({ ...current, [item.id]: event.target.value }))}>{intrusionOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button disabled={busy === item.id || item.status === "rejected_manual"} onClick={() => void decide(item, "reject")}><XCircle />Rechazar</button></div></div>
      </article>)}</div> : <p className="review-empty">No hay elementos en esta vista.</p>}
    </section>
  </main>;
}
