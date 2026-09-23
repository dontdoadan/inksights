# INKSIGHTS

## Canonical architecture

INKSIGHTS is the revenue-intelligence platform for UK tattoo studios with 3+ artists.

The core proposition is simple: identify hidden revenue opportunities inside a studio and help the owner act on them.

### Production source of truth

- GitHub: `dontdoadan/inksights`
- Production hosting: Vercel project `inksight-main`
- Primary database/backend: Supabase project `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`)
- Payments: Stripe
- CRM: HubSpot
- AI/automation: OpenAI

GitHub `main` is the canonical production application source. Vercel deploys production from this repository. Lovable projects are design/prototyping references only and are not production hosts.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/routes/` | TanStack Start public, authenticated and API routes. |
| `src/components/` | Reusable React/UI components. |
| `src/hooks/` | Shared React hooks. |
| `src/lib/` | Cross-cutting application utilities and domain helpers. |
| `src/integrations/` | External-system adapters, including Supabase and Lovable integration code. |
| `supabase/functions/` | Server-side Edge Functions and intelligence workloads. |
| `supabase/migrations/` | Versioned database history. Applied migrations are historical evidence and must not be deleted casually. |
| `scripts/` | Build-time and repository maintenance scripts. |
| `tests/` | Repository-level regression tests. |
| `docs/` | Current documentation, evidence, implementation plans and archive notes. Start with `docs/README.md`. |
| `.github/workflows/` | CI/CD and repository automation. |
| `.lovable/` | Lovable-managed project/integration metadata. Treat as integration-managed infrastructure. |
| `public/` | Static public assets. |

### Repository hygiene

- Keep INKSIGHTS application code, operating systems and content separate from INKCARE, personal tattoo-business and other brand material.
- Retired implementations should be removed from the active tree or explicitly archived; do not silently relabel legacy code as current INKSIGHTS functionality.
- Dated audits and release documents are evidence snapshots, not automatic statements of current production state.
- Preserve applied database migrations even after a feature is retired.
- Avoid duplicate sources of truth. Link to the canonical document instead of copying architecture or business rules into multiple files.
- npm is the canonical local-development and CI workflow. `bun.lock` and `bunfig.toml` are retained for compatibility with the connected Lovable tooling and are not the CI dependency source of truth.

## Product architecture

### 1. Public website

Acquisition, education and product positioning:

- Homepage
- Product / intelligence pages
- Studio Growth Check
- Resources
- Proof
- About
- Public UK Studio Map

### 2. INKSIGHTS application

Private studio intelligence:

- Studio accounts and membership
- Integrations
- Revenue analytics
- Booking analytics
- Client and retention analytics
- Artist and capacity performance
- Benchmarking
- Opportunity detection
- Recommendations and AI-assisted analysis
- Reporting and alerts
- Billing

### 3. Data platform

The underlying intelligence layer:

- UK studio identity dataset
- Locations and geographic data
- Public studio profiles
- Claim and verification state
- Data provenance and observations
- Historical observations
- Benchmarks
- Market intelligence

The Studio Map is a separate public resource and acquisition surface. It must not be treated as the primary homepage proposition.

## Development source-of-truth policy

Use this workflow for application changes:

```text
feature branch
    ↓
Vercel preview
    ↓
QA / visual review
    ↓
Pull Request
    ↓
merge to main
    ↓
Vercel production
```

Do not make production-only changes directly in the live environment unless they are emergency fixes. Prefer version-controlled changes through GitHub.

## Local development

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
```

Lint:

```sh
npm run lint
```

Typecheck:

```sh
npx tsc --noEmit
```

## Deployment

Production is managed by Vercel through the GitHub integration. The application uses TanStack Start with Vite and is explicitly configured for the `tanstack-start` Vercel framework preset in `vercel.json`.

Preview deployments must remain accessible on their Vercel host and must never redirect to the canonical production domain.

## Data and security

Supabase RLS is required on exposed application tables. Privileged database functions must not be executable by `anon` or `authenticated` unless explicitly designed as public APIs. Never expose service-role or secret credentials to browser code.

The legacy `rls_auto_enable()` database helper remains restricted to `postgres` and `service_role`; it is not a public API.

## Current backend state

The canonical Supabase project is healthy and now contains the studio-intelligence, audit, integration, website-conversion and operating-system registries required by the current product architecture. The live database migration ledger is production evidence; the checked-in `supabase/migrations/` history must remain reconciled with it.

Founder operating state uses the service-role-only `ops_*` layer. Studio/customer intelligence remains in its domain-specific schemas and tables; the founder interface must project canonical state rather than duplicate it.

See `docs/founder-operating-system.md` for the operating model, source-of-truth boundaries, command workflows and governance rules.

Do not hard-code production studio records into frontend components. Application surfaces should consume canonical data from Supabase.

## Architecture decisions

- Target ICP: single-location UK tattoo studios with 3+ artists.
- Core commercial proposition: hidden revenue opportunity detection and action.
- The Growth Check is the primary free acquisition mechanism.
- The Studio Map is a separate public resource and future claim/verification funnel.
- The dashboard is a product demonstration, not a substitute for the real application.
- Demonstration financial figures must be explicitly labelled as illustrative until backed by customer data.
