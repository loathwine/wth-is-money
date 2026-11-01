# EP 01 · Phone redesign spec

Status: spec, not built yet. Target: 390×844 portrait. Desktop follows wherever it doesn't cost extra.
Source: the user's own phone playtest ("I didn't finish it"), plus a replay of the same game in phone emulation (`PHONE=1 tools/drive.js`, seed 6). (Note: the game now defaults to seed 39 and the jar numbers changed; see the README EP 01 section for current numbers.)

The goal is unchanged: people with no financial education should *feel* what money is and what inflation does.
The redesign does four things:

1. **Fewer screens.** No sheets, no AUTO, no notebook on phone.
2. **Always visible.** The pack, tonight's needs and GO HOME stay on screen the whole time.
3. **A family to care about.** Every evening you see them at home. They can get weak, and someone can die.
4. **A shorter game.** 11 market days (about 8 minutes) instead of 15, with a 70-second movie first.

---

## 0. What a first-time phone player sees today

| Moment | What happens | Problem |
|---|---|---|
| Intro card | A wall of text (bogwool, lumfruit, kettlestone, jar, goal, festival) | Too much to remember. Nothing about medicine. |
| Day 1 | Six stalls, a burst of speech bubbles ("3🍋→1💗") from the morning trades, a 3-line trade log over the hut, a bottom bar with PACK / NOTES / AUTO / HOME | Nothing says what to do first except one status line. HOME is grey until you trade, so it looks disabled. You start with 2 lumfruit, so day 1 doesn't even need a trade. |
| Trade table | Their stall (5 cards), the deal, your pack (2 cards), then "Also takes · tap to find a way" with 6 cryptic chips (`★ needs 6→1`) | About 1.5 screens tall. The chips can't be understood on a phone. |
| Inventory | Only inside the PACK sheet, which covers 78% of the village | The user "couldn't see my inventory". |
| Medicine | Sickness text says "driftcap". The jar says "≈ 4💊". The mushroom sprite never sits next to the word "medicine". | The user thought the mushroom was something else. Also, "1 medicine" secretly means 2 driftcap. |
| Sick day (day 5, seed 6) | Gran is sick, and Mira, Dov and Hesk are all away. Night card: "No driftcap for Gran tonight. Your family went hungry." | The night card is a bulleted list over the *market*, not home. A sick, hungry night feels like a log line. Nothing can actually go wrong for good. |
| Night card | "NEXT DAY ▶" next to "⏩ AUTO" | AUTO is unclear. It also skips the very nights that should be felt. |
| NOTES sheet | A 7×6 grid of ✓ ✗ ★ · ~ plus a log | Not readable or useful at 390 px. |
| After the cave | Good cards ("2 lumfruit cost 1 pentaja, now 8"), but a careful player is no worse off: routebot hunger is 14% before the cave and 15% after | The tough times are only told, never felt. |
| Length | 15 market days at about 40–60 s each, plus cards | The user didn't finish. |

---

## 1. Pace: a 12-day game (§i)

The festival is on the morning of **day 12**, so there are **11 market days**. At about 40 s per day, plus the evenings and the cards, that is about 8 minutes. The intro movie adds 70 s.

| Beat | Today (16) | New (12) | How |
|---|---|---|---|
| Tutorial trade | day 1 | day 1 | you start with **0 lumfruit**, so day 1 needs one trade |
| Tools wear out (kettlestone) | night 3 | night 3 | unchanged |
| First sickness (Gran) | night 4–5 | **night 3** | `SICK.FIRST = [3, 3]`; guard `d < 4` → `d < 3` |
| Money card (pentaja) | day 4 (median) | day 4 (median) | unchanged |
| Wren's cave | day 8 (36/40 seeds) | **day 6** (38/40), else 7 | `caveStrikeAt: { minDay: 5, maxDay: 6, moneyness: 0.5 }` |
| Second sickness (Aunt Ola) | 4–5 nights after the cave | **night 8 or 9** | `SICK.AFTER_CAVE = [2, 3]` |
| Inflation card | cave + 4 to 8 | **cave + 3** (day 9) | `w.day >= w.caveDay + 3`; fallback `caveDay + 5` |
| Zirnet card | median 4 days after the cave (34/40) | fires in about half of villages by day 12 | the zirnet beat now *also* lives in the evening scene (§5), so it lands either way |
| Festival | morning of day 16 | **morning of day 12** | `FESTIVAL = 12` |

I measured these with a what-if script (scratch file `pace.js`, 40 seeds, same rules as `simstats.js`):

```
cave 5-6, 11 days: pentaja is money before the cave 38/40; money card median day 4; cave {6:38, 7:2};
                   zirnet card 15/40 (median day 9); lumfruit price ×9.2 by the end
cave 5-6, 12 days: same; zirnet card 19/40; lumfruit price ×11
(baseline 7-9, 15 days: 34/40; day 4; cave {8:36}; zirnet 34/40; ×9.4)
```

Money still emerges on its own, the cave still lands after it, and prices still rise about 10×. The only thing lost is the village-wide switch to zirnet, which now has fewer days to happen. That's why the zirnet beat moves into the evening scene and the jar choice (§5.4).

