# INKSIGHTS Organic Search Growth Plan — 8 October 2026

## Objective

Increase qualified organic visibility among UK tattoo-studio owners and managers, with search performance measured against commercial outcomes rather than ranking counts alone.

Primary audience: established UK tattoo studios, particularly multi-artist studios where visibility, enquiries, booking conversion, capacity, retention and revenue can be measured as a connected operating system.

## Evidence used

### Verified first-party findings

- The production site already has a strong basic technical SEO foundation: crawlable public routes, canonical URLs, a sitemap, robots controls, `en-GB` language targeting and structured data.
- Supabase `website_events` contains 185 tracked events since 23 September 2026, including 173 page views.
- Current tracked page views are dominated by the homepage, About, internal platform routes and the free Studio Growth Check. The commercial/editorial guides currently have very little observed traffic.
- Five tracked page views in the current dataset carry a Google referrer. This is **not** a reliable organic baseline because the dataset is small and includes QA/preview activity.
- `visibility_search_universe` contains 24 search observations for studio-audit work. These are client-studio search observations and should not be presented as INKSIGHTS' own keyword-demand data.
- `visibility_keywords` currently contains no rows.
- Existing search-intelligence functions explicitly distinguish DataForSEO/Google observations, Brave observations and DuckDuckGo fallback observations. Preserve this evidence boundary.

### Verified external findings

- Sampled current UK SERPs for tattoo-studio SEO, marketing, growth, management and software do not show INKSIGHTS prominently.
- Competing pages that surface use tattoo-industry specificity, current dates, deeper topical coverage, structured internal linking, visible authorship/evidence signals, comparisons and/or case-study proof.
- Google states that local visibility is influenced by relevance, distance and prominence.
- Google recommends people-first content, crawlable internal links with descriptive anchor text, meaningful sitemap `lastmod` dates, and Search Console for measuring impressions/clicks/queries/pages.
- Branded search is noisy: several unrelated properties already use “Inksights/InkSights”. INKSIGHTS therefore needs stronger consistent entity signals and third-party tattoo-industry references.

### Measurement limitations

- Connected Google Search Console data is not currently available through the GSC integration, so no impressions, clicks, CTR, page-indexing coverage or true Google position history is claimed here.
- The connected Serpstat account does not currently include API access.
- Vercel Web Analytics did not return usable first-party pageview history within the Hobby-plan query window.
- Do not substitute proxy SERPs, DuckDuckGo positions or AI-web-search observations for Google Search Console data.

## Strategic diagnosis

The primary constraint is **authority and discoverability, not basic crawl plumbing**.

The website already has enough technical infrastructure to be indexed. The higher-value move is to make INKSIGHTS the most useful and recognisable specialist source for tattoo-studio commercial growth topics, then earn external corroboration and measure performance with Search Console.

Do not respond to weak visibility by mass-producing near-duplicate pages. Google explicitly warns against scaled low-value content, and the existing site already has an appropriate core topic cluster.

## Query ownership model

| Intent | Canonical page |
| --- | --- |
| tattoo studio growth / how to grow a tattoo studio | `/tattoo-studio-growth` |
| tattoo studio marketing | `/tattoo-studio-marketing` |
| tattoo studio SEO / local search | `/tattoo-studio-seo` |
| tattoo studio management | `/tattoo-studio-management` |
| tattoo studio booking / booking systems | `/tattoo-studio-booking` |
| tattoo client retention / rebooking / reactivation | `/tattoo-studio-client-retention` |
| tattoo studio revenue | `/tattoo-studio-revenue` |
| tattoo studio software / booking software comparison | `/tattoo-studio-software` |
| tattoo studio tools / resources | `/resources` |
| INKSIGHTS / tattoo studio growth intelligence | `/` and `/about` |

New content must support one of these canonical pages or target a genuinely distinct intent. It must not create a second page for the same commercial query without a consolidation plan.

## Priorities

### P0 — authority cluster and internal discovery

Implemented in branch `seo/authority-cluster-2026-10-08`:

