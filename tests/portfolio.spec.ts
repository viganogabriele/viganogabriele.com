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

test("projects contain the four real case studies", async ({ page }) => {
  await page.goto("/");
  const projectsCarousel = page.getByRole("region", { name: "Selected projects" });
  await expect(projectsCarousel.locator("[data-carousel-card]")).toHaveCount(4);
  await expect(page.locator("[data-project-detail]")).toContainText("Homelab & Remote Dev");
  await projectsCarousel.getByRole("button", { name: "Show next project" }).click();
  await expect(projectsCarousel.getByRole("button", { name: /Bring Interactive Portfolio project to the front/ })).toHaveAttribute("data-active", "true");
  await expect(page.locator("[data-project-detail]")).toContainText("Interactive Portfolio");
  await projectsCarousel.getByRole("button", { name: "Show next project" }).click();
  await expect(page.locator("[data-project-detail]")).toContainText("Study Quest");
  await projectsCarousel.getByRole("button", { name: "Show next project" }).click();
  await expect(page.locator("[data-project-detail]")).toContainText("PoliNetwork Ecosystem");
  await expect(page.getByText("Next Build", { exact: false })).toHaveCount(0);
});

test("every carousel step counts when the presses overlap the animation", async ({ page }) => {
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Selected projects" });
  await expect(carousel.locator("[data-carousel-card]")).toHaveCount(4);
  const next = carousel.getByRole("button", { name: "Show next project" });
  const position = carousel.locator(".circular-carousel__controls span");
  await expect(position).toHaveText("01 / 04");

  // Each press lands while the previous selection is still rotating. A press
  // swallowed here means a driver was left running behind the one that
  // replaced it and reset the selection underneath it.
  for (const expected of ["02 / 04", "03 / 04", "04 / 04", "01 / 04"]) {
    await next.click();
    await expect(position).toHaveText(expected);
  }
  await expect(page.locator("[data-project-detail]")).toContainText("Homelab & Remote Dev");
});

test("notes and certifications expose their destinations without relying on hover", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Read note").first()).toBeVisible();
  await expect(page.getByText("View credential").first()).toBeVisible();
});

test("certification rows keep their content out of the number track on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const fields = page.locator(".cert-row").first().locator(":scope > span");
  await expect(fields.nth(1)).toHaveCSS("grid-column-start", "2");
  await expect(fields.nth(1)).toHaveCSS("grid-row-start", "2");
  await expect(fields.nth(2)).toHaveCSS("grid-row-start", "3");
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
  await expect(carousel.getByRole("button", { name: /Bring Code & markup to the front/ })).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Show next skill group" }).click();
  await expect(carousel.getByRole("button", { name: /Bring Infrastructure & self-hosting to the front/ })).toHaveAttribute("data-active", "true");
  const marquee = page.locator(".tool-marquee");
  await marquee.scrollIntoViewIfNeeded();
  const track = marquee.locator(".logo-loop > div");
  const parkedTransform = await track.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(500);
  await expect(track).toHaveCSS("transform", parkedTransform);
});

test("the toolkit logo loop uses legible large marks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const marquee = page.locator(".tool-marquee");
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee.locator("svg").first()).toBeVisible();
  const geometry = await marquee.evaluate((node) => ({
    strip: node.getBoundingClientRect().height,
    mark: node.querySelector("svg")?.getBoundingClientRect().height ?? 0,
  }));
  expect(geometry.strip).toBeGreaterThanOrEqual(60);
  expect(geometry.mark).toBeGreaterThanOrEqual(34);
});

test("mobile hero omits the portrait while preserving the SYS control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const portrait = page.locator(".hero-object-button");
  await expect(portrait).toBeHidden();
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await expect(system).toBeVisible();
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
});

test("a phone never downloads the portrait it cannot show", async ({ page }) => {
  const portraitRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("gabriele-photo")) portraitRequests.push(request.url());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const portrait = page.locator("[data-hero-portrait]");
  await expect(page.locator(".hero-visual-frame")).toBeHidden();
  expect(await portrait.evaluate((image: HTMLImageElement) => image.currentSrc)).toBe("");
  expect(portraitRequests).toHaveLength(0);

  // Crossing the breakpoint re-runs source selection, so the desktop hero is
  // still measured on a real photograph rather than an empty frame.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".hero-visual-frame")).toBeVisible();
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(portraitRequests.length).toBeGreaterThan(0);
});

