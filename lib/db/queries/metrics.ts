import { db } from "../index";
import { campaigns, metrics } from "../schema";
import { eq, and, sql, between, desc } from "drizzle-orm";

export async function getSummaryMetrics(dateStart: string, dateEnd: string) {
  const result = await db
    .select({
      totalSpend: sql<number>`SUM(${metrics.spend})`,
      avgCtr: sql<number>`AVG(${metrics.ctr})`,
      totalConversions: sql<number>`SUM(${metrics.conversions})`,
      avgCpa: sql<number>`AVG(${metrics.cpa})`,
      totalImpressions: sql<number>`SUM(${metrics.impressions})`,
    })
    .from(metrics)
    .where(between(metrics.date, dateStart, dateEnd));

  return result[0];
}

export async function getSpendByPlatform(dateStart: string, dateEnd: string) {
  return await db
    .select({
      platform: campaigns.platform,
      spend: sql<number>`SUM(${metrics.spend})`,
    })
    .from(metrics)
    .innerJoin(campaigns, eq(metrics.campaignId, campaigns.id))
    .where(between(metrics.date, dateStart, dateEnd))
    .groupBy(campaigns.platform);
}

export async function getDailyTotals(dateStart: string, dateEnd: string) {
  return await db
    .select({
      date: metrics.date,
      spend: sql<number>`SUM(${metrics.spend})`,
    })
    .from(metrics)
    .where(between(metrics.date, dateStart, dateEnd))
    .groupBy(metrics.date)
    .orderBy(metrics.date);
}

export async function getCampaignTableData(filters: {
  dateStart: string;
  dateEnd: string;
  platform?: string;
  status?: string;
}) {
  const query = db
    .select({
      id: campaigns.id,
      name: campaigns.campaignName,
      platform: campaigns.platform,
      status: campaigns.status,
      spend: sql<number>`SUM(${metrics.spend})`,
      ctr: sql<number>`AVG(${metrics.ctr})`,
      cpc: sql<number>`AVG(${metrics.cpc})`,
      conversions: sql<number>`SUM(${metrics.conversions})`,
      cpa: sql<number>`AVG(${metrics.cpa})`,
      roas: sql<number>`AVG(${metrics.roas})`,
    })
    .from(campaigns)
    .innerJoin(metrics, eq(campaigns.id, metrics.campaignId))
    .where(
      and(
        between(metrics.date, filters.dateStart, filters.dateEnd),
        filters.platform && filters.platform !== "all" ? eq(campaigns.platform, filters.platform) : undefined,
        filters.status && filters.status !== "all" ? eq(campaigns.status, filters.status) : undefined
      )
    )
    .groupBy(campaigns.id)
    .orderBy(desc(sql`SUM(${metrics.spend})`));

  return await query;
}
