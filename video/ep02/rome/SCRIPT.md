# EP 02 · Chapter 5: Rome, when Wren is the emperor (script notes)

**Purpose:** show that you don't need a cave if you own the mint. Rome's emperors made the silver coin thinner over about 200 years (from Nero around AD 64 to the 270s) to pay their armies. In Roman Egypt the price of wheat in coins crept up for a long time and then leapt, about 37-fold in all by the 290s. Savers who held a sum of money lost almost everything without anyone stealing a coin, and when the emperor finally capped prices by law, goods vanished from the market.

The narration is in `narration.json`: 10 segments, 230 words. After TTS + trim the timeline is **about 101 s** (`timeline.json`). Scenes are in `scenes.js` (one `SC.<scene>` per segment, drawn as described below); music and sound effects are in `cues.py`, on the same word indices as the visuals. Wren (`alien("wren")`) wears a small laurel wreath and a purple cloak in this chapter.

**Novice rules used here:** every percentage also appears as a picture (a coin with a silver fill gauge). "Inflation" is never said in the video; it's shown instead: the same sack of wheat, more coins. The loss is made personal through a jar of savings and a shelf of bread. The base metal is called "copper" everywhere (it was a copper alloy; "copper" is plainer and closer than "bronze").

## Segments and visuals

Word numbers are 0-based over the whitespace-split text (the same as `word()` / `TR.word`).

### r1 · `rometitle` · "Chapter five: Rome. When Wren is the emperor." (dip, pad 0.8)
| Word | Visual |
|---|---|
| 0 | Night-purple background, a few columns (simple pixel Doric columns, left and right). Small text: `CHAPTER 5`. |
| 2 "Rome." | Big gold title `ROME` drops in (title sting). |
| 4 "Wren" | Wren steps in from the right wearing a tiny gold laurel wreath and a purple cloak, sits on a stool-throne and holds up a coin. Subtitle `WHEN WREN IS THE EMPEROR`. |
| end | Fade out (0.5 s). |

### r2 · `denarius` · "Two thousand years ago, Rome paid its soldiers in silver coins called denarii. Under the first emperor, Augustus, they were almost pure silver."
| Word | Visual |
|---|---|
| 0 | `where("ROMAN EMPIRE", "about 2,000 years ago")`. A pixel legionary (red tunic, helmet, shield) stands on a stone road. |
| 9 "silver" | One big bright denarius spins in at the centre-top (props `coin`, white-silver palette). |
| 12 "denarii" | A pay-day line: 6 small coins drop into the soldier's open hand (clinks). Label `A SOLDIER'S PAY: 225 DENARII A YEAR`. |
| 17 "Augustus" | A profile bust label `AUGUSTUS · RULED 27 BC – AD 14` next to the coin. |
| 20–22 "almost pure silver" | A vertical **silver gauge** beside the coin fills to `98% SILVER`, and the remaining sliver is labelled `2% other`. This gauge is the chapter's recurring visual. |

### r3 · `legions` · "Rome ran on its army. A dying emperor reportedly told his sons: keep the soldiers rich, never mind anyone else."
| Word | Visual |
|---|---|
| 0–4 | Columns of soldiers march left to right across the screen in three rows (boots). |
| 5 "A" | The march freezes and dims. A dying old emperor in bed (simple pixel bed, grey beard) with two sons on the right. (Open question: a throne room works too.) |
| 12–19 "keep the soldiers rich…" | A speech scroll unrolls: `"ENRICH THE SOLDIERS, AND SCORN ALL OTHER MEN."`. Below it, small: `SEPTIMIUS SEVERUS, AD 211 · AS REPORTED BY CASSIUS DIO`. |
| 15 "rich" | A cascade of coins pours from the top into the soldiers' row. |

### r4 · `melt` · "Soldiers cost more silver than the empire had. So emperors did what Wren did: melt the coins, add cheap copper, stamp out more."
| Word | Visual |
|---|---|
| 0–7 | A treasury chest with a silver pile that shrinks as soldiers' hands reach in and battle icons flash at the screen edge. Label `SILVER IN: A LITTLE · ARMY: A LOT`. |
| 11–12 "what Wren" | **Wren cameo:** Wren pops up from behind the chest, holds up a pentaja and points at it, with a speech bubble: `HEY, THAT'S MY MOVE!`. Wren slides out by word 14. |
| 14 "melt" | Inside a palace room: a crucible over a fire. 4 silver coins drop in and turn into glowing liquid (sizzle). |
| 17–19 "add cheap copper" | A reddish-brown copper ingot thuds into the crucible and the liquid shifts from white towards orange. |
| 20–22 "stamp out more" | A hammer and die strike 3 times (clanks). Each strike spits out more coins: 4 → 8 → 16 coins in a heap, all slightly duller than the originals. Label `SAME SILVER · MORE COINS`. |

