/* Tiny WebAudio chiptune kit: looping songs + sound effects, no files.
   Chip.song(SONG) starts a loop (stops the previous one); Chip.stop(); Chip.sfx('pop'|'thud'|'clink'|'splash'|'chime'|'sad'|
   'coin'|'nope'|'sick'|'cured'|'drain'|'whoosh'|'night'|'fanfare'|'tick'|'tada');
   Chip.playing is the SONG object now looping (or null). Audio starts on the first user gesture (browsers require it). */
(function () {
  "use strict";
  let ac = null, master = null, timer = null, muted = false;
  try { muted = localStorage.getItem("wth-muted") === "1"; } catch {}
  function ctx() {
    if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination); }
    if (ac.state === "suspended" && !document.hidden) ac.resume();
    return ac;
  }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function note(m, t, dur, type = "triangle", vol = 0.2, slide) {
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(hz(m), t);
    if (slide) o.frequency.exponentialRampToValueAtTime(hz(m + slide), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol = 0.1, hp = 4000) {
    const a = ctx(), n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = "highpass"; f.frequency.value = hp; g.gain.value = vol;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  // A song: { bpm, chords: [midi roots], melody: [[8 eighth-notes or null] per bar], style: 'island'|'mystery'|'calm' }
  // 'calm': a soft bass on beats 1 and 3 and a quiet arpeggio (arp: semitones over the root, default major [0, 4, 7, 12]).
  let playing = null;
  function song(S) {
    stop(); playing = S; const a = ctx(); const beat = 60 / S.bpm; let bar = 0, next = a.currentTime + 0.1;
    timer = setInterval(() => {
      if (next < a.currentTime) next = a.currentTime + 0.05;   // back from a hidden tab: skip the missed bars, don't play them all at once
      while (next < a.currentTime + 0.5) {
        const root = S.chords[bar % S.chords.length], mel = S.melody[bar % S.melody.length];
        for (let b = 0; b < 4; b++) {
          const t = next + b * beat;
          if (S.style === "island") { note(root - 12 + (b % 2 ? 7 : 0), t, beat * 0.9, "triangle", 0.16); noise(t + beat / 2, 0.05, 0.03); }
          else if (S.style === "calm") { if (b % 2 === 0) note(root - 12 + (b ? 7 : 0), t, beat * 1.8, "triangle", 0.11); note(root + (S.arp || [0, 4, 7, 12])[b], t + beat / 2, beat * 0.9, "sine", 0.035); }
          else { if (b === 0) note(root - 24, t, beat * 4, "sine", 0.12); note(root + [0, 7, 12, 15][b], t, beat, "triangle", 0.05); }
        }
        mel.forEach((m, i) => { if (m != null) note(m, next + i * beat / 2, beat * 0.8, S.style === "island" ? "sine" : "triangle", 0.09); });
        next += 4 * beat; bar++;
      }
    }, 100);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; playing = null; }
  const SFX = {
    pop: (t) => note(76, t, 0.12, "square", 0.08, 7),
    thud: (t) => { note(40, t, 0.3, "sine", 0.4, -12); noise(t, 0.1, 0.15, 400); },
    clink: (t) => { note(98, t, 0.2, "sine", 0.08); note(105, t + 0.03, 0.15, "sine", 0.05); },
    splash: (t) => { noise(t, 0.6, 0.25, 600); note(55, t, 0.4, "sine", 0.15, -10); },
    chime: (t) => [0, 4, 7, 12].forEach((s, i) => note(72 + s, t + i * 0.08, 0.6, "sine", 0.1)),
    sad: (t) => [0, -3, -7].forEach((s, i) => note(67 + s, t + i * 0.18, 0.5, "triangle", 0.1)),
    coin: (t) => { note(88, t, 0.08, "square", 0.05); note(95, t + 0.07, 0.25, "square", 0.05); },
    nope: (t) => { note(46, t, 0.12, "square", 0.07, -2); note(43, t + 0.13, 0.2, "square", 0.07, -3); },
    sick: (t) => [64, 63, 59, 58].forEach((m, i) => note(m, t + i * 0.22, 0.4, "triangle", 0.1, -0.5)),
    cured: (t) => [60, 64, 67, 72, 76].forEach((m, i) => note(m, t + i * 0.07, 0.5, "sine", 0.09)),
    drain: (t) => [96, 91, 86, 79].forEach((m, i) => note(m, t + i * 0.09, 0.18, "sine", 0.06)),
    whoosh: (t) => noise(t, 0.18, 0.06, 2500),
    night: (t) => { note(55, t, 0.9, "sine", 0.08); note(62, t + 0.25, 0.9, "sine", 0.06); note(67, t + 0.5, 1.2, "sine", 0.05); },
    fanfare: (t) => { [60, 64, 67].forEach((m, i) => note(m + 12, t + i * 0.12, 0.12, "square", 0.06)); note(84, t + 0.4, 0.7, "square", 0.06); note(72, t + 0.4, 0.7, "triangle", 0.12); },
    tick: (t) => note(84, t, 0.05, "sine", 0.025),
    tada: (t) => { note(72, t, 0.1, "square", 0.05); note(79, t + 0.1, 0.35, "square", 0.05); },
  };
  function sfx(name) { const a = ctx(); SFX[name] && SFX[name](a.currentTime); }
  function setMuted(m) { muted = m; try { localStorage.setItem("wth-muted", m ? "1" : "0"); } catch {} if (master) master.gain.value = m ? 0 : 0.5; }
  const _ = null;
  const SONGS = {
    yap: { bpm: 100, style: "island", chords: [60, 57, 53, 55], melody: [[72, _, 74, 76, _, 79, 76, _], [74, _, 72, _, 69, _, 72, _], [76, 79, 81, _, 79, 76, 74, _], [72, _, _, 69, 72, _, _, _]] },
    storm: { bpm: 132, style: "island", chords: [57, 53, 55, 52], melody: [[69, 72, 76, 72, 69, 72, 76, 79], [77, 76, 72, _, 69, _, 72, _], [76, 72, 69, 72, 76, 79, 81, _], [79, 76, 72, _, 69, _, _, _]] },
    mystery: { bpm: 90, style: "mystery", chords: [57, 53, 55, 52], melody: [[_, _, _, _, _, _, _, _]] },
  };
  // a hidden tab goes quiet (phones keep WebAudio running in the background otherwise)
  document.addEventListener("visibilitychange", () => { if (!ac) return; if (document.hidden) ac.suspend(); else ac.resume(); });
  window.Chip = { song, stop, sfx, SONGS, setMuted, get muted() { return muted; }, get playing() { return playing; } };
})();
