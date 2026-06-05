import { NextRequest, NextResponse } from "next/server";
import { ghFetch } from "@/lib/github/client";
import { giteeFetch } from "@/lib/gitee/client";
import { detectLanguage } from "@/lib/shared/language-detector";
import { readSettings, effectiveGithubToken, effectiveGiteeToken } from "@/lib/settings/config";
import type { Platform } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");
  const platform = searchParams.get("platform") as Platform | null;

  if (!owner || !repo || !path || !platform) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "缺少参数" } },
      { status: 400 }
    );
  }

  try {
    const settings = await readSettings();

    const fetcher = platform === "gitee" ? giteeFetch : ghFetch;
    const token = platform === "gitee"
      ? effectiveGiteeToken(settings)
      : effectiveGithubToken(settings);

    const data = await fetcher<{
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
        { success: false, error: { code: "BAD_CREDENTIALS", message: "API Token 无效" } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "文件不存在" } },
      { status: 404 }
    );
  }
}
