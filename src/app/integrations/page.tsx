import { redirect } from "next/navigation";

// Lives inside Settings now; old links keep working.
export default function Page() {
  redirect("/settings?tab=integrations");
}
