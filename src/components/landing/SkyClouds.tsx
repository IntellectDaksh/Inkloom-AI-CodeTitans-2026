"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Each cloud is its own <svg> layer so the painterly filter rasterizes once and only
// the CSS transform changes per frame (compositor-only, no filter re-run).
type Cloud = { box: [number, number, number, number]; depth: number; filter: string; opacity: number; body: ReactNode };

const B = "url(#cloudBody)";
const CLOUDS: Cloud[] = [
  { box: [-80, 100, 680, 200], depth: 0.3, filter: "paintSoft", opacity: 0.55, body: <ellipse cx="260" cy="200" rx="260" ry="60" fill="#e9f2f8" /> },
  { box: [780, 40, 740, 200], depth: 0.25, filter: "paintSoft", opacity: 0.55, body: <ellipse cx="1150" cy="140" rx="300" ry="50" fill="#f6efe4" /> },
  { box: [520, 200, 380, 200], depth: 0.45, filter: "paint", opacity: 0.75, body: <><ellipse cx="700" cy="310" rx="120" ry="48" fill={B} /><ellipse cx="650" cy="285" rx="70" ry="45" fill={B} /></> },
  { box: [1300, 150, 340, 180], depth: 0.4, filter: "paint", opacity: 0.7, body: <><ellipse cx="1460" cy="240" rx="110" ry="40" fill={B} /><ellipse cx="1420" cy="220" rx="60" ry="38" fill={B} /></> },
  {
    box: [560, 160, 1200, 640], depth: 1, filter: "paint", opacity: 1,
    body: <>
      <ellipse cx="1180" cy="560" rx="360" ry="170" fill={B} />
      <ellipse cx="1000" cy="470" rx="190" ry="150" fill={B} />
      <ellipse cx="1290" cy="400" rx="210" ry="180" fill={B} />
      <ellipse cx="1470" cy="520" rx="200" ry="140" fill={B} />
      <ellipse cx="1300" cy="330" rx="120" ry="80" fill="#fff4df" opacity=".9" />
      <ellipse cx="1040" cy="400" rx="90" ry="50" fill="#ffeacb" opacity=".8" />
    </>,
  },
  {
    box: [-200, 420, 1000, 560], depth: 0.85, filter: "paint", opacity: 0.92,
    body: <>
      <ellipse cx="300" cy="760" rx="420" ry="150" fill={B} />
      <ellipse cx="140" cy="660" rx="190" ry="130" fill={B} />
      <ellipse cx="420" cy="650" rx="160" ry="120" fill={B} />
      <ellipse cx="400" cy="590" rx="90" ry="50" fill="#fff1d8" opacity=".85" />
    </>,
  },
];

const still = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  ["off", "reduced"].includes(document.documentElement.dataset.motion ?? "");

export function SkyClouds() {
  const root = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = root.current;
    if (!host || still()) return;
    const r = Math.random;
    const st = CLOUDS.map((c) => ({
      x: 0,
      base: (4 + r() * 8) * (0.4 + c.depth), // px/s, always some westerly wind
      p: [20 + r() * 25, 45 + r() * 40, 9 + r() * 8, 14 + r() * 10].map((s) => (Math.PI * 2) / s),
      ph: [r(), r(), r(), r()].map((v) => v * Math.PI * 2),
    }));
    const fine = matchMedia("(pointer: fine) and (min-width: 901px)").matches;
    let mx = 0, my = 0, tx = 0, ty = 0, raf = 0, last = 0, t = r() * 1000, visible = true;

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      t += dt;
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      const W = host.clientWidth;
      CLOUDS.forEach((c, i) => {
        const s = st[i], el = els.current[i];
        if (!el) return;
        // low-frequency sine sum with random periods/phases: velocity wanders, never repeats visibly
        const v = s.base * (1 + 0.7 * Math.sin(t * s.p[0] + s.ph[0]) + 0.4 * Math.sin(t * s.p[1] + s.ph[1]));
        s.x += v * dt;
        const left = (c.box[0] / 1600) * W, cw = (c.box[2] / 1600) * W;
        if (left + s.x > W) s.x -= W + cw;
        else if (left + s.x + cw < 0) s.x += W + cw;
        const y = 6 * c.depth * Math.sin(t * s.p[2] + s.ph[2]);
        const sc = 1 + 0.025 * Math.sin(t * s.p[3] + s.ph[3]);
        el.style.transform = `translate3d(${(s.x + mx * 24 * c.depth).toFixed(2)}px,${(y + my * 12 * c.depth).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      });
      raf = requestAnimationFrame(frame);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); });
    io.observe(host);
    const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    if (fine) addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", run);
    run();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  return (
    <div ref={root} className="sky-clouds" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="cloudBody" cx=".55" cy=".3" r=".75">
            <stop offset="0" stopColor="#fff8ec" />
            <stop offset=".45" stopColor="#f3f1ee" />
            <stop offset="1" stopColor="#9fb7cc" />
          </radialGradient>
          <filter id="paint" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="70" />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="paintSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="45" />
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="grainF">
            <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0" />
          </filter>
        </defs>
      </svg>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          ref={(el) => { els.current[i] = el; }}
          className="sky-cloud"
          style={{ left: `${(c.box[0] / 1600) * 100}%`, top: `${(c.box[1] / 900) * 100}%`, width: `${(c.box[2] / 1600) * 100}%`, opacity: c.opacity }}
        >
          <svg viewBox={c.box.join(" ")} width="100%" style={{ display: "block", overflow: "visible" }}>
            <g filter={`url(#${c.filter})`}>{c.body}</g>
          </svg>
        </div>
      ))}
      <svg className="sky-ground" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <g filter="url(#paint)"><ellipse cx="800" cy="930" rx="900" ry="140" fill="#eef4f8" /></g>
        <rect width="1600" height="900" filter="url(#grainF)" />
      </svg>
    </div>
  );
}
