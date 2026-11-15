/** Only same-site relative paths, so ?next= can't bounce users to another origin. */
export function safeNext(n: string | null | undefined, fallback = "/dashboard"): string {
  return n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : fallback;
}
