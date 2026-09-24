import type { Metadata } from "next";
import AlertPreferences from "../components/alert-preferences";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Alertas y resumen diario",
  description: "Recibe por correo las noticias del día a la hora que elijas o sigue los canales RSS de Cuenta pública.",
  alternates: { canonical: "/alertas" },
};

export default function AlertsPage() {
  return <main className="subpage alerts-page">
    <SubpageHeader />
    <section className="subpage-hero"><p className="section-kicker">ALERTAS Y CANALES</p><h1>El día en tu<br />correo.</h1><p>Un envío diario, a la hora que elijas, con las noticias incorporadas al seguimiento presidencial y enlaces a sus fuentes.</p></section>
    <section className="subpage-content"><AlertPreferences /></section>
  </main>;
}
