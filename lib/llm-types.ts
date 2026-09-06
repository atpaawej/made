export type LLMRole = "system" | "user" | "assistant" | "developer";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMProvider {
  readonly name: string;
  chat(messages: LLMMessage[], opts?: { jsonMode?: boolean; maxTokens?: number }): Promise<string>;
}
