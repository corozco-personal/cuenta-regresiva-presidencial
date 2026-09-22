import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Archivo documental · Cuenta pública", description: "Hechos documentados del periodo presidencial, con enlaces a sus fuentes originales.", alternates: { canonical: "/archivo" } };

const records = [
  ["30 ago 2026", "Nacional · Instituciones", "Pronunciamiento publicado por la Presidencia en cumplimiento de un fallo de tutela", "Presidencia de la República", "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx"],
  ["17 jun 2026", "Nacional · Control electoral", "Resolución del CNE sobre la solicitud de revocatoria de la inscripción presidencial", "Consejo Nacional Electoral", "https://www.cne.gov.co/resoluciones-cne-2026/13792?layout=print&print=1&tmpl=component"],
  ["30 ene 2026", "Nacional · Registro electoral", "Informe de la Registraduría sobre los apoyos recibidos por la candidatura", "Registraduría Nacional", "https://www.registraduria.gov.co/IMG/pdf/20260130_informe_de_gestion_institucional_2025.pdf"],
  ["13 sep 2026", "Nacional · Justicia", "Declaraciones del presidente sobre decisiones judiciales", "Noticias Caracol", "https://www.noticiascaracol.com/politica/respeto-a-la-justicia-dice-de-la-espriella-al-controvertir-fallos-contra-decisiones-del-gobierno-rg10?_amp=true"],
  ["10 sep 2026", "Internacional · Derechos", "Orden judicial relacionada con publicaciones oficiales en redes", "DW Español", "https://amp.dw.com/es/de-la-espriella-tendr%C3%A1-que-retirar-sus-publicaciones-mostrando-cad%C3%A1veres-en-redes/a-79210565"],
  ["07 sep 2026", "Internacional · Relaciones exteriores", "Análisis internacional sobre el giro de la política exterior colombiana", "El País", "https://elpais.com/america-colombia/2026-09-07/del-escudo-de-las-americas-a-los-altos-del-golan-de-la-espriella-cumple-la-promesa-de-alinearse-con-trump-y-netanyahu.html"],
  ["25 jun 2026", "Internacional · Elecciones", "Cobertura de la proclamación del presidente electo por el CNE", "DW Español", "https://amp.dw.com/es/abelardo-de-la-espriella-es-proclamado-presidente-electo-de-colombia/a-77698790"],
  ["04 dic 2025", "Internacional · Campaña", "Entrega de firmas para avalar la candidatura presidencial", "Agencia EFE", "https://efe.com/mundo/2025-12-04/candidato-abelardo-de-la-espriella-colombia-presidencia-campana/"],
  ["04 nov 2025", "Internacional · Campaña", "Cobertura de la convención nacional de Defensores de la Patria", "El País", "https://elpais.com/america-colombia/2025-11-04/el-candidato-ultra-abelardo-de-la-espriella-se-da-un-bano-de-masas-en-un-congreso-en-bogota-el-tigre-ha-despertado.html"],
  ["17 jul 2025", "Nacional · Campaña", "Confirmación de la candidatura presidencial y apertura de la recolección de firmas", "Caracol Radio", "https://caracol.com.co/2025/07/17/no-me-arrodillo-peleo-abelardo-de-la-espriella-confirma-su-candidatura-presidencial-para-2026/?outputType=amp"],
];

export default function ArchivePage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">ARCHIVO DOCUMENTAL</p><h1>Hechos con fuente original.</h1><p>La cronología comienza el 16 de julio de 2025, con el anuncio de la precandidatura y el comité de firmas. Cada registro conserva fecha, etapa, alcance y vínculo de consulta.</p></section><section className="subpage-content"><div className="subpage-links">{records.map(([date, scope, title, source, url]) => <article key={url}><small>{date} · {scope}</small><h2>{title}</h2><a href={url} target="_blank" rel="noreferrer">{source}<ExternalLink size={14} /></a></article>)}</div></section></main>;
}
