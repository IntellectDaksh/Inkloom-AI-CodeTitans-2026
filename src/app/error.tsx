"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/ops/report";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportClientError(error), [error]);
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Something broke on this page</h1>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          It has been reported automatically. Your saved work is safe. Try again, or go back to your dashboard.
        </p>
        {error.digest && <p className="mt-2 text-xs text-text-muted">Reference: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90">Try again</button>
          <a href="/dashboard" className="inline-flex h-10 items-center rounded-lg border border-border-default px-4 text-sm font-medium text-text-primary">Dashboard</a>
        </div>
      </div>
    </main>
  );
}
