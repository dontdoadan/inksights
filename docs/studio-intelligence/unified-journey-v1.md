# INKSIGHTS — Unified Studio Intelligence Journey v1

**Status:** DRAFT — engineering proposal, not approved for production  
**Prepared:** 22 October 2026  
**Target:** `getinksights.co.uk` / `dontdoadan/inksights`  
**Runtime:** TanStack Start on Vercel; Supabase for canonical product intelligence; HubSpot for CRM; Stripe for paid audit checkout.  
**Scope:** Tattoo studio experience first. Other tattoo-sector business models require their own questionnaires and metric dictionaries.

## 1. Decision and success conditions

Build **one journey with four progressively richer modules**:

1. **Studio Growth Check** → identity and representative-period baseline.
2. **Revenue Leakage Simulator** → sensitivity analysis with stated assumptions and capacity bounds.
3. **Visibility Inspector / 72-Hour Watch & Fix** → observed or self-reported journey defects and feasible intervention candidates.
4. **Studio Intelligence Audit** → evidence review, validated commercial diagnosis, 90-day priorities and paid report delivery.

Every module reads from and appends to a shared **studio intelligence profile**. The four modules are NOT four uncoordinated lead captures. Each writes a separately versioned input observation and calculation result with provenance. A studio's current profile is a projection of those immutable observations, not an untraceable overwritten row.

**Release definition of done:**
- Public visitor can complete the four-stage journey without repeating already supplied fields.
- Input is validated server-side, normalised, rate-limited and saved atomically before revealing a personal result.
- Retries with the same idempotency key never create duplicate submissions, studios, contacts or deals.
- Anonymous visitors cannot see or overwrite another studio's private intelligence.
- Every result labels input provenance (`SELF_REPORTED`, `OBSERVED`, `CALCULATED`, `MODELLED`, `VERIFIED`, `HYPOTHESIS`) and calculation version.
- Existing Growth Check, visibility and benchmark tools can contribute records without silently rematching studios on name alone.
- HubSpot contains at most one intended contact/lead path per consenting visitor with deduplication; no simulated demo records are treated as real leads.
- Stripe checkout is only credited as paid after webhook signature and server-side transaction validation; authorised users alone can access paid reports.
- Mobile/desktop automated tests, RLS verification, monitoring and fail-closed submit-to-result tests pass on a protected preview before production.

## 2. What exists in the connected infrastructure

Read-only inspection on 22 October 2026 confirmed:

- **Website repository:** `dontdoadan/inksights` (main), TanStack Start file routes.
- **Hosting:** Vercel project `inksight-main`.
- **Supabase:** project `ukaxsqwnkoqbbsufpzga` (ACTIVE_HEALTHY at inspection).
- **Growth Check:** `src/routes/studio-growth-check.tsx` posts to Edge Function `revenue-audit-v1` which stores `revenue_audit_leads` and `revenue_audits`, emits an integration event and attempts HubSpot sync.
- **Pricing Benchmark:** `src/routes/pricing-benchmark.tsx` already submits through a same-origin proxy; result displays after success.
- **Visibility Scorecard:** same-origin proxy is present at `src/routes/api/public/visibility-scorecard-submit.ts`.
- **Visibility report:** route `src/routes/studio-visibility-report.tsx` and report functions exist.
- **Service-only tool events:** `public.public_tool_submissions` has submission key, version, studio identity hints, normalised inputs, result snapshot, source type, quality and consent version.
- **Canonical studio identity:** `public.studios` and `public.studio_members` already exist; `studios.internal_validation` is not proof that an unclaimed visitor owns the business.
- **Intelligence:** `intelligence_business_profiles`, `intelligence_growth_diagnostics`, `intelligence_calculation_runs`, intelligence evidence, findings, diagnoses, recommendations, interventions and outcomes already exist.
- **Reporting / payment:** `si_report_access`, `si_progress`, `orders`, and Stripe checkout integration exist, but end-to-end payment-to-report verification for this new journey is NOT established here.

**Critical mismatch to resolve:** Existing Growth Check submissions create revenue lead/audit IDs but are not automatically a verified `studios.id`. Existing public tool submissions have a nullable `studio_id`. The feature must maintain a separate temporary submission/session identity until a safe canonical linkage is established.

## 3. Public journey and gating

```text
Visitor opens /studio-intelligence
  → creates temporary, unpredictable journey session
  → enters studio name, town, optional website, artist count, period, enquiry/bookings/capacity figures
  → acknowledges diagnostic-data use (marketing separate)
  → presses Submit and continue
  → server validates, normalises, deduplicates, stores input and run result
  → server sends saved submission ID and an opaque session-bound continuation credential
  → client reveals Stage 1 diagnostic
  → Stage 2 scenario edits create additional versioned saved runs; historic results remain available
  → Stage 3 visibility checks save self-reports; independent scans create separate OBSERVED evidence
  → Stage 4 shows summary, priority and next evidence gaps
  → optional contact capture / paid £395 audit CTA
  → checkout server-side verification → authorised audit workflow/report
```

