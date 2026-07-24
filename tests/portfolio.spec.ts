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
      await expect(page.locator("[data-preloader]")).toHaveCount(0);
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

test("mobile navigation is keyboard-safe and anchors projects", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page.locator("#projects")).toBeInViewport();
});

test("projects contain the three real case studies", async ({ page }) => {
  await page.goto("/");
  const projectsCarousel = page.getByRole("region", { name: "Selected projects" });
  await expect(projectsCarousel.locator("[data-carousel-card]")).toHaveCount(3);
  await expect(projectsCarousel.getByText("PoliNetwork", { exact: false }).first()).toBeVisible();
  await projectsCarousel.getByRole("button", { name: "Show next project" }).click();
  await expect(projectsCarousel.getByRole("button", { name: /Bring Interactive Portfolio project to the front/ })).toHaveAttribute("data-active", "true");
  await expect(page.locator("[data-project-detail]")).toContainText("Interactive Portfolio");
  await projectsCarousel.getByRole("button", { name: "Show next project" }).click();
  await expect(page.locator("[data-project-detail]")).toContainText("Study Quest");
  await expect(page.getByText("Next Build", { exact: false })).toHaveCount(0);
});

test("notes and certifications expose their destinations without relying on hover", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Read note").first()).toBeVisible();
  await expect(page.getByText("View credential").first()).toBeVisible();
});

test("skills carousel keeps a single readable active card and supports controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const carousel = page.locator(".tool-carousel");
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel.locator("[data-carousel-card]")).toHaveCount(4);
  await expect(carousel.locator('[data-carousel-card][data-active="true"]')).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Show next skill group" }).click();
  await expect(carousel.getByRole("button", { name: /Bring Infrastructure & self-hosting to the front/ })).toHaveAttribute("data-active", "true");
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(carousel.getByRole("button", { name: /Bring Product & collaboration to the front/ })).toHaveAttribute("data-active", "true");
});

test("skills carousel retains manual navigation with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const carousel = page.locator(".tool-carousel");
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(carousel.getByRole("button", { name: /Bring Frontend & web to the front/ })).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Show next skill group" }).click();
  await expect(carousel.getByRole("button", { name: /Bring Infrastructure & self-hosting to the front/ })).toHaveAttribute("data-active", "true");
});

test("adaptive hero exposes its interaction and a visual fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
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

test("hero makes Gabriele's current profile and contact path immediately available", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#top");
  await expect(hero.getByLabel("Professional profile")).toContainText("Board Member & Treasurer at PoliNetwork");
  await expect(hero.getByLabel("Professional profile")).toContainText("Computer Engineering student at Politecnico di Milano");
  await expect(hero).toContainText("Milan, Italy");
  await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "mailto:info@viganogabriele.com");
  await expect(hero.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv");
  await expect(hero.getByRole("link", { name: "LinkedIn" })).toHaveCount(0);
});

