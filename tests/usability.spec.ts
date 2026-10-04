import { expect, test } from "@playwright/test";

const ready = async (page: import("@playwright/test").Page) => {
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
};

test("landscape menu scrolls to its last action without scrolling the page", async ({ page }) => {
  await page.setViewportSize({ width: 609, height: 343 });
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  const menu = page.locator("#mobile-navigation");
  const contact = menu.getByRole("link", { name: "Contact", exact: true });
  await contact.focus();
  await expect(contact).toBeInViewport({ ratio: 1 });
  expect(await menu.evaluate((el) => el.scrollHeight > el.clientHeight && el.scrollTop > 0)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Toggle navigation" })).toBeFocused();
});

test("section links update the share URL and move keyboard focus without a loader", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await ready(page);
  await page.getByRole("navigation").getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator("#projects")).toBeFocused();
  await ready(page);
  await page.reload();
  await ready(page);
  await expect(page.locator("#projects")).toBeInViewport();
});

test("route focus follows note navigation and returns to the original link", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const link = page.locator('a[href="/notes/vpn-off-by-default"]');
  await link.click();
  await ready(page);
  await expect(page.locator("main h1")).toBeFocused();
  await page.getByRole("button", { name: "Close note and return to home" }).click();
  await ready(page);
  await expect(link).toBeFocused();
});

test("note reading progress tracks its own scrolling container", async ({ page }) => {
  await page.goto("/notes/vpn-off-by-default");
  await ready(page);
  await page.locator("main").evaluate((el) => { el.scrollTop = (el.scrollHeight - el.clientHeight) / 2; });
  await expect.poll(() => page.locator("[data-reading-progress]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)).toBeCloseTo(0.5, 2);
  expect(await page.locator("[data-reading-progress]").evaluate((bar) => Number(getComputedStyle(bar).zIndex) > Number(getComputedStyle(document.querySelector("main")!).zIndex))).toBe(true);
});

test("manual carousel selection stays paused and rotation can be resumed", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const carousel = page.getByRole("region", { name: "Selected projects" });
  await carousel.getByRole("button", { name: "Show next project" }).click();
  await expect(carousel.getByRole("button", { name: "Resume automatic rotation" })).toBeVisible();
  await page.mouse.move(0, 0);
  await page.locator("main").evaluate((el) => { el.tabIndex = -1; el.focus({ preventScroll: true }); });
  const card = carousel.locator('[data-carousel-card][data-active="true"]');
  await expect(card).toHaveAttribute("aria-label", /Interactive Portfolio/);
  // Wait for the selected card to face forward; WebKit can deliver the
  // animation frames late under load even after a fixed 800ms sleep.
  await expect.poll(() => card.evaluate((el) => el.style.transform.includes("rotateY(0deg)"))).toBe(true);
  const transform = await card.evaluate((el) => el.style.transform);
  await page.waitForTimeout(3400);
  expect(await card.evaluate((el) => el.style.transform)).toBe(transform);
  await carousel.getByRole("button", { name: "Resume automatic rotation" }).click();
  await page.mouse.move(0, 0);
  await page.locator("main").evaluate((el) => el.focus({ preventScroll: true }));
  await expect(carousel).toBeInViewport();
  await expect.poll(() => card.evaluate((el) => el.style.transform)).not.toBe(transform);
});

test("home is usable while portrait and fonts are still pending", async ({ page }) => {
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => { release = resolve; });
  await page.route(/\.(webp|woff2)(\?|$)/, async (route) => { await blocked; await route.continue(); });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-preloader]")).toHaveCount(0, { timeout: 2500 });
    await expect(page.locator("#top").getByRole("link", { name: "View CV" })).toBeVisible();
  } finally { release(); }
});

test("clipboard denial shows a visible address that can be copied manually", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
  });
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Copy address", exact: true }).click();
  const message = page.getByRole("status").filter({ hasText: "Copy unavailable" });
  await expect(message).toBeVisible();
  await expect(message).toContainText("info@viganogabriele.com");
  expect(await message.evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(100);
});

test("CV exposes selectable text and handles unavailable fullscreen", async ({ page }) => {
  await page.goto("/cv");
  await ready(page);
  await expect(page.locator(".react-pdf__Page__textContent")).toContainText("Gabriele");
  await page.evaluate(() => { Object.defineProperty(Element.prototype, "requestFullscreen", { value: () => Promise.reject(new Error("denied")), configurable: true }); });
  await page.getByRole("button", { name: "View CV full screen" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Full screen is unavailable" })).toBeVisible();
});

test("printed notes expose their full reading flow", async ({ page }) => {
  await page.goto("/notes/vpn-off-by-default");
  await ready(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("main")).toHaveCSS("position", "static");
  await expect(page.locator("main")).toHaveCSS("overflow", "visible");
  await expect(page.locator("main")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("[data-reading-progress]")).toBeHidden();
});


test("fullscreen CV keeps the page inside the available viewport", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Native fullscreen geometry is verified in Chromium.");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/cv");
  await ready(page);
  await page.getByRole("button", { name: "View CV full screen" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.locator(".react-pdf__Page__textContent")).toContainText("Gabriele");
  await expect.poll(() => page.locator("[data-cv-viewport]").evaluate((el) => el.getBoundingClientRect().bottom - window.innerHeight)).toBeLessThanOrEqual(1);
  await page.evaluate(() => document.exitFullscreen());
});