No custom result should be exposed before the corresponding required write succeeds. In an outage, show a clear retry state and retain the visitor's input locally, never claim a save succeeded when it has not. The standalone proof-of-concept uses browser-local storage for convenience and is **NOT** evidence of central persistence.

## 4. Data model — reuse before expanding

| Concept | Authoritative table/system | Rule |
|---|---|---|
| Unverified public visitor | NEW: journey session table, or safe signed server-side session facility | Random opaque ID + expiry; no trust in caller-supplied `studio_id` |
| Public submitted observation | `public_tool_submissions` | Versioned event, `submission_key` unique, `normalized_inputs`, provenance, result snapshot |
| Canonical verified studio | `studios` | Existing ID or verified identity match; never silently mint/merge by studio name |
| Studio ownership/role | `studio_members` + Supabase Auth | Explicit claim/verification with RLS enforced on private data |
| Business-model profile | `intelligence_business_profiles` | Studio type set to tattoo studio, UK currency/period rules |
| Calculated economics | `intelligence_calculation_runs` | Immutable inputs/outputs, engine version, warnings, quality |
| Growth diagnosis | `intelligence_growth_diagnostics` | Baseline and constraints with confidence and evidence IDs |
| Visibility evidence | Existing visibility provider/website observations | Distinguish measured provider evidence from visitor questionnaire |
| Findings and recommendations | Existing `intelligence_*` | Link to evidence, next step, calculation run and priority |
| CRM contact and opportunity | HubSpot | Contact/deal identity cross-references, consent and lifecycle |
| Payment | Stripe + orders | Webhook-verified paid status, no client-side trust |
| Report access | `si_report_access` / role-bound server endpoint | Time-bound, authorised access; never global public URL |
| Operating audit trail | `integration_events` | Idempotent business events, correlations and replay handling |

**Proposed minimal schema additions (approval required):** `studio_journey_sessions` (id, token_hash, created/expiry, verified_owner_id nullable, lead_ref nullable, consent snapshot, source context), `studio_journey_steps` (session_id, step, submission_id, recorded_at, status), and a secure identity mapping between `revenue_audit_leads` and canonical studio. Do not execute migration before checking existing migration history, indexes and access policies. Prefer a server-owned private schema when appropriate.

## 5. API contract (proposed)

- `POST /api/public/studio-intelligence/session` — start session; request limited by IP-derived hash and anti-bot; reply only with opaque secure session.
- `POST /api/public/studio-intelligence/submit` — versioned per-stage payload; all validation and calculations on server, idempotency key required; transactionally persist observation/run before reply.
- `GET /api/public/studio-intelligence/profile` — returns only safe session-scoped summaries; no contact PII leaks.
- `POST /api/studio-intelligence/claim` — authenticated owner claim with verification/approval; cannot be granted on matching name/URL alone.
- `GET /api/studio-intelligence/history` — authenticated and authorised runs with ownership checks.

**Per-write envelope:** `journey_session_id` (server only), `step_key`, `tool_version`, `calculation_version`, `submission_key`, `period_start`, `period_end`, `normalized_inputs`, `source_type`, `source_reference`, `consent_version`, `quality_status`.

**Validation:** accept strict expected keys, numeric limits, complete monetary units (GBP pounds at UI, pence in canonical finances), period consistency, `bookings <= enquiries`, `booked_hours <= available_hours`, nonnegative rates ≤100%, safe URL protocols. Sanitise outputs; never interpolate visitor inputs into HTML. Use rate-limit and bot controls, upper payload bound and origin checks. Fetch provider URLs through approved allowlists to avoid SSRF.

## 6. Financial mathematics and evidence discipline

Per representative month:

- `enquiry_conversion = confirmed_bookings / enquiries` (if enquiries >0).
- `capacity_utilisation = booked_artist_hours / available_artist_hours` (if hours >0).
- `booked_value_baseline = confirmed_bookings × average_booking_value`. This may NOT reconcile with cash revenue for the same month (timing, refunds, tax, deposits, uncompleted projects). Flag divergences; do not coerce them to match.
- `extra_booking_demand = max(0, enquiries × target_conversion - confirmed_bookings)`.
- `remaining_booking_slots = max(0, (available_hours - booked_hours) / average_hours_per_booking)`.
- `extra_bookings = min(extra_booking_demand, remaining_booking_slots)`.
- `illustrative_future_booked_value = (bookings + extra_bookings) × scenario_average_booking_value`.
- `scenario_difference = illustrative_future_booked_value - booked_value_baseline`.

