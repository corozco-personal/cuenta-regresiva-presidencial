import { NextResponse } from "next/server";
import { getD1 } from "../../../db";

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
  stage: "Campaña" | "Transición" | "Presidencia";
  decision: "Admitido" | "Corregido";
  decisionReason: string;
  evidenceLevel: "Documento oficial" | "Reportado por varias fuentes" | "Reporte de una fuente";
  processStatus: "Alegación" | "Investigación" | "Imputación" | "Decisión judicial" | "Hecho documentado";
  sources: Array<{ source: string; title?: string; url: string; kind: BaseNews["kind"] }>;
  linkCheck?: { status: "Disponible" | "Retirado" | "No comprobado"; checkedAt: string; lastModified?: string; finalUrl?: string };
  country?: string;
  language?: string;
};

export type SourceProfile = { domain: string; scope: Scope; official?: boolean; label?: string; country?: string; region?: string };

const CAMPAIGN_START = "2025-07-16T00:00:00-05:00";
const ELECTION_DAY = new Date("2026-06-21T23:59:59-05:00").getTime();
const INAUGURATION_DAY = new Date("2026-08-07T00:00:00-05:00").getTime();
const SUBJECT_PATTERN = /abelardo(?:\s+gabriel)?\s+de\s+la\s+espriella|de\s+la\s+espriella|defensores\s+de\s+la\s+patria/i;

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
  { domain: "eluniversal.com.co", scope: "Nacional", label: "El Universal", country: "Colombia", region: "Colombia" },
  { domain: "semana.com", scope: "Nacional", label: "Semana", country: "Colombia", region: "Colombia" },
  { domain: "wradio.com.co", scope: "Nacional", label: "W Radio", country: "Colombia", region: "Colombia" },
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
  { domain: "efe.com", scope: "Internacional", label: "Agencia EFE", country: "España", region: "Europa" },
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
    id: "campana-caracol-anuncio",
    title: "Abelardo de la Espriella confirmó su candidatura presidencial y el inicio de la recolección de firmas",
    source: "Caracol Radio",
    url: "https://caracol.com.co/2025/07/17/no-me-arrodillo-peleo-abelardo-de-la-espriella-confirma-su-candidatura-presidencial-para-2026/?outputType=amp",
    publishedAt: "2025-07-17T06:00:00-05:00",
    kind: "Cobertura periodística",
    scope: "Nacional",
  },
  {
    id: "campana-elpais-convencion",
    title: "El candidato Abelardo de la Espriella reunió a sus seguidores en la convención de Defensores de la Patria",
    source: "El País",
    url: "https://elpais.com/america-colombia/2025-11-04/el-candidato-ultra-abelardo-de-la-espriella-se-da-un-bano-de-masas-en-un-congreso-en-bogota-el-tigre-ha-despertado.html",
    publishedAt: "2025-11-04T06:00:00+01:00",
    kind: "Cobertura periodística",
    scope: "Internacional",
  },
  {
    id: "campana-efe-firmas",
    title: "De la Espriella entregó firmas para avalar su candidatura presidencial",
    source: "Agencia EFE",
    url: "https://efe.com/mundo/2025-12-04/candidato-abelardo-de-la-espriella-colombia-presidencia-campana/",
    publishedAt: "2025-12-04T12:00:00-05:00",
    kind: "Cobertura periodística",
    scope: "Internacional",
  },
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

