# INKSIGHTS Component & Template Contracts v1

This document defines the reusable families that Figma, web/product UI, reports, presentations, Canva assets and future generated media must implement consistently.

## Component geometry

- Base grid: 8px.
- Compact control radius: 8px.
- Standard control/card radius: 12px.
- Feature/data panel radius: 16px.
- Hero/elevated radius: 24px only where scale justifies it.
- Border: 1px default; 2px selected/emphasis; 3px focus only.
- Icon stroke: 2px.
- Minimum practical interactive target: 44×44px.

## Mint-signal contract

Mint communicates meaning. It may represent:
1. primary action;
2. active/selected state;
3. positive progress;
4. the principal data series or point;
5. opportunity;
6. a key phrase within a headline;
7. evidence emphasis.

Mint must not be used as decorative filler, random slashes, ambient lines, arbitrary borders or non-semantic ornaments.

## Button family

### Primary
- Surface: signal mint.
- Text/icon: navy/950.
- Radius: 12px.
- Height: 44–48px.
- Horizontal padding: 16–24px.
- Hover: mint/400.
- Pressed: mint/600.
- Focus: 3px signal-derived ring.
- Disabled: neutral/slate, no mint.

### Secondary
- Transparent or dark surface.
- 1px border.
- Off-white text.
- Mint only on hover/focus or selected state.

### Ghost
- No persistent border.
- Transparent background.
- Use for tertiary actions only.

## Form controls

Text Input, Select, Checkbox, Radio and Toggle share:
- 12px standard radius where applicable;
- 1px neutral border;
- 44px minimum touch/control height where practical;
- mint focus/selected state;
- explicit error state in red with supporting text, not colour alone;
- no glow effects.

## Data-card family

### KPI Stat Card
Required fields:
- label;
- primary value;
- unit if ambiguous;
- delta;
- comparison timeframe/source where applicable;
- optional compact sparkline.

Visual rule: neutral structure, mint only on the meaningful delta/series.

### Opportunity Card
Required fields:
- opportunity title;
- evidence status;
- commercial consequence;
- confidence;
- priority/score where available;
- next action.

### Evidence Card
Required fields:
- evidence state: VERIFIED / OBSERVED / CALCULATED / MODELLED / HYPOTHESIS;
- source/provider;
- captured/observed date where relevant;
- concise evidence statement;
- optional source link/reference.

### Finding Card
Required fields:
- finding;
- supporting evidence count/summary;
- consequence;
- diagnostic link.

### Recommendation Card
Required fields:
- action;
- reason;
- expected outcome or hypothesis;
- effort/owner/timeframe;
- measurement metric.

## Diagnostic journey

Canonical stages:
1. Observe — collect evidence.
2. Analyse — quantify what is happening.
3. Diagnose — identify the underlying constraint.
4. Prioritise — focus on the highest-value opportunity.
5. Act — implement the intervention.
6. Measure — compare outcome with baseline.

Visual contract:
- use six equal or rhythmically consistent steps;
- current/active step may use mint;
- incomplete/future steps stay neutral;
- no random decorative connectors;
- labels remain legible at mobile width through stacking or horizontal scroll.

## Chart system

### General
- neutral/slate default series;
- mint = primary signal;
- red = genuine negative/risk;
- amber = uncertainty/warning;
- blue = informational secondary comparison;
- 1px low-contrast grid;
- no 3D;
- no rainbow palettes;
- no gradients unless encoding a continuous scale and explicitly labelled.

### Line chart
- 2px series stroke desktop;
- highlighted point may use mint dot + clear label;
- max 3 comparison series before switching view.

### Bar chart
- consistent bar radius 2–4px only;
- bars neutral unless highlighted;
- avoid excessive shadows.

### Donut/progress
- use only when part-to-whole is the actual question;
- one highlighted segment;
- show numeric value in text.

## Report templates

### R01 Cover
- document type/eyebrow;
- studio/client name;
- one commercial headline;
- short descriptor;
- date/version;
- optional monochrome studio image;
- no dense metrics on cover.

### R02 Executive Summary
- primary constraint;
- top 3 opportunities;
- small KPI row;
- one paragraph interpretation.

### R03 Evidence / Methodology
- evidence-state legend;
- source inventory;
- limitations;
- date/timeframe.

