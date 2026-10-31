# EP 02 · Chapter 5 minigame: The Emperor's Mint (design)

**One goal:** pay the legions every year from AD 14 to 270 without wrecking the savings of Marcus, a retired soldier.
**One-line rules on screen:** *Hold MINT to pay your soldiers. Out of silver? Add copper.*
**Length:** 10 pay days of about 4.5 s each (about 45 s), then a finale in AD 301 (about 8 s). That's 50–55 s in total.
**Controls (one thumb):** hold **MINT** (big button, bottom centre); tap **+ COPPER** (just above it). Keyboard: hold **Space** to mint, **C** (or **↓**) to add copper. Mouse: press and hold MINT. No timing skill is needed: holding MINT for about 2.2 s fills a pay day, and there are 3.4 s to do it.

## Why it differs from the outline's pitch
The outline's idea is kept (legions demand pay, you pick how much silver goes into each coin, prices react, old coins vanish into hoards, a final **FIX PRICES BY LAW** button empties the stalls). Three changes make it work for a novice on a phone:
1. **A tap, not a slider.** "+ COPPER" cuts the silver in each new coin by a fifth (98% → 78% → 63% …). One thumb, one decision, and you can watch the coin change colour. You can't take copper back out, because you'd need silver you don't have.
2. **Marcus and his jar** sit on screen the whole time: a veteran whose 3,000-coin discharge bonus is his life savings. His "days of bread" number is the inflation you *feel*. The soldiers you pay and the saver you hurt are the same person a few years later.
3. **The score rewards both** surviving *and* Marcus's savings. Honest coins get you killed, and greedy coins ruin Marcus, so the best play is "just enough copper, as late as possible". That trade-off is the lesson, and it gives skilled players something to optimise.

## Screen layout
Logical canvas 180×320 in portrait (or 320×180 in landscape; the same three zones side by side). The buttons are HTML in the bottom 25% (portrait) or the right column (landscape).

| Zone | What's drawn |
|---|---|
| **Camp** (top) | 6–10 legionaries in a row, each with a small pay bar. A counter `PAY DAY: 72 COINS`. Year card `AD 84 · DOMITIAN RAISES PAY`. Anger: up to 3 red helmets in the corner. |
| **Mint** (middle) | The silver vat (a grey bar = silver left this year), a big spinning coin whose colour runs from white-silver to orange-brown, and a label `SILVER: 63%`. Coins stream from the mint up to the soldiers while MINT is held. |
| **Market** (bottom strip) | A bread stall with a price tag `LOAF: 1 COIN`. Marcus (grey beard, old red tunic) beside his clay jar `3,000 COINS`, and a shelf of loaves with the number `= 8 YEARS OF BREAD`. Old shiny coins sit in a pot under the stall (for the Gresham beat). |

## One pay day (about 4.5 s)
1. **0.6 s:** the year card slides in with the event, and soldiers line up. The bill is shown in coins.
2. **3.4 s:** the player holds MINT. Each coin uses silver from the vat according to the current purity. If the vat empties, the mint sputters, the button greys out, and **+ COPPER** pulses with `OUT OF SILVER`. Each tap stretches what's left of the silver over 25% more coins. When the bill is met, the soldiers salute (chime).
3. **Trumpet:** fully paid gives +100. Short gives +1 anger (a red helmet), and the soldiers grumble. **3 anger = mutiny**, and the game jumps to the finale.
4. **0.5 s market beat (the feeling):** the loaf price updates to match this year's coins, and Marcus's shelf loses loaves with little pops. The number ticks down: `= 8 YEARS` → `= 5 YEARS` → … The first time the price rises, a tip appears once: **"Same bread, thinner coins, higher price. That's inflation."** The first time purity drops, a second tip: **"People hide the old silver coins and spend your new ones."** Three shiny coins hop into the pot.

## The model (game values tuned to land near history)
- **Silver per year:** a fixed 60 units (1 unit = the silver in one 98% coin). The empire's silver income doesn't grow.
- **The year's bill** in "honest coins" = 60 × *g*, where *g* rises with the events below (wars, pay rises, more soldiers). In coins, it's that × **this year's loaf price**, because soldiers want bread, not metal.
- **Loaf price** for next year = 98 ÷ (the average silver % of the coins you minted this year). It starts at 1 coin. Prices catch up one year late, so copper buys you **one** easy year, and then the bill grows to match. That's the treadmill.
- **+ COPPER** = purity × 0.8. The coins you can mint from the remaining silver = remaining units × 98 ÷ purity.
- **Marcus's days of bread** = 3,000 ÷ loaf price (one loaf a day; 3,000 days ≈ 8 years at the start).
- **Score** = 100 per pay day met + Marcus's days of bread left at the end (in the AD 301 market, before the edict). Best is saved in `localStorage` key `wth-ep02-rome-best` (wrapped in try/catch, like yap.js).

