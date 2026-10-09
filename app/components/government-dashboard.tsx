"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Activity,
  Banknote,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CircleAlert,
  FileCheck2,
  Landmark,
  Scale,
  ShieldAlert,
  Thermometer,
  UsersRound,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignPromises } from "../data/campaign-promises";
import ColombiaTerritoryMap from "./colombia-territory-map";
import { publicationTimeLabel } from "../lib/dates";
import {
  accountabilitySources,
  buildGovernmentAccountabilitySnapshot,
  type GovernmentAccountabilitySnapshot,
} from "../data/government-accountability";

function Status({ children }: { children: string }) {
  const tone = children === "Verificado" ? "verified" : children === "En seguimiento" ? "tracking" : "missing";
  return <span className={`accountability-status is-${tone}`}>{children}</span>;
}

export default function GovernmentDashboard() {
  const [snapshot, setSnapshot] = useState<GovernmentAccountabilitySnapshot>(() => buildGovernmentAccountabilitySnapshot());
  const [dataState, setDataState] = useState<"loading" | "ready" | "fallback">("loading");
  useEffect(() => {
    fetch("/api/datos/gestion", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("No disponible");
        return response.json() as Promise<GovernmentAccountabilitySnapshot>;
      })
      .then((payload) => {
        setSnapshot(payload);
        setDataState("ready");
      })
      .catch(() => setDataState("fallback"));
  }, []);
  const {
    activityManagementResults,
    budget: budgetOverview,
    cabinet: cabinetRegistry,
    contradictions: contradictionWatch,
    deepDossiers,
    decisions: executiveDecisions,
    governability: governabilityThermometer,
    legislativeAgenda: governmentAgenda,
    timeline: mandateTimeline,
    missingInformation,
    dossiers: policyDossiers,
    previousGovernmentComparisons,
    riskMatrix,
    sectorScorecards,
    weeklyBrief: weeklyMandateBrief,
    weightedCompliance: weightedComplianceIndex,
  } = snapshot.data;
  const completed = campaignPromises.filter((item) => item.status === "Cumplida").length;
  const active = campaignPromises.filter((item) => ["En ejecución", "En preparación"].includes(item.status)).length;
  const dueSoon = campaignPromises.filter((item) => item.deadline.includes("2026") || item.deadline.includes("100 días")).length;

  return <div className="accountability-dashboard">
    <section className="accountability-overview" aria-label="Resumen verificable del mandato">
      <article className="accountability-lead">
        <p className="section-kicker">CORTE DOCUMENTAL · 24 SEP 2026</p>
        <h2>Qué prometió, qué decidió, cuánto ejecutó y qué resultados produjo.</h2>
        <p>Los vacíos son parte del balance. Un anuncio no cuenta como ejecución, una apropiación no cuenta como pago y una variación nacional no se atribuye automáticamente al presidente.</p>
        <a href="/metodologia">Consultar reglas de medición <ArrowUpRight /></a>
      </article>
      <div className="accountability-metrics">
        <article><BookOpenCheck /><strong>{completed}/{campaignPromises.length}</strong><span>promesas cumplidas</span><small>{active} en ejecución</small></article>
        <article><Landmark /><strong>{executiveDecisions.length}</strong><span>decisiones estructuradas</span><small>{executiveDecisions.filter((item) => item.status === "Verificado").length} verificadas</small></article>
        <article><Scale /><strong>{governmentAgenda.length}</strong><span>asuntos legislativos</span><small>{dueSoon} promesas con plazo cercano</small></article>
        <article><Banknote /><strong>Sin corte</strong><span>ejecución del PGN</span><small>No se sustituye con la apropiación</small></article>
      </div>
    </section>
    <section className="accountability-refresh-note" aria-label="Estado de actualización de gestión">
      <CalendarClock />
      <div><strong>{dataState === "ready" ? "Información calculada con el último corte" : dataState === "loading" ? "Cargando información actualizada" : "Mostrando información de respaldo"}</strong><p>Última actualización de gestión: {snapshot.updatedAt ? publicationTimeLabel(snapshot.updatedAt).replace("Publicado: ", "") : "sin actualización registrada"}. Las revisiones periódicas mantienen este tablero al día.</p></div>
    </section>

    <section className="mandate-intelligence" aria-label="Lectura editorial del mandato">
      <article className="mandate-index-card">
        <p className="section-kicker">ÍNDICE PONDERADO</p>
        <div><strong>{weightedComplianceIndex.score}</strong><span>/ {weightedComplianceIndex.max}</span></div>
        <h2>{weightedComplianceIndex.label}</h2>
        <p>{weightedComplianceIndex.summary}</p>
        <ul>{weightedComplianceIndex.dimensions.map((item) => <li key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong><small>Peso {item.weight}% · {item.note}</small></li>)}</ul>
      </article>
      <article className="weekly-brief-card">
        <p className="section-kicker">QUÉ CAMBIÓ ESTA SEMANA</p>
        <h2>{weeklyMandateBrief.period}</h2>
        <p>Último corte editorial: {new Date(`${weeklyMandateBrief.updatedAt}T12:00:00-05:00`).toLocaleDateString("es-CO", { dateStyle: "long" })}</p>
        <div>{weeklyMandateBrief.items.map((item) => <section key={item.title}><small>{item.type}</small><h3>{item.title}</h3><p>{item.summary}</p><strong>{item.status}</strong></section>)}</div>
      </article>
    </section>

    <section className="mandate-timeline">
      <header className="accountability-section-heading"><div><p className="section-kicker">LÍNEA DE TIEMPO DEL MANDATO</p><h2>Hitos que cambian el balance</h2></div><p>No se mezclan anuncios, decisiones, vencimientos y resultados: cada hito conserva su tipo y evidencia disponible.</p></header>
      <div>{mandateTimeline.map((item) => <article key={`${item.date}-${item.title}`}><time>{new Date(`${item.date}T12:00:00-05:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</time><div><small>{item.type}</small><h3>{item.title}</h3><p>{item.summary}</p><strong>{item.evidence}</strong></div></article>)}</div>
    </section>

    <section className="sector-scorecards">
      <header className="accountability-section-heading"><div><p className="section-kicker">SEMÁFORO DE GESTIÓN POR SECTOR</p><h2>Actividad, gestión y resultado no son lo mismo</h2></div><p>La calificación baja cuando falta alguno de los eslabones: decisión formal, presupuesto, ejecución y resultado público.</p></header>
      <div>{sectorScorecards.map((item) => <article key={item.sector} className={`sector-card is-${item.signal.toLowerCase()}`}><header><span>{item.signal}</span><strong>{item.score}/100</strong></header><h3>{item.sector}</h3><dl><div><dt>Promesa</dt><dd>{item.promise}</dd></div><div><dt>Decisión</dt><dd>{item.decision}</dd></div><div><dt>Presupuesto</dt><dd>{item.budget}</dd></div><div><dt>Resultado</dt><dd>{item.result}</dd></div></dl><p><b>Dato que falta:</b> {item.nextData}</p></article>)}</div>
    </section>

    <section className="mandate-analysis-grid" aria-label="Módulos de análisis del mandato">
      <article>
        <header><ShieldAlert /><div><p className="section-kicker">MATRIZ DE RIESGOS</p><h2>Dónde puede fallar la lectura pública</h2></div></header>
        <div>{riskMatrix.map((item) => <section key={`${item.area}-${item.risk}`}><small>{item.area} · Riesgo {item.level}</small><h3>{item.risk}</h3><p>{item.mitigation}</p><strong>{item.owner}</strong></section>)}</div>
      </article>
      <article>
        <header><Thermometer /><div><p className="section-kicker">GOBERNABILIDAD</p><h2>Termómetro del poder de ejecutar</h2></div></header>
        <div>{governabilityThermometer.map((item) => <section key={item.dimension}><div className="thermo-row"><span>{item.dimension}</span><strong>{item.signal}/100</strong></div><i><b style={{ width: `${item.signal}%` }} /></i><p>{item.level}: {item.evidence}</p><small>{item.nextCheck}</small></section>)}</div>
      </article>
      <article>
        <header><Activity /><div><p className="section-kicker">ACTIVIDAD ≠ RESULTADO</p><h2>Qué hizo, qué gestionó y qué cambió</h2></div></header>
        <div>{activityManagementResults.map((item) => <section key={item.topic}><h3>{item.topic}</h3><p><b>Actividad:</b> {item.activity}</p><p><b>Gestión requerida:</b> {item.management}</p><p><b>Resultado:</b> {item.result}</p></section>)}</div>
      </article>
    </section>

    <section className="comparison-watch">
      <header className="accountability-section-heading"><div><p className="section-kicker">CONTRAPARTE HISTÓRICA</p><h2>Comparar con el gobierno anterior sin sesgo</h2></div><p>La comparación solo se publica si usa la misma fuente, la misma ventana temporal y el mismo denominador.</p></header>
      <div>{previousGovernmentComparisons.map((item) => <article key={item.topic}><h3>{item.topic}</h3><p><b>Actual:</b> {item.current}</p><p><b>Gobierno anterior:</b> {item.previous}</p><strong>{item.metric}</strong><small>{item.caveat}</small></article>)}</div>
    </section>

    <section className="evidence-watch">
      <article>
        <p className="section-kicker">OBSERVATORIO DE CONTRADICCIONES</p>
        {contradictionWatch.map((item) => <section key={item.issue}><h3>{item.issue}</h3><p><b>Promesa:</b> {item.promise}</p><p><b>Observado:</b> {item.observed}</p><small>{item.status} · {item.nextCheck}</small></section>)}
      </article>
      <article>
        <p className="section-kicker">LO QUE FALTA POR SABER</p>
        {missingInformation.map((item) => <section key={item.topic}><h3>{item.topic}</h3><p>{item.missing}</p><small>{item.responsible} · {item.whyItMatters}</small></section>)}
      </article>
      <article>
        <p className="section-kicker">DOSSIERS TEMÁTICOS</p>
        {deepDossiers.map((item) => <section key={item.title}><h3>{item.title}</h3><p>{item.question}</p><ul>{item.indicators.map((indicator) => <li key={indicator}>{indicator}</li>)}</ul><small>{item.value}</small></section>)}
      </article>
    </section>

    <Tabs defaultValue="decisiones" className="accountability-tabs">
      <TabsList variant="line" aria-label="Dimensiones del seguimiento">
        <TabsTrigger value="decisiones">Decisiones</TabsTrigger>
        <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
        <TabsTrigger value="congreso">Congreso</TabsTrigger>
        <TabsTrigger value="gabinete">Gabinete</TabsTrigger>
        <TabsTrigger value="expedientes">Expedientes</TabsTrigger>
        <TabsTrigger value="territorio">Territorio</TabsTrigger>
      </TabsList>

      <TabsContent value="decisiones">
        <header className="accountability-section-heading"><div><p className="section-kicker">REGISTRO PRESIDENCIAL</p><h2>Decisiones con seguimiento posterior</h2></div><p>Cada registro identifica autoridad, responsable, costo conocido, plazo, fuente y próxima comprobación.</p></header>
        <div className="decision-ledger">{executiveDecisions.map((item) => <article key={item.id}>
          <div className="decision-date"><time>{new Date(`${item.date}T12:00:00-05:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</time><Status>{item.status}</Status></div>
          <div className="decision-body"><small>{item.type}</small><h3>{item.title}</h3><p>{item.summary}</p><dl><div><dt>Responsable</dt><dd>{item.responsible}</dd></div><div><dt>Costo</dt><dd>{item.cost}</dd></div><div><dt>Plazo</dt><dd>{item.deadline}</dd></div><div><dt>Próxima comprobación</dt><dd>{item.nextCheck}</dd></div></dl><a href={item.source} target="_blank" rel="noreferrer">Fuente documental <ArrowUpRight /></a></div>
        </article>)}</div>
        <a className="accountability-source" href={accountabilitySources.decrees} target="_blank" rel="noreferrer"><FileCheck2 /> Consultar repositorio oficial de decretos <ArrowUpRight /></a>
      </TabsContent>

      <TabsContent value="presupuesto">
        <header className="accountability-section-heading"><div><p className="section-kicker">DINERO PÚBLICO</p><h2>Del presupuesto aprobado al dinero pagado</h2></div><p>{budgetOverview.cut}</p></header>
        <div className="budget-headline"><div><span>PGN {budgetOverview.year}</span><strong>${budgetOverview.total.toLocaleString("es-CO")} billones</strong><small>Apropiación anual publicada, no ejecución del mandato</small></div><div><span>Inversión programada</span><strong>${budgetOverview.investment.toLocaleString("es-CO")} billones</strong><small>Debe contrastarse con obligaciones y pagos</small></div></div>
        <div className="budget-composition">{budgetOverview.categories.map((item) => <article key={item.label}><div><span>{item.label}</span><strong>${item.value.toLocaleString("es-CO")} billones</strong></div><div className="budget-bar"><i style={{ width: `${(item.value / budgetOverview.total) * 100}%` }} /></div><p>{item.note}</p></article>)}</div>
        <div className="execution-funnel">{budgetOverview.execution.map((item, index) => <article key={item.label}><span>0{index + 1}</span><div><strong>{item.label}</strong><p>{item.value === null ? item.status : `${item.value}%`}</p></div></article>)}</div>
        <div className="evidence-gap"><CircleAlert /><p><strong>Dato faltante visible.</strong> El portal no inferirá ejecución a partir del presupuesto aprobado. Se incorporarán apropiación vigente, compromisos, obligaciones y pagos cuando exista un corte oficial homogéneo.</p></div>
        <div className="source-actions"><a href={accountabilitySources.budget} target="_blank" rel="noreferrer">Portal de Transparencia Económica <ArrowUpRight /></a><a href={accountabilitySources.contracts} target="_blank" rel="noreferrer">Consultar SECOP II <ArrowUpRight /></a></div>
      </TabsContent>

      <TabsContent value="congreso">
        <header className="accountability-section-heading"><div><p className="section-kicker">AGENDA DEL GOBIERNO</p><h2>Promesa, iniciativa y resultado legislativo</h2></div><p>Esta vista no confunde toda la actividad del Congreso con la agenda presidencial.</p></header>
        <div className="agenda-table"><div className="agenda-row agenda-head"><span>Asunto</span><span>Etapa comprobada</span><span>Próximo dato requerido</span></div>{governmentAgenda.map((item) => <article className="agenda-row" key={item.id}><div><Status>{item.status}</Status><h3>{item.title}</h3><p>{item.relation}</p></div><strong>{item.stage}</strong><div><p>{item.nextStep}</p><a href={`/promesas#promesa-${item.promiseId}`}>Ver promesa <ArrowUpRight /></a></div></article>)}</div>
        <a className="accountability-source" href={accountabilitySources.congress} target="_blank" rel="noreferrer"><Scale /> Consultar expedientes oficiales del Congreso <ArrowUpRight /></a>
      </TabsContent>

      <TabsContent value="gabinete">
        <header className="accountability-section-heading"><div><p className="section-kicker">ALTOS CARGOS</p><h2>Quién gobierna y desde cuándo</h2></div><p>El registro estructurado reemplaza la detección exclusiva por palabras en titulares y permite medir permanencia y rotación.</p></header>
        <div className="cabinet-grid">{cabinetRegistry.map((item) => <article key={item.id}><div className="cabinet-icon"><UsersRound /></div><small>{item.entity}</small><h3>{item.person}</h3><strong>{item.office}</strong><dl><div><dt>Desde</dt><dd>{new Date(`${item.startedAt}T12:00:00-05:00`).toLocaleDateString("es-CO", { dateStyle: "medium" })}</dd></div><div><dt>Base</dt><dd>{item.basis}</dd></div><div><dt>Estado</dt><dd>{item.status}</dd></div></dl><p>{item.disclosure}</p><div className="cabinet-links"><a href={item.source} target="_blank" rel="noreferrer">Respaldo público <ArrowUpRight /></a>{"cvSource" in item && item.cvSource && <a href={item.cvSource} target="_blank" rel="noreferrer">Hoja de vida pública <ArrowUpRight /></a>}</div></article>)}</div>
        <div className="source-actions"><a href={accountabilitySources.officialCabinet} target="_blank" rel="noreferrer">Gabinete oficial <ArrowUpRight /></a><a href={accountabilitySources.appointments} target="_blank" rel="noreferrer">Actos de nombramiento <ArrowUpRight /></a><a href={accountabilitySources.sigep} target="_blank" rel="noreferrer">Directorio SIGEP <ArrowUpRight /></a></div>
      </TabsContent>

      <TabsContent value="expedientes">
        <header className="accountability-section-heading"><div><p className="section-kicker">POLÍTICA PÚBLICA</p><h2>De la promesa al resultado</h2></div><p>Cada expediente conserva los eslabones ausentes en lugar de rellenarlos con inferencias.</p></header>
        <div className="policy-ledger">{policyDossiers.map((item) => <article key={item.id}><header><div><small>{item.owner}</small><h3>{item.title}</h3></div><Status>{item.status}</Status></header><ol><li><span>01</span><div><strong>Promesa</strong><p>{item.promise}</p></div></li><li><span>02</span><div><strong>Decisión</strong><p>{item.decision}</p></div></li><li><span>03</span><div><strong>Norma</strong><p>{item.rule}</p></div></li><li><span>04</span><div><strong>Presupuesto</strong><p>{item.budget}</p></div></li><li><span>05</span><div><strong>Resultado</strong><p>{item.result}</p></div></li></ol></article>)}</div>
      </TabsContent>

      <TabsContent value="territorio">
        <header className="accountability-section-heading"><div><p className="section-kicker">IMPACTO TERRITORIAL</p><h2>Comparar sin fabricar rankings</h2></div><p>Las comparaciones departamentales requerirán inversión, obras y resultados normalizados por población y presupuesto.</p></header>
        <ColombiaTerritoryMap />
        <div className="territory-method"><Building2 /><div><strong>Condiciones para publicar</strong><p>Entidad ejecutora, código territorial, fecha, monto comprometido, monto pagado, población de referencia y fuente primaria.</p></div><CalendarClock /><div><strong>Próximo corte</strong><p>El módulo se habilitará cuando exista una base comparable para al menos dos territorios.</p></div></div>
      </TabsContent>
    </Tabs>
  </div>;
}
