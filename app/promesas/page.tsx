import type { Metadata } from "next";
import PromiseExplorer from "../components/promise-explorer";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Promesas de campaña",
  description: "Seguimiento documentado de las promesas de campaña, sus plazos, evidencias y estado de cumplimiento.",
  alternates: { canonical: "/promesas" },
};

export default function PromisesPage() {
  return <main className="subpage promises-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">PROMESAS DE CAMPAÑA</p><h1>Del discurso<br />a la evidencia.</h1><p>Seguimiento público con estados matizados, plazos y fuentes. El portal distingue entre anunciar, ejecutar y cumplir para evitar conclusiones que los datos todavía no permiten.</p></section><section className="subpage-content"><PromiseExplorer /></section></main>;
}
