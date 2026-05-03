"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface DateRangePickerProps {
  onRangeChange: (start: string, end: string) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [range, setRange] = useState("30");
  const [custom, setCustom] = useState(false);

  const presets = [
    { label: "Last 7 Days", value: "7" },
    { label: "Last 30 Days", value: "30" },
    { label: "Last 90 Days", value: "90" },
  ];

  const handlePreset = (days: string) => {
    setRange(days);
    setCustom(false);
    const end = new Date();
    const start = subDays(end, parseInt(days));
    onRangeChange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="bg-muted p-1 rounded-full flex gap-1 border border-border/50">
        {presets.map((p) => (
          <Button
            key={p.value}
            variant={range === p.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handlePreset(p.value)}
            className={cn(
              "rounded-full px-4 text-xs font-semibold transition-all",
              range === p.value 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </Button>
        ))}
        <Button
          variant={custom ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setCustom(!custom)}
          className={cn(
            "rounded-full px-4 text-xs font-semibold transition-all",
            custom 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Custom
        </Button>
      </div>

      {custom && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <input 
            type="date" 
            className="bg-muted border-none rounded-full px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none" 
            onChange={(e) => {
              const start = e.target.value;
              const end = format(new Date(), "yyyy-MM-dd");
              if (start) onRangeChange(start, end);
            }}
          />
          <span className="text-foreground/60 text-[10px] font-bold uppercase">to</span>
          <input 
            type="date" 
            className="bg-muted border-none rounded-full px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none" 
            defaultValue={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => {
              // Handle custom range logic
            }}
          />
        </div>
      )}
    </div>
  );
}
