CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.visibility_studios
  ADD COLUMN IF NOT EXISTS canonical_status text NOT NULL DEFAULT 'candidate' CHECK (canonical_status IN ('candidate','observed','verified','claimed','inactive','disputed')),
  ADD COLUMN IF NOT EXISTS legal_entity_type text CHECK (legal_entity_type IS NULL OR legal_entity_type IN ('limited_company','llp','sole_trader','partnership','unknown')),
  ADD COLUMN IF NOT EXISTS companies_house_number text,
  ADD COLUMN IF NOT EXISTS normalized_name text,
  ADD COLUMN IF NOT EXISTS normalized_postcode text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS location geography(POINT,4326),
  ADD COLUMN IF NOT EXISTS identity_confidence numeric NOT NULL DEFAULT 0 CHECK (identity_confidence >= 0 AND identity_confidence <= 1),
  ADD COLUMN IF NOT EXISTS first_observed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_observed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_review_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_visibility_studios_location_gist ON public.visibility_studios USING gist (location);
CREATE INDEX IF NOT EXISTS idx_visibility_studios_postcode_norm ON public.visibility_studios (normalized_postcode);
CREATE INDEX IF NOT EXISTS idx_visibility_studios_company_number ON public.visibility_studios (companies_house_number);
CREATE INDEX IF NOT EXISTS idx_visibility_studios_canonical_status ON public.visibility_studios (canonical_status);
CREATE INDEX IF NOT EXISTS idx_visibility_studios_name_trgm ON public.visibility_studios USING gin (normalized_name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS public.studio_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_key text NOT NULL UNIQUE, source_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('registry','council','association','directory','website','social','owner_submitted','open_data','other')),
  access_method text NOT NULL CHECK (access_method IN ('api','download','web_page','manual','submission')),
  terms_url text, permitted_for_commercial_use boolean, notes text, active boolean NOT NULL DEFAULT true,
  refresh_interval_days integer NOT NULL DEFAULT 90 CHECK (refresh_interval_days > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.studio_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.studio_sources(id), source_record_key text, source_url text,
  observed_at timestamptz NOT NULL DEFAULT now(), name text, normalized_name text, address text, postcode text, normalized_postcode text,
  town text, region text, phone text, website_url text, instagram_handle text, companies_house_number text,
  legal_entity_type text CHECK (legal_entity_type IS NULL OR legal_entity_type IN ('limited_company','llp','sole_trader','partnership','unknown')),
  latitude double precision, longitude double precision, location geography(POINT,4326), payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  identity_status text NOT NULL DEFAULT 'unresolved' CHECK (identity_status IN ('unresolved','possible_match','matched','rejected','duplicate')),
  matched_studio_id uuid REFERENCES public.visibility_studios(id), match_confidence numeric CHECK (match_confidence IS NULL OR (match_confidence >= 0 AND match_confidence <= 1)),
  reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, source_record_key)
);
CREATE INDEX IF NOT EXISTS idx_studio_candidates_postcode ON public.studio_candidates (normalized_postcode);
CREATE INDEX IF NOT EXISTS idx_studio_candidates_name_trgm ON public.studio_candidates USING gin (normalized_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_studio_candidates_location_gist ON public.studio_candidates USING gist (location);
CREATE INDEX IF NOT EXISTS idx_studio_candidates_status ON public.studio_candidates (identity_status);
CREATE INDEX IF NOT EXISTS idx_studio_candidates_matched ON public.studio_candidates (matched_studio_id);

CREATE TABLE IF NOT EXISTS public.studio_source_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), studio_id uuid REFERENCES public.visibility_studios(id), candidate_id uuid REFERENCES public.studio_candidates(id),
  source_id uuid NOT NULL REFERENCES public.studio_sources(id), observed_at timestamptz NOT NULL DEFAULT now(),
  observation_type text NOT NULL CHECK (observation_type IN ('identity','location','contact','website','capability','status','licensing','corporate','other')),
  field_name text, observed_value jsonb NOT NULL DEFAULT '{}'::jsonb, source_url text, source_record_key text, content_hash text,
  confidence numeric CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)), raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (studio_id IS NOT NULL OR candidate_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_studio_source_obs_studio ON public.studio_source_observations (studio_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_source_obs_candidate ON public.studio_source_observations (candidate_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_source_obs_source ON public.studio_source_observations (source_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS public.studio_identity_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id uuid NOT NULL REFERENCES public.studio_candidates(id), studio_id uuid NOT NULL REFERENCES public.visibility_studios(id),
  match_method text NOT NULL CHECK (match_method IN ('exact_company_number','exact_website','exact_postcode_name','fuzzy_name_postcode','fuzzy_address','manual_review')),
  match_score numeric NOT NULL CHECK (match_score >= 0 AND match_score <= 1), evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','rejected','superseded')), reviewed_by uuid, reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_identity_matches_candidate ON public.studio_identity_matches (candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_studio_identity_matches_studio ON public.studio_identity_matches (studio_id, status);

CREATE TABLE IF NOT EXISTS public.studio_verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), studio_id uuid NOT NULL REFERENCES public.visibility_studios(id),
  verification_type text NOT NULL CHECK (verification_type IN ('source_crosscheck','company_registry','website','owner_email','owner_claim','document','manual_review','licensing','other')),
  status text NOT NULL CHECK (status IN ('passed','failed','pending','expired')), source_id uuid REFERENCES public.studio_sources(id), evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)), verified_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, reviewer_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_verification_events_studio ON public.studio_verification_events (studio_id, verified_at DESC);

CREATE TABLE IF NOT EXISTS public.studio_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), studio_id uuid NOT NULL REFERENCES public.visibility_studios(id),
  alias_type text NOT NULL CHECK (alias_type IN ('trading_name','legal_name','former_name','domain','social_handle','source_name','other')),
  alias_value text NOT NULL, normalized_value text NOT NULL, source_id uuid REFERENCES public.studio_sources(id),
  first_observed_at timestamptz NOT NULL DEFAULT now(), last_observed_at timestamptz NOT NULL DEFAULT now(), active boolean NOT NULL DEFAULT true,
  UNIQUE (studio_id, alias_type, normalized_value)
);
CREATE INDEX IF NOT EXISTS idx_studio_aliases_norm ON public.studio_aliases (normalized_value);

