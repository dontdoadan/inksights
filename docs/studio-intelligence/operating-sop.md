# Studio Intelligence — operator guide v1.0

## What this system delivers
A private interactive report and matching PDF, generated from one structured input. The public INKSIGHTS website stays separate. The Golden Report is fictional and must never be presented as a case study.

## Where to work
- Reporting app: https://reports.getinksights.co.uk (requires the external domain record described in the release record).
- Sign-in: `/login`; report list: `/`; analyst workspace: `/analyst`.
- Fictional reference: `/golden`; downloadable input example: `/template`.
- Database: existing INKSIGHTS Supabase project. CRM and payments remain in HubSpot and Stripe.

## 1. Prepare the studio input
1. Agree the reporting period using complete calendar months, and agree what counts as an enquiry, a booking, available artist time and an eligible rebooking client.
2. Obtain studio-level monthly aggregates from its ledger, enquiry log, artist diary and available visibility exports. Do not upload individual client identities or treatment records into this report.
3. Download the example input from the analyst workspace. Replace the fictional studio, observations, findings, recommendations and evidence with the studio's data. Set `representative` to false only for real evidence.
4. Record every month in order. Use `null` for unmeasured fields; use 0 only for observed zero. Money is GBP after refunds; it is not profit. Bookings refer to the same enquiry cohort. Do not mix unrelated calendar bookings into the conversion denominator.
5. Give each evidence source a unique short ID, source description, observation date, summary, classification, confidence and limitations. Source references should identify controlled evidence without exposing credentials, personal records or private access URLs.
6. Add findings that state the answer, diagnosis and an alternative explanation. Link them to evidence IDs. Add specific recommendations with owner, target metric and 90-day phase.
7. Set conversion, utilisation and rebooking targets as explicit planning assumptions. The score is a diagnostic index, not an industry rank. Do not invent benchmark values.

The input format is JSON: a structured text form with named fields. The template supplies every required field. Editing the template is data entry; no report page or application code needs to be rebuilt for the next studio. V1 deliberately uses this template instead of a custom import-builder interface.

## 2. Create and inspect a draft
1. Sign in using an existing confirmed INKSIGHTS owner/admin account.
2. Open Analyst workspace. Select an existing studio identity if appropriate, and keep the template studio name identical. Otherwise choose Create a new studio identity. New registry entries remain candidates; this does not declare a business independently verified.
3. Paste the input and choose Validate & create draft. Validation errors identify invalid fields or references.
4. Open the interactive report. Check every section, the monthly chart, evidence links, source dates, unavailable states and limitations.
5. Download the PDF and check its content and page breaks.
6. Save any corrections with a change note. Studio identity, period and representative status are fixed for the engagement; create a new report if these were initially wrong.

## 3. Review, approve and publish
1. Submit for review with a meaningful note.
2. Review evidence, calculations, assumptions, proposed actions, client-safe content and PDF. Return to draft if something needs changing.
3. Tick the approval confirmation and record the review note. V1 allows the same authorised analyst to write and approve; it does not claim independent review.
4. Publish the approved version with a publication note. Publication does not automatically send messages or grant access.
5. The system records the actor, time, action and content hash. Reviewed/approved content is protected; published reports cannot be edited in place.

## 4. Arrange client account access
1. The intended client needs a confirmed account in the existing INKSIGHTS Supabase Auth project. Reuse a verified existing account. For a new client, the authorised operator uses Supabase Authentication → Users → Invite user and the existing INKSIGHTS account-onboarding process. This app does not create accounts or send invitations automatically.
2. Verify the client identity and exact email through your usual onboarding process. A supplied email alone is not proof of ownership.
3. In the published report's Client access panel, enter that account email and choose Grant report access.
4. Share the `/reports/[report-id]` address through the agreed client channel. The address alone provides no access; the client must sign in with the granted account.
5. Have the first real client confirm sign-in, report reading and PDF download before treating delivery as accepted.
6. To remove access, use Revoke report access with the same account email. Revocation applies to future requests even with an existing login session. A PDF already downloaded cannot be remotely removed.

## 5. Corrections and new versions
Choose Create next draft version from the existing report. The next version remains private and must repeat review → approval → publication. Client grants are deliberately not copied automatically. Grant the new version after checking it. The prior published version remains available to its existing grantees unless explicitly revoked; decide whether to retain it as an archive or revoke access after notifying the client.

## 6. Implementation, outcomes and an honest case study
In the published analyst view, expand a recommendation under Implementation & learning. Set not started/in progress/completed/blocked. Record the actual intervention, measured outcome, attribution caveats and learning. These dated notes appear beside the report and in its on-demand PDF; the approved analytical snapshot remains unchanged.

Before calling any improvement an INKSIGHTS result, compare like-for-like cohorts and periods, record changes in artist capacity, spend, seasonality and appointment mix, and explain alternative causes. Obtain the studio's permission before publishing its name, numbers or testimonial. The fictional Golden Report is not evidence of commercial effectiveness.

## 7. Troubleshooting
- No reports: the account has no grant, the report is unpublished, or the wrong account is signed in.
- Invalid input: check the reported field; retain every month and use null for missing measurements.
- Score unavailable: at least one conversion/utilisation/rebooking denominator is missing or zero.
- Report changed: reload before editing; another saved version invalidated the old content hash.
- No confirmed account: complete account onboarding/confirmation before granting access.
- PDF error: retry; the report may be temporarily unavailable. Never make a public copy to bypass access checks.
- Draft already exists: return to the report list and use that draft instead of making competing versions.

## Engineering operations
App source: `apps/studio-intelligence`; independent `npm ci`, `npm test`, `npm run build`. Hosting project: `inksights-studio-intelligence`. Runtime uses the existing public Supabase project URL/publishable key and the signed-in user's session, never a service-role secret. Database authoring lives in `app_private.si_command` behind the public invoker wrapper. RLS enforces published named-client access independently of the UI.

Database additions: `si_report_access`, `si_events`, `si_progress`, narrow command functions and a new-contract-only immutable-version guard/read policy. Existing audit/studio/report tables are reused. Historical manifests retain existing behaviour. To roll back the app, redeploy the last verified reporting release. Do not remove tables containing issued reports. Do not roll back or redeploy the separate public website.

Keep account ownership and permission changes deliberate. The existing Supabase advisory for disabled leaked-password protection is a project-wide authentication hardening item; see the release record for the observed state. It is not fixed by opening any data tables.