test("CV page keeps the document primary and gives mobile users a full-screen document path", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cv");
  await expect(page).toHaveTitle("CV | Gabriele Viganò");
  await expect(page.getByRole("heading", { name: "Curriculum Vitae." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("button", { name: "Download CV" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Open in new tab" })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "Tap to view full screen" })).toHaveAttribute("href", "/cv/Vigano_Gabriele_CV.pdf");
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore further." })).toHaveCount(0);
  await expect(page.getByLabel("System mode discovery")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle system mode" }).click();
  await expect(page.getByLabel("System mode discovery")).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore selected work" })).toHaveAttribute("href", "/#projects");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
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
    { path: "/cv", title: "CV | Gabriele Viganò", canonical: "https://www.viganogabriele.com/cv", type: "website" },
    { path: "/notes/noticing-what-the-association-wasnt-using", title: "Noticing What the Association Wasn't Using | Gabriele Viganò", canonical: "https://www.viganogabriele.com/notes/noticing-what-the-association-wasnt-using", type: "article" },
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
  expect(xml).toContain("https://www.viganogabriele.com/notes/vpn-off-by-default");
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
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

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

test("SYS keeps the safe rendering path and enables the laser on iPhone", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  await expect(page.locator("html")).toHaveAttribute("data-webkit-safe", "");
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".system-overlay-safe")).toBeVisible();
  await expect(page.locator(".sys-grid-overlay")).toHaveCount(0);
  await expect(page.locator("[data-system-wipe]")).toBeVisible();

  await system.click();
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
});

test("mobile SYS toggle keeps the hero copy geometry stable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const readGeometry = () => page.evaluate(() => {
    const tagline = document.querySelector<HTMLElement>('span[aria-label="I build products, teams and systems that hold up."]')?.getBoundingClientRect();
    const stats = document.querySelector<HTMLElement>(".hero-stat-grid")?.getBoundingClientRect();
    return {
      taglineTop: tagline?.top ?? 0,
      taglineHeight: tagline?.height ?? 0,
      statsTop: stats?.top ?? 0,
      statsHeight: stats?.height ?? 0,
    };
  });

  const baseline = await readGeometry();
  await page.getByRole("button", { name: "Toggle system mode" }).click();
  const samples = await page.evaluate(async () => {
    const values: Array<Record<string, number>> = [];
    const read = () => {
      const tagline = document.querySelector<HTMLElement>('span[aria-label="I build products, teams and systems that hold up."]')?.getBoundingClientRect();
      const stats = document.querySelector<HTMLElement>(".hero-stat-grid")?.getBoundingClientRect();
      values.push({
        taglineTop: tagline?.top ?? 0,
        taglineHeight: tagline?.height ?? 0,
        statsTop: stats?.top ?? 0,
        statsHeight: stats?.height ?? 0,
      });
    };
    read();
    await new Promise<void>((resolve) => {
      const interval = window.setInterval(read, 40);
      window.setTimeout(() => { window.clearInterval(interval); resolve(); }, 640);
    });
    return values;
  });

  for (const sample of samples) {
    for (const key of Object.keys(baseline) as Array<keyof typeof baseline>) {
      expect(Math.abs(sample[key] - baseline[key]), `${key} moved during mobile SYS`).toBeLessThanOrEqual(1);
    }
  }
});

test("SYS disables only the laser on desktop Safari", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperties(navigator, {
      userAgent: {
        configurable: true,
        get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      },
      vendor: { configurable: true, get: () => "Apple Computer, Inc." },
      platform: { configurable: true, get: () => "MacIntel" },
      maxTouchPoints: { configurable: true, get: () => 0 },
    });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".system-overlay-safe")).toBeVisible();
  await expect(page.locator("[data-system-wipe]")).toHaveCount(0);
});

test("SYS keeps the laser enabled on Brave", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperties(navigator, {
      userAgent: {
        configurable: true,
        get: () => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
      vendor: { configurable: true, get: () => "Google Inc." },
      brave: { configurable: true, value: { isBrave: async () => true } },
    });
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(page.locator("[data-system-wipe]")).toBeVisible();
  await expect(page.locator(".system-overlay-safe")).toHaveCount(0);
});

test("SYS laser never changes page or viewport dimensions", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 420, behavior: "auto" }));

  const readDimensions = () => page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".hero-visual-frame")?.getBoundingClientRect();
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
      heroWidth: hero?.width ?? 0,
      heroHeight: hero?.height ?? 0,
    };
  });
  const baseline = await readDimensions();
  await page.getByRole("button", { name: "Toggle system mode" }).click();
  const samples = await page.evaluate(async () => {
    const values: Array<Record<string, number>> = [];
    const read = () => {
      const hero = document.querySelector<HTMLElement>(".hero-visual-frame")?.getBoundingClientRect();
      values.push({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        scrollY: window.scrollY,
        heroWidth: hero?.width ?? 0,
        heroHeight: hero?.height ?? 0,
      });
    };
    read();
    await new Promise<void>((resolve) => {
      const interval = window.setInterval(read, 40);
      window.setTimeout(() => { window.clearInterval(interval); resolve(); }, 900);
    });
    return values;
  });
  for (const sample of samples) {
    for (const key of Object.keys(baseline) as Array<keyof typeof baseline>) {
      expect(Math.abs(sample[key] - baseline[key]), `${key} changed during the laser`).toBeLessThanOrEqual(1);
    }
  }
});

test("preloader appears on every full home load and stays deterministic with cached assets", async ({ page }) => {
  await page.goto("/");
  const preloader = page.locator("[data-preloader]");
  await expect(preloader).toBeVisible();
  await page.waitForTimeout(250);
  await expect(preloader).toBeVisible();
  await expect(preloader).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

  await page.reload();
  await expect(preloader).toBeVisible();
  await expect(preloader).toHaveCount(0, { timeout: 1000 });
});

