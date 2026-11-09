const { test, expect } = require("@playwright/test");

// This checks the proposed branch in a local browser. Never call real Google or
// first-party analytics endpoints: requests are intercepted, not delivered.
async function mockAnalytics(page, scripts) {
  await page.route(/^https:\/\/www\.googletagmanager\.com\/gtag\/js/, async route => {
    scripts.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "/* safely mocked Google tag */" });
  });
  await page.route("https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/public-web-event", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' });
  });
  await page.route(/^https:\/\/connect\.facebook\.net\//, route => route.abort());
}

test("consent denied does not load Google Analytics", async ({ page }) => {
  const loaded = [];
  await mockAnalytics(page, loaded);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog", { name: /Your privacy choices/i })).toBeVisible();
  await page.getByRole("button", { name: "Reject optional cookies" }).click();
  await expect(page.getByRole("dialog", { name: /Your privacy choices/i })).toHaveCount(0);
  expect(loaded).toHaveLength(0);
  const state = await page.evaluate(() => ({
    consent: JSON.parse(localStorage.getItem("inksight-consent-v1") || "null"),
    gtagScripts: document.querySelectorAll('script[data-inksights-google-tag]').length,
  }));
  expect(state.consent.analytics).toBe(false);
  expect(state.gtagScripts).toBe(0);
});

test("analytics-only consent loads the confirmed INKSIGHTS GA4 destination", async ({ page }) => {
  const loaded = [];
  await mockAnalytics(page, loaded);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Manage preferences" }).click();
  await page.getByRole("checkbox", { name: /^Analytics /i }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect.poll(() => loaded.length).toBe(1);
  expect(new URL(loaded[0]).searchParams.get("id")).toBe("G-V7SQ9SPYMH");
  expect(loaded[0]).not.toContain("G-03QJZLEPW0");
  const commands = await page.evaluate(() => (window.dataLayer || []).map(value => Array.from(value)));
  const config = commands.find(value => value[0] === "config");
  expect(config).toBeTruthy();
  expect(config[1]).toBe("G-V7SQ9SPYMH");
  expect(config[2].send_page_view).toBe(false);
  expect(commands.find(value => value[0] === "consent" && value[1] === "update" && value[2].analytics_storage === "granted")).toBeTruthy();
  const consent = await page.evaluate(() => JSON.parse(localStorage.getItem("inksight-consent-v1") || "null"));
  expect(consent.analytics).toBe(true);
  expect(consent.marketing).toBe(false);
});

test("consented page view strips query values before sending to GA4", async ({ page }) => {
  const loaded = [];
  await mockAnalytics(page, loaded);
  await page.addInitScript(() => localStorage.setItem("inksight-consent-v1", JSON.stringify({
    essential: true, analytics: true, marketing: false, updatedAt: "2026-11-09T00:00:00.000Z",
  })));
  const response = await page.goto("/tattoo-studio-growth?utm_source=example&token=should-not-leak", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  await expect.poll(() => loaded.length).toBe(1);
  await expect.poll(async () => page.evaluate(() => (window.dataLayer || []).filter(value => {
    const args = Array.from(value);
    return args[0] === "event" && args[1] === "page_view";
  }).length)).toBeGreaterThan(0);
  const sent = await page.evaluate(() => (window.dataLayer || []).map(value => Array.from(value))
    .filter(args => args[0] === "event" && args[1] === "page_view").map(args => args[2]));
  for (const item of sent) {
    expect(item.page_location).toBe("http://127.0.0.1:5173/tattoo-studio-growth");
    expect(item.page_path).toBe("/tattoo-studio-growth");
    expect(JSON.stringify(item)).not.toContain("should-not-leak");
  }
});
