# EP 02 · Chapter 3 minigame: **Bead Rush** (design)

The movie is `video/ep02/wampum/` (narration, SCRIPT.md with sources). This is the 30 to 60 second game that follows it, then the one-card Wren moment.

## Pitch in one line
Drill wampum for the winter: slowly with stone, then fast with iron. Every few seconds the price board gets repainted, so you have to **spend before the beads go soft**. Grandmother's savings jar, which you can't touch, shrinks in front of you.

## Why it changes the outline's "Drill" pitch
The outline had tap-to-drill, then a steel drill, a counter that shoots up, and a sign that gets repainted. That's a good core, but on its own it **feels like winning**: the number goes up, the player is happy, and the lesson (your beads are worth less) is only a sign in the background. Three changes make the player *feel* the inflation instead:
1. **A goal priced in beads:** get a kettle and a wool coat before winter. The drill matters because it buys things.
2. **A choice under rising prices:** buy now, or keep drilling and buy later. Prices climb in steps, so waiting is a trap. The player *learns* the hot-potato behaviour of inflation (spend fast, saving loses) by doing it, not by reading it.
3. **A savings jar you can't spend:** two beads Grandmother put aside "for spring". A live label under it drains from "= 2 baskets of corn" to "= 0.4". Every player sees a saver lose, even one who played perfectly.

The drill itself stays exactly as the outline wanted: slow rhythm taps with stone, then fast taps with iron.

## Controls (one thumb, any orientation)
- **DRILL**: tap anywhere on the play area. Keyboard: `Space`. Mouse: click.
- **BUY**: three buttons, one per item, each showing its live price: `CORN`, `KETTLE`, `COAT`. Keyboard: `1`, `2`, `3`. A button greys out while you can't afford it, and pulses gold when you can.
- **Portrait phone (390×844):** full-screen play mode, as in the canoe run (`Ep02.playMode`). The canvas (320×180, pixel-scaled) goes on top. Under it are three big BUY buttons in a row (at least 56 px tall), and under those a **big drill pad** filling the rest of the screen. The thumb lives on the pad and slides up to buy. The drill pad shows the drill animation, so nothing is lost by not looking up.
- **Landscape phone or desktop:** the canvas fills the height, the BUY buttons sit in a column on the right edge, and tapping anywhere on the canvas drills. There is no "turn your phone" hint: both orientations are first-class.
- There's no drag, no double-tap, and no timing on the buy buttons. Only the stone phase asks for rhythm.

## Flow (about 45 s of play)
| Time | Phase | What happens |
|---|---|---|
| 0 | **Intro card** (tap to start) | "Winter is coming. Drill wampum. Buy a **kettle** and a **coat**." A small icon row shows the goal: kettle and coat. |
| 0–12 s | **STONE** | A pump drill with a crossbar bobbing up and down (1.25 cycles/s). A green "push" zone sits at the bottom of each stroke. **Tap in the zone** to grind one turn deeper (a scrape sound and shell dust). **5 good turns = 1 bead.** A tap outside the zone wobbles and gives no progress. 3 bad taps in a row **crack the blank** (a crunch sound) and the current bead's progress is lost. The most you can make is 3 beads; a typical player makes 1 or 2. Board prices: **CORN 1 · KETTLE 3 · COAT 4**. A good player can buy the kettle with stone beads, and it should feel earned. |
| 12–14 s | **Handover** | A trader's hand offers an iron drill point across the bench; your hand takes it and swaps it in for the stone one (clank, glint). It is the family's choice, not a gift that happens to them. Banner: `IRON DRILL!` Then, smaller: `…everyone got one.` Three neighbour benches in the background start going fast too. |
| 14–38 s | **IRON** (24 s) | No rhythm now: **3 fast taps = 1 bead**, with a pop whose pitch rises a little with your total. The counter flies. Meanwhile **every 2 s a painter repaints the board** (a brush swish, prices jump). Prices = base × P, with P running from 1 to 5 (see Numbers). At **12 s into the phase** a handcart tips a load of grey, chipped **rough and fake beads** into the village pile (a long rattle, P jumps ×1.25). Wren pops into the corner for 1.5 s: "Hey, that's my move!" Background bead piles in the neighbours' huts keep growing: the player's beads are not the only new ones. |
| 38–41 s | **Winter** | Snow starts falling and the board freezes. Unspent beads stay as beads. Grandmother opens the jar. |
| 41 s | **Result** | See below. |

