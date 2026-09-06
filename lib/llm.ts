// server-only — do not import in client components
// LLM abstraction: routes depend only on this interface.
// Any LLM can be plugged by implementing LLMProvider.

import { ZenProvider } from "./zen";
import type { LLMProvider } from "./llm-types";
export type { LLMMessage, LLMProvider, LLMRole } from "./llm-types";

/**
 * Factory: returns the configured provider or null (→ mock fallback).
 * Currently backed by Opencode Zen (lib/zen.ts). Add other providers
 * by extending this switch — routes stay unchanged.
 */
export function getLLM(): LLMProvider | null {
  const key = process.env["OPENCODE_ZEN_API_KEY"];
  if (!key) return null;
  return new ZenProvider();
}
