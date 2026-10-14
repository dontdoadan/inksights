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
