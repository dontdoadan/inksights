-- INKSIGHTS SEC-2026-10-09
-- Mirrors the already-applied production migration 20261009021205.
-- The only authoritative entry to this privileged function is the server-side
-- stripe-checkout-webhook-v1 Edge Function after Stripe HMAC verification.
-- Ordinary API clients must not be able to forge Checkout Session details.
REVOKE EXECUTE ON FUNCTION public.process_founding_studio_checkout(
  text,text,text,text,text,text,text,text,text,bigint,boolean
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.process_founding_studio_checkout(
  text,text,text,text,text,text,text,text,text,bigint,boolean
) TO service_role;
