import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { userId } from "@/lib/files/kbRoute";

const ORG = SEED_IDS.ORGANISATION_UIDEAS;

async function GET_handler() {
  // Own brands first (newest first), built-in samples after, each flagged so every list can label them.
  const list = db
    .listWorkspaces(ORG)
    .map((w) => ({ ...w, sample: !w.custom }))
    .sort((a, b) => Number(a.sample) - Number(b.sample) || (b.sample ? 0 : (b.createdAt ?? "").localeCompare(a.createdAt ?? "")));
  return NextResponse.json({ success: true, workspaces: list });
}

async function POST_handler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  const res = db.createWorkspace(ORG, body, await userId());
  if (!res.ok) return NextResponse.json({ success: false, error: res.error }, { status: 400 });
  return NextResponse.json({ success: true, workspace: res.workspace }, { status: 201 });
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler);
