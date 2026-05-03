import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { openrouter, MODEL } from "@/lib/ai/openrouter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get history
    const history = await db.query.chatMessages.findMany({
      where: eq(chatMessages.sessionId, id),
      orderBy: [asc(chatMessages.createdAt)],
    });

    if (history.length < 4) {
      return NextResponse.json({ error: "Not enough history to compress" }, { status: 400 });
    }

    const context = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    // 2. Ask model to summarize
    const response = await openrouter.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "Summarize the following conversation history into a concise, fact-dense internal memory block. Focus on data findings, campaign names, and key metrics mentioned. Use bullet points." 
        },
        { role: "user", content: context }
      ],
    });

    const summary = response.choices[0].message.content;

    // 3. Delete old messages
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));

    // 4. Insert summary as first message
    await db.insert(chatMessages).values({
      sessionId: id,
      role: "assistant",
      content: `[CONTEXT COMPRESSED]\n\nMemory of previous conversation:\n${summary}`,
      createdAt: new Date(),
    });

    // 5. Update session
    await db.update(chatSessions)
      .set({ messageCount: 1, updatedAt: new Date() })
      .where(eq(chatSessions.id, id));

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
