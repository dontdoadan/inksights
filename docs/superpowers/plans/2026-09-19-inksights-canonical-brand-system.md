# INKSIGHTS Canonical Brand System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and operationalise the canonical INKSIGHTS visual design system in Figma, then publish verified downstream assets to Drive, Canva, and GitHub without changing the approved brand identity.

**Architecture:** Figma becomes the canonical visual source of truth. The build proceeds foundations-first: variables and styles → documentation pages → components → data visualisation → motion/UX → templates/applications → guidelines → downstream exports. Drive receives approved business-facing authorities; Canva receives downstream marketing templates; GitHub receives version-controlled tokens and implementation changes on a protected feature branch only.

**Tech Stack:** Figma Variables + Auto Layout + Components, Poppins, Inter, SVG, JSON/CSS design tokens, React/TanStack Start, Tailwind CSS v4, GitHub, Google Drive, Canva.

**Spec:** `docs/superpowers/specs/2026-09-19-inksights-canonical-brand-system-design.md`

## Global Constraints

- Primary descriptor: **Growth Intelligence for UK Tattoo Studios.**
- Primary brand statement: **Clearer Data. Smarter Decisions. Stronger Studios.**
- Secondary campaign line: **Real Insights. Real Growth.**
- Core colours: Deep Navy `#0B1F3B`, Signal Mint `#2ED3A6`, Clean White `#F8FAFC`, Cool Grey `#CBD5E1`, Ink Black `#0F172A`, Pure White `#FFFFFF`.
- Canonical display typeface: **Poppins**.
- Canonical body/UI typeface: **Inter**.
- Three-rising-bars mark is a supporting signal motif/provisional icon candidate, **not** the official final logo.
- Evidence taxonomy is fixed: VERIFIED / OBSERVED / CALCULATED / MODELLED / HYPOTHESIS.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Radius scale: 8 / 14 / 20 / 28 / 999.
- Minimum target gap between independent visual components: 24px; minimum closely related internal gap: 16px.
- No accidental overlap, clipping, hidden content, decorative obstruction, shrink-to-fit typography, or text touching container edges.
- Display copy uses intentional line breaks; body copy uses controlled maximum measures.
- Figma is the visual authority; Drive owns approved business-facing exports; GitHub owns technical implementation; Canva is downstream production only.
- No direct write to `main`; product-code migration occurs through a feature branch, protected preview, QA, and explicit approval immediately before merge.
- Do not weaken deployment protection, auth, RLS, or security controls.
- Do not merge INKSIGHTS branding with Daniel Hughes Tattoos, INKCARE, or other brands.
- Do not treat the three-bar signal motif as an approved official logo symbol.

## Review Focus

1. **Long or translated-like text strings:** components must wrap or grow predictably without overlap, clipping, or shrink-to-fit; the owning component task must test long labels and multi-line content.
2. **Signal motif vs logo semantics:** any signal-bar usage in navigation, favicons, loaders, or mockups must remain labelled as motif/candidate and never silently become the official logo.
3. **Code-vs-brand token conflict:** the repo currently uses Archivo Black/Hind and approximate OKLCH values; migration must replace those only on a branch and preserve build/runtime behaviour.
4. **Accessibility states:** Mint-on-light, focus visibility, semantic status, reduced motion, keyboard/touch targets, and chart legibility must be checked in the owning tasks.
5. **Responsive clearance:** desktop compositions that look correct must also preserve minimum gaps, wrapping, and readable hierarchy on tablet/mobile examples.

---

## File and System Map

### Figma file to create

`INKSIGHTS — Canonical Brand System`

Planned pages:
- Cover
- Getting Started
- Foundations / Colour
- Foundations / Typography
- Foundations / Grid & Spacing
- Foundations / Radius & Effects
- Foundations / Geometry & Patterns
- Foundations / Photography
- Iconography
- ---
- Components / Navigation
- Components / Buttons
- Components / Forms
- Components / Status & Evidence
- Components / KPI & Metrics
- Components / Findings & Recommendations
- Components / Tables & Filters
- Components / Feedback & States
- Components / Overlays
- ---
- Data Visualisation
- Motion
- UX Patterns
- ---
- Templates / Social
- Templates / Reports
- Templates / Presentations
- Templates / Commercial
- ---
- Applications / Website
- Applications / Product
- Applications / Mobile
- Applications / Mockups
- ---
- Brand Guidelines Source
- Governance / Asset Map

