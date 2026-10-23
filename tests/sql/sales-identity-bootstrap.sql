-- Isolated staging fixture; no sensitive production rows are copied.
CREATE TABLE public.visibility_studios (id uuid primary key default gen_random_uuid(),studio_name text NOT NULL);
CREATE TABLE public.studio_candidates (id uuid primary key default gen_random_uuid(),name text NOT NULL);
CREATE TABLE public.audits (id uuid primary key default gen_random_uuid(),studio_id uuid references public.visibility_studios(id));
GRANT SELECT,INSERT,UPDATE ON public.visibility_studios,public.studio_candidates,public.audits TO service_role;

CREATE TABLE public.public_contact_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 source text NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 is_test boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE ON public.public_contact_requests TO service_role;
