"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react";

type ReviewItem = { itemType: "opinion" | "news"; title: string; content: string; source: string; url?: string; createdAt: string };
const intrusionOptions = [["spam", "Spam, burla o contenido sin valor"], ["bot", "Automatización o bot"], ["injection", "Inyección o código malicioso"], ["unsafe_url", "Enlace inseguro"], ["rate_limit", "Abuso de solicitudes"], ["validation", "Información inválida o engañosa"]];

export default function MobileEmailReview() {
  const [item, setItem] = useState<ReviewItem | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const [intrusionType, setIntrusionType] = useState("spam");
  const [params, setParams] = useState({ itemType: "", itemId: "", token: "", intent: "approve" });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const current = { itemType: search.get("tipo") ?? "", itemId: search.get("id") ?? "", token: search.get("token") ?? "", intent: search.get("decision") === "reject" ? "reject" : "approve" };
    setParams(current);
    fetch(`/api/revision-movil?tipo=${encodeURIComponent(current.itemType)}&id=${encodeURIComponent(current.itemId)}&token=${encodeURIComponent(current.token)}`, { cache: "no-store", referrerPolicy: "no-referrer" })
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setItem(data.item))
      .catch(() => setError("El enlace venció, ya fue utilizado o no corresponde a una revisión disponible."));
  }, []);

  async function decide(action: "approve" | "reject") {
    setBusy(true); setError("");
    const response = await fetch("/api/revision-movil", { method: "POST", headers: { "content-type": "application/json" }, referrerPolicy: "no-referrer", body: JSON.stringify({ ...params, action, intrusionType }) });
    if (!response.ok) setError("No fue posible registrar la decisión. Es posible que el enlace ya se haya utilizado.");
    else { setDone(action === "approve" ? "Aprobado y publicado." : "Rechazado y registrado como intento no válido."); setItem(null); }
    setBusy(false);
  }

  return <main className="mobile-review-page"><section className="mobile-review-card"><header><span className="brand-mark">07</span><div><small>CUENTA PÚBLICA</small><strong>Revisión segura</strong></div><ShieldCheck /></header>
    {done ? <div className="mobile-review-result"><CheckCircle2 /><h1>Decisión registrada</h1><p>{done}</p><a href="/">Volver al portal</a></div> : error ? <div className="mobile-review-result error"><XCircle /><h1>Enlace no disponible</h1><p>{error}</p><a href="/cotejo-7d41e9c2">Abrir el centro de cotejo</a></div> : !item ? <p className="mobile-review-loading">Cargando aporte…</p> : <>
      <div className="mobile-review-content"><p className="section-kicker">{item.itemType === "opinion" ? "OPINIÓN PENDIENTE" : "ENLACE PENDIENTE"}</p><h1>{item.title}</h1><blockquote>{item.content}</blockquote><p>{item.source} · {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer"><ExternalLink />Abrir fuente aportada</a>}</div>
      {params.intent === "reject" && <label className="mobile-review-classification">Motivo del rechazo<select value={intrusionType} onChange={(event) => setIntrusionType(event.target.value)}>{intrusionOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}
      <div className="mobile-review-actions">{params.intent === "approve" ? <button disabled={busy} className="approve" onClick={() => void decide("approve")}><CheckCircle2 />{busy ? "Guardando…" : "Confirmar aprobación"}</button> : <button disabled={busy} className="reject" onClick={() => void decide("reject")}><XCircle />{busy ? "Guardando…" : "Confirmar rechazo"}</button>}<a href="/cotejo-7d41e9c2">Revisar en el dashboard</a></div>
    </>}
  </section></main>;
}
