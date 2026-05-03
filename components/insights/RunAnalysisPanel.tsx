"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateRangePicker } from "../dashboard/DateRangePicker";
import { Loader2, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

interface RunAnalysisPanelProps {
  onComplete: (insightId: string) => void;
}

export function RunAnalysisPanel({ onComplete }: RunAnalysisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [status, setStatus] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setStatus("Initiating agent...");
    try {
      const res = await fetch("/api/insights/run", {
        method: "POST",
        body: JSON.stringify(dateRange),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      pollStatus(data.insightId);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
      setStatus(null);
    }
  };

  const pollStatus = async (id: string) => {
    setStatus("Analyzing data...");
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/insights/${id}`);
        const data = await res.json();
        
        if (data.status === "completed") {
          clearInterval(interval);
          setLoading(false);
          setStatus(null);
          toast.success("Analysis complete!");
          onComplete(id);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setStatus(null);
          toast.error("Analysis failed: " + data.errorMessage);
        } else if (data.status === "running") {
          setStatus("Generating insights...");
        }
      } catch (err) {
        // Continue polling
      }
    }, 3000);
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles size={20} />
          </div>
          <CardTitle>Run AI Analysis</CardTitle>
        </div>
        <CardDescription>
          Our AI agent will explore your data, detect anomalies, and generate actionable recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-2xl bg-background/50 border space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Analysis Period</p>
          <DateRangePicker onRangeChange={(start, end) => setDateRange({ start, end })} />
        </div>

        <Button 
          onClick={runAnalysis} 
          disabled={loading}
          className="w-full h-12 rounded-full gap-2 text-base font-bold shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {status}
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              Start Analysis
            </>
          )}
        </Button>
        <p className="text-[10px] text-center text-muted-foreground">
          Free tier model may take up to 90 seconds to process.
        </p>
      </CardContent>
    </Card>
  );
}
