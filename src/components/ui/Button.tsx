import React from "react";

export type ButtonVariant =
  | "gold"
  | "turquoise"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "primary"
  | "destructive"
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
  variant = "gold",
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
    "relative inline-flex items-center justify-center font-medium transition-all duration-100 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00F2FE] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080C16]";

  const sizeStyles = {
    xs: "h-6 px-2 text-[11px] gap-1 rounded",
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-xs font-semibold gap-2 rounded-md",
    lg: "h-10 px-4 text-sm font-semibold gap-2.5 rounded-lg",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  };

  const variantStyles: Record<ButtonVariant, string> = {
    gold: "tactile-button-gold",
    primary: "tactile-button-gold",
    turquoise: "tactile-button-turquoise",
    secondary: "tactile-button-secondary",
    danger: "tactile-button-danger",
    destructive: "tactile-button-danger",
    outline:
      "bg-transparent hover:bg-[#152038] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#1E2E50] hover:border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.3)] active:translate-y-[1px]",
    ghost:
      "bg-transparent hover:bg-[#152038] text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent active:translate-y-[1px]",
    success:
      "bg-gradient-to-b from-emerald-500 to-emerald-700 text-slate-950 font-semibold border border-emerald-400 border-t-emerald-300 border-b-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#064e3b,0_3px_8px_rgba(16,185,129,0.3)] active:translate-y-[1.5px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0.5px_0_#064e3b]",
    approve:
      "bg-gradient-to-b from-emerald-500 to-emerald-700 text-slate-950 font-semibold border border-emerald-400 border-t-emerald-300 border-b-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#064e3b,0_3px_8px_rgba(16,185,129,0.3)] active:translate-y-[1.5px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0.5px_0_#064e3b]",
    subtle:
      "bg-[#0D1527] hover:bg-[#152038] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E2E50] hover:border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] active:translate-y-[1px]",
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
        <kbd className="ml-1 text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/15 text-current opacity-85 font-mono tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
