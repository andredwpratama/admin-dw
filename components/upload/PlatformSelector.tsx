"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Share2, Globe, Briefcase, Check } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: any;
  description: string;
  disabled?: boolean;
}

const platforms: Platform[] = [
  {
    id: "meta",
    name: "Meta Ads",
    icon: Share2,
    description: "Upload Facebook & Instagram export (CSV)",
  },
  {
    id: "google",
    name: "Google Ads",
    icon: Globe,
    description: "Upload Google Ads Campaign export (CSV)",
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    icon: Briefcase,
    description: "Upload LinkedIn Ads Manager export (CSV)",
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    icon: () => <span className="font-bold">TT</span>,
    description: "Coming soon",
    disabled: true,
  },
];

interface PlatformSelectorProps {
  selectedPlatform: string | null;
  onSelect: (id: string) => void;
}

export function PlatformSelector({ selectedPlatform, onSelect }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {platforms.map((platform) => {
        const isSelected = selectedPlatform === platform.id;
        const Icon = platform.icon;

        return (
          <Card
            key={platform.id}
            className={cn(
              "relative cursor-pointer transition-all border-2 hover:border-primary/50 overflow-hidden",
              isSelected ? "border-primary bg-primary/5" : "border-transparent",
              platform.disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
            onClick={() => !platform.disabled && onSelect(platform.id)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {typeof Icon === "function" ? <Icon /> : <Icon size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{platform.name}</h3>
                    {platform.disabled && (
                      <Badge variant="secondary" className="text-[10px] h-4">Soon</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{platform.description}</p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-4 right-4 text-primary">
                  <Check size={20} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
