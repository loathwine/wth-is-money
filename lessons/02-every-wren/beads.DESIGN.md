# EP 02 · Chapter 2 minigame: "The Bead Ship" (design)

**One goal per half, one score, about 50 s, one thumb.**
Half 1: you are Wren, the trader. Turn a crate of cheap beads into as much cargo as you can before the other ships arrive.
Half 2: same market, same prices, but now you are **Esi**, a made-up saver whose family kept its savings in beads for years (a what-if, like film b6). Feed the family through the dry season.

The player should *feel* that **spending new money first is winning, and saving the old money is losing**, and that both come from the same price line.

## Why this changes the outline's pitch (a little)

The outline pitch was: buy gold, ivory and palm oil with beads, watch prices climb, then "flip perspective" by showing the same chart from a saver's side. I kept all of it, with four changes:

1. **Other traders' ships arrive on a timer** (t = 7, 13, 19 s). Prices jump each time. That turns "prices go up" into a race you can win by tapping *early*. This is the real mechanism (whoever spends new money first buys at old prices; economists call it the Cantillon effect, but the page never says that word).
2. **The flip is playable, not just a chart.** In half 2 you use the *same tiles* at the prices **you** created in half 1. A chart is something you read; tapping YAMS and seeing your string shrink is something you feel.
3. **The better you play as Wren, the worse Esi's season is.** The result screen says so outright. This is the twist, and it's what makes the game more than a clicker.
4. **The accori.** Esi's string holds one real accori bead, whose price is set in goods, not beads, so it never inflates. That is the chapter's research result made playable: the bead nobody could copy kept its value: worth its weight in gold in the early 1500s (Francis 1990) and still "weighed against Gold" around 1700 (Bosman 1705). It's also a small "aha" for hard money ahead of the gold finale.

A one-tap gag ties back to the film: in half 1, a **"COPY ACCORI"** tile appears for 5 s. Tapping it plays a fire crack and shows "NOT FOOLED" (–1 s stun). The narration covers the copies failing, so the player learns by trying it.

**Tone rule:** the stalls sell only gold dust, ivory, palm oil (half 1) and food (half 2). People are never goods, prices or icons in the game. The slave trade is named in the film (b5) and on the sources card, never in play.

## Screens and layout

The canvas is `320×180` px art (same kit as `yap.js`: `px`, `hut`, `person`, `schooner`), with **DOM buttons** for the tiles so they are big, crisp and accessible.

| Element | Portrait (390×844) | Landscape / desktop |
|---|---|---|
| Market scene (canvas) | top, full width (~390×220) | left ~58% of width |
| HUD row: timer bar · beads left · score | under the canvas | over the tiles |
| 3–4 tiles (2×2 grid) | **lower half of the screen** (thumb zone), each ≥ 170×96 px | right column, 2×2 |
| Big tap feedback (+4 ⛁, price ↑) | floats over the tile | same |

Input: **tap / click a tile** = buy one. Keys **1 2 3 4** = tiles, **Space/Enter** = start / continue. Nothing needs dragging, so it works the same in portrait and landscape, and there is no "turn your phone" hint.

A **0.2 s cooldown per tile** keeps it from becoming a pure button-mash, and moving between tiles is rewarded.

Canvas content:
- **Half 1:** a beach market (huts, palms). Your ship sits at the left with a crate whose bead pile visibly shrinks. **The market's bead pile** sits in the middle and grows with every purchase and every ship. Ships appear on the horizon 1 s before they dock (a horn plus a flashing "SHIP!" arrow), so attentive players can rush before the jump.
- **Half 2:** the same market at a lower sun. **Esi's string** is drawn across the bottom of the canvas as ~30 visible beads (1 drawn bead ≈ 10 real beads) with the sky-blue accori in the middle. Each purchase **pulls beads off the string** with a clink.

## Rules and numbers

**Price model** (the quantity logic from EP 01, in one line): `price = round(base × M / M₀)`, where `M` = beads in the market and `M₀` = 2,000.
Every bead you spend joins the market (`M += price`), and every ship adds 1,000.

