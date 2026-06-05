export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export type StreamChunk =
  | { type: "text_delta"; content: string }
  | { type: "tool_use"; name: string; input: unknown }
  | { type: "done"; messageId: string; usage?: { input: number; output: number } }
  | { type: "error"; message: string };

export interface ChatContext {
  mode: "general" | "analysis" | "discovery" | "learning";
  repo?: {
    owner: string;
    repo: string;
    platform: string;
    description: string;
    language: string;
    topics: string[];
    stars: number;
    fileTree: string;
    readme: string;
    activeFile?: { path: string; content: string };
  };
  interests?: string;
  learningStep?: number;
}
