# Chapter cues for the hook + Yap: music and sound effects. Run by build.py with its synth kit in scope
# (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink, chime, whoosh, splash, thunder,
#  music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirror the visual cues in scenes.js.
# ---------------------------------------------------------------- music
hook_end = seg["h3"]["t1"]
section(0.0, seg["h3"]["t0"], [57, 53, 55, 52], [[None] * 8], style="mystery")               # A minor, sparse
place(music, word("h3", 0), chime(69, (0, 7, 12, 16, 19)), 0.35)                               # title sting
YAP_MEL = [[72, _, 74, 76, _, 79, 76, _], [74, _, 72, _, 69, _, 72, _], [76, 79, 81, _, 79, 76, 74, _], [72, _, _, 69, 72, _, _, _]]
section(hook_end, END - 1.0, [60, 57, 53, 55], YAP_MEL)                                       # C major pentatonic, bright

# ---------------------------------------------------------------- sound effects (mirror yap/scenes.js)
# h1: pentaja spilling out of the cave, then the BROKEN stamp
for i in range(30): place(sfx, w("h1", 4) + i * 0.15, clink(2000 + (i * 137) % 900), 0.10)
place(sfx, w("h1", 16), thud(), 0.6)
# h2: MADE UP stamp, the four items pop in, then CAVE! stamps
place(sfx, w("h2", 2), thud(), 0.5)
for i, n in enumerate([15, 18, 21, 23]): place(sfx, w("h2", n), pop_(600 + i * 150), 0.18)
for i in range(4): place(sfx, w("h2", 26) + i * 0.3, thud(), 0.45)
# chapter 1
place(sfx, seg["y1"]["t0"], whoosh(), 0.25)
for k in np.arange(w("y2", 5), w("y2", 13), 0.45): place(sfx, k, mix(tone(1600, 0.04, "square"), noise(0.04, 4, seed=13)), 0.08)   # chisel
place(sfx, w("y2", 19), pop_(900), 0.15)
place(sfx, w("y2", 29), thunder(), 0.35); place(sfx, w("y2", 32), splash(), 0.3)
for n in (16, 18, 24): place(sfx, w("y3", n), clink(1800), 0.12)
place(sfx, w("y3", 9), pop_(700), 0.15)                                                        # NEVER MANY
place(sfx, w("y3", 39), tone(500, 0.25, "square", 700, decay=0.08), 0.12)                    # oink-ish squeak
for k in np.arange(w("y3", 42), w("y3", 46), 0.09): place(sfx, k, tone(1200, 0.03, "square"), 0.03)
place(sfx, w("y4", 15), chime(76, (0, 7)), 0.2)
place(sfx, w("y4", 24.5), splash(), 0.25)
place(sfx, w("y4", 44), thud(), 0.45)
place(sfx, w("y6", 15), whoosh(), 0.15)
place(sfx, w("y6", 21), pop_(800), 0.15)
for k in np.linspace(w("y7", 9), w("y7", 19), 40): place(sfx, k, pop_(500 + 900 * (k - w("y7", 9)) / max(0.1, w("y7", 19) - w("y7", 9))), 0.05)
place(sfx, w("y7", 22), thud(), 0.6)
place(sfx, w("y8", 27), thud(), 0.5)
place(sfx, w("y8", 34), chime(72, (0, 4, 7, 12)), 0.3)
for n in (4, 6): place(sfx, w("y9", n), pop_(800), 0.15)                                      # story tags
place(sfx, w("y9", 12), tone(700, 0.3, "square", 350, decay=0.1), 0.1)                        # new stone priced lower
place(sfx, w("y9", 15), chime(76, (0, 7)), 0.2)                                               # savings safe
for k in np.linspace(w("y9", 27), w("y9", 29), 12): place(sfx, k, clink(2000 + 300 * (k % 1)), 0.08)   # the cave's pentaja pile on
place(sfx, w("y9", 32), thud(), 0.5)                                                          # ALL WORTH LESS
place(sfx, w("y9", 39), chime(67, (0, 3, 7, 10)), 0.25)

