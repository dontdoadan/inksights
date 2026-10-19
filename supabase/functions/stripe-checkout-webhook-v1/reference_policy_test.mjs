import assert from "node:assert/strict";
import test from "node:test";
import { isGrowthCheckId, verifiedGrowthCheckReference } from "./reference_policy.mjs";

const ref = "3a42bf5e-6ed3-442d-bae8-5beb9219ef45";

test("only UUID shaped Growth Check references are accepted", () => {
  assert.equal(isGrowthCheckId(ref), true);
  assert.equal(isGrowthCheckId("abc"), false);
  assert.equal(isGrowthCheckId(""), false);
  assert.equal(isGrowthCheckId(null), false);
});

test("Stripe email must match existing Growth Check email", () => {
  assert.equal(verifiedGrowthCheckReference(ref, "OWNER@studio.co.uk", "owner@studio.co.uk"), ref);
  assert.equal(verifiedGrowthCheckReference(ref, "another@studio.co.uk", "owner@studio.co.uk"), null);
  assert.equal(verifiedGrowthCheckReference(ref, "", "owner@studio.co.uk"), null);
  assert.equal(verifiedGrowthCheckReference("invalid", "owner@studio.co.uk", "owner@studio.co.uk"), null);
});
