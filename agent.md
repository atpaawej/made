# AGENT.md — Repo Rules (read this before writing any code)

> POC: chat-based landing page builder (real estate, cars, home care) with WhatsApp/Call CTAs + chat editing.
> Full spec: `docs/spec.md`. Ticket index: `docs/tickets/INDEX.md`. Work ticket-by-ticket; never cross ticket scope.

## 1. Stack (locked)

- Next.js App Router + TypeScript (strict) + Tailwind CSS. No other UI framework.
- Hosting: Cloudflare Pages (edge). Every API route must have `export const runtime = "edge"` and use Web APIs only — no Node `fs`, `child_process`, `crypto` (node), no sharp.
- State: React state + `localStorage` key `lpb-poc-v1`. No database, no auth, no cookies, no server sessions in POC.
- AI: Kilo Gateway only, server-side via `lib/kilo.ts`. Never call from client. Never expose `KILO_API_KEY` to browser (`NEXT_PUBLIC_` forbidden for secrets).
- Validation: `zod` for every AI output and every API body. AI returns `PatchOp[]` only — never HTML.

## 2. Architecture rules

1. **Single source of truth:** `lib/types.ts` defines `Site`, `Section`, `PatchOp`. Nothing redefines these shapes. Import, don't duplicate.
2. **Pure lib, dumb components, thin routes:**
   - `lib/*` = pure functions (templates, mock-ai, whatsapp, storage, applyPatches). No JSX, no fetch (except `lib/kilo.ts`), no `localStorage` outside `lib/storage.ts`.
   - `components/*` = presentational. `LandingRenderer` switches on `section.type` and renders text only. No AI logic, no routing, no storage writes.
   - `app/api/*` = validate → delegate to lib → return JSON. Max ~60 lines per route. No prompt strings inline (live in `lib/prompts.ts`).
3. **Data flows one way:** chat text → `/api/generate|edit` → validated `Site` → React state → `localStorage` → `LandingRenderer`. No component mutates `Site` in place; always produce a new object (spread / structuredClone).
4. **Contact numbers flow from one place:** `site.whatsapp` / `site.callNumber` → `lib/whatsapp.ts` → every CTA. Never hardcode a phone number in a component.
5. **AI can only patch, never rewrite:** allowed ops are the 5 `PatchOp` variants. Unknown `id`, unknown prop, HTML/script content → drop the op, reply with clarifier. Layout order is fixed in POC (no reorder/add-section).
6. **Mock-first:** `lib/mock-ai.ts` must keep the demo working with no API key. Real AI path degrades to mock on any failure — never 500 to the client.
7. **Ticket boundaries are law:** each ticket lists exact files. Don't touch other tickets' files. Don't add deps, pages, or features not in the ticket. If blocked, stop and report instead of expanding scope.

## 3. Engineering standards

- TypeScript `strict: true`. No `any` (use `unknown` + narrow). No unused vars. `npx tsc --noEmit` must pass.
- Small functions (<40 lines), small files (<200 lines; split section components). Early returns over nesting.
- Naming: `camelCase` vars/fns, `PascalCase` components/types, `kebab-case` files except components. Constants `UPPER_SNAKE`.
- Styling: Tailwind utilities only, no inline `<style>`, no CSS modules. Palette: WhatsApp green `#25D366` primary, slate text. Tap targets ≥48px. Mobile-first (`md:` upwards).
- Images: remote URLs only (Unsplash). Always `loading="lazy"`, `aspect-video object-cover`, `onError` hide. No `next/image` remote without configured domains — plain `<img>` is fine for POC.
- Errors: API returns `{ error: string }` with 4xx for bad input, always JSON. Client shows one-line toast/inline msg, never raw stack. `console.error` server-side only.
- History: undo stack max 20 snapshots, immutable. `structuredClone` or manual spread — never `JSON.parse(JSON.stringify())` on untrusted AI output without schema check first.

## 4. Security rules (production-ready habits even in POC)

1. **Secrets:** `KILO_API_KEY` server-only. Grep before commit: no key, no token, no phone number hardcoded in components. `.env.local` never committed (see `.gitignore`).
2. **XSS:** never `dangerouslySetInnerHTML`. Render AI/template copy as text nodes. URLs allowlisted: `https://` (http only for localhost), `https://wa.me/`, `tel:`, `mailto:`. Anything else → don't render as link.
3. **Injection:** Zod-parse every request body and every AI JSON response. Reject oversized bodies (>100KB). Trim + length-cap strings (title ≤120, desc ≤500, prefill ≤300 chars). Digits-only for phone fields (`/\D/g` strip, 8–15 digits).
4. **SSRF / fetch:** `lib/kilo.ts` posts only to `https://api.kilo.ai/api/gateway/chat/completions` with 25s timeout + 1 retry. No user-controlled URLs fetched server-side.
5. **Privacy:** WhatsApp prefill contains business context only — never personal data. Click tracking is `console.log` + in-memory count in POC; no fingerprinting, no third-party beacons.
6. **Supply chain:** no new npm deps without need. Prefer stdlib + `zod`. No analytics SDKs, no font loaders phoning home in POC.
7. **Commit hygiene:** never commit `.env.local`, `node_modules`, `.next`, `*.pem`. Run `git status` + `git diff --stat` before every commit; stage only intended files.

## 5. Definition of done (every ticket)

- [ ] Scope matches ticket's Do/Don't exactly.
- [ ] `npx tsc --noEmit` green (or `npm run build` for UI tickets).
- [ ] All `wa.me` links have digits + encoded prefill; all `tel:` have `+digits`.
- [ ] No `any`, no `dangerouslySetInnerHTML`, no client-side secret, no Node-only API in routes.
- [ ] Ticket's Accept checkboxes ticked and manually verified.

## 6. How to work

1. Read `docs/spec.md` section(s) named in your ticket + `docs/tickets/INDEX.md` + `lib/types.ts`.
2. Implement smallest diff that satisfies Accept. Match existing patterns; don't invent new abstractions.
3. Verify (tsc/build + manual click-through of the 2-min demo path).
4. Report: files changed, how verified, what's left. No auto-commit unless asked.
