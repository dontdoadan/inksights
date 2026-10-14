# INKSIGHTS Studio Intelligence System Specification v1.0

Status: implementation specification · 7 October 2026

## Product and Definition of Done
Deliver the £395 Studio Intelligence Audit through one reusable system: structured aggregate input → analyst review/approval → secure named-client HTML report → secondary branded PDF. One representative studio must complete the whole journey in production. No live analytics, chat, dashboard builders, broad integrations or Watch platform. Missing measurements and fictional data are labelled honestly. Completion requires verified production behaviour, not only a build or preview.

## Reconciliation
GitHub `dontdoadan/inksights` inspected at `4fee8fa`. Existing public website is TanStack Start on Vercel `inksight-main`. Preserve all existing routes and commercial integrations. September local checkout contains unfinished changes; implementation uses a fresh checkout. New Next.js/TypeScript app lives at `apps/studio-intelligence`, builds independently and uses a separate Vercel project. Official production logo-v3 variants and Poppins are reused. Current production styles override historical brand guides.

Supabase `ukaxsqwnkoqbbsufpzga` owns intelligence. Reuse `studios`, `audits` and `report_versions`; persist the delivery contract in `report_versions.manifest`. Historical manifests retain existing renderer. `studio_members` references `visibility_studios`; a verified foreign key also links `studios.id` to that registry, preserving shared identity. Add explicit per-report access grants so studio-wide membership does not expose unapproved or unshared versions. Existing owner/admin users in `platform_admins` manage authoring. Restrict new-contract report reads to admins or explicitly granted clients on published versions. HubSpot remains CRM authority; Stripe remains payment authority. Neither becomes an intelligence datastore; report creation has no new third-party dependency.

## Journey, roles, lifecycle and versioning
Analyst signs in → enters validated JSON using a downloadable template → reviews generated report and evidence → edits draft → submits for review → records review note and confirms approval → publishes → grants an existing named auth user access. Client signs in → sees granted published reports → explores evidence/actions → downloads PDF. Do not automatically email anyone.

Reuse states: `draft` → `qa` (Review) → `client_ready` (Approved) → `published`. Review can return to draft with a reason. Approved/published content is immutable; corrections clone to the next numbered draft. State changes log actor/time/note. Report access is separately revocable, and revocation applies to future requests. PDFs already downloaded cannot be recalled. V1 owner/admin may perform both author and reviewer roles; separate-person approval is a future extension, not claimed here.

## Input and report data contract
Version `studio-intelligence/1.0`. Studio name/location; representative flag; period dates; GBP currency; ordered monthly observations; evidence; findings; recommendations; optional competitor observations; limitations and planning targets. Aggregate input only, no personal client records. Monthly fields: revenue after refunds, completed appointments, enquiries, cohort bookings, available/booked artist hours, eligible/rebooked clients, search views/actions. Null means unavailable; zero means observed zero. Reject negative values, invalid dates, duplicates, unknown fields, inconsistent subsets, broken evidence links and excessive payload size. Months must be unique, ordered and inside the report period.

Evidence: stable ID, title, source reference, observed date, summary, limitations, classification VERIFIED/OBSERVED/CALCULATED/MODELLED/HYPOTHESIS and confidence HIGH/MEDIUM/LOW. Never embed private credentials, personal records or signed source links. Findings have IDs, category, answer, diagnosis/explanation, alternative explanation, materiality and evidence references. Recommendations link findings and include action, owner, target metric, phase, confidence and ranking inputs. Manifest records input, derived metrics, calculation version and generation time; database stores its hash.

## Metric catalogue
| Metric | Formula | Unit / caveat |
|---|---|---|
| Net revenue | Sum revenue after refunds | GBP; not profit |
| Completed appointments | Sum completed | Count |
| Average appointment value | Revenue / completed | GBP; not a price list |
| Enquiry conversion | Cohort bookings / enquiries × 100 | Percent; same cohort required |
| Utilisation | Booked / available artist hours × 100 | Percent; exclude blocked time |
| Rebooking | Rebooked / eligible clients × 100 | Percent; not lifetime retention |
| Search action rate | Actions / views × 100 | Percent; not unique leads |
| Revenue per available hour | Revenue / available hours | GBP/hour |

Missing component or zero denominator yields unavailable with a reason. Missing months prevent a complete-period total. Show formulas, period, evidence and lowest supporting confidence. Do not silently sum incomplete periods or annualise short samples.

