import { NextRequest, NextResponse } from "next/server";
import { listInsights } from "@/lib/db/queries/insights";

export async function GET() {
  try {
    const insights = await listInsights();
    return NextResponse.json(insights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