**How to check after building:**
- `node tools/simstats.js 40`, which reads `Sim.FESTIVAL` and the default `caveStrikeAt`. Targets: pentaja is money before the cave in ≥ 36/40 seeds; cave on day 6 or 7 in 40/40; lumfruit price rise ≥ ×5 (median).
- `node tools/routebot.js 40` (careful player). Target: **0 deaths in ≥ 38/40 seeds**; hungry nights ≤ 20%.
- `node tools/routebot.js 40 --lazy` (new flag, §6.5). Target: **at least one death in ≥ 20/40 seeds**.
- `node tools/routebot.js 40 --nojar` (no savings). Deaths should go up after the cave compared with the careful run. That gap is the jar doing its job.

---

## 2. The phone screen (§a, §b, §c, §d)

### 2.1 Layout at 390×844

```
┌────────────────────────────────────────┐ ─┐
│ ←  DAY 3 of 12   🔊    👵   🧒   👩     │  │ 52  top bar: back, day, sound, the family
│                        ●●●  ●●●  ●●○    │  │     (3 strength pips under each face, §6)
├────────────────────────────────────────┤  │
│ 🍋 Tonight: 1 lumfruit. You have none. 🧭│  │ 40  status line (what home needs most); tap = HELP
├────────────────────────────────────────┤ ─┘
│                                        │
│                                        │
│        the village (canvas)            │     flex, about 540 px: all 6 stalls fully visible,
│        6 stalls, you, standing stone   │     the hut cropped to its roof + door at the bottom
│                                        │
│                                        │
├────────────────────────────────────────┤ ─┐
│ PACK  🟢4  🍋0  🪨1  🍄0  💗2   🫙 8💗    │  │ 64  inventory strip (§2.2)
│       ↑you      need1     need2   ≈16🍄 │  │
├────────────────────────────────────────┤  │
│ ┌────────┐ ┌──────────────────────────┐ │  │ 64  action bar
│ │ 🧭 HELP │ │      🏠  GO HOME  ▶      │ │  │     HELP 1/3 width, GO HOME 2/3 width, gold
│ └────────┘ └──────────────────────────┘ │  │
└────────────────────────────────────────┘ ─┘ + safe-area inset
```

Height budget: 52 + 40 + 64 + 64 + 34 (iPhone home bar) = 254 px of chrome, which leaves about 590 px for the village.
`Art.MH` (art.js line 223) changes from `floor(MW * (innerHeight - 198) / innerWidth)` to `floor(MW * (innerHeight - 290) / innerWidth)`, clamped to `18..28`. When `MH < 22`, the hut sits at the bottom with only its roof and door showing. Tapping the door still means "go home".

**Removed from the phone screen:**
- the `.phonebar` (PACK / NOTES / VILLAGE / AUTO / HOME)
- the `#side` sheet and `#sheet-close`
- the `.ticker` trade log overlay (noise; the speech bubbles over the stalls already show trading)

### 2.2 Inventory strip: always visible (§a)

`#strip` is a new element between `.game` and the action bar. `renderStrip()` is called from `renderAll()` and after every `doTrade`.

- **Chips** are 52×52 each: a 24 px pixel icon, the count in 14 px bold, and a 12 px label under it.
- **Order:**
  1. what home needs tonight: 🍋 lumfruit; 🍄 medicine while someone is sick; 🪨 kettlestone when the tools break tonight
  2. 🟢 bogwool
  3. every other good with count > 0
- **Need badge.** A chip home needs tonight gets a red outline and the label `need 1`. When it is covered, the outline turns green and the label says `✓ tonight`. A needed good you have 0 of still shows, as a ghost chip with count 0.
- **The jar** sits pinned at the right end, about 92 px wide: `🫙 8💗` on line 1 and `≈ 16 🍄` on line 2. Line 2 is the jar's worth in medicine mushrooms at today's prices (§4). It flashes red for 4 s when it drops (`S.jarDrop` already exists). Tapping it shows a bubble: "Gran's jar: 8 pentaja. Today Dov would give 16 medicine for it. Keep it for emergencies."
- **Pack load:** drop the "Pack: 10.0 / 30" bar on phone. When the pack is full, the strip border turns orange and a toast says so.
- **Taps:** tapping any chip shows a one-line bubble with the good's name and blurb, e.g. "🍄 Driftcap medicine. Dov grows it. Wilts after 4 days." No sheet opens.
- **Overflow:** with more than 5 goods, chips shrink to 44 px wide (icon + count, no label). There are at most 7 goods, so it never scrolls.

The trade table (§3) does **not** cover the strip or the action bar, so you watch your pack change while you trade.

### 2.3 GO HOME: one way to end the day (§b)

- One gold button, 2/3 of the action bar, always enabled during the market. On desktop it is also the only end-of-day button (`#btn-home`). Pressing **H** also works.
- The label is always `🏠 GO HOME ▶`. The hut door on the map does the same thing.
- **Guard** (replaces `sureHome()`). When home needs lumfruit or medicine tonight, you haven't got it, and the helper could still get it today:
  - the first tap turns the button red for 4 s with the label `NO FOOD YET · TAP AGAIN` (or `NO MEDICINE YET · TAP AGAIN`) and the status line shakes;
  - a second tap within 4 s goes home anyway;
  - no toast, no extra modal.
- **When it goes home:**
  1. `S.phase = 'night'`; input stops; any open trade sheet closes.
  2. Your sprite walks toward the door for at most 0.6 s while the screen fades to black over 0.3 s.
  3. If tonight is a hungry night and more than one family member is alive, the evening scene opens in **choice mode** first ("Who gets the crust?", §5.4). The tap sets `w.family.crust`.
  4. `Sim.endDay(w)` runs.
  5. The evening scene shows the result (§5). One tap on `NEXT DAY ▶` leads to `checkStory()`, then `beginDay()`.

