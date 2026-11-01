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

You raise bogwool in Ulm Hollow and need lumfruit and kettlestone. The goods are alien on purpose, so you bring no assumptions about what anything is worth. The goal: reach the harvest festival on **day 12** (11 market days, about 8 minutes) with your whole family (Gran, Little Tam and Aunt Ola) still at the table.

**Nothing makes a particular good "money" by script.** `lessons/01-barter/sim.js` runs every villager, and you, on the same rules:

- Each villager keeps a **notebook** of who accepted or refused which good (on desktop the NOTEBOOK tab shows the player's; phones hide it).
- A good is worth holding *to trade on* when the holder believes others take it (`saleability`), or knows a specific chain ("Bob sells kettlestone and Bob takes driftcap", `planVal`), and then only for what it buys at this morning's asking prices (`postAsks`: when Bob asks 5 pentaja for a kettlestone, one pentaja gets you a fifth of one). That value is discounted by **rot**, **size** (pack space, max haul per swap) and **stock-to-flow** (is new supply diluting it?).
- Swaps need to be clearly worth it for both sides (`HASSLE`), so early on people refuse a lot.
- Whichever good wins that feedback loop becomes money. No good is named as money in the code, but the goods' traits are chosen. The only scripted event is **Wren's cave**: on the night of day 5 or later, once pentaja has caught on (or by day 6), Wren's output jumps from 0.5 to 10 a day, and Wren spends them at once (a feast of lumfruit, and Dov's medicine). So the new crystals reach Mira and Dov first, and their prices rise first. Dov won't let a driftcap go for next to nothing (a morning's foraging, `worth`), so the medicine costs 2–3 pentaja before the cave and 10 or more after it.
- You start with no lumfruit, so day 1 needs a swap (a four-step pointer tutorial, once per device: tap the seller, TRADE, see it in your pack, GO HOME).

**Your family can get sick, weak, and die.** Each member has 3 strength (pips under their faces). Every night, after the medicine and the meal: fed and not sick +1; sick with no medicine tonight −1; hungry and not given the last crust −1, but hunger alone never goes below 1. At 0 they die. So untreated sickness kills on the 3rd night, the 2nd if they're starving too. Sickness never passes on its own. Gran falls sick on night 3 (before the cave, when the jar pays easily), Aunt Ola on night 8, two nights after the cave (night 9 when the cave comes late), when the jar buys a third of what it did, or less. Little Tam never falls sick. The cure is 2 **driftcap**, the floating medicine mushroom Dov sells (always shown with the mushroom icon). While someone is sick you make 1 bogwool a day instead of 2 (none after two nights without medicine). Mercy rule: once the sick one has lost any strength, Dov always comes to market (so Dov can be away one day, never two), and on their last night (strength 1) Dov keeps the medicine back for you.

**Gran's jar** holds 8 pentaja at home: trinkets Gran liked before anyone used them as money (Mises' regression theorem, in a jar). It isn't in your pack, so it can't pay for everyday swaps. It pays Dov for medicine while someone is sick (crystals in your pack can top it up, and the 🧭 helper may first swap bogwool for the missing crystals), and after the cave it can swap into zirnet at Hesk's: on the first evening after the "Your pentaja buys less" card, if at least two market days are left, Ola or Gran asks whether to move it; YES makes the next morning's goal "take the jar to Hesk", and Hesk comes to market. The pack strip shows what it buys at today's prices in mushrooms ("🫙 8 ≈ 5 🍄", a 5-day median of Dov's price; after the cave that price only ratchets up from its pre-cave level, so a lucky day at Dov's can't make the jar look richer), so you watch it shrink after the cave (typically to 1).

**The phone screen** (390×844 is the main target): the family and the day on top, a one-line status of what home needs most (tap = 🧭 HELP), the village, then an always-visible **pack strip** (tonight's needs first, with "need 1" / "✓ tonight" badges, and Gran's jar on the right) and the two buttons **🧭 HELP** and **🏠 GO HOME**. HELP runs the route finder (`findRoutes` in sim.js) and walks you along the cheapest chain of swaps ("Dov: bogwool → pentaja, then Mira: pentaja → lumfruit"). GO HOME is the only way to end the day; with nothing for tonight it asks for a second tap. The trade table is a top sheet that ends above the strip. There is no AUTO, no notebook and no trade log on a phone. Desktop keeps the PACK / NOTEBOOK / VILLAGE side panel and the trade log, and gets the strip and buttons too.

