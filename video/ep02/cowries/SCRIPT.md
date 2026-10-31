# EP 02 · Chapter 4 · Cowries: script notes

**Purpose:** make a viewer with no financial background *feel* what happens when a money gets cheap to make. The same savings end up worth a tenth as much silver, and a day's shopping turns into a load you carry on your head. The Wren of this chapter is the Hamburg trading firms that found a cheap new source of shells on the far side of Africa. They did not make the shells: East African traders sold them, and West African merchants chose to buy them because they were cheap. Everyone in the chain had a good reason. The people who lost were the ones holding shells as savings.

The narration is in `narration.json`: 9 segments, 227 words. At the Yap pace (about 2.57 words a second) that is roughly 88 s of speech, or about 93 s with pads.
Scenes go in `scenes.js` as `SC.<scene>(lt, d, t, s)`. `W(n)` means `word(s, n)`, the time word *n* (counting from 0) of that segment is spoken. Word indices below were counted with `text.split()`, the same way `word()` and `build.py` count them.
Palette and props are the shared ones (`scene.js`, `props.js`: `cowrie`, `coin`, `sack`, `hut`, `ground`, `chart`, `stamp`, `label`, `where`). **New props needed:** `goat`, `jar` (clay pot), `head-load basket`, `brig` (a 19th-century merchant sailing ship, or reuse `schooner`), `kenkey` (a pale dough ball wrapped in a leaf), `reef` (a strip of shallow turquoise water over coral), and an Africa outline for the map.
Wren is drawn with `alien("wren", …)`. The sprite id is still "rod" until the rename lands.

## Segments and visuals

### c0 · `ctitle` · "Chapter four. Cowries: the money that got too heavy to carry."
| When | What is drawn |
|---|---|
| 0 | Dark `C.bg` with a slow fall of cowries (the `cowrie` prop at 1×, about 30 of them, drifting down and piling at the bottom). |
| W(0) | "CHAPTER 4" (muted, 40 px) fades in. |
| W(2) "Cowries" | The title **COWRIES** (gold, 150 px) pops in. |
| W(3)–W(10) | Subtitle "the money that got too heavy to carry" (ink, 44 px). On W(8) "heavy" the whole pile at the bottom sags 2 px and a `thud` plays. |

