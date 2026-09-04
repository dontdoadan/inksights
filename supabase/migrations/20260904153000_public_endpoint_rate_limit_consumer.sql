create or replace function public.consume_public_endpoint_rate_limit(p_endpoint text, p_key_hash text, p_window_started_at timestamptz, p_max_requests integer default 5)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare v_count integer;
begin
  if p_max_requests < 1 or length(trim(p_endpoint)) = 0 or length(trim(p_key_hash)) = 0 then
    raise exception 'invalid_rate_limit_arguments';
  end if;
  insert into public.public_endpoint_rate_limits(endpoint,key_hash,window_started_at,request_count,last_seen_at)
  values(trim(p_endpoint),trim(p_key_hash),p_window_started_at,1,now())
  on conflict (endpoint,key_hash,window_started_at)
  do update set request_count = public.public_endpoint_rate_limits.request_count + 1, last_seen_at = now()
  returning request_count into v_count;
  return v_count <= p_max_requests;
end;
$$;
revoke all on function public.consume_public_endpoint_rate_limit(text,text,timestamptz,integer) from public, anon, authenticated;
grant execute on function public.consume_public_endpoint_rate_limit(text,text,timestamptz,integer) to service_role;
