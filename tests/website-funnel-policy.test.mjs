import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [consent, offer, growth, home] = await Promise.all([
  "src/lib/consent.ts",
  "src/routes/offers.$slug.tsx",
  "src/routes/studio-growth-check.tsx",
  "src/routes/index.tsx",
].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")));

test("GA4 page_location uses a privacy-safe pathname, never a browser URL containing query data", () => {
  assert.doesNotMatch(consent, /page_location:\s*window\.location\.href/);
  assert.match(consent, /const safePath = safePagePath\(path\)/);
  assert.match(consent, /page_location:\s*new URL\(safePath, window\.location\.origin\)\.href/);
  assert.match(consent, /page_path:\s*safePath/);
});

test("analytics pathname redaction handles checkout parameters and private report routes", () => {
  const start = consent.indexOf("function safePagePath(");
  const end = consent.indexOf("\nexport function trackGooglePageView", start);
  assert.ok(start >= 0 && end > start, "private-path sanitizer must exist");
  const source = consent.slice(start, end).replace("path: string", "path");
  const safePagePath = vm.runInNewContext(`${source}\nsafePagePath`);
  assert.equal(safePagePath("/offers/studio-intelligence-audit?checkout=success&session_id=test"), "/offers/studio-intelligence-audit");
  assert.equal(safePagePath("/report/this-is-a-private-access-token"), "/private-flow");
  assert.equal(safePagePath("/invite/secret-value"), "/private-flow");
  assert.equal(safePagePath("/resources#section"), "/resources");
  assert.equal(safePagePath("/offers/" + "a".repeat(55)), "/offers/:id");
});

test("checkout starts only after an actual checkout URL is available", () => {
  const start = offer.indexOf("function CheckoutButton(");
  assert.ok(start > 0);
  const button = offer.slice(start);
  assert.match(button, /trackWebsiteEvent\("cta_clicked", \{ cta: "purchase_checkout", offer: offer\.slug \}\)/);
  const direct = button.indexOf("if (offer.checkoutUrl)");
  const firstStart = button.indexOf('trackWebsiteEvent("checkout_started"', direct);
  const firstRedirect = button.indexOf("window.location.href = offer.checkoutUrl;", direct);
  assert.ok(direct >= 0 && direct < firstStart && firstStart < firstRedirect);
  const created = button.indexOf("if (url)", firstRedirect);
  const secondStart = button.indexOf('trackWebsiteEvent("checkout_started"', created);
  const secondRedirect = button.indexOf("window.location.href = url;", created);
  assert.ok(created > firstRedirect && created < secondStart && secondStart < secondRedirect);
  assert.equal((button.match(/trackWebsiteEvent\("checkout_started"/g) || []).length, 2);
  assert.match(button, /checkout_initialization_failed/);
});

test("shorter Growth Check path is visibly separated from the calculated result", () => {
  assert.match(growth, /href="\/contact\?topic=growth-check"/);
  assert.match(growth, /Tell us what you know instead/);
  assert.match(growth, /if \(!response\.ok \|\| !data\.ok\)/);
  assert.match(growth, /setResult\(data as Result\)/);
});

test("homepage motion components are preserved", () => {
  for (const component of ["HeroSignalPanel", "SignalTicker", "SignalObservatory", "RevenueLeakageMap", "TiltCard"]) {
    assert.match(home, new RegExp(`<${component}\\b`), `missing ${component}`);
  }
});
