"use client";

import { useEffect, useMemo, useState } from "react";
import { geoIdentity, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { ArrowLeft, ExternalLink, LocateFixed, Minus, Plus, RotateCcw } from "lucide-react";
import { campaignPromises } from "../data/campaign-promises";
import { executiveDecisions } from "../data/government-accountability";

type MunicipalityProperties = { DPTO_CCDGO: string; DPTO_CNMBRE?: string; MPIO_CCDGO?: string; MPIO_CNMBR?: string; MPIO_CDPMP?: string };
type MapFeature = Feature<Geometry, MunicipalityProperties>;
type MapData = FeatureCollection<Geometry, MunicipalityProperties> & { metadata?: { source: string; sourceUrl: string; note: string } };
type MunicipalityStat = { municipality: string; opinions: number; contributions: number };
type DepartmentStat = { department: string; opinions: number; contributions: number; municipalities: MunicipalityStat[] };
type TerritoryStats = { updatedAt: string; departments: DepartmentStat[]; totals: { opinions: number; contributions: number }; methodology: string };

const DEPARTMENTS: Record<string, string> = {
  "05":"Antioquia", "08":"Atlántico", "11":"Bogotá, D. C.", "13":"Bolívar", "15":"Boyacá", "17":"Caldas", "18":"Caquetá", "19":"Cauca", "20":"Cesar", "23":"Córdoba", "25":"Cundinamarca", "27":"Chocó", "41":"Huila", "44":"La Guajira", "47":"Magdalena", "50":"Meta", "52":"Nariño", "54":"Norte de Santander", "63":"Quindío", "66":"Risaralda", "68":"Santander", "70":"Sucre", "73":"Tolima", "76":"Valle del Cauca", "81":"Arauca", "85":"Casanare", "86":"Putumayo", "88":"San Andrés, Providencia y Santa Catalina", "91":"Amazonas", "94":"Guainía", "95":"Guaviare", "97":"Vaupés", "99":"Vichada",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/departamento de|distrito capital|d\. ?c\./g, "").replace(/[^a-z0-9]/g, "");
}

function departmentStats(stats: TerritoryStats | null, name: string) {
  const key = normalize(name);
  return stats?.departments.find((item) => normalize(item.department) === key || (key.startsWith("bogota") && normalize(item.department).startsWith("bogota"))) ?? null;
}

function municipalityStats(stats: DepartmentStat | null, name: string) {
  const key = normalize(name);
  return stats?.municipalities.find((item) => normalize(item.municipality) === key) ?? null;
}

