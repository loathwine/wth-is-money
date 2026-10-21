# WTH Is Money?

Interactive lessons on where money comes from, why it breaks, and what makes it hard.
Play it (EP 01), watch it (EP 02, history), then read the theory (Menger → Mises).

**Beta:** play it at https://loathwine.github.io/wth-is-money/ (made for phones first). EP 01 and the first chapter of EP 02 are up.

## Run locally

Plain HTML, CSS and JS, no build step. GitHub Pages serves the repo root as is:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## EP 01 · The Barter Market

You raise bogwool in Ulm Hollow and need lumfruit and kettlestone. The goods are alien on purpose, so you bring no assumptions about what anything is worth.

**Nothing makes a particular good "money" by script.** `lessons/01-barter/sim.js` runs every villager, and you, on the same rules:

- Each villager keeps a **notebook** of who accepted or refused which good (the player's notebook tab is the same data).
- A good is worth holding *to trade on* when the holder believes others take it (`saleability`), or knows a specific chain ("Bob sells kettlestone and Bob takes driftcap", `planVal`). That value is discounted by **rot**, **size** (pack space, max haul per swap) and **stock-to-flow** (is new supply diluting it?).
- Swaps need to be clearly worth it for both sides (`HASSLE`), so early on people refuse a lot.
- Whichever good wins that feedback loop becomes money. The only scripted event is **Rod's cave**: once pentaja has caught on (or by day 28), Rod's output jumps from 0.5 to 10 a day.

Story cards fire on what the simulation actually did (first refusal, first indirect trade, money emerging, Rod, inflation, the switch to zirnet).

**Trading** happens at a table: the stall's goods on top, your pack at the bottom. Every card says what deal it gives you, and a ✗ means no deal. The "takes" strip shows everything the villager would accept, including goods you don't have. The **🧭 route finder** (`findRoutes` in sim.js) works out chains like "Dov: bogwool → pentaja, then Mira: pentaja → lumfruit", the same way you could from your notebook. FOLLOW marks the stalls on the map and walks you there. Nobody trades while you're at the market, so a route stays valid until you change your own pack.

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

## Tuning the simulation

```sh
node tools/simstats.js 24 30   # across 24 villages: is pentaja money before the cave, zirnet after?
node tools/simrun.js 6 40      # day-by-day trace of one village
node tools/routebot.js 8 32 --save=zir   # can a route-finder player feed their family? (also --set=you.rate=3)
node tools/drive.js <url> <outdir> steps.js   # click through the real game in headless Chrome, with screenshots
```

Current numbers (24 villages, 30 days): pentaja becomes money before the cave in 20, the village switches to zirnet afterwards in 20–21, and lumfruit's pentaja price rises about 6×.

A player using the route finder goes hungry on about 11% of days before the cave. After it, a player who saved spare bogwool as zirnet goes hungry about 14% of the time, while one who saved pentaja or nothing goes hungry about a third of the time. The economy depends on your bogwool being scarce enough to be worth something: at 3 a day it piled up unsold all over the village and you starved after the cave.

## Layout

```
index.html                  series home + roadmap
assets/css/base.css         shared theme ("Bazaar" palette)
lessons/01-barter/
  sim.js                    the economy (also runs under Node)
  art.js                    pixel icons, alien villagers, village map, all drawn in code
  game.js                   input, drawing, trade dialog, notebook, charts, story cards
tools/                      headless sim runners
```

## Roadmap

- **EP 02 · Every Rod in History**: Rai stones (O'Keefe), aggry beads, wampum, cowries, Roman debasement. Narrated shorts plus mini-games, each tied back to Rod.
- **EP 03 · Why Gold?**: stock-to-flow.
- **EP 04 · The Theory of Money and Credit**: Mises (1912). The regression theorem (which the EP 01 notebooks already act out), fiduciary media, the business cycle.