CREATE TABLE IF NOT EXISTS public.studio_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), studio_id uuid NOT NULL REFERENCES public.visibility_studios(id), source_id uuid REFERENCES public.studio_sources(id),
  detected_at timestamptz NOT NULL DEFAULT now(),
  change_type text NOT NULL CHECK (change_type IN ('new','updated','moved','renamed','website_changed','closed','reopened','capability_changed','ownership_changed','verification_expired','other')),
  field_name text, previous_value jsonb, new_value jsonb, evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','reviewed','accepted','rejected')), reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_change_events_studio ON public.studio_change_events (studio_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_change_events_status ON public.studio_change_events (status, detected_at DESC);

ALTER TABLE public.studio_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_source_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_identity_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_change_events ENABLE ROW LEVEL SECURITY;

INSERT INTO public.studio_sources (source_key, source_name, source_type, access_method, permitted_for_commercial_use, notes, refresh_interval_days) VALUES
 ('companies_house','Companies House','registry','api',true,'Corporate identity/reference source; does not by itself prove a trading studio exists at the current location.',90),
 ('owner_submission','Studio owner submission','owner_submitted','submission',true,'First-party studio-submitted source; subject to claim/verification workflow.',180),
 ('studio_website','Studio website','website','web_page',true,'Public web evidence; respect robots.txt and site terms.',30),
 ('open_geodata','Open geographic data','open_data','download',true,'Geographic discovery/reference layer; retain source attribution and licence metadata.',90)
ON CONFLICT (source_key) DO NOTHING;

COMMENT ON TABLE public.studio_candidates IS 'Unresolved studio-universe candidates; never treated as canonical studio entities.';
COMMENT ON TABLE public.studio_source_observations IS 'Source observations supporting studio identity, attributes, status and provenance.';
COMMENT ON TABLE public.studio_identity_matches IS 'Evidence-backed candidate-to-canonical-studio matching decisions.';
COMMENT ON TABLE public.studio_verification_events IS 'Time-bound verification events; verification is evidence, not a permanent boolean.';
COMMENT ON TABLE public.studio_change_events IS 'Detected changes requiring review and/or canonical studio updates.';