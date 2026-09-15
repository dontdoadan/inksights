import assert from "node:assert/strict";
import test from "node:test";

let contracts = null;
try {
  contracts = await import("../src/lib/integrations/contracts.mjs");
} catch {
  contracts = null;
}

test("checkout activation requires an approved offer and verified live mapping", () => {
  assert.ok(contracts, "P0 integration contracts are not implemented yet");

  const ready = contracts.isOfferCheckoutReady({
    approvalState: "approved",
    lifecycleState: "active",
    mappingStatus: "verified",
    externalPriceId: "price_live_123",
  });
  const unapproved = contracts.isOfferCheckoutReady({
    approvalState: "requires_approval",
    lifecycleState: "draft",
    mappingStatus: "approval_gated",
    externalPriceId: null,
  });

  assert.equal(ready, true);
  assert.equal(unapproved, false);
});

test("provider event idempotency keys are stable and environment scoped", () => {
  assert.ok(contracts, "P0 integration contracts are not implemented yet");

  assert.equal(
    contracts.providerEventKey("stripe", "production", "evt_123"),
    "stripe:production:evt_123",
  );
  assert.notEqual(
    contracts.providerEventKey("stripe", "production", "evt_123"),
    contracts.providerEventKey("stripe", "sandbox", "evt_123"),
  );
});

test("HubSpot company matching normalises website domains without paths or www", () => {
  assert.ok(contracts, "P0 integration contracts are not implemented yet");

  assert.equal(
    contracts.normaliseDomain("https://www.OffTheRailsTattooStudio.com/booking?src=test"),
    "offtherailstattoostudio.com",
  );
  assert.equal(contracts.normaliseDomain("offtherailstattoostudio.com"), "offtherailstattoostudio.com");
});

test("retry scheduling is deterministic and capped", () => {
  assert.ok(contracts, "P0 integration contracts are not implemented yet");

  const base = new Date("2026-09-15T09:00:00.000Z");
  assert.equal(
    contracts.nextRetryAt(1, base).toISOString(),
    "2026-09-15T09:01:00.000Z",
  );
  assert.equal(
    contracts.nextRetryAt(4, base).toISOString(),
    "2026-09-15T09:08:00.000Z",
  );
  assert.equal(
    contracts.nextRetryAt(20, base).toISOString(),
    "2026-09-15T10:00:00.000Z",
  );
});