### GitHub files

- Existing: `src/styles.css` — current runtime theme, typography, interactions, reduced-motion rules.
- Create: `src/styles/brand-tokens.css` — canonical CSS custom properties generated from the approved token model.
- Create: `src/lib/brand-tokens.ts` — typed export of canonical brand tokens for application code.
- Create: `src/lib/brand-tokens.test.mjs` — Node built-in test coverage for exact token values and forbidden legacy font names.
- Create: `public/brand/inksights-wordmark.svg` — product-safe text-led wordmark export.
- Create: `public/brand/inksights-signal-motif.svg` — supporting signal motif, explicitly non-final-logo.
- Create: `docs/brand/INKSIGHTS_BRAND_IMPLEMENTATION.md` — technical implementation and governance notes.
- Modify: `src/styles.css` — import/use canonical tokens and switch canonical typography to Poppins/Inter while retaining existing interaction behaviour.
- Modify: `package.json` only if a local test script is required; do not add paid or unnecessary dependencies.

### Drive destination

`INKSIGHTS/06 Marketing & Brand/Brand System`

Required final authorities:
- Brand Guidelines — ACTIVE
- Brand Asset Pack — ACTIVE
- Design Tokens — ACTIVE
- Logo/Wordmark Assets — ACTIVE
- Templates — ACTIVE
- Motion & UX Specification — ACTIVE
- Asset Register / QA Record — ACTIVE

### Canva destination

Existing canonical INKSIGHTS Brand System folder, downstream templates only:
- Social master set
- Presentation master set
- Marketing/report cover assets
- No independent brand-rule authority

---

### Task 1: Create the Canonical Figma File and Discovery Baseline

**Systems:**
- Figma: create `INKSIGHTS — Canonical Brand System`
- GitHub read-only: `src/styles.css`, approved design spec

**Interfaces:**
- Consumes: approved design spec and live repo styling.
- Produces: Figma file key, page/variable/style inventory, library search baseline, state ledger.

- [ ] **Step 1: Load required Figma skills**
  - Load `figma-create-new-file`, `figma-use`, and `figma-generate-library`.
- [ ] **Step 2: Create the new Figma file**
  - Editor type: design.
  - Exact name: `INKSIGHTS — Canonical Brand System`.
- [ ] **Step 3: Record the file key and initialize the build ledger**
  - Persist run ID and every created entity ID in the required design-system ledger.
- [ ] **Step 4: Inspect the blank/new file**
  - List pages, local variable collections, variables, styles, components.
- [ ] **Step 5: Discover accessible libraries**
  - Call Figma library discovery for the new file.
  - Search for reusable icon/component primitives only; do not import branding from unrelated design systems.
- [ ] **Step 6: Verify canonical fonts are available**
  - Check Figma font list for Poppins and Inter.
  - If a style name differs from expected, use the actual available style name while preserving the family.
- [ ] **Step 7: Print and record the Phase 0 gap analysis**
  - Expected baseline: no INKSIGHTS variables/components in the new file.
  - Record current repo conflict: Archivo Black/Hind + approximate OKLCH styling.
  - Resolution: approved Poppins/Inter + exact brand tokens wins for the new system.

**Verification:**
- New Figma file exists and is editable.
- State ledger contains file key and initial page ID.
- Poppins and Inter availability is confirmed before typography creation.
- No existing remote component is silently adopted as brand authority.

---

### Task 2: Build Figma Foundations — Variables, Styles, and Documentation

**Systems:**
- Figma variables/styles/pages.

**Interfaces:**
- Consumes: Task 1 Figma file and locked token values.
- Produces: primitive/semantic variables, text styles, effect styles, foundation pages.