| # | Year card (real event) | *g* | Soldiers |
|---|---|---|---|
| 1 | AD 14 · Augustus: coins 98% silver | 1.0 | 6 |
| 2 | AD 64 · Great Fire of Rome | 1.0 | 6 |
| 3 | AD 84 · Domitian raises pay by a third | 1.2 | 6 |
| 4 | AD 170 · Plague and war on the Danube | 1.3 | 7 |
| 5 | AD 197 · Severus showers the army with money | 1.4 | 7 |
| 6 | AD 212 · Caracalla raises army pay again | 1.5 | 8 |
| 7 | AD 238 · Six emperors in one year | 1.6 | 8 |
| 8 | AD 251 · Plague | 1.6 | 9 |
| 9 | AD 260 · Emperor Valerian captured by Persia | 1.8 | 9 |
| 10 | AD 270 · Aurelian: war on every border | 1.9 | 10 |

**Simulated play** (checked with a script):
- **Just enough copper** (tap only when the vat is dry): all 10 pay days met; the coin ends at **~1.4% silver**; a loaf goes from **1 → ~35 coins** by AD 270 (real Egypt reached a similar **37×**, 8 → 300 drachmas a sack, but only by AD 293: see "History vs game" below); Marcus is left with **~6 weeks** of bread out of 8 years. Score ≈ 1,040. A skilled player who taps mid-year, only when dry, keeps the average purity a bit higher and does better.
- **Honest** (never add copper): short in years 3, 4 and 5, so **mutiny in AD 197**, with a score of 200. **Rule:** Marcus's days count only if you reach AD 270, so refusing to play can't win. After a mutiny, a "successor" plays out the remaining years on the "just enough" path (shown as a 2-second fast-forward of the year cards). The finale then uses those prices, so every player sees the edict.
- **Greedy** (+2 extra taps each year): every soldier is happy, the loaf costs **2,465 coins** by AD 270, and Marcus is left with **0 days**. Score ≈ 1,000.

## Finale: AD 301 (the edict)
The camp fades. The market strip grows to fill the screen. A card built from the player's own prices: **"AD 301. In your Rome, a loaf costs {N} coins. Under Augustus it cost 1. The crowd blames the bakers."** (About 70 on the "just enough" path.)
Two buttons:
- **MAKE COINS HONEST AGAIN** is dimmed: *"You'd need {N} times more silver than you have."*
- **FIX PRICES BY LAW** glows.

Pressing it: a stone tablet thuds down, `MAX PRICE: 10 COINS` stamps onto every tag, and the crowd cheers for a second. Then the bakers pack up and leave one by one (`LOAVES FOR SALE: 40 → 0`), the guard stands in front of empty stalls, and Marcus walks up with his jar: **"At 10 coins, I could buy 300 loaves… if there were any."** Caption: *A writer of the time: "men were afraid to expose anything to sale."*
(Keyboard: **F** or Enter presses it. It is the only live button, so a single tap anywhere on it works.)

## Result screen (short, for a phone)
**Pay days met (10 of 10):**
> **ALL LEGIONS PAID, AD 14–270**
> Silver in your coin: **98% → 1.4%** · Real Rome by 270: **under 5%**
> A loaf by 301: **1 → 70 coins** · Real Egypt: wheat **8 → 300** drachmas a sack by 293, **640** by 301
> Marcus's 3,000 coins: **8 years of bread → 6 weeks**
> Then you capped prices by law, and **the bread disappeared.**
> SCORE **1,043** · best 1,043
> *Real: under Augustus, a veteran's bonus of 3,000 denarii was 13 years of a soldier's pay. On Diocletian's price list of 301, 3,000 denarii was 120 days of a farmhand's wage (plus meals).*
> [PLAY AGAIN] [CONTINUE]

**Mutiny:**
> **MUTINY, AD 197**
> Your coins stayed honest, so the soldiers went unpaid. They picked a new emperor. That happened to many real emperors of this era.
> Your successor added the copper for you: Marcus's jar ended up at **6 weeks of bread** anyway.
> [TRY AGAIN] [CONTINUE]

**Greedy (Marcus at 0 days):** the same as the full win, with the Marcus line in red: *"Marcus's 3,000 coins: 8 years of bread → **less than a day**. You paid him in coins you made worthless."*

## Wren moment card
> **Wren had to find a cave. An emperor owns the mint.**
> Each thinner coin quietly took a little from everyone holding coins, Marcus included. When prices rose, Rome blamed the sellers.
> *Next: the finale. Is there money with no cave at all?*

