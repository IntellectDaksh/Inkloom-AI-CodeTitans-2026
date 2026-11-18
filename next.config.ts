import type { NextConfig } from "next";

const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";

// Content Security Policy: only our own origin, Supabase (auth, storage, realtime), Google Fonts and
// Unsplash images. Inline scripts/styles stay allowed because Next.js and Tailwind emit them.
// ponytail: 'unsafe-inline' for scripts; move to nonces via proxy.ts if a stricter policy is needed.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://images.unsplash.com ${SUPABASE}`,
  `connect-src 'self' ${SUPABASE} ${SUPABASE.replace("https://", "wss://")}`,
  "media-src 'self' blob:",
  "frame-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com " + SUPABASE,
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  // Browsers only ever use HTTPS for this site and its subdomains for 2 years.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Only ship the icons each page actually uses from lucide-react.
  experimental: { optimizePackageImports: ["lucide-react"] },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Logos, landing art and icons never change in place: let browsers and the CDN keep them for a year.
      { source: "/:file(.*\.(?:svg|png|jpg|jpeg|webp|ico|woff2))", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Status checks can be shared for a few seconds instead of hitting the database on every poll.
      { source: "/api/health", headers: [{ key: "Cache-Control", value: "public, s-maxage=15, stale-while-revalidate=30" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
