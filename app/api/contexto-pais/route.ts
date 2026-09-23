type Indicator = {
  id: string; label: string; value: number; unit: string; period: string; frequency: string;
  comparison?: { label: string; value: number; direction: "up" | "down" | "flat" };
  detail: string; source: string; url: string; category: "Precios" | "Empleo" | "Actividad" | "Bienestar" | "Mercados";
};

const DANE_URL = "https://www.dane.gov.co/";
const TRM_URL = "https://www.banrep.gov.co/es/glosario/tasa-cambio-trm";

const fallback: Indicator[] = [
  { id: "ipc-anual", label: "Inflación anual", value: 6.24, unit: "%", period: "Agosto de 2026", frequency: "Mensual", comparison: { label: "Agosto de 2025: 5,10%", value: 5.1, direction: "up" }, detail: "Variación anual del Índice de Precios al Consumidor.", source: "DANE · IPC", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc/ipc-informacion-tecnica", category: "Precios" },
  { id: "ipc-mensual", label: "Inflación mensual", value: 0.39, unit: "%", period: "Agosto de 2026", frequency: "Mensual", detail: "Variación del IPC frente al mes inmediatamente anterior.", source: "DANE · IPC", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc/ipc-informacion-tecnica", category: "Precios" },
  { id: "desocupacion", label: "Tasa de desocupación", value: 8.1, unit: "%", period: "Julio de 2026", frequency: "Mensual", comparison: { label: "Julio de 2025: 8,8%", value: 8.8, direction: "down" }, detail: "Porcentaje de la fuerza laboral que se encuentra desocupada.", source: "DANE · GEIH", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/mercado-laboral/empleo-y-desempleo", category: "Empleo" },
  { id: "ocupacion", label: "Tasa de ocupación", value: 59.5, unit: "%", period: "Julio de 2026", frequency: "Mensual", comparison: { label: "Julio de 2025: 58,9%", value: 58.9, direction: "up" }, detail: "Proporción de personas ocupadas dentro de la población en edad de trabajar.", source: "DANE · GEIH", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/mercado-laboral/empleo-y-desempleo", category: "Empleo" },
  { id: "pib", label: "PIB real", value: 3.5, unit: "%", period: "Segundo trimestre de 2026", frequency: "Trimestral", detail: "Variación anual preliminar del producto interno bruto en volumen.", source: "DANE · Cuentas nacionales", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/cuentas-nacionales/cuentas-nacionales-trimestrales/pib-informacion-tecnica", category: "Actividad" },
  { id: "ipp", label: "Precios al productor", value: -0.33, unit: "%", period: "Agosto de 2026", frequency: "Mensual", detail: "Variación mensual del Índice de Precios del Productor.", source: "DANE · IPP", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-del-productor-ipp", category: "Precios" },
  { id: "pobreza", label: "Pobreza monetaria", value: 24.6, unit: "%", period: "2025", frequency: "Anual", detail: "Porcentaje de población bajo la línea oficial de pobreza monetaria.", source: "DANE · Pobreza", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-monetaria", category: "Bienestar" },
  { id: "internet", label: "Hogares con internet", value: 65.6, unit: "%", period: "2024", frequency: "Anual", detail: "Proporción nacional de hogares con conexión a internet.", source: "DANE · Calidad de vida", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/salud/calidad-de-vida-ecv", category: "Bienestar" },
  { id: "trm", label: "TRM", value: 3192.53, unit: "COP/USD", period: "22 de septiembre de 2026", frequency: "Diaria", detail: "Pesos colombianos por dólar de Estados Unidos.", source: "Banco de la República", url: TRM_URL, category: "Mercados" },
];

function numberFrom(match: RegExpMatchArray | null) {
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  const indicators = fallback.map((item) => ({ ...item }));
  const notes: string[] = [];
  try {
    const [daneResponse, trmResponse] = await Promise.all([
      fetch(DANE_URL, { headers: { "user-agent": "CuentaPublica-Indicadores/1.0" }, cf: { cacheTtl: 3600, cacheEverything: true } }),
      fetch(TRM_URL, { headers: { "user-agent": "CuentaPublica-Indicadores/1.0" }, cf: { cacheTtl: 3600, cacheEverything: true } }),
    ]);
    if (daneResponse.ok) {
      const text = (await daneResponse.text()).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
      const values: Record<string, number | null> = {
        "ipc-mensual": numberFrom(text.match(/variaci[oó]n mensual[^%]{0,80}?([+-]?\d+[,.]\d+)\s*%/i)),
        desocupacion: numberFrom(text.match(/tasa de desocupaci[oó]n[^%]{0,100}?([+-]?\d+[,.]\d+)\s*%/i)),
        ocupacion: numberFrom(text.match(/tasa de ocupaci[oó]n[^%]{0,100}?([+-]?\d+[,.]\d+)\s*%/i)),
        pobreza: numberFrom(text.match(/pobreza monetaria[^%]{0,100}?([+-]?\d+[,.]\d+)\s*%/i)),
      };
      for (const indicator of indicators) if (values[indicator.id] !== null && values[indicator.id] !== undefined) indicator.value = values[indicator.id]!;
    } else notes.push("DANE no respondió durante este barrido; se conservó el último dato verificado.");
    if (trmResponse.ok) {
      const text = (await trmResponse.text()).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
      const value = numberFrom(text.match(/([0-9]{1,2}[.]?[0-9]{3},[0-9]{2})\s*(?:Pesos por d[oó]lar|COP)/i));
      if (value) indicators.find((item) => item.id === "trm")!.value = value;
    } else notes.push("Banco de la República no respondió durante este barrido; se conservó el último dato verificado.");
  } catch { notes.push("Una fuente oficial no respondió; los valores mostrados corresponden al último corte verificado."); }
  return Response.json({ updatedAt: new Date().toISOString(), indicators, notes, methodology: "Las cifras describen el contexto del país. No atribuyen causalidad automática al Gobierno ni sustituyen las publicaciones oficiales." }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
