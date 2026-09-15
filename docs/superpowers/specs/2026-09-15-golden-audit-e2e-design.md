# INKSIGHTS Golden Audit E2E — Design Specification

Date: 2026-09-15
Status: Approved design, pre-implementation
Scope: Golden Audit end-to-end acceptance test using Daniel Hughes Tattoos as an internal validation tenant

## 1. Purpose

The Golden Audit proves that INKSIGHTS can turn messy real-world studio evidence into a defensible, valuable, on-brand client deliverable through the product itself.

The test must not depend on conclusions that exist only in ChatGPT. Every material output must be persisted in the INKSIGHTS system with provenance, evidence classification and confidence, then rendered into the client-facing report from stored intelligence.

Daniel Hughes Tattoos is the canonical internal Mode B test tenant because it has real but incomplete historical transaction data and a live website, while also containing realistic data gaps that the product must handle safely.

The Golden Audit validates product delivery quality. It does not by itself validate commercial uplift. Measured uplift will be validated later with an active external studio.

## 2. Acceptance criterion

The Golden Audit passes only when the same canonical INKSIGHTS path can perform the following without manual reconstruction of the analysis:

1. Create or identify a studio.
2. Create an audit run.
3. Accept raw transaction data.
4. Store the source artifact and provenance.
5. Parse and normalise the transaction rows.
6. Resolve client identities conservatively.
7. Run data-quality checks.
8. Audit the live website.
9. Run search and visibility intelligence.
10. Gather a bounded competitor set.
11. Persist raw observations and normalised evidence.
12. Calculate supported metrics.
13. Explicitly mark unsupported metrics as not measurable.
14. Create evidence-backed findings.
15. Diagnose the primary commercial constraint.
16. Generate and score opportunities.
17. Generate prioritised recommendations and a 90-day action plan.
18. Generate a client-facing report from stored audit intelligence.
19. Run automated QA gates.
20. Mark the report client-ready only after QA passes.
21. Make a secure web report available.
22. Generate a downloadable PDF from the same canonical report data.
23. Retain the full run history, logs, source references, report version and QA outcome.
24. Allow a rerun without manually recreating the analysis.

## 3. Architectural decision

Use the existing canonical INKSIGHTS stack:

- GitHub: `dontdoadan/inksights`
- Vercel project: `inksight-main`
- Supabase: canonical INKSIGHTS project
- TanStack Start application
- Existing Supabase Edge Functions where they are fit for purpose

Do not build a separate audit platform.

The Golden Audit introduces one canonical audit orchestration layer and one canonical audit data model. Existing workloads such as `revenue-audit-v1`, `search-intelligence-v1`, `search-console-sync` and `studio-visibility-report-v2` are inputs or reusable engines, not independent sources of truth.

The current `revenue-audit-v1` remains a lightweight acquisition estimator unless separately replaced. It must not be treated as the Full Studio Intelligence Audit because it uses user-supplied monthly inputs and modelled opportunity formulas rather than a complete evidence-backed audit pipeline.

## 4. Core product principle

The canonical product loop is:

Provider Observation -> Normalised Data -> Metric -> Evidence -> Finding -> Diagnosis -> Opportunity -> Recommendation -> Intervention -> Outcome -> Attribution -> Learning

For the Golden Audit, the required scope ends at the selected intervention. Outcome, attribution and learning become active after implementation and measurement.

## 5. Audit operating modes

The system must support three evidence modes:

### Mode A — full data

Recent transaction, client, enquiry, booking, attendance and capacity records are available.

### Mode B — partial data

Some reliable internal records exist, but one or more important funnel or operational datasets are missing. The system calculates only supported metrics and records missing metrics as not measurable.

### Mode C — low/no internal data

Diagnosis relies primarily on public evidence, owner context, direct observations and modelled scenarios. The system must not create false precision.

Daniel Hughes Tattoos is Mode B.

## 6. Evidence and confidence model

Every material finding, metric and recommendation must carry an evidence classification where applicable:

- `VERIFIED` — directly established from reliable primary data.
- `OBSERVED` — directly observed from a website, search result, public business surface or other external source.
- `CALCULATED` — mathematically derived from stored source evidence.
- `MODELLED` — scenario or estimate based on explicit assumptions.
- `HYPOTHESIS` — plausible interpretation requiring validation.

Evidence classification is separate from confidence.

Confidence values:

- `HIGH`
- `MEDIUM`
- `LOW`

A finding can therefore be `CALCULATED / MEDIUM`, for example when the calculation is deterministic but entity resolution is incomplete.

