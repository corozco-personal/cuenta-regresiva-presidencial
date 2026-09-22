import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Metodología · Cuenta pública", description: "Políticas de admisión, verificación, corrección, clasificación y moderación.", alternates: { canonical: "/metodologia" } };

const policies = [
  ["Admisión de fuentes", "Se consideran entidades oficiales y medios incluidos en el directorio público. Ser admitido permite el monitoreo, pero no certifica todas las afirmaciones de una fuente."],
  ["Descubrimiento mundial", "El radar localiza cobertura en múltiples países e idiomas. Los dominios nuevos permanecen en evaluación hasta que su procedencia pueda clasificarse."],
  ["Verificación", "El enlace debe usar HTTPS, responder, referirse directamente al mandatario y conservar acceso a la fuente original."],
  ["Lenguaje preciso", "Denuncia, investigación, imputación, sanción y sentencia son estados distintos. Una acusación nunca se presenta como hecho probado."],
  ["Correcciones", "El sistema puede normalizar espacios o puntuación, pero no cambia el sentido de un titular. Las modificaciones editoriales relevantes deben quedar registradas."],
  ["Rechazo", "Se excluyen enlaces inseguros, duplicados y resultados que no guardan relación directa con el tema."],
  ["Aportes ciudadanos", "Una fuente oficial relevante puede marcarse como publicable. Una nota periodística o una fuente nueva queda en evaluación y no entra automáticamente al archivo documental."],
  ["Opiniones y duplicados", "Un identificador anónimo del navegador limita el muro a un aporte por persona. También se comparan huellas exactas y similitud sustancial entre textos."],
  ["Moderación", "Los insultos y mensajes de odio se conservan para trazabilidad, pero su texto se oculta públicamente. La postura política nunca es, por sí sola, motivo de filtrado."],
];

export default function MethodPage() {
  return <main className="subpage"><header className="subpage-header"><Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link><nav><Link href="/">Inicio</Link><Link href="/archivo">Archivo</Link><Link href="/fuentes">Fuentes</Link><Link href="/autor">Quién soy</Link></nav></header><section className="subpage-hero"><p className="section-kicker">METODOLOGÍA</p><h1>Reglas públicas para cada hallazgo.</h1><p>Estas políticas explican qué puede publicarse, qué queda en evaluación y cómo se moderan los aportes sin convertir una opinión en un hecho.</p></section><section className="subpage-content"><div className="policy-list">{policies.map(([title, body]) => <article key={title}><div><h2>{title}</h2><p>{body}</p></div></article>)}</div></section></main>;
}
