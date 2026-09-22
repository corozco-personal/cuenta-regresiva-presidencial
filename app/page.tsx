"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock3,
  ExternalLink,
  Flag,
  Globe2,
  History,
  Hourglass,
  Leaf,
  Link2,
  Menu,
  PencilLine,
  Search,
  Share2,
  ShieldCheck,
  Tags,
  X,
} from "lucide-react";
import Community from "./components/community";
import SocialShare from "./components/social-share";
import CompactPresence from "./components/compact-presence";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };
type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  kind: "Fuente primaria" | "Cobertura periodística";
  scope: "Nacional" | "Internacional";
  category: string;
  stage: "Campaña" | "Transición" | "Presidencia";
  decision: "Admitido" | "Corregido";
  decisionReason: string;
  evidenceLevel: "Documento oficial" | "Confirmado por varias fuentes" | "Reporte de una fuente";
  processStatus: string;
  sources: Array<{ source: string; url: string; kind: string }>;
  linkCheck?: { status: "Disponible" | "Retirado" | "No comprobado"; checkedAt: string; lastModified?: string };
};
type ReviewStats = { admitted: number; corrected: number; rejected: number; policyVersion: string };
type SourceEntry = { domain: string; label: string; scope: string; kind: string; criterion: string; country: string; region: string };
type GlobalRadarItem = { id: string; title: string; source: string; domain: string; url: string; publishedAt: string; country: string; language: string; status: string; signal: string };
type GlobalStats = { results: number; countries: number; languages: number; domains: number; catalogSources: number };

const START = new Date("2026-08-07T00:00:00-05:00").getTime();
const TARGET = new Date("2030-08-07T00:00:00-05:00").getTime();
const milestones = [
  { year: "2026", position: 0, label: "Inicio" },
  { year: "2027", position: 25 },
  { year: "2028", position: 50 },
  { year: "2029", position: 75 },
  { year: "2030", position: 100, label: "Entrega" },
];

const records = [
  {
    id: "pronunciamiento-tutela",
    isoDate: "2026-08-30",
    date: "30 AGO 2026",
    category: "Instituciones",
    title: "La Presidencia publicó un pronunciamiento en cumplimiento de un fallo de tutela",
    summary:
      "En la alocución oficial se incluyó una explicación sobre la ceremonia de transmisión de mando y una manifestación pública de excusas.",
    status: "Fuente primaria",
    source: "Presidencia de la República",
    url: "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx",
    scope: "Nacional",
    evidenceLevel: "Documento oficial",
    processStatus: "Decisión judicial",
    reviewedAt: "21 sep 2026",
    responseLabel: "Pronunciamiento oficial de la Presidencia",
    responseUrl: "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx",
  },
  {
    id: "cne-revocatoria",
    isoDate: "2026-06-17",
    date: "17 JUN 2026",
    category: "Control electoral",
    title: "El CNE publicó la resolución sobre la solicitud de revocatoria de la inscripción presidencial",
    summary:
      "La Resolución 2990 de 2026 documenta el trámite presentado contra la inscripción de la candidatura para la segunda vuelta.",
    status: "Documento oficial",
    source: "Consejo Nacional Electoral",
    url: "https://www.cne.gov.co/resoluciones-cne-2026/13792?layout=print&print=1&tmpl=component",
    scope: "Nacional",
    evidenceLevel: "Documento oficial",
    processStatus: "Hecho documentado",
    reviewedAt: "21 sep 2026",
  },
  {
    id: "registraduria-firmas",
    isoDate: "2026-01-30",
    date: "30 ENE 2026",
    category: "Registro electoral",
    title: "La Registraduría documentó las firmas recibidas por el comité de la candidatura",
    summary:
      "El informe institucional de gestión registró 5.049.855 apoyos recibidos por Defensores de la Patria durante el proceso de firmas.",
    status: "Documento oficial",
    source: "Registraduría Nacional",
    url: "https://www.registraduria.gov.co/IMG/pdf/20260130_informe_de_gestion_institucional_2025.pdf",
    scope: "Nacional",
    evidenceLevel: "Documento oficial",
    processStatus: "Hecho documentado",
    reviewedAt: "21 sep 2026",
  },
  {
    id: "alocucion-justicia",
    isoDate: "2026-09-13",
    date: "13 SEP 2026",
    category: "Justicia",
    title: "El presidente se pronunció sobre decisiones judiciales durante una alocución",
    summary:
      "Noticias Caracol informó sobre las declaraciones relativas a fallos que afectaban decisiones del Gobierno y las vías institucionales para controvertirlos.",
    status: "Medio colombiano",
    source: "Noticias Caracol",
    url: "https://www.noticiascaracol.com/politica/respeto-a-la-justicia-dice-de-la-espriella-al-controvertir-fallos-contra-decisiones-del-gobierno-rg10?_amp=true",
    scope: "Nacional",
    evidenceLevel: "Reporte de una fuente",
    processStatus: "Decisión judicial",
    reviewedAt: "21 sep 2026",
  },
  {
    id: "orden-publicaciones",
    isoDate: "2026-09-10",
    date: "10 SEP 2026",
    category: "Derechos",
    title: "Un medio internacional informó sobre una orden judicial relacionada con publicaciones oficiales",
    summary:
      "DW reportó que un juez ordenó ocultar temporalmente publicaciones que mostraban cadáveres ante posibles afectaciones de derechos fundamentales de menores.",
    status: "Cobertura internacional",
    source: "DW Español · Alemania",
    url: "https://amp.dw.com/es/de-la-espriella-tendr%C3%A1-que-retirar-sus-publicaciones-mostrando-cad%C3%A1veres-en-redes/a-79210565",
    scope: "Internacional",
    evidenceLevel: "Reporte de una fuente",
    processStatus: "Decisión judicial",
    reviewedAt: "21 sep 2026",
  },
  {
    id: "giro-politica-exterior",
    isoDate: "2026-09-07",
    date: "07 SEP 2026",
    category: "Relaciones exteriores",
    title: "La prensa extranjera examinó el giro de la política exterior colombiana",
    summary:
      "El País analizó el acercamiento del nuevo Gobierno a Estados Unidos e Israel y el contraste con la diplomacia de la administración anterior.",
    status: "Cobertura internacional",
    source: "El País · España",
    url: "https://elpais.com/america-colombia/2026-09-07/del-escudo-de-las-americas-a-los-altos-del-golan-de-la-espriella-cumple-la-promesa-de-alinearse-con-trump-y-netanyahu.html",
    scope: "Internacional",
    evidenceLevel: "Reporte de una fuente",
    processStatus: "Hecho documentado",
    reviewedAt: "21 sep 2026",
  },
  {
    id: "proclamacion-cne",
    isoDate: "2026-06-25",
    date: "25 JUN 2026",
    category: "Elecciones",
    title: "DW informó sobre la proclamación del presidente electo por el CNE",
    summary:
      "La cobertura internacional recogió la declaración electoral para el periodo constitucional 2026–2030 y la fecha prevista de posesión.",
    status: "Cobertura internacional",
    source: "DW Español · Alemania",
    url: "https://amp.dw.com/es/abelardo-de-la-espriella-es-proclamado-presidente-electo-de-colombia/a-77698790",
    scope: "Internacional",
    evidenceLevel: "Reporte de una fuente",
    processStatus: "Hecho documentado",
    reviewedAt: "21 sep 2026",
  },
];

