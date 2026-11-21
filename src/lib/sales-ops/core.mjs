/**
 * INKSIGHTS Sales Operating System v1 — pure, side-effect-free decision functions.
 * Do not call these functions a payment verifier: webhook signatures and Stripe
 * server-side session retrieval are required upstream. No browser may mark orders paid.
 */

const compact = (v) => String(v ?? "").trim().toLowerCase();
const ident = (v) => compact(v).replace(/\s+/g, "");
const postcode = (v) => ident(v).toUpperCase();
export const VALID_PATHS = Object.freeze(["direct", "assisted", "unknown"]);

/** Never resolve a studio using an unverified name or an email address. */
export function resolveStudioIdentity(existingStudios, signal) {
  if (!Array.isArray(existingStudios) || !signal || typeof signal !== "object") {
    return { status: "review", reason: "invalid_input", studioId: null };
  }
  const companyNo = ident(signal.companiesHouseNumber);
  const placeId = ident(signal.googlePlaceId);
  const domain = normalizeDomain(signal.website);
  const zip = postcode(signal.postcode);
  // Company numbers identify legal entities, not individual branches/sites.
  // Site resolution requires a provider Place ID or a second location key.
  const matched = existingStudios.filter((row) => {
    const rowZip = postcode(row.postcode);
    const rowCompany = ident(row.companiesHouseNumber);
    const rowPlace = ident(row.googlePlaceId);
    if (placeId && rowPlace && rowPlace === placeId) return true;
    if (companyNo && zip && rowCompany === companyNo && rowZip === zip) return true;
    return Boolean(domain && zip && normalizeDomain(row.website) === domain && rowZip === zip);
  });
  if (matched.length > 1) return { status: "review", reason: "conflicting_identifiers", studioId: null };
  if (matched.length === 0) return { status: "review", reason: "no_verified_site_match", studioId: null };
  const match = matched[0];
  if (!match.id) return { status: "review", reason: "missing_canonical_id", studioId: null };
  // If two supplied authoritative identifiers disagree with a candidate,
  // route to manual review; never silently pick one of them.
  if ((placeId && match.googlePlaceId && ident(match.googlePlaceId) !== placeId) ||
      (companyNo && match.companiesHouseNumber && ident(match.companiesHouseNumber) !== companyNo) ||
      (zip && postcode(match.postcode) !== zip)) {
    return { status: "review", reason: "conflicting_identifiers", studioId: null };
  }
  return { status: "matched", reason: "verified_site_identifier", studioId: match.id };
}

export function normalizeDomain(input) {
  const raw = compact(input);
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const host = url.hostname.replace(/^www\./, "");
    if (!host || !host.includes(".") || host.includes("..")) return "";
    return host;
  } catch {
    return "";
  }
}

/**
 * Contact form acknowledgement alone is NOT marketing consent.
 * Corporate B2B electronic mail may not require PECR consent, but still needs
 * suppression screening, transparency and an appropriate UK GDPR basis where
 * personal information is processed. Unknown entities default to the stricter rule.
 */
export function evaluateContactPermission(p) {
  const deny = (reason) => ({ permitted: false, reason });
  if (!p || typeof p !== "object") return deny("missing_policy_evidence");
  if (p.optedOut || p.objected || p.suppressed) return deny("suppression");
  if (p.channel !== "email" && p.channel !== "social_dm") return deny("channel_not_assessed");
  if (!p.sourceRecorded || !p.privacyNoticeProvided || !p.lawfulBasisAssessed) return deny("compliance_evidence_missing");
  if (p.personalDataUsed && !p.ukGdprBasis) return deny("uk_gdpr_basis_missing");
  if (p.subscriberType === "corporate" && p.corporateStatusVerified) {
    return { permitted: true, reason: "corporate_b2b_electronic_marketing_reviewed" };
  }
  if (p.explicitMarketingConsent && p.consentEvidenceId) {
    return { permitted: true, reason: "marketing_consent_documented" };
  }
  if (p.softOptInVerified && p.softOptInEvidenceId) {
    return { permitted: true, reason: "soft_opt_in_documented" };
  }
  return deny("individual_or_unknown_subscriber_requires_permission");
}

/**
 * Upstream *must* verify Stripe-Signature over raw payload, use verified
 * account context and retrieve the session/line items server-side when necessary.
 * This predicate is a second, stricter business gate, not signature verification.
 */
export function classifyCheckoutEvent(event, context) {
  const decline = (reason) => ({ accepted: false, revenuePence: 0, status: "ignored", reason });
  if (!context?.signatureVerified || !context?.providerSessionVerified) return decline("provider_verification_missing");
  if (event?.livemode !== true || context.environment !== "live") return decline("not_live");
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event?.type)) {
    return decline("unrelated_event");
  }
  const session = event?.data?.object;
  if (!session || session.object !== "checkout.session" || !String(session.id || "").startsWith("cs_")) {
    return decline("invalid_session");
  }
  if (context.providerSessionId !== session.id) return decline("session_mismatch");
  if (session.payment_status !== "paid") return decline("not_paid");
  if (compact(session.currency) !== "gbp") return decline("currency_mismatch");
  if (context.verifiedOfferSlug !== "studio-intelligence-audit") return decline("incorrect_offer");
  if (context.verifiedPriceId !== context.expectedAuditPriceId || !context.expectedAuditPriceId) {
    return decline("price_not_verified");
  }
  const minor = session.amount_total;
  if (!Number.isSafeInteger(minor) || minor < 0) return decline("invalid_amount");
  if (minor === 0) return { accepted: true, status: "waived_not_revenue", revenuePence: 0, reason: "zero_value_valid_payment" };
  return { accepted: true, status: "paid", revenuePence: minor, reason: "verified_paid_session" };
}

