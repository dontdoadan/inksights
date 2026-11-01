-- Studio Atlas pilot: prevent public grants inherited from schema defaults.
revoke all on public.atlas_claim_requests from PUBLIC, anon;
revoke all on public.atlas_profile_drafts from PUBLIC, anon;
revoke all on public.atlas_customer_enquiries from PUBLIC, anon;
revoke all on public.atlas_profiles from PUBLIC;
grant select on public.atlas_profiles to anon,authenticated;
grant select,insert on public.atlas_claim_requests to authenticated;
grant select,insert on public.atlas_profile_drafts to authenticated;
grant select on public.atlas_customer_enquiries to authenticated;
