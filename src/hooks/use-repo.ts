"use client";

import { useCallback } from "react";
import { useRepoStore } from "@/store/repo-store";
import { useChatStore } from "@/store/chat-store";

export function useRepo() {
  const {
    repo, fileTree, activeFile, readme, isLoading, error,
    setRepo, setFileTree, setActiveFile, setReadme, setLoading, setError, clearRepo,
  } = useRepoStore();

  const addMessage = useChatStore((s) => s.addMessage);

  const analyzeUrl = useCallback(
    async (url: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/github/repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message || "获取仓库失败");
          return;
        }

        setRepo(data.data.repo);
        setFileTree(data.data.fileTree);
        setReadme(data.data.readme);

        addMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: `已加载仓库 **${data.data.repo.fullName}**！\n\n这是一个 ${data.data.repo.language || "未知"} 语言的项目，获得了 ${data.data.repo.stars.toLocaleString()} 个 Star。\n\n**描述**：${data.data.repo.description || "无"}\n\n你可以：\n- 💬 问我关于这个项目的任何问题\n- 📁 点击左侧文件树浏览源代码\n- 🔍 让我解释某个文件或函数\n- 📖 让我生成一个学习路径`,
          timestamp: Date.now(),
        });

        if (data.data.truncated) {
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ 这是一个大型项目，文件树已截断（仅显示部分文件）。你可以点击特定目录查看更多。`,
            timestamp: Date.now(),
          });
        }
      } catch {
        setError("网络错误，请检查链接后重试");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setRepo, setFileTree, setReadme, addMessage]
  );

  const loadFile = useCallback(
    async (path: string) => {
      if (!repo) return;

      try {
        const res = await fetch(
          `/api/github/file?owner=${repo.owner}&repo=${repo.repo}&path=${encodeURIComponent(path)}`
        );
        const data = await res.json();

        if (data.success) {
          setActiveFile({ path: data.data.path, content: data.data.content });
        }
      } catch {
        // silent fail for file load
      }
    },
    [repo, setActiveFile]
  );

  return {
    repo, fileTree, activeFile, readme, isLoading, error,
    analyzeUrl, loadFile, clearRepo,
  };
}
