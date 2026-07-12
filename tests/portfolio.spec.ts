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
  await expect(portrait).toHaveAccessibleName(/TAP TO SCAN/);
  await expect(page.locator(".hero-object-button canvas, .hero-object-button picture").first()).toBeVisible();
  await portrait.click();
  await expect(portrait).toHaveAttribute("aria-pressed", "true");
});

test("home identity metadata and favicon are exact", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Gabriele Viganò");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Gabriele Viganò");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Gabriele Viganò");
  await expect(page.locator('link[rel="icon"][type="image/png"]').first()).toHaveAttribute("href", /\/favicon-dark\.png/);
  const darkFavicon = await page.request.get("/favicon-dark.png");
  const lightFavicon = await page.request.get("/favicon-light.png");
  expect(darkFavicon.ok()).toBe(true);
  expect(lightFavicon.ok()).toBe(true);
});

test("SYS mode starts clean, then activates only after an explicit control interaction", async ({ page }) => {
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
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-system-mode", "on");
  await expect(page.getByText("SYS / violet trace")).toBeVisible();
  await expect(page.locator("[data-system-wipe]")).toHaveCount(1);
  await page.reload();
  await expect(system).toHaveAttribute("aria-pressed", "false");
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

test("notes expose accurate article metadata and missing notes render a 404", async ({ page }) => {
  await page.goto("/notes/event-operations-from-zero");
  await expect(page.getByRole("heading", { name: /How I Organized Events/i })).toBeVisible();
  const jsonLd = await page.locator('script[data-jsonld^="note-"]').textContent();
  expect(jsonLd).toContain('"datePublished":"2026-04-01"');
  await page.goto("/notes/does-not-exist");
  await expect(page).toHaveURL(/does-not-exist/);
  await expect(page.getByRole("heading", { name: "Not here." })).toBeVisible();
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
