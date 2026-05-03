import { NextRequest, NextResponse } from "next/server";
import { createInsight } from "@/lib/db/queries/insights";
import { runInsightAgent } from "@/lib/ai/insightAgent";
import { format, subDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dateStart = body.dateStart || format(subDays(new Date(), 7), "yyyy-MM-dd");
    const dateEnd = body.dateEnd || format(new Date(), "yyyy-MM-dd");

    const insight = await createInsight({
      trigger: "manual",
      status: "pending",
      dateRangeStart: dateStart,
      dateRangeEnd: dateEnd,
      generatedAt: new Date(),
    });

    // Run agent in background (fire and forget)
    // In Next.js App Router, we should await or use a proper background job
    // for now we'll fire it and return the ID for polling
    runInsightAgent(dateStart, dateEnd, insight.id).catch(err => {
      console.error("Background Insight Agent Failed:", err);
    });

    return NextResponse.json({ insightId: insight.id });
  } catch (error: any) {
    console.error("Run Insight API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
