import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Regression guardrails for the privacy-preserving acquisition classifier.
// CI also compiles website-events.ts with TypeScript and runs the public browser smoke tests.
const source = readFileSync(new URL("../src/lib/website-events.ts", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../src/routes/pricing-benchmark.tsx", import.meta.url), "utf8");
const offer = readFileSync(new URL("../src/routes/offers.$slug.tsx", import.meta.url), "utf8");

test("assistant discovery is based on real referrer hosts, not arbitrary UTM labels", () => {
  assert.match(source, /function classifyAssistantReferrer\(hostname: string \| null\)/);
  for (const domain of ["chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "claude.ai", "copilot.microsoft.com"]) {
    assert.ok(source.includes(domain), domain);
  }
  assert.match(source, /const aiAssistant = classifyAssistantReferrer\(referrerHost\)/);
  assert.match(source, /if \(aiAssistant\) return "ai_assistant_referral"/);
  assert.match(source, /acquisition_channel: channel/);
  assert.doesNotMatch(source, /if \(params\.get\("utm_source"\).*ai_assistant_referral/);
});

test("paid search and consent gating take precedence over organic credit", () => {
  assert.match(source, /if \(hasAdClickId \|\| paidMedium\) return "paid"/);
  assert.match(source, /is_organic_search: channel === "organic_search"/);
  assert.doesNotMatch(source, /"fbclid"\]/); // Organic social clicks also contain fbclid.
  assert.match(source, /if \(typeof window === "undefined" \|\| !readConsent\(\)\?\.analytics\) return/);
  assert.match(source, /safeAnalyticsPath\(window\.location\.pathname\)/);
});

test("pricing stays honest about unvalidated bands and persists before revealing a result", () => {
  assert.match(pricing, /not statistically representative UK studio rates/);
  assert.match(pricing, /15 studio identities/);
  assert.match(pricing, /if \(!response\.ok \|\| !payload\.result \|\| !payload\.submissionId\)/);
  assert.match(pricing, /\{submitted && <div/);
});

test("paid audit content addresses evidenced owner pains without projecting revenue guarantees", () => {
  assert.match(offer, /Are enquiries, bookings or artist hours slipping through the gaps/);
  assert.match(offer, /does not promise specific revenue, Google rankings or confirmed bookings/);
  assert.match(offer, /Payment verified/);
});
