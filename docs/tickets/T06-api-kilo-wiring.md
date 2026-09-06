# T06 — API routes + LLM abstraction (Opencode Zen) + prompts + final wiring

> Spec: `docs/spec.md` §8.2–8.3 (AI branches), §10, §11. Depends on T01–T05. This closes the loop.
> Zen replaces Kilo — consumed via abstraction (`lib/llm.ts`), never directly in routes.

## Do
- `lib/patches.schema.ts` — Zod schemas for all 5 `PatchOp` variants (discriminated union on `op`). Export `patchesSchema: z.array(patchOpSchema)`.
- `lib/prompts.ts` (server-only) — `GENERATE_SYSTEM` (return `{site_fields, section_overrides}` JSON only; list allowed fields) + `EDIT_SYSTEM` (return ONLY JSON array of PatchOp; paste allowed ops + current-site placeholder). Keep each <40 lines.
- `lib/llm.ts` (server-only abstraction) — `export interface LLMProvider { chat(messages: {role:string,content:string}[], opts?:{jsonMode?:boolean}): Promise<string> }` + `getLLM(): LLMProvider | null` factory. Never import from client components. Routes import only this.
- `lib/zen.ts` (server-only, implements `LLMProvider`) — `zenChat(messages, {json=true})`: POST `https://opencode.ai/zen/v1/responses`, `Authorization: Bearer ${OPENCODE_ZEN_API_KEY}`, `model: OPENCODE_ZEN_MODEL||"muse-spark-1.2-contributor-free"`, `reasoning:{effort:"minimal"}`, 25s timeout, 1 retry. Parses Responses API `output[].content[].text` → return text. Throw on `status!="completed"`. Pluggable: any `LLMProvider` satisfies routes.
- `app/api/generate/route.ts` — `export const runtime="edge"`. Body `{message, niche?}`. No key / no LLM → `mockGenerate`. With key → `getLLM().chat(...)` → merge overrides onto template → validate → return `{site}`. Catch-all: fallback to mock + never 500 (return mock with `warning` field).
- `app/api/edit/route.ts` — same runtime. Body `{site, message}`. No key → `mockEdit`. With key → `getLLM().chat(trimmed site JSON + prompts.EDIT_SYSTEM)` → `patchesSchema.safeParse` → drop invalid → apply (reuse `applyPatches` helper, pure, tested) → return `{patches, site, reply}`.
- Wire `app/page.tsx` `onSend`: if `!site` → `/api/generate`, else → `/api/edit`; push history before apply (for Undo); assistant msg = `reply`.
- Add `README.md` demo script (spec §13, 6 steps) + `.env.example` (`OPENCODE_ZEN_API_KEY=`, `OPENCODE_ZEN_MODEL=muse-spark-1.2-contributor-free`).

## Don't
- No auth, no DB, no new pages. Don't increase prompt temperature. Don't log the API key client-side. Don't import `lib/zen.ts` directly in routes — use `lib/llm.ts` abstraction.

## Accept
- [ ] No-key flow: full demo works offline (generate → edit → undo → publish).
- [ ] With key: Network tab shows `https://opencode.ai/zen/v1/responses` call; invalid AI JSON → clarifier, no state corruption.
- [ ] Pluggable: routes work with mock provider when `OPENCODE_ZEN_API_KEY` empty; swapping `LLMProvider` requires no route changes.
- [ ] `npm run build` green; `console.log("[lead-click]")` fires on CTA click (add in renderer if missing — one line only).
