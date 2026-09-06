# Landing Page Builder — POC Spec (for Internship Demo to Tej Pandya / Varun @ GroWeasy)

> Status: POC only. Not a production SaaS. Goal is to prove the core loop in a 2-min video.
> Stack: Next.js only (App Router) + Tailwind, deployed on Cloudflare Pages. No auth. No database.
> AI: Kilo Gateway (OpenAI-compatible) free tier.

---

## 1. What Tej Asked (verbatim intent)

From WhatsApp export (`Tej Pandya.zip`):

1. "build a chat based website"
2. "one page landing pages (real estate, cars, home care)"
3. "ctas contact based - whatsapp, call"
4. "edit also chatbased"
5. Examples: `Caretavya.com`, `afriendlynurse.com` (both home-care, one-page, WhatsApp-first)
6. Clarified: "chat system where i can chat and create website and edit the created website again by chatting"

Interpretation: a single chat box that (a) creates a full one-page site from a prompt, and (b) edits that same site with follow-up chat messages. No admin panel jargon — the editor page IS the chat + preview.

---

## 2. POC Goal & Success Criteria

**Goal:** Record a 2-minute Loom and send the live URL to Varun. He types one prompt, sees a Caretavya-style page, clicks WhatsApp (prefilled chat opens), types an edit, sees it update live, hits Undo.

**POC succeeds if:**

- [ ] User opens `/`, picks a niche chip or types free text, gets a complete landing page in <5s (mock or AI).
- [ ] Page has working `wa.me` links (with prefilled text) + `tel:` links. Clicking them opens WhatsApp / dialer.
- [ ] User can type follow-up edits ("change headline to X", "change WhatsApp number to Y", "add service Z") and preview updates without reload.
- [ ] Undo button reverts the last edit.
- [ ] Desktop / Mobile preview toggle works; mobile shows sticky bottom bar `[WhatsApp] [Call]`.
- [ ] Publish button produces a shareable `/s/[slug]` URL that renders standalone (no editor chrome), copyable to clipboard.
- [ ] All 3 niches have at least one working starter: Home Care (full, Caretavya-clone), Cars (basic), Real Estate (basic).

**Explicitly OUT of POC (say this in demo as "Phase 2 roadmap"):**

- Auth / login / multi-user / dashboard / roles
- Any database (D1/Postgres) — persistence is `localStorage` only
- Custom domains, SSL per site, team workspaces
- Drag-and-drop builder, image uploads (use direct image URLs / Unsplash)
- Payments, CRM integrations, Meta Pixel, GA4, A/B testing, form backends
- Server-side lead storage / click analytics backend (track clicks in-memory/console only)

---

## 3. Tech Stack (locked)

| Layer     | Choice | Why for POC |
|-----------|--------|-------------|
| Framework | Next.js 14+ App Router, TypeScript, Tailwind CSS | Single repo, fast, Cloudflare-compatible |
| Hosting   | Cloudflare Pages (`next-on-pages` or static export) | Free, required by user |
| State     | React state + `localStorage` (key: `lpb-poc-v1`) | No DB setup, survives refresh, zero backend |
| AI        | Kilo Gateway, OpenAI-compatible `POST https://api.kilo.ai/api/gateway/chat/completions`, model `kilo-auto/free` (fallback: local mock generator if no key) | Free tier, one endpoint, BYOK later |
| Validation| `zod` for all AI patches | AI must never break layout |
| Icons     | `lucide-react` | WhatsApp/Phone/MessageSquare/Undo/RotateCcw |

**Env vars (`.env.local`):**

```
KILO_API_KEY=            # required for real AI; if empty app uses mock generator (must still demo)
KILO_MODEL=kilo-auto/free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**No other secrets. No DB URL. No auth secret.**

---

## 4. App Structure (2 pages + 2 API routes)

```
app/
  page.tsx                 # / — Editor: chat (left) + preview (right). This is the whole POC.
  s/[slug]/page.tsx        # /s/:slug — Public standalone landing page (no editor chrome)
  api/
    generate/route.ts      # POST {message, niche?} -> {site: Site} (AI or mock)
    edit/route.ts          # POST {site, message} -> {patches: PatchOp[]} (AI or mock)
  globals.css
  layout.tsx
