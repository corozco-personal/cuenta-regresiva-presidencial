import { getDb } from "../../../db";
import { newsSubmissions, opinions } from "../../../db/schema";
import { looksAutomatedOpinion } from "../../data/opinion-moderation";

export async function GET() {
  try {
    const db = getDb();
    const [opinionRows, submissionRows] = await Promise.all([
      db.select({ stance: opinions.stance, status: opinions.status, country: opinions.country, comment: opinions.comment, createdAt: opinions.createdAt }).from(opinions),
      db.select({ status: newsSubmissions.status, reliability: newsSubmissions.reliability, createdAt: newsSubmissions.createdAt }).from(newsSubmissions),
    ]);

    const stances = { favorable: 0, unfavorable: 0, neutral: 0, mixed: 0 };
    const moderation = { published: 0, filtered: 0 };
    const countries = new Map<string, number>();
    const validOpinionRows = opinionRows.filter((row) => !looksAutomatedOpinion(row.comment));
    for (const row of validOpinionRows) {
      if (row.stance === "A favor") stances.favorable += 1;
      else if (row.stance === "En contra") stances.unfavorable += 1;
      else if (row.stance === "Mixta") stances.mixed += 1;
      else stances.neutral += 1;
      if (row.status === "filtered") moderation.filtered += 1;
      else moderation.published += 1;
      countries.set(row.country, (countries.get(row.country) ?? 0) + 1);
    }

    const contributions = { publishable: 0, review: 0, rejected: 0 };
    for (const row of submissionRows) {
      if (row.status === "publishable") contributions.publishable += 1;
      else if (row.status === "review") contributions.review += 1;
      else contributions.rejected += 1;
    }

    return Response.json({
      updatedAt: new Date().toISOString(),
      opinions: { total: validOpinionRows.length, stances, moderation },
      contributions: { total: submissionRows.length, statuses: contributions },
      geography: [...countries.entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => ({ country, count })),
    });
  } catch {
    return Response.json({ error: "Los indicadores no están disponibles temporalmente." }, { status: 503 });
  }
}
