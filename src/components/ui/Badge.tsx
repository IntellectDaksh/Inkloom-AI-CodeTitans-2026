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
      "bg-status-success/10 text-status-success border border-status-success/30",
    approved:
      "bg-status-success/10 text-status-success border border-status-success/30",
    success:
      "bg-status-success/10 text-status-success border border-status-success/30",
    emerald:
      "bg-status-success/10 text-status-success border border-status-success/30",

    // Critical Violations / Red (#EF4444) — Functional Critical Only
    critical:
      "bg-status-critical/10 text-status-critical border border-status-critical/30",
    high:
      "bg-status-critical/10 text-status-critical border border-status-critical/30",
    violation:
      "bg-status-critical/10 text-status-critical border border-status-critical/30",
    rejected:
      "bg-status-critical/10 text-status-critical border border-status-critical/30",
    rose:
      "bg-status-critical/10 text-status-critical border border-status-critical/30",

    // Warnings / Review / Amber (#F59E0B) — Functional Warnings Only
    medium:
      "bg-status-warning/10 text-status-warning border border-status-warning/30",
    warning:
      "bg-status-warning/10 text-status-warning border border-status-warning/30",
    changes_requested:
      "bg-status-warning/10 text-status-warning border border-status-warning/30",
    amber:
      "bg-status-warning/10 text-status-warning border border-status-warning/30",
    pending:
      "bg-status-warning/10 text-status-warning border border-status-warning/30",

    // Technical Metadata: 12-13px Monospace for IDs, DOIs, hashes
    metadata:
      "bg-panel text-text-muted border border-border-default font-mono",

    // Monochromatic High-Contrast Swiss Neutral Tags (#FFFFFF / #B5B5B5)
    gold:
      "bg-panel-hover text-text-primary border border-border-default",
    low: "bg-panel text-text-secondary border border-border-default",
    info: "bg-panel text-text-secondary border border-border-default",
    draft: "bg-panel text-text-muted border border-border-default",
    tag: "bg-panel text-text-secondary border border-border-default",
    neutral: "bg-panel text-text-secondary border border-border-default",
    slate: "bg-panel text-text-secondary border border-border-default",

    // Neutralized legacy color aliases (No blue/cyan/violet status accents)
    cyan: "bg-panel text-text-secondary border border-border-default",
    turquoise: "bg-panel text-text-secondary border border-border-default",
    blue: "bg-panel text-text-secondary border border-border-default",
    violet: "bg-panel text-text-secondary border border-border-default",
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
    cyan: "bg-ink",
    white: "bg-ink",
    violet: "bg-ink",
    slate: "bg-ink",
    blue: "bg-ink",
    gold: "bg-ink",
    turquoise: "bg-ink",
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
