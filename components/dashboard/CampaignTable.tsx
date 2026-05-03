"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatIDR, formatPercent, formatNumber } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  roas: number;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  loading: boolean;
}

export function CampaignTable({ campaigns, loading }: CampaignTableProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "meta": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "google": return "bg-red-100 text-red-700 hover:bg-red-100";
      case "linkedin": return "bg-sky-100 text-sky-700 hover:bg-sky-100";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700 hover:bg-green-100";
      case "paused": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "ended": return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Campaign Details</CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal size={20} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
              <TableHead className="pl-6 font-bold uppercase text-[10px] tracking-wider text-foreground/70">Campaign Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-center">Platform</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-center">Status</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right">Spend</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right">CTR</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right">CPC</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right">Conversions</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right">CPA</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider text-foreground/70 text-right pr-6">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell className="pr-6"><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No campaigns found for the selected range.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/20 transition-colors border-muted/20">
                  <TableCell className="pl-6 py-4">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">ID: {c.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${getPlatformColor(c.platform)} border-none rounded-full px-3`}>
                      {c.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.status.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs font-medium capitalize">{c.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatIDR(c.spend)}</TableCell>
                  <TableCell className="text-right">{formatPercent(c.ctr)}</TableCell>
                  <TableCell className="text-right">{formatIDR(c.cpc)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatNumber(c.conversions)}</TableCell>
                  <TableCell className="text-right">{formatIDR(c.cpa)}</TableCell>
                  <TableCell className="text-right pr-6 font-bold text-primary">{c.roas?.toFixed(2)}x</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
