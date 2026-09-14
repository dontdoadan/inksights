# INKSIGHTS Workspace v1 — Design Specification

Date: 2026-09-14
Status: Approved design awaiting implementation-plan approval
Scope: Authenticated multi-tenant INKSIGHTS workspace built on the existing canonical INKSIGHTS application and Supabase model

## 1. Purpose

INKSIGHTS Workspace v1 is the authenticated operating interface for INKSIGHTS. It is not a generic dashboard and not a separate data silo. Its purpose is to expose the canonical INKSIGHTS intelligence system as a reliable, explainable workflow that converts studio observations into evidence, diagnoses, recommendations, interventions, measured outcomes and reusable learning.

The workspace must support both INKSIGHTS internal users and client studio users. A single user account may belong to multiple studios. Client access is invite-only in v1, with the architecture intentionally compatible with public signup and studio claiming later.

The primary product objective is to use Workspace v1 to run one real studio through the complete INKSIGHTS intelligence loop and record a measurable outcome.

## 2. Architectural decision

Workspace v1 will be implemented inside the existing INKSIGHTS application and repository under protected workspace routes, rather than as a separate frontend or generic site-builder product.

The application will continue to use the existing canonical Supabase project and data model. Workspace-specific UI state may be introduced where required, but studio intelligence data must not be duplicated into a parallel dashboard schema.

The database remains the source of truth for identity, studio membership, intelligence records, recommendations, interventions, outcomes and learning.

## 3. User and tenancy model

### 3.1 Identity

- Supabase Auth provides authentication.
- `auth.users` represents authenticated identities.
- `profiles` stores user-facing profile and onboarding information.
- `studio_members` provides the many-to-many relationship between users and studios.
- `visibility_studios` remains the canonical studio entity.
- Studio-scoped intelligence records continue to reference `studio_id`.

A user may belong to zero, one or many studios. A studio may have many users.

### 3.2 Client roles

Supported studio roles:

- `owner`
- `admin`
- `member`
- `viewer`

Permissions:

| Capability | Owner | Admin | Member | Viewer |
| --- | --- | --- | --- | --- |
| View workspace | Yes | Yes | Yes | Yes |
| View studio intelligence | Yes | Yes | Yes | Yes |
| View results and published reports | Yes | Yes | Yes | Yes |
| Work on interventions | Yes | Yes | Yes | No |
| Accept or reject standard recommendations | Yes | Yes | Limited by action policy | No |
| Invite users | Yes | Yes | No | No |
| Remove ordinary members/viewers | Yes | Yes | No | No |
| Manage admins | Yes | Limited | No | No |
| Remove another owner | Yes, subject to ownership safeguards | No | No | No |
| Transfer ownership | Yes | No | No | No |

Ownership transfer and owner removal must prevent a studio from unintentionally ending with no owner.

### 3.3 Internal INKSIGHTS access

INKSIGHTS internal privileges must be represented separately from `studio_members`. Internal users must not require artificial membership rows for every client studio.

The internal-role mechanism may be implemented through a dedicated platform-role/profile field or equivalent server-validated mechanism, provided that it cannot be self-assigned by client users.

Internal users can access cross-studio portfolio information, system-health views and administration capabilities according to their platform role.

## 4. Authentication and onboarding

### 4.1 V1 onboarding model

V1 is invite-only.

Flow:

1. INKSIGHTS creates or selects the canonical studio record.
2. INKSIGHTS assigns the initial studio owner.
3. The owner receives an account invitation.
4. The owner authenticates and completes any required profile/onboarding fields.
5. Membership is validated.
6. The owner lands in the authorised studio workspace.
7. Owners and admins may invite additional team members.

### 4.2 Future public signup compatibility

The architecture must support a later flow without changing the core tenancy model:

`signup -> studio search -> existing-studio claim OR new studio candidate -> verification -> membership approval -> workspace`

Public registration is out of scope for v1.

## 5. Security model

### 5.1 Security boundary

RLS is the authoritative tenant-isolation boundary. UI visibility alone must never be treated as authorisation.

A client user may read or mutate a studio-scoped record only when:

