import { create } from "zustand";
import { Message } from "@/types";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamAbortController: AbortController | null;

  addMessage: (message: Message) => void;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  stopStreaming: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamAbortController: null,

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  appendToLastMessage: (chunk) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      } else {
        msgs.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: chunk,
          timestamp: Date.now(),
        });
      }
      return { messages: msgs };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setAbortController: (controller) => set({ streamAbortController: controller }),

  stopStreaming: () => {
    const { streamAbortController } = get();
    streamAbortController?.abort();
    set({ isStreaming: false, streamAbortController: null });
  },

  clearMessages: () => set({ messages: [] }),
}));