### 2.4 AUTO is gone (§c)

Delete from the UI:

| File | What goes |
|---|---|
| index.html | `#btn-auto`, `#pb-auto` |
| game.js | `S.autoRun`; `startAuto`, `stopAuto`, `autoDay`, `nightToast`; the `auto` branch of `goHome()`, which becomes `goHome()`; the `⏩ AUTO` alt button in the night card; `$('#toast').onclick`; the `if (S.autoRun)` lines in `beginDay`, `pointerdown`, `replayMorning`, `renderTop`; the `stopAuto()` call in `checkStory.fire` |
| phone.css | `#pb-auto` rules |

**Keep:** `Sim.startDay/endDay` with `w.playerAuto` (used by `simstats`, `routebot`, `simrun` and `?skip=N`), `routesFor`, `findRoutes`, `routeStep`, and all `?skip / story / talk / pick / find / plan / follow / tab / seed` dev params. `?skip` doesn't use the game's auto code, so it keeps working.

### 2.5 NOTEBOOK: hidden on phone (§d)

- **Phone:** no notebook and no village charts. The notebook data keeps updating in the background, because the sim needs it and `diffNotes` stays.
- **The one insight that matters**, "prices are rising", moves into the evening scene as a family line (§5.3, triggers P1 and P2), using real numbers from `w.history[*].price.pen`.
- **Money card on phone:** the "SHOW ME" chart becomes one small inline chart inside the card (`lineChart` on a 340×150 canvas: how many villagers take pentaja). Its button is plain `OK`.
- **Desktop** keeps the PACK / NOTEBOOK / VILLAGE side panel as it is now, minus AUTO.

---

## 3. The trade table on phone

The table stays a modal, but on phone it is a **top sheet** that ends above the strip. It covers the status line and the village, not the strip or the action bar.

```
┌────────────────────────────────────────┐
│ [Mira]  MIRA                       ✕   │  portrait 40px, name, close (44×44)
│ "Fresh lumfruit! Still glowing."        │
│ Grows 🍋 · Needs 🥛 snarlmilk, 🍄 medicine│  one line, 13px
├────────────────────────────────────────┤
│ WHAT DO YOU WANT?                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │  their goods: one row, 80px cards, scroll-x if > 4
│ │ 🍋 ×2│ │ 🥛 ×4│ │ 🍄 ×1│ │ 🔵 ×2│     │  badge under each: "for 2🟢" or "✗"
│ │for 2🟢│ │for 2🟢│ │  ✗   │ │for 2🟢│     │
│ └──────┘ └──────┘ └──────┘ └──────┘     │
├────────────────────────────────────────┤
│ FOR 1 🍋 LUMFRUIT, MIRA TAKES           │
│ ┌──────────────────────────┬─────────┐ │
│ │ give 2 🟢  →  get 1 🍋     │  TRADE  │ │  deal rows: 56px tall, 18px text
│ └──────────────────────────┴─────────┘ │
│ (no deal:) ✗ Nothing in your pack works.│
│   Mira would take 🥛 or 💗.             │
│ [ 🧭 FIND A WAY TO GET 🍋 ]              │
└────────────────────────────────────────┘
   (strip and GO HOME stay visible below)
```

- **Drop on phone:** the "YOUR PACK" row (`#d-mine`), since the strip shows it live. Also drop the "Also takes · tap to find a way" chip block (`#d-takes`), since 🧭 FIND A WAY covers it.
- **First refusal and first indirect trade** are no longer modal cards on phone. A single line appears in the sheet, under the deal:
  - first refusal, amber: "✗ Mira has what you want, but you have nothing Mira wants. That's the trouble with barter."
  - first indirect trade, green: "You took 🥛 to trade it on, not to use. That's **indirect exchange**."
  - The evening scene repeats each beat once through Tam (§5.3, triggers R and I). Desktop keeps the cards.
- **After a trade on day 1 only:** the sheet closes after 0.8 s and the good flies into the strip (`flyInto` already exists, aimed at the strip chip). On later days the sheet stays open.

---

## 4. Medicine: one name, one picture (§e)

The rules:

1. **Driftcap is the medicine.** The icon is always the floating mushroom sprite (`icon('dri')`). **💊 never appears again**, not in game.js, the CSS `content`, or the end screen.
2. **Names.** In sentences: "driftcap medicine" the first time in a screen, then "medicine". On cards and chips: `Medicine` with the mushroom icon. The good stays `dri` / `Driftcap` in sim.js, so the tools don't change. game.js gets a UI name map: `const UINAME = { dri: 'Medicine' }`, used by `gname()` and the card titles.
3. **First mention everywhere:** "driftcap, the medicine mushroom Dov sells". This appears in the movie (segment i7), the first sick evening, and Dov's stall line.
4. **Count in mushrooms, not "medicines".** One sickness needs `SICK.DOSES` = 2 mushrooms. Show "Gran needs 2 🍄", never "1 medicine". The jar's worth becomes doses:
   - new `Sim.jarDoses(w)` = `floor(Σ J[y] × DOSES / trend[y])`
   - before the cave the jar shows about 16 🍄; after, about 4 🍄
   - `F.jarMeds` stays for the tools.
