# T01 — Types + utils (foundation, no UI)

> Spec: `docs/spec.md` §5, §6. No dependencies. Keep it tiny.

## Do
- `lib/types.ts` — export `Niche`, `Site`, `Section`, `SectionType`, `PatchOp`, `ChatMsg` exactly as in spec §5.
- `lib/whatsapp.ts` — export `waLink(number, text)`, `telLink(number)`, `formatDisplay(number)`. Digits-only handling. Unit-test mentally: `" +91 99719 89908 "` → `919971989908`.
- `lib/storage.ts` — export `uid()`, `shortId()`, `slugify(s)`, `saveSite(site)`, `loadSite(slug)`, `loadAllSites()`, `saveChat(siteId, msgs)`, `loadChat(siteId)`. Key: `lpb-poc-v1`. Wrap JSON in try/catch (return null on corrupt).

## Don't
- No templates, no AI, no components, no API routes.

## Accept
- [ ] `npx tsc --noEmit` passes.
- [ ] `waLink("919971989908","Hi")` === `https://wa.me/919971989908?text=Hi`.
- [ ] Storage round-trip works after refresh (manual test in devtools).
