import { NextRequest } from "next/server";
import { createSession, addMessage, getMessages, generateSessionTitle } from "@/lib/db/queries/chat";
import { runChatAgent, buildDataContext } from "@/lib/ai/chatAgent";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;
  let { sessionId } = body;

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const enc = new TextEncoder();
  const sse = (data: object) => enc.encode(`data: ${JSON.stringify(data)}\n\n`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Create session if needed
        if (!sessionId) {
          const session = await createSession(generateSessionTitle(message));
          sessionId = session.id;
        }
        controller.enqueue(sse({ type: "session", sessionId }));

        // Fetch history and live DB context in parallel
        const [dbMessages, context] = await Promise.all([
          getMessages(sessionId, 20),
          buildDataContext(),
        ]);

        // Only pass user/assistant turns — tool messages aren't persisted
        const history = dbMessages
          .filter(m => m.role === "user" || m.role === "assistant")
          .map(m => ({ role: m.role, content: m.content }));

        // Persist user message
        await addMessage({ sessionId, role: "user", content: message, createdAt: new Date() });

        let fullContent = "";

        await runChatAgent(message, history, context, (event) => {
          if (event.type === "chunk") fullContent += event.content;
          controller.enqueue(sse(event));
        });

        // Persist assistant response
        const msg = await addMessage({
          sessionId,
          role: "assistant",
          content: fullContent,
          createdAt: new Date(),
        });

        controller.enqueue(sse({ type: "done", messageId: msg.id }));
      } catch (err: any) {
        console.error("Chat SSE Error:", err);
        controller.enqueue(sse({ type: "error", error: err.message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
