# Chapter 6 minigame: "Wren's last cave" (design)

**One goal:** be Wren one last time. Each round, **double** a money by pouring in new money from its cave, and let go exactly on the **×2** line. Five monies from this episode, then gold.
**One-line rules on screen:** *Hold to pour. Let go on the ×2 line.*
**Length:** practice about 12 s, five rounds of about 7 s, the gold round about 15 s, and a 5 s fast-forward. **About 70–80 s** in all.
**Controls (one thumb):** press and hold the big **POUR** button (the whole bottom of the screen in portrait), and let go. Keyboard: hold **Space**. Mouse: press and hold. Nothing is timed: a round waits until you press, the pour runs only while you hold, and letting go ends the round. **There is no clock anywhere in this game**, so it never asks you to read while time runs.

**The feeling we want:** the same thumb, the same hold, five times the pile shoots up and the jar beside it drops to half. Then gold: you hold just as hard, through all twelve years of the biggest rush the player has heard of, and the line never comes. The score shows it: the last 100 points can't be won.

## Why this seed
The brief offered three seeds: (a) flood each money, then dig gold; (b) one gold-rush miner; (c) a saver across centuries. This is (a), tightened:
1. **One verb for all six rounds** (hold and let go). The contrast is the lesson, so nothing else may change between rounds. Seed (b) would teach "rushes are hard work", not "gold is hard to flood"; seed (c) teaches "gold kept its value", which is the result, not the reason.
2. **"Double it" gives the five easy rounds a skill** (stop on the line), so they're a game and not a slideshow, and it makes gold's round fail in a way you can *see*: the line is right there, far above.
3. **The jar** (a family's savings in that money, shown as loaves) sits beside every pile. Doubling the pile halves the jar. That's the episode's one idea, felt five times before gold breaks the pattern.
4. **Yap is different, on purpose.** Its jar barely drops (8 → 7 loaves), because, by later accounts, the islanders valued O'Keefe's stones lower. The outline asks us not to say "every money got flooded the same way", and this shows it without a word.

## Screen layout (portrait, 390 × 844)

During a run the game takes the whole screen, as in Rome and cowries (`Ep02.playMode(true)`), but it **stays portrait**: no orientation lock and no "turn your phone" prompt. The canvas is 180 × 200 logical px, scaled ×2.1 to 378 × 420 CSS px. Below it are a slim HUD and a big button.

```
┌──────────────────────────────────────┐ 390 px
│ ①②③④⑤⑥ round dots      SCORE 270  │  HUD, 14 px, 36 px tall
├──────────────────────────────────────┤
│        [cave art: the ship / mint]   │
│              ↓ ↓ ↓  (the pour)       │
│   ×2 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ×2   │  dashed gold line, label both ends
│        ▓▓▓▓▓▓▓▓▓▓                    │
│        ▓▓ the pile ▓▓     ┌─jar─┐    │
│        ▓▓▓▓▓▓▓▓▓▓▓▓▓      │ ░░░ │    │
│ ×1 ────▓▓▓▓▓▓▓▓▓▓▓▓▓──    └─────┘    │
│                        JAR BUYS      │
│                        🍞🍞🍞🍞🍞🍞🍞🍞 │  8 loaf icons; they grey out as it drops
│   COWRIES · 1845                     │  round name + year, 12 px, never changes mid-pour
├──────────────────────────────────────┤ canvas: 378 × 420
│                                      │
│                                      │
│            HOLD TO POUR              │  the button: full width, ~260 px tall,
│                                      │  gold while held; 22 px label
│                                      │
└──────────────────────────────────────┘
```

- **Landscape phone / desktop:** the canvas on the left at full height, the button as the right-hand column. The same 180 × 200 canvas, scaled to fit.
- Text on the canvas is drawn at 8 logical px or more (≥ 17 CSS px). The HUD is HTML.
- The pile is a bar of that money's sprites (stones, bead strings, wampum belts, cowries, coins, gold bars), drawn bottom up, so "×1" is the old pile and "×2" sits exactly as far above.

## Flow

### 0 · Start panel (HTML, under the movie)
```
WREN'S LAST CAVE
Be Wren one last time.
Double each money from its cave.
Then try gold.
A short practice comes first.
[ PRACTICE FIRST ]          (after the first visit: [PRACTICE] [START])
```

### 1 · Practice: Ulm Hollow (no score, nothing to lose)
Wren's own pentaja cave from EP 01, and Gran's jar. One instruction at a time, as in cowries and Rome. Each step waits for the player to do it; `skip practice ›` sits in the corner.
1. `PRACTICE 1/2` · **"Hold the button."** The pentaja pours while held (the pile rises ×1 → ×2 in 3.4 s, with the same slow start as the rounds). If they let go early, the pile drops back to ×1 and the coach says **"Try again: keep holding up to the line."** Unlimited retries, and no topping up, so practice teaches the same one-press habit the scored rounds need.
2. `PRACTICE 2/2` · **"Let go on the ×2 line."** On release the stamp shows how close they got (`PERFECT!` / `CLOSE!` / `TOO MUCH`). Gran's jar drops to `4 LOAVES` with a soft pop per loaf. Then the coach says: **"Twice the pentaja. Gran's jar buys half. That was Wren's cave."**
3. **"Now the real thing."** Taps are ignored for 0.9 s, so a thumb still pressing can't skip this step.

Remembered in `localStorage["wth-ep02-gold-tut"]` (in try/catch, like the other chapters).

### 2 · Five rounds (scored)
Each round:
1. **Card (waits for a press; the press itself starts the pour):** the money's sprite, its name and a year, and its cave art sliding in. One line only, for example `COWRIES · 1845 · SHIPS FROM ZANZIBAR`. A press on the button both closes the card and starts the pour, so it's one gesture, but not a rushed one: the card hides in 0.25 s and **the pile starts moving 0.3 s after the press**, easing in over its first 0.3 s, so the pile is in view before it moves at full speed.
2. **Pour (only while held):** after the slow start the pile rises linearly to ×2 in that round's time (below; the time includes the slow start), and the jar's loaves grey out as the pile grows (8 → 4). If the pile reaches **×2.6**, the pour stops by itself: `TOO MUCH!`, 0 points.
3. **Release:** a stamp with the points (`PERFECT +100`, `+82`, `+40`), held for 1.4 s. Then that round's **Wren card** flips and flies up into the strip of round dots (the "Wrens of history" collection filling up). It's a picture, not text.

**Short taps:** a release before the pile has started to move (under 0.3 s, so any tap under 150 ms) doesn't count. On a round card, such a tap closes the card; the pile stays at ×1, the button shows `HOLD TO POUR` with a gentle pulse, and the round waits for a real hold. Once the pile has moved, one round = one press: no topping up.

| # | Money · year | Cave art | ×1 → ×2 takes | Jar of loaves after ×2 | Wren card label |
|---|---|---|---|---|---|
| 1 | Rai stones · 1871 | O'Keefe's schooner with iron tools | 3.4 s | **8 → 7** (stones in a lighter tint: "O'Keefe stones") | `YAP · O'KEEFE'S SHIP` ✓ `SPOTTED` |
| 2 | Glass beads · 1500s | A Venetian glass furnace, crates on a ship | 3.2 s | 8 → 4 | `BEADS · VENICE GLASS` |
| 3 | Wampum · 1650 | An iron drill point spitting beads | 3.0 s | 8 → 4 | `WAMPUM · IRON DRILLS` |
| 4 | Cowries · 1845 | A Hamburg ship tipping Zanzibar shells | 3.2 s | 8 → 4 | `COWRIES · ZANZIBAR` |
| 5 | Silver coins · AD 250 | The mint's hammer and die (copper in the crucible) | 2.8 s | 8 → 4 | `ROME · THE MINT` |

On the Yap round, as the jar settles at 7 the stamp adds one line: **`YAP SPOTTED IT`** (one glance; the round is already over). The different times keep players watching the pile instead of counting in their head.

**Points per round:** the error is `e = |pile − 2| × 100` (in percent of the old pile). Points: `100` if `e ≤ 3`; otherwise `max(0, round(100 − 6 × (e − 3)))`. So ×1.95 or ×2.05 gives 88, ×1.90 gives 58, ×1.82 gives 10, and anything past ×2.20 or below ×1.80 gives 0. Simulated with the revision-1 times (3.4 / 3.2 / 3.0 / 3.2 / 2.8 s, slow start included; release timing with a 30 ms late bias and a normal spread; 20,000 runs): SD 50 ms → median **500** of 500; SD 80 ms → **489**; SD 120 ms → **469**; SD 200 ms (a first-timer) → **416** (10th percentile 347). Gentler than before on purpose (the user asked for "not too fast").

### 3 · Gold, 1849 (the round that can't be won)
**Card (waits for a tap; this one does need reading, so the button reads `READY` and a press only closes it):**
```
GOLD · 1849
California. Then Australia.
The whole world digs.
Same job: double it.
You get all 12 years of the rush.
[ READY ]
```
**Then the same screen, the same button, the same `HOLD TO POUR`.** The differences are all in the picture:
- The pile is the world's gold, drawn as a **cube** (the movie's g3 prop), and the **×2** line floats far above it. On the first press the camera eases back so both the cube and the line fit.
- The cave art is a hillside full of tiny prospectors with pans, picks and tents. Their number grows each year (a picture of "the whole world digs").
- **While held, a year passes every 0.8 s**, shown as a big year counter (`1849 … 1860`) on the cube. It's a number, not a sentence, and it stops when you let go. There's no clock: letting go just pauses the rush.
- Each year adds that year's gold to the pile (table below). The cube grows by a sliver you can just about see, and a small `×1.06`, `×1.12` … ticks beside it.
- The jar beside it holds gold coins. Its loaves follow **real British prices** year by year (table below): 8 → 8½ → 7 → **6½ in 1856** → 7½.

