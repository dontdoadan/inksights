-- INKSIGHTS Sales Operating System v1
-- PROPOSED DDL ONLY — NOT AN APPLIED MIGRATION.
-- Governance: review schema, explicitly approve production DDL/RLS, then generate
-- a dated migration via the Supabase CLI and test it on a separate project.
-- Deliberately extends existing visibility_studios, studio_candidates, orders,
-- audits and integration_events without replacing their ownership.
BEGIN;

CREATE TABLE IF NOT EXISTS public.sales_identity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.visibility_studios(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK (provider IN ('hubspot','stripe','website','supabase')),
  object_type text NOT NULL CHECK (object_type IN ('company','contact','deal','customer','session','subscription','lead')),
  external_id text NOT NULL CHECK (length(btrim(external_id)) BETWEEN 1 AND 220),
  resolution_status text NOT NULL DEFAULT 'pending'
    CHECK (resolution_status IN ('pending','verified','conflict','rejected')),
  match_method text NOT NULL CHECK (match_method IN ('company_registration','provider_place_id','domain_postcode','authenticated_claim','manual_review','checkout_metadata')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- A single HubSpot company can represent a legal entity with several sites;
  -- do not require a company external_id to be globally unique across studios.
  UNIQUE(studio_id, provider, object_type, external_id),
  CONSTRAINT verified_link_has_evidence CHECK (
    resolution_status <> 'verified' OR (verified_at IS NOT NULL AND verified_by IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS sales_identity_links_studio_idx
  ON public.sales_identity_links(studio_id,provider,object_type);
-- Transactional references are uniquely attributable to one studio.
CREATE UNIQUE INDEX IF NOT EXISTS sales_unique_transactional_external_id
  ON public.sales_identity_links(provider,object_type,external_id)
  WHERE object_type IN ('deal','session','subscription') AND resolution_status='verified';
CREATE UNIQUE INDEX IF NOT EXISTS sales_one_hubspot_company_per_studio
  ON public.sales_identity_links(studio_id)
  WHERE provider='hubspot' AND object_type='company' AND resolution_status='verified';

CREATE TABLE IF NOT EXISTS public.sales_contact_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.visibility_studios(id) ON DELETE RESTRICT,
  hubspot_contact_id text,
  channel text NOT NULL CHECK (channel IN ('email','social_dm','phone')),
  subscriber_type text NOT NULL CHECK (subscriber_type IN ('corporate','individual','unknown')),
  subscriber_verified boolean NOT NULL DEFAULT false,
  lawful_basis text,
  legal_assessment_ref text,
  notice_provided_at timestamptz,
  consent_evidence_ref text,
  soft_opt_in_evidence_ref text,
  suppressed boolean NOT NULL DEFAULT false,
  permission_status text NOT NULL DEFAULT 'needs_review'
    CHECK (permission_status IN ('needs_review','permitted','blocked','withdrawn')),
  assessed_by text,
  assessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (permission_status <> 'permitted' OR (assessed_by IS NOT NULL
    AND assessed_at IS NOT NULL AND legal_assessment_ref IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sales_permissions_contact_idx
  ON public.sales_contact_permissions(hubspot_contact_id, assessed_at DESC);

-- One form-originated purchase may create only one lead per Stripe Session.
-- Prevent duplicate contacts if two signed Stripe webhooks race.
CREATE UNIQUE INDEX IF NOT EXISTS public_contact_checkout_session_unique_v1
  ON public.public_contact_requests ((metadata->>'stripe_session_id'))
  WHERE source='stripe_checkout' AND metadata ? 'stripe_session_id' AND is_test=false;

-- Immutable intent/event history. Refrain from embedding personal data or free-
-- text AI claims in properties. A provider event is keyed for idempotency.
CREATE TABLE IF NOT EXISTS public.sales_journey_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES public.visibility_studios(id) ON DELETE RESTRICT,
  candidate_id uuid REFERENCES public.studio_candidates(id) ON DELETE RESTRICT,
  -- Anonymous/inbound buyers remain provisional until a verified studio match.
  -- Store only a random database/provider reference here, NEVER email/phone.
  source_ref text CHECK (source_ref IS NULL OR length(source_ref) BETWEEN 1 AND 220),
  event_kind text NOT NULL CHECK (event_kind IN (
    'identified','lead_captured','crm_synced','qualified','contact_permitted','outreach_prepared','outreach_sent',
    'positive_qualified_engagement','engaged','discovery_completed',
    'qualified_conversation','offer_presented','checkout_started',
    'order_paid_verified','onboarding_started','audit_delivered',
    'implementation_paid_verified','monitoring_attached','monitoring_cancelled',
    'lost','requalification_required'
  )),
  source_system text NOT NULL CHECK (source_system IN ('research','website','hubspot','stripe','supabase','human_review')),
  source_event_id text,
  idempotency_key text NOT NULL UNIQUE,
  acquisition_path text NOT NULL DEFAULT 'unknown' CHECK (acquisition_path IN ('direct','assisted','unknown')),
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_test boolean NOT NULL DEFAULT false,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CHECK (studio_id IS NOT NULL OR candidate_id IS NOT NULL OR source_ref IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS sales_journey_week_idx
  ON public.sales_journey_events(occurred_at DESC, event_kind) WHERE is_test=false;
CREATE INDEX IF NOT EXISTS sales_journey_studio_idx
  ON public.sales_journey_events(studio_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS sales_journey_source_ref_idx
  ON public.sales_journey_events(source_ref, occurred_at DESC) WHERE source_ref IS NOT NULL;

-- Orders are ONLY authoritative for money when Stripe has been verified
-- server-side. Never infer payment from return-page views or CRM deal stages.
-- Do not join by email only. Conflicts remain pending until reviewed.
CREATE TABLE IF NOT EXISTS public.sales_order_links (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE RESTRICT,
  studio_id uuid NOT NULL REFERENCES public.visibility_studios(id) ON DELETE RESTRICT,
  resolution_status text NOT NULL DEFAULT 'pending'
    CHECK (resolution_status IN ('pending','verified','conflict','rejected')),
  source_verified boolean NOT NULL DEFAULT false,
  provider_event_id text,
  acquisition_path text NOT NULL DEFAULT 'unknown'
    CHECK (acquisition_path IN ('direct','assisted','unknown')),
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (resolution_status <> 'verified' OR
    (source_verified = true AND provider_event_id IS NOT NULL AND resolved_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sales_order_links_studio_idx
  ON public.sales_order_links(studio_id,resolution_status);

CREATE TABLE IF NOT EXISTS public.sales_delivery_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.visibility_studios(id) ON DELETE RESTRICT,
  order_id uuid REFERENCES public.orders(id) ON DELETE RESTRICT,
  audit_id uuid REFERENCES public.audits(id) ON DELETE RESTRICT,
  milestone text NOT NULL CHECK (milestone IN
    ('intake_started','intake_complete','audit_started','report_qa_passed',
     'access_granted','accepted','implementation_proposed','monitoring_started')),
  hours_spent numeric(10,2) CHECK (hours_spent >= 0),
  hourly_cost_pence bigint CHECK (hourly_cost_pence >= 0),
  cash_cost_pence bigint NOT NULL DEFAULT 0 CHECK (cash_cost_pence >= 0),
  evidence_ref text,
  actor_ref text,
  is_test boolean NOT NULL DEFAULT false,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_delivery_studio_idx
  ON public.sales_delivery_work(studio_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.sales_acquisition_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  channel text NOT NULL,
  incurred_on date NOT NULL,
  cost_pence bigint NOT NULL CHECK (cost_pence >= 0),
  currency text NOT NULL DEFAULT 'gbp' CHECK (currency='gbp'),
  is_test boolean NOT NULL DEFAULT false,
  evidence_ref text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_acquisition_costs_date_idx
  ON public.sales_acquisition_costs(incurred_on,channel);

-- Production security: zero client grants or policies. Only trusted
-- server-side functions access these private operational tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sales_identity_links','sales_contact_permissions','sales_journey_events',
    'sales_order_links','sales_delivery_work','sales_acquisition_costs'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated',t);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.%I TO service_role',t);
  END LOOP;
END $$;

-- No broad customer-visible view; keep even the aggregate view server-only.
CREATE OR REPLACE VIEW public.sales_verified_audit_purchases
WITH (security_invoker=true) AS
SELECT o.id AS order_id,
       l.studio_id,
       o.stripe_session_id,
       o.amount_total AS collected_pence,
       o.currency,
       o.created_at AS recorded_at,
       l.acquisition_path
FROM public.orders o
JOIN public.sales_order_links l ON l.order_id = o.id
WHERE l.resolution_status='verified'
  AND l.source_verified=true
  AND o.status='paid'
  AND o.offer_slug='studio-intelligence-audit'
  AND o.currency='gbp'
  AND o.amount_total > 0;
REVOKE ALL ON public.sales_verified_audit_purchases FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.sales_verified_audit_purchases TO service_role;

COMMIT;

-- Release blockers before execution:
-- 1. Verify compatibility with ALL unapplied migrations and PR #137.
-- 2. Decide if a candidate-to-studio promotion should create a visibility_studios row.
-- 3. Backfill identity links via a reviewed conflict report, never blind joins.
-- 4. Implement an atomic Stripe order-state CAS (no paid->pending regression).
-- 5. Gate create/check access behind a server-only role and test RLS/no anon access.
-- 6. Ensure anonymous form consent and marketing permission remain distinct.
-- 7. Produce non-production CI migrations and rollback tests before production approval.
