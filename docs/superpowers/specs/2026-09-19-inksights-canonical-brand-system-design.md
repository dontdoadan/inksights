# INKSIGHTS Canonical Brand System — Design Specification

**Date:** 2026-09-19  
**Status:** DRAFT FOR FOUNDER REVIEW  
**Scope:** Canonical visual and interaction design system, with Figma as the visual source of truth  
**Business authority:** Google Drive → INKSIGHTS → 06 Marketing & Brand → Brand System  
**Technical implementation:** GitHub repository `dontdoadan/inksights`  
**Production environments:** Figma (visual authority), Drive (approved business assets/guidelines), GitHub (technical tokens/components), Canva (downstream marketing production)

---

## 1. Purpose

Build a professional, mature INKSIGHTS brand system that can operate consistently across:

- website and product UI
- reports and audits
- data visualisation
- social and paid media
- presentations
- proposals and commercial documents
- mobile surfaces
- email/document templates
- motion and interaction
- future AI-generated customer-facing assets

The system must be designed to the level of discipline associated with mature global brands while remaining unmistakably specific to INKSIGHTS, the UK tattoo-studio growth-intelligence business.

The brand system must be recognisable before the logo is visible.

---

## 2. Locked brand identity

### 2.1 Positioning

**Primary descriptor:**  
Growth Intelligence for UK Tattoo Studios.

**Primary brand statement:**  
Clearer Data. Smarter Decisions. Stronger Studios.

**Secondary campaign line:**  
Real Insights. Real Growth.

Other previously approved lines may be used as campaign/application copy but do not have equal canonical status.

### 2.2 Core visual authority

The supplied approved brand board is the primary visual authority.

The visual language is:

- Deep Navy
- Signal Mint
- Clean White
- Cool Grey
- Ink Black
- bold rounded display typography
- clean sans-serif body/UI typography
- rounded geometry
- cropped circles/orbs
- diagonal rounded signal forms
- restrained gradients
- subtle data textures
- high contrast
- generous but controlled whitespace
- evidence/data-led visual language
- authentic tattoo-industry imagery
- strong editorial composition

### 2.3 Logo status

The three-rising-bars mark is **not** the official INKSIGHTS logo.

It is retained as:

- supporting signal motif
- data/growth graphic language
- provisional icon candidate
- loading/motion motif
- controlled UI symbol
- favicon/app-icon exploration candidate

It must not be described or published as the official final logo unless a future explicit founder approval changes that status.

The active fallback identity is a text-led INKSIGHTS wordmark treatment.

---

## 3. Brand character

INKSIGHTS should feel:

- Bold
- Modern
- Intelligent
- Practical
- Approachable
- Trusted
- Industry-focused
- Commercially credible
- Evidence-led
- Premium without pretence

It must not feel like:

- a generic marketing agency
- generic SaaS
- cyberpunk/AI software
- a tattoo-supply brand
- luxury fashion
- a corporate consultancy with tattoo imagery added afterwards
- a cliché tattoo brand built from skulls, needles, machines, ink splashes or gothic type

---

## 4. Benchmark standard

The quality benchmark is the **system maturity** seen in brands such as Coca-Cola, Slack and Spotify.

These are not visual references to imitate.

What INKSIGHTS should learn from that level of branding:

- high recognisability
- consistency across every medium
- disciplined typography
- strong spacing and proportion
- flexible but controlled applications
- mature component systems
- recognisable motion language
- coherent photography treatment
- predictable UX behaviour
- scalable design tokens
- clear governance
- strong real-world mockups and examples

---

## 5. Canonical visual source architecture

### 5.1 Figma

Figma becomes the canonical visual source of truth for:

- variables and tokens
- colour system
- typography styles
- spacing
- radius
- shadows/effects
- iconography
- patterns
- component library
- data visualisation
- motion specifications
- layout grids
- responsive rules
- templates
- application mockups
- brand guideline source frames

### 5.2 Google Drive

Drive owns:

- approved Brand Guidelines PDF
- approved exported logos/wordmarks
- approved imagery
- approved templates
- governance documents
- final customer/business-facing assets
- source-of-truth brand documentation

### 5.3 GitHub

GitHub owns:

- CSS variables
- design-token files
- component implementation
- engineering documentation
- SVG assets required by the product
- code-level motion/interaction implementation
- version-controlled technical brand specifications

### 5.4 Canva

Canva is downstream only.

It consumes the approved brand system for:

- social
- ads
- carousels
- marketing graphics
- lightweight presentations

