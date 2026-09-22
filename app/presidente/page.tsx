import type { Metadata } from "next";
import { ExternalLink, FileCheck2, Landmark, Scale, ShieldCheck } from "lucide-react";
import PresidentNews from "../components/president-news";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Sobre el presidente Abelardo de la Espriella · Cuenta pública",
  description: "Perfil documental, trayectoria, campaña, fuentes e información periodística sobre el presidente Abelardo Gabriel De La Espriella Otero.",
  alternates: { canonical: "/presidente" },
};

const facts = [
  ["Nombre completo", "Abelardo Gabriel De La Espriella Otero"],
  ["Nacimiento", "31 de julio de 1978 · Bogotá"],
  ["Creció en", "Montería, Córdoba"],
  ["Profesión", "Abogado penalista y empresario"],
  ["Presidencia", "7 de agosto de 2026 – 7 de agosto de 2030"],
  ["Vicepresidente", "José Manuel Restrepo Abondano"],
];

const timeline = [
  ["2000", "Se graduó en Derecho en la Universidad Sergio Arboleda."],
  ["2002", "Fundó su firma de abogados, enfocada principalmente en litigio penal."],
  ["16 jul 2025", "Anunció su precandidatura e inscribió el comité de recolección de firmas Defensores de la Patria."],
  ["4 dic 2025", "Su campaña entregó millones de apoyos ciudadanos ante la Registraduría."],
  ["31 may 2026", "Obtuvo la mayor votación en la primera vuelta presidencial."],
  ["21 jun 2026", "Ganó la segunda vuelta presidencial frente a Iván Cepeda."],
  ["24 jun 2026", "Fue proclamado presidente electo por el Consejo Nacional Electoral."],
  ["7 ago 2026", "Tomó posesión como presidente de la República."],
];

const sources = [
  ["Perfil oficial de la Presidencia", "Ficha institucional del presidente en ejercicio.", "https://www.presidencia.gov.co/contenidoVinculado/perfiles/presidente.html"],
  ["Registro de candidaturas 2026", "Candidatura y fórmula vicepresidencial publicadas por la Registraduría.", "https://wapp.registraduria.gov.co/electoral/2026/presidente-de-la-republica-segunda-vuelta/registro-candidatos.html"],
  ["Resolución electoral", "Documento sobre la inscripción de la candidatura presidencial.", "https://www.registraduria.gov.co/RESOLUCION-SALA-PLENA-No-2633-DEL-21-DE-MAYO-DE-2026.html"],
  ["Biografía CIDOB", "Trayectoria académica, profesional, electoral y política documentada.", "https://www.cidob.org/en/lider-politico/abelardo-espriella-otero"],
  ["Programa de campaña", "Documento de propuestas divulgado por Defensores de la Patria.", "https://defensoresdelapatria.com/wp-content/uploads/2026/04/PROPUESTAS-ABELARDO-DE-LA-ESPRIELLA-EL-TIGRE.pdf"],
  ["Perfil de El País", "Investigación periodística sobre su carrera jurídica y ascenso político.", "https://elpais.com/america-colombia/elecciones-presidenciales/2026-05-31/abelardo-de-la-espriella-abogado-del-diablo-que-quiere-ser-presidente-de-colombia.html"],
  ["Especial de La Silla Vacía", "Archivo de perfiles, investigaciones, noticias y verificaciones.", "https://www.lasillavacia.com/abelardo-de-la-espriella-candidato-presidencial-2026/"],
];

