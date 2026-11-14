"use client";

import { useEffect } from "react";
import { usePrefs } from "../guide/workspace";

/** Mirrors appearance + notification prefs onto <html> so globals.css can act on them app-wide. */
export function PrefsApplier() {
  const p = usePrefs();
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.motion = p.motion;
    h.dataset.density = p.density;
    h.dataset.breathing = p.breathing ? "on" : "off";
    h.dataset.inapp = p.notifyInApp ? "on" : "off";
    h.style.setProperty("--root-font", `${p.textSize}px`);
  }, [p.motion, p.density, p.breathing, p.notifyInApp, p.textSize]);
  return null;
}
