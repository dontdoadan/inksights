# INKSIGHTS Brand System v1 — Production Migration Map

This file maps the current production styling to the approved v1 system. It is intentionally separate from the live stylesheet until protected-preview QA is available.

## Current → v1 typography

| Current | v1 | Action |
|---|---|---|
| `Archivo Black` display | `Space Grotesk` Bold/Semi Bold | replace heading/display family |
| `Hind` body | `Inter` Regular/Medium/Semi Bold | replace body/UI family |
| heading weight 400 used to compensate for Archivo Black | 600–700 | update per type hierarchy |
| generic `-0.02em` heading tracking | display `-0.03em`, headings `-0.02em` | use level-specific styles |

## Current → v1 colour mapping

| Current semantic | v1 token |
|---|---|
| `--ink-deep` | `--color-bg-canvas-dark` / `#0A1A27` |
| `--ink` | `--color-bg-surface-dark` / `#102536` |
| `--ink-elev` | `--color-bg-elevated-dark` / `#0F2F3A` |
| `--foreground` / `--ice` | `--color-text-primary-dark` / `#F7FAFC` |
| `--muted-foreground` | `--color-text-secondary-dark` / `#CBD5E1` |
| `--border` | `--color-border-dark` / `#334155` |
| `--mint` | `--color-signal` / `#32E0A1` |
| `--mint-soft` | use `--color-signal-hover` or `--color-signal-subtle` by context, not as a catch-all |

## Global visual rules to enforce

1. Remove mint used as decorative filler.
2. Remove or strongly reduce non-semantic ambient gradients and glowing rings where they compete with content.
3. Preserve mint for signal/action/opportunity/progress/active states.
4. Standardise component radii to 8 / 12 / 16 / 24 / pill.
5. Standardise borders to 1px default, 2px selected, 3px focus.
6. Standardise icons to 2px outline stroke.
7. Replace arbitrary component padding with the 8px spacing system.
8. Use light editorial surfaces between dense dark sections to create breathing room.
9. Keep monochrome studio photography as the culture layer; do not add tattoo cliché graphics.
10. Label all demonstration metrics as illustrative unless backed by canonical studio evidence.

## Component migration order

Do not restyle everything simultaneously. Migrate in dependency order:

1. typography + semantic CSS variables;
2. Button;
3. Input / Select / Checkbox / Radio / Toggle;
4. Card / Badge / Alert;
5. charts;
6. KPI and intelligence-specific components;
7. navigation / header;
8. public-site sections;
9. workspace/product surfaces;
10. generated reports.

## Button migration

Current default button is effectively shadcn default (`rounded-md`, 36px high, shadow, `primary/90` hover).

V1:
- default height: 44px;
- large: 48px;
- small: 36px;
- radius: 12px default;
- primary: signal mint / navy text;
- primary hover: mint/400;
- primary pressed: mint/600;
- no default box shadow;
- focus: 3px ring;
- disabled: neutral, no mint.

## Form-control migration

Current `.form-control` radius is `0.8rem` and uses ad-hoc 160ms transitions.

V1:
- radius: 12px;
- min height: 44px where applicable;
- default border: 1px semantic border;
- transition: 180ms canonical motion;
- focus: semantic signal border + 3px focus ring;
- no decorative glow.

## Report migration

Existing report exports remain valid evidence artifacts but should be visually migrated to the canonical report modules:
Cover → Executive Summary → Evidence/Methodology → KPI Overview → Finding → Opportunity → Recommendation → 90-Day Plan → Measurement Baseline → Closing.

Do not retroactively alter evidence content or evidence-state language for aesthetic consistency.

## Protected-preview QA gates

Before merging a production style migration:

- desktop 1440px screenshot comparison;
- tablet 768px screenshot comparison;
- mobile 390px screenshot comparison;
- nav/CTA interaction check;
- focus-visible keyboard check;
- forms and validation states;
- report rendering/print check;
- chart legibility and evidence labels;
- contrast audit;
- reduced-motion check;
- console errors = zero new visual-system errors.

## Merge policy

This branch may merge the **brand specification and token source** independently of the live visual migration.

The production stylesheet and component migration should be a subsequent protected-preview PR so the visual delta can be reviewed as one coherent change rather than mixed with brand-definition work.
