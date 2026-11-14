import { NextRequest, NextResponse } from "next/server";
import { db, SEED_IDS } from "@/lib/db";
import { toClaimRecords, validateClaimRecord } from "@/lib/ai/extract";

const MAX_ROWS = 500;

/**
 * Body: a JSON array of claims, `{ claims: [...] }`, `{ csv: "..." }`, or raw text/csv.
 * Imported claims land as under_review with evidence marked unverified; a human must approve them.
 */
export async function POST(req: NextRequest) {
  const qs = req.nextUrl.searchParams;
  const orgId = qs.get("orgId") || SEED_IDS.ORGANISATION_UIDEAS;
  const defaultBrand = qs.get("brandId") || SEED_IDS.BRAND_APEX;
  const userId = qs.get("userId") || SEED_IDS.USER_DAKSH;

  let records: Record<string, unknown>[];
  try {
    const raw = await req.text();
    let input: unknown = raw;
    if ((req.headers.get("content-type") || "").includes("json") || /^\s*[[{]/.test(raw)) {
      const parsed = JSON.parse(raw);
      input = Array.isArray(parsed) ? parsed : parsed?.claims ?? parsed?.csv;
    }
    records = toClaimRecords(input);
  } catch (err) {
    const msg = err instanceof SyntaxError ? "The JSON could not be read." : (err as Error).message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (records.length === 0) return NextResponse.json({ error: "No claims found to import." }, { status: 400 });
  if (records.length > MAX_ROWS) {
    return NextResponse.json({ error: `Import at most ${MAX_ROWS} claims at a time.` }, { status: 400 });
  }

  const brands = db.getBrands(orgId);
  const imported: unknown[] = [];
  const rejected: { row: number; reason: string }[] = [];

  records.forEach((rec, i) => {
    const row = i + 1;
    const v = validateClaimRecord(rec);
    if (!v.ok) return rejected.push({ row, reason: v.reason });
    const c = v.row;
    const wanted = (c.brand || defaultBrand).toLowerCase();
    const brand =
      brands.find(b => [b.id, b.slug, b.name].some(x => x?.toLowerCase() === wanted)) ||
      (c.brand ? undefined : db.getActiveBrand(orgId));
    if (!brand) return rejected.push({ row, reason: `Brand "${c.brand}" was not found.` });

    const claim = db.createApprovedClaim(
      brand.organisation_id,
      brand.id,
      {
        claim_code: `CLM-IMP-${Date.now().toString(36).toUpperCase()}-${row}`,
        claim_text: c.claimText,
        category: c.category,
        status: "under_review",
        permitted_context: c.channels.length ? c.channels.join(", ") : "All channels",
        restricted_context: "None",
        required_disclosures: null,
        expires_at: c.expiresAt ?? null,
        verified_by: null,
      },
      c.sourceName || c.reference || c.excerpt
        ? [
            {
              title: `Unverified import: ${c.sourceName || c.reference || "no source name"}`,
              citation: c.reference || c.sourceName || "",
              excerpt: c.excerpt || "",
              study_url: /^https?:\/\//i.test(c.reference || "") ? c.reference : c.reference?.startsWith("10.") ? `https://doi.org/${c.reference}` : null,
              evidence_type: "legal_opinion",
              confidence_score: 0,
            },
          ]
        : undefined
    );
    imported.push(claim);
  });

  if (imported.length) {
    db.recordAuditEvent({
      organizationId: orgId,
      userId,
      action: "import_claims",
      entityType: "claim",
      entityId: "bulk",
      metadata: { imported: imported.length, rejected: rejected.length, verified: false },
    });
  }

  return NextResponse.json({ imported: imported.length, rejected, claims: imported });
}
