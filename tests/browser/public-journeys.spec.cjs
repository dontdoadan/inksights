const { test, expect } = require("@playwright/test");

test("homepage navigation and free check route remain usable", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  const growthLink = page.locator('a[href="/studio-growth-check"]:visible').first();
  await expect(growthLink).toBeVisible();
  await growthLink.click();
  await expect(page).toHaveURL(/\/studio-growth-check(?:\?|$)/);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("contact form rejects empty input without submitting", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  const form = page.locator("form").first();
  await expect(form).toBeVisible();
  expect(await form.evaluate((el) => el.checkValidity())).toBe(false);
});

test("pricing result requires a successful saved submission", async ({ page }) => {
  await page.goto("/pricing-benchmark", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /submit data and view my benchmark/i })).toBeVisible();
  await page.locator('input[aria-label*="Small tattoo"]').fill("100");
  await expect(page.getByText(/Your personal pricing position is hidden until you submit/i)).toBeVisible();
  await expect(page.getByText(/Submission saved/i)).toHaveCount(0);
  // Intentionally do not submit: browser tests must not create production data.
});

test("invalid offer responds 404 instead of a search-indexable soft 404", async ({ page }) => {
  const response = await page.goto("/offers/not-a-real-offer", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
});

test("critical public pages render and do not overflow the viewport", async ({ page }) => {
  for (const path of ["/offers", "/offers/studio-intelligence-audit", "/resources", "/privacy", "/support"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(width.content, "horizontal overflow at " + path).toBeLessThanOrEqual(width.viewport + 4);
  }
});

test("unverified checkout URL cannot announce a successful payment", async ({ page }) => {
  await page.goto("/offers/studio-intelligence-audit?checkout=success", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Payment successful\. Thank you/i)).toHaveCount(0);
  await expect(page.getByText(/Payment verified\./i)).toHaveCount(0);
  await expect(page.getByText(/Payment could not be verified here/i)).toBeVisible();
});

test("reports portal serves its restricted sign-in landing page", async ({ page }) => {
  const response = await page.goto("https://reports.getinksights.co.uk/login", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("proposed Growth Check provides a shorter enquiry route without fabricated figures", async ({ page }) => {
  test.skip(!process.env["E2E_BASE_URL"]?.includes("127.0.0.1"), "Validate proposed content on PR branch");
  await page.goto("/studio-growth-check", { waitUntil: "domcontentloaded" });
  const alternative = page.getByRole("link", { name: /tell us what you know instead/i });
  await expect(alternative).toBeVisible();
  await alternative.click();
  await expect(page).toHaveURL(/\/contact\?topic=growth-check/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/without all your figures/i);
  await expect(page.getByRole("heading", { name: /tell us what you know about your studio/i })).toBeVisible();
  const form = page.locator("form").first();
  expect(await form.evaluate((element) => element.checkValidity())).toBe(false);
});

test("animated homepage components remain rendered in the proposed release", async ({ page }) => {
  test.skip(!process.env["E2E_BASE_URL"]?.includes("127.0.0.1"), "Validate proposed motion components on PR branch");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const selector of [".cinematic-hero", ".hero-signal-panel", ".signal-ticker", ".signal-observatory"]) {
    await expect(page.locator(selector).first(), selector).toBeAttached();
  }
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(width.content).toBeLessThanOrEqual(width.viewport + 4);
});
