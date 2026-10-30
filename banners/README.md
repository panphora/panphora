# Project banners

The 4:1 banner at the top of each project on panphora.com. Each project has its own folder: `banner.html` is the source (1200×300), `banner.png` is the 2400×600 render, and `assets/` holds any art it uses.

```sh
./render.sh richclay   # render one
./render.sh            # render all
```

A new banner is a new folder with a `banner.html`.

`uimotion/` and `looksay/` are the animated banners: a looping scene built with the uimotion library (`assets/uimotion.js`, a copy of `hyper/ui-animations/lib/uimotion.js`), shown on the site in an iframe instead of as a PNG. It needs a web server to run (ES module import), and `?t=<ms>` freezes it at one moment, `?debug` adds a scrubber.

Illustrations inside a banner (the bread in `cms-sidebar/`) are made by asking Codex's image generator for a flat vector-style picture with at most six solid colors, then tracing it into an SVG:

```sh
python3 trace.py source.png out.svg 10   # 10 = how many colors to look for; near-duplicates merge
```

It needs `potrace` and `numpy`. Keep the generated PNG beside the SVG as `<name>-source.png`.

## Prompt for a new banner

Paste this to an agent, filling in the first two lines.

```text
Project: <name>, <one line on what it is and what it does for people>
Where its design lives: <site URL, repo path, and/or the file to open>

Make the panphora.com banner for this project. Read
~/Documents/GitHub/panphora/banners/README.md first, then open two existing
banners (richclay/banner.html and htmlclay/banner.html) to see the
house conventions.

What a banner is: a small custom image that introduces the project, like an
Open Graph image but 4:1. It is not a screenshot. It is a designed scene, built
in HTML, that captures how the project looks and shows the one thing it does.

1. Gather the project's own design before drawing anything: its CSS custom
   properties (colors), fonts (Google Fonts links), logo or mascot SVGs, its OG
   image, and the real words it uses (headings, button labels, example
   content). Fetch the live site or read the repo. Copy any art you use into
   <project>/assets/ and reference it relatively.
2. Pick one scene that shows the idea in a single glance. Examples so far:
   - Rich Clay: a selected word with the floating toolbar, beside the clean
     HTML it writes.
   - HTML Clay: a .htmlclay file double-clicked into a browser window that
     shows "Saved".
   - OverType: the invisible textarea floating over the rendered Markdown.
   - Markdown for Kids: the site's slide logo beside a card of typed Markdown.
   - Polite pop: Claygoo leaning in from the corner with the pop's real copy.
   - Journal (a sneak peek): a cropped corner of the app with a made-up entry.
3. Write <project>/banner.html: exactly 1200×300 (html and body sized, overflow
   hidden), colors as :root tokens taken from the project, fonts from Google
   Fonts, everything else inline. No JavaScript, and no external images other
   than files in assets/.
4. Render with ./render.sh <project>, look at banner.png, and fix what you see.
   Repeat until it is clean. Check for:
   - nothing clipped at an edge unless it is meant to bleed off;
   - nothing overlapping text (pointers, rings, tags, toolbars);
   - no text wrapping onto a line it was not meant to;
   - the scene reads at the real display size, 600×150. Text under about 16px
     in the source is unreadable there, so keep labels short and large;
   - a generic rule (such as `.doc svg`) can silently override a sized child,
     so give each element its own selector.
5. Content rules:
   - Use only real copy and real features.
   - Make up example content (notes, recipes, entries) that is neutral and
     clearly an example. Never use David's private data.
   - Do not repeat the project's name as a big title: the site prints the name
     above the banner. A small wordmark is fine when it is part of the
     project's identity (OverType).
   - No pure white or black backgrounds. No left-border accent bars, and no
     small uppercase labels above headings.
   - For an unreleased (sneak peek) project, show a cropped corner, not the
     whole thing.
6. When it looks right, copy banner.png to the site's assets as
   <project>-banner.png and point the project's entry at it (image set to that
   path, media set to "image").

Do not end your turn until <project>/banner.html and <project>/banner.png both
exist, and you have looked at the render.
```
