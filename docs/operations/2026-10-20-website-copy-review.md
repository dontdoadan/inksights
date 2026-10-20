# Website copy review and release record — 20 October 2026

## Source and scope

- Reviewed the live homepage and 12 linked public routes at https://getinksights.co.uk on 20 October 2026 (Europe/London).
- Vercel confirmed the public domain belongs to `inksight-main` (`prj_eiuxaOEwD3imsDxsnWnmofP9RAZ7`), not the separate Studio Intelligence application.
- Initial production release: `dpl_Cv4vKuDHTSGUgzWmVmqw4dmxrbPU`, built from `dontdoadan/inksights` commit `3aa67b8ea2ca94e6620694b411168555e06734ca` on `main`.
- Fresh checkout matched that exact commit. Copy changes isolated on `codex/website-copy-2026-10-20`; no existing local work was overwritten.
- During this task, upstream `bc65f38` added research-methodology and evidence links. Incorporated it without rewriting published history; retained the methodology page, entity metadata and links alongside the revised copy.
- Business grounding: `docs/commercial-source-of-truth.md`, current `src/lib/offer-data.ts`, actual rendered live service pages and the user's requested journey. The referenced ChatGPT conversation exposed no substantive prior copy beyond the original request.

## Changes

- Homepage: direct studio-owner positioning, outcome-focused headline, free check as the first action, visible £395 audit alternative, clearer qualification and next steps.
- Journey: free Growth Check → optional focused visibility correction → Studio Intelligence Audit → Primary Constraint Programme → outcome review and selective monitoring. Stages are explicitly optional; this is not a compulsory bundle.
- Added a public Primary Constraint Programme page using the existing dynamic service route. No fixed price, new payment object or automatic subscription was created.
- Standardised the free tool's public name as Studio Growth Check across navigation, homepage, guides, resources, forms and related calls to action. Existing endpoint names, event identifiers, stored fields and URLs remain stable.
- Labelled homepage sample scores and changes as illustrations; removed the claims that the animation is a live scan or active evidence feed.
- Trust copy explains the early-stage evidence position and links to the proof library and research methodology. No testimonials, client logos, achieved outcomes or market benchmarks were invented.
- Service pages now distinguish diagnosis from implementation, clarify delivery prerequisites, give meaningful enquiry actions and explain the relationship between the £395 audit, wider scoped revenue review and the application-only pilot.
- Added plain-language FAQs covering fit, estimates, missing data, timing, implementation, monitoring, guarantees and evidence.
- Improved form introductions, required versus optional consent wording, privacy link, result messaging and the route from a free result to a paid audit or focused visibility fix.
- Separated tattoo-studio qualification (core: UK, established, 3+ artists) from enquiries by suppliers, product brands, software providers, educators and event organisers. The latter use the existing partnership contact route; no unapproved B2B product/pricing claims were added.
- Updated search descriptions for the homepage, free check and service catalogue; revised service metadata and added metadata for the programme and founding pilot. Added the programme to the generated sitemap and retained upstream methodology coverage.

## Commercial boundaries

Observed on the live site and preserved unchanged:

| Offer | Published price / commitment |
| --- | --- |
| Studio Growth Check | Free |
| Studio Intelligence Audit | £395 one-off; commercial guidance calls this a founding validation price |
| 72-Hour Visibility Fix | £249 one-off; three working days after payment, complete intake and required access |
| Visibility Watch | £99/month |
| Founding Studio Pilot | £1,500 setup + £750/month for three months; £3,750 minimum |
| Primary Constraint Programme | Separately scoped written proposal |

The requested “72-hour Visibility Watch & Fix” journey heading points to the existing one-off Visibility Fix and its follow-up. The copy explicitly states that recurring Visibility Watch is separate. This does not establish a newly bundled offer or a promise of continuous monitoring for £249.

The September commercial control document lists fewer active products than the current public catalogue. This task preserves existing published pricing as instructed rather than resolving that governance conflict by inventing prices, withdrawing products or rewriting the commercial authority. VAT treatment is not newly asserted. Broader INKSIGHTS Watch remains selectively scoped, not a public fixed-price subscription.

## Verification

- Production build and TypeScript validation passed before integrating the concurrent upstream change; final integrated verification is recorded below.
- Lint passed with zero errors and 13 existing warnings.
- Eight existing Node tests passed: public configuration, routing, search authorization and Revenue Audit preview CORS policy.
- Both existing visibility-crawler security tests passed using Deno.
- Before upstream integration, all 32 sitemap routes returned HTTP 200 with exactly one H1, one description and one canonical URL.
- Browser: 390px homepage had no horizontal overflow; reviewed the mobile screenshot.
- Browser with local mocked responses: Growth Check rendered an estimate and links to the £395 audit and visibility fix without contacting the live audit endpoint. Contact rejected an empty submission, preserved the partnership topic and displayed confirmation after a mocked successful submission. No real enquiries or payments were created.
- Development browser reported an attribute mismatch involving classes added by the existing `SiteEffects` animation module during hydration. The animation module was unchanged; this is recorded as a separate runtime concern, not a verified copy regression or a claim of a clean browser console.

## Release boundary and outstanding work

This is a proposed website copy release. It does not by itself establish a live release, completed payment test, backend delivery test or measured conversion improvement.

- Publication requires Daniel's approval under repository `AGENTS.md` before merging into the production source and publishing.
- Reconcile the older commercial control document with the already published Visibility Fix, Visibility Watch and Founding Studio Pilot. The proposed copy preserves their existing terms.
- Confirm any VAT wording and any future combined Watch & Fix scope/pricing before adding them.
- Retain the early-stage evidence statement until an authorised case study has a baseline, intervention, measurement window, outcome and limitations.
- After publication, verify the live pages and exact release commit. Measure the existing diagnostic-start/completion, contact and checkout events subject to consent; do not claim an uplift from the rewrite itself.
- The existing paid-audit button uses a static Stripe payment link, so free-check identifiers in the page URL are not newly wired into that payment link by this copy change. Payment attribution remains a separate implementation concern.
- The existing checkout return page can display a success message from a URL parameter before payment verification completes. This task does not change payment behaviour; a separate payment-state fix should gate that message on verified payment.

## Integrated release verification

After incorporating upstream `bc65f38`:

- `npm run build`: passed; generated route registration includes the upstream research-methodology page.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed, zero errors / 13 warnings.
- Eight existing Node tests rerun: all passed. The two Deno security tests also passed during this task.
- Built-site HTTP check at the local preview: all **33** sitemap routes returned 200, each with one H1, one description and one canonical URL.
- Automated comparison confirmed all six pre-existing offer prices remain identical to upstream; the new programme page uses a separately scoped proposal.
- No database, authentication, access controls, payment identifiers, price objects or backend function changes.