## 7. Canonical data model

The implementation should use explicit entities rather than overloaded JSON blobs for core relationships. JSON may be used for bounded engine-specific payloads, but not as a substitute for the audit model.

Required entities:

### `studios`

Canonical business identity.

Minimum fields:

- id
- name
- slug
- website_url
- primary_location
- internal_validation boolean
- created_at
- updated_at

Daniel Hughes Tattoos must be marked `internal_validation = true`.

### `audits`

One immutable logical audit run with versioned outputs.

Minimum fields:

- id
- studio_id
- audit_type
- audit_version
- mode
- status
- period_start
- period_end
- started_at
- completed_at
- qa_status
- report_status
- created_by

Suggested audit statuses:

- `draft`
- `collecting`
- `normalising`
- `analysing`
- `diagnosing`
- `reporting`
- `qa`
- `completed`
- `failed`

### `audit_sources`

Every source used by the audit.

Examples: uploaded transaction file, website snapshot, search observation, competitor page, connected analytics export.

Minimum fields:

- id
- audit_id
- source_type
- source_name
- source_uri or storage_path
- observed_at
- ingested_at
- source_hash where applicable
- metadata

### `audit_raw_records`

Optional normalised raw ingestion staging for structured source rows when useful for traceability.

For transaction data this should retain source row identity and original values.

### `clients`

Canonical client entity within a studio.

### `client_aliases`

Raw names or source identifiers that map to a canonical client.

Must support unresolved and review-required states.

### `transactions`

Financial payment event.

Transaction must not be treated as a session or booking.

Minimum fields:

- id
- studio_id
- audit_source_id
- client_id nullable until resolution
- transaction_date
- amount
- currency
- raw_reference
- duplicate_status
- source_row_key

### `metrics`

Canonical calculated metric result.

Minimum fields:

- id
- audit_id
- metric_key
- value_numeric or value_text
- unit
- period_start
- period_end
- evidence_classification
- confidence
- measurement_status
- calculation_version

Measurement statuses include:

- `measured`
- `estimated`
- `not_measurable`
- `not_applicable`

For `not_measurable`, the reason and required source must be stored.

### `evidence`

Traceable support for findings and metrics.

Minimum fields:

- id
- audit_id
- source_id nullable
- evidence_type
- title
- summary
- classification
- confidence
- provenance
- observed_at

### `findings`

Interpretations directly supported by evidence.

Minimum fields:

- id
- audit_id
- finding_key
- title
- statement
- category
- classification
- confidence
- severity or materiality
- status

A many-to-many relation between findings and evidence should be explicit.

### `diagnoses`

Constraint-level conclusions derived from findings.

Minimum fields:

- id
- audit_id
- title
- statement
- constraint_type
- confidence
- rank

### `opportunities`

Actionable commercial opportunities generated from diagnoses.

Minimum fields:

- id
- audit_id
- diagnosis_id
- title
- mechanism
- impact_score
- confidence_score
- ease_score
- speed_score
- cost_score
- overall_score
- impact_low nullable
- impact_high nullable
- impact_unit
- evidence_classification
- confidence

### `recommendations`

Prioritised recommended actions derived from opportunities.

Minimum fields:

- id
- audit_id
- opportunity_id
- title
- rationale
- action
- owner_role
- target_metric_key nullable
- priority
- sequence

### `interventions`

The action selected for implementation and measurement.

### `audit_runs`

Operational execution log at the orchestration level.

Minimum fields:

- id
- audit_id
- engine_key
- status
- started_at
- completed_at
- input_summary
- output_summary
- error_code
- error_message
- retry_count

### `report_versions`

Generated report manifest.

Minimum fields:

- id
- audit_id
- version
- status
- generated_at
- qa_status
- web_slug or secure token reference
- pdf_storage_path nullable
- manifest_hash

### `qa_checks`

Every automated or manual quality gate result.

Minimum fields:

- id
- audit_id or report_version_id
- check_key
- status
- severity
- message
- evidence
- checked_at

## 8. Source ingestion

### Transaction ingestion

The Golden Audit must ingest the recovered Daniel Hughes Tattoos transaction ledger as a real source artifact.

Known characteristics:

- historical payment rows from 2020 through 2026
- client names are inconsistent in casing and formatting
- transaction rows are payment events, not session records
- tiny values and same-day repeated values exist
- potential duplicates cannot be silently removed

Ingestion rules:

