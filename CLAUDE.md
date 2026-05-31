# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run lint    # ESLint
npm start       # Start production server (after build)
npx tsc --noEmit # Type-check only
```

## Architecture

A Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 full-stack app. Chinese-language UI. The app helps beginners understand GitHub repos through a chat interface backed by multiple AI providers (Anthropic, OpenAI, DeepSeek) with streaming via SSE.

### Data flow

```
User action → Hook (useChat/useRepo) → Zustand store → API route → External API (Claude/OpenAI/GitHub)
                                                              ↓
UI re-render ← Zustand store ← SSE stream ← API response
```

User-configurable settings (AI provider, API keys, model) flow separately:

```
Settings dialog → settings-store → POST /api/settings → .api-config.json (server)
                                              ↓
                         chat route reads .api-config.json on each request
```

UI settings take priority over environment variables. Settings are persisted server-side in `.api-config.json` and masked when sent to the client (keys shown as `••••••••`).

### API routes (5 routes under `src/app/api/`)

- **`POST /api/chat`** — Streaming chat via SSE (`text/event-stream`). Builds system prompt from context (repo info, active file, mode), then routes to the active AI provider (Anthropic SDK streaming vs OpenAI/DeepSeek SDK streaming). Returns `text_delta` / `done` / `error` SSE events.
- **`POST /api/github/repo`** — Fetches repo metadata + recursive file tree (via `git/trees/{sha}?recursive=1`) + README. Caps at 200 files, depth 4, ignores `node_modules`/`.git`/`dist` etc.
- **`POST /api/github/search`** — Searches GitHub `/search/repositories`, returns results with auto-assessed `beginnerFriendly` rating.
- **`GET /api/github/file`** — Fetches a single file's base64-decoded content. Rejects >100KB files.
- **`GET/POST /api/settings`** — Reads/writes API configuration (provider, keys, models, GitHub token). Writes to `.api-config.json` at project root. Only whitelisted fields are accepted on POST; keys are masked on GET.

### AI providers (`src/lib/anthropic/client.ts`, `src/lib/openai/client.ts`)

Two thin SDK wrappers with per-key caching:

- `getAnthropic(apiKey?)` — Returns cached `Anthropic` instance; falls back to `ANTHROPIC_API_KEY` env var.
- `getOpenAI(apiKey?, baseURL?)` — Returns cached `OpenAI` instance; falls back to `OPENAI_API_KEY` / `OPENAI_BASE_URL` env vars. Also used for DeepSeek (by setting `baseURL` to `https://api.deepseek.com`).

The chat route calls `effectiveConfig()` from `src/lib/settings/config.ts` to resolve the active provider, key, model, and base URL from the saved settings. The config file also handles placeholder token filtering and key masking.

### Prompt system (`src/lib/anthropic/prompts.ts` + `prompt-builder.ts`)

Raw prompt templates (Chinese-language) are exported as string constants from `prompts.ts`: `BASE_PROMPT`, `REPO_ANALYSIS_PROMPT`, `FILE_EXPLANATION_PROMPT`, `DISCOVERY_PROMPT`, `LEARNING_PROMPT`. `prompt-builder.ts` assembles them with `{placeholder}` string replacement depending on context — repo loaded, active file selected, discovery mode, or learning mode. Templates are concatenated with `\n\n---\n\n` separators. A `detectLanguage()` helper maps file extensions to highlight.js language identifiers.

### State management (5 Zustand stores)

- `chat-store` — Messages array, streaming flag, AbortController for stopping
- `repo-store` — Current repo metadata, file tree, active file content
- `ui-store` — Sidebar open/close, active panel (chat/discovery/learning), popup position/size/visibility
- `learning-store` — Generated learning steps, current step index, completed set
- `settings-store` — AI provider selection, API keys (masked on read), model choices, loading/configured flags. `fetchSettings()` on mount, `saveSettings()` posts to `/api/settings`.

### Key hooks

- `useChat()` — Orchestrates send → SSE parse → append streaming chunks to messages. Reads chat + repo stores, builds `ChatContext`, streams from `/api/chat`.
- `useRepo()` — `analyzeUrl(url)` parses GitHub URL, fetches repo data, loads file on click. Posts assistant messages to chat store.
- `usePopup()` — Drag/resize logic via mousedown/mousemove/mouseup, position clamping on window resize.

### Supporting libraries

- `src/lib/github/repo-parser.ts` — Regex-based GitHub URL parsing (`parseGitHubUrl()`)
- `src/lib/github/client.ts` — Thin `ghFetch<T>()` wrapper around `fetch` to GitHub REST API. Uses `GITHUB_TOKEN` from env or settings for authenticated requests (5000 req/h vs 60 unauthenticated). Rate limiting is handled by throwing `"RATE_LIMITED"` string.
- `src/lib/settings/config.ts` — Server-side settings persistence (read/write `.api-config.json`), key masking, effective config resolution, placeholder token filtering.
- `src/lib/validators/schemas.ts` — Zod v4 schemas for GitHub URL validation, chat messages, search queries, and file requests.

### SSR safety

Zustand stores must not reference `window`/`document` at module evaluation time. Use `typeof window !== "undefined"` guards (see `ui-store.ts` `getDefaultPosition()`). The page is marked `"use client"` — all components that touch browser APIs must be client components.

## Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Fallback Claude API key
OPENAI_API_KEY=sk-...          # Fallback OpenAI / DeepSeek API key
OPENAI_BASE_URL=...            # Fallback base URL (for DeepSeek / custom endpoints)
GITHUB_TOKEN=ghp_...           # Optional — raises GitHub rate limit from 60 to 5000 req/h
```

All four can also be configured via the in-app settings dialog, which takes priority over env vars. Settings are stored in `.api-config.json` (gitignored, do not commit).

## UI stack

shadcn/ui (v4.7 base-nova style on `@base-ui/react`) with Tailwind v4 + `tw-animate-css`. Icons via `lucide-react`. Notifications via `sonner`. Dark mode via `next-themes` (class strategy, respects system preference). Markdown rendering via `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-raw`.
