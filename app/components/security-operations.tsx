"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Archive, CheckCircle2, KeyRound, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

type Status = {
  controls: Record<string, boolean>;
  rotation: { lastRegisteredAt: string | null; ageDays: number | null; due: boolean };
  backup: { lastAt: string | null; itemCount: number; ageDays: number | null; due: boolean };
  retention: { lastAt: string | null; ageDays: number | null; due: boolean };
  deliveryAlerts: Array<{ status: string; error: string | null; createdAt: string }>;
  policy: Record<string, number>;
};

const labels: Record<string, string> = { turnstile: "Turnstile", email: "Correo y webhook", auditEncryption: "Cifrado de auditoría", rateLimitSalt: "Seudonimización y límites" };
const date = (value: string | null) => value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Sin registro";

export default function SecurityOperations() {
  const [data, setData] = useState<Status | null>(null); const [busy, setBusy] = useState(""); const [message, setMessage] = useState("");
  const load = useCallback(async () => { const response = await fetch("/api/cotejo-7d41e9c2/maintenance", { cache: "no-store" }); if (response.ok) setData(await response.json()); }, []);
  useEffect(() => { const frame = requestAnimationFrame(() => void load()); return () => cancelAnimationFrame(frame); }, [load]);
  async function run(action: string, success: string) { setBusy(action); setMessage(""); const response = await fetch("/api/cotejo-7d41e9c2/maintenance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) }); const result = await response.json().catch(() => ({})); if (response.ok) { setData(result.status); setMessage(success); } else setMessage(result.error ?? "El control no pudo completarse."); setBusy(""); }
  if (!data) return <section className="security-operations"><p>Comprobando controles operativos…</p></section>;
  return <section className="security-operations" aria-labelledby="operations-title">
    <div className="analytics-section-title"><div><p className="section-kicker">CONTROLES OPERATIVOS</p><h2 id="operations-title">Continuidad, privacidad y alertas</h2></div><ShieldCheck size={28} /></div>
    <div className="operations-controls">{Object.entries(data.controls).map(([key, ok]) => <article key={key} className={ok ? "is-ok" : "is-alert"}>{ok ? <CheckCircle2 /> : <AlertTriangle />}<span>{labels[key] ?? key}</span><strong>{ok ? "Activo" : "Requiere atención"}</strong></article>)}</div>
    <div className="operations-grid">
      <article><KeyRound /><h3>Rotación de secretos</h3><p>Revisión cada 90 días. El registro no cambia las llaves: confirma que fueron rotadas también en Cloudflare y Resend.</p><strong>{data.rotation.due ? "Rotación pendiente" : `Registrada · ${date(data.rotation.lastRegisteredAt)}`}</strong><button disabled={busy !== ""} onClick={() => void run("rotation-ack", "Rotación registrada en la bitácora.")}><CheckCircle2 />Registrar rotación completada</button></article>
      <article><Archive /><h3>Respaldo privado</h3><p>Copia restaurable de la cola, decisiones y eventos, sin tokens, huellas ni datos de contacto.</p><strong>{data.backup.lastAt ? `${data.backup.itemCount} registros · ${date(data.backup.lastAt)}` : "Aún no existe un respaldo"}</strong><button disabled={busy !== ""} onClick={() => void run("backup", "Respaldo privado creado.")}><Archive />Crear respaldo ahora</button></article>
      <article><Trash2 /><h3>Retención mínima</h3><p>Auditoría privada y analítica: 90 días. Eventos de seguridad: 365. Historial editorial: 730.</p><strong>{data.retention.lastAt ? `Última limpieza · ${date(data.retention.lastAt)}` : "Limpieza pendiente"}</strong><button disabled={busy !== ""} onClick={() => void run("retention", "Política de retención aplicada.")}><Trash2 />Aplicar retención</button></article>
      <article><RefreshCw /><h3>Autoprueba</h3><p>Comprueba base de datos, Turnstile, correo, webhook, cifrado y límites sin publicar contenido.</p><strong>{data.deliveryAlerts.length ? `${data.deliveryAlerts.length} fallos recientes de entrega` : "Sin fallos recientes de entrega"}</strong><button disabled={busy !== ""} onClick={() => void run("self-test", "Autoprueba completada.")}><RefreshCw className={busy === "self-test" ? "review-spin" : undefined} />Ejecutar autoprueba</button></article>
    </div>
    {data.deliveryAlerts.length > 0 && <details className="operations-alerts"><summary><AlertTriangle />Alertas de correo recientes</summary><ol>{data.deliveryAlerts.map((item, index) => <li key={`${item.createdAt}-${index}`}><time>{date(item.createdAt)}</time><strong>{item.status}</strong><span>{item.error ?? "Sin detalle"}</span></li>)}</ol></details>}
    {message && <p className="review-message" role="status">{message}</p>}
  </section>;
}
