/** Round 6 checks: 6 stages, zero-hallucination citations, channel disclosures, score breakdown, scanner speed. */
import assert from 'node:assert/strict';
import { checkChannelDisclosures, compileGovernanceFindings, runDeterministicRuleChecks, runGovernancePipeline, isSuppressedMatch } from '../index';

async function main() {
  // Item 3: six named stages, each timed.
  const s = await runGovernancePipeline('t6', 'Flowscale is 10x faster than Kafka.', 'brand_flowscale', 'org_inkloom_demo', 'landing_page', { apiKey: '' });
  assert.equal(s.stages.length, 6);
  assert.deepEqual(s.stages.map(x => x.stage), [1, 2, 3, 4, 5, 6]);
  s.stages.forEach(x => assert.ok(x.name && Number.isFinite(x.ms) && x.ms >= 0, `stage ${x.stage} timed`));
  assert.ok(s.stageExecutionTimes.totalMs >= s.stages.reduce((n, x) => n + x.ms, 0) - 0.1);

  // Item 8: score breakdown adds up.
  const b = s.scoreBreakdown;
  assert.equal(b.factors.length, 4);
  assert.ok(Math.abs(b.factors.reduce((n, f) => n + f.weight, 0) - 1) < 1e-9);
  assert.equal(b.final, Math.round(b.factors.reduce((n, f) => n + f.score * f.weight, 0)));
  assert.equal(s.complianceScore, b.final);

  // Item 4: no finding cites an evidence id that doesn't exist.
  const ev = [{ id: 'ev_real', claimId: 'c1', sourceName: 'Lab report', excerpt: 'x' } as never];
  const out = compileGovernanceFindings('t', [], { findings: [
    { category: 'factual_conflict', severity: 'informational', confidence: 'high', flaggedText: 'a', explanation: '', citedEvidenceIds: ['ev_real', 'ev_made_up'], suggestedCorrection: '', isVerified: true },
    { category: 'factual_conflict', severity: 'informational', confidence: 'high', flaggedText: 'b', explanation: '', citedEvidenceIds: ['approved_repo_ref'], suggestedCorrection: '', isVerified: true },
  ] }, ev);
  assert.deepEqual(out[0].citedEvidenceIds, ['ev_real']);
  assert.deepEqual(out[1].citedEvidenceIds, []);
  assert.equal(out[1].isVerified, false, 'verified finding without real evidence is downgraded');
  const real = new Set(s.findings.flatMap(f => f.evidenceRecords.map(e => e.id)));
  s.findings.forEach(f => (f.citedEvidenceIds ?? []).forEach(id => assert.ok(real.has(id), `cited ${id} exists`)));

  // Item 6: FTC endorsement on social only; FDA DSHEA on supplement structure/function claims.
  const creator = 'Loving my new protein! Use code SAM10 for 10% off';
  assert.equal(checkChannelDisclosures(creator, 'social_media').filter(v => v.ruleId === 'reg_ftc_endorsement').length, 1);
  assert.equal(checkChannelDisclosures(creator + ' #ad', 'social_media').filter(v => v.ruleId === 'reg_ftc_endorsement').length, 0);
  assert.equal(checkChannelDisclosures(creator, 'email').filter(v => v.ruleId === 'reg_ftc_endorsement').length, 0);
  assert.equal(checkChannelDisclosures('Paid partnership with Apex. Use code SAM10', 'social_media').length, 0);
  const sf = 'Our greens powder supports immune health.';
  assert.equal(checkChannelDisclosures(sf, 'landing_page').filter(v => v.ruleId === 'reg_fda_dshea').length, 1);
  assert.equal(checkChannelDisclosures(sf + ' These statements have not been evaluated by the Food and Drug Administration.', 'landing_page').length, 0);
  assert.equal(checkChannelDisclosures('Flowscale supports high throughput.', 'landing_page').length, 0, 'no supplement context');

  // Weak-spot fixes.
  const t = 'No system is bulletproof.';
  assert.ok(isSuppressedMatch(t, t.indexOf('bulletproof'), t.indexOf('bulletproof') + 11));
  const m = 'Shoutout to the Miracle Mile run club.';
  assert.ok(isSuppressedMatch(m, m.indexOf('Miracle'), m.indexOf('Miracle') + 7));
  const n = 'Our blend is no magic bullet.';
  assert.ok(!isSuppressedMatch(n, n.indexOf('magic'), n.indexOf('magic') + 12), '"is no X" still counts');

  // Item 5: deterministic scanner on a 2,000-word draft stays under 5 ms (median).
  const draft = Array.from({ length: 200 }, () => 'Flowscale is bulletproof and unhackable with 100% uptime for everyone.').join(' ').split(' ').slice(0, 2000).join(' ');
  const rules = { prohibitedTerms: [{ id: 'p', brandId: 'b', organizationId: 'o', term: 'bulletproof', reason: '', severity: 'high' as const }], requiredPhrases: [], allClaims: [] };
  const times: number[] = [];
  for (let i = 0; i < 60; i++) { const t0 = performance.now(); runDeterministicRuleChecks(draft, 'social_media', rules); times.push(performance.now() - t0); }
  times.sort((a, z) => a - z);
  assert.ok(times[30] < 5, `scanner median ${times[30].toFixed(2)}ms < 5ms`);

  console.log('round6 tests passed');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
