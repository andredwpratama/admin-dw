export type Finding = {
  severity: "HIGH" | "MEDIUM" | "LOW";
  campaignName: string;
  platform: string;
  issue: string;
  detail: string;
  metric?: string;
  value?: number;
};

export type Recommendation = {
  priority: number;
  title: string;
  detail: string;
  expectedImpact?: string;
};

export type InsightResult = {
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
};

export type ParsedMetricRow = {
  campaignId: string;
  campaignName: string;
  platform: string;
  status: string;
  objective?: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue?: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas?: number;
};

export type ParseError = {
  row: number;
  field?: string;
  message: string;
};
