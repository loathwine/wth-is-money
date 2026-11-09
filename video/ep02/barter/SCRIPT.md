# EP 01 · Intro movie · "How the market works": script notes

**Purpose:** before day 1 of the barter game, show a first-time player (no financial background, probably on a phone) how Ulm Hollow works in about 64 seconds: who they are, what home needs every night, what they make, how swapping works and why it is hard, what medicine is, and the goal. It must **not** spoil the lesson, so the player goes in blind: no cave, no Wren finding anything, no prices, no inflation, no hint of which good becomes money, and **no Gran's jar** (the jar of pentaja is a surprise Gran reveals mid-game). No festival day number either: the game's length may change, so it is just "the harvest festival". It ends on the question "Can you keep your family fed until the festival?".

This lives in the EP 02 pipeline as chapter dir `barter` (`video/ep02/barter/`): `./make.sh barter` → `barter/out/ep02-barter.mp4`, `poster.jpg`, `captions.vtt`. (PHONE-REDESIGN.md §8 names `video/ep01/intro/`; it was built here so it can reuse `scene.js`, `props.js`, `build.py` and `render.mjs` as they are. Copy `out/` wherever the game page wants it.)

The narration is in `narration.json`: 9 segments (ids i1–i7, i9, i10; i8 was removed), 64.2 s. One storyteller voice (`style` on every segment, the same on all of them, i7 included).
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
| i7 | medicine | Sometimes someone at home gets sick. Then they need medicine: two driftcap mushrooms from Dov. | Gran in bed (evening, a candle). On "sick" her face turns green and a "sick" tag pops. w(6): a panel: Dov, a floating driftcap, **MEDICINE** (w9), a second mushroom and **× 2** (w10), "driftcap mushrooms" (w11), a "Dov" tag (w14). Kept short and factual on purpose: no strength pips, no dimming, no "can die", no ominous music (the village tune, slower). The game explains strength when it happens. |
| i9 | goal | The harvest festival is coming soon. Get there with everyone still at the table. | Night, lanterns in the stall colours. **HARVEST FESTIVAL** pops in the middle, "coming soon" under it (w4). w(6): the title rises, the family sits at a festival table with food, you beside them; "with everyone still at the table" (w8). No day counter. |
| i10 | go | There is no money in Ulm Hollow. Not yet. Can you keep your family fed until the festival? | Back to the morning plaza, you in the middle. **NO MONEY.** then **NOT YET.** (gold). w(9): dims to a card: the three faces, "Can you keep your family fed / until the festival?", "DAY 1 STARTS NOW". Fade. |

## Facts it relies on (from `lessons/01-barter/sim.js` and PHONE-REDESIGN.md)
- You make bogwool at 2 a day; it never rots. Family needs 1 lumfruit a night.
- Mira grows lumfruit and wants snarlmilk (and driftcap); Sela makes snarlmilk and wants bogwool. So the chain shown is one the game really offers.
- One medicine = 2 driftcap (`SICK.DOSES = 2`), sold by Dov.
- Gran's jar (8 pentaja, `JAR`) is deliberately **not** in the movie: the game reveals it mid-way.
- The festival is not given a day number in the movie. Strength is not shown either (the game introduces it).

If any of these change in the game, re-check i2, i3, i6, i7, i9.

## Changes after the playthrough feedback
- **i8 (Gran's jar) removed**, with its scene and the `jar()` helper: the jar is now a mid-game reveal, and showing it here made pentaja look like established money before it emerges as money.
- **i7 shortened and calmed:** was "...Each night without it, they get weaker. And a person can die." with draining strength pips, a moving moon, the room dimming to one candle and a low drone. Now one factual sentence pair in the normal storyteller voice, a plain scene and the village tune.
- **i9:** "on day twelve" → "coming soon"; the DAY 1 → DAY 12 counter is gone.
- Only i7 and i9 were re-voiced.

## Rebuild
```
cd video/ep02
flock /tmp/claude-1000/wth-chrome.lock bash -c 'python3 -m http.server 18964 --bind 127.0.0.1 --directory ../.. >/dev/null 2>&1 & S=$!; sleep 1;
  POSTER_T=3 SCENE_URL="http://127.0.0.1:18964/video/ep02/scene.html?ch=barter" PORT=19764 ./make.sh barter; kill $S'
```
`mux.sh` only writes `poster.jpg` if it is missing; move the old one away to regenerate it. A still: `scene.html?ch=barter&t=3`.
