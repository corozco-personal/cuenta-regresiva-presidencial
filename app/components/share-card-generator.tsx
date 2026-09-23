"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Image as ImageIcon, QrCode } from "lucide-react";
import QRCode from "qrcode";
import ShareOptions from "./share-options";
import { clientPlainText } from "../data/client-input";

const SITE_URL = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/";
const presets = [
  "Un portal para seguir hechos, fuentes y promesas del periodo presidencial.",
  "Las promesas se verifican con evidencia, plazos y estados públicos.",
  "Noticias nacionales e internacionales, agrupadas y trazables desde la campaña.",
];
const SCALE = 5;

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}

async function pngAt500Dpi(canvas: HTMLCanvasElement) {
  const original = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("png-export")), "image/png", 1));
  const source = new Uint8Array(await original.arrayBuffer());
  const chunk = new Uint8Array(21); const view = new DataView(chunk.buffer);
  view.setUint32(0, 9); chunk.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  view.setUint32(8, 19685); view.setUint32(12, 19685); chunk[16] = 1; // 500 ppp en píxeles por metro
  view.setUint32(17, crc32(chunk.slice(4, 17)));
  const insertion = 33; const output = new Uint8Array(source.length + chunk.length);
  output.set(source.slice(0, insertion), 0); output.set(chunk, insertion); output.set(source.slice(insertion), insertion + chunk.length);
  return new Blob([output], { type: "image/png" });
}

function writeWrapped(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" "); let line = ""; let cursor = y;
  for (const word of words) { const test = `${line}${word} `; if (context.measureText(test).width > maxWidth && line) { context.fillText(line.trim(), x, cursor); line = `${word} `; cursor += lineHeight; } else line = test; }
  context.fillText(line.trim(), x, cursor); return cursor;
}

export default function ShareCardGenerator() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState(presets[0]);
  const [ready, setReady] = useState(false);

  const draw = useCallback(async () => {
    const target = canvas.current; const context = target?.getContext("2d"); if (!target || !context) return;
    target.width = 1200 * SCALE; target.height = 630 * SCALE; context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.fillStyle = "#163d36"; context.fillRect(0, 0, 1200, 630);
    context.strokeStyle = "#e6ff5e"; context.lineWidth = 3; context.strokeRect(54, 54, 1092, 522);
    context.fillStyle = "#e6ff5e"; context.font = "700 24px Arial"; context.fillText("CUENTA PÚBLICA", 90, 120);
    context.fillStyle = "#fffef9"; context.font = "56px Georgia"; writeWrapped(context, text, 90, 220, 790, 70);
    const qrData = await QRCode.toDataURL(SITE_URL, { width: 720, margin: 1, errorCorrectionLevel: "H", color: { dark: "#163d36", light: "#fffef9" } });
    const qr = new Image(); qr.src = qrData; await qr.decode();
    context.fillStyle = "#fffef9"; context.fillRect(928, 188, 182, 182); context.drawImage(qr, 940, 200, 158, 158);
    context.fillStyle = "#b8c3bf"; context.font = "18px Arial"; context.fillText("Escanear QR", 955, 396);
    context.fillStyle = "#b8c3bf"; context.font = "20px Arial"; context.fillText("cuenta-regresiva-presidencial.carlos940807.chatgpt.site", 90, 515);
    context.fillStyle = "#fffef9"; context.font = "700 20px Arial"; context.fillText("Creado por Carlos Orozco", 90, 552);
    setReady(true);
  }, [text]);

  useEffect(() => { const frame = requestAnimationFrame(() => { void draw(); }); return () => cancelAnimationFrame(frame); }, [draw]);

  async function download() {
    await draw(); const target = canvas.current; if (!target) return;
    const blob = await pngAt500Dpi(target); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.download = "cuenta-publica-500ppp.png"; link.href = url; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="share-card-tool">
    <section>
      <ImageIcon aria-hidden="true" /><h2>Crea una tarjeta</h2><p>La exportación tiene 6.000 × 3.150 px: resolución suficiente para producir una pieza de 12 × 6,3 pulgadas a 500 ppp. Incluye un QR directo al portal.</p>
      <label>Mensaje<select value={text} onChange={(event) => setText(event.target.value)}>{presets.map((preset) => <option key={preset}>{preset}</option>)}</select></label>
      <label>Personalizar<textarea value={text} onChange={(event) => setText(clientPlainText(event.target.value, 150))} maxLength={150} rows={4} /></label>
      <p className="share-card-qr-note"><QrCode size={17} /> Escanear QR</p>
      <div className="share-card-actions">
        <button onClick={() => void download()} disabled={!ready}><Download size={16} />Descargar PNG · 500 ppp</button>
        <ShareOptions mode="inline" context="site" />
      </div>
    </section>
    <canvas ref={canvas} width={6000} height={3150} aria-label="Vista previa de la tarjeta con código QR" />
  </div>;
}
