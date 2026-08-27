# INKSIGHTS Infrastructure Architecture

## Canonical production chain

`GitHub main` -> `Vercel production` -> `Supabase INKSIGHTS`

External business services are integrated at the application layer:

- Stripe: payments and billing
- HubSpot: CRM and commercial workflow
- OpenAI: AI and intelligence capabilities

## System ownership

| Layer | System | Role | Source of truth |
|---|---|---|---|
| Source control | GitHub `dontdoadan/inksights` | Application source, history, CI | Yes |
| Production hosting | Vercel `inksights` | Build, preview and production deployment | Deployment target |
| Database/backend | Supabase `INKSIGHTS` | PostgreSQL, Auth, Storage, APIs | Yes for application data |
| Payments | Stripe | Customers, products, prices, subscriptions, payments | Yes for payment state |
| CRM | HubSpot | Commercial/customer lifecycle | Yes for CRM state |
| AI | OpenAI | AI services and automation | Service layer |

## Git strategy

- `main` = production source of truth.
- `develop` = integration/development branch.
- `feature/*` = isolated feature work.
- `fix/*` = isolated bug fixes.
- Changes should reach `main` through pull requests once branch protection is enabled.

## Environment strategy

### Production

- Git branch: `main`
- Vercel environment: Production
- Supabase project: `INKSIGHTS`
- Production data must never be used for destructive experimentation.

### Development

- Git branch: `develop` or `feature/*`
- Local application development uses local environment variables.
- Supabase schema changes should be represented by migration files and committed to Git.
- Supabase hosted branching is optional and should not be introduced while maintaining the current free-tier objective unless there is a clear need.

## Secrets

Never commit API keys, service-role keys, database passwords, OAuth secrets or other credentials.

Browser-exposed configuration may use publishable/public keys where appropriate. Supabase service-role/secret keys and Stripe secret keys must remain server-side.

## Deployment principle

A change becomes production software only after:

1. Code is committed to a feature/fix branch.
2. The branch is tested.
3. A pull request is reviewed.
4. The pull request is merged into `main`.
5. Vercel deploys the resulting `main` commit.
6. Database changes are applied through versioned Supabase migrations.

## Current baseline

- GitHub repository: `dontdoadan/inksights`
- Production branch: `main`
- Development branch: `develop`
- Vercel project: `inksights`
- Supabase project: `INKSIGHTS`
- Supabase region: `eu-west-2`

The Studio Intelligence Map is a core product surface. Studio data should ultimately be served from Supabase rather than hard-coded frontend demonstration records.
