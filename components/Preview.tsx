"use client";

import type { Site } from "@/lib/types";
import LandingRenderer from "@/components/LandingRenderer";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";

interface PreviewProps {
  site: Site | null;
  view: "desktop" | "mobile";
  onViewChange?: (v: "desktop" | "mobile") => void;
  slugUrl?: string | null;
  busy?: boolean;
}

export default function Preview({ site, view, onViewChange, slugUrl, busy }: PreviewProps) {
  return (
    <div className="flex h-full flex-col bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
          <button
            onClick={() => onViewChange?.("desktop")}
            aria-label="Desktop view"
            aria-pressed={view === "desktop"}
            className={`inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 text-xs font-medium ${
              view === "desktop" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </button>
          <button
            onClick={() => onViewChange?.("mobile")}
            aria-label="Mobile view"
            aria-pressed={view === "mobile"}
            className={`inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 text-xs font-medium ${
              view === "mobile" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
        </div>

        {site && slugUrl ? (
          <a
            href={slugUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open public page
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">Publish to get share link</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {!site ? (
          <div className="mx-auto max-w-[640px] rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No page yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Use the chat on the left — pick a niche chip or describe your business. Your preview will appear here
              instantly.
            </p>
            <div className="mt-6 space-y-2">
              <div className="h-3 rounded bg-slate-100" />
              <div className="h-3 rounded bg-slate-100 w-5/6 mx-auto" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-20 rounded-xl bg-slate-100" />
                <div className="h-20 rounded-xl bg-slate-100" />
                <div className="h-20 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {busy ? (
              <div className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-white/70 pt-10 backdrop-blur-sm">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
                  Building your page…
                </div>
              </div>
            ) : null}
            <div className={view === "mobile" ? "max-w-[390px] mx-auto border rounded-2xl shadow-sm bg-white overflow-hidden" : "bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"}>
              <LandingRenderer site={site} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