After 1860 the pour stops by itself and the button greys out: `THE RUSH IS OVER`. The cube sits at **×1.36**, with the ×2 line still far above. A grey stamp: `×2 NOT REACHED · +0`.

**Fast-forward (5 s, no input, no text to read):** the year counter runs 1861 → 1890s and the jar follows the real path, dip included: **6.9 (1860) → 6.3 (1867) → 6.4 (1873) → 7.9 (1886) → about 8.2 (the 1890s average)**, where it stops, labelled `1890s`. One neutral tick per decade; no chime, since the 1873–96 fall was hard on borrowers and isn't presented as simply good news. Measured decade against decade (as in the movie), so it doesn't end on 1896, the lowest year.

Then the result.

| Year | Gold added (game, t) | World pile (game) | Jar buys (loaves; real British cost of living) |
|---|---|---|---|
| start | | 6,000 t = ×1.00 | 8.0 (1849) |
| 1849 | 60 | ×1.01 | 8.0 |
| 1850 | 80 | ×1.02 | 8.4 |
| 1851 | 200 | ×1.06 | 8.5 |
| 1852 | 200 | ×1.09 | 8.4 |
| 1853 | 200 | ×1.12 | 7.3 |
| 1854 | 200 | ×1.16 | 6.7 |
| 1855 | 200 | ×1.19 | 6.6 |
| 1856 | 200 | ×1.22 | **6.6** (the rush's low) |
| 1857 | 200 | ×1.26 | 6.7 |
| 1858 | 200 | ×1.29 | 7.5 |
| 1859 | 200 | ×1.32 | 7.4 |
| 1860 | 200 | **×1.36** | 6.9 |
| fast-forward | | | 1867: 6.3 (the lowest) · 1873: 6.4 · 1886: 7.9 · **1890s average: 8.2** (1913 would be 7.2: not shown, it's EP 03's story) |

Loaves = `8 × CPI(1849) ÷ CPI(year)`, from the Bank of England's consumer price index (see Real vs game). The pile's start of 6,000 t is a **game value**; see the table at the end.

## Score
- Rounds 1–5: up to 100 each. Gold: always **0**, shown as `—` and the text `can't be done`.
- **SCORE n / 600.** The best is saved in `localStorage["wth-ep02-gold-best"]` (try/catch).
- The "out of 600" is deliberate: the sixth 100 sits on the scoreboard all game, and nobody gets it.

## Result screen (short, for a phone; lines under about 40 characters)
```
SCORE 446 / 600
You doubled five kinds of money.
Gold: never.

THE JAR (8 loaves at the start)
Stones   8 → 7   Yap spotted it
Beads, wampum, cowries, Rome   8 → 4
Gold, 1850s–70s   8 → about 6½
      1890s       about 8
Then prices fell for 20 years:
good for savers, hard for borrowers.

GOLD ×1 ▓▓▓▓░░░░░░░░ ┊×2
×1.36 in 12 years · can't be done

The last 100 points can't be won.
Nobody has found gold's cave.
                     best 446
[ PLAY AGAIN ]   [ CONTINUE ]

Real: world gold mined a year (1850s,
~200 t) and British prices. Game: the
size of the world's pile in 1849, and
the jars of the first five rounds.
```
(The ½ is a real glyph, not "0.5". The jar rows show the real figures from the table, not the player's. The two "prices fell" lines are muted. The gold bar runs from ×1 to ×1.36 with the ×2 line marked, so the 0 shows what happened instead of looking like a penalty. Playtest once: if `/600` still reads as unfair, switch to `/500` plus a separate gold line.)

## Wren moment card (after CONTINUE)
Short, like the Rome and cowries cards: a bold line, two short lines, the next-episode line.
```
┌──────────────────────────────────────┐
│ [Wren sprite, lantern off, sitting]  │
│ **Every money had a Wren.**          │
│ **Gold came closest to having none.**│
│                                      │
│ From 1849, the whole world dug for   │
│ twelve years. Prices rose by up to a │
│ third, then fell back.               │
│                                      │
│ In real life: while Britain's money  │
│ was gold, prices went up and down by │
│ up to a third, but were about the    │
│ same in 1913 as in 1821. Like €100   │
│ that buys the same shopping 92 years │
│ later.                               │
│                                      │
│ *Next: Episode 3 · Why Gold?*        │
└──────────────────────────────────────┘
```
Below the card, small and muted, the Yap callback (g9 was cut from the movie, so this is where it lives):
> *Yap, again: in 1932 France swapped its dollars for gold in New York. To save shipping it, bank staff just marked the drawers as French, and the papers wrote of a "loss of gold". Money, like Yap's stones, doesn't have to move to change hands.* (Friedman, *The Island of Stone Money*, 1991)

(Much of that gold was shipped to France later in 1932; the note claims only the earmarking. See the g9 row in `video/ep02/gold/SCRIPT.md`.)

## The "Wrens of history" collection (the episode's last card)
A strip of six cards that fill during the game (one per round) and stay on the page afterwards, in time order of their "cave". Each card is a sprite, a name, a date and one line. A card for a chapter the player hasn't finished (`Ep02.isDone(ch)` is false) is drawn dim, and tapping it opens that chapter.

| # | Card | One line |
|---|---|---|
| 1 | **O'Keefe's ship** · Yap, 1871 | Iron tools and a ship made stones easy. The islanders priced them lower. |
| 2 | **Venice glass** · West Africa, 1400s–1800s | Venice made beads by the ton. Each bought less. |
| 3 | **Iron drills** · Wampum, 1600s | Iron points drilled far faster than stone. |
| 4 | **Zanzibar shells** · Cowries, 1845–1890 | A silver dollar went from 2,000 shells to 20,000. |
| 5 | **The mint** · Rome, AD 64–270 | Emperors made coins thinner: wheat ×37. |
| 6 | **?** · Gold | Wanted: gold's Wren. Not found. |

Card 6 is drawn as a "WANTED" poster with an empty frame. It's the last thing on the page before the EP 03 link.

## Real numbers vs game numbers
| Number | Real or game | Source / note |
|---|---|---|
| World gold mined a year in the 1850s, about 200 t (1849: 60 t, 1850: 80 t) | **Real** (1850s); **game** (the 1849 and 1850 split) | *Encyclopaedia Britannica* 1911, "Gold", Table I: 6,350,180 oz a year 1851–60 (≈198 t); Soetbeer's 5-year averages ≈199 t (1851–55) and ≈202 t (1856–60). 1841–50: 1,819,600 oz (≈57 t) a year. The 1849/1850 split is our ramp-up, not a source. |
| The world's gold in 1849: 6,000 t, so the rush adds ×1.36 | **Game** | No reliable source exists for the 1848 stock. Newmarch's contemporary estimate (quoted by Jevons) was that 1849–60 gold equalled "about 50 per cent" of the gold then in use (→ ×1.5); a total stock including jewellery would give less. ×1.36 sits inside that range, and the result screen labels it a game value. |
| Jar loaves in the gold round (8 → 6.6 in 1856 → 6.3 in 1867 → about 8.2 in the 1890s) | **Real** (ratios) | Bank of England, *A millennium of macroeconomic data for the UK* v3.1, sheet A1, consumer price index: 1849 1.112, 1856 1.352, 1860 1.292, 1867 1.405, 1873 1.381, 1890s average 1.091 (1896, the lowest year, 1.057; 1913 1.244). Loaves = `8 × 1.112 ÷ CPI`. The loaf is our unit; only the ratios are real. The fast-forward ends on the 1890s average, not on 1896, to avoid a cherry-picked trough. |
| Prices rose by up to a third, stayed high about twenty years, then fell; 1890s below the 1840s | **Real** | BoE CPI: 1851 → 1856 +30%, 1851 → 1867 +35% (both from the 1851 low; against the 1840s average +13% and +17%); plateau 1853–1873; 1873 → 1896 −23%; 1890s average 9% below the 1840s average. Jevons (1863) measured a lasting rise of about 9–15%. See `video/ep02/gold/SCRIPT.md`. |
| While Britain's money was gold, prices went up and down by up to a third, but 1913 ≈ 1821 | **Real** (long run, not year to year) | BoE CPI: 1821 1.257, 1913 1.244 (−1% over 92 years; Britain was on gold from 1821 to 1914). In between, CPI ranged from 1.043 (1851) to 1.405 (1867), and fell 23% from 1873 to 1896. For the US, Bordo (Econlib, "Gold Standard"): inflation averaged "only 0.1 percent per year" from 1880 to 1914, but "prices were highly unstable in the short run". |
| "Like €100 that buys the same shopping 92 years later" | **Illustration** | A translation of the row above into euros (the series' "In real life" convention), not a euro statistic. |
| Every jar halves when its pile doubles (rounds 2–5) | **Game (simplified)** | Prices followed the pile one for one. Real history was messier (demand changed too; see the outline's note on the demand side). The chapters' real multiples are on the Wren cards (cowries ×10, Rome ×37). |
| Yap's jar 8 → 7 | **Game**, after a real claim | By later accounts, O'Keefe's stones traded for less than the old ones (Bryan 2004, citing Gillilland 1975; chapter 1 fact check). The 7 is ours. |
| Pour times (2.8–3.4 s, with a 0.3 s delay and slow start), the ×2.6 cut-off, the point formula, 0.8 s a year | **Game** | Tuned for a calm phone pace: nothing in this game punishes slow fingers. |

## Edge cases
- **Holding through the card:** the press that closes a round card starts the pour (rounds 1–5), 0.3 s later and with a slow start.
- **A quick tap (under 150 ms, or any release before the pile moves):** closes the card if one is up; the pile stays at ×1; the button pulses `HOLD TO POUR`; the round waits. It never ends a round. The gold card needs a separate `READY` press, so a thumb still down from round 5 can't start gold unseen. Gold's first year starts only on a fresh press after `READY`.
- **Letting go in gold:** the rush pauses (`HOLD TO KEEP DIGGING` pulses gently). Nothing is lost, and there's no time limit.
- **Holding forever in rounds 1–5:** the ×2.6 cut-off ends the round.
- **Replays:** `PLAY AGAIN` skips the practice (the start panel offers `PRACTICE` again).
- **Reduced motion** (`prefers-reduced-motion`): no camera moves, the cube and line are both in view from the start, and the stamps fade instead of thumping.
- **Mute:** everything reads without sound (the year counter, stamps and loaves all carry the meaning).

## Sound and feel
- Music: the chapter's warm G-major loop at 96 bpm. During rounds 1–5 a short sting in that chapter's movie key plays on each card (Yap's C pentatonic, Rome's D-minor march…). On the gold card, the music settles back to G and stays there, steady: the money that didn't crash.
- Pour: a stream of that money's sound (stone thuds, bead patter, shell rattle, coin clinks), rising slowly in pitch as the pile grows, so the ×2 line can almost be heard. Gold: one soft clink per year, at the same pitch every time.
- Release: `PERFECT` is a bright two-note chime, `CLOSE` a single note, `TOO MUCH` a low thud. A loaf going grey is a soft pop (capped at 4 pops a round).
- Gold, end of the rush: no "fail" sound. Just the pour fading, and a quiet wind over the hillside.
- Fast-forward: one neutral tick per decade; no chime (the late-1800s fall in prices isn't presented as good news only).

## Testing (as for the other chapters)
- A bot through `window.__gold` (`{ S, press, release, start, practice }`), on a phone emulator (`PHONE=1 node tools/drive.js`): release at ×2 exactly (expect 600 − 100 = 500); release with a random ±0.1 s (expect about 460–500); hold through every round (each ends at ×2.6, 0 points, and the game still reaches the result); never let go in gold (it ends at 1860, ×1.36); a 100 ms tap on a round card (card closes, pile stays at ×1, round still waiting), and a 100 ms tap mid-round (nothing happens); in practice, an early release (pile back to ×1, coach line shown).
- Screenshots at 390 × 844 for the start panel, each practice step, round 4 mid-pour, the gold round mid-rush (cube and ×2 line both visible), the result, and the Wren card. Check that no text on the canvas is under 17 CSS px and that the result fits without scrolling past the buttons.
- First-timer check: someone who has never played can finish in under 1.5 min without reading anything while a pour is running.
