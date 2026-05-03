import { NextResponse } from "next/server";
import { getDatasets } from "@/lib/db/queries/datasets";

export async function GET() {
  try {
    const allDatasets = await getDatasets();

    const result = allDatasets.map((ds) => ({
      ...ds,
      columns: JSON.parse(ds.columns),
    }));

    return NextResponse.json({ datasets: result });
  } catch (error: any) {
    console.error("Datasets fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch datasets" }, { status: 500 });
  }
}
