# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run lint    # ESLint
npx tsc --noEmit # Type-check only
```

## Architecture

A Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 full-stack app. Chinese-language UI. The app helps beginners understand GitHub repos through a chat interface backed by Claude API.

### Data flow

```
User action → Hook (useChat/useRepo) → Zustand store → API route → External API (Claude/GitHub)
                                                              ↓
UI re-render ← Zustand store ← SSE stream ← API response
```

### API routes (4 routes under `src/app/api/`)

- **`POST /api/chat`** — Claude streaming via SSE (`text/event-stream`). Builds a layered system prompt from context (repo info, active file, discovery/learning mode), then streams back `text_delta` / `done` / `error` events.
- **`POST /api/github/repo`** — Fetches repo metadata + recursive file tree (via `git/trees/{sha}?recursive=1`) + README. Caps at 200 files, depth 4, ignores `node_modules`/`.git`/`dist` etc.
- **`POST /api/github/search`** — Searches GitHub `/search/repositories`, returns results with auto-assessed `beginnerFriendly` rating.
- **`GET /api/github/file`** — Fetches a single file's base64-decoded content. Rejects >100KB files.

### Prompt layering (`src/lib/anthropic/prompt-builder.ts`)

The system prompt is assembled from 5 templates depending on context: BASE_PROMPT → REPO_ANALYSIS_PROMPT → FILE_EXPLANATION_PROMPT → DISCOVERY_PROMPT → LEARNING_PROMPT. Templates use `{placeholder}` string replacement (not template literals). Always responds in Chinese.

### State management (4 Zustand stores)

- `chat-store` — Messages array, streaming flag, AbortController for stopping
- `repo-store` — Current repo metadata, file tree, active file content
- `ui-store` — Sidebar open/close, active panel (chat/discovery/learning), popup position/size/visibility
- `learning-store` — Generated learning steps, current step index, completed set

### Key hooks

- `useChat()` — Orchestrates send → SSE parse → append streaming chunks to messages. Reads chat + repo stores, builds ChatContext, streams.
- `useRepo()` — `analyzeUrl(url)` parses GitHub URL, fetches repo data, loads file on click. Refs both repo-store and chat-store (to post assistant messages).
- `usePopup()` — Drag/resize logic via mousedown/mousemove/mouseup, position clamping on window resize.

### SSR safety

Zustand stores must not reference `window`/`document` at module evaluation time. Use `typeof window !== "undefined"` guards (see `ui-store.ts` `getDefaultPosition()`). The page is marked `"use client"` — all components that touch browser APIs must be client components.

### GitHub API (`src/lib/github/client.ts`)

A thin `ghFetch<T>()` wrapper around `fetch` to GitHub's REST API. Uses `GITHUB_TOKEN` from env for authenticated requests (5000 req/h vs 60 unauthenticated). Rate limiting is handled by throwing `"RATE_LIMITED"` string which route handlers catch.

## Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Required — Claude API key
GITHUB_TOKEN=ghp_...           # Optional — raises GitHub rate limit from 60 to 5000 req/h
```

## UI stack

shadcn/ui (v4.7 base-nova style) with Tailwind v4 + `tw-animate-css`. Icons via `lucide-react`. Notifications via `sonner`. Dark mode via `next-themes` (class strategy, respects system preference). Markdown rendering via `react-markdown` + `remark-gfm` + `rehype-highlight`.
