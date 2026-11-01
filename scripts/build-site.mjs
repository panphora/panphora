#!/usr/bin/env node
// Builds the public panphora.com from the editable page in ~/htmlfile.
//
//   node scripts/build-site.mjs           writes the site into LOCAL_APPS (Hyperclay Local syncs it to production)
//   node scripts/build-site.mjs --out DIR writes the same files under DIR instead, for a dry run
//
// The like and notify controls stay hidden until "revealReactions": true is set in site/meta.json (or
// --reveal-reactions is passed), and revealing refuses a source page that still has the in-memory stub.
//
// The editable page loads ClayJS and redpen in edit mode and points at ../bevel and ../assets, which only
// exist beside it in ~/htmlfile. The public page drops the edit runtime, loads Bevel from jsDelivr, serves
// images from Hyperclay uploads (/_/uploads/panphora/), and inlines each animated banner into one .html file,
// because outside uploads/ Hyperclay Local only syncs .html files. Single-file games in GAMES are copied there too,
// served at panphora.hyperclay.com/panphora/<id>.html (panphora.com itself only serves the homepage).

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = join(homedir(), 'htmlfile/20261029-panphora-bakeoff');
const SOURCE = process.env.PANPHORA_SOURCE || join(SOURCE_DIR, 'seat-argon-v2/index.htmlclay');
const SOCIAL = join(REPO, 'social');
const META = JSON.parse(readFileSync(join(REPO, 'site/meta.json'), 'utf8'));

const revealReactions = META.revealReactions === true || process.argv.includes('--reveal-reactions');
const outFlag = process.argv.indexOf('--out');
const ROOT = outFlag > -1 ? process.argv[outFlag + 1] : join(homedir(), 'Documents/GitHub/hyper/LOCAL_APPS');
const OUT_PAGE = join(ROOT, 'core/panphora.html');
const OUT_UPLOADS = join(ROOT, 'uploads/panphora');
const OUT_BANNERS = join(ROOT, 'panphora');
const UPLOAD_URL = '/_/uploads/panphora';
const BEVEL = 'https://cdn.jsdelivr.net/npm/@panphora/bevel@0.2.1';
const SITE = 'https://panphora.com';
const GAMES = { 'block-dodger': join(homedir(), 'Documents/GitHub/block-dodger/index.html') };

