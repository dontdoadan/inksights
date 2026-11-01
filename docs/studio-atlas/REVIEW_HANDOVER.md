# Studio Atlas pilot — review handover (2026-11-01)

Branch: feature/studio-atlas-claim-verify-pilot
Status: Preview only; NOT approved for public launch.

## Completed
- Public /studio-atlas React directory and claim/add/enquiry screens.
- Authenticated /atlas workspace for claim status, studio-member inbox and proposed profile updates.
- Four new Supabase tables with Row Level Security and least-privilege grants.
- New rate-limited atlas-enquiry-intake Edge Function; enquiries require an approved public profile.
- Vercel preview build succeeded.
- Database security follow-up removed anonymous grants from claim, draft and enquiry tables.

## Not yet complete
- Reviewer-facing adjudication console and atomic claim approval.
- Verified trading-premises data; no public Atlas profiles published yet.
- Automated studio lead notifications and delivery tracking.
- Portfolio media uploads and moderation.
- Public directory UX/accessibility testing across devices and browsers.
- Privacy notice updates, retention policies, and a full test of account isolation.
- Advertising and sponsored listings (intentionally postponed until real lead demand is demonstrated).

## Reviewer checklist
1. Inspect schema and RLS with an anonymous and authenticated account.
2. Test claim for listed and new studio, with sole-trader support.
3. Confirm human review verifies the physical trading premises independently from the applicant's authority.
4. Ensure approval creates verified canonical membership and history, and rejection never grants permissions.
5. Check that owners can only view their own enquiries.
6. Confirm profile drafts do not instantly change the public directory.
7. Test an enquiry from customer submission to studio notification and response.
8. Verify privacy text, correction/takedown procedure and responsive usability.
9. Validate 20–30 initial physical locations before public indexing.
10. Test existing INKSIGHTS Growth Check, audit payment path, CRM, and reporting for regressions.

## Workflow
Visitor discovers studio -> submits enquiry -> stored privately -> authorised studio inbox.
Studio owner submits claim -> identity, venue and authority review -> membership granted -> edits submitted -> public profile reviewed and published.

## Release gates
Code review -> internal account-level pilot -> verified local-studio pilot -> public launch.
No paid placement should launch before meaningful, measured consumer demand.
