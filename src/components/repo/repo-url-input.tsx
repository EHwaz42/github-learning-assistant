"use client";

import { useState, useCallback, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function RepoUrlInput({ onSubmit, isLoading }: RepoUrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = url.trim();
      if (trimmed) onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  const disabled = isLoading || !url.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="粘贴 GitHub / Gitee 仓库链接..."
        className="text-xs h-8"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8",
          "text-sm font-medium transition-colors outline-none",
          "bg-primary text-primary-foreground hover:bg-primary/80",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5" />
        )}
      </button>
    </form>
  );
}
