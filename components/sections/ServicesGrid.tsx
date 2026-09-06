import type { Site } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

interface Card {
  id: string;
  title: string;
  desc?: string;
  price?: string;
  image?: string;
  ctaLabel?: string;
}

function cardPrefill(site: Site, cardTitle: string): string {
  const biz = site.businessName;
  const city = site.city;
  switch (site.niche) {
    case "cars":
      return `Hi ${biz}, is ${cardTitle} still available? Can I book a test drive?`;
    case "real_estate":
      return `Hi ${biz}, I'm interested in ${cardTitle}. Is it available?`;
    case "home_care":
    default:
      return `Hi ${biz}, I need: ${cardTitle} at home in ${city}. Please share price & slot.`;
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

interface ServicesGridProps {
  props: Record<string, unknown>;
  site: Site;
}

export default function ServicesGrid({ props: p, site }: ServicesGridProps) {
  const heading = typeof p.heading === "string" ? p.heading : "";
  const subheading = typeof p.subheading === "string" ? p.subheading : "";
  const rawCards = Array.isArray(p.cards) ? (p.cards as Card[]) : [];
  const cards: Card[] = rawCards.filter((c) => c && typeof c.title === "string");

  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {heading ? <h2 className="text-2xl font-bold text-slate-900">{heading}</h2> : null}
        {subheading ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{subheading}</p> : null}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const href = waLink(site.whatsapp, cardPrefill(site, card.title));
            return (
              <div
                key={card.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {card.image && isSafeImageUrl(card.image) ? (
                  <div className="overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                  {card.desc ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.desc}</p> : null}
                  {card.price ? <p className="mt-3 text-sm font-bold text-slate-900">{card.price}</p> : null}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => console.log("[lead-click]", { slug: site.slug, type: "whatsapp", placement: `card:${card.id}` })}
                    className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                  >
                    {card.ctaLabel || "Book on WhatsApp"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
