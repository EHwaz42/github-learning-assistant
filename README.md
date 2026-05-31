# GitHub 学习助手

帮助编程新手理解和学习 GitHub 开源项目的 AI 聊天应用。粘贴仓库链接即可让 AI 分析项目结构、解释代码，也可以描述兴趣让 AI 推荐适合入门的项目。

## 功能

- **仓库分析** — 粘贴 GitHub 链接，自动拉取文件树和 README，AI 解释项目架构和阅读入口
- **代码解释** — 点击文件树中的任意文件，AI 逐行解释代码逻辑
- **项目发现** — 告诉 AI 你想学什么（"Python 爬虫"、"前端小项目"），搜索 GitHub 并给出入门友好度评级
- **学习路径** — AI 为当前仓库生成 5 步学习计划，可跟踪进度
- **迷你弹窗** — 右下角浮动窗口，可拖拽缩放，边看代码边聊天

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API

启动后在侧边栏底部点击齿轮图标 **API 调用**，在弹窗中填写配置：

**AI 模型** — 选择提供商并填入对应 API Key：

| 提供商 | Key 格式 | 默认模型 |
|---|---|---|
| Anthropic | `sk-ant-...` | `claude-sonnet-4-5-20250929` |
| OpenAI | `sk-...` | `gpt-4o` |
| DeepSeek | `sk-...` | `deepseek-chat`（Base URL 自动填充） |

**GitHub** — 可选，填入 Personal Access Token 可将 API 限额从 60 提升至 5000 次/小时。

也可以使用环境变量（`.env.local`），UI 配置优先级高于环境变量，保存后即时生效。

### 3. 启动

```bash
npm run dev
```

浏览器访问 `http://localhost:3000`

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, Turbopack) + React 19 |
| 语言 | TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (base-ui) |
| AI | Anthropic / OpenAI / DeepSeek（SSE 流式响应） |
| 状态管理 | Zustand |
| GitHub | REST API (Octokit) |
| 图标 | Lucide React |

## 项目结构

```
src/
├── app/api/
│   ├── chat/route.ts            # AI 流式聊天（SSE），支持多提供商
│   ├── settings/route.ts        # API 配置读写
│   └── github/
│       ├── repo/route.ts        # 仓库信息 + 文件树
│       ├── search/route.ts      # 搜索仓库
│       └── file/route.ts        # 获取文件内容
├── components/
│   ├── chat/                    # 聊天界面
│   ├── layout/                  # 侧边栏
│   ├── repo/                    # 仓库面板 + 文件树
│   ├── discovery/               # 项目发现
│   ├── learning/                # 学习路径
│   ├── popup/                   # 迷你弹窗
│   ├── settings/                # API 配置弹窗
│   └── shared/                  # 主题、Markdown 渲染等
├── lib/
│   ├── anthropic/               # Claude SDK + 提示模板
│   ├── openai/                  # OpenAI SDK（兼容 DeepSeek）
│   ├── github/                  # GitHub API 封装
│   └── settings/                # 配置持久化
├── hooks/                       # useChat, useRepo, usePopup
├── store/                       # Zustand 状态管理（含 settings-store）
└── types/                       # TypeScript 类型定义
```

## 部署

```bash
npm run build
npm start
```

可直接部署到 [Vercel](https://vercel.com)，在 Vercel 控制台设置环境变量，或部署后通过 UI 配置 API。
