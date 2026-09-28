import { dataRefreshRuns } from "../../db/schema";
import { getDb } from "../../db";
import { eq } from "drizzle-orm";

export type RefreshKey = "indicadores" | "territorio" | "congreso" | "gabinete" | "gestion";

const LABELS: Record<RefreshKey, string> = {
  indicadores: "Indicadores oficiales",
  territorio: "Mapa territorial",
  congreso: "Agenda legislativa",
  gabinete: "Gabinete y altos cargos",
  gestion: "Tablero de gestión",
};

export async function recordRefreshStart(key: RefreshKey, cadence = "Diario · 00:05 Colombia") {
  const now = new Date().toISOString();
  await getDb().insert(dataRefreshRuns).values({
    key,
    label: LABELS[key],
    cadence,
    status: "running",
    lastStartedAt: now,
    lastCompletedAt: null,
    lastSuccessAt: null,
    recordCount: null,
    error: null,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: dataRefreshRuns.key,
    set: { label: LABELS[key], cadence, status: "running", lastStartedAt: now, error: null, updatedAt: now },
  });
}

export async function recordRefreshEnd(key: RefreshKey, input: { ok: boolean; recordCount?: number | null; error?: string | null }) {
  const now = new Date().toISOString();
  await getDb().update(dataRefreshRuns).set({
    status: input.ok ? "success" : "failed",
    lastCompletedAt: now,
    lastSuccessAt: input.ok ? now : undefined,
    recordCount: input.recordCount ?? null,
    error: input.error?.slice(0, 500) ?? null,
    updatedAt: now,
  }).where(eq(dataRefreshRuns.key, key));
}

export async function getRefreshRun(key: RefreshKey) {
  const [row] = await getDb().select().from(dataRefreshRuns).where(eq(dataRefreshRuns.key, key)).limit(1);
  return row ?? null;
}
