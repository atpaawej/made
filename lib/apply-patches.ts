import type { PatchOp, Site } from "./types";
import { shortId, slugify } from "./storage";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function applyPatches(site: Site, patches: PatchOp[]): Site {
  let next = clone(site);
  for (const op of patches) {
    if (op.op === "update_site") {
      next = { ...next, ...op.patch, updatedAt: Date.now() };
    } else if (op.op === "update_section") {
      next = {
        ...next,
        sections: next.sections.map((s) => (s.id === op.id ? { ...s, props: { ...s.props, ...op.patch } } : s)),
        updatedAt: Date.now(),
      };
    } else if (op.op === "update_card") {
      next = {
        ...next,
        sections: next.sections.map((s) =>
          s.id !== op.sectionId
            ? s
            : {
                ...s,
                props: {
                  ...s.props,
                  cards: ((s.props["cards"] as unknown[]) ?? []).map((c) =>
                    (c as Record<string, unknown>)["id"] === op.cardId ? { ...(c as Record<string, unknown>), ...op.patch } : c
                  ),
                },
              }
        ),
        updatedAt: Date.now(),
      };
    } else if (op.op === "add_card") {
      const card = {
        id: `card_${slugify(op.card.title) || "new"}_${shortId()}`,
        title: op.card.title,
        desc: op.card.desc ?? "",
        price: op.card.price ?? "",
        image: op.card.image ?? "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop",
        ctaLabel: "Book on WhatsApp",
      };
      next = {
        ...next,
        sections: next.sections.map((s) =>
          s.id !== op.sectionId ? s : { ...s, props: { ...s.props, cards: [...((s.props["cards"] as unknown[]) ?? []), card] } }
        ),
        updatedAt: Date.now(),
      };
    } else if (op.op === "delete_card") {
      next = {
        ...next,
        sections: next.sections.map((s) =>
          s.id !== op.sectionId
            ? s
            : {
                ...s,
                props: {
                  ...s.props,
                  cards: ((s.props["cards"] as unknown[]) ?? []).filter(
                    (c) => (c as Record<string, unknown>)["id"] !== op.cardId
                  ),
                },
              }
        ),
        updatedAt: Date.now(),
      };
    }
  }
  return next;
}
