import { NextRequest, NextResponse } from "next/server";
import { listNotifications, markAllAsRead } from "@/lib/db/queries/notifications";

export async function GET() {
  try {
    const notifications = await listNotifications();
    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await markAllAsRead();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
