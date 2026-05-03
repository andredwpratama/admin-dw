"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatIDR, formatCompactNumber, formatPercent, formatNumber } from "@/lib/formatters";
import { 
  DollarSign, 
  Eye, 
  Target, 
  TrendingUp, 
  Percent, 
  BarChart3,
  MousePointer2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  data: any;
  loading: boolean;
}

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Spend",
      value: formatIDR(data?.totalSpend || 0),
      trend: "+12%",
      trendUp: true,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Impressions",
      value: formatCompactNumber(data?.totalImpressions || 0),
      trend: "+8%",
      trendUp: true,
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Conversions",
      value: formatNumber(data?.totalConversions || 0),
      trend: "+24%",
      trendUp: true,
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Avg. CTR",
      value: formatPercent(data?.avgCtr || 0),
      trend: "vs 3.8% last mo",
      trendUp: true,
      icon: MousePointer2,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className="border-none shadow-sm rounded-3xl hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", card.bg, card.color)}>
                <card.icon size={20} />
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1",
                card.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {card.trendUp ? "↑" : "↓"} {card.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