test("the portrait breakpoint tracks the reader's font size", async ({ page, browserName }) => {
  // The frame is revealed by Tailwind's `sm:`, which compiles to
  // `(width>=40rem)`, and the <source>s are gated on the same query. `rem` in
  // a media query resolves against the browser's default font size, so a
  // reader who changes it moves the breakpoint — and the two conditions only
  // move together while both are written in rem. Hard-coding 640px on one side
  // showed an empty portrait frame at a smaller default, and put the fetch back
  // on phones at a larger one. Only Chromium can emulate the default here.
  test.skip(browserName !== "chromium", "needs CDP Page.setFontSizes");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.enable");

  for (const standard of [12, 16, 20]) {
    await cdp.send("Page.setFontSizes", { fontSizes: { standard, fixed: standard } });
    for (const width of [40 * standard - 20, 40 * standard + 20]) {
      await test.step(`default ${standard}px @ ${width}`, async () => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(page.locator("[data-preloader]")).toHaveCount(0);
        const frameShown = await page.locator(".hero-visual-frame").evaluate((node) => getComputedStyle(node).display !== "none");
        await expect.poll(() => page.locator("[data-hero-portrait]").evaluate((image: HTMLImageElement) => image.naturalWidth > 0))
          .toBe(frameShown);
      });
    }
  }
});

test("the navbar highlight follows every section, including the ones without an entry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  const highlighted = async () => page.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLElement>("nav a[href^='#']")];
    return links.find((link) => link.className.includes("text-white"))?.textContent?.trim() ?? null;
  });

  // Expertise and Certifications have no entry of their own; they belong to
  // the neighbour a reader would say they are in. Before this mapping the
  // highlight simply stopped updating across them.
  for (const [section, entry] of [
    ["about", "Profile"],
    ["expertise", "Profile"],
    ["projects", "Projects"],
    ["stack", "Skills"],
    ["journey", "Experience"],
    ["notes", "Notes"],
    ["certifications", "Notes"],
  ] as const) {
    await page.evaluate((id) => {
      const element = document.getElementById(id)!;
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 92, behavior: "auto" });
    }, section);
    await expect.poll(highlighted, { message: `section #${section}` }).toBe(entry);
  }
});

test("hero portrait stays crisp while scrolling and the surname keeps its accent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /GABRIELE VIGANÒ/i })).toBeVisible();
  const portraitLayers = await page.locator(".hero-visual-frame .border-glow").evaluate((frame) => ({
    content: Number(getComputedStyle(frame.querySelector<HTMLElement>(".border-glow__content")!).zIndex),
    glow: Number(getComputedStyle(frame.querySelector<HTMLElement>(".border-glow__glow")!).zIndex),
  }));
  expect(portraitLayers.content).toBeGreaterThan(portraitLayers.glow);
  await page.evaluate(() => window.scrollTo(0, 420));
  await expect(page.locator(".hero-visual-frame")).toHaveCSS("opacity", "1");
});

test("hero makes Gabriele's current profile and contact path immediately available", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#top");
  await expect(hero.getByLabel("Professional profile")).toContainText("Board Member & Treasurer at PoliNetwork");
  await expect(hero.getByLabel("Professional profile")).toContainText("Computer Engineering, Politecnico di Milano");
  await expect(hero).toContainText("Milan, Italy");
  await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "mailto:info@viganogabriele.com");
  await expect(hero.getByRole("link", { name: "View CV" })).toHaveAttribute("href", "/cv");
  await expect(hero.getByRole("link", { name: "LinkedIn" })).toHaveCount(0);
});

