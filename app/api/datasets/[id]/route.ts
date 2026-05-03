import { NextRequest, NextResponse } from "next/server";
import { getDatasetById, getDatasetData, getDatasetRowCount } from "@/lib/db/queries/datasets";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const dataset = await getDatasetById(id);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const [rows, totalRows] = await Promise.all([
      getDatasetData(id, limit, offset),
      getDatasetRowCount(id),
    ]);

    const columns: string[] = JSON.parse(dataset.columns);
    const parsedRows = rows.map((r) => ({
      rowIndex: r.rowIndex,
      ...JSON.parse(r.data),
    }));

    // Compute summary stats for numeric columns
    const summary: Record<string, { sum: number; avg: number; min: number; max: number; count: number }> = {};

    for (const col of columns) {
      const numericValues: number[] = [];
      for (const row of parsedRows) {
        const val = parseFloat(row[col]);
        if (!isNaN(val)) {
          numericValues.push(val);
        }
      }
      if (numericValues.length > parsedRows.length * 0.5) {
        // At least 50% numeric → treat as numeric column
        summary[col] = {
          sum: numericValues.reduce((a, b) => a + b, 0),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          count: numericValues.length,
        };
      }
    }

    return NextResponse.json({
      dataset: {
        ...dataset,
        columns,
      },
      rows: parsedRows,
      totalRows,
      summary,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalRows,
      },
    });
  } catch (error: any) {
    console.error("Dataset fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch dataset" }, { status: 500 });
  }
}
