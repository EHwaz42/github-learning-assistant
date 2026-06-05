export function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", rs: "rust", go: "go", java: "java",
    rb: "ruby", php: "php",
    css: "css", html: "html", json: "json",
    yaml: "yaml", yml: "yaml", md: "markdown",
    sql: "sql", sh: "bash",
    c: "c", cpp: "cpp", h: "c",
    vue: "vue", svelte: "svelte",
    swift: "swift", kt: "kotlin", scala: "scala",
    dart: "dart", lua: "lua", r: "r",
  };
  return map[ext || ""] || "plaintext";
}
