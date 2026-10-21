"""Build the EP 02 timeline, voice track, music + sound bed and captions.

usage (needs numpy):  nix-shell -p "python3.withPackages(ps: [ps.numpy])" --run "python3 build.py [narration.json] [outdir] [timeline.json]"
outputs: timeline.json, <outdir>/voice.wav, <outdir>/bed.wav (music + sfx, already ducked under the voice), <outdir>/captions.srt
Sound cues use word(): the same even-pace word timing as scene.js, so sounds land with the visuals.
"""
import json, os, re, sys, wave
import numpy as np

SR = 24000
LEAD, GAP = 0.6, 0.35
NARR = sys.argv[1] if len(sys.argv) > 1 else "narration.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "out"
TLF = sys.argv[3] if len(sys.argv) > 3 else "timeline.json"
AUDIO = os.environ.get("AUDIO", "audio")
os.makedirs(OUT, exist_ok=True)

narr = json.load(open(NARR))
timeline, t, clips = [], LEAD, {}
for s in narr:
    with wave.open(f"{AUDIO}/trim_{s['id']}.wav") as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    clips[s["id"]] = pcm
    speech = len(pcm) / SR
    t0 = t if s is not narr[0] else 0.0
    t1 = t + speech + GAP + s.get("pad", 0)
    timeline.append({"id": s["id"], "scene": s["scene"], "t0": round(t0, 3), "t1": round(t1, 3),
                     "voice": round(t, 3), "speech": round(speech + (t - t0), 3), "text": s["text"]})
    t = t1
END = t
json.dump(timeline, open(TLF, "w"), indent=1)
print(f"timeline: {len(timeline)} segments, {END:.1f} s ({END/60:.1f} min)")

N = int(END * SR) + SR
tt = np.arange(N) / SR
voice = np.zeros(N, np.float32)
for s in timeline:
    a = int(s["voice"] * SR)
    voice[a:a + len(clips[s["id"]])] += clips[s["id"]]
seg = {s["id"]: s for s in timeline}

def word(sid, n):
    """seconds (absolute) when word n of segment sid is spoken — mirrors TR.word in scene.js"""
    s = seg[sid]; words = max(1, len(s["text"].split()))
    lead = s["voice"] - s["t0"]; clip = s["speech"] - lead
    return s["t0"] + lead + clip * min(1, max(0, n / words))

# ---------------------------------------------------------------- synth kit
def env(n, attack=0.005, decay=None):
    x = np.arange(n) / SR; dur = n / SR
    e = np.minimum(1, x / attack)
    return e * (np.exp(-x / decay) if decay else np.maximum(0, 1 - x / dur))

def tone(f, dur, shape="sine", f2=None, attack=0.005, decay=None):
    n = int(dur * SR); x = np.arange(n) / SR
    freq = f if f2 is None else f * (f2 / f) ** (x / dur)
    ph = 2 * np.pi * np.cumsum(np.full(n, 1.0) * freq) / SR
    if shape == "sine": sig = np.sin(ph)
    elif shape == "square": sig = np.sign(np.sin(ph)) * 0.5
    elif shape == "tri": sig = 2 * np.abs(2 * (ph / (2 * np.pi) % 1) - 1) - 1
    else: sig = 2 * (ph / (2 * np.pi) % 1) - 1
    return (sig * env(n, attack, decay)).astype(np.float32)

def noise(dur, decay=3, seed=1):
    n = int(dur * SR); x = np.arange(n) / SR
    return (np.random.default_rng(seed).uniform(-1, 1, n) * np.maximum(0, 1 - x / dur) ** decay).astype(np.float32)

def mix(*sigs):
    out = np.zeros(max(len(x) for x in sigs), np.float32)
    for x in sigs: out[:len(x)] += x
    return out

def place(buf, t0, sig, vol=1.0):
    a = int(t0 * SR); b = min(len(buf), a + len(sig))
    if 0 <= a < len(buf): buf[a:b] += vol * sig[: b - a]

midi = lambda m: 440 * 2 ** ((m - 69) / 12)
marimba = lambda m, dur=0.5: mix(tone(midi(m), dur, "sine", decay=0.12), 0.35 * tone(midi(m) * 4, dur * 0.4, "sine", decay=0.03))
pluck = lambda m, dur=0.4: tone(midi(m), dur, "tri", decay=0.15)
bass = lambda m, dur=0.5: tone(midi(m), dur, "tri", attack=0.01, decay=0.25)
hat = lambda: noise(0.05, 6, seed=3) * 0.5
thud = lambda: mix(tone(70, 0.35, "sine", 40, decay=0.1), 0.5 * noise(0.12, 3, seed=5))
pop_ = lambda f=880: tone(f, 0.12, "square", f * 1.6, decay=0.04)
clink = lambda f=2400: mix(tone(f, 0.25, "sine", decay=0.05), 0.5 * tone(f * 1.5, 0.2, "sine", decay=0.03))
chime = lambda root=72, steps=(0, 4, 7, 12): mix(*[np.concatenate([np.zeros(int(i * 0.08 * SR), np.float32), marimba(root + st, 0.8)]) for i, st in enumerate(steps)])
whoosh = lambda: (noise(0.9, 1, seed=7) * np.sin(np.linspace(0, np.pi, int(0.9 * SR)))).astype(np.float32)
splash = lambda: mix(noise(0.8, 2, seed=9), 0.6 * tone(300, 0.5, "sine", 80, decay=0.15))
thunder = lambda: (np.convolve(noise(2.5, 1.5, seed=11), np.ones(60) / 60, "same") * 3).astype(np.float32)