5. **Dov's lines** (`LINES.dov.hi`): "Driftcap! The medicine mushroom. It floats, you know." and "Medicine for what ails you. Fresh driftcap." Mira's and Wren's "Needs" line says "medicine".

Every place that says 💊 today (game.js), switched to `icon('dri','sm')`:

| Line | What it is |
|---|---|
| 694 | nightToast (deleted anyway) |
| 742 | top-bar jar `≈ N💊` (moves to the strip) |
| 757 | jar bubble |
| 784 | `jarHTML` |
| 931 | night-card dose line |
| 963, 965 | `jarLine` |
| 1119 | `pill()` in endScreen, which becomes `n => \`${n} ${icon('dri','sm')}\`` |
| 1128 | end-screen row "Sicknesses cured with medicine" |

---

## 5. Evening at home, every night (§f)

This replaces `nightCard()` and the `#story` use in `goHome()`. It is a new full-screen overlay, `#evening`, and the same overlay on desktop as a 480 px centered card.

### 5.1 Layout

```
┌────────────────────────────────────────┐
│ NIGHT 4 · 8 nights to the festival      │  12px pixel font, muted
│ ┌────────────────────────────────────┐ │
│ │ ▒▒ window (moon)      shelf: 🫙     │ │
│ │                                    │ │  pixel picture: canvas 176×132 drawn at ×2
│ │   GRAN    TAM    OLA     ┌──bed──┐ │ │  = 352×264 css px (fits 390 − 2×16 + border)
│ │   (😊)    (😊)   (🤒)    │  OLA  │ │ │  the sick one lies in the bed instead of at the table
│ │  ═══════ table ═══════   └───────┘ │ │
│ │     🍋 bowl   🍄 (dose given)        │ │
│ │  🔥 hearth                   you    │ │
│ └────────────────────────────────────┘ │
│   ●●●      ●●●      ●○○                 │  strength pips under each person (§6), 10px
│                                        │
│ 👩 Ola: "Two mushrooms, and the fever   │  1–3 lines of dialogue, 16px, speaker face 24px
│    is already down. Thank Dov for me."  │
│ 🧒 Tam: "Mira wanted SIX crystals for   │
│    one lumfruit today! It was one."     │
│                                        │
│ +2 🟢 made · ate 1 🍋 · 1 🍋 went bad    │  facts line, 13px muted (from w.events)
│ ┌────────────────────────────────────┐ │
│ │            NEXT DAY ▶              │ │  56px gold button, the only button
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Timing.** The picture fades in over 0.4 s. The lines type in at 0.5 s per line, and a tap shows them all at once. NEXT DAY is tappable from 0.6 s. A normal night takes about 5–8 s.

### 5.2 The picture: `Art.drawHome(ctx, H)` (art.js)

The input is `H = { members: [{ id, mood, hp, alive, inBed }], bowl, dose, jar, cave, fire, festival }`. It is all drawn in code like the rest of art.js:

- **Room:** wooden back wall, a window with a moon, a shelf with Gran's jar, the hearth on the left, a bed on the right, a table in the middle.
- **Window:**
  - after `w.caveDay`, pink glints (pentaja) drift past the window: Wren's cave is up the hill;
  - on the cave night itself, one big pink flash;
  - on the festival night, lanterns.
- **Family:** new `drawKin(ctx, id, mood, x, y)`, a 16×24 full-body sprite that reuses `drawFace`'s head and adds a simple body in each person's colour. Moods:
  - `ok`: smile
  - `hungry`: frown, a hand on the belly
  - `weak` (new, hp 1): grey-ish, slumped, half-shut eyes
  - `sick`: in bed, green, sweat drop
  - `worse`: in bed, fever cheeks
- **Bowl:**
  - lumfruit in the bowl = your pack's lumfruit after eating, 0–3, glowing;
  - an empty bowl on a hungry night;
  - on a crust night, one small brown crust in front of the chosen person.
- **Dose:** a mushroom on the bedside table on nights a dose was taken.
- **Jar:** crystals drawn in the jar, 1 pixel cluster per crystal, so it visibly empties when the jar pays. After the cave the jar has a faint grey crack.
- **Hearth:** lit when the tools are OK. When the tools broke (no kettlestone), it is a dim ember and the room is darker.
- **After a death:** that chair stays at the table, empty, with a small lit candle on the table in front of it for the rest of the game. Nothing else.
- **You:** your sprite (`drawAlien(ctx, …, 'you')`) stands by the door.

### 5.3 Dialogue: 1–3 lines a night

Lines come from a priority list. Take the **two highest triggers that fire tonight**, one line each, then one optional flavour line if fewer than 2 fired.
- Each speaker speaks at most once a night. A dead member never speaks.
- Pick a line at random from the trigger's pool, avoiding the one shown last time.
- Placeholders use real sim numbers.
- People: **Gran** (calm, collects crystals, old sayings), **Little Tam** (a child, asks the naive money questions), **Aunt Ola** (practical, watches prices).
- No pronouns for Wren, ever.

The lines go in a new file, `lessons/01-barter/evening.js`, exported as `window.Evening = { LINES, pick(ctx) }`, so the copy is in one place.

| Prio | Trigger (from `w.events` / sim state) | Speaker: line |
|---|---|---|
| D | `died` tonight | (death scene, §6.3) |
| S1 | `sick` tonight (first time) | Ola: "{sick} is burning up. We need medicine: driftcap, the mushroom Dov sells. Two of them." · Gran (if Gran isn't the one sick): "Two driftcap from Dov, and {sick} will be right again." |
| S1b | `sick` tonight (after the cave) | Ola: "{sick} has the fever. Two mushrooms from Dov... I hope the jar still covers it." |
| S2 | sick, no dose tonight, hp of sick = 1 | Gran: "{sick} won't get through another night like this. Medicine. Tomorrow, whatever it costs." |
| S3 | sick, no dose tonight | Tam: "{sick} is still sick. Didn't Dov have any mushrooms?" · Ola: "No medicine again. {sick} is getting weaker." |
| S4 | `dose` | Ola: "One mushroom down, {left} to go." |
| S5 | `cured` | {cured}: "I feel like myself again. Thank you." · Tam: "{cured} is better! {cured} is better!" |
| H1 | hungry night (crust given) | {crust}: "Thank you for the crust." · Gran: "We've had lean nights before. Tomorrow, lumfruit first." |
| H2 | second hungry night in a row | Ola: "Two nights with no food. I can't work like this, and neither can you." |
| C1 | the cave night (`wren` event) | Tam: "Wren came down the hill with a whole sack of pentaja! Wren gave me one for nothing!" |
| C2 | the night after the cave | Gran: "Crystals I waited years for, and Wren digs up ten a day now. Hm." |
| P1 | after the cave, today's lumfruit price in pentaja ≥ 2× the pre-cave median | Ola: "Mira wanted {now} crystals for one lumfruit today. Before Wren's cave it was {before}." · Tam: "Why does fruit cost more crystals now? Is the fruit bigger?" Gran: "No, child. There are just more crystals." |
| P2 | after the cave, `jarDoses` fell since yesterday | Gran: "My jar bought {before} mushrooms last week. Now {now}. Same crystals." |
| Z1 | after the cave, Hesk was at market today, jar has pentaja, at most once | Ola: "Hesk still swaps zirnet. Nobody can dig zirnet faster. Should we move Gran's jar?" (this is the jar **choice**, §5.4) |
| Z2 | zirnet card has fired | Ola: "Everyone wants zirnet now. Funny how fast that changed." |
| R | first refusal happened today (phone) | Tam: "Why wouldn't Mira take our bogwool?" Gran: "Mira didn't need it, love. A swap needs two people who want what the other has." |
| I | first indirect trade today (phone) | Tam: "You bought milk we can't even drink?" You: "Sela's milk is what Mira wants. It's for trading." |
| M | money card fired today | Tam: "Sela took a pentaja for milk. She can't eat it! Why?" Gran: "Because she knows someone else will take it." |
| T | tools broke tonight | Ola: "The tools broke. Without kettlestone from Bob, you'll make half the bogwool." |
| F | flavour (fed, nothing else) | Tam: "Lumfruit again! My favourite." · Gran: "{n} nights to the festival." · Ola: "Fed and warm. That's a good day." · Tam: "When I'm big I'll grow bogwool too." |
| day 1 | night 1 (tutorial) | Gran: "Lumfruit! You found Mira. Well done." · Tam: "What did Mira want for it?" You: "Two bogwool. Lucky, Mira needed some." |

**Facts line** (13 px, muted, from events): `+N 🟢 made · ate 1 🍋 · N 🍋 went bad · 🛠 tools broke · 🫙 −2💗 (medicine)`. Junk, plenty and full events are folded into this line or dropped. "While you were home" swaps are **dropped** on phone.

### 5.4 At most one choice on some nights

A choice replaces the NEXT DAY button until it is made. **One per night at most**; the crust wins over the jar.

1. **"Who gets the crust?"** On every hungry night with ≥ 2 alive, *before* `endDay`, the picture shows the empty bowl and one crust.
   - Text: "No lumfruit tonight. There's one crust left. **Who gets it?**"
   - Tap a person (the faces are the buttons, 64×64 hit area).
   - The chosen one doesn't lose strength tonight (§6.1).
   - The sick one shows a hint dot under their face, because protecting them matters most.
   - Sets `w.family.crust = id`. If the tap never comes, there is no default: the scene waits.
2. **"Move Gran's jar?"** Once, trigger Z1 (after the cave, Hesk present, jar pen > 0).
   - Buttons: `[ YES, TOMORROW ]` and `[ KEEP THE CRYSTALS ]`.
   - YES sets `S.jarPlan = 'zir'`. The next morning the status line reads "🫙 Take Gran's jar to Hesk for zirnet 🧭" and HELP follows the jar route (`jarQuote(w,'hesk','zir')`), exactly like a medicine route.
   - Either answer is recorded and shown on the end screen ("You moved the jar / You kept it in pentaja").

There are no other choices. "Open Gran's jar" for medicine doesn't need a night choice: the jar already pays at Dov's stall while someone is sick.

### 5.5 What becomes of today's story cards

| Card | Phone | Desktop |
|---|---|---|
| refusal, indirect | inline line in the trade sheet + Tam's evening line | card, as now |
| sick (before / after / lag) | absorbed into the evening scene (S1/S1b) plus the status line next morning. The "lag" insight (Dov hasn't raised prices yet) becomes Ola's line: "Dov still asks only {med} crystals. Go first thing, before Dov catches on." | same as phone (the night is where it happens) |
| money | card, ≤ 60 words + inline chart, `OK` | as now |
| wren | card the morning after the cave, ≤ 50 words | as now |
| inflation | card, as now (it already fits one screen) | as now |
| zirnet | card when it fires | as now |
| end | festival end screen (§6.4) | as now + memorial |

---

## 6. Tough times: strength, hunger, death (§g)

### 6.1 Rules (sim.js)

Each family member has **strength**, 0–3 (`w.family.hp = { gran: 3, tam: 3, ola: 3 }`), shown as 3 pips under the faces. Nightly, in this order, inside `endDay` (new `familyNight(w, ev)`, called right after the eating loop):

1. **Medicine.** `nurse()` runs as now: doses come from the pack, and a sickness is cured when the doses are complete.
2. **Food.** The family eats from the shared pack as now. One lumfruit is the family meal. After a death, `you.needs.lum = alive / 3`.
3. **Strength:**

| Tonight | Effect |
|---|---|
| fed, not sick | +1 (max 3) |
| fed, sick, took a dose tonight | ±0 |
| sick, **no dose tonight** | −1 |
| hungry (no lumfruit), not given the crust | −1, **but hunger alone never goes below 1** (weak, never dead) |
| hungry, given the crust | ±0 |

4. **Death.** A member at **0** dies: `ev.push({ type: 'died', who, name })`, `F.dead.push({ who, day })`, the sickness ends (`F.sick = null; setMedNeed(you, 0)`), `you.needs.lum` is updated, and the crust and sickness rotations skip them.

**What this means in plain words:**
- A sick person who gets **no medicine dies on the 3rd night** (3 → 2 → 1 → 0), or on the **2nd** if they were already weakened by hunger.
- A sick person who gets one mushroom a night never loses strength. Two mushrooms cure.
- Hunger alone makes people weak but never kills.
- So: **starving and sick together is what kills.** That's the sentence for the card and the movie.

**Other changes:**
- **No natural cure.** Remove `SICK.NATURAL` (set it to 99). Sickness ends with medicine or with death.
- **Who gets sick:** a fixed order, not shuffled: **Gran** first (before the cave, the jar pays easily), **Aunt Ola** second (after the cave, the jar barely can), Gran again for the late one. **Little Tam never falls sick and can't die.** Tam can still get hungry and weak (floor 1). Tam is the child who asks the questions, and a dying child would overwhelm the lesson.
- **Mercy rule:** if someone at home is sick with hp ≤ 1, **Dov always comes to market** the next day. In `startDay`, still draw `w.rand()` for Dov so the random stream doesn't shift, then force `present = true`. A careful player then always has a chance.
- `SICK.RATE` (1 bogwool a day while sick) and `WORSE_RATE` (0 when worse) stay as they are. That squeeze is real and felt.
- `Sim.family(w)` also returns `hp`, `dead` and `critical` (the sick member's hp ≤ 1).

### 6.2 Status line wording (homeNeed)

| State | Status line |
|---|---|
| critical | `🍄 Gran needs medicine TONIGHT or Gran won't make it · needs 2 🍄 🧭` (red, pulsing) |
| sick | `🍄 Gran is sick: needs 2 🍄 medicine (Dov) 🧭` |
| no lumfruit | `🍋 Tonight: 1 lumfruit. You have none. 🧭` |
| tools | `🪨 Tools break tonight: need 1 kettlestone (Bob) 🧭` |
| all fine | `✓ Fed tonight · 1 more 🍋 for tomorrow? 🧭`, or `✓ All set · festival on day 12` |

