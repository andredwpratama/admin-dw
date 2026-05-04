"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SessionList } from "@/components/chat/SessionList";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Eraser, Zap, Settings2 } from "lucide-react";
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
  const [thinkingLabel, setThinkingLabel] = useState<string | null>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
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

  useEffect(() => { void fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) void fetchMessages(activeSessionId);
    else setMessages([]);
  }, [activeSessionId, fetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinkingLabel]);

  const handleSend = async (content: string) => {
    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    setMessages(prev => [...prev, { id: userMsgId, role: "user", content }]);
    setIsLoading(true);
    setThinkingLabel("Thinking...");
    setStreamingMsgId(null);

    let hasAddedAiMsg = false;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, message: content }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;

          let event: any;
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          switch (event.type) {
            case "session":
              if (!activeSessionId) {
                setActiveSessionId(event.sessionId);
                void fetchSessions();
              }
              break;

            case "thinking":
              setThinkingLabel(event.label);
              break;

            case "chunk":
              setThinkingLabel(null);
              if (!hasAddedAiMsg) {
                hasAddedAiMsg = true;
                setStreamingMsgId(aiMsgId);
                setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: event.content }]);
              } else {
                setMessages(prev =>
                  prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + event.content } : m)
                );
              }
              break;

            case "done":
              setStreamingMsgId(null);
              break;

            case "error":
              toast.error(event.error ?? "An error occurred");
              break;
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
      setThinkingLabel(null);
      setStreamingMsgId(null);
    }
  };

  const handleClearContext = async () => {
    if (!activeSessionId || !confirm("Clear all context memory for this session?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${activeSessionId}/clear`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear context");
      setMessages([]);
      void fetchSessions();
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
      void fetchSessions();
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
        {/* Header */}
        <div className="h-14 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              AI Analyst Active
            </span>
          </div>

          {activeSessionId && (
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
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full" viewportRef={scrollRef}>
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-2">
              {messages.length === 0 && !isLoading && (
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

              {messages.filter(m => m.role !== "system").map(m => (
                <MessageBubble
                  key={m.id}
                  role={m.role as "user" | "assistant"}
                  content={m.content}
                  isTyping={m.id === streamingMsgId}
                />
              ))}

              {/* Thinking indicator */}
              {thinkingLabel && (
                <div className="flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Sparkles size={18} />
                  </div>
                  <div className="px-5 py-3 rounded-[1.5rem] rounded-tl-none bg-card border text-sm text-muted-foreground flex items-center gap-3 shadow-sm">
                    <span>{thinkingLabel}</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </main>
    </div>
  );
}
