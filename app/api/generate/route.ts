export const runtime = "edge";

import { z } from "zod";
import { mockGenerate } from "@/lib/mock-ai";
import { GENERATE_SYSTEM } from "@/lib/prompts";
import { getLLM } from "@/lib/llm";
import { shortId, slugify } from "@/lib/storage";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  niche: z.enum(["home_care", "cars", "real_estate"]).optional(),
});

function safeJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const raw = await req.text();
    if (raw.length > 100 * 1024) return Response.json({ error: "payload too large" }, { status: 413 });
    const json: unknown = JSON.parse(raw || "{}");
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: parsed.error.message }, { status: 400 });

    const { message, niche } = parsed.data;
    const base = mockGenerate(message, niche);
    const llm = getLLM();
    if (!llm) return Response.json({ site: base });

    try {
      const prompt = `User message: ${message}\nCurrent base: ${JSON.stringify({ niche: base.niche, businessName: base.businessName, city: base.city, whatsapp: base.whatsapp })}\nTemplate sections: ${JSON.stringify(base.sections.map((s) => ({ id: s.id, type: s.type })))}`;
      const text = await llm.chat(
        [{ role: "system", content: GENERATE_SYSTEM }, { role: "user", content: prompt }],
        { jsonMode: true, maxTokens: 2048 }
      );
      const data = safeJson(text) as Record<string, unknown> | null;
      if (!data || typeof data !== "object") throw new Error("bad json");
      const fields = (data["site_fields"] ?? {}) as Record<string, unknown>;
      const overrides = (data["section_overrides"] ?? {}) as Record<string, unknown>;
      let site = { ...base };
      if (typeof fields["businessName"] === "string" && fields["businessName"].trim()) site.businessName = String(fields["businessName"]).slice(0, 80);
      if (typeof fields["city"] === "string" && fields["city"].trim()) site.city = String(fields["city"]).slice(0, 40);
      if (typeof fields["whatsapp"] === "string" && /^\d{8,15}$/.test(String(fields["whatsapp"]).replace(/\D/g, ""))) {
        const d = String(fields["whatsapp"]).replace(/\D/g, ""); site.whatsapp = d; site.callNumber = d;
      }
      if (typeof fields["niche"] === "string" && ["home_care", "cars", "real_estate"].includes(fields["niche"] as string)) {
        // niche already set via base; keep as is for stability
      }
      if (overrides && typeof overrides === "object") {
        site.sections = site.sections.map((s) => {
          const patch = (overrides as Record<string, unknown>)[s.id];
          if (patch && typeof patch === "object") return { ...s, props: { ...s.props, ...(patch as Record<string, unknown>) } };
          return s;
        });
      }
      site.updatedAt = Date.now();
      if (site.businessName !== base.businessName) {
        site.slug = `${slugify(site.businessName) || "site"}-${shortId()}`;
      }
      return Response.json({ site });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return Response.json({ site: base, warning: `AI offline, used local draft (${msg.slice(0, 120)})` });
    }
  } catch (e) {
    try {
      // last resort: mock fallback never 500
      const fallback = mockGenerate("fallback", undefined);
      return Response.json({ site: fallback, warning: "fallback mock" });
    } catch {
      return Response.json({ error: "internal" }, { status: 200 });
    }
  }
}
