import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { newsSubmissions, opinions } from "../../../db/schema";

type Place = { department: string | null; municipality: string | null };

function clean(value: string | null) { return value?.trim() || null; }

function aggregate(opinionRows: Array<Place & { stance: string }>, submissionRows: Place[]) {
  const departments = new Map<string, { department: string; opinions: number; contributions: number; municipalities: Map<string, { municipality: string; opinions: number; contributions: number }> }>();
  const ensure = (department: string, municipality: string | null) => {
    const departmentKey = department.toLocaleLowerCase("es");
    if (!departments.has(departmentKey)) departments.set(departmentKey, { department, opinions: 0, contributions: 0, municipalities: new Map() });
    const entry = departments.get(departmentKey)!;
    if (municipality) {
      const municipalityKey = municipality.toLocaleLowerCase("es");
      if (!entry.municipalities.has(municipalityKey)) entry.municipalities.set(municipalityKey, { municipality, opinions: 0, contributions: 0 });
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
  return [...departments.values()].map((entry) => ({ ...entry, municipalities: [...entry.municipalities.values()] }));
}

export async function GET() {
  try {
    const db = getDb();
    const [opinionRows, submissionRows] = await Promise.all([
      db.select({ department: opinions.department, municipality: opinions.municipality, stance: opinions.stance }).from(opinions).where(eq(opinions.status, "approved_manual")),
      db.select({ department: newsSubmissions.department, municipality: newsSubmissions.municipality }).from(newsSubmissions).where(eq(newsSubmissions.status, "approved_manual")),
    ]);
    const departments = aggregate(opinionRows, submissionRows);
    return Response.json({ updatedAt: new Date().toISOString(), departments, totals: { opinions: opinionRows.length, contributions: submissionRows.length }, methodology: "Solo incluye aportes públicos aprobados que declararon departamento o municipio. Ausencia de registros no significa ausencia de gestión." }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
  } catch {
    return Response.json({ updatedAt: new Date().toISOString(), departments: [], totals: { opinions: 0, contributions: 0 }, methodology: "Los datos territoriales no están disponibles temporalmente." }, { status: 200 });
  }
}
