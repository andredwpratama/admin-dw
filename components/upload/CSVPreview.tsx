"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles, Trash2 } from "lucide-react";

interface CSVPreviewProps {
  file: File;
}

interface CleanStats {
  totalRows: number;
  cleanedRows: number;
  nullsCleaned: number;
  rowsDropped: number;
  columns: string[];
}

function cleanValue(val: any): string {
  if (val === null || val === undefined || val === "") return "";
  return String(val).trim();
}

export function CSVPreview({ file }: CSVPreviewProps) {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [stats, setStats] = useState<CleanStats | null>(null);

  useEffect(() => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as any[];
        const columns = results.meta.fields || Object.keys(rawRows[0] || {});
        
        let nullsCleaned = 0;
        let rowsDropped = 0;
        const cleanedRows: any[] = [];

        rawRows.forEach((rawRow) => {
          const cleaned: Record<string, string> = {};
          let allEmpty = true;

          for (const col of columns) {
            const raw = rawRow[col];
            const val = cleanValue(raw);

            if (raw === null || raw === undefined || raw === "") {
              nullsCleaned++;
              cleaned[col] = "";
            } else {
              cleaned[col] = val;
            }

            if (val !== "") allEmpty = false;
          }

          if (allEmpty) {
            rowsDropped++;
            return;
          }

          cleanedRows.push(cleaned);
        });

        setHeaders(columns);
        setData(cleanedRows.slice(0, 5));
        setStats({
          totalRows: rawRows.length,
          cleanedRows: cleanedRows.length,
          nullsCleaned,
          rowsDropped,
          columns,
        });
      },
    });
  }, [file]);

  if (!stats || data.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Cleaning Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-muted/50 text-center">
          <p className="text-2xl font-bold">{stats.columns.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Columns</p>
        </div>
        <div className="p-3 rounded-2xl bg-muted/50 text-center">
          <p className="text-2xl font-bold">{stats.cleanedRows}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valid Rows</p>
        </div>
        <div className="p-3 rounded-2xl bg-orange-50 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.nullsCleaned}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nulls Cleaned</p>
        </div>
        <div className="p-3 rounded-2xl bg-red-50 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rowsDropped}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rows Dropped</p>
        </div>
      </div>

      {/* Column Badges */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Detected Columns</p>
        <div className="flex flex-wrap gap-1.5">
          {stats.columns.map((col) => (
            <Badge key={col} variant="secondary" className="rounded-full text-[10px] px-2.5 py-0.5">
              {col}
            </Badge>
          ))}
        </div>
      </div>

      {/* Preview Table */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Sparkles size={14} className="text-primary" />
          Preview of first {data.length} cleaned rows
        </div>
        <div className="rounded-2xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {headers.map((h) => (
                  <TableHead key={h} className="font-semibold text-xs whitespace-nowrap">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {headers.map((h) => (
                    <TableCell key={h} className="text-xs truncate max-w-[150px]">
                      {row[h] === "" ? (
                        <span className="text-muted-foreground/40 italic">empty</span>
                      ) : (
                        row[h]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
