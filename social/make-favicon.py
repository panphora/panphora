#!/usr/bin/env python3
"""Draws the headline's block "p" on a 16x16 grid: favicon.svg, favicon.ico, favicon-32.png, favicon-180.png."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
INK, GROUND = (0x2B, 0x24, 0x1B), (0xFD, 0xF8, 0xF0)
P = ['#####.', '#....#', '#....#', '#....#', '#....#', '#....#', '#####.', '#.....', '#.....', '#.....']
X0, Y0 = 5, 3
cells = [(c + X0, r + Y0) for r, row in enumerate(P) for c, v in enumerate(row) if v == '#']

rects = ''.join(f'<rect x="{x}" y="{y}" width="1" height="1"/>' for x, y in cells)
(HERE / 'favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="#2B241B"/><g fill="#FDF8F0">{rects}</g></svg>\n')

im = Image.new('RGB', (16, 16), INK)
for xy in cells:
    im.putpixel(xy, GROUND)
for n in (32, 180):
    im.resize((n, n), Image.NEAREST).save(HERE / f'favicon-{n}.png')
im.resize((48, 48), Image.NEAREST).save(HERE / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
