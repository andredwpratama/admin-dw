import { db } from "../index";
import { datasets, genericData } from "../schema";
import { eq, desc, sql } from "drizzle-orm";

export async function createDataset(data: typeof datasets.$inferInsert) {
  const inserted = await db.insert(datasets).values(data).returning();
  return inserted[0];
}

export async function updateDataset(id: string, data: Partial<typeof datasets.$inferInsert>) {
  const updated = await db.update(datasets)
    .set(data)
    .where(eq(datasets.id, id))
    .returning();
  return updated[0];
}

export async function getDatasets() {
  return await db.query.datasets.findMany({
    orderBy: [desc(datasets.uploadedAt)],
  });
}

export async function getDatasetById(id: string) {
  return await db.query.datasets.findFirst({
    where: eq(datasets.id, id),
  });
}

export async function insertGenericDataBatch(rows: (typeof genericData.$inferInsert)[]) {
  if (rows.length === 0) return;
  // Insert in chunks of 100 to avoid SQLite variable limits
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await db.insert(genericData).values(chunk);
  }
}

export async function getDatasetData(datasetId: string, limit = 100, offset = 0) {
  return await db.query.genericData.findMany({
    where: eq(genericData.datasetId, datasetId),
    orderBy: [genericData.rowIndex],
    limit,
    offset,
  });
}

export async function getDatasetRowCount(datasetId: string) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(genericData)
    .where(eq(genericData.datasetId, datasetId));
  return result[0]?.count ?? 0;
}

export async function deleteDataset(id: string) {
  await db.delete(datasets).where(eq(datasets.id, id));
}
