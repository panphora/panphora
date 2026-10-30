#!/bin/sh
cd "$(dirname "$0")" || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --run-all-compositor-stages-before-draw --force-device-scale-factor="$3" \
  --window-size="$2" --virtual-time-budget=4000 --user-data-dir="${TMPDIR:-/tmp}/panphora-social-chrome" \
  --screenshot="$PWD/$4" "file://$PWD/$1" >/dev/null 2>&1; echo "$4"; }
shot og.html 1200,630 1 og.png
