import type { Instrumentation } from "next";

export function register() {}

// Every uncaught error in a route handler, server component or proxy is recorded in public.error_events.
export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportError } = await import("@/lib/ops/errors");
  const e = err as Error & { digest?: string };
  await reportError({
    source: "server",
    message: e?.message || String(err),
    stack: e?.stack,
    digest: e?.digest,
    route: `${request.method} ${request.path}`,
    userAgent: (request.headers["user-agent"] as string) ?? null,
  });
};
