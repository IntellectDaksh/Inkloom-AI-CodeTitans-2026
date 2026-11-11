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
  | "cyan"
  | "white"
  | "violet"
  | "slate"
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
    // Functional Status Accents
    verified:
      "bg-[#0E1A1A] text-[#22D3EE] border border-[#0E3A42] shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]",
    turquoise:
      "bg-[#0E1A1A] text-[#22D3EE] border border-[#0E3A42] shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]",
    cyan:
      "bg-[#0E1A1A] text-[#22D3EE] border border-[#0E3A42] shadow-[inset_0_1px_0_rgba(6,182,212,0.15)]",
    metadata:
      "bg-[#0C0C0C] text-[#22D3EE] border border-[#222222] font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",

    // Critical Violations / Rose
    critical:
      "bg-[#1A0E10] text-[#FCA5A5] border border-[#4C1D24] shadow-[inset_0_1px_0_rgba(239,68,68,0.15)]",
    high:
      "bg-[#1A0E10] text-[#FCA5A5] border border-[#4C1D24] shadow-[inset_0_1px_0_rgba(239,68,68,0.15)]",
    violation:
      "bg-[#1A0E10] text-[#FCA5A5] border border-[#4C1D24] shadow-[inset_0_1px_0_rgba(239,68,68,0.15)]",
    rejected:
      "bg-[#1A0E10] text-[#FCA5A5] border border-[#4C1D24] shadow-[inset_0_1px_0_rgba(239,68,68,0.15)]",
    rose:
      "bg-[#1A0E10] text-[#FCA5A5] border border-[#4C1D24] shadow-[inset_0_1px_0_rgba(239,68,68,0.15)]",

    // Compliant / Approvals / Emerald
    approved:
      "bg-[#0C1A14] text-[#86EFAC] border border-[#14422B] shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",
    success:
      "bg-[#0C1A14] text-[#86EFAC] border border-[#14422B] shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",
    emerald:
      "bg-[#0C1A14] text-[#86EFAC] border border-[#14422B] shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]",

    // Warnings / Review / Amber
    medium:
      "bg-[#1C1608] text-[#FCD34D] border border-[#4A3810] shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    warning:
      "bg-[#1C1608] text-[#FCD34D] border border-[#4A3810] shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    changes_requested:
      "bg-[#1C1608] text-[#FCD34D] border border-[#4A3810] shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    amber:
      "bg-[#1C1608] text-[#FCD34D] border border-[#4A3810] shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
    pending:
      "bg-[#1C1608] text-[#FCD34D] border border-[#4A3810] shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",

    // Monochromatic High-Contrast Swiss Tags
    gold:
      "bg-[#181818] text-white border border-[#333333] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    low: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    info: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    draft: "bg-[#0C0C0C] text-[#A0A0A0] border border-[#222222]",
    tag: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    neutral: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    slate: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    blue: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
    violet: "bg-[#141414] text-[#EFEFEF] border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
  };

  const defaultDotColorMap: Record<BadgeVariant, DotColor> = {
    critical: "rose",
    high: "rose",
    medium: "amber",
    low: "cyan",
    info: "white",
    approved: "emerald",
    pending: "amber",
    changes_requested: "amber",
    rejected: "rose",
    draft: "white",
    tag: "white",
    neutral: "white",
    success: "emerald",
    warning: "amber",
    verified: "cyan",
    violation: "rose",
    metadata: "cyan",
    emerald: "emerald",
    amber: "amber",
    rose: "rose",
    violet: "cyan",
    slate: "white",
    cyan: "cyan",
    blue: "cyan",
    gold: "white",
    turquoise: "cyan",
  };

  const statusDiodeClasses: Record<DotColor, string> = {
    emerald: "status-diode status-diode-emerald",
    amber: "status-diode status-diode-amber",
    rose: "status-diode status-diode-rose",
    cyan: "status-diode status-diode-cyan",
    white: "status-diode status-diode-white",
    violet: "status-diode status-diode-cyan",
    slate: "status-diode status-diode-white",
    blue: "status-diode status-diode-cyan",
    gold: "status-diode status-diode-amber",
    turquoise: "status-diode status-diode-cyan",
  };

  const pingColorClasses: Record<DotColor, string> = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    cyan: "bg-cyan-400",
    white: "bg-white",
    violet: "bg-cyan-400",
    slate: "bg-white",
    blue: "bg-cyan-400",
    gold: "bg-amber-300",
    turquoise: "bg-cyan-400",
  };

  const activeDotColor = dotColor || defaultDotColorMap[variant] || "white";

  return (
    <span
      className={`inline-flex items-center font-medium rounded select-none leading-none tracking-tight ${
        mono || variant === "metadata" ? "font-mono tracking-wider tabular-nums uppercase text-[10px]" : "font-sans"
      } ${sizeClasses[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex items-center justify-center shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-60 ${pingColorClasses[activeDotColor]}`}
            />
          )}
          <span className={statusDiodeClasses[activeDotColor]} />
        </span>
      )}
      {children}
    </span>
  );
}
