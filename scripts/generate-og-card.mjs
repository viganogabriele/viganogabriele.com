import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const [background, font] = await Promise.all([
  readFile(new URL("../public/og-card-background.png", import.meta.url)).then((file) => file.toString("base64")),
  readFile(new URL("../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2", import.meta.url)).then((file) => file.toString("base64")),
]);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.setContent(`<!doctype html>
<style>
  @font-face { font-family: Grotesk; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 300 700; }
  * { box-sizing: border-box; }
  body { margin: 0; overflow: hidden; background: #090d18; color: #f3f0e8; font-family: Grotesk, sans-serif; }
  .card { width: 1200px; height: 630px; position: relative; overflow: hidden; isolation: isolate; background: #090d18 url(data:image/png;base64,${background}) center / cover no-repeat; }
  .wash { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(5,9,20,.84), rgba(5,9,20,.38) 53%, rgba(5,9,20,.68)); }
  .line { position:absolute; left: 100px; top: 86px; width: 64px; height: 2px; background: #afc8ff; }
  .eyebrow { position:absolute; top: 79px; left: 184px; color: #c7d5fa; font-size: 15px; font-weight: 500; letter-spacing: .17em; }
  .content { position:absolute; left: 100px; top: 181px; max-width: 800px; }
  h1 { margin: 0; font-size: 112px; font-weight: 500; letter-spacing: -.084em; line-height: .79; }
  h1 span { display:block; }
  p { margin: 45px 0 0; max-width: 560px; color: #d6d9e2; font-size: 27px; font-weight: 400; letter-spacing: -.035em; line-height: 1.18; }
  .url { position:absolute; left:100px; bottom:78px; color: #8fa7de; font-size: 16px; font-weight:500; letter-spacing:.12em; }
  .cursor { position:absolute; right:118px; bottom:103px; width:18px; height:29px; border-left:2px solid #92adf2; border-bottom:2px solid #92adf2; transform:skew(-16deg); opacity:.65; }
</style>
<main class="card"><div class="wash"></div><div class="line"></div><div class="eyebrow">COMPUTER ENGINEERING STUDENT · MILAN</div><section class="content"><h1><span>GABRIELE</span><span>VIGANÒ</span></h1><p>I build products, teams and systems that hold up.</p></section><div class="url">WWW.VIGANOGABRIELE.COM</div><div class="cursor"></div></main>`);
await page.screenshot({ path: new URL("../public/og-cover-v3.png", import.meta.url).pathname });
await browser.close();
