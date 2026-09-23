"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

type NewsPoint = { id: string; title: string; source: string; url: string; publishedAt: string; country?: string; scope: "Nacional" | "Internacional"; sources?: Array<{ source: string; url: string }> };
type Publication = NewsPoint & { source: string; url: string };

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  colombia: [-74.3, 4.6], "estados unidos": [-98.5, 39.8], méxico: [-102.5, 23.6], argentina: [-64, -34], brasil: [-52, -10], chile: [-71, -33],
  españa: [-3.7, 40.4], francia: [2.2, 46.2], alemania: [10.4, 51.1], italia: [12.5, 42.8], "reino unido": [-3.4, 55.3], portugal: [-8, 39.6],
  canadá: [-106, 56], china: [104, 35], japón: [138, 36], india: [79, 22], australia: [134, -25], rusia: [90, 61], suiza: [8.2, 46.8],
  "costa rica": [-84, 9.7], panamá: [-80, 8.5], ecuador: [-78.2, -1.5], perú: [-75, -9], venezuela: [-66, 7],
  uruguay: [-56, -33], paraguay: [-58, -23], bolivia: [-64, -17], guatemala: [-90, 15.6], cuba: [-79.5, 21.5],
  bélgica: [4.5, 50.7], "países bajos": [5.3, 52.1], suecia: [16, 62], noruega: [8, 61], ucrania: [31, 49], turquía: [35, 39],
  israel: [35, 31.5], catar: [51.2, 25.3], "arabia saudita": [45, 24], "emiratos árabes unidos": [54, 24], "corea del sur": [128, 36], singapur: [104, 1.3],
};

const COUNTRY_CONTINENTS: Record<string, string> = {
  colombia: "América del Sur", argentina: "América del Sur", brasil: "América del Sur", chile: "América del Sur", ecuador: "América del Sur", perú: "América del Sur", venezuela: "América del Sur", uruguay: "América del Sur", paraguay: "América del Sur", bolivia: "América del Sur",
  "estados unidos": "América del Norte", méxico: "América del Norte", canadá: "América del Norte", "costa rica": "Centroamérica y Caribe", panamá: "Centroamérica y Caribe", guatemala: "Centroamérica y Caribe", cuba: "Centroamérica y Caribe",
  españa: "Europa", francia: "Europa", alemania: "Europa", italia: "Europa", "reino unido": "Europa", portugal: "Europa", suiza: "Europa", bélgica: "Europa", "países bajos": "Europa", suecia: "Europa", noruega: "Europa", ucrania: "Europa", rusia: "Europa y Asia",
  china: "Asia", japón: "Asia", india: "Asia", "corea del sur": "Asia", singapur: "Asia", turquía: "Europa y Asia",
  israel: "Oriente Medio", catar: "Oriente Medio", "arabia saudita": "Oriente Medio", "emiratos árabes unidos": "Oriente Medio",
  australia: "Oceanía",
};

const COUNTRY_FLAGS: Record<string, string> = {
  colombia: "🇨🇴", argentina: "🇦🇷", brasil: "🇧🇷", chile: "🇨🇱", ecuador: "🇪🇨", perú: "🇵🇪", venezuela: "🇻🇪", uruguay: "🇺🇾", paraguay: "🇵🇾", bolivia: "🇧🇴",
  "estados unidos": "🇺🇸", méxico: "🇲🇽", canadá: "🇨🇦", "costa rica": "🇨🇷", panamá: "🇵🇦", guatemala: "🇬🇹", cuba: "🇨🇺",
  españa: "🇪🇸", francia: "🇫🇷", alemania: "🇩🇪", italia: "🇮🇹", "reino unido": "🇬🇧", portugal: "🇵🇹", suiza: "🇨🇭", bélgica: "🇧🇪", "países bajos": "🇳🇱", suecia: "🇸🇪", noruega: "🇳🇴", ucrania: "🇺🇦", rusia: "🇷🇺",
  china: "🇨🇳", japón: "🇯🇵", india: "🇮🇳", "corea del sur": "🇰🇷", singapur: "🇸🇬", turquía: "🇹🇷", israel: "🇮🇱", catar: "🇶🇦", "arabia saudita": "🇸🇦", "emiratos árabes unidos": "🇦🇪", australia: "🇦🇺",
};

const topology = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry>;
const projection = geoNaturalEarth1().scale(154).translate([480, 250]);
const mapPath = geoPath(projection);
const graticulePath = mapPath(geoGraticule10());