test("CV page keeps the document primary and gives mobile users a full-screen document path", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cv");
  await expect(page).toHaveTitle("Gabriele Viganò · CV");
  await expect(page.getByRole("heading", { name: "Curriculum Vitae." })).toBeVisible();
  await expect(page.locator("#cv-title")).toHaveAttribute("data-split-text", "char");
  await expect(page.locator("#cv-title > span[aria-hidden]")).toHaveCount(17);
  await expect.poll(() => page.locator("#cv-title > span[aria-hidden]").first().evaluate((span) => ({
    opacity: getComputedStyle(span).opacity,
    transform: getComputedStyle(span).transform,
  }))).toEqual({ opacity: "1", transform: "none" });
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("button", { name: "Download CV" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Open in new tab" })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "Tap to view full screen" })).toHaveAttribute("href", "/cv/Vigano_Gabriele_CV.pdf");
  await expect(page.locator("[data-cv-viewport] canvas").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore further." })).toHaveCount(0);
  await expect(page.getByLabel("System mode discovery")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle system mode" }).click();
  await expect(page.getByLabel("System mode discovery")).toHaveCount(0);
  // WebKit deliberately gets the static safe overlay: its compositing path is
  // tested as product behaviour, so this route must not require a desktop-only
  // orbit that SystemModeOverlay intentionally omits there.
  if (browserName === "webkit") {
    await expect(page.locator(".system-overlay-safe")).toBeVisible();
    await expect(page.locator("[data-system-orbit]")).toHaveCount(0);
  } else {
    await expect(page.locator("[data-system-orbit]")).toBeVisible();
  }
  await expect(page.locator(".sys-hud")).toHaveCount(0);
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
    { path: "/cv", title: "Gabriele Viganò · CV", canonical: "https://www.viganogabriele.com/cv", type: "website" },
    { path: "/notes/noticing-what-the-association-wasnt-using", title: "Noticing what the association wasn't using | Gabriele Viganò", canonical: "https://www.viganogabriele.com/notes/noticing-what-the-association-wasnt-using", type: "article" },
  ];

  for (const route of expected) {
    for (const userAgent of crawlers) {
      const response = await request.get(route.path, { headers: { "user-agent": userAgent } });
      expect(response.status(), `${route.path} for ${userAgent}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`<title>${route.title}</title>`);
      expect(html).toMatch(new RegExp(`<link rel="canonical" href="${route.canonical}"\\s*/?>`));
      expect(html).toMatch(new RegExp(`<meta property="og:type" content="${route.type}"\\s*/?>`));
      expect(html).toContain('content="https://www.viganogabriele.com/og-cover.jpg"');
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
    Object.defineProperties(navigator, {
      deviceMemory: { configurable: true, get: () => 2 },
      hardwareConcurrency: { configurable: true, get: () => 2 },
      userAgent: {
        configurable: true,
        get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      },
      vendor: { configurable: true, get: () => "Google Inc." },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-custom-cursor]")).toHaveCount(0);
  await page.evaluate(() => { localStorage.setItem("gv-system-mode", "on"); });
  await page.reload();
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await expect(system).toBeVisible();
  await expect(system).toHaveText("SYS");
  await expect(system).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).not.toHaveAttribute("data-system-mode", "on");
  await expect(page.locator("[data-system-wipe]")).toHaveCount(0);
  await page.evaluate(() => {
    document.documentElement.dataset.testSystemWipeObserved = "false";
    const observer = new MutationObserver(() => {
      if (!document.querySelector("[data-system-wipe]")) return;
      document.documentElement.dataset.testSystemWipeObserved = "true";
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
  await system.click();
  await expect.poll(() => page.locator("html").getAttribute("data-test-system-wipe-observed")).toBe("true");
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-system-mode", "on");
  await expect(page.locator("[data-system-orbit]")).toBeVisible();
  await expect(page.getByText(/System layer active|SYS \/ violet trace|Structure visible/i)).toHaveCount(0);
  await expect(page.locator("[data-system-wipe]")).toHaveCount(1);
  await page.reload();
  await expect(system).toHaveAttribute("aria-pressed", "false");
});

test("SYS keeps the real wordmark painted until the lazy particle canvas is ready", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let releaseParticles!: () => void;
  const particlesReleased = new Promise<void>((resolve) => { releaseParticles = resolve; });
  let markParticlesRequested!: () => void;
  const particlesRequested = new Promise<void>((resolve) => { markParticlesRequested = resolve; });
  await page.route("**/ParticleText-*.js", async (route) => {
    markParticlesRequested();
    await particlesReleased;
    await route.continue();
  });

  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const wordmark = page.locator(".hero-wordmark");
  await page.getByRole("button", { name: "Toggle system mode" }).click();
  await particlesRequested;

  await expect(wordmark).not.toHaveClass(/hero-wordmark--particles/);
  expect(await wordmark.locator("[data-particle-line]").first().evaluate((node) => getComputedStyle(node).color)).not.toBe("rgba(0, 0, 0, 0)");

  releaseParticles();
  await expect(wordmark.locator("canvas")).toBeAttached();
  await expect(wordmark).toHaveClass(/hero-wordmark--particles/);
});

test("hero keeps the photograph visible until the SYS portrait is ready", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { releaseSystemPortrait?: boolean }).releaseSystemPortrait = false;
    document.addEventListener("load", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;
      if (!image.currentSrc.includes("gabriele-photo-sys") && !image.src.includes("gabriele-photo-sys")) return;
      if ((window as Window & { releaseSystemPortrait?: boolean }).releaseSystemPortrait) return;
      event.stopImmediatePropagation();
    }, true);
  });

  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const photo = page.locator('[data-hero-portrait-layer="photo"]');
  const systemPortrait = page.locator('[data-hero-portrait-layer="system"]');

  await page.getByRole("button", { name: "Toggle system mode" }).click();
  await expect(photo).toHaveAttribute("data-visible", "true");
  await expect(systemPortrait).toHaveAttribute("data-visible", "false");

  await systemPortrait.locator("img").evaluate((image) => {
    (window as Window & { releaseSystemPortrait?: boolean }).releaseSystemPortrait = true;
    image.dispatchEvent(new Event("load", { bubbles: true }));
  });
  await expect(systemPortrait).toHaveAttribute("data-visible", "true");
  await expect(photo).toHaveAttribute("data-visible", "false");
});

test("the SYS portrait is not fetched until the mode is wanted", async ({ page }) => {
  const systemPortraitRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("gabriele-photo-sys")) systemPortraitRequests.push(request.url());
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const systemPortrait = page.locator('[data-hero-portrait-layer="system"]');

  // Assert the mechanism, not the absence of traffic within a window: an
  // unarmed layer carries no source at all, so there is nothing that could
  // start loading late and slip past a timed check.
  await expect(systemPortrait.locator("source")).toHaveCount(0);
  expect(await systemPortrait.locator("img").evaluate((image: HTMLImageElement) => image.currentSrc || image.getAttribute("src") || "")).toBe("");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(systemPortraitRequests).toHaveLength(0);

  await page.getByRole("button", { name: "Toggle system mode" }).click();
  await expect(systemPortrait.locator("source")).toHaveCount(2);
  await expect.poll(() => systemPortraitRequests.length).toBeGreaterThan(0);
  await expect(systemPortrait).toHaveAttribute("data-visible", "true");
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

  await expect.poll(() => page.locator(".hero-stat-grid").evaluate((stats) => {
    const transform = getComputedStyle(stats.parentElement!).transform;
    return Math.abs(new DOMMatrixReadOnly(transform).m42);
  })).toBeLessThanOrEqual(0.1);
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

test("the loading screen is a lightweight readiness gate without a minimum duration", async ({ page }) => {
  // These routes must match whatever [data-hero-portrait] loads, because that is
  // the image the readiness gate waits on: the photograph, not the SYS wireframe.
  let releasePortrait!: () => void;
  const portraitReleased = new Promise<void>((resolve) => { releasePortrait = resolve; });
  await page.route("**/*gabriele-photo*", async (route) => {
    await portraitReleased;
    await route.continue();
  });
  const navigation = page.goto("/", { waitUntil: "domcontentloaded" });
  const preloader = page.locator("[data-preloader]");
  await expect(preloader).toBeVisible();
  await expect(preloader.getByRole("progressbar", { name: "Loading page" })).toHaveCount(1);
  releasePortrait();
  await navigation;
  await expect(preloader).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

  // Drop the interception before measuring the warm reload. Holding every
  // portrait request through a Playwright route handler costs WebKit enough to
  // dominate what this assertion is timing: with the route still armed the
  // reload measured 654-1846ms across six runs and tripped the budget on the
  // slow tail, and without it 664-862ms. The budget is about the app, so the
  // harness should not be inside it.
  await page.unroute("**/*gabriele-photo*");
  await page.reload();
  await expect(preloader).toHaveCount(0, { timeout: 1500 });
});

test("skip link is revealed only for keyboard focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const skipLink = page.getByRole("link", { name: "Skip to content" });

  expect(await skipLink.evaluate((node) => Number.parseFloat(getComputedStyle(node).top))).toBeLessThan(0);
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect.poll(() => skipLink.evaluate((node) => node.matches(":focus-visible"))).toBe(true);
  await expect.poll(() => skipLink.evaluate((node) => Number.parseFloat(getComputedStyle(node).top))).toBeGreaterThanOrEqual(0);
});

test("preloader remains static with reduced motion and secondary routes dismiss it as soon as ready", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let releasePortrait!: () => void;
  const portraitReleased = new Promise<void>((resolve) => { releasePortrait = resolve; });
  await page.route("**/*gabriele-photo*", async (route) => {
    await portraitReleased;
    await route.continue();
  });
  const navigation = page.goto("/", { waitUntil: "domcontentloaded" });
  const preloader = page.locator("[data-preloader]");
  await expect(preloader).toBeVisible();
  await expect(preloader).toHaveAttribute("data-reduced-motion", "true");
  releasePortrait();
  await navigation;
  await expect(preloader).toHaveCount(0);

  await page.goto("/notes/noticing-what-the-association-wasnt-using");
  await expect(page.getByRole("heading", { name: /Noticing What the Association Wasn.t Using/i })).toBeVisible();
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.goto("/does-not-exist");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
});

test("CV is readable before the PDF is, and the viewer says it is still working", async ({ page }) => {
  let releasePdf!: () => void;
  const pdfReleased = new Promise<void>((resolve) => { releasePdf = resolve; });
  let markPdfRequested!: () => void;
  const pdfRequested = new Promise<void>((resolve) => { markPdfRequested = resolve; });
  await page.route("**/cv/Vigano_Gabriele_CV.pdf", async (route) => {
    markPdfRequested();
    await pdfReleased;
    await route.continue();
  });

  await page.goto("/cv", { waitUntil: "domcontentloaded" });
  await pdfRequested;

  // Holding the whole route behind pdf.js cost WebKit about five seconds in
  // front of a loading bar while all of this was already laid out. The reader
  // gets it immediately; only the framed viewport is still pending.
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Curriculum/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download CV/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open in new tab/i })).toBeVisible();
  await expect(page.locator("[data-cv-viewport] canvas")).toHaveCount(0);
  await expect(page.getByText(/Loading document|Rendering page/i)).toBeVisible();

  // The viewport is sized whether or not the canvas has landed, so nothing
  // reflows when it does. Height is the assertion: the section is still
  // finishing its entrance transform, which moves y by a couple of pixels
  // without resizing anything.
  // Measured through offsetHeight, not getBoundingClientRect: the entrance is
  // a transform still interpolating while this runs, and a rect read mid-scale
  // comes back a fraction of a pixel off a layout that has not changed at all.
  const viewportHeight = () => page.locator("[data-cv-viewport]").evaluate((node) => node.offsetHeight);
  const heightBefore = await viewportHeight();
  expect(heightBefore).toBeGreaterThan(0);
  releasePdf();
  await expect(page.locator("[data-cv-viewport] canvas").first()).toBeVisible();
  expect(await viewportHeight()).toBe(heightBefore);
});

test("the CV's own PDF links are announceable", async ({ page }) => {
  await page.goto("/cv");
  await expect(page.locator("[data-cv-viewport] canvas").first()).toBeVisible();
  const annotations = page.locator(".annotationLayer a[href]");
  await expect.poll(() => annotations.count()).toBeGreaterThan(0);
  const audit = await annotations.evaluateAll((links) => links.map((link) => ({
    href: link.getAttribute("href"),
    label: link.getAttribute("aria-label"),
    text: link.textContent?.trim() ?? "",
    target: (link as HTMLAnchorElement).target,
  })));

  expect(audit.filter((link) => !link.text && !link.label).map((link) => link.href)).toEqual([]);
  await expect(page.getByRole("link", { name: /Email info@viganogabriele\.com/i })).toHaveCount(1);

  // The label may only promise a new tab when the anchor actually opens one.
  // pdf.js leaves target empty unless externalLinkTarget is set, so without
  // this the announcement described navigation that never happened.
  const lying = audit.filter((link) => link.label?.includes("in a new tab") && link.target !== "_blank");
  expect(lying, `labels promising a new tab on a same-tab link: ${JSON.stringify(lying)}`).toEqual([]);
  // Following a link from inside the viewer must not replace the CV page.
  expect(audit.filter((link) => link.href?.startsWith("http") && link.target !== "_blank")).toEqual([]);
});

test("likely internal destinations prefetch on intent", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const cvRequest = page.waitForRequest((request) => request.url().includes("CvPage-") && request.url().endsWith(".js"));
  const pdfRequest = page.waitForRequest((request) => request.url().endsWith("/cv/Vigano_Gabriele_CV.pdf"));
  await page.locator("#top").getByRole("link", { name: "View CV" }).hover();
  await Promise.all([cvRequest, pdfRequest]);
});

test("mobile Home does not wait for the hidden desktop portrait", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/*gabriele-photo*", (route) => route.abort());

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /GABRIELE VIGANÒ/i })).toBeVisible();
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
});

test("legacy note redirects stay covered until the canonical note is ready", async ({ page }) => {
  await page.goto("/notes/homelab-security-first", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/notes\/vpn-off-by-default$/);
  await expect(page.getByRole("heading", { name: /Why My Home VPN Is Off by Default/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Not here." })).toHaveCount(0);
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
});

test("fine-pointer cursor works at compact desktop width and is absent on touch", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperties(navigator, {
      deviceMemory: { configurable: true, get: () => 8 },
      hardwareConcurrency: { configurable: true, get: () => 8 },
    });
  });
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

// Regression: Brave with "Desktop site" and in-app webviews (Telegram) expose
// a touch screen while still reporting hover/fine-pointer, so every mitigation
// gated purely on (hover: none) and (pointer: coarse) was skipped there —
// leaving the hero grid drifting and the blended full-viewport grain layer
// live, which stuttered the whole site on Brave but never on Safari.
test("touch hardware gets the mobile mitigations even when the browser reports a fine pointer", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 412, height: 915 } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  await expect(page.locator("html")).toHaveAttribute("data-touch", "true");

  const ambient = await page.evaluate(() => {
    const grid = document.querySelector(".hero-grid");
    const noise = document.querySelector(".noise");
    const scanlines = document.querySelector(".hero-scanlines");
    return {
      gridBackground: grid ? getComputedStyle(grid).backgroundImage : null,
      gridAnimation: grid ? getComputedStyle(grid, "::before").animationName : null,
      gridPseudoContent: grid ? getComputedStyle(grid, "::before").content : null,
      gridPseudoTransform: grid ? getComputedStyle(grid, "::before").transform : null,
      noiseAnimation: noise ? getComputedStyle(noise, "::before").animationName : null,
      noiseBlend: noise ? getComputedStyle(noise, "::before").mixBlendMode : null,
      scanlineAnimation: scanlines ? getComputedStyle(scanlines).animationName : null,
    };
  });
  expect(ambient.gridBackground).toContain("linear-gradient");
  expect(ambient.gridAnimation).toBe("none");
  expect(ambient.gridPseudoContent).toBe("none");
  expect(ambient.gridPseudoTransform).toBe("none");
  expect(ambient.noiseAnimation).toBe("none");
  expect(ambient.noiseBlend).toBe("normal");
  expect(ambient.scanlineAnimation).toBe("none");

  // The expensive desktop-only treatments must stay off on touch hardware.
  await expect(page.locator("[data-custom-cursor]")).toHaveCount(0);
  await expect(page.locator(".ambient-blob")).toHaveCount(0);
  const navBlur = await page.evaluate(() => getComputedStyle(document.querySelector(".nav-panel")!).backdropFilter);
  expect(navBlur === "none" || navBlur === "").toBe(true);

  await context.close();
});

test("mobile browser chrome height changes do not reflow the page", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    reducedMotion: "reduce",
    viewport: { width: 412, height: 700 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, 4000));

  const measure = () => page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("#top")!;
    const title = hero.querySelector<HTMLElement>("h1")!;
    return {
      documentHeight: document.documentElement.scrollHeight,
      heroHeight: hero.getBoundingClientRect().height,
      scrollY: window.scrollY,
      titleDocumentTop: title.getBoundingClientRect().top + window.scrollY,
    };
  });

  const before = await measure();
  await page.setViewportSize({ width: 412, height: 915 });
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const after = await measure();

  expect(after.heroHeight).toBe(before.heroHeight);
  expect(after.titleDocumentTop).toBe(before.titleDocumentTop);
  expect(after.documentHeight).toBe(before.documentHeight);
  expect(after.scrollY).toBe(before.scrollY);

  await context.close();
});

test("visible capabilities advance on their own and the journey axis stays aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const expertise = page.locator("#expertise");
  await expertise.scrollIntoViewIfNeeded();
  await expect(expertise.locator('.expertise-item[data-active="true"]')).toHaveCount(1);
  const firstActive = await expertise.locator('.expertise-item[data-active="true"]').getAttribute("data-index");
  await expect.poll(async () => expertise.locator('.expertise-item[data-active="true"]').getAttribute("data-index"), { timeout: 3_500 }).not.toBe(firstActive);
  const activeIsVisible = await expertise.locator('.expertise-item[data-active="true"]').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  });
  expect(activeIsVisible).toBe(true);
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

test("capability autoplay keeps rows stable after their reveal", async ({ browser }) => {
  for (const device of [
    { name: "mobile", hasTouch: true, viewport: { width: 390, height: 844 } },
    { name: "desktop", hasTouch: false, viewport: { width: 1440, height: 900 } },
  ]) {
    await test.step(device.name, async () => {
      const context = await browser.newContext({
        hasTouch: device.hasTouch,
        viewport: device.viewport,
      });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("[data-preloader]")).toHaveCount(0);
      const row = page.locator(".expertise-item").nth(1);

      await row.evaluate((element) => {
        const top = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - window.innerHeight * 0.62);
        window.dispatchEvent(new Event("scroll"));
      });
      await expect(row).toHaveCSS("opacity", "1");
      await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(row.locator("[data-capability-artifact]")).toBeVisible();
      await page.waitForTimeout(2_500);
      await expect(row).toHaveCSS("opacity", "1");
      await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

      await context.close();
    });
  }
});

test("capability autoplay and decorative motion stop with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const expertise = page.locator("#expertise");
  await expertise.scrollIntoViewIfNeeded();
  const active = await expertise.locator('.expertise-item[data-active="true"]').getAttribute("data-index");
  await page.waitForTimeout(2_500);
  await expect(expertise.locator('.expertise-item[data-active="true"]')).toHaveAttribute("data-index", active!);
  await expect(expertise.locator("[data-capability-artifact]").first()).toHaveCSS("animation-name", "none");
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

  for (const path of ["/", "/notes/noticing-what-the-association-wasnt-using"]) {
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
  await page.goto("/notes/noticing-what-the-association-wasnt-using");
  await expect(page.getByRole("heading", { name: /Noticing What the Association Wasn.t Using/i })).toBeVisible();
  const jsonLd = await page.locator('script[data-jsonld^="note-"]').textContent();
  expect(jsonLd).toContain('"datePublished":"2026-04-01"');
  await page.goto("/notes/does-not-exist");
  await expect(page).toHaveURL(/does-not-exist/);
  await expect(page.getByRole("heading", { name: "Not here." })).toBeVisible();
  await page.goto("/notes/toString");
  await expect(page.getByRole("heading", { name: "Not here." })).toBeVisible();
});

test("closing a note restores its exact position on desktop and iPhone", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    const note = page.locator('[data-scroll-anchor="note-the-prompt-was-never-the-hard-part"]');
    await note.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 240, behavior: "auto" }));
    await expect(note).toBeInViewport();
    await expect.poll(() => note.evaluate((element) => {
      const transform = getComputedStyle(element.parentElement!).transform;
      return transform === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(transform).m42);
    })).toBeLessThanOrEqual(0.1);
    // Layout offset, measured the same transform-free way the restore does, so a
    // reveal animation replaying on return can't read as scroll drift. The last
    // sample also checks the painted rect, by which point transforms have ended.
    const LAYOUT_OFFSET = (element: Element) => {
      let top = 0;
      let current: HTMLElement | null = element as HTMLElement;
      while (current) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
      return top - window.scrollY;
    };
    const expectedOffset = await note.evaluate(LAYOUT_OFFSET);
    const expectedRect = await note.evaluate((element) => element.getBoundingClientRect().top);

    // The row is already in view. A DOM click models the browser interaction
    // without Playwright's locator auto-scroll changing the captured offset.
    await note.evaluate((element) => element.click());
    await expect(page.getByRole("heading", { name: /The Prompt Was Never the Hard Part/i })).toBeVisible();
    await page.getByRole("button", { name: "Close note and return to notes" }).click();
    await expect(note).toBeVisible();
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    for (const delay of [100, 600, 2500]) {
      await page.waitForTimeout(delay);
      const actualOffset = await note.evaluate(LAYOUT_OFFSET);
      expect(Math.abs(actualOffset - expectedOffset), `scroll drift at ${viewport.width}px after ${delay}ms`).toBeLessThanOrEqual(2);
    }
    const settledRect = await note.evaluate((element) => element.getBoundingClientRect().top);
    expect(Math.abs(settledRect - expectedRect), `painted drift at ${viewport.width}px`).toBeLessThanOrEqual(2);
  }
});

test("browser back still restores the exact note position", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);
  const note = page.locator('[data-scroll-anchor="note-vpn-off-by-default"]');
  await note.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 180, behavior: "auto" }));
  // Same two guards as "closing a note restores its exact position": let the
  // row's FadeIn transform reach 0 before capturing, and click through the DOM.
  // A Playwright click auto-scrolls the row into view first, which moves the
  // page after expectedY is captured, so the restore target is a position the
  // assertion never saw.
  await expect.poll(() => note.evaluate((element) => {
    const transform = getComputedStyle(element.parentElement!).transform;
    return transform === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(transform).m42);
  })).toBeLessThanOrEqual(0.1);
  const expectedY = await page.evaluate(() => window.scrollY);
  await note.evaluate((element) => element.click());
  await page.goBack();
  await expect(note).toBeVisible();
  await expect.poll(() => page.evaluate((target) => Math.abs(window.scrollY - target), expectedY)).toBeLessThanOrEqual(2);
});

test("direct note close falls back to the notes section without replaying the preloader", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/notes/noticing-what-the-association-wasnt-using");
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
  const note = page.locator('[data-scroll-anchor="note-vpn-off-by-default"]');
  await note.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 180));
  await note.click();
  await expect(page.getByRole("heading", { name: /Why My Home VPN Is Off by Default/i })).toBeVisible();
  await page.goBack();
  // Wait until the restore actually stops moving the page, rather than a fixed
  // delay. RouteScrollCommit re-scrolls every frame until the height and the
  // anchor hold still, and how long that takes scales with page length, so a
  // fixed 350ms was really asserting "this page is short enough to settle by
  // then" — it goes red on content growth rather than on a behaviour change.
  let previousY = Number.NaN;
  let stablePolls = 0;
  for (let poll = 0; poll < 60 && stablePolls < 4; poll += 1) {
    const y = await page.evaluate(() => window.scrollY);
    stablePolls = Math.abs(y - previousY) <= 0.5 ? stablePolls + 1 : 0;
    previousY = y;
    await page.waitForTimeout(80);
  }
  expect(stablePolls, "scroll restore never settled").toBeGreaterThanOrEqual(4);
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: -450 }));
    window.scrollBy({ top: -450, behavior: "auto" });
  });
  const manualY = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(700);
  // Nothing may drag the position back afterwards. 1px of slack because scrollY
  // is fractional whenever the page height is.
  const settledY = await page.evaluate(() => window.scrollY);
  expect(Math.abs(settledY - manualY)).toBeLessThanOrEqual(1);
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
  await expect(page.getByText("I run my own infrastructure", { exact: false }).first()).toBeVisible();
  const system = page.getByRole("button", { name: "Toggle system mode" });
  await system.click();
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-system-wipe]")).toHaveCount(0);
  const results = await new AxeBuilder({ page }).exclude("canvas").analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious, serious.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
});

test("every route is free of serious accessibility violations", async ({ page }) => {
  // The audit above only ever visited the home page, which is how eight
  // unlabelled links on the CV — pdf.js draws the PDF's own link annotations
  // as empty <a href> boxes over the canvas — went unnoticed. Every route the
  // site serves is checked here, at both a phone and a desktop width.
  for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size);
    for (const path of ["/", "/cv", "/notes/vpn-off-by-default", "/does-not-exist"]) {
      await test.step(`${path} @ ${size.width}`, async () => {
        await page.goto(path);
        await expect(page.locator("[data-preloader]")).toHaveCount(0, { timeout: 20_000 });
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .exclude("canvas")
          .analyze();
        const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
        expect(serious, serious.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length})`).join("\n")).toEqual([]);
      });
    }
  }
});

