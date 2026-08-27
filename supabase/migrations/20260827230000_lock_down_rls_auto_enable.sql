-- Security hardening: rls_auto_enable is an internal helper, not a public RPC API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