It does not redefine brand rules.

---

## 6. Token architecture

### 6.1 Colour primitives

Core values remain:

- Deep Navy: `#0B1F3B`
- Signal Mint: `#2ED3A6`
- Clean White: `#F8FAFC`
- Cool Grey: `#CBD5E1`
- Ink Black: `#0F172A`
- Pure White: `#FFFFFF`

Extended navy and mint scales remain available for UI hierarchy and states.

Semantic colours remain:

- Positive: Signal Mint
- Information: `#4EA8DE`
- Warning: `#F5B942`
- Risk: `#E85D75`
- Neutral: `#94A3B8`

### 6.2 Typography

Canonical display family: **Poppins**  
Canonical body/UI family: **Inter**

Roles:

- Display XL
- Display L
- H1
- H2
- H3
- Body L
- Body
- Body S
- Label
- Data/KPI

The final Figma system must use actual Poppins and Inter, not visual approximations.

### 6.3 Spacing

Canonical spacing scale:

- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64
- 96

No arbitrary local spacing should be introduced unless the component has a documented reason.

### 6.4 Radius

- 8
- 14
- 20
- 28
- 999 / pill

### 6.5 Structural clearance

All compositions must enforce visible separation between unrelated elements.

Rules:

- no accidental overlap
- no clipping
- no hidden content
- no text touching container edges
- no decorative element blocking content
- no component crowding
- no shrink-to-fit typography
- intentional full-bleed treatments are allowed only when explicitly designed as full bleed

Guideline/application safe spacing target:

- minimum 24px between independent visual components
- minimum 16px between closely related internal elements
- 32–48px typical card internal padding depending on scale
- minimum edge safe zone appropriate to format

---

## 7. Typography and wrapping rules

Typography must never depend on uncontrolled automatic fitting.

### 7.1 Display text

- intentional line breaks
- maximum line count defined per template
- no word orphaning when avoidable
- no text collision with graphics
- no compressed tracking to rescue a bad layout
- no shrink-to-fit

### 7.2 Text measure

Recommended:

- display: roughly 20–38 characters per line
- lead copy: roughly 40–55 characters per line
- body: roughly 55–72 characters per line
- supporting caption: roughly 45–65 characters per line

### 7.3 Readability

All text must be comfortably legible at the intended viewing size.

Metadata may be smaller, but no essential information may rely on microtype.

---

## 8. Layout system

Use a disciplined editorial grid.

Primary large-format guideline/application system:

- 12-column grid
- consistent outer margins
- consistent gutters
- standard vertical rhythm
- controlled content measures
- explicit safe zones

Allowed composition families:

1. Editorial
2. Specimen
3. Application
4. Dark emphasis

The brand manual must vary composition while remaining systematically aligned.

---

## 9. Logo and wordmark system

The system must include:

- text wordmark
- reverse wordmark
- mono dark
- mono light
- descriptor lockup
- horizontal lockup
- stacked lockup
- minimum-size rules
- clear-space rules
- dark/light placement
- photography placement
- incorrect-use examples
- favicon/app-icon exploration using the signal motif, clearly marked non-final

The final official symbol remains unresolved.

---

## 10. Iconography

Build a coherent, brand-specific icon family.

Required concepts:

- insights
- strategy
- people
- growth
- results
- location
- demand
- search
- reviews
- enquiry
- booking
- consultation
- calendar
- deposit
- cancellation
- no-show
- artist
- chair/capacity
- utilisation
- pricing
- revenue
- retention
- repeat client
- LTV
- conversion
- benchmark
- evidence
- recommendation
- intervention
- outcome
- attribution
- trend
- alert
- report
- settings

Required sizes:

- 16
- 20
- 24
- 32

Required states:

- default
- active
- muted
- reverse

The icon family must have consistent stroke/fill logic and optical weight.

---

## 11. Pattern and graphic system

Core graphic families:

- rising signal bars
- cropped mint orbs
- rounded diagonal capsules
- dot/data grids
- signal contours
- low-opacity data trails
- map/grid treatments
- evidence marker graphics
- chart-derived abstract graphics

Each pattern requires:

- light variant
- dark variant
- density guidance
- opacity guidance
- scale guidance
- examples of correct use
- examples of overuse

---

## 12. Photography and imagery

Photography must feel documentary and authentic to UK tattoo studios.

Preferred subjects:

- artists working
- real studio interiors
- consultation
- client/artist interaction
- chairs/workstations
- studio exteriors/local context
- operational detail
- black-and-grey work where commercially relevant

Treatment:

