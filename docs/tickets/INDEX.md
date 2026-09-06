# Ticket Index — build in order, one agent per ticket

> Full spec: `docs/spec.md`. Each ticket is self-contained. Do not pull in other tickets' scope.
> Stack: Next.js App Router + TS + Tailwind. No auth. No DB. localStorage only.

| # | Ticket | Depends on | Files touched | Size |
|---|--------|------------|---------------|------|
| T01 | Types + utils (types, whatsapp, storage) | — | `lib/types.ts`, `lib/whatsapp.ts`, `lib/storage.ts` | S |
| T02 | Templates (3 niches, Caretavya-clone home care) | T01 | `lib/templates.ts` | S |
| T03 | Renderer + sections + public page | T01, T02 | `components/LandingRenderer.tsx`, `components/sections/*`, `app/s/[slug]/page.tsx` | M |
| T04 | Editor shell + chat panel + preview | T01–T03 | `app/page.tsx`, `components/ChatPanel.tsx`, `components/Preview.tsx` | M |
| T05 | Mock AI (generate + edit, no key needed) | T01, T02 | `lib/mock-ai.ts` | S |
| T06 | API routes + LLM abstraction (Zen) + prompts + publish polish | T01–T05 | `app/api/generate/route.ts`, `app/api/edit/route.ts`, `lib/llm.ts`, `lib/zen.ts`, `lib/prompts.ts`, `lib/patches.schema.ts` | M |

Rules for every agent:
- Read `docs/spec.md` § matching your ticket + `lib/types.ts` first.
- Never add auth, DB, uploads, analytics backend, drag-drop.
- `npm run build` (or `tsc --noEmit`) must pass before handing off.
- Render all copy as text (no `dangerouslySetInnerHTML`). Validate URLs (`http(s)`, `wa.me`, `tel:` only).
