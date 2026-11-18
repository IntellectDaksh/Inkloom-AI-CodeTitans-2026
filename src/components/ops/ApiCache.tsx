"use client";

import { useEffect } from "react";

/**
 * Device-side stale-while-revalidate cache for the app's own GET /api/* calls.
 * - A GET answered within MAX_AGE is served from this device instantly, then refreshed in the
 *   background so the next visit has fresh data.
 * - Any write (POST/PUT/PATCH/DELETE) clears the cache, so you never see your own change undone.
 * - Cache is per signed-in user and wiped on sign-out.
 * - After sign-in, the main screens' data is prefetched so the first navigation is instant.
 * ponytail: localStorage, 4 MB budget, whole-response JSON; move to IndexedDB if payloads grow.
 */
const PREFIX = "adsnitch:api:";
const MAX_AGE = 5 * 60_000;
const MAX_ENTRY = 400_000;
const SKIP = ["/api/me", "/api/check", "/api/extract", "/api/errors", "/api/feedback", "/api/files", "/api/profile/demo"];
const PREFETCH = ["/api/workspaces", "/api/submissions", "/api/notifications", "/api/claims", "/api/analytics", "/api/approvals"];

let installed = false;
let userKey = "";

const keyFor = (url: string) => `${PREFIX}${userKey}:${url}`;
function clearAll() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) localStorage.removeItem(k);
    }
  } catch {}
}

function install() {
  if (installed) return;
  installed = true;
  const orig = window.fetch.bind(window);

  const store = async (url: string, res: Response) => {
    if (!res.ok || !userKey) return;
    try {
      const text = await res.clone().text();
      if (text.length < MAX_ENTRY) localStorage.setItem(keyFor(url), JSON.stringify({ t: Date.now(), body: text }));
    } catch {
      clearAll(); // quota exceeded: start over rather than serve a half-written cache
    }
  };

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const u = new URL(url, location.origin);
    const isApi = u.origin === location.origin && u.pathname.startsWith("/api/");
    if (!isApi) return orig(input, init);
    if (method !== "GET") {
      const res = await orig(input, init);
      clearAll();
      return res;
    }
    const path = u.pathname + u.search;
    // ?fresh=1 = live poll: always hit the network (and don't cache the poll URL).
    if (!userKey || u.searchParams.get("fresh") === "1" || SKIP.some((s) => u.pathname === s || u.pathname.startsWith(s + "/"))) return orig(input, init);
    try {
      const hit = JSON.parse(localStorage.getItem(keyFor(path)) || "null") as { t: number; body: string } | null;
      if (hit && Date.now() - hit.t < MAX_AGE) {
        orig(input, init).then((r) => store(path, r)).catch(() => {});
        return new Response(hit.body, { status: 200, headers: { "Content-Type": "application/json", "X-Cache": "device" } });
      }
    } catch {}
    const res = await orig(input, init);
    if (res.status === 401 && u.pathname !== "/api/me") window.dispatchEvent(new Event("adsnitch:signed-out"));
    store(path, res);
    return res;
  };
}

export function ApiCache() {
  useEffect(() => {
    install();
    const onMe = async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        const d = r.ok ? await r.json() : null;
        const id: string = d?.me?.id ?? "";
        if (id !== userKey) {
          clearAll();
          userKey = id;
          // Warm the main screens right after sign-in.
          if (id) for (const p of PREFETCH) fetch(p).catch(() => {});
        }
      } catch {}
    };
    onMe();
    window.addEventListener("adsnitch:me", onMe);
    return () => window.removeEventListener("adsnitch:me", onMe);
  }, []);
  return null;
}
