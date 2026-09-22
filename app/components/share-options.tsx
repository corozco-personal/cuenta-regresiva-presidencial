"use client";

import { useState } from "react";
import { Check, MessageCircleMore, MoreHorizontal, Share2 } from "lucide-react";
import LinkedInIcon from "./linkedin-icon";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.5 8.5V6.7c0-.8.5-1 1-1h2.6V2.1L14.9 2C11.6 2 10 4 10 6.4v2.1H7v4h3V22h4.5v-9.5h3.1l.5-4h-3.6Z" /></svg>;
}

function XIcon({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.3 2H22l-8.1 9.3L23.4 22H16l-5.8-7.6L3.6 22H0l8.5-9.7L-.6 2H7l5.2 6.9L18.3 2Zm-1.3 18h2L5.9 3.9H3.8L17 20Z" /></svg>;
}

type Props = { title?: string; url?: string; mode?: "inline" | "menu"; context?: "site" | "news" };

export default function ShareOptions({ title = "Cuenta pública", url = SITE_URL, mode = "menu", context = "news" }: Props) {
  const [notice, setNotice] = useState("");
  const absoluteUrl = () => url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const message = () => context === "site"
    ? "Te invito a conocer Cuenta pública, un proyecto independiente creado por Carlos Orozco para visualizar el tiempo restante del mandato presidencial, contrastar noticias con fuentes trazables y facilitar una participación ciudadana responsable."
    : `Te invito a contrastar esta cobertura en Cuenta pública: “${title}”. El portal reúne las fuentes disponibles y explica su metodología.`;

  function open(target: string) { window.open(target, "_blank", "noopener,noreferrer,width=720,height=650"); }
  async function copyAndOpen(target: string, copiedMessage: string) {
    await navigator.clipboard.writeText(`${message()}\n\n${absoluteUrl()}`);
    setNotice(copiedMessage);
    window.setTimeout(() => setNotice(""), 2200);
    open(target);
  }
  async function more() {
    if (navigator.share) await navigator.share({ title, text: message(), url: absoluteUrl() });
    else { await navigator.clipboard.writeText(`${message()}\n\n${absoluteUrl()}`); setNotice("Enlace copiado"); }
  }

  const actions = <div className="share-option-actions" aria-label={`Compartir ${title}`}>
    <button aria-label="Compartir en LinkedIn" title="LinkedIn" onClick={() => copyAndOpen(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteUrl())}`, "Texto copiado para LinkedIn")}><LinkedInIcon size={16} aria-hidden="true" /><span>LinkedIn</span></button>
    <button aria-label="Compartir en WhatsApp" title="WhatsApp" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${message()}\n\n${absoluteUrl()}`)}`)}><MessageCircleMore size={17} /><span>WhatsApp</span></button>
    <button aria-label="Compartir en Facebook" title="Facebook" onClick={() => copyAndOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl())}`, "Texto copiado para Facebook")}><FacebookIcon /><span>Facebook</span></button>
    <button aria-label="Compartir en X" title="X" onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message())}&url=${encodeURIComponent(absoluteUrl())}`)}><XIcon /><span>X</span></button>
    <button aria-label="Más opciones para compartir" title="Más opciones" onClick={more}><MoreHorizontal size={18} /><span>Más opciones</span></button>
  </div>;

  if (mode === "inline") return <div className="share-options share-options-inline">{actions}{notice && <small className="share-option-notice"><Check size={12} />{notice}</small>}</div>;
  return <details className="share-options share-options-menu"><summary aria-label={`Opciones para compartir ${title}`}><Share2 size={16} /></summary><div className="share-options-popover">{actions}{notice && <small className="share-option-notice"><Check size={12} />{notice}</small>}</div></details>;
}
