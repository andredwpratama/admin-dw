import { db } from "@/lib/db";
import { campaigns, metrics, datasets, genericData } from "@/lib/db/schema";
import { eq, and, sql, between, desc, avg, sum } from "drizzle-orm";

export const adTools = [
  {
    type: "function" as const,
    function: {
      name: "query_campaigns",
      description: "Get campaigns with aggregated performance metrics for a date range. Call this for any question about campaign performance, spend, CTR, CPA, ROAS, or conversions.",
      parameters: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            enum: ["meta", "google", "linkedin", "tiktok", "all"],
            description: "Filter by platform. Use 'all' if not specified."
          },
          status: {
            type: "string",
            enum: ["active", "paused", "ended", "all"],
            description: "Filter by status. Use 'all' if not specified."
          },
          dateStart: { type: "string", description: "YYYY-MM-DD. Use the default from context if not specified by user." },
          dateEnd: { type: "string", description: "YYYY-MM-DD. Use today if not specified." },
          sortBy: {
            type: "string",
            enum: ["spend", "cpa", "ctr", "conversions", "roas"],
            description: "Sort campaigns by this metric descending"
          },
          limit: { type: "number", description: "Max campaigns to return (default 20)" }
        },
        required: ["dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_campaign_metrics",
      description: "Get day-by-day metrics for a specific campaign. Use this for trend analysis or to see how a campaign changed over time.",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "string", description: "The campaign ID from query_campaigns" },
          dateStart: { type: "string", description: "YYYY-MM-DD" },
          dateEnd: { type: "string", description: "YYYY-MM-DD" }
        },
        required: ["campaignId", "dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "detect_anomalies",
      description: "Find campaigns with unusual metric spikes or drops compared to their own historical average. Use for 'what's unusual' or 'any anomalies' questions.",
      parameters: {
        type: "object",
        properties: {
          metric: {
            type: "string",
            enum: ["cpa", "ctr", "spend", "conversions"],
            description: "Which metric to check for anomalies"
          },
          thresholdPercent: {
            type: "number",
            description: "Flag if deviation exceeds this %. Default 30."
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
      description: "Get total spend, conversions, average CTR/CPA across all campaigns. Perfect for overview questions or when user asks 'how am I doing overall'.",
      parameters: {
        type: "object",
        properties: {
          dateStart: { type: "string" },
          dateEnd: { type: "string" },
          groupBy: {
            type: "string",
            enum: ["platform", "none"],
            description: "Group by platform to compare channels, or 'none' for overall totals"
          }
        },
        required: ["dateStart", "dateEnd"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "list_datasets",
      description: "List all CSV datasets uploaded by the user — their names, columns, and row counts. Call this first when user asks about uploaded data, custom CSV files, or their own datasets.",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "query_dataset",
      description: "Read rows from an uploaded CSV dataset. Use the dataset ID from list_datasets. Returns actual row data you can analyze.",
      parameters: {
        type: "object",
        properties: {
          datasetId: { type: "string", description: "Dataset ID from list_datasets" },
          limit: { type: "number", description: "Max rows (default 100, max 500)" },
          offset: { type: "number", description: "Skip first N rows for pagination" }
        },
        required: ["datasetId"]
      }
    }
  }
];

export async function executeTool(name: string, args: any) {
  switch (name) {
    case "query_campaigns":      return await queryCampaigns(args);
    case "get_campaign_metrics": return await getCampaignMetrics(args);
    case "detect_anomalies":     return await detectAnomalies(args);
    case "get_summary_metrics":  return await getSummaryMetrics(args);
    case "list_datasets":        return await listDatasets();
    case "query_dataset":        return await queryDataset(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function queryCampaigns(args: any) {
  const rows = await db
    .select({
      id: campaigns.id,
      name: campaigns.campaignName,
      platform: campaigns.platform,
      status: campaigns.status,
      totalSpend: sum(metrics.spend),
      totalConversions: sum(metrics.conversions),
      totalClicks: sum(metrics.clicks),
      totalImpressions: sum(metrics.impressions),
      avgCtr: avg(metrics.ctr),
      avgCpa: avg(metrics.cpa),
      avgRoas: avg(metrics.roas),
    })
    .from(campaigns)
    .innerJoin(metrics, eq(campaigns.id, metrics.campaignId))
    .where(
      and(
        between(metrics.date, args.dateStart, args.dateEnd),
        args.platform && args.platform !== "all" ? eq(campaigns.platform, args.platform) : undefined,
        args.status && args.status !== "all" ? eq(campaigns.status, args.status) : undefined,
      )
    )
    .groupBy(campaigns.id, campaigns.campaignName, campaigns.platform, campaigns.status)
    .limit(args.limit || 20);

  return rows;
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
  // Get all campaigns for the period
  const campaignData = await queryCampaigns({ ...args, platform: "all", status: "all" });
  const threshold = args.thresholdPercent ?? 30;

  // Compute mean of the chosen metric
  const values = campaignData
    .map((c: any) => parseFloat(c[`avg${args.metric.charAt(0).toUpperCase() + args.metric.slice(1)}`] ?? c[`total${args.metric.charAt(0).toUpperCase() + args.metric.slice(1)}`] ?? 0))
    .filter((v: number) => v > 0);

  if (values.length === 0) return [];

  const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;

  return campaignData.filter((c: any) => {
    const val = parseFloat(c[`avg${args.metric.charAt(0).toUpperCase() + args.metric.slice(1)}`] ?? c[`total${args.metric.charAt(0).toUpperCase() + args.metric.slice(1)}`] ?? 0);
    return Math.abs(val - mean) / mean * 100 > threshold;
  }).map((c: any) => ({
    ...c,
    anomalyMetric: args.metric,
    meanValue: mean,
    deviationPercent: ((parseFloat(c[`avg${args.metric.charAt(0).toUpperCase() + args.metric.slice(1)}`] ?? 0) - mean) / mean * 100).toFixed(1),
  }));
}

async function getSummaryMetrics(args: any) {
  const q = db
    .select({
      platform: args.groupBy === "platform" ? campaigns.platform : sql<string>`'all'`,
      totalSpend: sum(metrics.spend),
      totalConversions: sum(metrics.conversions),
      totalClicks: sum(metrics.clicks),
      totalImpressions: sum(metrics.impressions),
      avgCtr: avg(metrics.ctr),
      avgCpa: avg(metrics.cpa),
      avgRoas: avg(metrics.roas),
    })
    .from(metrics)
    .innerJoin(campaigns, eq(metrics.campaignId, campaigns.id))
    .where(between(metrics.date, args.dateStart, args.dateEnd));

  if (args.groupBy === "platform") {
    q.groupBy(campaigns.platform);
  }

  return await q;
}

async function listDatasets() {
  const rows = await db
    .select({
      id: datasets.id,
      name: datasets.name,
      fileName: datasets.fileName,
      columns: datasets.columns,
      rowCount: datasets.rowCount,
      uploadedAt: datasets.uploadedAt,
      status: datasets.status,
    })
    .from(datasets)
    .orderBy(desc(datasets.uploadedAt))
    .limit(20);

  return rows.map(d => ({
    ...d,
    columns: JSON.parse(d.columns) as string[],
  }));
}

async function queryDataset(args: { datasetId: string; limit?: number; offset?: number }) {
  const rows = await db
    .select({ rowIndex: genericData.rowIndex, data: genericData.data })
    .from(genericData)
    .where(eq(genericData.datasetId, args.datasetId))
    .orderBy(genericData.rowIndex)
    .limit(Math.min(args.limit ?? 100, 500))
    .offset(args.offset ?? 0);

  return rows.map(r => JSON.parse(r.data));
}
