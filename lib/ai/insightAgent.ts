import { openrouter, MODEL } from "./openrouter";
import { adTools, executeTool } from "./tools";
import { InsightResult } from "@/lib/types";
import { updateInsight } from "@/lib/db/queries/insights";

const MAX_ITERATIONS = 10;

const STEP_LABELS: Record<number, string> = {
  1: "Querying campaign overview...",
  2: "Analyzing campaign data...",
  3: "Detecting anomalies...",
  4: "Investigating top spenders...",
  5: "Comparing platform performance...",
  6: "Identifying trends...",
  7: "Evaluating spend efficiency...",
  8: "Cross-referencing metrics...",
  9: "Generating recommendations...",
  10: "Finalizing analysis...",
};

const INSIGHT_SYSTEM_PROMPT = `
You are an expert digital marketing analyst. You have access to tools to query
campaign performance data. Your job is to:

1. Use the tools to explore the data thoroughly before drawing conclusions
2. Identify campaigns performing significantly above or below average
3. Detect spend efficiency issues (high CPA, low CTR relative to platform benchmarks)
4. Spot trends — improving or declining campaigns
5. Generate actionable recommendations prioritized by potential impact

Always quantify findings with specific numbers and percentages.
Classify each finding with severity:
- HIGH: requires immediate action (budget waste, CPA spike >50%)
- MEDIUM: monitor closely (declining trend, underperforming vs benchmark)
- LOW: informational (minor optimization opportunity)

Respond in valid JSON matching this structure:
{
  "summary": "2-3 sentence executive summary",
  "findings": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "campaignName": "...",
      "platform": "...",
      "issue": "one-line title",
      "detail": "specific explanation with numbers"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "title": "...",
      "detail": "specific action to take",
      "expectedImpact": "..."
    }
  ]
}
`;

export async function runInsightAgent(
  dateStart: string,
  dateEnd: string,
  insightId: string
): Promise<InsightResult> {
  const messages: any[] = [
    { role: "system", content: INSIGHT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyze campaign performance from ${dateStart} to ${dateEnd}.
                Start by getting a summary overview, then investigate campaigns
                that need attention. Use the tools available.`
    }
  ];

  try {
    await updateInsight(insightId, {
      status: "running",
      step: 0,
      stepLabel: "Starting agent...",
    });

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const step = i + 1;
      await updateInsight(insightId, {
        step,
        stepLabel: STEP_LABELS[step] ?? "Processing...",
      });

      const response = await openrouter.chat.completions.create({
        model: MODEL,
        messages,
        tools: adTools,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const message = choice.message;

      messages.push(message);

      if (choice.finish_reason === "stop" && message.content) {
        let content = message.content;
        if (content.includes("```json")) {
          content = content.split("```json")[1].split("```")[0].trim();
        } else if (content.includes("```")) {
          content = content.split("```")[1].split("```")[0].trim();
        }

        const result = JSON.parse(content) as InsightResult;

        await updateInsight(insightId, {
          status: "completed",
          step: MAX_ITERATIONS,
          stepLabel: "Done",
          summary: result.summary,
          findings: JSON.stringify(result.findings),
          recommendations: JSON.stringify(result.recommendations),
          rawResponse: message.content,
        });

        return result;
      }

      if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
          if (toolCall.type === "function") {
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
    }

    throw new Error("Max iterations reached without final response");
  } catch (error: any) {
    console.error("Insight Agent Error:", error);
    await updateInsight(insightId, {
      status: "failed",
      errorMessage: error.message,
    });
    throw error;
  }
}
