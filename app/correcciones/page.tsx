import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";
import CorrectionRequestForm from "../components/correction-request-form";
import { correctionLog } from "../data/corrections";

export const metadata: Metadata = { title: "Correcciones y cambios", description: "Bitácora pública de correcciones editoriales y cambios metodológicos de Cuenta pública.", alternates: { canonical: "/correcciones" } };
export default function CorrectionsPage() { return <main className="subpage corrections-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">BITÁCORA PÚBLICA</p><h1>Corregir también<br />es informar.</h1><p>Registro permanente de cambios que alteran etiquetas, conclusiones, datos o reglas editoriales. También puedes solicitar una corrección, actualización o derecho de réplica.</p></section><section className="subpage-content"><div className="corrections-table public-corrections" role="table" aria-label="Bitácora de correcciones">{correctionLog.map((entry) => <div className="correction-row" role="row" key={`${entry.date}-${entry.item}`}><time>{entry.date}</time><strong>{entry.item}</strong><p><s>{entry.before}</s><br />{entry.after}</p><p>{entry.reason}</p></div>)}</div><CorrectionRequestForm /></section></main>; }
