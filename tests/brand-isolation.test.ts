import { db } from "../src/lib/db";
import { SEED_IDS } from "../src/lib/db/seed";

const brands = [SEED_IDS.BRAND_APEX, SEED_IDS.BRAND_ZENITH, SEED_IDS.BRAND_LUMINA];
// UI-created rows may carry the short alias instead of the seed UUID.
const ALIAS: Record<string, string> = { brand_apex: SEED_IDS.BRAND_APEX, brand_zenith: SEED_IDS.BRAND_ZENITH, brand_lumina: SEED_IDS.BRAND_LUMINA };
const canon = (id: string) => ALIAS[id] ?? id;
const fail = (m: string) => { console.error(`FAIL: ${m}`); process.exit(1); };

for (const b of brands) {
  const claims = db.listClaims(b);
  if (!claims.length) fail(`brand ${b} has no seeded claims`);
  if (claims.some((c) => canon(c.brand_id) !== b)) fail(`claims leak into brand ${b}`);
  if (db.listSubmissions(b).some((s) => canon(s.brand_id) !== b)) fail(`submissions leak into brand ${b}`);
}
const lumina = db.listClaims("brand_lumina");
if (!lumina.length || lumina.some((c) => c.brand_id !== SEED_IDS.BRAND_LUMINA)) fail("brand_lumina alias does not isolate");
if (!db.getApprovedClaims(SEED_IDS.ORGANISATION_UIDEAS, undefined, { expiringOnly: true }).length) fail("no claim expires within 30 days");
console.log("PASS: brand isolation across Apex, Zenith, Lumina; expiry alert data present");