### r5 · `fourcoins` · "By the year two hundred, coins were about half silver. By two seventy, under five percent: copper, with a thin silver skin."
| Word | Visual |
|---|---|
| 0 | Four coin slots in a row, each with its own silver gauge under it. Slot 1 is already filled: `AD 14 · 98%`. Slot 2 fades in quietly: `NERO, AD 64 · ~80%` (not narrated; see the fact check). |
| 3 "two" | Slot 3 pops in: `AD 194 · ~50%`, the gauge half full and the coin greyer. |
| 11 "two" (seventy) | Slot 4 pops in: `AD 270 · UNDER 5%`. Its gauge drains on screen from the top (falling tone) down to a thin line. |
| 16 "copper" | Slot 4 zooms to fill the screen. It still looks silver. |
| 19–21 "thin silver skin" | A thumb rubs it: the silver skin flakes off in pixels and reveals reddish copper underneath. Beside the coin, `still looks like silver…` turns into `UNDER 5% SILVER`. Stamp `SILVER SKIN, COPPER INSIDE`. |

### r6 · `wheat` · "In Roman Egypt, a sack of wheat cost about eight drachmas in the year one hundred. Prices crept up for a long time, then leapt: by three hundred, about three hundred."
| Word | Visual |
|---|---|
| 0 | `where("ROMAN EGYPT", "the empire's breadbasket")`. The Nile in blue, palms, a market stall. |
| 4 "sack" | A fat wheat sack (props `sack`, scaled ×3) with a hanging price tag. Small label `1 SACK (ARTABA) ≈ 30 KG`. |
| 9–10 "eight drachmas" | The tag reads `8`. A small note below: `DRACHMA = EGYPT'S MONEY UNIT`. |
| 14 "one hundred" | Year counter `AD 100` top right. |
| 16–22 "Prices crept up for a long time" | The year counter rolls slowly from `AD 100` to `AD 260` while the tag creeps `8 → 16` (a few slow ticks). |
| 23–24 "then leapt" | The tag jumps (fast rising ticks) and grows until it's bigger than the sack. The year counter runs on to `AD 293`. |
| 30 "hundred" | It lands on `300` (thud). A side chart (props `chart`) draws `PRICE OF A SACK OF WHEAT, DRACHMAS`: 8 (AD 100), 16 (AD 260), 300 (AD 293). The flat-then-cliff shape is the point. |

### r7 · `jar` · "Picture savings worth a year of bread, back then. By three hundred, the same sum bought about ten days. Nobody stole a coin. The emperor just made more."
| Word | Visual |
|---|---|
| 0 | A clay jar of coins on a wooden shelf in a small home, with a family of three beside it. |
| 2–6 "worth a year of bread" | Behind the jar a wall shelf fills with **52 small loaves** (one per week, 4 rows of 13). Label `AD 100: 1 YEAR OF BREAD`. |
| 9–18 "By three hundred … about ten days" | The loaves pop off one by one, fast (30 pops), until only **1½ loaves** are left. Label changes to `AD 300: ~10 DAYS`. The jar itself doesn't change: tag `SAME SUM` on the jar. |
| 19–22 "Nobody stole a coin" | A padlock on the house door stays shut, with a green check. |
| 23–27 "The emperor just made more" | Cut to a tiny inset of the mint from r4, hammering away. |

