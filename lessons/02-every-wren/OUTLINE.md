# EP 02 · Every Wren in History: outline

It picks up from EP 01: the player has watched pentaja become money, and then watched it break once Wren found the cave. (Rod was renamed **Wren**, after the fable where the wren becomes king of the birds by riding on the eagle's back: the prize, without the work. Wren has no pronouns: just say "Wren".)

**Status (beta):** all five chapters are built: 1 Yap (`index.html`, movie + Canoe run), 2 glass beads (`beads.html`), 3 wampum (`wampum.html`), 4 cowries (`cowries.html`), 5 Rome (`rome.html`). The movies live in `video/ep02/<ch>/`, each with a `SCRIPT.md` fact check, and each game has a `<ch>.DESIGN.md` here. The gold finale (6) is not started.

**The one idea:** when someone can make money cheaply, the people holding it pay. Here's how five places found out, and what they did about it. Each chapter is a real "Wren".

Careful not to overclaim (the econ review): it happened **again and again** in history, not to *every* money, and not always the same way. Yap's rai survived (the islanders priced the new stones lower), Rome's Wren was the emperor himself, and cowries were also finished off by colonial taxes in coin. Inflation also has a demand side: money loses value when there's more of it, *or* when fewer people want to hold it. Value comes from scarcity and usefulness, never from "what it cost to make".

**Hook (about 25 s, built):** "Remember Wren? Wren found a cave full of pentaja… Wren is made up. But again and again in history, money has had a Wren." A fast montage: a stone wheel, a glass bead, a shell, a silver coin, each stamped CAVE!

## Lessons from EP 01 feedback

EP 01 works, but it is long and slow, so EP 02 has to be fast:
- Chapters are **about 3 minutes each**: a narrated movie of 60–90 s, a minigame of 30–60 s with a clear goal and a score, then a one-card **"Wren moment"** that links back to Ulm Hollow and ends with an **"In real life:"** line about euros and dollars.
- There's music from the start: a short chiptune loop per chapter, written in WebAudio like eduvid's `sfx.js`.
- Chapters are skippable and can be played in any order from a world map, with progress saved.
- The whole episode is about 15–18 minutes.

## Arc

The cases are in rough chronological order of their "cave", ending with the one money that resisted.

### 1. Yap: the island that spotted its Wren (good ending) · BUILT
- **Movie:** Yapese sailed about 400 km to Palau to quarry limestone discs (*rai* / *fei*). Some were taller than a person. Canoes were lost and people died. So few ever made it home that each was precious, and each had a known history. Big stones never moved: everyone simply *knew* who owned which one (a ledger kept in common memory).
- **The Wren:** David O'Keefe, an Irish American captain shipwrecked in 1871. He brought a ship and iron tools, quarried stones far more easily, and traded them for copra and sea cucumber.
- **The twist:** by later accounts, the Yapese priced his stones **lower** than the old ones. They spotted their Wren.
- **Minigame, "Canoe run":** steer a raft with a stone through waves and reefs, about 40 s. Then O'Keefe's ship glides past carrying ten, and the result compares your stone (~50 baskets) with an O'Keefe stone of the same size (a fraction: a ship could bring ten at a time).
- **Wren moment:** "On Yap, everyone knew each stone's story, so new stones could be priced lower and old savings stayed safe. In Ulm Hollow, a pentaja is a pentaja: Wren's cave made everyone's pentaja worth less." In real life: a euro is a euro too. Yap's money had a memory. Most money doesn't.

### 2. Glass beads, West Africa: this time *you* are Wren · BUILT (see beads.DESIGN.md)
- **Movie:** glass beads were rare in West Africa and highly valued. From the 1400s, European traders, first the Portuguese, brought glass beads made cheaply in Venice, Bohemia and the Netherlands, and used them to buy gold, ivory, palm oil, and enslaved people. As glassmaking got cheaper, the beads became a cheap way for Europeans to take real wealth. People who held their savings in beads were drained.
- **Minigame, "The bead trader":** you arrive with a crate of beads. Each round, tap to buy gold, ivory or palm oil, and watch the price in beads climb as your own beads flood the market. The score is the profit you skimmed. Then the game flips perspective: the same chart, seen by a family whose savings were beads.
- **Wren moment:** "When you were Wren, it felt like winning. The people who paid were the ones holding the old money, and the ones the new money reached last." (Reuse "spent first / reached last" in every chapter.) Historians still argue how much beads worked as money; the movie says so.
- ⚠️ **Tone:** the slave trade is named plainly in the narration and is never part of the game. You never "buy" people.

### 3. Wampum, North America: when the tools changed · BUILT (see wampum.DESIGN.md)
- **Movie:** shell beads, white from whelk and purple from quahog, were drilled by hand with stone tools, which took hours per bead. They were used in diplomacy and trade. Colonists short of coin adopted wampum: Massachusetts made it legal tender in 1637, at 6 beads to a penny for sums under 12 pence. Then metal tools made beads far faster, counterfeits spread, and its value sank. Massachusetts repealed it as legal tender in 1661. Later the Campbell factory in New Jersey (from 1746) turned out around a million beads a year.
- **Minigame, "Drill":** tap in rhythm to drill a bead with a stone drill (slow, about 20 taps). Then you're handed a steel drill (3 taps). Your bead count shoots up, and the "beads per penny" sign on the market wall keeps getting repainted.
- **Wren moment:** "Wren found a cave. The colonists found a drill. Same thing." Demand fell too, as the fur trade dried up.

### 4. Cowries, West Africa: the money that got too heavy to carry · BUILT (see cowries.DESIGN.md)
- **Movie:** cowrie shells from the Maldives were used as money across West Africa for centuries. They were scarce, uniform, hard to fake, and counted in strings and "heads" of 2,000. Then, from the late 1840s, German and French firms shipped much cheaper cowries from Zanzibar, about 27,000 tons in 30 years. A head of 2,000 worth about 4s 6d–5s early in the century fell to about 1s 6d by 1859, and kept falling to almost nothing by 1900 (Hogendorn & Johnson).
- **Minigame, "Buy a goat":** carry enough cowries across the market to buy one goat, in 1820, 1860 and 1890. A pouch becomes a basket, then a donkey cart, and the walk gets slower each time. (Size and weight from EP 01, felt directly.)
- **Wren moment:** "Remember how bulky bogwool never became money? Inflate a money enough and it turns into bogwool." Then colonial rulers demanded taxes in coins, which finished cowries off.

### 5. Rome: when Wren is the emperor · BUILT (see rome.DESIGN.md)
- **Movie:** the denarius was nearly pure silver under Augustus. Nero trimmed it slightly (around 64 AD). In the third century, the legions needed paying and emperors had no new silver, so each coin got less. By around 270 AD the coins were about 4–5% silver, bronze washed to look silver. Prices rose and old good coins vanished into hoards (Gresham's law). In 301 Diocletian's **Edict on Maximum Prices** fixed prices for over a thousand goods and wages, on pain of death. Goods disappeared from markets. Diocletian abdicated in 305, and the edict was a dead letter.
- **Minigame, "The emperor's mint":** each year, legions demand pay. Choose how much silver goes into each coin and mint. The prices of grain and soldiers' patience react, and old coins vanish from circulation into hoards. In the final year a button appears: **FIX PRICES BY LAW**. Pressing it empties the market stalls.
- **Wren moment:** "Wren only got lucky. An emperor can dig the cave himself, and order you not to notice." The law said a bad coin counted as much as a good one, so people spent the bad ones and hid the good (unlike Ulm Hollow, where the better money won).

### 6. Finale: is there money without a cave?
- **Movie:** one chart with every money from this episode, each line ending in a crash. Then gold. About 3,100 tonnes are mined a year against roughly 200,000 tonnes ever mined, so new supply adds only about 1.5–2% a year. Gold got flooded too, in the rushes of 1849, but only by a few percent a year, and only for a while (Jevons 1863: prices up roughly 9–15%). Nobody has found a cave big enough.
- **Callback to Yap:** Germany's black crosses on stones that never moved (1899–1914), next to the Banque de France's gold "moving" in 1932 without leaving its vault: the parallel Friedman draws in *The Island of Stone Money* (1991). Moved here from chapter 1 so Yap stays in time order.
- **Question for EP 03:** "Why can't anyone find gold's cave?" → **EP 03 · Why Gold?**
- **Final card:** a "Wrens of history" timeline that collects each chapter's Wren as a card.

## Production

- **Movies** are canvas scenes plus Gemini TTS narration, using the eduvid pipeline: `narration.json` → `tts.sh` (the speak skill) → `timeline.json` → `scene.js`. They play live in the page, synced to the audio, and the same scenes can be rendered to MP4 with `render.mjs` for YouTube.
- **Art:** the same pixel style and palette as EP 01, with Wren as a recurring cameo.
- **Music:** one 8–16 bar chiptune loop per chapter, written procedurally, plus the EP 01 SFX.

## Fact check

| Ch | Claim | Source / status |
|---|---|---|
| 1 | O'Keefe was shipwrecked near Yap in 1871, supplied iron tools, and got stones for the Yapese in exchange for copra and trepang. | UGA, David Dean O'Keefe collection (sclfind.libs.uga.edu/catalog/ms3808). ✓ |
| 1 | O'Keefe's stones traded at a lower value than older stones. | Bryan (Cleveland Fed, 2004), citing Gillilland (1975). ⚠️ Furness (1910) saw them as genuine wealth, hence "by later accounts". |
| 1 | The German administration painted black crosses on stones to make chiefs repair paths. | Friedman, *The Island of Stone Money*, Hoover WP E-91-3 (1991), citing Furness. ✓ |
| 1 | About 450 km to Palau; stones taller than a person; deaths on the voyage. | Furness (1910) ch. VII ✓ (he says "four hundred miles", an overestimate; ~450 km is the real distance). No casualty figure, so the movie only says "not everyone made it back". |
| 1 | A stone lost at sea still counted as owned. | Furness (1910) ch. VII, told to him by Fatumak. ✓ |
| 2 | Aggry beads were made in Venice, Bohemia and the Netherlands; Portuguese trade from the 15th century; used for gold, ivory, palm oil and slaves; production got cheaper over time. | V&A collection notes (collections.vam.ac.uk, trade beads). ✓ Bead *inflation* figures still **need a source** (Bitcoin Standard ch. 2 cites this; find a primary source). |
| 3 | Legal tender in New England 1637–1661; Massachusetts, 15 Nov 1637: 6 per penny under 12 pence; repealed 22 May 1661. | Wikipedia *Wampum*; Boston Fed, *History of Colonial Money*. ✓ |
| 3 | Metal tools took over production by the late 1600s; the Campbell factory (1746) made about 1M beads a year. | Wikipedia *Wampum*. ✓ The "hours per bead by hand" figure **needs a source**. |
| 3 | Its value sank as supply grew and counterfeits spread. | Boston Fed. ✓ Concrete depreciation numbers (beads per penny over time) **still needed**. |
| 4 | About 27,000 tons of Zanzibar cowries in 30 years from the late 1840s; a head of 2,000 fell from about 4s 6d–5s to 1s 6d by 1859. | Hogendorn & Johnson, *The Shell Money of the Slave Trade* (CUP 1986); AU library, *The Cowrie Currencies of West Africa*. ✓ The "16 billion shells" figure is also cited; pick one. |
| 5 | By 250 AD about 40% silver; by 270 AD about 4%. Under Gallienus the antoninianus fell to about 5%, silver-washed. | Mises Wiki *Money and banking in ancient Rome*; Exeter *Comparative Chronology of Money*. ✓ Prefer a numismatic source (e.g. Walker's metallurgical analyses) for the script. |
| 5 | Diocletian's Edict on Maximum Prices, 301; death penalty; abdication 305; a dead letter by then. | Mises Wiki; Lactantius, *De Mortibus Persecutorum* 7, for goods disappearing. ✓ |
| 6 | About 3,100 t a year mined against about 192–216 kt above ground, about 1.6% a year. | World Gold Council figures, as quoted by BullionStar and others. ✓ Use the latest WGC numbers in the script. |

The detailed, per-line fact checks are in each chapter's `video/ep02/<ch>/SCRIPT.md` and `<ch>.DESIGN.md`.

## Open questions for the user
1. Are these the right five cases? Roman debasement could be swapped for the **Spanish silver from Potosí** (the 16th-century price revolution), or both kept (about +3 min).
2. The tone of chapters 2 and 4 (beads and cowries both tie into the slave trade): is the approach above OK?
3. Should we polish EP 01 first (music, faster pacing, minigame feel), or go straight to EP 02 and bring the polish back to EP 01 afterwards?
4. Movies in the page only, or also rendered to MP4 for YouTube like eduvid?
