# INKCARE Client Zero Baseline

Status date: 1 August 2026

## Purpose

INKCARE is now operated as Client Zero. The internal rule is simple:

> INKCARE should not sell a capability as proven until the same capability has either been validated internally or explicitly labelled as requiring real-studio validation.

The operating sequence is:

**Baseline → Diagnose → Correct → Validate → Measure → Monitor → Improve**

## Truth-first baseline

The database has been cleaned so sample, internal-test and unverified records cannot be confused with verified client proof.

Current verified commercial baseline:

- Verified external studios: **0**
- Verified external leads: **0**
- Public contact requests: **0**
- HubSpot deals: **0**
- Verified external revenue events: **0**
- Technical validation: **11/11 checks passed (100%)**
- Search measurement: **blocked**

Historical `VK69 Studio`, `INKCARE Demo Studio` and QA records are explicitly classified as **sample** and may not be used as client proof, testimonials or uplift evidence.

Historical and Client Zero Growth Check records are explicitly classified as **internal_test** and excluded from production HubSpot automation.

## Current maturity

| Capability | Current state | Evidence level |
|---|---|---|
| Supabase core data model | Working | INKCARE validated |
| Stripe reconciliation | Working, zero mismatches | INKCARE validated |
| Sample checkout/onboarding | Working | Sample validated |
| Command Centre | Working, truth-first classification added | INKCARE validated |
| Social publishing controls | 10 dry-run validations, zero live attempts | Sample validated |
| HubSpot product catalogue | Four current paid components aligned | INKCARE validated |
| Growth Check routing | Current offer matrix validated | INKCARE validated |
| Qualification booking request | Isolated Client Zero flow passed | INKCARE validated |
| HubSpot lead → company → deal journey | Not yet safely tested end-to-end | Not validated |
| Search Console reporting | Awaiting authorization | Blocked |
| SE Ranking project access | 403 No access on both known project IDs | Blocked |
| Production website release parity | Failed: current customer routes return 404 | Critical blocker |
| Visibility Watch paid-delivery QA | Failed Client Zero QA | Not ready to sell |
| Genuine inbound acquisition | No verified evidence yet | Not validated |
| Revenue uplift | No verified external result | Not validated |

## Client Zero diagnosis

The main constraint is not technical infrastructure. It is production deployment, search measurement and market validation.

INKCARE currently has substantially more delivery infrastructure than verified external demand.

### Production website

External HTTP smoke testing from Supabase confirmed:

- `https://getinkcare.co.uk/` → **200**
- `https://getinkcare.co.uk/terms` → **200**
- `https://getinkcare.co.uk/support` → **404**
- `https://getinkcare.co.uk/studio-growth-check` → **404**
- `https://getinkcare.co.uk/offers/72-hour-visibility-fix` → **404**
- `https://getinkcare.co.uk/robots.txt` → **200**
- `https://getinkcare.co.uk/sitemap.xml` → **200**

The live domain is therefore serving an older static site rather than the current TanStack Start application in GitHub.

Additional evidence:

- live homepage canonical points to `https://www.getinkcare.co.uk/`;
- current GitHub application uses `https://getinkcare.co.uk` as the canonical host;
- live sitemap still contains `.html` routes dated 22 July 2026;
- current GitHub-generated sitemap uses modern routes and a later build date;
- live homepage does not contain the current £249 Visibility Fix or Studio Growth Check positioning.

This is currently the single most important customer-facing blocker.

### Search visibility

External search sampling did not surface `getinkcare.co.uk` for exact-domain/brand-oriented tattoo-studio queries. This is directional evidence only because first-party Search Console data is unavailable.

Known blockers:

- GSC Wizard returns `payment_required`.
- Internal `search-console-sync` exists and the Search Console property is registered as `sc-domain:getinkcare.co.uk`, but its database status is `awaiting_authorization`, `credentials_required=true`, and it has never completed a sync.
- No Google Search Console credential names exist in Supabase Vault.
- Both known SE Ranking project IDs return HTTP 403 `No access`.

Until an authoritative search data path is restored, INKCARE should not represent Visibility Watch as internally proven.

### Funnel evidence and attribution

Historical funnel events exist, but many old page-view records contain blank source/medium/campaign metadata.

The `growth-funnel-event` collector was upgraded and validated. Future events now derive or record:

- UTM source / medium / campaign
- UTM content / term
- referral domain
- Facebook click ID presence
- Google click ID presence
- Microsoft click ID presence
- likely-bot status
- traffic classification

Internal validation events use `inkcare_test=1` and are labelled `internal_test`.

A Client Zero attribution request returned HTTP 200 and stored source, medium, campaign, referrer and internal-test classification correctly.

### Growth Check commercial routing

The deployed Growth Check backend previously contained retired products and old prices. This was corrected before any real studio was used for Client Zero testing.

The current test-isolated routing now returns only current commercial destinations:

