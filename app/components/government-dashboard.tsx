"use client";

import {
  ArrowUpRight,
  Banknote,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CircleAlert,
  FileCheck2,
  Landmark,
  MapPinned,
  Scale,
  UsersRound,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignPromises } from "../data/campaign-promises";
import {
  accountabilitySources,
  budgetOverview,
  cabinetRegistry,
  executiveDecisions,
  governmentAgenda,
  policyDossiers,
  territorialCoverage,
} from "../data/government-accountability";

function Status({ children }: { children: string }) {
  const tone = children === "Verificado" ? "verified" : children === "En seguimiento" ? "tracking" : "missing";
  return <span className={`accountability-status is-${tone}`}>{children}</span>;
}

export default function GovernmentDashboard() {
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
        <div className="cabinet-grid">{cabinetRegistry.map((item) => <article key={item.id}><div className="cabinet-icon"><UsersRound /></div><small>{item.entity}</small><h3>{item.person}</h3><strong>{item.office}</strong><dl><div><dt>Desde</dt><dd>{new Date(`${item.startedAt}T12:00:00-05:00`).toLocaleDateString("es-CO", { dateStyle: "medium" })}</dd></div><div><dt>Base</dt><dd>{item.basis}</dd></div><div><dt>Estado</dt><dd>{item.status}</dd></div></dl><p>{item.disclosure}</p><a href={item.source} target="_blank" rel="noreferrer">Abrir respaldo <ArrowUpRight /></a></article>)}</div>
        <div className="source-actions"><a href={accountabilitySources.appointments} target="_blank" rel="noreferrer">Actos de nombramiento <ArrowUpRight /></a><a href={accountabilitySources.sigep} target="_blank" rel="noreferrer">Directorio SIGEP <ArrowUpRight /></a></div>
      </TabsContent>

      <TabsContent value="expedientes">
        <header className="accountability-section-heading"><div><p className="section-kicker">POLÍTICA PÚBLICA</p><h2>De la promesa al resultado</h2></div><p>Cada expediente conserva los eslabones ausentes en lugar de rellenarlos con inferencias.</p></header>
        <div className="policy-ledger">{policyDossiers.map((item) => <article key={item.id}><header><div><small>{item.owner}</small><h3>{item.title}</h3></div><Status>{item.status}</Status></header><ol><li><span>01</span><div><strong>Promesa</strong><p>{item.promise}</p></div></li><li><span>02</span><div><strong>Decisión</strong><p>{item.decision}</p></div></li><li><span>03</span><div><strong>Norma</strong><p>{item.rule}</p></div></li><li><span>04</span><div><strong>Presupuesto</strong><p>{item.budget}</p></div></li><li><span>05</span><div><strong>Resultado</strong><p>{item.result}</p></div></li></ol></article>)}</div>
      </TabsContent>

      <TabsContent value="territorio">
        <header className="accountability-section-heading"><div><p className="section-kicker">IMPACTO TERRITORIAL</p><h2>Comparar sin fabricar rankings</h2></div><p>Las comparaciones departamentales requerirán inversión, obras y resultados normalizados por población y presupuesto.</p></header>
        <div className="territory-grid">{territorialCoverage.map((item) => <article key={item.region}><MapPinned /><h3>{item.region}</h3><div><span>Inversión</span><strong>—</strong></div><div><span>Obras</span><strong>—</strong></div><div><span>Visitas</span><strong>—</strong></div><p>{item.evidence}</p></article>)}</div>
        <div className="territory-method"><Building2 /><div><strong>Condiciones para publicar</strong><p>Entidad ejecutora, código territorial, fecha, monto comprometido, monto pagado, población de referencia y fuente primaria.</p></div><CalendarClock /><div><strong>Próximo corte</strong><p>El módulo se habilitará cuando exista una base comparable para al menos dos territorios.</p></div></div>
      </TabsContent>
    </Tabs>
  </div>;
}
