# Chapter 6 · Gold?: music and sound effects. Run by build.py with its synth kit in scope
# (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink, chime, whoosh, splash, thunder,
#  music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirrors the visual cues in scenes.js.
# ---------------------------------------------------------------- music
# G major, about 84 bpm, slow and warm: steady on purpose (the money that didn't crash). g2 passes through the earlier
# chapters' keys (C, F, D minor) before settling in G; from g8 it thins to a low pulse; g10 ends unresolved, for EP 03.
S = lambda i: seg[i]
B84 = 60 / 84
GOLD_MEL = [[71, _, 72, 74, _, 72, 71, _], [69, _, 71, _, 67, _, _, _], [72, _, 71, 69, _, 71, 72, _], [74, _, _, 72, 71, _, 69, _]]
QUOTE_MEL = [[72, _, 74, 76, _, 74, 72, _], [77, _, 76, _, 74, _, _, _], [74, _, 72, _, 69, _, _, _], [71, _, 72, 74, _, 72, 71, _]]
section(0.0, S("g2")["t0"], [55, 52, 48, 50], GOLD_MEL, tempo_beat=B84, vol=0.6)
section(S("g2")["t0"], S("g3")["t0"], [48, 53, 50, 55], QUOTE_MEL, tempo_beat=B84, vol=0.6)          # C, F, Dm, then G
section(S("g3")["t0"], S("g8")["t0"], [55, 52, 48, 50], GOLD_MEL, tempo_beat=B84, vol=0.65)
section(S("g8")["t0"], w("g10", 17), [55, 52, 48, 50], [[_] * 8], tempo_beat=B84, style="mystery", vol=0.8)
section(w("g10", 17), END - 0.5, [43], [[_] * 8], tempo_beat=B84, style="drone", vol=0.8)
place(music, w("g1", 2), chime(67, (0, 4, 7, 12)), 0.35)                                            # title sting on "Gold"

