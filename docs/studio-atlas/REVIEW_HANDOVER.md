# Studio Atlas — technical review handover
Date: 2026-11-01 · Branch: `feature/studio-atlas-claim-verify-pilot` · [Draft PR #156](https://github.com/dontdoadan/inksights/pull/156)

**Review status:** Internal technical preview ready for code review, not a customer-ready or production-launch release. The current map uses stylised illustrative cartography and remains subject to design QA.

## Connected systems
- Production repository: `dontdoadan/inksights` — work isolated to feature branch.
- Preview: existing `inksight-main` Vercel project, SSO protection may apply.
- Data: existing Supabase UK project `ukaxsqwnkoqbbsufpzga`; no separate database.
- Identity: existing `studios` (audit canonical) and `visibility_studios` (member/verification canonical) require explicit, evidence-reviewed `atlas_studio_links`; no fuzzy name-based linking.

## Delivered and deployed backend
1. Tables: `atlas_profiles`, `atlas_claim_requests`, `atlas_profile_drafts`, `atlas_customer_enquiries`, `atlas_studio_links`.
2. Applied versioned migrations:
   - `20261101184746_studio_atlas_claim_verify_pilot.sql`
   - `20261101184852_harden_atlas_public_role_privileges.sql`
   - `20261101185347_bridge_atlas_canonical_and_visibility_studio_identities.sql`
   - `20261101185541_atomic_atlas_claim_review_service_only.sql`
   - `20261101190028_allow_service_only_atlas_private_reviewer_access.sql`
3. `atlas-enquiry-intake` Edge Function: field validation, published-premises check, rate limiting, consent storage, private enquiry write. Does **not** send a studio email.
4. `atlas-review-gateway` Edge Function: authenticated admin check, queue and review, calls service-only atomic reviewer RPC. Approval grants member access, creates verification event and an unpublished draft; it does **not** verify or publish a physical venue.
5. Privilege tests: anonymous claim/draft/enquiry reads and inserts denied. Service-only reviewer RPC denies anon and authenticated execution.
6. `atlas_publication_reviews` audit table and time-bounded, owner-authorised public location verification (12-month expiry). `atlas-enquiry-intake` rejects expired public records.

## UI routes implemented on branch
- `/studio-atlas` — illustrated map-first directory, verified published records only; claim/add and enquiry workflows.
- `/atlas` — authenticated member workspace, claim progress, member-owned enquiry inbox and proposed profile changes.
- `/atlas-review` — administrator evidence/decision review console.
- `/atlas-publication` — location publication, suspension and studio profile draft moderation with independent reviewer evidence.
- `/privacy` — Studio Atlas-specific collection and customer-to-studio sharing language proposed in branch.

## Visual journey
```text
  Public visitor                  Studio owner                        INKSIGHTS reviewer
       |                               |                                      |
  Verified listing ---------> [Claim / add request] -------> [Check premises and authority]
       |                               |                                      |
  Customer enquiry                   Pending <-------------- Approve / more evidence / reject
       |                               |                                      |
  Stored privately              Studio membership                Audit event + identity links
       |                               |                                      |
  Owner-only inbox <------------ Verified workspace --------> Submit profile draft for review
```

## Release blockers (do not call this production-ready)
- No independently verified trading-premises records populated in Atlas; 349 research candidates do not equal operating, verified premises. The publication reviewer workflow is implemented but needs real verified source records.
- A real studio profile cannot receive customer enquiries until premises verified and published; no safe bulk publication.
- No guaranteed email or other external owner notification and delivery tracking; current visitor message states recording only.
- No image/artist portfolio upload, content moderation, advertising or paid placements.
- Human tests of claim approval, sole trader, competing duplicate claims, dispute, revocation and two-account cross-tenant restrictions still required.
- Browser-based desktop/mobile visual, accessibility and click-through QA not completed.
- Venue verification expiry is implemented (12 months); scheduling re-verification, appeals/takedown, retention schedule and clear owner service-level agreements still need work.
- Confirm legal/privacy copy with the production privacy reviewer.
- Regressions to current INKSIGHTS Growth Check, £395 checkout, CRM, website/email/reporting not yet browser-tested.

## Mandatory go-live walkthrough
1. Independently validate one physical tattoo premises and its manager.
2. Create a test account and submit `Claim`; verify it is pending with no editing rights.
3. Review account via `/atlas-review`; verify a single atomic member/identity/verif event.
4. Verify owner can edit one studio, and cannot read any other studio's lead.
5. Independently verify premises address and coordinates. Use `/atlas-publication` to log the evidence and confirm owner authorisation before publishing; reject expired or disputed premises.
6. Submit a test visitor enquiry and ensure only the selected studio can see it. **Before public pilot, implement notification delivery and verify receipt.**
7. Test negative paths: anonymous data access, missing consent, spam, repeated rate-limited requests, disputed claim, revoked member.
8. Complete responsive/a11y tests and scan for production regressions.
9. Curate initial 20–30 true trading premises and offer verified owners to claim.
10. Approve merger and production release separately from technical preview acceptance.

## Product scope boundary
Ad sales must wait until consumer traffic, enquiries and attributable lead delivery are demonstrated. INKSIGHTS' £395 Audit conversion path remains business P0.
