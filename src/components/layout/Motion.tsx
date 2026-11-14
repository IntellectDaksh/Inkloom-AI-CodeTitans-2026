"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Gray placeholder blocks shown for a beat before a page appears. */
export function PageSkeleton() {
  return (
    <div className="skel-page" aria-hidden="true">
      <div className="skel skel-title" />
      <div className="skel skel-line" style={{ width: "38%" }} />
      <div className="skel-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skel skel-tile" />
        ))}
      </div>
      <div className="skel skel-block" />
      <div className="skel skel-block" style={{ height: 140 }} />
    </div>
  );
}

// Blocks inside <main> that fade up as they scroll into view.
const REVEAL_TARGETS =
  ":scope > * > *, :scope [class*='grid'] > *, :scope section, :scope article, :scope li, :scope table";

/**
 * Wraps page content: short skeleton on each route, then content fades in and
 * blocks reveal on scroll. Content mounts immediately underneath so data
 * fetching is not delayed by the skeleton.
 */
export function PageMotion({ children }: { children: ReactNode }) {
  // Each page renders its own AppLayout, so this mounts fresh on every route.
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 550);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const root = rootRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const tag = () => {
      let n = 0;
      root.querySelectorAll<HTMLElement>(REVEAL_TARGETS).forEach((el) => {
        if (el.dataset.rv || el.closest("dialog, [role='dialog']")) return;
        el.dataset.rv = "1";
        el.classList.add("rv");
        el.style.setProperty("--rv-delay", `${(n++ % 6) * 55}ms`);
        io.observe(el);
      });
    };
    tag();
    // Lists that load after the first paint get the same treatment.
    const mo = new MutationObserver(tag);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ready]);

  return (
    <div className="page-motion">
      {!ready && <PageSkeleton />}
      <div ref={rootRef} className={ready ? "page-in" : "page-wait"} aria-busy={!ready}>
        {children}
      </div>
    </div>
  );
}

/** Thin bar at the top while moving between pages. */
export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "run" | "done">("idle");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href || !href.startsWith("/") || a.target === "_blank") return;
      if (href.split("#")[0] === window.location.pathname) return;
      setState("run");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    setState((s) => (s === "run" ? "done" : s));
    const t = window.setTimeout(() => setState("idle"), 450);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return <div className={`route-progress route-${state}`} aria-hidden="true" />;
}
