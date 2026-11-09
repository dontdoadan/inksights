const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/analytics-preview",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-analytics-report" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop-analytics", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-analytics", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
