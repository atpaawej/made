export const runtime = "edge";

import { z } from "zod";
import { mockEdit } from "@/lib/mock-ai";
import { EDIT_SYSTEM } from "@/lib/prompts";
import { getLLM } from "@/lib/llm";
import { patchesSchema } from "@/lib/patches.schema";
import { applyPatches } from "@/lib/apply-patches";
import type { Site } from "@/lib/types";

const bodySchema = z.object({
  site: z.unknown(),
  message: z.string().min(1).max(2000),
});

function safeJsonArray(text: string): unknown | null {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\[[\s\S]*\]/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    const o = text.match(/\{[\s\S]*\}/);
    if (o) try { const v = JSON.parse(o[0]); return Array.isArray(v) ? v : [v]; } catch { return null; }
    return null;
  }
}

const CLARIFIER = "I can change headline, prices, services, WhatsApp number, city. Try: 'add ECG at home for 899'.";

export async function POST(req: Request): Promise<Response> {
  try {
    const raw = await req.text();
    if (raw.length > 100 * 1024) return Response.json({ error: "payload too large" }, { status: 413 });
    const json: unknown = JSON.parse(raw || "{}");
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: parsed.error.message }, { status: 400 });

    const { site, message } = parsed.data as { site: Site; message: string };
    if (!site || typeof site !== "object" || !Array.isArray((site as Site).sections)) {
      return Response.json({ error: "invalid site" }, { status: 400 });
    }

    const llm = getLLM();
    if (!llm) {
      const r = mockEdit(site, message);
      return Response.json({ patches: r.patches, site: r.site, reply: r.reply });
    }

    try {
      const trimmed = JSON.stringify(site).slice(0, 6000);
      const prompt = `Current site JSON (trimmed): ${trimmed}\nUser edit: ${message}\nReturn ONLY JSON array of PatchOps.`;
      const text = await llm.chat(
        [{ role: "system", content: EDIT_SYSTEM }, { role: "user", content: prompt }],
        { jsonMode: true, maxTokens: 2048 }
      );
      const rawData = safeJsonArray(text);
      if (!Array.isArray(rawData)) throw new Error("not array");
      const result = patchesSchema.safeParse(rawData);
      if (!result.success) {
        // drop invalid ops individually
        const valid: unknown[] = [];
        for (const o of rawData as unknown[]) {
          const one = patchesSchema.safeParse([o]);
          if (one.success) valid.push(o);
        }
        if (valid.length === 0) return Response.json({ patches: [], site, reply: CLARIFIER, warning: result.error.message.slice(0, 300) });
        const next = applyPatches(site, valid as never[]);
        return Response.json({ patches: valid, site: next, reply: `Done — applied ${valid.length} change(s).` });
      }
      if (result.data.length === 0) return Response.json({ patches: [], site, reply: CLARIFIER });
      const next = applyPatches(site, result.data as never[]);
      return Response.json({ patches: result.data, site: next, reply: `Done — applied ${result.data.length} change(s).` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // fallback to mock on AI failure
      const r = mockEdit(site, message);
      return Response.json({ patches: r.patches, site: r.site, reply: r.reply, warning: `AI offline, used local draft (${msg.slice(0, 120)})` });
    }
  } catch (e) {
    return Response.json({ error: "internal", patches: [], reply: CLARIFIER }, { status: 200 });
  }
}
