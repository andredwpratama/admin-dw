import { NextRequest, NextResponse } from "next/server";
import { getSummaryMetrics, getSpendByPlatform, getCampaignTableData, getDailyTotals } from "@/lib/db/queries/metrics";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStart = searchParams.get("dateStart") || format(subDays(new Date(), 30), "yyyy-MM-dd");
  const dateEnd = searchParams.get("dateEnd") || format(new Date(), "yyyy-MM-dd");
  const platform = searchParams.get("platform") || "all";
  const status = searchParams.get("status") || "all";

  try {
    const [summary, spendByPlatform, campaigns, dailyTotals] = await Promise.all([
      getSummaryMetrics(dateStart, dateEnd),
      getSpendByPlatform(dateStart, dateEnd),
      getCampaignTableData({ dateStart, dateEnd, platform, status }),
      getDailyTotals(dateStart, dateEnd)
    ]);

    return NextResponse.json({
      summary,
      spendByPlatform,
      campaigns,
      dailyTotals
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
