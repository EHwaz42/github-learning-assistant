"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chat-store";
import { useRepoStore } from "@/store/repo-store";
import { Message, ChatContext } from "@/types";

export function useChat() {
  const {
    messages,
    isStreaming,
    addMessage,
    appendToLastMessage,
    setStreaming,
    setAbortController,
    stopStreaming,
    clearMessages,
  } = useChatStore();

  const { repo, fileTree, activeFile, readme } = useRepoStore();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      const abortController = new AbortController();
      setAbortController(abortController);
      setStreaming(true);

      // Build context from current state
      const context: ChatContext = {
        mode: repo ? "analysis" : "general",
      };

      if (repo) {
        context.repo = {
          owner: repo.owner,
          repo: repo.repo,
          platform: repo.platform,
          description: repo.description,
          language: repo.language,
          topics: repo.topics,
          stars: repo.stars,
          fileTree: formatFileTree(fileTree),
          readme: readme || "",
        };
        if (activeFile) {
          context.repo.activeFile = activeFile;
        }
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: userMessage.role, content: userMessage.content },
            ],
            context,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error("请求失败");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text_delta") {
                  appendToLastMessage(data.content);
                } else if (data.type === "error") {
                  appendToLastMessage(`\n\n❌ 出错了：${data.message}`);
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        appendToLastMessage("\n\n❌ 连接中断，请重试。");
      } finally {
        setStreaming(false);
        setAbortController(null);
      }
    },
    [
      messages, isStreaming, repo, fileTree, activeFile, readme,
      addMessage, appendToLastMessage, setStreaming, setAbortController, stopStreaming,
    ]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}

function formatFileTree(nodes: import("@/types").FileNode[], indent = 0): string {
  return nodes
    .map((n) => {
      const prefix = "  ".repeat(indent) + (n.type === "dir" ? "📁 " : "📄 ");
      const line = `${prefix}${n.name}`;
      if (n.children) {
        return line + "\n" + formatFileTree(n.children, indent + 1);
      }
      return line;
    })
    .join("\n");
}