- restrained neutral/black-and-grey tonal base
- optional gentle cooling/desaturation
- Deep Navy overlays for text protection
- Mint annotations/data overlays
- strong negative space
- no fake neon tattoo aesthetic

The guidelines should show:

- raw image
- approved treatment
- hero crop
- report crop
- social crop
- do/don’t examples

---

## 13. UI component system

Build production-quality component families using Figma variables and Auto Layout.

Required foundations/components:

### Navigation
- header
- desktop nav
- mobile nav
- breadcrumb
- sidebar
- tabs
- segmented controls

### Actions
- primary button
- secondary button
- ghost button
- icon button
- destructive/risk button
- loading state

### Forms
- text input
- textarea
- select
- search
- date picker
- checkbox
- radio
- switch
- validation states
- helper/error text

### Data/product
- KPI card
- finding card
- recommendation card
- opportunity card
- evidence badge
- confidence indicator
- benchmark marker
- metric delta
- table
- filter
- pagination
- tooltip
- progress
- empty state
- loading/skeleton
- success
- warning
- error
- modal/dialogue
- drawer/panel

All components must have appropriate state variants and token bindings.

---

## 14. Evidence language

The evidence taxonomy remains fixed:

- VERIFIED
- OBSERVED
- CALCULATED
- MODELLED
- HYPOTHESIS

These are semantic contracts, not decoration.

The component library must visually distinguish them without relying on colour alone.

---

## 15. Data visualisation

Data visualisation is a signature INKSIGHTS brand capability.

Required examples:

- KPI and benchmark cards
- line chart
- area chart
- grouped bars
- stacked bars
- funnel
- utilisation heatmap
- retention/cohort view
- demand vs capacity quadrant
- opportunity matrix
- score gauge
- benchmark bands
- delta/trend
- confidence range
- local/location map representation
- evidence-quality indicator
- before/after intervention chart

Rules:

- Deep Navy = primary
- Signal Mint = focal/selected
- Cool Grey = context
- semantic colours only when the meaning is genuinely semantic
- source and period shown
- benchmark population shown where relevant
- evidence state visible where relevant

---

## 16. Motion and animation

Motion must feel restrained, intelligent and data-led.

Motion language:

- signal bars rise sequentially
- Mint orb reveals/crops slowly
- chart lines draw left-to-right
- KPI count-up used sparingly
- evidence badge fade/scale
- card hover 2–4px lift
- section reveal via opacity + small translation
- directional wipe/fade for transitions
- signal-bar pulse for loading
- Mint confirmation sweep for success

Timing guidance:

- small UI transition: ~160–240ms
- editorial reveal: ~300–450ms

Reduced-motion variants are mandatory.

Avoid:

- excessive bounce
- gratuitous glow
- gaming motion
- generic AI-tech effects

---

## 17. UX principles

The experience should always answer:

1. What am I looking at?
2. What evidence supports it?
3. Why does it matter?
4. What should I do?
5. What happens next?

Canonical product information pattern:

**Signal → Evidence → Meaning → Opportunity → Recommendation → Action → Measurement**

UX should feel:

- clear
- prioritised
- evidence-led
- actionable
- calm
- trustworthy

---

## 18. Templates and applications

Required reusable application families:

### Marketing
- social square
- social portrait
- carousel
- LinkedIn landscape
- paid ad
- email/newsletter header
- social profile/avatar/banner

### Commercial
- proposal
- audit
- visibility scorecard
- executive summary
- case study
- sales presentation
- partner presentation

### Product
- homepage
- Studio Growth Check
- workspace/dashboard
- studio profile
- finding detail
- recommendation workflow
- KPI dashboard
- studio benchmark/comparison
- report viewer
- mobile experience

### Stationery / operational
- business card
- letterhead
- report/data export
- invoice/proposal document treatment
- browser preview
- favicon/app icon candidate
- signage/event backdrop

All mockups must use INKSIGHTS/tattoo-studio-specific content rather than generic SaaS filler.

---

## 19. Brand guidelines

The final guidelines should be approximately 32–40 carefully designed pages.

Suggested structure:

1. Cover
2. Source board / visual authority
3–4. Brand foundation
5–7. Logo/wordmark
8–9. Colour
10–11. Typography
12–13. Layout/grid/spacing
14–15. Geometry and graphic language
16–17. Iconography
18–19. Patterns
20–21. Photography
22–24. UI system
25–27. Data visualisation
28–29. Motion
30–31. UX
32–33. Social/marketing
34–35. Reports/presentations/documents
36–37. Web/product/mobile
38–39. Mockups/use cases
40. Governance and asset map

