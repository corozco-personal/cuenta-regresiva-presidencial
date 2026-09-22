"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Flag,
  Landmark,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };
type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  kind: "Fuente primaria" | "Cobertura periodística";
  scope: "Nacional" | "Internacional";
};

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
    date: "30 AGO 2026",
    category: "Instituciones",
    title: "La Presidencia publicó un pronunciamiento en cumplimiento de un fallo de tutela",
    summary:
      "En la alocución oficial se incluyó una explicación sobre la ceremonia de transmisión de mando y una manifestación pública de excusas.",
    status: "Fuente primaria",
    source: "Presidencia de la República",
    url: "https://www.presidencia.gov.co/prensa/Paginas/Alocucion-del-Presidente-Abelardo-De-la-Espriella-desde-la-sede-alterna-260830.aspx",
    scope: "Nacional",
  },
  {
    date: "17 JUN 2026",
    category: "Control electoral",
    title: "El CNE publicó la resolución sobre la solicitud de revocatoria de la inscripción presidencial",
    summary:
      "La Resolución 2990 de 2026 documenta el trámite presentado contra la inscripción de la candidatura para la segunda vuelta.",
    status: "Documento oficial",
    source: "Consejo Nacional Electoral",
    url: "https://www.cne.gov.co/resoluciones-cne-2026/13792?layout=print&print=1&tmpl=component",
    scope: "Nacional",
  },
  {
    date: "30 ENE 2026",
    category: "Registro electoral",
    title: "La Registraduría documentó las firmas recibidas por el comité de la candidatura",
    summary:
      "El informe institucional de gestión registró 5.049.855 apoyos recibidos por Defensores de la Patria durante el proceso de firmas.",
    status: "Documento oficial",
    source: "Registraduría Nacional",
    url: "https://www.registraduria.gov.co/IMG/pdf/20260130_informe_de_gestion_institucional_2025.pdf",
    scope: "Nacional",
  },
  {
    date: "13 SEP 2026",
    category: "Justicia",
    title: "El presidente se pronunció sobre decisiones judiciales durante una alocución",
    summary:
      "Noticias Caracol informó sobre las declaraciones relativas a fallos que afectaban decisiones del Gobierno y las vías institucionales para controvertirlos.",
    status: "Medio colombiano",
    source: "Noticias Caracol",
    url: "https://www.noticiascaracol.com/politica/respeto-a-la-justicia-dice-de-la-espriella-al-controvertir-fallos-contra-decisiones-del-gobierno-rg10?_amp=true",
    scope: "Nacional",
  },
  {
    date: "10 SEP 2026",
    category: "Derechos",
    title: "Un medio internacional informó sobre una orden judicial relacionada con publicaciones oficiales",
    summary:
      "DW reportó que un juez ordenó ocultar temporalmente publicaciones que mostraban cadáveres ante posibles afectaciones de derechos fundamentales de menores.",
    status: "Cobertura internacional",
    source: "DW Español · Alemania",
    url: "https://amp.dw.com/es/de-la-espriella-tendr%C3%A1-que-retirar-sus-publicaciones-mostrando-cad%C3%A1veres-en-redes/a-79210565",
    scope: "Internacional",
  },
  {
    date: "07 SEP 2026",
    category: "Relaciones exteriores",
    title: "La prensa extranjera examinó el giro de la política exterior colombiana",
    summary:
      "El País analizó el acercamiento del nuevo Gobierno a Estados Unidos e Israel y el contraste con la diplomacia de la administración anterior.",
    status: "Cobertura internacional",
    source: "El País · España",
    url: "https://elpais.com/america-colombia/2026-09-07/del-escudo-de-las-americas-a-los-altos-del-golan-de-la-espriella-cumple-la-promesa-de-alinearse-con-trump-y-netanyahu.html",
    scope: "Internacional",
  },
  {
    date: "25 JUN 2026",
    category: "Elecciones",
    title: "DW informó sobre la proclamación del presidente electo por el CNE",
    summary:
      "La cobertura internacional recogió la declaración electoral para el periodo constitucional 2026–2030 y la fecha prevista de posesión.",
    status: "Cobertura internacional",
    source: "DW Español · Alemania",
    url: "https://amp.dw.com/es/abelardo-de-la-espriella-es-proclamado-presidente-electo-de-colombia/a-77698790",
    scope: "Internacional",
  },
];

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
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Todos");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdown());
      setProgress(getProgress());
    };
    const initial = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    fetch("/api/noticias")
      .then((response) => {
        if (!response.ok) throw new Error("No disponible");
        return response.json();
      })
      .then((data) => {
        setNews(Array.isArray(data.items) ? data.items : []);
        setNewsState("ready");
      })
      .catch(() => setNewsState("error"));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return records.filter((item) => {
      const scopeMatches = scope === "Todos" || item.scope === scope;
      const textMatches =
        !normalized || `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase("es").includes(normalized);
      return scopeMatches && textMatches;
    });
  }, [scope, query]);

  const nationalRecords = filtered.filter((item) => item.scope === "Nacional");
  const internationalRecords = filtered.filter((item) => item.scope === "Internacional");
  const nationalNews = news.filter((item) => item.scope === "Nacional").slice(0, 6);
  const internationalNews = news.filter((item) => item.scope === "Internacional").slice(0, 6);

  const timeUnits = [
    [countdown.days.toLocaleString("es-CO"), "días"],
    [number.format(countdown.hours), "horas"],
    [number.format(countdown.minutes), "min"],
    [number.format(countdown.seconds), "seg"],
  ];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <span className="brand-mark">07</span>
          <span>Cuenta pública</span>
        </a>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Navegación principal">
          <a href="#archivo" onClick={() => setMenuOpen(false)}>Archivo</a>
          <a href="#monitoreo" onClick={() => setMenuOpen(false)}>Monitoreo</a>
          <a href="#metodologia" onClick={() => setMenuOpen(false)}>Metodología</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menú">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
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
          <div className="target-date">
            <Clock3 size={18} />
            <span>Fecha objetivo</span>
            <strong>7 de agosto de 2030</strong>
          </div>
        </div>

        <div className="countdown-panel" aria-live="polite" aria-label="Tiempo restante">
          <div className="panel-topline">
            <span>TIEMPO RESTANTE</span>
            <span className="live-dot"><i /> EN VIVO</span>
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
      </section>

      <section className="archive section-shell" id="archivo">
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

        <div className="records-list">
          {nationalRecords.length > 0 && (
            <div className="record-group">
              <div className="scope-heading"><span>CO</span><div><strong>Nacionales</strong><p>Instituciones públicas y medios colombianos.</p></div></div>
              {nationalRecords.map((item, index) => (
                <article className="record" key={item.url}>
                  <div className="record-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="record-date">{item.date}</div>
                  <div className="record-body">
                    <div className="record-meta"><span>{item.category}</span><span className="status"><CheckCircle2 size={13} /> {item.status}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ArrowUpRight size={15} /></a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {internationalRecords.length > 0 && (
            <div className="record-group">
              <div className="scope-heading"><span>INT</span><div><strong>Internacionales</strong><p>Medios y canales informativos con sede fuera de Colombia.</p></div></div>
              {internationalRecords.map((item, index) => (
                <article className="record" key={item.url}>
                  <div className="record-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="record-date">{item.date}</div>
                  <div className="record-body">
                    <div className="record-meta"><span>{item.category}</span><span className="status"><CheckCircle2 size={13} /> {item.status}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.source}<ArrowUpRight size={15} /></a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {filtered.length === 0 && <p className="empty-state">No hay registros que coincidan con la búsqueda.</p>}
        </div>
      </section>

      <section className="monitoring section-shell" id="monitoreo">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">02 / MONITOREO DIARIO</p>
            <h2>En observación</h2>
            <p>Resultados recientes de instituciones y canales informativos de Colombia y del exterior. Son pistas de lectura, no conclusiones editoriales.</p>
          </div>
          <span className="update-pill"><i /> Actualización cada 24 horas</span>
        </div>
        {newsState === "loading" && <div className="news-message">Consultando cobertura reciente…</div>}
        {newsState === "error" && <div className="news-message">El monitor está temporalmente indisponible. El archivo verificado sigue accesible.</div>}
        {newsState === "ready" && news.length === 0 && <div className="news-message">No se encontraron resultados nuevos en esta actualización.</div>}
        {nationalNews.length > 0 && (
          <div className="monitor-group">
            <div className="monitor-scope"><span>CO</span><div><strong>Noticias nacionales</strong><p>Entidades oficiales y medios colombianos</p></div></div>
            <div className="news-grid">
              {nationalNews.map((item) => (
                <article className="news-card" key={item.id}>
                  <div className="news-card-top"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span></div>
                  <h3>{item.title}</h3>
                  <div className="news-card-bottom"><span>{item.kind}</span><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${item.title}`}><ArrowUpRight size={17} /></a></div>
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
                <article className="news-card" key={item.id}>
                  <div className="news-card-top"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span></div>
                  <h3>{item.title}</h3>
                  <div className="news-card-bottom"><span>{item.kind}</span><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${item.title}`}><ArrowUpRight size={17} /></a></div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="method section-shell" id="metodologia">
        <div className="method-title">
          <p className="section-kicker">03 / CRITERIO EDITORIAL</p>
          <h2>Primero la evidencia.</h2>
        </div>
        <div className="method-grid">
          <div><FileCheck2 /><strong>Fuente primaria</strong><p>Presidencia, CNE, Registraduría, órganos de control, altas cortes y demás entidades públicas.</p></div>
          <div><Landmark /><strong>Contexto preciso</strong><p>Se diferencia entre denuncia, investigación, imputación y decisión judicial.</p></div>
          <div><ShieldCheck /><strong>Corrección abierta</strong><p>Cada registro conserva sus enlaces y puede actualizarse si aparecen nuevos hechos.</p></div>
        </div>
        <details>
          <summary>Leer política editorial completa <ChevronDown size={17} /></summary>
          <p>El monitor automático no publica por sí mismo una acusación como hecho probado. Consulta entidades oficiales colombianas, medios nacionales identificados y canales internacionales reconocidos. Los registros del archivo exigen una fuente primaria o corroboración independiente, lenguaje neutral y la respuesta de las personas o instituciones señaladas cuando esté disponible. “Verificado” describe la trazabilidad de la evidencia citada, no una aprobación política.</p>
        </details>
      </section>

      <footer>
        <a className="brand" href="#inicio"><span className="brand-mark">07</span><span>Cuenta pública</span></a>
        <p>Proyecto independiente de seguimiento documental. No está afiliado a la Presidencia de la República.</p>
        <span>Última revisión editorial: 21 sep 2026</span>
      </footer>
    </main>
  );
}
