<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (amrsamir.me)

- Content lives in `content/` and is edited via Keystatic (`keystatic.config.ts`). Never hard-code copy in components.
- Never invent metrics, clients or logos. Only use facts present in `content/`.
- Design: tokens in `src/app/globals.css`, door accents in `src/lib/doors.ts`. Glass = modern macOS; `.win-classic` = 1-bit classic Mac, used sparingly. Do not use Apple logos, Apple icons or the SF Pro font files.
- Every window is a real route (deep-linkable from LinkedIn). Do not turn routes into client-only state.
- Keep `/keystatic` and `/api/keystatic` disabled in production unless GitHub storage is configured.
