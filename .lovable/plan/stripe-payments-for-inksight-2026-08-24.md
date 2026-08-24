# Stripe Payments for INKSIGHT

## Goal
Replace the hardcoded Stripe checkout links with Lovable's built-in Stripe payments, add checkout for the two public offers, and record completed payments in the backend.

## Context
- The eligibility check recommends **Stripe** (Paddle is not eligible because INKSIGHT sells packaged, done-for-you marketing services, not standalone software).
- Two offers already have legacy Stripe checkout URLs:
  - `72-hour-visibility-fix` — £249 one-off
  - `visibility-watch` — £99/month subscription
- Three offers are sales-assisted and currently have no checkout:
  - `revenue-audit` — quote after Growth Check
  - `booking-retention-engine` — quote after diagnosis
  - `founding-studio-pilot` — £1,500 setup + £750/month for 3 months, application-only

## Tax handling
Because these are human-delivered marketing services, the default path is **Stripe tax calculation and collection only** (`automatic_tax: { enabled: true }`). Stripe calculates and collects tax at checkout (+0.5% per transaction); the seller remains responsible for registration, filing and remittance. Full compliance handling (`managed_payments`) is not appropriate for professional services.

## Plan

### 1. Enable Stripe payments
Call `enable_stripe_payments`. This creates a test environment immediately. Live payments require account claim/verification later.

### 2. Create products and prices
After enabling, create Stripe products for the publicly purchasable offers:
- `72-hour-visibility-fix` — one-time price, £249 GBP
- `visibility-watch` — recurring price, £99 GBP/month

Sales-assisted offers (`revenue-audit`, `booking-retention-engine`, `founding-studio-pilot`) stay quote/invoice only; no self-serve checkout is added.

### 3. Update offer data and checkout buttons
- Remove the hardcoded legacy Stripe URLs from `src/lib/offer-data.ts`.
- Add a `priceId` or `productKey` field for the two public offers.
- Update `src/routes/offers.$slug.tsx` so the public-offer CTA creates a Stripe checkout session via a server function instead of linking out directly.
- Keep sales-assisted CTAs pointing to `/studio-growth-check` or `/contact`.

### 4. Implement checkout server function
Create a `createCheckoutSession` server function that:
- Accepts the offer slug.
- Looks up the Stripe price ID.
- Creates a Stripe checkout session in `sandbox` mode for test, `live` later.
- Returns the checkout URL.

### 5. Implement webhook handler
Add a public TanStack route at `src/routes/api/public/stripe-webhook.ts` that:
- Verifies the Stripe webhook signature.
- Listens for `checkout.session.completed`.
- Records the order/customer in the Lovable Cloud database.
- Returns 200 for handled events.

### 6. Database records
Create a minimal `orders` table in Lovable Cloud:
- `id`, `user_id` (nullable for guest checkout), `stripe_session_id`, `stripe_payment_intent_id`, `offer_slug`, `amount_total`, `currency`, `status`, `customer_email`, `created_at`, `updated_at`.
- Enable RLS and grant authenticated/service_role access.

### 7. Test and verify
- Run a test checkout for the £249 offer using Stripe's test card.
- Confirm the webhook records the order.
- Verify the offer page CTA opens the new checkout.

## Out of scope
- Subscription management portal (cancel/upgrade) — not included in this first pass.
- Performance-fee invoicing — remains manual/quote-based.
- Refund UI — handled through Stripe dashboard for now.
