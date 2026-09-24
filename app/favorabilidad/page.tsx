import type { Metadata } from "next";
import FavorabilityDashboard from "../components/favorability-dashboard";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Opinión de participantes y encuestas · Cuenta pública", description: "Opiniones autoseleccionadas del portal, tono de titulares y espacio separado para encuestas profesionales.", alternates: { canonical: "/favorabilidad" } };

export default function FavorabilityPage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">OPINIÓN Y ENCUESTAS</p><h1>Señales distintas, sin mezclarlas.</h1><p>La participación del portal no es favorabilidad nacional. Las encuestas profesionales, cuando existan, se mostrarán aparte con firma, muestra, trabajo de campo, margen de error y patrocinador.</p></section><section className="subpage-content"><FavorabilityDashboard /></section></main>;
}