const short = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const replaceOnce = (html, pattern, replacement, what) => {
  const matches = html.match(new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g'));
  if (!matches || matches.length !== 1) throw new Error(`expected exactly one ${what}, found ${matches ? matches.length : 0}`);
  return html.replace(pattern, replacement);
};

for (const dir of [dirname(OUT_PAGE), OUT_UPLOADS, OUT_BANNERS]) mkdirSync(dir, { recursive: true });

const upload = (src, name) => {
  const dest = join(OUT_UPLOADS, name);
  copyFileSync(src, dest);
  if (name.endsWith('.png')) execFileSync('oxipng', ['-o', '4', '--strip', 'safe', '-q', dest]);
  return `${UPLOAD_URL}/${name}?v=${short(readFileSync(dest))}`;
};

let html = readFileSync(SOURCE, 'utf8');

if (revealReactions && (!html.includes('id="panphora-client"') || html.includes('stub until'))) {
  throw new Error('refusing to reveal the like and notify controls: the source page still has the in-memory stub instead of the panphora client');
}

html = replaceOnce(html, /<html\b[^>]*>/, '<html lang="en">', '<html> tag');

const head = [
  `<title>${esc(META.title)}</title>`,
  `  <meta name="description" content="${esc(META.description)}">`,
  `  <link rel="canonical" href="${SITE}/">`,
  `  <link rel="icon" href="${upload(join(SOCIAL, 'favicon.svg'), 'favicon.svg')}" type="image/svg+xml">`,
  `  <link rel="icon" href="${upload(join(SOCIAL, 'favicon.ico'), 'favicon.ico')}" sizes="48x48">`,
  `  <link rel="apple-touch-icon" href="${upload(join(SOCIAL, 'favicon-180.png'), 'apple-touch-icon.png')}">`,
  `  <meta property="og:type" content="website">`,
  `  <meta property="og:url" content="${SITE}/">`,
  `  <meta property="og:title" content="${esc(META.title)}">`,
  `  <meta property="og:description" content="${esc(META.description)}">`,
  `  <meta property="og:image" content="${SITE}${upload(join(SOCIAL, 'og.png'), 'og.png')}">`,
  `  <meta property="og:image:width" content="1200">`,
  `  <meta property="og:image:height" content="630">`,
  `  <meta name="twitter:card" content="summary_large_image">`,
  `  <meta name="twitter:title" content="${esc(META.title)}">`,
  `  <meta name="twitter:description" content="${esc(META.description)}">`,
  `  <meta name="twitter:image" content="${SITE}${UPLOAD_URL}/og.png">`,
].join('\n');
html = replaceOnce(html, /<title>[^<]*<\/title>\s*<meta name="description"[^>]*>/, head, 'title and description');

html = replaceOnce(html, /href="\.\.\/bevel\/bevel-fonts\.css"/, `href="${BEVEL}/bevel-fonts.css"`, 'bevel-fonts.css link');
html = replaceOnce(html, /href="\.\.\/bevel\/bevel\.css"/, `href="${BEVEL}/bevel.css"`, 'bevel.css link');
html = replaceOnce(html, /src="\.\.\/bevel\/bevel\.js"/, `src="${BEVEL}/bevel.js"`, 'bevel.js script');

html = replaceOnce(html, /\n<script type="application\/json" id="redpen-data">[^\n]*<\/script>/, '', 'redpen data');
html = replaceOnce(html, /\n<script src="[^"]*\/clay\/clay\.js[^"]*"><\/script>/, '', 'clay.js script');
html = replaceOnce(html, /\n<script>window\.REDPEN_OPTIONS[^\n]*<\/script>/, '', 'redpen options');
html = replaceOnce(html, /\n<script src="[^"]*\/redpen\/redpen\.js"><\/script>/, '', 'redpen.js script');

html = replaceOnce(
  html,
  /<script type="module">\s*let active = 0;[\s\S]*?import\('\.\.\/claygoo\/pop\.js'\)[\s\S]*?<\/script>/,
  '<script src="https://hyperclay.com/public/js/polite-pop.js" data-tag="panphora" defer></script>',
  'polite pop module',
);

if (!revealReactions) {
  console.log('like and notify controls are hidden (set "revealReactions": true in site/meta.json once the backend is live)');
  html = replaceOnce(html, /<\/style>\s*<\/head>/, `  .like-slot, .notify-region { display: none !important; }\n  </style>\n</head>`, 'end of head style');
}

html = html.replace(/src="\.\.\/assets\/([a-z0-9-]+)-banner\/index\.html(?:\?v=\d+)?"/g, (_, id) => {
  const dir = join(SOURCE_DIR, 'assets', `${id}-banner`);
  const lib = readFileSync(join(dir, 'assets/uimotion.js'));
  const page = readFileSync(join(dir, 'index.html'), 'utf8').replace(
    "from './assets/uimotion.js'",
    `from 'data:text/javascript;base64,${lib.toString('base64')}'`,
  );
  if (page.includes('./assets/')) throw new Error(`${id} banner still references ./assets/`);
  writeFileSync(join(OUT_BANNERS, `${id}-banner.html`), page);
  return `src="https://panphora.hyperclay.com/panphora/${id}-banner.html?v=${short(page)}"`;
});

const images = new Set();
html = html.replace(/src="\.\.\/assets\/([^"?]+\.(?:png|jpe?g|gif|webp|mp4))(?:\?v=\d+)?"/g, (_, name) => {
  images.add(name);
  return `src="${upload(join(SOURCE_DIR, 'assets', name), name)}"`;
});

const leftovers = html.match(/(?:src|href)="\.\.?\/[^"]*"/g);
if (leftovers) throw new Error(`relative paths left in the page: ${leftovers.join(', ')}`);
const offDomain = html.match(/(?:src|href)="\/(?!_\/|\/|")[^"]*"/g);
if (offDomain) throw new Error(`panphora.com serves only the homepage and /_/ paths, so these load the homepage instead: ${offDomain.join(', ')}`);
for (const marker of ['clay.js', 'redpen.js', 'opens-in', 'documentid', '../claygoo']) {
  if (html.includes(marker)) throw new Error(`edit-mode marker left in the page: ${marker}`);
}

writeFileSync(OUT_PAGE, html);
for (const [id, src] of Object.entries(GAMES)) copyFileSync(src, join(OUT_BANNERS, `${id}.html`));
console.log(`${OUT_PAGE} (${Math.round(html.length / 1024)} KB)`);
console.log(`${images.size} images and the favicon set in ${OUT_UPLOADS}`);
console.log(`animated banners in ${OUT_BANNERS}`);
if (!existsSync(join(OUT_UPLOADS, 'og.png'))) throw new Error('og.png missing');
