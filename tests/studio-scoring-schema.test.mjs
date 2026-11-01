import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL("../supabase/migrations/20261101060000_public_verified_studio_scoring_v1.sql", import.meta.url),
  "utf8",
);
const normal = sql.toLowerCase();

test("public and verified models coexist on canonical visibility_studios", () => {
  assert.match(sql, /'public_presence',1,'public'/);
  assert.match(sql, /'verified_commercial',1,'verified'/);
  assert.match(sql, /references public\.visibility_studios\(id\)/i);
  assert.match(sql, /public_tool_submissions\s+add column if not exists canonical_studio_id/i);
  assert.doesNotMatch(normal, /create\s+table\s+public\.studios\s*\(/);
  assert.match(normal, /create table if not exists public\.studio_legacy_identity_links/);
  assert.match(sql, /reconcile_reviewed_studio_submissions_v1/);
  assert.match(sql, /no reviewed identity link with supporting evidence/);
  assert.match(sql, /conflicting canonical links require manual review/);
  assert.match(sql, /grant execute on function public\\.reconcile_reviewed_studio_submissions_v1\\(uuid\\)/);
  assert.match(sql, /studio_profile_self_report_numeric_check/);
});

test("all new exposed data tables have RLS and no anonymous tenant read", () => {
  const tables = [
    "studio_legacy_identity_links", "studio_profile_answers", "studio_profile_answer_history",
    "studio_scoring_models", "studio_scoring_dimensions", "studio_scoring_metric_rules",
    "studio_scoring_metric_assessments", "studio_scoring_snapshots",
  ];
  for (const table of tables) {
    assert.ok(normal.includes(`alter table public.${table} enable row level security`), table);
    assert.ok(normal.includes(`public.${table}`), table);
  }
  assert.doesNotMatch(normal, /for select to anon/);
  assert.match(normal, /m\.user_id=\(select auth\.uid\(\)\) and m\.active/);
});

test("self-reports are unverified and previous periods are captured", () => {
  assert.match(sql, /source_type = 'studio_reported' and verification_status = 'unverified'/);
  assert.match(sql, /source_submission_id is null and confidence is null/);
  assert.match(sql, /security definer set search_path = ''/);
  assert.match(sql, /inksights_internal\.audit_studio_profile_answer_v1/);
  assert.match(sql, /previous_period_start/);
  assert.match(sql, /old\.measurement_end/);
  assert.match(sql, /data_notice_version = '2026-11-profile-v1'/);
  assert.match(sql, /notice_acknowledged_at is not null/);
});

test("scoring is evidence gated and cannot manufacture a score from missing data", () => {
  assert.match(sql, /review_status = 'accepted'/);
  assert.match(sql, /a\.source_tier = v_model\.tier/);
  assert.match(sql, /a\.benchmark_state = 'EMPIRICAL'/);
  assert.match(sql, /a\.benchmark_state = 'PUBLISHED_RUBRIC'/);
  assert.match(sql, /v_coverage >= v_model\.min_coverage and v_missing_dimensions = 0/);
  assert.match(sql, /then round\(v_score,2\) else null end/);
  assert.match(sql, /then 'scored' else 'insufficient_data' end/);
  assert.match(sql, /revoke all on function public\.calculate_studio_score_v1\(uuid,text,date,date\)/);
  assert.match(sql, /grant execute on function public\.calculate_studio_score_v1\(uuid,text,date,date\) to service_role/);
});
