# EP 02 · Every Wren in History: chapter 3, Wampum (North America): when the tools changed

**Purpose:** a viewer with no financial background should *feel* inflation as "the same beaver pelt now costs five times the beads", see that the pelt did not change, and see who lost: whoever had saved wampum or was paid in it. The cause: once makers had iron drill points, beads got much cheaper to make, and rough beads and fakes flooded in on top. (Jordan, Notre Dame: production rose "partly" because of metal tools, chasing the fur trade's demand; the colonies' own records complain about oversupply.)

The narration is in `narration.json` (9 lines, 229 words, about 89 s of speech, about 95 s with gaps and pads at the Yap pace of 2.56 words/s).
The scenes are in `scenes.js` (`SC.wtitle` … `SC.wcallback`) and the sound in `cues.py`; both follow the word indices below. The scene names start with `w` so they cannot collide with Yap's `title`, `map` and `callback`.
Word indices below are 0-based positions in `text.split()`, which is what `W(n)` / `word(s, n)` in `scenes.js` and `w("w6", n)` in `cues.py` expect. They were recounted after the fact-check edit (2026-10-31).

**Art direction, tone:** use the same pixel style and palette as Yap.
- The coastal people are the Narragansett, Wampanoag, Montaukett and Lenape peoples of the 1600s. Draw them as ordinary working people in Eastern Woodlands dress (deerskin, wool trade cloth after the colonists arrive). Do not draw feather headdresses, war paint or other "movie Indian" clichés.
- Native people are traders and makers with their own reasons, never dupes. Inland nations *choose* to take wampum for their furs (w4); coastal makers *choose* iron points because they can make more beads to trade (w5). Show those choices on screen (a hand picking up the iron point, a trader weighing a string before accepting it).
- No "Manhattan was bought for beads" gag anywhere: that's a myth (the only record, Pieter Schagen's 1626 letter, says the island was bought "for the value of 60 guilders" and mentions no beads or wampum).
- Belts are generic white and purple patterns (diamonds, bands). Do not copy a real, named belt such as the Hiawatha or Two Row belt: those are sacred and political documents of living nations.
- In the music, avoid fake "tribal" tom-tom drums. Keep it in the series' chiptune voice.
- TTS: check that "quahog" comes out as *KO-hog* and "wampum" as *WAHM-pum*. If it doesn't, try the respelling "co-hog" in the TTS text only. Wren has no pronoun anywhere.

## Segments and visual plan

### w1 · `wtitle`: "Chapter three. Wampum: when the tools changed."  (dip, pad 1.0)
| Words | Visual |
|---|---|
| start | Night-blue background with a few stars. One white bead and one purple bead turn slowly at the centre, with a big pixel ring around them. |
| 0 "Chapter" | Small `CHAPTER 3` fades in above, in the muted colour. |
| 2 "Wampum:" | `WAMPUM` lands big in gold, with a title sting. |
| 3–6 "when the tools changed" | `when the tools changed` in the muted colour under it. At 5 "tools", the white bead gets a tiny glint, as if drilled. |
| end | 0.5 s fade out. |

### w2 · `wshore`: "On America's northeast coast, people made beads from shells: white from the whelk, purple from the quahog clam. Wampum."
| Words | Visual |
|---|---|
| start | Low tide on a grey-green shore, with a bark-covered house (a wetu) and a few people bending over the mud flats. |
| 1–3 "America's northeast coast" | A small inset map slides in at the top right: the coast from Cape Cod to Long Island, with a dot. Labels: `NEW ENGLAND`, `LONG ISLAND`. Top-left label: `THE NORTHEAST COAST`. |
| 9 "white" | A whelk shell (spiral) pops up big on the left. Its inner column glows white, a white tube-bead flies out, and a `WHITE` tag appears. |
| 13 "purple" | A quahog shell (round clam) pops up on the right. Its purple edge glows, a purple bead flies out, and a `PURPLE` tag appears. |
| 18 "Wampum." | The two beads multiply into a string of alternating white and purple beads drawn across the screen, with the label `WAMPUM` (gold). |

