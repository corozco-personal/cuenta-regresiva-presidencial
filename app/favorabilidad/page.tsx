import type { Metadata } from "next";
import Link from "../components/native-link";
import FavorabilityDashboard from "../components/favorability-dashboard";

export const metadata: Metadata = { title: "Favorabilidad e indicadores · Cuenta pública", description: "Indicadores transparentes basados en opiniones ciudadanas, tono de titulares y aportes de noticias.", alternates: { canonical: "/favorabilidad" } };

export default function FavorabilityPage() {
  return <main className="subpage"><header className="subpage-header"><Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link><nav><Link href="/">Inicio</Link><Link href="/presidente">Presidente</Link><Link href="/archivo">Archivo</Link><Link href="/fuentes">Fuentes</Link><Link href="/metodologia">Metodología</Link><Link href="/autor">Quién soy</Link></nav></header><section className="subpage-hero"><p className="section-kicker">FAVORABILIDAD E INDICADORES</p><h1>Señales distintas, sin mezclarlas.</h1><p>Las opiniones muestran la postura de quienes participan. Los titulares muestran tono de cobertura. Ninguna de estas métricas, por sí sola, representa a todo el país.</p></section><section className="subpage-content"><FavorabilityDashboard /></section></main>;
}