- [ ] **Step 1: Create variable collections**
  - `Primitives` — one Value mode.
  - `Color` — Light and Dark modes.
  - `Spacing` — one Value mode.
  - `Radius` — one Value mode.
  - `Typography` — one Value mode where supported.
  - `Motion` — one Value mode.
- [ ] **Step 2: Create colour primitives**
  - Exact core hex values plus approved navy/mint scales and semantic support colours.
- [ ] **Step 3: Create semantic colour variables**
  - Background, surface, text, border, action, focus, selected, positive, information, warning, risk, neutral.
  - Bind Light/Dark values by aliases to primitives.
- [ ] **Step 4: Create spacing variables**
  - 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- [ ] **Step 5: Create radius variables**
  - 8 / 14 / 20 / 28 / 999.
- [ ] **Step 6: Create motion variables**
  - UI fast 160ms, UI standard 220ms, editorial reveal 360ms, editorial slow 450ms, reduced-motion 1ms-equivalent specification.
- [ ] **Step 7: Set variable scopes and code syntax**
  - No variable may retain `ALL_SCOPES`.
  - Web syntax maps to canonical CSS custom-property names.
- [ ] **Step 8: Create text styles**
  - Display XL / Display L / H1 / H2 / H3 / Body L / Body / Body S / Label / Data KPI.
  - Poppins for display/headings/KPI.
  - Inter for body/UI/metadata.
- [ ] **Step 9: Create effect styles**
  - Soft card shadow.
  - Elevated panel shadow.
  - Mint focus ring/glow kept restrained.
- [ ] **Step 10: Create foundation pages**
  - Colour specimen.
  - Typography scale.
  - Grid/spacing bars.
  - Radius/effects.
  - Geometry/pattern references.
  - Photography treatment.
- [ ] **Step 11: QA each foundation page**
  - Screenshot each page.
  - Check wrapping, minimum clearances, contrast, optical proportions.

**Verification:**
- Variable summary includes every collection, mode, and variable count.
- Style list includes every text/effect style.
- No hardcoded foundation value exists where a variable should exist.
- Foundation screenshots show no overlap or clipping.

---

### Task 3: Build the Iconography and Graphic Language

**Systems:**
- Figma Iconography and Geometry/Patterns pages.

**Interfaces:**
- Consumes: foundations from Task 2.
- Produces: coherent icon family, signal motifs, patterns, imagery rules.

- [ ] **Step 1: Lock icon construction rules**
  - Base grid: 24px.
  - Optical stroke/fill logic consistent across family.
  - Sizes: 16 / 20 / 24 / 32.
  - States: default / active / muted / reverse.
- [ ] **Step 2: Build required icon concepts**
  - Insights, strategy, people, growth, results, location, demand, search, reviews, enquiry, booking, consultation, calendar, deposit, cancellation, no-show, artist, capacity, utilisation, pricing, revenue, retention, repeat client, LTV, conversion, benchmark, evidence, recommendation, intervention, outcome, attribution, trend, alert, report, settings.
- [ ] **Step 3: Validate optical consistency**
  - Compare fill density, stroke weight, bounding-box use, and recognisability.
  - Specifically differentiate Insights and Results.
- [ ] **Step 4: Build graphic motifs**
  - Signal bars, mint orb, directional capsule, dot grid, contour field, data trail, map/grid, evidence marker, chart-derived crop.
- [ ] **Step 5: Create light/dark variants and usage examples**
  - Show opacity, density, crop and overuse guidance.
- [ ] **Step 6: Classify the three-bar treatment**
  - Add explicit documentation: `Signal motif / logo candidate — NOT FINAL LOGO`.

**Verification:**
- Icon set is visually coherent at 16px and 32px.
- Signal motif is never labelled `Logo` or `Official Mark`.
- Pattern examples maintain text clearance and contrast.

---

### Task 4: Build Navigation, Button, and Form Component Families

**Systems:**
- Figma component library.

**Interfaces:**
- Consumes: Task 2 variables/styles and Task 3 iconography.
- Produces: reusable navigation/actions/form components with variable bindings.

- [ ] **Step 1: Search design system libraries for each component name**
  - Search before creating Navigation, Button, Input, Select, Checkbox, Radio, Switch, Tabs.
  - Reuse only if API/token model genuinely matches; otherwise rebuild.
