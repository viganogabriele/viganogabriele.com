import { defineConfig } from "@playwright/test";

const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  // The suite intentionally exercises animation timing and in-flight route
  // transitions. Running browser projects concurrently on GitHub's shared
  // runners starves those checks and turns real-time assertions flaky.
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    colorScheme: "dark",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${playwrightPort}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 45_000,
  },
});
