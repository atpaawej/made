# T06 — API routes + Kilo + prompts + final wiring

> Spec: `docs/spec.md` §8.2–8.3 (AI branches), §10, §11. Depends on T01–T05. This closes the loop.

## Do
- `lib/patches.schema.ts` — Zod schemas for all 5 `PatchOp` variants (discriminated union on `op`). Export `patchesSchema: z.array(patchOpSchema)`.
- `lib/prompts.ts` (server-only) — `GENERATE_SYSTEM` (return `{site_fields, section_overrides}` JSON only; list allowed fields) + `EDIT_SYSTEM` (return ONLY JSON array of PatchOp; paste allowed ops + current-site placeholder). Keep each <40 lines.
- `lib/kilo.ts` (server-only) — `kiloChat(messages, {json=true})`: POST `https://api.kilo.ai/api/gateway/chat/completions`, `Authorization: Bearer ${KILO_API_KEY}`, `model: KILO_MODEL||"kilo-auto/free"`, `temperature 0.2`, 25s timeout, 1 retry on alternate free model. Return parsed JSON or throw with message. Never import from client components.
- `app/api/generate/route.ts` — `export const runtime="edge"`. Body `{message, niche?}`. No key → `mockGenerate`. With key → Kilo → merge overrides onto template → validate → return `{site}`. Catch-all: fallback to mock + never 500 (return mock with `warning` field).
- `app/api/edit/route.ts` — same runtime. Body `{site, message}`. No key → `mockEdit`. With key → Kilo with trimmed site JSON → `patchesSchema.safeParse` → drop invalid → apply (reuse an `applyPatches` helper, pure, tested) → return `{patches, site, reply}`.
- Wire `app/page.tsx` `onSend`: if `!site` → `/api/generate`, else → `/api/edit`; push history before apply (for Undo); assistant msg = `reply`.
- Add `README.md` demo script (spec §13, 6 steps) + `.env.example` (`KILO_API_KEY=`, `KILO_MODEL=kilo-auto/free`).

## Don't
- No auth, no DB, no new pages. Don't increase prompt temperature. Don't log the API key client-side.

## Accept
- [ ] No-key flow: full demo works offline (generate → edit → undo → publish).
- [ ] With key: Network tab shows gateway call; invalid AI JSON → clarifier, no state corruption.
- [ ] `npm run build` green; `console.log("[lead-click]")` fires on CTA click (add in renderer if missing — one line only).
