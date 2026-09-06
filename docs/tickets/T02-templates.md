# T02 — Templates (3 niches)

> Spec: `docs/spec.md` §7. Depends on T01 only. No UI.

## Do
- `lib/templates.ts` — export `homeCareTemplate()`, `carsTemplate()`, `realEstateTemplate()`, `templateFor(niche)`, `detectNiche(message)`.
- Each returns a full `Site` (with `sections[]` in fixed order: hero → trust_strip → services → how_it_works → why_us → reviews → faq → final_cta) per spec §7 copy.
- Home care = FLAGSHIP: 6 service cards with prices (Injections ₹499, IV Drip ₹1,400, Dressing ₹799, Catheter ₹999, ECG ₹899, Post-Op custom), 3 how-steps, 4 why-points, 3 Indian-name reviews, 6 FAQs. Default `businessName "Caretavya Clone"`, `city "Gurgaon"`, `whatsapp "919971989908"`.
- Cars: 3 inventory cards with specs in desc + test-drive prefill wording. Real estate: 3 listing cards (BHK/area/price).
- Images: Unsplash direct URLs only. `detectNiche`: `car|dealer|test drive`→cars, `flat|villa|plot|bhk|society`→real_estate, else home_care.
- Export `PREFILL` helpers or keep prefill-building in `lib/whatsapp.ts` (import from T01, don't duplicate).

## Don't
- No components, no AI calls, no localStorage writes here (pure functions).

## Accept
- [ ] Each template has 8 sections, unique ids, `order` 0–7.
- [ ] `templateFor(detectNiche("book test drive for creta"))` returns cars template.
- [ ] `tsc` passes.
