# Chapter 4 · Cowries: music and sound effects. Run by build.py with its synth kit in scope
# (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink, chime, whoosh, splash, thunder,
#  music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirror the visual cues in scenes.js.
# ---------------------------------------------------------------- music: F major pentatonic, bright marimba; c3 a drone;
# c4-c5 a second marimba joins (the music floods too); c6-c7 D minor, half-time, heavy; c8 back to F, then a minor teaser.
S = lambda i: seg[i]
COW_MEL = [[77, _, 79, 81, _, 84, 81, _], [79, _, 77, _, 74, _, 77, _], [81, 84, 86, _, 84, 81, 79, _], [77, _, _, 74, 77, _, _, _]]
COW_HI = [[_, 84, _, _, 86, _, _, 89], [_, 86, _, 84, _, 81, _, _], [_, _, 89, _, _, 86, _, 84], [_, 81, _, _, 84, _, 86, _]]
HEAVY_MEL = [[74, _, _, 72, 69, _, _, _], [70, _, _, 69, 67, _, _, _], [72, _, 74, _, 72, _, 69, _], [69, _, _, _, 62, _, _, _]]
section(0.0, S("c3")["t0"], [53, 48, 50, 48], COW_MEL)
section(S("c3")["t0"], S("c3")["t1"], [41], [[_] * 8], style="drone", vol=0.8)
section(S("c4")["t0"], S("c6")["t0"], [53, 48, 50, 48], COW_MEL)
section(S("c5")["t0"], S("c6")["t0"], [53, 48, 50, 48], COW_HI, lead=lambda m: marimba(m, 0.4), vol=0.55)
section(S("c6")["t0"], S("c8")["t0"], [50, 46, 48, 45], HEAVY_MEL, tempo_beat=BEAT * 1.6, style="mystery")
section(S("c8")["t0"], w("c8", 25), [53, 48, 50, 48], COW_MEL, vol=0.8)
section(w("c8", 25), END - 0.5, [50], [[_] * 8], style="drone", vol=0.9)

# ---------------------------------------------------------------- sound effects (mirror scenes.js)
# c0: shells pattering down onto a pile, "heavy" thud
place(sfx, S("c0")["t0"] + 0.1, whoosh(), 0.2)
for i in range(30): place(sfx, S("c0")["t0"] + 0.5 + i * 0.07 + 0.5, clink(2400 + (i * 211) % 700), 0.05)
place(sfx, w("c0", 8), thud(), 0.45)
# c1: the big cowrie; Maldives blink + route
place(sfx, w("c1", 4), whoosh(), 0.08)
place(sfx, w("c1", 9), pop_(900), 0.15)
place(sfx, w("c1", 18), chime(79, (0,)), 0.15)
# c2: one shell; a string of 40 ticks together; a head bundles up
place(sfx, w("c2", 1), clink(2600), 0.12)
for k in np.linspace(w("c2", 9), w("c2", 9) + 0.6, 14): place(sfx, k, clink(2200), 0.04)
for k in np.linspace(w("c2", 13), w("c2", 13) + 0.6, 20): place(sfx, k, clink(1700 + 600 * np.sin(k * 7)), 0.03)
place(sfx, w("c2", 13) + 0.75, thud(), 0.35)
# c3: market murmur, then surf; no hits on the slave-trade line
for i in range(10): place(sfx, S("c3")["t0"] + 0.4 + i * 0.5, clink(2000 + (i * 173) % 800), 0.03)
place(sfx, w("c3", 10), noise(2.5, 2, seed=7), 0.05)
for k in np.arange(w("c3", 11), w("c3", 17), 0.45): place(sfx, k, thud(), 0.08)          # sacks landing
# c4: Hamburg; REEF!; a small load to Dahomey; Wren cameo
place(sfx, w("c4", 4), whoosh(), 0.15)
place(sfx, w("c4", 10), thud(), 0.5)
place(sfx, w("c4", 15), pop_(700), 0.12)
place(sfx, w("c4", 18), tone(600, 0.3, "square", 300, decay=0.1), 0.06)                  # price drops
for k in np.arange(w("c4", 22), w("c4", 22) + 0.6, 0.05): place(sfx, k, clink(1800 + 400 * np.sin(k * 9)), 0.04)
place(sfx, w("c4", 23), pop_(1100), 0.12)
# c5: ships arrive; shells pour (rising pitch); the big number
for n in (1, 3): place(sfx, w("c5", n), pop_(600 + n * 80), 0.08)
for k in np.linspace(w("c5", 12), w("c5", 19), 70): place(sfx, k, clink(1500 + 1500 * (k - w("c5", 12)) / max(.1, w("c5", 19) - w("c5", 12))), 0.035)
place(sfx, w("c5", 16), thud(), 0.45)
# c6: the scale levels; ten heads pile up; ×10; the dollar's slices fade; spent: 0
place(sfx, w("c6", 4), chime(76, (0, 7)), 0.15)
for k in np.linspace(w("c6", 14), w("c6", 19), 9): place(sfx, k, thud(), 0.15)
place(sfx, w("c6", 19), thud(), 0.5)
place(sfx, w("c6", 23), whoosh(), 0.1)                                      # cut to the family and its jar
place(sfx, w("c6", 31), tone(300, 0.9, "square", 150, decay=0.3), 0.10)
place(sfx, w("c6", 36), pop_(500), 0.1)
# c7: "heavy"; one bright coin; 4,000 shells into a sack; slow footsteps under the load
place(sfx, w("c7", 4), thud(), 0.6)                                         # the sack drops in
place(sfx, w("c7", 10), clink(3200), 0.15)
for k in np.linspace(w("c7", 16), w("c7", 18) + 0.4, 34): place(sfx, k, clink(1300 + (k * 997) % 500), 0.04)
place(sfx, w("c7", 20) + 0.2, thud(), 0.15)
for k in np.arange(w("c7", 24) + 0.8, S("c7")["t1"] - 0.3, 0.6): place(sfx, k, thud(), 0.14)
place(sfx, w("c7", 28), thud(), 0.3)
# c8: the bale bumps; NOT MONEY; sack → bogwool; CAVE / REEF; emperor: minor sting
place(sfx, w("c8", 7), pop_(300), 0.1)
place(sfx, w("c8", 8), thud(), 0.4)
place(sfx, w("c8", 12), tone(300, 1.2, "tri", 600, decay=0.5), 0.07)
place(sfx, w("c8", 20), thud(), 0.4); place(sfx, w("c8", 24), thud(), 0.4)
place(sfx, w("c8", 25), whoosh(), 0.15)
place(sfx, w("c8", 31), chime(62, (0, 3, 7, 10)), 0.25)
