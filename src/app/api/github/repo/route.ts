import { NextRequest, NextResponse } from "next/server";
import { ghFetch } from "@/lib/github/client";
import { giteeFetch } from "@/lib/gitee/client";
import { parseRepoUrl } from "@/lib/shared/repo-parser";
import { buildFileTree, countFiles } from "@/lib/shared/file-tree";
import { readSettings, effectiveGithubToken, effectiveGiteeToken } from "@/lib/settings/config";
import { RepoInfo } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const parsed = parseRepoUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_URL", message: "无效的仓库链接，请输入 GitHub 或 Gitee 仓库地址" } },
        { status: 400 }
      );
    }

    const { platform, owner, repo } = parsed;
    const settings = await readSettings();

    const fetcher = platform === "gitee" ? giteeFetch : ghFetch;
    const token = platform === "gitee"
      ? effectiveGiteeToken(settings)
      : effectiveGithubToken(settings);

    // Fetch repo metadata
    const repoData = await fetcher<{
      full_name: string;
      description: string;
      stargazers_count: number;
      language: string;
      topics: string[];
      default_branch: string;
    }>(`/repos/${owner}/${repo}`, {}, token);

    const repoInfo: RepoInfo = {
      owner,
      repo,
      fullName: repoData.full_name,
      description: repoData.description || "",
      stars: repoData.stargazers_count,
      language: repoData.language || "",
      topics: Array.isArray(repoData.topics) ? repoData.topics : [],
      defaultBranch: repoData.default_branch,
      platform,
    };

    // Fetch file tree
    const treeData = await fetcher<{
      tree: { path: string; type: string; size?: number }[];
      truncated: boolean;
    }>(`/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, {}, token);

    const fileTree = buildFileTree(treeData.tree);

    // Fetch README
    let readme = "";
    try {
      const readmeData = await fetcher<{ content: string }>(
        `/repos/${owner}/${repo}/readme`, {}, token
      );
      readme = Buffer.from(readmeData.content, "base64").toString("utf-8");
    } catch {
      readme = "";
    }

    return NextResponse.json({
      success: true,
      data: {
        repo: repoInfo,
        fileTree,
        readme,
        truncated: treeData.truncated || countFiles(fileTree) > 200,
        totalFiles: treeData.tree.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "BAD_CREDENTIALS") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_CREDENTIALS", message: "API Token 无效，请在侧边栏「API 调用」中检查 token 是否正确" } },
        { status: 401 }
      );
    }
    if (message === "RATE_LIMITED") {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "API 速率限制，请稍后再试或设置 Token" } },
        { status: 429 }
      );
    }
    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "仓库不存在或为私有仓库" } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "UPSTREAM_ERROR", message: "获取仓库信息失败" } },
      { status: 500 }
    );
  }
}