# ---------------------------------------------------------------- sound effects
# g1: a lantern creak as Wren walks in, a hollow echo at the empty cave
place(sfx, 0.6, tone(320, 0.25, "tri", 260, decay=0.08), 0.06)
place(sfx, w("g1", 4), mix(tone(180, 0.9, "sine", 140, decay=0.4), 0.4 * tone(360, 0.7, "sine", 280, decay=0.3)), 0.12)
# g2: a soft card flip per Wren, a stamp tick per CAVE!, a low note as the jar shrinks, a small ding for Yap
for n in (9, 12, 15, 17, 21): place(sfx, w("g2", n), whoosh()[: int(0.25 * SR)], 0.10)
a, b = w("g2", 24.5), w("g2", 30)
for i in range(5): place(sfx, a + i * (b - a) / 5, mix(thud(), 0.3 * tone(900, 0.05, "square")), 0.18)
place(sfx, w("g2", 31.5), tone(147, 1.2, "tri", 110, decay=0.6), 0.14)
place(sfx, w("g2", 33), chime(84, (0, 7)), 0.12)
place(sfx, w("g2", 31.5), pop_(660), 0.06)                                                          # the "?" card
# g3: bars stacking (clinks that rise), a warm chord when the cube is done, the building slides in
a, b = w("g3", 2), w("g3", 11)
for i, k in enumerate(np.linspace(a, b, 40)): place(sfx, k, clink(1400 + 1400 * (k - a) / max(0.1, b - a)), 0.035)
place(sfx, w("g3", 11), chime(55, (0, 4, 7)), 0.22)
place(sfx, w("g3", 17.5), whoosh(), 0.08)
place(sfx, w("g3", 25), tone(784, 0.5, "sine", decay=0.2), 0.05)                                     # STILL HERE
# g4: cart rumbles, gold tipping, one soft "shff" as the slice settles, a quiet tick on +1.7%
for k in np.arange(S("g4")["t0"] + 0.2, w("g4", 4), 0.18): place(sfx, k, noise(0.08, 4, seed=61 + int(k * 10) % 3), 0.05)
for i in range(10): place(sfx, w("g4", 3.8) + i * 0.06, clink(1800 + (i * 197) % 700), 0.04)
place(sfx, w("g4", 9), (noise(0.6, 2, seed=71) * np.sin(np.linspace(0, np.pi, int(0.6 * SR)))).astype(np.float32), 0.12)
place(sfx, w("g4", 10.2), tone(1200, 0.05, "square"), 0.05)
place(sfx, w("g4", 16.2), tone(1500, 0.06, "square"), 0.06)
# g5: footsteps and pan swishes as the prospectors pour in, two rising notes for the bars, three soft slices
for k in np.arange(w("g5", 4), w("g5", 12), 0.3): place(sfx, k, noise(0.05, 5, seed=81 + int(k * 7) % 2), 0.04)
for k in (w("g5", 5), w("g5", 10)): place(sfx, k, (noise(0.5, 2, seed=83) * np.sin(np.linspace(0, np.pi, int(0.5 * SR)))).astype(np.float32), 0.06)
place(sfx, w("g5", 13), marimba(67, 0.6), 0.2)
place(sfx, w("g5", 15), marimba(74, 0.8), 0.22)
shff = (noise(0.4, 2, seed=91) * np.sin(np.linspace(0, np.pi, int(0.4 * SR)))).astype(np.float32)
for k in (w("g5", 29.5), w("g5", 33.5), w("g5", 33.85)): place(sfx, k, shff, 0.10)
# g6: a soft pencil scratch while the line draws; nothing dramatic on the hump
for k in np.arange(S("g6")["t0"] + 0.3, w("g6", 29), 0.11): place(sfx, k, noise(0.03, 6, seed=101 + int(k * 9) % 4), 0.018)
place(sfx, w("g6", 26), tone(660, 0.3, "sine", decay=0.12), 0.06)
# g7: a pop for each tag, a long rising whistle as Rome's tag runs off the top, a slow rise and settle for gold, a warm chord
for i, k in enumerate((0.2, 0.35, 0.5)): place(sfx, S("g7")["t0"] + k, pop_(700 + i * 120), 0.06)
place(sfx, w("g7", 2), tone(500, 1.4, "sine", 900, decay=0.8), 0.05)
place(sfx, w("g7", 10.5), tone(400, 2.4, "sine", 1800, decay=1.6), 0.06)
place(sfx, w("g7", 16.5), tone(500, 1.2, "sine", 620, decay=0.8), 0.05)
place(sfx, w("g7", 25), tone(620, 1.6, "sine", 500, decay=1.0), 0.04)
place(sfx, w("g7", 30), mix(tone(midi(43), 2.5, "sine", attack=0.3, decay=1.5), 0.6 * tone(midi(50), 2.5, "sine", attack=0.4, decay=1.5), 0.4 * tone(midi(59), 2.5, "sine", attack=0.5, decay=1.5)), 0.3)
# g8: distant truck hum, Wren's footsteps into the tunnel, one tiny "tink" for the nugget, a soft grey stamp
place(sfx, S("g8")["t0"] + 0.2, (np.convolve(noise(6, 0.5, seed=111), np.ones(200) / 200, "same") * 4).astype(np.float32), 0.05)
for k in np.arange(w("g8", 18), w("g8", 21), 0.3): place(sfx, k, noise(0.04, 5, seed=113), 0.04)
place(sfx, w("g8", 27), clink(3600), 0.12)
place(sfx, w("g8", 31) + 0.3, thud(), 0.3)
# g10: a soft phone tap, a pop for the "?", an unresolved chime on "why gold?" (as at the end of chapter 5)
place(sfx, S("g10")["t0"] + 0.4, tone(1800, 0.04, "sine", decay=0.02), 0.08)
place(sfx, w("g10", 5), pop_(520), 0.06)
place(sfx, w("g10", 19.5), chime(67, (0, 4, 7, 11)), 0.25)
