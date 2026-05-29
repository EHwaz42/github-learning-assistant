"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useUIStore } from "@/store/ui-store";
import { useChat } from "@/hooks/use-chat";
import { useRepoStore } from "@/store/repo-store";
import { MessageItem } from "@/components/chat/message-item";
import { ChatInput } from "@/components/chat/chat-input";
import { parseGitHubUrl } from "@/lib/github/repo-parser";
import { useRepo } from "@/hooks/use-repo";
import { Minimize2, Maximize2, X, GripHorizontal } from "lucide-react";

export function MiniPopup() {
  const {
    popupVisible, popupMinimized, popupPosition, popupSize,
    setPopupPosition, setPopupSize, setPopupMinimized, setPopupVisible,
  } = useUIStore();

  const { messages, isStreaming, sendMessage, stopStreaming } = useChat();
  const repo = useRepoStore((s) => s.repo);
  const { analyzeUrl } = useRepo();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button, textarea, input")) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...popupPosition };

      const onMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        setPopupPosition({
          x: Math.max(0, Math.min(window.innerWidth - 100, posStart.current.x + ev.clientX - dragStart.current.x)),
          y: Math.max(0, Math.min(window.innerHeight - 40, posStart.current.y + ev.clientY - dragStart.current.y)),
        });
      };
      const onUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [popupPosition, setPopupPosition]
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      isResizing.current = true;
      resizeStart.current = { x: e.clientX, y: e.clientY, w: popupSize.width, h: popupSize.height };

      const onMove = (ev: MouseEvent) => {
        if (!isResizing.current) return;
        setPopupSize({
          width: Math.max(300, Math.min(window.innerWidth * 0.8, resizeStart.current.w + ev.clientX - resizeStart.current.x)),
          height: Math.max(200, Math.min(window.innerHeight * 0.8, resizeStart.current.h + ev.clientY - resizeStart.current.y)),
        });
      };
      const onUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [popupSize, setPopupSize]
  );

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

  if (!popupVisible) return null;

  return (
    <div
      className="fixed z-50 rounded-xl border bg-background shadow-2xl flex flex-col overflow-hidden"
      style={{
        left: popupPosition.x,
        top: popupPosition.y,
        width: popupMinimized ? 260 : popupSize.width,
        height: popupMinimized ? "auto" : popupSize.height,
        transition: popupMinimized ? "height 0.2s" : "none",
      }}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">📖 学习助手</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPopupMinimized(!popupMinimized)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            {popupMinimized ? (
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => setPopupVisible(false)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {!popupMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2" ref={messagesEndRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                  粘贴 GitHub 链接或输入问题，我来帮你理解项目
                </p>
              </div>
            ) : (
              messages.slice(-10).map((msg) => (
                <div key={msg.id} className="text-xs py-1">
                  <MessageItem message={msg} />
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t">
            <textarea
              placeholder="问点什么..."
              rows={1}
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
              className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={onResizeMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, hsl(var(--muted-foreground) / 0.3) 50%)",
            }}
          />
        </>
      )}
    </div>
  );
}