### R04 KPI Overview
- 3–6 KPI Stat Cards;
- no more than two chart types per page.

### R05 Finding
- one finding;
- evidence block;
- commercial consequence;
- visual proof/chart where relevant.

### R06 Opportunity
- opportunity;
- opportunity score;
- expected commercial mechanism;
- confidence/assumptions.

### R07 Recommendation
- recommendation;
- owner;
- effort;
- timeframe;
- success metric.

### R08 90-Day Plan
- Now / Next / Later or 0–30 / 31–60 / 61–90 days;
- max 3–5 interventions per phase;
- clear dependencies.

### R09 Measurement Baseline
- metric;
- current value;
- target/test condition;
- measurement window;
- evidence source.

### R10 Closing / Next Action
- concise summary;
- one next action;
- contact/booking path.

## Social templates

### S01 Editorial Insight — 1080×1350
- short hook;
- one supporting idea;
- one visual/data signal;
- small brand footer.

### S02 Data Stat — 1080×1080
- one number;
- label/timeframe;
- one-sentence interpretation;
- illustrative label when not client-derived.

### S03 Cultural Statement — 1080×1350
- monochrome studio photography;
- short brush-lettered phrase;
- supporting structured caption if needed;
- brush copy must never carry detailed information.

### S04 Carousel
1. Hook.
2–4. Evidence/argument.
5. Practical implication.
6. CTA / question.

Never compress the entire carousel into each slide.

### S05 Case Study
- baseline;
- intervention;
- measured change;
- timeframe;
- evidence status.

## Presentation template family — 16:9

### P01 Cover
Statement + descriptor + minimal brand context.

### P02 Section Divider
One short statement, optional monochrome image.

### P03 Argument
Large statement left; concise evidence right.

### P04 KPI Row
3–4 stat cards, one sentence interpretation.

### P05 Chart + Interpretation
Chart occupies majority; text explains what matters.

### P06 Process
Use canonical six-stage journey.

### P07 Opportunity Set
Maximum 3 opportunity cards per slide.

### P08 Recommendation
Action / Why / Expected effect / Measurement.

### P09 Roadmap
Now / Next / Later or 90-day bands.

### P10 Closing
One next step; avoid multi-CTA endings.

## Website patterns

### W01 Hero
- eyebrow optional;
- display headline maximum 3–4 lines desktop;
- one paragraph;
- primary + optional secondary action;
- one supporting visual/data object;
- no random ambient mint marks.

### W02 Evidence Strip
3–5 data/evidence items; use mint sparingly.

### W03 Problem / Constraint Section
One commercial problem, supporting evidence, visual pathway.

### W04 Diagnostic Journey
Six-step canonical journey.

### W05 Opportunity Cards
3 cards maximum per row desktop; stack mobile.

### W06 Proof / Case Study
Baseline → intervention → outcome → evidence.

### W07 CTA
One primary action. Keep copy direct.

## Product/workspace UI patterns

### U01 Shell
Dark navigation shell + light analytical canvas preferred.

### U02 Page header
Space Grotesk title; Inter metadata/actions.

### U03 KPI rail
Compact KPI cards, neutral until signal state is meaningful.

### U04 Evidence table
High scanability; sticky headers where needed; evidence-state badges; source/date columns.

### U05 Findings workspace
Finding → diagnosis → opportunity → recommendation relationship should remain visible.

### U06 Action/measurement panel
Intervention owner, status, baseline, target, result and attribution.

## Photography component rules

Photography can be used as:
- hero/background context;
- section divider;
- campaign tile;
- proof/case-study context;
- report cover.

Do not place small body copy over visually busy photography. Use gradients/solid panels for legibility if needed, not decorative overlays.

## Responsive rules

Desktop: 12-column grid.
Tablet: 8-column equivalent.
Mobile: 4-column equivalent.

- cards stack before text becomes cramped;
- diagnostic journey may switch to vertical sequence;
- tables scroll horizontally rather than compressing illegibly;
- display type scales down aggressively enough to preserve whitespace;
- cultural brush lettering never becomes the smallest text on a screen.

## Governance

A component is considered canonical only when:
1. token usage is documented;
2. states are defined;
3. Figma component exists or is queued due tooling constraints;
4. code implementation matches the token contract;
5. accessibility rules are met;
6. it has an identified downstream use (report, product, web, social or presentation).