- Upgraded the reusable editorial template with visible update dates, Article/Breadcrumb/FAQ structured data, contents navigation, source verification and contextual related-guide links.
- Rebuilt the thin Marketing, Management and Client Retention pages as substantive owner-facing guides.
- Strengthened the SEO pillar with current Google-sourced guidance, a 90-day execution framework and explicit source verification.
- Added FAQ/related-guide layers to Growth, Booking and Revenue.
- Expanded the Resources hub to cover the complete growth-guide cluster.
- Added crawlable guide links to the homepage and global footer.
- Changed sitemap generation so `lastmod` reflects known significant page updates rather than the build date for every URL.
- Strengthened the INKSIGHTS Organization/WebSite identity graph and Open Graph site name.
- Added session-level acquisition context to the existing consented Supabase analytics stream, preserving original landing page, referrer, search engine and UTM values across later conversion events.

### P0 — restore Google Search Console measurement

Required before ranking claims or keyword expansion:

1. Verify/restore the `sc-domain:getinksights.co.uk` property.
2. Submit/verify `https://getinksights.co.uk/sitemap.xml`.
3. Capture at minimum query, page, country, device, clicks, impressions, CTR and average position.
4. Separate branded and non-branded demand.
5. Compare Search Console clicks with organic landing sessions and downstream diagnostic/lead events.

This is a separate integration/security change and should not be implemented by inventing credentials or changing database/security controls without the required approval.

### P1 — build external authority

The strongest link-earning assets already exist or are close:

- Tattoo Studio Software Comparison 2026.
- Pricing Benchmark.
- Revenue Growth Model.
- Visibility Scorecard.
- Future anonymised UK tattoo-studio benchmark reports.

Priority outreach targets should be tattoo-software vendors, tattoo suppliers, trade/industry publications, UK small-business sources, local business communities and relevant studio partners. The objective is editorially justified references, not purchased generic links.

### P1 — publish verified proof

Competitors with real case studies have a major trust advantage. INKSIGHTS should publish the first client case study only when the baseline, intervention, timeframe and outcome are genuinely measured.

Required structure:

`Baseline → Finding → Intervention → Measurement window → Outcome → Attribution limits → What changed next`.

Do not turn demonstrations or modelled scenarios into client claims.

### P1 — original data moat

Use the existing INKSIGHTS evidence model to publish periodic, aggregated insights only when sample sizes and provenance support the claim.

Potential assets:

- UK Tattoo Studio Visibility Benchmark.
- Booking Friction Benchmark.
- Tattoo Studio Pricing/Lead-Time Index.
- Studio Software Workflow Survey.
- Local Search Opportunity reports by major UK market.

Original evidence creates both differentiation and a stronger reason for third parties to cite INKSIGHTS.

### P2 — expand content only from observed demand

Once Search Console contains enough data:

- Improve pages with impressions but weak CTR by testing titles/snippets and search-intent alignment.
- Improve pages ranking within striking distance by adding missing evidence, examples and internal support.
- Create new pages only when query data shows a distinct owner problem not already served by the canonical cluster.
- Merge or retire pages that compete for the same intent without earning meaningful visibility.

## Measurement scorecard

Primary SEO metrics:

- Non-branded Search Console impressions.
- Non-branded clicks and CTR.
- Number of core pages receiving qualified non-branded impressions.
- Organic landing sessions.
- Organic diagnostic starts/completions.
- Organic qualified leads and paid-audit conversions.
- Relevant referring domains and editorial mentions.
- Branded SERP share for INKSIGHTS + tattoo-studio modifiers.

Guardrail metrics:

- Index coverage errors.
- Duplicate/canonical anomalies.
- Organic conversion rate.
- Page experience/Core Web Vitals where field data becomes available.
- Content pages with zero impressions after a meaningful evaluation window.

## Decision rule

The objective is not “publish more”. The objective is:

**Find the highest-value search demand among the ICP → own the relevant intent with the strongest evidence page → connect that page into the commercial funnel → measure the outcome → compound the pages and external authority that prove they work.**


## Update — 1 November 2026: pain-led organic acquisition, first release

**This is an addendum to the existing strategy, not a second SEO roadmap.** Objective: acquire qualified UK multi-artist tattoo-studio owners via the actual operating problems they search for, convert through existing tools and the £395 Studio Intelligence Audit, and measure the outcome. The first release enriches existing Growth and Booking pages without creating new routes or editing the route tree.

