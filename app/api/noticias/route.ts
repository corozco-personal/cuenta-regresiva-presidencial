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
type CandidateNews = BaseNews & { trustedSource: boolean; curated?: boolean; country?: string; language?: string; domain?: string };
type PublicNews = BaseNews & {
  category: string;
  decision: "Admitido" | "Corregido";
  decisionReason: string;
  evidenceLevel: "Documento oficial" | "Confirmado por varias fuentes" | "Reporte de una fuente";
  processStatus: "Alegación" | "Investigación" | "Imputación" | "Decisión judicial" | "Hecho documentado";
  sources: Array<{ source: string; url: string; kind: BaseNews["kind"] }>;
  linkCheck?: { status: "Disponible" | "Retirado" | "No comprobado"; checkedAt: string; lastModified?: string };
  country?: string;
  language?: string;
};

type SourceProfile = { domain: string; scope: Scope; official?: boolean; label?: string; country?: string; region?: string };

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
  { domain: "lanacion.com.ar", scope: "Internacional", label: "La Nación", country: "Argentina", region: "América Latina" },
  { domain: "clarin.com", scope: "Internacional", label: "Clarín", country: "Argentina", region: "América Latina" },
  { domain: "folha.uol.com.br", scope: "Internacional", label: "Folha de S.Paulo", country: "Brasil", region: "América Latina" },
  { domain: "oglobo.globo.com", scope: "Internacional", label: "O Globo", country: "Brasil", region: "América Latina" },
  { domain: "eluniversal.com.mx", scope: "Internacional", label: "El Universal", country: "México", region: "América Latina" },
  { domain: "latercera.com", scope: "Internacional", label: "La Tercera", country: "Chile", region: "América Latina" },
  { domain: "elcomercio.pe", scope: "Internacional", label: "El Comercio", country: "Perú", region: "América Latina" },
  { domain: "eluniverso.com", scope: "Internacional", label: "El Universo", country: "Ecuador", region: "América Latina" },
  { domain: "elpais.com.uy", scope: "Internacional", label: "El País Uruguay", country: "Uruguay", region: "América Latina" },
  { domain: "abc.com.py", scope: "Internacional", label: "ABC Color", country: "Paraguay", region: "América Latina" },
  { domain: "eldeber.com.bo", scope: "Internacional", label: "El Deber", country: "Bolivia", region: "América Latina" },
  { domain: "nacion.com", scope: "Internacional", label: "La Nación", country: "Costa Rica", region: "América Latina" },
  { domain: "prensa.com", scope: "Internacional", label: "La Prensa", country: "Panamá", region: "América Latina" },
  { domain: "listindiario.com", scope: "Internacional", label: "Listín Diario", country: "República Dominicana", region: "Caribe" },
  { domain: "jamaica-gleaner.com", scope: "Internacional", label: "Jamaica Gleaner", country: "Jamaica", region: "Caribe" },
  { domain: "lemonde.fr", scope: "Internacional", label: "Le Monde", country: "Francia", region: "Europa" },
  { domain: "spiegel.de", scope: "Internacional", label: "Der Spiegel", country: "Alemania", region: "Europa" },
  { domain: "repubblica.it", scope: "Internacional", label: "la Repubblica", country: "Italia", region: "Europa" },
  { domain: "publico.pt", scope: "Internacional", label: "Público", country: "Portugal", region: "Europa" },
  { domain: "nrc.nl", scope: "Internacional", label: "NRC", country: "Países Bajos", region: "Europa" },
  { domain: "irishtimes.com", scope: "Internacional", label: "The Irish Times", country: "Irlanda", region: "Europa" },
  { domain: "aftenposten.no", scope: "Internacional", label: "Aftenposten", country: "Noruega", region: "Europa" },
  { domain: "dn.se", scope: "Internacional", label: "Dagens Nyheter", country: "Suecia", region: "Europa" },
  { domain: "hs.fi", scope: "Internacional", label: "Helsingin Sanomat", country: "Finlandia", region: "Europa" },
  { domain: "politiken.dk", scope: "Internacional", label: "Politiken", country: "Dinamarca", region: "Europa" },
  { domain: "wyborcza.pl", scope: "Internacional", label: "Gazeta Wyborcza", country: "Polonia", region: "Europa" },
  { domain: "aktualne.cz", scope: "Internacional", label: "Aktuálně.cz", country: "Chequia", region: "Europa" },
  { domain: "derstandard.at", scope: "Internacional", label: "Der Standard", country: "Austria", region: "Europa" },
  { domain: "swissinfo.ch", scope: "Internacional", label: "SWI swissinfo.ch", country: "Suiza", region: "Europa" },
  { domain: "ekathimerini.com", scope: "Internacional", label: "Kathimerini", country: "Grecia", region: "Europa" },
  { domain: "kyivindependent.com", scope: "Internacional", label: "The Kyiv Independent", country: "Ucrania", region: "Europa" },
  { domain: "balkaninsight.com", scope: "Internacional", label: "Balkan Insight", country: "Balcanes", region: "Europa" },
  { domain: "nation.africa", scope: "Internacional", label: "Nation Africa", country: "Kenia", region: "África" },
  { domain: "premiumtimesng.com", scope: "Internacional", label: "Premium Times", country: "Nigeria", region: "África" },
  { domain: "dailymaverick.co.za", scope: "Internacional", label: "Daily Maverick", country: "Sudáfrica", region: "África" },
  { domain: "monitor.co.ug", scope: "Internacional", label: "Daily Monitor", country: "Uganda", region: "África" },
  { domain: "newtimes.co.rw", scope: "Internacional", label: "The New Times", country: "Ruanda", region: "África" },
  { domain: "graphic.com.gh", scope: "Internacional", label: "Daily Graphic", country: "Ghana", region: "África" },
  { domain: "thecitizen.co.tz", scope: "Internacional", label: "The Citizen", country: "Tanzania", region: "África" },
  { domain: "allafrica.com", scope: "Internacional", label: "AllAfrica", country: "África", region: "África" },
  { domain: "jeuneafrique.com", scope: "Internacional", label: "Jeune Afrique", country: "África francófona", region: "África" },
  { domain: "le360.ma", scope: "Internacional", label: "Le360", country: "Marruecos", region: "África" },
  { domain: "egyptindependent.com", scope: "Internacional", label: "Egypt Independent", country: "Egipto", region: "África" },
  { domain: "thehindu.com", scope: "Internacional", label: "The Hindu", country: "India", region: "Asia" },
  { domain: "indianexpress.com", scope: "Internacional", label: "The Indian Express", country: "India", region: "Asia" },
  { domain: "dawn.com", scope: "Internacional", label: "Dawn", country: "Pakistán", region: "Asia" },
  { domain: "thedailystar.net", scope: "Internacional", label: "The Daily Star", country: "Bangladés", region: "Asia" },
  { domain: "kathmandupost.com", scope: "Internacional", label: "The Kathmandu Post", country: "Nepal", region: "Asia" },
  { domain: "straitstimes.com", scope: "Internacional", label: "The Straits Times", country: "Singapur", region: "Asia" },
  { domain: "channelnewsasia.com", scope: "Internacional", label: "CNA", country: "Singapur", region: "Asia" },
  { domain: "malaysiakini.com", scope: "Internacional", label: "Malaysiakini", country: "Malasia", region: "Asia" },
  { domain: "bangkokpost.com", scope: "Internacional", label: "Bangkok Post", country: "Tailandia", region: "Asia" },
  { domain: "vnexpress.net", scope: "Internacional", label: "VnExpress", country: "Vietnam", region: "Asia" },
  { domain: "kompas.com", scope: "Internacional", label: "Kompas", country: "Indonesia", region: "Asia" },
  { domain: "philstar.com", scope: "Internacional", label: "The Philippine Star", country: "Filipinas", region: "Asia" },
  { domain: "japantimes.co.jp", scope: "Internacional", label: "The Japan Times", country: "Japón", region: "Asia" },
  { domain: "asahi.com", scope: "Internacional", label: "The Asahi Shimbun", country: "Japón", region: "Asia" },
  { domain: "koreaherald.com", scope: "Internacional", label: "The Korea Herald", country: "Corea del Sur", region: "Asia" },
  { domain: "scmp.com", scope: "Internacional", label: "South China Morning Post", country: "Hong Kong", region: "Asia" },
  { domain: "taipeitimes.com", scope: "Internacional", label: "Taipei Times", country: "Taiwán", region: "Asia" },
  { domain: "haaretz.com", scope: "Internacional", label: "Haaretz", country: "Israel", region: "Oriente Medio" },
  { domain: "timesofisrael.com", scope: "Internacional", label: "The Times of Israel", country: "Israel", region: "Oriente Medio" },
  { domain: "arabnews.com", scope: "Internacional", label: "Arab News", country: "Arabia Saudita", region: "Oriente Medio" },
  { domain: "thenationalnews.com", scope: "Internacional", label: "The National", country: "Emiratos Árabes Unidos", region: "Oriente Medio" },
  { domain: "al-monitor.com", scope: "Internacional", label: "Al-Monitor", country: "Oriente Medio", region: "Oriente Medio" },
  { domain: "abc.net.au", scope: "Internacional", label: "ABC News Australia", country: "Australia", region: "Oceanía" },
  { domain: "smh.com.au", scope: "Internacional", label: "The Sydney Morning Herald", country: "Australia", region: "Oceanía" },
  { domain: "rnz.co.nz", scope: "Internacional", label: "RNZ", country: "Nueva Zelanda", region: "Oceanía" },
  { domain: "nzherald.co.nz", scope: "Internacional", label: "NZ Herald", country: "Nueva Zelanda", region: "Oceanía" },
  { domain: "fijitimes.com", scope: "Internacional", label: "The Fiji Times", country: "Fiyi", region: "Oceanía" },
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

