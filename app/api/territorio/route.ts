import { desc, eq, gte } from "drizzle-orm";
import { getDb } from "../../../db";
import { newsArticles, newsSubmissions, opinions } from "../../../db/schema";
import { getRefreshRun } from "../../data/refresh-runs";

type Place = { department: string | null; municipality: string | null };

function clean(value: string | null) { return value?.trim() || null; }

const DEPARTMENTS = ["Antioquia","Atlántico","Bogotá","Bolívar","Boyacá","Caldas","Caquetá","Cauca","Cesar","Córdoba","Cundinamarca","Chocó","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Quindío","Risaralda","Santander","Sucre","Tolima","Valle del Cauca","Arauca","Casanare","Putumayo","San Andrés","Amazonas","Guainía","Guaviare","Vaupés","Vichada"];

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function aggregate(opinionRows: Array<Place & { stance: string }>, submissionRows: Place[], articleRows: Array<{ title: string; category: string }>) {
  const departments = new Map<string, { department: string; opinions: number; contributions: number; mentions: number; municipalities: Map<string, { municipality: string; opinions: number; contributions: number; mentions: number }> }>();
  const ensure = (department: string, municipality: string | null) => {
    const departmentKey = department.toLocaleLowerCase("es");
    if (!departments.has(departmentKey)) departments.set(departmentKey, { department, opinions: 0, contributions: 0, mentions: 0, municipalities: new Map() });
    const entry = departments.get(departmentKey)!;
    if (municipality) {
      const municipalityKey = municipality.toLocaleLowerCase("es");
      if (!entry.municipalities.has(municipalityKey)) entry.municipalities.set(municipalityKey, { municipality, opinions: 0, contributions: 0, mentions: 0 });
    }
    return { entry, municipality: municipality ? entry.municipalities.get(municipality.toLocaleLowerCase("es"))! : null };
  };
  for (const row of opinionRows) {
    const department = clean(row.department); if (!department) continue;
    const target = ensure(department, clean(row.municipality)); target.entry.opinions += 1; if (target.municipality) target.municipality.opinions += 1;
  }
  for (const row of submissionRows) {
    const department = clean(row.department); if (!department) continue;
    const target = ensure(department, clean(row.municipality)); target.entry.contributions += 1; if (target.municipality) target.municipality.contributions += 1;
  }
  const knownMunicipalities = [...departments.values()].flatMap((entry) => [...entry.municipalities.values()].map((item) => ({ department: entry.department, municipality: item.municipality, key: normalizeText(item.municipality) })));
  for (const row of articleRows) {
    const text = normalizeText(`${row.title} ${row.category}`);
    for (const department of DEPARTMENTS) {
      if (!new RegExp(`\\b${normalizeText(department).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)) continue;
      ensure(department, null).entry.mentions += 1;
    }
    for (const place of knownMunicipalities) {
      if (!place.key || !new RegExp(`\\b${place.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)) continue;
      const target = ensure(place.department, place.municipality);
      target.entry.mentions += 1;
      if (target.municipality) target.municipality.mentions += 1;
    }
  }
  return [...departments.values()].map((entry) => ({ ...entry, municipalities: [...entry.municipalities.values()] }));
}

export async function GET() {
  try {
    const db = getDb();
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const [opinionRows, submissionRows, articleRows, refresh] = await Promise.all([
      db.select({ department: opinions.department, municipality: opinions.municipality, stance: opinions.stance }).from(opinions).where(eq(opinions.status, "approved_manual")),
      db.select({ department: newsSubmissions.department, municipality: newsSubmissions.municipality }).from(newsSubmissions).where(eq(newsSubmissions.status, "approved_manual")),
      db.select({ title: newsArticles.title, category: newsArticles.category }).from(newsArticles).where(gte(newsArticles.publishedAt, since)).orderBy(desc(newsArticles.publishedAt)).limit(300),
      getRefreshRun("territorio"),
    ]);
    const departments = aggregate(opinionRows, submissionRows, articleRows);
    const mentions = departments.reduce((sum, item) => sum + item.mentions, 0);
    return Response.json({ updatedAt: refresh?.lastSuccessAt ?? new Date().toISOString(), refresh, departments, totals: { opinions: opinionRows.length, contributions: submissionRows.length, mentions }, methodology: "Incluye aportes públicos aprobados con ubicación declarada y menciones territoriales detectadas en noticias verificadas de los últimos 30 días. Una mención no equivale a ejecución ni inversión." }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
  } catch {
    return Response.json({ updatedAt: new Date().toISOString(), departments: [], totals: { opinions: 0, contributions: 0 }, methodology: "Los datos territoriales no están disponibles temporalmente." }, { status: 200 });
  }
}
