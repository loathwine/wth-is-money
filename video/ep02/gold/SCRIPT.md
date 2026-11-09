# EP 02 · Chapter 6: Gold? Is there money without a cave? (script notes)

**Purpose:** the episode's finale. Every money so far had a Wren, someone who found a cheap way to make more of it. Gold came closest to having none. The reason is shown, not argued: all the gold ever mined is a cube about 23 m on a side, and a whole year of the world's mines adds a slice less than half a metre thick on top (under 2%). Even the great gold rushes of the 1850s, when the world dug over three times as much gold a year, raised British prices by up to a third, for a couple of decades; then prices fell, and by the 1890s they were lower than in the 1840s. Compare cowries (×10) and Rome (×37). The movie answers its own title question in g7 ("Gold came closest to money without a cave"), then ends on today's money ("who is its Wren?") and hands the deeper *why* to **EP 03 · Why Gold?**.

**Scope guard (EP 03):** this chapter shows *that* gold was hard to flood, with three pictures (cube and slice, the rush, today's mines). It doesn't explain stock-to-flow as a concept, doesn't name the term, and doesn't compare gold with silver, oil or bitcoin, why gold piles up and isn't used up, mining cost curves, or the gold standard's rules. Those are EP 03. The cube is shown, and "almost all of it still exists" is said once, with only a quiet `STILL HERE` label: EP 03 reuses the cube prop and explains why it doesn't shrink. The 1932 vault story (cut from the movie, now only under the game's Wren card) is a callback to Yap, not a lesson about central banks.

