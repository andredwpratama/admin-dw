import { db } from "../index";
import { insights } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function createInsight(data: typeof insights.$inferInsert) {
  const result = await db.insert(insights).values(data).returning();
  return result[0];
}

export async function updateInsight(id: string, data: Partial<typeof insights.$inferInsert>) {
  const result = await db
    .update(insights)
    .set(data)
    .where(eq(insights.id, id))
    .returning();
  return result[0];
}

export async function listInsights(limit = 20) {
  return await db.query.insights.findMany({
    orderBy: [desc(insights.generatedAt)],
    limit,
  });
}

export async function getInsightById(id: string) {
  return await db.query.insights.findFirst({
    where: eq(insights.id, id),
  });
}
