import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/lib/consent.ts", import.meta.url), "utf8");

test("INKSIGHTS tag uses one verified GA4 stream, never the displaced ID", () => {
  assert.match(source, /export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-V7SQ9SPYMH";/);
  assert.match(source, /export const GOOGLE_TAG_ID = GOOGLE_ANALYTICS_MEASUREMENT_ID;/);
  assert.doesNotMatch(source, /G-03QJZLEPW0/);
  assert.match(source, /gtag\?\.\("config", GOOGLE_TAG_ID, \{ send_page_view: false \}\)/);
  assert.match(source, /gtag\/js\?id=\$\{encodeURIComponent\(GOOGLE_TAG_ID\)\}/);
});

test("analytics remains opt-in only", () => {
  assert.match(source, /if \(typeof window === "undefined" \|\| !readConsent\(\)\?\.analytics\) return;/);
  assert.match(source, /analytics_storage: consent\?\.analytics \? "granted" : "denied"/);
  assert.match(source, /if \(consent\.analytics\) \{/);
});
