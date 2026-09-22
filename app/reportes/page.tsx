import type { Metadata } from "next";
import Link from "../components/native-link";
import AnalyticsDashboard from "../components/analytics-dashboard";

export const metadata: Metadata = {
  title: "Audiencia y reportes · Cuenta pública",
  description: "Usuarios activos, visitas e interacciones anónimas de Cuenta pública.",
  alternates: { canonical: "/reportes" },
};

export default function ReportsPage() {
  return <main className="subpage reports-page"><header className="subpage-header"><Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link><nav><Link href="/">Inicio</Link><Link href="/presidente">Presidente</Link><Link href="/#monitoreo">Noticias</Link><Link href="/favorabilidad">Indicadores</Link><Link href="/archivo">Archivo</Link><Link href="/autor">Quién soy</Link></nav></header><section className="reports-heading"><div><p className="section-kicker">AUDIENCIA Y REPORTES</p><h1>Cómo se usa<br />Cuenta pública.</h1></div><p>Actividad agregada y anónima del sitio. Los indicadores se actualizan automáticamente y pueden descargarse para análisis.</p></section><AnalyticsDashboard /></main>;
}
