// Dev helper: screenshot the site (optionally the hero 3D head in SYS mode).
// Usage: node scripts/shot.mjs <out.png> [--sys] [--scan] [--mobile] [--full] [--section=#id]
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "/tmp/shot.png";
const args = new Set(process.argv.slice(3));
const sectionArg = process.argv.slice(3).find((a) => a.startsWith("--section="));
const mobile = args.has("--mobile");

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  hasTouch: mobile,
});
await page.addInitScript(([sysOn]) => {
  if (sysOn) localStorage.setItem("gv-system-mode", "on");
  else localStorage.setItem("gv-system-mode", "off");
}, [args.has("--sys")]);
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

if (args.has("--sys")) {
  await page.waitForSelector(".hero-object-shell.mesh-ready", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
}
if (args.has("--scan")) {
  await page.click(".hero-object-button");
  await page.waitForTimeout(400);
}

if (sectionArg) {
  const sel = sectionArg.split("=")[1];
  await page.locator(sel).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator(sel).screenshot({ path: out });
} else if (args.has("--full")) {
  await page.screenshot({ path: out, fullPage: true });
} else if (args.has("--head")) {
  await page.locator(".hero-object-shell").screenshot({ path: out });
} else {
  await page.screenshot({ path: out });
}
await browser.close();
console.log(out);
