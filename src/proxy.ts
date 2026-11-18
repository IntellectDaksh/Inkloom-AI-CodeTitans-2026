import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/dashboard", "/submissions", "/approvals", "/knowledge-base", "/analytics", "/settings", "/profile", "/audit", "/team", "/brands", "/notifications", "/evaluations", "/onboarding", "/welcome", "/inbox", "/security", "/developers", "/integrations"];

// Refreshes the Supabase session cookie on every request and gates app pages.
// ponytail: optimistic page gate only; API routes authorise themselves via getMe().
// One canonical address: www and the old Vercel production URL redirect permanently to it.
const CANONICAL_HOST = "adsnitch.cv";
const REDIRECT_HOSTS = new Set(["www.adsnitch.cv", "inkloom-ai-tau.vercel.app"]);

export async function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  if (REDIRECT_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  // Share links: answer a real 404 for malformed, unknown, expired or revoked tokens. The page can't,
  // because once its streamed shell starts the status is already 200.
  const share = req.nextUrl.pathname.match(/^\/share\/([^/]+)\/?$/);
  if (share && !(await shareLinkLive(share[1]))) {
    return new NextResponse("This link has expired or doesn't exist.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
  }
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  // Only app pages need the session here. API routes check auth themselves, and public pages
  // (home, sign-in, legal, share, status) don't, so they skip the round trip to Supabase Auth.
  if (!isProtected) return NextResponse.next();
  // No session cookie at all: go straight to sign-in without asking Supabase.
  if (!req.cookies.getAll().some((c) => /^sb-.*-auth-token/.test(c.name))) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(path + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(path + req.nextUrl.search)}`;
    const r = NextResponse.redirect(url);
    res.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }
  // Users with a verified authenticator must finish the TOTP step before using the app.
  if (path !== "/security/verify") {
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal1" && aal.nextLevel === "aal2") {
      const url = req.nextUrl.clone();
      url.pathname = "/security/verify";
      url.search = `?next=${encodeURIComponent(path + req.nextUrl.search)}`;
      const r = NextResponse.redirect(url);
      res.cookies.getAll().forEach((c) => r.cookies.set(c));
      return r;
    }
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)"],
};

const shareSeen = new Map<string, { live: boolean; at: number }>();
async function shareLinkLive(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  // A shared link is often opened by several people at once: answer repeat opens from memory for 30s.
  const seen = shareSeen.get(token);
  if (seen && Date.now() - seen.at < 30_000) return seen.live;
  const live = await lookupShare(token);
  shareSeen.set(token, { live, at: Date.now() });
  if (shareSeen.size > 1000) shareSeen.delete(shareSeen.keys().next().value as string);
  return live;
}

async function lookupShare(token: string): Promise<boolean> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !base) return true; // can't check here; the page itself still refuses bad tokens
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  try {
    const r = await fetch(`${base}/rest/v1/share_links?token_hash=eq.${hash}&select=expires_at,revoked_at&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!r.ok) return true;
    const [row] = (await r.json()) as { expires_at: string; revoked_at: string | null }[];
    return !!row && !row.revoked_at && new Date(row.expires_at).getTime() > Date.now();
  } catch {
    return true;
  }
}
