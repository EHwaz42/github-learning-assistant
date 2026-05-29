"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative my-2 rounded-lg border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 dark:bg-zinc-800 border-b border-zinc-800">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-zinc-100 font-mono">{code}</code>
      </pre>
    </div>
  );
}
