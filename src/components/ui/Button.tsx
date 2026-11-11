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
    "relative inline-flex items-center justify-center font-medium transition-colors duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] shrink-0";

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
      "bg-[#FFFFFF] hover:bg-neutral-200 text-[#0A0A0A] font-semibold border border-transparent shadow-sm active:translate-y-px",
    gold:
      "bg-[#FFFFFF] hover:bg-neutral-200 text-[#0A0A0A] font-semibold border border-transparent shadow-sm active:translate-y-px",
    accent:
      "bg-[#FFFFFF] hover:bg-neutral-200 text-[#0A0A0A] font-semibold border border-transparent shadow-sm active:translate-y-px",

    // Secondary: #191919 background, 1px border #303030, white text, hover #222222
    secondary:
      "bg-[#191919] hover:bg-[#222222] text-white font-medium border border-[#303030] active:translate-y-px",
    subtle:
      "bg-[#141414] hover:bg-[#191919] text-[#B5B5B5] hover:text-white border border-[#303030] active:translate-y-px",

    // Outlined Minimalist
    outline:
      "bg-transparent hover:bg-[#191919] text-white border border-[#303030] hover:border-[#404040] active:translate-y-px",

    // Ghost
    ghost:
      "bg-transparent hover:bg-[#191919] text-[#858585] hover:text-white border border-transparent active:translate-y-px",

    // Functional Red / Critical violations only
    danger:
      "bg-[#1C1214] hover:bg-[#2A1619] text-[#EF4444] border border-[#7F1D1D] active:translate-y-px",
    destructive:
      "bg-[#1C1214] hover:bg-[#2A1619] text-[#EF4444] border border-[#7F1D1D] active:translate-y-px",

    // Functional Green / Success & Approvals only
    success:
      "bg-[#0C1A14] hover:bg-[#0F241C] text-[#10B981] border border-[#065F46] active:translate-y-px",
    approve:
      "bg-[#0C1A14] hover:bg-[#0F241C] text-[#10B981] border border-[#065F46] active:translate-y-px",

    // Neutralized legacy turquoise token
    turquoise:
      "bg-[#FFFFFF] hover:bg-neutral-200 text-[#0A0A0A] font-semibold border border-transparent shadow-sm active:translate-y-px",
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
        <kbd className="ml-1 text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-current opacity-80 font-mono tracking-tight">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
