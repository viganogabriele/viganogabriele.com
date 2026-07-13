import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { name: "phone-320", width: 320, height: 568 },
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-12", width: 390, height: 844 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "mobile-landscape", width: 844, height: 390 },
  { name: "tablet-mini", width: 768, height: 1024 },
  { name: "tablet-air", width: 820, height: 1180 },
  { name: "desktop-small", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "desktop-wide", width: 1920, height: 1080 },
];

test("home has no horizontal overflow across target viewports", async ({ page }) => {
  for (const viewport of viewports) {
    await test.step(viewport.name, async () => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
      await page.reload();
      await expect(page.getByRole("heading", { name: /GABRIELE VIGANÒ/i })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(120);
      const finalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(finalOverflow).toBeLessThanOrEqual(1);
    });
  }
});

test("mobile navigation is keyboard-safe and anchors work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.reload();
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Work", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("link", { name: "Work", exact: true }).click();
  await expect(page.locator("#projects")).toBeInViewport();
});

test("projects contain the three real case studies", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("PoliNetwork", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Interactive Portfolio", { exact: false }).first()).toBeAttached();
  await expect(page.getByText("Study Quest", { exact: false }).first()).toBeAttached();
  await expect(page.getByText("Next Build", { exact: false })).toHaveCount(0);
});

test("adaptive hero exposes its interaction and a visual fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.reload();
  const portrait = page.locator(".hero-object-button");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAccessibleName(/PORTRAIT · ENTER SYS/);
  await expect(page.locator(".hero-object-button canvas, .hero-object-button picture").first()).toBeVisible();
  await portrait.click();
  await expect(portrait).toHaveAttribute("aria-pressed", "true");
});

test("hero portrait stays crisp while scrolling and the surname keeps its accent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /GABRIELE VIGANÒ/i })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 420));
  await expect(page.locator(".hero-visual-frame")).toHaveCSS("opacity", "1");
});

test("home identity metadata and favicon are exact", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Gabriele Viganò");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Gabriele Viganò");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Gabriele Viganò");
  await expect(page.locator('link[rel="icon"][media="(prefers-color-scheme: dark)"]')).toHaveAttribute("href", /\/favicon-dark\.png/);
  await expect(page.locator('link[rel="icon"][media="(prefers-color-scheme: light)"]')).toHaveAttribute("href", /\/favicon-light\.png/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", /\/apple-touch-icon\.png/);
  const darkFavicon = await page.request.get("/favicon-dark.png");
  const lightFavicon = await page.request.get("/favicon-light.png");
  const appleTouchIcon = await page.request.get("/apple-touch-icon.png");
  expect(darkFavicon.ok()).toBe(true);
  expect(lightFavicon.ok()).toBe(true);
  expect(appleTouchIcon.ok()).toBe(true);
});

test("built route shells expose crawler-safe metadata, canonical URLs, and true 404s", async ({ request }) => {
  const crawlers = [
    "facebookexternalhit/1.1",
    "Twitterbot/1.0",
    "LinkedInBot/1.0",
    "Slackbot-LinkExpanding 1.0",
    "Discordbot/2.0",
  ];
  const expected = [
    { path: "/", title: "Gabriele Viganò", canonical: "https://www.viganogabriele.com/", type: "website" },
    { path: "/notes/event-operations-from-zero", title: "How I Organized Events Without Ever Doing It Before | Gabriele Viganò", canonical: "https://www.viganogabriele.com/notes/event-operations-from-zero", type: "article" },
  ];

  for (const route of expected) {
    for (const userAgent of crawlers) {
      const response = await request.get(route.path, { headers: { "user-agent": userAgent } });
      expect(response.status(), `${route.path} for ${userAgent}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<title>${route.title}</title>`);
      expect(html).toMatch(new RegExp(`<link rel="canonical" href="${route.canonical}"\\s*/?>`));
      expect(html).toMatch(new RegExp(`<meta property="og:type" content="${route.type}"\\s*/?>`));
      expect(html).toContain('content="https://www.viganogabriele.com/og-cover-v3.png"');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    }
  }

  const missing = await request.get("/does-not-exist");
  expect(missing.status()).toBe(404);
  const missingHtml = await missing.text();
  expect(missingHtml).toContain('<meta name="robots" content="noindex, nofollow">');

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("https://www.viganogabriele.com/notes/homelab-security-first");
  expect(xml).not.toContain("motion-performance");
});

