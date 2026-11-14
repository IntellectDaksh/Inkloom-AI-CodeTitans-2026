"use client";

import type { CSSProperties } from "react";

/**
 * Ambient layer: a few half-blurred ad fragments (a mini ad card, a #ad tag,
 * an approval seal, a highlighted phrase, a quote) drifting slowly behind the
 * content. Decorative only: aria-hidden, no pointer events, off for reduced motion.
 */
type Item = {
  kind: "card" | "tag" | "seal" | "mark" | "quote" | "score" | "rule" | "stamp" | "bars" | "verified";
  top: string;
  left: string;
  scale: number;
  blur: number;
  dur: number;
  delay: number;
};

const PAGE: Item[] = [
  { kind: "card", top: "14%", left: "4%", scale: 1, blur: 3, dur: 19, delay: 0 },
  { kind: "tag", top: "34%", left: "88%", scale: 1.1, blur: 1.5, dur: 15, delay: -4 },
  { kind: "seal", top: "58%", left: "6%", scale: 0.9, blur: 2.5, dur: 21, delay: -8 },
  { kind: "mark", top: "72%", left: "82%", scale: 1, blur: 3.5, dur: 17, delay: -2 },
  { kind: "quote", top: "88%", left: "40%", scale: 1.2, blur: 4, dur: 23, delay: -11 },
  { kind: "score", top: "46%", left: "70%", scale: 0.85, blur: 5, dur: 18, delay: -6 },
  { kind: "rule", top: "24%", left: "56%", scale: 0.9, blur: 4, dur: 20, delay: -3 },
  { kind: "stamp", top: "8%", left: "74%", scale: 1, blur: 2, dur: 22, delay: -9 },
  { kind: "bars", top: "64%", left: "30%", scale: 0.9, blur: 4.5, dur: 19, delay: -14 },
  { kind: "verified", top: "40%", left: "14%", scale: 1, blur: 2, dur: 16, delay: -5 },
  { kind: "tag", top: "94%", left: "8%", scale: 0.9, blur: 3, dur: 21, delay: -10 },
  { kind: "card", top: "52%", left: "92%", scale: 0.8, blur: 4, dur: 25, delay: -16 },
];

const APP: Item[] = [
  { kind: "tag", top: "18%", left: "86%", scale: 0.9, blur: 3, dur: 18, delay: 0 },
  { kind: "seal", top: "70%", left: "90%", scale: 0.8, blur: 4, dur: 22, delay: -7 },
  { kind: "card", top: "78%", left: "18%", scale: 0.85, blur: 5, dur: 24, delay: -12 },
  { kind: "mark", top: "36%", left: "60%", scale: 0.8, blur: 6, dur: 20, delay: -5 },
  { kind: "verified", top: "10%", left: "44%", scale: 0.85, blur: 5, dur: 21, delay: -3 },
  { kind: "bars", top: "56%", left: "4%", scale: 0.8, blur: 5, dur: 23, delay: -9 },
];

function Shape({ kind }: { kind: Item["kind"] }) {
  switch (kind) {
    case "card":
      return (
        <div className="fl-card">
          <i className="fl-dot" />
          <span style={{ width: "78%" }} />
          <span style={{ width: "56%" }} />
          <span className="fl-hi" style={{ width: "40%" }} />
        </div>
      );
    case "tag":
      return <div className="fl-tag">#ad</div>;
    case "seal":
      return (
        <svg className="fl-seal" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
          <circle cx="32" cy="32" r="21" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.2" />
          <path d="M23 33l6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "mark":
      return <div className="fl-mark">2x faster</div>;
    case "quote":
      return <div className="fl-quote">&ldquo;</div>;
    case "rule":
      return <div className="fl-rule">FTC 16 CFR 255</div>;
    case "stamp":
      return <div className="fl-stamp">Approved</div>;
    case "bars":
      return (
        <div className="fl-bars">
          <i style={{ height: 18 }} />
          <i style={{ height: 30 }} />
          <i style={{ height: 24 }} />
          <i style={{ height: 40 }} />
        </div>
      );
    case "verified":
      return (
        <div className="fl-verified">
          <span>&#10003;</span> Source attached
        </div>
      );
    case "score":
      return (
        <div className="fl-score">
          <b>94</b>
          <small>/100</small>
        </div>
      );
  }
}

export function FloatingLayer({ density = "page" }: { density?: "page" | "app" }) {
  const items = density === "app" ? APP : PAGE;
  return (
    <div className={`fl-layer fl-${density}`} aria-hidden="true">
      {items.map((it, i) => (
        <div
          key={i}
          className="fl-item"
          style={
            {
              top: it.top,
              left: it.left,
              "--s": it.scale,
              "--b": `${it.blur}px`,
              "--d": `${it.dur}s`,
              "--delay": `${it.delay}s`,
            } as CSSProperties
          }
        >
          <Shape kind={it.kind} />
        </div>
      ))}
    </div>
  );
}
