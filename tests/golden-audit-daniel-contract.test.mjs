import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/golden-audit/seed-daniel-hughes.mjs', 'utf8');

test('Daniel seed is explicitly internal Mode B Audit v1.1', () => {
  assert.match(source, /internal_validation:\s*true/);
  assert.match(source, /const auditVersion = '1\.1'/);
  assert.match(source, /const mode = 'B'/);
  assert.match(source, /material_owner_availability_constraint:\s*true/);
});

test('Daniel seed requires the private ledger at runtime', () => {
  assert.match(source, /DANIEL_LEDGER_PATH/);
  assert.match(source, /audit-sources/);
  assert.doesNotMatch(source, /\d{2}\/\d{2}\/20\d{2}\t[^\n]+\t£?\d/);
});

test('Daniel seed does not encode personal health or precise-location details', () => {
  assert.doesNotMatch(source, /family_health|parent_health|caregiving|medical_context|hospital_context|health_condition/i);
  assert.match(source, /primary_location:\s*null/);
});

test('Daniel seed delegates analysis to canonical Golden Audit functions', () => {
  assert.match(source, /golden-audit-ingest/);
  assert.match(source, /golden-audit-run/);
  assert.doesNotMatch(source, /calculateTransactionMetrics|generateFindings|generateDiagnoses/);
});
