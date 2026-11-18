import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

// URL params are read inside Suspense so the page shell can render instantly.
async function Form({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <AuthForm mode="register" next={next} error={error} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#8bbadb]" aria-busy="true" />}>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}