Assumptions include stable enquiries and session length, customer price acceptance, no cancellations, delivery costs or competing capacity constraints. This is **MODELLED booking value**, never verified recovered income, contribution or profit. Do not add conversion, capacity and retention scenarios together: they overlap. If time horizons differ, do not compare without normalisation. Show assumptions and version next to each calculation.

**Constraint prioritisation** must use data quality, estimated impact, feasibility and confidence. Heuristic gap scores are triage signals, not verified industry percentile rankings.

## 7. Conversion architecture

- Lead magnet = free saved Studio Growth Check, concise results and one meaningful question.
- Engagement = adjust one scenario; show sensitivity and evidence gaps.
- Low-friction paid service = **72-Hour Visibility Watch & Fix**, when a directly inspectable visibility defect exists. Pricing and eligibility must come from the approved product register.
- Diagnostic purchase = **£395 Studio Intelligence Audit** with scope/delivery terms and verified payment.
- Delivery = evidence intake → diagnosis → 90-day intervention plan → review call → baseline and measurable first action.
- Longer-term = Primary Constraint Programme → Ongoing Intelligence Monitoring, sold when measurement and benefit justify it.

Do not lock all four stages unnecessarily behind email capture: request contact details when value and purpose are clear. Separate mandatory data-processing acknowledgement from optional marketing consent; minimise stored personal data.

## 8. Interaction design

- Use production visual baseline: `docs/brand/CURRENT.md`, `docs/brand/brand-manifest.json`, approved logo from `/brand/logo-v3/`, Poppins, dark intelligence canvas and precise signal accent.
- One progress rail across four stages; preserve the sidebar/profile summary.
- All metrics, graphs and priority states recompute from shared inputs; no contradictory numbers.
- Values should be labelled `self-reported`, `modelled`, `observed` or `verified` in-place.
- Mobile layout, keyboard focus, labelled inputs, ARIA status, reduced-motion support, no fixed-height clipping.
- The profile should display **profile completeness** separate from **evidence confidence**; complete self-report is not verification.
- Primary CTA at each stage moves to the next value-bearing action; optional paid CTA after visible value, no coercive hidden fees.

## 9. Acceptance and security tests

1. Anonymous user A cannot access B's profile, submissions, results or session ID.
2. Unknown/unclaimed studio name matching existing canonical record does not create ownership or leak intelligence.
3. Repeat POST with same idempotency key returns same saved result; no duplicate events or HubSpot sync.
4. Changing input produces a new versioned run and preserves earlier history.
5. Server failure, duplicate submission, timeout and retry never unlock unsaved personalised results.
6. Negative/NaN/infinite inputs, XSS strings, invalid URL schemes, huge payload, impossible rates/hours are rejected.
7. Moving target sliders never adds more bookings than capacity or available enquiries permit.
8. Prices/rates/revenues are consistently reported in pounds with stored pence where required; scenario cash claims are avoided.
9. Visibility self-report is never silently promoted to provider-verified search ranking or measured traffic.
10. Owner claims, role changes, report access, paid reports and webhooks satisfy least-privilege RLS, server-side checks and signature verification.
11. Screens at 375px, 768px, 1440px have no horizontal overflow, overlap or truncated controls.
12. Accessibility: correct labels, focus visible, keyboard traversal, no reduced-motion violation, status alerts.
13. Analytics: visited, started, completed, stage exit, paid audit click, checkout completed and lead sync each have identifiable correlation IDs, lawful analytics consent and deduplication.
14. All new migrations and frontend routes pass CI, lint, typecheck, previews, security advisor and manual end-to-end trace.

## 10. Implementation sequence and gates

| Gate | Action | Finished when |
|---|---|---|
| A — architecture | Confirm data ownership and identity/journey security design | One reviewed session → submission → studio mapping, migration and API contract |
| B — feature | Create routed production-style wizard sharing typed client state | 4 steps function with real validation and responsive UI |
| C — persistence | Approve and apply minimal safe migration and endpoint | Idempotent server-side saved step before results |
| D — identity | Add safe claim/auth and canonical linkage, reconciled with existing leads | No false studio matches, role/consent correct |
| E — CRM/payment | Connect HubSpot lead/deal and approved Stripe audit checkout | Verified checkout → deal → onboarding without duplicate records |
| F — quality | Run full mobile/desktop, negative-case, RLS and payment tests | All DoD checks pass on protected preview |
| G — production | Obtain explicit production approval then merge/deploy | Production smoke tests + monitoring + rollback plan verified |

**Current completion:** interactive browser-only prototype authored and JavaScript syntax checked; production read-only inspection completed. NOT complete: deployed website route, server session, durable profile writes, identity reconciliation, full E2E tests, CRM and payment linkage, production rollout. No production schema, credentials or access policies were changed.