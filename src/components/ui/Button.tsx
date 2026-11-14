import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive"
  | "gold"
  | "accent"
  | "turquoise"
  | "success"
  | "approve"
  | "subtle";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  shortcut?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  shortcut,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-freeze focus-visible:ring-offset-2 focus-visible:ring-offset-canvas shrink-0 touch-manipulation";

  // Height 44px for primary interactive buttons (.btn-primary and .btn-secondary), readable 14–15px font
  const sizeStyles = {
    xs: "h-7 px-2.5 text-[11px] gap-1 rounded", // compact utility trigger
    sm: "h-9 px-4 text-xs font-medium gap-1.5 rounded-md", // compact form actions
    md: "h-11 px-6 text-sm font-semibold gap-2 rounded-lg", // 44px height, px-6 (Strict .btn-primary / .btn-secondary specification)
    lg: "h-11 px-6 text-sm font-semibold gap-2.5 rounded-lg", // 44px, 14px font
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    // Primary: Solid white background (#FFFFFF), black text (#0A0A0A), font-semibold, hover neutral-200
    primary:
      "bg-ink hover:bg-navy-soft text-ghost font-semibold border border-transparent shadow-sm active:translate-y-px",
    gold:
      "bg-ink hover:bg-navy-soft text-ghost font-semibold border border-transparent shadow-sm active:translate-y-px",
    accent:
      "bg-ink hover:bg-navy-soft text-ghost font-semibold border border-transparent shadow-sm active:translate-y-px",

    // Secondary: #191919 background, 1px border #303030, white text, hover #222222
    secondary:
      "bg-panel-hover hover:bg-panel-elevated text-text-primary font-medium border border-border-default active:translate-y-px",
    subtle:
      "bg-panel hover:bg-panel-hover text-text-secondary hover:text-text-primary border border-border-default active:translate-y-px",

    // Outlined Minimalist
    outline:
      "bg-transparent hover:bg-panel-hover text-text-primary border border-border-default hover:border-border-strong active:translate-y-px",

    // Ghost
    ghost:
      "bg-transparent hover:bg-panel-hover text-text-muted hover:text-text-primary border border-transparent active:translate-y-px",

    // Functional Red / Critical violations only
    danger:
      "bg-status-critical/10 hover:bg-status-critical/15 text-status-critical border border-status-critical/30 active:translate-y-px",
    destructive:
      "bg-status-critical/10 hover:bg-status-critical/15 text-status-critical border border-status-critical/30 active:translate-y-px",

    // Functional Green / Success & Approvals only
    success:
      "bg-status-success/10 hover:bg-status-success/15 text-status-success border border-status-success/30 active:translate-y-px",
    approve:
      "bg-status-success/10 hover:bg-status-success/15 text-status-success border border-status-success/30 active:translate-y-px",

    // Neutralized legacy turquoise token
    turquoise:
      "bg-ink hover:bg-navy-soft text-ghost font-semibold border border-transparent shadow-sm active:translate-y-px",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin ${iconSizes[size]} shrink-0 text-current`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}

      {children && <span className="truncate">{children}</span>}

      {iconRight && !loading && (
        <span className="inline-flex shrink-0">{iconRight}</span>
      )}

      {shortcut && (
        <kbd className="ml-1 text-xs px-1.5 py-0.5 rounded bg-ink/10 border border-white/20 text-current opacity-80 font-mono tracking-tight">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
