"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, ExternalLink, Sparkles } from "lucide-react";
import { RepoRecommendation } from "@/types";
import { useRepo } from "@/hooks/use-repo";
import { useChatStore } from "@/store/chat-store";

export function DiscoveryPanel() {
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RepoRecommendation[]>([]);
  const { analyzeUrl } = useRepo();
  const addMessage = useChatStore((s) => s.addMessage);

  const handleSearch = useCallback(async () => {
    if (!interests.trim() || loading) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("/api/github/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: interests, maxResults: 5 }),
      });
      const data = await res.json();

      if (data.success) {
        setResults(data.data.results);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [interests, loading]);

  const handleExplore = useCallback(
    (rec: RepoRecommendation) => {
      analyzeUrl(rec.url);
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: `帮我分析 ${rec.fullName}，我是新手，从哪里开始看比较好？`,
        timestamp: Date.now(),
      });
    },
    [analyzeUrl, addMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold mb-2">发现项目</h3>
        <div className="flex gap-2">
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="描述你想学什么..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={loading || !interests.trim()}
            className="h-8 px-3"
          >
            {loading ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}

          {!loading &&
            results.map((rec) => (
              <div
                key={rec.fullName}
                className="rounded-xl border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {rec.fullName}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    {rec.stars.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {rec.description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {rec.language || "N/A"}
                  </Badge>
                  <Badge
                    variant={
                      rec.beginnerFriendly === "高"
                        ? "default"
                        : rec.beginnerFriendly === "中"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    新手友好: {rec.beginnerFriendly}
                  </Badge>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-7"
                  onClick={() => handleExplore(rec)}
                >
                  分析这个项目
                </Button>
              </div>
            ))}

          {!loading && results.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              描述你的兴趣，我会帮你找到合适的开源项目
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
