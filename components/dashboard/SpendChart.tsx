"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatIDR, formatCompactNumber } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

interface SpendChartProps {
  dailyData: any[];
  platformData: any[];
  loading: boolean;
}

export function SpendChart({ dailyData, platformData, loading }: SpendChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const COLORS: Record<string, string> = {
    meta: "#1877F2",
    google: "#EA4335",
    linkedin: "#0A66C2",
    tiktok: "#000000",
    all: "#276b38"
  };

  if (loading || !isMounted) return (
    <Card className="border-none shadow-sm rounded-3xl h-[400px]">
      <div className="w-full h-full bg-muted animate-pulse rounded-3xl" />
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Spend Over Time</CardTitle>
          <CardDescription>Daily budget consumption across all channels.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px] w-full relative min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#276b38" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#276b38" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#888" }}
                tickFormatter={(str) => format(parseISO(str), "MMM d")}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#888" }}
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                formatter={(val) => [formatIDR(val as number), "Spend"]}
                labelFormatter={(label) => format(parseISO(label), "PPPP")}
              />
              <Area 
                type="monotone" 
                dataKey="spend" 
                stroke="#276b38" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpend)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold">By Platform</CardTitle>
          <CardDescription>Budget distribution.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] min-h-[300px] w-full relative min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={platformData} layout="vertical" margin={{ left: -20 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="platform" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "bold" }}
              />
              <Tooltip 
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                formatter={(val) => [formatIDR(val as number), "Spend"]}
              />
              <Bar dataKey="spend" radius={[0, 10, 10, 0]} barSize={32}>
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.platform.toLowerCase()] || COLORS.all} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
