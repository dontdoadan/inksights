# INKSIGHTS UK Tattoo Industry Intelligence Engine — acquisition v1

**Status:** REVIEW / read-only research tooling. **Owner:** INKSIGHTS. **Date:** 2026-10-23.
**Primary commercial outcome:** First verified paid Studio Intelligence Audit (£395), then a reproducible qualified-prospect funnel.
**Scope:** UK tattoo studios initially. Other B2B segments require distinct ICP and finding definitions.
**Code:** scripts/industry-intelligence/{qualify.mjs,run.mjs,qualify.test.mjs}.

## Current system inspection (2026-10-23)

- Canonical project: Supabase \`ukaxsqwnkoqbbsufpzga\` (ACTIVE_HEALTHY).
- Existing studio discovery: \`studio_candidates\` **349** (344 unresolved, 5 matched).
- Canonical visibility studios: \`visibility_studios\` **19**; source observations: **97**.
- Source registry: \`studio_sources\` **7**; includes Companies House, first-party studio website and other sources.
- HubSpot already has studio company records, **plus** explicitly marked [TEST], [DUPLICATE] and [LEGACY] entries. Treat these as do-not-promote.
- Existing client acquisition: \`revenue_audit_leads\`, Growth Check, integration events, HubSpot CRM and Stripe. Do not replace any of them.
- Existing in-flight experience: [unified journey PR #137](https://github.com/dontdoadan/inksights/pull/137) is draft and not backend-integrated. Do not merge dependencies blindly.

Counts are overlapping objects, not unique verified studios.

## Operating design

\`Source discovery → candidate record → source/evidence validation → identity resolution → ICP research score → opportunity observation → human approval → HubSpot company/lead handoff → researched outreach → £395 checkout → verified payment → onboarding/report → outcomes.\`

**Every transition is gated.** A directory listing or Companies House record is not proof the studio currently trades, has 3–8 artists or has a revenue problem. A score is a research priority, not an affirmative claim about conversion likelihood. Do not contact businesses solely because their score is high.

## Run (no database or CRM writes)

Install Node 22+; no packages are required for the research CLI.

\`\`\`sh
node --test scripts/industry-intelligence/qualify.test.mjs
node scripts/industry-intelligence/run.mjs --input ./secure/studio_candidates.json --out ./private/research-queue
\`\`\`

Or, **from a trusted local/CI runtime with read-only intention**, supply the two server-only secrets via environment management (never git, browser, logs or PR). This currently uses Supabase REST to SELECT; the secret credential still has broader power, so execute only in trusted environments. Production should eventually use a minimum-privilege private read endpoint.

\`\`\`sh
node scripts/industry-intelligence/run.mjs --from-supabase --out ./private/research-queue
\`\`\`

Required environment: \`SUPABASE_URL\`, \`SUPABASE_SERVICE_ROLE_KEY\` (or \`SUPABASE_SECRET_KEY\`). This CLI does not fetch third-party websites or issue outbound emails.

Outputs:
- \`research_queue.csv\` — manually reviewable spreadsheet.
- \`research_queue.json\` — detailed evidence/gaps and source keys.
- \`run_summary.json\` — count, exclusions, duplicate review, CRM sync count = 0.

Do not commit exports containing business contacts, email addresses or full source payloads. Treat output as internal prospect research and apply retention/security controls.

## Qualification v1 (heuristic, not calibrated)

- Source-reported exact artist count 3–8: +20; 2 or 9–12: +6; other counts: 0; unknown: 0. Artist counts always require fresh official-source manual verification before CRM approval.
- Listed studio website: +18 (URL existence alone does not confirm active operation).
- Postcode: +8; town: +5; public phone listed: +3; Companies House number listed: +3.
- Source-classification heuristic 2–12 points (first-party website generally stronger than chat-snapshot or directory).
- Output score capped at 100. Tier A ≥70, B ≥40, C below 40. Scores are uncalibrated research heuristics, not buying propensity estimates.
- Unknown values are never imputed, and a source-supplied approximate range such as "15+" cannot be treated as an exact count.
- All candidates remain RESEARCH_ONLY (or POSSIBLE_DUPLICATE, EXCLUDED). **No automatic HubSpot eligibility**.

Identity review uses domain+postcode first, otherwise name+postcode. Same domain at different locations MUST NOT merge. Similar names or uncertain address matches require manual review. Existing studio IDs remain canonical after approved verification.

### Evidence standards

Each prospect review should attach \`source_url\`, \`observed_at\`, source classification and a factual quote/short observation:
- VERIFIED: official/current confirmation, or reviewed primary evidence.
- OBSERVED: directly captured website/booking step with observation date.
- CALCULATED: deterministic quantity with reproducible inputs.
- MODELLED: scenario with explicit assumptions, not saved revenue.
- HYPOTHESIS: proposed issue requiring confirmation.

Never generate revenue estimates from directory listings or publicly observed website friction. Assign an opportunity only when the underlying observable defect is documented. Any screenshots require permitted collection, source URL and timestamp.

## First 20 research targets — shortlisting, NOT approved outreach

Start with the existing CRM companies and the candidate records that already include official website references. Confirm website operations, identity and artist/team count before advancing. Below are examples for the first research work queue; the order is **not** a validated commercial ranking.

| Target | Region | Existing reference | First check |
|---|---|---|---|
| Good Times Tattoo | London | Supabase candidate / matched | Confirm 7 working artists and current booking channels |
| SANS PATRIE / STUDIO | London | Supabase candidate / matched | Confirm 3 working artists and inquiry path |
| Moth & Flame Tattoo | Bromley | Both candidate and HubSpot | Compare canonical identity and avoid duplicate CRM record |
| Modern Classic Tattoo | London | Supabase candidate / matched | 11 listed artists, lower ICP fit: validate before promoting |
| Storyville Tattoo Studio | Honor Oak | Supabase candidate | Verify working artists and web journey |
| Bluerose Tattoos | Chislehurst | Supabase candidate | Verify staff count and booking workflow |
| Never Say Die! Tattoo Studio | Croydon | Supabase candidate | Verify current site and source mismatch |
| JuJu Tattoo Studio | Croydon | Supabase candidate | Confirm location, artist count and current booking journey |
| Timebomb Tattoo & Piercing | Croydon | Supabase candidate | Verify studio model, location and website |
| ONE DAY Tattoo Studio London | London | Supabase candidate | Verify team size and public enquiry form |
| ElectricThaiger Tattoo | UK — location check | Supabase candidate | Resolve location and current artist roster |
| Steel Point Tattoos | UK — location check | Supabase candidate | Check booking terms and trading status |
| Pain Divine Tattoo Studio | Croydon | Supabase candidate | Verify official website and operating status |
| Unit Two Tattoo Studio | Hove | HubSpot company | Check existing outreach / last touch before new action |
| Off The Rails Tattoo Studio | Beckenham | HubSpot company | Use existing canonical company, never flagged duplicates |
| Northern Tattoo Collective | Newcastle | HubSpot company | Check artists and existing contact status |
| Brighton Tattoo Collective | Brighton | HubSpot company | Validate trading/location and current sales context |
| Bold as Brass Tattoo Co. | Liverpool | HubSpot company | Verify site and booking evidence |
| Six Bullets Tattoo | London | HubSpot company | Verify artists and ICP score |
| Black Sheep Tattoo | Bristol | HubSpot company | Check baseline and booking workflow |

**Existing CRM does not equal consent or outreach approval.** Check suppression, prior communications, lawful basis and business-contact rules before contacting. Test and duplicate HubSpot entries remain excluded.

## Research checklist for every target

1. Confirm business is an actively trading tattoo studio at a specific UK location.
2. Match on authoritative ID/website/address/postcode; record conflict or ambiguity.
3. Check 3–8 active artists where public evidence allows, plus single-location and 2+ years.
4. Inspect the public website/contact/booking journey. Record only factual defects with timestamped primary URLs.
5. Identify one plausible business problem and **one** suitable offer: Growth Check, Visibility Watch & Fix (only scope-eligible), or paid £395 Audit (when comprehensive diagnosis is the relevant next step).
6. Human reviewer approves or rejects the finding and checks suppression/marketing requirements.
7. Resolve existing HubSpot company by domain and city, not name alone. Update existing company/lead only when authorised; avoid creating an unqualified deal.
8. Complete personalised outreach; record contact outcome, date, channel, lawful basis and next action.
9. Track checkout started, payment succeeded **server-side**, onboarding started and audit delivered.
10. After first studio, review evidence to recalibrate scores against observed conversions, not assumptions.

## Handoff contract — for future approved CRM automation

\`\`\`json
{
  "candidate_id": "uuid",
  "canonical_studio_id": "verified uuid or null",
  "hubspot_company_id": "existing ID or null",
  "source_url": "https://...",
  "source_observed_at": "ISO-8601",
  "research_score": 0,
  "qualification_version": "industry-intelligence-v1.0.0",
  "reviewer_approved_at": "ISO-8601 or null",
  "verified_business_identity": false,
  "legal_contact_basis_reviewed": false,
  "suppression_checked": false,
  "public_opportunity_evidence_ids": [],
  "recommended_offer": "one approved product or none",
  "crm_handoff_status": "blocked"
}
\`\`\`

Only a separate server-side, authenticated, audited sync adapter may move \`crm_handoff_status\` to ready. It must require all three approval booleans (plus reviewer, contact context, idempotency and existing company lookup). Do not reuse customer identity/consent credentials from the four-step visitor journey to grant outreach rights.

## KPIs / exit gates

**P0 measurable:** researched/day, identity-verified count, verified ICP fit, finding approval, reviewed prospects, outreach sent, positive responses, sales conversations, checkout started, verified £395 payments, fulfilled audits, cost per acquired customer.

**First revenue release gate:** 20 fully reviewed targets → 5 compliant bespoke outreaches → 1 diagnostic/sales call or clear learning → confirmed £395 Stripe payment → one reconciled HubSpot deal, Supabase order/lead and delivery record. These are targets, not promised outcomes.

**Scale gate:** 500 qualified leads should follow measured operational proof, not precede a functional sales handoff. Build background discovery only when source licences, usage costs and identity resolution are under control.

## Current blockers and controls

1. No confirmed current-state web verification of all 20 targets; names in the queue are **research candidates**.
2. 344/349 candidates unresolved; merging by name would be unsafe.
3. Existing HubSpot includes duplicates/tests; require explicit exclusion list and domain+location matching.
4. Existing payment-to-onboarding workflow requires end-to-end live verification; prior demo/test checkouts are not paid revenue evidence.
5. No automatic outreach or bulk CRM import until review, outreach law, suppression and unit economics are validated.
6. Avoid changes to existing public tools, site routes, RLS, migrations, operational CRM stages and Stripe in this branch.
7. Research exports are sensitive internal operational data, not public directory content.

## Next engineering stage (separate PR)

- Use minimum-privilege server-side read integration rather than service-role credentials in a local CLI.
- Create review-queue records with review attribution and versioned status, preserving \`studio_candidates\` and \`studio_source_observations\`.
- Build a verified-identity lookup + safe CRM company upsert adapter with explicit dry-run and idempotency.
- Establish proof of the audited £395 Stripe → CRM → onboarding → report entitlement chain.
- Add scheduled discovery **only after** terms, quotas, source licenses and error budget are approved.
