"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/ops/report";

// Last-resort boundary when the root layout itself fails; must render its own <html>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportClientError(error), [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#f6f9fb", color: "#0b1620" }}>
        <div style={{ maxWidth: 420, padding: 16, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>AdSnitch hit an error</h1>
          <p style={{ color: "#536474", fontSize: 14 }}>It has been reported automatically.{error.digest ? ` Reference: ${error.digest}` : ""}</p>
          <button type="button" onClick={reset} style={{ height: 40, padding: "0 16px", borderRadius: 8, border: 0, background: "#0b1620", color: "#fff", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
