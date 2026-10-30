import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

src, out, k = Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3])
work = out.parent / "layers"
work.mkdir(exist_ok=True)

im = Image.open(src).convert("RGB")
im.thumbnail((1200, 1200))
im = im.filter(ImageFilter.MedianFilter(5))
px = np.asarray(im, dtype=np.float32).reshape(-1, 3)
rng = np.random.default_rng(1)
sample = px[rng.choice(len(px), 40000, replace=False)]
centers = sample[rng.choice(len(sample), k, replace=False)]
for _ in range(40):
    lab = np.argmin(((sample[:, None] - centers[None]) ** 2).sum(-1), 1)
    centers = np.array([sample[lab == i].mean(0) if (lab == i).any() else centers[i] for i in range(k)])
keep = []
for c in centers[np.argsort(-np.bincount(lab, minlength=k))]:
    if all(np.linalg.norm(c - d) >= 14 for d in keep):
        keep.append(c)
centers = np.array(keep)
k = len(centers)
labels = np.argmin(((px[:, None] - centers[None]) ** 2).sum(-1), 1).astype(np.uint8)
w, h = im.size
lab_img = Image.fromarray(labels.reshape(h, w), "L").filter(ImageFilter.ModeFilter(9))
idx = np.asarray(lab_img).reshape(-1)
counts = np.bincount(idx, minlength=k)
order = [int(i) for i in np.argsort(-counts) if counts[i]]

paths = []
for n, i in enumerate(order):
    later = np.isin(idx, order[n:])
    bmp = work / f"l{n}.bmp"
    Image.fromarray(np.where(later, 0, 255).astype(np.uint8).reshape(h, w)).convert("1").save(bmp)
    svg = work / f"l{n}.svg"
    subprocess.run(["potrace", str(bmp), "-s", "-o", str(svg), "--turdsize", "60", "--alphamax", "1.1", "--opttolerance", "0.4", "-u", "1"], check=True)
    body = svg.read_text()
    g = re.search(r"<g transform=\"([^\"]+)\"[^>]*>(.*?)</g>", body, re.S)
    color = "#%02x%02x%02x" % tuple(int(round(c)) for c in centers[i])
    ds = " ".join(re.findall(r" d=\"([^\"]+)\"", g.group(2)))
    paths.append(f'<path fill="{color}" transform="{g.group(1)}" d="{ds}"/>')

out.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">\n' + "\n".join(paths) + "\n</svg>\n")
print(out, w, h, ["#%02x%02x%02x" % tuple(int(round(c)) for c in centers[i]) for i in order])
