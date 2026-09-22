import type { Metadata } from "next";
import LinkedInIcon from "../components/linkedin-icon";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = {
  title: "Carlos Eduardo Orozco · Quién está detrás de Cuenta pública",
  description: "Quién es Carlos Orozco y por qué decidió crear Cuenta pública.",
  alternates: { canonical: "/autor" },
};

export default function AuthorPage() {
  return (
    <main className="subpage">
      <SubpageHeader />
      <section className="subpage-hero">
        <p className="section-kicker">QUIÉN ESTÁ DETRÁS</p>
        <h1>Información abundante.<br />Contexto insuficiente.</h1>
        <p>Cuenta pública nace para reducir la distancia entre todo lo que se publica sobre el presidente de la República y la posibilidad real de encontrarlo, contrastarlo y seguirlo en el tiempo.</p>
      </section>
      <section className="subpage-content author-story">
        <article className="author-chapter"><span>01</span><div><p className="section-kicker">EL PROBLEMA</p><h2>No falta información: está fragmentada.</h2><p>Cada día aparecen comunicados oficiales, decisiones institucionales, investigaciones, noticias nacionales, coberturas internacionales y opiniones sobre el presidente. Esa información es heterogénea: cambia de formato, idioma, enfoque, profundidad y criterio editorial. Su volumen hace difícil reconstruir qué ocurrió, cuándo ocurrió, quién lo afirmó y qué fuente lo respalda.</p></div></article>
        <article className="author-chapter author-question"><span>02</span><div><p className="section-kicker">LA PREGUNTA</p><h2>¿Cómo seguir al presidente y su rol durante la Presidencia sin perder el contexto?</h2><p>La pregunta no es cómo reemplazar las fuentes ni cómo producir una única interpretación. Es cómo ofrecer un punto de entrada que permita recorrer información distinta, reconocer su procedencia y comparar versiones con mayor facilidad.</p></div></article>
        <article className="author-chapter"><span>03</span><div><p className="section-kicker">LA SOLUCIÓN</p><h2>Un lugar para consultar, contrastar y participar.</h2><p>Cuenta pública reúne el tiempo del mandato, noticias nacionales e internacionales, un archivo documental, fuentes originales, indicadores y aportes ciudadanos. La metodología distingue hechos, cobertura periodística y opiniones, y hace visibles sus reglas de clasificación, corrección y moderación.</p></div></article>
        <aside className="author-principle"><p className="section-kicker">PRINCIPIO EDITORIAL</p><h2>Este proyecto no busca decirle a nadie qué pensar ni cómo pensar.</h2><p>Busca reducir la brecha creada por la heterogeneidad y la cantidad de información sobre el presidente de la República y su papel durante la Presidencia. Cada persona conserva la libertad de abrir las fuentes, contrastarlas y formar su propio criterio.</p><small>Cuenta pública es un proyecto independiente. No representa a la Presidencia, a un partido político ni a un medio de comunicación.</small></aside>
        <section className="about-me"><p className="section-kicker">SOBRE MÍ</p><h2>Mi nombre es Carlos Eduardo Orozco.</h2><p>Soy el creador y responsable de Cuenta pública. Me interesa construir herramientas digitales que ayuden a ordenar información compleja y convertirla en experiencias claras, consultables y útiles. Creé este proyecto al identificar una brecha entre la cantidad de información disponible y la capacidad de una persona para encontrarla, contrastarla y seguirla en el tiempo.</p><a className="linkedin-profile" href="https://www.linkedin.com/in/corozco9408/" target="_blank" rel="noreferrer"><LinkedInIcon size={18} aria-hidden="true" /> Conoce mi experiencia en LinkedIn</a></section>
      </section>
    </main>
  );
}