The narration is in `narration.json`: 9 segments, **256 words** (g9 was cut in the revision; see below). At the Rome pace (230 words in about 101 s) that is about **110–115 s** with pads. Built: **118.2 s** (`timeline.json`, g4's pad raised to 2.2 s so the close-up and `+1.7%` can be read). Captions use `cap` with digits where the spoken text spells numbers out. Scenes go in `scenes.js` (one `SC.<scene>` per segment). Wren (`alien("wren")`) carries a small pickaxe and a miner's lantern in this chapter.

**Novice rules used here:** every number also appears as a picture (a cube, a slice, bars), and no number is spoken that differs from the one on screen (tonnes are on screen only). "Stock", "flow", "inflation" and "supply" aren't said. Prices are always shown as a price tag or a line on a chart, with the place named (Britain, Dahomey, Roman Egypt). The rush is never "bad"; it's just measured. Calm, never triumphant: gold isn't sold as perfect (it *did* get flooded, a little and for a while).

## Segments and visuals

Word numbers are 0-based over the whitespace-split text (the same as `word()` / `TR.word`).

### g1 · `gtitle` · "Chapter six. Gold: is there money without a cave?" (dip, pad 0.8)
| Word | Visual |
|---|---|
| 0 | Night. A dark hillside with a dozen cave mouths drawn as black arches (one per chapter, plus a few spares), all empty. Small text `CHAPTER 6`. |
| 2 "Gold:" | Big gold title `GOLD?` drops in (title sting). |
| 3–8 | Subtitle `IS THERE MONEY WITHOUT A CAVE?`. Wren walks in from the left with a pickaxe and lantern, peers into the nearest cave, finds nothing, and lifts the lantern towards the next one. |
| end | Fade out (0.5 s). |

### g2 · `allwrens` · "Every money in this episode had a Wren. A ship on Yap. Glass from Venice. Iron drills. Shells from Zanzibar. A mint in Rome. Each time, money got easier to make. Usually, the savers paid." (pad 0.6)
| Word | Visual |
|---|---|
| 0–7 | Five empty card frames in a row (a 3 + 2 grid on a phone), title `THE WRENS OF HISTORY`. |
| 9 "ship" | Card 1 flips: O'Keefe's schooner with a rai stone on deck. Label `YAP · 1870s`. |
| 12 "Glass" | Card 2: a glass furnace and a string of beads. `WEST AFRICA · 1400s–1800s`. |
| 15 "Iron" | Card 3: an iron drill point boring a shell bead. `WAMPUM · 1600s`. |
| 17 "Shells" | Card 4: a ship's hold full of cowries. `COWRIES · 1845–1890`. |
| 21 "mint" | Card 5: a hammer and die over a coin. `ROME · AD 64–270`. |
| 24–30 "money got easier to make" | Each card gets the small red `CAVE!` stamp from the episode's hook montage, one after another (a soft stamp tick each). |
| 31–34 "Usually, the savers paid" | Under the cards, a clay jar shrinks. The Yap card alone gets a small green check: `YAP SPOTTED IT` (chapter 1's good ending, so "usually" is shown, not just said). A sixth frame appears to the right with a gold `?` in it. |

### g3 · `cube` · "Now gold. All the gold ever mined would fit in one cube, about twenty-three metres on each side. As tall as a seven-storey building. Almost all of it still exists."
| Word | Visual |
|---|---|
| 0–1 | The cards slide away and the sixth frame, the `?`, zooms to fill the screen and turns into a city square at dusk. |
| 2–11 | Gold bars stack themselves into one big cube in the square (a fast fill, bottom up). A counter beside it: `ALL GOLD EVER MINED ≈ 220,000 t` (on screen only; not spoken). |
| 11 "cube," | The cube finishes and catches the light. Label `≈ 23 m`. |
| 18–23 "As tall as a seven-storey building" | A 7-storey building slides in next to it (the same height), with tiny people at its foot. |
| 24–29 "Almost all of it still exists" | A quiet one-second label `STILL HERE` under the cube. No orbiting icons: *why* it stays is EP 03's. |

### g4 · `slice` · "Each year, the world's mines add a slice on top, less than half a metre thick. Under two percent." (pad 2.2)
| Word | Visual |
|---|---|
| 0–5 | Tiny mine carts roll in from the edges of the screen and tip their gold onto the roof of the cube. Label `1 YEAR OF MINING ≈ 3,600 t` (on screen only). |
| 6–15 "a slice on top, less than half a metre thick" | Zoom on the cube's top edge: a thin bright layer settles on top. A ruler beside it reads `≈ 37 cm`. A tiny person stands next to it for scale: the slice comes up to their knee. |
| 16–18 "Under two percent" | Zoom back out: a big `+1.7%` beside the cube. (The earlier Ulm Hollow jar inset is dropped: one picture here, the thin slice. The game's practice round makes the Ulm Hollow callback.) |

### g5 · `rush` · "Gold had its rushes. California in eighteen forty-nine, then Australia. In the eighteen-fifties, the world dug over three times as much gold a year as in the forties. Three times a thin slice is still a thin slice."
| Word | Visual |
|---|---|
| 0–3 | A pixel world map (Pacific-centred, so California and Australia both fit). |
| 4 "California" | California lights up, and a stream of tiny prospectors (pans, picks, tents) pours in. `1848–49`. |
| 9 "Australia." | Victoria and New South Wales light up, with a second stream of prospectors. `1851`. |
| 12 "eighteen-fifties," | The map slides up and two bars grow: `WORLD GOLD MINED PER YEAR`, `1840s: 57 t`, `1850s: 198 t` (the 1830s bar is dropped). |
| 16–18 "over three times" | The 1850s bar gets a bracket: `×3.5`. |
| 28–37 "Three times a thin slice is still a thin slice" | The bars fade; the g4 cube comes back, unlabelled and with no stock number (a picture of relative size only). One thin slice settles on top, then three stacked: still a thin band on a big cube. |

### g6 · `rushprices` · "Prices rose. In Britain, where money was gold, by up to a third. They stayed high for about twenty years. Then they fell. By the eighteen-nineties, they were lower than in the forties." (pad 0.6)
Kept simple for a phone: the real yearly line, three labels, nothing else.
| Word | Visual |
|---|---|
| 0 | A line chart titled `PRICES IN BRITAIN (COST OF LIVING)`, 1840–1900, with the 1840s average as a dashed line labelled `1840s`. A thin gold strip under the x-axis marks the rush years, `RUSH`. |
| 0–12 | The line draws from 1840: down to a low in 1851, then up from 1853. A bracket from the 1851 low to the 1856 hump: `+30%`, with a small `FROM THE 1851 LOW` under it (so it doesn't read as measured from the dashed line). |
| 13–19 "They stayed high for about twenty years" | The line stays up through the 1860s and early 1870s (highest in 1867, 1.405; nearly as high again in 1873). No labels on these peaks. |
| 20–22 "Then they fell." | From 1874 the line slopes down. |
| 23–32 | It ends in the 1890s *under* the dashed 1840s line. Label `1890s: BELOW 1840s`. Small source line: `Bank of England, A millennium of macroeconomic data`. |

The Jevons margin card is dropped from the movie (too much for a phone in about 12 s); his figures stay in the fact check below.

### g7 · `meters` · "Compare. Cowries: a silver dollar cost ten times more shells. Rome: wheat cost thirty-seven times more. Gold, in the great rushes: prices up to a third higher, for a while. Gold came closest to money without a cave." (pad 1.0)
| Word | Visual |
|---|---|
| 0 | Three price tags side by side on one shelf, all reading `1` (each tag is a multiple of its old price). |
| 1 "Cowries:" | The cowrie tag (a silver dollar icon with a cowrie) grows to `×10`, with a little label `A DOLLAR IN DAHOMEY, 1840s → 1880s`. |
| 10 "Rome:" | The Rome tag (a wheat sack icon) grows past the top of the screen: `×37`. The camera tilts up to follow it, then comes back down. `WHEAT IN EGYPT, AD 100 → 293`. |
| 16 "Gold," | The gold tag (a bar icon) rises to `×1.3`, holds there for a beat, then sinks back to about `×1` (word 29 "while."). `BRITAIN, 1851 → 1860s → 1890s`. |
| 30–37 "Gold came closest to money without a cave" | Hold. The gold tag gets a soft glow; nothing is stamped. Calm, no "perfect money" framing. |

### g8 · `nocave` · "And today? In ten years, gold's price roughly tripled, with big swings. So digging it pays far more. Still, mine output grew under one percent a year. Nobody has found gold's cave." (pad 1.4)
| Word | Visual |
|---|---|
| 0–1 | A modern open-pit mine at noon, with haul trucks. |
| 2–11 | Left half: a price line `GOLD PRICE, $ PER OUNCE`, `2015 → 2025` (the years are on screen, since the video will be watched later), from `$1,160` (2015 average) to `$3,432` (2025 average), and `×3`. **As built:** LBMA yearly averages (labelled `yearly averages`), not monthly: 1160, 1251, 1257, 1268, 1393, 1770, 1799, 1800, 1941, 2386, 3432; only the 2015, 2024 and 2025 values are in the fact check below, the 2016–2023 ones are from memory and need a first-hand check against the LBMA/WGC series before publishing. |
| 12–17 "So digging it pays far more" | Under the price line, a small label `MORE PAY FOR EACH OUNCE DUG`. |
| 18–26 | Right half: a bar for mine output each year, 2015 → 2025, almost flat (as built: WGC mine production, about 3,360 → 3,672 t, drawn without numbers; the 2015–2023 bar heights are approximate and need a first-hand check). Label `MINES: +<1% A YEAR`. **Wren cameo starts here (word 18 "Still,"):** Wren walks into a mine tunnel with the lantern while the output bar draws. |
| 27–31 "Nobody has found gold's cave" | Wren comes out dusty, holding up one tiny nugget, and shrugs. Held beat (pad 1.4), then a grey stamp (not red): `NO CAVE`. |

### g9 · `vault` · CUT from the movie (revision 1)
A second idea ("money doesn't have to move") between the punchline and the hook, and it needs central-bank context a novice lacks. The Yap/France callback now lives only as the muted note under the game's Wren card (`lessons/02-every-wren/gold.DESIGN.md`). If it ever returns, use the corrected text: "Remember Yap's stones, owned without ever moving? In nineteen thirty-two, France swapped its dollars for gold in New York. To save shipping it, bank staff just marked the drawers as French." (No "Nobody shipped it", and no ship-stays-in-port ✗: see the fact check.) The `vault` scene and its props aren't needed for the movie.

### g10 · `question` · "Our money today isn't gold. So who is its Wren? First: why is gold so hard to flood? Next episode: why gold." (pad 1.6)
| Word | Visual |
|---|---|
| 0–4 | A phone screen with a banking app showing a balance, `€ 1,000.00`, and a paper €20 and $20 beside it. A small grey line `NOT TIED TO GOLD` (no year next to the €; the 1971 date is the dollar's and is in the fact check). |
| 5–9 "So who is its Wren?" | A big soft `?` over the phone. The "Wrens of history" row from g2 slides in above it, with the sixth frame, the gold one, still a `?`. Small: `WHO CAN MAKE IT? · LATER EPISODES`. |
| 10–17 "First: why is gold so hard to flood?" | The phone and row fade; the gold cube, small, in the middle. |
| 18–21 "Next episode: why gold." | Everything dims except the cube. `NEXT · EPISODE 3` / `WHY GOLD?`. Wren sits on top of the cube, swinging its legs, lantern off. |

## Props needed (new)
A gold cube with a lit face (needs to read at two scales: a whole cube and a close-up of the top edge), a gold bar, a mine cart, a ruler, a 7-storey building (simple pixel block with windows), prospectors (a hat, a pan, a pick: reuse `person` with a hat), a Pacific-centred pixel world map (California, Australia), a wheat sack and a silver dollar (g7 tags), a haul truck, a phone with a banking app, a lantern and pickaxe for Wren. Existing: `chart`, `stamp`, `label`, `where`, `coin`, `cowrie`, rai stone (Yap), schooner, `jar`, `cave`, `alien("wren")`. (The vault, drawers, French tag and newspaper were for g9 and are no longer needed.)

## Sound cues (`cues.py`, to write)
- g1: a slow title chime on "Gold" (G major, 0-4-7-12), a lantern creak, and a hollow echo as Wren looks into an empty cave.
- g2: one soft card flip per Wren (5 in all), a stamp tick per `CAVE!`, a gentle low note for the shrinking jar, and a tiny bright "ding" on Yap's green check.
- g3: a bar-stacking patter (fast clinks that rise in pitch) while the cube builds, then a low warm chord when it's done.
- g4: cart rumbles; one soft "shff" as the slice settles; a quiet tick on "+1.7%".
- g5: footsteps and pan swishes for the prospectors; two rising notes as the bars grow; three soft "shff"s as the three slices settle.
- g6: a soft pencil scratch while the line draws; nothing dramatic on the hump.
- g7: a pop for each tag; a long rising whistle as Rome's tag runs off the top; a slow rise, hold and settle for gold; a warm low chord under "Gold came closest".
- g8: distant truck hum; a single small "tink" for Wren's one nugget; a soft grey stamp thud.
- g10: a soft phone tap; an unresolved chime on "why gold?" (same as the end of chapter 5, so the episode closes the way the teaser opened).

## Music idea
**G major, about 84 bpm, `style="island"` but slow and warm:** bass on G–Em–C–D with a marimba melody that moves by step and never jumps. Steady, almost boring on purpose: this is the money that didn't crash. Under **g2**, four bars quote the episode in passing (one bar each in the earlier chapters' keys: Yap C pentatonic, cowries F, Rome D minor) before settling into G. From **g8** it thins to a low pulse (`mystery`), and **g10** ends on an unresolved chime for EP 03. For the minigame, the same loop runs at 96 bpm.

## Fact check

Checked on 2026-11-09 against primary or institutional sources wherever possible. ✓ = confirmed; ⚠️ = holds only with the hedge used in the text.

| Line | Claim | Number used | Source | Confidence | Wording choice |
|---|---|---|---|---|---|
| g2 | Each chapter's Wren: O'Keefe's ship and iron tools (Yap), cheap European glass beads (Venice etc.), iron drills (wampum), Zanzibar cowries (Hamburg firms), the Roman mint. | n/a | This episode's own SCRIPT.md files (chapters 1–5) and OUTLINE.md fact check. | ✓ | "Usually, the savers paid" (not "always"): on Yap, by later accounts, O'Keefe's stones were valued lower, so old savings were partly protected (ch. 1). "Iron drills", not "steel", to match ch. 3. |
| g3 | All the gold ever mined is about 220,000 tonnes. | ≈ 222,600 t (WGC, page dated 3 Nov 2026; above-ground stock 224,200 t at end-Q3 2026); 219,891 t at end-2025; 216,265 t at end-2024. | World Gold Council, *How much gold has been mined?* https://www.gold.org/about-gold/gold-supply/gold-mining/how-much-gold-has-been-mined and *Above-ground stocks* https://www.gold.org/goldhub/data/how-much-gold | ✓ (an estimate) | **On screen only** (not spoken, since revision 1): `≈ 220,000 t`, rounded so it doesn't date as the WGC updates it. The WGC calls it "the best estimates currently available". Older and independent estimates range more widely (roughly 190–240 kt). |
| g3 | It would fit in a cube about 23 m on each side. | 22.6 m | WGC (same page): "the resulting cube of pure gold would only measure around 22.6 metres on each side". Check: 222,600 t ÷ 19.32 t/m³ = 11,522 m³; ∛ = 22.6 m. | ✓ | "About twenty-three metres". "As tall as a seven-storey building" is our own comparison (22.6 m ÷ about 3.2 m a storey ≈ 7). |
| g3 | Almost all of it still exists. | n/a | WGC (same page): "since gold is virtually indestructible, this means that almost all of this metal is still around in one form or another." | ✓ | Said once, plainly, with a quiet `STILL HERE` label and no orbiting icons. Why that matters (a big pile next to a small yearly flow, and why it isn't used up) is EP 03, which reuses the cube prop. |
| g4 (screen) | The world's mines add about 3,600 tonnes a year. | 3,671.6 t in 2025 (provisional), 3,650.4 t in 2024 (WGC); USGS: 3,280 t (2024), 3,300 t (2025 est.). | WGC, *Gold Demand Trends Full Year 2025, Supply*, https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-full-year-2025/supply ; USGS, *Mineral Commodity Summaries 2026: Gold*, https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gold.pdf | ✓ | **On screen only** since revision 1: `1 YEAR OF MINING ≈ 3,600 t` (WGC). The narration names only the slice, so voice and screen can't disagree. The USGS figure (≈3,300 t) counts small-scale mining differently. Recycled gold (≈1,400 t a year, WGC) isn't new gold and is left out. |
| g4 | Each year, a slice less than half a metre thick on the cube, under 2% a year. | 3,672 ÷ 19.32 = 190 m³; ÷ 22.6² m² = **0.37 m**. 3,672 ÷ 219,891 = **1.67%**. | Arithmetic from the rows above. | ✓ | "Less than half a metre", "under two percent". On screen `≈ 37 cm`, `+1.7%`. With the USGS figure: 0.34 m and 1.5%. |
| g5 | California 1848–49, then Australia (1851). | n/a | Standard chronology (gold found at Sutter's Mill, Jan 1848; the rush in 1849; New South Wales and Victoria finds in 1851). | ✓ | "California in eighteen forty-nine" is the rush year, not the discovery year, so the screen shows `1848–49`. |
| g5 | In the 1850s the world dug over three times as much gold a year as in the 1840s. | Average a year: 1831–40: 674,200 oz (21 t); 1841–50: 1,819,600 oz (57 t); 1851–60: 6,350,180 oz (198 t). ×3.5. | *Encyclopaedia Britannica* (1911), "Gold", Table I (Soetbeer's series), https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Gold | ✓ (historical estimates) | "Over three times" is conservative: the 1840s average already includes 1849–50 California gold; against the 1830s it is about ×9. The 1911 table prints the same figure for 1851–55 and 1856–60 (a decade average); Soetbeer's own 5-year figures, ≈199 t and ≈202 t, agree. |
| g5 (context, not narrated) | Twelve years of rush gold (1849–60) equalled about half of the gold then in use. | Newmarch: £300 million of new gold, "about 50 per cent" of the stock in use. | Jevons, *Investigations in Currency and Finance* (1884), reprint of "A Serious Fall…" (1863), Appendix note, https://archive.org/details/investigationsin00jevo | ⚠️ | A contemporary estimate. Jevons accepts it and uses it to argue that prices must have risen ("Is it conceivable that the stock of gold … should suddenly have grown half as large again without a considerable effect upon prices?"). The 1848 stock itself is very uncertain, so this is **not narrated**; kept for EP 03. On this estimate the rush added roughly 2–4% a year at its peak, against 1.7% today. |
| g5 | "Three times a thin slice is still a thin slice." | Per year: the 1840s added well under 1% a year to the stock (on any estimate); ×3.5 gives roughly 2–4% a year at the rush's peak (Newmarch's ~50% in 12 years, above). | Rows above. | ⚠️ (figurative) | A picture of relative size per year, not a number. It is drawn on an unlabelled cube with no stock figure, because the 1848 stock is unsourced. Over all twelve years the pile grew by a third to a half (the game uses ×1.36, labelled a game value), so the line is about one year's slice, and the visual shows years, not the whole rush. |
| g6 | Prices rose, in Britain (on gold), by up to a third, and stayed high for about twenty years. | BoE CPI (cost of living): 1851 → 1856 **+30%**; 1851 → 1867 **+35%** (1867, 1.405, is the highest year from 1821 to 1913; 1873 is 1.381). Against the 1840s average (1.197): +13% (1856), +17% (1867); against 1845–50: +19% (1867). CPI was above the 1840s average every year from 1853 to 1883 except 1858; the high plateau runs from 1853 to 1873, and prices fall from 1874. UK wholesale: 1851 → 1857 +40%; peak against 1845–50 +33% (1873). US wholesale: +30% from 1850 to 1855 (Whaples). | Bank of England, *A millennium of macroeconomic data for the UK* v3.1, sheet A1, "Consumer price index" and "Wholesale/producer price index", https://www.bankofengland.co.uk/statistics/research-datasets ; J. Steel, "The California Gold Rush", LBMA *Alchemist* 91, citing R. Whaples, https://www.lbma.org.uk/alchemist/issue-91/the-california-gold-rush | ⚠️ | "By up to a third" is measured **from the 1851 low**, the lowest CPI year from 1821 to 1913 (after a 23% fall from 1847), so the screen bracket says `FROM THE 1851 LOW`. Against the 1840s average the rise was smaller (+13% to +17%), close to Jevons' own lasting 9–15% (1863) and 11–21% (1865); "up to a third" is the upper end, which makes gold look *worse*, not better. "About twenty years" = the plateau 1853–1873 (revision 1; the earlier "for a few years… then they settled" misstated the shape). "Where money was gold": Britain was on the gold standard from 1821 to 1914. Not all of the 1853–56 rise came from gold: the Crimean War (1853–56) and poor harvests pushed prices too. And not all the new gold stayed in gold use: France's bimetallic system absorbed much of it and released silver in the 1850s–60s (the "parachute" effect; Flandreau), which damped the effect. The narration only says prices rose after the rush, which is true. |
| g6 (fact check only; not on screen since revision 1) | Jevons, 1863: gold lost at least 9%, in his opinion "nearer 15 per cent". | 9–15% | W. S. Jevons, *A Serious Fall in the Value of Gold Ascertained* (1863), preface: "The lowest estimate of the fall that I arrive at is 9 per cent … in my own opinion the fall is nearer 15 per cent." His tables: prices 1860–62 vs 1845–50, +10¼% over 118 goods, +16% over the 39 chief ones (BoE CPI: +10.0%, which agrees). In 1865 he called the rise permanent: "The real permanent rise due to the gold discoveries is doubtless something between these [11% and 21%]". Text in *Investigations* (1884), pp. 13–14, 49–50, 130. | ✓ | Quote marks only around his exact words ("at least" is our paraphrase of "the lowest estimate"). If ever shown (e.g. in the game's small print): `JEVONS, 1863: GOLD LOST AT LEAST 9%, "NEARER 15 PER CENT"`. |
| g6 | By the 1890s, prices in Britain were lower than in the 1840s. | BoE CPI, 1890–99 average vs 1840–49 average: **−9%**. Wholesale: −23%. | BoE millennium dataset (above). Also *Popular Science Monthly* 31 (1887), p. 770: Sauerbeck's 1886 average "was considerably below the average for the year 1848". | ✓ | Decade against decade, to avoid cherry-picking a year. The fall had its own causes (more output, new gold-standard countries such as Germany in the 1870s wanting gold, falling transport costs); the narration says only that prices fell, not why. The fall was steep: BoE CPI −23% from 1873 to 1896 (1.381 → 1.057); the game's result screen notes it (good for savers, hard for borrowers). |
| g7 | Cowries: a silver dollar cost ten times more shells. | Dahomey: about 2,000 shells to a silver dollar in the late 1840s → 20,000 in the 1880s. | Chapter 4 fact check (Law 1995; Skertchly 1874; Brunet 1900, via Pont Cháfer 2025). | ✓ | Revision 1: names the dollar, as chapter 4's row c6 requires. The earlier "prices in shells up ten times" implied a general price rise; some local food prices stayed fairly stable (a maize diet at about 200 cowries, 1871–1899, Pont Cháfer p. 218), so the narration must not claim that food cost ten times more. |
| g7 | Rome: wheat cost 37 times more. | Egyptian wheat, 8 → 300 drachmas a sack, AD 100 → 293. | Chapter 5 fact check (Scheidel 2008; Robertson 2015, citing Duncan-Jones and Rathbone). | ✓ | Same figure as chapter 5 (r6 / r7). "Wheat cost thirty-seven times more" (not "up thirty-seven times", which can be heard as "on 37 occasions"). |
| g7 | Gold, in the great rushes: prices up to a third higher, for a while. Gold came closest to money without a cave. | g6's +30–35% from the 1851 low; back under the 1840s level by the 1890s. | g6 sources. | ✓ | "Up to a third" (see g6). "For a while" covers the twenty-year plateau. "The great rushes", not "the biggest": we have no source ranking rushes by their effect relative to the stock. "Gold came closest to money without a cave" is the chapter's summary judgement, comparing only the monies in this episode; it isn't "perfect money" and is stated calmly. |
| g8 | In ten years gold's price roughly tripled, with big swings. | LBMA annual average: 2015 ≈ $1,160/oz; 2025 ≈ $3,432/oz (×2.96). Swings: a record of about $5,400 in January 2026, then about −27% by June (LBMA). | WGC, *Gold Demand Trends FY 2025*, https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-full-year-2025 (2025 average $3,431.54, +44%); LBMA forecast survey results, https://www.lbma.org.uk/articles/lbma-annual-precious-metals-forecast-survey-2025-winners-announced (2024 $2,386.20, 2025 $3,431.54); 2015 $1,160.06 (Statista, BullionVault, metalcharts); 2026 record and fall: LBMA (January) and LBMA mid-year survey, as reported by the revision-1 fact review (not re-read first-hand here). | ✓ (2026 swing ⚠️) | "Roughly tripled, with big swings": a rising price also means gold's own buying power swung a lot, so the line doesn't claim price stability. The screen says `2015 → 2025` because the video will be watched later. The 2015 figure is secondary-sourced (the LBMA history is no longer public on gold.org) but agrees across three sources. "So digging it pays far more" is about what each ounce dug sells for (×3); mining costs rose too over the decade (not quantified here; check WGC/Metals Focus all-in costs before adding any number). |
| g8 | Mine output grew under 1% a year. | "The average annual growth in mine production over the past ten years is less than 1%." 2024 → 2025: +1% (3,650 → 3,672 t). | WGC, *Gold Demand Trends FY 2025, Supply* (above). | ✓ | Most of the price rise came after 2019, and new mines take many years to open, so this only shows that supply did not jump. EP 03 can use a longer window. "Nobody has found gold's cave" is a summary line, not a factual claim. |
| g9 (cut; now the Wren card note) | Yap's big stones changed owners without moving. | n/a | Furness (1910) ch. VII; chapter 1's fact check. | ✓ | Callback only. |
| g9 (cut; was screen only) | German officials fined Yapese chiefs by painting black crosses on their stones until the paths were repaired. | Germany held the Carolines 1899–1914. | Furness (1910) ch. VII, pp. 93–100, as quoted by Friedman (1991); chapter 1's SCRIPT.md (y5, moved here). | ✓ | Shown, not narrated. Friedman draws exactly this parallel: the Fed's officials "could have done so by marking them 'with a cross in black paint' just as the Germans did to the stones". (Friedman writes "1899 to 1919" for the German colony; Japan took the islands in 1914, so the screen says only "1900s".) |
| g9 (cut; now the Wren card note) | In 1932 France swapped its dollars for gold in New York; to save shipping it, the Fed's staff marked drawers as French; papers called it a "loss of gold". | 1932 (Friedman's abstract; his body text says 1932–33) | M. Friedman, *The Island of Stone Money*, Hoover Institution Working Papers in Economics E-91-3 (Feb 1991); also ch. 1 of *Money Mischief* (1992). Full text: https://archive.org/details/IslandOfStoneMoney : the Bank of France "asked the Federal Reserve Bank of New York to convert dollar assets that it had in the U.S. into gold … To avoid the necessity of shipping the gold across the ocean, it requested the Federal Reserve Bank simply to store the gold on the Bank of France's account … officials … put in separate drawers the correct amount of gold ingots, and put a label or mark on those drawers … headlines in the financial newspapers about 'the loss of gold'". | ⚠️ | Revision 1: "Nobody shipped it" was wrong. **Much of the earmarked gold was later shipped to France** (Jan–Jun 1932 reports: in January 1932 the Bank of France "arranged to repatriate 125,000,000 dollars of gold now held under earmark", Papers Past wire reports; the July 1932 *Federal Reserve Bulletin* says gold exports were drawn from gold previously earmarked for foreign account). The wording claims only the earmarking: "To save shipping it, bank staff just marked the drawers as French." "Bank staff" for "officials of the Federal Reserve Bank". Friedman's further claim that this helped cause the 1933 banking panic isn't used. |
| g10 | Our money today isn't gold. | Dollar–gold convertibility for foreign central banks ended on 15 Aug 1971 (Nixon). | Federal Reserve History, "Nixon Ends Convertibility of U.S. Dollars to Gold…", https://www.federalreservehistory.org/essays/gold-convertibility-ends | ✓ | The screen says only `NOT TIED TO GOLD` (it sits next to a € note, and the euro, from 1999, was never tied to gold; 1971 is the dollar's date). "So who is its Wren?" is a question for later episodes, not a claim. |

**Numbers deliberately not used:**
- "Stock-to-flow ratio ≈ 60" (220,000 ÷ 3,600): that's EP 03's term and its central number.
- The above-ground stock in 1848 (often quoted as "about 10,000 t" with no traceable source), and so any "the rush added X% a year" figure. Newmarch's contemporary "half the gold in use, in 12 years" is noted above, not narrated.
- Miners' daily earnings ($20 a day in 1848 → under $8 by 1851): sources disagree on the years (Rodman Paul's table wasn't checked first-hand).
- UK prices 1914 → today (×79 by the BoE CPI to 2016): true and striking, but it's the next episodes' story. If it appears anywhere, it's in the game's small print, labelled.
- "Wholesale prices +30% from 1850 to 1855" (US) is in the fact check but not on screen; the British cost-of-living line is the one shown.
- Spoken tonnages (220,000 t, 3,500 t): since revision 1 the tonnes are on screen only, so voice and screen can't disagree.

## Revision 1 (after two reviews, 2026-11-09)
What changed:
- **g6 (P0/P1):** the chart now draws the real BoE series (plateau 1853–1873, highest in 1867, falling from 1874); no later peak is called "smaller". Narration: "stayed high for about twenty years. Then they fell", replacing "for a few years… then they settled". Added "In Britain, where money was gold". The +30% bracket is labelled `FROM THE 1851 LOW`; the chart keeps only three labels; the Jevons margin card is dropped from the movie and its quote marks are fixed in the fact check.
- **g7 (P1):** cowries now say "a silver dollar cost ten times more shells" (chapter 4's c6 rule); Rome "wheat cost thirty-seven times more"; gold "prices up to a third higher". The chapter's answer line, "Gold came closest to money without a cave.", ends g7.
- **g8 (P1):** "with big swings" and "So digging it pays far more" (the logic step); screen shows `2015 → 2025`; the fact-check note now says the window shows only that supply didn't jump. Wren's cameo starts at "Still," and the pad is 1.4 s.
- **g9 (P1 + cut):** cut from the movie. The corrected text ("To save shipping it…") is kept above and in the game's Wren card note; the fact check records that much of the gold was later shipped.
- **g3–g4:** tonnes are on screen only (`≈ 220,000 t`, `≈ 3,600 t`); spoken: the cube, "as tall as a seven-storey building", the slice. `STILL HERE` replaces the orbiting icons; the g4 jar inset is dropped.
- **g5:** "Three times a thin slice is still a thin slice." with an unlabelled cube and three slices; the 1830s bar is dropped.
- **g10:** "Our money today isn't gold. So who is its Wren? First: why is gold so hard to flood? Next episode: why gold." Screen: `NOT TIED TO GOLD` (no year next to the €).
- Fact check: the Newmarch row is fixed (Jevons accepts the estimate); added the 1840s-average comparison, Jevons' 1865 "permanent" range, the 1873–96 fall and the French "parachute" note.

Left open (see below): the "thin slice" line for the rush is figurative (⚠️ in the fact check); the 2026 swing figures came from the review and weren't re-read first-hand; the black-cross callback that chapter 1 left for g9 now has no place in the movie.

## Open questions
- ~~g9: cut or keep?~~ Cut (revision 1). Chapter 1 handed the German black-cross fine to this chapter; with g9 gone it appears nowhere. Options: one more muted line under the Wren card, or leave it to chapter 1's fact check.
- g6: the chart draws the real yearly line (revision 1). If the plateau still reads as busy on a phone, a 5-year centred average is an honest fallback (it still shows a plateau from about 1853 to 1877, not one hump), but then the `+30% FROM THE 1851 LOW` bracket must go, since the smoothed line has no 1851 low.
- g5: "Three times a thin slice is still a thin slice" is figurative and per year (the rush's 12-year total was a third to a half of the stock). Keep, or soften to "Still a thin slice, each year"?
- Length: 256 words, about 110–115 s. If it needs to come down, g2's list of five Wrens is the easiest place to trim.
- g10's `€ 1,000.00` banking app: OK as a neutral picture of "today's money", or does it point too early to EP 04 (bank money)?
