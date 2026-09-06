import type { Niche, PatchOp, Site } from "./types";
import { shortId, slugify, uid } from "./storage";
import { detectNiche, templateFor } from "./templates";

function extractBusinessName(m: string): string | null {
  const q = m.match(/["']([^"']{2,})["']/);
  if (q?.[1]) return q[1].trim();
  const c = m.match(/called\s+["']?([^"',\n]+?)(?=\s+in\s+|\s+whatsapp|\s+with\s+|\s*,|\s*$)/i);
  if (c?.[1]) { const v = c[1].trim().replace(/^["']|["']$/g, "").trim(); if (v) return v; }
  const f = m.match(/for\s+["']?([^"',\n]+?)(?=\s+in\s+|\s+whatsapp|\s+with\s+|\s*,|\s*$)/i);
  if (f?.[1]) { const v = f[1].trim().replace(/^["']|["']$/g, "").trim(); if (v) return v; }
  return null;
}
function extractCity(m: string): string | null {
  const x = m.match(/\bin\s+([A-Za-z][A-Za-z\s-]{1,30})/i);
  if (!x?.[1]) return null;
  let city = x[1].trim().split(/,|\bwhatsapp\b|\bcall\b|\bnumber\b|\bprice\b/i)[0].trim();
  return city.split(/\s+/).filter(Boolean).slice(0, 2).join(" ") || null;
}
function extractWhatsapp(m: string): string | null {
  const x = m.match(/\d{10,13}/);
  if (!x) return null;
  const d = x[0].replace(/\D/g, "");
  return d.length >= 10 && d.length <= 15 ? d : null;
}
function normalizePrice(raw: string): string {
  const t = raw.trim();
  if (t.includes("\u20B9")) return t;
  const d = t.replace(/[^\d,]/g, "");
  return d ? `\u20B9${d}` : t;
}
function cloneSite(site: Site): Site {
  return JSON.parse(JSON.stringify(site)) as Site;
}
function applyPatches(site: Site, patches: PatchOp[]): Site {
  let next = cloneSite(site);
  for (const op of patches) {
    if (op.op === "update_site") next = { ...next, ...op.patch, updatedAt: Date.now() };
    else if (op.op === "update_section")
      next = { ...next, sections: next.sections.map((s) => (s.id === op.id ? { ...s, props: { ...s.props, ...op.patch } } : s)), updatedAt: Date.now() };
    else if (op.op === "update_card")
      next = { ...next, sections: next.sections.map((s) => s.id !== op.sectionId ? s : { ...s, props: { ...s.props, cards: ((s.props["cards"] as unknown[]) ?? []).map((c) => (c as Record<string, unknown>)["id"] === op.cardId ? { ...(c as Record<string, unknown>), ...op.patch } : c) } }), updatedAt: Date.now() };
    else if (op.op === "add_card") {
      const card = { id: `card_${slugify(op.card.title) || "new"}_${shortId()}`, title: op.card.title, desc: op.card.desc ?? "", price: op.card.price ?? "", image: op.card.image ?? "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop", ctaLabel: "Book on WhatsApp" };
      next = { ...next, sections: next.sections.map((s) => s.id !== op.sectionId ? s : { ...s, props: { ...s.props, cards: [...((s.props["cards"] as unknown[]) ?? []), card] } }), updatedAt: Date.now() };
    } else if (op.op === "delete_card")
      next = { ...next, sections: next.sections.map((s) => s.id !== op.sectionId ? s : { ...s, props: { ...s.props, cards: ((s.props["cards"] as unknown[]) ?? []).filter((c) => (c as Record<string, unknown>)["id"] !== op.cardId) } }), updatedAt: Date.now() };
  }
  return next;
}

const CLARIFIER = "I can change headline, prices, services, WhatsApp number, city. Try: 'add ECG at home for 899'.";

export function mockGenerate(message: string, nicheHint?: Niche): Site {
  const niche = nicheHint ?? detectNiche(message);
  const base = templateFor(niche);
  const businessName = extractBusinessName(message) ?? "My Business";
  const city = extractCity(message) ?? base.city;
  const wp = extractWhatsapp(message) ?? base.whatsapp;
  const digits = wp.replace(/\D/g, "");
  const site: Site = { ...base, id: uid(), slug: `${slugify(businessName) || "site"}-${shortId()}`, niche, businessName, city, whatsapp: digits, callNumber: digits, updatedAt: Date.now(), sections: JSON.parse(JSON.stringify(base.sections)) as Site["sections"] };
  return site;
}

export function mockEdit(site: Site, message: string): { site: Site; reply: string; patches: PatchOp[] } {
  const lower = message.toLowerCase();
  const hero = site.sections.find((s) => s.type === "hero");
  const services = site.sections.find((s) => s.type === "services");

  if (/(headline|title)/i.test(message)) {
    const m = message.match(/(?:headline|title)\s*(?:to|:)\s*(.+)/i);
    let title: string | null = m?.[1]?.trim().replace(/^["']|["']$/g, "").trim() ?? null;
    if (!title) {
      const idx = lower.includes("headline") ? lower.indexOf("headline") : lower.indexOf("title");
      if (idx !== -1) {
        const cleaned = message.slice(idx).replace(/headline|title/i, "").trim().replace(/^\s*(to|:|-)\s*/i, "").trim().replace(/^["']|["']$/g, "").trim();
        if (cleaned) title = cleaned;
      }
    }
    if (title && hero) {
      const patches: PatchOp[] = [{ op: "update_section", id: hero.id, patch: { title } }];
      return { site: applyPatches(site, patches), patches, reply: "Done \u2014 updated headline." };
    }
  }
  if (/(whatsapp|number|call)/i.test(message)) {
    const d = message.match(/\d{8,15}/);
    if (d) {
      const digits = d[0].replace(/\D/g, "");
      if (digits.length >= 8 && digits.length <= 15) {
        const patches: PatchOp[] = [{ op: "update_site", patch: { whatsapp: digits, callNumber: digits } }];
        return { site: applyPatches(site, patches), patches, reply: `Done \u2014 updated WhatsApp to ${digits}.` };
      }
    }
  }
  if (/\badd\b/i.test(message) && services) {
    const a = message.match(/\badd\s+(.+)\s+(?:at|for|price|\u20B9|rs\.?)\s*[ \u20B9]*(\d[\d,]*)/i);
    if (a?.[1] && a?.[2]) {
      let title = a[1].trim().replace(/^["']|["']$/g, "").trim().replace(/\s+(?:at|for|price|rs\.?)\s*$/i, "").trim().replace(/\s+(?:at|for|price|rs\.?)\s*$/i, "").trim();
      const price = normalizePrice(a[2]);
      if (title) {
        const patches: PatchOp[] = [{ op: "add_card", sectionId: services.id, card: { title, price } }];
        return { site: applyPatches(site, patches), patches, reply: `Done \u2014 added "${title}" at ${price}.` };
      }
    }
  }
  if (/\b(remove|delete)\b/i.test(message) && services) {
    const q = message.match(/\b(?:remove|delete)\s+(.+)/i)?.[1]?.trim().replace(/^["']|["']$/g, "").trim();
    if (q) {
      const cards = (services.props["cards"] as unknown as { id: string; title: string }[] | undefined) ?? [];
      const found = cards.find((c) => c.title.toLowerCase().includes(q.toLowerCase()));
      if (found) {
        const patches: PatchOp[] = [{ op: "delete_card", sectionId: services.id, cardId: found.id }];
        return { site: applyPatches(site, patches), patches, reply: `Done \u2014 removed "${found.title}".` };
      }
      return { site, patches: [], reply: `No card matching "${q}" found. ${CLARIFIER}` };
    }
  }
  if (/\bprice\s+of\b/i.test(message) && services) {
    const pm = message.match(/\bprice\s+of\s+(.+?)\s+to\s+([ \u20B9]*\d[\d,]*)/i);
    if (pm?.[1] && pm?.[2]) {
      const q = pm[1].trim().replace(/^["']|["']$/g, "").trim();
      const price = normalizePrice(pm[2]);
      const cards = (services.props["cards"] as unknown as { id: string; title: string }[] | undefined) ?? [];
      const found = cards.find((c) => c.title.toLowerCase().includes(q.toLowerCase()));
      if (found) {
        const patches: PatchOp[] = [{ op: "update_card", sectionId: services.id, cardId: found.id, patch: { price } }];
        return { site: applyPatches(site, patches), patches, reply: `Done \u2014 updated price of "${found.title}" to ${price}.` };
      }
      return { site, patches: [], reply: `No card matching "${q}" found. ${CLARIFIER}` };
    }
  }
  if (/\b(city|area|location)\b/i.test(message)) {
    const cm = message.match(/\b(?:city|area|location)\s*(?:to|:)?\s*([A-Za-z][A-Za-z\s-]{1,30})/i);
    if (cm?.[1]) {
      let city = cm[1].trim().split(/,|\bwhatsapp\b|\bprice\b/i)[0].trim().split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
      if (city) {
        const patches: PatchOp[] = [{ op: "update_site", patch: { city } }];
        return { site: applyPatches(site, patches), patches, reply: `Done \u2014 updated city to ${city}.` };
      }
    }
  }
  return { site, patches: [], reply: CLARIFIER };
}
