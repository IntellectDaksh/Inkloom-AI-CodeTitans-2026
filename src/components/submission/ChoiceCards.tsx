"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface Choice {
  id: string;
  title: string;
  meta?: string;
  description: string;
}

/** Radio group rendered as cards. Arrow keys move selection (native radio behaviour). */
export function ChoiceCards({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: Choice[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text-primary">{legend}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <label
              key={o.id}
              className={`relative flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue ${
                selected ? "border-ink bg-panel-elevated" : "border-border-default bg-panel hover:border-border-strong"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={selected}
                onChange={() => onChange(o.id)}
                className="sr-only"
              />
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-text-primary">{o.title}</span>
                {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-text-primary" aria-hidden />}
              </span>
              {o.meta && <span className="text-xs text-text-muted">{o.meta}</span>}
              <span className="text-[13px] leading-relaxed text-text-secondary">{o.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
