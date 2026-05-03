"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle,
  Clock,
  Check,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-green-500" size={20} />;
      case "warning": return <AlertTriangle className="text-yellow-500" size={20} />;
      case "error": return <XCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your campaign performance alerts.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={markAllAsRead} 
          className="rounded-full gap-2 font-bold"
          disabled={notifications.every(n => n.isRead)}
        >
          <Check size={16} /> Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={cn(
            "border-none shadow-sm rounded-3xl transition-all hover:shadow-md",
            !n.isRead ? "bg-primary/5 ring-1 ring-primary/10" : "bg-card"
          )}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                  !n.isRead ? "bg-background shadow-sm" : "bg-muted/50"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn("font-bold text-sm", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {format(new Date(n.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && notifications.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Bell size={32} />
            </div>
            <div className="space-y-1">
              <p className="font-bold">No new notifications</p>
              <p className="text-sm text-muted-foreground">We&apos;ll let you know when something important happens.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
