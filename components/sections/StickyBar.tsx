import type { Site } from "@/lib/types";
import { telLink, waLink } from "@/lib/whatsapp";

function heroPrefill(site: Site): string {
  const biz = site.businessName;
  const city = site.city;
  switch (site.niche) {
    case "cars":
      return `Hi ${biz}, is a car still available in ${city}? Can I book a test drive?`;
    case "real_estate":
      return `Hi ${biz}, I'm interested in a property in ${city}. Is it available?`;
    case "home_care":
    default:
      return `Hi ${biz}, I'd like to book a nurse visit at home in ${city}.`;
  }
}

interface StickyBarProps {
  site: Site;
}

export default function StickyBar({ site }: StickyBarProps) {
  const waHref = waLink(site.whatsapp, heroPrefill(site));
  const telHref = telLink(site.callNumber);

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => console.log("[lead-click]", { slug: site.slug, type: "whatsapp", placement: "sticky_bar" })}
        className="flex flex-1 min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-105"
      >
        WhatsApp
      </a>
      <a
        href={telHref}
        onClick={() => console.log("[lead-click]", { slug: site.slug, type: "call", placement: "sticky_bar" })}
        className="flex flex-1 min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
      >
        Call
      </a>
    </div>
  );
}