function processStatus(title: string): PublicNews["processStatus"] {
  if (/sentencia|condena|absoluci|fallo definitivo/i.test(title)) return "Decisión judicial";
  if (/imputa|imputación/i.test(title)) return "Imputación";
  if (/investiga|investigación|indaga/i.test(title)) return "Investigación";
  if (/denuncia|acusa|señala/i.test(title)) return "Alegación";
  return "Hecho documentado";
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
    decision: corrected ? "Corregido" : "Admitido",
    decisionReason: corrected
      ? "Se normalizó únicamente la forma del titular; el enlace original permanece disponible."
      : candidate.kind === "Fuente primaria"
        ? "Fuente oficial admitida y referencia directa al asunto monitoreado."
        : "Medio admitido, referencia directa y enlace verificable.",
    evidenceLevel: candidate.kind === "Fuente primaria" ? "Documento oficial" : "Reporte de una fuente",
    processStatus: processStatus(correctedTitle),
    sources: [{ source: candidate.source, url: candidate.url, kind: candidate.kind }],
  };
  return { decision: item.decision, reason: item.decisionReason, item };
}

function titleTokens(title: string) {
  return new Set(title.toLocaleLowerCase("es").replace(/[^a-záéíóúñ0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 4));
}

function similarity(left: string, right: string) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  const shared = [...a].filter((token) => b.has(token)).length;
  return shared / Math.max(1, new Set([...a, ...b]).size);
}

