-- Final INKSIGHTS-owned advisor remediation after sandbox reconstruction.

create index if not exists idx_intelligence_taxonomy_parent_id
  on public.intelligence_taxonomy(parent_id);

-- Evaluate auth.jwt() once per statement rather than once per row.
drop policy if exists "revenue audit leads authenticated self read" on public.revenue_audit_leads;
create policy "revenue audit leads authenticated self read"
on public.revenue_audit_leads
for select
to authenticated
using (
  lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
);

-- The canonical table already has the unique constraint-backed index
-- intelligence_playbooks_key_version_key. Remove the duplicate reconciliation index.
drop index if exists public.uq_intelligence_playbooks_key_version;
