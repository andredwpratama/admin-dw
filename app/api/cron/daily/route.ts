import { NextRequest, NextResponse } from "next/server";
import { runInsightAgent } from "@/lib/ai/insightAgent";
import { createInsight } from "@/lib/db/queries/insights";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const dateEnd = format(new Date(), "yyyy-MM-dd");
    const dateStart = format(subDays(new Date(), 7), "yyyy-MM-dd");

    const insight = await createInsight({
      trigger: "scheduled",
      status: "pending",
      dateRangeStart: dateStart,
      dateRangeEnd: dateEnd,
      generatedAt: new Date(),
    });

    // Run agent
    const result = await runInsightAgent(dateStart, dateEnd, insight.id);

    return NextResponse.json({
      success: true,
      insightId: insight.id,
      summary: result.summary
    });
  } catch (error: any) {
    console.error("Cron Analysis Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
