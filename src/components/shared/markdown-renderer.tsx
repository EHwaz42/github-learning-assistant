"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");
          if (match) {
            return <CodeBlock language={match[1]} code={code} />;
          }
          return (
            <code
              className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>;
        },
        h2({ children }) {
          return <h2 className="mt-4 mb-2 text-lg font-semibold">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="mt-3 mb-1 text-base font-semibold">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-3 border-primary/30 pl-3 my-2 text-muted-foreground italic">
              {children}
            </blockquote>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
