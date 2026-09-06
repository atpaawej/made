import type { Site } from "@/lib/types";
import Hero from "./sections/Hero";
import TrustStrip from "./sections/TrustStrip";
import ServicesGrid from "./sections/ServicesGrid";
import HowItWorks from "./sections/HowItWorks";
import WhyUs from "./sections/WhyUs";
import Reviews from "./sections/Reviews";
import Faq from "./sections/Faq";
import FinalCta from "./sections/FinalCta";
import StickyBar from "./sections/StickyBar";

interface LandingRendererProps {
  site: Site;
}

export default function LandingRenderer({ site }: LandingRendererProps) {
  const sorted = [...site.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="pb-24 md:pb-0 bg-white">
      {sorted.map((section) => {
        switch (section.type) {
          case "hero":
            return <Hero key={section.id} props={section.props} site={site} />;
          case "trust_strip":
            return <TrustStrip key={section.id} props={section.props} />;
          case "services":
            return <ServicesGrid key={section.id} props={section.props} site={site} />;
          case "how_it_works":
            return <HowItWorks key={section.id} props={section.props} />;
          case "why_us":
            return <WhyUs key={section.id} props={section.props} />;
          case "reviews":
            return <Reviews key={section.id} props={section.props} />;
          case "faq":
            return <Faq key={section.id} props={section.props} />;
          case "final_cta":
            return <FinalCta key={section.id} props={section.props} site={site} />;
          default:
            return null;
        }
      })}
      <StickyBar site={site} />
    </div>
  );
}