- [ ] **Step 2: Build Navigation family**
  - Header, desktop nav item, mobile nav item, breadcrumb, sidebar item, tabs, segmented control.
- [ ] **Step 3: Build Button family**
  - Styles: primary / secondary / ghost / risk.
  - Sizes: small / medium / large.
  - States: default / hover / pressed / focus / disabled / loading.
  - Optional leading/trailing icon through instance swap.
- [ ] **Step 4: Test long-label resilience**
  - Use a deliberately long CTA string and verify minimum padding remains and no clipping occurs.
- [ ] **Step 5: Build Form family**
  - Input, textarea, select, search, date field, checkbox, radio, switch.
  - States: default / hover / focus / filled / disabled / error / success where relevant.
  - Helper/error copy uses text properties and Auto Layout growth.
- [ ] **Step 6: Test multi-line and error-message wrapping**
  - Use long field labels and long validation messages.
- [ ] **Step 7: Validate every component set**
  - Metadata, variant counts, bindings, screenshots.

**Verification:**
- All component visual properties bind to variables where appropriate.
- Touch-target and focus-state requirements are met.
- Long labels/messages do not overlap or shrink.

---

### Task 5: Build Evidence, KPI, Finding, Recommendation, Table, and Feedback Components

**Systems:**
- Figma component library.

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces: INKSIGHTS-specific product intelligence component families.

- [ ] **Step 1: Build evidence badges**
  - VERIFIED / OBSERVED / CALCULATED / MODELLED / HYPOTHESIS.
  - Do not rely on colour alone; include label and consistent shape/icon logic.
- [ ] **Step 2: Build KPI/metric components**
  - KPI card, benchmark card, delta, confidence indicator, benchmark marker.
- [ ] **Step 3: Build commercial-intelligence cards**
  - Finding, recommendation, opportunity, intervention/outcome summary.
- [ ] **Step 4: Build table/filter family**
  - Table header/cell, selected row, sort state, filter chip, filter bar, pagination.
- [ ] **Step 5: Build feedback/state family**
  - Tooltip, progress, empty, skeleton/loading, success, warning, error.
- [ ] **Step 6: Build overlay family**
  - Modal/dialogue, drawer/panel.
- [ ] **Step 7: Test long content**
  - Long finding titles, multi-paragraph recommendation copy, multi-line table values.
- [ ] **Step 8: Validate component sets**
  - Metadata, screenshots, variable binding, clearances.

**Verification:**
- No component has fixed-height text regions that clip realistic content.
- Evidence meaning is clear in monochrome/grayscale.
- Cards maintain minimum 16px internal and 24px external clearances in examples.

---

### Task 6: Build the INKSIGHTS Data-Visualisation System

**Systems:**
- Figma Data Visualisation page.

**Interfaces:**
- Consumes: Tasks 2, 3, 5.
- Produces: chart patterns and composite analytical views.

- [ ] **Step 1: Build chart primitives**
  - Axes, labels, source/period footer, benchmark label, legend, tooltip.
- [ ] **Step 2: Build chart families**
  - Line, area, grouped bar, stacked bar, funnel, heatmap, cohort/retention, quadrant, opportunity matrix, score gauge, benchmark band, confidence range, location/map representation, before/after.
- [ ] **Step 3: Build data cards**
  - KPI, benchmark, opportunity score, evidence-quality indicator.
- [ ] **Step 4: Apply semantic colour rules**
  - Navy primary, Mint focal, Grey context; semantic colours only for semantic meaning.
- [ ] **Step 5: Add realistic INKSIGHTS examples**
  - Demand, enquiry conversion, booking conversion, utilisation, retention, revenue.
- [ ] **Step 6: Test label density and long category names**
  - No chart may require unreadable microtype.
- [ ] **Step 7: Screenshot and review at intended use size**
  - Report scale, dashboard scale, presentation scale.

**Verification:**
- Every example shows source/period.
- Benchmarks show comparison population when used.
- Charts remain legible at the intended application size.

