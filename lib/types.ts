export type Niche = "home_care" | "cars" | "real_estate";

export interface Site {
  id: string;
  slug: string;
  niche: Niche;
  businessName: string;
  city: string;
  whatsapp: string;
  callNumber: string;
  sections: Section[];
  updatedAt: number;
}

export type SectionType =
  | "hero"
  | "trust_strip"
  | "services"
  | "how_it_works"
  | "why_us"
  | "reviews"
  | "faq"
  | "final_cta";

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  props: Record<string, unknown>;
}

export type PatchOp =
  | { op: "update_site"; patch: Partial<Pick<Site, "businessName" | "city" | "whatsapp" | "callNumber">> }
  | { op: "update_section"; id: string; patch: Record<string, unknown> }
  | { op: "update_card"; sectionId: string; cardId: string; patch: Record<string, unknown> }
  | { op: "add_card"; sectionId: string; card: { title: string; desc?: string; price?: string; image?: string } }
  | { op: "delete_card"; sectionId: string; cardId: string };

export interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  at: number;
}