- the user is authenticated;
- an active `studio_members` row exists for the target `studio_id`; and
- the user's studio role authorises the requested operation.

All privileged mutations must be server-controlled or executed through server-side/RPC/Edge Function paths that enforce the same authorisation rules.

### 5.2 Internal access

Cross-studio internal access must be granted through a distinct internal role that is validated server-side. Client users must not be able to elevate themselves into internal access.

### 5.3 Sensitive information

Client-visible data must be explicitly separated from internal-only data. Internal-only information may include:

- acquisition and commercial pipeline information;
- internal pricing logic;
- unsupported/raw provider payloads where disclosure is inappropriate;
- internal analyst notes;
- calibration notes;
- rejected hypotheses not intended for client presentation;
- internal system diagnostics.

### 5.4 Current advisory

The Supabase project currently reports RLS disabled on `public.spatial_ref_sys`. This must be reviewed during security hardening before production release. Remediation must not be applied blindly because enabling RLS without appropriate access policies can break dependent functionality.

## 6. Application modes

### 6.1 Client workspace

Primary navigation:

- Overview
- Intelligence
- Opportunities
- Actions
- Results
- Learning
- Visibility
- Reports
- Team

### 6.2 Internal INKSIGHTS workspace

Internal users receive all client-workspace capabilities plus:

- Command Centre
- Studios
- Portfolio
- Pipelines
- Data Health
- Administration

Internal pages should be unavailable to client users at both routing and data-access levels.

## 7. Workspace information architecture

### 7.1 Overview

The Overview page must answer five questions without requiring the user to inspect raw tables:

1. What is happening?
2. What is wrong?
3. Where is the best opportunity?
4. What should happen next?
5. Is the current intervention working?

Expected components include:

- selected studio header and verification state;
- current diagnostic/health summary;
- priority opportunity;
- current recommendation/intervention;
- key KPI cards;
- evidence freshness and last-updated state;
- latest measurable outcome where available;
- alerts for stale, missing or failed data.

### 7.2 Intelligence

The Intelligence page renders the canonical reasoning chain:

`Observation -> Metric -> Evidence -> Finding -> Diagnosis -> Opportunity -> Recommendation -> Decision -> Intervention -> Outcome -> Attribution -> Learning`

Each stage must be navigable backward to supporting records where applicable. A recommendation should never appear as an unsupported isolated statement.

Client-facing records should display classification and confidence where available, using controlled labels such as:

- VERIFIED
- OBSERVED
- CALCULATED / DERIVED
- MODELLED
- HYPOTHESIS / INFERRED
- EVIDENCE-BACKED

The exact displayed label should map consistently to the canonical backend classification values.

### 7.3 Opportunities

The Opportunities page presents prioritised commercial opportunities.

Where available, the UI should expose:

- opportunity title;
- growth lever;
- opportunity value estimate;
- impact score;
- evidence strength;
- confidence;
- ease;
- speed;
- strategic fit;
- feasibility;
- learning value;
- total score;
- rationale;
- status;
- linked playbook;
- supporting evidence.

Sorting and filtering should allow users to distinguish highest-value/highest-confidence opportunities from exploratory opportunities.

### 7.4 Actions

Actions represents the controlled recommendation-to-intervention workflow.

Canonical workflow:

`Recommendation proposed -> reviewed -> accepted/rejected/deferred -> decision recorded -> intervention created -> baseline locked -> intervention executed -> outcome measured -> attribution reviewed -> learning recorded`

Recommendations must never silently become active interventions.

The interface should support role-appropriate actions, clear ownership and status, measurement windows and completion evidence.

### 7.5 Results

Results presents measured outcomes rather than marketing-style success claims.

Expected fields include:

- baseline period;
- measurement period;
- baseline value;
- observed value;
- delta;
- source;
- classification;
- confidence;
- intervention linkage;
- attribution method;
- attribution confidence;
- attributed commercial value where supported;
- confounders;
- rationale.

### 7.6 Learning

Learning surfaces structured lessons generated from completed interventions and outcomes.

Each learning record should show:

- hypothesis;
- observed result;
- learning type;
- confidence;
- scope/applicability;
- recommendation adjustment where relevant;
- linked intervention/outcome/attribution.

