# EP 02 · Every Rod in History: script notes (PILOT: hook + chapter 1, Yap)

The narration lives in `narration.json` (12 lines, about 2:40). This is the pilot for checking the style, voice and music before the other chapters are written.

Build: `./make.sh` → `out/ep02-every-rod.mp4`. It needs the site served at 127.0.0.1:8931. To check stills without a full render: `./prev.sh [ids…]` → `prev/sheet*.png`.
Pipeline: `tts.sh` (Gemini TTS via the speak skill) → `trim.sh` → `build.py` (timeline, voice, chiptune music ducked under the voice, sound cues, captions) → `render.mjs` (headless Chrome → ffmpeg) → `mux.sh`.
Visuals are timed to words (`TR.word` in `scene.js`, mirrored by `word()` in `build.py`), so sound cues and visuals land together.

## Fact check

| Line | Claim | Source / note |
|---|---|---|
| y1 | Yapese sailed to Palau to quarry the stones. | Furness, *The Island of Stone Money* (1910), ch. VII: "quarried and shaped in Babelthuap, one of The Pelao Islands … brought to Uap by some venturesome native navigators, in canoes and on rafts". |
| y1 | "~450 km of open ocean" (on screen) | Yap–Palau (Koror) is roughly 450 km. Furness says "four hundred miles", which is an overestimate. |
| y2 | Shell tools; not everyone made it back. | Bryan, *Island Money* (Cleveland Fed, 2004): "no longer restricted by shell tools and canoes". Furness: rafts lost in storms (the sunken-stone story). "Not everyone made it back" is a fair summary, but there's no casualty figure. |
| y3 | Value from size, whiteness and the cost of getting it home; a stone about two feet across = a big pig, or 50 baskets of food. | Furness ch. VII: limestone "must be fine and white and of close grain"; "a three span *fei* … ought to purchase fifty 'baskets' of food … or an eighty or a hundred pound pig". Bryan: three spans ≈ 25 inches. Bryan: valued by "the costs associated with bringing them to the island". |
| y4 | Big stones were never moved; ownership was common knowledge; a sunken stone still counted. | Furness ch. VII, verbatim story (told to Furness by Fatumak). |
| ~~y5~~ | *Cut from the pilot (it jumped forward to 1899 before O'Keefe's 1871). Moved to the gold finale.* German fines by painting black crosses; the roads got repaired. | Furness ch. VII. Germany bought the Carolines from Spain in 1899 (Furness writes 1898) and held them until 1914. |
| y6 | O'Keefe was shipwrecked in 1871 and came back with a ship and iron tools; stones exchanged for copra (dried coconut). | UGA, David Dean O'Keefe collection; Furness ch. VII (schooner, "dried coconut and bèche-de-mer"). The narration simplifies "copra and sea cucumber" to "dried coconut". |
| y7 | Rare in 1840 → more than 13,000 by 1929; the biggest twelve feet across. | Bryan (2004), citing Gillilland (1975): "very rare in 1840 to … more than 13,000 … by 1929"; the largest grew "from four feet in diameter to the colossal 12-foot stones". |
| y8 | O'Keefe's stones traded for less than older ones. | Bryan (2004): "traded on the island at an appropriately reduced value relative to the older stones gotten at much greater cost", citing Gillilland (1975). ⚠️ **Furness (1910) saw them as "genuine wealth"** and says fei aren't prized merely for being old. Hence "by later accounts" in the narration and the source credit on screen. |

## Open questions
- Voice, music and pace: is this the right feel for the rest of the episode?
- Should the hook's "Remember Rod?" assume viewers played EP 01, or work for YouTube viewers who didn't (as it does now, roughly)?
