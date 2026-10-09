export function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function publicationTimeLabel(value: string) {
  const date = new Date(value);
  return `Publicado: ${formatPublishedAt(value)} hora Colombia (UTC-5) · ${date.toISOString().replace(".000Z", "Z")} UTC`;
}

export function utcTimestamp(value: string) {
  return new Date(value).toISOString().replace(".000Z", "Z");
}

export function dualTimeLabel(value: string) {
  return `${formatPublishedAt(value)} Colombia · ${utcTimestamp(value)} UTC`;
}
