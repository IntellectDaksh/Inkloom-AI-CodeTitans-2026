import assert from 'node:assert';
import { runGovernancePipeline } from '../pipeline';
import { stripPageNoise, PAGE_BREAK } from '../extract';

// Pitch deck pasted as a reel must not pass.
const deck = `Uideas pitch deck\n\nAbout us\nWe are a creative studio.\n\nOur services\nVideo editing, motion graphics, brand identity.\n\nOur clients\nWe have worked with 50+ brands and delivered 10M views.\n\nCase studies\n` + 'Long project description. '.repeat(40) + `\n\nPricing\nPackages start at 20k.\n\nContact us\nhello@example.com`;
(async () => {
const r = await runGovernancePipeline('t_fit', deck, 'brand_flowscale', 'org_inkloom_demo', 'social_media', { apiKey: '' });
assert(r.complianceScore <= 40, `deck as reel scored ${r.complianceScore}`);
assert.equal(r.status, 'rejected');

// Watermark on every page is dropped, real copy kept.
const pages = [1, 2, 3, 4].map(n => `CONFIDENTIAL\nMade with Gamma\nSlide copy number ${n} about results\n${n}`).join(`\n${PAGE_BREAK}\n`);
const clean = stripPageNoise(pages);
assert(!/CONFIDENTIAL|Gamma/.test(clean), clean);
assert(/Slide copy number 3/.test(clean));
console.log('fit tests passed');
})();
