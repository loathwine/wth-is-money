#!/usr/bin/env bash
# Generate one WAV per narration segment (skips ones that already exist).
cd "$(dirname "$0")"
STYLE="Warm, curious documentary narrator telling a surprising history story, in the spirit of Kurzgesagt or Veritasium: intimate, a hint of a smile, building intrigue. Brisk, confident pace with natural rhythm; no long pauses."
python3 -c 'import json;[print(s["id"]+"\x1f"+s.get("style","")+"\x1f"+s["text"]) for s in json.load(open("narration.json")) if "silent" not in s]' | while IFS=$'\x1f' read -r id style text; do
  [ -s "audio/$id.wav" ] && continue
  for try in 1 2 3; do
    python3 ~/.claude/skills/speak/speak.py --no-play --style "${style:-$STYLE}" -o "audio/$id.wav" "$text" >/dev/null 2>"audio/$id.err" && break
    sleep 20
  done
  echo "$id $( [ -s audio/$id.wav ] && echo ok || echo FAILED)"
done
echo ALL_DONE
