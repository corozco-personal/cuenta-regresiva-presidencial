"use client";

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import LinkedInIcon from "./linkedin-icon";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/";
const MESSAGES = {
  linkedin: `Te invito a conocer Cuenta pública, un proyecto independiente creado por Carlos Orozco (https://www.linkedin.com/in/corozco9408/) para visualizar el tiempo restante del mandato presidencial, reunir noticias nacionales e internacionales con fuentes trazables y facilitar una participación ciudadana responsable.\n\nExplora el contador, los indicadores, la metodología y el archivo documental.\n\n#Transparencia #Datos #Colombia`,
  whatsapp: `Te comparto Cuenta pública 👇\n\nEs un proyecto independiente creado por Carlos Orozco para consultar cuánto tiempo resta del mandato presidencial, revisar noticias con sus fuentes y participar enviando noticias u opiniones.\n\nPuedes verlo aquí:`,
  facebook: `Te invito a visitar Cuenta pública, un proyecto independiente creado por Carlos Orozco que busca hacer más visible y comprensible el seguimiento del mandato presidencial.\n\nEl sitio reúne un contador en tiempo real, noticias nacionales e internacionales, fuentes consultables, indicadores de opinión y espacios de participación ciudadana.\n\nConócelo, revisa sus fuentes y compártelo con quien pueda interesarle.`,
  x: "Conoce Cuenta pública: contador del mandato presidencial, noticias con fuentes, indicadores y participación ciudadana. Un proyecto independiente creado por Carlos Orozco.",
};

export default function SocialShare() {
  const [notice, setNotice] = useState("");

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=650");
  }

  async function shareLinkedIn() {
    await navigator.clipboard.writeText(`${MESSAGES.linkedin}\n\n${SITE_URL}`);
    setNotice("Texto copiado. Pégalo en LinkedIn y selecciona a Carlos Orozco para etiquetarlo.");
    open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`);
  }

  async function shareFacebook() {
    await navigator.clipboard.writeText(`${MESSAGES.facebook}\n\n${SITE_URL}`);
    setNotice("Mensaje para Facebook copiado. Pégalo en la publicación que acaba de abrirse.");
    open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`);
  }

  async function shareNative() {
    if (navigator.share) await navigator.share({ title: "Cuenta pública", text: MESSAGES.whatsapp, url: SITE_URL });
    else { await navigator.clipboard.writeText(`${MESSAGES.whatsapp}\n\n${SITE_URL}`); setNotice("Texto y enlace copiados."); }
  }

  return (
    <section className="share-site" aria-labelledby="share-site-title">
      <div><p className="section-kicker">COMPARTE EL PROYECTO</p><h2 id="share-site-title">Ayuda a que más personas lo conozcan.</h2></div>
      <div className="share-actions">
        <button onClick={shareLinkedIn}><LinkedInIcon size={17} aria-hidden="true" /> LinkedIn</button>
        <button onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${MESSAGES.whatsapp}\n\n${SITE_URL}`)}`)}><MessageCircle size={17} /> WhatsApp</button>
        <button onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(MESSAGES.x)}&url=${encodeURIComponent(SITE_URL)}`)}>𝕏 X</button>
        <button onClick={shareFacebook}>f Facebook</button>
        <button onClick={shareNative}><Share2 size={17} /> Más opciones</button>
      </div>
      {notice && <p className="share-notice" aria-live="polite">{notice}</p>}
    </section>
  );
}
