-- INKSIGHTS Unified Studio Journey — additive migration (PROPOSAL ONLY)
-- Do not apply to the production project before change approval and restore-point verification.
-- Existing studios, studio_members, orders, audit evidence and public_tool_submissions remain authoritative.
BEGIN;

CREATE TABLE IF NOT EXISTS public.studio_journey_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  revoked_at timestamptz,
  claimed_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  studio_id uuid REFERENCES public.studios(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  consent_version text NOT NULL,
  CONSTRAINT studio_journey_expiry_valid CHECK (expires_at > created_at),
  CONSTRAINT studio_journey_claim_complete CHECK (
    (studio_id IS NULL AND claimed_user_id IS NULL AND claimed_at IS NULL)
    OR (studio_id IS NOT NULL AND claimed_user_id IS NOT NULL AND claimed_at IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS studio_journey_sessions_owner
  ON public.studio_journey_sessions (claimed_user_id, claimed_at DESC)
  WHERE claimed_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS studio_journey_sessions_expiry
  ON public.studio_journey_sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.studio_journey_steps (
  session_id uuid NOT NULL REFERENCES public.studio_journey_sessions(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL UNIQUE REFERENCES public.public_tool_submissions(id) ON DELETE RESTRICT,
  stage text NOT NULL CHECK (stage IN ('growth','revenue','visibility','summary')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, submission_id)
);
CREATE INDEX IF NOT EXISTS studio_journey_steps_ordering
  ON public.studio_journey_steps (session_id, submitted_at, submission_id);

ALTER TABLE public.studio_journey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_journey_steps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.studio_journey_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.studio_journey_steps FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.studio_journey_sessions TO service_role;
GRANT SELECT, INSERT ON public.studio_journey_steps TO service_role;

-- RLS has NO policies: only the server's trusted service role may reach these tables.
-- One invoker transaction atomically records the existing submission and its session linkage.
CREATE OR REPLACE FUNCTION public.persist_studio_journey_stage(
  p_session_id uuid,
  p_submission_key uuid,
  p_stage text,
  p_version text,
  p_consent_version text,
  p_studio_name text,
  p_website text,
  p_area text,
  p_normalized_inputs jsonb,
  p_result_snapshot jsonb
) RETURNS TABLE (submission_id uuid, saved_result jsonb)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  current_session public.studio_journey_sessions%ROWTYPE;
  row_id uuid;
  existing public.public_tool_submissions%ROWTYPE;
  existing_session uuid;
BEGIN
  SELECT * INTO current_session
    FROM public.studio_journey_sessions s
    WHERE s.id = p_session_id AND s.revoked_at IS NULL AND s.expires_at > now()
    FOR UPDATE;
  IF current_session.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='Session not active';
  END IF;
  IF p_stage NOT IN ('growth','revenue','visibility','summary')
    OR p_version IS NULL OR p_version <> '2026-10-unified-journey-v1'
    OR p_consent_version IS DISTINCT FROM current_session.consent_version
    OR jsonb_typeof(p_normalized_inputs) <> 'object'
    OR jsonb_typeof(p_result_snapshot) <> 'object'
    OR p_submission_key IS NULL
    OR p_normalized_inputs->>'step' IS DISTINCT FROM p_stage
    OR p_normalized_inputs->>'calculation_version' IS DISTINCT FROM p_version
    OR p_result_snapshot->>'calculation_version' IS DISTINCT FROM p_version
    OR p_normalized_inputs->>'session_id' IS DISTINCT FROM p_session_id::text
  THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Submission contract violation';
  END IF;

  INSERT INTO public.public_tool_submissions
    (tool_key,tool_version,dataset_version,studio_name,studio_website,area,
     normalized_inputs,result_snapshot,submission_key,quality_status,
     source_type,consent_version,studio_id)
  VALUES
    ('unified_studio_journey_'||p_stage,p_version,NULL,p_studio_name,p_website,p_area,
     p_normalized_inputs,p_result_snapshot,p_submission_key,'unverified_self_report',
     'public_self_report',p_consent_version,NULL)
  ON CONFLICT (submission_key) DO NOTHING
  RETURNING id INTO row_id;

  IF row_id IS NULL THEN
    SELECT * INTO existing FROM public.public_tool_submissions
      WHERE submission_key = p_submission_key FOR UPDATE;
    IF existing.id IS NULL
      OR existing.tool_key IS DISTINCT FROM 'unified_studio_journey_'||p_stage
      OR existing.tool_version IS DISTINCT FROM p_version
      OR existing.consent_version IS DISTINCT FROM p_consent_version
      OR existing.normalized_inputs IS DISTINCT FROM p_normalized_inputs
    THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='Idempotency collision';
    END IF;
    row_id := existing.id;
  END IF;

  SELECT ss.session_id INTO existing_session
    FROM public.studio_journey_steps ss WHERE ss.submission_id = row_id;
  IF existing_session IS NOT NULL AND existing_session <> p_session_id THEN
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='Submission belongs to different session';
  END IF;

  INSERT INTO public.studio_journey_steps (session_id,submission_id,stage)
    VALUES (p_session_id,row_id,p_stage)
    ON CONFLICT (submission_id) DO NOTHING;

  RETURN QUERY SELECT t.id,t.result_snapshot FROM public.public_tool_submissions t WHERE t.id=row_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.persist_studio_journey_stage(uuid,uuid,text,text,text,text,text,text,jsonb,jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.persist_studio_journey_stage(uuid,uuid,text,text,text,text,text,text,jsonb,jsonb)
  TO service_role;

COMMIT;
