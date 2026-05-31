const PLACEHOLDER_TOKENS = [
  "",
  "ghp_your_token_here",
  "your_github_token",
  "your_token_here",
  "ghp_yourtoken",
];

function isValidToken(t: string): boolean {
  return t.length > 0 && !PLACEHOLDER_TOKENS.includes(t.trim().toLowerCase());
}

interface GhOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function ghFetch<T = unknown>(
  path: string,
  options: GhOptions = {},
  token?: string
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(`https://api.github.com${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(init.headers as Record<string, string>),
  };

  // Priority: passed token > env var (both filtered for placeholders)
  const effectiveToken = isValidToken(token || "")
    ? token!
    : process.env.GITHUB_TOKEN
      ? process.env.GITHUB_TOKEN.trim()
      : "";

  if (isValidToken(effectiveToken)) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${effectiveToken}`;
  }

  const res = await fetch(url.toString(), { ...init, headers });

  if (res.status === 401) {
    throw new Error("BAD_CREDENTIALS");
  }
  if (res.status === 429 || res.status === 403) {
    throw new Error("RATE_LIMITED");
  }
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}
