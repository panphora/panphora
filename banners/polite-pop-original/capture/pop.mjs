import { chromium } from '/Users/davidmiranda/Documents/GitHub/hyper/hyper-morph/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto('https://politepop.com/demo/');
await page.waitForTimeout(1500);
for (let i = 1; i <= 12; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(250); }
await page.waitForTimeout(9000);
const sel = await page.evaluate(() => {
  const bubble = document.querySelector('.polite-pop__pop-bubble');
  let root = bubble; while (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
  root.id = root.id || 'pp-root';
  document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
  for (const el of document.body.children) if (el !== root) el.style.visibility = 'hidden';
  return '#' + root.id;
});
await page.waitForTimeout(400);
await page.screenshot({ path: 'pp-pop.png', omitBackground: true, clip: { x: 0, y: 520, width: 420, height: 270 } });
console.log(await page.evaluate(() => [...document.querySelectorAll('[class*=polite], [id*=polite]')].filter((e) => e.offsetParent).map((e) => e.className + ' ' + JSON.stringify(e.getBoundingClientRect())).slice(0, 6).join('\n')));
await browser.close();
