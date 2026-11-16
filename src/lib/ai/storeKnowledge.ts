/**
 * Bridges the workspace's own knowledge base (claims library, guidelines, terminology stored per
 * organisation in src/lib/db) into the pipeline's retrieval repository. Without this, checks only
 * saw the hardcoded seed in retrieval.ts and ignored everything a team added.
 */
import { BrandKnowledgeRepository } from './retrieval';
import type { ClaimRecord, FindingSeverity } from './types';

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const SEV: Record<string, FindingSeverity> = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };

export async function buildRepoFromStore(orgId: string, brandId: string): Promise<BrandKnowledgeRepository | undefined> {
  let db: typeof import('../db').db;
  try {
    db = (await import('../db')).db;
  } catch {
    return undefined;
  }
  const repo = new BrandKnowledgeRepository();
  const seen = new Set<string>();
  const now = Date.now();

  // Claims library: approved claims are citable evidence; expired ones feed the expired-claim rule.
  for (const c of db.getApprovedClaims(orgId, brandId)) {
    const key = c.claim_text.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const expired = c.status === 'expired' || (!!c.expires_at && new Date(c.expires_at).getTime() < now);
    if (c.status !== 'approved' && !expired) continue; // drafts / under review are not proof
    const rec: ClaimRecord = {
      id: c.claim_code || c.id,
      organizationId: orgId,
      brandId,
      claimText: c.claim_text,
      status: expired ? 'expired' : 'active',
      allowedContexts: [c.permitted_context].filter(Boolean),
      validFrom: c.created_at,
      validUntil: c.expires_at ?? undefined,
      mandatoryDisclaimers: c.required_disclosures ? [c.required_disclosures] : undefined,
      evidenceRecords: c.evidence.map((e) => ({
        id: e.id,
        claimId: c.claim_code || c.id,
        sourceName: e.title || e.citation,
        excerpt: e.excerpt,
        verifiedBy: c.verified_by ?? 'workspace',
        verificationDate: e.updated_at,
        confidenceScore: e.confidence_score ?? 0.8,
      })),
    };
    repo.registerClaim(rec);
  }

  // Terminology: structured brand terms plus the editable terminology list.
  const blocked: Array<{ term: string; reason: string; replacement?: string; severity: FindingSeverity }> = [];
  for (const t of db.getBrandTerms(orgId, brandId)) {
    if (t.term_type === 'prohibited') blocked.push({ term: t.term, reason: t.rationale, replacement: t.replacement ?? undefined, severity: 'high' });
  }
  for (const t of db.listKbItems(orgId, brandId, 'term').items as Row[]) {
    if (str(t.kind) === 'blocked' && str(t.term)) {
      blocked.push({ term: str(t.term), reason: str(t.note) || 'Blocked by brand terminology.', replacement: str(t.replacement) || undefined, severity: SEV[str(t.severity)] ?? 'high' });
    }
  }
  const termSeen = new Set<string>();
  for (const [i, t] of blocked.entries()) {
    const k = t.term.toLowerCase();
    if (termSeen.has(k)) continue;
    termSeen.add(k);
    repo.registerProhibitedTerm({
      id: `ws_term_${i}`, brandId, organizationId: orgId, term: t.term, matchMode: 'word_boundary',
      reason: t.reason, suggestedReplacement: t.replacement, severity: t.severity, category: 'prohibited_term',
    });
  }

  // Guidelines: structured rows and the editable guideline list both go to the model as rules.
  for (const g of db.getBrandGuidelines(orgId, brandId)) {
    repo.registerGuideline({
      id: g.id, organizationId: orgId, brandId, title: g.title, category: 'compliance',
      summary: g.description ?? g.title, rules: [g.rule_content], examplesAllowed: [], examplesProhibited: [],
    });
  }
  for (const g of db.listKbItems(orgId, brandId, 'guideline').items as Row[]) {
    const dos = Array.isArray(g.dos) ? (g.dos as unknown[]).map(str).filter(Boolean) : [];
    const donts = Array.isArray(g.donts) ? (g.donts as unknown[]).map(str).filter(Boolean) : [];
    repo.registerGuideline({
      id: str(g.id) || `ws_g_${str(g.title)}`, organizationId: orgId, brandId, title: str(g.title), category: 'voice_tone',
      summary: str(g.description), rules: [...dos.map((d) => `Do: ${d}`), ...donts.map((d) => `Don't: ${d}`)],
      examplesAllowed: dos, examplesProhibited: donts,
    });
  }
  return repo;
}
