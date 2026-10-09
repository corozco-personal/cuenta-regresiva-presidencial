export type EvidenceStatus = "Verificado" | "En seguimiento" | "Sin evidencia suficiente";

export const accountabilitySources = {
  decrees: "https://dapre.presidencia.gov.co/normativa/decretos-2026",
  appointments: "https://dapre.presidencia.gov.co/AtencionCiudadana/actos-administrativos",
  budget: "https://www.minhacienda.gov.co/es/web/pte/presupuesto-general-nacion",
  congress: "https://www.camara.gov.co/proyectos-ley/",
  sigep: "https://www.funcionpublica.gov.co/sigep2/directorio",
  contracts: "https://www.colombiacompra.gov.co/secop/consulte-en-el-secop-ii",
  officialCabinet: "https://www.presidencia.gov.co/contenidoVinculado/pre26-gabinete-mesa.html",
  publicCv: "https://dapre.presidencia.gov.co/AtencionCiudadana/tramites-servicios-dapre/publicacion-hojas-vida",
  dapreOfficials: "https://dapre.presidencia.gov.co/dapre/conozca-el-dapre/funcionarios",
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
  ...[
    ["omar-bula", "Omar Bula Escobar", "Ministro de Relaciones Exteriores", "Ministerio de Relaciones Exteriores"],
    ["indalecio-dangond", "Indalecio Dangond", "Ministro de Agricultura y Desarrollo Rural", "Ministerio de Agricultura y Desarrollo Rural"],
    ["rodrigo-lara", "Rodrigo Lara Restrepo", "Ministro del Interior", "Ministerio del Interior"],
    ["maria-nohemi-arboleda", "María Nohemí Arboleda", "Ministra de Minas y Energía", "Ministerio de Minas y Energía"],
    ["fabio-arjona", "Fabio Alberto Arjona", "Ministro de Ambiente y Desarrollo Sostenible", "Ministerio de Ambiente y Desarrollo Sostenible"],
    ["viviane-morales", "Viviane Morales", "Ministra de Educación Nacional", "Ministerio de Educación Nacional"],
    ["juliana-gutierrez", "Juliana Gutiérrez", "Ministra del Deporte", "Ministerio del Deporte"],
    ["elsa-noguera", "Elsa Margarita Noguera", "Ministra de Transporte", "Ministerio de Transporte"],
    ["paola-holguin", "Paola Andrea Holguín", "Ministra de las Culturas, las Artes y los Saberes", "Ministerio de las Culturas"],
    ["mauricio-gomez-amin", "Mauricio Gómez Amín", "Ministro de Comercio, Industria y Turismo", "Ministerio de Comercio, Industria y Turismo"],
    ["jaime-beltran", "Jaime Andrés Beltrán", "Ministro de Vivienda, Ciudad y Territorio", "Ministerio de Vivienda, Ciudad y Territorio"],
    ["alexandra-falla", "Alexandra Falla", "Ministra de Tecnologías de la Información y las Comunicaciones", "Ministerio TIC"],
    ["ivan-cancino", "Iván Alfonso Cancino", "Ministro de Justicia y del Derecho", "Ministerio de Justicia y del Derecho"],
    ["jorge-mora", "Jorge Eduardo Mora", "Ministro de Defensa Nacional", "Ministerio de Defensa Nacional"],
    ["miguel-gomez", "Miguel Gómez Martínez", "Ministro de Hacienda y Crédito Público", "Ministerio de Hacienda y Crédito Público"],
    ["ana-maria-vesga", "Ana María Vesga", "Ministra de Salud y Protección Social", "Ministerio de Salud y Protección Social"],
    ["natalia-lopez", "Natalia López Fuentes", "Ministra del Trabajo", "Ministerio del Trabajo"],
  ].map(([id, person, office, entity]) => ({
    id,
    person,
    office,
    entity,
    startedAt: "2026-08-07",
    endedAt: null,
    basis: "Listado oficial de Gabinete Ministerial Presidencial 2026",
    status: "Activo",
    source: accountabilitySources.officialCabinet,
    cvSource: accountabilitySources.publicCv,
    disclosure: "Registro tomado del gabinete oficial. Hoja de vida y soportes deben cotejarse en publicaciones DAPRE, SIGEP y actos administrativos.",
  })),
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

export const weightedComplianceIndex = {
  score: 18,
  max: 100,
  label: "Cumplimiento ponderado verificable",
  summary: "El indicador premia más los resultados documentados que los anuncios. Un expediente solo sube cuando existe evidencia pública trazable.",
  dimensions: [
    { label: "Promesa delimitada", value: 72, weight: 10, note: "Existe una formulación verificable y plazo identificable." },
    { label: "Decisión formal", value: 30, weight: 25, note: "Faltan actos administrativos o rutas oficiales en varias promesas." },
    { label: "Presupuesto asociado", value: 12, weight: 25, note: "No basta la apropiación general; se requiere partida, compromiso y pago." },
    { label: "Ejecución comprobada", value: 8, weight: 25, note: "Solo cuenta cuando hay avance material, contrato, desembolso o entrega." },
    { label: "Resultado público", value: 4, weight: 15, note: "Requiere indicador comparable antes/después y fuente primaria." },
  ],
};

export const mandateTimeline = [
  {
    date: "2026-08-07",
    type: "Inicio de mandato",
    title: "Arranque del periodo presidencial",
    summary: "Punto cero para separar decisiones heredadas de decisiones atribuibles al Gobierno actual.",
    evidence: "Acto de posesión y registro institucional.",
  },
  {
    date: "2026-08-30",
    type: "Cumplimiento judicial",
    title: "Alocución presidencial por fallo de tutela",
    summary: "Se registra como actuación verificable, no como resultado de política pública.",
    evidence: "Publicación oficial de Presidencia.",
  },
  {
    date: "2026-09-21",
    type: "Anuncio sectorial",
    title: "Plan de choque en salud",
    summary: "Abre expediente de seguimiento: norma, presupuesto, responsables, cronograma y resultados.",
    evidence: "Declaración pública; faltan soportes presupuestales consolidados.",
  },
  {
    date: "2026-11-05",
    type: "Hito prometido",
    title: "Plazo de 90 días para recuperación territorial",
    summary: "El tablero exigirá línea base municipal, objetivo operativo y medición pública comparable.",
    evidence: "Promesa en seguimiento; sin resultado atribuible antes del vencimiento.",
  },
];

export const weeklyMandateBrief = {
  period: "Semana de seguimiento actual",
  updatedAt: "2026-09-24",
  items: [
    { type: "Dato nuevo", title: "Se estructuró el expediente de gabinete", summary: "Ministros y altos cargos quedan separados de menciones en noticias para medir rotación real.", status: "Base creada" },
    { type: "Vacío crítico", title: "Ejecución presupuestal atribuible", summary: "Aún no hay corte homogéneo que permita convertir apropiación en pagos del mandato.", status: "Pendiente" },
    { type: "Próxima verificación", title: "Plan de choque en salud", summary: "Debe aparecer acto administrativo, fuente presupuestal, responsables y metas de atención.", status: "En seguimiento" },
  ],
};

export const activityManagementResults = [
  {
    topic: "Salud",
    activity: "Declaraciones y anuncios sobre medidas de choque.",
    management: "Se necesita acto administrativo, cronograma, responsables y fuente presupuestal.",
    result: "Sin indicador comparable publicado sobre reducción de cartera, tiempos de atención o giro efectivo.",
  },
  {
    topic: "Seguridad territorial",
    activity: "Promesa de recuperación territorial en 90 días.",
    management: "Requiere línea base por municipio, presencia institucional y reporte operativo periódico.",
    result: "No se publica todavía un resultado verificable contra la línea base.",
  },
  {
    topic: "Austeridad estatal",
    activity: "Promesa de reducción de burocracia.",
    management: "Falta definir universo: entidades, cargos, contratistas, nómina y gasto de funcionamiento.",
    result: "Sin ahorro atribuible o reducción comprobada.",
  },
];

export const sectorScorecards = [
  {
    sector: "Salud",
    signal: "Amarillo",
    score: 36,
    promise: "Plan de choque y financiación extraordinaria.",
    decision: "Anuncio público identificado.",
    budget: "Sin partida y pagos verificables.",
    result: "Sin resultado medible publicado.",
    nextData: "Resolución, CONPES, giro, contrato o reporte de cartera.",
  },
  {
    sector: "Seguridad y defensa",
    signal: "Rojo",
    score: 18,
    promise: "Recuperación territorial en 90 días.",
    decision: "Sin plan operativo público suficiente.",
    budget: "Sin recursos asociados verificables.",
    result: "Sin línea base municipal comparable.",
    nextData: "Mapa de presencia estatal, eventos de seguridad y control institucional por municipio.",
  },
  {
    sector: "Hacienda y reforma tributaria",
    signal: "Rojo",
    score: 14,
    promise: "Eliminar el 4x1000 y financiar prioridades.",
    decision: "Sin ley sancionada identificada.",
    budget: "PGN heredado; modificaciones no consolidadas.",
    result: "Sin efecto fiscal atribuible.",
    nextData: "Proyecto radicado, ponencias, votaciones y Marco Fiscal actualizado.",
  },
  {
    sector: "Estado y burocracia",
    signal: "Rojo",
    score: 10,
    promise: "Reducir 40 % la burocracia.",
    decision: "Sin universo ni fórmula oficial.",
    budget: "Sin ahorro presupuestal verificable.",
    result: "Sin reducción medible.",
    nextData: "Línea base de cargos, contratos, nómina y gasto de funcionamiento.",
  },
];

export const previousGovernmentComparisons = [
  {
    topic: "Ejecución presupuestal",
    current: "El mandato actual aún no tiene corte de ejecución propio comparable.",
    previous: "El gobierno anterior debe compararse con el mismo mes de su primer año y con la misma fuente presupuestal.",
    metric: "Compromisos, obligaciones y pagos como porcentaje de apropiación vigente.",
    caveat: "No comparar anuncios actuales contra pagos acumulados de un gobierno que ya cerró su ciclo.",
  },
  {
    topic: "Gabinete",
    current: "Se registra fecha de inicio, cargo, entidad y fuente pública.",
    previous: "La contraparte debe medir rotación acumulada, duración promedio y sectores con más cambios.",
    metric: "Cambios por ministerio, días en cargo y motivo documentado de salida.",
    caveat: "La comparación exige periodos equivalentes: primeros 100 días contra primeros 100 días.",
  },
  {
    topic: "Promesas de campaña",
    current: "Cada promesa se lleva por promesa, decisión, presupuesto, ejecución y resultado.",
    previous: "Debe reconstruirse con el mismo método para evitar sesgo de memoria o selección.",
    metric: "Cumplidas, en ejecución, sin evidencia y descartadas con ponderación por impacto.",
    caveat: "Una promesa pequeña no debe pesar igual que una reforma fiscal o de salud.",
  },
];

export const riskMatrix = [
  { area: "Presupuesto", level: "Alto", risk: "Confundir apropiación anual heredada con ejecución del Gobierno actual.", mitigation: "Mostrar apropiación, compromisos, obligaciones y pagos por separado.", owner: "Hacienda / portal de datos" },
  { area: "Territorio", level: "Alto", risk: "Publicar rankings sin normalizar por población, presupuesto y fecha.", mitigation: "Exigir código territorial, fuente primaria y denominador comparable.", owner: "Planeación / entidades ejecutoras" },
  { area: "Noticias", level: "Medio", risk: "Que el volumen mediático sustituya evidencia administrativa.", mitigation: "Usar noticias como alerta, no como prueba única de cumplimiento.", owner: "Radar de medios" },
  { area: "Gabinete", level: "Medio", risk: "Confundir rumores o menciones con nombramientos.", mitigation: "Requerir acto, hoja de vida pública o fuente institucional.", owner: "DAPRE / Función Pública" },
];

export const contradictionWatch = [
  {
    issue: "Austeridad vs. estructura estatal",
    promise: "Reducir burocracia estatal en 40 %.",
    observed: "No existe aún línea base pública para saber qué entra en la medición.",
    status: "Abierto",
    nextCheck: "Cruzar planta, contratistas, gasto de personal y reformas administrativas.",
  },
  {
    issue: "Urgencia sectorial vs. soporte presupuestal",
    promise: "Plan de choque en salud con financiación suficiente.",
    observed: "La urgencia fue anunciada, pero no hay cadena presupuesto-ejecución-resultado publicada.",
    status: "Abierto",
    nextCheck: "Buscar actos, apropiaciones, giros y métricas de atención.",
  },
];

export const missingInformation = [
  { topic: "Salud", missing: "Monto comprometido, monto pagado, beneficiarios, EPS/IPS receptoras y resultado esperado.", responsible: "Ministerio de Salud / Hacienda", whyItMatters: "Permite pasar de anuncio a ejecución verificable." },
  { topic: "Seguridad territorial", missing: "Municipios priorizados, línea base y criterio de recuperación.", responsible: "Defensa / Fuerza Pública", whyItMatters: "Sin línea base no hay forma de saber si el plazo de 90 días se cumplió." },
  { topic: "Burocracia", missing: "Universo oficial de cargos, contratos y gasto que será reducido.", responsible: "Función Pública / Hacienda", whyItMatters: "Evita que la reducción se mida con una fórmula cambiante." },
  { topic: "Comparativos históricos", missing: "Base homologada del gobierno anterior para los mismos meses del ciclo.", responsible: "Equipo editorial / fuentes oficiales", whyItMatters: "Hace justa la comparación y evita conclusiones engañosas." },
];

export const governabilityThermometer = [
  { dimension: "Coalición legislativa", level: "Frágil", signal: 38, evidence: "La agenda prioritaria todavía no tiene trazabilidad suficiente en proyectos aprobados.", nextCheck: "Radicación, ponencias, mayorías y votaciones nominales." },
  { dimension: "Capacidad ejecutiva", level: "En formación", signal: 42, evidence: "Gabinete identificado, pero faltan metas y responsables por programa.", nextCheck: "Planes sectoriales, decretos y manual de seguimiento." },
  { dimension: "Evidencia pública", level: "Baja", signal: 24, evidence: "La mayoría de resultados aún depende de soportes administrativos pendientes.", nextCheck: "Publicación de bases abiertas y cortes periódicos." },
  { dimension: "Riesgo territorial", level: "Alto", signal: 28, evidence: "La promesa territorial requiere granularidad municipal y verificación independiente.", nextCheck: "Indicadores por municipio, departamento y fecha." },
];

export const deepDossiers = [
  { title: "Salud", question: "¿El plan reduce deuda, tiempos de atención o barreras de acceso?", indicators: ["Giros efectivos", "Cartera por actor", "Tiempo de atención", "Tutelas en salud"], value: "Permite distinguir liquidez del sistema de mejoras al usuario." },
  { title: "Seguridad territorial", question: "¿Qué significa recuperar un territorio y cómo se prueba?", indicators: ["Presencia estatal", "Eventos violentos", "Control institucional", "Servicios públicos activos"], value: "Convierte una promesa amplia en mediciones por municipio." },
  { title: "Austeridad y Estado", question: "¿Se reduce gasto improductivo o capacidad operativa?", indicators: ["Cargos", "Contratos", "Nómina", "Gasto de funcionamiento"], value: "Evita celebrar recortes que deterioren servicios o esconder traslados contables." },
];

export const territorialCoverage = [
  { region: "Nacional", investments: null, works: null, visits: null, evidence: "La información disponible aún no permite una comparación departamental homogénea." },
  { region: "Departamentos", investments: null, works: null, visits: null, evidence: "Pendiente integrar proyectos de inversión, SECOP y agenda oficial con códigos territoriales." },
  { region: "Municipios", investments: null, works: null, visits: null, evidence: "Sin una base normalizada por población y presupuesto no se publicarán rankings." },
];

export const professionalPolls: Array<{
  id: string; firm: string; fieldwork: string; sample: number; margin: string; sponsor: string; favorable: number; unfavorable: number; source: string;
}> = [];

function statusScore(status: EvidenceStatus) {
  if (status === "Verificado") return 100;
  if (status === "En seguimiento") return 45;
  return 8;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function sectorSignal(score: number) {
  if (score >= 70) return "Verde";
  if (score >= 35) return "Amarillo";
  return "Rojo";
}

export function buildGovernmentAccountabilitySnapshot(input?: { generatedAt?: string; lastRefreshAt?: string | null; refresh?: unknown }) {
  const dossierScores = policyDossiers.map((item) => statusScore(item.status));
  const decisionScore = average(executiveDecisions.map((item) => statusScore(item.status)));
  const agendaScore = average(governmentAgenda.map((item) => statusScore(item.status)));
  const executionScore = average(dossierScores);
  const resultScore = average(policyDossiers.map((item) => /sin indicador|sin resultado|no puede/i.test(item.result) ? 5 : statusScore(item.status)));
  const computedWeightedCompliance = {
    ...weightedComplianceIndex,
    score: Math.round((72 * 0.1) + (decisionScore * 0.25) + (agendaScore * 0.25) + (executionScore * 0.25) + (resultScore * 0.15)),
    dimensions: [
      { label: "Promesa delimitada", value: 72, weight: 10, note: "Se calcula sobre promesas con formulación y plazo identificable." },
      { label: "Decisión formal", value: decisionScore, weight: 25, note: "Promedio de decisiones verificadas, en seguimiento o sin soporte suficiente." },
      { label: "Presupuesto asociado", value: agendaScore, weight: 25, note: "Usa la trazabilidad de agenda/presupuesto y baja cuando faltan partidas o pagos." },
      { label: "Ejecución comprobada", value: executionScore, weight: 25, note: "Promedio del estado documental de los expedientes de política pública." },
      { label: "Resultado público", value: resultScore, weight: 15, note: "Solo sube cuando el expediente tiene resultado comparable publicado." },
    ],
  };
  const computedSectorScorecards = sectorScorecards.map((item) => {
    const related = policyDossiers.find((dossier) => item.sector.toLocaleLowerCase("es").includes(dossier.id.split("-")[0]) || dossier.owner.toLocaleLowerCase("es").includes(item.sector.toLocaleLowerCase("es").split(" ")[0]));
    const score = related ? statusScore(related.status) : item.score;
    return { ...item, score, signal: sectorSignal(score) };
  });
  return {
    license: "CC BY 4.0",
    generatedAt: input?.generatedAt ?? new Date().toISOString(),
    updatedAt: input?.lastRefreshAt ?? input?.generatedAt ?? new Date().toISOString(),
    refresh: input?.refresh ?? null,
    methodology: "Los conjuntos separan anuncios, documentos, presupuesto aprobado, ejecución y resultados. Los indicadores se recalculan desde los expedientes y estados verificables; los valores nulos representan datos no verificados.",
    data: {
      decisions: executiveDecisions,
      budget: budgetOverview,
      legislativeAgenda: governmentAgenda,
      cabinet: cabinetRegistry,
      dossiers: policyDossiers,
      territories: territorialCoverage,
      weightedCompliance: computedWeightedCompliance,
      timeline: mandateTimeline,
      weeklyBrief: {
        ...weeklyMandateBrief,
        updatedAt: input?.lastRefreshAt?.slice(0, 10) ?? weeklyMandateBrief.updatedAt,
      },
      activityManagementResults,
      sectorScorecards: computedSectorScorecards,
      previousGovernmentComparisons,
      riskMatrix,
      contradictions: contradictionWatch,
      missingInformation,
      governability: governabilityThermometer.map((item) => item.dimension === "Evidencia pública" ? { ...item, signal: Math.max(10, Math.min(100, computedWeightedCompliance.score + 6)) } : item),
      deepDossiers,
    },
  };
}

export type GovernmentAccountabilitySnapshot = ReturnType<typeof buildGovernmentAccountabilitySnapshot>;
