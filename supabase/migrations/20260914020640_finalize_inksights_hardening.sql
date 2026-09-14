create index if not exists idx_intelligence_taxonomy_parent_id on public.intelligence_taxonomy(parent_id);
drop policy if exists "revenue audit leads authenticated self read" on public.revenue_audit_leads;
create policy "revenue audit leads authenticated self read" on public.revenue_audit_leads for select to authenticated using (lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), '')));
drop index if exists public.uq_intelligence_playbooks_key_version;