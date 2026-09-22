"use client";

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/";
const MESSAGE = "Te invito a ver Cuenta pública, un proyecto creado por Carlos Orozco que busca visibilizar el tiempo del mandato presidencial, organizar noticias con sus fuentes y abrir la participación ciudadana.";

export default function SocialShare() {
  const [notice, setNotice] = useState("");

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=650");
  }

  async function shareLinkedIn() {
    await navigator.clipboard.writeText(`${MESSAGE}\n\n${SITE_URL}`);
    setNotice("Texto copiado. Pégalo en LinkedIn y selecciona a Carlos Orozco para etiquetarlo.");
    open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`);
  }

  async function shareNative() {
    if (navigator.share) await navigator.share({ title: "Cuenta pública", text: MESSAGE, url: SITE_URL });
    else { await navigator.clipboard.writeText(`${MESSAGE}\n\n${SITE_URL}`); setNotice("Texto y enlace copiados."); }
  }

  return (
    <section className="share-site" aria-labelledby="share-site-title">
      <div><p className="section-kicker">COMPARTE EL PROYECTO</p><h2 id="share-site-title">Ayuda a que más personas lo conozcan.</h2></div>
      <div className="share-actions">
        <button onClick={shareLinkedIn}><b aria-hidden="true">in</b> LinkedIn</button>
        <button onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${MESSAGE}\n\n${SITE_URL}`)}`)}><MessageCircle size={17} /> WhatsApp</button>
        <button onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(MESSAGE)}&url=${encodeURIComponent(SITE_URL)}`)}>𝕏 X</button>
        <button onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`)}>f Facebook</button>
        <button onClick={shareNative}><Share2 size={17} /> Más opciones</button>
      </div>
      {notice && <p className="share-notice" aria-live="polite">{notice}</p>}
    </section>
  );
}
