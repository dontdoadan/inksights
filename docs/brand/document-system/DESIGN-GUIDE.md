# INKSIGHTS — Document Design Specification and Reuse Guide

**Design-system ID:** INKSIGHTS-DOCSYS-001 · **Version:** 1.0 · **Date:** 2026-10-22 · **Status:** DERIVED, print/PDF layout authority.

## Authority and boundaries

Inherit visual identity from `docs/brand/CURRENT.md`, `docs/brand/brand-manifest.json`, `src/styles.css` and current `public/brand/logo-v3/` masters. The **production website takes precedence** for brand identity. These files are authoritative for A4 document **geometry and production workflow**, not for overriding website colours, assets or commercial content. Do not change application routes, forms, payments, authentication or production branding while updating PDFs.

## Shared master page grid

* ISO A4 portrait: **595.28 × 841.89 pt**. All coordinates below are measured **from the page top**.
* Main editorial content **x=49–546 pt**, width **497 pt**; y=175–780 pt.
* Dark header y=0–75 pt. Eyebrow at (50,24). Page identifier at (50,45). Headline at (49,99), body introduction at (49,138), decorative signal rule at y=166.
* Shared footer rule y=784; text begins x=49,y=795. Page badge x=502,y=791, width 42, height 22.
* Base vertical rhythm **4 / 8 / 12 / 16 / 24 / 32 / 48 pt**. Components use measured internal padding; do not use incidental text whitespace for layout.
* Cards radius 11–12pt; strokes around 0.75pt; **12pt** minimum sibling gap. A callout has a 4pt signal rail and 16pt text inset. Fields: 27pt outer height, radius 7pt, 0.85pt border, 3pt inner annotation inset and at least 8pt field-to-field gap.
* Tables: dark header height 42pt; default row height 48pt. Wrap text before final row-height calculation. Move overflow to a new page instead of reducing type below readability.
* Body copy should stay around **9.5–10pt** with ~1.4 leading; Poppins 400/500/600/700 is canonical. Page headings 22.5pt, labels 7.4pt and footer 7pt.

## Exactly six master variants

1. **Dark photographic cover.** Official primary logo on a dark canvas. Left-aligned hero starts (40,151) with 263pt title width; image panel starts x=312,y=91. Solid contrast beneath all text; never place body copy across detailed photographs.
2. **Light worksheet.** Dark 75pt branded header, white editorial body, repeated 497pt content grid, form fields and identical footer.
3. **Light table worksheet.** Inherits shell; tables use consistent column gutters, row heights and real units, with footnotes below.
4. **Light checklist.** Inherits shell; item/checkbox alignment is constant and every wrapped item has adequate row height.
5. **Light results/decision.** Inherits shell; measured recommendation cards, labelled scores, evidence and field areas that cannot collide.
6. **Dark closing/CTA.** Shared title, three-step IDENTIFY → VALIDATE → INTERVENE sequence, approved official URL, full accessible contrast.

A long-form report may introduce a seventh variant only via an explicit versioned specification amendment and regression test across existing templates.

## Current colour tokens

On dark: Ink Deep `#0A0F14`, Ink `#101B23`, Raised `#1F2937`, Signal Teal `#00E5D1`, soft teal `#70F4E6`, text `#F8FAFC`, cool grey `#94A3B8`, border `#344957`.

On light: background `#FFFFFF`, surface `#F8FAFC`, raised `#EAF0F2`, foreground `#0A0F14`, **accessible teal text `#00665F`**, muted text `#475569`, border `#D4DEE3`. Decorative glow, grids and teal are restrained; avoid bright accent-coloured long paragraphs on white. Status badges require a text label, not just colour.

## Content layout sequence

**Context → Inputs/Evidence → Assessment → Diagnosis → Opportunity → Decision → Action/Measurement.**

Use consistent terms across all five resources: qualified enquiry, consultation, paid booking, attended session, continuing/project session, artist capacity, realised revenue, contribution margin, baseline, intervention, outcome. Deposits count toward service revenue, not again on top; retention is not counted twice. Figures need timeframe/source and classification **VERIFIED / OBSERVED / CALCULATED / MODELLED / HYPOTHESIS**. No synthetic benchmark should look like a real verified result.

## Reusable renderer and content separation

All future source layouts should read `design-tokens.json`; do **not** hard-code independent margins. A renderer should expose `cover()`, `worksheet()`, `data_table()`, `checklist()`, `input_field()`, `callout()`, `closing()`, `footer()`. Keep content data and PDF field identifiers separate from presentation. Generate the five resources as a batch from a shared component registry, not five ad hoc scripts.

The current supplied PDFs are a verified **visual/layout baseline**, not evidence that the new renderer is already deployed in the site. A separate generator integration can follow after the branch is approved.

## QA release gates

1. A4 size and approved page counts; named document code and identical header/footer geometry.
2. Render and visually inspect **every page** at 150–200 DPI; confirm legibility and all table/card/page breaks.
3. Enforce safe area x=49–546/y=175–780 for body; detect off-page glyphs and annotations.
4. Detect overlap between text and PDF form widgets; ensure unique widget names and minimum usable controls.
5. Fill a representative field in each PDF, save and reopen; confirm data persists; test official links.
6. Verify colour contrast, keyboard/focus reading order as supported by PDF exports; manually review accessibility.
7. Confirm source references, evidence labels, caveats and calculation formulas before publication.
8. Store dated JSON QA evidence and montage; approve final PDFs/ZIP, then log template deliverables in Drive's canonical Master File Register.

Use `python qa_document_layout.py <pdf-folder> --strict --out qa.json` for geometric preflight. Passing the test is **not** a substitute for manual visual and accessibility review.

## Recorded baseline QA — 22 October 2026

The five existing v2 PDFs contain **31 A4 pages** and **154 fillable inputs**. Automated document/field geometry found **zero errors**. Three short **17pt inner annotations** on Resource 03's revenue result inputs are a documented review exception; the visible surrounding controls are 23pt tall. The previous version uses **embedded DejaVu Sans** as a font substitute rather than the website's Poppins. Existing fields do not calculate scores automatically.

## Governance / durable storage

**Engineering/document-layout source:** this GitHub path (branch + PR review; approval required before merge to `main`). **Client-facing reusable blank PDFs:** Google Drive `INKSIGHTS/11 Templates`; other brand/sales assets classified into `06 Marketing & Brand`. Follow Drive's master file register and file lifecycle SOP. Do not set up competing active brand authorities or merge without human sign-off.

**Change classes:** MAJOR = page/grid/master changes; MINOR = new approved component/accessibility changes; PATCH = layout or copy repair. Every change needs a before/after montage and validation of all five resource types.
