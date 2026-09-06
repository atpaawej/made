"use client";

import { useEffect, useState, useCallback } from "react";
import type { ChatMsg, Site } from "@/lib/types";
import { loadAllSites, loadChat, saveChat, saveSite, uid } from "@/lib/storage";
import ChatPanel from "@/components/ChatPanel";
import Preview from "@/components/Preview";

const STORAGE_KEY = "lpb-poc-v1";
const HISTORY_MAX = 20;

function makeGreeting(): ChatMsg {
  return {
    id: uid(),
    role: "assistant",
    text: "What should we build? Pick a niche or describe your business.",
    at: Date.now(),
  };
}

function nicheLabel(niche: string): string {
  if (niche === "home_care") return "Home Care";
  if (niche === "cars") return "Cars";
  if (niche === "real_estate") return "Real Estate";
  return niche;
}

export default function Page() {
  const [site, setSite] = useState<Site | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [history, setHistory] = useState<Site[]>([]);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "preview">("chat");
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load last site on mount
  useEffect(() => {
    const sites = loadAllSites();
    if (sites.length > 0) {
      const sorted = [...sites].sort((a, b) => b.updatedAt - a.updatedAt);
      const last = sorted[0];
      setSite(last);
      const chat = loadChat(last.id);
      if (chat && chat.length > 0) setMsgs(chat);
      else setMsgs([makeGreeting(), { id: uid(), role: "assistant", text: `Loaded ${last.businessName} (${nicheLabel(last.niche)}). Tell me what to change — e.g. "change headline" or "add ECG service at 899".`, at: Date.now() }]);
      setPublishUrl(`${window.location.origin}/s/${last.slug}`);
    } else {
      setMsgs([makeGreeting()]);
    }
    setLoaded(true);
  }, []);

  // Persist site + chat
  useEffect(() => {
    if (!loaded) return;
    if (site) {
      saveSite(site);
      saveChat(site.id, msgs);
    } else if (msgs.length > 0) {
      // No site yet — persist greeting only if needed? store empty map with chat under temp key not needed.
      // We keep msgs in memory only until a site is created.
    }
  }, [site, msgs, loaded]);

  const pushHistory = useCallback((prev: Site) => {
    setHistory((h) => {
      const clone = JSON.parse(JSON.stringify(prev)) as Site;
      const next = [...h, clone];
      if (next.length > HISTORY_MAX) return next.slice(next.length - HISTORY_MAX);
      return next;
    });
  }, []);

  function appendMsg(role: ChatMsg["role"], text: string) {
    const m: ChatMsg = { id: uid(), role, text, at: Date.now() };
    setMsgs((prev) => [...prev, m]);
    return m;
  }

  // Stub onSend — T05 will replace with real generate/edit calls.
  // Keeps signature onSend(text: string) so future wiring slots in.
  function onSend(text: string) {
    const userMsg: ChatMsg = { id: uid(), role: "user", text, at: Date.now() };
    setMsgs((prev) => [...prev, userMsg]);
    if (site) pushHistory(site);
    setBusy(true);

    // Simulate async to show loading states / preview overlay
    setTimeout(() => {
      // If we have a site, treat as edit stub; otherwise greeting stub
      if (site) {
        // No actual site mutation in T04 — just echo
        appendMsg("assistant", `Got it — "${text}". (AI editing lands in T05. Preview unchanged for now.)`);
      } else {
        appendMsg("assistant", `Nice — you said: "${text}". Page generation will be wired in T05. For now pick another chip or try an edit once a site is loaded via devtools.`);
      }
      setBusy(false);
      // Auto-switch to preview on mobile after send
      setMobileTab("preview");
    }, 700);
  }

  function onUndo() {
    if (history.length === 0 || !site) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setSite(prev);
    appendMsg("system", "Undid last change.");
  }

  function onReset() {
    if (!confirm("Reset and clear all local pages? This cannot be undone.")) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSite(null);
    setHistory([]);
    setPublishUrl(null);
    setMsgs([makeGreeting()]);
  }

  function onPublish() {
    if (!site) {
      appendMsg("system", "Create a page first before publishing.");
      return;
    }
    const digits = site.whatsapp.replace(/\D/g, "");
    if (!digits || digits.length < 8 || digits.length > 15) {
      appendMsg("system", "Add a WhatsApp number first: type 'set WhatsApp to 98...'");
      return;
    }
    const updated: Site = { ...site, updatedAt: Date.now() };
    saveSite(updated);
    setSite(updated);
    const url = `${window.location.origin}/s/${site.slug}`;
    setPublishUrl(url);
    appendMsg("system", `Published! Share: ${url}`);
  }

  async function onCopy() {
    if (!publishUrl) return;
    try {
      await navigator.clipboard.writeText(publishUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      window.prompt("Copy this link:", publishUrl);
    }
  }

  const slugUrl = site && publishUrl ? publishUrl : site ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${site.slug}` : null;
  const canUndo = history.length > 0;

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-tight text-slate-900">Landing POC</span>
          {site ? (
            <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {nicheLabel(site.niche)}
            </span>
          ) : null}
          {site ? (
            <span className="sm:hidden inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {nicheLabel(site.niche)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {publishUrl ? (
            <div className="hidden sm:flex items-center gap-2 max-w-[320px]">
              <span className="truncate text-xs text-slate-500">{publishUrl}</span>
              <button
                onClick={onCopy}
                className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : null}
          <button
            onClick={onPublish}
            disabled={!site}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </div>
      </header>

      {publishUrl ? (
        <div className="flex sm:hidden items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <span className="truncate text-xs text-slate-600">{publishUrl}</span>
          <button
            onClick={onCopy}
            className="shrink-0 inline-flex min-h-[36px] items-center justify-center rounded-full bg-slate-900 px-3 text-xs font-medium text-white"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      ) : null}

      <div className="flex sm:hidden border-b border-slate-200 bg-white">
        <button
          onClick={() => setMobileTab("chat")}
          aria-pressed={mobileTab === "chat"}
          className={`flex flex-1 min-h-[48px] items-center justify-center text-sm font-medium border-b-2 ${mobileTab === "chat" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          aria-pressed={mobileTab === "preview"}
          className={`flex flex-1 min-h-[48px] items-center justify-center text-sm font-medium border-b-2 ${mobileTab === "preview" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"}`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`w-full sm:w-[380px] sm:shrink-0 sm:border-r sm:border-slate-200 flex flex-col overflow-hidden ${mobileTab === "chat" ? "flex" : "hidden sm:flex"}`}
        >
          <ChatPanel
            msgs={msgs}
            busy={busy}
            onSend={onSend}
            onUndo={onUndo}
            onReset={onReset}
            canUndo={canUndo}
          />
        </aside>

        <section className={`flex-1 overflow-hidden bg-slate-100 ${mobileTab === "preview" ? "flex flex-col" : "hidden sm:flex sm:flex-col"}`}>
          <Preview site={site} view={view} onViewChange={setView} slugUrl={slugUrl} busy={busy} />
        </section>
      </div>
    </div>
  );
}
