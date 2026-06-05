import { create } from "zustand";
import type { Provider } from "@/lib/settings/config";

export interface SettingsState {
  provider: Provider;
  anthropicApiKey: string;
  anthropicModel: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiBaseURL: string;
  githubToken: string;
  giteeToken: string;
  hasAnthropicKey: boolean;
  hasOpenAIKey: boolean;
  hasGithubToken: boolean;
  hasGiteeToken: boolean;
  loading: boolean;
  configured: boolean;

  fetchSettings: () => Promise<void>;
  saveSettings: (partial: Partial<SettingsState>) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  provider: "anthropic",
  anthropicApiKey: "",
  anthropicModel: "claude-sonnet-4-5-20250929",
  openaiApiKey: "",
  openaiModel: "gpt-4o",
  openaiBaseURL: "",
  githubToken: "",
  giteeToken: "",
  hasAnthropicKey: false,
  hasOpenAIKey: false,
  hasGithubToken: false,
  hasGiteeToken: false,
  loading: true,
  configured: false,

  fetchSettings: async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) {
        set({
          ...json.data,
          loading: false,
          configured: json.data.hasAnthropicKey || json.data.hasOpenAIKey,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  saveSettings: async (partial) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (json.success) {
        set({
          ...json.data,
          configured: json.data.hasAnthropicKey || json.data.hasOpenAIKey,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
