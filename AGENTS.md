# agent.md — repo rules for the landing-page-builder POC

Read `docs/spec.md` and your ticket in `docs/tickets/` before writing code. This file is the reference; the ticket is the task.

## The loop (every ticket, in order)

1. **Orient.** Read your ticket's Do/Don't/Accept, the spec sections it names, and `lib/types.ts`.
   Done when: you can name the exact files you'll touch and the Accept boxes you'll tick.
2. **Implement.** Smallest diff inside your ticket's files that satisfies Do.
   Done when: every Do item exists and `git status` shows only your ticket's files.
3. **Verify.** Run `npx tsc --noEmit` (UI tickets: `npm run build`), then walk the 2-min demo path in `docs/spec.md` §13 touching your area.
   Done when: typecheck is green and every Accept box ticks by observation, not assumption.
4. **Report.** Files changed, how each Accept box was verified, what's left.
   Done when: another agent can pick up your handoff without re-reading code.

## Reference (consult on demand)

### One-way data flow
Chat text → `/api/generate|edit` → validated `Site` → React state → `localStorage` (`lpb-poc-v1`) → `LandingRenderer`. Produce a new `Site` object on every change; cap the undo stack at 20.

### Patch-only AI
AI returns `PatchOp[]` (the 5 variants in `lib/types.ts`), checked by `lib/patches.schema.ts`. Render all copy as text. Treat unknown ids, unknown props, or markup in AI output as a dropped op plus a clarifier reply. Section order stays fixed in POC.

### Mock-first
`lib/mock-ai.ts` keeps the demo alive with no API key. The Kilo path (`lib/kilo.ts`, server-only, 25s timeout + 1 retry) falls back to mock on any failure and always answers JSON.

### Single contact source
Every CTA derives from `site.whatsapp` / `site.callNumber` through `lib/whatsapp.ts` (`waLink` with encoded prefill, `telLink` with `+digits`). Keep phone fields digits-only, 8–15 chars.

### Edge-only routes
Each `app/api/*` route declares `export const runtime = "edge"`, stays under ~60 lines, validates bodies with Zod (reject >100KB, cap string lengths), and keeps prompt text in `lib/prompts.ts`.

### Guardrails
- Secrets stay server-side: `KILO_API_KEY` gets no `NEXT_PUBLIC_` twin; `.env.local` stays uncommitted.
- Link allowlist: `https://`, `https://wa.me/`, `tel:`, `mailto:` (plus localhost http in dev). Render anything else as plain text.
- Images: remote URLs with `loading="lazy"` and an `onError` hide.
- Commits: check `git status` + `git diff --stat` first; stage only intended files.

### Conventions
Strict TS (`unknown` over `any`), files under ~200 lines, Tailwind only, green `#25D366` primary, 48px minimum tap targets, mobile-first.
