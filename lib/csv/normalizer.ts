import { ParsedMetricRow, ParseError } from "@/lib/types";
import { format } from "date-fns";
import { parseMetaCSV } from "./parsers/meta";
import { parseGoogleCSV } from "./parsers/google";
import { parseLinkedinCSV } from "./parsers/linkedin";

export function cleanNumber(val: string | number | undefined | null): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.-]/g, "")) || 0;
}

export function computeMetrics(row: Partial<ParsedMetricRow>): ParsedMetricRow {
  const impressions = cleanNumber(row.impressions);
  const clicks = cleanNumber(row.clicks);
  const spend = cleanNumber(row.spend);
  const conversions = cleanNumber(row.conversions);
  const revenue = cleanNumber(row.revenue);

  return {
    ...row,
    impressions,
    clicks,
    spend,
    conversions,
    revenue,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
    roas: spend > 0 ? revenue / spend : 0
  } as ParsedMetricRow;
}

const FIELD_MAPPINGS = {
  campaignId: ["Campaign ID", "campaign_id", "ID", "d_ID", "CampaignId", "External Customer ID", "Customer ID", "campaign"],
  campaignName: ["Campaign name", "Campaign Name", "Campaign", "Campaign_Name", "campaign_name", "campaign"],
  status: ["Status", "Delivery", "Campaign state", "status", "CampaignState", "State"],
  date: ["Day", "Reporting starts", "Ad_Date", "Date", "date", "ad_date", "day"],
  impressions: ["Impressions", "Impressions (all)", "impressions", "impr"],
  clicks: ["Clicks", "Clicks (all)", "clicks"],
  spend: ["Amount spent (IDR)", "Cost", "Spend", "Total Spent (IDR)", "spend", "cost", "Amount spent", "amount_spent"],
  conversions: ["Conversions", "Total Conversions", "Leads", "conversions", "leads", "Total_Conversions", "Conv.", "conversions_all"],
  revenue: ["Sale_Amount", "Revenue", "Total Revenue", "revenue", "sale_amount", "Total_Revenue", "Conv. value", "revenue_all"],
};

function findValueByAliases(rawRow: Record<string, unknown>, aliases: string[]): any {
  const keys = Object.keys(rawRow);
  const normalizedAliases = aliases.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ""));

  for (const key of keys) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedAliases.includes(normalizedKey)) {
      const val = rawRow[key];
      if (val !== undefined && val !== null && val !== "") {
        return val;
      }
    }
  }
  return undefined;
}

export function normalizeRows(platform: string, rawRows: Record<string, unknown>[]): { rows: ParsedMetricRow[], errors: ParseError[] } {
  // Use specialized parsers if available
  if (platform === "meta") {
    return parseMetaCSV(rawRows, platform);
  }
  if (platform === "google") {
    return parseGoogleCSV(rawRows, platform);
  }
  if (platform === "linkedin") {
    return parseLinkedinCSV(rawRows, platform);
  }

  // Fallback to generic normalizer
  const rows: ParsedMetricRow[] = [];
  const errors: ParseError[] = [];

  rawRows.forEach((rawRow, index) => {
    try {
      let campaignIdRaw = findValueByAliases(rawRow, FIELD_MAPPINGS.campaignId);
      
      // Fallback for campaignId: Use Campaign Name as ID if ID is missing
      if (campaignIdRaw === undefined || campaignIdRaw === null) {
        campaignIdRaw = findValueByAliases(rawRow, FIELD_MAPPINGS.campaignName);
      }
      
      if (campaignIdRaw === undefined || campaignIdRaw === null) return;
      const campaignId = String(campaignIdRaw).trim();
      if (!campaignId) return;

      const row: Partial<ParsedMetricRow> = {
        platform,
        campaignId,
        campaignName: (String(findValueByAliases(rawRow, FIELD_MAPPINGS.campaignName) || campaignId)).trim(),
        status: (String(findValueByAliases(rawRow, FIELD_MAPPINGS.status) || "active")).trim(),
        date: (String(findValueByAliases(rawRow, FIELD_MAPPINGS.date) || format(new Date(), "yyyy-MM-dd"))).trim(),
        impressions: cleanNumber(findValueByAliases(rawRow, FIELD_MAPPINGS.impressions)),
        clicks: cleanNumber(findValueByAliases(rawRow, FIELD_MAPPINGS.clicks)),
        spend: cleanNumber(findValueByAliases(rawRow, FIELD_MAPPINGS.spend)),
        conversions: cleanNumber(findValueByAliases(rawRow, FIELD_MAPPINGS.conversions)),
        revenue: cleanNumber(findValueByAliases(rawRow, FIELD_MAPPINGS.revenue)),
      };

      rows.push(computeMetrics(row));
    } catch (e: unknown) {
      errors.push({
        row: index + 1,
        message: e instanceof Error ? e.message : "Unknown error"
      });
    }
  });

  return { rows, errors };
}