test("SYS mode starts clean, then activates only after an explicit control interaction", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { configurable: true, get: () => 2 });
    Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 2 });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => { localStorage.setItem("gv-system-mode", "on"); });
  await page.reload();
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await expect(system).toBeVisible();
  await expect(system).toHaveText("SYS");
  await expect(system).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).not.toHaveAttribute("data-system-mode", "on");
  await expect(page.locator("[data-system-wipe]")).toHaveCount(0);
  await system.click();
  await expect(page.locator("[data-system-wipe]")).toBeVisible();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-system-mode", "on");
  await expect(page.getByText("SYS / violet trace")).toBeVisible();
  await expect(page.locator("[data-system-wipe]")).toHaveCount(1);
  await page.reload();
  await expect(system).toHaveAttribute("aria-pressed", "false");
});

test("SYS keyboard shortcut is resilient and ignores editable or repeated keys", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: () => { throw new Error("haptics unavailable"); } });
    (window as Window & { sysEvents?: boolean[] }).sysEvents = [];
    window.addEventListener("sys:toggle", (event) => {
      (window as Window & { sysEvents?: boolean[] }).sysEvents?.push((event as CustomEvent<{ active: boolean }>).detail.active);
    });
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.reload();

  const system = page.getByRole("button", { name: "Toggle system mode" });
  await expect(system).toHaveAttribute("aria-keyshortcuts", "Shift+S");
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as Window & { sysEvents?: boolean[] }).sysEvents)).toEqual([true]);

  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "s", shiftKey: true, repeat: true })));
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    const input = document.createElement("input");
    document.body.append(input);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "s", shiftKey: true, bubbles: true }));
    input.remove();
  });
  await expect(system).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("Shift+S");
  await expect(system).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => (window as Window & { sysEvents?: boolean[] }).sysEvents)).toEqual([true, false]);
});

test("SYS uses the lightweight rendering path on Apple WebKit", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    });
    sessionStorage.setItem("gv-preloaded", "1");
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-webkit-safe", "");
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".system-overlay-safe")).toBeVisible();
  await expect(page.locator(".sys-grid-overlay, [data-system-wipe]")).toHaveCount(0);

  await system.click();
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
});

test("fine-pointer cursor works at compact desktop width and is absent on touch", async ({ page }) => {
  await page.setViewportSize({ width: 676, height: 822 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await expect(page.locator("[data-custom-cursor]")).toBeAttached();
  const target = page.locator(".hero-object-button");
  await target.hover();
  await target.dispatchEvent("mouseover");
  await expect(page.locator("[data-custom-cursor]")).toHaveAttribute("data-visible", "true");
  await expect(page.locator("[data-custom-cursor]")).toHaveAttribute("data-active", "true");
});

test("capability selection and journey axis stay deterministic while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.locator('[data-index="4"]').evaluate((node) => {
    window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.42 + 48, behavior: "auto" });
    window.dispatchEvent(new Event("scroll"));
  });
  await expect(page.locator('[data-index="4"]')).toHaveAttribute("data-active", "true");
  await page.locator("[data-journey-rail]").scrollIntoViewIfNeeded();
  const alignment = await page.evaluate(() => {
    const axis = document.querySelector<HTMLElement>("[data-journey-axis]")?.getBoundingClientRect();
    const indicator = document.querySelector<HTMLElement>("[data-journey-indicator]")?.getBoundingClientRect();
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-journey-node]")).map((node) => node.getBoundingClientRect());
    if (!axis || !indicator || !nodes.length) return null;
    const x = axis.left + axis.width / 2;
    return { indicator: indicator.left + indicator.width / 2 - x, nodes: nodes.map((node) => node.left + node.width / 2 - x) };
  });
  expect(alignment).not.toBeNull();
  expect(Math.abs(alignment!.indicator)).toBeLessThanOrEqual(1);
  expect(alignment!.nodes.every((offset) => Math.abs(offset) <= 1)).toBe(true);
});

