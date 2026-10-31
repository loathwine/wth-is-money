# EP 02 · Every Wren in History: script notes (chapter 2, Glass beads: "this time YOU are Wren")

**Purpose:** let a viewer with no economics background *feel* two things: (1) being the one who brings cheap new money feels like winning, and (2) the people who saved the old money pay for it. Then contrast that with the one bead nobody could copy, which kept its value for two centuries.

The narration lives in `narration.json`: 9 lines, 230 words, about 94 s at the Yap pace (2.44 words/s including gaps), plus 3.7 s of pads.
It uses the same pipeline and conventions as `../yap/` (`tts.sh beads` → `trim.sh` → `build.py beads` → `scenes.js` / `cues.py`).
`b5` has its own TTS `style` (quiet and grave); the other lines use the default narrator.
Scene names are prefixed or unique (`beadflood`, `beadcallback`, and so on) so they never collide with Yap's `SC.flood` / `SC.callback` if both chapters' scenes are ever loaded together.

Word numbers below are **0-based** indices into the segment's text, as in `word(s, n)` / `w("b4", 13)`. They were recounted after the fact-check edit; recount if a line changes.
Wren is drawn with `alien("wren", …)` once the rename lands; until then, use the Rod sprite. Wren is never given a gendered pronoun in on-screen text.

