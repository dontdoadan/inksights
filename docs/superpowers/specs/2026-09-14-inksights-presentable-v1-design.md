# INKSIGHTS Presentable v1 — Design Specification

## Objective
Build a presentation-ready, evidence-led INKSIGHTS operating workspace on the existing production architecture without weakening security or fabricating outcomes.

## Product surface
- Public acquisition remains on the existing INKSIGHTS site.
- Authenticated users enter `/workspace`.
- Workspace reads canonical tenant-scoped Supabase intelligence records through RLS.
- When an authenticated account has no studio membership, the UI presents a clearly-labelled demonstration snapshot based on the current verified pilot case, not invented live data.
- The pilot is Off The Rails Tattoo Studio because the canonical database already contains Evidence → Finding → Diagnosis → Recommendation → Decision → Intervention records for that studio.
- Outcome, Attribution and Learning remain visibly gated until real measured records exist.

## Canonical intelligence loop
Observation → Normalisation → Metric → Evidence → Finding → Diagnosis → Opportunity → Recommendation → Decision → Intervention → Outcome → Attribution → Learning.

The workspace must distinguish four states:
1. observed / verified data,
2. calculated or modelled data,
3. hypotheses / recommendations,
4. missing or pending evidence.

## Workspace v1 information architecture
1. Overview — studio, current constraint, data-readiness status, latest evidence.
2. Intelligence Loop — stage-by-stage timeline with object counts/status.
3. Evidence — source, classification, confidence and observed timestamp.
4. Findings & Diagnosis — validated finding and active hypothesis.
5. Opportunities & Recommendations — scored opportunity when available; recommendation otherwise.
6. Interventions — owner, status, baseline window and target.
7. Outcomes & Learning — real measured results only; explicitly pending when absent.
8. Integrations — HubSpot, Stripe, Supabase, GitHub and Vercel status surfaces.
9. System — links to architecture, Figma system atlas and operating documentation.

## Security model
- Browser data access uses the authenticated Supabase client and existing RLS membership policies.
- No service-role key may enter the client bundle.
- Public visibility-report retrieval moves from a browser-executable privileged RPC to a same-origin server route that invokes the RPC with the service role.
- The database permission migration that revokes `anon` execute is staged with the feature branch and applied only after the server route is live in production, preventing a production outage during rollout.
- `studio_source_observations` remains service-only because it has RLS enabled with no client policies.

## Presentation mode
Presentation mode is not a synthetic success case. It uses the real canonical pilot chain that currently exists. It must state that no measured outcome or learning exists yet. The narrative is: INKSIGHTS detected that the current binding constraint is measurement readiness, recommended instrumentation, and the intervention is in progress. The next gate is observed baseline/post-intervention evidence.

## Cross-system architecture
- Supabase: canonical business and intelligence data, auth, RLS.
- GitHub: source of truth, feature branch, migrations, docs, PR workflow.
- Vercel: preview QA and production deploys.
- HubSpot: commercial lifecycle / lead and deal system; mapped to studio and opportunity lifecycle.
- Stripe: payment source; checkout/webhook data feeds the canonical financial evidence path.
- Figma/FigJam: workspace UI specification, design system and system atlas.
- Notion: human-readable operating manual, presentation index, roadmap and decision record.

## Completion criteria
- `/workspace` exists and is protected by the existing auth route group.
- It loads live RLS-scoped studio intelligence for provisioned members.
- It renders the real pilot snapshot honestly when no membership exists.
- The public report route no longer needs a browser-executable privileged RPC once production rollout is completed.
- Architecture, security, data model, client journey and deployment workflow are documented and linked.
- HubSpot and Stripe are audited/mapped without duplicating live commercial objects unnecessarily.
- A Vercel preview is buildable and verified before any merge to `main`.
- No outcome or attribution is marked complete without a real database record.