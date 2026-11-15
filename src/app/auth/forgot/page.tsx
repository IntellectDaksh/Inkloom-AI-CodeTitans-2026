import { AuthForm } from "../AuthForm";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <AuthForm mode="forgot" next={next} error={error} />;
}
