import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = readFileSync(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
const research = readFileSync(new URL("../src/routes/research.greater-london-tattoo-pricing-2026.tsx", import.meta.url), "utf8");
const growth = readFileSync(new URL("../src/routes/tattoo-studio-growth.tsx", import.meta.url), "utf8");
const booking = readFileSync(new URL("../src/routes/tattoo-studio-booking.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../src/routes/pricing-benchmark.tsx", import.meta.url), "utf8");
const audit = readFileSync(new URL("../src/routes/offers.$slug.tsx", import.meta.url), "utf8");

test("Dataset graph is scoped to its research landing page", () => {
  assert.doesNotMatch(root, /"@type": "Dataset"/);
  assert.match(research, /"@type": "Dataset"/);
  assert.match(research, /description:\s*\n\s*"A pilot INKSIGHTS dataset/);
  assert.match(research, /contentUrl: CSV_URL/);
  assert.match(research, /links: \[\{ rel: "canonical", href: CANONICAL_URL \}\]/);
});

test("owner-intent guides address booking problems with bounded examples", () => {
  assert.match(growth, /Why is my tattoo studio quiet or struggling to get bookings/);
  assert.match(booking, /Why are tattoo enquiries not converting into bookings/);
  assert.match(booking, /illustrative difference of £1,200/);
  assert.match(booking, /not guaranteed revenue or profit/);
});

test("pricing evidence and audit offer preserve truthful client-facing claims", () => {
  assert.match(pricing, /not statistically representative UK studio rates/);
  assert.match(pricing, /15 studio identities/);
  assert.match(pricing, /if \(!response\.ok \|\| !payload\.result \|\| !payload\.submissionId\)/);
  assert.match(audit, /Are enquiries, bookings or artist hours slipping through the gaps/);
  assert.match(audit, /does not promise specific revenue, Google rankings or confirmed bookings/);
});
