export type EvidenceStatus = "Verificado" | "En seguimiento" | "Sin evidencia suficiente";

export const accountabilitySources = {
  decrees: "https://dapre.presidencia.gov.co/normativa/decretos-2026",
  appointments: "https://dapre.presidencia.gov.co/AtencionCiudadana/actos-administrativos",
  budget: "https://www.minhacienda.gov.co/es/web/pte/presupuesto-general-nacion",
  congress: "https://www.camara.gov.co/proyectos-ley/",
  sigep: "https://www.funcionpublica.gov.co/sigep2/directorio",
  contracts: "https://www.colombiacompra.gov.co/secop/consulte-en-el-secop-ii",
};

export const executiveDecisions = [
  {
    id: "plan-choque-salud",
    date: "2026-09-21",
    type: "Anuncio de política",
    title: "Puesta en marcha anunciada del plan de choque en salud",
    summary: "La Presidencia comunicó el inicio del plan. Falta publicar una matriz consolidada de medidas, recursos, responsables y resultados para medirlo.",
    authority: "Presidencia de la República",
    responsible: "Gobierno nacional y autoridades del sector salud",
    cost: "Sin soporte presupuestal consolidado",
    deadline: "Primeros 100 días",
    status: "En seguimiento" as EvidenceStatus,
    source: "https://www.presidencia.gov.co/prensa/Paginas/Declaracion-del-Presidente-de-la-Republica-Abelardo-De-La-Espriella-al-termino-260921.aspx",
    nextCheck: "Identificar acto administrativo, apropiación, desembolso e indicadores de atención.",
  },
  {
    id: "pronunciamiento-tutela",
    date: "2026-08-30",
    type: "Cumplimiento judicial",
    title: "Pronunciamiento presidencial en cumplimiento de un fallo de tutela",
    summary: "La Presidencia publicó una alocución que incluyó una explicación sobre la transmisión de mando y una manifestación pública de excusas.",
    authority: "Presidencia de la República",
    responsible: "Departamento Administrativo de la Presidencia",
    cost: "No aplica",
    deadline: "Cumplido según publicación oficial",
    status: "Verificado" as EvidenceStatus,
    source: "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx",
    nextCheck: "Conservar la providencia y cualquier actuación posterior en el expediente.",
  },
];

export const budgetOverview = {
  year: 2026,
  total: 556.975,
  investment: 88.760,
  unit: "billones de pesos",
  inherited: true,
  cut: "PGN aprobado antes del inicio del mandato; el tablero separa presupuesto heredado de modificaciones y ejecución atribuibles al Gobierno actual.",
  updatedAt: "2026-09-17",
  source: accountabilitySources.budget,
  categories: [
    { label: "Funcionamiento", value: 365.765, note: "Apropiación del PGN 2026; no equivale a pagos ejecutados por el Gobierno actual." },
    { label: "Servicio de la deuda", value: 102.450, note: "Diferencia entre el total publicado, funcionamiento e inversión." },
    { label: "Inversión", value: 88.760, note: "Programación anual; requiere seguimiento de obligaciones y pagos." },
  ],
  execution: [
    { label: "Apropiación vigente", value: null, status: "Pendiente de extracción oficial comparable" },
    { label: "Compromisos", value: null, status: "Pendiente de extracción oficial comparable" },
    { label: "Obligaciones", value: null, status: "Pendiente de extracción oficial comparable" },
    { label: "Pagos", value: null, status: "Pendiente de extracción oficial comparable" },
  ],
};

