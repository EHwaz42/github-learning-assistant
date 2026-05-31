import { NextRequest, NextResponse } from "next/server";
import { ghFetch } from "@/lib/github/client";
import { parseGitHubUrl } from "@/lib/github/repo-parser";
import { readSettings, effectiveGithubToken } from "@/lib/settings/config";
import { RepoInfo, FileNode } from "@/types";

const IGNORE_PATTERNS = [
  "node_modules", ".git", "dist", "build", "__pycache__",
  ".next", "vendor", ".cache", "coverage", ".nyc_output",
  "target", "out", ".turbo", ".idea", ".vscode",
];
const MAX_FILES = 200;
const MAX_DEPTH = 4;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_URL", message: "无效的 GitHub 链接" } },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const settings = await readSettings();
    const token = effectiveGithubToken(settings);

    // Fetch repo metadata
    const repoData = await ghFetch<{
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
      topics: repoData.topics || [],
      defaultBranch: repoData.default_branch,
    };

    // Fetch file tree
    const treeData = await ghFetch<{
      tree: { path: string; type: string; size?: number }[];
      truncated: boolean;
    }>(`/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, {}, token);

    const fileTree = buildFileTree(treeData.tree);

    // Fetch README
    let readme = "";
    try {
      const readmeData = await ghFetch<{ content: string }>(
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
        truncated: treeData.truncated || countFiles(fileTree) > MAX_FILES,
        totalFiles: treeData.tree.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "BAD_CREDENTIALS") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_CREDENTIALS", message: "GITHUB_TOKEN 无效，请在侧边栏「API 调用」中检查 token 是否正确" } },
        { status: 401 }
      );
    }
    if (message === "RATE_LIMITED") {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "GitHub API 速率限制，请稍后再试或设置 GITHUB_TOKEN" } },
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

function buildFileTree(
  entries: { path: string; type: string; size?: number }[]
): FileNode[] {
  const root: FileNode[] = [];
  const dirMap = new Map<string, FileNode>();
  let fileCount = 0;

  const filtered = entries.filter((e) => {
    const parts = e.path.split("/");
    if (parts.length > MAX_DEPTH) return false;
    return !parts.some((p) => IGNORE_PATTERNS.includes(p));
  });

  for (const entry of filtered) {
    if (fileCount >= MAX_FILES) break;

    const parts = entry.path.split("/");
    if (parts.length === 1) {
      if (entry.type === "tree") {
        const dir: FileNode = {
          name: entry.path,
          type: "dir",
          path: entry.path,
          children: [],
        };
        root.push(dir);
        dirMap.set(entry.path, dir);
      } else {
        fileCount++;
        root.push({
          name: entry.path,
          type: "file",
          path: entry.path,
          size: entry.size,
        });
      }
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      const parent = dirMap.get(parentPath);
      if (!parent) continue;

      if (entry.type === "tree") {
        const dir: FileNode = {
          name: parts[parts.length - 1],
          type: "dir",
          path: entry.path,
          children: [],
        };
        parent.children = parent.children || [];
        parent.children.push(dir);
        dirMap.set(entry.path, dir);
      } else {
        fileCount++;
        parent.children = parent.children || [];
        parent.children.push({
          name: parts[parts.length - 1],
          type: "file",
          path: entry.path,
          size: entry.size,
        });
      }
    }
  }

  // Sort: dirs first, then alphabetically
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => n.children && sortNodes(n.children));
  };
  sortNodes(root);

  return root;
}

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === "file") count++;
    if (n.children) count += countFiles(n.children);
  }
  return count;
}