test("skip link is revealed only for keyboard focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  expect(await skipLink.evaluate((node) => getComputedStyle(node).transform)).not.toBe("none");
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect.poll(() => skipLink.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
  await expect.poll(() => skipLink.evaluate((node) => getComputedStyle(node).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
});

test("preloader remains static with reduced motion and is absent on direct secondary routes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const preloader = page.locator("[data-preloader]");
  await expect(preloader).toBeVisible();
  await expect(preloader).toHaveAttribute("data-reduced-motion", "true");
  await expect(preloader).toHaveCount(0);

  await page.goto("/notes/event-operations-from-zero");
  await expect(page.getByRole("heading", { name: /How I Organized Events/i })).toBeVisible();
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.goto("/does-not-exist");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
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

test("closing a note restores its exact position on desktop and iPhone", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    const note = page.locator('[data-scroll-anchor="note-portfolio-vibe-coding-to-production"]');
    await note.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 240, behavior: "auto" }));
    await expect(note).toBeInViewport();
    const expectedY = await page.evaluate(() => window.scrollY);

    await note.click();
    await expect(page.getByRole("heading", { name: /How I Built This Website/i })).toBeVisible();
    await page.getByRole("button", { name: "Close note and return to notes" }).click();
    await expect(note).toBeVisible();
    await expect(page.locator("[data-preloader]")).toHaveCount(0);

    for (const delay of [100, 600, 2500]) {
      await page.waitForTimeout(delay);
      const actualY = await page.evaluate(() => window.scrollY);
      expect(Math.abs(actualY - expectedY), `scroll drift at ${viewport.width}px after ${delay}ms`).toBeLessThanOrEqual(2);
    }
  }
});

test("browser back still restores the exact note position", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const note = page.locator('[data-scroll-anchor="note-homelab-security-first"]');
  await note.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 180, behavior: "auto" }));
  const expectedY = await page.evaluate(() => window.scrollY);
  await note.click();
  await page.goBack();
  await expect(note).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(expectedY);
});

test("direct note close falls back to the notes section without replaying the preloader", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/notes/event-operations-from-zero");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.getByRole("button", { name: "Close note and return to notes" }).click();
  await expect(page).toHaveURL(/\/#notes$/);
  await expect(page.locator("#notes")).toBeInViewport();
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
});

test("a manual interaction cancels a pending scroll correction", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
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
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await expect(page.getByText("I build products, teams and systems that hold up.")).toBeVisible();
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-system-wipe]")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).exclude("canvas").analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("interactive controls meet the minimum touch target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const undersized = await page.locator("a:visible, button:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { label: node.getAttribute("aria-label") || node.textContent?.trim(), width: rect.width, height: rect.height };
  }).filter((target) => target.width < 44 || target.height < 44));
  expect(undersized).toEqual([]);
});

test("count-up stats animate to their final values after scroll-in", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  // Animation duration is 1.4s; allow 600ms stagger + buffer
  await page.waitForTimeout(2200);

  // sr-only spans hold the exact final string for each animated count
  const srValues = await page.locator(".proof-grid .sr-only").allTextContents();
  expect(srValues).toEqual(["30+", "5", "1,000+"]);

  // Non-numeric "Education" is rendered as plain text — no sr-only wrapper
  await expect(page.locator(".proof-grid").getByText("Education")).toBeVisible();
});

test("count-up does not replay when scrolled away and back", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  // First scroll-in: wait for animation to complete
  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2200);
  const after = await page.locator(".proof-grid .sr-only").allTextContents();
  expect(after).toEqual(["30+", "5", "1,000+"]);

  // Scroll away and back
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await page.waitForTimeout(150);
  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // No replay — values should still be final immediately

  const recheck = await page.locator(".proof-grid .sr-only").allTextContents();
  expect(recheck).toEqual(["30+", "5", "1,000+"]);
});

test("count-up renders final values immediately with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  // With reduced motion, CountUp renders a plain span — no animation, no sr-only
  await expect(page.locator(".proof-grid").getByText("30+")).toBeVisible();
  await expect(page.locator(".proof-grid").getByText("1,000+")).toBeVisible();
  await expect(page.locator(".proof-grid").getByText("Education")).toBeVisible();
  expect(await page.locator(".proof-grid .sr-only").count()).toBe(0);
});

test("SYS button releases focus after touch pointer-up", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  // Focus the button (keyboard-style), then dispatch a touch pointerup
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.focus();
  await expect(system).toBeFocused();

  // The onPointerUp handler calls blur() for pointerType !== "mouse"
  const blurred = await page.evaluate(() => {
    const btn = document.querySelector<HTMLElement>('button[aria-label="Toggle system mode"]');
    if (!btn) return false;
    btn.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", bubbles: true, cancelable: true }));
    return document.activeElement !== btn;
  });
  expect(blurred).toBe(true);
});

test("SYS button does not release focus after mouse pointer-up", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.focus();
  await expect(system).toBeFocused();

  // Mouse pointer-up must leave focus intact for keyboard users
  const stillFocused = await page.evaluate(() => {
    const btn = document.querySelector<HTMLElement>('button[aria-label="Toggle system mode"]');
    if (!btn) return false;
    btn.dispatchEvent(new PointerEvent("pointerup", { pointerType: "mouse", bubbles: true, cancelable: true }));
    return document.activeElement === btn;
  });
  expect(stillFocused).toBe(true);
});
