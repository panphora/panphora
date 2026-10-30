#!/bin/bash
# shoot.sh name cx cz ox oy oz redFacing blueFacing [wait]
cd "$(dirname "$0")"
node play.mjs "cam-$1.png" 1200 300 "window.CX=$2;window.CZ=$3;window.OX=$4;window.OY=$5;window.OZ=$6;window.RF=$7;window.BF=$8; $(cat build.js); $(cat pose.js); $(cat cam.js)" "${9:-8000}"
