"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
type RequestRow = { id: string; requestType: string; subject: string; relatedUrl: string; status: string; publicSummary: string; createdAt: string };
export default function CorrectionRequestForm() {
  const [rows, setRows] = useState<RequestRow[]>([]); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/solicitudes").then((r) => r.json()).then((d) => setRows(d.requests ?? [])).catch(() => {});
  useEffect(() => { load(); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); const form = event.currentTarget; const body = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/solicitudes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json();
    setBusy(false); setMessage(response.ok ? "Solicitud recibida. Su estado público ya aparece en la cola." : data.error); if (response.ok) { form.reset(); load(); }
  }
  return <div className="request-layout"><form className="public-request-form" onSubmit={submit}><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" /><label>Tipo<select name="requestType" required><option>Corrección</option><option>Derecho de réplica</option><option>Actualización</option><option>Retiro de datos personales</option></select></label><label>Asunto<input name="subject" minLength={8} maxLength={160} required /></label><label>Enlace del portal relacionado<input name="relatedUrl" type="url" placeholder="https://…" required /></label><label>Explicación<textarea name="explanation" minLength={40} maxLength={2000} rows={6} required /></label><label>Fuente o evidencia adicional (opcional)<input name="evidenceUrl" type="url" placeholder="https://…" /></label><div className="form-row"><label>Nombre (opcional)<input name="displayName" /></label><label>Correo de contacto (opcional)<input name="contact" type="email" /></label></div><button disabled={busy}><Send size={16} />{busy ? "Enviando…" : "Enviar solicitud"}</button>{message && <p className="form-feedback">{message}</p>}<small>El correo, si se incluye, se transforma en una huella irreversible y nunca se publica.</small></form><section className="request-queue"><p className="section-kicker">COLA PÚBLICA</p><h2>Estado de solicitudes</h2>{rows.length ? rows.map((row) => <article key={row.id}><span>{row.status}</span><strong>{row.publicSummary}</strong><time>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(row.createdAt))}</time><a href={row.relatedUrl} target="_blank" rel="noreferrer">Ver referencia</a></article>) : <p>Aún no hay solicitudes registradas.</p>}</section></div>;
}
