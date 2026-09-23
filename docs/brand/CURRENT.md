# INKSIGHTS Brand Source of Truth — CURRENT

Status: ACTIVE  
Authority: production implementation  
Canonical website: https://getinksights.co.uk  
Repository: `dontdoadan/inksights`  
Canonical branch: `main`  
Baseline commit when this authority was established: `068f9b1e3b1a4d277102cbc63050d4934270d507`

## Authority rule

The production INKSIGHTS website is the authoritative visual identity.

Brand guidelines, Figma files, decks, PDFs, templates, social assets, reports and other design collateral are **derived representations** of the production implementation. Where a derived asset conflicts with the current production website, production wins unless the production implementation has been explicitly identified and recorded as a defect.

This rule prevents historic brand boards, superseded PDFs or isolated design files from silently overriding the live identity.

## Canonical implementation sources

The primary machine-readable sources are:

- `src/styles.css` — colour tokens, typography, dark/light surfaces, motion, gradients, interaction states and shared visual primitives.
- `public/brand/wordmark.webp` — current production wordmark artwork.
- `public/brand/mark.webp` — current production three-bar mark artwork.
- `public/favicon.svg` — current small-format mark.
- shared components under `src/components` — applied UI patterns.
- production routes under `src/routes` — real use of the system across public/product surfaces.

## Current core identity

### Colour

Dark system:
- Ink Deep — `#0A0F14`
- Ink — `#101B23`
- Ink Elevated / Slate — `#1F2937`
- Signal Teal — `#00E5D1`
- Signal Teal Soft — `#70F4E6`
- Deep Teal — `#00B3A6`
- Cool Grey — `#94A3B8`
- Border — `#344957`
- Light / Foreground — `#F8FAFC`

Editorial light mode:
- Background — `#FFFFFF`
- Surface — `#F8FAFC`
- Raised neutral — `#EAF0F2`
- Foreground — `#0A0F14`
- Accessible Teal — `#00665F`
- Accessible Teal Dark — `#00554F`
- Muted text — `#475569`
- Border — `#D4DEE3`

### Typography

Canonical family: **Poppins**.  
Production weights: 400, 500, 600, 700.  
System fallbacks: `system-ui, sans-serif`.

Display/headings are bold, geometric and tightly tracked. Labels use tracked uppercase styling as a secondary navigation/taxonomy language.

### Identity assets

- Corporate wordmark: `/brand/wordmark.webp`
- Canonical symbol: `/brand/mark.webp`
- Favicon: `/favicon.svg`

The three ascending bars remain the canonical small-format symbol and should read as data / progression / growth.

### Visual language

The active website system includes:
- dark intelligence canvas;
- approximately 70/30 dark-to-light surface balance;
- Signal Teal as focused signal/action, not blanket decoration;
- rounded geometry and large-radius panels;
- dot grids and subtle data grids;
- ambient teal/deep-teal radial fields;
- signal/radar visualisations;
- metric cards, rails and diagnostic/journey structures;
- restrained glow;
- pointer-following ambient light on capable devices;
- hover/click feedback;
- reveal motion;
- strong reduced-motion fallbacks;
- white editorial sections where clarity benefits from contrast.

These are part of the current INKSIGHTS visual identity where they appear as reusable production patterns.

## Brand-kit relationship

The Brand Kit must document and package the production system; it must not redefine it independently.

A valid derived brand kit should include:
1. canonical colour tokens and semantic states;
2. typography rules matching production;
3. current wordmark/mark masters or validated equivalents;
4. dark/light surface rules;
5. UI component examples taken from production;
6. interaction and motion rules;
7. data-visualisation and signal-language rules;
8. accessibility rules;
9. use-case templates;
10. version metadata that identifies the production commit used as the source.

## Conflict resolution

When two brand files disagree:

1. Check current production at `getinksights.co.uk`.
2. Check `src/styles.css` and the relevant production component.
3. Treat material matching production as CURRENT/DERIVED.
4. Treat useful historic material as REFERENCE.
5. Treat conflicting old systems as SUPERSEDED.
6. Do not modify production merely to make an old guide correct.

## Change control

A material production change to any of the following requires a new brand snapshot/changelog entry:
- logo or symbol;
- core colours;
- primary typography;
- light/dark ratio or surface model;
- major recurring component language;
- core interaction/motion grammar.

Routine page composition changes do not create a new brand version unless they introduce a reusable visual pattern.

## Safe-update rule

Brand reconciliation is documentation and packaging work unless a separate production defect has been identified. Do not change runtime behaviour, conversion flows, integrations, forms, analytics, payments, Supabase, authentication or deployment configuration as part of brand reconciliation alone.
