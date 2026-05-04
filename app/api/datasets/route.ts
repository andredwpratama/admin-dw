import { NextResponse } from "next/server";
import { getDatasets } from "@/lib/db/queries/datasets";

export async function GET() {
  try {
    console.log("Fetching datasets...");
    const allDatasets = await getDatasets();
    console.log(`Found ${allDatasets.length} datasets`);

    const result = allDatasets.map((ds) => {
      let parsedColumns = [];
      try {
        parsedColumns = typeof ds.columns === 'string' ? JSON.parse(ds.columns) : (ds.columns || []);
      } catch (e) {
        console.error("Error parsing columns for dataset", ds.id, e);
      }
      
      return {
        ...ds,
        columns: parsedColumns,
      };
    });

    return NextResponse.json({ datasets: result });
  } catch (error: any) {
    console.error("Datasets fetch error detail:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json({ error: error.message || "Failed to fetch datasets" }, { status: 500 });
  }
}
