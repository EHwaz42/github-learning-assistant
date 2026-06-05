"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Provider } from "@/lib/settings/config";
import { cn } from "@/lib/utils";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "anthropic", label: "Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "deepseek", label: "DeepSeek" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const store = useSettingsStore();

  const [provider, setProvider] = useState<Provider>(store.provider);
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("");
  const [openaiBaseURL, setOpenaiBaseURL] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [giteeToken, setGiteeToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const partial: Record<string, string> = { provider };
    if (anthropicApiKey) partial.anthropicApiKey = anthropicApiKey;
    if (anthropicModel) partial.anthropicModel = anthropicModel;
    if (openaiApiKey) partial.openaiApiKey = openaiApiKey;
    if (openaiModel) partial.openaiModel = openaiModel;
    if (openaiBaseURL) partial.openaiBaseURL = openaiBaseURL;
    if (githubToken) partial.githubToken = githubToken;
    if (giteeToken) partial.giteeToken = giteeToken;

    const ok = await store.saveSettings(partial);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setAnthropicApiKey("");
      setOpenaiApiKey("");
      setGithubToken("");
      setGiteeToken("");
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const baseURLPlaceholder =
    provider === "deepseek" ? "https://api.deepseek.com" : "https://api.openai.com/v1";

  const modelPlaceholder =
    provider === "anthropic"
      ? "claude-sonnet-4-5-20250929"
      : provider === "deepseek"
        ? "deepseek-chat"
        : "gpt-4o";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={String(open)} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API 调用</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* ---- AI 模型 ---- */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              AI 模型
            </p>

            {/* Provider selector */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-muted mb-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-md transition-colors",
                    provider === p.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* API Key */}
            <label className="flex flex-col gap-1.5 mb-2.5">
              <span className="text-xs text-muted-foreground">
                {provider === "anthropic" ? "Anthropic API Key" : "API Key"}
              </span>
              <Input
                type="password"
                placeholder={
                  provider === "anthropic"
                    ? store.hasAnthropicKey
                      ? "已设置 (输入新值覆盖)"
                      : "sk-ant-..."
                    : store.hasOpenAIKey
                      ? "已设置 (输入新值覆盖)"
                      : "sk-..."
                }
                value={provider === "anthropic" ? anthropicApiKey : openaiApiKey}
                onChange={(e) =>
                  provider === "anthropic"
                    ? setAnthropicApiKey(e.target.value)
                    : setOpenaiApiKey(e.target.value)
                }
                className="font-mono"
              />
            </label>

            {/* Model */}
            <label className="flex flex-col gap-1.5 mb-2.5">
              <span className="text-xs text-muted-foreground">模型</span>
              <Input
                type="text"
                placeholder={modelPlaceholder}
                value={provider === "anthropic" ? anthropicModel : openaiModel}
                onChange={(e) =>
                  provider === "anthropic"
                    ? setAnthropicModel(e.target.value)
                    : setOpenaiModel(e.target.value)
                }
                className="font-mono"
              />
            </label>

            {/* Base URL (only for OpenAI-compatible) */}
            {(provider === "openai" || provider === "deepseek") && (
              <label className="flex flex-col gap-1.5 mb-2.5">
                <span className="text-xs text-muted-foreground">Base URL</span>
                <Input
                  type="text"
                  placeholder={baseURLPlaceholder}
                  value={openaiBaseURL}
                  onChange={(e) => setOpenaiBaseURL(e.target.value)}
                  className="font-mono"
                />
              </label>
            )}
          </div>

          <Separator />

          {/* ---- GitHub ---- */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              GitHub
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Personal Access Token
                <span className="text-muted-foreground/50"> · 可选，提升限流</span>
              </span>
              <Input
                type="password"
                placeholder={
                  store.hasGithubToken ? "已设置 (输入新值覆盖)" : "ghp_..."
                }
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="font-mono"
              />
            </label>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
              不填则匿名访问（60 次/小时），填入 token 后提升至 5000 次/小时。
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 ml-1"
              >
                创建 token →
              </a>
            </p>
          </div>

          <Separator />

          {/* ---- Gitee ---- */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Gitee
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                私人令牌
                <span className="text-muted-foreground/50"> · 可选，提升限流</span>
              </span>
              <Input
                type="password"
                placeholder={
                  store.hasGiteeToken ? "已设置 (输入新值覆盖)" : "输入 Gitee 私人令牌..."
                }
                value={giteeToken}
                onChange={(e) => setGiteeToken(e.target.value)}
                className="font-mono"
              />
            </label>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
              不填则匿名访问，填入 token 后提升 API 限额。
              <a
                href="https://gitee.com/profile/personal_access_tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 ml-1"
              >
                创建 token →
              </a>
            </p>
          </div>
        </div>

        <DialogFooter>
          {saved && (
            <span className="text-xs text-green-600 dark:text-green-400 self-center mr-auto">
              已保存
            </span>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
