"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-muted/50 rounded-[2rem] p-2 pl-4 border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Button variant="ghost" size="icon" className="rounded-full mb-1 h-8 w-8 text-muted-foreground hover:bg-background">
          <Plus size={18} />
        </Button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data..."
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm py-3 px-1 max-h-32 outline-none"
          disabled={disabled}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="rounded-full h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          <SendHorizontal size={20} />
        </Button>
      </div>
      <p className="text-[10px] text-center text-muted-foreground mt-2">
        AdMind AI can make mistakes. Verify critical data.
      </p>
    </div>
  );
}
