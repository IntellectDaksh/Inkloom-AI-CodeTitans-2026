import { PageSkeleton } from "@/components/layout/Motion";

// Shown by Next.js while a route's server work is still streaming.
export default function Loading() {
  return (
    <div style={{ padding: "40px clamp(16px, 4vw, 40px)" }}>
      <PageSkeleton />
    </div>
  );
}
