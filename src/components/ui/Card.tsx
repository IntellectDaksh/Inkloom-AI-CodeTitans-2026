import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "elevated"
    | "interactive"
    | "glass"
    | "highlight"
    | "gold"
    | "turquoise"
    | "well";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const variantStyles: Record<string, string> = {
    default: "tactile-card",
    elevated: "tactile-card-elevated",
    interactive: "tactile-card-interactive",
    glass: "tactile-card",
    highlight: "tactile-card border-white/20",
    gold: "tactile-card border-[#333333]",
    turquoise: "tactile-card border-[#06B6D4]/30",
    well: "milled-well p-5",
  };

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-120 ${variantStyles[variant] || "tactile-card"} ${className}`}
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
        divided ? "border-b border-[#222222] bg-[#0E0E0E]/50" : ""
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
      className={`text-sm sm:text-base font-bold text-white tracking-tight ${className}`}
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
    <p className={`text-xs text-[#A0A0A0] mt-1 leading-relaxed ${className}`}>
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
  divided = true,
}: {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <div
      className={`px-5 py-3.5 bg-[#080808]/70 flex items-center ${
        divided ? "border-t border-[#222222]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
