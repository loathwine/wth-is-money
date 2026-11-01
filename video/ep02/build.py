"""Build the EP 02 timeline, voice track, music + sound bed and captions.

usage (needs numpy):  nix-shell -p "python3.withPackages(ps: [ps.numpy])" --run "python3 build.py <chapter dir>"
reads <ch>/narration.json, <ch>/audio/trim_*.wav and <ch>/cues.py (that chapter's music + sound effects)
outputs: <ch>/timeline.json, <ch>/out/voice.wav, <ch>/out/bed.wav (music + sfx, already ducked under the voice),
         <ch>/out/captions.srt (YouTube) and <ch>/out/captions.vtt (the page's <track>)
Sound cues use word(): the same even-pace word timing as scene.js, so sounds land with the visuals.
"""
import json, os, re, sys, wave
import numpy as np

SR = 24000
LEAD, GAP = 0.6, 0.35
CH = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "yap"
NARR, OUT, TLF, AUDIO = f"{CH}/narration.json", f"{CH}/out", f"{CH}/timeline.json", f"{CH}/audio"
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
                     "voice": round(t, 3), "speech": round(speech + (t - t0), 3), "text": s["text"], **({"dip": True} if s.get("dip") else {})})
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

# ---------------------------------------------------------------- music + sfx (per chapter, in <ch>/cues.py)
music = np.zeros(N, np.float32)
sfx = np.zeros(N, np.float32)
BEAT = 60 / 100
def section(t_start, t_end, chords, melody, tempo_beat=BEAT, style="island", lead=None, vol=1.0):
    """loop a 4-chord progression with a melody line over [t_start, t_end).
    style: island (bass + hats + marimba), mystery (low pulse + glassy arps), march (square bass + snare-ish noise), drone (pads)"""
    bar = 4 * tempo_beat; i = 0; tb = t_start
    while tb < t_end - 0.05:
        root = chords[i % len(chords)]
        for b in range(4):
            tbeat = tb + b * tempo_beat
            if tbeat >= t_end: break
            if style == "island":
                place(music, tbeat, bass(root - 12 if b % 2 == 0 else root - 5), 0.55 * vol)
                place(music, tbeat + tempo_beat / 2, hat(), 0.12 * vol)
                place(music, tbeat, hat(), 0.07 * vol)
            elif style == "march":
                place(music, tbeat, tone(midi(root - 12 if b % 2 == 0 else root - 5), tempo_beat * 0.8, "square", decay=0.2), 0.18 * vol)
                if b % 2: place(music, tbeat, noise(0.12, 4, seed=21), 0.18 * vol)
            elif style == "drone":
                if b == 0: place(music, tbeat, mix(tone(midi(root - 12), bar, "sine", attack=0.5, decay=2.0), 0.5 * tone(midi(root - 5), bar, "sine", attack=0.6, decay=2.0)), 0.45 * vol)
            else:  # mystery: slow low pulse + glassy arps
                if b == 0: place(music, tbeat, tone(midi(root - 24), bar, "sine", attack=0.4, decay=1.6), 0.5 * vol)
                place(music, tbeat, pluck(root + [0, 7, 12, 15][b], 0.6), 0.22 * vol)
        mel = melody[i % len(melody)]
        for k, m in enumerate(mel):
            if m is None: continue
            tn = tb + k * tempo_beat / 2
            if tn >= t_end: continue
            if lead: place(music, tn, lead(m), 0.3 * vol)
            elif style == "island": place(music, tn, marimba(m), 0.32 * vol)
            elif style == "march": place(music, tn, tone(midi(m), tempo_beat * 0.45, "square", decay=0.12), 0.12 * vol)
            else: place(music, tn, pluck(m + 12, 0.5), 0.16 * vol)
        tb += bar; i += 1
w = word
_ = None
exec(open(f"{CH}/cues.py").read())
fade = np.clip(tt / 1.5, 0, 1) * np.clip((END - tt) / 2.5, 0, 1)
music *= fade

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
CAP = {s["id"]: s["cap"] for s in narr if s.get("cap")}   # optional caption text (e.g. "1871" where the voice says "eighteen seventy-one")
cues = [(s["voice"], s["voice"] + len(clips[s["id"]]) / SR, re.sub(r"\b(LESS)\b", lambda m: m.group(1).lower(), CAP.get(s["id"], s["text"]))) for s in timeline]
with open(f"{OUT}/captions.srt", "w") as f:
    for i, (a, b, txt) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
# WebVTT for the page: same cues, '.' for milliseconds, long lines split at sentences so each cue fits a phone
def vtt_lines(txt):
    parts = re.split(r"(?<=[.?!:])\s+", txt); out, cur = [], ""
    def halve(p):   # a sentence too long for a phone: split at the comma nearest its middle (else the space)
        if len(p) <= 80: return [p]
        cs = [m.end() for m in re.finditer(r",\s", p) if 25 <= m.end() <= len(p) - 25] or [m.end() for m in re.finditer(r"\s", p)]
        c = min(cs, key=lambda i: abs(i - len(p) / 2)); return halve(p[:c].strip()) + halve(p[c:].strip())
    parts = [q for p in parts for q in halve(p)]
    for p in parts:
        if cur and len(cur) + 1 + len(p) > 80: out.append(cur); cur = p
        else: cur = f"{cur} {p}".strip()
    return out + [cur] if cur else out
with open(f"{OUT}/captions.vtt", "w") as f:
    f.write("WEBVTT\n\n")
    for a, b, txt in cues:
        chunks = vtt_lines(txt); n = sum(len(c) for c in chunks); t0 = a
        for c in chunks:   # split a long line's time by its share of characters
            t1 = t0 + (b - a) * len(c) / n
            f.write(f"{ts(t0).replace(',', '.')} --> {ts(t1).replace(',', '.')}\n{c}\n\n"); t0 = t1
print(f"wrote {OUT}/voice.wav, {OUT}/bed.wav, {OUT}/captions.srt, {OUT}/captions.vtt")
