"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Copy, Rss } from "lucide-react";

const topics = ["Todas las noticias", "Promesas", "Justicia y control", "Seguridad y defensa", "Economía", "Relaciones exteriores"];

export default function AlertPreferences() {
  const [topic, setTopic] = useState(topics[0]); const [saved, setSaved] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { const frame = window.requestAnimationFrame(() => { const value = window.localStorage.getItem("cuenta-publica-alert-topic"); if (value && topics.includes(value)) setTopic(value); }); return () => window.cancelAnimationFrame(frame); }, []);
  function save() { window.localStorage.setItem("cuenta-publica-alert-topic", topic); setSaved(true); window.setTimeout(() => setSaved(false), 1800); }
  async function copyFeed() { await navigator.clipboard.writeText(`${window.location.origin}/feed.xml`); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <div className="alerts-grid"><section><Bell size={26} /><p className="section-kicker">PREFERENCIA LOCAL</p><h2>Elige el tema que quieres seguir</h2><p>Esta selección se guarda solo en tu navegador y no crea una cuenta ni envía datos personales.</p><label><span>Tema prioritario</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label><button onClick={save}>{saved ? <Check size={17} /> : <Bell size={17} />}{saved ? "Preferencia guardada" : "Guardar en este navegador"}</button></section><section><Rss size={26} /><p className="section-kicker">ALERTA RSS</p><h2>Recibe cada actualización</h2><p>Agrega el canal público a Feedly, Inoreader, NetNewsWire o cualquier lector RSS. El canal se renueva con el monitor cada seis horas.</p><a href="/feed.xml" target="_blank">Abrir canal RSS <Rss size={16} /></a><button className="secondary" onClick={copyFeed}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Enlace copiado" : "Copiar enlace del canal"}</button></section></div>;
}
