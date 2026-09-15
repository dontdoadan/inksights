import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const modelPath = 'supabase/migrations/20260915180000_create_golden_audit_model.sql';
const hardeningPath = 'supabase/migrations/20260915181200_harden_golden_audit_contracts.sql';
const lineagePath = 'supabase/migrations/20260915222300_add_golden_audit_lineage.sql';
const sql = fs.readFileSync(modelPath, 'utf8');
const hardening = fs.readFileSync(hardeningPath, 'utf8');
const lineage = fs.readFileSync(lineagePath, 'utf8');

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

test('Golden Audit studio identity extends canonical visibility studio identity', () => {
  assert.match(hardening, /alter table public\.studios alter column id drop default/i);
  assert.match(hardening, /foreign key \(id\) references public\.visibility_studios\(id\) on delete cascade/i);
});

test('runtime hardening provides orchestration cache, lock and 90-day phases', () => {
  assert.match(hardening, /add column if not exists input_hash text/i);
  assert.match(hardening, /create or replace function public\.lock_golden_audit_run/i);
  assert.match(hardening, /add column if not exists phase text generated always/i);
  for (const phase of ['0-30','31-60','61-90']) assert.ok(hardening.includes(phase));
});

test('security-definer Golden Audit RPC uses empty search path and explicit extension qualification', () => {
  assert.match(hardening, /security definer\s+set search_path = ''/i);
  assert.match(hardening, /extensions\.digest/i);
  assert.doesNotMatch(hardening, /auth\.role\s*\(/i);
  assert.match(hardening, /revoke all on function public\.persist_golden_audit_ledger[^;]+from public, anon, authenticated/i);
  assert.match(hardening, /grant execute on function public\.persist_golden_audit_ledger[^;]+to service_role/i);
});

test('finding and diagnosis lineage is persisted at the database boundary', () => {
  assert.match(lineage, /add column if not exists metric_keys text\[\]/i);
  assert.match(lineage, /add column if not exists context_keys text\[\]/i);
  assert.match(lineage, /add column if not exists finding_keys text\[\]/i);
  assert.match(lineage, /trg_golden_audit_finding_lineage/i);
  assert.match(lineage, /trg_golden_audit_diagnosis_lineage/i);
  assert.match(lineage, /dormant_historical_clients/i);
  assert.match(lineage, /material_owner_availability_constraint/i);
});

test('publishing a corrected report supersedes older public report tokens', () => {
  assert.match(lineage, /trg_supersede_prior_golden_audit_reports/i);
  assert.match(lineage, /set status = 'superseded', secure_token_hash = null/i);
});
