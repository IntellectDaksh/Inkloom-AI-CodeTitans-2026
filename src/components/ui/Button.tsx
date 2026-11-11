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
    "relative inline-flex items-center justify-center font-medium transition-all duration-100 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#080808]";

  const sizeStyles = {
    xs: "h-6 px-2 text-[11px] gap-1 rounded",
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-xs font-semibold gap-2 rounded-md",
    lg: "h-10 px-4 text-sm font-semibold gap-2.5 rounded-md",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    // High-Contrast Pure White Primary
    primary:
      "bg-white hover:bg-[#F0F0F0] text-[#080808] border border-white border-b-[#D4D4D4] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none",
    gold:
      "bg-white hover:bg-[#F0F0F0] text-[#080808] border border-white border-b-[#D4D4D4] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none",
    accent:
      "bg-white hover:bg-[#F0F0F0] text-[#080808] border border-white border-b-[#D4D4D4] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-px active:shadow-none",

    // Precision Machined Secondary
    secondary:
      "bg-[#141414] hover:bg-[#1A1A1A] text-[#F8F8F8] border border-[#282828] border-t-white/15 border-b-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.6)] active:translate-y-px active:shadow-none",
    subtle:
      "bg-[#111111] hover:bg-[#181818] text-[#A0A0A0] hover:text-[#FFFFFF] border border-[#222222] active:translate-y-px",

    // Outlined Minimalist
    outline:
      "bg-transparent hover:bg-[#141414] text-[#EFEFEF] hover:text-white border border-[#282828] hover:border-[#383838] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] active:translate-y-px",

    // Ghost
    ghost:
      "bg-transparent hover:bg-[#141414] text-[#A0A0A0] hover:text-white border border-transparent active:translate-y-px",

    // Functional Status Variants
    danger:
      "bg-[#1C1214] hover:bg-[#2A1719] text-[#FCA5A5] border border-[#7F1D1D] border-t-[#B91C1C] border-b-[#450A0A] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.6)] active:translate-y-px",
    destructive:
      "bg-[#1C1214] hover:bg-[#2A1719] text-[#FCA5A5] border border-[#7F1D1D] border-t-[#B91C1C] border-b-[#450A0A] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.6)] active:translate-y-px",
    success:
      "bg-[#0A1A14] hover:bg-[#0F241C] text-[#6EE7B7] border border-[#065F46] border-t-[#059669] border-b-[#022C22] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:translate-y-px",
    approve:
      "bg-[#0A1A14] hover:bg-[#0F241C] text-[#6EE7B7] border border-[#065F46] border-t-[#059669] border-b-[#022C22] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:translate-y-px",
    turquoise:
      "bg-[#06B6D4] hover:bg-[#22D3EE] text-[#080808] font-semibold border border-[#06B6D4] shadow-[0_1px_2px_rgba(0,0,0,0.4)] active:translate-y-px",
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
        <kbd className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-current opacity-85 font-mono tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