## Real numbers vs game numbers
| Number | Real or game | Source / note |
|---|---|---|
| 98% silver under Augustus | **Real** | NGC Ancients, *Decline of Roman Silver Coinage* I and II (2018); Butcher & Ponting, "The Denarius in the First Century" ("essentially pure silver bullion"). |
| ~50% by AD 194–200 | **Real** | Gitler & Ponting (2007): 46.8% average for Severan denarii. |
| Under 5% by 270 (often ~2.5% under Gallienus) | **Real** | NGC Part II; RIC/MOM *Monetary system* ("almost entirely of copper" by 268; Aurelian's 274 coin "guaranteed at 5%" with a silver wash). |
| Egyptian wheat 8 → 300 drachmas (AD 100 → 293), 640 in 301 | **Real** | Scheidel (2008); Robertson (2015), Table 1, citing Duncan-Jones (1976) and Rathbone (1996). The 640 of 301 comes after the currency edict of September 301 doubled coin face values. |
| Veteran's bonus of 3,000 denarii (12,000 sesterces) | **Real** | Cassius Dio 55.23 (AD 5): 12,000 sesterces for legionaries after 20 years. |
| Legionary pay of 225 denarii a year → 13 years of pay | **Real** | Speidel (1992); 3,000 ÷ 225 ≈ 13. |
| Farmhand at 25 denarii a day; 3,000 ÷ 25 = 120 days | **Real** | Edict of 301, VII.1a (Kropff trans.). |
| Year events (Great Fire 64, Domitian's raise 83/84, Antonine plague and Marcomannic wars 160s–170s, Severus' gifts to the army 197, Caracalla's pay rise 212, six emperors 238, Plague of Cyprian from 249/250, Valerian captured 260, Aurelian 270–275) | **Real** events | Domitian: +⅓ (225 → 300 denarii), Speidel (1992); some sources date it 83. Severus: Herodian 3.8.4–5 ("large sums of money", new privileges, the first ration increase); a rise in base pay is inferred by modern scholars (Speidel 1992) but its size is disputed, so the card says "money", not "pay". Caracalla: Herodian 4.4.7 (2,500 denarii a head and the ration allowance up by half); the often-quoted "+50% pay" is a modern reconstruction, so the card names no amount. The card for 197 no longer quotes "Enrich the soldiers": Severus said that on his deathbed in 211 (Dio 77.15.2). The *g* values attached to the events are **game** values. |
| Many emperors killed by their own troops | **Real** | E.g. Severus Alexander (235, by mutinous soldiers), Gallienus (268, by his own officers), Aurelian (275, by officers of his guard), Probus (282, by his soldiers). The screen says "many", not a count. |
| 60 silver per year, *g* values, ×0.8 per copper tap, a 1-year price lag, 1 loaf a day, loaf = 1 coin at the start, max price 10, 40 loaves for sale | **Game** | Tuned so that "just enough" play lands near the real silver % and price rise. |
| The edict emptied the market | **Real (contemporary claim)** | Lactantius, *De Mortibus Persecutorum* 7 (a hostile source). |
| One saver, Marcus, from AD 14 to 301 | **Game** | Nobody lives 287 years: read Marcus's jar as a family's savings handed down. The card can say so once ("Marcus, then his children, then theirs…") if testers notice. |
| A loaf costs 1 coin under Augustus | **Game** | A real loaf cost a small fraction of a denarius. Only the *ratios* (how many times prices rose) are meant to match history. |
| The 1-year price lag | **Game (simplified)** | In real Egypt, wheat prices crept up (8 → about 16 drachmas from AD 100 to 260) while the coin lost most of its silver, then leapt about tenfold around 274 (Rathbone 1997; Kelly 2021, *TRAJ* 4, doi:10.16995/traj.4338). The game's quick catch-up keeps a 50-second run readable. If a later version wants the real shape, make prices sticky for several years and then jump when purity falls under about 10%: the "flat, then a cliff" chart in the video (r6) already teaches it. |

## Sound and feel
- The chapter's D-minor march at about 120 bpm. Each copper tap drops the bass a semitone (it sounds "cheaper").
- Minting: a fast clink per coin, whose pitch drops as purity falls (silver rings, copper clunks).
- The soldiers' salute is a chime; a short pay day is a low grumble and a helmet thud; a mutiny is a drum roll that cuts out.
- The market beat: one soft pop per lost year of bread (capped at 8 pops).
- The edict: a tablet thud, a crowd cheer, then whooshes as each baker leaves, then silence.
- Phones: the run takes over the full screen like the canoe run, but it works in **portrait too** (no "turn sideways" prompt), because the layout is three stacked zones.
