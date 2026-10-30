#!/bin/sh
# Renders <project>/banner.html (1200x300) to <project>/banner.png at 2x.
# ./render.sh richclay   renders one; ./render.sh with no arguments renders every project.
cd "$(dirname "$0")" || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ $# -eq 0 ] && set -- */
for p in "$@"; do
  p="${p%/}"
  [ -f "$p/banner.html" ] || { echo "no $p/banner.html" >&2; continue; }
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --run-all-compositor-stages-before-draw --force-device-scale-factor=2 \
    --window-size=1200,300 --virtual-time-budget=4000 --user-data-dir="${TMPDIR:-/tmp}/panphora-banner-chrome" \
    --screenshot="$PWD/$p/banner.png" "file://$PWD/$p/banner.html" >/dev/null 2>&1
  echo "$p/banner.png"
done