const processGlossary = [
  ["Alegación", "Afirmación atribuida a una fuente; no equivale a un hecho probado."],
  ["Investigación", "Actuación abierta para establecer hechos y posibles responsabilidades."],
  ["Imputación", "Comunicación formal de cargos; mantiene la presunción de inocencia."],
  ["Decisión judicial", "Providencia de un juez o tribunal; se aclara si admite recursos."],
  ["Hecho documentado", "Acto, declaración o documento cuya existencia puede consultarse."],
];

const corrections = [
  { date: "22 sep 2026", item: "Etiqueta editorial", before: "Aprobado", after: "Admitido para monitoreo", reason: "Evitar que la admisión de una fuente se interprete como certificación de todas sus afirmaciones." },
  { date: "21 sep 2026", item: "Política de correcciones", before: "Sin registro público", after: "Bitácora pública incorporada", reason: "Hacer visibles los cambios editoriales y su justificación." },
];

const campaignPromises = [
  {
    title: "Donar el salario presidencial",
    status: "Cumplida",
    detail: "El primer salario fue destinado a dos centros geriátricos afectados por el terremoto del Quindío.",
    source: "Europa Press",
    url: "https://www.europapress.es/internacional/noticia-espriella-cumple-promesa-renuncia-primer-sueldo-favor-dos-geriatricos-afectados-terremoto-20260913014550.html",
  },
  {
    title: "Poner en marcha un plan de choque en salud",
    status: "Pendiente",
    detail: "La Presidencia anunció el inicio del plan; su resultado todavía requiere seguimiento verificable.",
    source: "Presidencia de la República",
    url: "https://www.presidencia.gov.co/prensa/Paginas/Declaracion-del-Presidente-de-la-Republica-Abelardo-De-La-Espriella-al-termino-260921.aspx",
  },
  {
    title: "Recuperar territorios en los primeros 90 días",
    status: "Pendiente",
    detail: "El plazo de la promesa continúa abierto y no permite declarar un cumplimiento definitivo.",
    source: "Programa de gobierno",
    url: "https://defensoresdelapatria.com/wp-content/uploads/2026/04/PROPUESTAS-ABELARDO-DE-LA-ESPRIELLA-EL-TIGRE.pdf",
  },
  {
    title: "Reducir la burocracia estatal en 40 %",
    status: "Pendiente",
    detail: "No existe todavía evidencia pública suficiente para marcar la meta como cumplida.",
    source: "Programa de gobierno",
    url: "https://propuestas.abelardopresidente.com.co/",
  },
] as const;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cuenta pública",
  url: "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/",
  description: "Cuenta regresiva, radar mundial de medios y archivo documental del periodo presidencial de Colombia.",
  creator: {
    "@type": "Person",
    "@id": "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/autor#carlos-orozco",
    name: "Carlos Orozco",
    url: "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/autor",
  },
};