components/
  ChatPanel.tsx            # message list + input + niche chips + undo + publish
  Preview.tsx              # renders <LandingRenderer site /> + desktop/mobile toggle
  LandingRenderer.tsx      # renders sections[] by type (shared by editor + public page)
  sections/
    Hero.tsx
    TrustStrip.tsx
    ServicesGrid.tsx       # tasks / listings / inventory cards with per-card WhatsApp btn
    HowItWorks.tsx
    WhyUs.tsx
    Reviews.tsx
    Faq.tsx
    FinalCta.tsx
    StickyBar.tsx          # mobile-only fixed bottom [WhatsApp][Call]
lib/
  types.ts                 # Site, Section, Props, PatchOp (single source of truth)
  templates.ts             # homeCareTemplate(), carsTemplate(), realEstateTemplate()
  mock-ai.ts               # keyword-based generator/editor used when KILO_API_KEY empty
  kilo.ts                  # Kilo Gateway fetch wrapper (server-only)
  prompts.ts               # system prompts + JSON schema for AI (server-only)
  storage.ts               # localStorage load/save, slugify, uid
  whatsapp.ts              # wa.me link builder + prefill templates per niche
```

**No `middleware.ts`. No auth files. No `lib/db.ts`.**

---

## 5. Data Model (TypeScript — single source of truth)

```ts
// lib/types.ts
export type Niche = "home_care" | "cars" | "real_estate";

export interface Site {
  id: string;              // uid()
  slug: string;            // slugify(businessName) + "-" + shortid, e.g. "caretavya-clone-a3f9"
  niche: Niche;
  businessName: string;
  city: string;
  whatsapp: string;        // digits only with country code, e.g. "919971989908"
  callNumber: string;      // digits, defaults to whatsapp
  sections: Section[];
  updatedAt: number;
}

export type SectionType =
  | "hero" | "trust_strip" | "services" | "how_it_works"
  | "why_us" | "reviews" | "faq" | "final_cta";

export interface Section {
  id: string;              // e.g. "hero_1"
  type: SectionType;
  order: number;
  props: Record<string, unknown>;
  // Known props per type (all optional except noted):
  // hero: { eyebrow, title*, subtitle, ctaPrimaryLabel, ctaSecondaryLabel, image?, badges[] }
  // trust_strip: { items: string[] } e.g. ["Verified nurses","Background-checked","Price fixed upfront"]
  // services: { heading, subheading, cards: [{id,title,desc,price,image,ctaLabel}] }
  // how_it_works: { heading, steps: [{title,desc}] } (exactly 3 steps)
  // why_us: { heading, points: [{title,desc}] } (4 points)
  // reviews: { heading, quotes: [{text,name,meta}] } (3 quotes)
  // faq: { heading, items: [{q,a}] } (5-6 items)
  // final_cta: { heading, subheading, ctaLabel }
}

export type PatchOp =
  | { op: "update_site"; patch: Partial<Pick<Site,"businessName"|"city"|"whatsapp"|"callNumber">> }
  | { op: "update_section"; id: string; patch: Record<string, unknown> }
  | { op: "update_card"; sectionId: string; cardId: string; patch: Record<string, unknown> }
  | { op: "add_card"; sectionId: string; card: {title: string; desc?: string; price?: string; image?: string} }
  | { op: "delete_card"; sectionId: string; cardId: string };