# ---------------------------------------------------------------- music
music = np.zeros(N, np.float32)
BEAT = 60 / 100
def section(t_start, t_end, chords, melody, tempo_beat=BEAT, style="island"):
    """loop a 4-chord progression with a melody line over [t_start, t_end)"""
    bar = 4 * tempo_beat; i = 0; tb = t_start
    while tb < t_end - 0.05:
        root = chords[i % len(chords)]
        for b in range(4):
            tbeat = tb + b * tempo_beat
            if tbeat >= t_end: break
            if style == "island":
                place(music, tbeat, bass(root - 12 if b % 2 == 0 else root - 5), 0.55)
                place(music, tbeat + tempo_beat / 2, hat(), 0.12)
                place(music, tbeat, hat(), 0.07)
            else:  # mystery: slow low pulse + glassy arps
                if b == 0: place(music, tbeat, tone(midi(root - 24), bar, "sine", attack=0.4, decay=1.6), 0.5)
                place(music, tbeat, pluck(root + [0, 7, 12, 15][b], 0.6), 0.22)
        mel = melody[i % len(melody)]
        for k, m in enumerate(mel):
            if m is None: continue
            tn = tb + k * tempo_beat / 2
            if tn < t_end: place(music, tn, marimba(m) if style == "island" else pluck(m + 12, 0.5), 0.32 if style == "island" else 0.16)
        tb += bar; i += 1

hook_end = seg["h3"]["t1"]
section(0.0, seg["h3"]["t0"], [57, 53, 55, 52], [[None] * 8], style="mystery")               # A minor, sparse
place(music, word("h3", 0), chime(69, (0, 7, 12, 16, 19)), 0.35)                               # title sting
_ = None
YAP_MEL = [[72, _, 74, 76, _, 79, 76, _], [74, _, 72, _, 69, _, 72, _], [76, 79, 81, _, 79, 76, 74, _], [72, _, _, 69, 72, _, _, _]]
section(hook_end, END - 1.0, [60, 57, 53, 55], YAP_MEL)                                       # C major pentatonic, bright
fade = np.clip(tt / 1.5, 0, 1) * np.clip((END - tt) / 2.5, 0, 1)
music *= fade

# ---------------------------------------------------------------- sound effects (mirror scenes-yap.js)
sfx = np.zeros(N, np.float32)
w = word
# h1: pentaja spilling out of the cave, then the BROKEN stamp
for i in range(30): place(sfx, w("h1", 4) + i * 0.15, clink(2000 + (i * 137) % 900), 0.10)
place(sfx, w("h1", 15), thud(), 0.6)
# h2: MADE UP stamp, the four items pop in, then CAVE! stamps
place(sfx, w("h2", 2), thud(), 0.5)
for i, n in enumerate([13, 16, 19, 21]): place(sfx, w("h2", n), pop_(600 + i * 150), 0.18)
for i in range(4): place(sfx, w("h2", 24) + i * 0.3, thud(), 0.45)
# chapter 1
place(sfx, seg["y1"]["t0"], whoosh(), 0.25)
for k in np.arange(w("y2", 5), w("y2", 13), 0.45): place(sfx, k, mix(tone(1600, 0.04, "square"), noise(0.04, 4, seed=13)), 0.08)   # chisel
place(sfx, w("y2", 19), pop_(900), 0.15)
place(sfx, w("y2", 29), thunder(), 0.35); place(sfx, w("y2", 32), splash(), 0.3)
for n in (8, 11, 17): place(sfx, w("y3", n), clink(1800), 0.12)
place(sfx, w("y3", 33), tone(500, 0.25, "square", 700, decay=0.08), 0.12)                    # oink-ish squeak
for k in np.arange(w("y3", 36), w("y3", 40), 0.09): place(sfx, k, tone(1200, 0.03, "square"), 0.03)
place(sfx, w("y4", 15), chime(76, (0, 7)), 0.2)
place(sfx, w("y4", 24.5), splash(), 0.25)
place(sfx, w("y4", 44), thud(), 0.45)
place(sfx, w("y6", 15), whoosh(), 0.15)
place(sfx, w("y6", 21), pop_(800), 0.15)
for k in np.linspace(w("y7", 9), w("y7", 19), 40): place(sfx, k, pop_(500 + 900 * (k - w("y7", 9)) / max(0.1, w("y7", 19) - w("y7", 9))), 0.05)
place(sfx, w("y7", 22), thud(), 0.6)
place(sfx, w("y8", 25), thud(), 0.5)
place(sfx, w("y8", 38), chime(72, (0, 4, 7, 12)), 0.3)
place(sfx, w("y9", 24), chime(67, (0, 3, 7, 10)), 0.25)

# ---------------------------------------------------------------- duck the bed under the voice
k = int(0.25 * SR)
venv = np.convolve(np.abs(voice), np.ones(k) / k, "same")
venv = np.clip(venv / (venv.max() * 0.25 + 1e-9), 0, 1)
bed = music * (1 - 0.6 * venv) + sfx

def write(path, x, peak=0.9):
    x = x / max(1e-6, np.abs(x).max()) * peak
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((x * 32767).astype(np.int16).tobytes())
write(f"{OUT}/voice.wav", voice, 0.95)
write(f"{OUT}/bed.wav", bed, 0.9)

def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02}:{int(m):02}:{int(s):02},{int((s % 1) * 1000):03}"
with open(f"{OUT}/captions.srt", "w") as f:
    for i, s in enumerate(timeline, 1):
        txt = re.sub(r"\b(LESS)\b", lambda m: m.group(1).lower(), s["text"])
        f.write(f"{i}\n{ts(s['voice'])} --> {ts(s['voice'] + len(clips[s['id']]) / SR)}\n{txt}\n\n")
print(f"wrote {OUT}/voice.wav, {OUT}/bed.wav, {OUT}/captions.srt")
