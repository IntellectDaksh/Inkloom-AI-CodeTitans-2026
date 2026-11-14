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
    | "well"
    | "open"
    | "borderless";
  className?: string;
  bordered?: boolean;
}

export function Card({
  children,
  variant = "default",
  bordered = true,
  className = "",
  ...props
}: CardProps) {
  // Primary surface #141414, Secondary surface #191919, Borders #303030
  const variantStyles: Record<string, string> = {
    default: "glass",
    elevated: "glass-strong",
    interactive:
      "glass hover:bg-panel-hover hover:border-border-strong transition-colors cursor-pointer",
    glass: "glass",
    highlight: "glass border-border-strong",
    gold: "glass",
    turquoise: "glass",
    well: "glass-inset p-6",
    open: "bg-panel border-0",
    borderless: "bg-transparent border-0",
  };

  const borderClass = !bordered ? "border-0 shadow-none" : "";

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-150 ${variantStyles[variant] || variantStyles.default} ${borderClass} ${className}`}
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
      className={`px-6 py-5 ${
        divided ? "border-b border-border-default" : ""
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
      className={`font-display text-lg sm:text-xl font-semibold text-text-primary tracking-tight ${className}`}
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
    <p className={`text-sm leading-normal text-text-muted mt-1.5 ${className}`}>
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
  return <div className={`p-6 ${className}`}>{children}</div>;
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
      className={`px-6 py-4 flex items-center ${
        divided ? "border-t border-border-default" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
