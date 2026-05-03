import { NextRequest, NextResponse } from "next/server";
import { createSession, addMessage, getMessages, generateSessionTitle } from "@/lib/db/queries/chat";
import { runChatAgent } from "@/lib/ai/chatAgent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;
    let { sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Create session if it doesn't exist
    if (!sessionId) {
      const session = await createSession(generateSessionTitle(message));
      sessionId = session.id;
    }

    // Get recent history
    const dbMessages = await getMessages(sessionId, 10);
    const history = dbMessages.map(m => ({
      role: m.role,
      content: m.content,
      tool_calls: m.toolCalls ? JSON.parse(m.toolCalls) : undefined,
    }));

    // Add user message to DB
    await addMessage({
      sessionId,
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    // Run agent
    const responseContent = await runChatAgent(sessionId, message, history);

    // Add assistant response to DB
    const assistantMessage = await addMessage({
      sessionId,
      role: "assistant",
      content: responseContent,
      createdAt: new Date(),
    });

    return NextResponse.json({
      sessionId,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
