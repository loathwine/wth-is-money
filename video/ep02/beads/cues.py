# Chapter 2 (Glass beads) cues: music and sound effects. Run by build.py with its synth kit in scope
# (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink, chime, whoosh, splash, thunder,
#  music, sfx, section, word/w, seg, END, N, tt, SR, np). Word indices mirror scenes.js (see SCRIPT.md).
# ---------------------------------------------------------------- music
# b1-b4 "you are Wren": a cheeky D-Mixolydian heist (D C G A); the hats drop out for the hard bargaining.
HEIST = 60 / 112
HEIST_MEL = [[74, _, 78, 81, _, 78, 76, _], [72, _, 76, 79, _, 76, 72, _], [74, 79, 83, _, 81, 79, 76, _], [76, _, 81, _, 79, 76, 74, _]]
section(0.0, w("b4", 32), [62, 60, 55, 57], HEIST_MEL, tempo_beat=HEIST)
section(w("b4", 32), seg["b5"]["t0"], [62, 60, 55, 57], [[74, _, _, _, 72, _, _, _]], tempo_beat=HEIST, style="drone", vol=0.7)
# b5: the music drops out; a single quiet low D drone that dies at "Above", then silence
place(music, seg["b5"]["t0"], tone(midi(38), w("b5", 14) - seg["b5"]["t0"], "sine", attack=0.8, decay=3.0), 0.25)
# b6: the same tune in D Dorian at half speed; each bar loses two more notes: the tune "buys less"
DOR = [74, 76, 77, 81, 79, 77, 76, 74]
bar, i, tb = 8 * HEIST, 0, seg["b6"]["t0"] + 0.3
while tb < seg["b7"]["t0"] - 0.2:
    root = [50, 46, 48, 45][i % 4]
    place(music, tb, tone(midi(root), bar, "sine", attack=0.3, decay=2.0), 0.4)
    for k, m in enumerate(DOR[: max(1, 8 - 2 * i)]): place(music, tb + k * bar / 8, pluck(m, 0.6), 0.22)
    tb += bar; i += 1
# b7: the accori chime, then the first bar back whole, in D major, once; the scale scene gets a calm loop
place(music, w("b7", 3), chime(74, (0, 4, 7, 11, 14)), 0.3)
for k, m in enumerate([74, 76, 78, 81, 79, 78, 76, 74]): place(music, w("b7", 6) + k * HEIST, marimba(m), 0.3)
section(w("b7", 6) + 8 * HEIST, seg["b8"]["t0"], [62, 55, 57, 62], [[None] * 8], tempo_beat=HEIST, vol=0.6)
# b8: the hook's A-minor mystery (Ulm Hollow); b9: the drill alone, then the chapter-3 chord
section(seg["b8"]["t0"], seg["b9"]["t0"], [57, 53, 55, 52], [[None] * 8], style="mystery")
place(music, w("b9", 4), chime(67, (0, 3, 7, 10)), 0.3)

# ---------------------------------------------------------------- sound effects
# b1: the bead drops; YOU = WREN stamp
place(sfx, 0.3, chime(74, (0, 7, 12)), 0.2)
place(sfx, w("b1", 7), thud(), 0.5)
# b2: map zoom; the accori appears; gold dust pours until the scale balances; the hand-over; the closed workshop
place(sfx, seg["b2"]["t0"], whoosh(), 0.2)
place(sfx, w("b2", 6) - 0.2, whoosh(), 0.15)
place(sfx, w("b2", 10), clink(2600), 0.2)
for k in np.linspace(w("b2", 18) + 0.2, w("b2", 20), 10): place(sfx, k, pop_(500 + 600 * (k - w("b2", 18)) / max(0.1, w("b2", 20) - w("b2", 18))), 0.05)
place(sfx, w("b2", 20), clink(1800), 0.2)
place(sfx, w("b2", 23) + 0.5, pop_(700), 0.12)
place(sfx, w("b2", 26), tone(220, 0.25, "square", 150, decay=0.1), 0.08)
# b3: the light bulb; furnace roar and three copies; the copy cracks in the fire; NOT FOOLED
crack = mix(noise(0.05, 8, seed=21), tone(3000, 0.03, "square"))
place(sfx, w("b3", 10), pop_(900), 0.15)
place(sfx, w("b3", 14), noise(0.8, 2, seed=5), 0.08)
for i in range(3): place(sfx, w("b3", 14) + 0.9 + i * 0.35, clink(2200 + i * 200), 0.12)
place(sfx, w("b3", 17) - 0.1 + 0.8, crack, 0.35)
place(sfx, w("b3", 23), thud(), 0.5)
# b4: toss; the bead pour; a tick per counter step; sacks land; the scale "balances"; the counter-offer
place(sfx, w("b4", 0), whoosh(), 0.2)
for i in range(60): place(sfx, w("b4", 2) + i * 0.06, clink(1800 + (i * 211) % 1400), 0.05)
for k in np.arange(w("b4", 12), w("b4", 16), 0.08): place(sfx, k, tone(1200, 0.03, "square"), 0.03)
for i in range(7): place(sfx, w("b4", 21) + i * (w("b4", 30) - w("b4", 21)) / 7, thud(), 0.25)
place(sfx, w("b4", 30), chime(72, (0, 4, 7)), 0.25)
place(sfx, w("b4", 28), pop_(1000), 0.1)
place(sfx, w("b4", 32) + 0.3, pop_(500), 0.15)
place(sfx, w("b4", 35), thud(), 0.4)
# b5: a low ship creak only, at the start. No sound effects from word 14 on.
place(sfx, seg["b5"]["t0"], np.convolve(noise(1.2, 1, seed=9), np.ones(40) / 40, "same").astype(np.float32), 0.25)
# b6: a soft clink per bead on the string; a quiet horn per ship; a low pop per basket that vanishes
a, b = w("b6", 4), w("b6", 10)
for i in range(20): place(sfx, a + i * (b - a) / 20, clink(2400 + (i % 4) * 120), 0.05)
for j, n in enumerate((18, 22, 25)):
    place(sfx, w("b6", n), tone(110, 0.9, "saw", 98, decay=0.5), 0.05)
    for i in range([4, 3, 2][j]): place(sfx, w("b6", n) + 0.6 + i * 0.1, pop_(300), 0.1)
place(sfx, w("b6", 31), thud(), 0.4)
# b7: the accori glows; CAN'T BE COPIED; gold pours and the scale balances
place(sfx, w("b7", 6), thud(), 0.35)
for k in np.linspace(w("b7", 19), w("b7", 23), 10): place(sfx, k, pop_(500 + 600 * (k - w("b7", 19)) / max(0.1, w("b7", 23) - w("b7", 19))), 0.05)
place(sfx, w("b7", 23), clink(1800), 0.2)
# b8: Wren pays one pentaja; the price tag flips; the saver's pouch; SOMEBODY ALWAYS PAYS
place(sfx, w("b8", 6), clink(2000), 0.15)
place(sfx, w("b8", 9), pop_(800), 0.12); place(sfx, w("b8", 9) + 0.7, pop_(1000), 0.12)
place(sfx, w("b8", 11), tone(392, 0.5, "tri", 330, decay=0.25), 0.12)
place(sfx, w("b8", 23), thud(), 0.45)
# b9: a drill rhythm that speeds up from about 3 to 12 ticks a second
k, rate = w("b9", 9), 3.0
while k < seg["b9"]["t1"] - 1.0:
    place(sfx, k, tone(900, 0.02, "square"), 0.05); k += 1 / rate; rate = min(12, rate * 1.12)
