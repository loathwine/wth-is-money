# EP 01 · Intro movie · "How the market works": script notes

**Purpose:** before day 1 of the barter game, show a first-time player (no financial background, probably on a phone) how Ulm Hollow works in about 80 seconds: who they are, what home needs every night, what they make, how swapping works and why it is hard, what medicine is, what Gran's jar is, and the goal. It must **not** spoil the lesson: no cave, no Wren finding anything, no prices, no inflation, no zirnet. It ends on the question "Can you keep your family fed until the festival?".

This lives in the EP 02 pipeline as chapter dir `barter` (`video/ep02/barter/`): `./make.sh barter` → `barter/out/ep02-barter.mp4`, `poster.jpg`, `captions.vtt`. (PHONE-REDESIGN.md §8 names `video/ep01/intro/`; it was built here so it can reuse `scene.js`, `props.js`, `build.py` and `render.mjs` as they are. Copy `out/` wherever the game page wants it.)

The narration is in `narration.json`: 10 segments, 178 words, about 79 s with pads. One storyteller voice (`style` on every segment); i7 is the same voice, quieter.
Scenes are in `scenes.js` as `SC.<scene>(lt, d, t, s)`; `w(n)` is when word *n* (from 0, `text.split()`) is spoken. Music and sounds are in `cues.py` and use the same word times.

**Art:** everything comes from the game's own `lessons/01-barter/art.js` (loaded by `scene.html` as `window.Art`): `drawAlien` for You, Mira, Bob, Sela, Dov, Wren, Hesk; `drawFace` for Gran, Little Tam and Aunt Ola (moods ok / hungry / sick / worse); `iconCanvas` for the goods; `drawTree`. The hut, stalls (awning colours from the game), plaza tiles and standing stone are redrawn in `scenes.js` to match. Medicine is **always the driftcap mushroom icon**, never 💊, and is called "medicine" and "driftcap".

**Text:** everything on screen is ≥ 56 px on the 1920 frame (title 150 px), so it can be read on a phone. At most two new words-on-screen per beat; most labels repeat words the narrator is saying.

## Segments

| id | scene | narration | what is on screen |
|---|---|---|---|
| i1 | valley | This is Ulm Hollow, a village on a faraway world. Nobody here has heard of money. | Slow pan at dawn: swamp with bogwool tufts, the hut, the six stalls far off. Title: WTH IS MONEY? · EPISODE 1 / **ULM HOLLOW** / how the market works (the poster frame, t = 3 s). w(10): "No money here." |
| i2 | family | This is you, and your family: Gran, Little Tam and Aunt Ola. Each night, they need one lumfruit. | Inside the hut. You (big, left) with a "You" tag; Gran, Little Tam and Aunt Ola pop up behind the table on their names. w(16): a lumfruit drops into the bowl and glows. **1 LUMFRUIT EVERY NIGHT**. |
| i3 | bogwool | You raise bogwool, two a day. It keeps forever. But nobody can eat it. | Outside by the swamp. Two bogwool tufts pop out: **Bogwool**, **+2 A DAY**, **KEEPS FOREVER**. w(9): Little Tam tries a bite; the face turns hungry, a red ✗, **CAN'T EAT IT**. |
| i4 | market | So every morning, you go to the market and swap: your bogwool for someone's lumfruit. | The plaza with all six stalls, their goods on the counters; the names pop in. You walk in. w(9): camera moves in; bogwool flies to Mira, a lumfruit flies back. A card: **SWAP** bogwool → lumfruit. |
| i5 | refusal | But a swap only works if they want what you have. Today, Mira has lumfruit, but doesn't want bogwool. Now what? | Close on you and Mira (Bob's stall is shut today). Your thought: want lumfruit. Mira's thought: want "?", then bogwool with a ✗. Mira shakes; "NO THANKS"; a ✗ over the bogwool you hold out. w(19): **NOW WHAT?** and Little Tam's hungry face, "at home". |
| i6 | chain | Maybe Sela takes your bogwool for milk, and Mira takes the milk. Find the chain, and dinner is saved. | Mira's thought: want milk. You walk to Sela: bogwool → Sela, snarlmilk → you. Back to Mira: milk → Mira, lumfruit → you. w(12): the scene dims and **THE CHAIN** is spelled out: bogwool → Sela → milk → Mira → lumfruit. w(16): ✓ **DINNER SAVED!** |
| i7 | medicine | Sometimes someone at home falls sick. They need medicine: two driftcap mushrooms, from Dov. Each night without it, they get weaker. And a person can die. | Gran in bed; on "sick" her face turns green, a "sick" tag, and 3 **STRENGTH** pips appear. A panel: Dov, a glowing floating mushroom, **MEDICINE**, "driftcap mushrooms", a second mushroom and **× 2**, a "Dov" tag. w(14): the panel goes; the moon crosses the window; "EACH NIGHT WITHOUT MEDICINE: −1"; two pips drain with "−1", Gran's face gets worse. w(21): the room dims to one candle; the last pip flickers out. (No death shown: the game does that.) |
| i8 | jar | Gran's jar holds eight pink pentaja crystals: pretty, not much use. Saved for a rainy day. | A shelf with Gran's clay jar; Gran beside it. Eight pink crystals rise out of the jar into an arc, glinting. **8 PENTAJA**, "pretty, not much use", "Gran's jar". w(12): rain on the window, **FOR A RAINY DAY**. |
| i9 | goal | The harvest festival is on day twelve. Get there with everyone still at the table. | Night, lanterns in the stall colours. **HARVEST FESTIVAL**; the days tick **DAY 1 → DAY 12**. w(7): the family at a festival table with food, you beside them; "with everyone still at the table". |
| i10 | go | There is no money in Ulm Hollow. Not yet. Can you keep your family fed until the festival? | Back to the morning plaza, you in the middle. **NO MONEY.** then **NOT YET.** (gold). w(9): dims to a card: the three faces, "Can you keep your family fed / until the festival?", "DAY 1 STARTS NOW". Fade. |

## Facts it relies on (from `lessons/01-barter/sim.js` and PHONE-REDESIGN.md)
- You make bogwool at 2 a day; it never rots. Family needs 1 lumfruit a night.
- Mira grows lumfruit and wants snarlmilk (and driftcap); Sela makes snarlmilk and wants bogwool. So the chain shown is one the game really offers.
- One medicine = 2 driftcap (`SICK.DOSES = 2`), sold by Dov.
- Gran's jar: 8 pentaja (`JAR = 8`).
- Redesign: festival on day 12; 3 strength per family member, −1 per sick night without medicine.

If any of these change in the game, re-check i2, i3, i6, i7, i8, i9.

## Rebuild
```
cd video/ep02
flock /tmp/claude-1000/wth-chrome.lock bash -c 'python3 -m http.server 18964 --bind 127.0.0.1 --directory ../.. >/dev/null 2>&1 & S=$!; sleep 1;
  POSTER_T=3 SCENE_URL="http://127.0.0.1:18964/video/ep02/scene.html?ch=barter" PORT=19764 ./make.sh barter; kill $S'
```
`mux.sh` only writes `poster.jpg` if it is missing; move the old one away to regenerate it. A still: `scene.html?ch=barter&t=3`.
