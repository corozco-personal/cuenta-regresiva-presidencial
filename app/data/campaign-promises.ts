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
  {
    id: "rescate-salud-10-billones",
    title: "Destinar $10 billones al rescate de la salud",
    category: "Salud",
    originalPromise: "Proponer $10 billones para recuperar el flujo financiero del sistema de salud y proteger la atención.",
    status: "En ejecución",
    deadline: "Durante el mandato",
    progress: 15,
    assessment: "El Gobierno anunció un plan de choque, pero todavía no existe evidencia presupuestal suficiente para verificar la asignación total de $10 billones.",
    campaignSource: { label: "Portal oficial de propuestas · Salud", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [{ label: "Presidencia · declaración sobre el plan", url: "https://www.presidencia.gov.co/prensa/Paginas/Declaracion-del-Presidente-de-la-Republica-Abelardo-De-La-Espriella-al-termino-260921.aspx", kind: "Fuente oficial" }],
    lastReviewed: "2026-09-22",
  },
  {
    id: "eliminar-4x1000",
    title: "Eliminar el impuesto del 4×1000",
    category: "Economía",
    originalPromise: "Eliminar el gravamen a los movimientos financieros conocido como 4×1000.",
    status: "Pendiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "No se encontró todavía una ley sancionada ni un resultado verificable que permita declarar avance o cumplimiento.",
    campaignSource: { label: "Portal oficial de propuestas · Economía", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "top-25-competitividad",
    title: "Llevar a Colombia al Top 25 de competitividad",
    category: "Economía",
    originalPromise: "Llevar a Colombia al grupo de los 25 países con mejor desempeño mundial en competitividad.",
    status: "Pendiente",
    deadline: "7 de agosto de 2030",
    progress: 0,
    assessment: "La meta requiere definir el índice internacional de referencia y comparar su línea base con el resultado de cierre del mandato.",
    campaignSource: { label: "Portal oficial de propuestas · Economía", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "credito-rural-87",
    title: "Crédito rural al 8,7 % anual",
    category: "Campo",
    originalPromise: "Ofrecer crédito productivo para el campo con una tasa del 8,7 % anual, garantías estatales y formación territorial.",
    status: "Pendiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "No existe todavía evidencia pública suficiente sobre una línea de crédito operativa con cobertura, desembolsos y tasa verificables.",
    campaignSource: { label: "Portal oficial de propuestas · Campo", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "educacion-virtual-gratuita",
    title: "Educación universitaria virtual gratuita",
    category: "Educación",
    originalPromise: "Ampliar educación universitaria virtual gratuita y apoyar talento en programación, creación e inteligencia artificial.",
    status: "Pendiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "La promesa necesita metas de cobertura, presupuesto y matrícula para que su avance pueda medirse de manera reproducible.",
    campaignSource: { label: "Portal oficial de propuestas · Educación", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "creditos-educacion-vivienda-2",
    title: "Créditos educativos y de vivienda al 2 % anual",
    category: "Educación y vivienda",
    originalPromise: "Crear créditos educativos y de vivienda popular con una tasa preferencial propuesta del 2 % anual.",
    status: "Pendiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "No se encontró todavía un programa operativo con reglamento, beneficiarios, desembolsos y tasa efectiva verificables.",
    campaignSource: { label: "Portal oficial de propuestas · Compromisos medibles", url: "https://propuestas.abelardopresidente.com.co/" },
    evidence: [],
    lastReviewed: "2026-09-22",
  },
  {
    id: "contratacion-cabildeo-anticorrupcion",
    title: "Reformar contratación y regular el cabildeo",
    category: "Anticorrupción",
    originalPromise: "Impulsar trazabilidad de contratos, un nuevo Estatuto de Contratación, regulación del cabildeo y extinción de dominio exprés.",
    status: "Pendiente",
    deadline: "Durante el mandato",
    progress: 0,
    assessment: "La propuesta agrupa reformas normativas distintas. Se mantendrá pendiente hasta identificar proyectos, normas sancionadas e implementación verificable para cada componente.",
    campaignSource: { label: "Portal oficial de propuestas · Anticorrupción", url: "https://propuestas.abelardopresidente.com.co/" },
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
