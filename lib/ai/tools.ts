import { db } from "@/lib/db";
import { campaigns, metrics } from "@/lib/db/schema";
import { eq, and, sql, between, desc, avg, sum } from "drizzle-orm";

export const adTools = [
  {
    type: "function" as const,
    function: {
      name: "query_campaigns",
      description: "Get list of campaigns with their aggregated performance metrics for a date range",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            enum: ["meta", "google", "linkedin", "tiktok", "all"],
            description: "Filter by ad platform"
          },
          status: {
            type: "string",
            enum: ["active", "paused", "ended", "all"]
          },
          dateStart: { type: "string", description: "YYYY-MM-DD" },
          dateEnd: { type: "string", description: "YYYY-MM-DD" },
          sortBy: {
            type: "string",
            enum: ["spend", "cpa", "ctr", "conversions", "roas"]
          },
          limit: { type: "number" }
        },
        required: ["dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_campaign_metrics",
      description: "Get day-by-day metrics for a specific campaign",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "string" },
          dateStart: { type: "string" },
          dateEnd: { type: "string" }
        },
        required: ["campaignId", "dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "detect_anomalies",
      description: "Find campaigns with unusual metric changes compared to their own historical average",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            enum: ["cpa", "ctr", "spend", "conversions"]
          },
          thresholdPercent: {
            type: "number",
            description: "Flag campaigns deviating more than this % from their average. E.g. 50 = 50%"
          },
          dateStart: { type: "string" },
          dateEnd: { type: "string" }
        },
        required: ["metric", "dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_summary_metrics",
      description: "Get aggregated totals and averages across all campaigns, optionally grouped by platform",
      parameters: {
        type: "object",
        properties: {
          dateStart: { type: "string" },
          dateEnd: { type: "string" },
          groupBy: {
            type: "string",
            enum: ["platform", "none"]
          }
        },
        required: ["dateStart", "dateEnd"]
      }
    }
  }
];

export async function executeTool(name: string, args: any) {
  switch (name) {
    case "query_campaigns":
      return await queryCampaigns(args);
    case "get_campaign_metrics":
      return await getCampaignMetrics(args);
    case "detect_anomalies":
      return await detectAnomalies(args);
    case "get_summary_metrics":
      return await getSummaryMetrics(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function queryCampaigns(args: any) {
  return await db
    .select({
      id: campaigns.id,
      name: campaigns.campaignName,
      platform: campaigns.platform,
      spend: sum(metrics.spend),
      conversions: sum(metrics.conversions),
      ctr: avg(metrics.ctr),
      cpa: avg(metrics.cpa),
      roas: avg(metrics.roas),
    })
    .from(campaigns)
    .innerJoin(metrics, eq(campaigns.id, metrics.campaignId))
    .where(
      and(
        between(metrics.date, args.dateStart, args.dateEnd),
        args.platform && args.platform !== "all" ? eq(campaigns.platform, args.platform) : undefined,
        args.status && args.status !== "all" ? eq(campaigns.status, args.status) : undefined
      )
    )
    .groupBy(campaigns.id)
    .limit(args.limit || 20);
}

async function getCampaignMetrics(args: any) {
  return await db
    .select()
    .from(metrics)
    .where(
      and(
        eq(metrics.campaignId, args.campaignId),
        between(metrics.date, args.dateStart, args.dateEnd)
      )
    )
    .orderBy(metrics.date);
}

async function detectAnomalies(args: any) {
  // Simple anomaly detection: compare period avg vs campaign avg
  // In a real app, this would be more complex SQL or JS logic
  const campaignData = await queryCampaigns(args);
  return campaignData.filter((c: any) => {
    const val = c[args.metric];
    // Dummy logic for prototype
    return val > 0; 
  });
}

async function getSummaryMetrics(args: any) {
  const query = db
    .select({
      platform: args.groupBy === "platform" ? campaigns.platform : sql`'all'`,
      totalSpend: sum(metrics.spend),
      avgCtr: avg(metrics.ctr),
      totalConversions: sum(metrics.conversions),
    })
    .from(metrics)
    .innerJoin(campaigns, eq(metrics.campaignId, campaigns.id))
    .where(between(metrics.date, args.dateStart, args.dateEnd));

  if (args.groupBy === "platform") {
    query.groupBy(campaigns.platform);
  }

  return await query;
}
