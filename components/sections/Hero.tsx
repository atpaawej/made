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

function isSafeImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

interface HeroProps {
  props: Record<string, unknown>;
  site: Site;
}

export default function Hero({ props: p, site }: HeroProps) {
  const eyebrow = typeof p.eyebrow === "string" ? p.eyebrow : "";
  const title = typeof p.title === "string" ? p.title : "";
  const subtitle = typeof p.subtitle === "string" ? p.subtitle : "";
  const ctaPrimaryLabel = typeof p.ctaPrimaryLabel === "string" ? p.ctaPrimaryLabel : "Chat on WhatsApp";
  const ctaSecondaryLabel = typeof p.ctaSecondaryLabel === "string" ? p.ctaSecondaryLabel : "Call Now";
  const image = typeof p.image === "string" ? p.image : "";
  const badges = Array.isArray(p.badges) ? (p.badges as string[]) : [];

  const waHref = waLink(site.whatsapp, heroPrefill(site));
  const telHref = telLink(site.callNumber);

  const slug = site.slug;

  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">{eyebrow}</p>
          ) : null}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-4 text-base leading-relaxed text-slate-600 max-w-xl">{subtitle}</p> : null}

          {badges.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {badges.map((b) => (
                <li key={b} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {b}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => console.log("[lead-click]", { slug, type: "whatsapp", placement: "hero" })}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
            >
              {ctaPrimaryLabel}
            </a>
            <a
              href={telHref}
              onClick={() => console.log("[lead-click]", { slug, type: "call", placement: "hero" })}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              {ctaSecondaryLabel}
            </a>
          </div>
        </div>

        {image && isSafeImageUrl(image) ? (
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              loading="lazy"
              className="aspect-video w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
