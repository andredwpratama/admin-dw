import { Badge } from "@/components/ui/badge";
import { Finding } from "@/lib/types";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FindingItemProps {
  finding: Finding;
}

export function FindingItem({ finding }: FindingItemProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return {
          bg: "bg-red-50 border-red-100",
          icon: <AlertCircle className="text-red-500" size={18} />,
          badge: "bg-red-500 text-white hover:bg-red-600"
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-50 border-yellow-100",
          icon: <AlertTriangle className="text-yellow-500" size={18} />,
          badge: "bg-yellow-500 text-white hover:bg-yellow-600"
        };
      default:
        return {
          bg: "bg-blue-50 border-blue-100",
          icon: <Info className="text-blue-500" size={18} />,
          badge: "bg-blue-500 text-white hover:bg-blue-600"
        };
    }
  };

  const styles = getSeverityStyles(finding.severity);

  return (
    <div className={cn("p-4 rounded-2xl border flex gap-4 transition-all hover:shadow-sm", styles.bg)}>
      <div className="mt-1">{styles.icon}</div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{finding.campaignName}</span>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-background/50">
              {finding.platform}
            </Badge>
          </div>
          <Badge className={cn("text-[10px] font-bold", styles.badge)}>
            {finding.severity}
          </Badge>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1">{finding.issue}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {finding.detail}
          </p>
        </div>
        {finding.metric && (
          <div className="pt-1">
            <Badge variant="secondary" className="text-[10px] rounded-full px-2 py-0 bg-background">
              {finding.metric}: {finding.value}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
