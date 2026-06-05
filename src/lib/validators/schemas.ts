import { z } from "zod/v4";

export const repoUrlSchema = z.string().refine(
  (val) => {
    return /^https?:\/\/(github|gitee)\.com\/[^/]+\/[^/]+/.test(val.trim());
  },
  { message: "请输入有效的仓库链接，例如 https://github.com/facebook/react 或 https://gitee.com/openeuler/kernel" }
);

export const chatMessageSchema = z.object({
  content: z.string().min(1, "消息不能为空"),
  repoUrl: z.string().optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, "请输入你的兴趣描述"),
  language: z.string().optional(),
  maxResults: z.number().min(1).max(10).default(5),
});

export const fileRequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  path: z.string(),
});