export function acquisitionPath({ qualifiedContactBeforePurchase, directCheckoutSourceVerified }) {
  if (qualifiedContactBeforePurchase === true) return "assisted";
  if (qualifiedContactBeforePurchase === false && directCheckoutSourceVerified === true) return "direct";
  return "unknown";
}

export function canMarkDelivered({ orderVerified, reportCompleted, accessGranted, deliveryAccepted }) {
  return orderVerified === true && reportCompleted === true &&
    accessGranted === true && deliveryAccepted === true;
}

const dedup = (rows, key) => new Map(rows.filter((r) => r && !r.isTest && r[key]).map((r) => [String(r[key]), r]));
const ratio = (num, denom) => denom > 0 ? num / denom : null;

/**
 * Period-scoped inputs only. Amounts are minor units (pence) and cash costs
 * are independent of non-cash delivery hours. Null means "not established".
 */
export function buildWeeklyScorecard({ events = [], orders = [], delivery = [], costs = [], monitor = [] } = {}) {
  const es = [...dedup(events, "idempotencyKey").values()];
  const eventCount = (kind) => new Set(es.filter((x) => x.kind === kind).map((x) => x.studioId || x.candidateId || x.idempotencyKey)).size;
  const qualifiedAdded = eventCount("qualified");
  const approached = eventCount("outreach_sent");
  const positive = eventCount("positive_qualified_engagement");
  const discoveries = eventCount("discovery_completed");
  const qualifiedConversations = eventCount("qualified_conversation");
  const paidOrders = [...dedup(orders, "stripeSessionId").values()].filter(
    (x) => x.providerVerified === true && x.status === "paid" &&
      x.offerSlug === "studio-intelligence-audit" && x.currency === "gbp" &&
      Number.isSafeInteger(x.amountTotalPence) && x.amountTotalPence > 0
  );
  const paidStudios = new Set(paidOrders.map((x) => x.studioId).filter(Boolean));
  const grossPence = paidOrders.reduce((n, x) => n + x.amountTotalPence, 0);
  const spendPence = costs.filter((x) => !x.isTest && x.type === "acquisition" &&
    Number.isSafeInteger(x.amountPence)).reduce((n, x) => n + x.amountPence, 0);
  const fulfillmentCostPence = costs.filter((x) => !x.isTest && x.type === "delivery" &&
    Number.isSafeInteger(x.amountPence)).reduce((n, x) => n + x.amountPence, 0);
  const delivered = delivery.filter((x) => !x.isTest && x.completed === true);
  const deliveryHours = delivered.reduce((n, x) => n + (Number.isFinite(x.hours) && x.hours >= 0 ? x.hours : 0), 0);
  const implementationSold = new Set(es.filter((x) => x.kind === "implementation_paid_verified").map((x) => x.studioId).filter(Boolean));
  const monitored = monitor.filter((x) => !x.isTest && x.active === true);
  return {
    qualifiedStudiosAdded: qualifiedAdded,
    accountsApproached: approached,
    positiveQualifiedEngagementRate: ratio(positive, approached),
    discoveryCallsCompleted: discoveries,
    purchasesPerQualifiedConversation: ratio(paidOrders.length, qualifiedConversations),
    verifiedAuditPurchases: paidOrders.length,
    verifiedAuditRevenuePence: grossPence,
    acquisitionCostPerPayingStudioPence: paidStudios.size > 0 ? Math.round(spendPence / paidStudios.size) : null,
    auditDeliveryHours: deliveryHours,
    deliveryContributionPence: grossPence - fulfillmentCostPence,
    auditToImplementationConversion: ratio(implementationSold.size, new Set(delivered.map((x) => x.studioId).filter(Boolean)).size),
    activeMonitoringCustomers: new Set(monitored.map((x) => x.studioId).filter(Boolean)).size,
    monitoringRetentionRate: null, // must be calculated from comparable cohort snapshots
    reportingCoverage: { attributablePaidStudios: paidStudios.size, paidOrdersWithoutStudioLink: paidOrders.filter((x) => !x.studioId).length },
    byAcquisitionPath: Object.fromEntries(VALID_PATHS.map((path) => [path, {
      purchases: paidOrders.filter((o) => o.acquisitionPath === path).length,
      revenuePence: paidOrders.filter((o) => o.acquisitionPath === path).reduce((n, o) => n + o.amountTotalPence, 0),
    }]))
  };
}
