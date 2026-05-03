import { db } from "../index";
import { campaigns, metrics, csvUploads } from "../schema";
import { eq, and, sql } from "drizzle-orm";
import { ParsedMetricRow } from "@/lib/types";

export async function upsertCampaign(data: Partial<typeof campaigns.$inferInsert>) {
  if (!data.campaignId || !data.platform) throw new Error("Missing campaignId or platform");

  const existing = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.campaignId, data.campaignId),
      eq(campaigns.platform, data.platform)
    ),
  });

  if (existing) {
    const updated = await db.update(campaigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, existing.id))
      .returning();
    return updated[0];
  }

  const inserted = await db.insert(campaigns)
    .values(data as typeof campaigns.$inferInsert)
    .returning();
  return inserted[0];
}

export async function upsertMetrics(data: Partial<typeof metrics.$inferInsert>) {
  if (!data.campaignId || !data.date) throw new Error("Missing campaignId or date");

  const existing = await db.query.metrics.findFirst({
    where: and(
      eq(metrics.campaignId, data.campaignId),
      eq(metrics.date, data.date)
    ),
  });

  if (existing) {
    const updated = await db.update(metrics)
      .set(data)
      .where(eq(metrics.id, existing.id))
      .returning();
    return updated[0];
  }

  const inserted = await db.insert(metrics)
    .values(data as typeof metrics.$inferInsert)
    .returning();
  return inserted[0];
}

export async function createUploadRecord(data: typeof csvUploads.$inferInsert) {
  const inserted = await db.insert(csvUploads).values(data).returning();
  return inserted[0];
}

export async function updateUploadRecord(id: string, data: Partial<typeof csvUploads.$inferInsert>) {
  const updated = await db.update(csvUploads)
    .set(data)
    .where(eq(csvUploads.id, id))
    .returning();
  return updated[0];
}
