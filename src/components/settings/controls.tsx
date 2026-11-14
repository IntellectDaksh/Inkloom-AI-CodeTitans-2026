"use client";

import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { focusRing } from "../guide/workspace";

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-text-primary" aria-hidden>
          {value}
          {unit}
        </span>
      </div>
      <div className="relative pt-7">
        <span
          className="set-anim pointer-events-none absolute top-0 -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white transition-[left] duration-100"
          style={{ left: `calc(${fill}% + ${10 - fill * 0.2}px)` }}
          aria-hidden
        >
          {value}
          {unit}
        </span>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={`${value}${unit}`}
          aria-describedby={hint ? `${id}-h` : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
          className="set-range"
          style={{ "--fill": `${fill}%` } as React.CSSProperties}
        />
        <div className="mt-1.5 flex justify-between text-xs text-text-muted" aria-hidden>
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      </div>
      {hint && (
        <p id={`${id}-h`} className="text-[13px] text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint?: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className={`text-sm font-medium ${disabled ? "text-text-muted" : "text-text-primary"}`}>
          {label}
        </label>
        {hint && (
          <p id={`${id}-h`} className="mt-0.5 text-[13px] text-text-muted">
            {hint}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-h` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`set-anim relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-blue" : "bg-border-strong"
        } ${focusRing}`}
      >
        <span
          className={`set-anim inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]');
      if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value]);
  const move = (dir: number) => {
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + dir + options.length) % options.length];
    onChange(next.value);
    requestAnimationFrame(() => wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
  };
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary" id={`${label}-seg`}>
        {label}
      </p>
      <div
        ref={wrap}
        role="radiogroup"
        aria-labelledby={`${label}-seg`}
        className="relative inline-flex w-full rounded-xl border border-border-default bg-panel p-1 sm:w-auto"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), move(1));
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), move(-1));
        }}
      >
        <span
          className="set-anim absolute inset-y-1 rounded-lg bg-ink shadow-sm transition-[left,width] duration-300 ease-out"
          style={{ left: ind.left, width: ind.width }}
          aria-hidden
        />
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(o.value)}
              className={`set-anim relative z-10 h-9 flex-1 cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors duration-200 sm:flex-none ${
                on ? "text-white" : "text-text-secondary hover:text-text-primary"
              } ${focusRing}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