function dayInColombia(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function projectedPoint(item: NewsPoint, index: number): [number, number] | null {
  const country = (item.country ?? "").trim().toLocaleLowerCase("es");
  const coordinate = COUNTRY_COORDINATES[country] ?? (item.scope === "Nacional" ? COUNTRY_COORDINATES.colombia : null);
  if (!coordinate) return null;
  const point = projection(coordinate);
  if (!point) return null;
  const angle = index * 2.399;
  const radius = Math.min(12, 2 + Math.floor(index / 5) * 2);
  return [point[0] + Math.cos(angle) * radius, point[1] + Math.sin(angle) * radius];
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
  const publications = useMemo<Publication[]>(() => {
    const today = dayInColombia(new Date().toISOString());
    return items.filter((item) => dayInColombia(item.publishedAt) === today).flatMap((item) =>
      (item.sources?.length ? item.sources : [{ source: item.source, url: item.url }]).map((source) => ({ ...item, ...source })),
    );
  }, [items]);
  const sources = useMemo(() => Array.from(new Map(publications.map((item) => [item.source.toLocaleLowerCase("es"), item])).values()), [publications]);
  const hierarchy = useMemo(() => {
    const continents = new Map<string, Map<string, Map<string, Publication[]>>>();
    publications.forEach((item) => {
      const country = item.country || (item.scope === "Nacional" ? "Colombia" : "Pendiente de clasificación geográfica");
      const continent = COUNTRY_CONTINENTS[country.toLocaleLowerCase("es")] ?? "Otros territorios";
      if (!continents.has(continent)) continents.set(continent, new Map());
      const countries = continents.get(continent)!;
      if (!countries.has(country)) countries.set(country, new Map());
      const media = countries.get(country)!;
      const mediumKey = item.source.toLocaleLowerCase("es");
      media.set(mediumKey, [...(media.get(mediumKey) ?? []), item]);
    });
    return [...continents].map(([continent, countries]) => ({
      continent,
      countries: [...countries].map(([country, media]) => ({ country, media: [...media.values()].map((news) => ({ source: news[0].source, news })).sort((a, b) => b.news.length - a.news.length || a.source.localeCompare(b.source, "es")) })).sort((a, b) => b.media.length - a.media.length || a.country.localeCompare(b.country, "es")),
      count: [...countries.values()].reduce((sum, media) => sum + media.size, 0),
    })).sort((a, b) => b.count - a.count || a.continent.localeCompare(b.continent, "es"));
  }, [publications]);

  return <section className="world-today section-shell" aria-labelledby="world-today-title">
    <div className="world-today-heading"><div><p className="section-kicker">RADAR HORARIO</p><h2 id="world-today-title">Lo que habla el mundo hoy</h2><p>Medios identificados que publicaron hoy sobre el mandatario. La ubicación representa el país asociado al medio, no el lugar donde ocurrió el hecho.</p></div><span className="update-pill"><i /> Actualización global cada hora</span></div>
    <div className="world-map-layout">
      <figure className="world-map-figure">
        <svg viewBox="0 0 960 500" role="img" aria-label={`Mapamundi con ${sources.length} medios detectados hoy`}>
          <path className="world-sphere" d={mapPath({ type: "Sphere" }) ?? undefined} />
          <path className="world-grid" d={graticulePath ?? undefined} />
          <g className="world-land">{countries.features.map((country, index) => <path key={String(country.id ?? index)} d={mapPath(country) ?? undefined} />)}</g>
          {sources.map((item, index) => { const point = projectedPoint(item, index); if (!point) return null; const [x, y] = point; return <g className="world-point" key={`${item.source}-${item.url}`} transform={`translate(${x} ${y})`}><circle r="11" /><circle r="3.5" /><title>{item.source} · {item.country || item.scope}: {item.title}</title></g>; })}
        </svg>
        <figcaption><Clock3 size={14} />Actualización cada hora · {lastUpdate ? `último barrido ${new Date(lastUpdate).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" })}` : "esperando el primer barrido"}</figcaption>
      </figure>
      <div className="world-source-list"><strong>{sources.length}</strong><span>medios con publicaciones hoy</span>{sources.length ? <div className="world-source-tree">{hierarchy.map((group) => <details key={group.continent} open={hierarchy.length === 1}><summary><span>{group.continent}</span><strong>{group.count}</strong></summary><div>{group.countries.map((country) => <details key={country.country} open={group.countries.length === 1}><summary><span className="country-summary"><i aria-hidden="true">{COUNTRY_FLAGS[country.country.toLocaleLowerCase("es")] ?? "🌐"}</i>{country.country}</span><strong>{country.media.length}</strong></summary><ol>{country.media.map((medium) => <li key={medium.source}>{medium.news.length === 1 ? <a href={medium.news[0].url} target="_blank" rel="noreferrer"><span>{medium.source}</span><small>1 noticia</small></a> : <details className="medium-news-group"><summary><span>{medium.source}</span><small>{medium.news.length} noticias</small></summary><div className="medium-news-links">{medium.news.map((news) => <a key={`${news.url}-${news.title}`} href={news.url} target="_blank" rel="noreferrer"><span>{news.title}</span><small>{new Date(news.publishedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" })}</small></a>)}</div></details>}</li>)}</ol></details>)}</div></details>)}</div> : <p>El radar todavía no detecta publicaciones fechadas hoy.</p>}</div>
    </div>
  </section>;
}
