import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin, validateContactPayload } from "./contact-policy.mjs";

test("accepts canonical INKSIGHTS origins only", () => {
  assert.equal(isAllowedOrigin("https://getinksights.co.uk"), true);
  assert.equal(isAllowedOrigin("https://www.getinksights.co.uk"), true);
  assert.equal(isAllowedOrigin("https://getinkcare.co.uk"), false);
  assert.equal(isAllowedOrigin("https://evil.example"), false);
});

test("rejects invalid contact submissions", () => {
  const result = validateContactPayload({
    name: "",
    email: "bad",
    topic: "",
    message: "short",
    consent: false,
  });
  assert.equal(result.ok, false);
});

test("normalises a valid contact submission", () => {
  const result = validateContactPayload({
    name: "  Studio Owner  ",
    email: " OWNER@EXAMPLE.COM ",
    studio_name: " Example Studio ",
    topic: "growth-check",
    message: "I would like help understanding our current growth bottleneck.",
    consent: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "owner@example.com");
  assert.equal(result.value.name, "Studio Owner");
  assert.equal(result.value.studio_name, "Example Studio");
});
