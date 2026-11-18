"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `fn` every `ms` while the tab is visible, and right away when the tab regains focus/visibility.
 * Paused in background tabs so idle tabs cost nothing.
 */
export function useLivePoll(fn: () => void, ms = 20_000) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    let last = 0;
    // focus and visibilitychange often fire together; run once.
    // Skips while offline, and after 10 quiet minutes on one page slows to every 60s (user is likely away).
    const opened = Date.now();
    const run = () => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      if (Date.now() - last > 2000) { last = Date.now(); ref.current(); }
    };
    const stop = () => { if (t) clearInterval(t); t = null; };
    const start = () => {
      stop();
      t = setInterval(() => {
        if (Date.now() - opened > 10 * 60_000 && Date.now() - last < 60_000) return;
        run();
      }, ms);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") { run(); start(); } else stop();
    };
    const onFocus = run;
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => { stop(); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onFocus); };
  }, [ms]);
}
