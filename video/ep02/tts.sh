#!/usr/bin/env bash
# Generate one WAV per narration segment of a chapter (skips ones that already exist).   ./tts.sh <ch>
cd "$(dirname "$0")"
CH=${1:?usage: ./tts.sh <chapter dir>}
mkdir -p "$CH/audio"
STYLE="Warm, curious documentary narrator telling a surprising history story, in the spirit of Kurzgesagt or Veritasium: intimate, a hint of a smile, building intrigue. Brisk, confident pace with natural rhythm; no long pauses."
python3 -c 'import json,sys;[print(s["id"]+"\x1f"+s.get("style","")+"\x1f"+s["text"]) for s in json.load(open(sys.argv[1])) if "silent" not in s]' "$CH/narration.json" | while IFS=$'\x1f' read -r id style text; do
  [ -s "$CH/audio/$id.wav" ] && continue
  for try in 1 2 3; do
    python3 ~/.claude/skills/speak/speak.py --no-play --style "${style:-$STYLE}" -o "$CH/audio/$id.wav" "$text" >/dev/null 2>"$CH/audio/$id.err" && break
    sleep 20
  done
  echo "$id $( [ -s "$CH/audio/$id.wav" ] && echo ok || echo FAILED)"
done
echo ALL_DONE
