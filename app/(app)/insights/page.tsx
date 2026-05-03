"use client";

import { useState, useEffect } from "react";
import { RunAnalysisPanel } from "@/components/insights/RunAnalysisPanel";
import { InsightDetail } from "@/components/insights/InsightDetail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Plus, BarChart3, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const selectedInsight = insights.find(i => i.id === selectedId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px] rounded-full">Success</Badge>;
      case "running": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] rounded-full animate-pulse">Running</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px] rounded-full">Failed</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground border-none text-[10px] rounded-full">Pending</Badge>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8">
      {/* Sidebar - History */}
      <aside className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" />
            History
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedId(null)}
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Plus size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-2">
            {insights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => setSelectedId(insight.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all hover:border-primary/50 group relative overflow-hidden",
                  selectedId === insight.id ? "border-primary bg-primary/5 shadow-sm" : "bg-card border-transparent"
                )}
              >
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {format(new Date(insight.generatedAt), "MMM d, h:mm a")}
                    </span>
                    {getStatusBadge(insight.status)}
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {insight.summary || "New Analysis Run"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Range: {insight.dateRangeStart} - {insight.dateRangeEnd}
                  </p>
                </div>
                {selectedId === insight.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </button>
            ))}
            {!loading && insights.length === 0 && (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <BarChart3 size={24} />
                </div>
                <p className="text-xs text-muted-foreground">No historical analysis found. Run your first analysis to see it here.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Area */}
      <main className="flex-1 bg-muted/30 rounded-[2.5rem] p-8 overflow-y-auto border border-muted/50">
        {selectedId ? (
          selectedInsight?.status === "completed" ? (
            <InsightDetail insight={selectedInsight} />
          ) : selectedInsight?.status === "failed" ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Analysis Failed</h3>
                <p className="text-muted-foreground text-sm mt-2">{selectedInsight.errorMessage}</p>
              </div>
              <Button onClick={() => setSelectedId(null)} variant="outline" className="rounded-full">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Our agent is currently working on this analysis...</p>
            </div>
          )
        ) : (
          <div className="h-full max-w-xl mx-auto flex items-center">
            <RunAnalysisPanel onComplete={(id) => {
              fetchInsights();
              setSelectedId(id);
            }} />
          </div>
        )}
      </main>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  )
}
