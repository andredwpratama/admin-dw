"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SessionList } from "@/components/chat/SessionList";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Eraser, Zap, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Session {
  id: string;
  title: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSessions([]);
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}`);
      const data = await res.json();
      setMessages(data?.messages || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    // Wrap in void to indicate intent and avoid synchronous call linter warning if any
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) {
      void fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMsg = { id: Date.now().toString(), role: "user" as const, content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: content,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!activeSessionId) {
        setActiveSessionId(data.sessionId);
        fetchSessions();
      }

      setMessages(prev => [...prev, data.message]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearContext = async () => {
    if (!activeSessionId || !confirm("Clear all context memory for this session?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${activeSessionId}/clear`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear context");
      setMessages([]);
      fetchSessions();
      toast.success("Context memory cleared");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompressContext = async () => {
    if (!activeSessionId) return;
    
    setIsLoading(true);
    const toastId = toast.loading("Compressing conversation context...");
    try {
      const res = await fetch(`/api/chat/sessions/${activeSessionId}/compress`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to compress context");
      
      await fetchMessages(activeSessionId);
      fetchSessions();
      toast.success("Context compressed into summary memory", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-[2.5rem] overflow-hidden border bg-card/30 backdrop-blur-sm shadow-xl">
      <SessionList 
        sessions={sessions} 
        selectedId={activeSessionId} 
        onSelect={setActiveSessionId} 
        onRefresh={fetchSessions}
      />
      
      <main className="flex-1 flex flex-col bg-background/50 relative">
        {/* Chat Header */}
        <div className="h-14 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              AI Analyst Active
            </span>
          </div>

          {activeSessionId && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full gap-2 text-muted-foreground hover:text-foreground">
                    <Settings2 size={14} />
                    <span className="text-[10px] font-bold uppercase">Memory Tools</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                  <DropdownMenuItem onClick={handleCompressContext} className="gap-2 cursor-pointer">
                    <Zap size={14} className="text-orange-500" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Compress Context</span>
                      <span className="text-[9px] text-muted-foreground">Summarize history to save tokens</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearContext} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Eraser size={14} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Clear Memory</span>
                      <span className="text-[9px] text-muted-foreground">Reset all session history</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full" viewportRef={scrollRef}>
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-2">
              {(messages?.length === 0) && !isLoading && (
                <div className="py-20 flex flex-col items-center text-center space-y-12">
                  <div className="space-y-4">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-0.5 shadow-2xl shadow-primary/20">
                      <div className="w-full h-full bg-background rounded-[2.4rem] flex items-center justify-center">
                        <Sparkles className="text-primary w-10 h-10" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-black tracking-tight mb-2">Chat Analyst</h2>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Your intelligent partner for marketing data and campaign insights.
                      </p>
                    </div>
                  </div>
                  
                  <SuggestedQuestions onSelect={handleSend} />
                </div>
              )}
              
              {messages?.filter(m => m.role !== "system").map((m) => (
                <MessageBubble 
                  key={m.id} 
                  role={m.role as "user" | "assistant"} 
                  content={m.content} 
                />
              ))}

              {isTyping && (
                <MessageBubble 
                  role="assistant" 
                  content="..." 
                  isTyping={true}
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </main>
    </div>
  );
}
