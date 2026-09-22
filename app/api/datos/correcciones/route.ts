import { correctionLog } from "../../../data/corrections";
export async function GET() { return Response.json({ license: "CC BY 4.0", generatedAt: new Date().toISOString(), count: correctionLog.length, data: correctionLog }); }
