import { NextResponse } from "next/server";
import { getMe, supabaseAdmin, supabaseServer } from "@/lib/auth/server";

// Deletes the signed-in user's account (profile cascades) and their avatar files.
export async function DELETE() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const admin = supabaseAdmin();
  const { data: files } = await admin.storage.from("avatars").list(me.id);
  if (files?.length) await admin.storage.from("avatars").remove(files.map((f) => `${me.id}/${f.name}`));
  const { error } = await admin.auth.admin.deleteUser(me.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  await (await supabaseServer()).auth.signOut().catch(() => {});
  return NextResponse.json({ success: true });
}
