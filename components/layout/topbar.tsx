"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar";
import { UserButton } from "@clerk/nextjs";

const emptySubscribe = () => () => {};

export function Topbar() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTitle = () => {
    const segment = pathname.split("/")[1];
    switch (segment) {
      case "dashboard": return "Dashboard";
      case "insights": return "AI Insights";
      case "chat": return "Chat Analyst";
      case "upload": return "Data Upload";
      case "settings": return "Settings";
      case "notifications": return "Notifications";
      case "help": return "Help Center";
      default: return "AdMind AI";
    }
  };

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.slice(0, 5));
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (e) { }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {isClient ? (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none shadow-2xl">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Access dashboard, insights, chat, and upload.
              </SheetDescription>
              <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-10 h-10 md:hidden" />
        )}
        <h2 className="font-black text-xl tracking-tight">
          {isClient ? getTitle() : "AdMind AI"}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search metrics..."
            className="h-10 w-64 pl-10 pr-4 rounded-full bg-muted/50 border-none text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5 transition-colors group">
              <Bell size={20} className="group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full ring-2 ring-background animate-in zoom-in duration-300">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-3xl border-none shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 border-b flex items-center justify-between bg-primary/5">
              <h3 className="font-bold">Notifications</h3>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold h-7 px-2 rounded-full" onClick={markAllRead}>
                Mark all read
              </Button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="p-4 focus:bg-muted/50 cursor-pointer border-b last:border-0 border-muted/30">
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    )}>
                      {n.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className={cn("text-xs font-bold leading-tight", !n.isRead ? "text-foreground" : "text-muted-foreground")}>{n.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-muted-foreground pt-1">{format(new Date(n.createdAt), "h:mm a")}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              )}
            </div>
            <div className="p-2 border-t">
              <Link href="/notifications" className="block">
                <Button variant="ghost" className="w-full text-[10px] uppercase font-bold h-8 rounded-2xl">
                  View all notifications
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Quick Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
          <Sparkles size={14} className="text-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Nemotron Active</span>
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-muted/50 ml-1">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
              }
            }}
          />
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-[11px] font-bold leading-none">dw User</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">Pro Plan</span>
          </div>
        </div>
      </div>
    </header>
  );
}