### Half 1: "YOU ARE WREN" (25 s)
| Tile | Base price (beads) | Cargo points |
|---|---|---|
| GOLD DUST (one pinch) | 40 | 4 |
| IVORY (one tusk) | 60 | 5 |
| PALM OIL (one jar) | 10 | 1 |
| COPY ACCORI (gag, t = 10–15 s) | – | 0 (fire crack, "NOT FOOLED", 1 s stun) |

- Your crate holds **4,000 beads**. If it runs out, the half ends early: "CRATE EMPTY: SAIL HOME!"
- Ships arrive at **t = 7, 13, 19 s**, each with **+1,000 beads**. The tiles flash red with ↑ arrows.
- **Score** = cargo points. Tested with a quick simulation of the model: 1 tap/s → ~100 points, prices ×3.5; 2–5 taps/s → 170–200 points, crate emptied, prices **×4.4** by the end.
- The first gold pinch costs 40 beads; by the end one costs ~140–175 beads. The player watches their own taps push it up.

### Half 2: "NOW YOU ARE ESI" (20 s)
Intro card (3 s, tap to skip): **"Imagine Esi. She makes and sells pots. Ten years of work: 300 beads on a string, plus one old accori. Last year, that fed her family for the whole dry season."**

(Not "weaves cloth": on the Gold Coast, strip-loom weaving was traditionally men's work, while pottery and market trading were women's. "Imagine" keeps her a what-if: see the note on bead savings in the table below.)

| Tile | Old price (before your ship) | Now | The family needs |
|---|---|---|---|
| YAMS (basket) | 20 | 20 × P | 5 |
| FISH (smoked) | 15 | 15 × P | 4 |
| SALT (cone) | 30 | 30 × P | 2 |
| LAMP OIL (jar) | 10 | 10 × P | 4 |
| ★ ACCORI | – | **always: 2 yams + 1 salt** | (one only) |

- **P** starts at the price level the player left at the end of half 1 (typically ×3–4.5).
- **Each tile shows the old price struck through next to the new one**, e.g. ~~20~~ **88**. This is the moment the player feels the inflation. The numbers are *theirs*: "You put 3,900 beads into this market."
- One more ship arrives at **t = 8 s** (+1,000), so prices rise mid-round. Waiting costs you, which is exactly why inflation pushes savers to spend.
- At old prices the needs cost **260 beads**, so 300 beads was a full season with some left over.
- **Esi's result** = days of food = `60 × (value bought at old prices) / 260`, capped at 60. Simulated: ×4.5 → **~15 days** from the beads; ×2.5 (a slow Wren) → ~25 days. The accori alone adds **~16 days**, whatever the prices.

## Real values and game values

| Number | Real or game? | Source / note |
|---|---|---|
| Prices rise because more beads chase the same goods | **Mechanism**, the same as EP 01 | No historical bead price series was found (see `video/ep02/beads/SCRIPT.md`, fact check b6). The documented West African case of money losing value through oversupply is cowries in the 19th century (Hogendorn & Johnson 1986, cited in Ogundiran 2002), which is chapter 4. |
| A family keeping its savings in ordinary beads | **What-if** | Beads were a real store of wealth and status (in Yorubaland, "the okun bead is the essence of wealth", Drewal & Mason, quoted in Ogundiran 2002), but the everyday money of the Gold Coast was gold dust, with cowries further east. So the intro says "Imagine", and the footnote says so too. |
| Base prices, cargo points, crate 4,000, ships +1,000, M₀ 2,000, Esi's 300 beads and needs, 60 days | **Game values** | Tuned so a good Wren run makes prices ×4–4.5. |
| Accori never inflates; price set in goods | **Game rule standing in for a real pattern** | The accori was "often worth its weight in gold" in the early 1500s (Francis 1990) and still "generally weighed against Gold" around 1700 (Bosman 1705, Letter IX). It held its value because nobody could copy it (Chouin 2023). Caveats: the accori was a prized ornament and heirloom, not everyday money (Francis 1990: "Aggreys were not used as currency"), so spending it on food is a game simplification. Bindloss's 1898 "more than thrice their weight in gold" is **not** used: his "Aggri" was a jasper-like bead, probably a different one. |
| Copies don't survive fire | Real detail, used as a gag | Portuguese pilot c. 1540 (Blake 1942, quoted in Francis 1990): glass look-alikes "will not bear the heat of fire" (Blake not read directly). The pilot does not say buyers tested beads in fire, so the gag shows the copy cracking and the merchant saying no, never a merchant running a fire test. |
| Footnote: "Around 1770, one Liverpool firm sold these beads at about 9 pence a pound." | **Real** | Guerrero 2010, p. 57 and n. 9 (William Davenport & Co. accounts, 1761–1782; Guerrero calls the price "very aggressive", and London asked 2s/lb in 1782). Shown only as a footnote, so the game never claims a £ profit ratio. |
| Gold, ivory and palm oil were what beads bought | **Real** | V&A trade-bead records; Museo Correr 2011. |
| "Esi" | **Fictional** | A common Akan (Fante) day name for a girl born on Sunday, fitting the Gold Coast. She is a made-up saver, not a historical person. A potter and trader, since those were women's trades there. |

