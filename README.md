# INKSIGHTS

## Production architecture

INKSIGHTS is the intelligence and growth platform for UK tattoo studios.

The production source of truth is this GitHub repository:

- GitHub: `dontdoadan/inksights`
- Production hosting: Vercel project `inksights`
- Primary database/backend: Supabase project `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`)
- Payments: Stripe
- CRM: HubSpot
- AI/automation: OpenAI

## Source-of-truth policy

GitHub `main` is the canonical application source. Vercel deploys production from this repository. Lovable projects are design/prototyping references only and are not production hosts.

The Studio Intelligence Map is a core INKSIGHTS product surface. Its production data should come from Supabase rather than hard-coded frontend demonstration records.

## Current product direction

The public product is being built around:

1. UK tattoo-studio intelligence
2. Interactive studio map and search
3. Studio-level intelligence profiles
4. Studio Growth Check / diagnosis
5. Growth systems, implementation and benchmarking
6. Future subscription intelligence products

## Development

Install dependencies and run the application locally with:

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

## Deployment

Production deployment is managed by Vercel through the GitHub integration. The application uses TanStack Start with Vite and is configured for Vercel deployment.

## Data and security

Supabase RLS is required on exposed application tables. Privileged database functions must not be executable by `anon` or `authenticated` unless explicitly designed as public APIs. Never expose service-role or secret credentials to browser code.

The legacy `rls_auto_enable()` database helper remains restricted to `postgres` and `service_role`; it is not a public API.
