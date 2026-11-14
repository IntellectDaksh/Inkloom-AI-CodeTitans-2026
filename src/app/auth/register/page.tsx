import Link from "next/link";
import { PersonaLogin } from "../PersonaLogin";

export default function RegisterPage() {
  return (
    <PersonaLogin
      title="Set up your workspace"
      next="/onboarding"
      intro={
        <>
          Sign-up is not live yet, so you start as one of the demo people and then name your brand in the next step. Already been here? <Link href="/auth/login" className="text-text-primary underline underline-offset-4">Sign in</Link>.
        </>
      }
    />
  );
}
