"use client";

import { useState, useCallback, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="粘贴 GitHub 仓库链接..."
        className="text-xs h-8"
        disabled={isLoading}
      />
      <Button type="submit" size="sm" disabled={isLoading || !url.trim()} className="h-8 px-3">
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5" />
        )}
      </Button>
    </form>
  );
}