1. Preserve the raw source artifact.
2. Record a source hash.
3. Parse each valid dated payment row.
4. Preserve the original client label and amount.
5. Normalise date and currency deterministically.
6. Do not infer booking/session/deposit semantics from payment value alone.
7. Flag exact same-day/same-client/same-amount rows as potential duplicates rather than deleting them.
8. Record parse failures separately.
9. Store ingestion counts and reconciliation totals.

### Client identity resolution

Three stages:

`RAW -> NORMALISED -> VERIFIED ENTITY`

Safe normalisation may include casing, whitespace and punctuation handling.

Fuzzy identity merging must never silently combine ambiguous people.

Every fuzzy candidate must be reviewable, reversible and confidence-scored.

## 9. Data-quality engine

Before commercial diagnosis, the audit must evaluate whether each dataset is trustworthy for its intended metric.

Minimum checks for transactions:

- row count
- parse success rate
- min/max dates
- invalid amounts
- zero/near-zero values
- exact duplicate candidates
- client identity completeness
- yearly and monthly coverage
- partial-year detection
- total reconciliation against source

The audit must distinguish data defects from legitimate business behaviour.

The quality engine must block unsupported claims rather than block the entire report when partial evidence can still create value.

## 10. Operating context and capacity gate

No demand or growth diagnosis may be made until the audit records material operating constraints.

Required context examples:

- number of artists
- owner involvement
- working availability
- material absence or closure periods
- current pricing
- current strategic objective
- known external constraints

For Daniel Hughes Tattoos, restricted working availability due to personal circumstances must be recorded as context, but should not be exposed in a client-facing report beyond the level necessary for the commercial interpretation.

The system should support a privacy-safe client-facing label such as `material owner availability constraint` rather than storing or rendering sensitive personal detail unnecessarily.

## 11. Audit engines

### 11.1 Transaction and revenue intelligence

Supported outputs include:

- recorded payment value by period
- payment row volume by period
- average/median payment value
- client concentration
- repeat-payment behaviour
- recency and frequency
- dormant-client population
- historical client-value bands
- year-over-year trends with full-year/YTD distinction

The engine must not call these session metrics unless session data is present.

### 11.2 Client intelligence

Supported outputs include:

- conservative distinct client count
- clients with multiple payment events
- value share from repeat-payment clients
- dormant-client counts
- dormant high-value cohorts
- client recency segments

`retention_rate` must remain `not_measurable` unless a valid cohort and return definition can be supported by the underlying booking/client model.

### 11.3 Website intelligence

The engine should observe and persist at minimum:

- HTTP availability
- indexability directives
- title and meta description
- canonical signals where available
- structured data presence where available
- CTA destinations
- enquiry mechanism
- portfolio/proof availability
- trust signals
- pricing/booking expectation visibility
- conversion friction
- basic instrumentation availability where observable

For Daniel Hughes Tattoos, known observations such as `noindex, nofollow`, placeholder portfolio blocks and mailto-based enquiry must be stored as evidence rather than embedded only in prose.

### 11.4 Search and visibility intelligence

Reuse existing search and visibility workloads where appropriate, but route their results into the canonical audit evidence model.

Outputs may include:

- branded discoverability
- relevant commercial search queries
- local search visibility
- search-result evidence
- Google Business visibility where observable
- competitor search presence
- indexability risk
- Local Search Opportunity Score when sufficient inputs exist

Search results are time-sensitive observations and must retain `observed_at` timestamps and source references.

### 11.5 Competitive intelligence

Use a bounded relevant set, not an exhaustive scrape.

Competitors should be selected using explicit rationale such as:

- geography
- service category
- style/specialism
- positioning
- price tier

Persist each comparator and observation date.

### 11.6 Enquiry, booking, attendance and capacity intelligence

These engines operate only when relevant internal data is present.

For missing datasets, persist `not_measurable` metrics with explicit reasons.

The Daniel Mode B report must demonstrate this behaviour visibly.

## 12. Diagnosis engine

The diagnosis engine consumes only stored findings and context.

It must not create material conclusions unsupported by stored evidence.

The expected hierarchy is:

`Evidence -> Finding -> Diagnosis`

A diagnosis may combine multiple findings, but the relation must remain inspectable.

Example Daniel diagnoses expected for validation, subject to rerun results:

- recent revenue is materially constrained by available operating capacity, so decline cannot be interpreted as a pure demand failure;
- a substantial historical client asset appears inactive and may represent a reactivation opportunity;
- the current digital acquisition journey contains material conversion and measurement weaknesses.

