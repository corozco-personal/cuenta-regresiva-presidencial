function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

const LATIN_FILLER = new Set([
  "adipisci", "aliquid", "aspernatur", "blanditiis", "commodi", "consectetur", "consequatur",
  "delectus", "doloribus", "doloremque", "ducimus", "eligendi", "expedita", "laboriosam",
  "molestiae", "occaecati", "perferendis", "perspiciatis", "provident", "quaerat", "reiciendis",
  "repellat", "repudiandae", "similique", "suscipit", "temporibus", "voluptates",
]);

/** Detecta patrones inequívocos de texto sintético o de prueba sin evaluar la postura política. */
export function looksAutomatedOpinion(value: string) {
  const text = normalized(value);
  if (text.startsWith("opinion generada por ")) return true;
  const words = text.split(" ");
  const fillerCount = words.filter((word) => LATIN_FILLER.has(word)).length;
  return fillerCount >= 5 && fillerCount / Math.max(words.length, 1) >= 0.08;
}

const META_OR_TEST = /\b(?:opini[oó]n\s+(?:v[aá]lida|generada)|esto\s+es\s+(?:una\s+)?prueba|mensaje\s+de\s+prueba|probando|whatsoever|l+o+k+o+|asdf|qwerty|spam|en\s+qu[eé]\s+idioma\s+est[aá]n\s+las\s+opiniones)\b/i;
const TOPIC_TERMS = /\b(?:abelardo|espriella|president(?:e|a|es|ial|cia)|gobierno|mandato|administraci[oó]n|gesti[oó]n|pol[ií]tica|promesa|reforma|econom[ií]a|empleo|seguridad|justicia|salud|educaci[oó]n|ambiente|relaciones\s+exteriores|corrupci[oó]n|congreso|ministerio|estado|pa[ií]s|colombia|rendici[oó]n|cuentas|transparencia|datos\s+abiertos|decisiones|funcionarios)\b/i;

export function classifyOpinion(value: string) {
  const text = normalized(value);
  const words = text.split(" ").filter(Boolean);
  if (looksAutomatedOpinion(value)) return { accepted: false, reason: "Patrón de contenido automático o sintético" };
  if (META_OR_TEST.test(value)) return { accepted: false, reason: "Mensaje de prueba, burla o comentario metarreferencial" };
  if (words.length < 5 || new Set(words).size < 4) return { accepted: false, reason: "Contenido demasiado corto o repetitivo para aportar un argumento" };
  if (!TOPIC_TERMS.test(value)) return { accepted: false, reason: "El texto no guarda relación suficiente con el mandatario, el Gobierno o su gestión" };
  const repeated = /(.)\1{6,}/i.test(text) || /\b(\w+)(?:\s+\1){3,}\b/i.test(text);
  if (repeated) return { accepted: false, reason: "Patrón repetitivo compatible con spam" };
  return { accepted: true, reason: "Aporte pertinente pendiente de revisión" };
}