### 6.3 The death scene (handle with care)

The evening scene of that night has:
- **The picture:** the room is darker, the hearth low. The empty chair, with a candle on the table in front of it.
- **One line only,** from the eldest survivor (Gran, else Ola):
  - Gran gone: Ola: "Gran's chair is empty tonight. Her jar is still on the shelf."
  - Ola gone: Gran: "Ola's place at the table is empty. We'll set it anyway, for a while."
- **The facts line, verbatim:** "Sick, with no medicine, and too little food." No gore, no animation of dying, no sound effect except the music stopping for 2 s and then the `sick` song, slower.
- **The button reads `GO ON`** instead of NEXT DAY.
- **Afterwards:** the face in the top bar stays as a grey outline with a small candle, and there is no pip row. The game continues with fewer mouths.

### 6.4 The festival end screen

- **The picture:** the evening picture with lanterns. Alive members at the table, smiling; an empty chair with a candle for each one lost.
- **Score rows:**
  - `🍽️ Nights your family ate 9 / 11`
  - `❤️ Made it to the festival 3 / 3`, or `2 / 3 · 🕯️ Gran (night 9)`
  - `🍄 Sicknesses cured 2 / 2`
  - `🫙 Gran's jar now buys 4 🍄 (was 16)`
- **Stars:** −1 star per death (minimum 0). Score: +40 per survivor.
- **The memorial line** when someone died: "Gran didn't see the festival. Ola fell sick after Wren's cave, and the jar that once bought 16 mushrooms bought only 4." The text uses the real episode numbers (`F.episodes[i].before/price`), which ties the loss to inflation.

