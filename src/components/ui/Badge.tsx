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
  | "blue";

export type DotColor =
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "slate"
  | "cyan"
  | "blue";

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
    xs: "px-1.5 py-0.2 text-[10px] gap-1",
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  };

  const variantStyles: Record<BadgeVariant, string> = {
    critical: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
    high: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
    medium: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    low: "bg-blue-500/10 text-blue-300 border border-blue-500/25",
    info: "bg-slate-800/40 text-slate-300 border border-slate-700/40",
    approved: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
    pending: "bg-violet-500/10 text-violet-300 border border-violet-500/25",
    changes_requested: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    rejected: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
    draft: "bg-[#141722] text-slate-400 border border-[#2B3248]",
    tag: "bg-[#141722] text-slate-300 border border-[#1E2333]",
    neutral: "bg-[#141722] text-slate-300 border border-[#1E2333]",
    success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    verified: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
    violation: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
    metadata: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-mono",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
    rose: "bg-rose-500/10 text-rose-300 border border-rose-500/25",
    violet: "bg-violet-500/10 text-violet-300 border border-violet-500/25",
    slate: "bg-slate-800/40 text-slate-300 border border-slate-700/40",
    cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25",
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/25",
  };

  const defaultDotColorMap: Record<BadgeVariant, DotColor> = {
    critical: "rose",
    high: "rose",
    medium: "amber",
    low: "blue",
    info: "slate",
    approved: "emerald",
    pending: "violet",
    changes_requested: "amber",
    rejected: "rose",
    draft: "slate",
    tag: "slate",
    neutral: "slate",
    success: "emerald",
    warning: "amber",
    verified: "emerald",
    violation: "rose",
    metadata: "cyan",
    emerald: "emerald",
    amber: "amber",
    rose: "rose",
    violet: "violet",
    slate: "slate",
    cyan: "cyan",
    blue: "blue",
  };

  const dotColorClasses: Record<DotColor, string> = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    violet: "bg-violet-400",
    slate: "bg-slate-400",
    cyan: "bg-cyan-400",
    blue: "bg-blue-400",
  };

  const activeDotColor = dotColor || defaultDotColorMap[variant] || "slate";

  return (
    <span
      className={`inline-flex items-center font-medium rounded select-none leading-none ${
        mono || variant === "metadata" ? "font-mono tracking-tight" : "font-sans"
      } ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColorClasses[activeDotColor]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColorClasses[activeDotColor]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
