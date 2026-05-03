"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export function MessageBubble({ role, content, isTyping }: MessageBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn(
      "flex w-full gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
          <Sparkles size={18} />
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] px-5 py-3 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
        isAssistant 
          ? "bg-card border text-card-foreground rounded-tl-none" 
          : "bg-primary text-primary-foreground rounded-tr-none"
      )}>
        {isAssistant ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            {isTyping && (
              <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 mt-1 overflow-hidden">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
