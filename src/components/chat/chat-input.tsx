"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="输入消息，或粘贴 GitHub 链接..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {isStreaming ? (
          <Button
            onClick={onStop}
            size="icon"
            variant="destructive"
            className="flex-shrink-0 rounded-xl h-10 w-10"
          >
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            size="icon"
            disabled={!input.trim() || disabled}
            className="flex-shrink-0 rounded-xl h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
