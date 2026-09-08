import { expect, test } from "@playwright/test";

/**
 * The built site, under the headers vercel.json actually sends.
 *
 * The rest of the suite runs against `vite preview`, which sends none of them,
 * so nothing in it can catch a policy the site no longer satisfies — a new font
 * or CDN origin, an analytics vendor, a library that reaches for eval(). This
 * project runs against scripts/serve-dist.mjs instead, which reads the same
 * vercel.json the deploy does. Kept in its own file and its own project so the
 * three browser projects stay on the preview server they were written against.
 */
const ROUTES = ["/", "/cv", "/notes/vpn-off-by-default", "/does-not-exist"] as const;

type ViolationLog = Window & { cspViolations?: string[] };

test.describe("production security headers", () => {
  test("the global header block is actually applied", async ({ page }) => {
    const response = await page.goto("/");
    expect(response, "no response for /").not.toBeNull();
    const headers = response!.headers();
    // Asserted before the per-route checks below so a server that quietly
    // stopped sending the policy reads as a broken harness, not a clean site.
    expect(headers["content-security-policy"]).toContain("script-src 'self' 'sha256-");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  for (const route of ROUTES) {
    test(`${route} loads with no CSP violation`, async ({ page }) => {
      // `securitypolicyviolation` rather than only console text: it is a DOM
      // event every engine fires with structured fields, where the console
      // wording differs per browser and is easy to miss.
      await page.addInitScript(() => {
        const log = window as ViolationLog;
        log.cspViolations = [];
        document.addEventListener("securitypolicyviolation", (event) => {
          log.cspViolations?.push(`${event.violatedDirective} blocked ${event.blockedURI || "inline"}`);
        });
      });
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => failedRequests.push(`${request.url()} (${request.failure()?.errorText})`));

      await page.goto(route);
      await expect(page.locator("[data-preloader]")).toHaveCount(0);
      await expect(page.locator("main")).toBeVisible();

      expect(await page.evaluate(() => (window as ViolationLog).cspViolations ?? [])).toEqual([]);
      expect(consoleErrors.filter((text) => /Refused to|Content Security Policy/i.test(text))).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }

  test("the CV renders its PDF under a policy with no unsafe-eval", async ({ page }) => {
    // pdf.js has two `new Function` sites in its worker, behind its own
    // isEvalSupported probe: under this policy it degrades to the slower
    // interpreter instead of failing, and that is only true as long as the
    // probe keeps working. The canvas landing is the proof it did.
    await page.goto("/cv");
    await expect(page.locator("[data-cv-viewport] canvas")).toBeVisible();
  });

  test("a note ships its prose in the HTML, not only in the bundle", async ({ page, request }) => {
    // The crawlers behind AI answers, and Bing inconsistently, read the bytes
    // the server sends without running them. Fetched over HTTP, not read off
    // disk, so this covers the served document.
    const response = await request.get("/notes/vpn-off-by-default");
    const html = await response.text();
    expect(html).toContain("<h1>Why my home VPN is off by default</h1>");
    expect(html).toMatch(/<div hidden data-prerendered="note-vpn-off-by-default">/);

    // And the reader never meets it: React replaces the container's contents on
    // mount, so by the time the route is up the element is gone entirely.
    await page.goto("/notes/vpn-off-by-default");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    await expect(page.locator("[data-prerendered]")).toHaveCount(0);
  });
});