export default function ColombiaTerritoryMap() {
  const [national, setNational] = useState<MapData | null>(null);
  const [detail, setDetail] = useState<MapData | null>(null);
  const [stats, setStats] = useState<TerritoryStats | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/geografia").then((response) => response.ok ? response.json() : Promise.reject()), fetch("/api/territorio").then((response) => response.json())])
      .then(([map, territorial]) => { setNational(map); setStats(territorial); }).catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;
    fetch(`/api/geografia?department=${selectedDepartment}`).then((response) => response.ok ? response.json() : Promise.reject()).then(setDetail).catch(() => setError(true));
  }, [selectedDepartment]);

  const nationalGroups = useMemo(() => {
    const groups = new Map<string, MapFeature[]>();
    for (const feature of national?.features ?? []) {
      const code = feature.properties?.DPTO_CCDGO;
      if (!code) continue;
      if (!groups.has(code)) groups.set(code, []);
      groups.get(code)!.push(feature as MapFeature);
    }
    return [...groups.entries()].sort((a, b) => (DEPARTMENTS[a[0]] ?? a[0]).localeCompare(DEPARTMENTS[b[0]] ?? b[0], "es"));
  }, [national]);

  const activeFeatures = useMemo(
    () => selectedDepartment
      ? (detail?.features as MapFeature[] ?? [])
      : (national?.features as MapFeature[] ?? []),
    [detail, national, selectedDepartment],
  );
  const selectedFeature = selectedMunicipality ? activeFeatures.find((feature) => feature.properties.MPIO_CDPMP === selectedMunicipality) : null;
  const projection = useMemo(() => {
    const target: FeatureCollection<Geometry> | Feature<Geometry> = selectedFeature ?? { type: "FeatureCollection", features: activeFeatures };
    return geoIdentity().reflectY(true).fitExtent([[26, 24], [734, 596]], target);
  }, [activeFeatures, selectedFeature]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const selectedDepartmentName = selectedDepartment ? DEPARTMENTS[selectedDepartment] : "Colombia";
  const selectedDepartmentStats = departmentStats(stats, selectedDepartmentName);
  const selectedMunicipalityFeature = selectedFeature as MapFeature | undefined;
  const selectedMunicipalityStats = selectedMunicipalityFeature ? municipalityStats(selectedDepartmentStats, selectedMunicipalityFeature.properties.MPIO_CNMBR ?? "") : null;
  const scopeTitle = selectedMunicipalityFeature?.properties.MPIO_CNMBR ?? selectedDepartmentName;
  const scopeOpinions = selectedMunicipalityFeature ? selectedMunicipalityStats?.opinions ?? 0 : selectedDepartment ? selectedDepartmentStats?.opinions ?? 0 : stats?.totals.opinions ?? 0;
  const scopeContributions = selectedMunicipalityFeature ? selectedMunicipalityStats?.contributions ?? 0 : selectedDepartment ? selectedDepartmentStats?.contributions ?? 0 : stats?.totals.contributions ?? 0;
  const mapMetadata = selectedDepartment ? detail?.metadata ?? national?.metadata : national?.metadata;

  function reset() { setSelectedDepartment(null); setSelectedMunicipality(null); setZoom(1); setError(false); }
  function chooseDepartment(code: string | null) { setSelectedDepartment(code); setSelectedMunicipality(null); setDetail(null); setZoom(1); setError(false); }

  return <section className="colombia-map-module">
    <div className="colombia-map-toolbar">
      <div><small>NIVEL DE CONSULTA</small><strong>{selectedMunicipalityFeature ? "Municipio" : selectedDepartment ? "Departamento" : "Nacional"}</strong></div>
      <label><span>Departamento</span><select value={selectedDepartment ?? ""} onChange={(event) => chooseDepartment(event.target.value || null)}><option value="">Toda Colombia</option>{Object.entries(DEPARTMENTS).sort((a,b) => a[1].localeCompare(b[1], "es")).map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label>
      {selectedDepartment && detail && <label><span>Municipio</span><select value={selectedMunicipality ?? ""} onChange={(event) => setSelectedMunicipality(event.target.value || null)}><option value="">Todos los municipios</option>{[...detail.features].sort((a,b) => String(a.properties?.MPIO_CNMBR).localeCompare(String(b.properties?.MPIO_CNMBR), "es")).map((feature) => <option value={String(feature.properties?.MPIO_CDPMP)} key={String(feature.properties?.MPIO_CDPMP)}>{String(feature.properties?.MPIO_CNMBR)}</option>)}</select></label>}
      <div className="colombia-zoom-controls"><button onClick={() => setZoom((value) => Math.min(3.5, value + .35))} aria-label="Acercar mapa"><Plus /></button><button onClick={() => setZoom((value) => Math.max(1, value - .35))} aria-label="Alejar mapa"><Minus /></button><button onClick={reset} aria-label="Restablecer mapa"><RotateCcw /></button></div>
    </div>

    <div className="colombia-map-layout">
      <figure className="colombia-map-canvas">
        {!national && !error && <div className="colombia-map-message">Cargando cartografía oficial…</div>}
        {error && !national && <div className="colombia-map-message"><strong>La cartografía no está disponible temporalmente.</strong><button onClick={() => location.reload()}>Intentar de nuevo</button></div>}
        {national && <svg viewBox="0 0 760 620" role="img" aria-label={`Mapa de ${scopeTitle}. Selecciona un territorio para consultar sus datos agregados.`}>
          <g transform={`translate(380 310) scale(${zoom}) translate(-380 -310)`}>
            {!selectedDepartment && nationalGroups.map(([code, features]) => {
              const name = DEPARTMENTS[code] ?? code; const count = departmentStats(stats, name); const collection: FeatureCollection<Geometry> = { type: "FeatureCollection", features };
              return <path key={code} d={path(collection) ?? undefined} className={`colombia-department ${count && count.opinions + count.contributions > 0 ? "has-data" : ""}`} onClick={() => chooseDepartment(code)}><title>{name} · {(count?.opinions ?? 0) + (count?.contributions ?? 0)} aportes públicos georreferenciados</title></path>;
            })}
            {selectedDepartment && activeFeatures.map((feature, index) => {
              const code = feature.properties.MPIO_CDPMP ?? `${selectedDepartment}-${index}`; const municipalityName = feature.properties.MPIO_CNMBR ?? "Municipio"; const count = municipalityStats(selectedDepartmentStats, municipalityName); const active = selectedMunicipality === code;
              return <path key={code} d={path(feature) ?? undefined} className={`colombia-municipality ${active ? "active" : ""} ${count && count.opinions + count.contributions > 0 ? "has-data" : ""}`} onClick={() => { if (feature.properties.MPIO_CDPMP) setSelectedMunicipality(feature.properties.MPIO_CDPMP); setZoom(1); }}><title>{municipalityName} · {(count?.opinions ?? 0) + (count?.contributions ?? 0)} aportes públicos georreferenciados</title></path>;
            })}
          </g>
        </svg>}
        <figcaption><span><i className="with-data" /> Con aportes públicos georreferenciados</span><span><i /> Sin registros aprobados</span></figcaption>
      </figure>

      <aside className="colombia-map-detail">
        <div className="map-breadcrumb">{selectedDepartment && <button onClick={reset}><ArrowLeft /> Colombia</button>}{selectedMunicipalityFeature && <button onClick={() => setSelectedMunicipality(null)}><ArrowLeft /> {selectedDepartmentName}</button>}</div>
        <LocateFixed />
        <small>{selectedMunicipalityFeature ? `Código DIVIPOLA ${selectedMunicipalityFeature.properties.MPIO_CDPMP}` : selectedDepartment ? `Código departamental ${selectedDepartment}` : "BALANCE NACIONAL"}</small>
        <h3>{scopeTitle}</h3>
        <div className="territorial-map-metrics"><article><strong>{scopeOpinions}</strong><span>opiniones aprobadas</span></article><article><strong>{scopeContributions}</strong><span>noticias aportadas</span></article>{!selectedDepartment && <><article><strong>{campaignPromises.length}</strong><span>promesas nacionales</span></article><article><strong>{executiveDecisions.length}</strong><span>decisiones estructuradas</span></article></>}</div>
        <p>{stats?.methodology ?? "Los datos territoriales se muestran únicamente cuando cuentan con ubicación declarada y aprobación editorial."}</p>
        {selectedDepartment && !scopeOpinions && !scopeContributions && <div className="map-empty-evidence"><strong>Sin registros territoriales aprobados.</strong><p>Esto no significa que no exista gestión ni actividad en el territorio; significa que el portal aún no tiene evidencia pública georreferenciada.</p></div>}
        <a href={mapMetadata?.sourceUrl} target="_blank" rel="noreferrer">Cartografía: {mapMetadata?.source ?? "DANE"} <ExternalLink /></a>
      </aside>
    </div>
    <p className="colombia-map-note">{mapMetadata?.note ?? "Los límites son de referencia."} Usa los selectores, haz clic en el mapa o emplea los controles +/− para acercarte.</p>
  </section>;
}
