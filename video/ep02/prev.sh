#!/usr/bin/env bash
# Render preview stills at given fractions of each segment and tile them into prev/sheet*.png
#   ./prev.sh [ids...]   (default: all segments)
set -euo pipefail
cd "$(dirname "$0")"
TS=$(python3 -c "
import json,sys;tl=json.load(open('timeline.json')); ids=sys.argv[1:]
print(' '.join(f\"{s['t0']+(s['t1']-s['t0'])*f:.2f}\" for s in tl if not ids or s['id'] in ids for f in (0.3,0.7,0.95)))" "$@")
rm -rf prev
NODE=$(ls -d /nix/store/*-nodejs-2*/bin/node | head -1)
$NODE render.mjs stills prev $TS
nix shell nixpkgs#ffmpeg -c ffmpeg -v error -y -pattern_type glob -i 'prev/t*.png' -vf "scale=640:-1,tile=3x6" prev/sheet%d.png
