/* EP 02 · Chapter 6 minigame: Wren's last cave (see gold.DESIGN.md).
   Be Wren one last time: hold to pour new money from its cave, let go on the ×2 line. Five monies from this episode
   (each time the family's jar beside the pile buys half), then gold, 1849: the same hold runs through all twelve years of
   the rush and the ×2 line never comes. The jar in the gold round follows real British prices (Bank of England CPI).
   Pacing (phone first): a practice round that waits for each action; no clock anywhere; a round waits until you press. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#gd-cv"), ui = $("#game-ui"), card = $("#gd-card"), coach = $("#gd-coach"), btn = $("#gd-btn"), hud = $("#gd-hud"), game = $("#game");
  const main = cv.getContext("2d");
  let g = main;
  const K = 3, W = 180, H = 200;          // logical canvas 180×200, 3 backing pixels each (crisp text)
  const params = new URLSearchParams(location.search);
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const PHONE = Ep02.PHONE;
  const _ = null;
  // the chapter's warm G-major loop (the movie's, at 96 bpm): steady on purpose
  Chip.SONGS.gold = { bpm: 96, style: "island", chords: [55, 52, 48, 50], melody: [[79, _, 78, 76, _, 74, 76, _], [76, _, 74, _, 72, _, 71, _], [72, _, 74, 76, _, 74, 72, _], [74, _, _, 72, 71, _, _, _]] };

  // The five monies of this episode. T: seconds from ×1 to ×2 once the pile moves (game values, tuned for a calm phone pace).
  const ROUNDS = [
    { id: "yap", kind: "rai", name: "RAI STONES", year: "1871", cave: "O'KEEFE'S SHIP", T: 3.4, yap: true, sting: [72, 76, 79] },
    { id: "beads", kind: "bead", name: "GLASS BEADS", year: "1500s", cave: "VENICE GLASS", T: 3.2, sting: [69, 72, 76] },
    { id: "wampum", kind: "wam", name: "WAMPUM", year: "1650", cave: "IRON DRILLS", T: 3.0, sting: [64, 67, 71] },
    { id: "cowries", kind: "cow", name: "COWRIES", year: "1845", cave: "SHIPS FROM ZANZIBAR", T: 3.2, sting: [65, 69, 72] },
    { id: "rome", kind: "coin", name: "SILVER COINS", year: "AD 250", cave: "THE MINT", T: 2.8, sting: [62, 65, 69] },
  ];
  const TUT = { id: "tut", kind: "pen", name: "PENTAJA", year: "ULM HOLLOW", cave: "WREN'S CAVE", T: 3.4 };
  const GOLD = { id: "gold", kind: "gold", name: "GOLD", year: "1849–60", cave: "THE WHOLE WORLD DIGS" };
  // Gold, 1849–1860: world pile (game: 6,000 t at the start, plus ~200 t a year in the 1850s, which is real) and the jar in
  // loaves = 8 × CPI(1849) ÷ CPI(year), from the Bank of England's consumer price index (real ratios).
  const GY = [[1849, 6060, 8.0], [1850, 6140, 8.4], [1851, 6340, 8.5], [1852, 6540, 8.4], [1853, 6740, 7.3], [1854, 6940, 6.7], [1855, 7140, 6.6],
    [1856, 7340, 6.6], [1857, 7540, 6.7], [1858, 7740, 7.5], [1859, 7940, 7.4], [1860, 8140, 6.9]].map(([y, t, l]) => ({ y, v: t / 6000, l }));
  const FF = [[1860, 6.9], [1867, 6.3], [1873, 6.4], [1886, 7.9], [1895, 8.2]];   // after the rush (BoE CPI; 1895 = the 1890s average)
  const YEAR_S = 0.8, FF_S = 5, DELAY = 0.3, EASE = 0.3, MAXV = 2.6, STAMP = 1.4, FLY = 0.7;
  const TUT_KEY = "wth-ep02-gold-tut", BEST_KEY = "wth-ep02-gold-best";
  const tutSeen = () => { try { return localStorage.getItem(TUT_KEY) === "1"; } catch { return false; } };

  const S = { phase: "idle", r: 0, v: 1, dv: 1, h: 0, holding: false, moved: false, short: false, score: 0, pts: [], best: 0, tut: 0, tutAt: 0,
    st: 0, stamp: null, fly: null, parts: [], pops: 0, lastLoaf: 8, year: 0, yt: 0, ff: 0, slide: 1, cardAt: 0, got: [], pourT: 0, tick: 0, flash: 0 };
  try { S.best = +localStorage.getItem(BEST_KEY) || 0; } catch {}

  const money = () => S.phase === "tut" || S.phase === "idle" ? TUT : S.r >= 5 ? GOLD : ROUNDS[S.r];
  const pourV = (h, T) => { const u = h - DELAY; if (u <= 0) return 1; const s = 1 / (T - EASE / 2); return 1 + (u < EASE ? s * u * u / (2 * EASE) : s * (u - EASE / 2)); };
  const points = (v) => { const e = Math.abs(v - 2) * 100; return e <= 3 ? 100 : Math.max(0, Math.round(100 - 6 * (e - 3))); };
  const loavesFor = (m, v) => m.yap ? 8 - (v - 1) : 8 / v;   // Yap's islanders priced O'Keefe's stones lower: the jar barely drops
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const halves = (x) => { const n = Math.round(x * 2) / 2, w = Math.floor(n); return (w ? w : "") + (n % 1 ? "½" : w ? "" : "0"); };

  /* ---------- tiny synth (pour, pops, chimes); respects the mute button ---------- */
  let ac = null;
  function tone(f, dur, type = "sine", vol = 0.04, f2) {
    if (Chip.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(v); v.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  function wind(dur = 2.2, vol = 0.03) {
    if (Chip.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain();
      s.buffer = b; f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(700, t + dur / 2); f.frequency.linearRampToValueAtTime(250, t + dur);
      v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(vol, t + dur / 3); v.gain.linearRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(v); v.connect(ac.destination); s.start(t);
    } catch {}
  }
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const sting = (notes) => notes.forEach((m, i) => setTimeout(() => tone(midi(m), 0.25, "triangle", 0.05), i * 90));
  const POUR = { pen: [700, "sine"], rai: [150, "triangle"], bead: [1100, "square"], wam: [800, "triangle"], cow: [1400, "triangle"], coin: [1700, "sine"] };
  const pourSound = (kind, v) => { const [f, ty] = POUR[kind] || POUR.pen; tone(f * (1 + 0.45 * (v - 1)) * (0.97 + Math.random() * 0.06), 0.05, ty, ty === "square" ? 0.012 : 0.03); };
  const loafPop = () => tone(520, 0.07, "sine", 0.05, 380);

  /* ---------- drawing kit (logical pixels) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const mix = (a, b, k) => { const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return "#" + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k, 0, 1))).toString(16).padStart(2, "0")).join(""); };
  function disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(Math.max(0, r * r - y * y + r * 0.6))); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  function txt(s, x, y, size, color, o = {}) {
    g.save(); g.globalAlpha *= o.alpha ?? 1;
    g.font = o.body ? `700 ${size}px 'Space Grotesk'` : `${size}px Silkscreen`;
    g.textAlign = o.align || "center"; g.textBaseline = "middle";
    if (o.shadow !== false) { g.fillStyle = "rgba(0,0,0,.7)"; g.fillText(s, x + 0.7, y + 0.7); }
    g.fillStyle = color; g.fillText(s, x, y); g.restore();
  }

  // one unit of each money, drawn at (x, y) top-left; fresh = the new money from the cave
  const TILE = { pen: [9, 9], rai: [12, 10], bead: [7, 5], wam: [8, 5], cow: [8, 6], coin: [8, 7] };
  const BEADC = ["#2e86c1", "#c0392b", "#ffd23f", "#16a085", "#e8e0d0", "#7d3c98"];
  function tile(kind, x, y, fresh, i) {
    if (kind === "pen") { const ic = Art.iconCanvas && Art.iconCanvas.pen; if (ic) g.drawImage(ic, x, y, 8, 8); else px(x + 2, y + 1, 4, 6, "#ff6fb5"); return; }
    if (kind === "rai") { const c = fresh ? "#d9d6c6" : "#8f8b7c", d = fresh ? "#b0ac9a" : "#6a6658"; disc(x + 6, y + 5, 5, d); disc(x + 6, y + 5, 4, c); px(x + 5, y + 4, 2, 2, "#1a1026"); return; }
    if (kind === "bead") { px(x, y + 2, 7, 1, "#5e3b1a"); const c = BEADC[(i * 7 + (i >> 2)) % BEADC.length]; px(x + 1, y + 1, 4, 3, c); px(x + 2, y + 1, 1, 1, "#ffffff"); return; }
    if (kind === "wam") { const a = (i % 3 === 1) ? "#f0ece0" : "#5b2a86", b = (i % 3 === 1) ? "#5b2a86" : "#f0ece0"; px(x, y, 8, 4, a); px(x + 3, y + 1, 2, 2, b); px(x, y + 4, 8, 1, "#2a1a3a"); return; }
    if (kind === "cow") { px(x + 2, y, 4, 5, "#f3e6c6"); px(x + 1, y + 1, 6, 3, "#f3e6c6"); px(x + 3, y + 1, 2, 3, "#8c7650"); px(x + 3, y + 2, 2, 1, "#f3e6c6"); px(x + 2, y + 1, 1, 1, "#ffffff"); px(x + 1, y + 4, 6, 1, "#c8b890"); return; }
    if (kind === "coin") { disc(x + 4, y + 3, 3, fresh ? "#7a4a2a" : "#7c8596"); disc(x + 4, y + 3, 2, fresh ? "#c58a5a" : "#d7dde8"); px(x + 3, y + 2, 1, 1, "#ffffff"); }
  }
  // the pile: rows of the money, bottom up, clipped to v × U; above the ×1 line is the cave's new money
  const BASE = 172, U = 46, PX = 18, PW = 72, PC = PX + PW / 2;
  function pile(kind, v) {
    const [tw, th] = TILE[kind], top = BASE - v * U;
    g.save(); g.beginPath(); g.rect(PX, top, PW, BASE - top); g.clip();
    const cols = Math.ceil(PW / tw) + 1;
    for (let r = 0; BASE - r * th > top; r++) {
      const y = BASE - (r + 1) * th, fresh = y + th / 2 < BASE - U;
      for (let c = 0; c < cols; c++) tile(kind, PX + c * tw - (r % 2 ? tw / 2 : 0), y, fresh, r * 31 + c);
    }
    g.restore();
  }
  // gold: the world's gold as a block of bars (a cube at ×1), drawn with a lit top and a dark side
  const GX = PC - U / 2;
  function goldPile(v) {
    const h = v * U, top = BASE - h, d = 7;
    g.fillStyle = "#b8860b"; g.beginPath(); g.moveTo(GX + U, top); g.lineTo(GX + U + d, top - d * 0.6); g.lineTo(GX + U + d, BASE - d * 0.6); g.lineTo(GX + U, BASE); g.fill();
    g.fillStyle = "#ffe680"; g.beginPath(); g.moveTo(GX, top); g.lineTo(GX + d, top - d * 0.6); g.lineTo(GX + U + d, top - d * 0.6); g.lineTo(GX + U, top); g.fill();
    px(GX, top, U, h, "#e0a92a");
    for (let y = BASE - 5, r = 0; y > top - 4; y -= 5, r++) for (let x = GX - (r % 2 ? 5 : 0); x < GX + U; x += 10) {
      const x0 = Math.max(GX, x), x1 = Math.min(GX + U, x + 9), y0 = Math.max(top, y);
      if (x1 > x0 && y + 4 > y0) { px(x0, y0, x1 - x0, y + 4 - y0, "#f2c23a"); px(x0, y0, x1 - x0, 1, "#fff0a0"); }
    }
  }
  // the family's jar and what it buys, in loaves (8 at the start)
  function loaf(x, y, k) {
    const full = "#d9a066", dark = "#a0652f", off = "#3a2d5c", offD = "#2a2044", cut = x + Math.round(12 * clamp(k, 0, 1));
    const part = (a, b, w, h, c1, c2) => { const w1 = clamp(cut - a, 0, w); if (w1) px(a, b, w1, h, c1); if (w - w1 > 0) px(a + w1, b, w - w1, h, c2); };
    part(x + 1, y, 10, 1, full, off); part(x, y + 1, 12, 5, full, off); part(x + 1, y + 6, 10, 1, dark, offD);
    if (k > 0.3) { px(x + 3, y + 2, 1, 2, dark); px(x + 6, y + 2, 1, 2, dark); } if (k > 0.85) px(x + 9, y + 2, 1, 2, dark);
  }
  function jarColumn(kind, loaves, label) {
    const cx = 142, base = 126;
    txt(label, cx, 86, 8, "#ab9fcb");
    for (let i = 0; i < 28; i++) { const u = i / 28, hw = Math.round(u > 0.85 ? 6 : 6 + 7 * Math.sin(Math.PI * u / 0.85)); px(cx - hw, base - i - 1, hw * 2, 1, i % 4 ? "#a0522d" : "#8a4322"); }
    px(cx - 7, base - 30, 14, 2, "#6b3a1a");
    if (kind === "gold") { disc(cx - 3, base - 31, 2, "#ffd23f"); disc(cx + 2, base - 32, 2, "#f2c23a"); }
    else { g.save(); g.beginPath(); g.rect(cx - 6, base - 36, 12, 6); g.clip(); tile(kind, cx - 6, base - 35, false, 3); g.restore(); }
    txt("BUYS", cx, 134, 8, "#ab9fcb");
    for (let i = 0; i < 8; i++) loaf(112 + (i % 4) * 15, 140 + Math.floor(i / 4) * 10, loaves - i);
    txt(`${halves(loaves)} LOAVES`, cx, 166, 8, loaves < 7.5 ? "#ff9a7a" : "#f4ecff");
  }

  /* ---------- the caves (top strip, 180×46): where each round's new money comes from ---------- */
  const CAVE_H = 46;
  function sky(a, b) { for (let i = 0; i < CAVE_H; i += 2) px(0, i, W, 2, mix(a, b, i / CAVE_H)); }
  function sea(y, t) { px(0, y, W, CAVE_H - y, "#1f5f8a"); for (let i = 0; i < 12; i++) px(((i * 23 + t * 8) % (W + 10)) - 5, y + 2 + (i % 3) * 3, 6, 1, "#4a9ac8"); }
  function cave(kind, t, yearIdx = 0) {
    if (kind === "pen") {   // Ulm Hollow: Wren's own cave, pentaja glinting inside
      sky("#2a1a4a", "#6a4a8a");
      for (let x = 0; x < W; x++) { const h = 16 + Math.sin(x * 0.05) * 5 + Math.sin(x * 0.13) * 2; px(x, CAVE_H - h, 1, h, "#3f6a3a"); }
      for (let y = 0; y < 18; y++) { const hw = Math.round(11 * Math.sqrt(1 - Math.pow((18 - y) / 18, 2))); px(PC - hw, CAVE_H - 18 + y, hw * 2, 1, "#0a0612"); }
      for (let i = 0; i < 5; i++) if ((t * 1.5 + i * 0.37) % 1 < 0.5) px(PC - 7 + i * 3, CAVE_H - 10 + (i % 2) * 3, 1, 1, "#ff6fb5");
      if (Art.drawAlien) Art.drawAlien(g, 126, CAVE_H - 3, "wren", t);
      return;
    }
    if (kind === "rai") {   // O'Keefe's schooner with a stone on deck
      sky("#7fc4f0", "#cfe9f8"); sea(32, t);
      const bob = Math.round(Math.sin(t * 2) * 1), x = 30;
      px(x, 26 + bob, 50, 7, "#6b4426"); px(x + 3, 33 + bob, 44, 2, "#4a2e18"); px(x, 26 + bob, 50, 1, "#8a5a2b");
      px(x + 16, 4 + bob, 1, 22, "#3a2410"); px(x + 34, 2 + bob, 1, 24, "#3a2410");
      for (let i = 0; i < 18; i++) { px(x + 17, 5 + i + bob, Math.round(i * 0.7), 1, "#f4f0e0"); px(x + 35, 3 + i + bob, Math.round(i * 0.75), 1, "#f4f0e0"); }
      disc(x + 26, 21 + bob, 5, "#b0ac9a"); disc(x + 26, 21 + bob, 4, "#d9d6c6"); px(x + 25, 20 + bob, 2, 2, "#5a5648");
      px(x + 40, 23 + bob, 4, 3, "#7c8596"); px(x + 6, 23 + bob, 5, 3, "#7c8596");   // iron tools
      return;
    }
    if (kind === "bead") {   // a Venetian glass furnace and a crate of beads
      sky("#3a1f2a", "#6b3a2a");
      for (let y = 0; y < CAVE_H; y += 4) for (let x = (y / 4) % 2 ? 0 : 6; x < W; x += 12) px(x, y, 11, 3, "#7a4030");
      for (let y = 0; y < 26; y++) { const hw = Math.round(22 * Math.sqrt(1 - Math.pow((26 - y) / 26, 2))); px(PC - hw, CAVE_H - 26 + y, hw * 2, 1, "#4a2a20"); }
      const fl = 0.5 + 0.5 * Math.sin(t * 9);
      for (let y = 0; y < 10; y++) { const hw = Math.round(8 * Math.sqrt(1 - Math.pow((10 - y) / 10, 2))); px(PC - hw, CAVE_H - 10 + y, hw * 2, 1, mix("#ff8a2a", "#ffe680", fl * y / 10)); }
      px(116, 30, 26, 16, "#8a5a2b"); px(116, 30, 26, 1, "#b8862e"); for (let i = 0; i < 7; i++) px(118 + i * 3, 28, 2, 2, BEADC[i % BEADC.length]);
      return;
    }
    if (kind === "wam") {   // an iron drill point, spinning, spitting beads
      sky("#2f4a3a", "#5f8a4a");
      for (let i = 0; i < 6; i++) { const x = i * 34 + 6; px(x + 3, 14, 3, 32, "#3a2a1a"); for (let k = 0; k < 4; k++) px(x - 2 + k, 8 + k * 2, 13 - 2 * k, 2, "#2f6a3a"); }
      px(PC - 2, 0, 4, 30, "#5a5f6a"); px(PC - 1, 0, 1, 30, "#9aa3b5");
      for (let y = 0; y < 30; y += 4) px(PC - 3, y + Math.floor(t * 24) % 4, 6, 1, "#2a2e36");
      px(PC - 1, 30, 2, 4, "#cfd6e0"); px(PC, 34, 1, 2, "#cfd6e0");
      px(PC - 30, 6, 60, 2, "#8a5a2b"); px(PC - 30 + Math.round(Math.sin(t * 12) * 3), 5, 4, 4, "#5e3b1a");   // the bow
      for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6, r = 8 + ((t * 20 + i * 7) % 12); px(PC + Math.cos(a) * r, 36 + Math.sin(a) * 3, 2, 2, i % 2 ? "#f0ece0" : "#7d3caf"); }
      return;
    }
    if (kind === "cow") {   // a Hamburg ship tipping Zanzibar shells
      sky("#f0b070", "#f8d890"); sea(30, t);
      const x = 18, tip = Math.sin(t * 1.5) * 0.5;
      px(x, 22, 64, 9, "#3a2a20"); px(x, 22, 64, 1, "#6b4426"); px(x + 4, 31, 56, 2, "#2a1a10");
      px(x + 20, 2, 1, 20, "#2a1a10"); px(x + 42, 0, 1, 22, "#2a1a10");
      for (let i = 0; i < 16; i++) { px(x + 21, 3 + i, Math.round(i * 0.6), 1, "#e8e0d0"); px(x + 43, 1 + i, Math.round(i * 0.6), 1, "#e8e0d0"); }
      px(x + 2, 19, 16, 4, "#f3e6c6"); px(x + 50, 18 + Math.round(tip), 12, 5, "#f3e6c6");
      return;
    }
    if (kind === "coin") {   // the mint: hammer and die, copper melting in the crucible
      sky("#2a2430", "#4a4250");
      for (let y = 0; y < CAVE_H; y += 6) for (let x = (y / 6) % 2 ? 0 : 9; x < W; x += 18) px(x, y, 17, 5, "#3a3440");
      const hit = Math.abs(Math.sin(t * 5)), hy = 6 + Math.round(hit * 12);
      px(PC - 8, CAVE_H - 10, 16, 10, "#5a5a62"); px(PC - 5, CAVE_H - 13, 10, 3, "#8a8a92");
      px(PC + 6, hy - 10, 2, 16, "#8a5a2b"); px(PC - 2, hy + 4, 14, 6, "#6a6a72"); px(PC - 2, hy + 4, 14, 1, "#9a9aa2");
      px(122, 32, 22, 12, "#5a3a2a"); px(124, 30, 18, 3, mix("#e5703a", "#ffb060", 0.5 + 0.5 * Math.sin(t * 7)));
      px(118, 38, 4, 8, "#3a2a20"); px(144, 38, 4, 8, "#3a2a20");
      return;
    }
    if (kind === "gold") {   // a hillside full of prospectors; more every year of the rush
      sky("#78b8e8", "#cfe9f8");
      for (let x = 0; x < W; x++) { const h = 22 + Math.sin(x * 0.04 + 1) * 8 + Math.sin(x * 0.11) * 3; px(x, CAVE_H - h, 1, h, x % 9 ? "#9a7a4a" : "#8a6a3a"); }
      px(0, CAVE_H - 6, W, 6, "#7a5a3a");
      for (let i = 0; i < 8 + yearIdx; i++) { const x = 6 + hash(i + 40) * 168, y = 18 + hash(i + 90) * 18; for (let k = 0; k < 4; k++) px(x - k, y + k, 1 + 2 * k, 1, "#f0ece0"); }
      const n = 10 + yearIdx * 6;
      for (let i = 0; i < n; i++) {
        const x = 4 + hash(i) * 172, y = 22 + hash(i + 7) * 20, bob = Math.sin(t * 6 + i) > 0.7 ? 1 : 0;
        px(x, y - 4, 2, 1, "#3a2a1a"); px(x, y - 3, 2, 2, "#d9a066"); px(x, y - 1 + bob, 2, 2, ["#2e86c1", "#c0392b", "#5e3b1a"][i % 3]);
        if (i % 2) px(x + 2, y + bob, 2, 1, "#a0a0a8");
      }
    }
  }
  // pre-drawn caves for the cards (HUD dots, round cards and the "Wrens of history" strip)
  function caveCanvas(kind, yearIdx = 0) {
    const c = document.createElement("canvas"); c.width = W * 2; c.height = CAVE_H * 2; c.className = "px";
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false; x.setTransform(2, 0, 0, 2, 0, 0);
    const o = g; g = x; try { cave(kind, 0.3, yearIdx); } catch {} g = o;
    return c;
  }
  function iconCanvas(kind) {
    const c = document.createElement("canvas"); c.width = 16; c.height = 16; c.className = "px";
    const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const o = g; g = x;
    try {
      if (kind === "gold") { px(2, 6, 12, 6, "#e0a92a"); px(4, 4, 12, 2, "#ffe680"); px(2, 6, 12, 1, "#fff0a0"); }
      else { const [tw, th] = TILE[kind], k = Math.max(tw, th) <= 8 ? 2 : 1; x.setTransform(k, 0, 0, k, 0, 0); tile(kind, Math.round((16 / k - tw) / 2), Math.round((16 / k - th) / 2), false, 2); }
    } catch {}
    g = o;
    return c;
  }

  /* ---------- the scene ---------- */
  function draw(now) {
    const t = now / 1000, m = money();
    g = main; g.setTransform(K, 0, 0, K, 0, 0); g.imageSmoothingEnabled = false;
    px(0, 0, W, H, "#120d1d");
    // the cave, sliding in at the start of a round
    const sl = RM ? 0 : CAVE_H * Math.pow(1 - clamp(S.slide, 0, 1), 2);
    g.save(); g.beginPath(); g.rect(0, 0, W, CAVE_H); g.clip(); g.translate(0, -sl);
    cave(m.kind, t, m.kind === "gold" ? (S.phase === "ff" ? Math.round(12 * (1 - clamp(S.ff / FF_S, 0, 1))) - 1 : S.phase === "result" || S.phase === "done" ? -1 : S.year) : 0);
    g.restore();
    px(0, CAVE_H, W, 1, "#3a2d5c");
    px(0, BASE, W, H - BASE, "#1f1733"); px(0, BASE, W, 1, "#4e3f78");
    // the pour
    for (const p of S.parts) { if (m.kind === "gold") px(p.x, p.y, 2, 2, "#ffd23f"); else px(p.x, p.y, 2, 2, p.c); }
    // the pile
    const v = S.dv;
    if (m.kind === "gold") goldPile(v); else pile(m.kind, v);
    // the lines: ×1 under the old pile, ×2 dashed and gold, labelled at both ends
    const y1 = BASE - U, y2 = BASE - 2 * U;
    px(PX - 4, y1, PW + 8, 1, "#ab9fcb"); txt("×1", 2, y1, 8, "#ab9fcb", { align: "left" });
    const glow = S.flash > 0 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
    for (let x = PX - 4; x < W - 14; x += 6) px(x, y2, 4, 1, glow ? mix("#ffd23f", "#ffffff", glow) : "#ffd23f");
    txt("×2", 2, y2, 8, "#ffd23f", { align: "left" }); txt("×2", W - 2, y2, 8, "#ffd23f", { align: "right" });
    // the jar
    let loaves = 8;
    if (m.kind === "gold") loaves = S.jar ?? 8; else loaves = loavesFor(m, v);
    jarColumn(m.kind, loaves, m.id === "tut" ? "GRAN'S JAR" : "THE JAR");
    // gold: the year on the cube and the multiple beside it
    if (m.kind === "gold" && S.phase !== "goldcard") {
      const after = S.phase === "ff" ? S.ffLabel : S.phase === "result" || S.phase === "done" ? "1890s" : "";
      const yl = after ? "1860" : String(Math.min(1860, 1849 + S.year));   // the cube is the rush's gold: it stays at 1860
      txt(yl, PC, BASE - v * U / 2 + 2, yl.length > 4 ? 10 : 12, "#5a3a08", { shadow: false });
      if (v > 1.005) txt(`×${v.toFixed(2)}`, GX + U + 10, BASE - v * U - 6, 8, "#ffe680", { align: "left" });
      if (after) { px(W / 2 - 26, 6, 52, 18, "rgba(18,13,29,.85)"); txt(after, W / 2, 15, 12, "#ffe680"); }   // the years after the rush: only the jar moves
    }
    // the round's name, never changing mid-pour
    txt(`${m.name} · ${m.year}`, W / 2, 188, 8, "#ab9fcb");
    // the stamp
    if (S.stamp) {
      const st = S.stamp, a = RM ? clamp(S.st / 0.2, 0, 1) : 1, sc = RM ? 1 : 1 + 0.5 * Math.max(0, 1 - S.st / 0.14);
      g.save(); g.globalAlpha = a; g.translate(W / 2, 30); g.scale(sc, sc);
      const hgt = st.sub2 ? 44 : 34;
      px(-70, -16, 140, hgt, "rgba(18,13,29,.9)"); px(-70, -16, 140, 1, st.c); px(-70, -16 + hgt - 1, 140, 1, st.c);
      txt(st.main, 0, -6, st.main.length > 10 ? 10 : 14, st.c);
      txt(st.sub, 0, 9, 8, "#f4ecff");
      if (st.sub2) txt(st.sub2, 0, 20, 8, "#8fd16a");
      g.restore();
    }
    // the round's Wren card flies up into the strip of round dots
    if (S.fly) {
      const k = clamp(S.fly.t / FLY, 0, 1), e = k * k, c = thumbs[ROUNDS[S.fly.r].kind];
      const w = lerp(60, 14, e), h = w * CAVE_H / W, x = lerp(W / 2, 14 + S.fly.r * 22, e) - w / 2, y = lerp(70, -10, e);
      px(x - 1, y - 1, w + 2, h + 2, "#ffd23f"); if (c) g.drawImage(c, x, y, w, h);
    }
  }

  /* ---------- HUD, coach, card, button ---------- */
  const thumbs = {}, icons = {};
  for (const k of ["pen", "rai", "bead", "wam", "cow", "coin", "gold"]) { thumbs[k] = caveCanvas(k, 6); icons[k] = iconCanvas(k); }
  function renderHud() {
    if (S.phase === "tut") { hud.innerHTML = `<span class="gd-tag pixel">PRACTICE · ULM HOLLOW</span><span class="gd-score pixel">NO SCORE</span>`; return; }
    hud.innerHTML = `<span class="gd-dots">${[0, 1, 2, 3, 4, 5].map((i) => `<i class="${S.got[i] ? "got" : ""}${i === Math.min(S.r, 5) ? " on" : ""}${i === 5 ? " q" : ""}" data-i="${i}">${i === 5 ? "?" : ""}</i>`).join("")}</span>
      <span class="gd-score pixel">SCORE <b>${S.score}</b></span>`;
    hud.querySelectorAll("i.got").forEach((el) => { const i = +el.dataset.i; if (i < 5) { const c = icons[ROUNDS[i].kind], cp = document.createElement("canvas"); cp.width = 16; cp.height = 16; cp.className = "px"; cp.getContext("2d").drawImage(c, 0, 0); el.appendChild(cp); } });
  }
  function say(n, html, skip = true) {
    coach.hidden = false;
    coach.innerHTML = `<p class="gd-tag pixel">PRACTICE ${n ? `${n}/2` : "✓"}</p><p class="gd-say">${html}</p>${skip ? `<button class="gd-skip" data-skip>skip practice ›</button>` : ""}`;
    const sk = coach.querySelector("[data-skip]"); if (sk) { sk.onpointerdown = (e) => e.stopPropagation(); sk.onclick = (e) => { e.stopPropagation(); endTut(); }; }
  }
  let cardTimer = 0;
  function showCard(html) {
    clearTimeout(cardTimer);
    card.innerHTML = `<div class="gd-in">${html}</div>`; card.hidden = false; card.classList.remove("out");
    S.cardAt = performance.now();
  }
  function hideCard() {
    card.classList.add("out");
    clearTimeout(cardTimer); cardTimer = setTimeout(() => { card.hidden = true; card.classList.remove("out"); }, RM ? 0 : 250);
  }
  const lbl = btn.querySelector(".gd-lbl"), sub = btn.querySelector("small");
  let btnKey = "";
  function renderBtn() {
    const now = performance.now();
    let state = "go", text = "HOLD TO POUR", small = TOUCH ? "let go on the ×2 line" : "or hold Space · let go on ×2";
    if (S.phase === "tut" && S.tut === 3) { const ok = now - S.tutAt > 900; state = ok ? "next" : "idle"; text = "START ›"; small = "the real thing"; }
    else if (S.phase === "tut" && S.tut === 0) { state = "idle"; text = "…"; small = ""; }
    else if (S.phase === "stamp" || S.phase === "fly") { state = "idle"; text = S.stamp ? S.stamp.main : "…"; small = ""; }
    else if (S.phase === "goldcard") { const ok = now - S.cardAt > 900; state = ok ? "next" : "idle"; text = "READY"; small = "gold, 1849"; }
    else if (S.phase === "gold" && !S.holding && S.year > 0) { state = "go pulse"; text = "HOLD TO KEEP DIGGING"; small = "nothing is lost while you wait"; }
    else if (S.phase === "rushover" || S.phase === "ff") { state = "idle"; text = "THE RUSH IS OVER"; small = S.phase === "ff" ? "the years after…" : ""; }
    if (S.holding && (S.phase === "pour" || S.phase === "tut" || S.phase === "gold")) state = "held";
    else if (state === "go" && ["card", "pour", "gold", "tut"].includes(S.phase)) state = "go pulse";   // waiting for a hold
    const key = state + text + small;
    if (key === btnKey) return;
    btnKey = key; btn.dataset.state = state; lbl.textContent = text; sub.textContent = small;
  }

  /* ---------- flow: start → practice → five rounds → gold → fast-forward → result → Wren card ---------- */
  function panel(html, cls = "") { ui.innerHTML = html ? `<div class="panel ${cls}">${html}</div>` : ""; }
  function startPanel() {
    S.phase = "idle"; S.v = S.dv = 1; S.stamp = null; S.parts = []; S.slide = 1;
    const seen = tutSeen();
    panel(`<h3>WREN'S LAST CAVE</h3>
      <p>Be Wren one last time.<br>Double each money from its cave.<br>Then try gold.</p>
      ${seen ? "" : `<p class="muted">A short practice comes first.</p>`}
      <div class="row">${seen ? `<button class="btn ghost" data-tut>PRACTICE</button><button class="btn" data-go>START</button>` : `<button class="btn" data-tut>PRACTICE FIRST</button>`}</div>
      ${S.best ? `<p class="muted">Best: ${S.best} / 600</p>` : ""}`);
    ui.querySelector("[data-tut]").onclick = () => { Chip.sfx("pop"); practice(); };
    const go = ui.querySelector("[data-go]"); if (go) go.onclick = () => { Chip.sfx("pop"); start(); };
  }
  function play(on) {
    game.classList.toggle("gd-run", on);
    hud.hidden = !on; btn.hidden = !on; if (!on) coach.hidden = true;
    if (PHONE) Ep02.playMode(on, { lock: false });   // the whole screen, but it stays portrait
    else if (on) game.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function reset() {
    Object.assign(S, { r: 0, v: 1, dv: 1, h: 0, holding: false, moved: false, short: false, score: 0, pts: [], tut: 0, tutRetry: 0, tutDone: 0, stamp: null, fly: null, parts: [], got: [], year: 0, yt: 0, ff: 0, ffYear: 0, jar: 8 });
    btnKey = "";
  }
  function practice() {
    reset(); panel(""); play(true);
    S.phase = "tut"; S.slide = 0; Chip.song(Chip.SONGS.gold);
    renderHud(); tutStep(1);
  }
  function tutStep(n, msg) {
    S.tut = n; S.tutAt = performance.now();
    if (n === 1) say(1, msg || "Hold the button.<br>Let go on the <b class=\"gold\">×2</b> line.");
    if (n === 2) { say(2, "Let go on the <b class=\"gold\">×2</b> line."); S.flash = 1.2; }
    if (n === 3) say(0, "Twice the pentaja.<br>Gran's jar buys <b>half</b>.<br>That was Wren's cave.<br><b class=\"gold\">Now the real thing.</b>", false);
  }
  function tutRelease() {
    const v = S.v, p = points(v);
    if (v < 1.8) { Chip.sfx("nope"); S.v = 1; tutStep(1, "Try again: keep holding<br>up to the <b class=\"gold\">×2</b> line."); return; }
    if (p === 0) { setStamp("TOO MUCH", "+0", "#ff9a7a"); Chip.sfx("thud"); S.tut = 0; S.tutRetry = 1.4; return; }
    setStamp(p === 100 ? "PERFECT!" : "CLOSE!", p === 100 ? "right on the line" : `×${v.toFixed(2)}`, p === 100 ? "#ffd23f" : "#8fd16a");
    p === 100 ? perfectChime() : tone(880, 0.3, "sine", 0.06);
    S.tut = 0; S.tutDone = 1.4;
  }
  function endTut() {
    try { localStorage.setItem(TUT_KEY, "1"); } catch {}
    coach.hidden = true; coach.innerHTML = "";
    start(true);
  }
  function start(fromTut) {
    if (!fromTut && !tutSeen()) { practice(); return; }
    reset(); panel(""); play(true);
    Chip.song(Chip.SONGS.gold);
    roundCard(0);
  }
  function roundCard(i) {
    S.r = i; S.phase = "card"; S.v = S.dv = 1; S.h = 0; S.moved = false; S.short = false; S.holding = false; S.stamp = null; S.fly = null; S.parts = []; S.slide = 0; S.pops = 0; S.lastLoaf = 8;
    const r = ROUNDS[i];
    showCard(`<p class="gd-rn pixel">ROUND ${i + 1} / 6</p><div class="gd-thumb"></div><p class="gd-name pixel">${r.name}</p><p class="gd-line">${r.year} · ${r.cave}</p>${i === 0 ? `<p class="gd-rule">Hold to pour. Let go on the <b class="gold">×2</b> line.</p>` : ""}`);
    card.querySelector(".gd-thumb").appendChild(cloneCanvas(thumbs[r.kind]));
    renderHud(); sting(r.sting);
  }
  function goldCard() {
    S.r = 5; S.phase = "goldcard"; S.v = S.dv = 1; S.year = 0; S.yt = 0; S.jar = 8; S.holding = false; S.stamp = null; S.fly = null; S.parts = []; S.slide = 0;
    showCard(`<p class="gd-rn pixel">ROUND 6 / 6</p><div class="gd-thumb"></div><p class="gd-name pixel">GOLD · 1849</p>
      <p class="gd-gold">California. Then Australia.<br>The whole world digs.<br>Same job: <b class="gold">double it</b>.<br>You get all 12 years of the rush.</p>`);
    card.querySelector(".gd-thumb").appendChild(cloneCanvas(thumbs.gold));
    renderHud(); sting([67, 71, 74]);
  }
  function cloneCanvas(c) { const d = document.createElement("canvas"); d.width = c.width; d.height = c.height; d.className = "px"; d.getContext("2d").drawImage(c, 0, 0); return d; }
  function setStamp(main, sub, c, sub2) { S.stamp = { main, sub, c, sub2 }; S.st = 0; }
  function perfectChime() { tone(880, 0.18, "sine", 0.06); setTimeout(() => tone(1320, 0.35, "sine", 0.06), 110); }
  function endRound(auto) {
    const r = ROUNDS[S.r], v = S.v, p = auto ? 0 : points(v);
    S.holding = false; S.pts[S.r] = p; S.score += p;
    const main = p === 100 ? "PERFECT" : auto || (v > 2 && p < 50) ? "TOO MUCH!" : p >= 50 ? "CLOSE!" : "TOO SOON";
    setStamp(main, `+${p}`, p === 100 ? "#ffd23f" : p >= 50 ? "#8fd16a" : "#ff9a7a", r.yap ? "YAP SPOTTED IT" : null);
    if (p === 100) perfectChime(); else if (p >= 50) tone(880, 0.3, "sine", 0.06); else Chip.sfx("thud");
    if (r.yap) setTimeout(() => tone(1568, 0.15, "sine", 0.05), 500);
    S.phase = "stamp"; renderHud();
  }
  function rushOver() {
    S.phase = "rushover"; S.holding = false; S.st = 0; S.pts[5] = 0;
    setStamp("×2 NOT REACHED", "+0", "#ab9fcb");
    wind(2.6, 0.035);
  }
  function finish() {
    play(false);
    S.phase = "result"; S.stamp = null;
    const newBest = S.score > S.best;
    if (newBest) { S.best = S.score; try { localStorage.setItem(BEST_KEY, S.best); } catch {} }
    Chip.song(Chip.SONGS.gold);
    const fill = Math.round(100 * (GY[11].v - 1));   // ×1 → ×2 = 0 → 100%
    const hit = S.pts.slice(0, 5).filter((p) => p > 0).length;
    panel(`<h3>SCORE ${S.score} / 600</h3>
      <p class="gd-runs">${S.pts.slice(0, 5).map((p) => `<span>${p}</span>`).join("")}<span class="no">—</span></p>
      <p>${hit === 5 ? "You doubled five kinds of money." : hit ? `You doubled ${hit} of 5 monies.` : "You flooded five kinds of money."}<br><b>Gold: never.</b></p>
      <div class="gd-jars"><b class="pixel">THE JAR</b> <span class="muted">(8 loaves at the start)</span>
        <div><span>Stones</span><span>8 → 7 <i>Yap spotted it</i></span></div>
        <div><span>Beads, wampum, cowries, Rome</span><span class="bad">8 → 4</span></div>
        <div><span>Gold, 1850s–70s</span><span>8 → about 6½</span></div>
        <div><span>Gold, 1890s</span><span>about 8</span></div>
        <p class="muted">Prices fell from 1873 to 1896:<br>good for savers, hard for borrowers.</p>
      </div>
      <div class="gd-bar"><span class="pixel">×1</span><span class="track"><i style="width:${fill}%"></i></span><span class="pixel gold">×2</span></div>
      <p class="gd-barl">Gold: ×${GY[11].v.toFixed(2)} in 12 years · can't be done</p>
      <p>The last 100 points can't be won.<br>Nobody has found gold's cave.</p>
      ${S.best ? `<p class="muted gd-best">best ${S.best}${newBest ? " · new best!" : ""}</p>` : ""}
      <div class="row"><button class="btn ghost" data-again>PLAY AGAIN</button><button class="btn" data-done>CONTINUE</button></div>
      <p class="muted gd-note">Real: world gold mined a year (1850s, ~200 t) and British prices. Game: the size of the world's pile in 1849, and the jars of the first five rounds.</p>`, "gd-res");
    ui.querySelector("[data-again]").onclick = () => { Chip.sfx("pop"); start(true); };
    ui.querySelector("[data-done]").onclick = () => { panel(""); S.phase = "done"; Chip.stop(); revealWren(); };
    setTimeout(() => ui.scrollIntoView({ behavior: "smooth", block: PHONE ? "start" : "center" }), 60);
  }

  /* ---------- the Wren moment and the "Wrens of history" strip ---------- */
  const WRENS = [
    { ch: "yap", href: "index.html", kind: "rai", name: "O'Keefe's ship", when: "Yap, 1871", line: "Iron tools and a ship made stones easy. The islanders priced them lower." },
    { ch: "beads", href: "beads.html", kind: "bead", name: "Venice glass", when: "West Africa, 1400s–1800s", line: "Venice made beads by the ton. Each bought less." },
    { ch: "wampum", href: "wampum.html", kind: "wam", name: "Iron drills", when: "Wampum, 1600s", line: "Iron points drilled far faster than stone." },
    { ch: "cowries", href: "cowries.html", kind: "cow", name: "Zanzibar shells", when: "Cowries, 1845–1890", line: "A silver dollar went from 2,000 shells to 20,000." },
    { ch: "rome", href: "rome.html", kind: "coin", name: "The mint", when: "Rome, AD 64–270", line: "Emperors made coins thinner: wheat ×37." },
  ];
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false; $("#gd-after").hidden = false;
    const c = $("#wren-portrait"), x = c.getContext("2d");
    Art.drawPortrait(c, "wren", 0);
    x.fillStyle = "#5a5060"; x.fillRect(15, 15, 3, 4); x.fillStyle = "#3a3440"; x.fillRect(16, 14, 1, 1);   // the lantern, off
    const strip = $("#gd-strip");
    strip.innerHTML = WRENS.map((w, i) => `<a class="gd-wc${Ep02.isDone(w.ch) ? "" : " dim"}" href="${w.href}" data-i="${i}"><span class="gd-wc-img"></span><b>${w.name}</b><small>${w.when}</small><span>${w.line}</span>${Ep02.isDone(w.ch) ? "" : `<em class="pixel">PLAY ›</em>`}</a>`).join("")
      + `<div class="gd-wc wanted"><span class="gd-wanted pixel">WANTED</span><span class="gd-frame pixel">?</span><b>Gold's Wren</b><span>Not found.</span></div>`;
    strip.querySelectorAll("a.gd-wc").forEach((a) => a.querySelector(".gd-wc-img").appendChild(cloneCanvas(thumbs[WRENS[+a.dataset.i].kind])));
    Ep02.done("gold");
    startPanel();
    requestAnimationFrame(() => $("#wren-step").scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  /* ---------- input: one button. Press and hold to pour; let go to stop ---------- */
  function press() {
    const now = performance.now();
    switch (S.phase) {
      case "tut":
        if (S.tut === 3) { if (now - S.tutAt > 900) { Chip.sfx("pop"); endTut(); } return; }
        if (S.tut === 1 || S.tut === 2) { S.holding = true; S.h = 0; S.v = 1; S.moved = false; S.short = false; S.pops = 0; S.lastLoaf = 8; }
        return;
      case "card": hideCard(); S.phase = "pour"; S.holding = true; S.h = 0; S.moved = false; S.short = false; return;
      case "pour": if (!S.moved) { S.holding = true; S.h = 0; S.short = false; } return;
      case "goldcard": if (now - S.cardAt > 900) { Chip.sfx("pop"); hideCard(); S.phase = "gold"; S.holding = false; } return;
      case "gold": S.holding = true; return;
    }
  }
  function release() {
    if (!S.holding) return;
    S.holding = false;
    if (S.phase === "gold") return;
    if (S.phase !== "pour" && S.phase !== "tut") return;
    if (!S.moved) { S.short = true; S.v = 1; return; }   // a quick tap never ends a round
    if (S.phase === "tut") return tutRelease();
    endRound(false);
  }
  btn.addEventListener("pointerdown", (e) => { e.preventDefault(); press(); });
  cv.addEventListener("pointerdown", (e) => { if (["pour", "gold", "card"].includes(S.phase) || (S.phase === "tut" && S.tut !== 3)) { e.preventDefault(); press(); } });
  card.addEventListener("pointerdown", (e) => { if (S.phase === "card" || S.phase === "goldcard") { e.preventDefault(); press(); } });
  addEventListener("pointerup", release); addEventListener("pointercancel", release);
  addEventListener("blur", release);
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  const LIVE = ["tut", "card", "pour", "goldcard", "gold", "stamp", "fly", "rushover", "ff"];
  addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    if (!LIVE.includes(S.phase)) return;
    e.preventDefault(); if (!e.repeat) press();
  });
  addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") release(); });

  /* ---------- loop ---------- */
  function spawn(m) {
    const c = m.kind === "rai" ? "#b0ac9a" : m.kind === "bead" ? BEADC[(Math.random() * 6) | 0] : m.kind === "wam" ? (Math.random() < 0.5 ? "#5b2a86" : "#f0ece0") : m.kind === "cow" ? "#f3e6c6" : m.kind === "coin" ? "#c58a5a" : m.kind === "gold" ? "#ffd23f" : "#ff6fb5";
    S.parts.push({ x: PC - 6 + Math.random() * 12, y: CAVE_H - 2, vy: 20 + Math.random() * 20, c });
  }
  function update(dt) {
    const m = money();
    S.slide = Math.min(1, S.slide + dt / 0.4);
    S.flash = Math.max(0, S.flash - dt);
    // the pour (rounds and practice): only while held; the pile moves 0.3 s after the press, then eases in
    if ((S.phase === "pour" || (S.phase === "tut" && (S.tut === 1 || S.tut === 2))) && S.holding) {
      S.h += dt; S.v = pourV(S.h, m.T); S.moved = S.h > DELAY;
      if (S.moved) { S.pourT -= dt; if (S.pourT <= 0) { S.pourT = 0.07; pourSound(m.kind, S.v); } if (Math.random() < dt * 40) spawn(m); }
      const lf = Math.ceil(loavesFor(m, S.v) - 0.001);
      if (lf < S.lastLoaf) { S.lastLoaf = lf; if (S.pops++ < 4) loafPop(); }
      if (S.phase === "tut" && S.tut === 1 && S.v >= 1.5) tutStep(2);
      if (S.v >= MAXV) { S.v = MAXV; if (S.phase === "tut") { S.holding = false; tutRelease(); } else endRound(true); }
    }
    // gold: a year passes every 0.8 s while held; letting go just pauses the rush
    if (S.phase === "gold" && S.holding) {
      S.yt += dt;
      if (Math.random() < dt * 14) spawn(m);
      if (S.yt >= YEAR_S) { S.yt -= YEAR_S; S.year++; tone(1760, 0.12, "sine", 0.035); if (S.year >= 12) { S.year = 12; S.yt = 0; rushOver(); } }
    }
    if (m.kind === "gold" && (S.phase === "gold" || S.phase === "rushover")) {
      const i = Math.min(S.year, 11), k = S.year >= 12 ? 1 : S.yt / YEAR_S, a = i ? GY[i - 1] : { v: 1, l: 8 }, b = S.year >= 12 ? GY[11] : GY[i];
      S.v = lerp(a.v, b.v, S.year >= 12 ? 1 : k); S.jar = S.year >= 12 ? GY[11].l : lerp(a.l, b.l, k);
    }
    // the drop back to ×1 after an early release in practice, shown, not jumped
    S.dv = S.v < S.dv ? Math.max(S.v, S.dv - dt * 2.5) : S.v;
    // particles
    const top = BASE - S.dv * U;
    for (const p of S.parts) { p.vy += 260 * dt; p.y += p.vy * dt; if (p.y >= top - 1) p.dead = true; }
    S.parts = S.parts.filter((p) => !p.dead);
    // stamps and their timers
    if (S.stamp) S.st += dt;
    if (S.phase === "tut" && S.tutRetry) { S.tutRetry -= dt; if (S.tutRetry <= 0) { S.tutRetry = 0; S.stamp = null; S.v = 1; tutStep(1, "Too much! Try again:<br>let go <b>on</b> the <b class=\"gold\">×2</b> line."); } }
    if (S.phase === "tut" && S.tutDone) { S.tutDone -= dt; if (S.tutDone <= 0) { S.tutDone = 0; S.stamp = null; tutStep(3); } }
    if (S.phase === "stamp" && S.st > STAMP) { S.stamp = null; S.phase = "fly"; S.fly = { r: S.r, t: RM ? FLY : 0 }; }
    if (S.phase === "fly") { S.fly.t += dt; if (S.fly.t >= FLY) { S.got[S.fly.r] = true; S.fly = null; Chip.sfx("tick"); if (S.r < 4) roundCard(S.r + 1); else goldCard(); } }
    if (S.phase === "rushover" && S.st > 2.4) { S.phase = "ff"; S.ff = 0; S.stamp = null; S.ffLabel = "1860"; }
    if (S.phase === "ff") {
      const before = S.ffYear || 1860;
      S.ff += dt;
      const yr = Math.min(1895, 1860 + (S.ff / FF_S) * 35);
      let j = 0; while (j < FF.length - 2 && yr > FF[j + 1][0]) j++;
      S.jar = lerp(FF[j][1], FF[j + 1][1], clamp((yr - FF[j][0]) / (FF[j + 1][0] - FF[j][0]), 0, 1));
      S.ffYear = yr; S.ffLabel = yr >= 1890 ? "1890s" : String(Math.floor(yr));
      if (Math.floor(yr / 10) > Math.floor(before / 10)) tone(660, 0.06, "sine", 0.04);
      if (S.ff >= FF_S + 0.9) { S.ffYear = 0; finish(); }
    }
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); draw(now); renderBtn();
    requestAnimationFrame(frame);
  }
  if (TOUCH) $("#gd-hint").innerHTML = "Hold the big button to pour. Let go on the <b>×2</b> line.";
  play(false); startPanel();
  requestAnimationFrame(frame);
  if (params.has("done")) revealWren();
  window.__gold = { S, press, release, start, practice, finish, endTut };
})();
