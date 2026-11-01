/* EP 02 · Chapter 2 minigame: The bead ship (see beads.DESIGN.md).
   Half 1: you are Wren, with a crate of cheap beads: buy cargo before the other ships come (each ship = more beads, higher prices).
   Half 2: you are Esi, who saved in beads: feed the family at the prices you just made. One price line, both sides of it.
   Then the dry season plays out, day by day, on the food Esi could buy.
   Price model, the same as EP 01: price = base × (beads in the market) / 2,000. Every bead spent joins the market.
   First time through, each half opens with a short "try it" (the clock waits for one guided tap); it's remembered after. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#beadcv"), g = cv.getContext("2d"), W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  const hud = $("#hud"), tilesEl = $("#tiles"), card = $("#card"), out = $("#out"), coachEl = $("#coach"), bannerEl = $("#banner");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const _ = null;
  Chip.SONGS.beads = { bpm: 112, style: "island", chords: [62, 60, 55, 57],    // D Mixolydian "heist"
    melody: [[74, _, 78, 81, _, 78, 76, _], [72, _, 76, 79, _, 76, 72, _], [74, 79, 83, _, 81, 79, 76, _], [76, _, 81, _, 79, 76, 74, _]] };
  Chip.SONGS.beadsEsi = { bpm: 80, style: "island", chords: [62, 58, 60, 57],  // the same tune in D Dorian, slower
    melody: [[74, _, 77, 81, _, 77, 76, _], [74, _, 74, _, 72, _, 70, _], [72, _, 76, 79, _, 76, 72, _], [69, _, _, _, 74, _, _, _]] };

  // Game values (all made up; see the DESIGN's "Real values and game values" table)
  const M0 = 2000, CRATE = 4000, SHIP = 1000, H1 = 30, H2 = 25, SHIPS = { 1: [8, 15, 22], 2: [10] }, GAG = [11, 17], COOL = 0.2;
  const CARGO = [
    { id: "gold", n: "GOLD DUST", base: 40, pts: 4, d: "a pinch" },
    { id: "ivory", n: "IVORY", base: 60, pts: 5, d: "one tusk" },
    { id: "oil", n: "PALM OIL", base: 10, pts: 1, d: "one jar" },
  ];
  const FOOD = [
    { id: "yams", n: "YAMS", base: 20, need: 5 },
    { id: "fish", n: "SMOKED FISH", base: 15, need: 4 },
    { id: "salt", n: "SALT", base: 30, need: 2 },
    { id: "lamp", n: "LAMP OIL", base: 10, need: 4 },
  ];
  const NEED = FOOD.reduce((a, f) => a + f.base * f.need, 0);   // 260 beads at old prices = 60 days
  const ESI = 300, DAYS = 60, ACCORI = 2 * 20 + 30;            // the accori buys 2 yams + 1 salt = 70 old beads of food
  const DAYRATE = 8;                                             // dry-season days shown per second at the end
  const COUNT = 1.8;                                             // the 3-2-1 before each half

  const S = { phase: "start", half: 1, t: 0, M: M0, best: 0, hist: [], cool: {}, shake: 0, clock: 0, stun: 0, want: -1 };
  try { S.best = +localStorage.getItem("wth-ep02-beads-best") || 0; } catch {}
  // the "try it" tutorials: shown once per half, remembered after (and for this visit, even if storage is blocked)
  const TUT = { 1: false, 2: false };
  try { TUT[1] = localStorage.getItem("wth-ep02-beads-tut1") === "1"; TUT[2] = localStorage.getItem("wth-ep02-beads-tut2") === "1"; } catch {}
  const tutSeen = (h) => { TUT[h] = true; try { localStorage.setItem(`wth-ep02-beads-tut${h}`, "1"); } catch {} };

  const P = () => S.M / M0, price = (base) => Math.round(base * S.M / M0);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const KEYS = !matchMedia("(pointer: coarse)").matches;   // phones get no "keys 1–4" hint
  const LIVE = () => S.phase === "h1" || S.phase === "h2";
  const SHOWN = () => LIVE() || S.phase === "tut1" || S.phase === "tut2" || S.phase === "count" || S.phase === "ending";

  /* ---------- pixel kit (320×180) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const BEADC = ["#e0402f", "#f4ecff", "#2e5fb8", "#ffd23f", "#2f9e6a"];
  const scaled = (s, x, y, fn) => { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(s, s); fn(); g.restore(); };
  function person(o = {}) {  // feet at (0, 0)
    px(-3, -1, 6, 1, "rgba(0,0,0,.3)"); px(-2, -4, 1, 3, "#6b3f24"); px(1, -4, 1, 3, "#6b3f24");
    px(-2, -7, 4, 3, o.cloth || "#c0392b"); px(-2, -11, 4, 4, "#8a5534"); px(-2, -15, 4, 4, "#8a5534"); px(-2, -16, 4, 1, "#1a1010");
    px((o.face || 1) > 0 ? 1 : -2, -14, 1, 1, "#1a1010"); px((o.face || 1) * 2, -10, 1, 4, "#8a5534");
    if (o.wrap) { px(-2, -18, 5, 3, o.wrap); px(2, -17, 2, 1, o.wrap); }
  }
  function kid(cloth) { px(-1, -3, 1, 3, "#6b3f24"); px(1, -3, 1, 3, "#6b3f24"); px(-1, -6, 3, 3, cloth); px(-1, -9, 3, 3, "#8a5534"); px(-1, -10, 3, 1, "#1a1010"); }
  function wren(x, feet, t, s = 2) {
    scaled(s, x, feet, () => {
      Art.drawAlien(g, 0, 0, "wren", t);
      const top = -15 + (Math.sin(t * 3 + 119 * 0.7) > 0.6 ? -1 : 0);
      px(-7, top - 1, 14, 2, "#1a1026"); px(-5, top - 4, 10, 4, "#1a1026"); px(-3, top - 5, 6, 1, "#1a1026"); px(-7, top - 1, 14, 1, "#ffd23f");
    });
  }
  function accori(cx, cy, r = 4, glow = 0) {
    if (glow) disc(cx, cy, r + 2, `rgba(159,224,255,${0.3 * glow})`);
    disc(cx, cy, r, "#7fc8ee"); disc(cx + 1, cy + 1, Math.max(1, r - 2), "#46b8a0"); disc(cx, cy, 1, "#1d5a6a"); px(cx - r + 1, cy - r + 1, 1, 1, "#eaf8ff");
  }
  // little goods
  const GOODS = {
    gold: (x, y) => { for (let i = 0; i < 4; i++) px(x - 4 + i, y - i, 9 - 2 * i, 1, i % 2 ? "#ffd23f" : "#e8b830"); },
    ivory: (x, y) => { for (let i = 0; i < 10; i++) px(x - 5 + i, y - 2 - Math.round(Math.pow((i - 5) / 5, 2) * 3), 2, 2, "#efe6cf"); },
    oil: (x, y) => { px(x - 3, y - 6, 6, 6, "#a0522d"); px(x - 1, y - 8, 2, 2, "#7a3a1d"); px(x - 2, y - 4, 4, 1, "#e8b830"); },
    yams: (x, y) => { px(x - 4, y - 4, 8, 4, "#b8862e"); px(x - 3, y - 6, 3, 2, "#a0643a"); px(x, y - 6, 3, 2, "#8a5530"); },
    fish: (x, y) => { px(x - 4, y - 3, 7, 3, "#8a6a3a"); px(x + 3, y - 4, 2, 5, "#6a4a2a"); px(x - 3, y - 2, 1, 1, "#1a1010"); },
    salt: (x, y) => { for (let i = 0; i < 6; i++) px(x - 3 + i / 2, y - i, 7 - i, 1, i % 2 ? "#f4ecff" : "#d8d0e8"); },
    lamp: (x, y) => { px(x - 3, y - 5, 6, 5, "#4f8a3a"); px(x - 1, y - 7, 2, 2, "#2f5a2a"); px(x - 3, y - 3, 6, 1, "#8fd16a"); },
  };
  // the market's bead pile: a mound that grows with the beads in town
  const DOTS = Array.from({ length: 700 }, (_, i) => { const u = hash(i) * 2 - 1; return [u, hash(i + 0.5) * (1 - u * u), BEADC[i % 5]]; });
  function pile(cx, base, M) {
    const R = 8 + Math.sqrt(M) * 0.25, n = Math.min(DOTS.length, Math.floor(M / 12));
    for (let y = 0; y < R * 0.55; y++) { const hw = R * Math.sqrt(Math.max(0, 1 - y / (R * 0.55))); px(cx - hw, base - y, hw * 2, 1, "#c9a45a"); }
    for (let i = 0; i < n; i++) { const [u, v, c] = DOTS[i]; px(cx + u * R, base - 1 - v * R * 0.55, 2, 2, c); }
  }
  function stall(x, base, good, tag, risen) {
    px(x - 12, base - 26, 24, 4, risen ? "#ff5a5a" : "#ff6fb5"); for (let i = 0; i < 24; i += 6) px(x - 12 + i, base - 26, 3, 4, "#ffd0e6");
    px(x - 11, base - 22, 1, 12, "#5e3b1a"); px(x + 10, base - 22, 1, 12, "#5e3b1a");
    scaled(1, x + 4, base - 8, () => person({ cloth: ["#2e86c1", "#7d3c98", "#16a085", "#d68910"][Math.round(x) % 4], face: -1 }));
    px(x - 12, base - 10, 24, 3, "#8a5a2b"); px(x - 10, base - 7, 2, 7, "#5e3b1a"); px(x + 8, base - 7, 2, 7, "#5e3b1a");
    GOODS[good](x - 4, base - 10);
    g.font = "8px Silkscreen"; g.textAlign = "center"; g.fillStyle = "#1a1026"; px(x - 12, base - 36, 24, 9, risen ? "#ffb3b3" : "#fff8e8");
    g.fillStyle = "#1a1026"; g.fillText(tag, x, base - 29); g.textAlign = "left";
  }
  function txt(s, x, y, c, size = 8, align = "left") { g.font = `${size}px Silkscreen`; g.textAlign = align; g.fillStyle = "rgba(0,0,0,.6)"; g.fillText(s, x + 1, y + 1); g.fillStyle = c; g.fillText(s, x, y); g.textAlign = "left"; }

  // where each incoming ship is: 0..1 sailing in from the horizon, 1 = landed, then drifting off
  function shipKs() {
    const ks = [];
    if (LIVE()) for (const at of SHIPS[S.half] || []) ks.push((S.t - at + 2.5) / 2.5);
    if (S.tutShip != null) ks.push((S.clock - S.tutShip) / 2.5);
    return ks;
  }

  function draw(now) {
    const t = now / 1000, eve = S.half === 2;
    g.save();
    if (S.shake > 0 && !RM) g.translate(Math.round(Math.sin(t * 80) * 2), 0);
    px(0, 0, W, 34, eve ? "#e9a86a" : "#8fd0f0"); px(0, 34, W, 28, eve ? "#f6cf8e" : "#cdebf8");
    px(0, 62, W, 18, "#1d4f8a"); for (let i = 0; i < 24; i++) px((hash(i) * W + t * 4) % W, 63 + hash(i + 4) * 15, 4, 1, "#4f8fd1");
    px(0, 80, W, 100, "#e8d39a"); for (let i = 0; i < 40; i++) px(hash(i + 9) * W, 82 + hash(i + 19) * 96, 2, 1, "#c9b177");
    // other traders' ships: on the horizon 2.5 s before they land
    for (const k of shipKs()) {
      if (k < 0 || k > 2.2) continue;
      const x = k < 1 ? 340 - 190 * k : 150 - (k - 1) * 30, y = 72;
      px(x - 14, y, 28, 4, "#4a2f19"); px(x - 1, y - 22, 2, 22, "#3b2615"); px(x - 12, y - 20, 11, 16, "#f2ead6"); px(x + 2, y - 18, 9, 13, "#f2ead6");
      if (k < 1 && Math.floor(t * 6) % 2) txt("SHIP!", x, y - 26, "#ff5a5a", 16, "center");
    }
    if (!eve) {
      // Wren's ship and crate
      px(0, 66, 70, 8, "#4a2f19"); px(4, 64, 64, 2, "#c99a4a"); px(30, 20, 2, 46, "#3b2615"); px(14, 24, 16, 34, "#f2ead6");
      const fill = S.phase === "start" ? 1 : S.crate / CRATE;
      px(12, 112, 36, 18, "#7a4a22"); px(12, 112, 36, 2, "#3b2615"); px(12, 120, 36, 1, "#3b2615");
      for (let i = 0; i < Math.round(fill * 90); i++) px(14 + hash(i) * 30, 111 - hash(i + 3) * fill * 10, 2, 2, BEADC[i % 5]);
      wren(68, 140, t, 2);
    } else {
      px(14, 98, 30, 14, "#7a5a32"); px(25, 102, 6, 10, "#2a1a10"); for (let i = 0; i < 9; i++) px(10 + i, 97 - i, 38 - 2 * i, 1, i % 2 ? "#a4782e" : "#c49a4a");
      scaled(2, 64, 148, () => person({ cloth: "#d68910", wrap: "#2e86c1" })); scaled(2, 82, 148, () => kid("#c0392b"));
      const got = FOOD.flatMap((f) => Array(S.got[f.id]).fill(f.id));
      got.forEach((id, i) => GOODS[id](8 + (i % 5) * 9, 130 + Math.floor(i / 5) * 8));
    }
    pile(150, 148, S.M);
    txt(`${fmt(S.M)} BEADS IN TOWN`, 150, 160, "#1a1026", 8, "center");
    const list = eve ? FOOD : CARGO, xs = eve ? [206, 236, 266, 296] : [214, 252, 290];
    list.forEach((f, i) => stall(xs[i], 128, f.id, String(price(f.base)), price(f.base) > f.base * 1.05));
    if (eve) {
      // Esi's savings string: 1 drawn bead = 10 beads; the accori sits in the middle
      px(18, 172, 284, 1, "#5e3b1a");
      const n = Math.ceil(S.esi / 10);
      for (let k = 0; k < n; k++) { const x = 160 + (k % 2 ? -1 : 1) * (9 + Math.floor(k / 2) * 9); px(x - 2, 170, 5, 5, BEADC[k % 5]); px(x - 2, 170, 1, 1, "#fff"); }
      if (S.accori) accori(160, 172, 4, 0.5 + 0.5 * Math.sin(t * 4));
    }
    // big price level, top right
    const lvl = P();
    txt(`PRICES x${lvl.toFixed(1)}`, W - 4, 18, lvl > 1.5 ? "#ff5a5a" : "#1a1026", 16, "right");
    if (eve && (S.phase === "season" || S.phase === "result")) drawSeason(t);
    g.restore();
  }

  // the end of half 2: the dry season plays out, one tick per day, on the food Esi could buy
  function drawSeason(t) {
    px(0, 0, W, H, "rgba(12,8,22,.93)"); px(0, 150, W, 30, "#3a2a1a");   // night falls on dry ground
    const d = Math.min(S.days, Math.floor(S.seasonT * DAYRATE)), over = S.seasonT * DAYRATE >= S.days + 3;
    txt("THE DRY SEASON", W / 2, 26, "#ffd23f", 16, "center");
    const head = !over ? `DAY ${Math.max(1, d)}` : S.days >= DAYS ? "FOOD FOR ALL 60 DAYS" : `DAY ${S.days + 1}: NO FOOD`;
    txt(head, W / 2, 58, over && S.days < DAYS ? "#ff6b6b" : "#f4ecff", 16, "center");
    for (let i = 0; i < DAYS; i++) {
      const x = 40 + i * 4, c = i < d ? (i < S.beadDays ? "#ffd23f" : "#7fc8ee") : over && S.days < DAYS ? "#5a2030" : "#3a2d5c";
      px(x, 72, 3, 16, c);
    }
    txt("LAST YEAR: 60 DAYS", W / 2, 102, "#a99cc8", 8, "center");
    // the family, on what's left
    scaled(2, 140, 166, () => person({ cloth: "#d68910", wrap: "#2e86c1" })); scaled(2, 162, 166, () => kid("#c0392b"));
    const left = over ? 0 : Math.max(0, S.days - d), n = Math.ceil(10 * left / Math.max(1, S.days));
    for (let i = 0; i < n; i++) GOODS[FOOD[i % 4].id](188 + (i % 5) * 9, 158 + Math.floor(i / 5) * 8);
    if (over && S.days < DAYS) { px(184, 150, 46, 1, "#5e3b1a"); txt("EMPTY", 207, 146, "#a99cc8", 8, "center"); }
  }

  /* ---------- tiles (DOM) ---------- */
  let tiles = [];
  function buildTiles(defs) {
    tilesEl.innerHTML = defs.map((d, i) => `<button class="tile ${d.cls || ""}" data-i="${i}"><span class="k">${i + 1}</span><span class="n"></span><span class="p"></span><span class="d"></span></button>`).join("");
    tiles = defs.map((d, i) => ({ ...d, el: tilesEl.children[i], cache: {} }));
    tiles.forEach((tl, i) => tl.el.addEventListener("click", () => tap(i)));
  }
  const set = (tl, part, html) => { if (tl.cache[part] !== html) { tl.cache[part] = html; tl.el.querySelector("." + part).innerHTML = html; } };
  const cls = (tl, c, on) => tl.el.classList.toggle(c, !!on);
  const priceHTML = (base) => { const p = price(base); return p > base ? `<s>${base}</s>${fmt(p)} beads` : `${p} beads`; };
  function nextShip() { const n = (SHIPS[S.half] || []).find((a) => a > S.t); return n == null ? "NO MORE SHIPS" : `NEXT SHIP: ${Math.ceil(n - S.t)}s`; }
  const gagOn = () => S.phase === "h1" && S.t >= GAG[0] && S.t < GAG[1] && !S.gagUsed;
  const stuck = () => S.half === 2 && FOOD.every((f) => S.got[f.id] >= f.need || price(f.base) > S.esi);
  function updateTiles() {
    const tut = S.phase === "tut1" || S.phase === "tut2";
    tiles.forEach((tl, i) => {
      const f = tl.f;
      if (tl.kind === "cargo") { set(tl, "n", f.n); set(tl, "p", priceHTML(f.base)); set(tl, "d", `+${f.pts} cargo · ${f.d}`); }
      if (tl.kind === "food") {
        const done = S.got[f.id] >= f.need, poor = !done && price(f.base) > S.esi;
        set(tl, "n", f.n); set(tl, "p", priceHTML(f.base)); set(tl, "d", done ? "✓ enough" : poor ? `too few beads · got ${S.got[f.id]}` : `need ${f.need} · got ${S.got[f.id]}`);
        cls(tl, "done", done); cls(tl, "poor", poor);
      }
      if (tl.kind === "slot") {
        const gag = gagOn();
        cls(tl, "gag", gag); cls(tl, "info", !gag);
        set(tl, "n", gag ? "FAKE ACCORI?" : "SHIPS"); set(tl, "p", gag ? "copy one!" : nextShip()); set(tl, "d", gag ? "the rare blue bead" : "+1,000 beads each");
      }
      if (tl.kind === "accori") {
        set(tl, "n", "★ ACCORI"); set(tl, "p", S.accori ? "2 yams + 1 salt" : "traded ✓"); set(tl, "d", "price never moves"); cls(tl, "done", !S.accori);
        cls(tl, "hint", (S.phase === "h2" && S.accori && stuck()) || S.showAccori);   // out of beads? the bead nobody can copy still works
      }
      if (tl.kind === "info") { set(tl, "n", "SHIPS"); set(tl, "p", nextShip()); set(tl, "d", "waiting costs her"); }
      cls(tl, "me", tut && S.want === i);
      tl.el.disabled = tut ? S.want !== i
        : !LIVE() || S.t < S.stun || tl.kind === "info" || (tl.kind === "slot" && !gagOn());
    });
  }
  function flashUp() { if (RM) return; for (const tl of tiles) if (tl.kind === "cargo" || tl.kind === "food") { tl.el.classList.remove("up"); void tl.el.offsetWidth; tl.el.classList.add("up"); } }
  function shake(tl) { tl.el.classList.remove("shake"); void tl.el.offsetWidth; tl.el.classList.add("shake"); }
  // big feedback right on the tile you tapped (one at a time, so fast taps don't stack)
  function pop(tl, s, bad) {
    tl.el.querySelector(".pop")?.remove();
    const e = document.createElement("span"); e.className = "pop" + (bad ? " bad" : ""); e.textContent = s;
    tl.el.appendChild(e); setTimeout(() => e.remove(), 800);
  }
  // a few big words over the scene (ships, the countdown, the fake bead)
  let bannerTimer = 0;
  function banner(s, kind = "", ms = 1300) {
    clearTimeout(bannerTimer);
    bannerEl.className = "bg-banner on " + kind; bannerEl.textContent = s;
    if (ms) bannerTimer = setTimeout(() => { bannerEl.className = "bg-banner"; }, ms);
  }
  const unbanner = () => { clearTimeout(bannerTimer); bannerEl.className = "bg-banner"; };

  function tap(i) {
    const tl = tiles[i];
    if (!tl) return;
    const tut = S.phase === "tut1" || S.phase === "tut2";
    if (tut ? S.want !== i : !LIVE() || S.t < S.stun || (S.cool[i] || 0) > S.t) return;
    S.cool[i] = S.t + COOL;
    if (tl.kind === "cargo") {
      const p = price(tl.f.base);
      if (p > S.crate) { shake(tl); pop(tl, "too few!", true); Chip.sfx("thud"); return; }
      S.crate -= p; S.M += p; S.cargo += tl.f.pts; S.spent += p; S.wrenBuys.push(S.t);
      if (tl.f.id === "gold") { if (!S.firstGold) S.firstGold = p; S.lastGold = p; }
      pop(tl, `+${tl.f.pts}`); Chip.sfx("clink");
      if (S.phase === "tut1") return tut1b(p);
      if (S.crate < price(10)) end1("CRATE EMPTY: SAIL HOME!");
    } else if (tl.kind === "slot") {
      S.gagUsed = true; S.stun = S.t + 1; Chip.sfx("thud"); banner("IT CRACKED! FAKE.", "bad");
    } else if (tl.kind === "food") {
      const f = tl.f, p = price(f.base);
      if (S.got[f.id] >= f.need) { shake(tl); pop(tl, "enough"); return; }
      if (p > S.esi) { shake(tl); pop(tl, "too few!", true); Chip.sfx("thud"); return; }
      S.esi -= p; S.M += p; S.got[f.id]++; S.esiBuys.push(S.t + H1); pop(tl, `−${p}`, true); Chip.sfx("clink");
      if (S.phase === "tut2") return tut2b(f, p);
      check2();
    } else if (tl.kind === "accori" && S.accori) {
      S.accori = false; S.accoriUsed = true; S.got.yams += 2; S.got.salt += 1; S.esiBuys.push(S.t + H1); Chip.sfx("chime"); pop(tl, "★"); banner("★ 2 YAMS + 1 SALT", "star");
      check2(1300);
    }
  }
  function check2(wait) {
    const open = FOOD.filter((f) => S.got[f.id] < f.need);
    if (!open.length) end2("ENOUGH FOR THE SEASON", wait);
    else if (!S.accori && stuck()) end2("THE STRING IS EMPTY", wait);
  }

  /* ---------- coach: one instruction at a time, the clock waits ---------- */
  function coach(html, go, fn) {
    coachEl.innerHTML = html ? `<p>${html}</p>${go ? `<button class="btn" data-go>${go}</button>` : ""}` : "";
    if (go) coachEl.querySelector("[data-go]").onclick = () => { Chip.sfx("pop"); fn(); };
  }

  /* ---------- flow ---------- */
  const panel = (el, html) => { el.innerHTML = html ? `<div class="panel">${html}</div>` : ""; };
  function showCard(html, go, extra = "") {
    tilesEl.innerHTML = ""; hud.innerHTML = ""; tiles = []; coach("");
    panel(card, html + `<div class="row">${extra}<button class="btn" data-go>${go}</button></div>`);
    return card.querySelector("[data-go]");
  }
  const toGame = () => $("#game").scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" });
  function fresh1() {
    Object.assign(S, { half: 1, t: 0, M: M0, crate: CRATE, cargo: 0, spent: 0, firstGold: 0, lastGold: 0, wrenBuys: [], esiBuys: [], hist: [], cool: {}, stun: 0,
      gagUsed: false, shipsDone: 0, sf: {}, tutShip: null, tutLanded: false, want: -1, accoriUsed: false, stuckT: 0, showAccori: false });
  }
  function startCard() {
    S.phase = "start"; fresh1(); unbanner();
    panel(out, "");
    const go = showCard(`<h3>THE BEAD SHIP</h3>
      <p>You are <b class="pen">Wren</b>. Your crate holds <b>4,000 glass beads</b>. In Europe they cost next to nothing. Here, they buy gold.</p>
      <p><b>Goal:</b> buy as much cargo as you can in ${H1} seconds.</p>
      ${S.best ? `<p class="tiny">your best: ${S.best} cargo</p>` : ""}`, "▶ START", TUT[1] ? `<button class="btn ghost" data-how>HOW TO PLAY</button>` : "");
    go.onclick = () => begin1(!TUT[1]);
    card.querySelector("[data-how]")?.addEventListener("click", () => begin1(true));
  }
  function begin1(withTut) {
    Chip.sfx("pop"); Chip.song(Chip.SONGS.beads);
    fresh1(); panel(card, "");
    buildTiles([...CARGO.map((f) => ({ kind: "cargo", f })), { kind: "slot" }]);
    if (withTut) tut1(); else countdown();
    toGame();
  }
  // half 1 "try it": buy once, see the price tick up, watch one ship land
  function tut1() {
    S.phase = "tut1"; S.want = 0;
    coach(`<b>Tap GOLD DUST</b> to buy some gold.`);
  }
  function tut1b(p) {
    S.want = -1;
    coach(`<b>+4 cargo!</b> Your ${p} beads went into town. More beads in town, so gold now costs <b>${price(40)}</b>.`, "NEXT ▶", tut1c);
  }
  function tut1c() {
    coach(`Other ships bring beads too. Watch one land.`);
    S.tutShip = S.clock; S.tutGold = price(40);
  }
  function tut1d() {
    coach(`One ship, and gold went from ${S.tutGold} to <b class="pen">${price(40)}</b> beads!<br><b>Buy fast, before the ships land.</b> (That was practice: the round starts fresh.)`, "▶ START THE ROUND", () => { tutSeen(1); fresh1(); countdown(); });
  }
  function countdown() {
    coach(""); S.phase = "count"; S.cd = COUNT; S.cdShown = 0; S.showAccori = false;
    for (const tl of tiles) tl.el.classList.remove("up", "shake");   // the try-it's ship is gone: prices are back to normal
  }
  function land(main) {
    S.M += SHIP; S.shake = 0.35; if (main) S.shipsDone++;
    Chip.sfx("splash"); banner("SHIP! +1,000 BEADS", "bad"); flashUp();
  }
  function end1(why) {
    if (S.phase !== "h1") return;
    S.phase = "haul"; S.P1 = P(); unbanner();
    Chip.sfx("chime");
    const fg = S.firstGold ? `<p>Your first gold cost <b>${S.firstGold} beads</b>. Your last cost <b>${S.lastGold}</b>.</p>` : "";
    showCard(`<h3>${why || "TIME'S UP: SAIL HOME!"}</h3>
      <p class="big">Cargo: ${S.cargo}</p>${fg}
      <p>You put <b>${fmt(S.spent)} beads</b> into this market, and the other ships brought <b>${fmt(S.shipsDone * SHIP)}</b>. Everything now costs <b class="pen">${P().toFixed(1)} times</b> as much.</p>`, "NEXT ▶").onclick = intro2;
  }
  function intro2() {
    Chip.sfx("pop"); Chip.song(Chip.SONGS.beadsEsi);
    S.phase = "intro"; S.half = 2; S.t = 0; S.stuckT = 0;
    S.esi = ESI; S.accori = true; S.accoriUsed = false; S.got = { yams: 0, fish: 0, salt: 0, lamp: 0 };
    showCard(`<h3>NOW YOU ARE ESI</h3>
      <p>Imagine Esi. She makes pots. Ten years of work: <b>300 beads</b> on a string, and one old <b style="color:#7fc8ee">accori</b> bead.</p>
      <p>Last year, that string fed her family for <b>${DAYS} days</b>. Now she shops at the prices <b>you</b> left: everything costs <b class="pen">${P().toFixed(1)} times</b> as much.</p>
      <p class="tiny">One more ship is coming.</p>`, "▶ FEED THE FAMILY").onclick = start2;
  }
  function start2() {
    Chip.sfx("pop");
    S.t = 0; S.cool = {}; S.stun = 0;
    panel(card, "");
    buildTiles([...FOOD.map((f) => ({ kind: "food", f })), { kind: "accori", cls: "star" }, { kind: "info", cls: "info" }]);
    if (!TUT[2]) { S.phase = "tut2"; S.want = 0; coach(`Esi's family needs food. <b>Tap YAMS.</b>`); }
    else countdown();
    toGame();
  }
  function tut2b(f, p) {
    S.want = -1;
    coach(`Yams: <b class="pen">${p} beads</b>. Last year: ${f.base}. The beads you spent as Wren did that.`, "NEXT ▶", () =>
{ coach(`★ Her old <b style="color:#7fc8ee">accori</b> bead can't be copied, so it always buys <b>2 yams + 1 salt</b>. Tap it when you need it.<br><b>Buy before the next ship lands.</b>`, "▶ GO", () => { tutSeen(2); countdown(); });
      S.showAccori = true; tiles[4]?.el.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" }); });
  }
  function end2(why, wait) {
    if (S.phase !== "h2") return;
    if (wait) { S.phase = "ending"; for (const tl of tiles) tl.el.disabled = true; setTimeout(() => season(why), wait); }
    else season(why);
  }
  function season(why) {
    S.phase = "season"; S.why = why; S.seasonT = 0; S.seasonCard = false; S.lastTick = 0;
    const d = esiDays(); S.days = d.days; S.beadDays = d.days - d.aDays; S.aDays = d.aDays;
    tilesEl.innerHTML = ""; hud.innerHTML = ""; tiles = []; coach(""); unbanner();
    Chip.sfx(why === "ENOUGH FOR THE SEASON" ? "chime" : "drain");
    toGame();   // the tiles are gone and the page got shorter: keep the season scene in view
  }
  function esiDays() {
    const Pend = P();
    const bought = FOOD.reduce((a, f) => a + Math.min(S.got[f.id], f.need) * f.base, 0);
    const value = Math.min(NEED, bought + S.esi / Pend);          // leftover beads count, at today's prices
    const days = Math.round(DAYS * value / NEED);
    return { days, aDays: S.accoriUsed ? Math.min(days, Math.round(DAYS * ACCORI / NEED)) : 0 };
  }
  function seasonCard() {
    S.seasonCard = true;
    Chip.sfx(S.days < 30 ? "sad" : "chime");
    showCard(`<h3>${S.why}</h3>
      <p class="big">Esi's food lasts ${S.days} days.</p>
      <p>Last year, the same string fed them for <b>${DAYS}</b>.${S.aDays ? ` <span style="color:#7fc8ee">★ ${S.aDays} of those days came from the accori.</span>` : ""}</p>`, "SEE HOW IT HAPPENED ▶").onclick = () => { Chip.sfx("pop"); panel(card, ""); result(); };
  }

  function result() {
    S.phase = "result";
    const Pend = P(), days = S.days, accoriDays = Math.round(DAYS * ACCORI / NEED);
    if (S.cargo > S.best) { S.newBest = S.best > 0; S.best = S.cargo; try { localStorage.setItem("wth-ep02-beads-best", S.cargo); } catch {} } else S.newBest = false;
    Chip.song(Chip.SONGS.mystery);
    const lazy = S.cargo < 30, eur = Math.round(100 / Pend);
    panel(out, `<h3>YOU, AS WREN: ${S.cargo} CARGO${!lazy && S.newBest ? " · BEST!" : ""}</h3>
      ${S.firstGold ? `<p>Your first gold cost <b>${S.firstGold} beads</b>. Your last cost <b>${S.lastGold}</b>.</p>` : ""}
      <div class="bg-res">
        <div><b class="h gold">WREN · SPENT FIRST</b><span class="bnum">${S.cargo}</span> cargo<br><span class="tiny">bought at prices ×1.0 to ×${S.P1.toFixed(1)}</span></div>
        <div><b class="h pen">ESI · SAVED</b><span class="bnum">${days} days</span> of food<br><span class="tiny">${S.why.toLowerCase()} · last year, same string: ${DAYS} days<br>a basket of yams: <s>20</s> → <b>${price(20)}</b> beads</span>
          <div class="bar"><span style="width:${Math.round(100 * days / DAYS)}%;background:var(--pen)"></span></div></div>
      </div>
      <p><b>Esi saved the same 300 beads as last year. ${lazy ? "The other ships' beads made them worth less." : "Your spending made them worth less."}</b> ${S.accori ? `★ She never used the accori. It would still have bought 2 yams and 1 salt (about ${accoriDays} days), whatever the prices.` : `★ Her accori still bought what it always did: 2 yams and 1 salt, about ${accoriDays} days of food.`}</p>
      <p class="twist">${lazy ? "You hardly spent, but the other ships still came. Inflation doesn't need you." : "The better you played Wren, the shorter Esi's season."}</p>
      <canvas class="bg-chart" id="bchart" width="320" height="120"></canvas>
      <p class="real"><b>In real life:</b> if prices go ×${Pend.toFixed(1)}, €100 of savings buys only what €${eur} used to.</p>
      <p class="tiny">Game numbers, and a what-if: no one recorded bead prices like these. Real: around 1770, one Liverpool firm sold these beads at about 9 pence a pound. A real case of money flooding a market: cowries, chapter 4.</p>
      <div class="row"><button class="btn ghost" data-again>PLAY AGAIN</button><button class="btn" data-done>CONTINUE</button></div>`);
    drawChart($("#bchart"));
    out.querySelector("[data-again]").onclick = () => { Chip.sfx("pop"); startCard(); $("#game").scrollIntoView({ block: "start" }); };
    out.querySelector("[data-done]").onclick = () => { panel(out, ""); Chip.stop(); startCard(); revealWren(); };
    requestAnimationFrame(() => requestAnimationFrame(() => out.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" })));
  }
  // one price line over both halves, with where each of you bought
  function drawChart(c) {
    const x = c.getContext("2d"), w = c.width, h = c.height, L = 26, R = w - 8, T = 14, B = h - 16, hist = S.hist;
    const maxP = Math.max(2, ...hist.map((p) => p[1])) * 1.1, total = H1 + H2;
    const X = (tt) => L + (R - L) * tt / total, Y = (p) => B - (B - T) * (p - 1) / (maxP - 1);
    x.fillStyle = "#120d1d"; x.fillRect(0, 0, w, h);
    x.font = "8px Silkscreen"; x.fillStyle = "#a99cc8"; x.fillText("PRICES", 4, 10);
    for (const p of [1, 2, 3, 4, 5]) if (p < maxP) { x.fillStyle = "#3a2d5c"; x.fillRect(L, Math.round(Y(p)), R - L, 1); x.fillStyle = "#6c5f93"; x.fillText(`x${p}`, 4, Math.round(Y(p)) + 3); }
    x.fillStyle = "#3a2d5c"; x.fillRect(Math.round(X(H1)), T, 1, B - T);
    x.fillStyle = "#a99cc8"; x.fillText("WREN", X(1), h - 4); x.fillText("ESI", X(H1 + 1), h - 4);
    x.fillStyle = "#ffd23f";
    for (let i = 1; i < hist.length; i++) { const [t0, p0] = hist[i - 1], [t1, p1] = hist[i], xa = Math.round(X(t0)), xb = Math.round(X(t1)), ya = Math.round(Y(p0)), yb = Math.round(Y(p1));
      x.fillRect(xa, ya - 1, xb - xa + 2, 2); x.fillRect(xb, Math.min(ya, yb) - 1, 2, Math.abs(yb - ya) + 2); }   // a step line
    const at = (tt) => { let p = 1; for (const [a, b] of hist) if (a <= tt) p = b; return p; };
    const dot = (tt, col, label, dy) => { const xx = Math.round(X(tt)), yy = Math.round(Y(at(tt))); x.fillStyle = col; x.fillRect(xx - 3, yy - 3, 7, 7); x.font = "10px Silkscreen"; const tw = x.measureText(label).width, lx0 = xx > w / 2 ? xx - 6 - tw : xx + 6;
      x.fillStyle = "#120d1d"; x.fillRect(lx0 - 2, yy + dy - 9, tw + 4, 12); x.fillStyle = col; x.fillText(label, lx0, yy + dy); };
    const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
    if (S.wrenBuys.length) dot(avg(S.wrenBuys), "#ff6fb5", "WREN BOUGHT HERE", -6);
    if (S.esiBuys.length) dot(avg(S.esiBuys), "#4de1e8", "ESI BOUGHT HERE", 12);
  }
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false;
    Art.drawPortrait($("#wren-portrait"), "wren", 0);
    Ep02.done("beads");
    const nx = Ep02.next(), a = $("#next-ch");
    if (nx) { a.href = nx.href; a.textContent = `NEXT: ${nx.name.toUpperCase()} ▶`; a.hidden = false; }
    else $("#next-line").textContent = "Next: is there money with no cave? (coming soon)";
    $("#wren-card").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
  }

  /* ---------- input ---------- */
  addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("video, a, summary")) return;
    const k = e.key;
    if (tiles.length && /^[1-6]$/.test(k)) { tap(+k - 1); e.preventDefault(); }
    const go = coachEl.querySelector("[data-go]") || card.querySelector("[data-go]");
    if ((k === " " || k === "Enter") && go && document.activeElement?.tagName !== "BUTTON") { go.click(); e.preventDefault(); }
  });
  if (matchMedia("(pointer: coarse)").matches) $("#tap-hint").textContent = "Tap the tiles.";

  /* ---------- loop ---------- */
  function hudHTML() {
    const len = S.half === 1 ? H1 : H2, bar = `<div class="bar"><span style="width:${100 * (1 - S.t / len)}%"></span></div>`;
    return S.half === 1
      ? `<span>CRATE <b>${fmt(S.crate)}</b></span><span>CARGO <b class="gold">${S.cargo}</b></span><span>PRICES <b class="${P() > 1.5 ? "pen" : ""}">×${P().toFixed(1)}</b></span>${bar}`
      : `<span>STRING <b>${S.esi}</b></span><span>FOOD <b class="gold">${Math.round(DAYS * FOOD.reduce((a, f) => a + Math.min(S.got[f.id], f.need) * f.base, 0) / NEED)}/${DAYS} days</b></span><span>PRICES <b class="pen">×${P().toFixed(1)}</b></span>${bar}`;
  }
  function update(dt) {
    S.clock += dt;
    S.shake = Math.max(0, S.shake - dt);
    // tutorial ship: lands 2.5 s after it appears, then the coach explains
    if (S.tutShip != null && !S.tutLanded && S.clock - S.tutShip >= 2.5) { S.tutLanded = true; land(false); setTimeout(() => { if (S.phase === "tut1") tut1d(); }, 700); }
    if (S.phase === "count") {
      S.cd -= dt;
      const n = Math.ceil(S.cd / (COUNT / 3));
      if (n > 0 && n !== S.cdShown) { S.cdShown = n; banner(String(n), "count", 0); Chip.sfx("tick"); }
      if (S.cd <= 0) { S.phase = S.half === 1 ? "h1" : "h2"; banner("GO!", "count", 600); Chip.sfx("pop"); }
    }
    if (S.phase === "season") {
      S.seasonT += dt;
      const d = Math.floor(S.seasonT * DAYRATE);
      if (d > S.lastTick && d <= S.days) { S.lastTick = d; if (d % 3 === 0) Chip.sfx("tick"); }
      if (!S.seasonCard && S.seasonT * DAYRATE >= S.days + 6) seasonCard();
    }
    if (!SHOWN()) return;
    if (LIVE()) {
      S.t += dt;
      const half = S.half, len = half === 1 ? H1 : H2;
      for (const at of SHIPS[half]) if (S.t >= at && !S.sf[half + ":" + at]) { S.sf[half + ":" + at] = true; land(half === 1); }
      const gt = half === 1 ? S.t : H1 + S.t;
      if (!S.hist.length || gt - S.hist[S.hist.length - 1][0] >= 0.25) S.hist.push([gt, P()]);
      // Esi out of beads but still holding the accori: give her a few seconds to find it, then the season comes anyway
      if (half === 2 && S.accori && stuck()) { S.stuckT += dt; if (S.stuckT > 6) return end2("THE STRING IS EMPTY"); }
      if (S.t >= len) { half === 1 ? end1() : end2("THE DRY SEASON IS HERE"); return; }
    }
    hud.innerHTML = hudHTML();
    updateTiles();
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); draw(now);
    requestAnimationFrame(frame);
  }
  startCard();
  requestAnimationFrame(frame);
  if (new URLSearchParams(location.search).has("done")) revealWren();
  window.__beads = S;
})();
