import assert from 'node:assert';
import { runGovernancePipeline } from '../src/lib/ai/pipeline';

// An agency pitch deck is not Apex Nutrition (sports nutrition) or Zenith Cloud (SaaS) copy, on any channel.
const deck = `Uideas
Creative studio for brands that want to be remembered.

About us
We are a Mumbai video editing and motion graphics studio. 50+ brands, 10M+ views delivered.

Our services
Short-form video editing, motion graphics, brand identity, web development.

Our clients
Restaurants, creators and D2C founders.

Pricing
Reels from 8k per video. Monthly retainers available.

Contact us
hello@uideas.in`;

const apexAd = `Apex ProWhey: 25g of protein per scoop for post-workout recovery. Informed-Sport certified. These statements have not been evaluated by the Food and Drug Administration.`;

(async () => {
  for (const [brand, label] of [['00000000-0000-4000-b000-000000000001', 'Apex'], ['00000000-0000-4000-b000-000000000002', 'Zenith']]) {
    for (const ch of ['landing_page', 'social_media', 'email'] as const) {
      const r = await runGovernancePipeline(`t_${label}_${ch}`, deck, brand, '00000000-0000-4000-a000-000000000001', ch, {
        apiKey: '', brand: label === 'Apex' ? { name: 'Apex Nutrition', industry: 'Sports Nutrition & Performance Supplements' } : { name: 'Zenith Cloud', industry: 'Enterprise cloud infrastructure SaaS' },
      });
      assert(r.complianceScore <= 2, `deck for ${label} on ${ch} scored ${r.complianceScore}`);
      assert(r.findings.some(f => f.id === 'gate_off_brand'), `no off-brand finding for ${label}/${ch}`);
      assert.equal(r.status, 'rejected');
    }
  }
  const ok = await runGovernancePipeline('t_apex_ok', apexAd, '00000000-0000-4000-b000-000000000001', '00000000-0000-4000-a000-000000000001', 'social_media', {
    apiKey: '', brand: { name: 'Apex Nutrition', industry: 'Sports Nutrition & Performance Supplements' },
  });
  assert(!ok.findings.some(f => f.id === 'gate_off_brand'), 'real Apex ad flagged off-brand');
  console.log('brand gate tests passed');
})();