This area is strategically important because it turns completed work into reusable INKSIGHTS intellectual property.

### 7.7 Visibility

Visibility provides access to relevant local-search and market intelligence, including where available:

- search universe;
- current position;
- competitor position;
- SERP observations;
- competitor observations;
- LSOS/opportunity scores;
- visibility reports;
- studio capabilities;
- data provenance.

It must remain connected to the broader intelligence workflow and should not become a standalone SEO dashboard.

### 7.8 Reports

Reports lists approved/published report runs and historical snapshots. Draft/internal report states must respect role and publication rules.

### 7.9 Team

Team enables owners/admins to manage authorised studio users.

Functions:

- view current members;
- invite users;
- assign permitted roles;
- deactivate/remove users within role constraints;
- show pending invitations;
- switch studios when a user belongs to several studios.

## 8. Internal Command Centre

The internal Command Centre is the operating view for INKSIGHTS staff.

It should expose:

- total/active client studios;
- studios requiring attention;
- incomplete intelligence loops;
- recommendations awaiting review;
- interventions in progress;
- outcomes awaiting measurement;
- stale or missing evidence;
- pipeline failures/partial runs;
- recent material system events;
- top opportunities across studios;
- data-health exceptions.

The intent is operational triage, not vanity analytics.

## 9. Live-data strategy

"Live" does not mean every table requires a persistent realtime subscription.

### 9.1 Realtime candidates

Use realtime selectively for state that benefits materially from immediate updates, such as:

- intervention status;
- newly approved/rejected recommendations;
- new material findings;
- team membership/invitation changes;
- critical pipeline-state changes.

### 9.2 Query-refresh candidates

Use React Query invalidation/refetch for:

- dashboard aggregates;
- opportunity scores;
- visibility intelligence;
- published reports;
- historical outcomes;
- system-health summaries.

### 9.3 Data trust indicators

Material widgets should expose, where relevant:

- last updated timestamp;
- freshness/staleness state;
- classification;
- confidence;
- source/provenance;
- degraded/partial state.

A component must not silently display stale or incomplete data as current fact.

## 10. UI and brand system

Workspace v1 should retain the established INKSIGHTS visual language while increasing information density and operational clarity.

Design principles:

- deep navy application canvas;
- mint as signal/action/state colour;
- ice-white primary text;
- restrained blue-grey secondary text;
- translucent/glass surfaces used sparingly;
- thin low-contrast borders;
- compact data-rich cards;
- evidence/confidence/status chips;
- signal/radar motifs where they communicate intelligence state;
- minimal decorative animation;
- animation reserved primarily for state transitions, loading, refreshed evidence and changing system status;
- no tattoo-industry visual clichés;
- no generic agency/SaaS aesthetic.

The workspace should feel like a specialist financial/intelligence terminal adapted to tattoo-studio operations.

## 11. Reliability and failure handling

Workspace v1 must implement explicit states for:

- loading;
- empty datasets;
- permission denied;
- unavailable source;
- stale data;
- partial pipeline completion;
- failed pipeline run;
- retryable request failure;
- non-retryable request failure;
- unauthenticated session;
- expired/revoked membership.

Technical expectations:

- protected routes;
- generated Supabase TypeScript types;
- typed query boundaries;
- server-controlled privileged mutations;
- error boundaries;
- React Query retry/invalidation rules;
- deterministic loading/empty/error states;
- auditability for material decisions;
- no secrets in browser bundles;
- preview/production environment separation;
- responsive layouts;
- accessibility baseline;
- application-error telemetry/logging appropriate to the existing stack.

## 12. Data-model reuse

Workspace v1 must preferentially reuse the existing canonical tables, including relevant records from:

- `visibility_studios`
- `studio_members`
- `intelligence_metric_definitions`
- `intelligence_metric_values`
- `intelligence_evidence`
- `intelligence_findings`
- `intelligence_diagnoses`
- `intelligence_growth_diagnostics`
- `intelligence_opportunity_scores`
- `intelligence_playbooks`
- `intelligence_recommendations`
- `intelligence_decisions`
- `intelligence_interventions`
- `intelligence_outcomes`
- `intelligence_attributions`
- `intelligence_learning`
- visibility/search/report/pipeline tables already present in the canonical schema.

