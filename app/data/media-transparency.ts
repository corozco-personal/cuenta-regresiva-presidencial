export type BiasRating = "Izquierda" | "Centro izquierda" | "Centro" | "Centro derecha" | "Derecha" | "Sin datos" | "No aplica";
export type FactualityRating = "Muy alta" | "Alta" | "Mixta" | "Baja" | "Muy baja" | "Sin datos" | "No aplica";
export type OwnershipCategory = "Conglomerado mediático" | "Corporación" | "Gobierno" | "Independiente" | "Otro" | "Sin documentar";

export type MediaTransparencyProfile = {
  bias: BiasRating;
  factuality: FactualityRating;
  ownership: OwnershipCategory;
  owner: string;
  ratingSource?: string;
  ownershipSource?: string;
  note?: string;
};

const UNKNOWN: MediaTransparencyProfile = {
  bias: "Sin datos",
  factuality: "Sin datos",
  ownership: "Sin documentar",
  owner: "Sin información documentada en el portal",
  note: "No se asigna una calificación propia cuando no existe una evaluación externa verificable.",
};

const PROFILES: Record<string, MediaTransparencyProfile> = {
  "agencia efe": {
    bias: "Centro",
    factuality: "Alta",
    ownership: "Gobierno",
    owner: "SEPI · Estado español",
    ratingSource: "https://ground.news/interest/efe",
    ownershipSource: "https://verifica.efe.com/que-es-efe-verifica/",
  },
  "el país": {
    bias: "Centro izquierda",
    factuality: "Muy alta",
    ownership: "Conglomerado mediático",
    owner: "PRISA Media",
    ratingSource: "https://ground.news/interest/el-pais",
    ownershipSource: "https://www.prisa.com/media/",
  },
  "cnn en español": {
    bias: "Centro izquierda",
    factuality: "Alta",
    ownership: "Corporación",
    owner: "Warner Bros. Discovery",
    ratingSource: "https://ground.news/interest/cnn",
    ownershipSource: "https://wbd.com/our-brands/",
  },
  "associated press": {
    bias: "Centro izquierda",
    factuality: "Alta",
    ownership: "Independiente",
    owner: "Cooperativa de medios Associated Press",
    ratingSource: "https://ground.news/interest/associated-press-news",
    ownershipSource: "https://www.ap.org/about/",
  },
  "dw español": {
    bias: "Sin datos",
    factuality: "Sin datos",
    ownership: "Gobierno",
    owner: "Radiodifusora pública alemana financiada con presupuesto federal",
    ownershipSource: "https://corporate.dw.com/de/%C3%BCber-die-deutsche-welle/a-71848692",
    note: "La fuente institucional declara independencia editorial; el tipo de financiación no equivale a una orientación política.",
  },
  "noticias caracol": {
    bias: "Sin datos",
    factuality: "Sin datos",
    ownership: "Corporación",
    owner: "Caracol Televisión S. A.",
    ownershipSource: "https://www.caracoltv.com/terminos-y-condiciones",
  },
  "caracol radio": {
    bias: "Sin datos",
    factuality: "Sin datos",
    ownership: "Conglomerado mediático",
    owner: "PRISA Media",
    ownershipSource: "https://www.prisa.com/media/",
  },
};

const OFFICIAL_KINDS = /fuente primaria|entidad oficial/i;

export function getMediaProfile(source: string, kind = ""): MediaTransparencyProfile {
  const key = source.trim().toLocaleLowerCase("es");
  if (OFFICIAL_KINDS.test(kind)) {
    return {
      bias: "No aplica",
      factuality: "No aplica",
      ownership: "Gobierno",
      owner: source,
      note: "Es una fuente primaria institucional. No se trata como medio periodístico ni se le asigna factualidad u orientación editorial.",
    };
  }
  return PROFILES[key] ?? UNKNOWN;
}

export function biasGroup(bias: BiasRating): "left" | "center" | "right" | "unknown" {
  if (bias === "Izquierda" || bias === "Centro izquierda") return "left";
  if (bias === "Centro") return "center";
  if (bias === "Derecha" || bias === "Centro derecha") return "right";
  return "unknown";
}
