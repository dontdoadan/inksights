/** Source-only acceptance policy for the existing £395 Stripe-hosted payment link.
 *  Does not grant entitlements or accept direct-session metadata as proof of price.
 *  Signed webhook verification happens before this function is called.
 */
export const AUDIT_PAYMENT_LINK_ID = 'plink_1UG09jCX6YhLOssgBDzdEF5X';
export const AUDIT_PRICE_PENCE = 39500;

export function assessAuditCheckout(event, session) {
  const fail = (decision, reason) => ({ decision, reason });
  if (event?.livemode !== true) return fail('ignore', 'non_live_event');
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event?.type)) {
    return fail('ignore', 'unrelated_event_type');
  }
  if (!session || session.object !== 'checkout.session' || typeof session.id !== 'string') {
    return fail('reject', 'invalid_checkout_payload');
  }
  const claimedAudit = ['studio_intelligence_audit', 'studio-intelligence-audit'].includes(
    String(session.metadata?.offer || session.metadata?.offer_slug || '')
  );
  if (session.payment_link !== AUDIT_PAYMENT_LINK_ID) {
    return claimedAudit ? fail('reject', 'unverified_audit_checkout_origin') : fail('ignore', 'unrelated_checkout');
  }
  if (session.mode !== 'payment') return fail('reject', 'wrong_mode');
  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    return fail('ignore', 'payment_not_confirmed');
  }
  if (session.currency?.toLowerCase() !== 'gbp' || session.amount_total !== AUDIT_PRICE_PENCE) {
    return fail('reject', 'wrong_currency_or_amount');
  }
  return { decision: 'accept', reason: 'verified_paid_audit_link' };
}
