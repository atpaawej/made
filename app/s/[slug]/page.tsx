"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/types";
import { loadSite } from "@/lib/storage";
import { telLink } from "@/lib/whatsapp";
import LandingRenderer from "@/components/LandingRenderer";
import { Phone } from "lucide-react";

interface Params {
  params: { slug: string };
}

export default function PublicPage({ params }: Params) {
  const slug = params.slug;
  const [site, setSite] = useState<Site | null | undefined>(undefined);

  useEffect(() => {
    const loaded = loadSite(slug);
    setSite(loaded);

    if (loaded) {
      const hero = loaded.sections.find((s) => s.type === "hero");
      const title = hero && typeof hero.props.title === "string" ? (hero.props.title as string) : loaded.businessName;
      document.title = `${title} — ${loaded.businessName}`;
    }
  }, [slug]);

  if (site === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  if (site === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Page not found on this device</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          This demo page lives in the browser it was created in — Phase 2 adds cloud links. Try creating a page
          on this device, or ask the owner to re-share from their browser.
        </p>
        <a href="/" className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white">
          Go to builder
        </a>
      </main>
    );
  }

  const telHref = telLink(site.callNumber);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <span className="text-sm font-bold text-slate-900">{site.businessName}</span>
        <a
          href={telHref}
          onClick={() => console.log("[lead-click]", { slug: site.slug, type: "call", placement: "header" })}
          aria-label="Call"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-105"
        >
          <Phone className="h-5 w-5" />
        </a>
      </header>

      <LandingRenderer site={site} />

      <footer className="border-t border-slate-100 bg-white px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
        Made with Landing POC · Phase 2 adds custom domains
      </footer>
    </div>
  );
}
