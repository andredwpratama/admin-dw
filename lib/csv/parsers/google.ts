import { ParsedMetricRow, ParseError } from "@/lib/types";
import { format } from "date-fns";

export function parseGoogleCSV(rawRows: any[], platform: string): { rows: ParsedMetricRow[], errors: ParseError[] } {
  const rows: ParsedMetricRow[] = [];
  const errors: ParseError[] = [];

  rawRows.forEach((rawRow, index) => {
    try {
      // Google Ads quirk: Skip rows that are metadata or totals
      // Usually real data rows have a Campaign ID or a Campaign name and are not "Total: ..."
      const campaignName = rawRow["Campaign"] || rawRow["Campaign name"];
      const campaignId = rawRow["Campaign ID"] || rawRow["External Customer ID"];
      
      if (!campaignName || String(campaignName).startsWith("Total") || !campaignId) {
        return;
      }

      const dateRaw = rawRow["Day"] || rawRow["Date"] || format(new Date(), "yyyy-MM-dd");
      
      const impressions = parseInt(String(rawRow["Impressions"]).replace(/,/g, "")) || 0;
      const clicks = parseInt(String(rawRow["Clicks"]).replace(/,/g, "")) || 0;
      const spend = parseFloat(String(rawRow["Cost"]).replace(/,/g, "")) || 0;
      const conversions = parseInt(String(rawRow["Conversions"]).replace(/,/g, "")) || 0;
      const revenue = parseFloat(String(rawRow["Conv. value"] || "0").replace(/,/g, "")) || 0;

      const row: ParsedMetricRow = {
        campaignId: String(campaignId),
        campaignName: String(campaignName),
        platform,
        status: rawRow["Campaign state"] || "active",
        date: dateRaw,
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        cpa: conversions > 0 ? spend / conversions : 0,
        roas: spend > 0 ? revenue / spend : 0
      };

      rows.push(row);
    } catch (e: any) {
      errors.push({
        row: index + 1,
        message: e.message || "Failed to parse row"
      });
    }
  });

  return { rows, errors };
}
