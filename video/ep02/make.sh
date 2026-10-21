#!/usr/bin/env bash
# One-shot build: narration → trim → timeline/audio → render → mux.   ./make.sh → out/ep02-every-rod.mp4
# Needs the site served at 127.0.0.1:8931 (python3 -m http.server 8931 in the repo root).
set -euo pipefail
cd "$(dirname "$0")"
./tts.sh                                                  # only generates lines that don't exist yet
nix shell nixpkgs#ffmpeg -c ./trim.sh
nix-shell -p "python3.withPackages(ps: [ps.numpy])" --run "python3 build.py narration.json out timeline.json"
NODE=$(ls -d /nix/store/*-nodejs-2*/bin/node | head -1)
nix shell nixpkgs#ffmpeg -c nice -n 19 $NODE render.mjs frames out/video_only.mp4 30
nix shell nixpkgs#ffmpeg -c ./mux.sh out ep02-every-rod-pilot
