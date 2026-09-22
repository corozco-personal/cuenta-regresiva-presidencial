import type { Metadata } from "next";
import FavorabilityDashboard from "../components/favorability-dashboard";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Favorabilidad e indicadores · Cuenta pública", description: "Indicadores transparentes basados en opiniones ciudadanas, tono de titulares y aportes de noticias.", alternates: { canonical: "/favorabilidad" } };

export default function FavorabilityPage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">FAVORABILIDAD E INDICADORES</p><h1>Señales distintas, sin mezclarlas.</h1><p>Las opiniones muestran la postura de quienes participan. Los titulares muestran tono de cobertura. Ninguna de estas métricas, por sí sola, representa a todo el país.</p></section><section className="subpage-content"><FavorabilityDashboard /></section></main>;
}
