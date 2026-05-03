import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all messages in session
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    
    // Reset message count
    await db.update(chatSessions)
      .set({ messageCount: 0, updatedAt: new Date() })
      .where(eq(chatSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