### The moment the player feels it
Two moments, one active and one passive:
- **Active, from about 6 s into iron:** the player has more beads than ever (say 14), reaches for the COAT, and the painter repaints it from 5 to 6 *just* before they can afford it. Then 7. Then 9. The player is drilling flat out and the coat runs away. This is the beaver pelt from the movie, at the player's own fingertip. Tune it so a player who buys at once always gets the coat, and one who waits until the end often doesn't (table below).
- **Passive, the whole time:** the **SAVINGS jar** sits in the corner with 2 beads, labelled `GRANDMOTHER'S SAVINGS · FOR SPRING`. Under it a corn basket icon drains and the label ticks: `= 2 baskets` → `= 1.4` → `= 1` → `= 0.6` → `= 0.4`. The beads in the jar never change; only what they buy does. When it crosses 1 basket, flash it red once and show a one-line pop: **"Same 2 beads. Half the corn."** (Exact numbers come from P; show one decimal.)

## Numbers: real vs game

| Number | Value in game | Real? |
|---|---|---|
| Total price rise over the iron phase | **×5** (P: 1 → 5) | **Real ratio.** A beaver pelt in New Amsterdam went from about 640 white beads (1641) to about 3,200 (1662) (L. Jordan, Notre Dame, from Dutch records: market price in guilders-in-wampum × the official bead rate). In silver the pelt did not rise over those years (6–8 guilders, then 7 in 1660 and 6 in 1663), so the ×5 is the beads losing value, not beaver getting dearer. The game squeezes 21 years into 24 seconds and says so on the result screen. |
| Shape of the rise | P = 4^(t/24), repainted in steps every 2 s, then ×1.25 at the fake-cart moment (t = 12 s), capped at 5.0. Steps: 1, 1.12, 1.26, 1.41, 1.59, 1.78, **2.5** (cart), 2.81, 3.15, 3.54, 3.97, 4.45, 5.0 | Game. The real rise came in steps too (official rate changes in 1641, 1650 and 1658, plus market prices). The cart jump stands in for the 1641 flood of rough beads "from outside the province" and the 1658 flood "from New England". Prices are rounded up to whole beads. |
| Base prices | CORN 1, KETTLE 3, COAT 4 beads | Game values. Cloth and metal goods were real trade goods (Jordan: the Dutch traded "cloth, metal utensils"; in 1635 the Iroquois asked for wampum and "duffel cloth" per beaver); the prices are made up. |
| Stone drill | 5 good taps per bead; at most 3 beads in 12 s | Game. Stone drilling is real (Williams, 1643) and was "laborious" (Woodward, 1878), but **no sourced time per bead exists**, so nothing on screen claims one. |
| Iron drill | 3 taps per bead | Game. Metal tools let makers "work more efficiently" (Jordan, citing Peña), but no sourced speed-up factor exists. The game's ratio is a feel, not a fact. |
| Grandmother's jar | 2 beads, cannot be spent | Game. |
| End card facts | 6 beads = 1 penny (Massachusetts 1637, sums under 12 pence); 6 → 8 beads per stiver (New Amsterdam 1650 → 1658); about 640 → 3,200 beads per beaver pelt (1641 → 1662) | **Real.** Sources are in SCRIPT.md. |

### Balance check (simulated, buying the goal items whenever affordable versus waiting until the end)
| Tap speed in iron | Buy as soon as you can | Wait, buy at the end |
|---|---|---|
| 3 taps/s (casual) | kettle + coat + ~3 corn: **score ≈ 10** | coat only, no kettle: **score ≈ 5** |
| 5 taps/s | kettle + coat + ~11 corn: **≈ 19** | both, nothing else: **≈ 9** |
| 7 taps/s | kettle + coat + ~18 corn: **≈ 25** | both: **≈ 12** |

Spending early roughly **doubles** the score at every tap speed. That's the lesson, made into the scoring rule.

## Score
**WINTER SUPPLIES**, in baskets of corn, using the *stone-age* prices (corn 1, kettle 3, coat 4). It measures real stuff, not beads:
- Goods bought: corn 1 each, kettle 3, coat 4.
- **Plus** leftover beads at the final price (beads ÷ 5). This is what makes hoarding visibly worthless.
- Stars: ★ kettle · ★ coat · ★ score ≥ 15. Best score is kept in `localStorage` (`wth-ep02-wampum-best`, wrapped in try/catch).

## Result screen (short; phone first)
**Title:** `WARM THIS WINTER` if the player has both the kettle and the coat, otherwise `A COLD WINTER`.

