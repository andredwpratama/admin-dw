import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSessions, chatMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    await db.delete(chatSessions).where(eq(chatSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, id),
    });

    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, id),
    });

    return NextResponse.json({ ...session, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
