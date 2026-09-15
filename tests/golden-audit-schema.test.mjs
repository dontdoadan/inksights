import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = 'supabase/migrations/20260915180000_create_golden_audit_model.sql';
const sql = fs.readFileSync(path, 'utf8');

const tables = [
  'studios','audits','audit_sources','audit_raw_records','clients','client_aliases','transactions',
  'audit_metrics','audit_evidence','audit_findings','audit_finding_evidence','audit_diagnoses',
  'audit_opportunities','audit_recommendations','audit_interventions','audit_runs','report_versions','qa_checks'
];

for (const table of tables) {
  test(`schema contains ${table}`, () => {
    assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table}`, 'i'));
  });
}

test('schema encodes evidence and confidence classifications', () => {
  for (const value of ['VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS','HIGH','MEDIUM','LOW']) {
    assert.ok(sql.includes(value), `missing ${value}`);
  }
});

test('schema separates measurement status from evidence classification', () => {
  for (const value of ['measured','estimated','not_measurable','not_applicable']) {
    assert.ok(sql.includes(value), `missing ${value}`);
  }
});

test('schema preserves transaction grain', () => {
  assert.match(sql, /amount_pence bigint not null/i);
  assert.match(sql, /duplicate_status text not null/i);
  assert.doesNotMatch(sql, /session_id uuid references public\.transactions/i);
});

test('browser roles receive read-only tenant access while service role owns writes', () => {
  assert.match(sql, /revoke all on table public\.%I from anon, authenticated/i);
  assert.match(sql, /grant select on table public\.%I to authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table public\.%I to service_role/i);
  assert.match(sql, /create or replace function public\.can_read_studio/i);
});
