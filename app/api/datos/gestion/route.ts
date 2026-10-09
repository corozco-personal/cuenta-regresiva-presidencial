import { buildGovernmentAccountabilitySnapshot } from "../../../data/government-accountability";
import { getRefreshRun, recordRefreshEnd, recordRefreshStart } from "../../../data/refresh-runs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isRefresh = url.searchParams.get("refresh") === "1";
  if (isRefresh) await recordRefreshStart("gestion");
  try {
    const refresh = await getRefreshRun("gestion");
    const snapshot = buildGovernmentAccountabilitySnapshot({
      generatedAt: new Date().toISOString(),
      lastRefreshAt: refresh?.lastSuccessAt ?? refresh?.lastCompletedAt ?? null,
      refresh,
    });
    if (isRefresh) {
      const recordCount = Object.values(snapshot.data).reduce((count, value) => count + (Array.isArray(value) ? value.length : 1), 0);
      await recordRefreshEnd("gestion", { ok: true, recordCount });
      const updatedRefresh = await getRefreshRun("gestion");
      return Response.json(buildGovernmentAccountabilitySnapshot({ generatedAt: new Date().toISOString(), lastRefreshAt: updatedRefresh?.lastSuccessAt ?? null, refresh: updatedRefresh }), { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(snapshot, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400" } });
  } catch (error) {
    if (isRefresh) await recordRefreshEnd("gestion", { ok: false, error: error instanceof Error ? error.message : "unknown" });
    return Response.json({ error: "No fue posible actualizar gestión.", detail: error instanceof Error ? error.message : "unknown" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
