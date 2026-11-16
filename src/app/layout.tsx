import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RouteProgress } from "@/components/layout/Motion";
import { PrefsApplier } from "@/components/settings/PrefsApplier";
import { ApiCache } from "@/components/ops/ApiCache";

export const metadata: Metadata = {
  title: "AdSnitch — Pre-Publication Marketing Claim & Brand Governance Firewall",
  description:
    "An intelligent brand-governance and claim verification firewall that intercepts marketing copy, checks claims against clinical and legal proof, and eliminates statutory liabilities before publication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <PrefsApplier />
        <ApiCache />
        {children}
      </body>
    </html>
  );
}
