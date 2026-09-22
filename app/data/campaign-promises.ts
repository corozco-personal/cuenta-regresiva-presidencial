export type PromiseStatus =
  | "Cumplida"
  | "En ejecución"
  | "Pendiente"
  | "Vencida"
  | "Incumplida"
  | "Sin evidencia suficiente";

export type CampaignPromise = {
  id: string;
  title: string;
  category: string;
  originalPromise: string;
  status: PromiseStatus;
  deadline: string;
  progress: number;
  assessment: string;
  campaignSource: { label: string; url: string };
  evidence: Array<{ label: string; url: string; kind: "Fuente oficial" | "Cobertura periodística" }>;
  lastReviewed: string;
};

export const campaignPromises: CampaignPromise[] = [
  {
    id: "donar-salario",
    title: "Donar el salario presidencial",
    category: "Transparencia",
    originalPromise: "Renunciar al salario presidencial y destinarlo a causas sociales.",
    status: "Cumplida",
    deadline: "Durante el mandato",
    progress: 100,
    assessment: "Existe cobertura pública de la entrega del primer salario. La marca de cumplimiento se limita a ese acto documentado y no presume aportes futuros.",
    campaignSource: { label: "Programa de gobierno", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [{ label: "Europa Press · entrega del primer salario", url: "https://www.europapress.es/internacional/noticia-espriella-cumple-promesa-renuncia-primer-sueldo-favor-dos-geriatricos-afectados-terremoto-20260913014550.html", kind: "Cobertura periodística" }],
    lastReviewed: "2026-09-22",
  },
  {
    id: "choque-salud",
    title: "Poner en marcha un plan de choque en salud",
    category: "Salud",
    originalPromise: "Activar medidas inmediatas para enfrentar la crisis del sistema de salud.",
    status: "En ejecución",
    deadline: "Primeros 100 días",
    progress: 30,
    assessment: "La Presidencia anunció el inicio del plan. La ejecución y sus resultados requieren indicadores posteriores; anunciar no equivale a cumplir la meta completa.",
    campaignSource: { label: "Programa de gobierno", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [{ label: "Presidencia · declaración sobre el plan", url: "https://www.presidencia.gov.co/prensa/Paginas/Declaracion-del-Presidente-de-la-Republica-Abelardo-De-La-Espriella-al-termino-260921.aspx", kind: "Fuente oficial" }],
    lastReviewed: "2026-09-22",
  },
  {
    id: "recuperar-territorios",
    title: "Recuperar territorios en los primeros 90 días",
    category: "Seguridad",
    originalPromise: "Recuperar el control territorial mediante una estrategia de seguridad durante los primeros 90 días.",
    status: "Pendiente",
    deadline: "5 de noviembre de 2026",
    progress: 0,
    assessment: "El plazo continúa abierto. No se encontró evidencia pública suficiente para medir todavía el resultado territorial prometido.",
    campaignSource: { label: "Programa de gobierno · PDF", url: "https://defensoresdelapatria.com/wp-content/uploads/2026/04/PROPUESTAS-ABELARDO-DE-LA-ESPRIELLA-EL-TIGRE.pdf" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "reducir-burocracia",
    title: "Reducir la burocracia estatal en 40 %",
    category: "Estado",
    originalPromise: "Reducir en 40 % el tamaño de la burocracia estatal.",
    status: "Sin evidencia suficiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "No se identificó una línea base pública, un indicador oficial comparable ni evidencia suficiente para calcular avance sin especular.",
    campaignSource: { label: "Propuestas de campaña", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
];

export const promiseStatusDefinition: Record<PromiseStatus, string> = {
  "Cumplida": "La evidencia disponible permite verificar el resultado prometido dentro del alcance descrito.",
  "En ejecución": "Hay acciones documentadas, pero el resultado final o el plazo todavía no permiten declarar cumplimiento.",
  "Pendiente": "El plazo sigue abierto y aún no existe un resultado verificable.",
  "Vencida": "El plazo terminó sin evidencia suficiente para declarar cumplimiento.",
  "Incumplida": "La evidencia disponible contradice de forma verificable el resultado prometido.",
  "Sin evidencia suficiente": "No existe información pública comparable para emitir una conclusión responsable.",
};
