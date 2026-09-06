import type { Niche, Section, Site } from "./types";
import { shortId, slugify, uid } from "./storage";

// ---------------------------------------------------------------------------
// Niche detection
// ---------------------------------------------------------------------------

/**
 * Detect niche from free-text message.
 * - car|dealer|test drive → cars
 * - flat|villa|plot|bhk|society → real_estate
 * - else → home_care
 */
export function detectNiche(message: string): Niche {
  const lower = message.toLowerCase();
  if (/\b(car|cars|dealer|test\s*drive|vehicle|automobile|showroom)\b/.test(lower)) {
    return "cars";
  }
  if (/\b(flat|villa|plot|bhk|society|apartment|property|real\s*estate|builder)\b/.test(lower)) {
    return "real_estate";
  }
  return "home_care";
}

export function templateFor(niche: Niche): Site {
  switch (niche) {
    case "cars":
      return carsTemplate();
    case "real_estate":
      return realEstateTemplate();
    case "home_care":
    default:
      return homeCareTemplate();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSlug(businessName: string): string {
  const base = slugify(businessName) || "site";
  return `${base}-${shortId()}`;
}

// ---------------------------------------------------------------------------
// Home Care — FLAGSHIP (Caretavya-clone quality)
// ---------------------------------------------------------------------------

export function homeCareTemplate(): Site {
  const businessName = "Caretavya Clone";
  const city = "Gurgaon";
  const whatsapp = "919971989908";

  const sections: Section[] = [
    {
      id: "hero_1",
      type: "hero",
      order: 0,
      props: {
        eyebrow: "Nurse on Demand \u00B7 Gurgaon & Delhi-NCR",
        title: "A trained nurse at your door \u2014 within 1 hour.",
        subtitle:
          "Injections, IV drips, dressings, catheter care, ECG \u2014 done at home with dignity. Price fixed on WhatsApp before the nurse leaves.",
        ctaPrimaryLabel: "Chat on WhatsApp",
        ctaSecondaryLabel: "Call Now",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80&auto=format&fit=crop",
        badges: ["Verified nurses", "Background-checked", "Price fixed upfront"],
      },
    },
    {
      id: "trust_strip_1",
      type: "trust_strip",
      order: 1,
      props: {
        items: ["500+ Families Served", "98% Satisfaction", "24/7 On-Call"],
      },
    },
    {
      id: "services_1",
      type: "services",
      order: 2,
      props: {
        heading: "Care at home, priced upfront",
        subheading: "Pick a task \u2014 we confirm nurse, time & price on WhatsApp before dispatch.",
        cards: [
          {
            id: "card_injections",
            title: "Injections at Home",
            desc: "IM / IV / SC injections by trained nurses. Prescription checked, safe disposal included.",
            price: "\u20B9499",
            image: "https://images.unsplash.com/photo-1584439375511-3c40d73b1d21?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
          {
            id: "card_ivdrip",
            title: "IV Drip at Home",
            desc: "Saline, antibiotics, hydration drips monitored at home. Doctor prescription required.",
            price: "\u20B91,400",
            image: "https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
          {
            id: "card_dressing",
            title: "Wound Dressing",
            desc: "Sterile dressing for post-surgery, diabetic, or injury wounds. Daily visits available.",
            price: "\u20B9799",
            image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
          {
            id: "card_catheter",
            title: "Catheter Care",
            desc: "Insertion, removal & maintenance with hygiene protocol. Male & female nurses available.",
            price: "\u20B9999",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
          {
            id: "card_ecg",
            title: "ECG at Home",
            desc: "12-lead ECG with report in 30 minutes. Technician + portable machine at your door.",
            price: "\u20B9899",
            image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
          {
            id: "card_postop",
            title: "Post-Op Care",
            desc: "Complete post-operative support \u2014 vitals, meds, mobility & coordination with your doctor.",
            price: "Custom quote",
            image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book on WhatsApp",
          },
        ],
      },
    },
    {
      id: "how_it_works_1",
      type: "how_it_works",
      order: 3,
      props: {
        heading: "How it works",
        steps: [
          { title: "Tell us the task", desc: "WhatsApp your need \u2014 injection, dressing, IV drip, or daily visits." },
          { title: "We confirm nurse, time & price", desc: "Care desk matches a verified nurse nearby and fixes price before dispatch." },
          { title: "Nurse arrives, task done", desc: "Trained nurse arrives on time, completes the task with dignity and updates you." },
        ],
      },
    },
    {
      id: "why_us_1",
      type: "why_us",
      order: 4,
      props: {
        heading: "Why families trust us",
        points: [
          { title: "Verified, not just listed", desc: "Every nurse is background-checked, trained & rated after every visit." },
          { title: "Price fixed before dispatch", desc: "No surprises. You approve the price on WhatsApp before the nurse leaves." },
          { title: "Care desk behind every visit", desc: "A real coordinator tracks timing, follow-ups and answers your doubts." },
          { title: "Elder-first by design", desc: "Soft-spoken, patient, and respectful care built for parents & grandparents." },
        ],
      },
    },
    {
      id: "reviews_1",
      type: "reviews",
      order: 5,
      props: {
        heading: "Families in Gurgaon trust us",
        quotes: [
          { text: "Nurse arrived in 45 minutes for my father's dressing. Professional and kind.", name: "Sunita Sharma", meta: "DLF Phase 3, Gurgaon" },
          { text: "Daily injections for 10 days \u2014 same nurse, on time every day. Very reliable.", name: "Amit Verma", meta: "Sector 56, Gurgaon" },
          { text: "ECG at home saved us a hospital trip at night. Report came in 20 minutes.", name: "Priya Mehta", meta: "South Delhi" },
        ],
      },
    },
    {
      id: "faq_1",
      type: "faq",
      order: 6,
      props: {
        heading: "Questions, answered",
        items: [
          { q: "How fast can a nurse arrive?", a: "In Gurgaon & Delhi-NCR, typically within 60 minutes of confirmation. Urgent requests are prioritised." },
          { q: "Is a prescription needed?", a: "For injections, IV drips and ECG \u2014 yes, a valid prescription is required for safety." },
          { q: "Who brings medicines & consumables?", a: "You arrange prescribed medicines; we bring sterile consumables. We confirm the list on WhatsApp upfront." },
          { q: "Can I choose male or female nurse?", a: "Yes. Tell us your preference on WhatsApp and we match accordingly, subject to availability." },
          { q: "Do you offer a course of visits?", a: "Yes \u2014 daily or alternate-day packages for dressings, injections and post-op care with a fixed per-visit price." },
          { q: "Which areas do you serve?", a: "Gurgaon, Delhi, Noida, Faridabad, Ghaziabad \u2014 and nearby NCR. Chat to check your sector." },
        ],
      },
    },
    {
      id: "final_cta_1",
      type: "final_cta",
      order: 7,
      props: {
        heading: "A nurse at the door, without the hospital trip.",
        subheading: "Message us now \u2014 we confirm price, time and nurse on WhatsApp in minutes.",
        ctaLabel: "Chat on WhatsApp",
      },
    },
  ];

  return {
    id: uid(),
    slug: makeSlug(businessName),
    niche: "home_care",
    businessName,
    city,
    whatsapp,
    callNumber: whatsapp,
    sections,
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Cars — basic inventory
// ---------------------------------------------------------------------------

export function carsTemplate(): Site {
  const businessName = "AutoTrust Motors";
  const city = "Gurgaon";
  const whatsapp = "919971989908";

  const sections: Section[] = [
    {
      id: "hero_2",
      type: "hero",
      order: 0,
      props: {
        eyebrow: "Certified Pre-Owned \u00B7 Gurgaon & Delhi-NCR",
        title: "Your next car in Gurgaon \u2014 inspected, fixed price.",
        subtitle: "200-point inspection, full history report, and test drive at your doorstep. No haggling, no surprises.",
        ctaPrimaryLabel: "Chat on WhatsApp",
        ctaSecondaryLabel: "Call to Book Test Drive",
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80&auto=format&fit=crop",
        badges: ["200-Point Inspected", "History Verified", "7-Day Buyback"],
        specs: { year: "2020-2023", km: "18k-45k km", fuel: "Petrol / Diesel", transmission: "Manual / Auto" },
      },
    },
    {
      id: "trust_strip_2",
      type: "trust_strip",
      order: 1,
      props: {
        items: ["500+ Cars Sold", "4.8\u2605 Rating", "Same-Day Test Drive"],
      },
    },
    {
      id: "services_2",
      type: "services",
      order: 2,
      props: {
        heading: "Featured inventory",
        subheading: "Fixed price, inspected stock. Message for full report & test drive slot.",
        cards: [
          {
            id: "card_swift",
            title: "2022 Maruti Swift ZXi",
            desc: "27,000 km \u00B7 Petrol \u00B7 Manual \u00B7 1st Owner \u00B7 DL Reg.",
            price: "\u20B96.25 Lakh",
            image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book Test Drive",
          },
          {
            id: "card_creta",
            title: "2021 Hyundai Creta SX",
            desc: "34,000 km \u00B7 Diesel \u00B7 Auto \u00B7 1st Owner \u00B7 HR Reg.",
            price: "\u20B911.90 Lakh",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book Test Drive",
          },
          {
            id: "card_city",
            title: "2020 Honda City ZX",
            desc: "42,000 km \u00B7 Petrol \u00B7 Manual \u00B7 1st Owner \u00B7 UP Reg.",
            price: "\u20B98.75 Lakh",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Book Test Drive",
          },
        ],
      },
    },
    {
      id: "how_it_works_2",
      type: "how_it_works",
      order: 3,
      props: {
        heading: "How it works",
        steps: [
          { title: "Tell us the car", desc: "Share the model you like or your budget on WhatsApp." },
          { title: "We share report & price", desc: "Get inspection report, service history & fixed price in minutes." },
          { title: "Test drive & close", desc: "Book a doorstep test drive and close with easy finance & RC transfer." },
        ],
      },
    },
    {
      id: "why_us_2",
      type: "why_us",
      order: 4,
      props: {
        heading: "Why buyers choose us",
        points: [
          { title: "Inspected, not just washed", desc: "200-point mechanical, body & OBD check by certified technicians." },
          { title: "Full history report", desc: "Accident, service & ownership history verified before listing." },
          { title: "Warranty included", desc: "6-month engine & gearbox warranty on every car." },
          { title: "Easy finance", desc: "On-spot loan approval & exchange bonus. Paperwork handled." },
        ],
      },
    },
    {
      id: "reviews_2",
      type: "reviews",
      order: 5,
      props: {
        heading: "What buyers say",
        quotes: [
          { text: "Creta was exactly as described. Test drive at home, loan done in a day.", name: "Rohit Khanna", meta: "Sector 45, Gurgaon" },
          { text: "Fixed price saved hours of haggling. Great experience.", name: "Neha Singh", meta: "Dwarka, Delhi" },
          { text: "History report was transparent. Trustworthy team.", name: "Arjun Patel", meta: "Noida" },
        ],
      },
    },
    {
      id: "faq_2",
      type: "faq",
      order: 6,
      props: {
        heading: "Questions, answered",
        items: [
          { q: "Are prices negotiable?", a: "No \u2014 every car has a fixed, inspected price. No last-minute add-ons." },
          { q: "Can I get a test drive at home?", a: "Yes, same-day doorstep test drives across Gurgaon & Delhi-NCR." },
          { q: "Is finance available?", a: "Yes, on-spot approval for most profiles with minimal documents." },
          { q: "What about RC transfer?", a: "We handle RC, insurance transfer and NOC end-to-end." },
          { q: "Do you buy my old car?", a: "Yes \u2014 free valuation on WhatsApp and exchange bonus on purchase." },
          { q: "Is there a buyback?", a: "7-day buyback if you find a major undisclosed issue." },
        ],
      },
    },
    {
      id: "final_cta_2",
      type: "final_cta",
      order: 7,
      props: {
        heading: "Your next car is a WhatsApp away.",
        subheading: "Send your budget & city \u2014 we\u2019ll share the best matches in minutes.",
        ctaLabel: "Chat on WhatsApp",
      },
    },
  ];

  return {
    id: uid(),
    slug: makeSlug(businessName),
    niche: "cars",
    businessName,
    city,
    whatsapp,
    callNumber: whatsapp,
    sections,
    updatedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Real Estate — basic listings
// ---------------------------------------------------------------------------

export function realEstateTemplate(): Site {
  const businessName = "GreenView Homes";
  const city = "Gurgaon";
  const whatsapp = "919971989908";

  const sections: Section[] = [
    {
      id: "hero_3",
      type: "hero",
      order: 0,
      props: {
        eyebrow: "New Launch \u00B7 Gurgaon & Delhi-NCR",
        title: "GreenView Residences in Gurgaon from \u20B985 Lakhs.",
        subtitle: "2/3 BHK ready-to-move flats & plots with registry-ready papers and site visit on WhatsApp booking.",
        ctaPrimaryLabel: "Chat on WhatsApp",
        ctaSecondaryLabel: "Call for Site Visit",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop",
        badges: ["RERA Registered", "Registry Ready", "Free Site Visit"],
      },
    },
    {
      id: "trust_strip_3",
      type: "trust_strip",
      order: 1,
      props: {
        items: ["300+ Families Moved In", "RERA Registered", "On-Time Possession"],
      },
    },
    {
      id: "services_3",
      type: "services",
      order: 2,
      props: {
        heading: "Available units",
        subheading: "Pick a configuration \u2014 we share floor plan, price break-up & availability on WhatsApp.",
        cards: [
          {
            id: "card_2bhk",
            title: "2 BHK \u2014 Sector 82",
            desc: "1,150 sq ft \u00B7 2 Bath \u00B7 Ready to Move \u00B7 GreenView Tower A",
            price: "\u20B985 Lakhs",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Check Availability",
          },
          {
            id: "card_3bhk",
            title: "3 BHK \u2014 Sector 82",
            desc: "1,650 sq ft \u00B7 3 Bath \u00B7 Ready to Move \u00B7 GreenView Tower B",
            price: "\u20B91.35 Cr",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Check Availability",
          },
          {
            id: "card_plot",
            title: "Plots \u2014 Sohna Road",
            desc: "150 sq yd \u00B7 Gated Society \u00B7 Registry Ready \u00B7 GreenView Floors",
            price: "\u20B972 Lakhs",
            image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&auto=format&fit=crop",
            ctaLabel: "Check Availability",
          },
        ],
      },
    },
    {
      id: "how_it_works_3",
      type: "how_it_works",
      order: 3,
      props: {
        heading: "How it works",
        steps: [
          { title: "Share your need", desc: "BHK, budget & location on WhatsApp." },
          { title: "We share options & price", desc: "Floor plans, availability & all-in cost in minutes." },
          { title: "Visit & book", desc: "Free cab site visit and registry assistance." },
        ],
      },
    },
    {
      id: "why_us_3",
      type: "why_us",
      order: 4,
      props: {
        heading: "Why buyers choose us",
        points: [
          { title: "RERA & registry ready", desc: "All titles verified, no village-land risk." },
          { title: "Price all-in", desc: "BSP + parking + PLC shared upfront on WhatsApp." },
          { title: "Free site visit", desc: "Cab pickup from your home for site tour." },
          { title: "Loan assistance", desc: "Tie-ups with HDFC, SBI & ICICI for fast approval." },
        ],
      },
    },
    {
      id: "reviews_3",
      type: "reviews",
      order: 5,
      props: {
        heading: "What owners say",
        quotes: [
          { text: "Possession on time, papers clean. Very smooth.", name: "Vikram Yadav", meta: "Sector 82, Gurgaon" },
          { text: "Site visit was free and honest \u2014 no pushy sales.", name: "Kavita Rao", meta: "Sector 49, Gurgaon" },
          { text: "Loan process handled fully. Moved in 2 weeks.", name: "Sanjay Gupta", meta: "Manesar" },
        ],
      },
    },
    {
      id: "faq_3",
      type: "faq",
      order: 6,
      props: {
        heading: "Questions, answered",
        items: [
          { q: "Is this RERA registered?", a: "Yes \u2014 all towers and plots are RERA registered. We share the number on WhatsApp." },
          { q: "What is the all-in price?", a: "BSP + car park + PLC + registry. We share a full break-up before booking." },
          { q: "Is a site visit free?", a: "Yes, free cab pickup for site visit across Gurgaon & Sohna Road." },
          { q: "Are loans available?", a: "Yes, with HDFC, SBI, ICICI \u2014 we assist with documents & approval." },
          { q: "When is possession?", a: "Ready-to-move units have immediate possession; new towers in 12 months." },
          { q: "Which areas are covered?", a: "Sector 82, 92, Sohna Road, Manesar \u2014 NCR belt." },
        ],
      },
    },
    {
      id: "final_cta_3",
      type: "final_cta",
      order: 7,
      props: {
        heading: "Your next home is a WhatsApp away.",
        subheading: "Share budget & BHK \u2014 we\u2019ll send floor plans & a visit slot today.",
        ctaLabel: "Chat on WhatsApp",
      },
    },
  ];

  return {
    id: uid(),
    slug: makeSlug(businessName),
    niche: "real_estate",
    businessName,
    city,
    whatsapp,
    callNumber: whatsapp,
    sections,
    updatedAt: Date.now(),
  };
}
