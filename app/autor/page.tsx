import type { Metadata } from "next";
import Link from "../components/native-link";
import LinkedInIcon from "../components/linkedin-icon";

export const metadata: Metadata = {
  title: "Carlos Orozco · Quién está detrás de Cuenta pública",
  description: "Quién es Carlos Orozco y por qué decidió crear Cuenta pública.",
  alternates: { canonical: "/autor" },
};

export default function AuthorPage() {
  return (
    <main className="subpage">
      <header className="subpage-header">
        <Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link>
        <nav><Link href="/">Inicio</Link><Link href="/presidente">Presidente</Link><Link href="/favorabilidad">Indicadores</Link><Link href="/archivo">Archivo</Link><Link href="/fuentes">Fuentes</Link><Link href="/metodologia">Metodología</Link></nav>
      </header>
      <section className="subpage-hero">
        <p className="section-kicker">QUIÉN ESTÁ DETRÁS</p>
        <h1>Soy Carlos Orozco.</h1>
        <p>Creé Cuenta pública porque quería una forma sencilla de seguir el tiempo de un mandato, consultar noticias con su fuente y abrir un espacio de participación sin confundir opiniones con hechos.</p>
      </section>
      <section className="subpage-content simple-author">
        <h2>Por qué decidí crear este proyecto</h2>
        <p>La información política suele aparecer dispersa entre comunicados oficiales, medios nacionales, coberturas internacionales y conversaciones en redes. Este sitio nace de una pregunta concreta: ¿cómo reunir todo eso en un lugar que permita ver el contexto, abrir la fuente original y entender qué está verificado y qué sigue en evaluación?</p>
        <p>Por eso el proyecto combina una cuenta regresiva, noticias separadas por alcance, aportes ciudadanos y reglas públicas de moderación. No busca decirle a nadie qué pensar. Busca hacer más fácil consultar, contrastar y participar con responsabilidad.</p>
        <p>Cuenta pública es un proyecto independiente. No representa a la Presidencia, a un partido político ni a un medio de comunicación.</p>
        <a className="linkedin-profile" href="https://www.linkedin.com/in/corozco9408/" target="_blank" rel="noreferrer"><LinkedInIcon size={18} aria-hidden="true" /> Ver mi perfil en LinkedIn</a>
      </section>
    </main>
  );
}
