# WTH Is Money?

Interactive lessons on where money comes from, why it breaks, and what makes it hard.
Play it (EP 01), watch it (EP 02, history), then read the theory (Menger → Mises).

**Beta:** play it at https://loathwine.github.io/wth-is-money/ (made for phones first). EP 01 and EP 02 (six chapters) are up.

## Run locally

Plain HTML, CSS and JS, no build step. GitHub Pages serves the repo root as is:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## EP 01 · The Barter Market

You raise bogwool in Ulm Hollow and need lumfruit and kettlestone. The goods are alien on purpose, so you bring no assumptions about what anything is worth. The goal: reach the harvest festival on **day 13** (12 market days, about 9 minutes) with your whole family (Gran, Little Tam and Aunt Ola) still at the table.

**Nothing makes a particular good "money" by script.** `lessons/01-barter/sim.js` runs every villager, and you, on the same rules:

- Each villager keeps a **notebook** of who accepted or refused which good (on desktop the NOTEBOOK tab shows the player's; phones hide it).
- A good is worth holding *to trade on* when the holder believes others take it (`saleability`), or knows a specific chain ("Bob sells kettlestone and Bob takes driftcap", `planVal`), and then only for what it buys at this morning's asking prices (`postAsks`: when Bob asks 5 pentaja for a kettlestone, one pentaja gets you a fifth of one). That value is discounted by **rot**, **size** (pack space, max haul per swap) and **stock-to-flow** (is new supply diluting it?).
- Swaps need to be clearly worth it for both sides (`HASSLE`), so early on people refuse a lot.
- Whichever goods win that feedback loop work as money. Pentaja usually leads, but it isn't alone: zirnet, and sometimes lumfruit, kettlestone or bogwool, also pass from hand to hand, and the money card says so. No good is named as money in the code, but the goods' traits are chosen.
- You start with no lumfruit, so day 1 needs a swap (a four-step pointer tutorial, once per device: tap the seller, TRADE, see it in your pack, GO HOME).

**The story arc** (`ARC` in sim.js; the player should go in blind, so nothing before a beat hints at it, and the home page, intro card and intro movie mention neither the jar, the storm nor the cave):

1. **Barter.** Gran falls sick on night 3. Nobody knows about any jar yet, so the medicine has to come out of your pack (Dov needs bogwool).
2. **The money card** (`w.moneyDay`): the first morning from day 5 on when, on each of the last 2 evenings, at least half the villagers with no use for pentaja would take it as payment (`stats().moneyness`); on day 6 it comes anyway. It says more and more villagers take pentaja without needing it, and names the other good that passed hand to hand most in the last 3 days' swaps (`Sim.moneyNote`).
3. **Gran's reveal**, that evening: she brings out a jar of 8 pentaja she picked up all her life "because they're pretty" (they were worth something as trinkets before anyone used them as money: Mises' regression theorem, in a jar). It's a surprise to the family. From then on the jar chip is in the pack strip and the jar is on the shelf at home.
4. **The storm**, the next morning, for 2 market days, announced only when it hits: the river floods the bogwool pasture (no bogwool on storm nights) and gets into the hut (the lumfruit and snarlmilk in your pack spoil). Only Mira and Dov come, and in the storm nobody takes anything but crystals (`evalDeal`). A hungry storm night is cold: everyone but the one who gets the crust loses 2 strength, which can kill. Gran's jar may pay Mira for food in the storm (the jar first, crystals in your pack top it up; one crystal can buy up to 3 lumfruit). The market is grey and rainy, the evening window streams with rain, and the family says what the jar was for.
5. **Wren's cave**: the storm tears open the hillside, and on its last night Wren finds a cave of pentaja (the window glows pink). From the next morning Wren digs 20 a day and spends them at once (a feast of lumfruit, and Dov's medicine), so Mira's and Dov's prices rise first. Dov won't let a driftcap go for next to nothing (a morning's foraging, `worth`), so the medicine costs 2–3 pentaja before the cave and about 15 by the festival.
6. **Aunt Ola falls sick** 2 nights after the cave. That evening Gran (or Tam) compares: "In the storm, 2 of my crystals fed us for two days. Today one lumfruit costs 4 crystals." The "Your pentaja buys less" card comes 2–4 days after the cave; the first evening after it, while two market days are left, Ola or Gran asks whether to move the jar into zirnet (YES makes the next morning's goal "take the jar to Hesk", and Hesk comes).

**Your family can get sick, weak, and die.** Each member has 3 strength (pips under their faces). Every night, after the medicine and the meal: fed and not sick +1; sick with no medicine tonight −1; hungry and not given the last crust −1, but hunger alone never goes below 1, except in the storm (−2, and it can kill). At 0 they die. So untreated sickness kills on the 3rd night, the 2nd if they're starving too. Sickness never passes on its own. Little Tam never falls sick. The cure is 2 **driftcap**, the floating medicine mushroom Dov sells (always shown with the mushroom icon). While someone is sick you make 1 bogwool a day instead of 2 (none after two nights without medicine). Mercy rule: once the sick one has lost any strength, Dov always comes to market (so Dov can be away one day, never two), and on their last night (strength 1) Dov keeps the medicine back for you. On a hungry night the evening first asks **who gets the last crust** (in the storm the choice can decide who lives).

**Gran's jar** isn't in your pack, so it can't pay for everyday swaps. It pays for medicine while someone is sick, for food in the storm, and after the cave it can swap into zirnet at Hesk's. The pack strip shows what it buys at today's prices in mushrooms ("🫙 8 ≈ 5 🍄", a 5-day median of Dov's price; after the cave that price only ratchets up from its pre-cave level, so a lucky day at Dov's can't make the jar look richer), so you watch it shrink after the cave (typically to 1 or 0).

