/* EP 02 · scenes for chapter 6 (Gold?): is there money without a cave?
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   w(n) = the moment word n of the narration is spoken, so visuals land on the words. Wren (the EP 01 alien)
   carries a pickaxe and a miner's lantern in this chapter. Real numbers only; see SCRIPT.md's fact check. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, sky, rai,
    text, body, label, stamp, where, blitLo, fadeOut, SC, ground, cowrie, coin, sack } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  function big(x, y, s, fn) { lx.save(); lx.translate(Math.round(x), Math.round(y)); lx.scale(s, s); fn(); lx.restore(); }
  function faded(a, fn) { if (a <= 0) return; lx.save(); lx.globalAlpha *= a; fn(); lx.restore(); }
  function hfade(a, fn) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }
  // a crisp camera zoom: blit the lo-res frame, magnified z× around lo point (cx, cy)
  function blitZoom(cx, cy, z) {
    if (z <= 1.001) { blitLo(); return; }
    const sw = LO_W / z, sh = LO_H / z, sx = clamp(cx - sw / 2, 0, LO_W - sw), sy = clamp(cy - sh / 2, 0, LO_H - sh);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(lx.canvas, sx, sy, sw, sh, 0, 0, WIDTH, H);
  }
  const dimAll = (a) => { if (a > 0) { ctx.fillStyle = `rgba(10,6,18,${a})`; ctx.fillRect(0, 0, WIDTH, H); } };

  /* ================================================================ gold props (lo-res) */
  const G = { front: "#e8b830", line: "#c99a1a", top: "#f2c94c", top2: "#f2c94c", side: "#b8862e", side2: "#9a6e20", hi: "#fff3b0",
    new: "#fffbe6", new2: "#fff3c0", newSide: "#f0d070" };
  // the gold cube: front face s×s, a top and a right side d px deep. f = how full (bottom-up), slices = bright layers on top
  function cube(cx, base, s, o = {}) {
    const d = Math.round(s * 0.3), x0 = Math.round(cx - s / 2 - d / 2), x1 = x0 + s;
    const h = Math.round(s * clamp(o.f ?? 1, 0, 1));
    if (h <= 0) return;
    const shade = o.shade ?? 1;
    const col = (c) => c;
    px(x0 + 2, base, s + d - 2, 2, "rgba(0,0,0,.35)");                                             // shadow on the ground
    // front face: brick courses of bars
    for (let y = 0; y < h; y++) {
      const yy = base - 1 - y, course = Math.floor(y / 3);
      px(x0, yy, s, 1, y % 3 === 2 ? G.line : G.front);
      if (y % 3 !== 2 && s >= 20) for (let x = (course % 2) * 4; x < s; x += 8) px(x0 + x, yy, 1, 1, G.line);
    }
    // right side: a parallelogram going up-right
    for (let i = 1; i <= d; i++) px(x1 + i - 1, base - h - i + 1, 1, h, i % 3 === 0 ? G.side2 : G.side);
    // the top
    const top = base - h;
    for (let j = 1; j <= d; j++) px(x0 + j, top - j, s, 1, j % 3 === 0 ? G.top2 : G.top);
    // bright layers (new gold) stacked on the top
    let yTop = top;
    for (const sl of o.slices || []) {
      const th = sl.th || 1, drop = Math.round(sl.drop || 0), a = sl.a ?? 1;
      if (a <= 0) continue;
      faded(a, () => {
        const yb = yTop - drop;
        px(x0, yb - th, s, th, sl.c || G.new);
        for (let i = 1; i <= d; i++) px(x1 + i - 1, yb - th - i + 1, 1, th, G.newSide);
        for (let j = 1; j <= d; j++) px(x0 + j, yb - th - j, s, 1, j === 1 ? G.new2 : G.top);
      });
      if (!sl.drop) yTop -= th;
    }
    // a glint: a light band sweeping across the front (o.glint = 0..1)
    if (o.glint > 0 && o.glint < 1) {
      const gx = x0 - h + o.glint * (s + h * 2);
      for (let y = 0; y < h; y++) { const xx = Math.round(gx + y); if (xx >= x0 && xx < x1 - 1) px(xx, base - 1 - y, 2, 1, G.hi); }
    }
    if (shade < 1) { lx.fillStyle = `rgba(10,6,18,${1 - shade})`; lx.fillRect(x0, top - d, s + d, h + d); }
    return { x0, x1, top: yTop, d };
  }
  const bar = (x, y) => { px(x, y, 6, 3, G.front); px(x + 1, y, 4, 1, G.hi); px(x, y + 2, 6, 1, G.line); };
  // tiny city folk (2×4)
  const folk = (x, y, c) => { px(x, y - 4, 1, 1, "#e8c49a"); px(x, y - 3, 1, 3, c); };
  // a 7-storey block, same height as the cube's front face
  function building(x, base, w, h, lit) {
    px(x, base - h, w, h, "#4a3a66"); px(x, base - h, w, 1, "#6c5f93"); px(x + w - 2, base - h, 2, h, "#3a2d5c");
    const fl = h / 7;
    for (let f = 0; f < 7; f++) for (let i = 0; i < Math.floor((w - 4) / 4); i++) {
      const on = hash(f * 11 + i * 3) < lit;
      px(x + 3 + i * 4, Math.round(base - h + f * fl + 2), 2, Math.max(2, Math.round(fl - 4)), on ? "#ffd27a" : "#2a2140");
    }
  }
  function duskSquare(t) {
    sky(0, 118, "#2a1a45", "#6a3a5c");
    px(0, 96, LO_W, 22, "#7a4a5c");
    for (let i = 0; i < 30; i++) if (Math.sin(t * 2 + i) > 0) px(hash(i) * LO_W, hash(i + 30) * 50, 1, 1, i % 5 ? "#6c5f93" : C.gold);
    // distant rooftops
    for (let i = 0; i < 14; i++) { const x = i * 18 - 4, h = 10 + Math.round(hash(i + 3) * 18); px(x, 118 - h, 16, h, "#3a2a50"); if (hash(i) > 0.4) px(x + 5, 118 - h + 4, 2, 2, "#b88a4a"); }
    px(0, 118, LO_W, 17, "#5a4a6a");
    for (let y = 120; y < LO_H; y += 4) for (let x = (y / 4) % 2 ? 0 : 5; x < LO_W; x += 10) px(x, y, 9, 3, "#665578");
  }
  // a mine cart, k = tip (0 upright, 1 tipped forward), face ±1
  function cart(x, base, face, full) {
    px(x - 5, base - 7, 10, 5, "#6c7384"); px(x - 5, base - 7, 10, 1, "#9aa3b5");
    if (full) { px(x - 4, base - 9, 8, 2, G.front); px(x - 2, base - 10, 4, 1, G.hi); }
    disc(x - 3, base - 1, 1, "#2a2140"); disc(x + 3, base - 1, 1, "#2a2140");
  }

  // Wren with a pickaxe and a miner's lantern. o: { s, lamp (0..1 light), up (lantern raised), dusty, nugget, flip, sit, swing, shrug }
  const oc = document.createElement("canvas"); oc.width = 32; oc.height = 30;
  const ox = oc.getContext("2d");
  function wren(cx, feet, t, o = {}) {
    const s = o.s || 1, F = 26;
    ox.clearRect(0, 0, 32, 30);
    const R = (x, y, w, h, c) => { ox.fillStyle = c; ox.fillRect(x, y, w, h); };
    const lift = o.shrug ? Math.round(Math.abs(Math.sin(o.shrug * Math.PI * 2)) * 2) : 0;
    Art.drawAlien(ox, 16, F - lift, "wren", t);
    const hop = Math.sin(t * 3 + 119 * 0.7) > 0.6 ? -1 : 0, top = F - 15 + hop - lift;
    // pickaxe slung on the back
    R(6, top + 2, 1, 11, "#6b4a2a"); R(3, top + 1, 7, 2, "#9aa3b5"); R(2, top + 2, 1, 1, "#9aa3b5"); R(10, top + 2, 1, 1, "#9aa3b5");
    // miner's helmet with a little lamp
    R(11, top - 1, 10, 2, "#e8b830"); R(12, top - 2, 8, 1, "#e8b830"); R(19, top, 2, 1, o.lamp > 0.5 ? "#fff6c8" : "#8a7a50");
    // lantern in the right hand
    if (!o.nugget) {
      const ly = o.up ? top + 1 : top + 9, lxp = o.up ? 25 : 24;
      R(lxp - 1, ly - 2, 3, 1, "#3a2d24"); R(lxp, ly - 3, 1, 1, "#3a2d24");
      R(lxp - 1, ly - 1, 3, 4, "#3a2d24"); R(lxp, ly, 1, 2, o.lamp > 0 ? "#ffd23f" : "#5a4a3a");
      if (o.up) R(22, top + 3, 2, 1, "#ff6fb5");
    } else { R(23, top + 1, 2, 1, "#ff6fb5"); R(24, top - 1, 2, 2, C.gold); R(24, top - 1, 1, 1, G.hi); }
    if (o.dusty) for (let i = 0; i < 9; i++) R(11 + Math.floor(hash(i) * 10), top + 2 + Math.floor(hash(i + 4) * 12), 1, 1, "#8c8166");
    if (o.sit) { R(13, F - 3, 6, 3, "rgba(0,0,0,0)"); }
    lx.save(); lx.globalAlpha *= o.alpha ?? 1; lx.imageSmoothingEnabled = false;
    if (o.flip) { lx.translate(Math.round(cx) * 2, 0); lx.scale(-1, 1); }
    lx.drawImage(oc, Math.round(cx - 16 * s), Math.round(feet - F * s), 32 * s, 30 * s);
    lx.restore();
    return { lampX: cx + (o.flip ? -1 : 1) * (o.up ? 9 : 8) * s, lampY: feet - (F - (o.up ? top + 1 : top + 9)) * s };
  }
  // warm light from a lantern (hi-res, lo coords in)
  function glow(x, y, r, a) {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(X(x), X(y), 0, X(x), X(y), X(r));
    g.addColorStop(0, `rgba(255,214,120,${0.45 * a})`); g.addColorStop(1, "rgba(255,214,120,0)");
    ctx.fillStyle = g; ctx.fillRect(X(x - r), X(y - r), X(2 * r), X(2 * r));
  }

  /* ================================================================ g1 · title: the hill of caves */
  function caveMouth(x, base, w, h) {   // an empty black arch with a rocky rim
    for (let i = 0; i < h + 2; i++) { const k = i / (h + 2), hw = Math.round((w / 2 + 2) * Math.sqrt(1 - Math.pow(1 - k, 2))); px(x - hw, base - h - 2 + i, hw * 2, 1, "#4a3c66"); }
    for (let i = 0; i < h; i++) { const k = i / h, hw = Math.round((w / 2) * Math.sqrt(1 - Math.pow(1 - k, 2))); px(x - hw, base - h + i, hw * 2, 1, "#07040c"); }
  }
  const CAVES = [[40, 92, 14, 12], [70, 84, 10, 9], [96, 94, 12, 10], [126, 80, 9, 8], [150, 90, 13, 11], [178, 78, 8, 7], [202, 88, 12, 10], [226, 82, 9, 8], [20, 112, 12, 10], [112, 114, 10, 9], [168, 116, 14, 12], [218, 112, 11, 9]];
  SC.gtitle = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 70, "#120d24", "#1d1530");
    for (let i = 0; i < 60; i++) if (Math.sin(t * 1.5 + i * 1.7) > -0.3) px(hash(i) * LO_W, hash(i + 60) * 60, 1, 1, i % 6 ? C.line : "#cfc6ea");
    disc(204, 18, 6, "#e9e3d2"); disc(207, 16, 5, "#1d1530");   // a thin moon
    // the hillside, stepped
    for (let x = 0; x < LO_W; x++) { const h = 62 + Math.round(Math.sin(x * 0.03) * 6 + Math.sin(x * 0.11) * 2); px(x, h, 1, LO_H - h, "#2e2448"); }
    for (let x = 0; x < LO_W; x++) { const h = 100 + Math.round(Math.sin(x * 0.05 + 2) * 4); px(x, h, 1, LO_H - h, "#3a2d5c"); }
    for (let i = 0; i < 40; i++) px(hash(i + 5) * LO_W, 70 + hash(i + 9) * 60, 2, 1, "#4a3c66");
    for (const [x, b, cw, ch] of CAVES) caveMouth(x, b, cw, ch);
    // Wren walks in, peers into the first cave, then lifts the lantern toward the next
    const kw = seg(lt, 0.4, w(4)), wx = lerp(-12, 27, easeOut(kw)), up = lt > w(6);
    const peer = lt > w(4) && lt < w(6);
    const L = wren(wx, 114, t, { lamp: 1, up, flip: peer ? false : false });
    blitLo();
    glow(L.lampX, L.lampY, 22 + Math.sin(t * 9) * 0.6, seg(lt, 0.4, 1.0));
    if (peer) glow(20, 106, 8, 0.6);
    text("CHAPTER 6", WIDTH / 2, 150, 48, C.muted, { alpha: seg(lt, 0.2, 0.7) });
    const kt = seg(lt, w(2), w(2) + 0.4);
    if (kt > 0) text("GOLD?", WIDTH / 2, lerp(-140, 330, easeOut(kt)), 200, C.gold);
    text("IS THERE MONEY WITHOUT A CAVE?", WIDTH / 2, 520, 56, C.ink, { alpha: seg(lt, w(3), w(3) + 0.6) });
    fadeOut(lt, d, 0.5);
  };

  /* ================================================================ g2 · the Wrens of history */
  // one small picture per chapter, drawn in a 30×20 box centred on (cx, cy)
  function mini(i, cx, cy, t) {
    cx = Math.round(cx); cy = Math.round(cy);
    if (i === 0) {   // Yap: O'Keefe's schooner with a rai stone on deck
      px(cx - 15, cy + 5, 30, 5, "#1d4f8a"); for (let k = 0; k < 6; k++) px(cx - 14 + ((k * 7 + Math.floor(t * 4)) % 28), cy + 7 + (k % 2) * 2, 3, 1, "#4f8fd1");
      for (let k = 0; k < 24; k++) { const dd = k < 3 ? 3 - k : k > 21 ? k - 21 : 0; px(cx - 12 + k, cy + 2 + Math.floor(dd / 2), 1, 4 - Math.floor(dd / 2), "#4a2f19"); }
      px(cx - 4, cy - 10, 1, 12, "#3b2615"); px(cx + 4, cy - 12, 1, 14, "#3b2615");
      px(cx - 9, cy - 9, 5, 9, "#f2ead6"); px(cx - 1, cy - 11, 5, 11, "#f2ead6"); px(cx + 5, cy - 8, 4, 7, "#f2ead6");
      rai(cx + 8, cy - 1, 3);
    } else if (i === 1) {   // glass beads: a furnace and a string of beads
      for (let k = 0; k < 12; k++) { const hw = Math.round(Math.sqrt(1 - Math.pow(1 - k / 12, 2)) * 8); px(cx - 14 + 8 - hw, cy - 8 + k, hw * 2, 1, k % 3 ? "#8a4a2a" : "#6e3517"); }
      px(cx - 8, cy, 4, 4, "#ff8a2a"); px(cx - 7, cy + 1, 2, 2, C.gold);
      px(cx - 15, cy + 4, 15, 2, "#5e3b1a");
      const cols = ["#2e5fb8", "#e0402f", C.gold, "#16a085", "#f4ecff"];
      for (let k = 0; k < 7; k++) { const bx = cx + 2 + k * 2, by = cy - 6 + Math.round(Math.sin(k * 0.6) * 4 + 4); px(bx, by, 2, 2, cols[k % 5]); }
      px(cx + 1, cy - 7, 1, 1, "#cfc6ea");
    } else if (i === 2) {   // wampum: an iron drill point boring a shell bead
      const spin = Math.floor(t * 8) % 2;
      px(cx - 1, cy - 11, 2, 12, "#6c7384"); px(cx - 1, cy - 11, 1, 12, "#9aa3b5"); px(cx, cy + 1, 1, 2, "#c9d0dc");
      px(cx - 8, cy - 8 + spin, 16, 1, "#6b4a2a");
      px(cx - 6, cy + 3, 12, 6, "#f4ecff"); px(cx - 6, cy + 3, 12, 1, "#ffffff"); px(cx - 6, cy + 8, 12, 1, "#b9a8d8"); px(cx - 1, cy + 3, 2, 2, "#3a2d5c");
      for (let k = 0; k < 3; k++) if (Math.sin(t * 9 + k * 2) > 0.3) px(cx + 2 + k * 2, cy + 1 - k, 1, 1, "#f4ecff");
    } else if (i === 3) {   // cowries: a ship's hold full of shells
      for (let k = 0; k < 28; k++) { const dd = k < 4 ? 4 - k : k > 23 ? k - 23 : 0; px(cx - 14 + k, cy - 2 + Math.floor(dd / 1.4), 1, 12 - Math.floor(dd / 1.4), k % 7 ? "#5e3b1a" : "#4a2f19"); }
      px(cx - 13, cy - 3, 26, 1, "#8a5a2b");
      for (let k = 0; k < 34; k++) { const sx = cx - 11 + (k % 11) * 2, sy = cy - 1 + Math.floor(k / 11) * 2 - (k % 3 ? 0 : 1); px(sx, sy, 2, 1, "#efe2c2"); }
      px(cx, cy - 12, 1, 9, "#3b2615"); px(cx - 5, cy - 11, 5, 6, "#f2ead6");
    } else if (i === 4) {   // Rome: hammer and die over a coin
      const hit = Math.abs(Math.sin(t * 4)), hy = cy - 10 + Math.round((1 - hit) * -2);
      px(cx - 4, cy + 1, 8, 8, "#5b5348"); px(cx - 3, cy + 1, 6, 1, "#8a8072");
      px(cx - 5, hy, 10, 4, "#6c6f7a"); px(cx - 5, hy, 10, 1, "#9aa3b5"); px(cx + 5, hy + 1, 9, 2, "#6b4a2a");
      disc(cx, cy - 1, 2, "#c9d0dc"); px(cx - 1, cy - 2, 1, 1, "#ffffff");
    } else {   // gold: a question mark
      const q = ["0111", "1001", "0001", "0010", "0100", "0000", "0100"];
      q.forEach((r, j) => [...r].forEach((c, k) => { if (c === "1") px(cx - 4 + k * 2, cy - 8 + j * 2, 2, 2, C.gold); }));
    }
  }
  const CARD = [
    { name: "YAP", sub: "1870s · a ship" },
    { name: "BEADS", sub: "West Africa · 1400s–1800s" },
    { name: "WAMPUM", sub: "1600s · iron drills" },
    { name: "COWRIES", sub: "1845–1890 · Zanzibar" },
    { name: "ROME", sub: "AD 64–270 · the mint" },
    { name: "GOLD", sub: "?" },
  ];
  // the six card frames in a 3 + 3 grid (lo coords)
  const cardBox = (i) => ({ x: 14 + (i % 3) * 72, y: 17 + Math.floor(i / 3) * 44, w: 68, h: 40 });
  function savingsJar(cx, base, f) {   // a clay jar whose width follows f (1 → 0.5)
    const hh = Math.round(16 * lerp(0.6, 1, f));
    for (let y = 0; y < hh; y++) { const hw = Math.round(Math.sin((y + 2) / (hh + 2) * Math.PI) * 9 * f); px(cx - hw, base - hh + y, hw * 2, 1, y % 5 === 2 ? "#8a3e1f" : "#b5562f"); }
    const nw = Math.max(2, Math.round(5 * f)); px(cx - nw, base - hh - 3, nw * 2, 3, "#8a3e1f");
  }
  SC.allwrens = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 40; i++) px(hash(i) * LO_W, hash(i + 40) * LO_H, 1, 1, C.line);
    const shows = [w(9), w(12), w(15), w(17), w(21), w(31.5)];
    for (let i = 0; i < 6; i++) {
      const b = cardBox(i), k = seg(lt, i < 5 ? 0.2 + i * 0.12 : shows[5], (i < 5 ? 0.2 + i * 0.12 : shows[5]) + 0.4);
      if (k <= 0) continue;
      faded(k, () => {
        px(b.x, b.y, b.w, b.h, i === 5 ? "#2a2010" : C.panel);
        px(b.x, b.y, b.w, 1, i === 5 ? C.gold : C.line); px(b.x, b.y + b.h - 1, b.w, 1, i === 5 ? C.gold : C.line);
        px(b.x, b.y, 1, b.h, i === 5 ? C.gold : C.line); px(b.x + b.w - 1, b.y, 1, b.h, i === 5 ? C.gold : C.line);
      });
      // the flip: the picture appears as the card turns
      const f = seg(lt, shows[i], shows[i] + 0.4);
      if (f > 0) faded(f, () => mini(i, b.x + b.w / 2, b.y + 14, t));
    }
    // the savings jar shrinks under the cards
    const kj = seg(lt, w(30.5), w(30.5) + 0.4), sh = seg(lt, w(31.5), w(34) + 0.3);
    if (kj > 0) faded(kj, () => savingsJar(120, 133, lerp(1, 0.55, easeInOut(sh))));
    blitLo();
    text("THE WRENS OF HISTORY", WIDTH / 2, 70, 52, C.gold, { alpha: seg(lt, 0.2, 0.7) });
    for (let i = 0; i < 6; i++) {
      const b = cardBox(i), f = seg(lt, shows[i], shows[i] + 0.4); if (f <= 0) continue;
      if (i < 5) {
        text(CARD[i].name, X(b.x + b.w / 2), X(b.y + 29), 48, C.ink, { alpha: f });
        body(CARD[i].sub, X(b.x + b.w / 2), X(b.y + 35.5), 32, C.muted, { alpha: f });
      }
    }
    // CAVE! stamped on each card, one after another
    for (let i = 0; i < 5; i++) {
      const b = cardBox(i), a = w(24.5) + i * (w(30) - w(24.5)) / 5;
      stamp("CAVE!", X(b.x + b.w - 14), X(b.y + 9), seg(lt, a, a + 0.25), { size: 40, rot: -0.15 });
    }
    // Yap spotted it
    const ky = seg(lt, w(33), w(33) + 0.4);
    if (ky > 0) label("✓ YAP SPOTTED IT", X(cardBox(0).x + 34), X(cardBox(0).y + 22), { k: ky, size: 34, bg: C.leaf });
    if (kj > 0) body("savings", X(120) + 140, X(126), 40, C.ink, { alpha: kj, align: "left" });
    fadeOut(lt, d, 0.25);
  };

  /* ================================================================ g3 · the cube */
  const CUBE = { cx: 100, base: 118, s: 60 };
  function squareFolk(t, n = 9) {
    for (let i = 0; i < n; i++) { const x = (hash(i + 3) * 230 + t * (hash(i) < 0.5 ? 2 : -2) * (1 + hash(i + 1))) % 240; folk((x + 240) % 240, 128 + Math.floor(hash(i + 9) * 5), ["#c0392b", "#2e86c1", "#d68910", "#16a085"][i % 4]); }
  }
  SC.cube = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    duskSquare(t);
    const f = easeInOut(seg(lt, w(2), w(11)));
    // bars fly in and land on the growing pile
    const c = cube(CUBE.cx, CUBE.base, CUBE.s, { f: Math.max(0.02, f), glint: seg(lt, w(11), w(11) + 1.2) });
    if (f > 0 && f < 1) for (let i = 0; i < 6; i++) { const u = (lt * 1.6 + i / 6) % 1; bar(lerp(i % 2 ? -10 : 240, 70 + i * 8, u), lerp(80, CUBE.base - CUBE.s * f - 3, u) - Math.sin(u * Math.PI) * 30); }
    // a 7-storey building slides in beside it, same height
    const kb = easeOut(seg(lt, w(17.5), w(19)));
    if (kb > 0) building(Math.round(lerp(250, 158, kb)), CUBE.base, 30, CUBE.s, 0.5);
    squareFolk(t);
    blitLo();
    // the counter
    const kc = seg(lt, w(2), w(2) + 0.4);
    if (kc > 0) {
      text("ALL GOLD EVER MINED", WIDTH / 2, 80, 48, C.ink, { alpha: kc });
      text(f >= 1 ? "≈ 220,000 t" : fmt(Math.floor(220 * f) * 1000) + " t", WIDTH / 2, 160, 72, C.gold, { alpha: kc });
    }
    // ≈ 23 m: a dimension line on the left
    const km = seg(lt, w(11), w(11) + 0.5);
    if (km > 0) hfade(km, () => {
      const x = X(c.x0 - 6), y0 = X(CUBE.base - CUBE.s), y1 = X(CUBE.base);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.moveTo(x - 18, y0); ctx.lineTo(x + 18, y0); ctx.moveTo(x - 18, y1); ctx.lineTo(x + 18, y1); ctx.stroke();
      text("≈ 23 m", x - 30, (y0 + y1) / 2, 56, C.ink, { align: "right" });
    });
    if (kb > 0) text("7 STOREYS", X(173), X(CUBE.base - CUBE.s) - 50, 44, C.ink, { alpha: seg(lt, w(19), w(19) + 0.4) });
    label("STILL HERE", X(c.x0 + CUBE.s / 2), 1020, { k: seg(lt, w(25), w(25) + 0.4), size: 40 });
    // opening: the gold "?" card from g2 zooms to fill the screen, then opens onto the square
    const kz = seg(lt, 0, 0.7);
    if (kz < 1) {
      const b = cardBox(5), z = easeInOut(kz);
      const x = lerp(X(b.x), 0, z), y = lerp(X(b.y), 0, z), ww = lerp(X(b.w), WIDTH, z), hh = lerp(X(b.h), H, z);
      ctx.save(); ctx.globalAlpha = 1 - seg(kz, 0.6, 1);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, WIDTH, H);
      ctx.fillStyle = "#2a2010"; ctx.fillRect(x, y, ww, hh); ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.strokeRect(x, y, ww, hh);
      text("?", x + ww / 2, y + hh / 2, 120 + 300 * z, C.gold);
      ctx.restore();
    }
    fadeOut(lt, d, 0.25);
  };

  /* ================================================================ g4 · one year's slice */
  // close-up of the cube's top edge: 1 lo px = 5 cm, so the slice (≈ 37 cm) is 7 px and a person (1.6 m) is 32 px
  function closeUp(lt, t, ks) {
    sky(0, 96, "#2a1a45", "#6a3a5c");
    for (let i = 0; i < 20; i++) px(hash(i) * LO_W, hash(i + 20) * 60, 1, 1, "#6c5f93");
    const top = 100;
    for (let y = top; y < LO_H; y++) { const r = y - top; px(0, y, LO_W, 1, r % 12 === 11 ? G.line : G.front); if (r % 12 !== 11) for (let x = (Math.floor(r / 12) % 2) * 16; x < LO_W; x += 32) px(x, y, 1, 1, G.line); }
    px(0, top, LO_W, 1, G.top);
    // the slice settles from above, over the right part (where the carts tipped)
    const th = 7, drop = Math.round((1 - easeOut(ks)) * 40);
    if (ks > 0) faded(Math.min(1, ks * 3), () => { px(70, top - th - drop, 170, th, G.new); px(70, top - th - drop, 170, 1, G.hi); px(70, top - drop - 1, 170, 1, G.new2); });
    // a person stands on the old top, next to the slice's edge
    big(52, top, 2, () => T.person(0, 0, { t, face: 1, cloth: "#2e86c1", skin: "#c68a5c", skin2: "#9c6640" }));
    // a ruler by the slice's edge
    if (ks >= 1) { px(64, top - th, 2, th, "#f4ecff"); for (let i = 0; i <= th; i += 2) px(62, top - i, 4, 1, "#f4ecff"); }
  }
  SC.slice = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const zin = easeInOut(seg(lt, w(5.5), w(6.8))), zout = lt > w(16) ? 1 : 0;
    const close = lt > w(6.8) && lt < w(16);
    if (!close) {
      duskSquare(t);
      building(158, CUBE.base, 30, CUBE.s, 0.5);
      // carts roll in from both edges and tip their gold up onto the roof
      const kc = seg(lt, 0.2, w(4)), tipped = lt > w(4.5);
      const slices = [];
      if (tipped || zout > 0) slices.push({ th: 1, a: 1 });
      const c = cube(CUBE.cx, CUBE.base, CUBE.s, { slices });
      if (zout <= 0) {
        for (let i = 0; i < 3; i++) {
          cart(lerp(-14 - i * 14, 40 - i * 12, easeOut(kc)), 128, 1, !tipped);
          cart(lerp(254 + i * 14, 186 + i * 12, easeOut(kc)), 128, -1, !tipped);
        }
        const kt = seg(lt, w(3.5), w(5));
        if (kt > 0 && kt < 1) for (let i = 0; i < 18; i++) { const u = clamp(kt * 1.6 - (i % 6) * 0.1, 0, 1); if (u <= 0 || u >= 1) continue; const from = i % 2 ? 40 : 186; px(lerp(from, 70 + (i * 7) % 50, u), lerp(120, c.top - 2, u) - Math.sin(u * Math.PI) * 26, 2, 2, G.front); }
      }
      squareFolk(t);
      const z = lerp(1, 3, zin * (1 - zout));
      blitZoom(c.x0 + 30, CUBE.base - CUBE.s, z);
      if (zout <= 0) label("1 YEAR OF MINING ≈ 3,600 t", WIDTH / 2, 120, { k: seg(lt, w(1), w(1) + 0.4) * (1 - zin), size: 48, bg: C.gold });
      const kp = seg(lt, w(16.2), w(16.2) + 0.4);
      const fo = 1 - seg(lt, w(16), w(16) + 0.3); if (fo > 0 && zout) dimAll(fo * 0.8);
      if (kp > 0) {
        text("+1.7%", 1560, 250, 150, C.gold, { alpha: kp });
        body("a year", 1560, 360, 52, C.ink, { alpha: kp });
        label("1 YEAR", X(c.x0 - 18), X(c.top), { k: kp, size: 34, bg: G.new });
      }
    } else {
      closeUp(lt, t, seg(lt, w(7), w(10)));
      blitLo();
      const kr = seg(lt, w(10), w(10.5));
      if (kr > 0) {
        text("≈ 37 cm", X(120), X(100 - 7) - 90, 72, C.ink, { alpha: kr });
        hfade(kr, () => { ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(120), X(93) - 45); ctx.lineTo(X(120), X(93) - 8); ctx.stroke(); });
      }
      label("LESS THAN HALF A METRE", WIDTH / 2 + 300, 200, { k: seg(lt, w(11.5), w(12)), size: 44 });
      // a quick flash on the cut in and out
      const fl = 1 - seg(lt, w(6.8), w(6.8) + 0.3); if (fl > 0) dimAll(fl * 0.8);
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ g5 · the rushes */
  // a Pacific-centred world map: x = (lon − 30°) × 0.8 (lon wrapped east of 30°W), y = (75° − lat) × 0.8 + 5
  const LON = (lon) => ((lon < -30 ? lon + 360 : lon) - 30) * 0.8, LAT = (lat) => (75 - lat) * 0.8 + 5;
  const LAND = {
    namerica: [[-165, 65], [-140, 70], [-100, 72], [-80, 70], [-65, 60], [-55, 50], [-70, 43], [-76, 35], [-81, 25], [-97, 26], [-97, 20], [-87, 15], [-80, 8], [-85, 10], [-105, 20], [-112, 30], [-117, 33], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 60]],
    samerica: [[-80, 8], [-60, 10], [-50, 0], [-35, -7], [-40, -22], [-50, -30], [-58, -38], [-65, -45], [-70, -55], [-75, -50], [-73, -35], [-71, -18], [-81, -5], [-78, 2]],
    asia: [[30, 70], [60, 70], [80, 73], [110, 76], [140, 72], [180, 68], [190, 66], [175, 62], [160, 58], [155, 50], [140, 45], [130, 35], [122, 30], [120, 22], [108, 20], [105, 10], [100, 13], [98, 8], [93, 20], [80, 15], [77, 8], [72, 20], [60, 25], [50, 30], [43, 12], [32, 30], [30, 40]],
    africa: [[20, 37], [32, 31], [43, 12], [51, 11], [40, -3], [40, -15], [33, -27], [25, -34], [20, -34], [20, 37]],
    australia: [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [145, -39], [138, -35], [131, -32], [115, -34]],
    japan: [[130, 31], [136, 34], [141, 36], [142, 43], [140, 41], [135, 36]],
    indonesia: [[95, 5], [105, -6], [115, -8], [125, -9], [140, -9], [150, -10], [145, -3], [131, -1], [120, 1], [110, 2], [100, 2]],
    nz: [[172, -35], [178, -38], [174, -42], [167, -46], [170, -42]],
  };
  function fillPoly(pts, oy, c, c2) {   // scanline fill, pts in lo px
    const ys = pts.map((p) => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs = [], yy = y + 0.5;
      for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + (yy - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) px(a, y + oy, b - a, 1, (y % 7 === 3 && c2) ? c2 : c); }
    }
  }
  function worldMap(oy, t, lit) {
    T.sea(t, 0, { speed: 0.4 });
    for (const [k, poly] of Object.entries(LAND)) fillPoly(poly.map(([lo, la]) => [k === "africa" ? (lo - 30) * 0.8 : LON(lo), LAT(la)]), oy, "#6aa84f", "#5a9443");
    // the gold fields, lit
    const spot = (x, y, a) => { if (a <= 0) return; faded(a, () => { disc(x, y + oy, 4, "rgba(255,210,63,.35)"); disc(x, y + oy, 2, C.gold); px(x - 1, y + oy - 1, 1, 1, G.hi); }); };
    spot(LON(-121), LAT(38.5), lit[0]); spot(LON(145), LAT(-37), lit[1]); spot(LON(149), LAT(-33), lit[1]);
  }
  // a stream of tiny prospectors from (ax, ay) to (bx, by)
  function stream(ax, ay, bx, by, oy, k, t, n = 10) {
    for (let i = 0; i < n; i++) {
      const u = ((t * 0.25 + i / n) % 1); if (u > k) continue;
      const x = lerp(ax, bx, u), y = lerp(ay, by, u) + Math.sin(u * Math.PI) * -6 + oy;
      px(x - 1, y - 4, 3, 1, "#3a2414"); px(x, y - 3, 1, 1, "#e8c49a"); px(x, y - 2, 1, 2, i % 2 ? "#c0392b" : "#2e86c1"); if (i % 3 === 0) px(x + 1, y - 2, 2, 1, "#9aa3b5");
    }
  }
  SC.rush = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const up = easeInOut(seg(lt, w(12), w(13))), late = seg(lt, w(27.5), w(28.5));
    if (late < 1) {
      const oy = Math.round(-up * 60);
      worldMap(oy, t, [seg(lt, w(4), w(4) + 0.4), seg(lt, w(9), w(9) + 0.4)]);
      stream(LON(-75), LAT(40), LON(-121), LAT(38.5), oy, seg(lt, w(4), w(8)), t, 12);
      stream(LON(-150), LAT(25), LON(-122), LAT(37.5), oy, seg(lt, w(4.5), w(8)), t, 6);
      stream(0, LAT(5), LON(145), LAT(-37), oy, seg(lt, w(9), w(12)), t, 12);
      if (up > 0) { lx.fillStyle = `rgba(18,13,29,${up * 0.9})`; lx.fillRect(0, 0, LO_W, LO_H); }
      blitLo();
      hfade(1 - up, () => {
        label("CALIFORNIA 1848–49", X(LON(-121)) - 20, X(LAT(38.5)) + 90, { k: seg(lt, w(4), w(4) + 0.4), size: 40, bg: C.gold });
        label("AUSTRALIA 1851", X(LON(147)), X(LAT(-37)) + 90, { k: seg(lt, w(9), w(9) + 0.4), size: 40, bg: C.gold });
        where("GOLD RUSHES", "1848–1850s", lt, w(12) + 0.6);
      });
      // two bars: gold mined in the world each year
      if (up > 0) hfade(up * (1 - late), () => {
        text("WORLD GOLD MINED PER YEAR", WIDTH / 2, 260, 52, C.ink);
        const base = 900, sc = 2.6, bars = [["1840s", 57, w(13)], ["1850s", 198, w(15)]];
        bars.forEach(([lab, v, a], i) => {
          const k = easeOut(seg(lt, a, a + 1.0)), bx = 700 + i * 380, h = v * sc * k;
          ctx.fillStyle = i ? C.gold : "#b8862e"; ctx.fillRect(bx - 110, base - h, 220, h);
          ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(bx - 110, base - h, 220, 10);
          text(lab, bx, base + 60, 48, C.ink);
          if (k > 0.2) text(`${Math.round(v * k)} t`, bx, base - h - 50, 56, C.gold);
        });
        ctx.fillStyle = C.line; ctx.fillRect(480, base, 960, 6);
        const kx = seg(lt, w(16.5), w(16.5) + 0.4);
        if (kx > 0) {
          ctx.save(); ctx.globalAlpha *= kx; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath();
          ctx.moveTo(1240, base - 57 * 2.6); ctx.lineTo(1280, base - 57 * 2.6); ctx.lineTo(1280, base - 198 * 2.6); ctx.lineTo(1240, base - 198 * 2.6); ctx.stroke(); ctx.restore();
          text("×3.5", 1300, base - 128 * 2.6, 84, C.gold, { align: "left", alpha: kx });
        }
        body("estimates (Soetbeer)", WIDTH / 2, 1010, 30, C.muted);
      });
      if (late > 0) dimAll(late);
      return;
    }
    // "three times a thin slice is still a thin slice": an unlabelled cube, one slice, then three
    duskSquare(t);
    const k1 = seg(lt, w(29), w(30)), k3 = seg(lt, w(33), w(35));
    const sl = [];
    sl.push({ th: 1, drop: (1 - easeOut(k1)) * 30, a: k1 > 0 ? 1 : 0 });
    if (k1 >= 1) sl[0].drop = 0;
    for (let i = 0; i < 2; i++) { const kk = seg(lt, w(33) + i * 0.35, w(33) + i * 0.35 + 0.5); sl.push({ th: 1, drop: (1 - easeOut(kk)) * 30, a: kk > 0 ? 1 : 0, c: i ? G.new : G.new2 }); }
    // slices with a drop are drawn floating; settle them in order
    const settled = sl.filter((x) => !x.drop || x.drop < 0.5).map((x) => ({ ...x, drop: 0 }));
    const c = cube(CUBE.cx - 10, CUBE.base, CUBE.s, { slices: settled });
    sl.filter((x) => x.drop >= 0.5 && x.a > 0).forEach((x) => { px(c.x0, c.top - 1 - Math.round(x.drop), CUBE.s, 1, G.new); });
    squareFolk(t);
    blitZoom(CUBE.cx - 10, CUBE.base - CUBE.s, 1 + 0.5 * easeInOut(seg(lt, w(31), w(33))));
    const kl = seg(lt, w(35), w(35) + 0.4);
    if (k1 > 0.5) text(k3 > 0.8 ? "3 SLICES" : "1 SLICE", WIDTH / 2, 110, 64, G.new, { alpha: Math.min(1, k1 * 2) });
    if (kl > 0) body("still a thin slice", WIDTH / 2, 195, 56, C.ink, { alpha: kl });
    const din = 1 - seg(lt, w(28.5), w(28.5) + 0.4); if (din > 0) dimAll(din);
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ g6 · prices in Britain */
  // Bank of England, "A millennium of macroeconomic data for the UK" v3.1, sheet A1, consumer price index (cost of living)
  const CPI = { 1840: 1.2816, 1841: 1.2584, 1842: 1.1868, 1843: 1.091, 1844: 1.1268, 1845: 1.1304, 1846: 1.2646, 1847: 1.355, 1848: 1.1599, 1849: 1.1125,
    1850: 1.065, 1851: 1.0427, 1852: 1.057, 1853: 1.2226, 1854: 1.3192, 1855: 1.3452, 1856: 1.3523, 1857: 1.321, 1858: 1.1868, 1859: 1.1984,
    1860: 1.2924, 1861: 1.3076, 1862: 1.2995, 1863: 1.2476, 1864: 1.2333, 1865: 1.2548, 1866: 1.3344, 1867: 1.4051, 1868: 1.3631, 1869: 1.2736,
    1870: 1.279, 1871: 1.3148, 1872: 1.3702, 1873: 1.381, 1874: 1.3183, 1875: 1.2986, 1876: 1.3013, 1877: 1.3004, 1878: 1.2611, 1879: 1.2047,
    1880: 1.2288, 1881: 1.2136, 1882: 1.2154, 1883: 1.2154, 1884: 1.1736, 1885: 1.1329, 1886: 1.1227, 1887: 1.1001, 1888: 1.0978, 1889: 1.1069,
    1890: 1.1114, 1891: 1.1204, 1892: 1.125, 1893: 1.1035, 1894: 1.0741, 1895: 1.0594, 1896: 1.0571, 1897: 1.0786, 1898: 1.0978, 1899: 1.0865 };
  const AVG40 = [...Array(10).keys()].reduce((a, i) => a + CPI[1840 + i], 0) / 10;   // ≈ 1.197
  SC.rushprices = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 30; i++) px(hash(i) * LO_W, hash(i + 30) * LO_H, 1, 1, C.line);
    // a row of London roofs and chimneys at the bottom
    for (let i = 0; i < 16; i++) { const x = i * 16, h = 8 + Math.round(hash(i + 7) * 8); px(x, LO_H - h, 15, h, "#2a2140"); px(x + 3, LO_H - h - 4, 2, 4, "#2a2140"); if (Math.sin(t + i) > 0.6) px(x + 3, LO_H - h - 7 - (t * 3 + i) % 4, 2, 2, "#4a3c66"); }
    blitLo();
    // the chart
    const cx0 = 200, cx1 = 1760, cy0 = 230, cy1 = 900, vmin = 0.98, vmax = 1.56;
    const PX = (y) => cx0 + (cx1 - cx0) * (y - 1840) / 60, PY = (v) => cy1 - (cy1 - cy0) * (v - vmin) / (vmax - vmin);
    ctx.fillStyle = "rgba(18,13,29,.9)"; ctx.fillRect(cx0 - 40, cy0 - 40, cx1 - cx0 + 80, cy1 - cy0 + 80);
    ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.strokeRect(cx0 - 40, cy0 - 40, cx1 - cx0 + 80, cy1 - cy0 + 80);
    text("PRICES IN BRITAIN", WIDTH / 2, 100, 60, C.ink);
    body("cost of living, year by year", WIDTH / 2, 160, 36, C.muted);
    // the rush years, a gold strip under the axis
    ctx.fillStyle = C.gold; ctx.fillRect(PX(1849), cy1 + 14, PX(1860) - PX(1849), 16);
    text("RUSH", (PX(1849) + PX(1860)) / 2, cy1 + 62, 40, C.gold);
    for (const y of [1840, 1870, 1900]) text(String(y), PX(y), cy1 + 62, 40, C.muted);
    // the 1840s average, dashed
    ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = C.muted; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx0, PY(AVG40)); ctx.lineTo(cx1, PY(AVG40)); ctx.stroke(); ctx.restore();
    text("1840s", cx1 - 10, PY(AVG40) - 34, 36, C.muted, { align: "right" });
    // the line draws itself in four steps that follow the words
    const steps = [[0.2, w(12), 1840, 1856], [w(13), w(19.5), 1856, 1873], [w(20), w(22.5), 1873, 1880], [w(23), w(29), 1880, 1899]];
    let yr = 1840;
    for (const [a, b, y0, y1] of steps) if (lt >= a) yr = lerp(y0, y1, easeInOut(seg(lt, a, b)));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.lineJoin = "round"; ctx.beginPath();
    const cpiAt = (y) => { const a = Math.floor(y), b = Math.min(1899, a + 1); return lerp(CPI[a], CPI[b], y - a); };
    for (let y = 1840; y <= Math.floor(yr); y++) y === 1840 ? ctx.moveTo(PX(y), PY(CPI[y])) : ctx.lineTo(PX(y), PY(CPI[y]));
    ctx.lineTo(PX(yr), PY(cpiAt(yr))); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(PX(yr), PY(cpiAt(yr)), 13, 0, 7); ctx.fill();
    // +30% from the 1851 low to 1856
    const kb = seg(lt, w(9), w(9) + 0.5);
    if (kb > 0 && yr >= 1856) hfade(kb, () => {
      const x = PX(1856) + 34;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(PX(1851), PY(CPI[1851]) + 4); ctx.lineTo(x, PY(CPI[1851]) + 4); ctx.lineTo(x, PY(CPI[1856]) - 20); ctx.stroke();
      text("+30%", x - 10, PY(1.5), 64, C.ink);
      body("from the 1851 low", x - 10, PY(1.5) + 52, 36, C.muted);
    });
    const kf = seg(lt, w(26), w(26) + 0.5);
    if (kf > 0) label("1890s: BELOW 1840s", PX(1890), PY(1.0) - 10, { k: kf, size: 44, bg: C.gold });
    body("Bank of England, A millennium of macroeconomic data", WIDTH / 2, 1050, 28, C.muted, { alpha: seg(lt, 0.3, 0.8) });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ g7 · three price meters */
  SC.meters = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const U = 5, SH = 82;   // 1× = 5 lo px above the shelf
    const kc = easeOut(seg(lt, w(1.5), w(4))), kr = easeInOut(seg(lt, w(10.5), w(14)));
    // gold rises to 1.3, holds, sinks back to about 1
    const gUp = easeOut(seg(lt, w(16.5), w(19))), gDown = easeInOut(seg(lt, w(25), w(29.5)));
    const vals = [lerp(1, 10, kc), lerp(1, 37, kr), 1 + 0.3 * gUp - 0.26 * gDown];
    // the camera tilts up to follow Rome, then comes back
    const camUp = Math.min(easeInOut(seg(lt, w(11), w(14))), 1 - easeInOut(seg(lt, w(14.8), w(16.3))));
    const cam = Math.round(camUp * 140);   // lo px
    // wall
    lx.fillStyle = "#2a2140"; lx.fillRect(0, 0, LO_W, LO_H);
    for (let y = -200; y < LO_H; y += 10) { const yy = y + (cam % 10); px(0, yy, LO_W, 1, "#33284d"); }
    px(0, SH + cam, LO_W, 4, "#8a5a2b"); px(0, SH + cam, LO_W, 1, "#a8763e"); px(0, SH + cam + 4, LO_W, 80, "#1a1328");
    const xs = [50, 120, 190], cols = ["#efe2c2", "#c9a868", C.gold];
    xs.forEach((x, i) => {
      const top = SH + cam - Math.round(vals[i] * U);
      px(x - 9, top, 18, SH + cam - top, cols[i]); px(x - 9, top, 2, SH + cam - top, "rgba(255,255,255,.35)"); px(x + 7, top, 2, SH + cam - top, "rgba(0,0,0,.25)");
      // the icon on the shelf front
      const iy = SH + cam + 13;
      if (i === 0) { coin(x - 5, iy, 6); cowrie(x + 8, iy, 1); }
      if (i === 1) sack(x - 4, iy - 4);
      if (i === 2) { px(x - 7, iy - 2, 14, 6, G.front); px(x - 5, iy - 2, 10, 2, G.hi); px(x - 7, iy + 3, 14, 1, G.line); }
    });
    blitLo();
    // tags on top of each bar
    const tagTxt = [`×${Math.round(vals[0])}`, `×${Math.round(vals[1])}`, `×${vals[2].toFixed(1)}`];
    xs.forEach((x, i) => {
      const k = seg(lt, i === 0 ? 0.2 : i === 1 ? 0.35 : 0.5, (i === 0 ? 0.2 : i === 1 ? 0.35 : 0.5) + 0.4);
      const top = X(SH + cam - vals[i] * U);
      const ty = Math.max(70, top - 60);
      label(tagTxt[i], X(x), ty, { k, size: 56, bg: i === 2 ? C.gold : "#fff8e8" });
      if (i === 1 && top < 0) text("↑", X(x) + 150, 70, 60, C.ink);
    });
    // names and what was measured
    const nm = [["COWRIES", "a silver dollar, in shells", "Dahomey · 1840s → 1880s"], ["ROME", "a sack of wheat", "Egypt · AD 100 → 293"], ["GOLD", "cost of living", "Britain · 1851 → 1890s"]];
    nm.forEach(([a, b, c], i) => {
      const k = seg(lt, i === 0 ? w(1) : i === 1 ? w(10) : w(16), (i === 0 ? w(1) : i === 1 ? w(10) : w(16)) + 0.4);
      const y = X(SH + cam) + 260;
      text(a, X(xs[i]), y - 70, 52, i === 2 ? C.gold : C.ink, { alpha: Math.max(0.35, k) });
      body(b, X(xs[i]), y, 38, C.ink, { alpha: k });
      body(c, X(xs[i]), y + 48, 34, C.muted, { alpha: k });
    });
    text("HOW MUCH MORE", 60, 70 + X(cam), 44, C.muted, { align: "left", alpha: seg(lt, 0.2, 0.6) });
    text("IT COST", 60, 125 + X(cam), 44, C.muted, { align: "left", alpha: seg(lt, 0.2, 0.6) });
    // a soft glow on the gold bar at the end
    const kg = seg(lt, w(30), w(31.5));
    if (kg > 0) { const g = 0.7 + 0.3 * Math.sin(t * 2.5); ctx.save(); ctx.globalAlpha = kg * g; const gr = ctx.createRadialGradient(X(190), X(SH - 6), 0, X(190), X(SH - 6), 320); gr.addColorStop(0, "rgba(255,210,63,.35)"); gr.addColorStop(1, "rgba(255,210,63,0)"); ctx.fillStyle = gr; ctx.fillRect(X(190) - 320, X(SH - 6) - 320, 640, 640); ctx.restore(); }
    label("CLOSEST TO NO CAVE", X(190) - 140, 200, { k: seg(lt, w(31), w(31) + 0.5), size: 44, bg: C.gold });
    fadeOut(lt, d, 0.4);
  };

  /* ================================================================ g8 · today: no cave */
  // LBMA PM yearly averages, $/oz, 2015–2025 (2015 and 2025 as in SCRIPT.md's fact check)
  const PRICE = [1160, 1251, 1257, 1268, 1393, 1770, 1799, 1800, 1941, 2386, 3432];
  // world mine output, tonnes, 2015–2025 (World Gold Council; drawn as bars without numbers)
  const MINED = [3360, 3510, 3575, 3655, 3595, 3485, 3570, 3625, 3645, 3650, 3672];
  function openPit(t) {
    sky(0, 60, "#7fc4f0", "#bfe3f7");
    // terraced walls of the pit
    const cols = ["#b5874f", "#a87a46", "#9a6e3c", "#8c6234", "#7d572e", "#6e4c28"];
    for (let i = 0; i < 6; i++) { const y = 60 + i * 12, inset = i * 16; px(0, y, LO_W, 12, cols[i]); px(inset, y, LO_W - inset * 2, 1, "#c99a62"); }
    for (let i = 0; i < 6; i++) { const y = 60 + i * 12, inset = i * 16; px(0, y, inset, 12, "#5e4024"); px(LO_W - inset, y, inset, 12, "#5e4024"); }
    // haul trucks crawl along the benches
    for (let i = 0; i < 3; i++) {
      const y = 70 + i * 12, dir = i % 2 ? -1 : 1, x = ((t * 6 * dir + i * 80) % 260 + 260) % 260 - 10;
      px(x - 8, y - 6, 12, 5, "#e8b830"); px(x + (dir > 0 ? 4 : -10), y - 8, 6, 7, "#d6a020"); px(x + (dir > 0 ? 6 : -9), y - 7, 3, 2, "#7fc4f0");
      disc(x - 5, y - 1, 2, "#2a2140"); disc(x + 3, y - 1, 2, "#2a2140");
    }
  }
  SC.nocave = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    openPit(t);
    // the tunnel mouth on the lowest bench, and Wren's trip into it
    const tx = 196, tb = 131;
    for (let i = 0; i < 14; i++) { const hw = Math.round(7 * Math.sqrt(1 - Math.pow(1 - i / 14, 2))); px(tx - hw, tb - 14 + i, hw * 2, 1, "#0d0814"); }
    px(tx - 9, tb - 15, 18, 2, "#5e3b1a"); px(tx - 9, tb - 15, 2, 15, "#5e3b1a"); px(tx + 7, tb - 15, 2, 15, "#5e3b1a");
    const kIn = seg(lt, w(18), w(21)), kOut = seg(lt, w(25.5), w(27)), shrug = seg(lt, w(28), w(30));
    let L = null;
    if (kIn > 0 && kIn < 1) L = wren(lerp(140, tx, kIn), tb, t, { lamp: 1, alpha: 1 - seg(kIn, 0.8, 1) });
    if (kOut > 0) L = wren(lerp(tx, 170, easeOut(kOut)), tb, t, { lamp: 1, dusty: true, nugget: kOut >= 1, flip: kOut < 1, shrug: shrug > 0 && shrug < 1 ? shrug : 0 });
    blitLo();
    if (L && kOut === 0) glow(L.lampX, L.lampY, 14, 1);
    if (lt > w(21) && kOut === 0) glow(tx, tb - 6, 6 + Math.sin(t * 8), 0.6);
    // two panels slide in from above
    const kp = easeOut(seg(lt, w(2), w(2) + 0.6)), oy = lerp(-700, 0, kp);
    if (kp > 0) {
      const P = (x, y, ww, hh) => { ctx.fillStyle = "#120d1d"; ctx.fillRect(x, y + oy, ww, hh); ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.strokeRect(x, y + oy, ww, hh); };
      // left: the price, yearly averages
      P(60, 40, 880, 600);
      text("GOLD PRICE, $ PER OUNCE", 500, 95 + oy, 40, C.ink);
      const kl = seg(lt, w(3), w(11)), n = PRICE.length;
      const LX = (i) => 160 + i * 680 / (n - 1), LY = (v) => 560 - (v - 1000) / 2600 * 390;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.lineJoin = "round"; ctx.beginPath();
      const upto = kl * (n - 1);
      for (let i = 0; i <= Math.floor(upto); i++) i ? ctx.lineTo(LX(i) + oy * 0, LY(PRICE[i]) + oy) : ctx.moveTo(LX(i), LY(PRICE[i]) + oy);
      if (upto < n - 1) { const a = Math.floor(upto), f = upto - a; ctx.lineTo(lerp(LX(a), LX(a + 1), f), lerp(LY(PRICE[a]), LY(PRICE[a + 1]), f) + oy); }
      ctx.stroke();
      text("2015", LX(0), 605 + oy, 34, C.muted); text("2025", LX(n - 1), 605 + oy, 34, C.muted);
      text("$1,160", LX(0) + 10, LY(PRICE[0]) - 50 + oy, 40, C.ink, { alpha: seg(lt, w(3), w(3) + 0.4) });
      const ke = seg(lt, w(9), w(9) + 0.4);
      text("$3,432", LX(n - 1) - 30, LY(PRICE[n - 1]) - 50 + oy, 40, C.ink, { alpha: ke, align: "right" });
      text("×3", 300, 240 + oy, 90, C.gold, { alpha: seg(lt, w(9), w(9) + 0.5) });
      body("yearly averages", 300, 310 + oy, 30, C.muted, { alpha: seg(lt, w(9), w(9) + 0.5) });
      // right: what the mines dug each year
      P(980, 40, 880, 600);
      text("GOLD MINED EACH YEAR", 1420, 95 + oy, 40, C.ink);
      const kb = seg(lt, w(18), w(23));
      for (let i = 0; i < MINED.length; i++) {
        const k = seg(kb, i / MINED.length, (i + 1) / MINED.length); if (k <= 0) continue;
        const h = MINED[i] / 3700 * 290 * easeOut(k), bx = 1040 + i * 72;
        ctx.fillStyle = i === MINED.length - 1 ? C.gold : "#b8862e"; ctx.fillRect(bx, 560 - h + oy, 52, h);
      }
      text("2015", 1066, 605 + oy, 34, C.muted); text("2025", 1066 + 10 * 72, 605 + oy, 34, C.muted);
      label("MINES: +<1% A YEAR", 1420, 185 + oy, { k: seg(lt, w(22), w(22) + 0.4), size: 48, bg: C.gold });
    }
    label("MORE PAY FOR EACH OUNCE DUG", 500, 720, { k: seg(lt, w(12.5), w(12.5) + 0.4) * (1 - seg(lt, w(18), w(18) + 0.3)), size: 40 });
    if (shrug > 0) label("JUST A LITTLE", X(172), X(106), { k: shrug, size: 36 });
    stamp("NO CAVE", 760, 790, seg(lt, w(31) + 0.3, w(31) + 0.6), { size: 90, color: "#cfc6ea", rot: -0.1 });
    fadeOut(lt, d, 0.4);
  };

  /* ================================================================ g10 · today's money, and the teaser */
  function phone(x, y) {   // 40×64, top-left at (x, y)
    px(x + 2, y + 2, 40, 64, "rgba(0,0,0,.4)");
    px(x, y, 40, 64, "#1a1026"); px(x + 2, y + 5, 36, 52, "#f4ecff"); px(x + 16, y + 2, 8, 1, "#3a2d5c"); disc(x + 20, y + 60, 2, "#3a2d5c");
    px(x + 2, y + 5, 36, 10, "#2e86c1");
    for (let i = 0; i < 4; i++) px(x + 5, y + 34 + i * 5, 30 - (i % 2) * 8, 2, "#cfc6ea");
  }
  function note(x, y, c, c2) { px(x + 1, y + 1, 30, 16, "rgba(0,0,0,.4)"); px(x, y, 30, 16, c); px(x + 2, y + 2, 26, 12, c2); disc(x + 8, y + 8, 3, c); }
  SC.question = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const p1 = seg(lt, w(9.5), w(10.5)), p2 = seg(lt, w(17.5), w(18.5));
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 40; i++) px(hash(i) * LO_W, hash(i + 40) * LO_H, 1, 1, C.line);
    // today's money: a phone with a balance, and two notes
    faded(1 - p1, () => { phone(60, 56); note(118, 76, "#4f7fb8", "#8fb4e0"); note(134, 98, "#3f8a4f", "#9ccf9a"); });
    // the row of Wrens slides in above
    const kr = easeOut(seg(lt, w(6), w(7.5)));
    if (kr > 0) faded(1 - p1, () => {
      for (let i = 0; i < 6; i++) {
        const b = { x: 6 + i * 39, y: Math.round(lerp(-40, 6, kr)), w: 36, h: 32 };
        px(b.x, b.y, b.w, b.h, i === 5 ? "#2a2010" : C.panel); px(b.x, b.y, b.w, 1, i === 5 ? C.gold : C.line); px(b.x, b.y + b.h - 1, b.w, 1, i === 5 ? C.gold : C.line);
        mini(i, b.x + b.w / 2, b.y + 17, t);
      }
    });
    // the cube, small, in the middle; then Wren sits on top, lantern off
    const kcube = seg(lt, w(10), w(11));
    let c = null;
    if (kcube > 0) faded(kcube, () => { c = cube(120, 112, 40, {}); });
    const kw = seg(lt, w(18), w(19));
    if (kw > 0 && c) faded(kw, () => {
      const sw = Math.round(Math.sin(t * 4)); px(c.x0 + 18 + sw, c.top - 1, 2, 3, "#b8407c"); px(c.x0 + 24 - sw, c.top - 1, 2, 3, "#b8407c");
      wren(c.x0 + 22, c.top + 1, 0, { lamp: 0 });
    });
    blitLo();
    hfade(1 - p1, () => {
      text("€ 1,000", X(80), X(74), 44, "#1a1026", { shadow: false });
      text("€20", X(137), X(84), 44, "#fff");
      text("$20", X(153), X(106), 44, "#fff");
      label("NOT TIED TO GOLD", X(196), X(64), { k: seg(lt, w(3), w(3) + 0.4), size: 44, bg: "#cfc6ea" });
      const kq = seg(lt, w(5), w(5) + 0.5);
      if (kq > 0) text("?", X(206), X(98), 240, C.gold, { alpha: kq * 0.7 });
      if (kr > 0) text("WHO CAN MAKE IT? · LATER EPISODES", WIDTH / 2, X(46), 44, C.ink, { alpha: kr });
    });
    if (kcube > 0) body("why is gold so hard to flood?", WIDTH / 2, 260, 56, C.ink, { alpha: seg(lt, w(11), w(11) + 0.5) * (1 - p2) });
    // teaser: everything dims except the cube
    if (p2 > 0) {
      ctx.save(); ctx.globalAlpha = p2;
      const g = 0.6 + 0.4 * Math.sin(t * 2.5), gr = ctx.createRadialGradient(X(120), X(92), 0, X(120), X(92), 360);
      gr.addColorStop(0, `rgba(255,210,63,${0.22 * g})`); gr.addColorStop(1, "rgba(255,210,63,0)"); ctx.fillStyle = gr; ctx.fillRect(X(120) - 360, X(92) - 360, 720, 720);
      ctx.restore();
      text("NEXT · EPISODE 3", WIDTH / 2, 150, 52, C.muted, { alpha: seg(lt, w(18), w(18) + 0.5) });
      text("WHY GOLD?", WIDTH / 2, 260, 110, C.gold, { alpha: seg(lt, w(19.5), w(19.5) + 0.5) });
    }
    fadeOut(lt, d, 1.2);
  };
})();
