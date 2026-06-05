"use client";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  { text: "粘贴 GitHub / Gitee 链接分析项目", icon: "🔗" },
  { text: "推荐适合新手的 Python 项目", icon: "🐍" },
  { text: "推荐适合新手的 JavaScript 项目", icon: "💛" },
  { text: "我想学习 AI/机器学习，有什么项目推荐？", icon: "🤖" },
  { text: "帮我找一些有趣的小项目练手", icon: "🎯" },
  { text: "怎么读懂一个开源项目？", icon: "📖" },
];

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">开源项目学习助手</h2>
        <p className="text-muted-foreground mb-8">
          粘贴一个 GitHub 或 Gitee 仓库链接，或者告诉我你想学什么，我来帮你分析和推荐项目。
        </p>

        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestion(s.text)}
              className="text-left p-3 rounded-xl border hover:bg-muted/50 transition-colors text-sm"
            >
              <span className="mr-2">{s.icon}</span>
              {s.text}
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          也可以直接在输入框粘贴链接，我会自动识别平台
        </p>
      </div>
    </div>
  );
}
