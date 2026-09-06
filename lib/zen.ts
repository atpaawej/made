// server-only — implements LLMProvider for Opencode Zen (Responses API)
// Endpoint: https://opencode.ai/zen/v1/responses  model: muse-spark-1.2-contributor-free
// Docs: https://opencode.ai/docs/zen  — uses `input` array, `reasoning.effort:"minimal"` to fit JSON in budget.

import type { LLMMessage, LLMProvider } from "./llm-types";

const ZEN_URL = "https://opencode.ai/zen/v1/responses";
const DEFAULT_MODEL = "muse-spark-1.2-contributor-free";
const TIMEOUT_MS = 25000;

interface ZenResponse {
  id: string;
  status: string;
  incomplete_details?: { reason: string } | null;
  error?: unknown;
  output?: Array<{
    type: string;
    role?: string;
    status?: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
}

function getKey(): string | undefined {
  return process.env["OPENCODE_ZEN_API_KEY"];
}
function getModel(): string {
  return process.env["OPENCODE_ZEN_MODEL"] || DEFAULT_MODEL;
}

function extractText(data: ZenResponse): string {
  const out = data.output ?? [];
  for (const item of out) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c.type === "output_text" && typeof c.text === "string" && c.text.trim()) return c.text;
        if (typeof c.text === "string" && c.text.trim()) return c.text;
      }
    }
  }
  // fallback: any output_text in flat structure
  for (const item of out) {
    const anyItem = item as unknown as { content?: unknown };
    if (typeof anyItem.content === "string" && (anyItem.content as string).trim()) return anyItem.content as string;
  }
  return "";
}

async function zenFetch(messages: LLMMessage[], jsonMode: boolean, maxTokens: number): Promise<string> {
  const key = getKey();
  if (!key) throw new Error("OPENCODE_ZEN_API_KEY missing");
  const model = getModel();

  // Convert to Responses API `input` format (role + content)
  const input = messages.map((m) => ({ role: m.role === "developer" ? "system" : m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model,
    input,
    max_output_tokens: maxTokens,
    reasoning: { effort: "minimal" } as unknown,
  };
  if (jsonMode) body["text"] = { format: { type: "json_object" } };

  const doFetch = async (signal: AbortSignal): Promise<ZenResponse> => {
    const res = await fetch(ZEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
    const text = await res.text();
    let data: ZenResponse;
    try {
      data = JSON.parse(text) as ZenResponse;
    } catch {
      throw new Error(`Zen non-JSON response (${res.status}): ${text.slice(0, 500)}`);
    }
    if (!res.ok) throw new Error(`Zen ${res.status}: ${JSON.stringify(data).slice(0, 800)}`);
    return data;
  };

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const data = await doFetch(controller.signal);
      clearTimeout(t);
      if (data.status && data.status !== "completed") {
        const reason = data.incomplete_details?.reason ?? data.status;
        throw new Error(`Zen incomplete: ${reason}`);
      }
      const txt = extractText(data);
      if (!txt) throw new Error(`Zen empty output: ${JSON.stringify(data).slice(0, 800)}`);
      return txt;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      // retry only on abort / 5xx / incomplete
      const retriable = msg.includes("abort") || msg.includes("500") || msg.includes("incomplete") || msg.includes("Internal server");
      if (attempt === 0 && retriable) continue;
      throw e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export class ZenProvider implements LLMProvider {
  readonly name = "zen";

  async chat(messages: LLMMessage[], opts?: { jsonMode?: boolean; maxTokens?: number }): Promise<string> {
    const jsonMode = opts?.jsonMode ?? false;
    const maxTokens = opts?.maxTokens ?? 2048;
    return zenFetch(messages, jsonMode, maxTokens);
  }
}
