import type { Metadata } from "next";
import GovernmentDashboard from "../components/government-dashboard";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Así va el Gobierno",
  description: "Tablero de decisiones, presupuesto, agenda legislativa, gabinete, expedientes e impacto territorial del mandato presidencial.",
  alternates: { canonical: "/gestion" },
};

export default function GovernmentPage() {
  return <main className="subpage government-page">
    <SubpageHeader />
    <section className="government-intro"><p className="section-kicker">RENDICIÓN DE CUENTAS</p><h1>Así va<br />el Gobierno.</h1><p>Una lectura de gestión que conecta promesas, decisiones, normas, dinero público y resultados. Lo que todavía no puede comprobarse también queda visible.</p></section>
    <section className="government-content"><GovernmentDashboard /></section>
  </main>;
}
