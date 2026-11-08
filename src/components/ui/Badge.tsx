import React from "react";

type BadgeVariant =
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
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  const variantStyles: Record<BadgeVariant, string> = {
    critical: "bg-red-500/15 text-red-400 border border-red-500/30",
    high: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    low: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    info: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
    approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    pending: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    changes_requested: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    rejected: "bg-red-500/15 text-red-400 border border-red-500/30",
    draft: "bg-slate-700/30 text-slate-400 border border-slate-600/30",
    tag: "bg-[#1E2130] text-slate-300 border border-[#2D334D]",
    neutral: "bg-slate-800/40 text-slate-300 border border-slate-700/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
