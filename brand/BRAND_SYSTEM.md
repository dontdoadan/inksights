# INKSIGHTS Brand System v1

Status: **Canonical working specification**  
Source of truth: `brand/design-tokens.json` + Figma file `INKSIGHTS — Brand System v1`  
Principle: **Culture earns attention. Structure earns trust. Mint identifies the signal.**

## 1. Brand idea

INKSIGHTS is a commercial-intelligence brand built specifically for tattoo studios. The system must feel analytically credible, premium and contemporary while retaining enough tattoo-culture character to feel native to the industry.

Core positioning: **Growth Intelligence for UK Tattoo Studios.**

Primary visual tension:
- structured intelligence / evidence / commercial clarity
- independent tattoo culture / real people / real studios

Do not drift into generic SaaS, corporate consultancy, tattoo cliché, neon cyberpunk or lifestyle-brand aesthetics.

## 2. Colour system

### Primitives
| Token | Hex | Role |
|---|---:|---|
| navy/950 | `#0A1A27` | deepest canvas |
| navy/900 | `#102536` | primary dark surface |
| teal/900 | `#0F2F3A` | elevated dark surface |
| graphite/900 | `#1E293B` | dark neutral |
| graphite/700 | `#334155` | strong border / secondary dark |
| slate/500 | `#64748B` | neutral data / tertiary text |
| slate/300 | `#CBD5E1` | secondary light border/text |
| mist/100 | `#F1F5F9` | cool light neutral |
| off-white | `#F7FAFC` | light canvas |
| white | `#FFFFFF` | light surface / high contrast |
| mint/500 | `#32E0A1` | canonical signal |
| mint/400 | `#5BE8B6` | hover / emphasis |
| mint/600 | `#1CCB8C` | pressed / dense signal |
| mint/100 | `#D9FBEF` | light signal background |
| amber/500 | `#F59E0B` | warning |
| red/500 | `#EF4444` | negative / risk |
| blue/500 | `#38BDF8` | informational secondary data only |

### Mint rule
Mint is semantic, not decorative. Use it only for:
- key findings and metrics
- opportunities
- active/current states
- progress
- primary actions
- selected chart series
- evidence emphasis

Never add mint strokes, slashes, underlines or shapes merely to fill empty space.

## 3. Typography

### Families
- **Display / headings:** Space Grotesk
- **Body / UI / tables:** Inter
- **Cultural accent:** custom brush-lettering artwork only. Never use brush lettering for body text, data labels, UI controls or long headlines.

### Type scale
| Style | Size | Weight | Line height | Tracking |
|---|---:|---:|---:|---:|
| Display XL | 80px | 700 | 1.00 | -0.03em |
| Display L | 64px | 700 | 1.05 | -0.03em |
| H1 | 48px | 700 | 1.05 | -0.03em |
| H2 | 36px | 700 | 1.10 | -0.025em |
| H3 | 30px | 600 | 1.15 | -0.02em |
| H4 | 24px | 600 | 1.20 | -0.015em |
| Lead | 20px | 400 | 1.50 | 0 |
| Body L | 18px | 400 | 1.55 | 0 |
| Body | 16px | 400 | 1.50 | 0 |
| Body S | 14px | 400 | 1.45 | 0 |
| Caption | 12px | 500 | 1.40 | 0.02em |
| Eyebrow | 12px | 600 | 1.20 | 0.16em |

Headlines should be short enough to breathe. Avoid stacking more than 3–4 display lines unless it is an intentional poster composition.

## 4. Spacing

Base unit: **8px**.

Scale: `0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128`.

Default component rhythm:
- icon-to-label: 8px
- label-to-supporting-copy: 8px
- internal card padding: 16px / 24px / 32px by density
- card-to-card gap: 16px or 24px
- section gap: 64px desktop, 48px tablet, 32px mobile
- page/report outer margin: visually generous; never use cards to fill all whitespace

## 5. Radii and border weights

Radii:
- 8px — compact controls/tags
- 12px — standard controls/cards
- 16px — feature/data panels
- 24px — hero/elevated feature surfaces only
- pill — badges, toggles and chips only

Do not mix arbitrary radii within the same component family.

Borders:
- 1px — default card/control/divider stroke
- 2px — selected/emphasis state only
- 3px — accessible focus ring only

## 6. Icon system

- outline glyphs
- 2px visual stroke at 24px base size
- rounded line caps and joins
- geometric, low-detail construction
- common sizes: 16 / 20 / 24 / 32px
- one icon style throughout reports, site and product UI
- no mixing filled and outline icon systems inside one surface

Core semantic icons:
Visibility, Enquiries, Bookings, Capacity, Retention, Revenue, People, Evidence, Insight, Opportunity, Growth, Search, Report, Settings.

## 7. Photography

Use monochrome documentary photography of real or credible tattoo-studio environments:
- artists working
- hands/tools/details
- studio interiors
- chairs/workstations
- consultation/customer environment

Treatment:
- predominantly black and white
- deep contrast, restrained grain
- dark navy integration on branded surfaces
- crop for human context rather than generic decoration

