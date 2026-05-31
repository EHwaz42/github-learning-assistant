import { NextRequest, NextResponse } from "next/server";
import { ghFetch } from "@/lib/github/client";
import { readSettings, effectiveGithubToken } from "@/lib/settings/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");

  if (!owner || !repo || !path) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "缺少参数" } },
      { status: 400 }
    );
  }

  try {
    const settings = await readSettings();
    const token = effectiveGithubToken(settings);

    const data = await ghFetch<{
      content: string;
      size: number;
      encoding: string;
    }>(`/repos/${owner}/${repo}/contents/${path}`, {}, token);

    if (data.size > 100_000) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "文件过大" } },
        { status: 400 }
      );
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const lang = detectLanguage(path);

    return NextResponse.json({
      success: true,
      data: { path, content, size: data.size, language: lang },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "BAD_CREDENTIALS") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_CREDENTIALS", message: "GITHUB_TOKEN 无效，请在侧边栏「API 调用」中检查 token 是否正确" } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "文件不存在" } },
      { status: 404 }
    );
  }
}

function detectLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", rs: "rust", go: "go", java: "java",
    css: "css", html: "html", json: "json", md: "markdown",
    sql: "sql", sh: "bash", yml: "yaml", yaml: "yaml",
  };
  return map[ext || ""] || "plaintext";
}
