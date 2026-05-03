"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface SessionListProps {
  sessions: any[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
}

export function SessionList({ sessions, selectedId, onSelect, onRefresh }: SessionListProps) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete session");
      toast.success("Chat deleted");
      if (selectedId === id) onSelect(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <Button 
          onClick={() => onSelect(null)}
          className="w-full rounded-full gap-2 font-bold shadow-md shadow-primary/10"
        >
          <Plus size={18} /> New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full text-left p-3 rounded-2xl transition-all group flex items-start gap-3 relative cursor-pointer",
                selectedId === s.id ? "bg-accent/50 text-accent-foreground shadow-sm" : "hover:bg-muted"
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-background">
                <MessageSquare size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs truncate">{s.title || "New Conversation"}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(s.updatedAt), "MMM d")}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground truncate">
                    {s.messageCount || 0} messages
                  </p>
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-muted-foreground">No recent chats</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