export interface ChatMsg { id: string; role: "user"|"assistant"|"system"; text: string; at: number }
```

**Rules:**

1. AI may ONLY return `PatchOp[]`. Never raw HTML, never full `Site`. Server validates with Zod; invalid ops are dropped and assistant replies with a clarification question.
2. `whatsapp`/`callNumber` are the ONLY contact store. Every CTA derives from them via `lib/whatsapp.ts`.
3. `sections` order is fixed for POC (hero → trust → services → how → why → reviews → faq → final). No reorder/add-section in POC.

---

## 6. WhatsApp / Call CTA Spec (Tej's core requirement)

```ts
// lib/whatsapp.ts
export function waLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
export function telLink(number: string): string {
  return `tel:+${number.replace(/\D/g, "")}`;
}
```

**Prefill formulas (must include business + context so owner knows source):**

| Niche | Hero prefill | Card prefill |
|-------|--------------|--------------|
| home_care | `Hi {Biz}, I'd like to book a nurse visit at home in {City}.` | `Hi {Biz}, I need: {CardTitle} at home in {City}. Please share price & slot.` |
| cars | `Hi {Biz}, is {CardTitle} still available? Can I book a test drive?` | same as hero with card title |
| real_estate | `Hi {Biz}, I'm interested in {CardTitle}. Is it available?` | same |

**Placement (every page):**

1. Hero: two buttons — primary green "Chat on WhatsApp" (`waLink`), secondary outline "Call {display}" (`telLink`).
2. Each service/listing card: "Book on WhatsApp" button with card prefill.
3. FAQ bottom + Final CTA: repeat hero buttons.
4. `StickyBar` (mobile only, `md:hidden fixed bottom-0`): two big buttons `[WhatsApp] [Call]`, `safe-area-inset-bottom`, must not cover content (add `pb-20 md:pb-0` to page).
5. Header (public page): small phone display + WhatsApp icon button.

**Tracking (POC):** `console.log("[lead-click]", {slug, type, placement})` + optional in-memory counter shown in chat as system msg ("WhatsApp clicked 3x this session"). No backend.

---

## 7. Templates (seed content — Caretavya-clone quality for home care)

### 7.1 Home Care (FLAGSHIP — must look like Caretavya.com + afriendlynurse.com)

- `businessName` default: "Caretavya Clone", `city`: "Gurgaon", `whatsapp`: "919971989908"
- hero: eyebrow "Nurse on Demand · Gurgaon & Delhi-NCR", title "A trained nurse at your door — within 1 hour.", subtitle "Injections, IV drips, dressings, catheter care, ECG — done at home with dignity. Price fixed on WhatsApp before the nurse leaves.", badges `["Verified nurses","Background-checked","Price fixed upfront"]`
- trust_strip: `["500+ Families Served","98% Satisfaction","24/7 On-Call"]`
- services (6 cards, each with price + image from Unsplash): Injections at Home (₹499), IV Drip at Home (₹1,400), Wound Dressing (₹799), Catheter Care (₹999), ECG at Home (₹899), Post-Op Care (Custom quote)
- how_it_works (3): "Tell us the task" → "We confirm nurse, time & price" → "Nurse arrives, task done"
- why_us (4): Verified not just listed / Price fixed before dispatch / Care desk behind every visit / Elder-first by design
- reviews (3, Indian names, Gurgaon sectors)
- faq (6): how fast? prescription needed? who brings medicines? male/female nurse? course of visits? areas served?
- final_cta: "A nurse at the door, without the hospital trip." + buttons

### 7.2 Cars (basic, 1 listing type)

- Hero: "{Car} in {City} — inspected, fixed price." Specs strip (year/km/fuel/transmission) inside hero props.
- services → reused as inventory grid: cards = cars with price + specs in desc.
- why_us: inspected / history report / warranty / easy finance.
- Prefills use test-drive wording.

### 7.3 Real Estate (basic)

- Hero: "{Project} in {City} from {Price}."
- services → listings grid: cards = units with beds/area/price.
- Prefills use availability wording.

All images: Unsplash source URLs (no upload). All copy: benefit-led, Indian context (₹, Gurgaon/Delhi-NCR defaults).