test("every keyboard stop shows where the focus is", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  // The carousels are tabbable regions that answer to the arrow keys, and they
  // used to suppress the outline outright — arming those keys while showing
  // nothing. Walking the whole page catches the next element that does it.
  const unmarked: string[] = [];
  const visited: string[] = [];
  for (let step = 0; step < 120; step++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        name: el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 40) || el.tagName,
        marked: (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
      };
    });
    if (!stop) break;
    visited.push(stop.name);
    if (!stop.marked && !unmarked.includes(stop.name)) unmarked.push(stop.name);
  }

  // Assert the walk actually got as far as the regions this test exists for,
  // otherwise an early exit would let it pass without checking anything.
  expect(visited).toContain("Selected projects");
  expect(visited).toContain("Skill groups");
  expect(unmarked, `focusable with no visible focus indicator: ${unmarked.join(", ")}`).toEqual([]);
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
  expect(srValues).toEqual(["16TB", "500+", "1,000"]);

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
  expect(after).toEqual(["16TB", "500+", "1,000"]);

  // Scroll away and back
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await page.waitForTimeout(150);
  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // No replay — values should still be final immediately

  const recheck = await page.locator(".proof-grid .sr-only").allTextContents();
  expect(recheck).toEqual(["16TB", "500+", "1,000"]);
});

test("count-up renders final values immediately with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-preloader]")).toHaveCount(0);

  await page.locator(".proof-grid").scrollIntoViewIfNeeded();
  // With reduced motion, CountUp renders a plain span — no animation, no sr-only
  await expect(page.locator(".proof-grid").getByText("16TB")).toBeVisible();
  await expect(page.locator(".proof-grid").getByText("500+")).toBeVisible();
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
