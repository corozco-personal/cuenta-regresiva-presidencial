import type { Metadata } from "next";
import AlertPreferences from "../components/alert-preferences";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Alertas y canal RSS", description: "Opciones para seguir las actualizaciones verificadas de Cuenta pública.", alternates: { canonical: "/alertas" } };
export default function AlertsPage() { return <main className="subpage alerts-page"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">ALERTAS Y SEGUIMIENTO</p><h1>Sigue los cambios.<br />Sin ruido.</h1><p>Opciones abiertas para enterarte de nuevas noticias y cambios de estado sin depender de algoritmos de redes sociales.</p></section><section className="subpage-content"><AlertPreferences /><p className="alerts-caveat">Cuenta pública no envía correos ni notificaciones push y no solicita datos personales. La opción RSS es el mecanismo activo de suscripción; la preferencia local prepara tu tema para futuras vistas personalizadas.</p></section></main>; }