Avoid:
- stock-business imagery
- clichéd skull/rose/flame visual shorthand
- colourful tattoo flash as background noise
- over-staged influencer imagery

### Cultural lettering
Brush-lettered cultural statements may appear *inside or adjacent to photography* in controlled campaign moments. Target share: **10–20% expressive / 80–90% structured typography**.

Examples:
- People. Art. Progress. Always.
- Good tattoos. Better people.
- Studios grow different here.

These are brand-cultural expressions, not evidence claims.

## 8. Data visualisation

Data is a primary brand asset.

Rules:
- use neutral/slate series by default
- reserve mint for the series, point or delta that matters
- use red only for genuine negative/risk states
- use amber for uncertainty/warning
- do not use rainbow palettes
- charts must include units, timeframe and evidence status where relevant
- avoid 3D charts, excessive gradients and decorative axes
- grid lines: low contrast, 1px
- chart radii and card radii follow the shared radius scale

Client-facing example metrics must be labelled **Illustrative example** unless sourced from the client dataset.

## 9. Component states

Every interactive component supports, where applicable:
- default
- hover
- pressed
- focus-visible
- disabled
- loading
- selected/active
- success
- warning
- error

Primary action:
- default: mint background / navy text
- hover: mint/400
- pressed: mint/600
- focus: 3px accessible mint-derived ring
- disabled: neutral surface + reduced contrast; never mint

Secondary action:
- transparent/dark surface
- 1px border
- mint may appear on hover/focus, not permanently unless selected

## 10. Canonical reusable components

### UI
- Button / Primary, Secondary, Ghost
- Icon Button
- Text Input
- Select
- Checkbox
- Radio
- Toggle
- Tag / Evidence Status
- Badge / Delta
- Tabs
- Navigation item

### Intelligence/data
- KPI Stat Card
- Opportunity Card
- Evidence Card
- Finding Card
- Recommendation Card
- Insight Callout
- Opportunity Score
- Chart Panel
- Metric Table
- Evidence-status label
- Diagnostic Step
- Diagnostic Journey

Canonical diagnostic journey:
**Observe → Analyse → Diagnose → Prioritise → Act → Measure**

## 11. Report system

Report pages use A4 portrait or responsive web-report equivalent.

Canonical modules:
1. Cover
2. Executive summary
3. Evidence status / methodology
4. KPI overview
5. Finding page
6. Opportunity page
7. Recommendation page
8. Market/search evidence
9. Customer journey analysis
10. 90-day plan
11. Measurement baseline
12. Closing / next action

Page rules:
- one primary message per page
- one dominant data visual or evidence cluster per page
- white/light pages create breathing room between dark intelligence sections
- page number / section marker remains subtle and consistent

## 12. Social template system

Core formats:
- 1080×1350 editorial insight
- 1080×1080 stat/quote
- 1080×1920 Story/Reel cover
- carousel 1080×1350

Template families:
- Data insight
- Studio pain point
- Commercial opportunity
- Framework/process
- Myth vs evidence
- Case-study result
- Cultural brand statement

Social rule: one hook, one supporting idea, one signal. Do not recreate a whole report on one tile.

## 13. Presentation system

16:9 default.

Layouts:
- Cover
- Section divider
- Statement
- Two-column argument
- KPI row
- Chart + interpretation
- Process diagram
- Opportunity cards
- Evidence page
- Recommendation
- 90-day roadmap
- CTA/close

Keep decks visually closer to an intelligence briefing than a marketing pitch deck.

## 14. Website / product UI patterns

### Website
- dark hero + light editorial transitions
- max-width reading columns
- 12-column desktop grid
- generous vertical rhythm
- data cards only where they communicate evidence
- mint primary CTA; secondary action outlined
- no ambient visual effects that compete with content

### Product/workspace
- light workspace is permitted for high-density analysis
- dark shell/nav with light analytical canvas is preferred for long sessions
- navigation and controls use Inter
- display typography reserved for page/section titles
- tables prioritize density and scanability over brand theatrics

## 15. Evidence language

Always distinguish:
- VERIFIED
- OBSERVED
- CALCULATED
- MODELLED
- HYPOTHESIS

Evidence labels must be visually systematic and never imply a stronger evidence state than the underlying source supports.

## 16. Accessibility

- meet WCAG AA contrast for ordinary text and interactive controls
- minimum 44×44px pointer target where practical
- focus state must be visible without relying on colour alone
- charts require labels / textual interpretation
- never encode positive/negative state using only mint/red
- respect reduced-motion preferences

## 17. Governance

Canonical hierarchy:
1. GitHub `brand/design-tokens.json` — machine-readable token source
2. Figma `INKSIGHTS — Brand System v1` — visual/component source
3. Production code — consumes/mirrors canonical tokens via reviewed PR
4. Canva — campaign/template distribution layer
5. Higgsfield — generation context for branded image/video work
6. Google Drive — exported guidelines, reports and business-facing documentation
7. Supabase — product/intelligence data only; not a design-token registry

Any new token or component must be added to the canonical system before proliferating into downstream assets.