## Flow and timings

1. **Start card** (tap): "**THE BEAD SHIP** · You are Wren. Your crate cost you pennies in Liverpool. Turn it into cargo before the other ships come. ▶ START"
2. **Half 1**, 25 s. Banner at 0 s: "BUY! BEFORE THE NEXT SHIP". Ship banners at 7, 13 and 19 s.
3. **Haul card** (1.5 s): "CARGO: 186 ⛁ · Prices are now ×4.4".
4. **Esi intro** (3 s, see above).
5. **Half 2**, 20 s. When the string is empty or the time is up, Esi's pile of food is shown as days on a 60-tick bar.
6. **Result screen**, then CONTINUE → the Wren moment.

## Result screen (short, phone)

> **YOU, AS WREN: 186 cargo**
> You bought your first gold for 40 beads. Your last cost 172.
>
> **ESI: 15 days of food** (last year: 60)
> Same string. You set these prices.
> ★ Her accori still bought what it always did.
>
> *The better you played Wren, the shorter Esi's season.*
> [PLAY AGAIN] [CONTINUE]

Below it, a small chart: the price line over both halves (the same line), with two dots: **"WREN BOUGHT HERE"** (early, low) and **"ESI BOUGHT HERE"** (late, high).
Muted footnote: "Game numbers, and a what-if: no one recorded bead prices like these. Real: around 1770, one Liverpool firm sold these beads at about 9 pence a pound. A real case of money flooding a market: cowries, chapter 4."

Variant text when Wren's cargo is under 30 (the player barely tapped): "**ESI: 25 days** (last year: 60). You hardly spent, but the other ships still came. Inflation doesn't need *you*." (With no taps at all, P ends at ×2.5 → ~25 days, or ~41 with the accori.)

Best score saved as `wth-ep02-beads-best` (the Wren cargo), and chapter done as `wth-ep02-beads-done`. Wrap all storage in try/catch, as `yap.js` does.

## The Wren moment card

> **When you're Wren, it feels like winning. Somebody always pays.**
> New money buys at old prices for whoever spends it first. Whoever saved the old money pays the difference, just like the pentaja savers of Ulm Hollow.

Muted line under it (like Yap's teaser): *Next: wampum, where the cave was a metal drill.*

(Not "the colonists found a drill": Native makers used the new metal drills too, so the line names the tool, not who held it.)

## Music and sound
- Half 1: the chapter's D-Mixolydian "heist" loop (see the SCRIPT music notes), with a glass `clink` per purchase whose pitch rises with the price, a horn and a whoosh on each ship, and a fire crack on the copy gag.
- Half 2: the same loop in D minor, slower. Each purchase is a soft clink of beads leaving the string. On the accori tap, the bright chime from film b7.
- Result: the hook's "mystery" song, as in Yap (`Chip.song(Chip.SONGS.mystery)`).

## Edge cases
- Tapping during the intro cards does nothing. A tap on a tile whose price exceeds your beads shakes the tile ("NOT ENOUGH BEADS").
- If the player does nothing in half 1, ships still arrive (P ≈ 2.5), so Esi still loses something: inflation doesn't need *you*.
- `prefers-reduced-motion`: no screen shake on ship arrival, and price tiles change without the flash.