New tables should only be introduced where an actual missing domain concept exists. UI convenience alone is not sufficient justification for duplicating canonical data.

## 13. Route model

Exact route naming may follow current repository conventions, but the intended structure is:

- `/workspace`
- `/workspace/studios/:studioId`
- `/workspace/studios/:studioId/intelligence`
- `/workspace/studios/:studioId/opportunities`
- `/workspace/studios/:studioId/actions`
- `/workspace/studios/:studioId/results`
- `/workspace/studios/:studioId/learning`
- `/workspace/studios/:studioId/visibility`
- `/workspace/studios/:studioId/reports`
- `/workspace/studios/:studioId/team`

Internal-only examples:

- `/workspace/admin/studios`
- `/workspace/admin/portfolio`
- `/workspace/admin/pipelines`
- `/workspace/admin/data-health`
- `/workspace/admin/users`

A user must never gain access merely by guessing or manually editing a `studioId` in the URL.

## 14. Studio switching

Users with membership in more than one studio receive a studio switcher.

Requirements:

- only authorised studios appear;
- current studio context is visually obvious;
- switching invalidates studio-scoped cached queries;
- deep links respect authorisation;
- if a user has exactly one studio, the interface may bypass the selection step;
- internal users may use a broader studio selector suitable for portfolio operations.

## 15. Testing strategy

Implementation must verify both UI behaviour and backend security.

Minimum test coverage should include:

- unauthenticated route protection;
- one-studio client access;
- multi-studio user switching;
- cross-studio isolation attempts;
- role-specific mutation permissions;
- owner-transfer safeguards;
- invitation flows;
- internal cross-studio access;
- stale/partial/failed data rendering;
- recommendation -> decision -> intervention transitions;
- outcome and attribution rendering;
- responsive/mobile layout;
- production build;
- representative browser visual QA;
- relevant Supabase security/performance advisors after schema or policy changes.

## 16. V1 exclusions

Explicitly out of scope for v1:

- public self-registration;
- automated studio-claim flow;
- public directory ownership tools;
- billing/subscription management UI;
- chat/messaging;
- general project management;
- arbitrary dashboard builder;
- white-labelling;
- mobile-native app;
- third-party marketplace;
- full CRM replacement;
- broad AI chatbot functionality.

These are deferred until the core intelligence loop has been run successfully on a real studio.

## 17. Acceptance criteria

Workspace v1 is acceptable when all of the following are true:

1. Authenticated client users can access only studios to which they have an active membership.
2. One account can belong to multiple studios and switch context safely.
3. Owner/admin invitation permissions work as specified.
4. Internal INKSIGHTS users can operate across studios without fake memberships.
5. The Overview page exposes the current studio state, primary diagnosis/opportunity, recommended action and measurable result state.
6. The user can traverse the intelligence chain from recommendation back to supporting evidence.
7. Recommendations require an explicit recorded decision before becoming interventions.
8. Interventions can be linked to measured outcomes and attribution records.
9. Learning can be recorded from completed work.
10. Visibility intelligence is available without becoming a disconnected SEO dashboard.
11. Stale, partial and failed data states are visible and not silently presented as current truth.
12. The application remains on-brand and responsive.
13. Production build and representative browser QA pass.
14. Tenant-isolation and role-permission checks pass.
15. One real studio is run through the complete Observation -> Evidence -> Diagnosis -> Recommendation -> Intervention -> Outcome -> Learning loop using the workspace.

## 18. Implementation sequencing principle

Implementation should proceed in dependency order rather than page-count order:

1. authentication and internal-role model;
2. RLS and membership authorisation;
3. workspace shell and studio context;
4. overview read model;
5. intelligence chain read views;
6. opportunity/recommendation workflow;
7. decision/intervention mutations;
8. results/attribution/learning views;
9. team invitations and role management;
10. internal Command Centre/system health;
11. full visual QA, security verification and one-studio end-to-end run.

The implementation plan must preserve the P0 objective: complete and validate the core intelligence loop before expanding integrations or adjacent modules.
