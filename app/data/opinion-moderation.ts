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
