import type { Metadata } from "next";
import SourceDirectory from "../components/source-directory";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Fuentes · Cuenta pública", description: "Directorio público de entidades oficiales y medios consultados por Cuenta pública.", alternates: { canonical: "/fuentes" } };

export default function SourcesPage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">FUENTES</p><h1>De dónde viene la información.</h1><p>Directorio de entidades oficiales y medios nacionales, internacionales y regionales incluidos en el monitoreo. Estar en la lista no significa que cada afirmación del medio esté confirmada.</p></section><section className="subpage-content"><SourceDirectory /></section></main>;
}
