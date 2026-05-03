import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { metrics } from "@/lib/db/schema";
import { and, eq, between } from "drizzle-orm";
import { format, subDays } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateStart = searchParams.get("dateStart") || format(subDays(new Date(), 30), "yyyy-MM-dd");
  const dateEnd = searchParams.get("dateEnd") || format(new Date(), "yyyy-MM-dd");

  try {
    const data = await db
      .select()
      .from(metrics)
      .where(
        and(
          eq(metrics.campaignId, id),
          between(metrics.date, dateStart, dateEnd)
        )
      )
      .orderBy(metrics.date);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
