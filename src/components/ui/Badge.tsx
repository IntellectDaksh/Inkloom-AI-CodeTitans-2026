import React from "react";

export type BadgeVariant =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info"
  | "approved"
  | "pending"
  | "changes_requested"
  | "rejected"
  | "draft"
  | "tag"
  | "neutral"
  | "success"
  | "warning"
  | "verified"
  | "violation"
  | "metadata"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "slate"
  | "cyan"
  | "blue"
  | "gold"
  | "turquoise";

export type DotColor =
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "slate"
  | "cyan"
  | "blue"
  | "gold"
  | "turquoise";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  dotColor?: DotColor;
  pulse?: boolean;
  mono?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  dotColor,
  pulse = false,
  mono = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5 font-semibold",
  };

  const variantStyles: Record<BadgeVariant, string> = {
    // Verified Claim / Telemetry
    verified:
      "bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 shadow-[inset_0_1px_0_rgba(0,242,254,0.15)]",
    turquoise:
      "bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 shadow-[inset_0_1px_0_rgba(0,242,254,0.15)]",
    cyan:
      "bg-[#06B6D4]/10 text-[#22D3EE] border border-[#06B6D4]/30 shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]",

    // Brushed Gold / Executive
    gold:
      "bg-[#E5A93C]/12 text-[#FBBF24] border border-[#E5A93C]/35 shadow-[inset_0_1px_0_rgba(251,191,36,0.2)]",

    // Violations / Critical
    critical:
      "bg-rose-950/40 text-rose-300 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",
    high:
      "bg-rose-950/40 text-rose-300 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",
    violation:
      "bg-rose-950/40 text-rose-300 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",
    rejected:
      "bg-rose-950/40 text-rose-300 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",
    rose:
      "bg-rose-950/40 text-rose-300 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(244,63,94,0.15)]",

    // Approvals / Success
    approved:
      "bg-emerald-950/40 text-emerald-300 border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",
    success:
      "bg-emerald-950/40 text-emerald-300 border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",
    emerald:
      "bg-emerald-950/40 text-emerald-300 border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",

    // Warnings / Pending
    medium:
      "bg-amber-950/40 text-amber-300 border border-amber-500/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    warning:
      "bg-amber-950/40 text-amber-300 border border-amber-500/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    changes_requested:
      "bg-amber-950/40 text-amber-300 border border-amber-500/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    amber:
      "bg-amber-950/40 text-amber-300 border border-amber-500/35 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    pending:
      "bg-[#E5A93C]/12 text-[#FBBF24] border border-[#E5A93C]/35 shadow-[inset_0_1px_0_rgba(251,191,36,0.15)]",

    // Info / Neutral / Machined
    low: "bg-[#152038] text-sky-300 border border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    info: "bg-[#152038] text-[#CBD5E1] border border-[#1E2E50] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    draft: "bg-[#0D1527] text-[#94A3B8] border border-[#1E2E50]",
    tag: "bg-[#152038] text-[#CBD5E1] border border-[#1E2E50] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    neutral: "bg-[#152038] text-[#CBD5E1] border border-[#1E2E50] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    slate: "bg-[#152038] text-[#CBD5E1] border border-[#1E2E50] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    blue: "bg-[#152038] text-sky-300 border border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    violet:
      "bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_0_rgba(99,102,241,0.15)]",
    metadata:
      "bg-[#0D1527] text-[#22D3EE] border border-[#1E2E50] font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  };

  const defaultDotColorMap: Record<BadgeVariant, DotColor> = {
    critical: "rose",
    high: "rose",
    medium: "amber",
    low: "blue",
    info: "slate",
    approved: "emerald",
    pending: "gold",
    changes_requested: "amber",
    rejected: "rose",
    draft: "slate",
    tag: "slate",
    neutral: "slate",
    success: "emerald",
    warning: "amber",
    verified: "turquoise",
    violation: "rose",
    metadata: "turquoise",
    emerald: "emerald",
    amber: "amber",
    rose: "rose",
    violet: "violet",
    slate: "slate",
    cyan: "turquoise",
    blue: "blue",
    gold: "gold",
    turquoise: "turquoise",
  };

  const hardwareLedClasses: Record<DotColor, string> = {
    emerald: "hardware-led hardware-led-emerald",
    amber: "hardware-led hardware-led-amber",
    rose: "hardware-led hardware-led-rose",
    violet: "hardware-led hardware-led-blue",
    slate: "hardware-led bg-slate-400",
    cyan: "hardware-led hardware-led-turquoise",
    blue: "hardware-led hardware-led-blue",
    gold: "hardware-led hardware-led-gold",
    turquoise: "hardware-led hardware-led-turquoise",
  };

  const pingColorClasses: Record<DotColor, string> = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    violet: "bg-indigo-400",
    slate: "bg-slate-400",
    cyan: "bg-cyan-400",
    blue: "bg-sky-400",
    gold: "bg-amber-300",
    turquoise: "bg-[#00F2FE]",
  };

  const activeDotColor = dotColor || defaultDotColorMap[variant] || "slate";

  return (
    <span
      className={`inline-flex items-center font-medium rounded select-none leading-none tracking-tight ${
        mono || variant === "metadata" ? "font-mono tracking-normal tabular-nums" : "font-sans"
      } ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex items-center justify-center shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full opacity-60 ${pingColorClasses[activeDotColor]}`}
            />
          )}
          <span className={hardwareLedClasses[activeDotColor]} />
        </span>
      )}
      {children}
    </span>
  );
}
