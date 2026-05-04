import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createInsight } from "@/lib/db/queries/insights";
import { runInsightAgent } from "@/lib/ai/insightAgent";
import { format, subDays } from "date-fns";

// Allow up to 5 minutes for the agent to complete on Vercel Pro
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dateStart = body.dateStart || format(subDays(new Date(), 7), "yyyy-MM-dd");
    const dateEnd = body.dateEnd || format(new Date(), "yyyy-MM-dd");

    const insight = await createInsight({
      trigger: "manual",
      status: "pending",
      step: 0,
      dateRangeStart: dateStart,
      dateRangeEnd: dateEnd,
      generatedAt: new Date(),
    });

    // after() keeps the serverless function alive until the agent completes
    // even after the response has been sent to the client
    after(async () => {
      await runInsightAgent(dateStart, dateEnd, insight.id).catch((err) => {
        console.error("Insight Agent Failed:", err);
      });
    });

    return NextResponse.json({ insightId: insight.id });
  } catch (error: any) {
    console.error("Run Insight API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
