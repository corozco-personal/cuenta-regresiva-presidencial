import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Database, FileSearch, Globe2, Layers3, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Carlos Orozco · Creador",
  description: "Conoce a Carlos Orozco y las decisiones de producto, desarrollo y verificación detrás de Cuenta pública.",
  alternates: { canonical: "/autor" },
  openGraph: {
    title: "Carlos Orozco · Creador de Cuenta pública",
    description: "Diseño de producto, desarrollo web, automatización de fuentes y comunicación de datos.",
    url: "/autor",
  },
};

const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateCreated: "2026-09-22T00:00:00-05:00",
  dateModified: "2026-09-22T00:00:00-05:00",
  mainEntity: {
    "@type": "Person",
    "@id": "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/autor#carlos-orozco",
    name: "Carlos Orozco",
    description: "Creador de Cuenta pública, un proyecto de seguimiento documental, automatización de fuentes y visualización del periodo presidencial de Colombia.",
    url: "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/autor",
  },
  hasPart: {
    "@type": "CreativeWork",
    name: "Cuenta pública",
    url: "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/",
    creator: { "@id": "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/autor#carlos-orozco" },
  },
};

export default function AuthorPage() {
  return (
    <main className="author-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }} />
      <header className="author-header">
        <Link href="/?utm_source=perfil_autor&utm_medium=site&utm_campaign=portafolio"><ArrowLeft size={17} /> Volver a Cuenta pública</Link>
        <span>PERFIL DEL CREADOR</span>
      </header>

      <section className="author-hero">
        <div className="author-monogram" aria-hidden="true">CO</div>
        <div>
          <p className="section-kicker">CARLOS OROZCO</p>
          <h1>Construyo productos que convierten información dispersa en experiencias claras.</h1>
          <p>Cuenta pública reúne mi trabajo en diseño de producto, desarrollo web, automatización de fuentes, criterios editoriales y comunicación de datos. El objetivo no es solo contar días: es hacer que la evidencia pueda consultarse, entenderse y compartirse.</p>
          <div className="author-actions">
            <Link className="primary-action" href="/?utm_source=perfil_autor&utm_medium=cta&utm_campaign=portafolio">Explorar el proyecto <ArrowUpRight size={17} /></Link>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fcuenta-regresiva-presidencial.carlos940807.chatgpt.site%2F%3Futm_source%3Dlinkedin%26utm_medium%3Dshare%26utm_campaign%3Dportafolio" target="_blank" rel="noreferrer">Compartir en LinkedIn <ArrowUpRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="author-proof">
        <p className="section-kicker">LO QUE DEMUESTRA EL PROYECTO</p>
        <div className="proof-grid">
          <article><Layers3 /><strong>Producto digital</strong><p>Una experiencia responsive que combina contador, cronología, filtros, indicadores y estados comprensibles.</p></article>
          <article><Database /><strong>Automatización</strong><p>Consulta fuentes externas, normaliza resultados, agrupa coberturas y actualiza el radar de forma periódica.</p></article>
          <article><FileSearch /><strong>Trazabilidad</strong><p>Cada hecho conserva su fuente, nivel de evidencia, estado procesal, fecha de revisión y vínculo compartible.</p></article>
          <article><ShieldCheck /><strong>Criterio editorial</strong><p>Las reglas de admisión, corrección y rechazo son públicas y separan hallazgos automáticos de hechos documentados.</p></article>
          <article><Globe2 /><strong>Alcance mundial</strong><p>El directorio combina fuentes oficiales, medios globales y cabeceras nacionales o regionales de todos los continentes.</p></article>
        </div>
      </section>

      <section className="build-notes">
        <div>
          <p className="section-kicker">NOTAS DEL PROYECTO</p>
          <h2>Decisiones que vale la pena explicar</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>Una fuente no equivale a una verdad confirmada</strong><p>El portal separa “admitido para monitoreo” de los niveles de evidencia para reducir interpretaciones engañosas.</p></div></li>
          <li><span>02</span><div><strong>La cobertura mundial necesita capas</strong><p>Los medios conocidos ingresan al directorio; los dominios descubiertos automáticamente permanecen en evaluación.</p></div></li>
          <li><span>03</span><div><strong>La transparencia también es una función</strong><p>La bitácora de correcciones, el derecho de respuesta y las políticas editoriales forman parte del producto.</p></div></li>
          <li><span>04</span><div><strong>Compartir debe conservar el contexto</strong><p>Los enlaces permanentes, la autoría y las vistas previas sociales conectan cada dato con su metodología.</p></div></li>
        </ol>
      </section>

      <section className="author-cta">
        <div><span>¿QUÉ SIGUE?</span><h2>Este proyecto seguirá creciendo como laboratorio público de producto y datos.</h2></div>
        <Link href="/?utm_source=perfil_autor&utm_medium=footer&utm_campaign=portafolio">Ver la versión actual <ArrowUpRight size={18} /></Link>
      </section>
    </main>
  );
}