### c1 · `shellmap` · "For centuries, much of West Africa used a small seashell as money: the cowrie. Most came from the Maldives, in the Indian Ocean."
| When | What is drawn |
|---|---|
| 0 | A pixel map: the Africa outline in sand on a sea `C.sea`, with India's tip at the right edge. |
| W(2)–W(5) "West Africa" | A cowrie-coloured wash spreads over the West African shoulder, from the Niger bend down to the coast (roughly today's Ghana, Togo, Benin, Nigeria). Label: **COWRIE COUNTRY**. |
| W(9) "seashell" | A single big cowrie (`cowrie` at 4×) pops in at the top left, with a "≈ 1 g" tag. |
| W(18) "Maldives" | A dot blinks south-west of India, labelled **MALDIVES**, and a dotted route draws itself round the Cape to the West African coast (the old route ran via Europe; a simple curve is enough). |

### c2 · `strings` · "One shell bought very little, so people counted them. Forty to a string. Two thousand to a head."
| When | What is drawn |
|---|---|
| 0 | A market mat seen from above, with a market woman's hands counting. One cowrie in the middle. |
| W(1)–W(4) | A tiny price tag reads "1 shell = very little". |
| W(9) "Forty" | 40 shells snap into a vertical **string** (a counter runs 1→40 in 0.6 s). Label **STRING = 40**. |
| W(13) "Two thousand" | The string multiplies into 50 strings, which bundle into one **HEAD**: a fat bundle about the size of a loaf. Label **HEAD = 2,000**, with "≈ 2 kg" underneath (Maldive shells). |

(The kenkey price was cut from this segment: the only sourced price, 3 shells, is from 1858, after the flood had begun, so it is not a fair "before" price. It appears on screen in c6, dated.)

### c3 · `ships` · "West African traders wanted shells: their markets ran on them. So European ships brought shells by the ton, to buy enslaved people... and later, palm oil."
Tone: plain and still, with no music hits on "enslaved". The music drops to the drone only for this segment.
| When | What is drawn |
|---|---|
| 0–W(9) | A busy coastal market at midday: West African traders at stalls, counting shells into strings and paying with them. The point is that the demand was theirs: shells were *their* money, and they chose what to accept. |
| W(10)–W(17) "So European ships … by the ton" | The light dims to dusk. A sailing ship at anchor offshore and a canoe bringing sacks (the `sack` prop) in through the surf. Sacks stack up on the beach. A small label: "one ship, 1720s: about 12 tonnes of shells" (Savary des Bruslons, 1726; see the fact check). |
| W(18)–W(21) "to buy enslaved people" | No figures and no cartoon people. The scene darkens to near-silhouette. One line of text, muted, centred: **CENTURIES OF THE SLAVE TRADE**. Hold for a beat (the "..." in the text gives the pause). |
| W(22)–W(25) "and later, palm oil" | Light returns slowly. The sacks are now traded for clay pots of palm oil (red-orange). Label: **1800s · PALM OIL**. |

### c4 · `zanzibar` · "In eighteen forty-five, a Hamburg firm found a shortcut. In Zanzibar, local traders sold a bigger cowrie for far less. The firm shipped some to Dahomey."
| When | What is drawn |
|---|---|
| 0 | The c1 map again, zoomed out a little so East Africa shows. `where("1845", "HAMBURG → ZANZIBAR")`. |
| W(4) "Hamburg" | A small warehouse icon in Europe, labelled **HAMBURG**. A ship leaves it. |
| W(10) "Zanzibar" | The ship reaches Zanzibar (on the east coast). A cave icon from the hook is stamped over the island, the same stamp as the hook's "CAVE!", but reading **REEF!**. Behind the stamp, a strip of shallow reef water. |
| W(11)–W(13) "local traders sold" | A Zanzibar market stall: a trader measuring shells out of a basket. Small caption: "gathered alive on East African reefs". |
| W(15) "bigger cowrie" | Side by side: a Maldive cowrie (1×, "≈ 1 g") and a Zanzibar cowrie (2× area, a yellow ring on its back; "≈ 2 g"). |
| W(18) "far less" | A price tag swings: Maldive shell price high, Zanzibar shell low (no numbers: we have no clean per-ton prices). |
| W(22)–W(25) "shipped some to Dahomey" | A small load goes into the hold and the ship sails west round the Cape to the West African coast; a dot labelled **DAHOMEY** blinks. **Wren cameo:** Wren pops up in the corner holding a pentaja and says "HEY, THAT'S MY MOVE" (speech bubble, 1.2 s). |

### c5 · `shellflood` · "German and French firms followed. Coastal merchants bought them: they were cheap. By one estimate, sixteen billion shells poured in."
| When | What is drawn |
|---|---|
| 0 | A beach at Ouidah (`where("OUIDAH · DAHOMEY", "1845–1880")`). One ship offshore. |
| W(0)–W(4) | Ships multiply: 1 → 3 → 6, with small flags (two German, one French; generic flag colours, no real crests). |
| W(5)–W(11) "Coastal merchants bought them" | On the beach, West African merchants trade pots of palm oil for sacks of shells, and nod at the price. A tag: "cheaper per shell". |
| W(12)–W(19) | Shells pour onto the beach from every ship and the pile rises like a dune. A year counter runs **1845 → 1880** in the corner. |
| W(16) "billion" | A big label: **≈ 16,000,000,000 SHELLS**. A second line fades in under it: **≈ 1,000 for every person in the region** (16 billion against about 15 million people; our arithmetic). Tiny muted tag: "one estimate". |

### c6 · `jar` · "In Dahomey, a silver dollar cost about two thousand shells in the eighteen forties. By the eighteen eighties: twenty thousand. A family that had saved two thousand shells now held a tenth of a dollar. They hadn't spent a single one."
This is the emotional core: the viewer should *feel* the saver's loss.
| When | What is drawn |
|---|---|
| 0 | Inside a hut. A clay **jar** on the floor, and a silver dollar (`coin` at 2×) on a stool. |
| W(3)–W(9) | A balance scale appears: the dollar on one pan, one head of 2,000 shells on the other. The scale is level. Label **1840s: 1 DOLLAR ≈ 2,000 SHELLS**. |
| W(14)–W(19) "By the eighteen eighties: twenty thousand" | The year flips fast through two real stops, **1864: 5,000** and **1871: 10,000**, then lands on **1880s: 20,000**. The shell pan grows to 10 heads before the scale levels; the pile spills over the edge. A big gold **×10**. |
| W(20)–W(27) "A family … saved two thousand shells" | Camera pushes in on the jar. A family (two adults and a child, `person` sprites) stand behind it. The jar is labelled **SAVINGS: 2,000 SHELLS**. |
| W(28)–W(34) "now held a tenth of a dollar" | A ghost silver dollar hovers over the jar, then gets sliced like a pie: 9 slices fade to grey, 1 stays silver. Label: **= 1/10 OF A DOLLAR**. |
| W(35)–W(40) "They hadn't spent a single one" | Hold on the jar. Nothing moves except the shell count, which stays at 2,000 (that is the point). Small text in the bottom corner, muted: "Food rose too. In Abomey, a ball of maize dough: 3 shells in 1858, 12 in 1864." A kenkey ball slides in next to a "12". |

### c7 · `heavy` · "And the money got heavy. Around nineteen hundred in Lagos, one small silver shilling was worth four thousand shells. A coin in your fist... or a sack on your head."
| When | What is drawn |
|---|---|
| 0 | A Lagos market street. `where("LAGOS", "about 1900")`. |
| W(4) "heavy" | A `thud`, and the camera shakes 1 px. |
| W(10)–W(13) "one small silver shilling" | A hand opens to show one shilling (`coin` at 1×). Tag **5.7 g**. |
| W(16)–W(18) "four thousand shells" | Next to it, 4,000 shells fall into a sack. A weight tag counts up to **≈ 4–8 kg** (4,000 shells at 1–2 g each, depending on the mix). |
| W(19)–W(23) "A coin in your fist" | The fist closes around the coin. |
| W(24)–W(29) "or a sack on your head" | A woman (a `person` sprite) lifts the sack onto her head and walks off slowly, with a slight sway. A small note at the bottom: "the same 2,000 shells: about 4 shillings in the 1850s → half a shilling around 1900". At the end, a small muted stamp slides in: **1904: SOUTHERN NIGERIA BANS NEW SHELLS**. |

### c8 · `ccallback` · "Remember Ulm Hollow's bogwool? Too bulky to be money. Flood a money, and it turns into bogwool. Wren found a cave. Hamburg found a reef. Next: what if Wren... is the emperor?"
| When | What is drawn |
|---|---|
| 0 | Ulm Hollow (EP 01 art): Wren beside a huge, fluffy bale of bogwool. `where("PREVIOUSLY · ULM HOLLOW")`. |
| W(4)–W(8) "Too bulky to be money" | A villager tries to pay with the bale and it won't fit through the stall door. Stamp on W(8): **NOT MONEY**. |
| W(9)–W(16) "Flood a money … into bogwool" | Split screen: on the right, the Lagos woman's cowrie sack swells and morphs into a bogwool bale (the outline grows fluffy). |
| W(17)–W(24) | Two stamps, one after the other: Wren in front of the cave, "**CAVE**" (W(20)); a Hamburg ship over a reef, "**REEF**" (W(24)). Wren gives a shrug. |
| W(25)–W(31) "Next … the emperor" | Cut to black. A silver coin spins in the centre and a laurel wreath draws round it. On W(28) "Wren" Wren's silhouette flickers behind the coin; on W(31) "emperor" the coin flips to show a **cave stamped on the emperor's profile**. Label: **NEXT · ROME**. Fade on the pad. |

## Fact check

Every number spoken or shown is listed here. "Via" means we read the claim in that secondary source, not in the original.

| Line | Claim | Source | Note |
|---|---|---|---|
| c1 | Cowries were money across much of West Africa for centuries. | M. J. Pont Cháfer, "Thresholds, Borders and Cowries: the Problem of Small Change in West Africa…", in E. Morelli (ed.), *African Thresholds* (Brill, 2025, open access), pp. 214–215: "the earliest document mentioning the cowry as a low-denomination currency dates from the mid-fourteenth century… it reached its heights in the mid-nineteenth century". https://library.oapen.org/bitstream/20.500.12657/105276/1/9789004726970_webready_content_text.pdf | ✓ Read in full. |
| c1 | Most came from the Maldives. | A. Haour & A. Moffett, "Cowrie in East Africa" (UEA preprint): "From the sixteenth century moneta cowries from the Maldives were brought in enormous quantities to West Africa by European ships to meet a thriving local demand". https://ueaeprints.uea.ac.uk/87131/ . Pont Cháfer (2025) p. 214: "the shells from the Maldives were particularly sought due to their small size". J. S. Hogendorn, "A 'supply-side' aspect of the African slave trade: the cowrie production and exports of the Maldives", *Slavery & Abolition* 2:1 (1981). | ✓ True before about 1850. Before the Atlantic trade, cowries also came across the Sahara; "most" covers that. |
| c1 / c2 | A Maldive shell weighs about 1 g. | Pont Cháfer (2025) p. 221: "a Maldivian specimen weighted little more than 1g (the East African cowry, the double)". Hogendorn (1981) p. 36: Maldive bundles of "about 25 pounds each and containing 12,000 shells" (≈ 0.95 g each), not re-read by us. | ✓ So a head of 2,000 Maldive shells ≈ 2 kg (our arithmetic). |
| c2 | One shell bought very little. | Pont Cháfer (2025) p. 219: around 1900 in Calabar a dish of gari and soup cost 5 cowries; in 1934 at Gaoua, 21 groundnuts cost 5. | ✓ Softened from "almost nothing". |
| c2 | 40 to a string, 2,000 to a head. | Central Bank of Nigeria, "Before 1959": "In 1860 … 40 Cowries formed a 'String'; 50 Strings made a 'head' and 10 heads comprised a 'bag'." https://www.cbn.gov.ng/currency/Oldnotes/before.html . T. J. Hutchinson, *Impressions of Western Africa* (1858), p. 7, on Lagos: "2,000—which is called a head—for a dollar", via M. Johnson, "The Cowrie Currencies of West Africa, Part II", *J. African History* 11 (1970), n. 54. Burton (1864) uses the same 2,000 "head" at Whydah and Abomey ("2½ heads"; see c6). | ✓ These are coastal Yoruba and Dahomey units; counts differed elsewhere (in 18th-century Ouidah the European "cabess" was 4,000). |
| c3 | West African traders wanted shells; their markets ran on them. | Haour & Moffett: "to meet a thriving local demand". Pont Cháfer (2025) p. 221: in local markets "it was almost impossible to buy without cowries", and wages, taxes and tolls were paid in them. | ✓ This is the agency line: the demand came from West African markets, not from European whim. |
| c3 | European ships brought them by the ton. | Savary des Bruslons, *Dictionnaire universel de commerce* (1726), via G. Salaün (Musée Dobrée), "Cowries, the currency of trading" (2023): a cargo now needed "more than twenty-five thousand pounds". https://www.anneauxdelamemoire.org/post/cowries-the-currency-of-trading-en-fr . Same page: large payments were measured in a copper basin holding "approximately eight hundred pounds". | ✓ Not read in the original. Savary's pounds are French *livres* (≈ 0.49 kg), so 25,000 ≈ 12 t; the on-screen label says "about 12 tonnes". "By the ton" is safe even without Savary. |
| c3 | Used to buy enslaved people, and later palm oil. | Haour & Moffett (above): shells "exchanged for captives destined for the Atlantic trade". Hogendorn (1981) p. 45: the "main money of the slave commerce"; p. 32: abolition early in the 1800s "virtually halted cowrie imports, but imports fully recovered when the palm oil trade opened" (via the writer's notes, not re-read). | ✓ "Later, palm oil" means "later, mostly palm oil": slave exports from Ouidah went on into the 1860s. |
| c4 | 1845: a Hamburg firm bought Zanzibar cowries and sold them in Dahomey. | K. Pallaver, Cambridge seminar abstract (2023): "In 1845, the Hamburg-based firm, A.J. Hertz, purchased a small load of cowrie shells (M. annulus) in Zanzibar, shipped it to West Africa and sold it at Whydah, in the Kingdom of Dahomey." https://www.histecon.magd.cam.ac.uk/seminar_pallaver.htm (also talks.cam.ac.uk/talk/index/193801). | ✓ The narration now says "shipped some" (it was a "small load"); the old "they filled a ship" was cut. |
| c4 | Local traders in Zanzibar sold a bigger cowrie for far less. | Haour & Moffett: a mid-19th-century witness reported the trade was "in the hands of Muslim traders", most shells going to the West African coast; cowries "were fished alive from the reef, not collected as beach wash". Pont Cháfer (2025) p. 214: East African shells were "larger and heavier", disadvantages "more than offset by their lower prices". | ✓ This is why the stamp and the c8 line now say **reef**, not "beach". |
| c4 | About 2 g per Zanzibar shell (on screen). | Pont Cháfer (2025) p. 221: the East African cowry is "the double" of a ~1 g Maldive one. | ✓ Approximate. |
| c5 | German and French firms followed. | Pont Cháfer (2025) p. 214: East Africa "became the main provider after the 1850s". Hogendorn (1981) p. 32: "Led initially by German firms, Hertz first, then O'Swald (both based in Hamburg), and followed by the French firm of Victor Regis" (via the writer's notes, not re-read). Haour & Moffett: one Hamburg shipping house reportedly grew "from one to eighteen ships, of which seven were engaged in shipping cowries". | ✓ |
| c5 | Coastal merchants bought them because they were cheap. | Pallaver (2023 abstract): West African traders "decided" to accept the East African shells; the paper is about "the choices, initiatives and actions of African consumers and producers". Pont Cháfer p. 214 (lower prices, above). | ✓ Note: Haour & Moffett say the larger shells were "initially less desired" in West Africa, so we say "bought them", not "snapped them up". |
| c5 | By one estimate, sixteen billion shells. On screen: ≈ 1,000 per person. | Pallaver (2023 abstract), citing Hogendorn & Johnson, *The Shell Money of the Slave Trade* (CUP, 1986): "In a few decades, 16 billion shells were introduced into the region". Consistent with the outline's "about 27,000 tons in 30 years" (≈ 1.7 g a shell). Population: Pont Cháfer (2025) p. 214, "a potential user population of about 15 million". | ⚠️ Estimates differ. Pont Cháfer (p. 214, also citing H&J pp. 62–78) gives "an average of 1 billion cowries each year" for 1851–1880, about twice as much. We say "by one estimate" and use the lower figure. 1,000 per person = 16 billion ÷ 15 million (our arithmetic, rounded). We could not open H&J itself. |
| c6 | Dahomey: a silver dollar cost about 2,000 shells in the 1840s, 20,000 by the 1880s. | Pont Cháfer (2025) pp. 215–216: "in Dahomey, the Spanish dollar rate went from 2,000 cowries in the late 1840s to 20,000 cowries in the 1880s", citing R. Law, "Cowries, Gold, and Dollars…", in J. Guyer (ed.), *Money Matters* (1995), pp. 53–74. Independent stops: R. F. Burton, *Mission to Gelele* (1864), I, p. 143: "The dollar (4/6d) now buys 2½ heads at Whydah and Agbome" (= 5,000), via Johnson (1970) n. 57; Skertchly (1874) for 10,000 in 1871, via Pont Cháfer p. 218. | ✓ "About", because rates moved from month to month (Hutchinson, 1858: cowries were "varying in value as Government con[sol]s or Railway Shares do at home") and Law's figure is for the *late* 1840s. The on-screen stops 1864: 5,000 and 1871: 10,000 come from Burton and Skertchly. |
| c6 | The family's 2,000 shells were now a tenth of a dollar. | Follows from the rate above. | ✓ ⚠️ **Nuance:** Pont Cháfer argues this was mainly a fall *against silver*, worst on the coast. Some local food prices stayed fairly stable (a "generous daily diet based on maize (about 200 cowries) remained the same" in Dahomey 1871–1899, p. 218). So the narration says "a tenth of a dollar" (true), not "a tenth as much food" (not shown). |
| c6 | On screen: maize dough ball 3 shells (1858) → 12 (1864), Abomey. | Pont Cháfer (2025) p. 218, citing R. Law, "Posthumous Questions for Karl Polanyi: Price Inflation in Pre-Colonial Dahomey", *J. African History* 33 (1992), p. 414. | ✓ Secondhand. A real coastal food-price rise, but Pont Cháfer notes food shortages may explain part of it, so it stays a small on-screen note, not narration. |
| c7 | Around 1900 in Lagos, one shilling = 4,000 shells. | Pont Cháfer (2025) p. 217: "at the end of the nineteenth century, it was equivalent in Lagos to 4,000 cowries"; p. 220: the threepence "was equivalent to … 1,000 cowries in Lagos" (= 4,000 a shilling). A. G. Hopkins, "The Currency Revolution in South-West Nigeria in the Late Nineteenth Century", *J. Hist. Soc. Nigeria* 3:3 (1966), p. 476, via Pont Cháfer p. 216: "2,000 cowries exchanged for about 50 pence in the 1850s but for only 6 pence at the turn of the century". | ✓ Three figures that agree (2,000 = 6d → 4,000 = 12d = 1s), but all read via Pont Cháfer. |
| c7 | On screen: the same 2,000 shells were about 4 shillings in the 1850s, half a shilling around 1900. | Hopkins (1966) via Pont Cháfer, above: 50 pence ≈ 4 shillings; 6 pence = half a shilling. Cross-check: Hutchinson (1858) gives 2,000 for a dollar at Lagos, and Burton (1864) values the dollar at 4s 6d. | ✓ The outline's "1s 6d by 1859" (from a garbled OCR snippet) conflicts with Hutchinson's 1858 rate, so it is not used. |
| c7 | A silver shilling weighs 5.7 g (on screen). | 1816 standard: 66 shillings to the troy pound = 5.655 g, .925 silver. Wikipedia, "Shilling (British coin)". | ✓ |
| c7 | 4,000 shells ≈ 4–8 kg (on screen). | 4,000 × 1–2 g (weights above). | Our arithmetic. The range is wide because the Lagos mix of Maldive and Zanzibar shells is unknown. |
| c7 | On screen: 1904, Southern Nigeria bans new shells. | Pont Cháfer (2025) p. 214: "1904, the year in which the British prohibited their importation in the Protectorate of Southern Nigeria"; p. 220: over 800 million cowries were imported there in 1901–1904, and "the prohibition of 1904 targeted these imports". A 1911 ordinance still lists cowries among prohibited imports (A. Olukoju, *African Economic History* 53:1 (2025), p. 121). | ✓ The label names Southern Nigeria, not Lagos: Lagos was a separate colony until 1906. Cowries stayed in use for decades (Governor Macgregor, 1901: "the currency is still cowries", Olukoju p. 121), so don't say "and that was the end". |
| c8 | "Bogwool: too bulky to be money." | EP 01, `lessons/01-barter/sim.js`: bogwool "Keeps forever, but bulky." | ✓ In-game fact. |
| c8 | "Hamburg found a reef." | Rhetorical, after Wren's cave. | The shells were taken alive from East African reefs (Haour & Moffett) and sold by local traders; Hamburg "found" a cheap source the way Wren found the cave. |

**Debate to know about (no need to air it in a 90 s chapter):** Hogendorn & Johnson (1986) call this "the great inflation" that ruined the shell money. Pont Cháfer (2025) calls it "the great depreciation": huge on the coast and against silver, much milder inland, where cowries kept buying food into the 1930s. Our script stays on the coast (Dahomey, Lagos), where both agree the shells collapsed against silver, and it says "a tenth of a dollar", never "a tenth as much food".

## Sound cues (for `cues.py`)

```python
# chapter 4 · cowries
place(sfx, seg["c0"]["t0"], whoosh(), 0.25)
for i in range(24): place(sfx, seg["c0"]["t0"] + 0.2 + i * 0.09, clink(2400 + (i * 211) % 700), 0.05)   # shells pattering down
place(sfx, w("c0", 8), thud(), 0.45)                                                       # "heavy"
place(sfx, w("c1", 9), pop_(900), 0.15)                                                    # the big cowrie
place(sfx, w("c1", 18), chime(79, (0,)), 0.15)                                             # Maldives blink
for k in np.linspace(w("c2", 9), w("c2", 9) + 0.6, 12): place(sfx, k, clink(2200), 0.04)  # string of 40
place(sfx, w("c2", 13), thud(), 0.3)                                                       # a head bundles up
# c3: market murmur under W(0)-W(9), then no hits. Low wind and surf only; the music drops to its drone.
place(sfx, w("c3", 10), noise(2.5, 2, seed=7), 0.05)
place(sfx, w("c4", 4), whoosh(), 0.15)
place(sfx, w("c4", 10), thud(), 0.5)                                                       # REEF! stamp
for k in np.arange(w("c4", 22), w("c4", 22) + 0.6, 0.05): place(sfx, k, clink(1800 + 400 * np.sin(k * 9)), 0.04)   # a small load goes in
place(sfx, w("c4", 23), pop_(1100), 0.12)                                                  # Wren cameo
for k in np.linspace(w("c5", 12), w("c5", 19), 60): place(sfx, k, clink(1500 + 1500 * (k - w("c5", 12)) / max(.1, w("c5", 19) - w("c5", 12))), 0.035)  # pouring, rising pitch
place(sfx, w("c5", 16), thud(), 0.45)
place(sfx, w("c6", 4), chime(76, (0, 7)), 0.15)                                            # scale level
for k in np.linspace(w("c6", 14), w("c6", 19), 18): place(sfx, k, clink(1600), 0.05)      # ten heads pile up
place(sfx, w("c6", 19), thud(), 0.5)                                                       # ×10
place(sfx, w("c6", 31), tone(300, 0.6, "square", 180, decay=0.25), 0.10)                   # slices fade: falling tone
place(sfx, w("c7", 4), thud(), 0.6)                                                        # "heavy"
place(sfx, w("c7", 12), clink(3200), 0.15)                                                 # one bright coin
for k in np.linspace(w("c7", 16), w("c7", 18) + 0.3, 30): place(sfx, k, clink(1300), 0.04)  # 4,000 shells into a sack
for k in np.arange(w("c7", 26), w("c7", 29) + 1.0, 0.55): place(sfx, k, thud(), 0.12)     # slow footsteps under the load
place(sfx, w("c8", 8), thud(), 0.4)                                                        # NOT MONEY
place(sfx, w("c8", 20), thud(), 0.4); place(sfx, w("c8", 24), thud(), 0.4)               # CAVE / REEF stamps
place(sfx, w("c8", 31), chime(62, (0, 3, 7, 10)), 0.25)                                    # emperor: minor sting
```

## Music idea

- **Key and feel:** F major pentatonic (F G A C D) over a 12/8 groove at about 100 BPM (dotted-quarter pulse). A bright marimba (balafon-like) lead from the synth kit's `marimba`, a `pluck` bass on F–C, and a bell line (`hat` pitched high, or `clink`) playing the standard 12/8 bell pattern `x.x.xx.x.x.x`. This is a nod to West African timelines, kept simple and chiptune; no attempt to imitate a specific tradition.
- **Shape:** c0–c2 are full and light. **c3 drops to a sustained low F drone only**, with no melody or bell, for the slave-trade line. c4–c5 bring the groove back and add a second marimba voice per new ship (the music "floods" too). **c6–c7 get heavy:** the bell pattern drops out, the bass moves to D minor (relative minor), and the tempo feel halves (half-time hats), so it sounds like walking under a load. c8 lifts back to F for the bogwool callback, then ends on the minor Rome sting.
- Suggested `section` calls: `section(seg["c0"]["t0"], seg["c3"]["t0"], [53, 48, 50, 48], COW_MEL, style="bright")`, a drone `section(seg["c3"]["t0"], seg["c3"]["t1"], [41], [[None]*8], style="mystery")`, then the bright section again until `seg["c6"]["t0"]`, then `[50, 46, 48, 45]` with `style="mystery"` through c7. `COW_MEL` example (MIDI, `_` = rest): `[[77,_,79,81,_,84,81,_],[79,_,77,_,74,_,77,_],[81,84,86,_,84,81,79,_],[77,_,_,74,77,_,_,_]]`.

## Open questions
- c3: is one muted line ("CENTURIES OF THE SLAVE TRADE") enough, or should it carry a number? Savary's figure is literally a shell price for a ship's cargo of captives, and turning people into a price on screen feels wrong for this format. The "12 tonnes" label shows only the shells. I'd leave it as is.
- c5: if someone can open Hogendorn & Johnson (1986), pp. 62–78, check which import figure to use (16 billion in "a few decades", or about 1 billion a year for 1851–1880). The narration says "by one estimate" either way.
- Place names: the narration uses "Dahomey", "Zanzibar" and "Lagos" only (TTS-safe). "Ouidah" and "Abomey" appear only on screen.
