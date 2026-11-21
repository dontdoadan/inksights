import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDomain, resolveStudioIdentity, evaluateContactPermission,
  classifyCheckoutEvent, acquisitionPath, canMarkDelivered, buildWeeklyScorecard
} from "../src/lib/sales-ops/core.mjs";

const event = (overrides = {}, sessionOverrides = {}) => ({
  id: "evt_123", livemode: true, type: "checkout.session.completed",
  data: { object: {
    object: "checkout.session", id: "cs_live_123",
    payment_status: "paid", amount_total: 39500, currency: "gbp",
    ...sessionOverrides
  } },
  ...overrides
});
const ctx = {
  signatureVerified: true,
  providerSessionVerified: true,
  providerSessionId: "cs_live_123",
  verifiedOfferSlug: "studio-intelligence-audit",
  expectedAuditPriceId: "price_example",
  verifiedPriceId: "price_example",
  environment: "live",
};

test("normalises a HTTPS domain and discards tracking paths", () => {
  assert.equal(normalizeDomain("https://www.EXAMPLE.co.uk/book?utm_source=ad"), "example.co.uk");
  assert.equal(normalizeDomain("javascript:alert(1)"), "");
});
test("resolves strong company number only", () => {
  const studios = [{ id: "studio-1", companiesHouseNumber: "01234567", website: "shop.co.uk", postcode: "CR0 1AA" }];
  assert.equal(resolveStudioIdentity(studios, { companiesHouseNumber: "01234567", postcode: "CR0 1AA" }).studioId, "studio-1");
  assert.equal(resolveStudioIdentity(studios, { companiesHouseNumber: "01234567" }).status, "review");
  assert.equal(resolveStudioIdentity(studios, { name: "Studio" }).status, "review");
});
test("shared website alone does not merge branches", () => {
  const studios = [{ id: "a", website: "group.co.uk", postcode: "W1A 1AA" }, { id: "b", website: "group.co.uk", postcode: "CR0 1AA" }];
  assert.equal(resolveStudioIdentity(studios, { website: "group.co.uk" }).status, "review");
  assert.equal(resolveStudioIdentity(studios, { website: "group.co.uk", postcode: "CR0 1AA" }).studioId, "b");
});
test("conflicting strong identifiers produce human review", () => {
  const studios = [{ id: "a", companiesHouseNumber: "00000001", postcode:"CR0 1AA", googlePlaceId:"place-1" }, { id: "b", googlePlaceId: "place-2", postcode:"CR0 1AA" }];
  assert.equal(resolveStudioIdentity(studios, { companiesHouseNumber: "00000001", postcode:"CR0 1AA", googlePlaceId: "place-2" }).reason, "conflicting_identifiers");
});
test("contact form acknowledgement never grants permission", () => {
  assert.equal(evaluateContactPermission({ channel:"email", sourceRecorded:true, privacyNoticeProvided:true, lawfulBasisAssessed:true, subscriberType:"unknown", formSubmitted:true }).permitted, false);
});
test("verified corporate marketing can proceed if safeguards documented", () => {
  assert.equal(evaluateContactPermission({
    channel:"email", sourceRecorded:true, privacyNoticeProvided:true, lawfulBasisAssessed:true,
    ukGdprBasis:"legitimate_interests", personalDataUsed:true,
    subscriberType:"corporate", corporateStatusVerified:true, suppressed:false
  }).permitted, true);
});
test("an opt-out overrides marketing consent", () => {
  const p = {channel:"email",sourceRecorded:true,privacyNoticeProvided:true,lawfulBasisAssessed:true,subscriberType:"corporate",corporateStatusVerified:true, optedOut:true};
  assert.equal(evaluateContactPermission(p).reason, "suppression");
});
test("unknown subscriber requires specific marketing consent", () => {
  const p = { channel:"social_dm",sourceRecorded:true,privacyNoticeProvided:true,lawfulBasisAssessed:true,subscriberType:"unknown",explicitMarketingConsent:true,consentEvidenceId:"c-1" };
  assert.equal(evaluateContactPermission(p).permitted, true);
  delete p.consentEvidenceId;
  assert.equal(evaluateContactPermission(p).permitted, false);
});
test("signed completed event that is still unpaid does not produce revenue", () => {
  const v = classifyCheckoutEvent(event({}, {payment_status:"unpaid"}),ctx);
  assert.equal(v.accepted,false);
});
test("asynchronous success also requires a paid Stripe session", () => {
  assert.equal(classifyCheckoutEvent(event({type:"checkout.session.async_payment_succeeded"},{payment_status:"unpaid"}),ctx).accepted,false);
});
test("spoofed signature, wrong session, test event or wrong offer are rejected", () => {
  assert.equal(classifyCheckoutEvent(event(),{...ctx,signatureVerified:false}).accepted,false);
  assert.equal(classifyCheckoutEvent(event(),{...ctx,providerSessionId:"cs_wrong"}).accepted,false);
  assert.equal(classifyCheckoutEvent(event({livemode:false}),ctx).accepted,false);
  assert.equal(classifyCheckoutEvent(event(),{...ctx,verifiedOfferSlug:"phase1-test-deposit"}).accepted,false);
  assert.equal(classifyCheckoutEvent(event(),{...ctx,verifiedPriceId:"other"}).accepted,false);
});
test("paid audit counts actual collected value and zeros count as waivers", () => {
  assert.deepEqual(classifyCheckoutEvent(event(),ctx),{
    accepted:true,status:"paid",revenuePence:39500,reason:"verified_paid_session"
  });
  assert.equal(classifyCheckoutEvent(event({}, {amount_total:0}),ctx).status,"waived_not_revenue");
});
test("sales assisted only when a qualified contact preceded payment", () => {
  assert.equal(acquisitionPath({qualifiedContactBeforePurchase:true,directCheckoutSourceVerified:true}),"assisted");
  assert.equal(acquisitionPath({qualifiedContactBeforePurchase:false,directCheckoutSourceVerified:true}),"direct");
  assert.equal(acquisitionPath({}),"unknown");
});
test("delivery is gated on all milestones", () => {
  assert.equal(canMarkDelivered({orderVerified:true,reportCompleted:true,accessGranted:true,deliveryAccepted:false}),false);
  assert.equal(canMarkDelivered({orderVerified:true,reportCompleted:true,accessGranted:true,deliveryAccepted:true}),true);
});
test("scorecard excludes QA and unrelated orders, preserves direct vs assisted", () => {
  const s=buildWeeklyScorecard({
    events:[
      {idempotencyKey:"q1",kind:"qualified",studioId:"a"},
      {idempotencyKey:"q1",kind:"qualified",studioId:"a"},
      {idempotencyKey:"q2",kind:"qualified",studioId:"demo",isTest:true},
      {idempotencyKey:"o1",kind:"outreach_sent",studioId:"a"},
      {idempotencyKey:"p1",kind:"positive_qualified_engagement",studioId:"a"},
      {idempotencyKey:"c1",kind:"qualified_conversation",studioId:"a"}
    ],
    orders:[
      {stripeSessionId:"cs_a",studioId:"a",status:"paid",providerVerified:true,offerSlug:"studio-intelligence-audit",amountTotalPence:39500,currency:"gbp",acquisitionPath:"assisted"},
      {stripeSessionId:"cs_b",studioId:"b",status:"paid",providerVerified:true,offerSlug:"studio-intelligence-audit",amountTotalPence:39500,currency:"gbp",acquisitionPath:"direct"},
      {stripeSessionId:"cs_test",studioId:"x",status:"paid",providerVerified:true,offerSlug:"phase1-test-deposit",amountTotalPence:100,currency:"gbp"},
      {stripeSessionId:"cs_bad",studioId:"x",status:"paid",providerVerified:false,offerSlug:"studio-intelligence-audit",amountTotalPence:39500,currency:"gbp"}
    ],
    costs:[{type:"acquisition",amountPence:2000},{type:"delivery",amountPence:10000}],
    delivery:[{studioId:"a",completed:true,hours:4}]
  });
  assert.equal(s.qualifiedStudiosAdded,1);
  assert.equal(s.positiveQualifiedEngagementRate,1);
  assert.equal(s.verifiedAuditRevenuePence,79000);
  assert.equal(s.verifiedAuditPurchases,2);
  assert.equal(s.acquisitionCostPerPayingStudioPence,1000);
  assert.equal(s.deliveryContributionPence,69000);
  assert.equal(s.byAcquisitionPath.direct.purchases,1);
  assert.equal(s.byAcquisitionPath.assisted.purchases,1);
});
test("undefined conversion ratios are null, not misleading zeros", () => {
  const s=buildWeeklyScorecard();
  assert.equal(s.purchasesPerQualifiedConversation,null);
  assert.equal(s.positiveQualifiedEngagementRate,null);
  assert.equal(s.monitoringRetentionRate,null);
});
