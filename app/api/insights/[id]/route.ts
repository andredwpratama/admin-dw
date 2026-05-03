import { NextRequest, NextResponse } from "next/server";
import { getInsightById } from "@/lib/db/queries/insights";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const insight = await getInsightById(id);
    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    return NextResponse.json(insight);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
