# INKSIGHTS Production Audit — 2026-08-29

## Executive status

The INKSIGHTS repository is serviceable but has accumulated architectural drift from earlier product iterations. Production should remain stable while the application is consolidated around the revenue-intelligence SaaS proposition.

## Canonical production path

```text
GitHub dontdoadan/inksights (main)
        ↓
Vercel project inksight-main
        ↓
getinksights.co.uk / www.getinksights.co.uk
        ↓
Supabase project INKSIGHTS (ukaxsqwnkoqbbsufpzga)
```

Lovable projects are retained only as design/prototype references. They are not production hosts.

## GitHub findings

- Canonical repository: `dontdoadan/inksights`.
- Repository is public. This should be reviewed before proprietary intelligence algorithms, customer datasets or sensitive operational data are added.
- Default branch: `main`.
- Additional branches currently include `develop`, `feat/website-rebuild-v1` and `vercel/install-vercel-web-analytics-isfjr8`.
- `develop` has diverged from `main` and must be reconciled or retired before it is used as a parallel development source.
- The active website rebuild is isolated in `feat/website-rebuild-v1` and must remain unmerged until preview and CI validation pass.
- The repository contains legacy Lovable files/dependencies and automation assets. These must be classified before removal rather than deleted blindly.
- The project is a TanStack Start + Vite application with React, Tailwind, Supabase, Stripe and other existing product infrastructure.
- CI currently runs lint, build, typecheck and the social automation test suite for pull requests targeting `main`.

## Vercel findings

- Canonical production project: `inksight-main`.
- A second Vercel project named `inksights` has previously reported a `vite: command not found` build failure and should be treated as a duplicate/legacy project pending dependency verification.
- Preview deployments currently inherit application-level canonicalisation logic. The application previously redirected Vercel preview hosts to `getinksights.co.uk`, which made preview review impossible. This has been corrected on the rebuild branch by treating `*.vercel.app` as a non-canonical preview host.
- Vercel API access from the current connector session is presently returning a 403 scope/authentication error for `team_dontdoadan`, so deployment inventory/runtime-error verification remains pending re-authentication.
- `vercel.json` explicitly sets the framework to `tanstack-start`, which is the repository source of truth.

## Supabase findings

- Canonical project: `INKSIGHTS`, region `eu-west-2`.
- Status: `ACTIVE_HEALTHY`.
- Current exposed public application schema contains one table: `public.enquiries`.
- `public.enquiries` has RLS enabled and currently contains zero rows.
- The table is structured around tattoo-client enquiry fields rather than the future B2B Studio Growth Check / studio intelligence model. It should therefore be treated as transitional legacy application data, not the final product schema.
- No Edge Functions are currently deployed.
- Security advisor: no current lints.
- Performance advisor: two unused indexes on `public.enquiries` (`enquiries_created_at_idx`, `enquiries_status_idx`). Do not remove until the final query patterns are established.
- The previously identified `rls_auto_enable()` privilege issue has been remediated; its execute privilege remains restricted to privileged roles.

## Architecture decisions

### Public website

- Homepage: revenue-intelligence proposition.
- Primary CTA: Studio Growth Check.
- Product education and proof.
- Public UK Studio Map as a separate resource.

### Private application

- Authenticated studio intelligence.
- Integrations, metrics, benchmarking, opportunity detection, recommendations, reporting and billing.

### Data platform

- Canonical studio identity.
- Geographic data.
- Public studio profiles.
- Claims and verification.
- Observations and provenance.
- Benchmarks and market intelligence.

## Clean-up decisions

1. Keep `dontdoadan/inksights` as the only production GitHub repository.
2. Keep `main` as the production source of truth.
3. Keep `inksight-main` as the canonical Vercel project, subject to final verification once Vercel connector access is restored.
4. Keep the `INKSIGHTS` Supabase project as the canonical backend.
5. Keep Lovable projects as references only.
6. Do not introduce another parallel production repository or hosting project.
7. Do not hard-code production studio records into frontend components.
8. Do not remove legacy repositories, branches, dependencies or data until their dependency/reference status is verified.
9. Reconcile or retire the diverged `develop` branch.
10. Remove the duplicate/legacy Vercel project only after confirming no production or preview dependency remains.

## Immediate blockers

- Preview routing must be validated after the `*.vercel.app` canonicalisation fix.
- CI must return green on the rebuild branch.
- Vercel connector scope must be re-authenticated before a complete deployment/runtime audit can be signed off.

## Next technical work

1. Complete preview and CI validation of the website rebuild.
2. Reconcile GitHub branches and establish a single development workflow.
3. Remove/replace legacy Lovable runtime dependencies where they are no longer required.
4. Build the canonical Supabase studio-intelligence schema in a controlled migration sequence.
5. Replace demonstration Studio Map records with Supabase-backed data.
6. Implement Growth Check persistence, scoring and CRM handoff.
7. Instrument website and product conversion events.
8. Establish production QA and release gates before merging the rebuild.
