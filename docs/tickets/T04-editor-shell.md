# T04 — Editor shell + chat panel + preview

> Spec: `docs/spec.md` §8, §9.1. Depends on T01–T03. No real AI (wire mock in T05, use stub callback for now).

## Do
- `app/page.tsx` — state: `site: Site|null`, `msgs: ChatMsg[]`, `history: Site[]` (max 20), `view: "desktop"|"mobile"`, `busy: bool`. On mount: load last site from storage or show empty state. Persist site+chat on change.
- `components/ChatPanel.tsx` — props `{ msgs, busy, onSend, nicheChips }`. Empty state: assistant msg + 3 niche chips (`Create home-care page…` etc.). Message list (user right-green, assistant left-white, system center-gray), input + Send (Enter works), Undo + Reset buttons (props `onUndo`, `onReset`, `canUndo`).
- `components/Preview.tsx` — props `{ site, view, slugUrl }`. Toolbar: Desktop/Mobile toggle, "Open public page" link. If `!site` show skeleton/empty art; if `busy` show "Building…" overlay; else `<LandingRenderer site/>` (mobile: `max-w-[390px] mx-auto border rounded shadow`).
- Header in `page.tsx`: logo "Landing POC", niche badge, Publish button → saves + shows `{origin}/s/{slug}` + Copy (clipboard API with fallback prompt).
- `onSend` stub for now: append user msg; T05 will replace with real generate/edit calls. Keep the function signature `onSend(text: string)` so T05/T06 slot in.

## Don't
- No `/api` calls in this ticket (stub with `setTimeout` echo is fine for layout test). No Kilo, no mock-ai import.

## Accept
- [ ] Empty → chip click → stub creates nothing but UI updates (msg appears, no crash).
- [ ] With a site injected (devtool), preview renders, mobile toggle constrains width, Publish copies link.
- [ ] Small screens: tabs or stacked Chat/Preview both reachable, no overlap with sticky bar.
