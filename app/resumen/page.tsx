import type { Metadata } from "next";
import NewsDigest from "../components/news-digest";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Resumen semanal", description: "Resumen semanal descargable de la cobertura nacional e internacional reunida por Cuenta pública.", alternates: { canonical: "/resumen" } };
export default function DigestPage() { return <main className="subpage digest-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">RESUMEN SEMANAL</p><h1>Siete días<br />en contexto.</h1><p>Una lectura compacta de los temas, alcances y fuentes que concentraron la cobertura. Los hechos repetidos se agrupan para no confundir volumen con relevancia.</p></section><section className="subpage-content"><NewsDigest /></section></main>; }