### Evidence boundaries

- **Observed — existing INKSIGHTS site:** \`/tattoo-studio-growth\`, \`/tattoo-studio-booking\`, \`/tattoo-studio-revenue\`, \`/tattoo-studio-seo\`, \`/tattoo-studio-marketing\`, \`/tattoo-studio-client-retention\`, \`/tattoo-studio-management\`, \`/pricing-benchmark\`, \`/growth-model\`, \`/studio-growth-check\` and the £395 audit route exist; they are not new content opportunities by default.
- **Observed — 31 October first-party events:** 277 consented events / 91 recorded session IDs, 263 page views, 6 checkout starts, 2 errors, 2 diagnostic completions; only 14 event records explicitly contain \`utm_source=chatgpt.com\` (12 session IDs), with no confirmed genuine AI-assisted conversion. One non-test audit lead had no UTM attribution. \`public.orders\` contained one £1 QA deposit but no verified £395 studio sale; payment truth must be confirmed in Stripe.
- **Observed — public topical sources (not exact Google rank or volume):** https://millsidecreative.com/blog/more-leads-is-not-the-answer/ ; https://thestacc.com/blog/tattoo-shop-website-cro/ ; https://inkkiln.co.uk/guides/apprenticeships/booking-deposits-and-cancellations ; https://tattoobooking.co/guides/how-to-get-more-tattoo-clients . They demonstrate competing content addressing low booking conversion, client enquiry friction, deposits and diary issues. They do **not** establish search volume, keyword difficulty or lead conversion for INKSIGHTS.
- **Google guidance:** https://developers.google.com/search/docs/fundamentals/creating-helpful-content and https://developers.google.com/search/docs/fundamentals/ai-optimization-guide . Prioritise experienced, original, specific explanations and evidence; no scaled near-duplicate city or synonym pages, no magical AI markup.
- **Hypothesis:** pain-specific multi-artist-owner questions will qualify better than consumer-facing queries like \`tattoo price near me\`, \`best tattoo artist\`, or \`tattoo design ideas\`. Validate via GSC query impressions, search result intent, conversions and actual owner interviews.

### Keyword intent map — discovery hypotheses, not proven search volumes

| Priority | Owner's problem / sample search phrasings (validate wording in GSC) | Current canonical owner | Reader's next decision |
| --- | --- | --- | --- |
| A | tattoo studio not getting bookings; why is my tattoo studio quiet | \`/tattoo-studio-growth\` | Diagnose shortfall → free Studio Growth Check |
| A | tattoo enquiries not converting; how to convert tattoo enquiries into bookings | \`/tattoo-studio-booking\` | Measure qualified enquiry → deposit rate |
| A | tattoo studio booking conversion rate; tattoo studio enquiry follow-up | \`/tattoo-studio-booking\` | Diagnose lead handling → audit |
| A | tattoo studio pricing benchmark UK; how much should my studio charge | \`/pricing-benchmark\` | Submit pricing → compare reference and demand |
| A | tattoo studio business audit UK; audit tattoo studio revenue | \`/offers/studio-intelligence-audit\` | Understand outcomes/deliverables → purchase |
| A | tattoo studio revenue calculator; tattoo studio revenue growth | \`/growth-model\` and supporting \`/tattoo-studio-revenue\` | Model scenario (not promised uplift) → diagnostic |
| A | tattoo studio not appearing on Google; local SEO for tattoo studio UK | \`/tattoo-studio-seo\` | Practical checks → Visibility Scorecard |
| B | tattoo studio cancellations and no shows; tattoo studio booking deposit policy | \`/tattoo-studio-booking\` | Protect capacity; verify any legal statements externally |
| B | tattoo studio profit margin; tattoo studio empty chair costs; artist utilisation rate | \`/tattoo-studio-revenue\` | Separate revenue, utilisation and profit |
| B | tattoo studio marketing ideas; get more tattoo clients UK | \`/tattoo-studio-marketing\` | Choose channel only after diagnosing conversion |
| B | tattoo studio Google Business Profile help; tattoo studio SEO UK | \`/tattoo-studio-seo\` | Search presence checklist → scorecard |
| B | tattoo studio management KPIs; how to manage multi artist tattoo studio | \`/tattoo-studio-management\` | Owner dashboard / audit |
| B | tattoo studio booking software UK; tattoo studio CRM | \`/tattoo-studio-software\` | Compare workflows; avoid vendor genericity |
| B | how to get repeat tattoo clients; tattoo client rebooking system | \`/tattoo-studio-client-retention\` | Retention diagnosis |
| B | London tattoo studio hourly rates 2026; London tattoo studio pricing data | \`/research/greater-london-tattoo-pricing-2026\` | Research → benchmark; qualify consumer intent separately |
| C | tattoo shop business plan; how to open a tattoo studio; how much does a tattoo shop make | Existing revenue/management only if useful; do NOT create new route without ICP evidence | Mostly early-stage/solo-market leakage |
| C | best tattoo shop near me; tattoo designs; tattoo cost near me; healing advice | **Exclude from INKSIGHTS B2B SEO targets** | Consumer intent, not studio owners |

**Prioritisation is editorial judgement**, not measured keyword demand or difficulty. A high-intent query with very little volume may still be worth owning because one qualified buyer is valuable, but no traffic or sales outcome is guaranteed.

### First release: answer the pain on existing indexed URLs

1. \`/tattoo-studio-growth\` — explain why empty diaries may stem from demand, deposit conversion, cancellations or unit economics; add 28-day baseline, real diagnostic decisions, and visible modelled-example caveat. Keep canonical URL and title ownership.
2. \`/tattoo-studio-booking\` — explain qualified enquiry → quote → paid deposit → attended session; add conversion and revenue scenario, clearly modelled, not UK benchmark or guaranteed profit. Keep canonical and link to Studio Growth Check.
3. Next candidate (separate, scoped change after GSC/QA): strengthen \`/pricing-benchmark\` with dataset provenance, sample limitations, applicable bands and result→audit handoff.
4. Next candidate: audit purchase page should answer "what is examined, what happens after purchase, what decisions improve, who this is for, what proof exists" directly; no fabricated case studies or projected ROI.

### User journey and decision events

\`Google/AI/partner result (source uncertain until evidenced) → topic guide → appropriate existing tool → first-party saved result → optional contact qualification → HubSpot qualified opportunity → verified Stripe paid £395 checkout → delivery → measured outcomes\`.

Owner-meaningful metrics, by week and 28-day cohort:
- GSC UK **non-branded impressions, clicks, average position** (no external rank proxy substitute);
- search landing sessions on A pages, separated from preview/QA and unknown consent coverage;
- tool submissions successfully persisted, qualification rate, qualified leads by source and landing page;
- verified £395 purchases and contribution margin by true source (unknown is allowed and cannot be coerced to Google/AI);
- number of externally cited original research assets, and verified citations, not raw backlink count.
Small-number results: show raw counts and denominator availability; never present a 100% conversion rate from 1 lead as proven performance.

### Research and implementation validation

- Use GSC to test whether phrasing actually gets UK impressions; no search-volume estimates unless a legitimate keyword-demand source becomes available.
- Inspect search results for **owner-vs-consumer intent** before creating content; retail tattoo searches are not INKSIGHTS opportunities.
- Review titles/snippets, clear H1, source and practitioner evidence, prominent answer to user question, relevant contextual internal links, consent-aware CTA.
- Do not claim INKSIGHTS has a Google Business Profile, or create a listing without confirming real-world business eligibility (we are not a tattoo studio).
- Google AI Overviews do not require additional special schema or an \`llms.txt\` file; improve crawlability and usefulness of indexed text.
- Run TypeScript/build, route-tree consistency and preview/browser checks. **Do not merge or deploy production without release approval.**
- Reference engineering attribution implementation: https://github.com/dontdoadan/inksights/issues/153 ; first-sale commercial objective: https://github.com/dontdoadan/inksights/issues/76 .

### Scale rule

Expand from these two strengthened pages only after they demonstrate real impressions or user engagement, and the existing £395 path is operational. Future original research should be designed to supply **new evidence** for the existing authority cluster (pricing, conversion, chair hours, retention, lead time), rather than increasing the number of similar SEO pages.
