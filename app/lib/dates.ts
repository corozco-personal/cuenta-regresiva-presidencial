export function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function publicationTimeLabel(value: string) {
  return `Publicado: ${formatPublishedAt(value)} hora Colombia (UTC-5)`;
}
