import { ParsedMetricRow, ParseError } from "@/lib/types";
import { format, parse } from "date-fns";

export function parseMetaCSV(rawRows: any[], platform: string): { rows: ParsedMetricRow[], errors: ParseError[] } {
  const rows: ParsedMetricRow[] = [];
  const errors: ParseError[] = [];

  rawRows.forEach((rawRow, index) => {
    try {
      // Basic validation - check if it's a data row (Meta has a lot of summary rows)
      if (!rawRow["Campaign name"] || !rawRow["Campaign ID"] || rawRow["Campaign ID"] === "") {
        return; // Skip summary rows
      }

      const campaignId = String(rawRow["Campaign ID"]);
      const campaignName = String(rawRow["Campaign name"]);
      const date = rawRow["Reporting starts"] || rawRow["Day"] || format(new Date(), "yyyy-MM-dd");
      
      const impressions = parseInt(String(rawRow["Impressions"]).replace(/,/g, "")) || 0;
      const clicks = parseInt(String(rawRow["Clicks (all)"]).replace(/,/g, "")) || 0;
      const spend = parseFloat(String(rawRow["Amount spent (IDR)"]).replace(/,/g, "").replace("IDR", "")) || 0;
      const conversions = parseInt(String(rawRow["Conversions"]).replace(/,/g, "")) || 0;
      const revenue = rawRow["Purchase ROAS (return on ad spend)"] 
        ? parseFloat(String(rawRow["Amount spent (IDR)"]).replace(/,/g, "")) * parseFloat(String(rawRow["Purchase ROAS (return on ad spend)"]))
        : 0;

      const row: ParsedMetricRow = {
        campaignId,
        campaignName,
        platform,
        status: rawRow["Delivery"] || "active",
        date,
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
