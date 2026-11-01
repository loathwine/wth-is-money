/* EP 02 · Chapter 3 minigame: Bead rush (design: wampum.DESIGN.md).
   Drill wampum for the winter: slowly with stone (tap in rhythm), then fast with iron. Every 2.5 s the price board is
   repainted, so beads you hold buy less and less: spend early. Grandmother's 2 saved beads shrink in front of you.
   Score = winter supplies in baskets of corn at stone-age prices; leftover beads count at the final price.
   First play: a short guided practice (one step at a time, no clock), remembered in localStorage.
   Nothing has to be read while the clock runs: explanations are cards that stop the clock until you tap. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#bead"), g = cv.getContext("2d"), ui = $("#game-ui"), buyBox = $("#wbuy"), pad = $("#wpad"), game = $("#game");
  const tip = $("#wtip"), card = $("#wcard");
  const W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  const params = new URLSearchParams(location.search);
  const SPEED = +params.get("speed") || 1;   // test hook: ?speed=4 runs the clock faster
  const TOUCH = matchMedia("(pointer: coarse)").matches, PORTRAIT = matchMedia("(orientation: portrait)");

  /* ---------- game numbers (made up, except the ×5 total: the real New Amsterdam beaver pelt, 640 → 3,200 beads) ----------
     Tuned for a first try on a phone: a slow stroke with a wide green zone, 4 good taps per stone bead (at most 4 beads),
     and 30 s of iron with a repaint every 2.5 s. Balance (sim, buying as soon as you can): 2.5 taps/s gets kettle + coat
     + ~5 corn (score ≈ 12); 3.5 taps/s ≈ 16. Waiting until the end: kettle only or nothing, score ≈ 5 to 7. */
  const STONE_T = 16, HAND_T = 2.2, IRON_T = 30, WINTER_T = 3, STEPS = 12, STEP = IRON_T / STEPS, CART_T = STEP * 6;
  const CYCLE = 1.0, ZONE = 0.55, TURNS = 4, CRACK = 4, IRON_TAPS = 3, JAR = 2, PRACTICE = 2;
  const GOODS = [
    { k: "corn", name: "CORN", base: 1, once: false, d: "a basket" },
    { k: "kettle", name: "KETTLE", base: 3, once: true, d: "copper kettle" },
    { k: "coat", name: "COAT", base: 4, once: true, d: "wool coat" },
  ];
  const level = (ti) => Math.min(5, Math.pow(4, STEP * Math.floor(ti / STEP) / IRON_T) * (ti >= CART_T ? 1.25 : 1));  // price level, ti = s into iron
  const price = (gd, P = S.P) => Math.ceil(gd.base * P - 1e-9);
  const score = () => Math.round((S.got.corn + S.got.kettle * 3 + S.got.coat * 4 + S.beads / S.P) * 10) / 10;
  const TUT_KEY = "wth-ep02-wampum-tut";
  let tutDone = false;
  try { tutDone = localStorage.getItem(TUT_KEY) === "1"; } catch {}

  const S = { phase: "intro", t: 0, bt: 0, now: 0, beads: 0, made: 0, stone: 0, turns: 0, bad: 0, lastGood: -1, taps: 0, lastTap: -9,
    got: { corn: 0, kettle: 0, coat: 0 }, P: 1, k: 0, paintAt: -9, paintRow: 0, cartAt: -9, jarAt: -9, wobble: -9, crackAt: -9, goodAt: -9,
    fx: [], best: 0, tut: -1, card: null, cardAt: -9, msg: null, paid: {} };
  try { S.best = +localStorage.getItem("wth-ep02-wampum-best") || 0; } catch {}

  /* ---------- music: the chapter's D-dorian theme; the iron version doubles the notes and speeds up on every repaint ---------- */
  const _ = null, CH = [62, 60, 57, 62];
  const SLOW = [[81, _, _, _, 84, _, _, _], [_, _, 79, _, 77, _, _, _], [74, _, _, 77, 79, _, _, _], [81, _, _, _, _, _, _, _]];
  const FAST = [[81, 84, 81, 79, 84, 86, 84, 81], [79, 81, 79, 77, 76, 77, 79, _], [74, 77, 79, 81, 79, 77, 79, 81], [81, 84, 86, 84, 81, 79, 81, _]];
  Chip.SONGS.wampum = { bpm: 92, style: "island", chords: CH, melody: SLOW };
  const rot = (a, k) => a.slice(k % a.length).concat(a.slice(0, k % a.length));
  const ironSong = (k) => ({ bpm: Math.round(104 * Math.pow(1.02, k)), style: "island", chords: rot(CH, k), melody: rot(FAST, k) });
  const sfx = (n) => { try { Chip.sfx(n); } catch {} };

  /* ---------- drawing kit (pixels in the 320×180 canvas) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); };
  function txt(s, x, y, size, c, align = "left") {
    g.font = `${size}px Silkscreen`; g.textAlign = align; g.textBaseline = "alphabetic";
    g.fillStyle = "rgba(0,0,0,.6)"; g.fillText(s, Math.round(x) + 1, Math.round(y) + 1); g.fillStyle = c; g.fillText(s, Math.round(x), Math.round(y));
  }
  const WH = "#f3efe2", WH2 = "#c9c1ab", PU = "#6a2c7a", PU2 = "#a46cc0", GR = "#8d8a84", GR2 = "#6a6862", SKIN = "#a0643e", DEER2 = "#7f5a35";
  function bead(x, y, kind) { const [a, b] = kind === "p" ? [PU, PU2] : kind === "g" ? [GR2, GR] : [WH2, WH]; px(x, y, 3, 2, a); px(x, y, 3, 1, b); }
  function heap(cx, base, h, w, grey = 0, seed = 0) {
    for (let y = 0; y < h; y += 2) {
      const hw = Math.round(w / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(y / h, 2))));
      for (let x = -hw; x < hw; x += 3) { const r = hash(x * 7 + y * 131 + seed); bead(cx + x + (y % 4 ? 1 : 0), base - y - 2, r < grey ? "g" : r < grey + 0.25 ? "p" : "w"); }
    }
  }
  function kettle(x, y) { px(x - 1, y + 2, 14, 2, "#e89a5a"); px(x, y + 4, 12, 6, "#b8652a"); px(x + 1, y + 10, 10, 1, "#8a4a1e"); px(x + 2, y + 5, 2, 3, "#f0b07a"); px(x + 2, y - 1, 8, 1, "#3a3a44"); px(x + 2, y - 1, 1, 3, "#3a3a44"); px(x + 9, y - 1, 1, 3, "#3a3a44"); px(x + 12, y + 5, 3, 1, "#b8652a"); }
  function coat(x, y) { px(x + 1, y, 10, 3, "#2e4f9a"); px(x + 2, y + 3, 8, 9, "#2e4f9a"); px(x - 1, y + 2, 2, 8, "#2e4f9a"); px(x + 11, y + 2, 2, 8, "#2e4f9a"); px(x + 5, y, 2, 6, "#1a2a5a"); px(x + 2, y + 11, 8, 1, "#c0392b"); px(x + 3, y + 3, 1, 6, "#4a6fc0"); }
  function corn(x, y) { px(x, y + 2, 8, 5, "#b8862e"); px(x, y + 2, 8, 1, "#d9a84a"); px(x + 1, y, 2, 3, "#ffd23f"); px(x + 4, y - 1, 2, 4, "#ffd23f"); px(x + 3, y, 1, 2, "#5fbf4a"); px(x + 6, y, 1, 2, "#5fbf4a"); }
  const ICON = { corn, kettle, coat };
  function wetu(x, base, w = 20, h = 11) {
    for (let i = 0; i < h; i++) { const hw = Math.round(Math.sqrt(1 - Math.pow(1 - i / h, 2)) * w / 2); px(x - hw, base - i, hw * 2, 1, i % 3 ? "#7a6a52" : "#665741"); }
    px(x - 2, base - 5, 4, 5, "#1e150d");
  }
  // the pump drill: bar = 0 (top) … 1 (bottom)
  function drill(cx, top, L, bar, o = {}) {
    const by = top + 10 + (L * 0.5) * bar, fw = top + L * 0.74, hw = 24;
    px(cx - 1, top, 3, L, "#9a6a36");
    if (o.spin && Math.floor(S.now * 20) % 2) px(cx, top + 6, 1, L - 12, "#6e4a24");
    line(cx - hw + 1, by, cx, top + 1, "#d8c8a0"); line(cx + hw, by, cx + 1, top + 1, "#d8c8a0");
    px(cx - hw, by, hw * 2 + 1, 4, "#7a4a22"); px(cx - hw, by, hw * 2 + 1, 1, "#a0703a");
    disc(cx, fw, 10, "#8c8471"); disc(cx, fw, 8, "#a39a84");
    px(cx + Math.round(Math.cos(S.now * (o.iron ? 30 : 6)) * 6), fw + Math.round(Math.sin(S.now * (o.iron ? 30 : 6)) * 2), 2, 2, "#5c5546");
    px(cx - 1, top + L, 3, 6, o.iron ? "#5d6577" : "#9c937f"); if (o.iron) px(cx, top + L + 1, 1, 3, "#c9d3e6");
    px(cx - 9, top + L + 6, 19, 5, "#6e4a24"); px(cx - 6, top + L + 4, 13, 3, o.crack ? "#5a5550" : WH);
    if (o.crack) line(cx - 4, top + L + 4, cx + 3, top + L + 6, "#1a1010");
    // hands on the crossbar
    px(cx - hw - 3, by - 1, 5, 6, SKIN); px(cx + hw - 1, by - 1, 5, 6, SKIN); px(cx - hw - 9, by + 2, 7, 4, DEER2); px(cx + hw + 4, by + 2, 7, 4, DEER2);
  }
  function person(x, feet, cloth, o = {}) {
    px(x - 2, feet - 4, 1, 4, "#3b2615"); px(x + 1, feet - 4, 1, 4, "#3b2615"); px(x - 2, feet - 11, 4, 7, cloth);
    px(x - 2, feet - 15, 4, 4, o.skin || "#e8b38c"); px(x - 2, feet - 16, 4, 1, o.hair || "#5a3a22"); px(x - 1, feet - 14, 1, 1, "#1a1010");
    if (o.brush) { const a = Math.sin(S.now * 18) * 2; px(x - 5, feet - 11 + a, 3, 1, cloth); px(x - 8, feet - 12 + a, 3, 2, "#8a5a2b"); px(x - 9, feet - 12 + a, 1, 2, o.brush); }
  }


  /* ---------- the scene ---------- */
  const inPlay = () => S.phase === "tut" || S.phase === "stone" || S.phase === "hand" || S.phase === "iron";
  const stoneLike = () => S.phase === "tut" || S.phase === "stone";
  const barPos = (t) => 0.5 - 0.5 * Math.cos(2 * Math.PI * CYCLE * t);
  function draw() {
    const t = S.now, ph = S.phase, ironT = ph === "iron" ? S.t : ph === "winter" || ph === "result" || ph === "done" ? IRON_T : -1;
    const shake = t - S.cartAt < 0.4 && !matchMedia("(prefers-reduced-motion: reduce)").matches ? Math.round(Math.sin(t * 80) * 2) : 0;
    g.save(); g.translate(shake, 0);
    // sky, sea, ground; winter greys it all
    const wint = ph === "winter" ? Math.min(1, S.t / 1.5) : ph === "result" || ph === "done" ? 1 : 0;
    px(0, 0, W, 34, wint ? "#9aa4b0" : "#8fb8d0"); px(0, 34, W, 24, wint ? "#b6bec8" : "#b9d3df");
    px(0, 58, W, 8, "#4f7f96"); px(0, 66, W, H - 66, wint ? "#9aa09a" : "#6f7a5c");
    for (let i = 0; i < 50; i++) px(hash(i + 7) * W, 70 + hash(i + 17) * 110, 3, 1, wint ? "#c8ccd0" : "#5f6a4e");
    // the village behind: wetus, neighbours drilling, the town's pile of beads
    wetu(246, 66); wetu(300, 66); wetu(212, 66, 16, 9);
    const pileH = ironT < 0 ? 3 : 3 + Math.min(IRON_T, ironT) * 0.36 + (ironT >= CART_T ? 6 : 0);
    heap(274, 66, pileH, 18 + pileH * 1.6, ironT >= CART_T ? 0.35 : 0, 3);
    if (ironT >= 0 && ph !== "result" && ph !== "done") for (const nx of [234, 256, 314]) { const b = barPos((ph === "iron" && !S.card ? t * 3.5 : t * 0.8) + nx); px(nx - 3, 58 + b * 4, 7, 1, "#7a4a22"); px(nx, 56, 1, 10, "#9a6a36"); }
    // the fake-bead cart (iron, half way)
    const ck = (t - S.cartAt) / 1.6;
    if (ck > 0 && ck < 1.6) {
      const cx = ck < 0.5 ? 330 - ck * 2 * 40 : 290, tip = Math.min(1, Math.max(0, (ck - 0.5) * 2));
      g.save(); g.translate(cx, 62); g.rotate(-tip * 0.5); px(-10, -8, 20, 8, "#7a4a22"); if (tip < 1) heap(0, -7, 5 * (1 - tip), 16, 0.8, 9); g.restore();
      disc(cx, 64, 3, "#3b2615");
      if (tip > 0 && tip < 1) for (let i = 0; i < 10; i++) bead(cx - 12 - ((t * 3 + hash(i)) % 1) * 12, 56 + ((t * 3 + hash(i)) % 1) * 8, "g");
    }
    // bench + drill
    px(0, 152, 116, 28, "#8a5a2b"); px(0, 152, 116, 2, "#a8743c");
    const bar = stoneLike() ? barPos(S.bt) : ph === "iron" ? (S.card ? 0.2 : barPos(t * 3.2)) : ph === "hand" ? 0.2 : 0;
    const iron = ph === "iron" || ph === "winter" || ph === "result" || ph === "done" || (ph === "hand" && S.t > 1.2);
    const wob = t - S.wobble < 0.2 ? Math.round(Math.sin(t * 90)) : 0;
    drill(62 + wob, 34, 104, bar, { iron, spin: stoneLike() || (ph === "iron" && !S.card), crack: t - S.crackAt < 0.8 });
    // the hand-over: a hand brings the iron point
    if (ph === "hand" && S.t < 1.4) { const u = Math.min(1, S.t / 1.1), hx = 130 - u * 66, hy = 120 + u * 20; px(hx, hy, 8, 2, "#5d6577"); px(hx + 1, hy, 2, 1, "#c9d3e6"); px(hx + 6, hy - 2, 6, 6, SKIN); px(hx + 12, hy - 1, 40, 4, DEER2); }
    // the bead dish
    px(84, 162, 28, 3, "#7a4a22");
    for (let i = 0; i < Math.min(S.beads, 40); i++) bead(86 + (i % 8) * 3, 159 - Math.floor(i / 8) * 2, i % 5 === 4 ? "p" : "w");
    // stone-phase rhythm gauge: the green zone is the bottom of each stroke
    if (stoneLike()) {
      px(10, 44, 12, 60, "#120d1d"); px(11, 45 + 58 * ZONE, 10, 58 * (1 - ZONE), t - S.wobble < 0.25 ? "#ff5a5a" : t - S.goodAt < 0.25 ? "#b6ff9a" : "#5fbf4a");
      px(8, 44 + 58 * bar, 16, 3, "#ffd23f");
      txt("PUSH", 16, 116, 8, "#f4ecff", "center");
      for (let i = 0; i < TURNS; i++) px(36 + i * 12, 171, 10, 5, i < S.turns ? "#ffd23f" : "#3a2d5c");
    }
    if (ph === "iron") for (let i = 0; i < IRON_TAPS; i++) px(42 + i * 12, 171, 10, 5, i < S.taps % IRON_TAPS ? "#ffd23f" : "#3a2d5c");
    // the price board
    px(118, 16, 106, 62, "#5e3b1a"); px(121, 19, 100, 56, "#e9dcb8");
    txt("PRICE IN BEADS", 171, 28, 8, "#5e3b1a", "center");
    GOODS.forEach((gd, i) => {
      const y = 33 + i * 14, fresh = t - S.paintAt < 0.9;
      if (fresh) px(196, y, 24, 12, "#ffe680");
      ICON[gd.k](125, y);
      txt(gd.name, 140, y + 9, 8, "#2a1a10");
      txt(String(price(gd)), 216, y + 10, 16, fresh ? "#c0392b" : "#2a1a10", "right");
    });
    if (t - S.paintAt < 0.9) person(232, 92, "#6a5a3a", { brush: "#c0392b" });
    // your beads + what you've bought
    txt("YOUR BEADS", 122, 92, 8, "#f4ecff"); txt(String(S.beads), 222, 98, 16, "#ffd23f", "right");
    px(118, 104, 106, 46, "rgba(18,13,29,.55)");
    txt("YOUR HUT", 122, 113, 8, "#a99cc8");
    if (S.got.kettle) kettle(124, 120); else { px(124, 121, 13, 10, "rgba(255,255,255,.12)"); txt("?", 130, 130, 8, "#6c5f93", "center"); }
    if (S.got.coat) coat(144, 119); else { px(143, 119, 14, 12, "rgba(255,255,255,.12)"); txt("?", 150, 130, 8, "#6c5f93", "center"); }
    for (let i = 0; i < Math.min(S.got.corn, 12); i++) corn(164 + (i % 6) * 9, 118 + Math.floor(i / 6) * 9);
    if (S.got.corn > 12) txt("+" + (S.got.corn - 12), 220, 146, 8, "#ffd23f", "right");
    // Grandmother's jar: 2 beads, never spent; what they buy drains away (the number is big enough to read on a phone)
    const jv = JAR / S.P, red = jv < 1;
    px(232, 96, 86, 78, "rgba(18,13,29,.6)");
    txt("GRANDMA'S", 275, 106, 8, "#f4ecff", "center"); txt("SAVINGS", 275, 115, 8, "#f4ecff", "center");
    px(263, 120, 24, 3, "#7a4a22"); px(261, 123, 28, 20, "#a8693a"); px(263, 143, 24, 2, "#7a4a22"); px(265, 126, 3, 12, "#c98a55");
    bead(270, 132, "w"); bead(276, 133, "p");
    const flash = t - S.jarAt < 1.2 && Math.floor(t * 8) % 2;
    txt("2 BEADS =", 275, 155, 8, "#a99cc8", "center");
    corn(240, 161); txt(jv.toFixed(1), 288, 171, 16, flash ? "#ffffff" : red ? "#ff5a5a" : "#ffd23f", "right"); txt("CORN", 291, 170, 8, "#a99cc8");
    // Wren's cameo at the fake-bead cart (stays while the cart card is up)
    if (t - S.cartAt > 0.4 && (t - S.cartAt < 2.4 || S.card === "cart") && window.Art) {
      Art.drawAlien(g, 306, 64, "wren", t);
      px(226, 30, 92, 12, "#fff8e8"); px(300, 42, 4, 3, "#fff8e8"); txt("THAT'S MY MOVE!", 272, 39, 8, "#1a1026", "center");
    }
    // top bar: the season running out
    const ALL = STONE_T + HAND_T + IRON_T;
    const prog = ph === "stone" ? S.t / ALL : ph === "hand" ? (STONE_T + S.t) / ALL : ph === "iron" ? (STONE_T + HAND_T + S.t) / ALL : ph === "intro" || ph === "tut" ? 0 : 1;
    px(118, 5, 150, 4, "#120d1d"); px(118, 5, 150 * prog, 4, ph === "iron" ? "#c9d3e6" : "#ffd23f");
    txt(ph === "tut" ? "PRACTICE" : ph === "iron" || iron ? "IRON DRILL" : "STONE DRILL", 4, 11, 8, iron ? "#c9d3e6" : "#f4ecff");
    txt("WINTER", 272, 11, 8, "#cfe6ff");
    // snow
    if (wint > 0) for (let i = 0; i < 80 * wint; i++) px((hash(i) * W + Math.sin(t + i) * 6) % W, (hash(i + 40) * H + t * 22 * (1 + hash(i))) % H, 1, 1, "#ffffff");
    // floating texts
    S.fx = S.fx.filter((f) => t - f.t0 < 1.1);
    for (const f of S.fx) txt(f.s, f.x, f.y - (t - f.t0) * 14, f.size || 8, f.c || "#ffd23f", "center");
    g.restore();
    // the only banner: winter, after the clock has stopped (nothing has to be read while it runs)
    if (ph === "winter") { g.fillStyle = "rgba(14,10,24,.85)"; g.fillRect(0, 80, W, 22); txt("WINTER", W / 2, 97, 16, "#ffd23f", "center"); }
  }
  const pop = (s, x, y, c, size) => S.fx.push({ s, x, y, c, size, t0: S.now });
  // a short, big message on the drill pad (phones) and in the tip line (desktop): 1-3 words, never needed to play
  const say = (s, c = "gold") => { S.msg = { s, c, t0: S.now }; };

  /* ---------- actions ---------- */
  function drillTap() {
    if (S.card) return;
    const now = S.now;
    if (stoneLike()) {
      const b = barPos(S.bt), idx = Math.floor(S.bt * CYCLE);
      if (b >= ZONE) {
        if (idx === S.lastGood) return;   // a second tap in the same stroke is ignored, not punished
        S.lastGood = idx; S.bad = 0; S.turns++; S.goodAt = now; sfx("pop");
        if (S.tut === 0) tutStep(1);
        if (S.turns >= TURNS) {
          S.turns = 0; S.beads++; S.made++; if (S.phase === "stone") S.stone++;
          sfx("chime"); pop("+1 BEAD", 62, 150, "#ffd23f", 16); say("+1 BEAD!");
          if (S.tut === 1) tutStep(2);
        } else say("GOOD!", "leaf");
      } else {
        S.bad++; S.wobble = now; sfx("thud"); say("WAIT FOR GREEN", "bad");
        if (S.bad >= CRACK) { S.bad = 0; S.turns = 0; S.crackAt = now; sfx("sad"); pop("CRACKED!", 62, 150, "#ff5a5a"); say("CRACKED! START AGAIN", "bad"); }
      }
    } else if (S.phase === "iron") {
      if (now - S.lastTap < 0.06) return;
      S.lastTap = now; S.taps++;
      if (S.taps % IRON_TAPS === 0) { S.beads++; S.made++; sfx("pop"); pop("+1", 62 + (Math.random() - 0.5) * 30, 150, "#ffd23f"); }
    }
  }
  function nudge(b, s) { sfx("thud"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); say(s, "bad"); }
  function buy(i) {
    if (!inPlay() || S.card) return;
    const gd = GOODS[i], b = buyBox.children[i];
    if (S.tut >= 0 && S.tut < 2) return nudge(b, "MAKE A BEAD FIRST");
    if (S.tut === 2 && gd.k !== "kettle") return nudge(b, "TAP KETTLE");
    if (gd.once && S.got[gd.k]) return;
    const p = price(gd);
    if (S.beads < p) { nudge(b, `NEED ${p} BEADS`); pop(`NEED ${p}`, 171, 86, "#ff5a5a"); return; }
    S.beads -= p; S.got[gd.k]++; if (gd.once) S.paid[gd.k] = p; sfx("chime"); pop(`${gd.name}!`, 171, 146, "#8fd16a"); say(`${gd.name}!`, "leaf");
    if (!gd.once && !(S.got.kettle && S.got.coat)) say(S.got.kettle ? "SAVE FOR THE COAT!" : "SAVE FOR THE KETTLE!", "bad");   // the corn trap
    if (S.tut === 2 && gd.k === "kettle") tutStep(3);
  }
  function repaint(k, ti) {
    S.k = k; S.P = level(ti); S.paintAt = S.now; sfx("clink");
    buyBox.querySelectorAll(".buy").forEach((b) => { b.classList.remove("up"); void b.offsetWidth; b.classList.add("up"); });
    if (S.phase === "iron") { Chip.song(ironSong(k)); say("PRICES UP!", "bad"); }
    if (JAR / S.P < 1 && S.jarAt < 0) S.jarAt = S.now;
  }

  /* ---------- buy buttons ---------- */
  buyBox.innerHTML = GOODS.map((gd, i) => `<button class="buy" data-i="${i}" type="button"><span class="k">${i + 1}</span><span class="n">${gd.name}</span><span class="p"></span>${gd.once ? "" : '<span class="s">buy last</span>'}</button>`).join("");
  buyBox.querySelectorAll(".buy").forEach((b) => { b.addEventListener("click", () => buy(+b.dataset.i)); b.addEventListener("animationend", (e) => { if (e.animationName === "w-shake") b.classList.remove("shake"); }); });
  let lastBtn = "";
  function syncButtons() {
    const both = S.got.kettle && S.got.coat;
    const key = [S.phase, S.beads, S.P, S.got.kettle, S.got.coat, S.card, S.tut].join();
    if (key === lastBtn) return; lastBtn = key;
    GOODS.forEach((gd, i) => {
      const b = buyBox.children[i], p = price(gd), have = gd.once && S.got[gd.k];
      b.querySelector(".p").textContent = have ? "✓ GOT IT" : `${p} bead${p > 1 ? "s" : ""}`;
      b.classList.toggle("can", !have && S.beads >= p && inPlay() && !S.card && S.tut !== 0 && S.tut !== 1 && !(S.tut === 2 && gd.k !== "kettle") && (gd.once || both));   // corn pulses only once the goal is bought
      b.classList.toggle("got", !!have);
      b.classList.toggle("hint", S.tut === 2 && gd.k === "kettle");
      b.classList.toggle("later", !gd.once && !both);
      b.disabled = !inPlay() || !!have || !!S.card;
    });
  }

  /* ---------- the drill pad (portrait phones): a big rhythm gauge, your beads, one short message ---------- */
  pad.innerHTML = `<span class="pg" aria-hidden="true"><span class="pz"></span><span class="pm"></span></span>
    <span class="pc"><b class="pn">0</b><span class="pl">YOUR BEADS</span><span class="pp"></span><span class="pmsg"></span><span class="pj"></span></span>`;
  const P$ = (s) => pad.querySelector(s);
  const padEl = { g: P$(".pg"), z: P$(".pz"), m: P$(".pm"), n: P$(".pn"), p: P$(".pp"), msg: P$(".pmsg"), j: P$(".pj") };
  let lastPad = "";
  function syncPad() {
    if (pad.hidden) return;
    const st = stoneLike(), bar = st ? barPos(S.bt) : 0;
    padEl.g.hidden = !st;
    if (st) {
      padEl.m.style.top = `calc(${(bar * 100).toFixed(1)}% - 4px)`;
      padEl.z.className = "pz" + (S.now - S.wobble < 0.25 ? " bad" : S.now - S.goodAt < 0.25 ? " ok" : "");
    }
    const m = S.msg && S.now - S.msg.t0 < 1.2 ? S.msg : null;
    const n = st ? TURNS : S.phase === "iron" ? IRON_TAPS : 0, f = st ? S.turns : S.taps % IRON_TAPS;
    const jar = S.phase === "iron" || S.phase === "winter" ? `GRANDMA'S 2 BEADS = ${(JAR / S.P).toFixed(1)} CORN` : "";
    const key = [S.beads, n, f, m && m.s, m && m.c, jar].join("|");
    if (key === lastPad) return; lastPad = key;
    padEl.n.textContent = S.beads;
    padEl.p.innerHTML = n ? Array.from({ length: n }, (_, i) => `<i class="${i < f ? "on" : ""}"></i>`).join("") + `<em>${st ? "= 1 BEAD" : "TAPS = 1 BEAD"}</em>` : "";
    padEl.msg.textContent = m ? m.s : "";
    padEl.msg.className = "pmsg " + (m ? m.c : "");
    padEl.j.textContent = jar;
    padEl.j.classList.toggle("bad", JAR / S.P < 1);
  }

  /* ---------- the tip line (one short instruction) and cards (the clock stops until you tap) ---------- */
  function tipText() {
    const ph = S.phase, DRILL = PHONE && PORTRAIT.matches ? "Tap the pad" : TOUCH ? "Tap the picture" : "Click or press Space";
    if (S.card || !inPlay()) return "";
    if (ph === "tut") return [
      `${DRILL} when the yellow bar is in the <b class="leaf">green</b>.`,
      `Good! ${TURNS} green taps = 1 bead. Keep going.`,
      `${PRACTICE} free practice beads. Now buy the <b>KETTLE</b> ${TOUCH ? "⬆" : "(or press 2)"}`,
    ][S.tut] || "";
    if (ph === "stone") return `${DRILL} in the <b class="leaf">green</b>.`;
    if (ph === "hand") return "<b>Iron!</b> A neighbour brings an iron drill point.";
    if (ph === "iron") return S.got.kettle && S.got.coat ? "Tap fast! Extra beads: corn." : "Tap fast! Get the <b>kettle</b> and <b>coat</b>.";
    return "";
  }
  let lastTip = null;
  function syncTip() {
    const s = tipText();
    if (s === lastTip) return; lastTip = s;
    tip.innerHTML = s ? `<span>${s}</span>` : ""; tip.classList.toggle("on", !!s);
    tip.classList.toggle("timed", S.phase === "stone" || S.phase === "iron");   // phones held sideways hide it while the clock runs (it would cover the jar)
  }
  function showCard(id, html, btn, go) {
    S.card = id; S.cardAt = S.now; keyHeld = 0;
    card.innerHTML = `<div class="wc">${html}<button class="btn" type="button" data-go disabled>${btn}</button></div>`;
    card.hidden = false;
    const b = card.querySelector("[data-go]");
    setTimeout(() => { b.disabled = false; }, 800);   // a thumb still mashing the drill can't skip it by accident
    b.onclick = () => { if (b.disabled) return; card.hidden = true; card.innerHTML = ""; S.card = null; sfx("pop"); go(); };
  }
  function closeCardByKey() { const b = card.querySelector("[data-go]"); if (b && !b.disabled) b.click(); }

  /* ---------- flow ---------- */
  const PHONE = Ep02.PHONE;
  function playMode(on) {   // phones: the game fills the screen in either orientation (no forced rotation)
    if (!PHONE) return;
    document.body.classList.toggle("wplay", on);
    try {
      if (on && game.requestFullscreen && !document.fullscreenElement) game.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {}
  }
  function panel(html, below) { ui.classList.toggle("below", !!below); ui.innerHTML = html ? `<div class="panel wpanel">${html}</div>` : ""; }
  function intro() {
    S.phase = "intro";
    panel(`<h3>BEAD RUSH</h3>
      <p>Winter is coming. Drill wampum beads, then buy a <b>kettle</b> and a <b>coat</b>.</p>
      <p class="muted">${tutDone ? "First a stone drill, then iron." : "A short practice comes first."}</p>
      <div class="row">${tutDone ? '<button class="btn ghost" data-tut>PRACTICE</button>' : ""}<button class="btn" data-go>${tutDone ? "START" : "PRACTICE FIRST"}</button></div>
      ${S.best ? `<p class="muted">Best: ${S.best} baskets of supplies</p>` : ""}`);
    ui.querySelector("[data-go]").onclick = () => (tutDone ? start() : practice());
    const t = ui.querySelector("[data-tut]"); if (t) t.onclick = practice;
  }
  function reset(phase) {
    Object.assign(S, { phase, t: 0, bt: 0, beads: 0, made: 0, stone: 0, turns: 0, bad: 0, lastGood: -1, taps: 0, got: { corn: 0, kettle: 0, coat: 0 },
      P: 1, k: 0, paintAt: -9, cartAt: -9, jarAt: -9, crackAt: -9, goodAt: -9, wobble: -9, fx: [], tut: -1, card: null, msg: null, paid: {} });
    card.hidden = true; card.innerHTML = "";
    panel(""); buyBox.hidden = false; pad.hidden = !PHONE; lastBtn = ""; lastPad = ""; lastTip = null;
    playMode(true);
  }
  // the guided practice: one step at a time, no clock; each step waits for the player to do it once
  function practice() {
    reset("tut"); S.tut = 0;
    sfx("pop"); Chip.song(Chip.SONGS.wampum);
  }
  function tutStep(n) {
    S.tut = n;
    if (n === 2) { S.beads += PRACTICE; say(`+${PRACTICE} PRACTICE BEADS`); }
    if (n === 3) {
      tutDone = true; try { localStorage.setItem(TUT_KEY, "1"); } catch {}
      showCard("ready", `<h3>READY?</h3>
        <p>Buy the <b>kettle</b> and the <b>coat</b> first. Corn is extra.</p>
        <p>Winter comes when the bar at the top is full.</p>`, "START", start);
    }
  }
  function start() {
    reset("stone");
    sfx("pop"); Chip.song(Chip.SONGS.wampum);
    if (params.get("phase") === "iron") { S.phase = "hand"; S.t = HAND_T; S.beads = 2; S.made = S.stone = 2; }
  }
  function ironCard() {
    showCard("iron", `<h3>IRON DRILL!</h3>
      <p>Now <b>${IRON_TAPS} fast taps = 1 bead</b>.</p>
      <p class="muted">Every neighbour got iron too. Watch the prices.</p>`, "GO", () => { S.phase = "iron"; S.t = 0; S.k = 0; Chip.song(ironSong(0)); });
  }
  function update(dt) {
    S.now += dt;
    if (S.card) return;   // a card is up: the clock waits
    if (stoneLike()) S.bt += dt;
    if (S.phase === "stone") { S.t += dt; if (S.t >= STONE_T) { S.phase = "hand"; S.t = 0; sfx("clink"); say("IRON!"); } }
    else if (S.phase === "hand") { S.t += dt; if (S.t >= HAND_T) { S.t = HAND_T; ironCard(); } }
    else if (S.phase === "iron") {
      S.t += dt;
      const k = Math.floor(S.t / STEP);
      if (k > S.k && S.t < IRON_T) repaint(k, S.t);
      if (S.t >= CART_T && S.cartAt < 0) {
        S.cartAt = S.now; sfx("splash");
        showCard("cart", `<h3>A CART OF BEADS!</h3>
          <p>Rough and fake beads pour into the village.</p>
          <p>More beads everywhere, so <b class="bad">prices jump</b>.</p>`, "KEEP DRILLING", () => {});
        return;
      }
      if (S.t >= IRON_T) { repaint(STEPS, IRON_T); S.phase = "winter"; S.t = 0; say("WINTER"); Chip.song(Chip.SONGS.mystery); }
    } else if (S.phase === "winter") { S.t += dt; if (S.t >= WINTER_T) finish(); }
    if (keyHeld && S.phase === "iron" && S.now - keyHeld > 0.2) { keyHeld = S.now; drillTap(); }   // holding Space drills slowly; mashing is faster
  }
  function finish() {
    S.phase = "result"; playMode(false); buyBox.hidden = true; pad.hidden = true; keyHeld = 0;   // hide the buttons: they would stretch beside the tall result panel
    const sc = score(), warm = S.got.kettle && S.got.coat, ratio = S.stone ? Math.round(S.made / S.stone) : 0, real = S.stone ? Math.round(sc / S.stone * 10) / 10 : 0;
    const waited = !S.got.coat || S.paid.coat > 6 || S.beads >= 10;   // held beads while prices climbed (coat bought after ~10 s of iron, or 10+ beads left)
    const stars = (S.got.kettle ? 1 : 0) + (S.got.coat ? 1 : 0) + (sc >= 15 ? 1 : 0);
    const isBest = sc > S.best; if (isBest) { S.best = sc; try { localStorage.setItem("wth-ep02-wampum-best", sc); } catch {} }
    sfx(warm ? "chime" : "sad");
    panel(`<h3>${warm ? "WARM THIS WINTER" : "A COLD WINTER"} <span class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</span></h3>
      <p class="big">You drilled <b>${S.made}</b> beads. They bought what <b>${Math.round(sc)}</b> baskets of corn used to buy.</p>
      ${ratio ? `<p class="long">That's ${ratio}× the beads you made with stone, but only ${real}× the stuff.</p>` : ""}
      <p class="short">With stone, 1 bead = 1 basket of corn. By winter: <b class="bad">1 bead = 0.2</b>.</p>
      <div class="versus long">
        <div><b class="gold">STONE DAYS</b>1 bead = 1 basket of corn<div class="bar"><span class="fill" style="width:100%"></span></div></div>
        <div><b class="muted">END OF WINTER</b>1 bead = 0.2 basket<div class="bar"><span class="fill" style="width:20%;background:var(--bad)"></span></div></div>
      </div>
      <p>${S.got.coat ? `Your coat cost <b class="${S.paid.coat > 6 ? "bad" : "gold"}">${S.paid.coat} beads</b>.` : "You got no coat."} Before iron it cost 4. By winter: <b class="bad">20</b>.</p>
      <p><b>Grandmother's 2 beads:</b> 2 baskets of corn → <b class="bad">0.4</b>. She did nothing wrong.</p>
      <p class="gold"><b>${waited ? "You held on to your beads, and every few seconds they bought less." : "You spent your beads fast, before prices rose."} Spending fast beat saving. That's what inflation does.</b></p>
      <p class="real">Real: in New Amsterdam a beaver pelt went from about <b>640 beads (1641) to 3,200 (1662)</b>. The same 5× rise, squeezed into ${IRON_T} seconds. In real life: like a €2 coffee costing €10.</p>
      <p class="tiny">Game prices and drill speeds are made up. Score: corn, kettle (3) and coat (4) at stone-age prices, plus leftover beads at the final price. ${isBest ? "New best!" : `Best: ${S.best}`}</p>
      <div class="row"><button class="btn ghost" data-again>PLAY AGAIN</button><button class="btn" data-done>CONTINUE</button></div>`, true);
    ui.querySelector("[data-again]").onclick = () => { sfx("pop"); start(); };
    ui.querySelector("[data-done]").onclick = () => { panel(""); S.phase = "done"; revealWren(); };
    setTimeout(() => ui.scrollIntoView({ block: PHONE ? "start" : "nearest", behavior: "smooth" }), 60);
  }
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false;
    if (window.Art) Art.drawPortrait($("#wren-portrait"), "wren", 0);
    const n = Ep02.next();
    if (n) $("#wren-next").innerHTML = `<a href="${n.href}">Next: cowries, the money that got too heavy to carry →</a>`;
    $("#wren-card").scrollIntoView({ behavior: "smooth", block: "center" });
    Ep02.done("wampum"); Chip.stop();
  }

  /* ---------- input ---------- */
  let keyHeld = 0;
  const onTap = (e) => { e.preventDefault(); if (S.phase === "intro") return tutDone ? start() : practice(); drillTap(); };
  cv.addEventListener("pointerdown", onTap);
  pad.addEventListener("pointerdown", onTap);
  pad.addEventListener("click", (e) => e.preventDefault());
  addEventListener("keydown", (e) => {
    const k = e.key;
    if (S.card) { if (k === "Enter") { e.preventDefault(); closeCardByKey(); } else if (k === " " || k === "Spacebar") e.preventDefault(); return; }   // Space mashers can't skip a card
    if (k === " " || k === "Spacebar") {
      if (S.phase === "intro") { const r = game.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); tutDone ? start() : practice(); } return; }
      if (!inPlay()) return;
      e.preventDefault();
      if (!e.repeat) { drillTap(); keyHeld = S.now; }
    }
    if (inPlay() && ["1", "2", "3"].includes(k)) buy(+k - 1);
  });
  addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Spacebar") keyHeld = 0; });
  if (TOUCH) $("#drill-hint").textContent = "Tap the pad to drill.";

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) * SPEED; last = now;
    update(dt); syncButtons(); syncPad(); syncTip(); draw();
    requestAnimationFrame(frame);
  }
  buyBox.hidden = PHONE;
  document.fonts.load("8px Silkscreen").finally(() => {
    intro();
    if (params.get("phase") === "result") { start(); Object.assign(S, { made: 31, stone: 2, beads: 3, got: { corn: 6, kettle: 1, coat: 1 }, paid: { kettle: 3, coat: 5 }, P: 5 }); finish(); }
    if (params.has("done")) revealWren();
    requestAnimationFrame(frame);
  });
  window.__wampum = { S, drillTap, buy, start, practice, closeCard: closeCardByKey, K: { STONE_T, IRON_T, STEP, CART_T } };
})();
