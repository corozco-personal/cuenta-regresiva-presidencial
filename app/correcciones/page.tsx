import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Correcciones y cambios", description: "Bitácora pública de correcciones editoriales y cambios metodológicos de Cuenta pública.", alternates: { canonical: "/correcciones" } };
const entries = [
  { date: "22 sep 2026", item: "Trazabilidad de la IA", before: "100 % verificable", after: "100 % trazable", reason: "Una fuente consultable permite comprobar el origen, pero no garantiza por sí sola que todas sus afirmaciones sean verdaderas." },
  { date: "22 sep 2026", item: "Estados de promesas", before: "Cumplida / Pendiente", after: "Seis estados editoriales", reason: "Distinguir ejecución, plazo abierto, vencimiento, incumplimiento y ausencia de evidencia." },
  { date: "22 sep 2026", item: "Etiqueta editorial", before: "Aprobado", after: "Admitido para monitoreo", reason: "Evitar que admitir una fuente se interprete como certificar todas sus afirmaciones." },
  { date: "21 sep 2026", item: "Política de correcciones", before: "Sin registro público", after: "Bitácora pública incorporada", reason: "Hacer visibles los cambios editoriales y su justificación." },
];
export default function CorrectionsPage() { return <main className="subpage corrections-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">BITÁCORA PÚBLICA</p><h1>Corregir también<br />es informar.</h1><p>Registro permanente de cambios que alteran etiquetas, conclusiones, datos o reglas editoriales. Los ajustes puramente tipográficos no se incluyen.</p></section><section className="subpage-content"><div className="corrections-table public-corrections" role="table" aria-label="Bitácora de correcciones">{entries.map((entry) => <div className="correction-row" role="row" key={`${entry.date}-${entry.item}`}><time>{entry.date}</time><strong>{entry.item}</strong><p><s>{entry.before}</s><br />{entry.after}</p><p>{entry.reason}</p></div>)}</div></section></main>; }
