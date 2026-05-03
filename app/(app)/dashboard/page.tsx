"use client";

import { useEffect, useState, useCallback } from "react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { SpendChart } from "@/components/dashboard/SpendChart";
import { DatasetViewer } from "@/components/dashboard/DatasetViewer";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface DashboardData {
  summary: any;
  dailyTotals: any[];
  spendByPlatform: any[];
  campaigns: any[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/campaigns?dateStart=${dateRange.start}&dateEnd=${dateRange.end}`
      );
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json as DashboardData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch dashboard data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Real-time performance metrics across all active campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker onRangeChange={(start, end) => setDateRange({ start, end })} />
          <Button variant="outline" size="icon" onClick={fetchData} className="rounded-full">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2 hidden sm:flex">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <SummaryCards data={data?.summary} loading={loading} />

      <SpendChart 
        dailyData={data?.dailyTotals || []} 
        platformData={data?.spendByPlatform || []} 
        loading={loading} 
      />

      <div className="grid grid-cols-1 gap-8">
        <CampaignTable campaigns={data?.campaigns || []} loading={loading} />
      </div>

      <DatasetViewer />
    </div>
  );
}
