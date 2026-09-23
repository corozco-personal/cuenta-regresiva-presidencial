"use client";

import { Clock3, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type NewsPoint = { id: string; title: string; source: string; url: string; publishedAt: string; country?: string; scope: "Nacional" | "Internacional"; sources?: Array<{ source: string; url: string }> };

const COUNTRY_POINTS: Record<string, [number, number]> = {
  Colombia: [31, 61], "Estados Unidos": [19, 34], México: [20, 47], Argentina: [32, 82], Brasil: [38, 69], Chile: [27, 80],
  España: [49, 35], Francia: [51, 31], Alemania: [54, 29], Italia: [55, 36], "Reino Unido": [48, 25], Portugal: [47, 36],
  Canadá: [18, 21], China: [79, 39], Japón: [90, 42], India: [72, 52], Australia: [86, 79], Rusia: [70, 22],
  "Costa Rica": [27, 55], Panamá: [29, 57], Ecuador: [29, 65], Perú: [29, 70], Venezuela: [34, 59],
};

function dayInColombia(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function inferredPoint(item: NewsPoint, index: number): [number, number] {
  const explicit = COUNTRY_POINTS[item.country ?? ""];
  if (explicit) return explicit;
  if (item.scope === "Nacional") return COUNTRY_POINTS.Colombia;
  const fallback: Array<[number, number]> = [[50, 29], [55, 34], [73, 43], [83, 38], [18, 33], [86, 74]];
  return fallback[index % fallback.length];
}

export default function WorldNewsMap({ initialItems, updatedAt }: { initialItems: NewsPoint[]; updatedAt: string | null }) {
  const [items, setItems] = useState(initialItems);
  const [lastUpdate, setLastUpdate] = useState(updatedAt);
  useEffect(() => { setItems(initialItems); setLastUpdate(updatedAt); }, [initialItems, updatedAt]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetch("/api/noticias-v2", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject())
        .then((data) => { setItems(data.items ?? []); setLastUpdate(data.updatedAt ?? null); }).catch(() => undefined);
    }, 60 * 60_000);
    return () => window.clearInterval(interval);
  }, []);
  const sources = useMemo(() => {
    const today = dayInColombia(new Date().toISOString());
    const publications = items.filter((item) => dayInColombia(item.publishedAt) === today).flatMap((item) =>
      (item.sources?.length ? item.sources : [{ source: item.source, url: item.url }]).map((source) => ({ ...item, ...source })),
    );
    return Array.from(new Map(publications.map((item) => [item.source.toLocaleLowerCase("es"), item])).values());
  }, [items]);

  return <section className="world-today section-shell" aria-labelledby="world-today-title">
    <div className="world-today-heading"><div><p className="section-kicker">RADAR HORARIO</p><h2 id="world-today-title">Lo que habla el mundo hoy</h2><p>Medios identificados que publicaron hoy sobre el mandatario. La ubicación representa el país asociado al medio, no el lugar donde ocurrió el hecho.</p></div><Globe2 aria-hidden="true" /></div>
    <div className="world-map-layout">
      <figure className="world-map-figure">
        <svg viewBox="0 0 1000 500" role="img" aria-label={`Mapa mundial con ${sources.length} medios detectados hoy`}>
          <g className="world-land">
            <path d="M70 105 145 62l102 14 62 54-23 52-60 28-28 68-51-16-18-66-55-30Z" />
            <path d="m260 276 63 17 42 62-20 98-44 36-26-77-38-78Z" />
            <path d="m438 91 65-33 83 20 38 35 79-24 123 31 91 73-43 48-104-15-56 36-68-7-35-61-55-7-31 44-63-14-34-62Z" />
            <path d="m492 244 90 16 42 69-36 126-70-42-38-102Z" />
            <path d="m809 349 74-24 72 50-29 71-90-3-46-52Z" />
            <path d="m909 223 22-18 20 17-18 25Z" />
          </g>
          <g className="world-grid"><path d="M0 250h1000M500 0v500" /></g>
          {sources.map((item, index) => { const [x, y] = inferredPoint(item, index); return <g className="world-point" key={`${item.source}-${item.url}`} transform={`translate(${x * 10} ${y * 5})`}><circle r="12" /><circle r="4" /><title>{item.source} · {item.country || item.scope}: {item.title}</title></g>; })}
        </svg>
        <figcaption><Clock3 size={14} />Actualización cada hora · {lastUpdate ? `último barrido ${new Date(lastUpdate).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" })}` : "esperando el primer barrido"}</figcaption>
      </figure>
      <div className="world-source-list"><strong>{sources.length}</strong><span>medios con publicaciones hoy</span>{sources.length ? <ol>{sources.slice(0, 8).map((item) => <li key={`${item.source}-${item.url}`}><a href={item.url} target="_blank" rel="noreferrer"><span>{item.source}</span><small>{item.country || item.scope}</small></a></li>)}</ol> : <p>El radar todavía no detecta publicaciones fechadas hoy.</p>}</div>
    </div>
  </section>;
}
