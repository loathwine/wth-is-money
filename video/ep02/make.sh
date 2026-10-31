#!/usr/bin/env bash
# One-shot build of one chapter's video: narration → trim → timeline/audio → render → mux.
#   ./make.sh yap   → yap/out/ep02-yap.mp4 (and yap/out/poster.jpg)
# Needs the repo served at 127.0.0.1:8931 (python3 -m http.server 8931 in the repo root).
set -euo pipefail
cd "$(dirname "$0")"
CH=${1:?usage: ./make.sh <chapter dir>}
./tts.sh "$CH"                                            # only generates lines that don't exist yet
nix shell nixpkgs#ffmpeg -c ./trim.sh "$CH"
nix-shell -p "python3.withPackages(ps: [ps.numpy])" --run "python3 build.py $CH"
NODE=$(ls -d /nix/store/*-nodejs-2*/bin/node | head -1)
CH=$CH nix shell nixpkgs#ffmpeg -c nice -n 19 $NODE render.mjs frames "$CH/out/video_only.mp4" 30
nix shell nixpkgs#ffmpeg -c ./mux.sh "$CH"