### 6.5 Tools

`tools/routebot.js`:
- report deaths per seed, each with night and cause (`hungry+sick` / `sick`), plus the lowest hp seen;
- new `--lazy` flag: buys only lumfruit, one route a day, never the jar, never medicine first;
- new `--crust=sick|tam|weakest` flag (default `sick`).

`tools/simstats.js`: add the median day of the second sickness and `jarDoses` before and after (instead of medicines).

---

## 7. First-day tutorial (§h)

The tutorial runs only on day 1 and only once per device (`localStorage['wth-ep01-tut']`, wrapped in try/catch). It is skipped with `?skip` or `?tut=0`. It shows one pointer at a time: a bouncing gold ▼ (32 px) plus one bubble of **at most 12 words**. Nothing else on screen is dimmed or blocked, but the morning bubble replay is **off on day 1** (the replay queue is flushed silently), so the plaza is calm.

| Step | Pointer on | Bubble | Advances when |
|---|---|---|---|
| T1 | Mira's stall | "Your family needs 1 🍋 tonight. Mira grows them. Tap Mira." | the trade sheet opens on Mira (any other stall also counts; the pointer then moves to that stall's ✕) |
| T2 | the `TRADE` button of `give 2 🟢 → get 1 🍋` | "Mira takes 2 bogwool for 1 lumfruit. Tap TRADE." | the trade is done |
| T3 | the 🍋 chip in the strip (the sheet auto-closes) | "Dinner is in your pack." | 1.5 s, or a tap anywhere |
| T4 | `🏠 GO HOME` | "That's the day. Tap GO HOME." | tap |

