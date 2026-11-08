import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "interactive" | "glass" | "highlight";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-[#0F1117] border border-[#1C202F]",
    elevated: "bg-[#141722] border border-[#1C202F]",
    interactive:
      "bg-[#0F1117] border border-[#1C202F] hover:border-[#2B3248] hover:bg-[#12151F] transition-colors cursor-pointer",
    glass: "bg-[#0F1117] border border-[#1C202F]",
    highlight:
      "bg-[#0F1117] border border-violet-500/40 shadow-[inset_0_1px_0_rgba(139,92,246,0.15)]",
  };

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  divided = true,
}: {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${
        divided ? "border-b border-[#1C202F]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-sm sm:text-base font-semibold text-[#F4F6F9] tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-[#94A3B8] mt-0.5 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-5 py-3 border-t border-[#1C202F] bg-[#0C0E14] text-xs text-[#94A3B8] flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}
