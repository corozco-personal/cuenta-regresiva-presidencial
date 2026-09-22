"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, MessageSquareText, Newspaper, ShieldCheck } from "lucide-react";

type Opinion = { id: string; displayName: string; country: string; department?: string; municipality?: string; stance: string; status: string; comment: string; createdAt: string };
type Submission = { id: string; url: string; domain: string; title?: string; status: string; reliability: string; reason: string; country: string; createdAt: string };

const statusLabel: Record<string, string> = { publishable: "Fuente primaria publicable", review: "En evaluación", rejected: "No incorporado" };

async function readJson(response: Response) {
  return response.json().catch(() => ({ error: "Respuesta inesperada del servidor." }));
}

export default function Community() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [opinionMessage, setOpinionMessage] = useState("");
  const [newsMessage, setNewsMessage] = useState("");
  const [sendingOpinion, setSendingOpinion] = useState(false);
  const [sendingNews, setSendingNews] = useState(false);
  const [opinionAnonymous, setOpinionAnonymous] = useState(true);
  const [newsAnonymous, setNewsAnonymous] = useState(true);

  async function refresh() {
    const [opinionResponse, newsResponse] = await Promise.all([fetch("/api/opiniones", { cache: "no-store" }), fetch("/api/aportes")]);
    if (opinionResponse.ok) setOpinions((await opinionResponse.json()).opinions ?? []);
    if (newsResponse.ok) setSubmissions((await newsResponse.json()).submissions ?? []);
  }

  useEffect(() => {
    void Promise.all([fetch("/api/opiniones", { cache: "no-store" }), fetch("/api/aportes")]).then(async ([opinionResponse, newsResponse]) => {
      if (opinionResponse.ok) setOpinions((await opinionResponse.json()).opinions ?? []);
      if (newsResponse.ok) setSubmissions((await newsResponse.json()).submissions ?? []);
    }).catch(() => undefined);
  }, []);

  async function submitOpinion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendingOpinion(true); setOpinionMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    let contributorId = window.localStorage.getItem("cuenta-publica-contributor");
    if (!contributorId) { contributorId = crypto.randomUUID(); window.localStorage.setItem("cuenta-publica-contributor", contributorId); }
    const response = await fetch("/api/opiniones", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, isAnonymous: opinionAnonymous, contributorId }) });
    const result = await readJson(response);
    if (!response.ok) setOpinionMessage(result.error);
    else {
      setOpinionMessage(result.filtered ? "La opinión se conservó, pero su texto quedó oculto por la política de convivencia." : "Tu opinión ya forma parte del muro.");
      form.reset(); setOpinionAnonymous(true); await refresh();
    }
    setSendingOpinion(false);
  }

  async function submitNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendingNews(true); setNewsMessage("Comprobando el enlace, la fuente y su relación con el tema…");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/aportes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, isAnonymous: newsAnonymous }) });
    const result = await readJson(response);
    if (!response.ok) setNewsMessage(result.error);
    else { setNewsMessage(`${statusLabel[result.submission.status]}. ${result.submission.reason}`); form.reset(); setNewsAnonymous(true); await refresh(); }
    setSendingNews(false);
  }

  return (
    <section className="community section-shell" id="participa">
      <div className="section-heading community-heading">
        <div><p className="section-kicker">03 / PARTICIPACIÓN</p><h2>Aporta evidencia. Deja una opinión.</h2><p>Dos espacios públicos con controles distintos: los enlaces se evalúan como fuentes; las opiniones se moderan y se contrastan para evitar duplicados.</p></div>
        <MessageSquareText size={38} aria-hidden="true" />
      </div>

      <div className="community-forms">
        <form className="community-form" onSubmit={submitNews}>
          <div className="form-title"><Newspaper /><div><h3>Enviar una noticia</h3><p>Pega el enlace original. El sistema revisa seguridad, acceso, fuente, relevancia y duplicidad.</p></div></div>
          <label>Enlace HTTPS<input name="url" type="url" required placeholder="https://medio.com/noticia" /></label>
          <div className="form-row"><label>País desde donde aportas<input name="country" required maxLength={80} placeholder="Colombia" /></label><label className="check-label"><input type="checkbox" checked={newsAnonymous} onChange={(e) => setNewsAnonymous(e.target.checked)} />Enviar de forma anónima</label></div>
          {!newsAnonymous && <label>Tu nombre<input name="submitterName" required maxLength={80} /></label>}
          <input className="honey" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button disabled={sendingNews}>{sendingNews ? "Evaluando…" : "Evaluar y enviar enlace"}</button>
          {newsMessage && <p className="form-message" aria-live="polite">{newsMessage}</p>}
          <p className="form-note"><ShieldCheck size={15} /> Un medio confiable no convierte automáticamente una afirmación en un hecho probado.</p>
        </form>

        <form className="community-form" onSubmit={submitOpinion}>
          <div className="form-title"><MessageSquareText /><div><h3>Publicar una opinión</h3><p>Un aporte por navegador cada 24 horas. Las coincidencias exactas o sustancialmente similares no se vuelven a publicar.</p></div></div>
          <label>Tu opinión<textarea name="comment" required minLength={20} maxLength={1200} rows={5} placeholder="Comparte un argumento concreto…" /></label>
          <div className="form-row"><label>Posición<select name="stance" defaultValue="Neutral"><option>A favor</option><option>En contra</option><option>Neutral</option><option>Mixta</option></select></label><label>País<input name="country" required maxLength={80} placeholder="Colombia" /></label></div>
          <div className="form-row"><label>Departamento / región<input name="department" maxLength={100} /></label><label>Municipio / ciudad<input name="municipality" maxLength={100} /></label></div>
          <label className="check-label"><input type="checkbox" checked={opinionAnonymous} onChange={(e) => setOpinionAnonymous(e.target.checked)} />Publicar de forma anónima</label>
          {!opinionAnonymous && <label>Tu nombre<input name="displayName" required maxLength={80} /></label>}
          <input className="honey" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button disabled={sendingOpinion}>{sendingOpinion ? "Revisando…" : "Publicar opinión"}</button>
          {opinionMessage && <p className="form-message" aria-live="polite">{opinionMessage}</p>}
        </form>
      </div>

      <div className="community-streams">
        <div><div className="stream-title"><h3>Muro de opiniones</h3><span>{opinions.length} recientes</span></div>{opinions.length ? <div className="opinion-list" role="region" aria-label="Opiniones recientes, lista desplazable" tabIndex={0}>{opinions.map((item) => <article className={item.status === "filtered" ? "opinion filtered" : "opinion"} key={item.id}><div><strong>{item.displayName}</strong><span>{item.stance}</span></div><p>{item.comment}</p><small>{[item.municipality, item.department, item.country].filter(Boolean).join(" · ")} · {new Date(item.createdAt).toLocaleDateString("es-CO")}</small>{item.status === "filtered" && <em><AlertTriangle size={13} /> Filtrado, no eliminado</em>}</article>)}</div> : <p className="empty-stream">Aún no hay opiniones. La primera puede ser la tuya.</p>}</div>
        <div><div className="stream-title"><h3>Enlaces aportados</h3><span>{submissions.length} recientes</span></div>{submissions.length ? <div className="submission-list" role="region" aria-label="Enlaces aportados recientemente, lista desplazable" tabIndex={0}>{submissions.map((item) => <article key={item.id}><div><span className={`submission-status status-${item.status}`}>{statusLabel[item.status]}</span><small>{item.country}</small></div><strong>{item.title || item.domain}</strong><p>{item.reason}</p><a href={item.url} target="_blank" rel="noreferrer">{item.domain}<ExternalLink size={13} /></a></article>)}</div> : <p className="empty-stream">Aún no hay enlaces ciudadanos evaluados.</p>}</div>
      </div>
      <div className="community-policy"><CheckCircle2 /><p><strong>Conservar no significa amplificar.</strong> Los insultos y mensajes de odio permanecen almacenados para trazabilidad, pero el texto ofensivo se oculta públicamente. Las opiniones legítimas no se filtran por su postura.</p></div>
    </section>
  );
}