The evening of night 1 uses the "day 1" lines (§5.3). On day 2 there is no pointer: the status line ends in 🧭, and the first time it shows, HELP blinks twice.

`newGame()` change: `you` starts with **0 lumfruit**, 4 bogwool. In `createWorld`, change `if (v.makes !== 'lum') give(a, 'lum', 2)` to skip `you`. It draws no random numbers, so the village doesn't shift. Day 1 everyone attends, so Mira is always there.

The intro card (`introCard`) shrinks to the movie plus one button. See §8.

---

## 8. The intro movie (§j)

**Where it lives:** `video/ep01/intro/` (`narration.json`, `scenes.js`, `cues.py`, `SCRIPT.md`, `out/ep01-intro.mp4`, `out/poster.jpg`, `out/captions.vtt`). It uses the EP02 engine (`video/ep02/scene.js`, `props.js`, `build.py`, `render.mjs`; 1920×1080) and EP01's own pixel art. `scenes.js` loads `lessons/01-barter/art.js` for the villagers, the faces, the icons and `drawHome`.

**In the game:**
- **First visit:** before day 1, a full-screen `<video class="movie" playsinline>` with captions on, sized to the width (390×219 on phone, letterboxed on black), with the caption track rendered **below** the video (12–15 px) so it is readable.
- **Buttons:** `▶ PLAY` (big) and `SKIP ▶▶` (44 px, top right). After the video ends, or after SKIP: one short card, "🎯 Reach the festival on day 12 with everyone at the table", and `WALK TO THE MARKET`.
- **Later visits:** the same card with a small `▶ WATCH THE INTRO` link.
- **Missing movie** (not rendered yet): show the card directly, like EP02's `movie-soon` fallback.

**What it must explain:**
1. you and your family
2. their nightly need (1 lumfruit)
3. you make bogwool, which nobody can eat
4. there is no money, so you swap
5. the trouble of finding someone who wants your bogwool (double coincidence), and the chain that solves it
6. sickness needs medicine, *driftcap, the floating mushroom Dov sells*, 2 of them, and a person gets weaker each night without it
7. Gran's jar of pentaja, for a rainy day
8. the goal: the festival on day 12 with everyone alive

**Draft narration** (10 segments, about 180 words, about 70 s at the EP02 voice pace):

```json
[
  { "id": "i1", "scene": "valley",   "text": "This is Ulm Hollow, a village on a faraway world. Nobody here has ever heard of money." },
  { "id": "i2", "scene": "family",   "text": "This is you. And this is your family: Gran, Little Tam and Aunt Ola. Every night, they need one lumfruit to eat." },
  { "id": "i3", "scene": "bogwool",  "text": "You raise bogwool: springy swamp fleece, two a day. It keeps forever. But nobody can eat bogwool." },
  { "id": "i4", "scene": "market",   "text": "So every morning you walk to the market, and you swap. Your bogwool, for their lumfruit." },
  { "id": "i5", "scene": "refusal",  "text": "But a swap only works if they want what you have. Mira grows lumfruit. Today, Mira doesn't need bogwool. Now what?" },
  { "id": "i6", "scene": "chain",    "text": "Maybe Sela takes your bogwool, and Mira takes Sela's milk. Find the chain, and dinner is saved." },
  { "id": "i7", "scene": "medicine", "text": "Sometimes someone at home falls sick. Then they need medicine: driftcap, the floating mushroom Dov sells. Two of them. Sick and hungry, with no medicine, a person can die." },
  { "id": "i8", "scene": "jar",      "text": "On the shelf sits Gran's jar: eight pink pentaja crystals. Pretty, and not much use. Gran keeps them for a rainy day." },
  { "id": "i9", "scene": "goal",     "text": "Your goal: reach the harvest festival on day twelve, with everyone still at the table." },
  { "id": "i10","scene": "go",       "text": "There is no money in Ulm Hollow. Not yet. Let's see what happens.", "pad": 1.2 }
]
```

**Scenes** (for `scenes.js`):

