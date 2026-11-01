# Chapter 3 (Wampum) cues: music and sound effects. Word indices follow narration.json (whitespace split, same as word()).
# Run by build.py with its synth kit in scope (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink,
#  chime, whoosh, splash, thunder, music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirrors the visual cues in scenes.js.
# ---------------------------------------------------------------- music
# D dorian, patient and woody. The music "inflates" with the beads: twice the notes from w5, an octave-up copy in w6,
# then one bar of nothing but bass on "inflation". Sour D minor for the savers, a soft line for the belts. No tom-toms.
B92 = 60 / 92
SLOW = [[69, _, _, _, 72, _, _, _], [_, _, 67, _, 65, _, _, _], [62, _, _, 65, 67, _, _, _], [69, _, _, _, _, _, _, _]]
FAST = [[69, 72, 69, 67, 72, 74, 72, 69], [67, 69, 67, 65, 64, 65, 67, _], [62, 65, 67, 69, 67, 65, 67, 69], [69, 72, 74, 72, 69, 67, 69, _]]
DM = [50, 48, 45, 50]                                                                   # Dm C Am Dm
def mel_only(t0, t1, mel, beat, fn, vol):
    """just a melody line (no bass/drums) over [t0, t1)"""
    tb, i = t0, 0
    while tb < t1 - 0.05:
        for k, m in enumerate(mel[i % len(mel)]):
            tn = tb + k * beat / 2
            if m is not None and tn < t1: place(music, tn, fn(m), vol)
        tb += 4 * beat; i += 1

section(0.0, seg["w5"]["t0"], DM, SLOW, tempo_beat=B92, style="island", vol=0.9)
place(music, w("w1", 2), chime(62, (0, 7, 12, 15, 19)), 0.35)                         # title sting on "Wampum"
drop = w("w6", 30.5)
section(seg["w5"]["t0"], drop, DM, FAST, tempo_beat=B92, style="march", vol=2.0)        # iron: double density
mel_only(seg["w6"]["t0"] + 0.4, drop, FAST, B92, lambda m: marimba(m + 12, 0.3), 0.16)  # w6: a higher copy on top
section(drop, seg["w7"]["t0"], DM, [[None] * 8], tempo_beat=B92, style="march", vol=1.4) # "inflation": the melody stops
section(seg["w7"]["t0"], w("w8", 15), [50, 46, 48, 45], [[None] * 8], tempo_beat=B92 * 1.1, style="mystery")
section(w("w8", 15), seg["w9"]["t0"], [50, 45, 50, 48], [[74, _, _, _, 72, _, _, _], [69, _, _, _, _, _, _, _]], tempo_beat=B92, style="drone", lead=lambda m: marimba(m, 0.8), vol=0.7)
section(seg["w9"]["t0"], w("w9", 16), DM, SLOW, tempo_beat=B92, style="island", vol=0.9)  # the bright theme returns for Wren
section(w("w9", 16), END - 1.0, [57], [[None] * 8], tempo_beat=B92, style="drone", vol=0.8)
place(music, w("w9", 24), chime(57, (0, 4, 7, 10)), 0.3)                               # unresolved A7: "next"

