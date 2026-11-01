# Chapter 5 (Rome) cues: music and sound effects. Word indices follow narration.json (whitespace split, same as word()).
# Run by build.py with its synth kit in scope (tone, noise, mix, place, midi, marimba, pluck, bass, hat, thud, pop_, clink,
#  chime, whoosh, splash, thunder, music, sfx, section, word/w, seg, END, N, tt, SR, np). Mirrors the visual cues in scenes.js.
# ---------------------------------------------------------------- music
# D minor march for the empire, a low drone once the edict lands, a quiet arp for the callback.
ROME_MEL = [[74, _, 74, 72, 70, _, 69, _], [70, _, 69, 67, 65, _, _, _], [67, _, 69, 70, 72, _, 70, _], [69, _, _, 65, 62, _, _, _]]
section(0.0, seg["r8"]["t0"], [62, 58, 60, 57], ROME_MEL, tempo_beat=60 / 96, style="march", vol=0.85)  # Dm Bb C A
section(seg["r8"]["t0"], seg["r10"]["t0"], [50, 46, 50, 45], [[None] * 8], style="drone")             # the edict: low and cold
section(seg["r10"]["t0"], END - 1.0, [62, 58, 53, 57], [[None] * 8], style="mystery")                 # callback + teaser
place(music, w("r1", 2), chime(62, (0, 7, 12, 15)), 0.35)                                             # title sting on "Rome"

# ---------------------------------------------------------------- sound effects
# r1: laurel shimmer on "Wren"
place(sfx, w("r1", 4), chime(74, (0, 4, 7)), 0.15)
# r2: one bright coin lands on "silver", a pay line of coins clinks into a soldier's palm, gauge fills to 98% on "pure"
place(sfx, w("r2", 9), clink(2600), 0.18)
for i in range(6): place(sfx, w("r2", 12) + i * 0.12, clink(2200 + i * 90), 0.08)
place(sfx, w("r2", 21), chime(74, (0, 7)), 0.2)
# r3: marching boots from "army" to "sons", coin cascade on "rich"
for i, k in enumerate(np.arange(w("r3", 0), w("r3", 5), 0.32)): place(sfx, k, noise(0.06, 5, seed=31 + i % 2), 0.10)
for i in range(14): place(sfx, w("r3", 15) + i * 0.06, clink(1900 + (i * 211) % 900), 0.06)
# r4: Wren cameo pop on "Wren", sizzle on "melt", copper ingot thud, then three stamp clanks ("stamp out more")
place(sfx, w("r4", 12), pop_(700), 0.15)
place(sfx, w("r4", 14), noise(1.2, 1.5, seed=41), 0.10)
place(sfx, w("r4", 19), thud(), 0.45)
for i in range(3): place(sfx, w("r4", 20) + i * 0.28, mix(thud(), 0.6 * clink(1500)), 0.35)
# r5: two coin pops ("two hundred", "two seventy"), a falling tone as the gauge drains, a scrape as the silver skin flakes
place(sfx, w("r5", 3), pop_(900), 0.15)
place(sfx, w("r5", 11), pop_(700), 0.15)
place(sfx, w("r5", 12), tone(900, 1.1, "square", 180, decay=0.6), 0.07)
place(sfx, w("r5", 19), noise(0.35, 3, seed=51), 0.12)
# r6: slow ticks while prices creep (8 -> 16), fast rising ticks on the leap, thud when it lands on the last "hundred"
for k in np.linspace(w("r6", 16), w("r6", 22), 4): place(sfx, k, tone(500, 0.04, "square"), 0.05)
a, b = w("r6", 23), w("r6", 29.5)
for k in np.linspace(a, b, 24): place(sfx, k, tone(600 + 900 * (k - a) / max(0.1, b - a), 0.03, "square"), 0.04)
place(sfx, w("r6", 30), thud(), 0.5)
# r7: loaves pop off the shelf one by one (a year's worth shrinking to ten days), a low sad note on "days", minor chime at the end
a, b = w("r7", 9), w("r7", 18)
for i, k in enumerate(np.linspace(a, b, 30)): place(sfx, k, pop_(1100 - i * 20), 0.04)
place(sfx, w("r7", 18), tone(196, 0.6, "tri", decay=0.3), 0.18)
place(sfx, w("r7", 19.5), chime(67, (0, 4, 7)), 0.12)                                                # padlock holds
for i in range(3): place(sfx, w("r7", 24) + i * 0.3, mix(thud(), 0.6 * clink(1500)), 0.18)          # the mint hammers on
# r8: chisel taps as the tablet fills, big stamp on "die"
for k in np.arange(w("r8", 11), w("r8", 17), 0.22): place(sfx, k, mix(tone(1700, 0.04, "square"), noise(0.04, 4, seed=13)), 0.07)
place(sfx, w("r8", 23), thud(), 0.6)
# r9: an awning drops on "blood", stalls emptying (whooshes as sellers leave), stamp on "dropped"
place(sfx, w("r9", 6), thud(), 0.25)
for i in range(4): place(sfx, w("r9", 13) + i * 0.45, whoosh(), 0.10)
place(sfx, w("r9", 22), thud(), 0.5)
# r10: pentaja spill from the cave (EP 01 callback), mint clank on "mint", teaser chime on "Next"
for i in range(12): place(sfx, w("r10", 2) + i * 0.12, clink(2000 + (i * 137) % 900), 0.08)
for i in range(2): place(sfx, w("r10", 9) + i * 0.4, mix(thud(), 0.5 * clink(1300)), 0.2)
place(sfx, w("r10", 15.5), mix(thud(), 0.5 * clink(1300)), 0.4)
place(sfx, w("r10", 19), chime(65, (0, 4, 7, 11)), 0.25)
