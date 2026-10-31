#!/usr/bin/env bash
# Trim leading/trailing silence from a chapter's narration clips: <ch>/audio/ID.wav → <ch>/audio/trim_ID.wav (only stale ones)
cd "$(dirname "$0")"
CH=${1:?usage: ./trim.sh <chapter dir>}
for f in "$CH"/audio/*.wav; do
  case "$(basename "$f")" in trim_*) continue;; esac
  b=$(basename "$f" .wav); o="$CH/audio/trim_$b.wav"
  [ "$o" -nt "$f" ] && continue
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse" "$o"
done
echo trimmed