The exact page count may vary if a better composition requires it.

---

## 20. Accessibility

Required:

- WCAG-aware colour contrast
- no Mint small text on white
- dark text on Mint/light surfaces
- minimum accessible interactive target sizes
- visible focus states
- semantic states not communicated by colour alone
- reduced-motion guidance
- readable chart labels
- readable data tables
- responsive type scaling

---

## 21. Figma build architecture

Create one canonical Figma design-system file with pages:

1. Cover
2. Getting Started
3. Foundations / Colour
4. Foundations / Typography
5. Foundations / Grid & Spacing
6. Foundations / Radius & Effects
7. Foundations / Geometry & Patterns
8. Foundations / Photography
9. Iconography
10. ---
11. Components / Navigation
12. Components / Buttons
13. Components / Forms
14. Components / Status & Evidence
15. Components / KPI & Metrics
16. Components / Findings & Recommendations
17. Components / Tables & Filters
18. Components / Feedback & States
19. Components / Overlays
20. ---
21. Data Visualisation
22. Motion
23. UX Patterns
24. ---
25. Templates / Social
26. Templates / Reports
27. Templates / Presentations
28. Templates / Commercial
29. ---
30. Applications / Website
31. Applications / Product
32. Applications / Mobile
33. Applications / Mockups
34. ---
35. Brand Guidelines Source
36. Governance / Asset Map

Use deterministic naming.

---

## 22. Figma variable architecture

Recommended collections:

### Primitives
Single mode:
- colour scales
- raw numeric spacing
- raw radii
- raw opacity values

### Semantic Colour
Modes:
- Light
- Dark

### Spacing
Single mode

### Radius
Single mode

### Typography
Single mode where supported

### Motion
Single mode

Every variable must have:
- correct scope
- deterministic naming
- code syntax where applicable

---

## 23. Current repo conflict resolution

The live `main` branch currently uses:

- Archivo Black
- Hind
- approximate OKLCH colour values

The approved canonical brand system uses:

- Poppins
- Inter
- exact brand values centred on `#0B1F3B` and `#2ED3A6`

**Resolution:** the approved brand authority wins for the new Figma system and future product implementation.

No direct production change is authorized by this spec. Code migration must happen later through a feature branch, protected preview, QA and explicit approval immediately before merge.

The repo currently includes a `.logo-mark` treatment. Because the official logo symbol is unresolved, any production use must be reviewed so the three-bar/signal motif is not misrepresented as the final official logo.

---

## 24. QA requirements

Before approval:

### Visual
- every Figma page reviewed at 100%
- no overlaps
- no clipping
- no hidden content
- no blocked content
- no decorative obstruction
- clear margins around independent elements
- component proportions visually balanced
- consistent optical spacing

### Typography
- actual Poppins and Inter verified
- intentional display wrapping
- no shrink-to-fit
- no essential microtype
- no orphaned short line when avoidable

### Component
- Auto Layout
- variable bindings
- correct variants
- deterministic naming
- no hardcoded brand values where a token exists
- accessibility states present

### Data visualisation
- source/period visible
- benchmark context visible
- evidence state visible where relevant
- charts readable at intended size

### Responsive
- desktop
- tablet where material
- mobile

### Technical
- exported assets validate
- SVGs render
- tokens round-trip cleanly to GitHub
- no duplicated active authorities
- no official-logo claim for the three-bar motif

---

## 25. Definition of done

The canonical brand-system project is complete when:

1. Figma contains the complete canonical visual system.
2. All planned foundations and component families exist.
3. Components use variables/Auto Layout and pass QA.
4. Iconography, patterns, imagery treatment, data visualisation, motion and UX rules exist.
5. Real INKSIGHTS application mockups exist.
6. Brand Guidelines are generated from the mature system.
7. Approved exports are filed in Drive.
8. Machine-readable assets/tokens are prepared for GitHub.
9. Canva receives downstream reusable marketing templates.
10. Durable assets are logged in the Master File Register.
11. The three-bar motif is correctly classified as non-final logo.
12. The final system passes collision, clearance, readability, accessibility and proportional QA.

---

## 26. Explicit exclusions

This project does not:

- choose a final official logo symbol
- change INKSIGHTS positioning
- change the approved palette
- change the approved typography families
- change the evidence taxonomy
- merge code to production
- weaken deployment/security controls
- combine INKSIGHTS with other brands

Those require separate explicit decisions if they ever change.
