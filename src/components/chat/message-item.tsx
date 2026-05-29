"use client";

import { Message } from "@/types";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Bot, User } from "lucide-react";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 py-4 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
