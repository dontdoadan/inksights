# Studio scoring and progressive identity — v1

**Status:** Feature branch implementation; no production migration or release approved.
**Canonical studio:** `public.visibility_studios.id` (never generate a second studio record because of a tool submission).
**Existing intelligence substrate:** `intelligence_metric_definitions`, `intelligence_metric_values`, `intelligence_evidence`, `intelligence_calculation_runs`, `intelligence_interventions`, `intelligence_outcomes` and existing studio membership/verification records.

## Product contract

A studio has one canonical ID across public observations, authenticated answers, model assessments, score snapshots, audit deliverables, interventions and eventual outcomes. Two different scoring products use that same ID but do **not** share evidence privileges:

| Model | Intended audience | Evidence eligibility | Category weights | Minimum coverage |
| --- | --- | --- | --- | --- |
| `public_presence` v1 | Public Growth Check, acquisition and studio snapshots | Public observations with an approved empirical cohort or documented, versioned, published rubric | Visibility 25%, positioning 25%, reputation 12.5%, website/booking 37.5% | 70%, with evidence in every category |
| `verified_commercial` v1 | Authenticated paid audit and ongoing monitoring | Explicitly reviewed/accepted first-party metrics; public criteria may also be reviewed in this tier but may not be asserted as private economics | Visibility 10%, positioning 10%, reputation 5%, website/booking 15%, demand 5%, conversion 15%, capacity 10%, revenue 15%, retention 10%, operations 5% | 75%, with evidence in every category |

Weights are **product policy proposals**, not statistically validated drivers of studio revenue. Both models must be calibrated against actual customer outcomes before claims of predictive validity. The existing `studio_commercial_health` constraint-first diagnostic and opportunity scoring remain independent of these headline scores.

## Data lineage

- `visibility_studios` represents the location-level canonical studio. `studio_members` is the sole current browser authorisation authority; public website visitors must never acquire membership by supplying a name, website or email.
- `studio_legacy_identity_links` provides an explicit reviewed mapping from the older `studios` table to `visibility_studios`. Do not modify or delete existing IDs.
- `public_tool_submissions.studio_id` is still the **legacy** studio FK; the new `canonical_studio_id` is separate. It remains null until server-side identity reconciliation is approved. Do not match a submitted studio name alone. The service-role-only `reconcile_reviewed_studio_submissions_v1(legacy_studio_id)` function checks for an explicit link with nonempty review evidence, refuses conflicting destinations and then attaches previously saved tool submissions to the canonical ID. It does not reclassify those submissions as verified operational evidence.
- `studio_profile_answers` contains the most recent answer per studio and field; `studio_profile_answer_history` records revisions including previous/new periods. It is not itself the authoritative time-series fact table for trend statistics: validated monthly events and calculation runs must be persisted into existing metric/evidence tables by the scheduled normalisation process.
- Authenticated studio owners can insert/update *their own* `studio_reported/unverified` answers. They cannot change a verified, staff-reviewed or disputed answer, forge a source link or promote self-reports into verified observations.
- Server staff/service-role reconciliation may review answers, insert canonical `intelligence_metric_values`, and attach `intelligence_evidence` and `studio_scoring_metric_assessments`. These actions must preserve submission provenance, dates, verification method and currency.
- Assessments are append-only and tied to a model rule. Only `accepted` assessments with the right source tier and a documented `EMPIRICAL` benchmark or `PUBLISHED_RUBRIC` are eligible.
- `calculate_studio_score_v1` is a service-role-only, security-invoker SQL RPC. It creates an immutable snapshot. A score is **null** unless the minimum evidence coverage is reached and every scored dimension is represented.
- Supabase RLS limits score and profile reads to active studio members. A future anonymous Growth Check result must be a strictly server-projected **public-only** subset; never grant anonymous read access to tenant tables.

## Member workflow

