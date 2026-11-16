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

  const path = req.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(path + req.nextUrl.search)}`;
    const r = NextResponse.redirect(url);
    res.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }
  // Users with a verified authenticator must finish the TOTP step before using the app.
  if (user && path !== "/security/verify" && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
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
