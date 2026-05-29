import { NextRequest, NextResponse } from "next/server";
import { ghFetch } from "@/lib/github/client";

export async function POST(req: NextRequest) {
  try {
    const { query, language, maxResults = 5 } = await req.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "请输入搜索关键词" } },
        { status: 400 }
      );
    }

    let searchQuery = query;
    if (language) {
      searchQuery += ` language:${language}`;
    }

    const data = await ghFetch<{
      items: {
        full_name: string;
        description: string;
        stargazers_count: number;
        language: string;
        topics: string[];
        html_url: string;
        owner: { login: string };
        name: string;
      }[];
      total_count: number;
    }>("/search/repositories", {
      params: {
        q: searchQuery,
        sort: "stars",
        order: "desc",
        per_page: String(maxResults),
      },
    });

    const results = data.items.map((item) => ({
      owner: item.owner.login,
      repo: item.name,
      fullName: item.full_name,
      description: item.description || "",
      stars: item.stargazers_count,
      language: item.language || "",
      topics: item.topics || [],
      url: item.html_url,
      beginnerFriendly: assessBeginnerFriendly(item),
      matchReason: "",
    }));

    return NextResponse.json({
      success: true,
      data: { query, results, totalCount: data.total_count },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "RATE_LIMITED") {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "GitHub API 速率限制" } },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "UPSTREAM_ERROR", message: "搜索失败" } },
      { status: 500 }
    );
  }
}

function assessBeginnerFriendly(item: {
  description: string;
  topics: string[];
}): "高" | "中" | "低" {
  const text = (item.description + " " + item.topics.join(" ")).toLowerCase();
  const beginnerTerms = [
    "beginner", "tutorial", "learn", "simple", "easy",
    "starter", "getting-started", "introduction", "101",
    "新手", "入门", "教程", "简单",
  ];
  const advancedTerms = [
    "advanced", "enterprise", "production", "high-performance",
    "distributed", "scalable", "optimization",
  ];

  const hasBeginner = beginnerTerms.some((t) => text.includes(t));
  const hasAdvanced = advancedTerms.some((t) => text.includes(t));

  if (hasBeginner && !hasAdvanced) return "高";
  if (hasBeginner && hasAdvanced) return "中";
  return "低";
}
