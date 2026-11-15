import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import type { KbKind } from "@/lib/db/store";
import { withStore } from "@/lib/db/withStore";
import { getMe } from "@/lib/auth/server";

const ORG = SEED_IDS.ORGANISATION_UIDEAS;
const MAX_ITEMS = 2000;
const MAX_BYTES = 2_000_000;

/** Signed-in user's id for audit rows; undefined when auth isn't available. */
export async function userId(): Promise<string | undefined> {
  try {
    return (await getMe())?.id;
  } catch {
    return undefined;
  }
}

export function brandFrom(ref: string | null | undefined) {
  return db.resolveBrand(ORG, ref);
}

const bad = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

/**
 * GET ?brand=<id|name> -> { items, saved }
 * PUT { brand, items } -> replaces that brand's list; audited as added/changed/removed.
 */
export function kbRoute(kind: KbKind, keyOf: (d: Record<string, unknown>) => string) {
  const GET = withStore(async (req: NextRequest) => {
    const brand = brandFrom(req.nextUrl.searchParams.get("brand"));
    if (!brand) return bad("Unknown workspace.", 404);
    return NextResponse.json({ success: true, brandId: brand.id, ...db.listKbItems(ORG, brand.id, kind) });
  });
  const PUT = withStore(async (req: NextRequest) => {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) return bad("That list is too large to save in one go.", 413);
    let body: { brand?: string; items?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return bad("Invalid JSON.");
    }
    const brand = brandFrom(body.brand);
    if (!brand) return bad("Unknown workspace.", 404);
    const items = body.items;
    if (!Array.isArray(items) || items.length > MAX_ITEMS || items.some((i) => !i || typeof i !== "object" || Array.isArray(i)))
      return bad("items must be a list of records.");
    const res = db.replaceKbItems(ORG, brand.id, kind, items as Record<string, unknown>[], keyOf, await userId());
    return NextResponse.json({ success: true, ...res });
  });
  return { GET, PUT };
}
