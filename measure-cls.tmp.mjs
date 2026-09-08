import { chromium } from "@playwright/test";

const base = process.env.BASE ?? "http://127.0.0.1:4273";
const runs = Number(process.env.RUNS ?? 3);

async function measure(route, { width, height, cpu }) {
  const browser = await chromium.launch();
  const results = [];
  for (let i = 0; i < runs; i += 1) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    if (cpu) await session.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    await page.addInitScript(() => {
      const w = window;
      w.__cls = 0;
      w.__sources = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          w.__cls += entry.value;
          w.__sources.push({
            value: Number(entry.value.toFixed(4)),
            at: Math.round(entry.startTime),
            nodes: (entry.sources ?? []).map((s) => s.node?.className || s.node?.nodeName || "?").join(" , "),
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`${base}${route}`, { waitUntil: "load" });
    await page.waitForTimeout(4000);
    const out = await page.evaluate(() => ({ cls: window.__cls, sources: window.__sources }));
    results.push(out);
    await context.close();
  }
  await browser.close();
  return results;
}

for (const [label, options] of [
  ["mobile 390x844 4x CPU", { width: 390, height: 844, cpu: 4 }],
  ["desktop 1280x800", { width: 1280, height: 800, cpu: 0 }],
]) {
  for (const route of ["/cv", "/"]) {
    const results = await measure(route, options);
    console.log(`\n${route} — ${label}`);
    for (const [index, result] of results.entries()) {
      console.log(`  run ${index + 1}: CLS ${result.cls.toFixed(4)}`);
      for (const source of result.sources) console.log(`     +${source.value} [${source.at}ms] ${source.nodes}`);
    }
  }
}
