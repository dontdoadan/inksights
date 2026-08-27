# INKSIGHTS Development Workflow

## Branches

Use short-lived branches for individual changes:

- `feature/<name>` for new functionality
- `fix/<name>` for defects
- `chore/<name>` for maintenance
- `docs/<name>` for documentation-only work

Start feature branches from `develop` while the project is being actively built.

## Pull requests

Pull requests should explain:

- what changed
- why it changed
- affected systems
- testing performed
- database migration requirements
- environment-variable changes
- deployment considerations

## Commit convention

Prefer small, meaningful commits using an action-oriented description, for example:

- `feat: add studio map search`
- `fix: prevent duplicate enquiry submission`
- `refactor: move studio data access into repository layer`
- `docs: document database architecture`
- `chore: update dependencies`

## Production rule

Do not use `main` as an experimental workspace. `main` represents the version that is permitted to deploy to production.

## Database rule

Once the Supabase migration workflow is established, schema changes must be captured as migration files and committed alongside the application change. Do not rely on undocumented manual edits to the production database.

## Verification checklist

Before merging:

- application builds successfully
- lint passes
- affected functionality has been tested
- no secrets are present in tracked files
- database migrations are present when schema changes are involved
- environment-variable changes are documented
- production-impacting changes are explicitly identified
