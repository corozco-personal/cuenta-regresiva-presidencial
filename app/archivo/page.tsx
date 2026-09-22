import type { Metadata } from "next";
import Link from "../components/native-link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Archivo documental · Cuenta pública", description: "Hechos documentados del periodo presidencial, con enlaces a sus fuentes originales.", alternates: { canonical: "/archivo" } };

const records = [
  ["30 ago 2026", "Nacional · Instituciones", "Pronunciamiento publicado por la Presidencia en cumplimiento de un fallo de tutela", "Presidencia de la República", "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx"],
  ["17 jun 2026", "Nacional · Control electoral", "Resolución del CNE sobre la solicitud de revocatoria de la inscripción presidencial", "Consejo Nacional Electoral", "https://www.cne.gov.co/resoluciones-cne-2026/13792?layout=print&print=1&tmpl=component"],
  ["30 ene 2026", "Nacional · Registro electoral", "Informe de la Registraduría sobre los apoyos recibidos por la candidatura", "Registraduría Nacional", "https://www.registraduria.gov.co/IMG/pdf/20260130_informe_de_gestion_institucional_2025.pdf"],
  ["13 sep 2026", "Nacional · Justicia", "Declaraciones del presidente sobre decisiones judiciales", "Noticias Caracol", "https://www.noticiascaracol.com/politica/respeto-a-la-justicia-dice-de-la-espriella-al-controvertir-fallos-contra-decisiones-del-gobierno-rg10?_amp=true"],
  ["10 sep 2026", "Internacional · Derechos", "Orden judicial relacionada con publicaciones oficiales en redes", "DW Español", "https://amp.dw.com/es/de-la-espriella-tendr%C3%A1-que-retirar-sus-publicaciones-mostrando-cad%C3%A1veres-en-redes/a-79210565"],
  ["07 sep 2026", "Internacional · Relaciones exteriores", "Análisis internacional sobre el giro de la política exterior colombiana", "El País", "https://elpais.com/america-colombia/2026-09-07/del-escudo-de-las-americas-a-los-altos-del-golan-de-la-espriella-cumple-la-promesa-de-alinearse-con-trump-y-netanyahu.html"],
  ["25 jun 2026", "Internacional · Elecciones", "Cobertura de la proclamación del presidente electo por el CNE", "DW Español", "https://amp.dw.com/es/abelardo-de-la-espriella-es-proclamado-presidente-electo-de-colombia/a-77698790"],
];

export default function ArchivePage() {
  return <main className="subpage"><header className="subpage-header"><Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link><nav><Link href="/">Inicio</Link><Link href="/fuentes">Fuentes</Link><Link href="/metodologia">Metodología</Link><Link href="/autor">Quién soy</Link></nav></header><section className="subpage-hero"><p className="section-kicker">ARCHIVO DOCUMENTAL</p><h1>Hechos con fuente original.</h1><p>Una cronología separada del flujo diario de noticias. Cada registro conserva su fecha, alcance y vínculo de consulta.</p></section><section className="subpage-content"><div className="subpage-links">{records.map(([date, scope, title, source, url]) => <article key={url}><small>{date} · {scope}</small><h2>{title}</h2><a href={url} target="_blank" rel="noreferrer">{source}<ExternalLink size={14} /></a></article>)}</div></section></main>;
}
