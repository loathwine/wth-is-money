#!/usr/bin/env bash
# Render preview stills at 30/70/95% of each segment and tile them into <ch>/prev/sheet*.png
#   ./prev.sh <ch> [ids...]   (default: all segments)
set -euo pipefail
cd "$(dirname "$0")"
CH=${1:?usage: ./prev.sh <chapter dir> [ids...]}; shift
TS=$(python3 -c "
import json,sys;tl=json.load(open(sys.argv[1])); ids=sys.argv[2:]
print(' '.join(f\"{s['t0']+(s['t1']-s['t0'])*f:.2f}\" for s in tl if not ids or s['id'] in ids for f in (0.3,0.7,0.95)))" "$CH/timeline.json" "$@")
rm -rf "$CH/prev"
NODE=$(ls -d /nix/store/*-nodejs-2*/bin/node | head -1)
CH=$CH $NODE render.mjs stills "$CH/prev" $TS
nix shell nixpkgs#ffmpeg -c ffmpeg -v error -y -pattern_type glob -i "$CH/prev/t*.png" -vf "scale=640:-1,tile=3x6" "$CH/prev/sheet%d.png"