---

### Task 7: Build Motion and UX Patterns

**Systems:**
- Figma Motion and UX Patterns pages.

**Interfaces:**
- Consumes: Tasks 2–6.
- Produces: interaction/motion specifications and product information flow.

- [ ] **Step 1: Document motion tokens**
  - 160–240ms UI transitions.
  - 300–450ms editorial reveals.
- [ ] **Step 2: Define motion specimens**
  - Signal-bar rise, Mint-orb reveal, chart draw, KPI count-up, badge fade/scale, card lift, section reveal, loading pulse, success sweep.
- [ ] **Step 3: Define reduced-motion equivalents**
  - No essential meaning may depend on animation.
- [ ] **Step 4: Document canonical UX information pattern**
  - Signal → Evidence → Meaning → Opportunity → Recommendation → Action → Measurement.
- [ ] **Step 5: Create UX state examples**
  - Loading, empty, error, success, no-data, stale-data/confidence, disabled.
- [ ] **Step 6: Accessibility review**
  - Focus, motion, contrast, touch targets, status semantics.

**Verification:**
- Every motion specimen has a reduced-motion rule.
- UX examples answer what/why/action/next-step clearly.

---

### Task 8: Build Marketing, Report, Presentation, and Commercial Templates

**Systems:**
- Figma Templates pages.

**Interfaces:**
- Consumes: Tasks 2–7.
- Produces: reusable application templates.

- [ ] **Step 1: Build Social templates**
  - Square, portrait, carousel, LinkedIn landscape, paid ad.
- [ ] **Step 2: Build Report templates**
  - Cover, executive summary, evidence/data-quality, finding, chart, recommendation, intervention, outcome/case-study page.
- [ ] **Step 3: Build Presentation templates**
  - Title, agenda, section divider, data slide, finding slide, recommendation slide, case-study slide, closing/CTA.
- [ ] **Step 4: Build Commercial templates**
  - Proposal cover/content, scorecard, case study, email/newsletter header, document treatment.
- [ ] **Step 5: Run realistic-content stress test**
  - Use real INKSIGHTS language lengths rather than placeholder lorem ipsum.
- [ ] **Step 6: QA all templates at 100%**
  - Verify wrapping, margin, component spacing, no clipping.

**Verification:**
- Templates inherit variables/styles/components rather than duplicating local styling.
- Essential copy remains readable in the final delivery format.

---

### Task 9: Build Website, Product, Mobile, and Real-World Mockups

**Systems:**
- Figma Applications pages.

**Interfaces:**
- Consumes: Tasks 2–8.
- Produces: realistic INKSIGHTS applications.

- [ ] **Step 1: Build responsive website examples**
  - Homepage desktop/mobile.
  - Studio Growth Check.
- [ ] **Step 2: Build product examples**
  - Workspace/dashboard.
  - Studio profile.
  - Finding detail.
  - Recommendation workflow.
  - KPI dashboard.
  - Benchmark/comparison.
  - Report viewer.
- [ ] **Step 3: Build mobile product examples**
  - Core dashboard.
  - Finding/recommendation.
  - Notification/alert.
- [ ] **Step 4: Build physical/digital mockups**
  - Laptop/tablet/mobile, browser preview, social profile/banner, business card, report cover, signage/event backdrop.
- [ ] **Step 5: Validate industry specificity**
  - Remove generic SaaS filler.
  - Use tattoo-studio-specific data and scenarios.
- [ ] **Step 6: Responsive clearance test**
  - Verify edge margins, text wrapping, component gaps at desktop/tablet/mobile widths.

**Verification:**
- Mockups look like one system across marketing, product and reporting.
- No final-logo claim is introduced by favicon/app-icon candidate usage.

---

### Task 10: Build the Final Brand Guidelines Source in Figma

**Systems:**
- Figma Brand Guidelines Source page/frames.

**Interfaces:**
- Consumes: all prior Figma tasks.
- Produces: 32–40 page canonical guideline source ready for export.

- [ ] **Step 1: Build 12-column guideline grid and page masters**
  - Editorial, specimen, application, dark emphasis.
