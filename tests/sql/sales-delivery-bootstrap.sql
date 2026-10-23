CREATE TABLE public.report_versions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 audit_id uuid NOT NULL REFERENCES public.audits(id),
 status text NOT NULL DEFAULT 'draft',
 qa_status text NOT NULL DEFAULT 'pending'
);
CREATE TABLE public.si_report_access(
 report_id uuid NOT NULL REFERENCES public.report_versions(id),
 user_id uuid NOT NULL,
 PRIMARY KEY(report_id,user_id)
);
GRANT SELECT,INSERT,UPDATE ON public.report_versions,public.si_report_access TO service_role;
