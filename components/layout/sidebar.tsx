"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Lightbulb, 
  MessageSquare, 
  Upload, 
  LogOut, 
  HelpCircle,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Insights", href: "/insights", icon: Lightbulb },
  { name: "Chat Analyst", href: "/chat", icon: MessageSquare },
  { name: "Data Upload", href: "/upload", icon: Upload },
];

export function SidebarContent({ className, onItemClick }: { className?: string, onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
          <Image src="/image.webp" alt="AdMind Logo" width={32} height={32} className="object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">AdMind AI</h1>
          <p className="text-xs text-muted-foreground">Marketing Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors relative group",
                isActive 
                  ? "bg-accent/50 text-accent-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <Link
            href="/settings"
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              pathname.startsWith("/settings") 
                ? "bg-accent/50 text-accent-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings size={20} />
            Settings
          </Link>
          <Link
            href="/help"
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              pathname.startsWith("/help") 
                ? "bg-accent/50 text-accent-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <HelpCircle size={20} />
            Help Center
          </Link>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card hidden md:block">
      <SidebarContent />
    </aside>
  );
}