export const governmentAgenda = [
  {
    id: "salud-10-billones",
    title: "Financiación del plan de choque en salud",
    relation: "Promesa presidencial asociada",
    stage: "Sin proyecto legislativo identificado",
    status: "Sin evidencia suficiente" as EvidenceStatus,
    promiseId: "rescate-salud-10-billones",
    nextStep: "Identificar proyecto, artículo presupuestal o acto administrativo que asigne los recursos.",
  },
  {
    id: "eliminar-4x1000",
    title: "Eliminación del gravamen a los movimientos financieros",
    relation: "Promesa presidencial asociada",
    stage: "Sin ley sancionada identificada",
    status: "Sin evidencia suficiente" as EvidenceStatus,
    promiseId: "eliminar-4x1000",
    nextStep: "Registrar número de proyecto, autoría, ponencia, votaciones y texto aprobado cuando exista.",
  },
  {
    id: "contratacion-cabildeo",
    title: "Reforma de contratación y regulación del cabildeo",
    relation: "Conjunto de reformas prometidas",
    stage: "Componentes normativos aún no individualizados",
    status: "Sin evidencia suficiente" as EvidenceStatus,
    promiseId: "contratacion-cabildeo-anticorrupcion",
    nextStep: "Separar cada iniciativa y enlazarla con el expediente oficial del Congreso.",
  },
];

export const cabinetRegistry = [
  {
    id: "presidente",
    person: "Abelardo Gabriel De La Espriella Otero",
    office: "Presidente de la República",
    entity: "Presidencia de la República",
    startedAt: "2026-08-07",
    endedAt: null,
    basis: "Elección popular y posesión constitucional",
    status: "Activo",
    source: "https://www.presidencia.gov.co/contenidoVinculado/perfiles/presidente.html",
    disclosure: "Consultar perfil institucional y registros públicos aplicables.",
  },
  {
    id: "vicepresidente",
    person: "José Manuel Restrepo Abondano",
    office: "Vicepresidente de la República",
    entity: "Vicepresidencia de la República",
    startedAt: "2026-08-07",
    endedAt: null,
    basis: "Elección popular y posesión constitucional",
    status: "Activo",
    source: "https://wapp.registraduria.gov.co/electoral/2026/presidente-de-la-republica-segunda-vuelta/registro-candidatos.html",
    disclosure: "La ficha se ampliará con acto de posesión, hoja de vida y declaraciones públicas verificables.",
  },
];

export const policyDossiers = [
  {
    id: "salud",
    title: "Plan de choque en salud",
    owner: "Sector salud",
    status: "En seguimiento" as EvidenceStatus,
    promise: "Medidas inmediatas y propuesta de $10 billones para recuperar el flujo financiero.",
    decision: "Inicio anunciado por la Presidencia.",
    rule: "No se identificó todavía una norma consolidada en el expediente.",
    budget: "Asignación y pagos aún no verificados.",
    result: "Sin indicadores de resultado comparables publicados.",
  },
  {
    id: "seguridad-territorial",
    title: "Recuperación territorial en 90 días",
    owner: "Ministerio de Defensa y Fuerza Pública",
    status: "Sin evidencia suficiente" as EvidenceStatus,
    promise: "Recuperar territorios antes del 5 de noviembre de 2026.",
    decision: "Sin estrategia pública suficientemente delimitada en el expediente.",
    rule: "Sin acto normativo asociado identificado.",
    budget: "Sin partida vinculada de forma verificable.",
    result: "El plazo continúa abierto; falta una línea base territorial.",
  },
  {
    id: "estado",
    title: "Reducción de la burocracia estatal",
    owner: "Gobierno nacional",
    status: "Sin evidencia suficiente" as EvidenceStatus,
    promise: "Reducir en 40 % el tamaño de la burocracia estatal.",
    decision: "No existe una unidad de medida pública identificada.",
    rule: "Sin reforma o plan consolidado asociado.",
    budget: "Sin ahorro atribuible calculable.",
    result: "No puede medirse hasta publicar línea base, universo y fórmula.",
  },
];

export const territorialCoverage = [
  { region: "Nacional", investments: null, works: null, visits: null, evidence: "La información disponible aún no permite una comparación departamental homogénea." },
  { region: "Departamentos", investments: null, works: null, visits: null, evidence: "Pendiente integrar proyectos de inversión, SECOP y agenda oficial con códigos territoriales." },
  { region: "Municipios", investments: null, works: null, visits: null, evidence: "Sin una base normalizada por población y presupuesto no se publicarán rankings." },
];

export const professionalPolls: Array<{
  id: string; firm: string; fieldwork: string; sample: number; margin: string; sponsor: string; favorable: number; unfavorable: number; source: string;
}> = [];
