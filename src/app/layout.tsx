import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RouteProgress } from "@/components/layout/Motion";
import { PrefsApplier } from "@/components/settings/PrefsApplier";

export const metadata: Metadata = {
  title: "AdSnitch — Pre-Publication Marketing Claim & Brand Governance Firewall",
  description:
    "An intelligent brand-governance and claim verification firewall that intercepts marketing copy, checks claims against clinical and legal proof, and eliminates statutory liabilities before publication.",
  icons: {
    icon: "/favicon.ico",
  },
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
        {children}
      </body>
    </html>
  );
}