These examples are test expectations, not hard-coded outputs.

## 13. Opportunity scoring

Each opportunity should be scored consistently using bounded dimensions.

Initial v1 dimensions:

- commercial impact
- evidence confidence
- ease of implementation
- speed to signal
- implementation cost/risk

A simple weighted formula is acceptable initially if it is versioned and inspectable.

Do not create fake financial precision. Impact ranges may be absent when they cannot be defended.

All modelled monetary values must show assumptions and carry `MODELLED` classification.

## 14. Recommendations and 90-day plan

Recommendations must be downstream of opportunities, not generic advice.

Each recommendation must state:

- problem/opportunity addressed
- supporting evidence
- action
- expected mechanism
- owner role
- target metric where measurable
- priority
- sequence

The 90-day plan should be generated as a sequenced action programme from stored recommendations.

## 15. Orchestration

Introduce one canonical audit orchestrator.

Suggested responsibility boundaries:

- create/lock audit run
- determine applicable engines from source availability and mode
- invoke engines in dependency order
- persist engine status in `audit_runs`
- retry safe idempotent steps
- stop or degrade gracefully when one engine fails
- hand successful evidence to diagnosis
- trigger report generation
- trigger QA
- complete or fail the audit deterministically

The orchestrator must be idempotent at the audit-step level where practical.

Engine failure must not silently produce a complete report.

If a non-critical engine fails, the report may complete with a visible coverage warning if QA rules allow it.

If a critical data-integrity step fails, report generation must remain blocked.

## 16. Audit run log

The workspace should expose a readable execution timeline.

Example event sequence:

- ingest started
- source accepted
- rows parsed
- client identities generated
- duplicate candidates flagged
- website audit completed
- visibility collection completed
- metrics generated
- evidence ledger completed
- findings created
- opportunities scored
- recommendations selected
- report generated
- QA started
- QA passed/failed

The persisted log is part of supportability and debugging, not a cosmetic feature.

## 17. Client-facing report

The report is a renderer over canonical stored audit intelligence.

Do not manually maintain a second set of figures in report code.

Required sections for v1.1:

1. Cover / studio / audit period
2. Executive diagnosis
3. Evidence and data coverage summary
4. Commercial baseline
5. Client intelligence
6. Demand and visibility
7. Website and customer journey
8. Competitive position
9. Constraint diagnosis
10. Opportunity register
11. Top three priorities
12. Recommended intervention
13. 90-day action plan
14. Measurement plan
15. Evidence appendix / methodology notes

Unsupported sections should explain that the metric was not measurable and what source would make it measurable, rather than disappearing silently or fabricating a benchmark.

## 18. Report delivery

Three manifestations of one canonical report state:

### Secure interactive web report

Primary client experience.

Must use a non-guessable secure access mechanism and must not expose other studios' data.

### PDF

Generated from the same canonical report data and visual system.

No independent copy-pasted PDF content.

### Internal audit record

Workspace view showing run status, source coverage, evidence, engine logs, QA state and report versions.

## 19. Report versioning

Every regeneration creates a report version.

Report versions must retain the audit data version or manifest hash used to produce them.

A client-ready report is immutable. New information creates a new version rather than silently changing what was previously delivered.

## 20. QA gates

A report can only transition from `draft` to `client_ready` when mandatory checks pass.

### Data QA

- ingestion completed
- source row counts recorded
- source totals reconciled within defined tolerance
- duplicate assessment completed
- date/currency normalisation valid
- partial periods identified
- client-resolution coverage reported

### Evidence QA

- every material numeric claim has provenance
- no unsupported metric is rendered as measured
- hypotheses are labelled
- modelled values are labelled and assumptions are available
- findings link to evidence
- recommendations link to opportunities/findings

### Analysis QA

- operating context gate completed
- primary diagnosis has supporting findings
- top opportunities have supporting diagnoses
- recommendations are actionable
- missing datasets are represented as coverage limitations

### Report QA

- no placeholder copy
- no `null`, `undefined`, NaN or broken currency/date output
- chart values reconcile to underlying metrics
- written totals reconcile to displayed tables/charts
- correct studio and audit period
- correct evidence labels
- required sections present

### Visual QA

- INKSIGHTS brand system applied
- desktop and mobile web layouts render correctly
- print/PDF layout renders correctly
- charts/tables are legible
- no clipped content
- no orphan headings or broken page breaks

Client-ready transition requires `QA_PASSED = true`.

## 21. Security and privacy

