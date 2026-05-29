"use client";

import { useRepo } from "@/hooks/use-repo";
import { FileTree } from "./file-tree";
import { RepoUrlInput } from "./repo-url-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, GitBranch, ExternalLink } from "lucide-react";

export function RepoPanel() {
  const { repo, fileTree, activeFile, isLoading, error, analyzeUrl, loadFile } = useRepo();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <RepoUrlInput onSubmit={analyzeUrl} isLoading={isLoading} />
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>

      {isLoading && (
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      )}

      {repo && !isLoading && (
        <div className="p-3 border-b space-y-2">
          <h3 className="font-semibold text-sm truncate">
            <a
              href={`https://github.com/${repo.owner}/${repo.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              {repo.fullName}
              <ExternalLink className="w-3 h-3" />
            </a>
          </h3>
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" /> {repo.stars.toLocaleString()}
            </span>
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {repo.language}
              </span>
            )}
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repo.topics.slice(0, 5).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {repo && !isLoading && (
        <ScrollArea className="flex-1">
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              📁 文件结构
            </p>
            <FileTree
              nodes={fileTree}
              onFileClick={loadFile}
              activeFilePath={activeFile?.path}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
