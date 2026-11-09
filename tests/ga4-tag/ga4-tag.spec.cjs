const { test, expect } = require("@playwright/test");

// No real GA4, Supabase analytics, Meta Pixel or customer records are touched.
async function isolateTracking(page, googleScriptRequests) {
  await page.route(/^https:\/\/www\.googletagmanager\.com\/gtag\/js/, async route => {
    googleScriptRequests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "/* simulated gtag loader */" });
  });
  await page.route(/\/functions\/v1\/public-web-event/, route => route.fulfill({status: 200, contentType: "application/json", body: '{"ok":true}', headers: { "access-control-allow-origin": "*" }}));
  await page.route(/^https:\/\/connect\.facebook\.net\//, route => route.abort());
}

test("no analytics request when optional cookies are rejected", async ({ page }) => {
  const scripts = [];
  await isolateTracking(page, scripts);
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  await expect(page.getByRole("dialog", { name: /Your privacy choices/i })).toBeVisible();
  await page.getByRole("button", { name: "Reject optional cookies" }).click();
  await expect(page.getByRole("dialog", { name: /Your privacy choices/i })).toHaveCount(0);
  const state = await page.evaluate(() => ({
    consent: JSON.parse(localStorage.getItem("inksight-consent-v1") || "null"),
    scriptCount: document.querySelectorAll('script[data-inksights-google-tag]').length,
  }));
  expect(state.consent.analytics).toBe(false);
  expect(state.scriptCount).toBe(0);
  expect(scripts).toHaveLength(0);
});

test("analytics-only consent loads and configures G-V7SQ9SPYMH, not the displaced tag", async ({ page }) => {
  const scripts = [];
  await isolateTracking(page, scripts);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Manage preferences" }).click();
  await page.getByRole("checkbox", { name: /^Analytics /i }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect.poll(() => scripts.length).toBe(1);
  expect(new URL(scripts[0]).searchParams.get("id")).toBe("G-V7SQ9SPYMH");
  expect(scripts[0]).not.toContain("G-03QJZLEPW0");
  const data = await page.evaluate(() => ({
    commands: (window.dataLayer || []).map(value => Array.from(value)),
    stored: JSON.parse(localStorage.getItem("inksight-consent-v1") || "null"),
  }));
  expect(data.stored.analytics).toBe(true);
  expect(data.stored.marketing).toBe(false);
  const config = data.commands.find(args => args[0] === "config");
  expect(config).toBeTruthy();
  expect(config[1]).toBe("G-V7SQ9SPYMH");
  expect(config[2].send_page_view).toBe(false);
  expect(data.commands.some(args => args[0] === "consent" && args[1] === "update" && args[2].analytics_storage === "granted")).toBe(true);
});