# ---------------------------------------------------------------- sound effects
scrape = lambda: mix(noise(0.08, 3, seed=17), tone(300, 0.08, "square", decay=0.05))
# w1: glint on "tools"
place(sfx, w("w1", 5), clink(3200), 0.08)
# w2: beads out of the whelk and the quahog, then the string draws across
place(sfx, w("w2", 11), pop_(900), 0.15)
place(sfx, w("w2", 16), pop_(700), 0.15)
for i in range(8): place(sfx, w("w2", 18) + i * 0.09, clink(1800 + i * 120), 0.06)
# w3: cut click, slow scrapes while drilling, the first bead drops, the belt assembles, warm chime for the treaty
place(sfx, w("w3", 3), mix(tone(2400, 0.03, "square"), noise(0.05, 6, seed=19)), 0.12)
for k in np.arange(w("w3", 4), w("w3", 10), 1 / 0.9 / 2): place(sfx, k, scrape(), 0.08)
place(sfx, w("w3", 10), clink(1600), 0.15)
place(sfx, w("w3", 12.6), clink(1700), 0.10)
for k in np.arange(w("w3", 13), w("w3", 16.5), 0.07): place(sfx, k, tone(1500, 0.02, "square"), 0.025)
place(sfx, w("w3", 17), chime(50, (0, 7)), 0.25)
# w4: the ship, the empty purse, the trader accepts the string, the LEGAL stamp, six beads and the penny
place(sfx, seg["w4"]["t0"], whoosh(), 0.2)
place(sfx, w("w4", 5), tone(400, 0.3, "square", 300, decay=0.1), 0.08)
place(sfx, w("w4", 9), clink(2000), 0.10); place(sfx, w("w4", 9) + 0.12, clink(2200), 0.08)
place(sfx, w("w4", 16), clink(2100), 0.08)
place(sfx, w("w4", 25), thud(), 0.5)
for i in range(6): place(sfx, w("w4", 28) + i * 0.18, pop_(500 + i * 90), 0.12)
place(sfx, w("w4", 31.5), clink(2200), 0.18)
# w5: the iron point clanks down, clicks in; stone scrapes slowly while iron races; the cart's long rattle
place(sfx, w("w5", 4), mix(tone(1800, 0.12, "square", decay=0.1), noise(0.06, 8, seed=23)), 0.15)
place(sfx, w("w5", 7.5), mix(tone(2600, 0.03, "square"), noise(0.03, 6, seed=25)), 0.12)
for k in np.arange(w("w5", 9), w("w5", 17.5), 0.6): place(sfx, k, scrape(), 0.06)
k, gap = w("w5", 9), 0.25
while k < w("w5", 17.5):
    place(sfx, k, pop_(500 + 900 * (k - w("w5", 9)) / max(0.1, w("w5", 17.5) - w("w5", 9))), 0.04); k += gap; gap = max(0.06, gap * 0.93)
for i in range(40): place(sfx, w("w5", 22) + i * 0.03, clink(2600 - i * 30), 0.05)
place(sfx, w("w5", 22.5), thud(), 0.4)
# w6: strings drop on the pan, one rattle per year tick, the ×5 stamp
for i in range(10): place(sfx, w("w6", 9) + i * 0.15, clink(1900 + (i * 173) % 600), 0.06)
for n in (17, 19, 21.5):
    for i in range(8): place(sfx, w("w6", n) + i * 0.05, clink(1700 + (i * 211) % 800), 0.06)
place(sfx, w("w6", 26), thud(), 0.55)
place(sfx, w("w6", 36), tone(700, 0.4, "square", 350, decay=0.2), 0.06)
# w7: wages, the sign repaint swish, a loaf falls (3 falling plucks), the "nope", the string slides back
place(sfx, w("w7", 5), clink(2000), 0.08)
place(sfx, w("w7", 7), noise(0.35, 2, seed=27), 0.10)
for i, m in enumerate((72, 69, 65)): place(sfx, w("w7", 10) + i * 0.12, pluck(m), 0.12)
place(sfx, w("w7", 25), tone(300, 0.15, "square"), 0.08); place(sfx, w("w7", 25) + 0.18, tone(240, 0.2, "square"), 0.08)
place(sfx, w("w7", 28), noise(0.3, 2, seed=29), 0.08)
# w8: the press stamps coins, REPEALED, a soft chime for the belt, beads fading out one by one
for i in range(4): place(sfx, w("w8", 5) + i * 1.1 + 0.5, clink(2000), 0.10)
place(sfx, w("w8", 10), thud(), 0.5)
place(sfx, w("w8", 15), chime(62, (0, 7, 12)), 0.2)
for i in range(8): place(sfx, w("w8", 22.5) + i * 0.3, clink(2400 - i * 150), 0.05 - i * 0.004)
# w9: Wren pops in, pentaja spill, beads spill from the drill, "=", then the cowrie sack lands heavily
place(sfx, w("w9", 3), pop_(800), 0.15)
for i in range(12): place(sfx, w("w9", 5.5) + i * 0.12, clink(2000 + (i * 137) % 900), 0.07)
for i in range(12): place(sfx, w("w9", 9.5) + i * 0.15, clink(1600 + (i * 157) % 700), 0.06)
place(sfx, w("w9", 14), thud(), 0.5)
for i in range(16): place(sfx, w("w9", 19) + i * 0.2, pop_(600 + i * 40), 0.03)
place(sfx, w("w9", 23.2), thud(), 0.7)