## Score, confidence and opportunity ranking
Studio Intelligence Score is a diagnostic planning index, not an industry benchmark. Conversion, utilisation and rebooking each have a supplied analyst-agreed target. Dimension score = min(100, actual/target × 100); three equal weights. Total requires all dimensions measurable and supported; otherwise show insufficient evidence and coverage. Display targets, raw values, weights and confidence. Confidence reflects evidence quality, not statistical certainty. Never use fictional industry norms.

Opportunity rank = impact (1–5) × confidence factor (HIGH 1, MEDIUM .65, LOW .35) × urgency (1–3) / effort (1–5). Show factors and result. Modelled money ranges require a stated period and assumptions, and are not guaranteed or added across overlapping opportunities.

## Intelligence methodology
Observation → Normalised Data → Metric → Evidence → Finding → Diagnosis → Opportunity → Recommendation → Intervention → Outcome → Attribution → Learning. Evidence and observations preserve source/date. Normalisation validates units and cohorts. Metrics are deterministic and versioned. Analyst findings/diagnoses are explicitly judgements with alternatives. Ranked opportunities become owned recommendations. Implementation status, outcome, attribution caveats and learning are recorded separately from the immutable approved snapshot. No causal success claim without an appropriate comparison design.

## Report sections and interaction
Answer → Evidence → Explanation → Action. Dark ink terminal with teal signal, official luminous logo, Poppins and spacious light editorial action section. Desktop contents rail; mobile navigation; visible keyboard focus; reduced-motion support. Charts expose the same values in an accessible table.

1. Executive Intelligence: studio, period/version, main answer, priorities and limitations.
2. Studio Intelligence Score: targets, dimensions, confidence, coverage.
3. Commercial Performance: interactive monthly revenue/appointment chart and table.
4. Demand/Visibility: views, actions, rate and limits.
5. Enquiry & Booking Funnel: observed counts and conversion.
6. Capacity/Utilisation: booked/available hours and unused capacity.
7. Retention/Rebooking: eligible/rebooked counts and scope limits.
8. Pricing/Revenue: appointment value and revenue/hour; no unsupported pricing advice.
9. Competitive Position: dated supplied observations or explicit missing state.
10. Findings: answer, evidence links, diagnosis, alternatives, confidence/severity.
11. Opportunities: ranked actions with transparent factors.
12. Recommendations: action, owner, target and confidence.
13. 90-Day Plan: days 1–30, 31–60, 61–90 and implementation status.
14. Evidence: searchable source/date/classification/confidence register.
15. Methodology: formulas, index, full learning chain and limitations.

## Routes, auth and permissions
`/` report list; `/login`; `/analyst` creation/list; `/analyst/[id]` author/review/publish/version/access/progress; `/reports/[id]` private report; `/reports/[id]/pdf` authenticated export; `/golden` and `/golden/pdf` explicitly fictional reference. Never expose private reports through anonymous bearer links. Server validates user, database RLS independently restricts reads. Use only publishable key plus user session; no service-role key in browser or app. Writes run through narrowly authorised database functions. Atomic sequential version allocation, valid state transitions and immutable approval enforced in database. Explicit named client grants, revocation and append-only events. Private/no-store and noindex responses, anti-framing and referrer protection. No raw records in client snapshot or public analytics. Historical tables with no browser policy remain closed; do not open them to silence advisory notices.

## PDF behaviour
On-demand server-generated PDF reads the same validated manifest as HTML. Branded light presentation, studio/period/version, all core sections, values, evidence and limitations; readable wrapping, page breaks and page numbers. No public storage or independently edited PDF source. Browser print also has a print-safe layout. PDF is secondary, HTML authoritative.

## QA and release criteria
Known-value metric/score tests; null/zero/missing/invalid periods; subset constraints; duplicate/broken IDs. Full create/edit/review/approve/publish/version/revoke journey. Anonymous, unrelated client, granted client and admin tests against app and direct database, including writes and unpublished versions. Desktop/tablet/mobile, navigation, chart controls, filter, keyboard, long content, missing states and PDF page inspection. Verify unchanged public website and actual production private routes/export. Save exact results and unverified items. SOP must let Daniel create and publish the next report without code edits.

## Extension points
Stable IDs, schema/calculation versions and separate intervention/outcome records allow future consented benchmarks, automation and Watch. No extras implemented before core acceptance.
