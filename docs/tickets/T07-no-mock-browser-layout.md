# T07 — Remove mock path (LLM-only + retry) + fix editor layout (browser-frame preview)

> Supersedes T05. Two small jobs, one ticket. No new features.

## Context

- T06 replaced Kilo with an LLM abstraction (`lib/llm.ts`, `lib/zen.ts`, `lib/llm-types.ts`). The provider is reliable for this workload, so the mock fallback is dead weight — remove it and rely on retry instead.
- Layout bug: in `app/page.tsx` the root is `min-h-screen` + `flex-1` middle row with no `min-h-0` on flex children. The page grows with content instead of constraining to the viewport, so the long preview stretches the chat column and pushes the ChatPanel input below the fold (whole body scrolls).

## Part A — Remove mock

### Do
- Delete `lib/mock-ai.ts`.
- `app/api/generate/route.ts`: remove `mockGenerate` import and both mock branches (lines ~33, ~70–76). Failure path returns `{ error: string }` with non-200 status. Ensure the LLM call retries at least twice before giving up (add retry in `lib/llm.ts`/`lib/zen.ts` if missing).
- `app/api/edit/route.ts`: remove `mockEdit` import and fallback (lines ~43, ~74–75). Zero-valid-patches case keeps returning `{ patches: [], site, reply: CLARIFIER }` (that comes from `lib/prompts.ts`, not mock). Hard LLM failure returns `{ error }`.
- `app/page.tsx`: client already renders `error` as a system message — keep that. Drop mock-specific `warning` strings ("used local draft", "fallback mock"); keep the generic `warning` display only if the server still sends real warnings, else remove it.
- `docs/tickets/INDEX.md`: mark T05 as superseded by T07 (one line, don't rewrite the table).

### Don't
- No changes to templates, renderer, prompts copy, or the `PatchOp` contract. No new env vars (LLM key config stays as-is).

## Part B — Browser-frame layout fix

### Do
- `app/page.tsx`:
  - Root: `h-dvh` (with `h-screen` fallback) instead of `min-h-screen`; add `overflow-hidden` so the body never scrolls on desktop.
  - Header + mobile tab bar: add `shrink-0`.
  - Middle row (`flex flex-1 overflow-hidden`), the `aside`, and the preview `section`: add `min-h-0` (and `min-w-0` on the section) so flex children can shrink and scroll internally.
- `components/ChatPanel.tsx`: message list keeps `flex-1 min-h-0 overflow-y-auto`; bottom input block gets `shrink-0` so the input + Undo/Reset row is always visible.
- `components/Preview.tsx`: wrap the renderer in a browser-chrome frame — top chrome bar with traffic dots, URL pill (shows `slugUrl` path or "Preview"), and the existing Desktop/Mobile toggle living in that chrome bar. Renderer area is `flex-1 min-h-0 overflow-y-auto`. Mobile view keeps the 390px constrained width, centered inside the frame.

### Don't
- No visual redesign beyond the chrome frame. No touching section components, `LandingRenderer`, or link logic. Keep all `wa.me`/`tel:` behavior identical.

## Accept
- [ ] `lib/mock-ai.ts` deleted; `grep mock-ai` returns nothing; `npx tsc --noEmit` + `npm run build` green.
- [ ] With LLM configured, generate → edit → undo → publish works end to end. With LLM unreachable, client shows a system error message (no silent mock page, no crash); server attempted ≥2 tries.
- [ ] Desktop and 390px widths: chat input visible with zero page scroll; body has no vertical scrollbar; chat list and preview scroll independently inside their panes.
- [ ] Preview renders inside a browser-chrome frame with URL pill; mobile toggle constrains to 390px.
- [ ] Undo / Reset / Publish / Copy all still work; every CTA link unchanged.