**What changed in the fact-check pass (and why):**
- b2: "was worth" → "could be worth" (Francis: "often worth its weight in gold"); "Old ones passed from hand to hand" → "All were old" (old beads were also dug up from ancestral sites, so "hand to hand" was too neat).
- b3: "were never fooled" → "could tell the copies apart". "Never" came from an 1898 colonial writer who may describe a different bead, and imitations did circulate (the c. 1540 pilot saw people wearing glass look-alikes).
- b4: "By the seventeen hundreds" → "By the late seventeen hundreds" (the "tens of millions" figure is for 1750–1800). "About fifty kilos" → "nearly fifty" (the sum gives 47 kg). Added "Coastal merchants still bargained hard" so the cheap Liverpool price can't be heard as "Africans were fooled by trinkets" (Guerrero's own conclusion).
- b5: the old line listed people last, after gold, ivory and palm oil. But the ships that carried these Liverpool beads were slave ships (Guerrero's 61 Davenport "slave trading ventures"), so the narration now says plainly that buying people came first. Palm oil was dropped from the narration (it became a big trade only after 1807); it stays in the game as a real but minor cargo.
- b6: "Picture a family…" → "Imagine your family…", and "Every ship brings…" → "If every ship brings…". There is still no bead price series, so the line is now an explicit what-if, and the screen says IMAGINE.
- b7: the 1898 "more than three times their weight in gold" (Bindloss) was replaced by Bosman c. 1700, "weighed against Gold". Bindloss's "Aggri" was "resembling jasper", which is not the sky-blue accori of the 1500s, so it was the wrong evidence for "the accori held its value". Bosman names the accori itself.
- b9: "where shells were money" → "where shell beads became money". Wampum was first a diplomatic and ceremonial object; it became currency in trade with the colonists.

---

## b1 · `beadtitle`: "Chapter two: glass beads. And this time... you are Wren."

| Word | Visual | On screen |
|---|---|---|
| 0 | Dark starry background (same as `SC.title`). A single blue `bead()` drops in and spins slowly in the centre. | `CHAPTER 2` (muted, small) |
| 2 "glass" | Title types in under the bead. | `GLASS BEADS` (gold, big) |
| 4 "And" | The bead slides left. Wren walks in from the right, looks at the camera, and puts on a sailor's tricorn hat (a 4-px black triangle). | |
| 7 "you" | The camera "points" at the viewer: a pixel hand or arrow pops out toward the screen. | `YOU = WREN` stamp (pink, `stamp()`) |
| end | Fade out (`pad` 1.2 s lets the stamp sit). | |

## b2 · `accori`: "West Africa, five hundred years ago. On the Gold Coast, a rare blue bead, the accori, could be worth its weight in gold. All were old. Nobody made new ones."

| Word | Visual | On screen |
|---|---|---|
| 0 | Simple map: the West African coastline bulge (lo-res polygon), with a gold dot labelled "Gold Coast" (today's Ghana). Use `where()`. | `WEST AFRICA · 1500s` |
| 6 "On" | Zoom (crossfade) into a coastal market: sand, palms (`palm()`), two huts (`hut()`), and a merchant with a small balance scale. | |
| 10 "a" | A single sky-blue bead (new prop `accori(cx, cy, s)`: plain translucent sky blue with a sea-green inner highlight; NOT the chevron `bead()`) floats up and glows. | `ACCORI` label |
| 18 "worth" | It drops onto the left pan of the scale. Gold dust pours onto the right pan until the scale **balances** at word 20 "weight". | `= ITS WEIGHT IN GOLD` |
| 23 "All" | The bead passes from an elder's hand to a young person's (one 1-px arc): an heirloom. | `ALREADY OLD` (small) |
| 26 "Nobody" | The workshop icon (a tiny kiln) gets a grey "closed" X. | `NO NEW ONES MADE` (small) |

## b3 · `copies`: "Now you're a European trader. It's only glass, you think. I can make that! Europe's glassmakers tried. But people on the coast could tell the copies apart."

| Word | Visual | On screen |
|---|---|---|
| 0 | Cut to Wren in the tricorn on a ship's deck (`schooner()` hull bottom-left), with the coast in the background. | `YOU, THE TRADER` |
| 5 "It's" | A thought bubble over Wren shows the accori, then `= GLASS?` | |
| 10 "I" | Wren's eyes light up (2 frames of gold pixels). | `I CAN MAKE THAT!` (speech bubble) |
| 14 "Europe's" | Split screen right: a glass furnace (orange glow) in "VENICE", and a glassblower pulling out a blue bead copy. Three copies pop out, plink plink plink. | `VENICE · HOLLAND` |
| 17 "But" | A plain side-by-side for the viewer (no hands, no buyer): the real accori and a copy sit by a small fire. The copy **cracks** (2-frame white split); the accori doesn't. This illustrates a property of the beads, not a test anyone is recorded doing. | `GLASS COPIES "WILL NOT BEAR THE HEAT OF FIRE"`, then a source line in small muted text: `A PORTUGUESE PILOT, c. 1540` |
| 22 "could" | Back at the market, the merchant looks at the copy, then hands it back to Wren with a shrug. A pink stamp lands. | `NOT FOOLED` |

## b4 · `beadflood`: "New plan: ordinary beads, by the ton. By the late seventeen hundreds, Venice made tens of millions a year. In Liverpool, the price of one ounce of gold bought nearly fifty kilos. Coastal merchants still bargained hard."

| Word | Visual | On screen |
|---|---|---|
| 0 | Wren tosses the copy over the shoulder. Hard cut to a warehouse with barrels. | `NEW PLAN` |
| 2 "ordinary" | Barrels tip and ordinary small beads (1–2 px dots in red, white, blue, yellow) **pour** across the floor. Reuse the h1 spill loop with ~150 dots and `hash()` positions. | |
| 7 "By" | A year counter in the corner rolls `1600 → 1700 → 1780`. | |
| 12 "Venice" | A counter ticks up fast. | `BEADS A YEAR: TENS OF MILLIONS` (with digits rolling past 10,000,000) |
| 19 "In" | A balance scale again (rhymes with b2). Left pan: one small gold coin `coin()`, labelled `1 OZ GOLD`. The right pan fills with sacks (`sack()`), stacking 1 → 7 sacks, until it balances at word 30 "fifty". Wren cameo in the bottom corner, a wink and a speech bubble `THAT'S MY MOVE!` (no voice), at word 28 "bought". | `1 OUNCE OF GOLD = NEARLY 50 KG OF BEADS` |
| 30 "fifty" | Small text bottom. | `LIVERPOOL PRICES, 1760s–1780s` |
| 32 "Coastal" | Cut to the beach market: a merchant behind a table looks at Wren's open sack, shakes their head, and pushes back a counter-offer (a tally of fingers). Wren's grin slips a little. | `HARD BARGAINING` |

*The rhyme between scales is the point: in b2 one bead balances its own weight in gold; in b4 one ounce of gold outweighs a sack-mountain of beads. The last beat stops the viewer from reading that as "Africans were fooled": the beads were cheap in Liverpool, not on the coast.*

## b5 · `cargo`: "Ships carried them south, with cloth, iron and guns. They bought gold and ivory. Above all, Liverpool's traders bought people. Glass beads helped pay for the Atlantic slave trade."

**Tone:** no jokes, no Wren cameo, no bouncing animation, no music after word 14. Muted palette (desaturate the ship colours by about 40%).

| Word | Visual | On screen |
|---|---|---|
| 0 | A ship (`schooner()`) sails slowly right to left along a dusk coastline. Small cargo icons appear in its hold one by one: bolt of cloth (word 5), iron bar (word 6), musket silhouette (word 8). | |
| 9 "They" | On the shore, two icons appear in a row: gold dust (word 11), an ivory tusk (word 13). | `GOLD · IVORY` |
| 14 "Above" | The icons fade. The screen holds on the empty dusk shore and the ship's dark silhouette. **No figures of people are drawn.** | |
| 20 "Glass" | One line of plain white text fades in and stays through the pad. | `Glass beads helped pay for the Atlantic slave trade.` |
| end | `pad` 1.0 s of quiet, then a slow fade to black. Optional small muted line under the text during the pad, only if it is checked first (see the fact check): `Liverpool ships, 1751–1800: about one million people, by one estimate.` | |

## b6 · `savings`: "Step off the ship. Imagine your family saved in ordinary beads: years of work, on a string. If every ship brings more beads, each one buys a little less. Same string. Less food."

This is the chapter's felt moment. Keep it simple and slow. It is a **what-if**, and the screen says so.

| Word | Visual | On screen |
|---|---|---|
| 0 | Fade up on a compound at dawn: a hut, a row of clay pots drying, a woman and a child (`person()`). | |
| 4 "Imagine" | A string of 20 beads is drawn bead by bead across the screen (one per 0.05 s, glass clinks). | `IMAGINE` (small, muted, top left, stays through b7), `YOUR FAMILY'S SAVINGS` |
| 11 "years" | The string sits in the centre. Beside it, a food pile: 12 yam baskets (`basket()`). | `= 12 BASKETS OF FOOD` |
| 18 "every" | A ship's horn: a ship silhouette crosses the horizon in the background and a puff of new beads lands in the market. Repeat at word 22 "beads," and word 25 "buys" (three ships in all). | |
| 18–28 | With each ship, **food baskets vanish from the pile** (12 → 8 → 5 → 3), each with a soft "pop" down. The string of beads does not change at all. | label updates: `= 8 BASKETS` → `= 5` → `= 3` |
| 29 "Same" | Highlight the string (a white outline). | `SAME STRING` |
| 31 "Less" | Highlight the 3 baskets. | `LESS FOOD` |

*The 12 → 3 numbers are illustrative (they mirror the minigame's ~4× price rise). No bead price series is claimed (see the fact check). The recorded case of this mechanism in West Africa is cowries, chapter 4.*

## b7 · `accorihold`: "Unless the string held an accori. Nobody could copy those. Two hundred years on, a Dutch trader wrote it still traded for its weight in gold."

| Word | Visual | On screen |
|---|---|---|
| 0 | The same string. One bead in it turns sky-blue and glows: the accori (the b2 prop). | |
| 5 "accori" | Soft chime. The baskets that bead "holds" (three, set slightly apart) **do not vanish** as one more ship passes. | `ACCORI: STILL 3 BASKETS` |
| 6 "Nobody" | Tiny replay of the cracked copy from b3 (0.6 s). | `CAN'T BE COPIED` |
| 10 "Two" | The scale from b2 again, exactly as before: the accori on the left, **one** pile of gold on the right, balancing at word 23 "weight". The point is that nothing changed. | `c. 1700: STILL WEIGHED AGAINST GOLD`, small muted `WILLEM BOSMAN, DUTCH TRADER` |

## b8 · `beadcallback`: "Remember Ulm Hollow? Wren didn't steal. Wren just spent first, and pentaja savers paid the difference. When you're Wren, it feels like winning. Somebody always pays."

| Word | Visual | On screen |
|---|---|---|
| 0 | Ulm Hollow (EP 01 palette, same as `SC.rodcave`): Wren at the cave, arms full of pink pentaja. | `ULM HOLLOW` |
| 6 "Wren" | Wren hurries to a stall and buys a lumfruit. The price tag shows `1` pentaja. | |
| 9 "first," | The tag flips to `4`, then `8` behind Wren as the next villagers queue. | |
| 11 "pentaja" | A villager behind Wren opens their savings pouch: four pentaja, which now buy half a lumfruit. | |
| 16 "When" | Split screen: Wren in the tricorn (beads) and Wren with pentaja, both grinning. | `WHEN YOU'RE WREN, IT FEELS LIKE WINNING.` |
| 23 "Somebody" | The grin fades in both halves. Behind each Wren: the family string (left) and the villager's pouch (right). | `SOMEBODY ALWAYS PAYS.` |

## b9 · `nextwampum`: "Next: North America, where shell beads became money... until metal drills arrived."

| Word | Visual | On screen |
|---|---|---|
| 0 | World-map card (the episode's map) with chapter 2's bead icon getting a check mark. A dotted line hops west across the Atlantic. | `NEXT` |
| 4 "shell" | Purple and white wampum beads in a short belt. | `CHAPTER 3 · WAMPUM` |
| 9 "metal" | A hand drill spins, and beads pop out faster and faster (accelerando). | |
| end | `pad` 1.5 s; fade. | |

---

## Sound cues (for `cues.py`; helpers as in `../yap/cues.py`)

- **b1:** `chime(74, (0, 7, 12))` at word 0 (the bead drops); `thud()` at word 7 for the YOU = WREN stamp.
- **b2:** `whoosh()` at segment start (the map zoom); `clink(2600)` at word 10 (the accori appears); a slow `pop_` ladder rising across words 18–20 (gold dust pouring) ending in `clink(1800)` when the scale balances; one soft `pop_(700)` at word 23 (the hand-over).
- **b3:** `pop_(900)` at word 10 (light bulb); furnace roar `noise(0.6, 2, seed=5)` low at word 14; three `clink(2200)`s for the copies; **fire crack** at word 17+0.6: `mix(noise(0.05, 8, seed=21), tone(3000, 0.03, "square"))`; `thud()` at word 22 (NOT FOOLED).
- **b4:** `whoosh()` at word 0 (toss); **bead pour**: about 60 `clink(1800–3200)` at 0.04 s spacing across words 2–7 (the h1 spill pattern, faster and higher); a tick per counter step at words 12–18 (`tone(1200, 0.03, "square")`); a `thud()` per sack landing at words 21–30; `chime(72, (0, 4, 7))` when the scale balances at word 30; a dry `pop_(500)` at word 35 (the counter-offer).
- **b5:** a low ship creak only (`noise(1.2, 1, seed=9)` very quiet) at segment start. **No sound effects from word 14 to the end of the segment.** No stings.
- **b6:** a soft `clink(2400)` per bead as the string is drawn (words 4–10, 20 clinks); a ship horn (`tone(110, 0.9, "saw", 98)`, quiet) at words 18, 22, 25; a soft low `pop_(300)` for each basket that vanishes.
- **b7:** `chime(79, (0, 4, 7, 11, 14))` at word 5 (the accori glows); a replay of the b3 fire crack (quieter) at word 6; one `clink(1800)` as the gold pile lands and the scale balances at word 23.
- **b8:** the EP 01 coin/pentaja clink (`clink(2000)`) at word 6; two quick `pop_` price-tag flips at word 9; `thud()` at word 23.
- **b9:** a woodblock drill rhythm (`tone(900, 0.02, "square")`) that accelerates from 3 to 12 per second across words 9–11; `chime(67, (0, 3, 7, 10))` at the end.

## Music idea

- **b1–b4 ("you are Wren"):** **D Mixolydian**, a cheeky, bouncy "heist" feel. Marimba lead, plucked bass on roots D–C–G–A (`[62, 60, 55, 57]`), about 112 bpm feel, hi-hat on the off-beats. It should sound like winning, until the hard-bargaining beat at the end of b4, where the hats drop out.
- **b5:** the music **drops out** at the start of b5, leaving a single low D drone (very quiet) that dies at word 14 "Above". Then silence through the pad.
- **b6:** the **same melody in D minor / Dorian** (roots D–B♭–C–A, `[62, 58, 60, 57]`), half tempo, no hats. A musical version of the lesson: **each bar drops one more note of the melody** (8 notes, then 7, 6, 5…), so the tune "buys less" while keeping its shape.
- **b7:** the accori chime, then the melody's first bar returns **whole**, in D major, once.
- **b8:** the hook's A-minor "mystery" section (callback to Ulm Hollow), ending on the title sting.
- **b9:** the drill rhythm alone, then the chapter-3 teaser chord.

---

## FACT CHECK

Every claim in the narration and on screen, with its source. "Checked" means the source text itself was read in this pass, not a summary of it.

| Line | Claim | Source | Note |
|---|---|---|---|
| b2 | On the Gold Coast in the early 1500s, a rare blue bead (aggrey / accori) "could be worth its weight in gold". | Peter Francis Jr., "Beads in Ghana, part 2: The Mysterious Aggrey Bead", *The Margaretologist* 3(2), 1990, p. 3: "Europeans along the Gold Coast in the early 16th century noticed its great value locally, often worth its weight in gold." https://beadresearch.org/wp-content/uploads/Repeating_Material/CBR/Margaretologist/The-Margaretologist-1990-3-2.pdf | ✓ Checked. "Often", so the narration says "could be". It is the basis for "five hundred years ago". |
| b2 | Blue; sky blue with a sea-green look (on screen). | Francis 1990: "Before the 19th century Aggrey beads are always described as being blue"; Brun: "sky-blue; but if one looks through it, it is entirely sea-green" (quoted by Francis). Chouin 2023: "distinctively sky blue but had a greenish translucence … dichroism". | ✓ Checked. |
| b2 | "All were old. Nobody made new ones." | Gérard Chouin, "Accori Beads", *Perspectives on History* (AHA), 27 Dec 2023: Ife's glass industry declined in the second half of the 14th century and "the production of beads stopped", but the beads kept circulating; "ancestral sites became a source of old beads to reinject in the local and regional markets". https://www.historians.org/perspectives-article/accori-beads/. Francis 1990: "Aggrey beads predate the coming of the Europeans, who found them there"; "By the mid 17th century Aggrey imports had ceased". | ✓ Checked, with a caveat. **Where they were made is disputed.** Chouin (2023, recent archaeology) says Ife. Francis (1990) said "No one knows what an Aggrey bead is" and guessed Islamic glass reworked at Ife. Both agree the beads were already old when the Europeans arrived, which is all the narration claims. "All were old" also covers beads that were dug up again, which the earlier "passed from hand to hand" left out. |
| b2 | (Background, not narrated.) Portuguese ships carried accori from the Bight of Benin to the Gold Coast (Elmina) from the late 1470s. | Chouin 2023. | Not narrated: it would add a second "trader" story and cost time. |
| b3 | European glassmakers tried to copy the bead. | Francis 1990, citing Zecchin (1955): in 1603 a Dutch factory produced "corallina, sold to imitate the precious stone"; Ximenes asked Antonio Neri how to make dichroic blue-green glass to imitate it. Chouin 2023: Venice made imitations "on a larger scale". | ✓ Checked (Francis, Chouin). "Venice · Holland" on screen. |
| b3 | "People on the coast could tell the copies apart." | Chouin 2023: the dichroic Ife beads "could never be imitated". Francis 1990: the older beads have a higher melting point than the later imitations, "confirming the Portuguese pilot's observation"; Forbes (1851) describes an imitation "which could easily be detected". Harold Bindloss, *In the Niger Country* (1898), p. 230: "in spite of many attempts to counterfeit them, the native is never deceived." https://archive.org/details/innigercountry00binduoft | ✓ Checked. ⚠️ The old line said "never fooled". That came from Bindloss, an 1898 colonial travel writer whose "Aggri" may be a different bead (see b7), and copies *did* circulate: the c. 1540 pilot saw people wearing glass look-alikes. So the narration now says they "could tell the copies apart", which is a claim about the beads, not "never". |
| b3 | On screen: glass copies "will not bear the heat of fire". | A Portuguese pilot, c. 1540, in J. W. Blake, *Europeans in West Africa 1450–1560* (Hakluyt Soc., 1942), p. 153, as quoted by Francis 1990: some wear "necklaces of glass, which are very similar [to coris] but which will not bear the heat of fire". | Quoted second-hand (Blake not read). The pilot does **not** say that buyers ran a fire test, so the film shows the property as a side-by-side for the viewer, with no buyer doing it, and the narration never mentions fire. |
| b4 | "By the late seventeen hundreds, Venice made tens of millions a year." | Saul Guerrero, "Venetian Glass Beads and the Slave Trade from Liverpool, 1750–1800", *BEADS* 22 (2010), abstract: "manufactured tens of millions of units of conterie and perle a lume beads per year during the second half of the 18th century." Appendix A: about 9 million large beads a year, and the small conterie "at least one order of magnitude greater". https://journals.uoregon.edu/beads/article/view/6232 | ✓ Checked (full PDF). "Tens of millions" is the cautious end: Guerrero's own appendix suggests ~100 million. "Late" was added because the figure is for 1750–1800. |
| b4 | "By the ton." | Guerrero 2010, Appendix A (after Trivellato 2000): perle-a-lume exports averaged 340,628 *libbre grosse* a year in 1769–1796 ≈ **162.5 tonnes**, and conterie were "around three times greater" by weight. | ✓ Checked. Optional on-screen line: `~160 TONNES A YEAR (LARGE BEADS ALONE)`. |
| b4 | "In Liverpool, the price of one ounce of gold bought nearly fifty kilos." | Bead price: Guerrero 2010, p. 57: "In Liverpool the price recorded for the beads loaded as cargo on the Davenport slavers was on the order of 9 pence a pound", a price "in the majority of the accounts" of voyages 1761–1782 (n. 9). Gold: Isaac Newton's 1717 mint report fixed gold at £3 17s 10½d per standard ounce (= 934.5 d). https://www.gold.org/sites/default/files/documents/1717sep21.pdf | **Our own arithmetic:** 934.5 d ÷ 9 d/lb ≈ 104 lb ≈ **47 kg**, hence "nearly fifty" (by fine gold it would be ≈ 51 kg). ⚠️ This was WD&Co.'s unusually cheap price: Guerrero calls it "a very aggressive marketing policy". At London's 1782 price (2s/lb, Guerrero Table 2) it would be ≈ 18 kg. So the narration says "In Liverpool", the screen says `LIVERPOOL PRICES, 1760s–1780s`, and the line must not be generalised to "Europe". |
| b4 | "Coastal merchants still bargained hard." | Guerrero 2010, p. 58: slaves were bartered for a mixed "basket of goods", and there was "reticence of the African slave trader to accept them [cheap goods] unless compensated with the goods he actually preferred"; conclusion: the account books "seriously question the idea that African traders were gullible enough to barter slaves for a handful of beads"; beads had "a barter value per pound sterling spent in Liverpool second only to gunpowder". | ✓ Checked. Added in this pass so that b4's cheap Liverpool price can't be heard as the "trinkets" myth. |
| b5 | The ships also carried cloth, iron and guns. | Guerrero 2010, Table 3 (Liverpool slavers, 1755–1800, after Richardson 1979): textiles 27.9% of cargo value, brassware 14.3%, beads 7.7%, iron 7.7%, cowries 7.1%, arms 6.5%, gunpowder 5.4%, spirits 5.2%. | ✓ Checked. Beads were a real but **minor** share, hence "helped pay for", not "paid for". |
| b5 | "They bought gold and ivory. Above all, Liverpool's traders bought people." | Guerrero 2010: the Davenport accounts cover "61 slave trading ventures"; the account books record "sales of slaves, ivory, or palm oil"; beads were "one of the eight main categories of cargo bartered for slaves in Africa by traders from Liverpool". V&A, "From culture to currency: glass beads and the transatlantic slave trade": beads bought "ivory, gold, and palm oil" from the 15th century, and "were also used to purchase enslaved Africans". https://www.vam.ac.uk/articles/from-culture-to-currency-glass-beads-and-the-transatlantic-slave-trade | ✓ Checked. The old line put people last in a list after gold, ivory and palm oil; for these Liverpool ships, buying people was the main business, so the narration now says so in its own sentence. Gold mattered most in the 1500s–1600s; palm oil mostly after 1807, so it was dropped from the narration. |
| b5 | (Optional on-screen line, not narrated.) Ships fitted out in Liverpool carried about one million enslaved people in 1751–1800. | Guerrero 2010, p. 53: "Between 1751 and 1800, approximately one million slaves were traded by ships outfitted in Liverpool (Trans-Atlantic Slave Trade Database)." | ✓ Guerrero checked. ⚠️ **Not yet checked against slavevoyages.org itself** (the database needs a filtered query: departure port Liverpool, 1751–1800). For comparison, Liverpool's whole trade (c. 1700–1807) is usually given as about 1.5 million people (A. Tibbles, Gresham College lecture). If used, say "about one million, by one estimate". |
| b6 | "Imagine your family saved in ordinary beads… If every ship brings more beads, each one buys a little less." | **No bead price series exists for West Africa that we could find.** The mechanism is the quantity logic of EP 01. Beads as stored wealth: in Yorubaland "The okun bead is the essence of wealth" (Drewal & Mason 1998, quoted in Ogundiran 2002, p. 9). The documented West African case of money losing value through oversupply is **cowries** in the 19th century: Ogundiran 2002, p. 19, on "the great 19th-century inflation [of cowries] caused by oversupply (Hogendorn and Johnson 1986: 138-42)". Ogundiran, "Beads, Cowries, and Cultural Translations of the Atlantic Experience in Yorubaland, 1600–1850", BU African Studies Center, African Humanities No. 36 (2002), full text: https://open.bu.edu/items/ecf29bea-f7df-44cc-a569-83ac3e2b9eb1 | ⚠️ **Weakest line, so it is now an explicit what-if** ("Imagine", "If", and `IMAGINE` on screen), with illustrative numbers (12 → 3 baskets). The old claim that Ogundiran calls beads "repositories of wealth" in the Atlantic era could not be found in his full text (read in this pass): his paper is mostly about **cowries** replacing beads as the measure of wealth. Francis 1990 also notes that the accori itself "were not used as currency". The everyday money of the Gold Coast was gold dust, and cowries further east. Do not add years or real numbers here. The real case belongs to chapter 4 (cowries). The outline's "savers drained" (Ammous, *The Bitcoin Standard*) has no primary source and is not used. |
| b7 | "Nobody could copy those." | Chouin 2023: "could never be imitated"; Francis 1990 (melting points; Forbes's easily detected imitation). | ✓ See b3. |
| b7 | "Two hundred years on, a Dutch trader wrote it still traded for its weight in gold." | Willem Bosman, *A New and Accurate Description of the Coast of Guinea* (Dutch 1704; English 1705), Letter IX, p. 119: "a sort of blew Coral, which we call Agrie, and the Negroes Accorri, which being moderately large, is so much valued, that 'tis generally weighed against Gold." https://archive.org/details/newaccuratedescr00bosm | ✓ Checked in the scan this pass. Bosman was on the Gold Coast 1688–1702, about two centuries after the first Portuguese reports, hence "two hundred years on". He describes accori worn in the hair among gold ornaments, which fits "a store of value", not "money". ⚠️ G. Chouin (AHA 2023) says accori "fetched four times their weight in gold" in Bosman. In the English text, "a quadruple value to Gold" belongs to a *different* item in the same sentence (Conté de Terra). So we say "its weight in gold". |
| b7 (old) | *Cut:* "In 1898, a traveller still put them at more than three times their weight in gold." | Bindloss 1898, p. 230. | Checked and **removed**. Bindloss describes his "Aggri" as "a substance somewhat resembling jasper, dug from the earth in the Gold Coast". Jasper is opaque, usually red or brown, not sky blue. Francis 1990 shows that from Bowdich (c. 1814) on, Europeans used "Aggrey" for quite different beads. It was the wrong evidence for "the accori held its value". |
| b8 | Wren "didn't steal"; the savers paid. | EP 01, `lessons/01-barter/game.js`, "inflation" card. | Internal callback. |
| b9 | Shell beads (wampum) became money; metal drills sped up making them. | Chapter 3's own sources (outline: Massachusetts legal tender 1637–1661; Boston Fed, colonial money). | Teaser only. "Became money" rather than "were money": wampum was first a diplomatic and ceremonial object, and became a currency in trade with the colonists. |

### Looked at and deliberately NOT used

- **"A person for 2 kg of beads" (Savary des Brûlons, 1723)** against **"at least 200 kg of beads for one enslaved person at the end of the 18th century"** (Guerrero 2010, p. 66). This is the starkest "bead inflation" pair in the literature, but (a) it would make a human being the unit of the price example, which breaks the tone rule, and (b) the two figures aren't comparable: the first is "reportedly", second-hand via Trivellato, and they come from different places and bead types. Guerrero uses the 200 kg figure to show African traders were **not** gullible.
- **The "worthless trinkets" story.** Guerrero (2010) shows that beads were about 8% of Liverpool cargo value, with a mean gross markup of 162% per voyage (and an overall net profit for Davenport's ventures of only about 8%, after Richardson), and that African merchants bargained hard. The chapter never calls beads trinkets, b4 now says merchants bargained hard, and the minigame's prices react to supply because sellers aren't fooled.
- **"Four times its weight in gold"** (Chouin's summary of Bosman): see b7.
- **"More than three times their weight in gold" (Bindloss 1898):** see b7 (old).
- **"Beads bought Manhattan"** and similar: a myth (the 1626 record names "60 guilders" of goods, no beads), and the wrong continent for this chapter. Not used, and chapter 3 should not use it either.
- **Ammous, *The Bitcoin Standard* (2018), ch. 2:** this popular version of the bead story cites no bead price data, so we don't use it as a source.
- **1653, Dutch at Elmina requesting 19,900 lb of "Venetian goods"** (V&A): not all were beads, so we don't use it.

## Open questions
- Is the minigame (see `lessons/02-every-wren/beads.DESIGN.md`) the right length relative to this ~95 s film?
- Should b5 show the optional "about one million people from Liverpool ships alone" card? It adds weight but costs about 4 s of silence, and the figure must first be checked on slavevoyages.org.
- b6 is a what-if. If a real bead price series turns up (best leads: Pallaver on bead currencies in 19th-c. East Africa, where gluts are documented; Johnson 1970 on cowries), it could carry a real number. Otherwise, the chapter-4 cowrie numbers are the real-world proof, and the Wren moment could point there.
