"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
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
};

const TARGET = new Date("2030-08-07T00:00:00-05:00").getTime();

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
  },
  {
    date: "29 AGO 2026",
    category: "Gobierno",
    title: "El Gobierno anunció una revisión de la contratación en entidades nacionales",
    summary:
      "El anuncio oficial ordenó revisar contratación y estructura administrativa como insumo para el presupuesto de 2027.",
    status: "Fuente primaria",
    source: "Presidencia de la República",
    url: "https://www.presidencia.gov.co/prensa/Paginas/Presidente-De-La-Espriella-anuncio-una-reestructuracion-del-Estado-Vamos-260829.aspx",
  },
  {
    date: "07 AGO 2026",
    category: "Periodo",
    title: "Inicio del periodo presidencial 2026–2030",
    summary:
      "El perfil institucional identifica a Abelardo de la Espriella como presidente de la República para el periodo 2026–2030.",
    status: "Registro oficial",
    source: "Presidencia de la República",
    url: "https://www.presidencia.gov.co/contenidoVinculado/perfiles/presidente.html",
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

const number = new Intl.NumberFormat("es-CO", { minimumIntegerDigits: 2 });

export default function Home() {
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsState, setNewsState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const initial = window.setTimeout(() => setCountdown(getCountdown()), 0);
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
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
      const categoryMatches = category === "Todos" || item.category === category;
      const textMatches =
        !normalized || `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase("es").includes(normalized);
      return categoryMatches && textMatches;
    });
  }, [category, query]);

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
            <p>Registros con fuente identificada, contexto y estado verificable.</p>
          </div>
          <div className="verified-seal"><ShieldCheck size={22} /><span>FUENTES<br />TRAZABLES</span></div>
        </div>

        <div className="filters" role="search">
          <label className="search-box">
            <Search size={18} />
            <span className="sr-only">Buscar en el archivo</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en el archivo" />
          </label>
          <div className="filter-buttons" aria-label="Filtrar por categoría">
            {["Todos", "Instituciones", "Gobierno", "Periodo"].map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="records-list">
          {filtered.map((item, index) => (
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
          {filtered.length === 0 && <p className="empty-state">No hay registros que coincidan con la búsqueda.</p>}
        </div>
      </section>

      <section className="monitoring section-shell" id="monitoreo">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">02 / MONITOREO DIARIO</p>
            <h2>En observación</h2>
            <p>Resultados recientes encontrados automáticamente. Son pistas de lectura, no conclusiones editoriales.</p>
          </div>
          <span className="update-pill"><i /> Actualización cada 24 horas</span>
        </div>
        {newsState === "loading" && <div className="news-message">Consultando cobertura reciente…</div>}
        {newsState === "error" && <div className="news-message">El monitor está temporalmente indisponible. El archivo verificado sigue accesible.</div>}
        {newsState === "ready" && news.length === 0 && <div className="news-message">No se encontraron resultados nuevos en esta actualización.</div>}
        <div className="news-grid">
          {news.slice(0, 6).map((item) => (
            <article className="news-card" key={item.id}>
              <div className="news-card-top"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span></div>
              <h3>{item.title}</h3>
              <div className="news-card-bottom"><span>{item.kind}</span><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${item.title}`}><ArrowUpRight size={17} /></a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="method section-shell" id="metodologia">
        <div className="method-title">
          <p className="section-kicker">03 / CRITERIO EDITORIAL</p>
          <h2>Primero la evidencia.</h2>
        </div>
        <div className="method-grid">
          <div><FileCheck2 /><strong>Fuente primaria</strong><p>Documentos oficiales, decisiones judiciales, actos administrativos y registros públicos.</p></div>
          <div><Landmark /><strong>Contexto preciso</strong><p>Se diferencia entre denuncia, investigación, imputación y decisión judicial.</p></div>
          <div><ShieldCheck /><strong>Corrección abierta</strong><p>Cada registro conserva sus enlaces y puede actualizarse si aparecen nuevos hechos.</p></div>
        </div>
        <details>
          <summary>Leer política editorial completa <ChevronDown size={17} /></summary>
          <p>El monitor automático no publica por sí mismo una acusación como hecho probado. Los registros del archivo exigen una fuente primaria o corroboración independiente, lenguaje neutral y la respuesta de las personas o instituciones señaladas cuando esté disponible. “Verificado” describe la trazabilidad de la evidencia citada, no una aprobación política.</p>
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
