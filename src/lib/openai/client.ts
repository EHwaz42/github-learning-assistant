import OpenAI from "openai";

let cached: { key: string; baseURL: string; client: OpenAI } | null = null;

export function getOpenAI(apiKey?: string, baseURL?: string): OpenAI {
  const effectiveKey = apiKey || process.env.OPENAI_API_KEY || "";
  const effectiveBase = baseURL || process.env.OPENAI_BASE_URL || "";

  if (
    cached &&
    cached.key === effectiveKey &&
    cached.baseURL === effectiveBase
  ) {
    return cached.client;
  }

  const config: { apiKey: string; baseURL?: string } = {
    apiKey: effectiveKey,
  };
  if (effectiveBase) config.baseURL = effectiveBase;

  const client = new OpenAI(config);
  cached = { key: effectiveKey, baseURL: effectiveBase, client };
  return client;
}