### w3 · `wstone`: "Each bead was cut, drilled and polished by hand, with stone. Slow work. Strung into belts, wampum sealed treaties between nations."
| Words | Visual |
|---|---|
| start | A close-up of hands at a pump drill (a wooden shaft, a crossbar on a cord, a stone flywheel, a stone point) over a shell blank in a little wooden clamp. |
| 3 "cut" | The shell is snapped into a small rectangular blank (a click). |
| 4 "drilled" | The pump drill starts going up and down, slowly. A progress bar `1 BEAD` starts filling and does not finish until word 10. Use a scrape sound on each pump. |
| 6 "polished" | The blank is rubbed on a flat stone: a few dust pixels. |
| 10 "stone." | The bar completes and one bead drops into a little dish: `BEADS: 1`. |
| 11–12 "Slow work." | The sun icon in the corner sweeps across the sky while the counter crawls `2… 3`. Hold the shot, no music lift: let it feel slow. (No "beads per day" number on screen: none is sourced.) |
| 13–15 "Strung into belts" | The beads fly up and assemble into a wide white belt with purple diamonds, row by row. |
| 17–18 "sealed treaties" | Two hands from opposite sides of the frame hold the belt between them. Tag: `A BELT = A PROMISE`. |

### w4 · `wlaw`: "European colonists arrived with almost no coins. Inland nations took wampum for furs, so colonists used it as money. In sixteen thirty-seven, Massachusetts made it legal small change: six beads to a penny."
| Words | Visual |
|---|---|
| 0–2 "European colonists arrived" | A ship (reuse `schooner`, re-rigged as a 1600s ship if there's time) glides in from the left and settlers step onto the shore. |
| 4–6 "almost no coins" | A colonist turns out an empty purse; one lonely coin rolls away. The tag reads `COINS: ALMOST NONE`. |
| 7–12 "Inland nations took wampum for furs" | At a trading post, an inland trader with a stack of beaver pelts weighs a string of wampum in one hand, nods, and the pelts change hands. Tag: `FURS ⇄ WAMPUM`. |
| 13–18 "so colonists used it as money" | Two colonists swap: a short string of wampum one way, a sack of grain the other. |
| 20–21 "sixteen thirty-seven" | A parchment unrolls: `MASSACHUSETTS · 1637`. |
| 25–27 "legal small change" | A `LEGAL` stamp lands on the parchment. |
| 28–32 "six beads to a penny" | Six beads line up one by one (a pop each), then `=` and a silver penny. The big label reads `6 BEADS = 1 PENNY`, with a small note under it: `for sums under 12 pence`. |

### w5 · `wiron`: "The newcomers also brought iron. Coastal makers switched to iron drill points: far faster than stone. Beads multiplied. Rough ones and fakes poured in too."
| Words | Visual |
|---|---|
| 4 "iron." | An iron awl point drops onto a maker's bench with a clank and a glint. |
| 5–7 "Coastal makers switched" | The maker from w3 picks it up, looks at it, and swaps it into the pump drill in place of the stone point. Their choice, shown plainly. |
| 9–15 | Split screen. LEFT is labelled `STONE`: the same slow pump drill, with its counter crawling `1… 2`. RIGHT is labelled `IRON`: the same pump drill with the iron point, going fast, its counter racing `1… 12… 40… 90`. A dark strip along the bottom says `made-up counts: no record says how much faster`. |
| 12–13 "far faster" | Both counters flash. |
| 16–17 "Beads multiplied." | The right pile overflows its dish. Neighbouring benches in the background start piling up too. |
| 18–21 "Rough ones and fakes" | Grey, chipped beads, some without a hole, land on the pile, with a `ROUGH` tag on one and a `FAKE` tag on another. |
| 22 "poured" | A handcart tips a whole load of rough beads onto the pile, with a long rattle. The pile is now bigger than the screen edge. |

### w6 · `wbeaver`: "In Dutch New Amsterdam, a beaver pelt cost about six hundred and forty beads in sixteen forty-one. By sixteen sixty-two: three thousand two hundred. Same pelt. Five times the beads. That's inflation: the pelt didn't change. The beads got cheap."
**The key scene: give it room.**

| Words | Visual |
|---|---|
| 1–3 "Dutch New Amsterdam" | A small Dutch town with a windmill and a fort wall. Tag: `NEW AMSTERDAM (NEW YORK)`. |
| 5–6 "beaver pelt" | A beaver pelt (brown, stretched on a round hoop frame) sits on the left side of a market scale. |
| 9–13 "six hundred and forty beads" | Strings of white wampum drop onto the right pan until it balances. Label: `1641 · 640 BEADS` (the number shows 640 at once, as the narrator says it; only the strings pile up). The 640 beads show as about 2 strings (each pixel string stands for about 300 beads, labelled `1 STRING = ABOUT 300 BEADS`). |
| 17–19 "By sixteen sixty-two" | The year ticks `1650s → 1658 → 1662`. At each tick, more strings pour onto the right pan and the pan keeps going *up*, light, as if the beads weighed less. Small labels: `1650s · 1,200` and `1658 · 2,240`, then the big one, `1662 · 3,200 BEADS`. The right pan's pile is now five times the size. |
| 24–25 "Same pelt." | The pelt pulses, and a `SAME` tag appears on it. A line under the pelt: `in silver coins: same price`. |
| 26–29 "Five times the beads." | A big gold `×5` stamp lands between the pans. |
| 30–31 "That's inflation:" | Cut to a clean card. `INFLATION` on top. |
| 32–35 "the pelt didn't change." | Under it, a pelt icon with `=` (unchanged). |
| 36–39 "The beads got cheap." | A bead icon with a red down-arrow: `EACH BEAD BUYS LESS`. |
| behind / end | A small line chart along the bottom edge: `ONE BEAVER PELT, IN WHITE BEADS`, points 1641 = 640, 1650s = 1,200, 1658 = 2,240, 1662 = 3,200. Source line: `after L. Jordan, Notre Dame, from Dutch records`. |

### w7 · `wbakers`: "If you saved wampum, or earned it, it bought less and less. You did nothing wrong. In sixteen fifty-eight, the town's leaders complained that bakers and brewers would hardly take the beads."
| Words | Visual |
|---|---|
| 2 "saved" | An older person (a coastal elder, or a Dutch labourer: either works) lifts the lid of a basket of strung wampum. Label: `SAVINGS: 240 BEADS`. |
| 5 "earned" | A labourer is handed a short string at a wall: `WAGES`. |
| 7–11 "it bought less and less" | A sign on the wall is repainted by a painter: `6 BEADS = 1 STIVER` becomes `8 BEADS = 1 STIVER`. Under the savings basket, its worth ticks down from `= 40 STIVERS` to `= 30 STIVERS`. Next to it, a row of 4 bread loaves loses one. The basket never changes size. The bottom line reads `240 beads = 40 stivers = 4 loaves` → `= 30 stivers = 3 loaves`, with a small note: `the 6 → 8 rate is real · the basket and the bread price are an example` (a loaf = 10 stivers, made up). |
| 12–15 "You did nothing wrong." | The elder just sits there, puzzled. Nothing moves. Hold the shot for a beat. |
| 17–18 "sixteen fifty-eight" | A street: a bakery (a bread sign) and a brewery (a barrel sign). A boat at the quay unloads more strings, tagged `FROM NEW ENGLAND`. |
| 24–26 "bakers and brewers" | A baker in the doorway crosses their arms. Speech bubble: `MORE BEADS? NO THANKS.` |
| 27–31 "hardly take the beads" | The labourer's string is pushed back across the counter. Caption strip at the bottom (the real quote): `"…so oversupplied that it is not considered valuable anymore." New Amsterdam, 1658`. |

### w8 · `wfade`: "In sixteen sixty-one, with Boston now minting silver coins, Massachusetts dropped wampum as legal money. Wampum belts still matter today. But as money, it faded away."
| Words | Visual |
|---|---|
| 1–2 "sixteen sixty-one" | The 1637 parchment comes back: `MASSACHUSETTS · 1661`. |
| 4–8 "Boston now minting silver coins" | Inset: a small hand press stamps a silver coin marked `NE` (the first Boston coins, from 1652). Tag: `BOSTON MINT · 1652`. |
| 10 "dropped" | `LEGAL` is struck through in red and a red `REPEALED` stamp lands under it. |
| 15–19 "Wampum belts still matter today" | Cut: the treaty belt from w3, warmly lit. Tag: `STILL MADE AND USED TODAY`. A respectful still: no gags here. |
| 20–25 "But as money, it faded away." | The strings of *money* beads, not the belt, fade out from a pile on a counter, bead by bead. Silver coins sit alone on the counter. |

### w9 · `wcallback`: "In Ulm Hollow, Wren found a cave. Here, the cave was an iron drill. Same story. Next: cowries, the money that got too heavy to carry."  (pad 1.5)
| Words | Visual |
|---|---|
| 1–2 "Ulm Hollow" | Left half: Ulm Hollow's purple ground and the cave (reuse `cave`). Tag: `ULM HOLLOW`. |
| 3 "Wren" | Wren (the `alien` sprite) pops in by the cave, waving; pentaja glints. (Sprite id `"wren"`.) |
| 6 "cave." | Pentaja spill out of the cave (reuse the h1 spill, short). |
| 7–13 "Here, the cave was an iron drill" | Right half: the cave's outline is redrawn around the iron-pointed pump drill from w5, and beads spill out of it the same way the pentaja did. |
| 14–15 "Same story." | A big `=` between the halves, with a thud. Optionally Wren gives a thumbs-up to the drill ("Hey, that's my move!"). |
| 16 "Next:" | Cut to dark. One cowrie shell (`cowrie()` prop) sits at the centre, with a `?`. |
| 17 "cowries" | Tag: `CHAPTER 4 · COWRIES`. |
| 19–25 "the money that got too heavy to carry" | The cowrie multiplies into a sack, and the sack drops with a heavy thud on "heavy" (word 23). |

## Sound cues (for `cues.py`, mirror them in `scenes.js`)
- w1 w(2): title sting `chime(62, (0, 7, 12, 15, 19))` (D, minor colour).
- w2 w(9), w(13): `pop_(900)` and `pop_(700)` as the beads fly out of the shells. w(18): a quick 8-note `clink` ripple as the string draws.
- w3: a scrape on each pump from w(4) to w(10), slow: `mix(noise(0.08, 3), tone(300, 0.08, "square", decay=0.05))` every ~0.6 s. w(10): a single soft `clink(1600)` as the bead drops. w(13)–w(16): rapid soft clicks as the belt assembles. w(17): a low warm `chime(50, (0, 7))`.
- w4 seg start: `whoosh()` as the ship arrives. w(5): one sad `tone(400 → 300)` blip for the empty purse. w(9): a soft double `clink` as the trader accepts the string. w(25): `thud()` for the stamp. w(28)–w(32): 6 `pop_` notes rising, then `clink(2200)` for the penny.
- w5 w(4): a metallic clank, `mix(tone(1800, 0.12, "square", decay=0.1), noise(0.06, 8))`. w(7): a small click as the point is swapped in. w(9)–w(15): left side a slow scrape (every 0.6 s); right side a fast pump scrape, `tone(900 → 1400)` in a 0.05 s loop, plus pops speeding up (as in Yap y7). w(22): a long rattle (40 clinks over 1.2 s, falling pitch).
- w6 w(9)–w(13): ~10 soft clinks as the strings drop. w(17)–w(19): three heavier rattles, one per year tick. w(26): `thud()` for the ×5 stamp. w(31): the music drops out for one bar (a "record stop" feel: cut the melody, leave the bass).
- w7 w(7)–w(11): a paintbrush swish (`noise(0.2, 2)`) for the sign repaint, then a descending 3-note `pluck` for the loaf disappearing. w(26): a short `tone(300, 0.15, "square")` "nope" blip. w(28): a slide-back swish.
- w8 w(6): a press `clink(2000)` for the coin. w(10): `thud()` for REPEALED. w(15): soft `chime(62, (0, 7, 12))` for the belt (warm, respectful). w(20)–w(25): a slow, falling run of 8 quiet clinks as the beads fade.
- w9 w(3): `pop_(800)` for Wren. w(6): a short pentaja spill (12 clinks). w(14): `thud()` for `=`. w(23): a heavy `thud()` (louder, 0.7) for the sack. End: `chime(67, (0, 3, 7, 10))` as in Yap y9.

## Music idea
- **Key and feel:** D dorian, about 92 bpm, patient and woody. Use style `"island"` (marimba lead, soft bass) from w1 to w4 with a sparse melody: lots of rests, as slow as the stone drill. For example, chords `[50, 48, 45, 50]` (Dm–C–Am–Dm) and a melody built on D–F–G–A–C, never busy.
- **The music inflates too:** at w5 "iron", switch to `"march"` style at the same key and tempo, and **double the melody note density** (8th-note runs filling the old rests). At w6 add a second, higher copy of the melody an octave up. The listener hears "more notes", the same way the viewer sees "more beads".
- **The sour turn:** at w6 w(31) "inflation", drop out for one bar. w7 (`wbakers`) goes back to `"mystery"` style in D minor, slow, a little thin.
- **Respect and close:** w8 from w(15) "Wampum belts" uses `"drone"` pads with a single soft melody line (no drums). w9 brings back a short quote of the bright w1–w4 theme for the Wren callback, then the cowrie teaser ends on an unresolved chord (A7) for "next".
- Avoid "tribal" tom-tom patterns or pentatonic "Indian" film clichés.

## Fact check

Checked adversarially on 2026-10-31. coins.nd.edu (Jordan) did not resolve that day; every Jordan quote below was read from the Internet Archive copy (web.archive.org/web/2023/https://coins.nd.edu/ColCoin/ColCoinIntros/…).

| Line | Claim (narration or screen) | Source | Status / note |
|---|---|---|---|
| w2 | White beads from the whelk, purple (dark) beads from the quahog clam. | A. Woodward, *Wampum* (1878), Project Gutenberg #23635: purple "from the … round clam, popularly known as the quauhaug; *wampum* from the column and inner whorls of the *Pyrula carica* …". R. Williams, *A Key into the Language of America* (1643), ch. XXIV, Gutenberg #63701: black "of the shel-fish called Poquaûhock". | ✓ *Pyrula carica* = knobbed whelk. "Purple" is the modern word; Williams says "blacke". |
| w2 | Made on the northeast coast (map: New England and Long Island). | Woodward (1878): "but little was produced north of the Narragansetts … the Long Island Indians were by far the greatest producers along our northern coast". | ✓ Changed from "the coast of what is now New England", which left out Long Island (New York), the biggest producer. |
| w3 | Cut, drilled and polished by hand with stone; slow work. | Williams (1643): "Before ever they had awle blades from Europe, they made shift to bore this their shell money with stones … To smooth them, which they doe on stones." Woodward (1878) calls it "laborious coinage". | ✓ for stone. "Slow" is qualitative. **No sourced time per bead exists**, so no number is said or shown. |
| w3 | Belts sealed treaties between nations. | E. Peña, "Wampum Production in New Netherland and Colonial New York", *BEADS* 2 (1990): strings and belts "became important as a means of treaty negotiation and ratification". | ✓ Not dated in the narration on purpose: most surviving treaty belts are from the metal-tool era (see Open questions). |
| w4 | Colonists had almost no coins. | Peña (1990): "a severe specie shortage"; Woodward: in the Dutch colonies "for a while absolutely no coin was in circulation"; Federal Reserve Bank of Boston, *History of Colonial Money*. | ✓ |
| w4 | Inland nations took wampum for furs, so colonists used it as money. | L. Jordan, *Colonial Currency*, Notre Dame, "Wampum: Introduction": Isaack de Rasière brought wampum to Plymouth in 1627 and "Quickly wampum became the preferred coin substitute". Jordan, "Wampum in New Netherland": good beads were "exported to Fort Orange for the beaver trade"; the Dutch needed "at least 40,000 handfuls of wampum each year for 10,000 pelts" (from the 1635 van den Bogaert negotiations, where the Iroquois, who had already sold skins to French traders, asked "four handfuls of wampum and four hand breaths of duffel cloth for each large beaver": traders setting their own price). Jordan quotes A. van der Donck, *Description of New Netherland* (1653): "the only article of moneyed medium among the natives … many thousand strings are exchanged every year for peltries". | ✓ Replaces "So they used wampum too", which implied all Native peoples already used it as money (Jordan: they "did not use currency"; Williams calls it "their shell money"; scholars disagree). |
| w4 | Massachusetts, 1637: legal small change at six beads to a penny. | Jordan, "Wampum: Introduction": "On November 15, 1637 the Massachusetts General Court promulgated that wampum beads would pass at 6 to a penny and were to be legal as payment in sums under 12 pence." Order text (via Newman Numismatic Portal, nnp.wustl.edu/encyclopedia/1775): "wampamege should passe at 6 a penny for any sume under 12 d." Woodward agrees. | ✓ "Legal money" became "legal small change", because the 1637 law covered only sums under 12 pence. Only one source gives the day, so the parchment shows the year only. Later rates: 4 a penny (1640), 6 (1641), 8 white / 4 black (1650). |
| w5 | Coastal makers switched from stone to iron drill points, far faster; beads multiplied. | Williams (1643), above. Jordan, "Wampum in New Netherland": "Production increases were partly effected by the introduction of metal tools brought over from Europe, such as awls, that allowed the Indians to work more efficiently"; in 1648 John Winthrop Jr. "acquired 1,000 wampum drills" (citing Peña). Wikipedia *Wampum*, citing Peña, *Northeast Historical Archaeology* 35 (2006): "By the end of the 17th century, virtually all new wampum was produced using metal tools." | ✓ for the switch and the rise in output. ⚠️ **"Far faster" is qualitative.** No sourced speed-up factor exists; the racing counter is illustrative. Jordan says "partly": demand from the fur trade drove production too. |
| w5 | Rough beads and fakes poured in. | Jordan, "Wampum in New Netherland": the 18 April 1641 ordinance says New Netherland was "being overrun with rough unpolished wampum said to have been brought in from outside the province"; "it has been conjectured some colonists … [produced] 'counterfeit' wampum". Woodward: "there came from foreign parts an inundation of 'nasty, rough' sewan"; counterfeits made with "an unallowed shell" and "beads of stone". Boston Fed: "poor shells, along with artificial color". | ✓ The "nasty, rough" quote reaches us through Woodward (1878) and Watson (1832); the original 1641 ordinance was not seen, so it is not quoted on screen. |
| w6 | New Amsterdam: a beaver pelt cost about 640 white beads in 1641 and 3,200 in 1662 (×5). Chart: 1650s 1,200; 1658 2,240. | Jordan, "Charts Illustrating Wampum Value Depreciation", table II a: 1641, gl. 8 = **640** good beads; May 1650–Oct 1657, gl. 10–12 = 1,200–1,440; Nov 1658, gl. 14–16 = 2,240–2,560; 1662, gl. 20 = **3,200**; c. 1670, gl. 24 = 3,840. | ✓ Jordan's bead counts are the market price in "guilders in wampum" × the official beads-per-guilder rate, hence "about" in the narration. The chart uses the low end of each range. The figures are New Netherland general trade, mostly from New Amsterdam letters and court records. |
| w6 | "Same pelt" / screen `in silver coins: same price`: the rise was the beads, not the beaver. | Jordan, "The Beaver Pelt in New Netherland": a pelt "generally … fluctuated between 6 and 8 guilders in Dutch money"; 7 guilders in New Amsterdam in Dec 1660; devalued to 6 in Sept 1663; Amsterdam prices fell from a beaver "oversupply" in the 1650s. Stuyvesant (June 1660): "excessive quantities of wampum were in circulation". | ✓ **This settles the writer's worry** that part of the ×5 might be the beaver market: in silver the pelt held steady or got *cheaper* over the same years, so the whole rise (and then some) was wampum losing value. |
| w7 | Savers and people paid in wampum lost buying power. Screen: 6 → 8 beads per stiver; a 240-bead basket from 40 to 30 stivers. | Jordan chart I a: 6 white beads per stiver (1650), 8 (1658). Petition of 19 Sept 1658 (below) and the council's order on it: debtors got six weeks, after which they "will have to pay eight instead of 6 white … sewant beads a stiver". Peña (1990): wages and payments in sewan (a 1655 man paid "70 guilders in sewan and a pair of shoes"). | ✓ The 6 → 8 rate is real, so 240 ÷ 6 = 40 and 240 ÷ 8 = 30 is real arithmetic. The 240-bead basket and the loaves are illustrative. "Every year" was cut: the official rate moved in steps, not yearly. Jordan dates the treasury's switch to 8 to Nov 1657 and the general one to 1658. |
| w7 | 1658: the town's leaders complained that bakers and brewers would hardly take the beads. Screen: a boat of beads "from New England"; the quote. | Petition of the burgomasters and schepens of New Amsterdam, 19 Sept 1658, NY State Archives A1809, vol. 8, item 1001 (translation via Mapping Early New York, encyclopedia.nahc-mapping.org/node/6235): "the large quantity of sewant coming here to this city from New England … those of New England gain 25 in a hundred on the sewant they bring here; therefore this place is becoming so oversupplied that it is not considered valuable anymore, and the fastidiousness of bakers, brewers, shopkeepers, laborers, and others is so great that one can hardly do business with them with it." | ✓ Primary source, read in full; the on-screen quote is verbatim. "The town complained" became "the town's leaders complained" (it was a petition by the burgomasters and schepens). |
| w4, w5 | Screen dates: `1620s–1630s · colonists arrive` (trading post), `THE COAST · 1630s–1640s · iron from Europe`. | Plymouth (1620) and Massachusetts Bay (1630); Jordan: de Rasière brought wampum to Plymouth in 1627. Williams (1643) writes of the time "before ever they had awle blades from Europe", so by 1643 metal awls were in use; Winthrop Jr. bought 1,000 wampum drills in 1648 (Jordan, citing Peña). | ✓ Decade-level only, on purpose. Metal awls may have reached some makers earlier than the 1630s; the label says when, not since when. |
| w7 | Screen: `a stiver was a small Dutch coin, like a penny`. | A stiver (stuiver) was 1/20 of a guilder (Jordan, "Wampum in New Netherland", gives rates in beads per stiver). | ✓ "Like a penny" is a plain-words comparison, not an exchange rate. |
| w8 | 1661: with Boston minting silver coins, Massachusetts dropped wampum as legal money. Screen: Boston mint 1652. | Jordan, "Wampum: Introduction": "As coins became more plentiful the acceptance of wampum waned. On May 22, 1661, nine years after the Boston mint opened, the 1650 wampum law was repealed due to 'much inconvenience'." Newman Numismatic Portal: in 1652 the General Court ordered the NE silver threepence, sixpence and shilling struck in Boston (mintmaster John Hull). Woodward: "In 1661 … wampum was declared to be no longer a legal tender in Massachusetts." | ✓ The mint clause is new: it gives the real reason for the repeal (better money arrived), instead of implying the repeal was a reaction to inflation. "Others followed" was **cut**: Woodward says Rhode Island acted "the next year" and Connecticut "probably" later, and a secondary source says Rhode Island only stopped taking it *for taxes* in 1662; too shaky to say aloud. |
| w8 | It faded away as money. | Woodward: it "lingered among the people for years … As late as 1704, it was a common mode of payment in country places". Jordan: last recorded use as money in New York, 1701 (citing Mossman). | ✓ "Faded away" is deliberately soft. |
| w8 | Wampum belts still matter today. | E. James-Perry (Aquinnah Wampanoag artist), "About Wampum", elizabethjamesperry.com; McCord Stewart Museum exhibition *Wampum: Beads of Diplomacy*. | ✓ |
| w9 | Next: cowries, the money that got too heavy to carry. | Matches chapter 4's own title line (`video/ep02/cowries/narration.json`, c0). | ✓ Teaser only. |

**Considered, not used:**
- **Roger Williams (1643)**: a fathom "now worth of the English but five shillings … some few yeeres since was worth nine, and sometimes ten shillings", and Native traders "are very impatient, when for English commodities they pay so much more of their money … and many say the English cheat and deceive them". A strong felt-loss quote, **but Williams blames "the fall of Beaver in England", not new tools**, so putting it in a "tools" chapter would mislead. It could go in the page's Sources box with that context.
- **Wampum taken as tribute and fines.** Woodward (1878) says the New England colonies took large payments of wampum from Native nations after wars (Pequots "fined 400 fathoms" in 1634; Narragansetts "2000 fathoms" in 1644). This is real context (the colonies also got beads without drilling them), but the amounts rest on one 19th-century source and a quick search did not confirm the 2,000-fathom figure. Not said aloud; a candidate for the Sources box once checked against the United Colonies records.
- **The slave trade** is not part of this chapter's money story, so it is not named here (it is named in chapter 4, Cowries). The Pequot War of 1637, the same year as the Massachusetts law, ended with captives enslaved, some shipped to the Caribbean; if a reviewer feels the 1637 scene needs that context, add it in the Sources box, not as a gag or a game element.
- **Campbell mill, Park Ridge NJ**: "Between 1835 and 1866, the Campbell mill produced a million purple beads a year" (Hood Museum, Dartmouth). Solid, but about 1800s trade goods, not money.
- **Lynn Ceci's thesis** (English dumping of wampum on the Dutch, bread and shoe prices "rising as much as 400 percent"), via *American Heritage* (Oct 1977). Not checked against Ceci directly, so not used.
- **"42 beads a day even with metal tools"** (McCord Stewart Museum, an unsourced estimate) and **"30 hours for one bead with a pump drill and a nail"** (one modern maker, in *Martha's Vineyard Magazine*, now a dead link). Both too weak to say aloud, and a search on 2026-10-31 found no study that measures the stone-to-iron speed-up.

## Open questions
- The w6 chart uses the low end of each of Jordan's ranges (1650s = 1,200, 1658 = 2,240). Should the chart show ranges as bars instead?
- w3 shows belts made from stone-drilled beads. Haudenosaunee tradition places belts before contact, and some archaeologists argue for long pre-colonial wampum production, but most surviving treaty belts were made with metal tools. The narration doesn't date the belts; a Native educator should check the w3 visuals.
- Before release, check the Native representation (dress, belts, music, wording, and the game's coastal bead-making family) with a Native wampum maker or a museum educator if at all possible. None of this has been checked with anyone yet.
