# Landing Page Builder — POC

Chat → landing page with WhatsApp/call CTAs. No auth, no DB, `localStorage` only. AI via Opencode Zen (`https://opencode.ai/zen/v1/responses`, model `muse-spark-1.2-contributor-free`) consumed through `lib/llm.ts` abstraction — plug any `LLMProvider`, routes stay unchanged. Mock fallback when `OPENCODE_ZEN_API_KEY` empty.

## Quick start

```bash
npm install
# optional: real AI
cp .env.example .env.local
# edit OPENCODE_ZEN_API_KEY=sk-...
npm run dev
```

Env: `OPENCODE_ZEN_API_KEY` (required for real AI), `OPENCODE_ZEN_MODEL=muse-spark-1.2-contributor-free`.

## Demo script (2 min — spec §13)

1. "Tej asked for chat-created landing pages with WhatsApp CTAs — here's the POC."
2. Click Home Care chip → page builds. Scroll: hero, services with per-card WhatsApp, reviews, FAQ.
3. Click hero WhatsApp → prefilled text `Hi {Biz}, ...` in new tab. Click Call → `tel:+...` dialer.
4. Chat: "add ECG at home for 899" → new card appears. "change WhatsApp to 98..." → all buttons update. Undo → reverts.
5. Toggle mobile → sticky bar `[WhatsApp][Call]` (`pb-20 md:pb-0`, min-h 48px). Publish → copy `/s/[slug]` → open incognito (note: `localStorage` only, other device shows "lives in the browser it was created in").
6. Close: "Phase 2: auth, D1 cloud saves, custom domains, click analytics, image upload. Ready for feedback."

## Stack

Next.js 14 App Router + Tailwind, `lucide-react`, `zod`, edge routes (`export const runtime="edge"`), `lib/llm.ts` abstraction + `lib/zen.ts` Zen provider.

## LLM abstraction

```ts
// lib/llm.ts
interface LLMProvider { chat(messages, opts?): Promise<string> }
function getLLM(): LLMProvider | null // returns ZenProvider or null → mock
// routes import only getLLM(), never zen directly
```

Swap provider: implement `LLMProvider` (e.g. OpenAI, Anthropic) and return it from `getLLM()` — no route changes.

## API

- `POST /api/generate` `{message, niche?}` → `{site}` (Zen via abstraction or mock, never 500)
- `POST /api/edit` `{site, message}` → `{patches, site, reply}` (drops invalid PatchOps, clarifier on junk)

## Checks

- `npm run build` green
- `npx tsc --noEmit` green
- Console `[lead-click]` on CTA
- No `dangerouslySetInnerHTML`, URL allowlist `https://`, `https://wa.me/`, `tel:`, `mailto:`