> You drilled **{made}** beads: **{made/stone}×** more than with stone.
> They bought **{score}** baskets' worth. Not {made/stone}× more.
>
> **Grandmother's 2 beads:** 2 baskets of corn → **0.4**.
>
> [bar] STONE DAYS · 1 bead = 1 basket
> [bar, 1/5 length] END OF WINTER · 1 bead = 0.2 basket
>
> Spending fast beat saving. That's what inflation does.
> *Real: in New Amsterdam a beaver pelt went from about 640 beads (1641) to 3,200 (1662). Same ×5, squeezed into 24 seconds.*

On narrow screens (`.short`), drop the `{made/stone}×` sentence and the bars. Keep: the title, `You drilled {made} beads. They bought {score} baskets.`, the Grandmother line, the inflation line, and the real-numbers line. Buttons: `PLAY AGAIN` (ghost), `CONTINUE`.

If `made/stone` can't be computed (0 stone beads), say "You drilled **{made}** beads with iron." instead.

## Wren moment card
**Wren found a cave. Here, the cave was an iron drill.**
When money gets cheap to make, prices climb and **whoever holds it pays**. Ulm Hollow learned that with pentaja.

*(muted)* Next: cowries, the money that got too heavy to carry. `(coming soon)`

Tone: the player's family are the bead-makers and the iron is their choice, so the card must not read as "the colonists did it to them" or as "the makers cheated". It's about what happens to any money that gets cheap to make.

## Sounds and music in the game
- Stone: a scrape on each good turn, a dull tick on a bad tap, a crunch on a crack, and a warm `chime` when a bead finishes (a real reward: beads are rare here).
- Iron: a quick `pop` per bead, its pitch rising with your total, capped. A whirr on the drill pad while tapping fast.
- The painter: a brush swish on every repaint, plus a little `tone` slide upward. Fake cart: a long rattle. Buying: a register `clink` and the item flies to the hut.
- Music: the chapter's D-dorian theme. Stone uses the slow `island` version. Iron switches to the same theme at **double note density**, and the **tempo creeps up about 2% on every repaint**, so the music "inflates" with the prices. Winter: `mystery`, slow.

## Representation
- The player is a coastal bead-making family (Narragansett, Montaukett or a neighbouring people of the 1600s). Follow the art guardrails in SCRIPT.md: everyday Eastern Woodlands dress, generic belt patterns, no headdresses, no "tribal" drums.
- The family are skilled makers and traders who make their own choices (taking up iron, choosing when to buy). Nobody in the game is a fool or a victim of a trick; the trap is the money itself.
- Wampum belts never appear as currency in the game. Only plain strings and loose beads are spent.
- Before release, have a Native wampum maker or a museum educator check the game and the movie. This hasn't been done yet.

## Accessibility and polish notes
- Fake beads are grey **and** chipped, with no hole, so they never rely on colour alone. The board prices also flash and step, so they don't rely on sound alone.
- With `prefers-reduced-motion`: no screen shake on the cart, and the snow is a static overlay.
- The stone phase's green zone is generous (35% of the stroke) and the cycle is slow. It should feel *patient*, not hard.
- Tapping in iron is never punished, and the counter cannot get stuck: auto-repeat at a 10 taps/s cap if a key is held.
- A `?debug` URL flag (as in `yap.js`) to jump to the iron phase or the result.

## Page copy (above the game)
<span class="long">Drill beads for the winter, then buy a kettle and a coat. Watch the price board.</span><span class="short">Drill beads. Buy a kettle and a coat before winter.</span> Hint: `Tap to drill · 1 2 3 to buy` on desktop, `Tap the pad to drill` on touch.

## Sources box (page)
- R. Williams, *A Key into the Language of America* (1643), ch. XXIV ("Of their Coyne"), Project Gutenberg #63701.
- L. Jordan, *Colonial Currency*, University of Notre Dame Special Collections: "Wampum: Introduction", "Wampum in New Netherland", "The Beaver Pelt in New Netherland" and "Charts Illustrating Wampum Value Depreciation".
- Petition of the burgomasters and schepens of New Amsterdam, 19 Sept 1658, New York State Archives A1809 vol. 8 (translation via Mapping Early New York).
- E. Peña, "Wampum Production in New Netherland and Colonial New York", *BEADS* 2 (1990).
- A. Woodward, *Wampum* (1878), Project Gutenberg #23635.
- Game prices, drill speeds and the price curve's shape are made up. The ×5 rise is the real New Amsterdam beaver-pelt figure.
