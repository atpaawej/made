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

interface FinalCtaProps {
  props: Record<string, unknown>;
  site: Site;
}

export default function FinalCta({ props: p, site }: FinalCtaProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const subheading = typeof p.subheading === "string" ? p.subheading : "";
  const ctaLabel = typeof p.ctaLabel === "string" ? p.ctaLabel : "Chat on WhatsApp";

  const waHref = waLink(site.whatsapp, heroPrefill(site));
  const telHref = telLink(site.callNumber);

  return (
    <section className="bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {heading ? <h2 className="text-2xl font-bold text-white sm:text-3xl">{heading}</h2> : null}
        {subheading ? <p className="mt-3 text-sm leading-relaxed text-slate-300">{subheading}</p> : null}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => console.log("[lead-click]", { slug: site.slug, type: "whatsapp", placement: "final_cta" })}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            {ctaLabel}
          </a>
          <a
            href={telHref}
            onClick={() => console.log("[lead-click]", { slug: site.slug, type: "call", placement: "final_cta" })}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Call Now
          </a>
        </div>
      </div>
    </section>
  );
}
