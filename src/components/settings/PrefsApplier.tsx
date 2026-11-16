"use client";

import { useEffect } from "react";
import { usePrefs, type Accent } from "../guide/workspace";

// Accent swaps the brand "blue" token that every bg-blue / ring / focus utility reads.
export const ACCENTS: Record<Accent, { label: string; color: string }> = {
  sky: { label: "Sky", color: "#4bc7f4" },
  violet: { label: "Violet", color: "#8b7cf6" },
  emerald: { label: "Emerald", color: "#14b48a" },
  amber: { label: "Amber", color: "#e0a030" },
  rose: { label: "Rose", color: "#ec6a8c" },
};

// Rules for prefs that globals.css doesn't know about; kept here so the setting and its effect live together.
const CSS = `
html[data-corners="sharp"]{--radius-sm:2px;--radius-md:3px;--radius-lg:4px;--radius-xl:4px;--radius-2xl:6px;--radius-3xl:8px}
html[data-corners="sharp"] .glass,html[data-corners="sharp"] .glass-strong,html[data-corners="sharp"] .glass-inset{border-radius:6px}
html[data-fx="off"] .atmosphere,html[data-fx="off"] .fl-layer{display:none!important}
`;

/** Mirrors appearance + notification prefs onto <html> so CSS can act on them app-wide. */
export function PrefsApplier() {
  const p = usePrefs();
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.motion = p.motion;
    h.dataset.density = p.density;
    h.dataset.breathing = p.breathing ? "on" : "off";
    h.dataset.inapp = p.notifyInApp ? "on" : "off";
    h.dataset.corners = p.corners;
    h.dataset.fx = p.backgroundFx ? "on" : "off";
    h.style.setProperty("--root-font", `${p.textSize}px`);
    const accent = (ACCENTS[p.accent] ?? ACCENTS.sky).color;
    for (const v of ["--color-blue", "--color-border-focus", "--color-status-cyan", "--color-turquoise-500"]) h.style.setProperty(v, accent);
  }, [p.motion, p.density, p.breathing, p.notifyInApp, p.textSize, p.corners, p.backgroundFx, p.accent]);
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
