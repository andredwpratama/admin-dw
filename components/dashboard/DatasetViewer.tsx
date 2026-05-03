"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, ChevronLeft, ChevronRight, BarChart3, TrendingUp, Hash, ArrowUpDown } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Dataset {
  id: string;
  name: string;
  fileName: string;
  columns: string[];
  rowCount: number;
  nullsCleaned: number;
  uploadedAt: string;
  status: string;
}

interface DatasetDetail {
  dataset: Dataset;
  rows: any[];
  totalRows: number;
  summary: Record<string, { sum: number; avg: number; min: number; max: number; count: number }>;
  pagination: { limit: number; offset: number; hasMore: boolean };
}

export function DatasetViewer() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [chartColumn, setChartColumn] = useState<string>("");
  const pageSize = 20;

  // Fetch dataset list
  useEffect(() => {
    async function fetchDatasets() {
      try {
        const res = await fetch("/api/datasets");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setDatasets(json.datasets || []);
        if (json.datasets?.length > 0) {
          setSelectedId(json.datasets[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch datasets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

  // Fetch dataset detail
  const fetchDetail = useCallback(async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/datasets/${selectedId}?limit=${pageSize}&offset=${page * pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setDetail(json);

      // Default chart column to first numeric column
      const numericCols = Object.keys(json.summary || {});
      if (numericCols.length > 0 && !chartColumn) {
        setChartColumn(numericCols[0]);
      }
    } catch (err) {
      console.error("Failed to fetch dataset detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId, page, pageSize]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <Card className="border-none shadow-sm rounded-3xl">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (datasets.length === 0) {
    return (
      <Card className="border-none shadow-sm rounded-3xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Database size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No datasets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload a CSV file to see your data here.</p>
          <Button variant="outline" className="rounded-full" onClick={() => window.location.href = "/upload"}>
            Upload CSV
          </Button>
        </CardContent>
      </Card>
    );
  }

  const numericColumns = detail ? Object.keys(detail.summary) : [];
  const allColumns = detail?.dataset?.columns || [];

  return (
    <div className="space-y-6">
      {/* Dataset Selector */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Database size={20} className="text-primary" />
              Dataset Explorer
            </CardTitle>
            <CardDescription>Browse your uploaded datasets</CardDescription>
          </div>
          <Select value={selectedId} onValueChange={(v) => { setSelectedId(v || ""); setPage(0); setChartColumn(""); }}>
            <SelectTrigger className="w-[240px] rounded-full">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((ds) => (
                <SelectItem key={ds.id} value={ds.id}>
                  {ds.name}
                  <span className="text-muted-foreground ml-2 text-xs">({ds.rowCount} rows)</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      {/* Summary Stats for Numeric Columns */}
      {detail && numericColumns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {numericColumns.slice(0, 8).map((col) => {
            const stat = detail.summary[col];
            return (
              <Card key={col} className="border-none shadow-sm rounded-3xl hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Hash size={16} />
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[9px] px-2">
                      {stat.count} values
                    </Badge>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 truncate" title={col}>
                    {col}
                  </p>
                  <p className="text-xl font-bold tracking-tight">{formatCompactNumber(stat.sum)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Avg: {formatCompactNumber(stat.avg)} · Min: {formatCompactNumber(stat.min)} · Max: {formatCompactNumber(stat.max)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {detail && numericColumns.length > 0 && detail.rows.length > 0 && (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Data Distribution
            </CardTitle>
            <Select value={chartColumn} onValueChange={(v) => setChartColumn(v || "")}>
              <SelectTrigger className="w-[200px] rounded-full">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((col) => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-2">
            <div style={{ width: "100%", minHeight: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={detail.rows.slice(0, 20).map((row, i) => ({
                    name: `Row ${row.rowIndex + 1}`,
                    value: parseFloat(row[chartColumn]) || 0,
                  }))}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {detail && (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowUpDown size={18} className="text-primary" />
              Data Table
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, detail.totalRows)} of {detail.totalRows}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                disabled={!detail.pagination.hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-none">
                    <TableHead className="pl-6 font-semibold uppercase text-[10px] tracking-wider text-muted-foreground w-16">
                      #
                    </TableHead>
                    {allColumns.map((col) => (
                      <TableHead key={col} className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground whitespace-nowrap">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-6"><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                        {allColumns.map((col) => (
                          <TableCell key={col}><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : detail.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={allColumns.length + 1} className="h-32 text-center text-muted-foreground">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detail.rows.map((row) => (
                      <TableRow key={row.rowIndex} className="hover:bg-muted/20 transition-colors border-muted/20">
                        <TableCell className="pl-6 text-xs text-muted-foreground">{row.rowIndex + 1}</TableCell>
                        {allColumns.map((col) => (
                          <TableCell key={col} className="text-xs truncate max-w-[180px]">
                            {row[col] === "" ? (
                              <span className="text-muted-foreground/40 italic">—</span>
                            ) : (
                              row[col]
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