| Scene | What we see |
|---|---|
| valley | a slow pan over the hollow: swamp, hut, plaza, six stalls; dawn |
| family | the hut interior (`drawHome`), the three faces close-up with names, and a glowing lumfruit landing in the bowl |
| bogwool | you shearing a puff of bogwool, a counter "2 a day", then Tam biting it and making a face |
| market | you walk the plaza; stall awnings; a swap animation 🟢🟢 → 🍋 |
| refusal | Mira shakes their head, a ✗ over 🟢, a sad Tam face inset |
| chain | three arrows on the map: you → Sela (🟢→🥛), you → Mira (🥛→🍋), a ✓ |
| medicine | Gran in bed (sick face); the floating mushroom bobbing over Dov's stall with the label **MEDICINE**; ×2; the strength pips draining ●●● → ●●○ → ●○○ |
| jar | close-up of the jar on the shelf, 8 crystals glinting |
| goal | festival lanterns, the family at the table, "DAY 12" in pixel font |
| go | fade to the morning plaza: the first frame of the game |

---

## 9. Files and functions that change

**sim.js**
- `FESTIVAL = 12`
- `createWorld`: `caveStrikeAt` default `{ minDay: 5, maxDay: 6, moneyness: 0.5 }`; `you` starts with 0 lumfruit
- `SICK = { …, FIRST: [3, 3], AFTER_CAVE: [2, 3], NATURAL: 99 }`
- `fallSick`: guard `d < 3`; fixed order `['gran','ola','gran']`, skipping the dead
- new `w.family.hp`, `w.family.dead`, `w.family.crust`; new `familyNight(w, ev)`, called in `endDay` after eating; events `weak` and `died`
- `startDay`: the Dov mercy rule
- new `jarDoses(w)`; `family(w)` returns `hp`, `dead`, `critical`, `jarDoses`
- `stats(w)`: record `hp` for the tools
- the header comments and the README EP01 section get the new numbers

**art.js**
- `Art.MH` phone formula (`- 290`, clamp 18..28); the hut is cropped when `MH < 22`
- new `drawKin` (full body, moods incl. `weak`), `drawHome(ctx, H)`, `homeURL` is not needed (draw live onto the `#evening` canvas)
- the `drawFace` `weak` mood; a grey `gone` outline face for the top bar

**game.js**
- AUTO removal (§2.4)
- `renderTop`: day as "DAY 3 of 12", pips under the faces, the jar moves out
- new `renderStrip()`
- `goHome()`: no auto; the crust choice before `Sim.endDay`; `showEvening(ev)` replaces `story(nightCard(…))`
- new `showEvening`, `eveningLines` (uses `Evening.pick`), choice handling, `S.jarPlan`
- `homeNeed()`: the new wording (§6.2), jar-plan first when set
- `plan(g)` on phone: run `routesFor(g)` and `followRoute(routes[0])` straight away (no sheet); if none, toast "No way to get {good} today. {who} is away."
- `renderDialog()` on phone: hide `#d-mine` and `#d-takes`; inline refusal and indirect lines
- `checkStory()`: refusal, indirect and sick don't fire as cards on phone; money gets the inline chart; inflation at `caveDay + 3`
- `introCard()` becomes the movie gate + goal card
- the tutorial state machine `S.tut` (T1–T4) with a `.pointer` element
- `endScreen()`: survivors, the memorial line, stars −1 per death, the mushroom icon
- `UINAME` for medicine; every 💊 goes (§4)
- `sureHome()` becomes the button-state guard (§2.3)
- remove the phone ticker; flush the morning replay silently on day 1

**New files**
- `evening.js`: dialogue pools and the trigger picker
- `video/ep01/intro/*`: the movie

**index.html**
- remove `#btn-auto` and `.phonebar`
- add `#strip`, `#actionbar` (HELP, GO HOME), `#evening` (canvas, lines, facts, button / choice row), `#movie`
- add `<script src="evening.js">` before game.js

**phone.css**
- drop the `.phonebar`, `.side` sheet and `.ticker` phone rules
- add the strip, action bar, top-sheet trade table, evening overlay and pointer
- every tap target ≥ 44 px; no text under 12 px

**lesson.css (desktop)**
- the strip sits under the village too (the side PACK tab stays)
- the evening overlay as a centered 480 px card

**tools**
- routebot: deaths, `--lazy`, `--crust`
- simstats: jar in doses, second-sickness day

**README**
- the EP01 section: 12 days, strength and death rules, no AUTO, the evening scene, the movie

## 10. How to check it on a phone

`PHONE=1 node tools/drive.js` runs, each screenshot read and judged as a first-time player would:

1. `/lessons/01-barter/?tut=1`: movie gate → T1 pointer on Mira → the sheet with the TRADE pointer → the strip pointer → the GO HOME pointer → evening 1. The strip, status and GO HOME must be visible in every market shot.
2. `?skip=2&story=1`, then GO HOME on day 3 without medicine shopping: evening with Gran falling sick, the S1 lines, mushroom icons only (grep the DOM for 💊: there must be none).
3. Continue 2 nights with no medicine and no lumfruit: the crust choice → the weak pips → the death scene on night 5 at the latest. Check the empty chair and the candle in the top bar.
4. `?skip=7`: the after-cave evening with a P1 price line containing real numbers, and the jar strip showing a lower `≈ N🍄` in red.
5. `?skip=11`: the festival end screen with the memorial when someone died.
6. `PHONE=land` sanity pass: the strip and action bar sit in a right rail.

## 11. Out of scope here

- EP02's "too fast, needs a tutorial" and "Rome had too much text for the time": separate specs per chapter.
- Desktop polish beyond what falls out of the shared code.
