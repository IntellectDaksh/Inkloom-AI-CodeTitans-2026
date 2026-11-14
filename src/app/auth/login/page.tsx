import Link from "next/link";
import { PersonaLogin } from "../PersonaLogin";

export default function LoginPage() {
  return (
    <PersonaLogin
      title="Sign in"
      intro={
        <>
          This demo has no passwords. Each person below is a seeded user with a different role, so you can see the app as a writer, a reviewer or an admin. Switch any time from Team. New here? <Link href="/auth/register" className="text-text-primary underline underline-offset-4">Set up a workspace</Link>.
        </>
      }
    />
  );
}
