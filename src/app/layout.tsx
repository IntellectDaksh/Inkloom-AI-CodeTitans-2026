import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inkloom AI — Keep Your Brand On Brand",
  description:
    "An intelligent brand-governance platform that reviews content, checks claims, and ensures every piece of communication stays accurate, compliant, and on brand.",
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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090A0F] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
