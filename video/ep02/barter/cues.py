# EP 01 intro · "How the market works": music and sound effects. Run by build.py with its synth kit in scope
# (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink, chime, whoosh, splash, thunder,
#  music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirrors the visual cues in scenes.js.
# ---------------------------------------------------------------- music: a cosy G-major marimba for the village; i5 drops to a
# question (minor turn); i7 a slow drone for the sickness; i8-i9 warm again, festival brighter; i10 soft and open.
S = lambda i: seg[i]
VIL = [[79, _, 81, 83, _, 86, 83, _], [81, _, 79, _, 76, _, 79, _], [83, 86, 88, _, 86, 83, 81, _], [79, _, _, 76, 79, _, _, _]]
ASK = [[76, _, _, 79, 76, _, 74, _], [72, _, _, 74, 76, _, _, _]]
FEST = [[83, 86, 88, 91, _, 88, 86, _], [86, _, 83, _, 81, 83, _, _], [88, _, 91, 88, 86, _, 83, _], [86, _, 83, _, 79, _, _, _]]
section(0.0, S("i5")["t0"], [55, 50, 52, 48], VIL, vol=0.85)
section(S("i5")["t0"], S("i6")["t0"], [52, 48, 50, 47], ASK, style="mystery", vol=0.8)
section(S("i6")["t0"], S("i7")["t0"], [55, 50, 52, 48], VIL, vol=0.85)
section(S("i7")["t0"], S("i8")["t0"], [52, 48], [[_] * 8], style="drone", vol=0.75)
section(S("i8")["t0"], S("i9")["t0"], [55, 52, 48, 50], VIL, tempo_beat=BEAT * 1.25, vol=0.7)
section(S("i9")["t0"], S("i10")["t0"], [55, 50, 52, 50], FEST, vol=0.95)
section(S("i10")["t0"], END - 0.3, [55, 48, 50, 55], [[79, _, _, 83, _, _, 86, _], [83, _, _, _, 79, _, _, _]], tempo_beat=BEAT * 1.3, vol=0.75)

# ---------------------------------------------------------------- sound effects (mirror scenes.js)
# i1: title pop
place(sfx, 1.0, chime(79, (0, 4, 7, 12)), 0.18)
# i2: "You", then each face pops; the lumfruit drops into the bowl
place(sfx, w("i2", 1), pop_(700), 0.12)
for n in (6, 7.5, 10): place(sfx, w("i2", n), pop_(820 + n * 20), 0.10)
place(sfx, w("i2", 16) + 0.35, clink(1800), 0.18)
place(sfx, w("i2", 12), chime(83, (0, 4)), 0.12)
# i3: two tufts pop out; Tam's bite fails
place(sfx, w("i3", 3), pop_(600), 0.14); place(sfx, w("i3", 4), pop_(700), 0.14)
place(sfx, w("i3", 7), chime(79, (0, 7)), 0.12)
place(sfx, w("i3", 12), tone(320, 0.4, "square", 180, decay=0.15), 0.10)
# i4: footsteps across the plaza; the swap
for k in np.arange(S("i4")["t0"] + 0.3, w("i4", 8), 0.28): place(sfx, k, thud(), 0.05)
place(sfx, w("i4", 10), whoosh(), 0.10); place(sfx, w("i4", 13), whoosh(), 0.10)
place(sfx, w("i4", 14) + 0.3, clink(2200), 0.15)
# i5: the refusal: a buzz and the cross; "Now what?"
place(sfx, w("i5", 16), tone(220, 0.35, "square", 160, decay=0.12), 0.10)
place(sfx, w("i5", 17), thud(), 0.25)
place(sfx, w("i5", 19), pop_(500), 0.12)
# i6: two swaps, then the chain clicks together and dinner is saved
place(sfx, w("i6", 3), whoosh(), 0.08); place(sfx, w("i6", 5), clink(2000), 0.12)
place(sfx, w("i6", 9), whoosh(), 0.08); place(sfx, w("i6", 11.5), clink(2400), 0.14)
for i, n in enumerate((12, 13, 13.5, 14)): place(sfx, w("i6", n), pop_(700 + i * 120), 0.08)
place(sfx, w("i6", 16), chime(79, (0, 4, 7, 12)), 0.22)
# i7: Gran turns sick; the mushrooms; strength drains; the room goes dark
place(sfx, w("i7", 4.5), tone(400, 0.6, "sine", 300, decay=0.25), 0.10)
place(sfx, w("i7", 8), chime(76, (0, 7)), 0.12); place(sfx, w("i7", 9), pop_(900), 0.10)
for n in (16, 19.5): place(sfx, w("i7", n), tone(300, 0.7, "tri", 150, decay=0.3), 0.14)
place(sfx, w("i7", 24), tone(180, 1.6, "sine", 120, decay=0.8), 0.12)
# i8: eight crystals tinkle out of the jar; rain
cs = w("i8", 3); ce = w("i8", 6)
for i in range(8): place(sfx, cs + (ce - cs) * (i / 10 + 0.05), clink(2600 + i * 120), 0.08)
place(sfx, w("i8", 12.5), noise(2.5, 0.6, seed=13), 0.03)
# i9: the days tick to 12; the table appears
ds, de = w("i9", 4), w("i9", 6) + 0.2
for i in range(12): place(sfx, ds + (de - ds) * i / 11, clink(1600 + i * 60), 0.06)
place(sfx, w("i9", 7), chime(83, (0, 4, 7, 12)), 0.2)
# i10: "Not yet." and the closing question
place(sfx, w("i10", 7), pop_(660), 0.12)
place(sfx, w("i10", 9), whoosh(), 0.08)
place(sfx, w("i10", 15), chime(79, (0, 4, 7, 12, 16)), 0.18)
