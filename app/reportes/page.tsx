import type { Metadata } from "next";
import AnalyticsDashboard from "../components/analytics-dashboard";
import SubpageHeader from "../components/subpage-header";
import SecurityReport from "../components/security-report";

export const metadata: Metadata = {
  title: "Audiencia y reportes · Cuenta pública",
  description: "Usuarios activos, visitas e interacciones anónimas de Cuenta pública.",
  alternates: { canonical: "/reportes" },
};

export default function ReportsPage() {
  return <main className="subpage reports-page"><SubpageHeader /><section className="reports-heading"><div><p className="section-kicker">AUDIENCIA Y REPORTES</p><h1>Cómo se usa<br />Cuenta pública.</h1></div><p>Actividad agregada y anónima del sitio. Los indicadores se actualizan automáticamente y pueden descargarse para análisis.</p></section><AnalyticsDashboard /><SecurityReport /></main>;
}
