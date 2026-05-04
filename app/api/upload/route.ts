import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { normalizeRows } from "@/lib/csv/normalizer";
import { upsertCampaign, upsertMetrics, createUploadRecord, updateUploadRecord } from "@/lib/db/queries/campaigns";

export async function POST(req: NextRequest) {
  let uploadId = "";
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const platform = (formData.get("platform") as string) || "meta"; // Default to meta or detect from file

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const uploadRecord = await createUploadRecord({
      platform,
      fileName: file.name,
      status: "processing",
      uploadedAt: new Date(),
    });
    uploadId = uploadRecord.id;

    const csvText = await file.text();
    const { data: rawRows } = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const { rows, errors } = normalizeRows(platform, rawRows as Record<string, unknown>[]);

    if (rows.length === 0 && errors.length > 0) {
      await updateUploadRecord(uploadId, {
        status: "failed",
        errorMessage: errors[0].message,
      });
      return NextResponse.json({ error: "No valid rows found", details: errors }, { status: 400 });
    }

    const campaignCache = new Map<string, string>(); // platform-campaignId -> internalId

    for (const row of rows) {
      const cacheKey = `${row.platform}-${row.campaignId}`;
      let internalId = campaignCache.get(cacheKey);

      if (!internalId) {
        const campaign = await upsertCampaign({
          platform: row.platform,
          campaignId: row.campaignId,
          campaignName: row.campaignName,
          status: row.status,
        });
        internalId = campaign.id;
        campaignCache.set(cacheKey, internalId);
      }

      await upsertMetrics({
        campaignId: internalId,
        date: row.date,
        impressions: row.impressions,
        clicks: row.clicks,
        spend: row.spend,
        conversions: row.conversions,
        revenue: row.revenue,
        ctr: row.ctr,
        cpc: row.cpc,
        cpa: row.cpa,
        roas: row.roas,
      });
    }

    await updateUploadRecord(uploadId, {
      status: "completed",
      rowsProcessed: rows.length,
    });

    return NextResponse.json({
      success: true,
      rowsProcessed: rows.length,
      datasetName: file.name.replace(".csv", ""),
      nullsCleaned: 0, // Simplified for now
    });
  } catch (error: unknown) {
    console.error("Upload Error:", error);
    if (uploadId) {
      await updateUploadRecord(uploadId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

