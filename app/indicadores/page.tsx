import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";
import CountryContextDashboard from "../components/country-context-dashboard";

export const metadata: Metadata = { title: "Indicadores del país", description: "Indicadores económicos oficiales y seguimiento verificable a mecanismos asesores del Gobierno.", alternates: { canonical: "/indicadores" } };
export default function IndicatorsPage() { return <main className="subpage country-indicators"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">CONTEXTO DEL PAÍS</p><h1>Datos para medir<br />el mandato.</h1><p>Indicadores oficiales y seguimiento institucional para observar resultados sin convertir correlaciones en conclusiones políticas.</p></section><section className="subpage-content"><CountryContextDashboard /></section></main>; }
