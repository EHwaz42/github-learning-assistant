"use client";

import { useState, useCallback } from "react";
import { useRepoStore } from "@/store/repo-store";
import { useLearningStore } from "@/store/learning-store";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearningStep } from "@/types";

export function LearningGuide() {
  const repo = useRepoStore((s) => s.repo);
  const readme = useRepoStore((s) => s.readme);
  const {
    steps, currentStepIndex, completedSteps, isGenerating,
    setSteps, completeStep, nextStep, prevStep, setGenerating,
  } = useLearningStore();
  const addMessage = useChatStore((s) => s.addMessage);

  const generateGuide = useCallback(async () => {
    if (!repo) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `请为以下仓库生成一个5步的学习路径。以JSON格式返回：{"steps": [{"title": "...", "description": "...", "relatedFiles": ["file1", "file2"]}]}。仓库：${repo.owner}/${repo.repo}，描述：${repo.description}，语言：${repo.language}。README：${(readme || "").substring(0, 1000)}`,
            },
          ],
          context: { mode: "learning", learningStep: 1 },
        }),
      });

      const text = await res.text();
      // Parse JSON from Claude's response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const learningSteps: LearningStep[] = parsed.steps.map(
          (s: Omit<LearningStep, "completed" | "step">, i: number) => ({
            ...s,
            step: i + 1,
            completed: false,
          })
        );
        setSteps(learningSteps);
      }
    } catch {
      // fallback: manual steps
      setSteps([
        {
          step: 1,
          title: "了解项目概况",
          description: "阅读 README，理解项目的目标和主要功能",
          relatedFiles: ["README.md"],
          completed: false,
        },
        {
          step: 2,
          title: "查看项目结构",
          description: "浏览顶层目录，了解项目的组织方式",
          relatedFiles: [],
          completed: false,
        },
        {
          step: 3,
          title: "找到入口文件",
          description: "找到项目的入口文件（main、index、app 等）",
          relatedFiles: ["package.json", "index.js", "main.py"],
          completed: false,
        },
        {
          step: 4,
          title: "理解核心逻辑",
          description: "阅读核心模块，理解主要功能如何实现",
          relatedFiles: [],
          completed: false,
        },
        {
          step: 5,
          title: "运行和修改",
          description: "尝试在本地运行项目，做一些小修改",
          relatedFiles: [],
          completed: false,
        },
      ]);
    } finally {
      setGenerating(false);
    }
  }, [repo, readme, setSteps, setGenerating]);

  const handleStepClick = useCallback(
    (step: LearningStep) => {
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: `我正在学习这个项目的第 ${step.step} 步：${step.title}。请帮我理解和完成这一步。\n\n步骤说明：${step.description}\n\n相关文件：${step.relatedFiles.join(", ") || "无"}`,
        timestamp: Date.now(),
      });
    },
    [addMessage]
  );

  if (!repo) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          请先加载一个仓库来生成学习路径
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold mb-2">学习路径</h3>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-8"
          onClick={generateGuide}
          disabled={isGenerating}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          {isGenerating ? "生成中..." : "生成学习路径"}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {steps.length === 0 && !isGenerating && (
            <p className="text-xs text-muted-foreground text-center py-4">
              点击"生成学习路径"，AI 将为你规划学习顺序
            </p>
          )}

          {steps.length > 0 && (
            <div className="space-y-1">
              {steps.map((step, i) => {
                const isCompleted = completedSteps.has(i);
                const isCurrent = currentStepIndex === i;

                return (
                  <button
                    key={step.step}
                    onClick={() => handleStepClick(step)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      isCurrent && "border-primary bg-primary/5",
                      isCompleted && "opacity-60",
                      "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          第 {step.step} 步：{step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                        {step.relatedFiles.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📄 {step.relatedFiles.join(", ")}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {steps.length > 0 && (
        <div className="p-3 border-t flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            上一步
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentStepIndex + 1} / {steps.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7"
            onClick={() => {
              completeStep(currentStepIndex);
              nextStep();
            }}
            disabled={currentStepIndex >= steps.length - 1}
          >
            完成，下一步
          </Button>
        </div>
      )}
    </div>
  );
}
