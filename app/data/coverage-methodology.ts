export type FrameDimension = "Definición del problema" | "Atribución causal" | "Evaluación" | "Respuesta propuesta";

export type HeadlineFrame = {
  dimensions: FrameDimension[];
  signals: string[];
  label: "Descriptivo" | "Causal" | "Evaluativo" | "Propositivo" | "Mixto";
};

const CAUSAL = /\b(por qué|debido a|a causa de|culpa|responsabiliza|provoca|causa|desencadena)\b/i;
const EVALUATIVE = /\b(escándalo|polémic[ao]|controvertid[ao]|radical|ultra|grave|históric[ao]|caos|fracaso|éxito|arremete|ataca|amenaza|celebra|golpe|crisis)\b/i;
const RESPONSE = /\b(debe|debería|exige|pide|propone|promete|ordena|anuncia|lanza|impulsa|rechaza|retira|prohíbe|autoriza|llama a)\b/i;

function matches(pattern: RegExp, value: string) {
  const match = value.match(pattern);
  return match?.[0] ?? null;
}

/**
 * Deterministic, headline-only operationalization of Entman's four framing
 * functions. It describes observable wording; it does not infer intent,
 * ideology, truthfulness or the full frame of an article.
 */
export function analyzeHeadlineFrame(title: string): HeadlineFrame {
  const dimensions: FrameDimension[] = ["Definición del problema"];
  const signals: string[] = [];
  const causal = matches(CAUSAL, title);
  const evaluation = matches(EVALUATIVE, title);
  const response = matches(RESPONSE, title);
  if (causal) { dimensions.push("Atribución causal"); signals.push(causal); }
  if (evaluation) { dimensions.push("Evaluación"); signals.push(evaluation); }
  if (response) { dimensions.push("Respuesta propuesta"); signals.push(response); }
  const active = dimensions.length - 1;
  const label = active > 1 ? "Mixto" : evaluation ? "Evaluativo" : causal ? "Causal" : response ? "Propositivo" : "Descriptivo";
  return { dimensions, signals, label };
}

function titleTokens(title: string) {
  return new Set(title.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(word => word.length > 4));
}

export function headlineDistance(left: string, right: string) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  const shared = [...a].filter(token => b.has(token)).length;
  return 1 - shared / Math.max(1, new Set([...a, ...b]).size);
}

export function contrastLevel(input: { sourceCount: number; ownerCount: number; hasPrimarySource: boolean; headlineDiversity: number }) {
  const criteria = [input.sourceCount >= 2, input.ownerCount >= 2, input.hasPrimarySource, input.headlineDiversity >= 0.45];
  const met = criteria.filter(Boolean).length;
  return {
    met,
    total: criteria.length,
    label: met >= 4 ? "Contraste amplio" : met >= 2 ? "Contraste parcial" : "Contraste limitado",
  };
}
