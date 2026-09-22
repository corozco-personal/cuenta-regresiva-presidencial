import { NextResponse } from "next/server";

type Scope = "Nacional" | "Internacional";
type BaseNews = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  kind: "Fuente primaria" | "Cobertura periodística";
  scope: Scope;
};
type CandidateNews = BaseNews & { trustedSource: boolean; curated?: boolean };
type PublicNews = BaseNews & {
  category: string;
  decision: "Aprobado" | "Corregido";
  decisionReason: string;
};

type SourceProfile = { domain: string; scope: Scope; official?: boolean; label?: string };

const SOURCE_PROFILES: SourceProfile[] = [
  { domain: "presidencia.gov.co", scope: "Nacional", official: true, label: "Presidencia de Colombia" },
  { domain: "cne.gov.co", scope: "Nacional", official: true, label: "Consejo Nacional Electoral" },
  { domain: "registraduria.gov.co", scope: "Nacional", official: true, label: "Registraduría Nacional" },
  { domain: "corteconstitucional.gov.co", scope: "Nacional", official: true, label: "Corte Constitucional" },
  { domain: "consejodeestado.gov.co", scope: "Nacional", official: true, label: "Consejo de Estado" },
  { domain: "fiscalia.gov.co", scope: "Nacional", official: true, label: "Fiscalía General" },
  { domain: "procuraduria.gov.co", scope: "Nacional", official: true, label: "Procuraduría General" },
  { domain: "contraloria.gov.co", scope: "Nacional", official: true, label: "Contraloría General" },
  { domain: "defensoria.gov.co", scope: "Nacional", official: true, label: "Defensoría del Pueblo" },
  { domain: "jep.gov.co", scope: "Nacional", official: true, label: "JEP" },
  { domain: "senado.gov.co", scope: "Nacional", official: true, label: "Senado de Colombia" },
  { domain: "camara.gov.co", scope: "Nacional", official: true, label: "Cámara de Representantes" },
  { domain: "cancilleria.gov.co", scope: "Nacional", official: true, label: "Cancillería de Colombia" },
  { domain: "mindefensa.gov.co", scope: "Nacional", official: true, label: "Ministerio de Defensa" },
  { domain: "policia.gov.co", scope: "Nacional", official: true, label: "Policía Nacional" },
  { domain: "rtvcnoticias.com", scope: "Nacional", label: "RTVC Noticias" },
  { domain: "noticiascaracol.com", scope: "Nacional", label: "Noticias Caracol" },
  { domain: "caracol.com.co", scope: "Nacional", label: "Caracol Radio" },
  { domain: "elespectador.com", scope: "Nacional", label: "El Espectador" },
  { domain: "eltiempo.com", scope: "Nacional", label: "El Tiempo" },
  { domain: "bluradio.com", scope: "Nacional", label: "Blu Radio" },
  { domain: "lasillavacia.com", scope: "Nacional", label: "La Silla Vacía" },
  { domain: "cuestionpublica.com", scope: "Nacional", label: "Cuestión Pública" },
  { domain: "noticiasrcn.com", scope: "Nacional", label: "Noticias RCN" },
  { domain: "state.gov", scope: "Internacional", official: true, label: "Departamento de Estado de EE. UU." },
  { domain: "whitehouse.gov", scope: "Internacional", official: true, label: "Casa Blanca" },
  { domain: "oas.org", scope: "Internacional", official: true, label: "OEA" },
  { domain: "un.org", scope: "Internacional", official: true, label: "Naciones Unidas" },
  { domain: "ohchr.org", scope: "Internacional", official: true, label: "ONU Derechos Humanos" },
  { domain: "dw.com", scope: "Internacional", label: "DW Español" },
  { domain: "reuters.com", scope: "Internacional", label: "Reuters" },
  { domain: "apnews.com", scope: "Internacional", label: "Associated Press" },
  { domain: "bbc.com", scope: "Internacional", label: "BBC Mundo" },
  { domain: "france24.com", scope: "Internacional", label: "France 24" },
  { domain: "cnn.com", scope: "Internacional", label: "CNN en Español" },
  { domain: "elpais.com", scope: "Internacional", label: "El País" },
  { domain: "theguardian.com", scope: "Internacional", label: "The Guardian" },
  { domain: "aljazeera.com", scope: "Internacional", label: "Al Jazeera" },
];

