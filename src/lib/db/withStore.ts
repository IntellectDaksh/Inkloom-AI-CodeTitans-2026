import { NextResponse } from "next/server";
import { flushToRemote, syncFromRemote } from "./store";
import { supabaseServer } from "@/lib/auth/server";

type Handler<A extends unknown[]> = (...args: A) => Promise<Response> | Response;

/**
 * Wraps an API route so it reads the latest state from Supabase before it runs
 * and saves any changes after. Without Supabase configured it is a no-op.
 */
export function withStore<A extends unknown[]>(handler: Handler<A>, opts: { public?: boolean } = {}): Handler<A> {
  return async (...args: A) => {
    // Every store route is signed-in only unless explicitly public (/api/check, /api/extract).
    if (!opts.public) {
      const { data: { user } } = await (await supabaseServer()).auth.getUser().catch(() => ({ data: { user: null } }));
      if (!user) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
    }
    try {
      await syncFromRemote();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "The database is unreachable right now. Try again in a moment." , detail: (err as Error).message },
        { status: 503 },
      );
    }
    const res = await handler(...args);
    try {
      await flushToRemote();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Your change could not be saved. Try again.", detail: (err as Error).message },
        { status: 503 },
      );
    }
    return res;
  };
}
