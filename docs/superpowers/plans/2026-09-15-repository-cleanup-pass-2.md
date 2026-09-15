# Repository Cleanup Pass 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove cross-brand public content and stale generated artifacts from the INKSIGHTS repository while preserving historical evidence and production behaviour.

**Architecture:** Keep the current TanStack Start application, Supabase backend history and Lovable-managed integration files intact. Retire consumer tattoo routes through redirects, make the studio-owner resource library consistently B2B, make the sitemap generator the single source of truth, and move retired INKCARE documentation into an explicit archive.

**Tech Stack:** TypeScript, React, TanStack Start, Vite, Supabase, GitHub Actions, Vercel.

**Spec:** Repository `README.md` and `docs/README.md` source-of-truth boundaries.

## Global Constraints

- INKSIGHTS, INKCARE and the personal tattoo business remain separate.
- Do not rewrite or delete applied Supabase migration history.
- Do not remove Lovable-managed integration metadata.
- Do not change production application behaviour outside the explicitly retired consumer content surface.
- All changes must pass the existing GitHub CI suite before integration into `main`.

---

### Task 1: Remove consumer tattoo content from the INKSIGHTS resource surface

**Files:**
- Modify: `src/routes/resources.tsx`
- Modify: `src/routes/guides.full-sleeve-cost-uk.tsx`
- Modify: `src/routes/guides.grey-line-healing-week-by-week.tsx`
- Modify: `src/routes/tools.tattoo-pain-chart-reality-check.tsx`

- [ ] Remove consumer pricing, healing and pain resources from `/resources`.
- [ ] Add the existing `/pricing-benchmark` studio-owner tool to `/resources`.
- [ ] Retain the old consumer URLs as redirects to `/resources` so existing external links do not become dead 404s.

### Task 2: Eliminate stale generated public assets

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `scripts/generate-sitemap.mjs`
- Delete: `scripts/generate-og-images.mjs`
- Delete: `public/sitemap.xml`
- Delete: legacy files under `public/og/`

- [ ] Make `scripts/generate-sitemap.mjs` the only required public-asset generator.
- [ ] Remove consumer routes from the generated sitemap and add `/pricing-benchmark`.
- [ ] Ensure the generator uses `https://getinksights.co.uk`.
- [ ] Stop tracking generated `public/sitemap.xml` and ignore it in Git.
- [ ] Remove unused legacy OG generation code and its unreferenced outputs.

### Task 3: Archive retired INKCARE documentation

**Files:**
- Modify: `docs/README.md`
- Create: `docs/archive/inkcare/README.md`
- Move: `docs/replication/*` to `docs/archive/inkcare/replication/`
- Move: `docs/client-zero/*` to `docs/archive/inkcare/client-zero/`

- [ ] Remove INKCARE folders from the active documentation index.
- [ ] Preserve historical files verbatim in the archive.
- [ ] State explicitly that archived INKCARE material is not current INKSIGHTS architecture, product scope, operating procedure or evidence.

### Task 4: Verify and integrate

- [ ] Compare the cleanup branch to `main` and confirm only intended files changed.
- [ ] Open a pull request to trigger CI.
- [ ] Verify lint, build, generated route-tree integrity, typecheck, Supabase config regression and Edge Function security tests.
- [ ] Verify the Vercel preview deploys successfully.
- [ ] Merge only after all checks pass.
- [ ] Verify the merged `main` commit deploys successfully.
