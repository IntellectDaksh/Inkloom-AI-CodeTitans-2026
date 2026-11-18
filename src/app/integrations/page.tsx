import { redirect } from "next/navigation";

// Removed from the product UI; old links land on Settings.
export default function Page() {
  redirect("/settings");
}
