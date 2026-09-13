import { defineConfig } from "@playwright/test";

const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${playwrightPort}`;
const headersPort = Number(process.env.SERVE_DIST_PORT ?? playwrightPort + 100);
const headersBaseURL = `http://127.0.0.1:${headersPort}`;

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
    { name: "chromium", testIgnore: /csp-headers\.spec\.ts/, use: { browserName: "chromium" } },
    { name: "firefox", testIgnore: /csp-headers\.spec\.ts/, use: { browserName: "firefox" } },
    { name: "webkit", testIgnore: /csp-headers\.spec\.ts/, use: { browserName: "webkit" } },
    // One engine is enough here: the subject is the headers and how the built
    // site behaves under them, not per-engine rendering. Chromium reports CSP
    // violations most precisely of the three.
    { name: "csp-headers", testMatch: /csp-headers\.spec\.ts/, use: { browserName: "chromium", baseURL: headersBaseURL } },
  ],
  webServer: [
    {
      command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${playwrightPort}`,
      url: baseURL,
      // A local test must exercise the build it just produced. Failing when a
      // port is already occupied is preferable to quietly testing stale dist/.
      reuseExistingServer: false,
      timeout: 45_000,
    },
    {
      // No build of its own on purpose — the server above owns that, and two
      // concurrent builds would race over dist/. This one reads from disk per
      // request, so it can start before dist exists; Playwright waits for both
      // servers to answer before the first test runs, by which time the build
      // has finished.
      command: `node scripts/serve-dist.mjs`,
      env: { SERVE_DIST_PORT: String(headersPort) },
      url: headersBaseURL,
      // This server is the runtime-CSP subject, so it must never be an older
      // process that happens to be listening on the configured port.
      reuseExistingServer: false,
      // Longer than its neighbour's: this one is up in milliseconds but only
      // starts answering 200 for `/` once the other's build has written dist.
      timeout: 120_000,
    },
  ],
});
