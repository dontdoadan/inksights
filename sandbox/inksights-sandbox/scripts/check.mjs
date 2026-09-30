import { openDatabase, getStudios, resetDatabase } from '../src/db.js';
import { assertSandboxEnv, runSafetyTests } from '../src/safety.js';
import { buildGrowthCheck, buildAudit } from '../src/domain.js';

assertSandboxEnv();
const db = openDatabase(':memory:');
resetDatabase(db);

const studios = getStudios(db);
if (studios.length !== 4) throw new Error('Expected exactly four seeded synthetic studios.');

const failures = runSafetyTests().filter((test) => test.status !== 'PASS');
if (failures.length) throw new Error('Safety checks failed: ' + JSON.stringify(failures));

const growth = buildGrowthCheck(studios[0]);
if (!growth.synthetic || !growth.primary_constraint || growth.opportunities.length < 1) {
  throw new Error('Growth Check did not produce a valid synthetic diagnostic.');
}

const audit = buildAudit(studios[0]);
if (!audit.synthetic || audit.status !== 'COMPLETE' || !audit.lineage?.stages?.length) {
  throw new Error('Intelligence Audit did not produce a valid synthetic audit.');
}

console.log('INKSIGHTS Sandbox base check: PASS');
console.log('Synthetic studios:', studios.length);
console.log('Safety tests:', runSafetyTests().length, 'PASS');
console.log('Growth Check primary constraint:', growth.primary_constraint);
console.log('Audit ID:', audit.audit_id);
