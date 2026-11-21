# INKSIGHTS Revenue Recovery MVP

## Purpose

Revenue Recovery is an authenticated studio workspace that identifies evidence-backed recovery opportunities in existing client, project and enquiry records. It is an intelligence and action layer; it is not a booking system and does not send communications.

## MVP scope

- CSV imports for clients, multi-session projects and enquiries.
- Browser-side parsing and normalisation; raw uploaded files are not retained.
- Exact-file duplicate prevention using SHA-256.
- Row-level duplicate prevention using a studio/type/dedupe-key unique constraint.
- Deterministic opportunity detection and transparent financial estimates.
- AI-assisted message drafting through the `revenue-recovery-assist` Edge Function.
- Human review, edit and approval before any communication.
- Manual status tracking through contacted, booked and paid.
- Actual recovered revenue is counted only after a user records a paid amount.
- Activity log for imports, analysis, AI drafts, approvals and outcomes.

## Tenant model and access

The product reuses `public.studio_members` and `public.studios`. Every new table carries `studio_id`; RLS checks for an active membership using `auth.uid()`. Owner/admin/member roles can mutate records; viewer roles are read-only. No customer data is shared between studios.

## Database objects

- `recovery_imports`: import metadata and duplicate-file fingerprint.
- `recovery_records`: normalised source rows plus the original mapped fields in JSONB.
- `recovery_opportunities`: findings, estimates, confidence, evidence, message drafts, approval and outcome state.
- `recovery_activities`: append-only audit events.

## CSV templates

The app provides downloadable templates. Supported header aliases are intentionally flexible, but the canonical fields are:

### Clients

`name,email,phone,last_booking_date,average_booking_value_gbp,marketing_consent,do_not_contact`

### Projects

`client_name,email,phone,project_name,status,last_session_date,remaining_sessions,total_sessions,project_value_gbp,next_session_booked,contact_permission,do_not_contact`

### Enquiries

`name,email,phone,enquiry_date,status,quoted_value_gbp,contact_permission,marketing_consent,do_not_contact`

Dates should be ISO format (`YYYY-MM-DD`). Monetary columns are GBP. Consent values should be explicit yes/no values. Import only data the studio is authorised to process. Do not import health-screening, special-category or payment-card data.

## Detection rules (initial defaults)

| Category | Rule | Financial estimate |
| --- | --- | --- |
| Inactive project | Last session at least 45 days ago; remaining sessions > 0; next session not booked; status not completed/cancelled | Explicit remaining value where supplied; otherwise recorded project value multiplied by remaining / total sessions where both are supplied; £0 if the remaining value cannot be derived |
| Unconverted enquiry | At least 3 days old; status not booked/converted/lost/closed/spam | Recorded quoted value; £0 if missing |
| Inactive client | At least 180 days since last booking; explicit marketing consent; no opt-out | Recorded average booking value; £0 if missing |

Priority is a transparent age-based heuristic, not a prediction of recovery probability. Confidence is a rule-based evidence score, not a calibrated statistical probability. These thresholds should be tuned from observed pilot outcomes.

## Communications and compliance controls

- The AI function verifies the caller's Supabase user and active studio membership.
- Only the first name, category, limited project context and evidence summary are sent to the model; email addresses and phone numbers are excluded.
- Inactive-client reactivation is blocked unless explicit marketing consent is recorded and there is no opt-out.
- Enquiry/project drafting is also blocked unless `contact_permission` or marketing consent is explicitly recorded.
- Every generated message is a draft. Approval only records approval; it does not send.
- Studios must confirm a lawful basis, PECR compliance, consent/soft-opt-in conditions and suppression handling before using external communication channels.

## AI configuration

The Edge Function requires the Supabase project secrets:
- `OPENAI_API_KEY`
- Supabase-managed `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

The function uses `gpt-4.1-mini` and returns a JSON subject/message pair. Do not place an OpenAI key in frontend environment variables.

## Release sequence

1. Apply the migration to a dedicated Supabase development branch.
2. Deploy the Edge Function to that branch and configure `OPENAI_API_KEY`.
3. Set Vercel Preview Supabase URL and publishable key to the development branch values.
4. Run build, lint, typecheck, RLS and end-to-end import/approval/outcome tests.
5. Create a pull request and complete review.
6. Only after approval, merge and apply the migration/deploy the function to production; configure production secrets separately.

## Known MVP limitations

- CSV import only; no live booking platform connectors.
- No email, SMS or WhatsApp sending.
- No payment collection or debt chasing.
- Opportunity estimates are based only on source data; missing values are never invented.
- A duplicate source row in a later import is skipped; this MVP does not yet reconcile changed source values against an existing row.
- Existing opportunities are not overwritten on re-analysis, preserving user decisions. A future refresh/reconciliation workflow is required for updated source data.
