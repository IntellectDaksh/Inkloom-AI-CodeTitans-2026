import assert from 'node:assert';
import { createFreshOrgState } from '../src/lib/db/store';
const s = createFreshOrgState();
assert.equal(s.submissions.length, 0);
assert.equal(s.approval_requests.length, 0);
assert.equal(s.audit_events.length, 0);
assert(s.brands.length > 0 && s.approved_claims.length > 0);
console.log('fresh org check passed');