- [ ] **Step 2: Compose the guideline sections**
  - Cover, source board, foundations, logo/wordmark, colour, type, layout, geometry, iconography, patterns, photography, UI, data, motion, UX, social, reports/presentations, web/product/mobile, mockups, governance.
- [ ] **Step 3: Use actual component instances**
  - No screenshots where a Figma component/specimen can remain live/editable.
- [ ] **Step 4: Enforce text wrapping**
  - Intentional display breaks.
  - Controlled body widths.
  - No shrink-to-fit.
- [ ] **Step 5: Run page-by-page visual QA at 100%**
  - Check overlap, clipping, hidden content, edge safety, proportional balance, text size.
- [ ] **Step 6: Run second pass focused only on spacing**
  - 24px independent gap target.
  - 16px internal related gap minimum.
  - No decorative obstruction.

**Verification:**
- Every page passes visual QA.
- No page contains unresolved placeholder content.
- Three-bar motif status is correctly described.

---

### Task 11: Export and File the Canonical Business Assets in Google Drive

**Systems:**
- Figma export.
- Google Drive canonical folder.

**Interfaces:**
- Consumes: approved Figma outputs from Task 10.
- Produces: Drive authorities and Master File Register entries.

- [ ] **Step 1: Export final business-facing assets**
  - Brand Guidelines PDF.
  - Brand Asset Pack ZIP.
  - SVG/PNG wordmark assets.
  - Signal motif assets labelled non-final-logo.
  - Design Tokens JSON/CSS.
  - Motion & UX specification.
  - QA record.
- [ ] **Step 2: File assets under**
  - `INKSIGHTS/06 Marketing & Brand/Brand System`.
- [ ] **Step 3: Use human-facing status names**
  - `ACTIVE` only after founder approval.
  - Until then use `DRAFT` or `FINAL FOR APPROVAL` as appropriate.
- [ ] **Step 4: Archive superseded active duplicates**
  - Do not delete uncertain historical assets.
- [ ] **Step 5: Log durable files**
  - Update `08 Operations/File Management/Master File Register — ACTIVE`.
- [ ] **Step 6: Read back Drive state**
  - Verify location, names, permissions, and one-authority rule.

**Verification:**
- No loose brand assets.
- One obvious current authority per asset family.
- Master File Register reflects all new durable assets.

---

### Task 12: Create Downstream Canva Production Templates

**Systems:**
- Canva canonical INKSIGHTS Brand System folder.

**Interfaces:**
- Consumes: approved Figma templates.
- Produces: editable downstream marketing templates.

- [ ] **Step 1: Import approved social template set**
- [ ] **Step 2: Import approved presentation master set**
- [ ] **Step 3: Import marketing/report-cover assets**
- [ ] **Step 4: File each design in the existing canonical Brand System folder**
- [ ] **Step 5: Verify Canva does not become a source of conflicting brand rules**
  - Brand rules remain in Figma/Drive.

**Verification:**
- Canva files visually match Figma masters.
- No old logo/colour/font treatment remains in the new active template set.

---

### Task 13: Prepare the GitHub Canonical Token Layer

**Files:**
- Create: `src/styles/brand-tokens.css`
- Create: `src/lib/brand-tokens.ts`
- Create: `src/lib/brand-tokens.test.mjs`
- Create: `public/brand/inksights-wordmark.svg`
- Create: `public/brand/inksights-signal-motif.svg`
- Create: `docs/brand/INKSIGHTS_BRAND_IMPLEMENTATION.md`
- Modify: `src/styles.css`
- Modify: `package.json` only if needed for the token test command

**Interfaces:**
- Consumes: final Figma/Drive token exports.
- Produces: code-level brand contract for later product migration.

- [ ] **Step 1: Write the failing token contract test**
  - Assert exact core colours.
  - Assert display family is Poppins and body family is Inter.
  - Assert exported token source contains no `Archivo Black` or `Hind`.
  - Assert signal motif metadata says it is not the final official logo.
- [ ] **Step 2: Run the test and verify it fails**
  - Expected failure: canonical token files do not exist yet.
