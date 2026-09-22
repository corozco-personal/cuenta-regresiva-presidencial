import type { Metadata } from "next";
import SubpageHeader from "../components/subpage-header";

export const metadata: Metadata = { title: "Metodología · Cuenta pública", description: "Políticas de admisión, verificación, corrección, clasificación y moderación.", alternates: { canonical: "/metodologia" } };

const policies = [
  ["Admisión de fuentes", "Se consideran entidades oficiales y medios incluidos en el directorio público. Ser admitido permite el monitoreo, pero no certifica todas las afirmaciones de una fuente."],
  ["Descubrimiento mundial", "El radar localiza cobertura en múltiples países e idiomas. Los dominios nuevos permanecen en evaluación hasta que su procedencia pueda clasificarse."],
  ["Verificación", "El enlace debe usar HTTPS, responder, referirse directamente al mandatario y conservar acceso a la fuente original."],
  ["Lenguaje preciso", "Denuncia, investigación, imputación, sanción y sentencia son estados distintos. Una acusación nunca se presenta como hecho probado."],
  ["Correcciones", "El sistema puede normalizar espacios o puntuación, pero no cambia el sentido de un titular. Las modificaciones editoriales relevantes deben quedar registradas."],
  ["Rechazo", "Se excluyen enlaces inseguros, duplicados y resultados que no guardan relación directa con el tema."],
  ["Aportes ciudadanos", "Los filtros automáticos solo determinan si un aporte llega a la cola o a cuarentena. Ninguna opinión ni enlace aportado se publica sin aprobación manual del propietario."],
  ["Opiniones y duplicados", "Un identificador anónimo del navegador limita el muro a un aporte por persona. También se comparan huellas exactas y similitud sustancial entre textos."],
  ["Moderación", "Los insultos y mensajes de odio se conservan para trazabilidad, pero su texto se oculta públicamente. La postura política nunca es, por sí sola, motivo de filtrado."],
  ["Orientación de medios", "La orientación se toma de evaluaciones externas agregadas por Ground News a partir de AllSides, Ad Fontes Media y Media Bias/Fact Check. Es una calificación del medio, no del artículo. Los medios sin evaluación permanecen como ‘sin datos’."],
  ["Factualidad de medios", "La factualidad describe prácticas generales de una publicación —uso de fuentes, contexto y correcciones— y no certifica que una noticia concreta sea verdadera. Cuenta pública no genera estas calificaciones con inteligencia artificial."],
  ["Propiedad y financiación", "La entidad propietaria o financiadora se documenta mediante páginas corporativas, registros o información institucional. La propiedad aporta contexto, pero no determina por sí sola la calidad ni la orientación de una cobertura."],
  ["Puntos ciegos", "Solo se muestra una distribución ideológica cuando existen calificaciones externas. Con menos de tres fuentes calificadas no se emite una alerta de posible punto ciego, evitando conclusiones estadísticas sobre muestras insuficientes."],
];

const comparisonSteps = [
  ["1. Agrupar el mismo hecho", "Las publicaciones deben compartir tema, proximidad temporal y suficiente similitud léxica. La agrupación no significa que todas sus afirmaciones hayan sido confirmadas."],
  ["2. Identificar el encuadre", "Se operacionalizan las cuatro funciones generales descritas por Robert Entman: definición del problema, atribución causal, evaluación y respuesta propuesta. El análisis automático se limita al texto visible del titular."],
  ["3. Revisar transparencia", "Se muestran indicadores observables inspirados en The Trust Project: tipo de contenido o fuente, referencias disponibles, propiedad y mecanismos de rendición de cuentas cuando pueden documentarse."],
  ["4. Medir amplitud", "La matriz considera pluralidad de fuentes, diversidad de propietarios, presencia de una fuente primaria y distancia léxica entre titulares. El resultado es amplitud de contraste, no una nota de veracidad."],
  ["5. Añadir contexto externo", "Orientación y factualidad del medio se muestran solo si existe evaluación externa trazable. Nunca se deducen automáticamente del titular, del propietario o de la financiación."],
  ["6. Abstenerse", "Si faltan títulos diferenciados, propiedad documentada o suficientes fuentes, el portal muestra el vacío. No inventa una calificación ni atribuye intención política."],
];

export default function MethodPage() {
  return <main className="subpage"><SubpageHeader /><section className="subpage-hero"><p className="section-kicker">METODOLOGÍA</p><h1>Reglas públicas para cada hallazgo.</h1><p>Estas políticas explican qué puede publicarse, qué queda en evaluación y cómo se moderan los aportes sin convertir una opinión en un hecho.</p></section><section className="subpage-content"><div className="method-comparison"><p className="section-kicker">COMPARACIÓN DE COBERTURAS</p><h2>Una rúbrica general, no una intuición del sistema.</h2><p>El comparador combina el análisis de encuadre de Entman con indicadores de transparencia de The Trust Project. La implementación es determinista, auditable y distingue entre lo observado en un titular y las calificaciones externas del medio.</p><div>{comparisonSteps.map(([title, body]) => <article key={title}><strong>{title}</strong><p>{body}</p></article>)}</div><p className="method-citations">Fuentes metodológicas: <a href="https://onlinelibrary.wiley.com/doi/10.1111/j.1460-2466.1993.tb01304.x" target="_blank" rel="noreferrer">Entman, 1993</a> · <a href="https://thetrustproject.org/" target="_blank" rel="noreferrer">The Trust Project</a> · <a href="https://ground.news/rating-system" target="_blank" rel="noreferrer">Ground News Rating System</a>.</p></div><div className="policy-list">{policies.map(([title, body]) => <article key={title}><div><h2>{title}</h2><p>{body}</p></div></article>)}</div></section></main>;
}
