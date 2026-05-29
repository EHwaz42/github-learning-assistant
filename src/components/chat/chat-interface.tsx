"use client";

import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@/hooks/use-chat";
import { useRepoStore } from "@/store/repo-store";
import { MessageItem } from "./message-item";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";
import { parseGitHubUrl } from "@/lib/github/repo-parser";
import { useRepo } from "@/hooks/use-repo";

export function ChatInterface() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { analyzeUrl } = useRepo();
  const repo = useRepoStore((s) => s.repo);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    (content: string) => {
      const urlMatch = parseGitHubUrl(content);
      if (urlMatch && !repo) {
        analyzeUrl(content);
      }
      sendMessage(content);
    },
    [sendMessage, analyzeUrl, repo]
  );

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 ? (
            <EmptyState onSuggestion={handleSend} />
          ) : (
            messages.map((msg, i) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleSend}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
