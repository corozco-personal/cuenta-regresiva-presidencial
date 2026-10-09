export function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(new Date(value)).replace(" ", " ");
}

export function publicationTimeLabel(value: string) {
  return `Publicado: ${formatPublishedAt(value)}`;
}

export function utcTimestamp(value: string) {
  return formatPublishedAt(value);
}

export function dualTimeLabel(value: string) {
  return formatPublishedAt(value);
}
