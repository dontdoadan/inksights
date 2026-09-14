# INKSIGHTS Workspace v1 Design

## Goal
Build the first internal INKSIGHTS operating workspace directly on the existing canonical Supabase intelligence model, harden the meaningful security exposure first, and use the workspace to run one real studio through the full intelligence loop from observation to learning.

## Scope

Workspace v1 is intentionally narrow. It must:

1. Resolve the meaningful application-specific Supabase security finding around the public `publish_visibility_report` privileged RPC without breaking public reports.
2. Add an internal authenticated `/workspace` surface to the existing application.
3. Use existing canonical intelligence tables as the system of record.
4. Let an authorised studio member view and progress one studio through Observation → Evidence → Finding → Diagnosis → Opportunity → Recommendation → Decision → Intervention → Outcome → Attribution → Learning.
5. Record an actual observed outcome before any integration expansion or additional intelligence module work.

Out of scope: HubSpot expansion, Stripe expansion, directory/map expansion, new AI agents, CMS expansion, new intelligence modules, generic admin CRUD, or redesign of the public marketing site.

## Architectural Decision

Workspace v1 lives inside the existing `dontdoadan/inksights` TanStack Start application under the existing `_authenticated` route group. It is not a second app and it does not introduce a parallel database model.

Supabase remains the source of truth. The workspace is a controlled operational surface over existing tables and relationships. GitHub remains source/version control and Vercel remains deployment/runtime.

## Security Boundary

### Public visibility report

The current public report page calls `public.publish_visibility_report(p_report_id, p_public_token)` directly from the browser. The function is `SECURITY DEFINER`, is located in the exposed `public` schema, and is executable by `anon`. This is the meaningful application-specific advisor finding.

The replacement design is:

- Public browser code calls a same-origin server route: `GET /api/public/visibility-report?reportId=<uuid>&token=<token>`.
- The server route uses the server-side Supabase service-role client to query the published report data after validating the exact `report_id + public_token + status='published'` combination.
- The route returns only the existing public report payload shape.
- Browser code no longer calls the privileged RPC directly.
- Database migration revokes `EXECUTE` on `public.publish_visibility_report(uuid,text)` from `PUBLIC`, `anon`, and `authenticated`; `service_role` may retain execution temporarily for compatibility, but the preferred endpoint implementation reads the source tables directly and the obsolete RPC can later be removed.
- Do not weaken RLS on source tables to make the public page work.

PostGIS-generated `spatial_ref_sys` and `st_estimatedextent` advisor warnings are extension-owned and are not modified in Workspace v1 unless Supabase explicitly documents a safe migration path for the managed extension. The 13 `RLS enabled no policy` findings are reviewed for intended service-role/internal-only use; no permissive policies are added merely to silence the advisor.

## Authentication and Authorisation

The existing `_authenticated` route guard remains the first boundary. Workspace data access must also rely on existing tenant RLS policies that check `studio_members.user_id = auth.uid()` and `active = true`.

Workspace v1 must not assume that authentication equals authorisation. Every studio-scoped query is constrained by RLS and by explicit `studio_id` filters in the client/query layer.

## Workspace Information Architecture

Primary route: `/workspace`.

The interface is a studio case file, not a generic dashboard.

### Left rail / studio context
- Studio identity and location
- Case status
- Current primary constraint / active diagnosis
- Current recommendation
- Current intervention status
- Latest outcome status

### Main workflow
A sequential case timeline with the following stages:

1. Observations
2. Evidence
3. Findings
4. Diagnosis
5. Opportunity
6. Recommendation
7. Decision
8. Intervention
9. Outcome
10. Attribution
11. Learning

Each stage shows existing records for the selected studio and exposes only the minimum create/update actions needed to advance the case.

### Workspace home
The initial `/workspace` view lists studios visible to the authenticated user through `studio_members`, plus high-level progression state derived from existing intelligence records.

## Data Model Mapping

The workspace uses existing canonical tables:

- Studio: `visibility_studios`
- Membership: `studio_members`
- Source observations: `studio_source_observations`, `visibility_observations`, and/or `intelligence_evidence` depending on source
- Metrics: `intelligence_metric_values`, `intelligence_metric_definitions`
- Evidence: `intelligence_evidence`
- Findings: `intelligence_findings`
- Diagnoses: `intelligence_diagnoses`
- Opportunities: existing `visibility_opportunities` and existing opportunity-scoring records where applicable
- Recommendations: `intelligence_recommendations`
- Decisions: `intelligence_decisions`
- Interventions: `intelligence_interventions`
- Outcomes: `intelligence_outcomes`
- Attribution: `intelligence_attributions`
- Learning: `intelligence_learning`

No duplicate `workspace_*` tables are introduced unless implementation proves a missing durable concept. UI-only progression state is derived in application code from record existence/status.

## Application Components

### Data access
Create a focused `src/lib/workspace/` module containing typed query/mutation functions. UI components must not scatter raw Supabase queries across the route.

### Route
Create `src/routes/_authenticated/workspace.tsx` as the authenticated shell and studio selector/case view.

### Components
Create focused components under `src/components/workspace/`:

- `WorkspaceShell.tsx`
- `StudioList.tsx`
- `StudioCaseHeader.tsx`
- `IntelligenceTimeline.tsx`
- stage panels for evidence, diagnosis/recommendation, intervention, outcome, and learning

Prefer composable small files over one large route file.

## Mutations

Workspace v1 only needs mutations required to close one real case:

- create evidence
- create/update finding
- create/update diagnosis
- create/update recommendation
- record decision
- create/update intervention
- record outcome
- record attribution
- record learning

All writes include the selected `studio_id`. Database RLS remains authoritative.

## Evidence Semantics

Keep the existing evidence discipline. Workspace labels must distinguish the semantic source of a statement/metric. Existing database classifications are used as stored; UI copy maps them to the established INKSIGHTS evidence vocabulary without pretending modelled/inferred values are observed facts.

## Error Handling

- Public report API returns 400 for malformed IDs/tokens, 404 for no matching published report, and 500 for internal failures without leaking database details.
- Workspace queries show explicit loading, empty, and error states per stage.
- Mutation failures leave the existing record visible and show a non-destructive error message.
- No optimistic mutation is required in v1.

## Verification

Security verification:

- Supabase advisor no longer reports `publish_visibility_report` executable by anon.
- Anonymous browser requests cannot execute the RPC directly.
- A valid public report URL still renders through the same-origin API route.
- Invalid report tokens return no report data.

Workspace verification:

- Unauthenticated user is redirected to `/auth`.
- Authenticated users can see only studios permitted by RLS.
- One selected studio can be progressed through every canonical intelligence stage.
- Each persisted stage record is visible after refresh.
- An actual `intelligence_outcomes` row and corresponding `intelligence_learning` row exist for the pilot studio.

Production verification:

- `npm run lint` passes.
- `npm run build` passes.
- Preview deployment is READY.
- Public marketing routes remain functional.
- Workspace is not linked from the public site navigation.

## Completion Gate

Workspace v1 is complete only when one real studio has:

- source/evidence records,
- a validated finding,
- an active diagnosis,
- a recommendation and decision,
- a completed intervention,
- a measured observed outcome,
- an attribution assessment,
- and a captured learning record.

No integration expansion or additional intelligence module work begins before this gate is satisfied.
