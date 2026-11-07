const { test, expect } = require("@playwright/test");

test("homepage has no incomplete global Dataset rich-result object", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((items) => {
    const found = [];
    const scan = (value) => {
      if (Array.isArray(value)) { value.forEach(scan); return; }
      if (!value || typeof value !== "object") return;
      if (value["@type"]) found.push(value["@type"]);
      Object.values(value).forEach(scan);
    };
    for (const item of items) {
      try { scan(JSON.parse(item.textContent || "{}")); } catch { /* irrelevant non-JSON block */ }
    }
    return found;
  });
  expect(types.flat().filter((type) => type === "Dataset")).toHaveLength(0);
});

test("canonical research page retains a complete discoverable Dataset", async ({ page }) => {
  const response = await page.goto("/research/greater-london-tattoo-pricing-2026", { waitUntil: "domcontentloaded" });
  expect(response.status()).toBe(200);
  const result = await page.locator('script[type="application/ld+json"]').evaluateAll((items) => {
    const objects = [];
    const scan = (value) => {
      if (Array.isArray(value)) { value.forEach(scan); return; }
      if (!value || typeof value !== "object") return;
      if (value["@type"] === "Dataset") objects.push(value);
      Object.values(value).forEach(scan);
    };
    for (const item of items) {
      try { scan(JSON.parse(item.textContent || "{}")); } catch {}
    }
    return objects;
  });
  expect(result).toHaveLength(1);
  expect(result[0].name).toContain("Greater London Tattoo Pricing");
  expect(result[0].description.length).toBeGreaterThanOrEqual(50);
  expect(result[0].distribution.contentUrl).toMatch(/\.csv$/);
});

test("improved owner-facing pages render at desktop and mobile widths", async ({ page }) => {
  for (const path of ["/tattoo-studio-growth", "/tattoo-studio-booking", "/pricing-benchmark", "/offers/studio-intelligence-audit"]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const width = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(width.body, path).toBeLessThanOrEqual(width.viewport + 4);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://getinksights.co.uk" + path);
  }
});

test("pricing tool continues to require saved submission before showing personal results", async ({ page }) => {
  await page.goto("/pricing-benchmark", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/not statistically representative UK studio rates/i)).toBeVisible();
  await expect(page.getByText(/Your personal pricing position is hidden until you submit/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /submit data and view my benchmark/i })).toBeVisible();
  // Do not send a submission: these browser checks must never create studio data.
});

test("audit buyer page describes scope and does not claim guaranteed results", async ({ page }) => {
  await page.goto("/offers/studio-intelligence-audit", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Are enquiries, bookings or artist hours slipping through the gaps/i)).toBeVisible();
  await expect(page.getByText(/does not promise specific revenue, Google rankings or confirmed bookings/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /buy the audit/i }).first()).toBeVisible();
});