1. The existing authenticated workspace loads the canonical studio via `studio_members`.
2. The workspace fetches the latest scoring snapshots and current profile answers under the studio member's JWT/RLS.
3. Existing self-reported operational figures populate the form; an owner supplies only changed figures and selects their measurement month.
4. The form validates numeric ranges and compatible cohort/capacity counts, then submits only modified rows. A database trigger records audit history.
5. These inputs are deliberately marked `unverified`; their submission does not itself generate a score or a public benchmark.
6. Following independent review, canonical metric values and evidence link to accepted metric-scoring assessments. The trusted scoring service invokes the calculation function.
7. New snapshots enable pre/post comparison without rewriting historical scores. Intervention attribution remains in the existing `intelligence_attributions` layer and must not assume causal improvement.

## Important limitations before production release

1. **Legacy-to-canonical link:** Public pricing and visibility tools currently send anonymous submissions to their own functions. The new FK column enables the join but those functions do not yet reconcile studio identities. Build an explicit verified claim flow or high-confidence owner-approved linkage; no silent joins.
2. **Model calibration:** 35 slots are seeded, but no score observations or benchmark distributions are generated. Create reviewer-approved rubrics or defensible empirical cohorts before producing scores.
3. **Input-to-metric normalisation:** New authenticated answers must be reviewed/validated into the existing metric dictionary; self-reported entries must never be automatically treated as independently verified. The database enforces a five-field numeric self-report allowlist, reporting periods and the `2026-11-profile-v1` data-use acknowledgement.
4. **Release:** Apply the migration *after* preview and SQL review, check Security and Performance Advisors, and deploy the workspace only after schema migration succeeds. The frontend displays an unavailable state if the migration is missing.
5. **Privacy:** Confirm data-processing notice wording, retention schedule, deletion rights and purpose limitations before collecting studio financial data at scale. Tenant rows are private even if a model is called “Public Presence.”

## Database verification queries after migration (read-only)

```sql
select model_key,version,tier,min_coverage,status
from public.studio_scoring_models order by model_key,version;

select m.model_key,sum(d.dimension_weight) as total_dimension_weight,
       count(distinct d.dimension_key) as dimension_count
from public.studio_scoring_models m
join public.studio_scoring_dimensions d on d.model_id=m.id
group by m.model_key;

select m.model_key,count(*) as metric_slots
from public.studio_scoring_metric_rules r
join public.studio_scoring_models m on m.id=r.model_id
group by m.model_key;

select relname,relrowsecurity
from pg_class where relnamespace='public'::regnamespace
and relname in ('studio_profile_answers','studio_profile_answer_history',
'studio_scoring_models','studio_scoring_dimensions',
'studio_scoring_metric_rules','studio_scoring_metric_assessments',
'studio_scoring_snapshots','studio_legacy_identity_links');

select routine_name from information_schema.routines
where routine_schema='public' and routine_name='calculate_studio_score_v1';
```

### Acceptance gates

- [ ] Migration dry-run and rollback validated in a staging database, with no pre-existing rows modified
- [ ] Identical `visibility_studios.id` on both model snapshots
- [ ] Positive tenant test: authenticated member can read and save only self-reported, unverified answers; audit history includes periods
- [ ] Negative tenant test: another studio's answers, history and scores cannot be read or changed
- [ ] Negative tenant test: an owner cannot change `verification_status` to `verified` or update an already verified answer
- [ ] Anonymous tool data cannot be linked to a studio merely by name/domain guess
- [ ] Missing evidence produces `status=insufficient_data` and `score=null`, never 0 or 100
- [ ] Model tier, rule state, accepted review and benchmark/rubric reference are checked
- [ ] Existing Growth Check, pricing benchmark, visibility scorecard, Stripe checkout, HubSpot and private workspace still work
- [ ] Production advisors clear of *new* high-severity findings and GitHub CI and Vercel preview pass

See `docs/intelligence/benchmark-cohort-specification-v1.md` for empirical-versus-directional benchmark governance.
