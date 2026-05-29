# GitHub 学习助手

一个帮助编程新手理解和学习 GitHub 开源项目的 Web 聊天应用。粘贴仓库链接即可让 AI 帮你分析项目结构、解释代码；也可以描述兴趣，让 AI 推荐适合你的入门项目。

## 功能

- **仓库分析** — 粘贴 GitHub 链接，自动拉取文件树和 README，AI 解释项目架构和从哪里开始读
- **代码解释** — 点击文件树中的任意文件，AI 逐行解释代码逻辑
- **项目发现** — 告诉 AI 你想学什么（"Python 爬虫"、"前端小项目"），搜 GitHub 并给出匹配度和难度评级
- **学习路径** — AI 为当前仓库生成 5 步学习计划，跟踪进度
- **迷你弹窗** — 右下角浮动窗口，可拖拽缩放，边看代码边聊天

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

编辑 `.env.local`：

```bash
# 必需 — 从 https://console.anthropic.com/ 获取
ANTHROPIC_API_KEY=sk-ant-your-key-here

# 推荐 — 从 https://github.com/settings/tokens 创建（勾选 public_repo）
GITHUB_TOKEN=ghp_your_token_here
```

不设置 `GITHUB_TOKEN` 也可以使用，但 GitHub API 限制为 60 次/小时（设置后为 5000 次/小时）。

### 3. 启动

```bash
npm run dev
```

浏览器访问 `http://localhost:3000`

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| AI | Claude API (Anthropic SDK) |
| 状态管理 | Zustand |
| GitHub | REST API (Octokit / fetch) |

## 项目结构

```
src/
├── app/api/
│   ├── chat/route.ts          # Claude 流式聊天（SSE）
│   └── github/
│       ├── repo/route.ts      # 仓库信息 + 文件树
│       ├── search/route.ts    # 搜索仓库
│       └── file/route.ts      # 获取文件内容
├── components/
│   ├── chat/                  # 聊天界面
│   ├── repo/                  # 仓库面板 + 文件树
│   ├── discovery/             # 项目发现
│   ├── learning/              # 学习路径
│   └── popup/                 # 迷你弹窗
├── lib/
│   ├── anthropic/             # Claude SDK 封装 + 提示模板
│   └── github/                # GitHub API 封装
├── hooks/                     # useChat, useRepo, usePopup
├── store/                     # Zustand 状态管理
└── types/                     # TypeScript 类型定义
```

## 构建部署

```bash
npm run build   # 生产构建
npm start       # 启动生产服务
```

可直接部署到 [Vercel](https://vercel.com)（免费），在 Vercel 控制台设置环境变量即可。
