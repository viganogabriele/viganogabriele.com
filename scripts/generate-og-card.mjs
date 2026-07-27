import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const font = await readFile(new URL("../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2", import.meta.url)).then((file) => file.toString("base64"));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.setContent(`<!doctype html>
<style>
  @font-face { font-family: Grotesk; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 300 700; }
  * { box-sizing: border-box; }
  body { margin: 0; overflow: hidden; background: #0d0f13; color: #f1eee7; font-family: Grotesk, sans-serif; }
  .card { width: 1200px; height: 630px; position: relative; overflow: hidden; isolation: isolate; background: #0d0f13; border: 1px solid #24262a; }
  .wash { position: absolute; inset: 0; background: radial-gradient(70% 90% at 100% 0%, rgba(135,157,207,.12), transparent 72%); }
  .rule { position:absolute; left: 78px; right:78px; top:72px; height:1px; background:#303238; }
  .eyebrow { position:absolute; top: 91px; left: 78px; color: #9297a6; font-size: 14px; font-weight: 500; letter-spacing: .14em; }
  .content { position:absolute; left: 78px; top: 174px; max-width: 850px; }
  h1 { margin: 0; font-size: 112px; font-weight: 500; letter-spacing: -.084em; line-height: .79; }
  h1 span { display:block; }
  p { margin: 42px 0 0; max-width: 620px; color: #b7b4ad; font-size: 26px; font-weight: 400; letter-spacing: -.03em; line-height: 1.2; }
  .url { position:absolute; left:78px; bottom:60px; color: #879dcf; font-size: 15px; font-weight:500; letter-spacing:.1em; }
  .index { position:absolute; right:78px; bottom:58px; color:#6f706f; font-size:14px; letter-spacing:.12em; }
</style>
<main class="card"><div class="wash"></div><div class="rule"></div><div class="eyebrow">COMPUTER ENGINEERING · PRODUCT · OPERATIONS</div><section class="content"><h1><span>GABRIELE</span><span>VIGANÒ</span></h1><p>I turn complex projects into products people can use and teams can run.</p></section><div class="url">VIGANOGABRIELE.COM</div><div class="index">MILAN, ITALY</div></main>`);
await page.screenshot({ path: new URL("../public/og-cover-v3.png", import.meta.url).pathname });
await browser.close();
