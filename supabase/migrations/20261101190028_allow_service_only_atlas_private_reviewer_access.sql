-- Permit the service-only public RPC wrapper to call the private transactional review implementation.
-- No anonymous or end-user EXECUTE rights are granted to the reviewer function.
grant usage on schema private to service_role;
