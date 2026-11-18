import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <p className="text-sm text-text-muted">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">This page doesn&rsquo;t exist</h1>
        <p className="mt-2 text-sm text-text-secondary">The link may be old, or the item was deleted. Still stuck? Email <a className="underline underline-offset-4" href="mailto:hello@adsnitch.cv">hello@adsnitch.cv</a>.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard" className="inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-medium text-canvas">Dashboard</Link>
          <Link href="/" className="inline-flex h-10 items-center rounded-lg border border-border-default px-4 text-sm font-medium text-text-primary">Home</Link>
        </div>
      </div>
    </main>
  );
}
