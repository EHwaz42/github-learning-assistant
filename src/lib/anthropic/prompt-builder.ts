import { ChatContext } from "@/types";
import { detectLanguage } from "@/lib/shared/language-detector";
import {
  BASE_PROMPT,
  REPO_ANALYSIS_PROMPT,
  FILE_EXPLANATION_PROMPT,
  DISCOVERY_PROMPT,
  LEARNING_PROMPT,
} from "./prompts";

export function buildSystemPrompt(context?: ChatContext): string {
  if (!context) return BASE_PROMPT;

  const parts = [BASE_PROMPT];

  if (context.repo) {
    parts.push(
      REPO_ANALYSIS_PROMPT
        .replace("{owner}", context.repo.owner)
        .replace("{repo}", context.repo.repo)
        .replace("{platform}", context.repo.platform === "gitee" ? "Gitee" : "GitHub")
        .replace("{description}", context.repo.description || "无描述")
        .replace("{language}", context.repo.language || "未知")
        .replace("{stars}", String(context.repo.stars))
        .replace("{topics}", context.repo.topics?.join(", ") || "无")
        .replace("{fileTree}", context.repo.fileTree)
        .replace("{readme}", context.repo.readme || "无 README")
    );
  }

  if (context.repo?.activeFile) {
    const lang = detectLanguage(context.repo.activeFile.path);
    parts.push(
      FILE_EXPLANATION_PROMPT
        .replace("{filePath}", context.repo.activeFile.path)
        .replace("{language}", lang)
        .replace(/\{language\}/g, lang)
        .replace("{fileContent}", context.repo.activeFile.content)
    );
  }

  if (context.mode === "discovery" && context.interests) {
    parts.push(
      DISCOVERY_PROMPT
        .replace("{interests}", context.interests)
        .replace("{searchResultsJson}", "（搜索结果将由系统填充）")
    );
  }

  if (context.mode === "learning" && context.learningStep !== undefined) {
    parts.push(
      LEARNING_PROMPT
        .replace(/\{stepNumber\}/g, String(context.learningStep))
        .replace(/\{totalSteps\}/g, "5")
        .replace(/\{stepDescription\}/g, "")
        .replace(/\{relatedFiles\}/g, "")
        .replace(/\{completedSteps\}/g, "0")
    );
  }

  return parts.join("\n\n---\n\n");
}
