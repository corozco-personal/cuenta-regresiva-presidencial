import { budgetOverview, cabinetRegistry, executiveDecisions, governmentAgenda, policyDossiers, territorialCoverage } from "../../../data/government-accountability";

export async function GET() {
  return Response.json({
    license: "CC BY 4.0",
    generatedAt: new Date().toISOString(),
    methodology: "Los conjuntos separan anuncios, documentos, presupuesto aprobado, ejecución y resultados. Los valores nulos representan datos no verificados.",
    data: { decisions: executiveDecisions, budget: budgetOverview, legislativeAgenda: governmentAgenda, cabinet: cabinetRegistry, dossiers: policyDossiers, territories: territorialCoverage },
  });
}