export default function PresidentPage() {
  return (
    <main className="subpage president-page">
      <SubpageHeader />

      <section className="president-hero">
        <div><p className="section-kicker">SOBRE EL PRESIDENTE</p><h1>Abelardo Gabriel<br /><em>De La Espriella Otero</em></h1><p>Perfil público construido con documentos oficiales, biografías de referencia e investigaciones periodísticas. Los hechos, las versiones y las opiniones permanecen diferenciados.</p></div>
        <div className="president-monogram" aria-hidden="true"><span>AD</span><strong>07</strong></div>
      </section>

      <section className="president-facts" aria-label="Datos básicos del presidente">
        {facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <section className="president-profile-block">
        <div className="president-section-heading">
          <div><p className="section-kicker">PERFIL DOCUMENTADO</p><h2>Trayectoria pública y profesional</h2></div>
          <p>Nació en Bogotá y creció en Montería. Estudió Derecho en la Universidad Sergio Arboleda y desarrolló una carrera pública como litigante penal, empresario y figura mediática antes de entrar a la competencia electoral.</p>
        </div>
        <div className="president-profile-grid">
          <article><Scale size={26} /><h3>Abogado</h3><p>Fundó su firma en 2002 y ganó notoriedad en litigios de alto perfil. Entre sus representaciones hubo víctimas y personas acusadas o condenadas en procesos de corrupción, parapolítica y delitos económicos. El ejercicio de la defensa no prueba participación en las conductas atribuidas a sus clientes.</p></article>
          <article><Landmark size={26} /><h3>Presidente</h3><p>Llegó a la política electoral mediante el movimiento Defensores de la Patria. Fue candidato con José Manuel Restrepo como fórmula vicepresidencial y asumió la Presidencia el 7 de agosto de 2026.</p></article>
          <article><FileCheck2 size={26} /><h3>Programa político</h3><p>Su campaña presentó el programa “El milagro de los nunca”, con propuestas sobre seguridad, reducción del Estado, economía, justicia, familia y política exterior. Esta página enlaza el documento original para consultar su formulación completa.</p></article>
          <article><ShieldCheck size={26} /><h3>Escrutinio público</h3><p>Medios nacionales e internacionales han investigado su red empresarial, antiguas representaciones jurídicas, financiación de campaña, relación con periodistas y decisiones de gobierno. Aquí se atribuye cada hallazgo a su fuente y se conserva cualquier respuesta conocida.</p></article>
        </div>
      </section>

      <section className="president-timeline-section">
        <div className="president-section-heading"><div><p className="section-kicker">CRONOLOGÍA</p><h2>De la profesión jurídica a la Presidencia</h2></div><p>Hitos públicos seleccionados por relevancia. La hemeroteca inferior permite explorar la cobertura completa desde julio de 2025.</p></div>
        <div className="president-timeline">{timeline.map(([date, text]) => <article key={date}><time>{date}</time><p>{text}</p></article>)}</div>
      </section>

      <section className="president-scrutiny">
        <div className="president-section-heading"><div><p className="section-kicker">LECTURA RESPONSABLE</p><h2>Qué está probado y qué sigue siendo una versión</h2></div></div>
        <div className="president-scrutiny-grid">
          <article><strong>Hecho documentado</strong><p>Datos contenidos en registros electorales, actos oficiales, decisiones judiciales o documentos institucionales.</p></article>
          <article><strong>Investigación periodística</strong><p>Hallazgos atribuidos al medio que los publicó. Deben leerse junto con la evidencia citada y las respuestas de las personas involucradas.</p></article>
          <article><strong>Alegación o controversia</strong><p>Un señalamiento no equivale a una condena. El sitio identifica el estado procesal y evita usar “escándalo” como categoría automática.</p></article>
          <article><strong>Corrección y réplica</strong><p>Cuando una fuente actualiza, rectifica o incorpora una respuesta, el registro debe conservar ese contexto.</p></article>
        </div>
      </section>

      <section className="president-sources">
        <div className="president-section-heading"><div><p className="section-kicker">FUENTES CENTRALES</p><h2>Documentos y perfiles para profundizar</h2></div><p>La selección combina fuentes oficiales, el programa de campaña y periodismo de investigación. Ninguna fuente aislada se trata como visión total.</p></div>
        <div className="president-source-grid">{sources.map(([title, description, url]) => <article key={url}><h3>{title}</h3><p>{description}</p><a href={url} target="_blank" rel="noreferrer">Abrir fuente <ExternalLink size={15} /></a></article>)}</div>
      </section>

      <PresidentNews />
    </main>
  );
}
