import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";
import CongressDashboard from "../components/congress-dashboard";

export const metadata: Metadata = { title: "Congreso 2026–2030", description: "Composición oficial del Congreso colombiano y seguimiento diario de proyectos de ley.", alternates: { canonical: "/congreso" } };
export default function CongressPage() { return <main className="subpage congress-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">RAMA LEGISLATIVA</p><h1>El Congreso<br />elegido.</h1><p>Composición del periodo 2026–2030 y seguimiento cotidiano de proyectos, reformas y debates publicados por fuentes institucionales.</p></section><section className="subpage-content"><CongressDashboard /></section></main>; }