### r8 · `edict` · "In three hundred and one, Emperor Diocletian blamed greedy sellers and capped over a thousand prices and wages. Charge more, and you could die."
| Word | Visual |
|---|---|
| 0 | A big grey stone tablet. Top line `EDICT ON MAXIMUM PRICES · AD 301`. |
| 6 "Diocletian" | An emperor figure in purple points an accusing finger at a pixel merchant, who shrinks. Bubble: `GREED!` |
| 11–17 "capped … prices and wages" | Lines chisel themselves into the tablet (chisel taps): `WHEAT, 1 ARMY MEASURE ......... 100`, `FARM WORKER, 1 DAY + MEALS ......... 25`, `PORK, 1 POUND ........ 12`, `…` Then a counter `OVER 1,000 PRICES`. |
| 23 "die" | Red stamp across the tablet: `CHARGE MORE: DEATH`. |

### r9 · `emptystalls` · "A writer of the time says blood was spilled over small things, and people were too scared to sell. The law was finally dropped."
| Word | Visual |
|---|---|
| 0 | A row of 4 market stalls, full of bread, amphorae and cloth, each with a `MAX` price tag. A guard with a spear stands in front. Caption, small: `LACTANTIUS, A CRITIC OF DIOCLETIAN`. |
| 6 "blood" | A brief red flash on one stall (no gore: the stall's awning drops). |
| 13–18 "people were too scared to sell" | One by one, the sellers pack their goods into sacks and walk off screen (whooshes). The stalls are left bare, with the price tags still hanging. Label `PRICE: CAPPED · GOODS: GONE`. |
| 22–23 "finally dropped" | The small `PRICE LAW` tablet (top centre all through the scene) cracks and slides down. Stamp `LAW DROPPED`. |

### r10 · `callback` · "Wren needed luck to find a cave of pentaja. An emperor owned one. It was called the mint. Next: is there money with no cave at all?" (pad 1.5)
| Word | Visual |
|---|---|
| 0–8 | Split screen. Left: Ulm Hollow at night (the EP 01 cave, drawn with `TR.cave`), with Wren and pentaja spilling (clinks). Label `ULM HOLLOW · LUCK`. |
| 9–12 | Right: a Roman building with columns and a hammering sound. Label `ROME · NO LUCK NEEDED`. |
| 17 "mint" | The Roman building's sign flips to `MINT` and a cave-shaped door is drawn over it. Text `CAVE = MINT`. Wren, still in the laurel, gives a sheepish shrug. |
| 18 "Next" | Everything dims. A single gold bar glows centre-screen with a `?` above it. `NEXT · FINALE` / `MONEY WITH NO CAVE?`. `CAVE = MINT` stays lit above the dim, so the chapter's point is on screen to the end. |

## Props needed (new for this chapter)
Laurel wreath (2–3 px gold, sits on Wren's head), legionary (red tunic, grey helmet, rectangular shield), a column, crucible and fire, copper ingot, hammer and die, stone tablet with chiselled lines, clay jar, loaf (4×3 px), market stall with awning, amphora, a silver gauge (vertical bar plus a % label), a Nile strip with palms (reuse `palm`). Existing: `coin`, `sack`, `chart`, `stamp`, `label`, `where`, `cave`, `icon("pen")`, `person`.

## Sound cues (`cues.py`)
- r1: title chime on "Rome" (D minor, 0-7-12-15) and a little laurel shimmer on "Wren".
- r2: one bright clink on "silver"; 6 quick clinks (pay into a palm) from "denarii"; a two-note chime as the gauge hits 98% on "pure".
- r3: alternating boot taps from "army" to "sons"; a 14-clink coin cascade on "rich".
- r4: a pop for the Wren cameo; a 1.2 s sizzle on "melt"; a thud on "copper"; 3 hammer clanks on "stamp out more".
- r5: a pop per new coin ("two" hundred, "two" seventy); a falling square tone while gauge 4 drains; a scrape on "thin silver skin".
- r6: a few slow ticks while prices creep ("Prices crept up for a long time"), then 24 fast rising ticks from "by" to the second "three"; a thud on the final "hundred".
- r7: 30 descending pops as the loaves vanish; a low sad note on "days"; a minor chime at the end.
- r8: chisel taps while the tablet fills; a heavy thud on "die" (stamp).
- r9: 3 whooshes as the sellers leave; a thud on "dropped".
- r10: a pentaja clink spill (EP 01 callback); a mint clank on "mint"; an unresolved major-7 chime on "Next".

Pipeline: `./tts.sh rome`, `nix shell nixpkgs#ffmpeg -c ./trim.sh rome`, `python3 build.py rome` (numpy shell), stills with `./prev.sh rome`. The full render is left to `make.sh rome`.

## Music idea
**D minor, march, about 96 bpm** (`style="march"`): square-wave bass on D–B♭–C–A, a snare-ish noise on beats 2 and 4, and a brassy square melody that rises then falls (in `ROME_MEL`). It is proud at first and then sounds hollow as the chapter goes on. From **r8** (the edict) it switches to a low **drone** on D/B♭: cold and still while the stalls empty. For **r10** a soft **mystery** arp (D minor → B♭ → F → A) ends on an unresolved F major-7 chime for the finale teaser. For the minigame, the same melody runs faster (≈120 bpm) and the bass pitch drops a semitone each time the player adds copper (a cheap "sour" effect that you can hear).

## Fact check

Checked adversarially on 2026-10-31 against sources independent of the first draft where possible. ✓ = confirmed; ⚠️ = holds only with the hedge used in the text.

| Line | Claim | Source | Note |
|---|---|---|---|
| r2 | Rome paid its soldiers in silver denarii; under Augustus they were almost pure silver. | K. Butcher & M. Ponting, "The Denarius in the First Century" (Warwick preprint, https://warwick.ac.uk/fac/arts/classics/intranets/staff/butcher/butcher_ponting_complete.pdf): Augustus' Lyon denarii were "essentially pure silver bullion, with no adulterating metal deliberately added". NGC, "The Decline of Roman Silver Coinage" Part I (2018), https://www.ngccoin.com/news/article/6842/ngc-ancient-coins/: "about 98%". | ✓ On screen: `98%` (pure bullion still carried ~2% natural impurities). |
| r2 (screen) | A soldier's pay was 225 denarii a year under Augustus. | M. A. Speidel, "Roman Army Pay Scales", *JRS* 82 (1992); Wikipedia, *Pay (Roman army)*. | ✓ Legionary base pay (900 sesterces). Domitian raised it by a third (to 300) in AD 83/84. The later Severan figures are disputed, so they aren't used. |
| r2 (screen) | Augustus ruled 27 BC – AD 14. | Standard chronology. | ✓ The old label `AUGUSTUS · AD 14` read like a date of rule; fixed. |
| r3 | A dying emperor reportedly told his sons to keep the soldiers rich and never mind anyone else. | Cassius Dio 77.15.2 (Cary, Loeb 1927; book numbered 76 in some editions): Severus "is reported to have" said to his sons, "Be harmonious, enrich the soldiers, and scorn all other men." https://ostia-antica.org/caracalla/historians/cassius-dio.htm | ⚠️ Dio was a contemporary senator but only reports it as hearsay, so the narration now says "reportedly" (the draft stated it as fact). Severus died at York in AD 211. |
| r4 | Soldiers cost more silver than the empire had, so emperors melted coins, added base metal and struck more. | K. Harl, *Coinage in the Roman Economy* (1996), on army pay as the main driver of debasement; Butcher & Ponting, "Hoarding of Denarii and the Reforms of Nero and Septimius Severus" (OUP 2022). | ✓ Standard interpretation, phrased as a summary. The draft said "never enough silver for the wars"; wars were one cost, but the steady drain was army pay (raised under Domitian, Severus, Caracalla), which ties back to r3. "Copper" replaces "bronze": the base metal was a copper alloy. |
| r5 | By the year 200, coins were about half silver. | H. Gitler & M. Ponting, *Topoi* Suppl. 8 (2007), pp. 375–397 (abstract, https://www.academia.edu/362473): empire-wide debasement in AD 194, to 46%; Severan denarii average 46.8%. NGC Part I: "just slightly more than half silver". | ✓ "About half" covers 46–55%. Older surface readings (Walker, ~56%) are too high because they measured the silver-rich surface. |
| r5 | By 270, under five percent; a copper coin with a thin silver skin. | NGC Part II (2018), https://www.ngccoin.com/news/article/6893/NGC-Ancients/: Gallienus' double-denarius "often contained as little as 2.5% silver"; Aurelian's 274 reform aimed at about 5% ("XXI"). RIC/MOM (Maison de l'Orient), *Monetary system*, https://ric.mom.fr/en/info/sysmon: by Claudius II (268) the coin "was made almost entirely of copper"; its silver "dropped from roughly 2.2 g to less than 0.1 g" in thirty years; Aurelian's coin was "guaranteed at 5%" with "a thin silver wash". | ✓ Popular figures range from about 1–5%; "under five percent" holds for all of them. "Thin silver skin" covers both surface enrichment and silver washing. A precise "2% under Claudius II" figure has no good source and is not used. |
| r5 (screen) | Nero, AD 64: about 80%. | Butcher & Ponting, "The Denarius in the First Century" (above): "Then came the debasement of AD 64. It was much sharper than previously suspected, lowering the fineness to about 80%"; Walker's older 93% came from surface analysis. A final late-Neronian issue was about 90%. | ✓ **Corrected** from the draft's `~90%`, which misattributed 90% to Butcher & Ponting. Not narrated. |
| r6 | In Roman Egypt, a sack (artaba, ~30 kg) of wheat cost about 8 drachmas around AD 100. | W. Scheidel, "Real wages in Roman Egypt" (Princeton/Stanford Working Papers in Classics, 2008), note to Table 1: median 8 drachmas an artaba (38.8 L, 30.3 kg) from the late 1st century to the 160s. https://www.ancientportsantiques.com/wp-content/uploads/Documents/AUTHORS/Scheidel2008-Wages.pdf | ✓ Artaba sizes varied (Duncan-Jones 1976 notes a 40- and a 48-choenix artaba), hence `≈ 30 KG`. |
| r6 | Prices crept up for a long time, then leapt. | P. Kelly, "Third-Century Inflation Reassessed", *Theoretical Roman Archaeology Journal* 4 (2021), doi:10.16995/traj.4338: tests and largely confirms, for wheat, Rathbone's (1997) picture of prices steady until about 274 and then "a brusque leap in price levels around 274 by a factor of ten or more". Robertson (2015), Table 1: 16 drachmas in AD 260. | ✓ **New line**: the lag is real history and the novice's best lesson (debasement doesn't show up in prices at once). *Why* it leapt in the 270s is debated: Rathbone and Robertson put much of it on Aurelian's retariffing of the coinage rather than slow market drift. The narration says only that prices leapt, which nobody disputes. |
| r6 | By the year 300, about 300 drachmas. | S. Robertson, *The Crisis of the 3rd Century A.D.* (Durham MA thesis, 2015), Table 1, citing Duncan-Jones (1976) and Rathbone (1996): AD 260 **16**; AD 277? **200?** (uncertain); AD 293 **300**; AD 294 216–232; AD 301 **640**. https://etheses.durham.ac.uk/id/eprint/11323/ | ⚠️ Conservative reading: the AD 293 figure, with "about". Prices bounced (216–232 in 294) and rose to 640 in 301, after the currency edict of 1 Sept 301 doubled coin face values. The rise in drachmas that a holder of money faced is not in dispute. |
| r7 | Savings worth a year of bread around 100 bought about ten days' worth by 300. | Arithmetic from r6: 300 ÷ 8 = 37.5×; 365 ÷ 37.5 ≈ **9.7 days**. | ⚠️ Wheat stands in for bread. The narration now says "the same sum", i.e. savings counted in drachmas (a sum owed, a fixed payment, coins of the day). Someone holding the *old* high-silver coins kept more value, which is why people hoarded them (Gresham's law, used in the minigame). The draft's "a jar of coins" implied the same physical coins, which overstated the loss. |
| r7 | "The emperor just made more." | r4/r5 sources. | ✓ Summary line. Egypt had its own coin (the Alexandrian tetradrachm, struck at the emperor's mint in Alexandria), debased alongside the denarius in the 3rd century; that is why the drachma prices of r6 belong in this story. |
| r8 | In 301, Diocletian blamed greedy sellers, capped over a thousand prices and wages, and made breaking it a capital crime. | *Edict on Maximum Prices*, trans. A. Kropff (2016), https://www.ancientportsantiques.com/wp-content/uploads/Documents/AUTHORS/DiocletianPriceEdict-Kropff2016.docx: issued late 301; preface rails against "this unrestrained lust for stealing"; "he shall undergo a capital penalty"; buyers and hoarders also punishable. Wikipedia, *Edict on Maximum Prices*. | ✓ Counts differ because the edict survives in fragments: "over 900 commodities, 130 grades of labour" plus freight rates (older count) up to Kropff's "more than 1,200". "Over a thousand prices and wages" holds for all of them; the draft's "over a thousand **goods**" did not quite. Issued in the names of all four tetrarchs; Diocletian led them. |
| r8 (screen) | Wheat 100 denarii per army measure (*kastrensis modius*); farm worker 25 a day with meals; pork 12 a pound. | Kropff (2016): I.1a, IV.1a, VII.1a. | ✓ The litre size of the *kastrensis modius* is disputed (about 13 or 17.5 L), so the screen no longer prints `17.5 L`. Prices are in *denarii communes*, a unit of account by 301. The edict also priced slaves; that is not shown. |
| r9 | A writer of the time says blood was spilled over small things, people were too scared to sell, and the law was dropped. | Lactantius, *De Mortibus Persecutorum* 7.6–7 (ANF trans.), https://www.newadvent.org/fathers/0705.htm: "much blood was shed for the veriest trifles; men were afraid to expose anything to sale … the ordinance … was from mere necessity abrogated." | ⚠️ Lactantius was a Christian writing against Diocletian, the persecutor, so he's hostile; the caption names him as a critic. The on-screen quote (video and game) modernises the ANF wording "expose anything to sale" to "put anything up for sale". Whether the edict was formally repealed or just ignored is unclear (he gives no date), so "dropped" is used, not "repealed". |
| r10 | (Callback; no factual claim.) | n/a | "Owned one" refers to emperors in general. |

**Numbers deliberately not used:** the "120,000 drachmas per artaba under Diocletian" figure from popular articles (FEE) is real only for the 330s–340s. The Severus and Caracalla pay figures are disputed. A specific figure for the Claudius II antoninianus (often "2%") has no good source. The AD 277 wheat price of 200 is marked uncertain in the source.

## Open questions
- "Drachmas" right after "denarii" may confuse a novice. The alternative is "In Roman Egypt, a sack of wheat cost about eight coins…", which is less precise because a drachma was a unit and the coin was a tetradrachm. For now the screen explains `DRACHMA = EGYPT'S MONEY UNIT`.
- r3 shows a dying emperor in bed. Is that too dark for the tone? A throne-room version would work just as well.
- Severus died in 211 but the coin was cut in 194, so r3 → r4 is a theme, not a sequence. The narration doesn't claim the advice caused the cut.
