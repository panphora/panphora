import { chromium } from '/Users/davidmiranda/Documents/GitHub/hyper/hyper-morph/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const out = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
await page.goto('https://cakechefgame.com');
await page.waitForTimeout(1500);
const cakes = { b: { cake: 'chocolate', frosting: 'pink', topping: 'sprinkles' } };
for (const [k, cfg] of Object.entries(cakes)) {
  const url = await page.evaluate((cfg) => { const c = document.getElementById('orderCanvas'); c.width = 1100; c.height = 800; Object.defineProperty(c, 'width', { get: () => 550 }); Object.defineProperty(c, 'height', { get: () => 400 }); c.getContext('2d').setTransform(2, 0, 0, 2, 0, 0); drawCake('orderCanvas', cfg); return document.getElementById('orderCanvas').toDataURL('image/png'); }, cfg);
  writeFileSync(`${out}/cake-${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