| Scenario | Current route |
|---|---|
| Focused visibility problem | £249 72-Hour Studio Visibility Fix |
| Reputation/review monitoring problem | £99/month Visibility Watch |
| Enquiry, diary, no-show or rebooking problem | Booking & Retention Engine — scoped quote |
| Owner overload / larger implementation problem | Founding Studio Pilot — £1,500 setup + £750/month for 3 months |
| Several material revenue leaks | Revenue Audit — scoped quote |
| Low-intent / low-readiness lead | Free action plan |

Five route-matrix scenarios passed, and a separate visibility scenario passed. No retired offer or old price surfaced.

Test submissions:

- are stored as `internal_test`;
- remain archived rather than entering the live sales pipeline;
- do not create HubSpot sync jobs;
- do not create HubSpot contacts.

A direct HubSpot search confirmed zero Client Zero contacts were created.

### Qualification booking request

The booking request workflow contained a status-constraint defect: it attempted to use `booking_requested` before that lead status was allowed by the database.

The constraint and Edge Function were corrected. The workflow now:

- verifies the assessment belongs to the lead;
- inherits the lead's data classification;
- preserves archived state for internal tests;
- uses `booking_requested` only for real qualified leads;
- records the request without creating test automation.

The Client Zero booking test returned HTTP 200, created an `internal_test` booking request, kept the lead archived and created zero automation jobs.

### Visibility Watch Client Zero test

The standalone Visibility Watch page was found to contain stale copy: London-only positioning and a statement that checkout was paused.

That existing page has been updated to the current UK-wide £99/month offer and active checkout, with deliverables aligned to the canonical product definition.

However, the **service itself failed Client Zero paid-delivery QA** because the primary monitoring data is unavailable and production website parity is broken.

A formal internal report run was recorded with:

- no invented visibility score;
- `status=failed`;
- `qa_status=failed`;
- explicit production-route and search-measurement blockers;
- a verdict that INKCARE would **not currently pay £99** for the deliverable in its present state.

Visibility Watch should therefore remain technically available but **not actively sold as a proven monitoring service until its Client Zero QA passes**.

## Client Zero work queue

- `CZ-001` — Restore first-party search measurement for getinkcare.co.uk — **blocked**
- `CZ-002` — Verify production deployment matches GitHub main and all public routes resolve — **blocked / failed current smoke test**
- `CZ-003` — Run full INKCARE 72-Hour Visibility Fix baseline and record three priority corrections — **done**
- `CZ-004` — Validate website → Growth Check → HubSpot → Stripe → onboarding → Command Centre journey — **partially validated; blocked by production and full CRM test**
- `CZ-005` — Produce first internal Visibility Watch report and judge whether it is worth £99 — **done; result failed QA / not ready**
- `CZ-006` — Resolve or formally retire stale n8n execution errors — **outstanding**

## Current three highest-priority corrections

### 1. Publish the current application to production

This is the highest priority because a prospective studio cannot currently access the current Growth Check or £249 offer route on the live domain.

Acceptance criteria:

- Homepage resolves publicly from the current application.
- `/support`, `/terms`, `/studio-growth-check`, `/offers/72-hour-visibility-fix`, `robots.txt` and `sitemap.xml` all resolve from production.
- Canonical host is consistent.
- No public route required for checkout or support returns 404.
- Production revision is traceable to the approved GitHub source.

### 2. Restore measurable search visibility

Until first-party search data is available, INKCARE cannot credibly claim to operate a mature visibility-monitoring process on itself.

Acceptance criteria:

- Search Console property is readable by an approved INKCARE integration.
- Queries, pages, clicks, impressions and average position enter Supabase.
- Command Centre SEO metrics populate from real data.
- Search sync has a successful timestamp and no authorisation alert.

### 3. Complete the acquisition-to-delivery journey

The backend Growth Check and booking-request sections now pass isolated Client Zero tests. The remaining journey must be validated after production is aligned.

Acceptance criteria:

1. Live website source is current.
2. Growth Check submits from production.
3. Lead and assessment are stored with correct classification.
4. HubSpot contact/company/deal handling is proven without contaminating production reporting.
5. Correct current offer is selected.
6. Stripe checkout/payment path is validated safely.
7. Onboarding completes in the isolated test environment.
8. Command Centre receives the evidence.
9. All test records remain clearly classified.
10. No manual workaround is undocumented.

## Release rule before the first paying studio

INKCARE can directly approach studios once:

- the £249 offer and checkout work from the **live production website**;
- production public routes are verified;
- the exact £249 delivery checklist is proven;
- test and sample data are excluded from claims;
- known external blockers are disclosed rather than hidden;
- the first studio can be delivered without improvising core process steps.

Visibility Watch has a stricter additional gate: the Client Zero monthly monitoring report must pass QA and be useful enough that INKCARE itself would pay £99 for it.

Client Zero is not a substitute for a tattoo-studio case study. It proves that the operating machine works before the first studio is asked to trust it.