"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import TurnstileWidget from "./turnstile-widget";

export default function CorrectionRequestForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileReset, setTurnstileReset] = useState(0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const body = { ...Object.fromEntries(new FormData(form)), turnstileToken };
    const response = await fetch("/api/solicitudes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setBusy(false);
    setMessage(response.ok ? "Solicitud recibida. Quedó en la cola privada de revisión y no se publicará automáticamente." : data.error);
    if (turnstileEnabled) setTurnstileReset((value) => value + 1);
    if (response.ok) form.reset();
  }

  return (
    <form className="public-request-form" onSubmit={submit}>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
      <label>Tipo<select name="requestType" required><option>Corrección</option><option>Derecho de réplica</option><option>Actualización</option><option>Retiro de datos personales</option></select></label>
      <label>Asunto<input name="subject" minLength={8} maxLength={160} required /></label>
      <label>Enlace del portal relacionado<input name="relatedUrl" type="url" maxLength={2048} inputMode="url" autoComplete="url" placeholder="https://…" required /></label>
      <label>Explicación<textarea name="explanation" minLength={40} maxLength={2000} rows={6} required /></label>
      <label>Fuente o evidencia adicional (opcional)<input name="evidenceUrl" type="url" maxLength={2048} inputMode="url" placeholder="https://…" /></label>
      <div className="form-row">
        <label>Nombre (opcional)<input name="displayName" minLength={2} maxLength={80} autoComplete="name" /></label>
        <label>Correo de contacto (opcional)<input name="contact" type="email" maxLength={254} autoComplete="email" /></label>
      </div>
      <TurnstileWidget action="submit-correction" resetSignal={turnstileReset} onToken={setTurnstileToken} onEnabled={setTurnstileEnabled} />
      <button disabled={busy || (turnstileEnabled && !turnstileToken)}><Send size={16} />{busy ? "Enviando…" : "Enviar solicitud"}</button>
      {message && <p className="form-feedback">{message}</p>}
      <small>El contenido enviado queda en revisión privada. El correo, si se incluye, se cifra para el seguimiento editorial y nunca se publica.</small>
    </form>
  );
}
