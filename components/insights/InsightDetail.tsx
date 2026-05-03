"use client";

import { Finding, Recommendation } from "@/lib/types";
import { FindingItem } from "./FindingItem";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, Lightbulb, Zap } from "lucide-react";

interface InsightDetailProps {
  insight: any;
}

export function InsightDetail({ insight }: InsightDetailProps) {
  const findings: Finding[] = JSON.parse(insight.findings || "[]");
  const recommendations: Recommendation[] = JSON.parse(insight.recommendations || "[]");

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">
            {insight.trigger === "manual" ? "Manual Run" : "Scheduled"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Generated on {format(new Date(insight.generatedAt), "PPP p")}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
        <p className="text-muted-foreground">
          Analysis for the period of <strong>{insight.dateRangeStart}</strong> to <strong>{insight.dateRangeEnd}</strong>
        </p>
      </div>

      <Card className="border-none shadow-sm rounded-3xl bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 size={20} className="text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {insight.summary}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 pl-1">
          <Zap size={20} className="text-orange-500" />
          Key Findings
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {findings.map((finding, i) => (
            <FindingItem key={i} finding={finding} />
          ))}
          {findings.length === 0 && (
            <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
              No significant findings detected for this period.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 pl-1">
          <Lightbulb size={20} className="text-secondary" />
          Strategic Recommendations
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 font-bold text-sm">
                    {rec.priority}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-base">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec.detail}
                    </p>
                    {rec.expectedImpact && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected Impact:</span>
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[10px]">
                          {rec.expectedImpact}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
