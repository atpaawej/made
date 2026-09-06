# T05 — Mock AI (works with NO api key — most-likely demo path)

> Spec: `docs/spec.md` §8.2–8.3 (mock branches). Depends on T01+T02. Pure functions, no UI.

## Do
- `lib/mock-ai.ts` — export `mockGenerate(message, nicheHint?): Site` and `mockEdit(site, message): { site: Site; reply: string; patches: PatchOp[] }`.
- `mockGenerate`: `detectNiche` → base template → extract businessName (`"called X"` / `"for X"` / quoted, fallback "My Business"), city (`"in X"` pattern, fallback template city), whatsapp (first 10–13 digit run, else template default) → set `slug` via `slugify(business)+"-"+shortId()`, fresh `id`, `updatedAt`.
- `mockEdit` keyword rules (first match wins, case-insensitive):
  1. `headline|title` → `update_section hero_* {title: <text after "to"|":" trimmed>}`
  2. `whatsapp|number|call` + digits → `update_site {whatsapp, callNumber}`
  3. `add X (at|for|price|₹|rs) N` → `add_card services {title:X, price:N}`
  4. `remove|delete X` → `delete_card` by title substring match
  5. `price of X to N` → `update_card {price:N}`
  6. `city|area|location X` → `update_site {city:X}`
  7. else → `{ patches:[], reply: clarifier }` ("I can change headline, prices, services, WhatsApp number, city. Try: 'add ECG at home for 899'.")
- Apply patches immutably, return new site + one-line `reply` ("Done — …"). Never mutate input. Never return HTML.

## Don't
- No fetch, no UI, no storage writes.

## Accept
- [ ] `mockGenerate("Create home care page called Seva Nurses in Noida, whatsapp 9810012345")` → niche home_care, name/city/number set.
- [ ] `mockEdit(site,"add ECG at home for 899")` adds card; `"change whatsapp to 9810012345"` updates all CTAs downstream (renderer test in T03).
- [ ] Unknown msg returns empty patches + clarifier, no crash.
