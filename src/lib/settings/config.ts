import { readFile, writeFile } from "fs/promises";
import path from "path";

export type Provider = "anthropic" | "openai" | "deepseek";

export interface ApiSettings {
  provider: Provider;
  anthropicApiKey: string;
  anthropicModel: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiBaseURL: string;
  githubToken: string;
}

const CONFIG_PATH = path.join(process.cwd(), ".api-config.json");

const DEFAULTS: ApiSettings = {
  provider: "anthropic",
  anthropicApiKey: "",
  anthropicModel: "claude-sonnet-4-5-20250929",
  openaiApiKey: "",
  openaiModel: "gpt-4o",
  openaiBaseURL: "",
  githubToken: "",
};

const PLACEHOLDER_TOKENS = [
  "ghp_your_token_here",
  "your_github_token",
  "your_token_here",
  "ghp_yourtoken",
];

function isPlaceholder(t: string): boolean {
  return PLACEHOLDER_TOKENS.includes(t.trim().toLowerCase());
}

export async function readSettings(): Promise<ApiSettings> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function writeSettings(
  partial: Partial<ApiSettings>
): Promise<ApiSettings> {
  const current = await readSettings();
  const merged: ApiSettings = { ...current, ...partial };
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

/** Return a version safe for the client (keys masked) */
export function maskSettings(s: ApiSettings) {
  const maskKey = (k: string) => (k ? "••••••••" : "");
  return {
    provider: s.provider,
    anthropicApiKey: maskKey(s.anthropicApiKey),
    anthropicModel: s.anthropicModel,
    openaiApiKey: maskKey(s.openaiApiKey),
    openaiModel: s.openaiModel,
    openaiBaseURL: s.openaiBaseURL,
    githubToken: maskKey(s.githubToken),
    hasAnthropicKey: !!s.anthropicApiKey,
    hasOpenAIKey: !!s.openaiApiKey,
    hasGithubToken: !!s.githubToken && !isPlaceholder(s.githubToken),
  };
}

/** Effective config for the active AI provider */
export function effectiveConfig(s: ApiSettings) {
  if (s.provider === "anthropic") {
    return {
      provider: "anthropic" as const,
      apiKey: s.anthropicApiKey,
      model: s.anthropicModel || "claude-sonnet-4-5-20250929",
      baseURL: undefined as string | undefined,
    };
  }
  if (s.provider === "deepseek") {
    return {
      provider: "openai" as const,
      apiKey: s.openaiApiKey,
      model: s.openaiModel || "deepseek-chat",
      baseURL: s.openaiBaseURL || "https://api.deepseek.com",
    };
  }
  return {
    provider: "openai" as const,
    apiKey: s.openaiApiKey,
    model: s.openaiModel || "gpt-4o",
    baseURL: s.openaiBaseURL || undefined,
  };
}

/** Get the effective GitHub token: settings first, then env, filtering placeholders */
export function effectiveGithubToken(s: ApiSettings): string {
  const candidates = [s.githubToken, process.env.GITHUB_TOKEN || ""];
  for (const t of candidates) {
    const trimmed = t.trim();
    if (trimmed && !isPlaceholder(trimmed)) return trimmed;
  }
  return "";
}
