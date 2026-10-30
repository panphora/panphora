import { chromium } from '/Users/davidmiranda/Documents/GitHub/hyper/hyper-morph/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
const root = '/Users/davidmiranda/Documents/GitHub/doomgrid/public';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (!extname(p)) p = '/index.html';
  try { const b = readFileSync(join(root, p)); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const board = JSON.parse(readFileSync('/Users/davidmiranda/Documents/GitHub/doomgrid/nice-starting-board.json', 'utf8'));
const extra = [
  ['ra-dragon', 'red', 3, 6], ['ra-skull', 'white', 5, 9], ['ra-sword', 'yellow', 2, 3], ['ra-player', 'green', 1, 2], ['ra-player', 'purple', 2, 1],
  ['ra-gem', 'blue', 4, 12], ['ra-key', 'yellow', 6, 14], ['ra-spider-face', 'purple', 4, 16], ['ra-castle-flag', 'red', 1, 18], ['ra-bomb-explosion', 'orange', 6, 4],
  ['ra-potion', 'green', 3, 10], ['ra-wolf-head', 'white', 5, 2], ['ra-crystals', 'blue', 2, 14], ['ra-heart-bottle', 'red', 0, 8],
].map(([icon, color, row, column]) => ({ icon, color, row, column }));
const tileAt = (r, c) => {
  const river = Math.round(9 + r * 0.8);
  if (c === river || c === river + 1) return 'water';
  if (c === river - 1 || c === river + 2) return 'sand';
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return 'lava';
  if (c >= 16 && r <= 2) return 'snow';
  if (r === 5 || (c === 6 && r < 5)) return 'stone';
  if ((r === 1 && c === 14) || (r === 6 && c === 14)) return 'gold';
  if (r === 4 && c === 12) return 'diamond';
  if (r === 0 && c === 0) return 'ground';
  return 'grass';
};
const tiles = [];
for (let r = 0; r < 20; r++) for (let c = 0; c < 20; c++) tiles.push({ type: 'tile', row: r, column: c, tile: tileAt(r, c) });
const docs = [...tiles, ...board.filter((d) => d.icon && d.row === 0), ...extra].map((d, i) => ({ id: 'd' + i, d }));
const stub = `window.firebase = { initializeApp() {}, firestore() { return { collection() { return {
  get: () => Promise.resolve({ docs: ${JSON.stringify(docs)}.map((x) => ({ id: x.id, data: () => x.d })) }),
  onSnapshot() {}, doc() { return { set() {}, get: () => Promise.resolve({ exists: false }) }; } }; } }; } };`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 2 });
await page.route('**/*', (route) => {
  const u = route.request().url();
  if (u.includes('firebase-app.js')) return route.fulfill({ contentType: 'text/javascript', body: stub });
  if (u.includes('firebase-firestore.js') || u.includes('workers.dev') || u.includes('levels-by')) return route.fulfill({ contentType: 'text/javascript', body: '' });
  return route.continue();
});
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(`http://localhost:${port}/banner-board`);
await page.waitForTimeout(2500);
const box = await page.$eval('#game', (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
console.log(box);
await page.evaluate(() => window.scrollTo(0, 0));
await page.locator('#game').screenshot({ path: process.argv[2] });
await browser.close(); server.close();