function groupCoverage(items: PublicNews[]) {
  return items.reduce<PublicNews[]>((groups, item) => {
    const match = groups.find((group) =>
      group.category === item.category &&
      Math.abs(Date.parse(group.publishedAt) - Date.parse(item.publishedAt)) <= 7 * 86_400_000 &&
      similarity(group.title, item.title) >= 0.55,
    );
    if (!match) return [...groups, item];
    if (!match.sources.some(({ url }) => url === item.url)) match.sources.push(...item.sources);
    match.evidenceLevel = match.sources.length > 1 ? "Confirmado por varias fuentes" : match.evidenceLevel;
    return groups;
  }, []);
}

async function checkLink(item: PublicNews): Promise<PublicNews> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(item.url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "CuentaPublica/1.2 (link verification)" },
    });
    const status = response.status === 404 || response.status === 410
      ? "Retirado" as const
      : response.ok
        ? "Disponible" as const
        : "No comprobado" as const;
    return {
      ...item,
      linkCheck: {
        status,
        checkedAt,
        lastModified: response.headers.get("last-modified") ?? undefined,
      },
    };
  } catch {
    return { ...item, linkCheck: { status: "No comprobado", checkedAt } };
  } finally {
    clearTimeout(timeout);
  }
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
        country: profile?.country ?? (profile?.scope === "Nacional" ? "Colombia" : "Sin identificar"),
        language: "Español",
        domain: hostname.replace(/^www\./, ""),
      }];
    } catch { return []; }
  });
}

