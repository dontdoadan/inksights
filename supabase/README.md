# Supabase database source of truth

Production project: `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`)
Region: `eu-west-2`

## Policy

- Production database changes must be represented by versioned migrations.
- Do not make undocumented schema changes directly in the Supabase dashboard.
- Never commit database passwords, service-role/secret keys, or other credentials.
- Production data is never used for destructive development work.

## Current production migration history

The production project currently reports these migrations:

- `20260824003951_create_tattoo_enquiries`
- `20260827222530_lock_down_rls_auto_enable`

The repository is being brought into alignment with this history. Do not create a second baseline migration for the same schema. Before the next production schema change, pull/synchronise the authoritative migration files with the Supabase CLI and commit them here.

## Development workflow

1. Make schema changes in a development/local database.
2. Generate a migration with the Supabase CLI.
3. Review the SQL and RLS policies.
4. Commit the migration to a feature branch.
5. CI validates the application.
6. Merge through the GitHub PR process.
7. Apply the reviewed migration to production as part of the release process.

## Current database scope

The production public schema currently contains the `enquiries` table. Its public insert policy requires consent plus basic name/email validation. RLS is enabled.
