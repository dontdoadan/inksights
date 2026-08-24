
# Plan: INKCARE Growth Model page

Add a dedicated, investor-grade `/growth-model` route that explains how INKCARE compounds with studio growth, with interactive calculators for each driver and a partnership/investor CTA.

## New files

- `src/routes/growth-model.tsx` — the page route with its own SEO metadata (title, description, og tags).
- `src/components/growth/Calculator.tsx` — small reusable building blocks (NumberSlider, MetricCard, ResultStat) used across drivers.
- `src/components/growth/PartnerCTA.tsx` — partnership/investor contact form (mock submit, email field + optional company/role).

## Updates

- `src/routes/index.tsx` — add a nav link and a teaser section linking to `/growth-model` (so the homepage actually points to the new page). No other homepage changes.
- Reuse existing tokens from `src/styles.css` (ink-deep, mint, ice). No new color tokens.

## Page structure (`/growth-model`)

1. **Sticky nav + hero** — Eyebrow "The Growth Model". Headline: *"INKCARE grows when tattoo studios grow."* Sub: executive-summary paragraph. Two CTAs: "Become a partner" and "Jump to calculators".
2. **Thesis band** — Static contrast block: "Traditional suppliers vs INKCARE" (two columns, mint accent on INKCARE side).
3. **The compounding flow** — Vertical arrow diagram (Studios → Artists → Clients → Sessions → Aftercare → Wholesale → Revenue) styled as a stacked stepper with mint connectors.
4. **Interactive Growth Engine (the master calculator)** — Sliders for: # studios, artists/studio, clients/artist/day, working days/week, GP per product, avg session value, retail conversion %, rebooking rate %, avg revenue-share %. Live outputs: annual sessions, wholesale GP, retail revenue share, rebooking revenue share, ATV revenue share, **total annual INKCARE revenue**. All formulas come straight from the doc.
5. **The 8 Revenue Drivers** — A grid of 8 cards, each with: number (01–08), title, short narrative, and an inline mini-calculator scoped to that driver (e.g. Driver 2 shows a slider for # studios → annual sessions; Driver 6 shows session-value slider → revenue-share). Each card also surfaces the canonical example numbers from the brief (£3,120, £3,900, etc.).
6. **Revenue Share model** — Explainer card with a two-input mini-calculator (current monthly revenue + uplift %) → INKCARE monthly/annual cut.
7. **Compounding effect summary** — A "stacked revenue" visual: bars for Wholesale (£3,120) + Retail (£2,000) + Rebooking (£2,500) + ATV (£3,900) = £11,520+. Recomputes from the master calculator inputs above.
8. **Core investment thesis** — Multiplicative formula laid out typographically (Studios × Artists × Clients × Sessions × ATV × Retail × Rebooking).
9. **Partnership / Investor CTA** — Headline: "Partner with INKCARE." Form: name, email, company, role (Investor / Studio Owner / Partner / Other), short message. Mock submit with toast/alert. Separate from the homepage's Revenue Audit form.
10. **Footer** — Reuse existing footer style.

## Calculator technical details

- Pure client-side React state with `useState` + `useMemo`. No backend.
- Single shared state object in the master calculator; per-driver mini-calculators each own their local state for clarity.
- Number formatting via `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })`.
- Sliders: native `<input type="range">` styled with Tailwind (mint accent), with numeric value pill alongside.
- All formulas:
  - `sessions = studios * artists * clientsPerDay * daysPerWeek * 52`
  - `wholesaleGP = sessions * gpPerProduct`
  - `atvUplift = sessions * sessionUpliftGBP`; `atvShare = atvUplift * revShare%`
  - `retailUpliftUnits = sessions * (targetConv% - currentConv%)`; assume £X GP/unit (slider) for retail share
  - `rebookingExtra = clients * (improvedReturn% - currentReturn%)`; share applied to assumed avg session value
  - `totalIncome = wholesaleGP + atvShare + retailShare + rebookingShare`

## Out of scope

- No new database, auth, or backend persistence.
- No changes to existing homepage sections beyond adding a nav link + teaser.
- No new fonts or color tokens.
