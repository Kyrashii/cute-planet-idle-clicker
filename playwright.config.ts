import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests. These boot the real app (Express + Vite dev server on
 * port 3000) in a headless browser and exercise the worker <-> React seam that
 * unit tests can't reach (worker boot, click round-trip, autosave, reload
 * rehydration).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: /(mobile|effects)\.spec\.ts/,
    },
    // WebKit runs in CI (and locally with E2E_WEBKIT=1 once `npx playwright
    // install webkit` succeeds) — some dev machines can't install it.
    ...(process.env.CI || process.env.E2E_WEBKIT
      ? [
          {
            name: "mobile-safari",
            use: { ...devices["iPhone 14"] },
            testMatch: /mobile\.spec\.ts/,
          },
        ]
      : []),
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
