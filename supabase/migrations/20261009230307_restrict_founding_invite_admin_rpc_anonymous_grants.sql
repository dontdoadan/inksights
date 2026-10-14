-- Production migration: 20261009230307; recorded on 2026-10-09.
-- Both functions already require private.is_platform_admin() internally.
-- Retain authenticated administrator access; block pointless anonymous execution.
REVOKE EXECUTE ON FUNCTION public.create_founding_studio_invite(
  text,text,text,text,text,text,text,timestamptz
) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_founding_studio_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_founding_studio_invite(
  text,text,text,text,text,text,text,timestamptz
) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.revoke_founding_studio_invite(uuid)
  TO authenticated, service_role;