The Golden Audit extends the authenticated studio product and must inherit strict studio isolation.

Requirements:

- RLS on exposed audit tables
- service-only writes for privileged orchestration where appropriate
- private storage for source files and generated PDFs
- secure report access
- no cross-studio leakage
- no service-role keys in client code
- no unnecessary sensitive personal context in client-facing report output
- raw client names should not be exposed in report sections unless explicitly required

Daniel Hughes Tattoos data must be treated like real customer data despite being an internal validation tenant.

## 22. Existing components to reuse or adapt

Known reusable components in the current repository:

- `supabase/functions/revenue-audit-v1` — retain as lightweight estimator or reuse isolated calculation patterns only; do not treat as Full Audit orchestration
- `supabase/functions/search-intelligence-v1` — candidate search engine input
- `supabase/functions/search-console-sync` — candidate connected search-data ingestion
- `supabase/functions/studio-visibility-report-v2` — candidate visibility evidence engine
- existing visibility/search migrations — reuse compatible evidence classification and provenance structures where sensible
- authenticated TanStack route shell — foundation for internal workspace/report administration

Before implementation, every reused component must be checked for its actual schema, security posture, idempotency and current production dependency.

## 23. Components to add

At minimum:

- canonical audit schema migration(s)
- transaction ingestion and normalisation workflow
- conservative client entity-resolution workflow
- audit data-quality engine
- website evidence collector
- competitor evidence collector or bounded adapter
- audit orchestrator
- diagnosis/opportunity/recommendation service
- report manifest builder
- secure report route
- PDF generation path
- audit run log/workspace view
- QA engine
- Golden Audit test fixture/run configuration for Daniel Hughes Tattoos

## 24. Non-goals for this implementation

Do not widen this work into:

- full UK studio directory rebuild
- full CRM replacement
- universal booking-system integration
- billing redesign
- broad content engine work
- arbitrary AI-agent framework
- automatic intervention execution
- external benchmark product
- full continuous monitoring platform

Only build what is required to prove the Golden Audit path and establish safe interfaces for future extension.

## 25. Testing strategy

Testing must cover three layers.

### Unit tests

- parsers
- normalisers
- metric calculations
- evidence classification validation
- opportunity score calculation
- report data formatting

### Integration tests

- source -> parsed records
- parsed records -> metrics/evidence
- engine outputs -> findings
- findings -> diagnosis/opportunities/recommendations
- audit -> report manifest
- RLS/studio isolation

### Golden-path acceptance test

Run Daniel Hughes Tattoos from raw source through final report.

The test must assert at least:

- source artifact stored
- expected source row count reconciles
- known 2025/2026 activity remains present
- transaction totals are reproducible from stored records
- partial-year status is correct
- enquiry conversion is `not_measurable`
- website evidence includes current indexability and enquiry observations at time of test
- all rendered material claims have provenance
- report passes QA
- secure web report loads
- PDF can be generated
- rerunning does not create uncontrolled duplicate source/metric records

Do not hard-code current diagnosis text or competitor observations as test fixtures; assert structural truth and provenance instead.

## 26. Rollout and release gates

Implementation occurs on a feature branch and follows existing repository policy:

feature branch -> Vercel preview -> browser/visual QA -> pull request -> merge -> production

Release gates:

### Gate 1 — schema and security

Canonical audit model exists; RLS and private storage pass access tests.

### Gate 2 — ingest and calculations

Daniel transaction source can be ingested and reconciled reproducibly.

### Gate 3 — evidence engines

Website/search/visibility evidence is persisted with provenance.

### Gate 4 — diagnosis

Findings, diagnosis, opportunities and recommendations are generated from persisted evidence.

### Gate 5 — report

Web report and PDF render from canonical report manifest.

### Gate 6 — QA

Automated and browser QA pass. Report can be marked client-ready.

### Gate 7 — rerun

A second Daniel audit run proves deterministic orchestration, versioning and duplicate control.

Only after Gate 7 should INKSIGHTS recruit the first external validation partner into this pipeline.

## 27. Success definition

Golden Audit v1.1 is successful when INKSIGHTS can ingest Daniel Hughes Tattoos' real partial data, independently execute the appropriate audit workflows, persist auditable evidence and analysis, produce a polished on-brand client-facing web report and PDF, pass defined quality gates, and rerun the workflow without relying on manual reconstruction from chat.

The output must be useful enough that, if Daniel Hughes Tattoos were an unrelated paying customer, the report could be delivered without explaining that it was a prototype.
