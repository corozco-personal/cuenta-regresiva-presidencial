"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, Copy, Mail, Rss } from "lucide-react";
import TurnstileWidget from "./turnstile-widget";

const topics = ["Todas las noticias", "Justicia y control", "Seguridad y defensa", "Economía", "Relaciones exteriores", "Elecciones", "Derechos", "Gobierno"];
const hours = Array.from({ length: 24 }, (_, hour) => hour);

function hourLabel(hour: number) {
  const period = hour < 12 ? "a. m." : "p. m.";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

export default function AlertPreferences() {
  const [topic, setTopic] = useState(topics[0]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState("");
  const [email, setEmail] = useState("");
  const [preferredHour, setPreferredHour] = useState(18);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pageState, setPageState] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const value = localStorage.getItem("cuenta-publica-alert-topic");
      if (value && topics.includes(value)) setTopic(value);
      setPageState(new URLSearchParams(location.search).get("estado") ?? "");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const onToken = useCallback((token: string) => setTurnstileToken(token), []);
  const onEnabled = useCallback((enabled: boolean) => setTurnstileEnabled(enabled), []);
  const feedUrl = useMemo(() => `/feed.xml${topic === topics[0] ? "" : `?category=${encodeURIComponent(topic)}`}`, [topic]);

  function saveTopic() {
    localStorage.setItem("cuenta-publica-alert-topic", topic);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function copyFeed(path: string) {
    await navigator.clipboard.writeText(`${location.origin}${path}`);
    setCopied(path);
    setTimeout(() => setCopied(""), 1800);
  }

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    setSubmitState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/suscripciones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, preferredHour, consent, turnstileToken }),
      });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "No fue posible registrar la suscripción.");
      setSubmitState("sent");
      setMessage(data.message ?? "Revisa tu correo para confirmar la suscripción.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "No fue posible registrar la suscripción.");
    } finally {
      setResetSignal((value) => value + 1);
    }
  }

  const channels = [
    { title: "Noticias", description: "Cobertura filtrada por el tema seleccionado.", path: feedUrl },
    { title: "Promesas", description: "Cambios de estado, avance y revisión documental.", path: "/feed/promesas.xml" },
    { title: "Correcciones", description: "Rectificaciones y cambios editoriales publicados.", path: "/feed/correcciones.xml" },
  ];

  return <>
    {pageState === "confirmada" && <div className="newsletter-result success" role="status"><Check /> Suscripción confirmada. El próximo resumen llegará a la hora elegida.</div>}
    {pageState === "cancelada" && <div className="newsletter-result success" role="status"><Check /> Suscripción cancelada. No recibirás más resúmenes diarios.</div>}
    {pageState === "invalida" && <div className="newsletter-result error" role="alert">El enlace no es válido o ya fue utilizado.</div>}
    <div className="alerts-grid newsletter-grid">
      <section>
        <Mail size={26} />
        <p className="section-kicker">RESUMEN POR CORREO</p>
        <h2>Las noticias del día, a la hora que elijas</h2>
        <p>Recibe una lista compacta con el titular, el medio y el enlace a cada noticia incorporada ese día.</p>
        <form className="newsletter-form" onSubmit={subscribe}>
          <label><span>Correo electrónico</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="nombre@correo.com" required maxLength={254} /></label>
          <label><span>Hora de envío · Colombia</span><select value={preferredHour} onChange={(event) => setPreferredHour(Number(event.target.value))}>{hours.map((hour) => <option value={hour} key={hour}>{hourLabel(hour)}</option>)}</select></label>
          <label className="newsletter-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Acepto recibir un resumen diario. Puedo cancelar la suscripción desde cualquier correo.</span></label>
          <TurnstileWidget action="newsletter_subscribe" resetSignal={resetSignal} onToken={onToken} onEnabled={onEnabled} />
          <button type="submit" disabled={submitState === "sending" || !consent || (turnstileEnabled && !turnstileToken)}><Bell size={17} /> {submitState === "sending" ? "Registrando…" : "Quiero recibir el resumen"}</button>
          {message && <p className={`newsletter-message ${submitState}`} role={submitState === "error" ? "alert" : "status"}>{message}</p>}
        </form>
        <p className="newsletter-privacy">Primero te enviaremos un enlace de confirmación. El correo se guarda cifrado y solo se usa para este resumen.</p>
      </section>
      <section>
        <Rss size={26} />
        <p className="section-kicker">CANALES ABIERTOS</p>
        <h2>Prefiere RSS si no quieres usar correo</h2>
        <p>Elige un tema y crea un canal compatible con Feedly, Inoreader y otros lectores. Esta preferencia se guarda solo en tu navegador.</p>
        <label><span>Tema prioritario</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={saveTopic}>{saved ? <Check size={17} /> : <Rss size={17} />} {saved ? "Preferencia guardada" : "Guardar tema"}</button>
      </section>
    </div>
    <div className="alert-channel-list">{channels.map((channel) => <article key={channel.title}><div><strong>{channel.title}</strong><p>{channel.description}</p></div><a href={channel.path} target="_blank">Abrir <Rss size={14} /></a><button onClick={() => copyFeed(channel.path)}>{copied === channel.path ? <Check size={14} /> : <Copy size={14} />} {copied === channel.path ? "Copiado" : "Copiar"}</button></article>)}</div>
  </>;
}
