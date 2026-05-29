const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

interface GhOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function ghFetch<T = unknown>(
  path: string,
  options: GhOptions = {}
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

  if (GITHUB_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(url.toString(), { ...init, headers });

  if (res.status === 429) {
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
