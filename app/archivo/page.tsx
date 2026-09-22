import type { Metadata } from "next";
import ArchiveExplorer from "../components/archive-explorer";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Archivo documental · Cuenta pública", description: "Hechos documentados del periodo presidencial, con enlaces a sus fuentes originales.", alternates: { canonical: "/archivo" } };

export default function ArchivePage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">ARCHIVO DOCUMENTAL</p><h1>Hechos con fuente original.</h1><p>La cronología comienza el 16 de julio de 2025, con el anuncio de la precandidatura y el comité de firmas. Busca por tema, fuente, alcance o etapa.</p></section><section className="subpage-content"><ArchiveExplorer /></section></main>;
}
