import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";

/** Getting-started progress counted over the org's own brands; sample brands never tick a step. */
export const GET = withStore(async () =>
  NextResponse.json({ success: true, progress: db.ownBrandProgress(SEED_IDS.ORGANISATION_UIDEAS) })
);
