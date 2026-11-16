"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageSkeleton } from "@/components/layout/Motion";

// Shown while a route streams. App pages get the real app shell (sidebar + header) around the
// skeleton, so nothing jumps when the page arrives; public pages show nothing instead of a wrong shape.
const PUBLIC = ["/", "/auth", "/terms", "/privacy", "/welcome"];

export function AppLoading() {
  const path = usePathname() || "/";
  if (PUBLIC.some((p) => (p === "/" ? path === "/" : path === p || path.startsWith(p + "/")))) {
    return <div className="min-h-dvh bg-canvas" aria-busy="true" />;
  }
  return (
    <AppLayout>
      <div aria-busy="true" aria-label="Loading">
        <PageSkeleton />
      </div>
    </AppLayout>
  );
}
