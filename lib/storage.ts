import type { ChatMsg, Site } from "./types";

const STORAGE_KEY = "lpb-poc-v1";

interface StoredData {
  sites: Record<string, Site>;
  chats: Record<string, ChatMsg[]>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emptyStore(): StoredData {
  return { sites: {}, chats: {} };
}

function getStore(): StoredData {
  if (!isBrowser()) return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "sites" in parsed &&
      "chats" in parsed
    ) {
      return parsed as StoredData;
    }
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

function setStore(data: StoredData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or disabled — ignore for POC
  }
}

// --- id helpers ---

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 6);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// --- site helpers ---

export function saveSite(site: Site): void {
  const store = getStore();
  store.sites[site.slug] = site;
  setStore(store);
}

export function loadSite(slug: string): Site | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const store = parsed as StoredData;
    const site = store.sites?.[slug];
    return site ?? null;
  } catch {
    return null;
  }
}

export function loadAllSites(): Site[] {
  const store = getStore();
  return Object.values(store.sites);
}

// --- chat helpers ---

export function saveChat(siteId: string, msgs: ChatMsg[]): void {
  const store = getStore();
  store.chats[siteId] = msgs;
  setStore(store);
}

export function loadChat(siteId: string): ChatMsg[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const store = parsed as StoredData;
    const msgs = store.chats?.[siteId];
    return msgs ?? null;
  } catch {
    return null;
  }
}
