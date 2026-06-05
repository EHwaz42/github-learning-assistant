import type { Platform } from "@/types";

export function parseRepoUrl(url: string): { platform: Platform; owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\/+$/, "");

  const ghMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)(?!pull|issues|actions|settings|wiki)/
  );
  if (ghMatch) {
    return { platform: "github", owner: ghMatch[1], repo: ghMatch[2] };
  }

  const geMatch = trimmed.match(
    /^https?:\/\/gitee\.com\/([^/]+)\/([^/]+?)(?:\/|$)(?!pull|issues|labels|wiki|boards|members|stars|releases|events)/
  );
  if (geMatch) {
    return { platform: "gitee", owner: geMatch[1], repo: geMatch[2] };
  }

  return null;
}
