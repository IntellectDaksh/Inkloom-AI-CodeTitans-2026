import { Suspense } from "react";
import { AppLoading } from "@/components/layout/AppLoading";

// The shell reads the current path, which must sit inside Suspense when routes are prerendered.
export default function Loading() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy="true" />}>
      <AppLoading />
    </Suspense>
  );
}
