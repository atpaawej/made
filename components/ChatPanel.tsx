"use client";

import { useRef, useState, useEffect } from "react";
import type { ChatMsg } from "@/lib/types";
import { RotateCcw, Trash2, Send } from "lucide-react";

const CHIPS = [
  "Create a home care landing page for Gurgaon",
  "Create a car dealership page for Delhi",
  "Create a real estate page for Gurgaon",
];

interface ChatPanelProps {
  msgs: ChatMsg[];
  busy: boolean;
  onSend: (text: string) => void;
  onUndo?: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  nicheChips?: string[];
}

function formatTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatPanel({
  msgs,
  busy,
  onSend,
  onUndo,
  onReset,
  canUndo,
  nicheChips,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const chips = nicheChips?.length ? nicheChips : CHIPS;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    onSend(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChip(text: string) {
    if (busy) return;
    onSend(text);
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sm:px-4">
        {msgs.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
              What should we build? Pick a niche or describe your business.
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => handleChip(c)}
                  disabled={busy}
                  className="min-h-[48px] rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {msgs.map((m) => {
              if (m.role === "system") {
                return (
                  <div key={m.id} className="flex justify-center">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
                      {m.text}
                    </span>
                  </div>
                );
              }
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-[#25D366] text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`mt-1 text-[10px] ${isUser ? "text-white/80" : "text-slate-400"}`}>
                      {formatTime(m.at)}
                    </p>
                  </div>
                </div>
              );
            })}
            {busy ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            {msgs.length === 1 && msgs[0].role === "assistant" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleChip(c)}
                    disabled={busy}
                    className="min-h-[48px] rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 text-left"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3 space-y-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={busy ? "Building…" : "Describe your business or an edit…"}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 disabled:bg-slate-50"
            aria-label="Chat input"
          />
          <button
            onClick={handleSend}
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo || busy}
            className="inline-flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </button>
          <button
            onClick={onReset}
            disabled={busy}
            className="inline-flex flex-1 min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