**The phone screen** (390×844 is the main target): the family and the day on top, a one-line status of what home needs most (tap = 🧭 HELP), the village, then an always-visible **pack strip** (tonight's needs first, with "need 1" / "✓ tonight" badges, and Gran's jar on the right) and the two buttons **🧭 HELP** and **🏠 GO HOME**. HELP runs the route finder (`findRoutes` in sim.js) and walks you along the cheapest chain of swaps ("Dov: bogwool → pentaja, then Mira: pentaja → lumfruit"). GO HOME is the only way to end the day; with nothing for tonight it asks for a second tap. The trade table is a top sheet that ends above the strip. There is no AUTO, no notebook and no trade log on a phone. Desktop keeps the PACK / NOTEBOOK / VILLAGE side panel and the trade log, and gets the strip and buttons too.

**Every evening is at home** (`#evening`): a pixel picture of the hut (`Art.drawHome`: the family at the table, the sick one in bed, the bowl, Gran's jar (on the table the night she shows it, then on the shelf, one crystal per pentaja), rain on the window in the storm, pink glints after the cave, an empty chair and a candle after a death), then 1–3 lines of family dialogue picked by `lessons/01-barter/evening.js` from what the sim did that day (sickness, hunger, the reveal, the storm, the cave, real price rises, the jar shrinking, the first refusal), and one muted facts line. On a hungry night it first asks **who gets the last crust**. The night someone dies is quiet: one line, the empty chair, the music stops.

Story cards fire on what the simulation actually did (money emerging, the storm, Wren, inflation, the switch to zirnet, the festival; on desktop also the first refusal and first indirect trade, which on phones are a line in the trade sheet). The festival screen counts nights fed, who made it and sicknesses cured, says what the jar bought in the storm and what it buys now ("Gran's jar: 6 pentaja. Before Wren's cave: 6 🍄 medicine. Now: 0 🍄."), and remembers anyone lost (in the storm, or with the jar's lost value). The key cards end with an "In real life:" line about euros and dollars.

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
| `&eve=1` | with `skip`, show the last night's evening scene (for screenshots) |
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
| 6 | `gold.html` · Gold? (finale) | Is there money without a cave? Double five monies from their caves, then try gold: all twelve years of the 1849 rush reach only ×1.36. |

`chapters.js` is shared by every chapter page: the chapter bar (✓ for finished chapters, saved in localStorage), the ♪ mute button, `Ep02.done(ch)`, `Ep02.next()` (the next chapter, for the final card's link) and `Ep02.playMode(on)`, which makes the game fill a phone's screen during a run (and turns it sideways where the phone allows; `Ep02.playMode(on, { lock: false })` keeps it portrait, as gold's game does). It also makes every `video.movie` play inline on iPhones, and swaps a movie that isn't rendered yet (404) for a short "still being made" note. Music and sound effects come from `assets/js/chip.js`.

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
node tools/simstats.js 40      # across 40 villages: when do the money card, the reveal, the storm and the cave come? how far does the jar shrink?
node tools/simrun.js 6 40      # day-by-day trace of one village
node tools/routebot.js 40      # can a route-finder player keep their family alive through the storm and after the cave? (also --lazy, --nojar, --crust=tam, --save=zir)
node tools/drive.js <url> <outdir> steps.js   # click through the real game in headless Chrome, with screenshots
```

Current numbers (40 villages, up to the festival on day 13, `simstats.js 40`): the money card comes on day 5 in 35 villages and day 6 in 5 (in 35 pentaja was steadily taken by then; the other 5 get it on day 6 anyway). The other good it names as passing hand to hand: lumfruit 14, zirnet 10, kettlestone 6, bogwool 5, driftcap 3, none 2. Gran's reveal is the same evening, the storm the next two market days (days 6–7 in 35 villages, 7–8 in 5), the cave the morning after (day 8 in 35, day 9 in 5), and Ola falls sick on night 10 (11). Lumfruit's pentaja price rises about 11× by the festival. Dov's medicine costs 2–3 pentaja before the cave and a median 15 at the festival, so 8 pentaja buy 5 mushrooms before the cave and a median 1 at the festival: a third or less of what they bought in 35 of 40 villages (in about half already on the night Ola falls sick).

A careful player who uses the route finder, medicine first (`routebot.js 40`), loses nobody in 39 of 40 villages (in seed 29 Dov wants 5 bogwool for Gran's first medicine, more than a sick household can make). In the storm they go hungry on no night at all: the jar pays 1–2 crystals for food in 30 of 40 villages (up to 5). After the cave they have at least one hard night (hungry, or the sick one down to 1 strength) in 22 of 40 and go hungry on about 15% of nights (9% before the storm). Without the jar (`--nojar`) the storm kills someone in 40 of 40 villages. A careless player who buys only lumfruit and never medicine and never opens the jar (`routebot.js 40 --lazy`) loses someone in 40 of 40 (Gran's sickness, and someone in the storm in 33). Giving the crust to Tam instead of the sick one (`--crust=tam`) costs a life in 3 of 40. The default village (seed 39) has Dov away the day after Gran falls sick, a hungry night when Gran shows her jar, 2 crystals from it feeding the family through the storm, and a jar that buys 6 mushrooms before the cave and 0 at the festival. The economy depends on your bogwool being scarce enough to be worth something: at 3 a day it piled up unsold all over the village and you starved after the cave.

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
  beads/wampum/cowries/rome/gold.html (+ .js)   chapters 2-6
  chapters.js               shared chapter bar, progress, mute, phone play mode
  lesson.css                shared chapter styles
  OUTLINE.md                the episode plan; *.DESIGN.md: minigame designs
assets/js/chip.js           WebAudio chiptune songs and sound effects
video/ep02/                 shared movie engine (scene.js, props.js, build.py, render.mjs, *.sh)
  <ch>/                     per chapter: narration.json, scenes.js, cues.py, SCRIPT.md, audio/, out/
tools/                      headless sim runners, drive.js (phone-emulated screenshots)
```

## Roadmap

- **EP 02 · Every Wren in History** (beta): Yap's rai stones (O'Keefe), glass beads, wampum, cowries, Roman debasement, and a gold finale ("is there money without a cave?"). Next: tighten each movie towards 2 minutes.
- **EP 03 · Why Gold?**: stock-to-flow: why gold was the money that was hardest to flood (and why even it got flooded a little, in the gold rushes).
- **EP 04 · The Theory of Money and Credit**: Mises (1912). The regression theorem (which the EP 01 notebooks already act out), fiduciary media, the business cycle.