function getCountdown(): Countdown {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

function getProgress() {
  const elapsed = ((Date.now() - START) / (TARGET - START)) * 100;
  return Math.min(100, Math.max(0, elapsed));
}

const number = new Intl.NumberFormat("es-CO", { minimumIntegerDigits: 2 });

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ecoMode, setEcoMode] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Todos");
  const [year, setYear] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [processFilter, setProcessFilter] = useState("Todos");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsQuery, setNewsQuery] = useState("");
  const [newsStage, setNewsStage] = useState("Todas");
  const [newsLimit, setNewsLimit] = useState(6);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [sourceDirectory, setSourceDirectory] = useState<SourceEntry[]>([]);
  const [globalRadar, setGlobalRadar] = useState<GlobalRadarItem[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [radarCountry, setRadarCountry] = useState("Todos");
  const [radarQuery, setRadarQuery] = useState("");
  const [sourceRegion, setSourceRegion] = useState("Todas");
  const [sourceQuery, setSourceQuery] = useState("");
  const [monitorUpdatedAt, setMonitorUpdatedAt] = useState<string | null>(null);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const storedEcoMode = window.localStorage.getItem("cuenta-publica-eco") === "true";
    window.requestAnimationFrame(() => setEcoMode(storedEcoMode));
  }, []);

  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdown());
      setProgress(getProgress());
    };
    const initial = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, ecoMode ? 60_000 : 1_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [ecoMode]);

  useEffect(() => {
    fetch("/api/noticias-v2")
      .then((response) => {
        if (!response.ok) throw new Error("No disponible");
        return response.json();
      })
      .then((data) => {
        setNews(Array.isArray(data.items) ? data.items : []);
        setReviewStats(data.review ?? null);
        setSourceDirectory(Array.isArray(data.sourceDirectory) ? data.sourceDirectory : []);
        setGlobalRadar(Array.isArray(data.globalRadar) ? data.globalRadar : []);
        setGlobalStats(data.globalStats ?? null);
        setMonitorUpdatedAt(data.updatedAt ?? null);
        setNewsState("ready");
      })
      .catch(() => setNewsState("error"));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return records.filter((item) => {
      const scopeMatches = scope === "Todos" || item.scope === scope;
      const yearMatches = year === "Todos" || item.isoDate.startsWith(year);
      const categoryMatches = categoryFilter === "Todos" || item.category === categoryFilter;
      const processMatches = processFilter === "Todos" || item.processStatus === processFilter;
      const textMatches =
        !normalized || `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase("es").includes(normalized);
      return scopeMatches && yearMatches && categoryMatches && processMatches && textMatches;
    });
  }, [scope, year, categoryFilter, processFilter, query]);

  const nationalRecords = filtered.filter((item) => item.scope === "Nacional");
  const internationalRecords = filtered.filter((item) => item.scope === "Internacional");
  const filteredNews = news.filter((item) => {
    const stageMatches = newsStage === "Todas" || item.stage === newsStage;
    const text = `${item.title} ${item.source} ${item.category}`.toLocaleLowerCase("es");
    return stageMatches && (!newsQuery.trim() || text.includes(newsQuery.trim().toLocaleLowerCase("es")));
  });
  const nationalNewsAll = filteredNews.filter((item) => item.scope === "Nacional");
  const internationalNewsAll = filteredNews.filter((item) => item.scope === "Internacional");
  const nationalNews = nationalNewsAll.slice(0, newsLimit);
  const internationalNews = internationalNewsAll.slice(0, newsLimit);
  const categories = Array.from(new Set(records.map((item) => item.category)));
  const processStatuses = Array.from(new Set(records.map((item) => item.processStatus)));
  const officialRecords = records.filter((item) => item.evidenceLevel === "Documento oficial").length;
  const radarCountries = Array.from(new Set(globalRadar.map((item) => item.country))).sort((a, b) => a.localeCompare(b, "es"));
  const filteredRadar = globalRadar.filter((item) => {
    const countryMatches = radarCountry === "Todos" || item.country === radarCountry;
    const text = `${item.title} ${item.source} ${item.domain}`.toLocaleLowerCase("es");
    return countryMatches && (!radarQuery.trim() || text.includes(radarQuery.trim().toLocaleLowerCase("es")));
  });
  const sourceRegions = Array.from(new Set(sourceDirectory.map((item) => item.region))).sort((a, b) => a.localeCompare(b, "es"));
  const filteredSources = sourceDirectory.filter((item) => {
    const regionMatches = sourceRegion === "Todas" || item.region === sourceRegion;
    const text = `${item.label} ${item.domain} ${item.country}`.toLocaleLowerCase("es");
    return regionMatches && (!sourceQuery.trim() || text.includes(sourceQuery.trim().toLocaleLowerCase("es")));
  });

  const toggleEcoMode = () => {
    setEcoMode((current) => {
      const next = !current;
      window.localStorage.setItem("cuenta-publica-eco", String(next));
      return next;
    });
  };

  const shareRecord = async (id: string, title: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
      setSharedId(id);
      window.setTimeout(() => setSharedId(null), 1800);
    } catch {
      setSharedId(null);
    }
  };

  const timeUnits = [
    [countdown.days.toLocaleString("es-CO"), "días"],
    [number.format(countdown.hours), "horas"],
    [number.format(countdown.minutes), "min"],
    [number.format(countdown.seconds), "seg"],
  ];

  return (
    <main className={`home-streamlined ${ecoMode ? "eco-mode" : ""}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <a className="skip-link" href="#monitoreo">Saltar a las noticias</a>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span className="brand-mark">07</span>
          <span>Cuenta pública</span>
        </a>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Navegación principal">
          <a href="#monitoreo" onClick={() => setMenuOpen(false)}>Noticias</a>
          <a href="#participa" onClick={() => setMenuOpen(false)}>Participa</a>
          <a className="nav-priority nav-priority-2" href="/presidente" onClick={() => setMenuOpen(false)}>Presidente</a>
          <a className="nav-priority nav-priority-3" href="/favorabilidad" onClick={() => setMenuOpen(false)}>Indicadores</a>
          <a className="nav-priority nav-priority-4" href="/archivo" onClick={() => setMenuOpen(false)}>Archivo</a>
          <details className="nav-more">
            <summary><span className="hamburger-lines" aria-hidden="true" /> Más</summary>
            <div className="nav-more-panel">
              <a className="more-priority-2" href="/presidente" onClick={() => setMenuOpen(false)}>Sobre el presidente</a><a className="more-priority-3" href="/favorabilidad" onClick={() => setMenuOpen(false)}>Indicadores</a><a className="more-priority-4" href="/archivo" onClick={() => setMenuOpen(false)}>Archivo</a><a href="/reportes" onClick={() => setMenuOpen(false)}>Reportes</a><a href="/fuentes" onClick={() => setMenuOpen(false)}>Fuentes</a><a href="/metodologia" onClick={() => setMenuOpen(false)}>Metodología</a><a href="/acerca" onClick={() => setMenuOpen(false)}>Acerca de</a><a href="/autor" onClick={() => setMenuOpen(false)}>Quién soy</a>
            </div>
          </details>
        </nav>
        <div className="header-actions">
          <button className={ecoMode ? "eco-button active" : "eco-button"} onClick={toggleEcoMode} aria-pressed={ecoMode}>
            <Leaf size={16} /> {ecoMode ? "Ahorro activo" : "Bajo consumo"}
          </button>
          <CompactPresence />
          <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menú">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span /> PERIODO PRESIDENCIAL · COLOMBIA</p>
          <h1>
            Tiempo restante para que el presidente{" "}
            <em>Abelardo Gabriel De La Espriella Otero</em> deje la presidencia
          </h1>
          <p className="hero-intro">
            Cuenta regresiva hasta la fecha constitucional estimada de finalización del periodo presidencial 2026–2030.
          </p>
          <div className="hero-meta-row">
            <div className="target-date">
              <Clock3 size={18} />
              <span>Fecha objetivo</span>
              <strong>7 de agosto de 2030</strong>
            </div>
            <a className="creator-byline" href="/autor"><span>CO</span><div><small>CREADO Y MANTENIDO POR</small><strong>Carlos Orozco</strong></div><ArrowUpRight size={16} /></a>
          </div>
        </div>

        <div className="hero-dashboard">
          <div className="countdown-panel" aria-live="polite" aria-label="Tiempo restante">
            <div className="panel-topline">
              <span>TIEMPO RESTANTE</span>
              <span className="live-dot"><i /> {ecoMode ? "CADA MINUTO" : "EN VIVO"}</span>
            </div>
            <div className="countdown-grid">
              {timeUnits.map(([value, label], index) => (
                <div className={index === 0 ? "time-block featured" : "time-block"} key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="mandate-progress">
              <div className="progress-summary">
                <span>Mandato transcurrido</span>
                <strong>{progress.toFixed(1).replace(".", ",")}%</strong>
              </div>
              <div className="timeline-wrap">
                <div
                  className="timeline-track"
                  role="progressbar"
                  aria-label="Porcentaje transcurrido del mandato"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Number(progress.toFixed(1))}
                >
                  <span className="timeline-fill" style={{ width: `${progress}%` }} />
                  <span className="today-marker" style={{ left: `${progress}%` }}>
                    <span className="today-label"><Flag size={13} aria-hidden="true" /> Hoy</span>
                    <i aria-hidden="true" />
                  </span>
                </div>
                <div className="timeline-milestones" aria-label="Hitos anuales del mandato">
                  {milestones.map((milestone, index) => (
                    <div
                      className={`milestone ${index === 0 ? "milestone-first" : ""} ${index === milestones.length - 1 ? "milestone-last" : ""}`}
                      style={{ left: `${milestone.position}%` }}
                      key={milestone.year}
                    >
                      <Flag size={15} aria-hidden="true" />
                      <strong>{milestone.year}</strong>
                      {milestone.label && <small>{milestone.label}</small>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="countdown-note">
              El cálculo usa la hora de Colombia y cuenta hasta el inicio del día. La hora oficial de transmisión de mando se actualizará cuando sea publicada.
            </p>
          </div>

          <aside className="promises-panel" aria-labelledby="promises-title">
            <div className="promises-heading">
              <div><span>SEGUIMIENTO</span><h2 id="promises-title">Promesas de campaña</h2></div>
              <small>Revisión: 22 sep 2026</small>
            </div>
            <div className="promises-list">
              {campaignPromises.map((promise) => (
                <article className={`promise-item promise-${promise.status === "Cumplida" ? "done" : "pending"}`} key={promise.title}>
                  <span className="promise-icon" aria-hidden="true">{promise.status === "Cumplida" ? <CheckCircle2 size={20} /> : <Hourglass size={19} />}</span>
                  <div><strong>{promise.title}</strong><p>{promise.detail}</p><a href={promise.url} target="_blank" rel="noreferrer">{promise.source} <ExternalLink size={12} /></a></div>
                  <small>{promise.status}</small>
                </article>
              ))}
            </div>
            <p className="promises-note">“Pendiente” también incluye metas cuyo plazo sigue abierto. El inicio de una acción no equivale a su cumplimiento.</p>
          </aside>
        </div>
      </section>

      <SocialShare />

      <section className="archive section-shell" id="archivo" hidden>
        <div className="section-heading">
          <div>
            <p className="section-kicker">01 / ARCHIVO</p>
            <h2>Hechos documentados</h2>
            <p>Fuentes institucionales y coberturas periodísticas, separadas por alcance nacional e internacional.</p>
          </div>
          <div className="verified-seal"><ShieldCheck size={22} /><span>FUENTES<br />TRAZABLES</span></div>
        </div>

        <div className="filters" role="search">
          <label className="search-box">
            <Search size={18} />
            <span className="sr-only">Buscar en el archivo</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en el archivo" />
          </label>
          <div className="filter-buttons" aria-label="Filtrar por alcance">
            {["Todos", "Nacional", "Internacional"].map((item) => (
              <button key={item} className={scope === item ? "active" : ""} onClick={() => setScope(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="timeline-filters" aria-label="Filtros de la cronología">
          <label>Año<select value={year} onChange={(event) => setYear(event.target.value)}><option>Todos</option>{["2025", "2026", "2027", "2028", "2029", "2030"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Tema<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>Todos</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Estado procesal<select value={processFilter} onChange={(event) => setProcessFilter(event.target.value)}><option>Todos</option>{processStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <span>{filtered.length} {filtered.length === 1 ? "hecho" : "hechos"}</span>
        </div>

        <div className="records-list">
          {nationalRecords.length > 0 && (
            <div className="record-group">
              <div className="scope-heading"><span>CO</span><div><strong>Nacionales</strong><p>Instituciones públicas y medios colombianos.</p></div></div>
              {nationalRecords.map((item, index) => (
                <article className="record" id={`hecho-${item.id}`} key={item.url}>
                  <div className="record-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="record-date">{item.date}</div>
                  <div className="record-body">
                    <div className="record-meta"><span>{item.category}</span><span className="status"><CheckCircle2 size={13} /> {item.evidenceLevel}</span><span>{item.processStatus}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="record-links"><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ArrowUpRight size={15} /></a>{item.responseUrl && <a href={item.responseUrl} target="_blank" rel="noreferrer">{item.responseLabel}<ExternalLink size={14} /></a>}<button onClick={() => shareRecord(`hecho-${item.id}`, item.title)}><Share2 size={14} /> {sharedId === `hecho-${item.id}` ? "Enlace copiado" : "Compartir"}</button></div>
                    <small className="record-check">Revisado el {item.reviewedAt}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
          {internationalRecords.length > 0 && (
            <div className="record-group">
              <div className="scope-heading"><span>INT</span><div><strong>Internacionales</strong><p>Medios y canales informativos con sede fuera de Colombia.</p></div></div>
              {internationalRecords.map((item, index) => (
                <article className="record" id={`hecho-${item.id}`} key={item.url}>
                  <div className="record-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="record-date">{item.date}</div>
                  <div className="record-body">
                    <div className="record-meta"><span>{item.category}</span><span className="status"><CheckCircle2 size={13} /> {item.evidenceLevel}</span><span>{item.processStatus}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="record-links"><a href={item.url} target="_blank" rel="noreferrer">{item.source}<ArrowUpRight size={15} /></a>{item.responseUrl && <a href={item.responseUrl} target="_blank" rel="noreferrer">{item.responseLabel}<ExternalLink size={14} /></a>}<button onClick={() => shareRecord(`hecho-${item.id}`, item.title)}><Share2 size={14} /> {sharedId === `hecho-${item.id}` ? "Enlace copiado" : "Compartir"}</button></div>
                    <small className="record-check">Revisado el {item.reviewedAt}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
          {filtered.length === 0 && <p className="empty-state">No hay registros que coincidan con la búsqueda.</p>}
        </div>
      </section>

      <section className="evidence-dashboard" aria-label="Estadísticas del archivo" hidden>
        <div><strong>{records.length}</strong><span>hechos documentados</span></div>
        <div><strong>{officialRecords}</strong><span>documentos oficiales</span></div>
        <div><strong>{records.length - officialRecords}</strong><span>coberturas periodísticas</span></div>
        <div><strong>{new Set(records.map((item) => item.source)).size}</strong><span>fuentes citadas</span></div>
      </section>

      <section className="monitoring section-shell" id="monitoreo">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">02 / MONITOREO DIARIO</p>
            <h2>En observación</h2>
            <p>Cobertura nacional e internacional desde el inicio de la campaña presidencial, el 16 de julio de 2025. Son pistas de lectura con fuente original, no conclusiones editoriales.</p>
          </div>
          <span className="update-pill"><i /> Actualización global cada 6 horas</span>
        </div>
        {reviewStats && (
          <div className="review-summary" aria-label="Resultado de la revisión automática">
            <div><CheckCircle2 size={18} /><span>Admitidos</span><strong>{reviewStats.admitted}</strong></div>
            <div><PencilLine size={18} /><span>Corregidos</span><strong>{reviewStats.corrected}</strong></div>
            <div><CircleX size={18} /><span>Rechazados</span><strong>{reviewStats.rejected}</strong></div>
            <p>Política editorial v{reviewStats.policyVersion} · Los rechazados no se publican.</p>
          </div>
        )}
        {newsState === "ready" && (
          <div className="news-controls" role="search" aria-label="Filtrar noticias monitoreadas">
            <label><Search size={17} /><span className="sr-only">Buscar noticia o fuente</span><input value={newsQuery} onChange={(event) => { setNewsQuery(event.target.value); setNewsLimit(6); }} placeholder="Buscar titular, medio o tema" /></label>
            <label><History size={17} /><span className="sr-only">Filtrar por etapa</span><select value={newsStage} onChange={(event) => { setNewsStage(event.target.value); setNewsLimit(6); }}><option>Todas</option><option>Campaña</option><option>Transición</option><option>Presidencia</option></select></label>
            <span><strong>{filteredNews.length}</strong> resultados · desde 16 jul 2025</span>
          </div>
        )}
        {newsState === "loading" && <div className="news-message">Consultando cobertura reciente…</div>}
        {newsState === "error" && <div className="news-message">El monitor está temporalmente indisponible. El archivo verificado sigue accesible.</div>}
        {newsState === "ready" && news.length === 0 && <div className="news-message">No se encontraron resultados nuevos en esta actualización.</div>}
        {nationalNews.length > 0 && (
          <div className="monitor-group">
            <div className="monitor-scope"><span>CO</span><div><strong>Noticias nacionales</strong><p>Entidades oficiales y medios colombianos</p></div></div>
            <div className="news-grid">
              {nationalNews.map((item) => (
                <article className="news-card" id={`noticia-${item.id}`} key={item.id}>
                  <div className="news-card-top"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                  <div className="decision-row"><span className={`decision decision-${item.decision.toLocaleLowerCase("es")}`}>{item.decision === "Admitido" ? "Admitido para monitoreo" : item.decision}</span><span>{item.stage}</span><span>{item.category}</span></div>
                  <h3>{item.title}</h3>
                  <p className="decision-reason">{item.decisionReason}</p>
                  <div className="news-evidence"><span>{item.evidenceLevel}</span><span>{item.processStatus}</span><span className={`link-${item.linkCheck?.status.toLocaleLowerCase("es").replace(" ", "-")}`}>{item.linkCheck?.status ?? "No comprobado"}</span>{item.linkCheck?.lastModified && <span title="Fecha de modificación informada por la fuente">Actualizado: {new Date(item.linkCheck.lastModified).toLocaleDateString("es-CO")}</span>}</div>
                  {item.sources.length > 1 && <p className="source-count">{item.sources.length} fuentes reunidas en este hecho.</p>}
                  <div className="news-card-bottom"><span>{item.kind}</span><div><button onClick={() => shareRecord(`noticia-${item.id}`, item.title)} aria-label={`Compartir ${item.title}`}><Share2 size={16} /></button><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${item.title}`}><ArrowUpRight size={17} /></a></div></div>
                </article>
              ))}
            </div>
          </div>
        )}
        {internationalNews.length > 0 && (
          <div className="monitor-group">
            <div className="monitor-scope"><span>INT</span><div><strong>Noticias internacionales</strong><p>Canales y medios con sede fuera de Colombia</p></div></div>
            <div className="news-grid">
              {internationalNews.map((item) => (
                <article className="news-card" id={`noticia-${item.id}`} key={item.id}>
                  <div className="news-card-top"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                  <div className="decision-row"><span className={`decision decision-${item.decision.toLocaleLowerCase("es")}`}>{item.decision === "Admitido" ? "Admitido para monitoreo" : item.decision}</span><span>{item.stage}</span><span>{item.category}</span></div>
                  <h3>{item.title}</h3>
                  <p className="decision-reason">{item.decisionReason}</p>
                  <div className="news-evidence"><span>{item.evidenceLevel}</span><span>{item.processStatus}</span><span className={`link-${item.linkCheck?.status.toLocaleLowerCase("es").replace(" ", "-")}`}>{item.linkCheck?.status ?? "No comprobado"}</span>{item.linkCheck?.lastModified && <span title="Fecha de modificación informada por la fuente">Actualizado: {new Date(item.linkCheck.lastModified).toLocaleDateString("es-CO")}</span>}</div>
                  {item.sources.length > 1 && <p className="source-count">{item.sources.length} fuentes reunidas en este hecho.</p>}
                  <div className="news-card-bottom"><span>{item.kind}</span><div><button onClick={() => shareRecord(`noticia-${item.id}`, item.title)} aria-label={`Compartir ${item.title}`}><Share2 size={16} /></button><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${item.title}`}><ArrowUpRight size={17} /></a></div></div>
                </article>
              ))}
            </div>
          </div>
        )}
        {(nationalNewsAll.length > newsLimit || internationalNewsAll.length > newsLimit) && (
          <button className="news-more" onClick={() => setNewsLimit((current) => current + 6)}><ChevronDown size={17} /> Mostrar más noticias</button>
        )}
        {globalStats && (
          <div className="global-radar" id="radar-mundial">
            <div className="radar-heading">
              <div><Globe2 size={28} /><div><strong>Radar mundial</strong><p>Descubrimiento multilingüe de medios nacionales, regionales y locales. Los hallazgos nuevos permanecen en evaluación hasta superar la política editorial.</p></div></div>
              <span>GDELT · más de 100 idiomas</span>
            </div>
            <div className="radar-stats">
              <div><strong>{globalStats.catalogSources}</strong><span>medios en el directorio</span></div>
              <div><strong>{globalStats.results}</strong><span>resultados del ciclo</span></div>
              <div><strong>{globalStats.countries}</strong><span>países detectados</span></div>
              <div><strong>{globalStats.languages}</strong><span>idiomas detectados</span></div>
              <div><strong>{globalStats.domains}</strong><span>dominios distintos</span></div>
            </div>
            <div className="radar-filters">
              <label><Search size={16} /><span className="sr-only">Buscar medio o titular mundial</span><input value={radarQuery} onChange={(event) => setRadarQuery(event.target.value)} placeholder="Buscar medio, dominio o titular" /></label>
              <label><Globe2 size={16} /><span className="sr-only">Filtrar radar por país</span><select value={radarCountry} onChange={(event) => setRadarCountry(event.target.value)}><option>Todos</option>{radarCountries.map((country) => <option key={country}>{country}</option>)}</select></label>
            </div>
            {filteredRadar.length > 0 ? (
              <div className="radar-grid">
                {filteredRadar.slice(0, 24).map((item) => (
                  <article key={item.url}>
                    <div><span>{item.country}</span><span>{item.language}</span></div>
                    <strong>{item.source}</strong>
                    <p>{item.title}</p>
                    <div className="radar-signals"><span>{item.status}</span><span>{item.signal}</span></div>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.domain}<ArrowUpRight size={14} /></a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="radar-empty">Este ciclo no devolvió resultados para el filtro seleccionado. El directorio mundial permanece activo y la búsqueda volverá a ejecutarse en la siguiente actualización.</p>
            )}
            <p className="radar-note">Cobertura exhaustiva significa consultar un índice mundial y ampliar continuamente el directorio; no existe una base capaz de garantizar literalmente todos los medios de todos los países. Un medio descubierto no se presenta como confiable hasta ser evaluado.</p>
          </div>
        )}
        {monitorUpdatedAt && <p className="monitor-check"><Link2 size={14} /> Enlaces comprobados el {new Date(monitorUpdatedAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}. “No comprobado” indica que el sitio externo no respondió; no implica que el contenido sea falso.</p>}
      </section>

      <Community />

      <section className="transparency section-shell" id="fuentes" hidden>
        <div className="section-heading">
          <div>
          <p className="section-kicker">04 / TRANSPARENCIA</p>
            <h2>Cómo leer el archivo</h2>
            <p>Directorio internacional de medios globales, nacionales y regionales, además de estados procesales y cambios editoriales.</p>
          </div>
          <History size={38} aria-hidden="true" />
        </div>

        <div className="context-block">
          <h3>Niveles de evidencia</h3>
          <div className="evidence-levels">
            <div><strong>01</strong><span>Documento oficial</span><p>Acto, resolución, sentencia o comunicación publicada por la entidad competente.</p></div>
            <div><strong>02</strong><span>Varias fuentes</span><p>Dos o más fuentes admitidas describen el mismo hecho; el sistema reúne sus enlaces.</p></div>
            <div><strong>03</strong><span>Una fuente</span><p>Reporte trazable aún no corroborado de forma independiente. Se presenta con esa limitación.</p></div>
          </div>
        </div>

        <div className="context-block">
          <h3>Estados procesales</h3>
          <div className="glossary-grid">
            {processGlossary.map(([label, description]) => <div key={label}><strong>{label}</strong><p>{description}</p></div>)}
          </div>
        </div>

        <details className="sources-directory">
          <summary>Consultar las {sourceDirectory.length || globalStats?.catalogSources || 38} fuentes admitidas <ChevronDown size={17} /></summary>
          <div className="directory-filters">
            <label><Search size={16} /><span className="sr-only">Buscar fuente o país</span><input value={sourceQuery} onChange={(event) => setSourceQuery(event.target.value)} placeholder="Buscar medio, dominio o país" /></label>
            <label><Globe2 size={16} /><span className="sr-only">Filtrar fuentes por región</span><select value={sourceRegion} onChange={(event) => setSourceRegion(event.target.value)}><option>Todas</option>{sourceRegions.map((region) => <option key={region}>{region}</option>)}</select></label>
            <span>{filteredSources.length} fuentes</span>
          </div>
          <div className="source-grid">
            {filteredSources.map((source) => (
              <article key={source.domain}>
                <span>{source.country} · {source.region}</span>
                <strong>{source.label}</strong>
                <a href={`https://${source.domain}`} target="_blank" rel="noreferrer">{source.domain}<ExternalLink size={13} /></a>
                <p>{source.kind}. {source.criterion}</p>
              </article>
            ))}
          </div>
        </details>

        <div className="corrections-log" id="correcciones">
          <div className="corrections-heading"><div><p className="section-kicker">BITÁCORA PÚBLICA</p><h3>Correcciones y cambios</h3></div><span>{corrections.length} registros</span></div>
          <div className="corrections-table" role="table" aria-label="Bitácora de correcciones">
            {corrections.map((correction) => (
              <div className="correction-row" role="row" key={`${correction.date}-${correction.item}`}>
                <time>{correction.date}</time><strong>{correction.item}</strong><p><s>{correction.before}</s><br />{correction.after}</p><p>{correction.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="method section-shell" id="metodologia" hidden>
        <div className="method-title">
          <p className="section-kicker">05 / CRITERIO EDITORIAL</p>
          <h2>Una regla para cada hallazgo.</h2>
        </div>
        <div className="policy-intro">
          <p>El sistema aplica estas políticas antes de mostrar una noticia. La decisión, la categoría y su motivo quedan visibles junto al enlace original.</p>
          <span>Sin panel privado</span>
        </div>
        <div className="method-grid policy-grid">
          <div><CheckCircle2 /><strong>Aprobar</strong><p>Publicar cuando la fuente está admitida, el enlace es verificable y el titular se refiere directamente al mandatario.</p></div>
          <div><PencilLine /><strong>Corregir</strong><p>Normalizar espacios o puntuación repetida sin alterar afirmaciones. El vínculo al texto original siempre se conserva.</p></div>
          <div><CircleX /><strong>Rechazar</strong><p>Excluir fuentes no admitidas, enlaces inseguros, fechas inválidas o resultados sin relación directa.</p></div>
          <div><Tags /><strong>Clasificar</strong><p>Asignar automáticamente ámbito, tipo de fuente y tema: justicia, elecciones, relaciones exteriores, seguridad, economía, derechos o gobierno.</p></div>
        </div>
        <details>
          <summary>Leer política editorial completa <ChevronDown size={17} /></summary>
          <div className="policy-detail">
            <p><strong>1. Admisión.</strong> Solo se consideran entidades oficiales y medios incluidos en la lista pública de fuentes. Un resultado de un proveedor externo no queda aprobado por aparecer en la búsqueda.</p>
            <p><strong>2. Descubrimiento mundial.</strong> El radar consulta GDELT para localizar cobertura en más de 100 idiomas y registrar país, idioma y dominio. Los medios no incluidos en el directorio aparecen como pendientes de evaluación.</p>
            <p><strong>3. Verificación.</strong> El enlace debe usar HTTPS, incluir una fecha válida y referirse directamente a Abelardo de la Espriella. La fuente original queda accesible.</p>
            <p><strong>4. Lenguaje.</strong> Denuncia, investigación, imputación, sanción y sentencia se tratan como estados distintos. Una acusación no se presenta como hecho probado.</p>
            <p><strong>5. Correcciones.</strong> La automatización solo corrige forma —espacios y puntuación repetida—. Cambios de fondo requieren nueva evidencia y deben reflejarse en el archivo.</p>
            <p><strong>6. Rechazo.</strong> Los resultados que incumplen una regla se contabilizan, pero no se publican ni alimentan el archivo documental.</p>
            <p><strong>7. Derecho de respuesta.</strong> Cuando existe una respuesta pública de la persona o institución señalada, se incorpora junto al hecho con su enlace original.</p>
            <p><strong>8. Alcance.</strong> “Admitido para monitoreo” significa que el enlace superó estas reglas de publicación; no certifica que cada afirmación del contenido sea verdadera ni expresa una posición política.</p>
            <p><strong>9. Aportes ciudadanos.</strong> Los enlaces repetidos se bloquean por su URL normalizada. Las fuentes oficiales relevantes pueden marcarse como publicables; los medios y fuentes nuevas quedan en evaluación y nunca entran automáticamente al archivo verificado.</p>
            <p><strong>10. Opiniones.</strong> Un identificador anónimo del navegador limita el muro a un aporte por persona; también se impiden duplicados exactos y textos con una similitud sustancial. Los insultos o mensajes de odio se conservan para trazabilidad, pero su contenido se oculta. La postura política, por sí sola, nunca es motivo de filtrado.</p>
          </div>
        </details>
      </section>

      <section className="creator-section" id="autor" hidden>
        <div className="creator-number">CO</div>
        <div>
          <p className="section-kicker">DETRÁS DEL PROYECTO</p>
          <h2>Un sistema público también puede ser una muestra de cómo trabajo.</h2>
          <p>Diseñé y desarrollé Cuenta pública para explorar cómo el producto digital, la automatización y el criterio editorial pueden convertir información dispersa en una herramienta comprensible y verificable.</p>
          <div className="creator-skills"><span>Diseño de producto</span><span>Desarrollo web</span><span>Automatización</span><span>Visualización de datos</span></div>
          <a href="/autor?utm_source=homepage&utm_medium=creator_section&utm_campaign=portafolio">Conoce el proyecto y a su creador <ArrowUpRight size={17} /></a>
        </div>
      </section>

      <footer>
        <a className="brand" href="#inicio"><span className="brand-mark">07</span><span>Cuenta pública</span></a>
        <p>Soy <a href="/autor">Carlos Orozco</a>. Creé este proyecto para reunir el tiempo del mandato, las noticias y la participación ciudadana. Es un portal <a href="/acerca">independiente y sin ánimo de lucro</a>.</p>
        <span>Última revisión editorial: 21 sep 2026</span>
      </footer>
      <span className="sr-only" aria-live="polite">{sharedId ? "Enlace copiado o compartido" : ""}</span>
    </main>
  );
}
