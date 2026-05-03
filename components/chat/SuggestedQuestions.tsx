"use client";

import { TrendingUp, Users, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  {
    title: "Analyze Q3 Campaign ROI",
    description: "Compare spend vs. acquisition cost across all channels.",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Audience Segmentation",
    description: "Identify the top performing demographics for the recent launch.",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Generate Weekly Report",
    description: "Draft a summary of key metrics and actionable next steps.",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Detect Anomalies",
    description: "Scan recent ad spend data for unusual patterns or overspending.",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600",
  },
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.title)}
          className="p-5 rounded-[1.5rem] border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left flex gap-4 group"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", s.color)}>
            <s.icon size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">{s.title}</h4>
            <p className="text-xs text-muted-foreground">{s.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