const CURATED_CHANNELS: BaseNews[] = [
  {
    id: "nacional-caracol-justicia",
    title: "El presidente se pronunció sobre decisiones judiciales durante una alocución",
    source: "Noticias Caracol",
    url: "https://www.noticiascaracol.com/politica/respeto-a-la-justicia-dice-de-la-espriella-al-controvertir-fallos-contra-decisiones-del-gobierno-rg10?_amp=true",
    publishedAt: "2026-09-13T12:00:00-05:00",
    kind: "Cobertura periodística",
    scope: "Nacional",
  },
  {
    id: "nacional-cne-resolucion",
    title: "El CNE publicó la Resolución 2990 de 2026 sobre la inscripción presidencial",
    source: "Consejo Nacional Electoral",
    url: "https://www.cne.gov.co/resoluciones-cne-2026/13792?layout=print&print=1&tmpl=component",
    publishedAt: "2026-06-18T12:00:00-05:00",
    kind: "Fuente primaria",
    scope: "Nacional",
  },
  {
    id: "internacional-dw-orden",
    title: "De la Espriella tendrá que retirar videos entre cadáveres",
    source: "DW Español",
    url: "https://amp.dw.com/es/de-la-espriella-tendr%C3%A1-que-retirar-sus-publicaciones-mostrando-cad%C3%A1veres-en-redes/a-79210565",
    publishedAt: "2026-09-10T12:00:00+02:00",
    kind: "Cobertura periodística",
    scope: "Internacional",
  },
  {
    id: "internacional-elpais-diplomacia",
    title: "De la Espriella gira la política exterior hacia Estados Unidos e Israel",
    source: "El País",
    url: "https://elpais.com/america-colombia/2026-09-07/del-escudo-de-las-americas-a-los-altos-del-golan-de-la-espriella-cumple-la-promesa-de-alinearse-con-trump-y-netanyahu.html",
    publishedAt: "2026-09-07T06:00:00+02:00",
    kind: "Cobertura periodística",
    scope: "Internacional",
  },
];

function profileFor(hostname: string) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  return SOURCE_PROFILES.find(({ domain }) => normalized === domain || normalized.endsWith(`.${domain}`));
}

function idFor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
}

function gdeltDate(value?: string) {
  if (!value || value.length < 8) return new Date().toISOString();
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || "00";
  const minute = value.slice(11, 13) || "00";
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`).toISOString();
}

const CATEGORY_RULES = [
  { label: "Justicia y control", pattern: /juez|justicia|corte|fiscal|procuradur|contralor|fallo|sentencia|investiga|imputa/i },
  { label: "Elecciones", pattern: /elecci|candidat|voto|cne|registradur|campaña|posesi|proclama/i },
  { label: "Relaciones exteriores", pattern: /canciller|diplom|exterior|estados unidos|venezuela|israel|onu|oea|embajad/i },
  { label: "Seguridad y defensa", pattern: /seguridad|defensa|policía|ejército|militar|violencia|atentado/i },
  { label: "Economía", pattern: /econom|hacienda|presupuesto|impuesto|empleo|inflación|comercio/i },
  { label: "Derechos", pattern: /derechos|tutela|víctima|menor|libertad|defensoría/i },
];

function classify(title: string) {
  return CATEGORY_RULES.find(({ pattern }) => pattern.test(title))?.label ?? "Gobierno";
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").replace(/([!?])\1+/g, "$1");
}

function reviewCandidate(candidate: CandidateNews) {
  if (!candidate.trustedSource) {
    return { decision: "Rechazado" as const, reason: "La fuente no está en la lista pública de canales admitidos." };
  }
  if (!/^https:\/\//i.test(candidate.url) || Number.isNaN(Date.parse(candidate.publishedAt))) {
    return { decision: "Rechazado" as const, reason: "El enlace o la fecha no permiten verificar el hallazgo." };
  }
  if (!candidate.curated && !/abelardo|espriella/i.test(candidate.title)) {
    return { decision: "Rechazado" as const, reason: "El título no tiene relación directa con la persona monitoreada." };
  }

  const correctedTitle = normalizeTitle(candidate.title);
  const corrected = correctedTitle !== candidate.title;
  const { trustedSource: _trustedSource, curated: _curated, ...publishable } = candidate;
  const item: PublicNews = {
    ...publishable,
    title: correctedTitle,
    category: classify(correctedTitle),
    decision: corrected ? "Corregido" : "Aprobado",
    decisionReason: corrected
      ? "Se normalizó únicamente la forma del titular; el enlace original permanece disponible."
      : candidate.kind === "Fuente primaria"
        ? "Fuente oficial admitida y referencia directa al asunto monitoreado."
        : "Medio admitido, referencia directa y enlace verificable.",
  };
  return { decision: item.decision, reason: item.decisionReason, item };
}

async function fromNewsApi(apiKey: string): Promise<CandidateNews[]> {
  const params = new URLSearchParams({
    q: '"Abelardo de la Espriella"',
    language: "es",
    sortBy: "publishedAt",
    pageSize: "100",
  });
  const response = await fetch(`https://newsapi.org/v2/everything?${params}`, {
    headers: { "X-Api-Key": apiKey },
  });
  if (!response.ok) throw new Error(`NewsAPI ${response.status}`);
  const data = (await response.json()) as { articles?: Array<Record<string, unknown>> };
  return (data.articles ?? []).flatMap((article) => {
    try {
      const url = String(article.url ?? "");
      const hostname = new URL(url).hostname;
      const profile = profileFor(hostname);
      const title = String(article.title ?? "Sin título");
      if (!/abelardo|espriella/i.test(title)) return [];
      return [{
        id: idFor(url),
        title,
        source: profile?.label ?? String((article.source as { name?: string } | undefined)?.name ?? hostname),
        url,
        publishedAt: String(article.publishedAt ?? new Date().toISOString()),
        kind: profile?.official ? "Fuente primaria" as const : "Cobertura periodística" as const,
        scope: profile?.scope ?? "Internacional",
        trustedSource: Boolean(profile),
      }];
    } catch { return []; }
  });
}

