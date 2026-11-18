import assert from 'node:assert';
import { runGovernancePipeline } from '../src/lib/ai/pipeline';
// Public live check (no brand chosen): judge claims and document type, never "off-brand".
(async () => {
  const B = '00000000-0000-4000-b000-000000000001', O = '00000000-0000-4000-a000-000000000001';
  const ad = await runGovernancePipeline('nb1', 'Our serum erases wrinkles in 3 days. Trusted by 500 brands.', B, O, 'general', { apiKey: '', noBrand: true });
  assert(!ad.findings.some((f) => f.id === 'gate_off_brand'), 'real ad marked off-brand');
  assert(ad.complianceScore > 2, `real ad scored ${ad.complianceScore}`);
  const deck = await runGovernancePipeline('nb2', 'Uideas pitch deck. About us: Mumbai video studio. Our services: editing, motion graphics. Our clients: 50+ brands. Pricing: reels from 8k. Contact us: hello@uideas.in', B, O, 'general', { apiKey: '', noBrand: true });
  assert(deck.complianceScore <= 2 && deck.status === 'rejected', `deck scored ${deck.complianceScore}`);
  console.log('no-brand check tests passed');
})();
