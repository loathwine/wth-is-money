# Chapter 4 minigame: "Goat money" (design)

**One goal:** buy one goat at the market before sunset, three times: in **the 1840s**, **1871** and **1890**. The goat's price never changes: **one silver dollar** (a game price). You pay in cowries.
**Length:** about 45 s of play, plus two 3-second cards between rounds.
**The feeling we want:** the money gets heavier in your thumb. In the 1840s the walk is about 8 taps. In 1890 it is well over 100, the load sways, and the sun is going down.

This follows the outline's "Buy a goat" pitch with three changes, and why:
1. **Tap to step** instead of steering. The player's own thumb does the carrying, so the weight of the money is *felt*, not just shown on a number. It also works the same in portrait and landscape.
2. **The 1840s / 1871 / 1890** instead of 1820 / 1860 / 1890, because we have *sourced* shell-per-dollar rates for one place (Dahomey) close to those dates: 2,000 in the late 1840s, 10,000 in 1871, and 20,000 both in the 1880s and in 1899 (so 1890, between them, is safe). We don't have one for 1820. The first card says "the 1840s", not a single year, because the source gives only "the late 1840s".
3. **A savings jar** that never changes (2,000 shells) shown between rounds. Carrying more shows the price going up; the jar shows **the saver losing**, which is the outline's real point.

## Numbers

| Thing | 1840s | 1871 | 1890 | Real or game? |
|---|---|---|---|---|
| Shells per silver dollar (Dahomey) | ≈ 2,000 | 10,000 | 20,000 | **Real, secondhand.** Law (1995) and Skertchly (1874)/Brunet (1900), via Pont Cháfer (2025) pp. 215–218: 2,000 in the late 1840s, 10,000 in 1871, 20,000 in the 1880s and 1899. A fourth stop that we read ourselves: Burton (1864), "the dollar … now buys 2½ heads at Whydah and Agbome" (5,000), via Johnson, *J. African History* 11 (1970), n. 57. Rates varied month to month. |
| Goat price | 1 dollar | 1 dollar | 1 dollar | **Game.** A deliberately fixed silver price, so only the shells change. Not a sourced goat price. |
| Shells you must deliver | 2,000 | 10,000 | 20,000 | Follows from the two rows above. |
| Weight per shell | ≈ 1 g (Maldive) | ≈ 2 g (Zanzibar) | ≈ 2 g | **Real, approximate.** Pont Cháfer (2025) p. 221 (Maldive "little more than 1g", East African "the double"). Real markets used a mix; the game assumes all Zanzibar shells after 1845, so 1871 and 1890 loads are the heavy end. |
| Load | ≈ 2 kg: a pouch on your hip | ≈ 20 kg: a basket on your head | ≈ 40 kg: two head-loads, so **two trips** | Arithmetic from the rows above (with a mix of shells, 1890 would be 20–40 kg). The 20 kg cap per trip (10,000 shells) is a **game** value (a rough real head-load). |
| Grandmother's jar | 2,000 shells = 1 goat | = 1/5 goat | = 1/10 goat | Follows from the real rates. |

Shown small under the result: *"Real: shells per silver dollar on the Dahomey coast. Game: the goat's price and the loads."*

## How it plays

**Screen:** a side view, 240×160 logical pixels, with the hut on the left and the goat seller on the right (about 1.5 screen-widths apart, scrolling). The sun sits on a sunset bar at the top. The HUD is big and below the canvas in portrait, or overlaid in landscape: **shell counter** ("10,000 / 10,000"), **kg on your head**, **taps** (a small counter, for the result screen).
- **Portrait (390×844):** the canvas spans the full width (×1.6 → 384×256 CSS px) at the top, with the HUD and a large invisible tap zone below it. The whole lower half of the screen is the button.
- **Landscape:** the canvas fills the height and the tap zone is the whole screen. No "turn your phone" prompt needed.
- **Desktop:** Space / → / click to step.

**Controls (one thumb):**
- **Tap = one step.** Each step's length is `base / (1 + kg / 8)`: at 2 kg a step covers about 1/8 of the walk, at 20 kg about 1/40.
- **Sway:** each step adds sway in proportion to the load. Sway settles by itself in about 0.4 s. Tap faster than the sway settles and the load tips: **SPILL**. 10% of the load scatters on the path (with a sad clink), and you lose those shells, so a short delivery means walking back for more. At 2 kg the sway never spills, so you can mash happily in the 1840s. That contrast is the lesson.
- **Hold** = steady safe walking at about 2 steps a second, for accessibility and tired thumbs. Rhythmic tapping just under the spill limit is faster, and that is the skill.

**Round flow:**
1. **Card (2 s):** "The 1840s · A goat costs 1 silver dollar = **2,000 shells**." Grandmother hands you the pouch from her jar.
2. **The 1840s (no timer pressure):** about 8 taps, a pouch on your hip, a happy marimba. Arrive, the seller takes the pouch, the goat follows you. *"Easy."*
3. **Card, the jar (3 s):** "Grandmother's jar still holds **2,000 shells**. In 1871 that's **⅕ of a goat**." The jar is drawn with a goat silhouette 1/5 filled.
4. **1871, sunset in 22 s:** 10,000 shells, a basket on your head, real sway. Most players spill once, learn the rhythm, and arrive with about 6 s left. The music drops a key.
5. **Card, the jar (3 s):** "Same jar. **2,000 shells**. In 1890: **1/10 of a goat**." The goat silhouette is 1/10 filled. The pouch from the 1840s is drawn next to two baskets: "**Same goat. Same silver dollar.**"
6. **1890, sunset in 34 s:** 20,000 shells. The 20 kg cap forces **two trips** (hut → seller → hut → seller), with heavy sway. Tuned so careful rhythm makes it with 1–4 s to spare, and mashing spills and runs out of sun. This is where the player feels it: **the same goat now costs a whole afternoon of carrying.**

