import { openrouter, MODEL } from "./openrouter";
import { adTools, executeTool } from "./tools";

const CHAT_SYSTEM_PROMPT = `
You are AdMind's AI analyst. Be concise. Direct. No fluff. 
Use tools to get data. Never guess.
Format: IDR (Rp), % (1 decimal), numbers (commas).
Markdown for lists/tables.
`;

export async function runChatAgent(
  sessionId: string,
  userMessage: string,
  history: any[]
): Promise<string> {
  const messages: any[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage }
  ];

  try {
    for (let i = 0; i < 8; i++) {
      const response = await openrouter.chat.completions.create({
        model: MODEL,
        messages,
        tools: adTools,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const message = choice.message;

      messages.push(message);

      if (choice.finish_reason === "stop") {
        return message.content || "I couldn't process that request.";
      }

      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeTool(toolCall.function.name, args);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }
      }
    }

    return "I'm sorry, I'm having trouble finding that information after several attempts.";
  } catch (error: any) {
    console.error("Chat Agent Error:", error);
    return "I encountered an error while analyzing your data. Please try again.";
  }
}
