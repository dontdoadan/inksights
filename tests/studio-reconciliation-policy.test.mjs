import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/20261109000000_studio_reconciliation_engine_v1.sql", "utf8");
const gateway = readFileSync("supabase/functions/studio-reconciliation-admin/index.ts", "utf8");
const route = readFileSync("src/routes/_authenticated/studio-reconciliation.tsx", "utf8");
const tree = readFileSync("src/routeTree.gen.ts", "utf8");
const refresh = migration.split("create or replace function public.studio_reconciliation_refresh")[1]
  ?.split("create or replace function public.studio_reconciliation_record_review")[0] ?? "";

test("private reconciliation rows are not exposed to anon/authenticated roles", () => {
  for (const table of ["studio_reconciliation_cases", "studio_reconciliation_decisions"]) {
    assert.match(migration, new RegExp("alter table public\\." + table + " enable row level security"));
    assert.match(migration, new RegExp("revoke all on public\\." + table + " from PUBLIC, anon, authenticated"));
  }
  assert.match(migration, /revoke all on function public\.studio_reconciliation_refresh\(uuid\) from PUBLIC,anon,authenticated/i);
  assert.match(migration, /revoke all on function public\.studio_reconciliation_record_review[\s\S]*from PUBLIC,anon,authenticated/i);
});

test("suggestion refresh never grants ownership, publishes a studio or alters CRM", () => {
  assert.match(refresh, /on conflict \(candidate_id\) do update set/i);
  assert.match(refresh, /studio_reconciliation_cases\.review_status = 'unreviewed'/);
  assert.doesNotMatch(refresh, /insert into public\.studio_identity_matches/i);
  assert.doesNotMatch(refresh, /update public\.studio_candidates/i);
  assert.doesNotMatch(refresh, /atlas_profiles|studio_members|hubspot|orders/i);
});

test("weak shared-host signal cannot outrank a name-and-website signal", () => {
  assert.match(migration, /then 'same_website_and_name'/);
  assert.match(migration, /then 'shared_website_host_only'/);
  assert.match(migration, /c\.chost=v\.vhost and c\.cname<>'' and c\.cname=v\.vname then 92/);
  assert.match(migration, /c\.chost=v\.vhost then 50/);
  assert.match(migration, /'multiple_visibility_candidates'/);
});

test("manual approval requires identity target, source evidence and immutable event", () => {
  assert.match(migration, /if p_visibility_id is null then raise exception/);
  assert.match(migration, /Independent HTTPS evidence URL required/);
  assert.match(migration, /insert into public\.studio_reconciliation_decisions/);
  assert.match(migration, /Approved identity links require a dedicated reversal workflow/);
  assert.match(migration, /studio_location_verified',false/);
});

test("administrator gateway requires live auth, server-side admin role and origin", () => {
  assert.match(gateway, /await reviewer\(req\)/);
  assert.match(gateway, /auth\/v1\/user/);
  assert.match(gateway, /platform_admins\?select/);
  assert.match(gateway, /if \(!allowed\(origin\)\)/);
  assert.doesNotMatch(gateway, /Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)[\s\S]*return reply\(origin, 200, \{ ok: true, key/);
});

test("reconciliation route is protected by the app's authenticated route tree", () => {
  assert.match(route, /createFileRoute\("\/_authenticated\/studio-reconciliation"\)/);
  assert.match(tree, /AuthenticatedStudioReconciliationRouteImport/);
  assert.match(tree, /'\/_authenticated\/studio-reconciliation'/);
  assert.match(tree, /nope_expect_a_wrong_value_marker_not_present/.source ? /'\/studio-reconciliation'/ : /'\/studio-reconciliation'/);
});
