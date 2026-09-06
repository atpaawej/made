# T03 — Renderer + sections + public page

> Spec: `docs/spec.md` §6, §9. Depends on T01+T02. No chat, no AI.

## Do
- `components/LandingRenderer.tsx` — props `{ site: Site }`. Renders sections sorted by `order`, switch on `type`. Page wrapper adds `pb-24 md:pb-0` (room for sticky bar).
- `components/sections/`: `Hero.tsx`, `TrustStrip.tsx`, `ServicesGrid.tsx`, `HowItWorks.tsx`, `WhyUs.tsx`, `Reviews.tsx`, `Faq.tsx`, `FinalCta.tsx`, `StickyBar.tsx`.
  - Hero: eyebrow, title, subtitle, badges, 2 buttons (WhatsApp green `#25D366` → `waLink` hero prefill; Call outline → `telLink`). Spec §6 formulas.
  - ServicesGrid: cards with image (`aspect-video object-cover`, `loading="lazy"`, onError hide), title, desc, price, per-card "Book on WhatsApp" (`waLink` card prefill).
  - FAQ: native `<details>` accordion, no JS lib.
  - StickyBar: `md:hidden fixed bottom-0 inset-x-0` with 2 buttons, `safe-area-inset-bottom`.
- `app/s/[slug]/page.tsx` — client component: read slug via params, `loadSite(slug)` from storage; if found render header (business name + call icon) + `<LandingRenderer/>` + footer ("Made with Landing POC"); if missing render honest fallback (spec §8.5). Set `<title>` from hero.
- Styling: Tailwind only, rounded-2xl cards, min 48px tap targets.

## Don't
- No editor, no chat, no API, no mock-ai. Hardcode-import a template for visual test if needed (remove before handoff).

## Accept
- [ ] Home-care template renders Caretavya-look: hero CTAs, 6 cards each with WhatsApp btn, sticky bar on 390px.
- [ ] Every `wa.me` link has digits + encoded prefill; every `tel:` has `+digits` (inspect element).
- [ ] `/s/<slug>` works after creating site in console via `saveSite(homeCareTemplate())`.
