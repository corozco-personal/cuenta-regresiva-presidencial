const DANE_MUNICIPAL_LAYER = "https://geoportal.dane.gov.co/mparcgis/rest/services/MGN2018/Serv_CapaMunicipiosInt_2018/MapServer/0/query";
const DANE_DEPARTMENT_LAYER = "https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_EntidadesTerritorialesyAM_SE/MapServer/3/query";

export async function GET(request: Request) {
  const department = new URL(request.url).searchParams.get("department")?.trim() ?? "";
  if (department && !/^\d{2}$/.test(department)) return Response.json({ error: "Código de departamento inválido." }, { status: 400 });

  const params = new URLSearchParams({
    where: department ? `DPTO_CCDGO='${department}'` : "1=1",
    outFields: department ? "DPTO_CCDGO,MPIO_CCDGO,MPIO_CNMBR,MPIO_CDPMP" : "DPTO_CCDGO,DPTO_CNMBRE",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    geometryPrecision: department ? "5" : "4",
    maxAllowableOffset: department ? "0.002" : "0.01",
  });

  try {
    const response = await fetch(`${department ? DANE_MUNICIPAL_LAYER : DANE_DEPARTMENT_LAYER}?${params}`, {
      headers: { "user-agent": "CuentaPublica-MapaTerritorial/1.0" },
      next: { revalidate: 2_592_000 },
    });
    if (!response.ok) throw new Error("dane-unavailable");
    const geojson = await response.json() as { type?: string; features?: unknown[] };
    if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) throw new Error("invalid-geojson");
    return Response.json({
      ...geojson,
      metadata: {
        source: department ? "DANE · Marco Geoestadístico Nacional 2018" : "DANE · División político-administrativa",
        sourceUrl: department ? "https://geoportal.dane.gov.co/mparcgis/rest/services/MGN2018/Serv_CapaMunicipiosInt_2018/MapServer/0" : "https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_EntidadesTerritorialesyAM_SE/MapServer/3",
        department: department || null,
        note: "Límites de referencia para visualización; no sustituyen la cartografía oficial vigente.",
      },
    }, { headers: { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=604800" } });
  } catch {
    return Response.json({ error: "La cartografía del DANE no está disponible temporalmente." }, { status: 503 });
  }
}
