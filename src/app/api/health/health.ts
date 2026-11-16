import { supabaseAdmin } from "@/lib/auth/server";

export interface Health {
  status: "ok" | "degraded";
  checks: { database: boolean; gemini: boolean };
  version: string;
  time: string;
}

/** Public liveness. Booleans only: never echoes keys, URLs or error text. */
export async function getHealth(): Promise<Health> {
  let database = false;
  try {
    const { error } = await supabaseAdmin().from("organizations").select("id").limit(1);
    database = !error;
  } catch {
    database = false;
  }
  const gemini = !!process.env.GEMINI_API_KEY;
  return {
    status: database ? "ok" : "degraded",
    checks: { database, gemini },
    version: (process.env.VERCEL_GIT_COMMIT_SHA ?? "dev").slice(0, 7),
    time: new Date().toISOString(),
  };
}

