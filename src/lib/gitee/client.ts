const PLACEHOLDER_TOKENS = [
  "",
  "your_token_here",
  "your_gitee_token",
  "gitee_token",
];

function isValidToken(t: string): boolean {
  return t.length > 0 && !PLACEHOLDER_TOKENS.includes(t.trim().toLowerCase());
}

interface GeOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function giteeFetch<T = unknown>(
  path: string,
  options: GeOptions = {},
  token?: string
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(`https://gitee.com/api/v5${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const effectiveToken = isValidToken(token || "")
    ? token!
    : process.env.GITEE_TOKEN
      ? process.env.GITEE_TOKEN.trim()
      : "";

  if (isValidToken(effectiveToken)) {
    url.searchParams.set("access_token", effectiveToken);
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(url.toString(), { ...init, headers });

  if (res.status === 401) {
    throw new Error("BAD_CREDENTIALS");
  }
  if (res.status === 403 || res.status === 429) {
    throw new Error("RATE_LIMITED");
  }
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`Gitee API error: ${res.status}`);
  }

  return res.json();
}
