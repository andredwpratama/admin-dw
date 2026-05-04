import { openrouter, MODEL } from "./openrouter";
import { adTools, executeTool } from "./tools";
import { db } from "@/lib/db";
import { campaigns, metrics, datasets } from "@/lib/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { format, subDays } from "date-fns";

const CHAT_SYSTEM_PROMPT = `You are AdMind AI — a sharp, proactive marketing data analyst embedded in an ad performance platform.

CRITICAL RULES (never break these):
1. Call a tool IMMEDIATELY on every user message. Do NOT ask clarifying questions first.
2. Date range: use the default from the context if the user doesn't specify. Never ask for dates.
3. After getting data, give direct insights — not just raw numbers. Tell the user what the data means.
4. Surface non-obvious insights proactively (e.g. while answering about spend, also flag the worst-CPA campaign).
5. End every response with 1–2 concrete, actionable recommendations.

TOOL USAGE GUIDE:
- Any question about campaigns / performance / spend / CTR / CPA → query_campaigns first
- "how am I doing overall" / "summary" / "overview" → get_summary_metrics
- "unusual" / "anomaly" / "spike" / "drop" → detect_anomalies
- "trend" / "day by day" / "over time" for one campaign → get_campaign_metrics
- "uploaded data" / "CSV" / "my dataset" / custom data → list_datasets then query_dataset

RESPONSE FORMAT:
- Currency: IDR (Rp 1.2B / Rp 500K / Rp 1,234)
- Percentages: 1 decimal (12.3%)
- Markdown tables for comparing multiple campaigns
- **Bold** key metrics and critical findings
- Concise — no filler, no disclaimers, no "I'd be happy to help"`;

type AgentEvent =
  | { type: "thinking"; label: string }
  | { type: "chunk"; content: string };

const TOOL_LABELS: Record<string, string> = {
  query_campaigns:      "Querying campaign data...",
  get_campaign_metrics: "Loading daily metrics...",
  detect_anomalies:     "Scanning for anomalies...",
  get_summary_metrics:  "Calculating summary metrics...",
  list_datasets:        "Checking uploaded datasets...",
  query_dataset:        "Reading dataset rows...",
};

export async function buildDataContext(): Promise<string> {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const [platformRows, dateRangeRows, datasetRows] = await Promise.all([
    db.selectDistinct({ platform: campaigns.platform }).from(campaigns),
    db.select({
      minDate: sql<string>`min(${metrics.date})`,
      maxDate: sql<string>`max(${metrics.date})`,
    }).from(metrics),
    db.select({
      id: datasets.id,
      name: datasets.name,
      columns: datasets.columns,
      rowCount: datasets.rowCount,
    }).from(datasets).where(eq(datasets.status, "completed")).orderBy(desc(datasets.uploadedAt)).limit(10),
  ]);

  const platforms = platformRows.map(p => p.platform).join(", ") || "none yet";
  const dr = dateRangeRows[0];
  const dsLines = datasetRows.length > 0
    ? datasetRows.map(d =>
        `  • "${d.name}" | id: ${d.id} | ${d.rowCount} rows | columns: ${JSON.parse(d.columns).join(", ")}`
      ).join("\n")
    : "  • None uploaded yet";

  return `Today: ${today}
Default date range: ${thirtyDaysAgo} → ${today}
Ad platforms in database: ${platforms}
Campaign data available: ${dr?.minDate ?? "N/A"} → ${dr?.maxDate ?? "N/A"}
Uploaded CSV datasets:
${dsLines}`;
}

export async function runChatAgent(
  userMessage: string,
  history: any[],
  context: string,
  onEvent: (e: AgentEvent) => void
): Promise<string> {
  const messages: any[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    { role: "user", content: `[DATA CONTEXT — updated live]\n${context}` },
    { role: "assistant", content: "Context loaded. I will call a tool immediately." },
    ...history,
    { role: "user", content: userMessage },
  ];

  // Phase 1: non-streaming tool-call iterations (up to 5)
  for (let i = 0; i < 5; i++) {
    onEvent({ type: "thinking", label: i === 0 ? "Thinking..." : "Continuing analysis..." });

    const response = await openrouter.chat.completions.create({
      model: MODEL,
      messages,
      tools: adTools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const message = choice.message;
    messages.push(message);

    // Model gave a direct text answer with no tool calls
    if (choice.finish_reason === "stop" || !message.tool_calls?.length) {
      const content = message.content ?? "";
      onEvent({ type: "chunk", content });
      return content;
    }

    // Execute all tool calls in this iteration
    for (const tc of message.tool_calls) {
      if (tc.type !== "function") continue;
      onEvent({ type: "thinking", label: TOOL_LABELS[tc.function.name] ?? "Processing..." });
      const args = JSON.parse(tc.function.arguments);
      const result = await executeTool(tc.function.name, args);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Phase 2: final streaming response — no tools so the model writes text
  onEvent({ type: "thinking", label: "Writing analysis..." });

  const stream = await openrouter.chat.completions.create({
    model: MODEL,
    messages,
    stream: true,
  });

  let fullContent = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) {
      fullContent += delta;
      onEvent({ type: "chunk", content: delta });
    }
  }

  return fullContent || "I couldn't generate a response. Please try again.";
}
