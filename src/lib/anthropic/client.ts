import Anthropic from "@anthropic-ai/sdk";

let cached: { key: string; client: Anthropic } | null = null;

export function getAnthropic(apiKey?: string): Anthropic {
  const key = apiKey || process.env.ANTHROPIC_API_KEY || "";
  if (cached && cached.key === key) return cached.client;

  const client = new Anthropic({ apiKey: key });
  cached = { key, client };
  return client;
}
