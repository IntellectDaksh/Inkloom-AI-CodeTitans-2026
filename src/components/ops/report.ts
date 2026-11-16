/** Sends a browser crash to /api/errors once per error object. */
const sent = new WeakSet<object>();
export function reportClientError(error: Error & { digest?: string }) {
  if (sent.has(error)) return;
  sent.add(error);
  try {
    navigator.sendBeacon?.(
      "/api/errors",
      new Blob([JSON.stringify({ message: error.message, stack: error.stack, digest: error.digest, route: location.pathname })], { type: "application/json" }),
    );
  } catch {
    // nothing else to do
  }
}