async function fromGdelt(): Promise<CandidateNews[]> {
  const params = new URLSearchParams({
    query: '("Abelardo de la Espriella" OR "Abelardo De La Espriella" OR "De la Espriella")',
    mode: "ArtList",
    maxrecords: "250",
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
        country: String(article.sourcecountry ?? profile?.country ?? "Sin identificar"),
        language: String(article.language ?? "Sin identificar"),
        domain: hostname.replace(/^www\./, ""),
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
  const publishable = reviewed
    .flatMap((result) => result.item ? [result.item] : [])
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 24);
  const items = await Promise.all(groupCoverage(publishable).slice(0, 12).map(checkLink));
  const review = {
    admitted: reviewed.filter(({ decision }) => decision === "Admitido").length,
    corrected: reviewed.filter(({ decision }) => decision === "Corregido").length,
    rejected: reviewed.filter(({ decision }) => decision === "Rechazado").length,
    policyVersion: "1.1",
  };
  const sourceDirectory = SOURCE_PROFILES.map((profile) => ({
    domain: profile.domain,
    label: profile.label ?? profile.domain,
    scope: profile.scope,
    kind: profile.official ? "Institución oficial" : "Medio periodístico",
    country: profile.country ?? (profile.scope === "Nacional" ? "Colombia" : "Cobertura internacional"),
    region: profile.region ?? (profile.scope === "Nacional" ? "Colombia" : "Global"),
    criterion: profile.official
      ? "Publica documentos o comunicaciones institucionales de primera mano."
      : "Medio identificado con trayectoria editorial y enlaces públicos trazables.",
  }));
  const domainCounts = discovered.reduce<Record<string, number>>((counts, item) => {
    const domain = item.domain ?? new URL(item.url).hostname.replace(/^www\./, "");
    counts[domain] = (counts[domain] ?? 0) + 1;
    return counts;
  }, {});
  const globalRadar = discovered.slice(0, 80).map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source,
    domain: item.domain ?? new URL(item.url).hostname.replace(/^www\./, ""),
    url: item.url,
    publishedAt: item.publishedAt,
    country: item.country ?? "Sin identificar",
    language: item.language ?? "Sin identificar",
    status: item.trustedSource ? "Admitido para monitoreo" : "Pendiente de evaluación",
    signal: item.trustedSource
      ? "Directorio editorial"
      : (domainCounts[item.domain ?? ""] ?? 0) > 1
        ? "Cobertura recurrente"
        : "Hallazgo puntual",
  }));
  const globalStats = {
    results: globalRadar.length,
    countries: new Set(globalRadar.map((item) => item.country).filter((value) => value !== "Sin identificar")).size,
    languages: new Set(globalRadar.map((item) => item.language).filter((value) => value !== "Sin identificar")).size,
    domains: new Set(globalRadar.map((item) => item.domain)).size,
    catalogSources: SOURCE_PROFILES.length,
  };

  return NextResponse.json(
    { items, review, sourceDirectory, globalRadar, globalStats, updatedAt: new Date().toISOString(), provider },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
