# Studio Intelligence Audit — £395 offer and fulfilment standard

**Version:** 1.0 · **Effective:** 21 October 2026 · **Status:** approved public paid offer

## Single immediately purchasable offer
- **Name:** INKSIGHTS Studio Intelligence Audit.
- **Price:** £395 GBP, one-time, collected in full at Stripe checkout. No subscription, success fee, ad spend or implementation is included.
- **Scope:** one established UK tattoo studio at one location. Ideal for owners/decision-makers of studios with 3+ artists. Additional sites, divisions, or non-studio tattoo businesses require a separate written scope.
- **Outcome:** an evidence-based answer to: *Which commercial constraint should this studio tackle first, why, and what should happen over the next 90 days?*
- **Checkout:** https://buy.stripe.com/aFadR85i3bOieZndHt93y00 (Stripe paid link; price ID `price_1UG09NCX6YhLOssgi93xsGnH`).
- **Offer page:** https://getinksights.co.uk/offers/studio-intelligence-audit

## Included deliverables
1. **PDF Studio Intelligence Audit report** containing an executive diagnosis and studio snapshot; identify what has actually been verified and what remains unknown.
2. **Local visibility and positioning assessment:** website, Google/Maps/public search presence, listings and relevant local competitor evidence, as publicly available.
3. **Customer journey review:** how a prospect moves from finding the studio through proof, enquiry and booking; identify visible friction or gaps.
4. **Commercial signals review:** consider enquiries, booking conversion, capacity and client return where reliable studio-supplied numbers are available; do not invent KPIs from incomplete data.
5. **Three prioritised opportunities:** evidence, commercial mechanism, confidence, likely effort, dependencies and recommended order.
6. **90-day action plan:** actions ordered by priority, accountable owner, sequence, checks and a measurable first intervention.
7. **45–60 minute remote findings session** to explain the primary constraint, choices and next steps.

All estimates, assumptions and benchmark limitations must be labelled; generic financial upside is not a promised outcome.

## Delivery commitments
- **Within one working day after successful payment:** email the buyer to confirm receipt and request the studio intake.
- **Within five working days after the buyer has paid and supplied complete intake information:** deliver the PDF report by email or an access-controlled client link.
- **Within five further working days of report delivery:** offer and schedule the remote 45–60 minute findings session, subject to buyer availability.
- Working days = Monday–Friday, excluding England and Wales bank holidays. The report clock does **not** start until required information is received. If access, data or approvals are missing, explain the hold and what is needed.
- The fixed audit is an evidence-led commercial/operational review, not a statutory accounting audit or a guarantee of ROI, revenue, ranking, leads or bookings.

## Buyer-facing post-payment journey
1. Checkout collects business name, purchaser name, email and studio website/booking link; buyer sees clear confirmation of next steps.
2. On Stripe-confirmed payment, production webhook should create/upsert the Supabase `orders` record and paid intake contact, then request HubSpot contact/deal sync. Webhook acknowledgement alone is not proof: check the resulting records for the first live transaction.
3. Send onboarding email within one working day requesting:
   - studio name, one address/location and public website/social/Google listing/booking links;
   - primary decision maker/contact, number of artists and main business question;
   - available last 90 days' approximate enquiry, booking and turnover/average session figures, if known;
   - approval for access to any restricted analytics, if additional access is necessary.
   Never request client medical records or raw personally identifiable booking spreadsheets by default. Clearly mark withheld/missing figures; public-only analysis remains possible with limitations.
4. Confirm intake completeness and start date; analyse public evidence and supplied aggregates; create the report; perform source and privacy QA.
5. Deliver report, send scheduling choices for findings call, conduct session and document agreed next step.
6. Offer any Primary Constraint Programme only as a separately priced and approved engagement. No automatic upsell, subscription or performance fee.

## Exception handling / manual fallback
- Failed or unpaid checkout: no deliverable begins.
- If Stripe webhook or CRM sync fails, reconcile by Stripe session ID, process the customer manually and retry safely without duplicate deal creation.
- A named operator must check new paid Stripe checkout sessions and `orders` each working day until fully automated notifications and live-payment acceptance tests are evidenced.
- Cancellation, refund and privacy matters follow the current published terms and UK consumer law as applicable; do not invent a bespoke unconditional refund promise.

## Complimentary founding-studio exception
- **Not** a normal sales path. Free/waived audit value £395 is reserved for a manually approved, named pilot with an invite record and individual tracking.
- Public website, standard sales links, payment page and ads must all direct customers to the **paid** £395 checkout.
- Complimentary payment links must not be circulated or active without an individually approved invitation. A written record must explain eligibility, evidence/data access, intended learning and any case-study permission separately.
- No studio receives a waived audit merely by requesting a discount. Pilot invites must be approved and issued one by one.

## Acceptance checks
- [x] Live Stripe £395 one-off product, price and payment link exist and are active (verified 21 October 2026).
- [x] Stripe production webhook endpoint enabled for completed and async-paid checkout events (configuration check).
- [ ] Complete a controlled paid live order and verify Stripe → Supabase order → HubSpot contact/deal → owner notification → intake email → report workflow.
- [ ] Check that each public CTA points only to the paid link and the deliverables/timings on the live site match this specification.
- [ ] Confirm working-hours operator ownership, email delivery sender, and permitted data-collection process.
