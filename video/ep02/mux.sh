#!/usr/bin/env bash
# Mix narration + music/sfx bed, mux with the rendered video, grab a poster.   usage: ./mux.sh <ch>  → <ch>/out/ep02-<ch>.mp4
set -euo pipefail
cd "$(dirname "$0")"
CH=${1:?usage: ./mux.sh <chapter dir>}; OUT=$CH/out; NAME=ep02-$CH
ffmpeg -v error -y -i "$OUT/voice.wav" -i "$OUT/bed.wav" -filter_complex \
  "[1:a]volume=0.25[s];[0:a][s]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
  -ac 2 "$OUT/mix.wav"
ffmpeg -v error -y -i "$OUT/video_only.mp4" -i "$OUT/mix.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/$NAME.mp4"
[ -s "$OUT/poster.jpg" ] || ffmpeg -v error -y -ss "${POSTER_T:-6}" -i "$OUT/video_only.mp4" -frames:v 1 -q:v 3 -vf scale=1280:-1 "$OUT/poster.jpg"
echo "wrote $OUT/$NAME.mp4"