test("home loads without browser console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("home, note, and 404 have no runtime errors or failed same-origin requests", async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === "http://127.0.0.1:4173") failedRequests.push(request.url());
  });

  for (const path of ["/", "/notes/event-operations-from-zero"]) {
    await page.goto(path);
    await expect(page.locator("#main-content")).toBeVisible();
  }

  // A document-level HTTP 404 is intentionally reported as a browser console
  // error in Chromium. It is covered by the status test above, not treated as
  // a failed asset or runtime error here.
  await page.goto("/does-not-exist");
  await expect(page.locator("#main-content")).toBeVisible();

  expect(errors.filter((error) => !error.includes("404 (Not Found)"))).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test("notes expose accurate article metadata and missing notes render a 404", async ({ page }) => {
  await page.goto("/notes/event-operations-from-zero");
  await expect(page.getByRole("heading", { name: /How I Organized Events/i })).toBeVisible();
  const jsonLd = await page.locator('script[data-jsonld^="note-"]').textContent();
  expect(jsonLd).toContain('"datePublished":"2026-04-01"');
  await page.goto("/notes/does-not-exist");
  await expect(page).toHaveURL(/does-not-exist/);
  await expect(page.getByRole("heading", { name: "Not here." })).toBeVisible();
});

test("back restores the exact note position and remains stable", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const note = page.locator('[data-scroll-anchor="note-portfolio-vibe-coding-to-production"]');
  await note.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 240, behavior: "auto" }));
  await expect(note).toBeInViewport();
  const expectedY = await page.evaluate(() => window.scrollY);

  await note.click();
  await expect(page.getByRole("heading", { name: /How I Built This Website/i })).toBeVisible();
  await page.goBack();
  await expect(note).toBeVisible();

  for (const delay of [100, 600, 2500]) {
    await page.waitForTimeout(delay);
    const actualY = await page.evaluate(() => window.scrollY);
    expect(Math.abs(actualY - expectedY), `scroll drift after ${delay}ms`).toBeLessThanOrEqual(2);
  }
});

test("a manual interaction cancels a pending scroll correction", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const note = page.locator('[data-scroll-anchor="note-homelab-security-first"]');
  await note.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 180));
  await note.click();
  await expect(page.getByRole("heading", { name: /Homelab: Security First/i })).toBeVisible();
  await page.goBack();
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: -450 }));
    window.scrollBy({ top: -450, behavior: "auto" });
  });
  const manualY = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => window.scrollY)).toBe(manualY);
});

test("404 remains contained and reachable across compact viewports", async ({ page }) => {
  for (const viewport of [
    { name: "narrow", width: 280, height: 653 },
    { name: "phone", width: 390, height: 844 },
    { name: "landscape", width: 667, height: 375 },
  ]) {
    await test.step(viewport.name, async () => {
      await page.setViewportSize(viewport);
      await page.goto(`/route-that-does-not-exist/${"x".repeat(180)}`);
      await expect(page.getByRole("heading", { name: "Not here." })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole("link", { name: "Return to the index" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Report a broken link" })).toBeVisible();
      await expect(page.locator(".not-found-coordinate code")).toHaveAttribute("title", /route-that-does-not-exist/);
      if (viewport.width <= 640) await expect(page.locator(".not-found-code")).toBeHidden();
    });
  }
});

test("reduced motion preserves content and accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.reload();
  await expect(page.getByText("I build products, teams and systems that hold up.")).toBeVisible();
  const results = await new AxeBuilder({ page }).exclude("canvas").analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("interactive controls meet the minimum touch target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("gv-preloaded", "1"));
  await page.reload();
  const undersized = await page.locator("a:visible, button:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { label: node.getAttribute("aria-label") || node.textContent?.trim(), width: rect.width, height: rect.height };
  }).filter((target) => target.width < 44 || target.height < 44));
  expect(undersized).toEqual([]);
});
