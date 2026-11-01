import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Regression guardrails for the privacy-preserving acquisition classifier.
// CI also compiles website-events.ts with TypeScript and runs the public browser smoke tests.
const source = readFileSync(new URL("../src/lib/website-events.ts", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../src/routes/pricing-benchmark.tsx", import.meta.url), "utf8");
const offer = readFileSync(new URL("../src/routes/offers.$slug.tsx", import.meta.url), "utf8");
const consent = readFileSync(new URL("../src/lib/consent.ts", import.meta.url), "utf8");
const analyticsPath = readFileSync(new URL("../src/lib/analytics-path.ts", import.meta.url), "utf8");
const leadIntake = readFileSync(new URL("../supabase/functions/revenue-audit-v1/index.ts", import.meta.url), "utf8");
const growthCheck = readFileSync(new URL("../src/routes/studio-growth-check.tsx", import.meta.url), "utf8");

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

test("GA4 route reporting redacts private tokens and query parameters", () => {
  assert.match(consent, /const safePath = safeAnalyticsPath\(path\)/);
  assert.match(consent, /page_location: new URL\(safePath, window\.location\.origin\)\.toString\(\)/);
  assert.doesNotMatch(consent, /page_location: window\.location\.href/);
  assert.match(analyticsPath, /return "\/private-flow"/);
  assert.match(analyticsPath, /pathname\.split\("\?"\)\[0\]\.split\("#"\)\[0\]/);
  assert.match(source, /import \{ safeAnalyticsPath \} from "\.\/analytics-path"/);
});

test("lead source linkage is consent-gated, bounded and not mistaken for verified attribution", () => {
  assert.match(growthCheck, /analytics_consent: readConsent\(\)\?\.analytics === true/);
  assert.match(growthCheck, /getConsentedLeadAcquisitionContext\(\)/);
  assert.match(source, /if \(typeof window === "undefined" \|\| !readConsent\(\)\?\.analytics\) return \{\}/);
  assert.match(leadIntake, /body\.analytics_consent === true/);
  assert.match(leadIntake, /client_analytics_session_id/);
  assert.match(leadIntake, /permittedChannels/);
  assert.match(leadIntake, /browser-reported and must never be considered verified channel truth/);
});