**Score:** goats bought (0–3), then **seconds of sun left** in 1890 as the tiebreaker. Shown as e.g. **"3 GOATS · 2.4 s to spare"**. The best result is stored at `localStorage["wth-ep02-cowries-best"]` (in try/catch, as yap.js does). Also tracked for the result screen: total taps, and total kg carried.

## Result screen (short, phone-sized)

**If the player got all three goats:**
> **3 GOATS · 2.4 s TO SPARE**
> Same goat, same silver dollar.
> 1840s: **2,000 shells**, 8 taps. 1890: **20,000 shells**, 2 trips, 140 taps.
> Grandmother's 2,000 shells bought a goat in the 1840s.
> By 1890: **a tenth of one**. She never spent a shell.
> *Real: shells per silver dollar (Dahomey coast). Game: the goat's price and the loads.*
> [PLAY AGAIN] [CONTINUE]

**If the sun set in 1890:**
> **SUNSET · 2 GOATS**
> Twenty thousand shells is a lot to carry before the market closes.
> The seller would rather have the silver dollar. Wouldn't you?
> [TRY AGAIN] [CONTINUE]

(The tap and trip counts come from the actual run. Keep each line under about 45 characters where possible, so it fits 390 px without wrapping into a wall of text.)

## Wren moment (card)

> **Flood a money, and it turns into bogwool.**
> In Ulm Hollow, bogwool was too bulky to be money. Cowries got there the other way: by 1890, one silver dollar's worth of shells weighed about as much as a child.

Portrait: Wren (sprite id "wren").
Next line, muted: "Next: Rome, when Wren is the emperor."

(Source for the card: 20,000 shells a dollar in Dahomey by the 1880s, at 1–2 g a shell, is 20–40 kg, about the weight of a child of 6 to 12. Our arithmetic from the Numbers table.)

## Tone guardrail

The game is set in an ordinary 1840s–1890 market (goats, shells, a grandmother's savings). **No ships, slave traders or captives appear in the game.** The slave trade is named only in the narrated movie (c3), plainly and without game mechanics, as the outline requires. The seller and grandmother are ordinary market people who know exactly what a shell is worth; the seller's line about preferring silver is a sensible choice, not a joke at anyone's expense.

## Art and sound needed

- Sprites: a goat (walks behind you after a purchase, 1 extra frame of bleating), a clay jar, a pouch, a head-load basket (two sizes), a grandmother at the hut door, the seller under an awning, shells scattering on a spill (8–12 `cowrie` pixels), and a sunset gradient that shifts as the timer runs.
- Sound: `pop` per step (pitch drops as the load grows: 900 Hz at 2 kg, 400 Hz at 40 kg), a `clink` burst on a spill, a `chime` on a purchase, a goat bleat (a square wave with a fast vibrato), and the `sad` sting on sunset. Music: the chapter's F-pentatonic 12/8 loop. Each round pitches down a step and drops a layer (bell, then hats), so the music gets heavier with the money.

## As built (cowries.js)

- **Loads:** 1840s 2,000 × 1 g = 2 kg (pouch); 1871 10,000 × 2 g = 20 kg (one head-load); 1890 20,000 × 2 g = 40 kg = two 20 kg trips (cap 10,000 shells a trip).
- **Steps per walk:** `7 + 21 × kg / 20` (about 9 at 2 kg, 28 at 20 kg, 7 walking home empty).
- **Sway:** each step adds `0.06 + 0.5 × kg / 20`; it settles with a 0.5 s time constant; over 1 it spills. At 2 kg you can mash; at 20 kg two quick taps spill, and the steady limit is about 2.4 steps a second. A small bar over your head shows it (green → red).
- **Spill:** 10% of the load (rounded to 100) is lost on the path and you stagger 0.9 s. Arriving short means walking home for the rest, so a spill costs a few seconds of sun.
- **No mashing through:** a step only gets its full length if it comes 0.25 s or more after the last one (faster taps shuffle). Without this, mashing won: spills shrank the load, light loads walk fast, and the infinite jar at home refilled them (1871 with 7.5 s left after 12 spills). Simulated now (same formulas): hold 1871 ≈ 7.7 s left, 1890 ≈ 3.2 s; steady taps every 0.42 s: 10.0 s / 6.4 s; mashing every 0.12 s or faster: sunset in 1871 and 1890. The 1840s stay mashable (≈ 22 s left).
- **Hold** steps at a safe rhythm (≈ 0.5 s at 20 kg, never faster than 0.25 s), so a careful one-thumb player still gets all three goats: 1871 with ≈ 8 s left, 1890 with ≈ 3 s.
- **Cards between rounds** ignore taps for their first 0.9 s, so a thumb still mashing from the last round cannot skip the jar.
- **Timers:** 25 s / 22 s / 34 s. Score = goats × 1000 + tenths of a second left in 1890, stored in `localStorage["wth-ep02-cowries-best"]`.
- **Phones:** during a run the game takes the whole screen (canvas on top and a big STEP button under it in portrait; side by side when held sideways). No orientation lock. Cards between rounds show the jar (2,000 shells = 1 goat → 1/5 → 1/10).
- **Result:** the 1840s vs 1890 boxes (shells, kg, trips, steps from the run), the jar line, an "In real life" line (€2,000 in a drawer that a lifetime later buys what €200 used to), and the real-vs-game note.