export function profileFor(hostname: string) {
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
  { label: "Nombramientos y contratación", pattern: /nombr(?:a|amiento)|design(?:a|ación)|posesiona|contrat(?:a|ación)|banco de talentos|headhunter|definición de su gabinete|anuncia a .+ como (?:ministro|director|gerente|asesor)|\btaps\b|\bappoints?\b|\bhiring\b/i },
  { label: "Consejo asesor", pattern: /consejo de sabios|consejo asesor|junta asesora|asesores? presidenciales?/i },
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

function stageFor(publishedAt: string): PublicNews["stage"] {
  const timestamp = Date.parse(publishedAt);
  if (timestamp <= ELECTION_DAY) return "Campaña";
  if (timestamp < INAUGURATION_DAY) return "Transición";
  return "Presidencia";
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
  if (!candidate.curated && !SUBJECT_PATTERN.test(candidate.title)) {
    return { decision: "Rechazado" as const, reason: "El título no tiene relación directa con la persona monitoreada." };
  }

  const correctedTitle = normalizeTitle(candidate.title);
  const corrected = correctedTitle !== candidate.title;
  const publishable = {
    id: candidate.id,
    title: candidate.title,
    source: candidate.source,
    url: candidate.url,
    publishedAt: candidate.publishedAt,
    kind: candidate.kind,
    scope: candidate.scope,
    country: candidate.country,
    language: candidate.language,
  };
  const item: PublicNews = {
    ...publishable,
    title: correctedTitle,
    category: classify(correctedTitle),
    stage: stageFor(candidate.publishedAt),
    decision: corrected ? "Corregido" : "Admitido",
    decisionReason: corrected
      ? "Se normalizó únicamente la forma del titular; el enlace original permanece disponible."
      : candidate.kind === "Fuente primaria"
        ? "Fuente oficial admitida y referencia directa al asunto monitoreado."
        : "Medio admitido, referencia directa y enlace verificable.",
    evidenceLevel: candidate.kind === "Fuente primaria" ? "Documento oficial" : "Reporte de una fuente",
    processStatus: processStatus(correctedTitle),
    sources: [{ source: candidate.source, title: correctedTitle, url: candidate.url, kind: candidate.kind }],
  };
  return { decision: item.decision, reason: item.decisionReason, item };
}

function titleTokens(title: string) {
  const structural = new Set(["abelardo", "espriella", "presidente", "presidenta", "colombia", "colombiano", "colombiana", "gobierno", "nacional", "nuevo", "nueva", "sobre"]);
  return new Set(title.toLocaleLowerCase("es").replace(/[^a-záéíóúñ0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 4 && !structural.has(word)));
}

function similarity(left: string, right: string) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  const shared = [...a].filter((token) => b.has(token)).length;
  return shared / Math.max(1, new Set([...a, ...b]).size);
}

function sharedTitleTokens(left: string, right: string) {
  const a = titleTokens(left);
  const b = titleTokens(right);
  return [...a].filter((token) => b.has(token)).length;
}

function groupCoverage(items: PublicNews[]) {
  return items.reduce<PublicNews[]>((groups, item) => {
    const match = groups.find((group) =>
      group.category === item.category &&
      Math.abs(Date.parse(group.publishedAt) - Date.parse(item.publishedAt)) <= 3 * 86_400_000 &&
      sharedTitleTokens(group.title, item.title) >= 2 &&
      similarity(group.title, item.title) >= 0.25,
    );
    if (!match) return [...groups, item];
    if (!match.sources.some(({ source }) => source === item.source)) match.sources.push(...item.sources.filter((source) => !match.sources.some((existing) => existing.source === source.source)));
    match.evidenceLevel = match.sources.length > 1 ? "Reportado por varias fuentes" : match.evidenceLevel;
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
    await response.body?.cancel();
    return {
      ...item,
      linkCheck: {
        status,
        checkedAt,
        lastModified: response.headers.get("last-modified") ?? undefined,
        finalUrl: response.url.startsWith("https://") ? response.url : undefined,
      },
    };
  } catch {
    return { ...item, linkCheck: { status: "No comprobado", checkedAt } };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 7500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

async function fromNewsApi(apiKey: string): Promise<CandidateNews[]> {
  const params = new URLSearchParams({
    q: '("Abelardo de la Espriella" OR "De la Espriella" OR "Defensores de la Patria")',
    from: CAMPAIGN_START.slice(0, 10),
    sortBy: "publishedAt",
    pageSize: "100",
  });
  const response = await fetchWithTimeout(`https://newsapi.org/v2/everything?${params}`, {
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
      if (!SUBJECT_PATTERN.test(title)) return [];
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
    query: '("Abelardo de la Espriella" OR "Abelardo Gabriel de la Espriella" OR "De la Espriella" OR "Defensores de la Patria")',
    mode: "ArtList",
    maxrecords: "250",
    format: "json",
    sort: "DateDesc",
  });
  const response = await fetchWithTimeout(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, {
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
      if (!SUBJECT_PATTERN.test(title)) return [];
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

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function xmlTag(item: string, tag: string) {
  return decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1]?.trim() ?? "");
}

async function fromGoogleNews(): Promise<CandidateNews[]> {
  const feedsToSearch = [
    { query: '"Abelardo de la Espriella" after:2026-08-06', hl: "es-419", gl: "CO", ceid: "CO:es-419" },
    { query: '("Abelardo de la Espriella" OR "Defensores de la Patria") after:2025-07-15 before:2026-01-01', hl: "es-419", gl: "CO", ceid: "CO:es-419" },
    { query: '("Abelardo de la Espriella" OR "Defensores de la Patria") after:2025-12-31 before:2026-08-07', hl: "es-419", gl: "CO", ceid: "CO:es-419" },
    { query: '"Abelardo de la Espriella" Colombia after:2025-07-15', hl: "en-US", gl: "US", ceid: "US:en" },
    { query: '"Abelardo de la Espriella" Colombia after:2025-07-15', hl: "es", gl: "ES", ceid: "ES:es" },
  ];
  const feeds = await Promise.allSettled(feedsToSearch.map(async ({ query, hl, gl, ceid }) => {
    const params = new URLSearchParams({ q: query, hl, gl, ceid });
    const response = await fetchWithTimeout(`https://news.google.com/rss/search?${params}`, {
      headers: { "User-Agent": "CuentaPublica/1.3 (documentary monitoring)" },
    });
    if (!response.ok) throw new Error(`Google News RSS ${response.status}`);
    return response.text();
  }));

  return feeds.flatMap((feed) => {
    if (feed.status !== "fulfilled") return [];
    return [...feed.value.matchAll(/<item>([\s\S]*?)<\/item>/gi)].flatMap((match) => {
      try {
        const item = match[1];
        const title = normalizeTitle(xmlTag(item, "title").replace(/\s+-\s+[^-]+$/, ""));
        if (!SUBJECT_PATTERN.test(title)) return [];
        const url = xmlTag(item, "link");
        const sourceMatch = item.match(/<source[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/i);
        const sourceUrl = decodeXml(sourceMatch?.[1] ?? "");
        const hostname = new URL(sourceUrl || url).hostname;
        const profile = profileFor(hostname);
        const publishedAt = new Date(xmlTag(item, "pubDate")).toISOString();
        if (Date.parse(publishedAt) < Date.parse(CAMPAIGN_START)) return [];
        return [{
          id: idFor(url),
          title,
          source: profile?.label ?? decodeXml(sourceMatch?.[2] ?? hostname),
          url,
          publishedAt,
          kind: profile?.official ? "Fuente primaria" as const : "Cobertura periodística" as const,
          scope: profile?.scope ?? "Internacional",
          trustedSource: Boolean(profile),
          country: profile?.country ?? (profile?.scope === "Nacional" ? "Colombia" : "Sin identificar"),
          language: "Español",
          domain: hostname.replace(/^www\./, ""),
        }];
      } catch { return []; }
    });
  });
}

type StoredNewsRow = Omit<PublicNews, "sources" | "linkCheck" | "evidenceLevel"> & {
  evidenceLevel: string;
  sources_json: string; link_status: PublicNews["linkCheck"] extends { status: infer T } ? T : string;
  final_url?: string; last_seen_at: string;
};

async function storeAndLoadNews(items: PublicNews[], monitor: {
  startedAt: string; completedAt: string; providers: string; discovered: number; published: number;
  rejected: number; countries: number; languages: number; status: string; errors: string | null;
}) {
  try {
    const db = getD1();
    const now = monitor.completedAt;
    const statements = items.map((item) => db.prepare(`
      INSERT INTO news_articles (id,title,source,url,published_at,scope,kind,category,stage,decision,decision_reason,evidence_level,process_status,sources_json,country,language,link_status,final_url,first_seen_at,last_seen_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(url) DO UPDATE SET title=excluded.title, source=excluded.source, published_at=excluded.published_at,
      scope=excluded.scope, kind=excluded.kind, category=excluded.category, stage=excluded.stage, decision=excluded.decision,
      decision_reason=excluded.decision_reason, evidence_level=excluded.evidence_level, process_status=excluded.process_status,
      sources_json=excluded.sources_json, country=excluded.country, language=excluded.language, link_status=excluded.link_status,
      final_url=excluded.final_url, last_seen_at=excluded.last_seen_at
    `).bind(item.id, item.title, item.source, item.url, item.publishedAt, item.scope, item.kind, item.category, item.stage,
      item.decision, item.decisionReason, item.evidenceLevel, item.processStatus, JSON.stringify(item.sources),
      item.country ?? null, item.language ?? null, item.linkCheck?.status ?? null, item.linkCheck?.finalUrl ?? null, now, now));
    if (statements.length) await db.batch(statements);
    await db.prepare(`INSERT INTO monitor_runs (id,started_at,completed_at,providers,discovered_count,published_count,rejected_count,countries,languages,status,error_summary)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(), monitor.startedAt, monitor.completedAt, monitor.providers,
      String(monitor.discovered), String(monitor.published), String(monitor.rejected), String(monitor.countries),
      String(monitor.languages), monitor.status, monitor.errors).run();
    const stored = await db.prepare(`SELECT id,title,source,url,published_at AS publishedAt,scope,kind,category,stage,decision,
      decision_reason AS decisionReason,evidence_level AS evidenceLevel,process_status AS processStatus,sources_json,country,language,
      link_status,final_url,last_seen_at FROM news_articles ORDER BY published_at DESC LIMIT 600`).all<StoredNewsRow>();
    return stored.results.flatMap((row) => {
      try { return [{ ...row, evidenceLevel: row.evidenceLevel === "Confirmado por varias fuentes" ? "Reportado por varias fuentes" : row.evidenceLevel, sources: JSON.parse(row.sources_json), linkCheck: { status: row.link_status || "No comprobado", checkedAt: row.last_seen_at, finalUrl: row.final_url || undefined } } as PublicNews]; }
      catch { return []; }
    });
  } catch (error) {
    console.warn("news-persistence", error);
    return [];
  }
}

export async function GET() {
  const startedAt = new Date().toISOString();
  let provider = "curated";
  let discovered: CandidateNews[] = [];
  const apiKey = process.env.NEWS_API_KEY;
  const providers = [
    { name: "Google News RSS", request: fromGoogleNews() },
    { name: "GDELT", request: fromGdelt() },
    ...(apiKey ? [{ name: "NewsAPI", request: fromNewsApi(apiKey) }] : []),
  ];
  const results = await Promise.allSettled(providers.map(({ request }) => request));
  discovered = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  provider = providers.filter((_, index) => results[index].status === "fulfilled").map(({ name }) => name).join(" + ") || "curated";
  const providerErrors = results.flatMap((result, index) => result.status === "rejected" ? [`${providers[index].name}: no disponible`] : []);
  providerErrors.forEach((message) => console.warn("news-monitor", message));

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
    .slice(0, 600);
  const grouped = groupCoverage(publishable);
  const stageLimits: Record<PublicNews["stage"], number> = { Presidencia: 50, Transición: 50, Campaña: 80 };
  const selected = (["Presidencia", "Transición", "Campaña"] as const)
    .flatMap((stage) => grouped.filter((item) => item.stage === stage).slice(0, stageLimits[stage]))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const checkedRecent = await Promise.all(selected.slice(0, 18).map(checkLink));
  const currentItems = [...checkedRecent, ...selected.slice(18).map((item) => ({
    ...item,
    linkCheck: { status: "No comprobado" as const, checkedAt: new Date().toISOString() },
  }))];
  const review = {
    admitted: reviewed.filter(({ decision }) => decision === "Admitido").length,
    corrected: reviewed.filter(({ decision }) => decision === "Corregido").length,
    rejected: reviewed.filter(({ decision }) => decision === "Rechazado").length,
    policyVersion: "1.2",
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
  const completedAt = new Date().toISOString();
  const storedItems = await storeAndLoadNews(currentItems, {
    startedAt, completedAt, providers: provider, discovered: discovered.length, published: currentItems.length,
    rejected: review.rejected, countries: globalStats.countries, languages: globalStats.languages,
    status: providerErrors.length === providers.length ? "degradado" : providerErrors.length ? "parcial" : "operativo",
    errors: providerErrors.length ? providerErrors.join("; ") : null,
  });
  const items = groupCoverage(Array.from(new Map([...currentItems, ...storedItems].map((item) => [item.url, item])).values()))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 180);

  return NextResponse.json(
    {
      items,
      review,
      sourceDirectory,
      globalRadar,
      globalStats,
      coverage: { startsAt: CAMPAIGN_START, stages: ["Campaña", "Transición", "Presidencia"] },
      updatedAt: new Date().toISOString(),
      provider,
      monitor: { startedAt, completedAt, status: providerErrors.length === providers.length ? "degradado" : providerErrors.length ? "parcial" : "operativo", errors: providerErrors },
    },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  );
}