- [ ] **Step 3: Create `brand-tokens.css`**
  - Define exact core primitives, semantic aliases, spacing, radii, typography variables, motion variables.
- [ ] **Step 4: Create typed `brand-tokens.ts`**
  - Export the same canonical values and evidence states.
- [ ] **Step 5: Add wordmark and signal-motif SVGs**
  - Signal motif file comments/metadata explicitly identify it as non-final logo.
- [ ] **Step 6: Run the token contract test**
  - Expected: PASS.
- [ ] **Step 7: Update `src/styles.css`**
  - Import canonical token CSS.
  - Replace the old Archivo Black/Hind font declarations with Poppins/Inter.
  - Map existing interaction layer to canonical variables without removing behaviours.
  - Preserve reduced-motion support.
- [ ] **Step 8: Add technical implementation documentation**
  - Describe Figma/Drive/GitHub/Canva authority boundaries and signal-motif status.
- [ ] **Step 9: Run verification**
  - `npm run lint`
  - `npm run build`
  - token contract test
- [ ] **Step 10: Commit on a feature branch**
  - Do not merge to `main`.

**Verification:**
- Exact token values match Figma/Drive exports.
- Build and lint pass.
- Legacy font declarations are absent from canonical token layer.
- Interaction/reduced-motion CSS remains functional.

---

### Task 14: Protected Preview and End-to-End Visual QA

**Systems:**
- GitHub branch.
- Vercel protected preview.
- Browser QA.

**Interfaces:**
- Consumes: Task 13 branch.
- Produces: verified implementation evidence and merge recommendation.

- [ ] **Step 1: Deploy branch to protected preview**
  - Do not weaken deployment protection.
- [ ] **Step 2: Test desktop viewport**
  - Homepage, navigation, forms, cards, data UI, content pages.
- [ ] **Step 3: Test tablet/mobile viewports**
  - Verify wrapping, gaps, readable sizes, touch targets.
- [ ] **Step 4: Check console/runtime errors**
- [ ] **Step 5: Compare implementation against Figma**
  - Colour, type, spacing, radii, interaction states.
- [ ] **Step 6: Verify reduced-motion behaviour**
- [ ] **Step 7: Capture screenshots and log deviations**
- [ ] **Step 8: Fix deviations on the branch and repeat QA until clean**
- [ ] **Step 9: Produce merge-readiness report**
  - Configured / verified / residual risks / merge gate.

**Verification:**
- Protected preview remains protected.
- No visual collision/clipping regressions.
- No security weakening.
- No merge occurs without explicit founder approval immediately before merge.

---

### Task 15: Final Cross-System Verification and Canonicalisation

**Systems:**
- Figma
- Google Drive
- Canva
- GitHub
- Vercel preview

**Interfaces:**
- Consumes: Tasks 1–14.
- Produces: final canonical brand-system status.

- [ ] **Step 1: Verify Figma source**
  - Variables, styles, components, pages, naming, no hardcoded brand values where tokens exist.
- [ ] **Step 2: Verify Drive source**
  - Final approved authorities filed and logged.
- [ ] **Step 3: Verify Canva downstream assets**
  - Match approved source and are correctly filed.
- [ ] **Step 4: Verify GitHub technical source**
  - Token tests/build/lint pass.
- [ ] **Step 5: Verify Vercel protected preview**
  - Brand implementation visually matches the canonical system.
- [ ] **Step 6: Run one-authority audit**
  - No duplicate active authority, no final-logo claim for signal motif.
- [ ] **Step 7: Produce final founder approval packet**
  - Brand Guidelines PDF.
  - Asset Pack.
  - Figma link.
  - Canva folder/design links.
  - GitHub branch/PR.
  - Preview URL.
  - QA record.
  - Clear merge approval gate.

**Definition of completion:**
- Canonical Figma system complete.
- Durable brand assets filed and logged.
- Canva downstream templates present.
- GitHub implementation verified on protected preview.
- Final logo symbol remains explicitly unresolved.
- No overlap, clipping, hidden content, unreadable sizing, or unsafe clearance in approved examples.
- Production merge remains pending until explicit founder approval.
