import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Acerca del portal",
  description: "Propósito, independencia y carácter libre y sin ánimo de lucro de Cuenta pública.",
  alternates: { canonical: "/acerca" },
};

const principles = [
  {
    number: "01",
    title: "Hacer la información más consultable",
    body: "Cuenta pública reúne y organiza información dispersa sobre el presidente de la República y el ejercicio de la Presidencia. Su propósito es facilitar que cualquier persona pueda encontrar fuentes, reconocer su procedencia, contrastar coberturas y seguir los hechos en el tiempo.",
  },
  {
    number: "02",
    title: "Informar sin imponer una postura",
    body: "El portal no busca decirle a las personas qué pensar ni promover una posición política o social. Distingue documentos oficiales, cobertura periodística y opiniones para que cada visitante consulte las fuentes y forme su propio criterio.",
  },
  {
    number: "03",
    title: "Permanecer independiente",
    body: "Este proyecto no recibe financiación, patrocinio, promoción ni apoyo económico de partidos, campañas, gobiernos, empresas, organizaciones, movimientos políticos, sociales, religiosos o de cualquier otra naturaleza. Tampoco mantiene afiliación con ellos.",
  },
  {
    number: "04",
    title: "Acceso libre y sin ánimo de lucro",
    body: "Cuenta pública es un portal independiente, de acceso libre y sin ánimo de lucro. No vende sus contenidos, no cobra por el acceso y no busca generar ingresos. Su única finalidad es ofrecer una herramienta pública de consulta, seguimiento y participación informada.",
  },
];

export default function AboutPage() {
  return (
    <main className="subpage">
      <SubpageHeader />
      <section className="subpage-hero about-hero">
        <p className="section-kicker">ACERCA DE CUENTA PÚBLICA</p>
        <h1>Información abierta.<br />Criterio propio.</h1>
        <p>Un portal ciudadano creado para reducir la fragmentación de la información sobre el presidente de la República y su gestión, sin intereses políticos, comerciales ni económicos.</p>
      </section>
      <section className="subpage-content about-portal">
        <div className="about-statement">
          <p className="section-kicker">NUESTRO PROPÓSITO</p>
          <h2>Reunir información diversa sin convertirla en una única interpretación.</h2>
          <p>El portal permite recorrer noticias nacionales e internacionales, fuentes oficiales, documentos, indicadores y opiniones ciudadanas conservando las diferencias entre cada tipo de contenido.</p>
        </div>
        <div className="about-principles">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <div><h2>{principle.title}</h2><p>{principle.body}</p></div>
            </article>
          ))}
        </div>
        <aside className="independence-notice">
          <p className="section-kicker">DECLARACIÓN DE INDEPENDENCIA</p>
          <h2>Sin financiación, promoción ni afiliación.</h2>
          <p>Cuenta pública no representa ni actúa en nombre de la Presidencia de la República, entidades gubernamentales, partidos, campañas, medios, empresas u organizaciones de ningún tipo. Es una iniciativa personal e independiente de Carlos Eduardo Orozco.</p>
        </aside>
      </section>
    </main>
  );
}
