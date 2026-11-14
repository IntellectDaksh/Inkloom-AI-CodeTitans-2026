import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import type { EvidenceSource } from "@/components/submission/shared";

const TYPE_LABEL: Record<string, string> = {
  clinical_trial: "Clinical study",
  lab_report: "Lab report",
  fda_notification: "Regulation",
  iso_cert: "Certification",
  legal_opinion: "Legal opinion",
};

// Retrieval-side ids look like claim_apx_001; the library uses CLM-APX-001.
const toCode = (id: string) => (/^claim_/i.test(id) ? id.replace(/^claim_/i, "CLM-").replace(/_/g, "-").toUpperCase() : id);

/** Attach the approved-library record (if any) each finding cites. Never throws: a lookup miss just means no source. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- store findings are a loose shape
export function withSources<T extends Record<string, any>>(findings: T[]): (T & { source?: EvidenceSource })[] {
  return findings.map((f) => {
    const ref = f.claimId || f.ruleId || f.rule_ref;
    if (!ref || typeof ref !== "string") return f;
    try {
      const code = toCode(ref.split("/")[0].trim());
      const claim = db.getClaimById(SEED_IDS.ORGANISATION_UIDEAS, code);
      if (!claim) return f;
      const ev = claim.evidence?.[0];
      const demo = claim.id.startsWith("00000000-");
      const doi = ev?.citation?.match(/10\.\d{4,9}\/[^\s,;]+/)?.[0];
      const source: EvidenceSource = {
        claimCode: claim.claim_code,
        title: ev?.title || claim.claim_text,
        type: ev ? TYPE_LABEL[ev.evidence_type] || "Approved claim" : "Approved claim",
        date: (ev?.updated_at || claim.updated_at)?.slice(0, 10),
        // Seeded demo references are illustrative, so they are shown as text, not linked.
        url: demo ? undefined : ev?.study_url || (doi ? `https://doi.org/${doi}` : undefined),
        excerpt: ev?.excerpt,
        verifiedBy: claim.verifier?.full_name || undefined,
        verifiedAt: claim.verified_by ? claim.updated_at?.slice(0, 10) : undefined,
        demo,
      };
      return { ...f, source };
    } catch {
      return f;
    }
  });
}
