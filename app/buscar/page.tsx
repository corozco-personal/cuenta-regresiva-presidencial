import type { Metadata } from "next";
import GlobalSearch from "../components/global-search";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Buscar", description: "Busca noticias, promesas, fuentes y secciones de Cuenta pública.", alternates: { canonical: "/buscar" } };
export default function SearchPage() { return <main className="subpage search-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">BUSCADOR GLOBAL</p><h1>Encuentra la evidencia.<br />No solo el titular.</h1><p>Consulta en un mismo lugar noticias, promesas, instituciones, fuentes y páginas del portal.</p></section><section className="subpage-content"><GlobalSearch /></section></main>; }