**Every evening is at home** (`#evening`): a pixel picture of the hut (`Art.drawHome`: the family at the table, the sick one in bed, the bowl, Gran's jar on the shelf with one crystal per pentaja, pink glints in the window after the cave, an empty chair and a candle after a death), then 1–3 lines of family dialogue picked by `lessons/01-barter/evening.js` from what the sim did that day (sickness, hunger, the cave, real price rises, the jar shrinking, the first refusal), and one muted facts line. On a hungry night it first asks **who gets the last crust**. The night someone dies is quiet: one line, the empty chair, the music stops.

Story cards fire on what the simulation actually did (money emerging, Wren, inflation, the switch to zirnet, the festival; on desktop also the first refusal and first indirect trade, which on phones are a line in the trade sheet). The festival screen counts nights fed, who made it and sicknesses cured, says in one sentence what the jar buys ("Gran's jar: 8 pentaja. Before Wren's cave: 5 🍄 medicine. Now: 1 🍄."), and remembers anyone lost (with the jar's lost value). The key cards end with an "In real life:" line about euros and dollars.

**The intro movie:** the first screen offers "▶ WATCH: HOW THE MARKET WORKS (1 min)", playing `video/ep02/barter/out/ep02-barter.mp4` inline (poster and captions from the same folder; captions are drawn under the video so they're readable on a phone), or "SKIP, LET ME PLAY". If the movie isn't there, the option quietly disappears.

Dev URL params (on `lessons/01-barter/`):

| param | does |
|---|---|
| `?seed=N` | a different village (default 39) |
| `?skip=N` | play N days on autopilot (it shops like the route finder, medicine first), skip the story cards and the tutorial |
| `&story=1` | with `skip`, still show story cards |
| `?tut=1` / `?tut=0` | force the day-one tutorial on / off (normally once per device) |
| `&talk=mira&pick=lum` | open a stall and select a good |
| `&tab=village` | open the village charts (desktop) |
| `&talk=mira&find=lum` | open a stall and run the route finder |
| `&plan=ket&follow=1` | run the route finder and follow the first route |

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
node tools/routebot.js 40      # can a route-finder player keep their family fed, healthy and alive? (also --lazy, --nojar, --crust=tam, --save=zir)
node tools/drive.js <url> <outdir> steps.js   # click through the real game in headless Chrome, with screenshots
```

Current numbers (40 villages, up to the festival on day 12, `simstats.js 40`): the money card fires on day 4 (median); the cave comes on day 6 in 37 villages (day 7 in 3); pentaja is money before the cave in 35; lumfruit's pentaja price rises about 11× by the festival. Dov's medicine costs 2–3 pentaja before the cave and a median 13 at the festival, so Gran's 8 pentaja buy 5 mushrooms before the cave (8 in some villages) and a median 1 at the festival: a third or less of what they bought in 34 of 40 villages. The village-wide switch to zirnet mostly doesn't finish in 11 days (the zirnet card fires in 7 of 40), which is why the zirnet idea also lives in the evening dialogue and the jar choice. The second sickness comes on night 8 (9 when the cave is late).

A careful player who uses the route finder, medicine first (`routebot.js 40`), loses nobody in 40 of 40 villages, but after the cave has at least one hard night (hungry, or the sick one down to 1 strength) in 28 of 40, and goes hungry on about 3% of nights before the cave and 16% after. A careless player who buys only lumfruit and never medicine (`routebot.js 40 --lazy`) loses Gran on night 6 in 40 of 40. Without the jar (`--nojar`) the careful player loses someone in 8 of 40 (5 of them Ola, after the cave): the jar still matters, even shrunken, because crystals in the pack can top it up. Giving the crust to Tam instead of the sick one (`--crust=tam`) costs a life in 2 of 40. The default village (seed 39) has Dov away while Gran is sick, lean nights after the cave, and a jar that ends up buying 1 mushroom. The economy depends on your bogwool being scarce enough to be worth something: at 3 a day it piled up unsold all over the village and you starved after the cave.

## Layout

```
index.html                  series home + roadmap
assets/css/base.css         shared theme ("Bazaar" palette)
lessons/01-barter/
  sim.js                    the economy (also runs under Node)
  art.js                    pixel icons, alien villagers, village map, all drawn in code
  game.js                   input, drawing, trade sheet, pack strip, evening scene, tutorial, story cards
  evening.js                what the family says at home each night (all the copy, and the trigger picker)
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
