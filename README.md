# WTH Is Money?

Interactive lessons on where money comes from, why it breaks, and what makes it hard.
Play it (EP 01), watch it (EP 02, history), then read the theory (Menger → Mises).

**Beta:** play it at https://loathwine.github.io/wth-is-money/ (made for phones first). EP 01 and EP 02 (five chapters) are up.

## Run locally

Plain HTML, CSS and JS, no build step. GitHub Pages serves the repo root as is:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## EP 01 · The Barter Market

You raise bogwool in Ulm Hollow and need lumfruit and kettlestone. The goods are alien on purpose, so you bring no assumptions about what anything is worth. The goal: keep your family (Gran, Little Tam and Aunt Ola, three faces in the top bar) fed and healthy until the harvest festival on day 16, about 15 market days.

**Nothing makes a particular good "money" by script.** `lessons/01-barter/sim.js` runs every villager, and you, on the same rules:

- Each villager keeps a **notebook** of who accepted or refused which good (the player's notebook tab is the same data).
- A good is worth holding *to trade on* when the holder believes others take it (`saleability`), or knows a specific chain ("Bob sells kettlestone and Bob takes driftcap", `planVal`). That value is discounted by **rot**, **size** (pack space, max haul per swap) and **stock-to-flow** (is new supply diluting it?).
- Swaps need to be clearly worth it for both sides (`HASSLE`), so early on people refuse a lot.
- Whichever good wins that feedback loop becomes money. No good is named as money in the code, but the goods' traits are chosen (pentaja wins in 20 of 24 villages). The only scripted event is **Wren's cave**: on the night of day 7 or later, once pentaja has caught on (or by day 9), Wren's output jumps from 0.5 to 10 a day.
- **Your family gets sick** twice, on a schedule drawn from its own random stream (so it never shifts the village): once on the night of day 4–5, before the cave, and once 4–5 nights after it. The sick one needs 2 driftcap (Dov's medicine); until then you make 1 bogwool a day instead of 2 (none at all after two nights without medicine; it passes alone after 5). Two hungry nights in a row also halve your bogwool.
- **Gran's jar** holds 8 pentaja at home: trinkets Gran liked before anyone used them as money (Mises' regression theorem, in a jar). It isn't in your pack, so it can't pay for everyday swaps. It pays Dov for medicine while someone is sick, and after the cave it can swap into zirnet at Hesk's. The top bar shows what it buys at today's prices ("🫙 8 ≈ 8💊", a 5-day median of Dov's price), so you watch it shrink after the cave.

Story cards fire on what the simulation actually did (first refusal, first indirect trade, money emerging, someone sick, Wren, inflation, the switch to zirnet, the festival). The key cards end with an "In real life:" line about euros and dollars.

**Trading** happens at a table: the stall's goods on top, your pack at the bottom. Every card says what deal it gives you, and a ✗ means no deal. The "takes" strip shows everything the villager would accept, including goods you don't have. The line under the faces always says what home needs most tonight; tapping it runs the **🧭 route finder** (`findRoutes` in sim.js), which works out chains like "Dov: bogwool → pentaja, then Mira: pentaja → lumfruit", the same way you could from your notebook. FOLLOW marks the stalls on the map and walks you there. Nobody trades while you're at the market, so a route stays valid until you change your own pack.

Dev URL params (on `lessons/01-barter/`):

| param | does |
|---|---|
| `?seed=N` | a different village (default 6) |
| `?skip=N` | play N days on autopilot, skip the story cards |
| `&story=1` | with `skip`, still show story cards |
| `&talk=mira&pick=lum` | open a stall and select a good |
| `&tab=village` | open the village charts |
| `&talk=mira&find=lum` | open a stall and run the route finder |
| `&plan=ket&follow=1` | plan from the pack tab, follow the first route |

## EP 02 · Every Wren in History

Again and again in history, money has had a Wren: someone who found a cheaper way to make more of it. (The name is from the fable where the wren becomes king of the birds by riding on the eagle's back.) Each chapter is a narrated movie of about 2 minutes, a minigame of under a minute with a score, and a "Wren moment" card that ties it back to Ulm Hollow, with an "In real life:" line for euros and dollars.

| Ch | Page | The Wren |
|---|---|---|
| 1 | `index.html` + `yap.js` · Yap | O'Keefe's ship brings stones by the ten. Everyone knew each stone's story, so the new ones were priced lower and old savings stayed safe. |
| 2 | `beads.html` · glass beads | You are Wren: a trader with a crate of cheap beads. |
| 3 | `wampum.html` · wampum | Steel drills turn hours of work into minutes. |
| 4 | `cowries.html` · cowries | Ships full of cheaper shells from Zanzibar. |
| 5 | `rome.html` · Rome | The emperor makes the coins himself. |

`chapters.js` is shared by every chapter page: the chapter bar (✓ for finished chapters, saved in localStorage), the ♪ mute button, `Ep02.done(ch)`, `Ep02.next()` (the next chapter, for the final card's link) and `Ep02.playMode(on)`, which makes the game fill a phone's screen during a run. It also makes every `video.movie` play inline on iPhones, and swaps a movie that isn't rendered yet (404) for a short "still being made" note. Music and sound effects come from `assets/js/chip.js`.

The movies are built per chapter in `video/ep02/<ch>/` (`narration.json`, `scenes.js`, `cues.py`, `SCRIPT.md` with the fact check) by a shared engine in `video/ep02/`; each script takes the chapter dir:

```sh
cd video/ep02
./tts.sh yap                      # Gemini TTS, one wav per narration line (skips existing ones)
nix shell nixpkgs#ffmpeg -c ./trim.sh yap
nix-shell -p "python3.withPackages(ps: [ps.numpy])" --run "python3 build.py yap"   # timeline, voice, music + sfx bed, captions.srt + .vtt
./prev.sh yap [ids…]              # preview stills → yap/prev/sheet*.png (SCENE_URL, PORT)
./make.sh yap                     # the whole thing → yap/out/ep02-yap.mp4
```

Visuals and sound cues are timed to narration words (`word()` in `scene.js` and `build.py`), so if you change a line's word count, re-time its cues in both `scenes.js` and `cues.py`. A narration line may carry an optional `"cap"`: the caption text, when it should differ from what the voice reads (digits like "1871" instead of "eighteen seventy-one"). Words are still counted from `"text"`.

## Tuning the simulation

```sh
node tools/simstats.js 24      # across 24 villages: is pentaja money before the cave, zirnet after? when do the cards fire?
node tools/simrun.js 6 40      # day-by-day trace of one village
node tools/routebot.js 16      # can a route-finder player keep their family fed and healthy? (also --save=zir, --nojar, --set=you.rate=3)
node tools/drive.js <url> <outdir> steps.js   # click through the real game in headless Chrome, with screenshots
```

Current numbers (24 villages, up to the festival on day 16): the money card fires on day 4 (median); the cave comes on day 8 in 22 villages (day 9 in 2); pentaja is money before the cave in 20; the zirnet card fires in 22, a median 4 days after the cave (zirnet's acceptance passes 50% by the festival in 14); lumfruit's pentaja price rises about 9×. Gran's 8 pentaja buy 8 medicines before the cave (4 in some villages) and usually 1–2 by the festival.

A player using the route finder (`routebot.js 16`) goes hungry on about 13% of days before the cave and 17% after. Sickness is fair to that player: they got the medicine home on 16 of 22 sick days before the cave and 16 of 16 after, and nobody's illness got worse. Dov's medicine costs a median 1 pentaja before the cave and 3 after (2–6). The economy depends on your bogwool being scarce enough to be worth something: at 3 a day it piled up unsold all over the village and you starved after the cave.

## Layout

```
index.html                  series home + roadmap
assets/css/base.css         shared theme ("Bazaar" palette)
lessons/01-barter/
  sim.js                    the economy (also runs under Node)
  art.js                    pixel icons, alien villagers, village map, all drawn in code
  game.js                   input, drawing, trade dialog, notebook, charts, story cards
lessons/02-every-wren/
  index.html, yap.js        chapter 1 (Yap) and its canoe-run game
  beads/wampum/cowries/rome.html (+ .js)   chapters 2-5
  chapters.js               shared chapter bar, progress, mute, phone play mode
  lesson.css                shared chapter styles
  OUTLINE.md                the episode plan; *.DESIGN.md: minigame designs
assets/js/chip.js           WebAudio chiptune songs and sound effects
video/ep02/                 shared movie engine (scene.js, props.js, build.py, render.mjs, *.sh)
  <ch>/                     per chapter: narration.json, scenes.js, cues.py, SCRIPT.md, audio/, out/
tools/                      headless sim runners, drive.js (phone-emulated screenshots)
```

## Roadmap

- **EP 02 · Every Wren in History** (beta): Yap's rai stones (O'Keefe), glass beads, wampum, cowries, Roman debasement. Next: a gold finale chapter ("is there money without a cave?"), and tightening each movie towards 2 minutes.
- **EP 03 · Why Gold?**: stock-to-flow: why gold was the money that was hardest to flood (and why even it got flooded a little, in the gold rushes).
- **EP 04 · The Theory of Money and Credit**: Mises (1912). The regression theorem (which the EP 01 notebooks already act out), fiduciary media, the business cycle.
