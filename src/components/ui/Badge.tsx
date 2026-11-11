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
    xs: "px-2 py-0.5 text-[11px] gap-1",
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-1.5 font-semibold",
  };

  const variantStyles: Record<BadgeVariant, string> = {
    // Compliant / Approvals / Emerald (#10B981) — Functional Success Only
    verified:
      "bg-[#0C1A14] text-[#10B981] border border-[#10B981]/30",
    approved:
      "bg-[#0C1A14] text-[#10B981] border border-[#10B981]/30",
    success:
      "bg-[#0C1A14] text-[#10B981] border border-[#10B981]/30",
    emerald:
      "bg-[#0C1A14] text-[#10B981] border border-[#10B981]/30",

    // Critical Violations / Red (#EF4444) — Functional Critical Only
    critical:
      "bg-[#1A0E10] text-[#EF4444] border border-[#EF4444]/30",
    high:
      "bg-[#1A0E10] text-[#EF4444] border border-[#EF4444]/30",
    violation:
      "bg-[#1A0E10] text-[#EF4444] border border-[#EF4444]/30",
    rejected:
      "bg-[#1A0E10] text-[#EF4444] border border-[#EF4444]/30",
    rose:
      "bg-[#1A0E10] text-[#EF4444] border border-[#EF4444]/30",

    // Warnings / Review / Amber (#F59E0B) — Functional Warnings Only
    medium:
      "bg-[#1C1608] text-[#F59E0B] border border-[#F59E0B]/30",
    warning:
      "bg-[#1C1608] text-[#F59E0B] border border-[#F59E0B]/30",
    changes_requested:
      "bg-[#1C1608] text-[#F59E0B] border border-[#F59E0B]/30",
    amber:
      "bg-[#1C1608] text-[#F59E0B] border border-[#F59E0B]/30",
    pending:
      "bg-[#1C1608] text-[#F59E0B] border border-[#F59E0B]/30",

    // Technical Metadata: 12-13px Monospace for IDs, DOIs, hashes
    metadata:
      "bg-[#141414] text-[#858585] border border-[#303030] font-mono",

    // Monochromatic High-Contrast Swiss Neutral Tags (#FFFFFF / #B5B5B5)
    gold:
      "bg-[#191919] text-white border border-[#303030]",
    low: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    info: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    draft: "bg-[#141414] text-[#858585] border border-[#303030]",
    tag: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    neutral: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    slate: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",

    // Neutralized legacy color aliases (No blue/cyan/violet status accents)
    cyan: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    turquoise: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    blue: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
    violet: "bg-[#141414] text-[#B5B5B5] border border-[#303030]",
  };

  const defaultDotColorMap: Record<BadgeVariant, DotColor> = {
    critical: "rose",
    high: "rose",
    medium: "amber",
    low: "white",
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
    verified: "emerald",
    violation: "rose",
    metadata: "white",
    emerald: "emerald",
    amber: "amber",
    rose: "rose",
    violet: "white",
    slate: "white",
    cyan: "white",
    blue: "white",
    gold: "white",
    turquoise: "white",
  };

  const statusDiodeClasses: Record<DotColor, string> = {
    emerald: "status-diode status-diode-emerald",
    amber: "status-diode status-diode-amber",
    rose: "status-diode status-diode-rose",
    cyan: "status-diode status-diode-white",
    white: "status-diode status-diode-white",
    violet: "status-diode status-diode-white",
    slate: "status-diode status-diode-white",
    blue: "status-diode status-diode-white",
    gold: "status-diode status-diode-white",
    turquoise: "status-diode status-diode-white",
  };

  const pingColorClasses: Record<DotColor, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-red-500",
    cyan: "bg-white",
    white: "bg-white",
    violet: "bg-white",
    slate: "bg-white",
    blue: "bg-white",
    gold: "bg-white",
    turquoise: "bg-white",
  };

  const activeDotColor = dotColor || defaultDotColorMap[variant] || "white";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md select-none leading-none tracking-tight ${
        mono || variant === "metadata" ? "font-mono tracking-wider tabular-nums text-xs" : "font-sans"
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
