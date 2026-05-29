export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  const trimmed = url.trim().replace(/\/$/, "");

  // https://github.com/owner/repo
  // https://github.com/owner/repo/tree/branch/path
  const match = trimmed.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)(?!pull|issues|actions|settings|wiki)/
  );
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}
