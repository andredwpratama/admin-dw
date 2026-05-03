import { NextRequest, NextResponse } from "next/server";
import { listSessions } from "@/lib/db/queries/chat";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
