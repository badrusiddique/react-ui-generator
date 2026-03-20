# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and the AI generates React code that renders in a live preview pane. Components live in a virtual file system (nothing written to disk).

## Commands

```bash
npm run setup          # First-time: install deps, generate Prisma client, run migrations
npm run dev            # Start dev server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Vitest (jsdom environment)
npm run db:reset       # Reset SQLite database
```

The dev server requires `NODE_OPTIONS='--require ./node-compat.cjs'` (already configured in scripts).

## Architecture

**AI Chat → Tool Calls → Virtual File System → Live Preview**

The core flow:
1. User sends a message via chat UI
2. `src/app/api/chat/route.ts` streams responses from Claude (or a mock provider if no API key)
3. The AI uses two tools to manipulate a `VirtualFileSystem`: `str_replace_editor` (view/create/edit files) and `file_manager` (rename/delete)
4. Tool calls are replayed client-side via `FileSystemContext.handleToolCall` to keep the in-memory VFS in sync
5. `PreviewFrame` transforms all VFS files with Babel (`jsx-transformer.ts`), creates an import map with blob URLs, and renders in an iframe

**Key abstractions:**
- `VirtualFileSystem` (`src/lib/file-system.ts`) — in-memory tree of `FileNode`s with serialize/deserialize for persistence. Singleton exported as `fileSystem`.
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — React context wrapping VFS; bridges AI tool calls to UI state via `handleToolCall`
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`; sends serialized VFS with each request
- `jsx-transformer.ts` (`src/lib/transform/`) — Babel transform + import map generation for iframe preview. Maps `@/` aliases, resolves missing imports with placeholders, collects CSS, and creates blob URLs.
- `MockLanguageModel` (`src/lib/provider.ts`) — when no `ANTHROPIC_API_KEY` is set, returns canned tool-call sequences so the app runs without an API key

**Data layer:**
- Prisma + SQLite (`prisma/dev.db`), Prisma client generated to `src/generated/prisma`
- Two models: `User` and `Project`. Project stores messages and VFS data as JSON strings.
- Auth: JWT in httpOnly cookie (`src/lib/auth.ts`), bcrypt passwords. Anonymous users can use the app without signing in but can't persist projects.

**UI layout** (`src/app/main-content.tsx`): resizable two-panel layout — chat on the left, preview/code editor on the right. Uses shadcn/ui (new-york style) with Radix primitives.

## Tech Stack Details

- Next.js 15 App Router with Turbopack
- React 19, TypeScript, Tailwind CSS v4
- Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) for streaming chat
- Monaco Editor for code editing
- shadcn/ui components in `src/components/ui/`
- Path alias: `@/` maps to `src/`

## Code Standards

**Comments:** Add comments only for complex code where logic isn't self-evident. Be conservative — prefer clear variable/function names over verbose comments. Focus on explaining *why*, not *what*.

**Git commits:** Never include a `Co-Authored-By` trailer in commit messages.