---

## 8. Chat Flows (exact behavior)

### 8.1 First-run (empty state)

Chat shows assistant msg: "What should we build? Pick a niche or describe your business." + 3 chips. Clicking a chip sends e.g. "Create a home care landing page for Gurgaon" and calls `POST /api/generate`.

### 8.2 `POST /api/generate`

Request: `{ message: string, niche?: Niche }`
Server:
1. Detect niche: explicit param > keyword match (`car|dealer|test drive` → cars; `flat|villa|plot|bhk` → real_estate; else home_care).
2. Extract `businessName` (quoted text or "for X" / "called X", fallback "My Business"), `city` ("in Gurgaon" pattern, fallback "Gurgaon"), `whatsapp` (10-13 digit sequence, fallback template default).
3. If `KILO_API_KEY` set → call Kilo with `prompts.GENERATE_SYSTEM` + user message + template skeleton; expect `{site_fields, section_overrides}`; merge over template. Else → `mock-ai.generate()` (template + extracted fields).
4. Return `{ site }`. Client sets state, saves localStorage, assistant replies: "Done! I built {Biz} ({niche}). Click WhatsApp to test it, or tell me what to change — e.g. 'change headline' / 'add ECG service at 899'."

### 8.3 `POST /api/edit`

Request: `{ site: Site, message: string }`
Server:
1. Build prompt: `prompts.EDIT_SYSTEM` + current site JSON (trimmed) + user message. Instruct model: "Return ONLY JSON array of PatchOp. No prose."
2. If key set → Kilo call, Zod-parse `PatchOp[]`, drop invalid, apply server-side to produce `site2`, return `{ patches, site: site2 }`. Else → `mock-ai.edit()` keyword rules:
   - "headline|title" → update hero.title
   - "whatsapp|number" → update_site whatsapp (+callNumber if same)
   - "add X (at|for|price) N" → add_card to services
   - "remove|delete X" → delete_card by title match
   - "price of X to N" → update_card price
   - "city|area X" → update_site city
   - else → return `{ patches: [], clarifier: "I can change headline, prices, services, WhatsApp number, city. Try: ..." }`
3. Client applies, pushes history entry for Undo, assistant confirms in one line + what changed.

### 8.4 Undo

History stack `Site[]` (max 20). Undo pops and restores. Redo NOT in POC.

### 8.5 Publish

`Publish` button → slug already assigned at generate → save to localStorage map `sites:{slug:Site}` → show "Published! Share: {origin}/s/{slug} [Copy]". Public page reads same localStorage by slug; if missing (different device) shows "This demo page lives in the browser it was created in — Phase 2 adds cloud links." (honest POC limitation).

---

## 9. UI Spec

### 9.1 Editor `/` layout

```
+---------------------------------------------------------------+
| header: logo "Landing POC" | niche badge | mobile toggle | Publish |
+----------------------+----------------------------------------+
| ChatPanel (380px)    | Preview (flex-1, iframe-like div)        |
| - msgs (scroll)      | - toolbar: Desktop/Mobile, Open /s link |
| - chips (3)          | - <LandingRenderer site /> (scaled if mobile: max-w-[390px] mx-auto border) |
| - input + Send       |                                        |
| - Undo + Reset       |                                        |
+----------------------+----------------------------------------+
```

- Mobile responsive: tabs [Chat|Preview] on small screens.
- Chat bubbles: user green-right, assistant white-left, system gray-center.
- Loading state: "Building your page…" skeleton in preview + typing dots in chat. Must feel instant; mock path returns <300ms.
- Reset button clears storage with confirm.

### 9.2 Public `/s/[slug]` layout

Same `<LandingRenderer/>` + minimal header (business name + call icon) + footer ("Made with Landing POC · Phase 2 adds custom domains"). No chat, no editor chrome. `generateMetadata` sets title/desc from hero.

### 9.3 `LandingRenderer` section order + styling