async function fromGdelt(): Promise<CandidateNews[]> {
  const params = new URLSearchParams({
    query: '"Abelardo de la Espriella"',
    mode: "ArtList",
    maxrecords: "100",
    format: "json",
    sort: "DateDesc",
  });
  const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, {
    headers: { "User-Agent": "CuentaPublica/1.1 (documentary monitoring)" },
  });
  if (!response.ok) throw new Error(`GDELT ${response.status}`);
  const data = (await response.json()) as { articles?: Array<Record<string, unknown>> };
  return (data.articles ?? []).flatMap((article) => {
    try {
      const url = String(article.url ?? "");
      const hostname = new URL(url).hostname;
      const profile = profileFor(hostname);
      const title = String(article.title ?? "Sin título");
      if (!/abelardo|espriella/i.test(title)) return [];
      return [{
        id: idFor(url),
        title,
        source: profile?.label ?? String(article.domain ?? hostname),
        url,
        publishedAt: gdeltDate(String(article.seendate ?? "")),
        kind: profile?.official ? "Fuente primaria" as const : "Cobertura periodística" as const,
        scope: profile?.scope ?? "Internacional",
        trustedSource: Boolean(profile),
      }];
    } catch { return []; }
  });
}

export async function GET() {
  let provider = "curated";
  let discovered: CandidateNews[] = [];
  try {
    const apiKey = process.env.NEWS_API_KEY;
    discovered = apiKey ? await fromNewsApi(apiKey) : await fromGdelt();
    provider = apiKey ? "NewsAPI" : "GDELT";
  } catch (error) {
    console.error("news-monitor", error);
  }

  const candidates = Array.from(
    new Map([
      ...discovered,
      ...CURATED_CHANNELS.map((item) => ({ ...item, trustedSource: true, curated: true })),
    ].map((item) => [item.url, item])).values(),
  );
  const reviewed = candidates.map(reviewCandidate);
  const items = reviewed
    .flatMap((result) => result.item ? [result.item] : [])
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 24);
  const review = {
    approved: reviewed.filter(({ decision }) => decision === "Aprobado").length,
    corrected: reviewed.filter(({ decision }) => decision === "Corregido").length,
    rejected: reviewed.filter(({ decision }) => decision === "Rechazado").length,
    policyVersion: "1.0",
  };

  return NextResponse.json(
    { items, review, updatedAt: new Date().toISOString(), provider },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
