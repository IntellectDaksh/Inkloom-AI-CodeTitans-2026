import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "destructive"
    | "success"
    | "approve"
    | "subtle";
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
    "relative inline-flex items-center justify-center font-medium transition-all duration-120 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#090A10]";

  const sizeStyles = {
    xs: "h-6 px-2 text-[11px] gap-1 rounded",
    sm: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
    md: "h-9 px-3.5 text-xs font-medium gap-2 rounded-md",
    lg: "h-10 px-4 text-sm font-medium gap-2.5 rounded-lg",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  };

  const variantStyles = {
    primary:
      "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.985] active:bg-violet-600",
    secondary:
      "bg-[#141722] hover:bg-[#1A1E2C] text-[#F4F6F9] border border-[#1C202F] hover:border-[#2B3248] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-[0.985]",
    outline:
      "bg-transparent hover:bg-[#141722] text-[#94A3B8] hover:text-[#F4F6F9] border border-[#1C202F] hover:border-[#2B3248] active:scale-[0.985]",
    ghost:
      "bg-transparent hover:bg-[#141722] text-[#94A3B8] hover:text-[#F4F6F9] border border-transparent active:scale-[0.985]",
    danger:
      "bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 hover:border-rose-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] active:scale-[0.985]",
    destructive:
      "bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 border border-rose-500/30 shadow-xs active:scale-[0.985]",
    success:
      "bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] active:scale-[0.985]",
    approve:
      "bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/35 text-emerald-300 border border-emerald-500/35 shadow-xs active:scale-[0.985]",
    subtle:
      "bg-[#0F1117] hover:bg-[#141722] text-[#94A3B8] hover:text-[#F4F6F9] border border-[#1C202F] hover:border-[#2B3248] active:scale-[0.985]",
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
            className="opacity-20"
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
        <kbd className="ml-1 text-[9px] px-1 py-0.5 rounded bg-black/30 border border-white/10 text-white/70 font-mono tracking-tight">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