Tailwind, white/green palette (WhatsApp green `#25D366` primary, slate text). Rounded-2xl cards, generous spacing, big tap targets (min-h 48px). All images `loading="lazy"`, `aspect-video object-cover`, onError hide.

---

## 10. API Contracts (Next.js Route Handlers)

```
POST /api/generate
  body: { message: string; niche?: Niche }
  res:  { site: Site } | { error: string }

POST /api/edit
  body: { site: Site; message: string }
  res:  { patches: PatchOp[]; site: Site; reply: string }
```

- Both routes: `export const runtime = "edge"` (Cloudflare-compatible, no Node APIs).
- `lib/kilo.ts` (server-only): `fetch("https://api.kilo.ai/api/gateway/chat/completions", {headers:{Authorization: Bearer KEY}, body:{model, messages, temperature:0.2, response_format:{type:"json_object"}}})` with 25s timeout + 1 retry on different free model. Never throw to client — on failure return mock result + `reply` noting "AI offline, used local draft".
- Zod schemas in `lib/patches.schema.ts`, shared import by both routes.

---

## 11. Edge Cases & Validation

1. No API key → mock path must still produce a great demo (most-likely review path).
2. AI returns prose instead of JSON → try `JSON.parse` extract `{...}`/`[...]`; fail → clarifier reply, no state change.
3. AI invents section id → drop op, log to console.
4. Empty WhatsApp → block Publish with msg "Add a WhatsApp number first: type 'set WhatsApp to 98...'".
5. XSS: never use `dangerouslySetInnerHTML`; render all copy as text. URLs validated (`http(s)`, `wa.me`, `tel:` only).
6. Slug collision → append 4-char suffix.

---

## 12. Build Order (for the implementing agent)

1. `lib/types.ts` + `lib/templates.ts` + `lib/whatsapp.ts` + `lib/storage.ts` (no UI, test with `tsc`).
2. `components/LandingRenderer.tsx` + section components + `app/s/[slug]/page.tsx` — hardcode home-care template, verify Caretavya-look + WhatsApp clicks.
3. `components/ChatPanel.tsx` + `app/page.tsx` + `lib/mock-ai.ts` — full loop works WITHOUT any API key.
4. `app/api/generate|edit/route.ts` + `lib/kilo.ts` + `lib/prompts.ts` — real AI path with graceful fallback to mock.
5. Polish: mobile toggle, sticky bar, undo, publish/copy, empty states, README demo script.
6. `npm run build` must pass; `wrangler pages deploy` works.

---

## 13. Demo Script (README + Loom)

1. "Tej asked for chat-created landing pages with WhatsApp CTAs — here's the POC."
2. Click Home Care chip → page builds. Scroll: hero, services with per-card WhatsApp, reviews, FAQ.
3. Click hero WhatsApp → show prefilled text in new tab. Click Call → dialer.
4. Chat: "add ECG at home for 899" → new card appears. "change WhatsApp to 98..." → all buttons update. Undo → reverts.
5. Toggle mobile → sticky bar. Publish → copy `/s/...` → open incognito.
6. Close: "Phase 2: auth, D1 cloud saves, custom domains, click analytics, image upload. Ready for feedback."

---

## 14. Acceptance Checklist (reviewer ticks before sending to Varun)

- [ ] `npm run dev` → full loop works with NO env key (mock).
- [ ] With `KILO_API_KEY` → real AI edits return valid patches (check Network tab).
- [ ] All `wa.me` links contain digits + encoded prefill; all `tel:` contain `+digits`.
- [ ] Undo restores previous state; history survives refresh via localStorage.
- [ ] `/s/[slug]` works fresh (no editor state) on same browser.
- [ ] Mobile 390px: no overlap, sticky bar visible, tap targets ≥48px.
- [ ] No auth screens, no DB errors, `npm run build` green.

---

*End of spec. If anything conflicts, POC demo-ability wins over completeness. Ask user only if a decision blocks the 2-min video.*
