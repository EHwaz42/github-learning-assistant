"use client";

import { useState } from "react";
import { FileNode } from "@/types";
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  nodes: FileNode[];
  onFileClick: (path: string) => void;
  activeFilePath?: string;
  level?: number;
}

export function FileTree({ nodes, onFileClick, activeFilePath, level = 0 }: FileTreeProps) {
  return (
    <ul className={cn(level === 0 ? "" : "ml-3")}>
      {nodes.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          onFileClick={onFileClick}
          activeFilePath={activeFilePath}
          level={level}
        />
      ))}
    </ul>
  );
}

function FileTreeItem({
  node,
  onFileClick,
  activeFilePath,
  level,
}: {
  node: FileNode;
  onFileClick: (path: string) => void;
  activeFilePath?: string;
  level: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);

  if (node.type === "dir") {
    return (
      <li>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full px-1.5 py-1 text-sm hover:bg-muted/50 rounded transition-colors cursor-pointer"
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )}
          />
          {expanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500" />
          )}
          <span className="truncate text-sm">{node.name}</span>
        </button>
        {expanded && node.children && (
          <FileTree
            nodes={node.children}
            onFileClick={onFileClick}
            activeFilePath={activeFilePath}
            level={level + 1}
          />
        )}
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => onFileClick(node.path)}
        className={cn(
          "flex items-center gap-1.5 w-full px-1.5 py-0.5 text-sm hover:bg-muted/50 rounded transition-colors cursor-pointer",
          activeFilePath === node.path && "bg-primary/10 text-primary font-medium"
        )}
      >
        <span className="w-3.5 h-3.5 flex-shrink-0" />
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="truncate text-sm">{node.name}</span>
      </button>
    </li>
  );
}
