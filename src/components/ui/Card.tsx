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
    default: "bg-[#141414] border border-[#303030] shadow-sm",
    elevated: "bg-[#191919] border border-[#303030] shadow-md",
    interactive:
      "bg-[#141414] hover:bg-[#191919] border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer",
    glass: "bg-[#141414]/95 backdrop-blur-sm border border-[#303030]",
    highlight: "bg-[#141414] border border-[#404040]",
    gold: "bg-[#141414] border border-[#303030]",
    turquoise: "bg-[#141414] border border-[#303030]",
    well: "bg-[#0A0A0A] border border-[#303030] p-6",
    open: "bg-[#141414] border-0",
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
        divided ? "border-b border-[#303030]" : ""
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
      className={`text-lg sm:text-xl font-medium text-white tracking-tight ${className}`}
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
    <p className={`text-sm leading-normal text-[#858585] mt-1.5 ${className}`}>
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
        divided ? "border-t border-[#303030]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
