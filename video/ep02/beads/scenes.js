/* EP 02 · scenes for chapter 2 (Glass beads: "this time YOU are Wren").
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   w(n) = the moment word n of the narration is spoken (0-based, see SCRIPT.md), so visuals land on the words. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, hexA, pop, px, disc, person, sea, sky, palm,
    schooner, icon, text, body, label, stamp, where, blitLo, fadeOut, SC, ground, hut, cave, bead } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels
  const BEADC = ["#e0402f", "#f4ecff", "#2e5fb8", "#ffd23f", "#2f9e6a", "#e0402f", "#ffd23f"];

  /* ---------------------------------------------------------------- chapter props */
  // a label that can fade out (label() only pops in)
  function lab(str, x, y, k, a = 1, o = {}) { if (k <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; label(str, x, y, { k, ...o }); ctx.restore(); }
  // the accori: a round, sky-blue bead with a sea-green core (NOT the chevron bead)
  function accori(cx, cy, s = 1, o = {}) {
    const r = Math.round(4 * s);
    if (o.glow) disc(cx, cy, r + 2 + Math.round(o.glow * 2), hexA("#9fe0ff", 0.25 + 0.2 * o.glow));
    disc(cx + 1, cy + 1, r, "rgba(0,0,0,.35)");
    disc(cx, cy, r, o.copy ? "#5d8fd8" : "#7fc8ee");
    disc(cx + Math.round(s * 0.6), cy + Math.round(s * 0.6), Math.max(1, r - Math.round(1.5 * s)), o.copy ? "#4a78c0" : "#46b8a0");
    disc(cx, cy, Math.max(1, Math.round(r * 0.28)), o.copy ? "#2b4a80" : "#1d5a6a");
    px(cx - r * 0.6, cy - r * 0.6, Math.max(1, s), Math.max(1, s), "#eaf8ff");
  }
  // a small glass bead on a string
  function sbead(x, y, c, s = 3) { px(x, y, s, s, c); px(x, y, 1, 1, "rgba(255,255,255,.7)"); px(x + s - 1, y + s - 1, 1, 1, "rgba(0,0,0,.35)"); }
  // a balance scale; returns the pan tops so the caller can put things on them. tilt > 0 = left pan down
  function balance(cx, base, tilt, o = {}) {
    const hgt = o.h || 34, top = base - hgt, L = o.L || 26, tl = Math.round(tilt);
    px(cx - 1, top, 3, hgt, C.wood2); px(cx - 9, base - 2, 19, 3, C.wood2);
    for (let i = -L; i <= L; i++) px(cx + i, top - Math.round(tl * i / L), 1, 2, "#c99a4a");
    disc(cx, top, 2, C.gold);
    const pans = [[cx - L, top + tl], [cx + L, top - tl]];
    for (const [x, y] of pans) {
      for (let k = 0; k < 14; k++) { px(x - k / 2, y + k, 1, 1, "#e8d39a"); px(x + k / 2, y + k, 1, 1, "#e8d39a"); }
      px(x - 9, y + 14, 19, 2, "#c99a4a"); px(x - 7, y + 16, 15, 1, "#8a6a2a");
    }
    return { lx: pans[0][0], ly: pans[0][1] + 14, rx: pans[1][0], ry: pans[1][1] + 14 };
  }
  // a mound of gold dust (k = 0..1 full) standing on y
  function goldPile(cx, y, k) {
    const h = Math.round(6 * k);
    for (let i = 0; i < h; i++) { const hw = Math.round((h - i) * 1.4); px(cx - hw, y - 1 - i, hw * 2 + 1, 1, i % 2 ? "#ffd23f" : "#e8b830"); }
    if (h > 2) px(cx - 1, y - h, 2, 1, "#fff3a0");
  }
  function goldCoin(cx, cy, r) { disc(cx, cy, r, "#c99a1a"); disc(cx, cy, r - 1, C.gold); px(cx - 1, cy - r + 2, 2, 1, "#fff3a0"); }
  // Wren from EP 01, optionally in a trader's tricorn, scaled up (s = 1, 2, 3)
  const oc = document.createElement("canvas"); oc.width = 24; oc.height = 26;
  const ox = oc.getContext("2d");
  function wren(cx, feet, t, o = {}) {
    const s = o.s || 1;
    ox.clearRect(0, 0, 24, 26);
    Art.drawAlien(ox, 12, 24, "wren", t);
    const hop = Math.sin(t * 3 + 119 * 0.7) > 0.6 ? -1 : 0, top = 24 - 15 + hop;
    if (o.hat) { ox.fillStyle = "#1a1026"; ox.fillRect(5, top - 1, 14, 2); ox.fillRect(7, top - 4, 10, 4); ox.fillRect(9, top - 5, 6, 1); ox.fillStyle = C.gold; ox.fillRect(5, top - 1, 14, 1); }
    if (o.sparkle) { ox.fillStyle = C.gold; ox.fillRect(9, top + 4, 2, 2); ox.fillRect(13, top + 4, 2, 2); }
    if (o.sad) { ox.fillStyle = "#b8407c"; ox.fillRect(10, top + 8, 4, 1); }
    lx.save(); lx.globalAlpha *= o.alpha ?? 1; lx.imageSmoothingEnabled = false;
    if (o.flip) { lx.translate(Math.round(cx) * 2, 0); lx.scale(-1, 1); }
    lx.drawImage(oc, Math.round(cx - 12 * s), Math.round(feet - 24 * s), 24 * s, 26 * s);
    lx.restore();
  }
  function bigBasket(x, y, o = {}) {  // a basket of yams, 12×9, top-left at (x, y)
    px(x + 1, y + 9, 11, 1, "rgba(0,0,0,.3)");
    px(x, y + 3, 12, 6, "#b8862e"); px(x, y + 3, 12, 1, "#d9a84a"); px(x + 1, y + 6, 10, 1, "#9a6e24");
    px(x + 2, y, 4, 3, "#a0643a"); px(x + 6, y + 1, 4, 2, "#8a5530"); px(x + 4, y - 1, 2, 1, "#5fbf4a");
    if (o.ring) { lx.strokeStyle = o.ring; lx.lineWidth = 1; lx.strokeRect(x - 1.5, y - 2.5, 15, 13); }
  }
  function barrel(x, base) { px(x - 6, base - 14, 12, 14, "#7a4a22"); px(x - 7, base - 11, 14, 2, "#3b2615"); px(x - 7, base - 4, 14, 2, "#3b2615"); px(x - 3, base - 14, 2, 14, "#8f5a2c"); }
  function bigSack(x, base, o = {}) { px(x, base - 11, 13, 11, "#b89a64"); px(x + 2, base - 13, 9, 2, "#8c7650"); px(x + 3, base - 7, 7, 1, "#8c7650"); if (o.open) for (let i = 0; i < 9; i++) px(x + 2 + hash(i) * 9, base - 15 - hash(i + 3) * 3, 2, 2, BEADC[i % 5]); }
  function miniShip(x, y, c = "#2a2236") { px(x - 8, y, 16, 2, c); px(x - 6, y + 2, 12, 1, c); px(x, y - 11, 1, 11, c); px(x - 5, y - 10, 5, 8, c === "#2a2236" ? "#d8d0c0" : c); px(x + 1, y - 9, 4, 6, c === "#2a2236" ? "#d8d0c0" : c); }
  function kid(x, feet, cloth) { px(x - 2, feet - 1, 4, 1, "rgba(0,0,0,.3)"); px(x - 1, feet - 3, 1, 3, C.skin2); px(x + 1, feet - 3, 1, 3, C.skin2); px(x - 1, feet - 6, 3, 3, cloth); px(x - 1, feet - 9, 3, 3, C.skin); px(x - 1, feet - 10, 3, 1, "#1a1010"); px(x + 1, feet - 8, 1, 1, "#1a1010"); }
  function headwrap(x, feet, c) { px(x - 2, feet - 18, 5, 3, c); px(x + 2, feet - 17, 2, 1, c); }
  function pots(x, y) { for (let i = 0; i < 3; i++) { const cx = x + i * 7; px(cx, y - 5, 5, 5, i % 2 ? "#a0522d" : "#b8683a"); px(cx + 1, y - 6, 3, 1, "#7a3a1d"); px(cx + 1, y - 4, 1, 2, "#d08a5a"); } }
  // fire with a flicker
  function fire(cx, base, t) {
    px(cx - 8, base, 17, 2, "#3b2615"); px(cx - 6, base - 1, 13, 1, "#5e3b1a");
    for (let i = 0; i < 14; i++) { const h = 3 + Math.round(hash(i + Math.floor(t * 10)) * 7); px(cx - 6 + i, base - h, 1, h, i % 3 ? "#ff8a2a" : "#ffd23f"); }
  }
  // a cracked copy: two halves pushed apart, with shards
  function cracked(cx, cy, k) {
    const dx = Math.round(k * 3);
    lx.save(); lx.beginPath(); lx.rect(0, 0, cx, LO_H); lx.clip(); accori(cx - dx, cy + dx, 2, { copy: true }); lx.restore();
    lx.save(); lx.beginPath(); lx.rect(cx, 0, LO_W, LO_H); lx.clip(); accori(cx + dx, cy, 2, { copy: true }); lx.restore();
    for (let i = 0; i < 8; i++) px(cx + (i % 2 ? 1 : 0), cy - 8 + i * 2, 1, 2, "#ffffff");
    for (let i = 0; i < 4; i++) px(cx - 6 + hash(i) * 12, cy + 10 + k * hash(i + 2) * 4, 1, 1, "#9fc4f0");
  }
  function market(t, o = {}) {  // a coastal market: sky, sea strip, sand, palms, huts
    sky(0, 58, o.sky || "#8fd0f0", o.sky2 || "#cdebf8");
    px(0, 58, LO_W, 8, C.sea); for (let i = 0; i < 12; i++) px((hash(i) * LO_W + t * 3) % LO_W, 60 + hash(i + 4) * 5, 4, 1, C.seaHi);
    ground(66, C.sand, C.sand2);
    palm(12, 70, t, 22); palm(228, 70, t, 18);
    hut(40, 76); hut(198, 76, "#b8862e");
  }
  const crossfade = (k) => { if (k > 0 && k < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - Math.abs(k * 2 - 1)})`; ctx.fillRect(0, 0, WIDTH, H); } };

  /* ================================================================ b1 · title: "you are Wren" */
  SC.beadtitle = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    for (let i = 0; i < 80; i++) { const tw = Math.sin(t * 2 + i) > 0.3; if (tw) px(hash(i) * LO_W, hash(i + 80) * LO_H, 1, 1, i % 3 ? C.line : "#7fc8ee"); }
    const drop = easeOut(seg(lt, 0.1, 0.9)), slide = easeInOut(seg(lt, w(4), w(4) + 0.7));
    bead(Math.round(lerp(120, 62, slide)), Math.round(lerp(-12, 44, drop) + Math.sin(t * 2)), 2);
    const walk = seg(lt, w(4) + 0.2, w(4) + 1.4);
    if (walk > 0) wren(lerp(270, 172, easeOut(walk)), 106, t, { s: 3, hat: lt > w(6), sparkle: lt > w(7) && lt < w(7) + 0.8 });
    blitLo();
    const tx = lerp(WIDTH / 2, X(62), slide);
    text("CHAPTER 2", tx, 120, 40, C.muted, { alpha: seg(lt, 0.3, 0.8) });
    text("GLASS", tx, 650, 120, C.gold, { alpha: seg(lt, w(2), w(2) + 0.3) });
    text("BEADS", tx, 790, 120, C.gold, { alpha: seg(lt, w(2) + 0.15, w(2) + 0.45) });
    stamp("YOU = WREN", X(172), 960, seg(lt, w(7), w(7) + 0.25), { size: 60, color: C.pen });
    fadeOut(lt, d, 0.4);
  };

  /* ================================================================ b2 · the accori on the Gold Coast */
  const coastY = (x) => x < 70 ? 18 + x : x < 200 ? 88 - 6 * Math.sin((x - 70) / 130 * Math.PI) + (x > 170 ? (x - 170) * 0.25 : 0) : 95.5 + (x - 200) * 1.6;
  function westAfrica(t) {
    sea(t, 0, { speed: 0.3 });
    for (let x = 0; x < LO_W; x++) {
      const cy = Math.round(coastY(x));
      px(x, 0, 1, cy, "#c9a45a"); px(x, Math.max(0, cy - 22), 1, Math.min(22, cy), "#4f8a3a"); px(x, cy - 1, 1, 2, C.sand);
    }
    for (let i = 0; i < 30; i++) px(hash(i) * LO_W, hash(i + 30) * 50, 2, 1, "#b08a48");
  }
  SC.accori = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(6) - 0.15;
    if (lt < split) {
      westAfrica(t);
      const gx = 150, gy = Math.round(coastY(150)) - 3, k = seg(lt, 1.0, 1.5);
      if (k > 0) { disc(gx, gy, 3 + Math.round(Math.sin(t * 6)), hexA(C.gold, 0.5)); disc(gx, gy, 2, C.gold); }
      blitLo();
      where("WEST AFRICA", "about 500 years ago (the early 1500s)", lt, split + 0.6);
      lab("GOLD COAST", X(150), X(gy) - 110, k, 1, { size: 44, bg: C.gold });
      body("today: Ghana", X(150), X(gy) - 40, 34, C.ink, { alpha: k });
      crossfade(seg(lt, split - 0.3, split + 0.3));
      return;
    }
    market(t);
    const elder = 74, young = 168;
    person(elder, 112, { t, cloth: "#7d3c98", hair: "#d8d8d8", face: 1 });
    person(young, 112, { t, cloth: "#16a085", face: -1, arm: lt > w(23) + 0.6 ? "up" : null });
    const out = seg(lt, w(23), w(23) + 0.4);
    // the scale: the accori on the left pan, gold dust poured on the right until it balances
    const onPan = lt >= w(18), pour = seg(lt, w(18) + 0.2, w(20));
    const tilt = onPan ? lerp(5, 0, easeInOut(pour)) : 0;
    lx.save(); lx.globalAlpha = 1 - out;
    const p = balance(120, 118, tilt, { L: 34, h: 44 });
    goldPile(p.rx, p.ry, pour);
    if (pour > 0 && pour < 1) for (let i = 0; i < 5; i++) px(p.rx - 1 + (i % 2), p.ry - 30 + ((t * 60 + i * 6) % 26), 1, 2, C.gold);
    lx.restore();
    // the bead: floats up, lands on the pan, then passes from the elder to the young one
    const appear = seg(lt, w(10), w(10) + 0.5);
    if (appear > 0) {
      let bx = 120, by = 38 - Math.round(Math.sin(t * 2) * 1.5);
      if (onPan) { const k = easeInOut(seg(lt, w(18) - 0.3, w(18))); bx = lerp(120, p.lx, k); by = lerp(38, p.ly - 7, k); }
      if (lt > w(23)) {
        const k1 = easeInOut(seg(lt, w(23), w(23) + 0.4)), k2 = easeInOut(seg(lt, w(23) + 0.5, w(23) + 1.4));
        bx = lerp(lerp(p.lx, elder + 4, k1), young - 4, k2); by = lerp(lerp(p.ly - 7, 96, k1), 96, k2) - Math.sin(k2 * Math.PI) * 18;
      }
      lx.save(); lx.globalAlpha = appear; accori(Math.round(bx), Math.round(by), onPan ? 1.6 : 2.4, { glow: onPan ? 0 : 0.5 + 0.5 * Math.sin(t * 4) }); lx.restore();
    }
    // the bead workshop: closed
    const kk = seg(lt, w(26), w(26) + 0.3);
    if (kk > 0) {
      lx.save(); lx.globalAlpha = kk;
      for (let i = 0; i < 9; i++) px(222 - (9 - i), 116 - i, 2 * (9 - i) + 1, 1, i % 2 ? "#8a4a2a" : "#a0582e");
      px(219, 111, 7, 5, "#1a1010");
      for (let i = 0; i < 12; i++) { px(214 + i, 100 + i, 2, 2, C.bad); px(225 - i, 100 + i, 2, 2, C.bad); }
      lx.restore();
    }
    blitLo();
    lab("ACCORI", WIDTH / 2, 170, seg(lt, w(15) - 0.6, w(15) - 0.2), 1 - seg(lt, w(18) - 0.2, w(18)), { size: 50, bg: "#9fe0ff" });
    lab("= ITS WEIGHT IN GOLD", WIDTH / 2, 170, seg(lt, w(20), w(20) + 0.35), 1 - out, { size: 50, bg: C.gold });
    lab("ALREADY OLD", X(young), 520, seg(lt, w(23) + 1, w(23) + 1.3), 1, { size: 40 });
    lab("NO NEW ONES MADE", 1500, 680, kk, 1, { size: 40, bg: "#ffb3b3" });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ b3 · you, the trader: copies fail */
  function deck(t) {
    sky(0, 70, "#8fd0f0", "#cdebf8"); sea(t, 70, { speed: 0.6 });
    for (let x = 150; x < LO_W; x++) px(x, 66 - Math.min(5, (x - 150) * 0.2), 1, 5, C.jungle);
    px(0, 104, LO_W, 31, "#8a5a2b"); for (let x = 0; x < LO_W; x += 14) px(x, 104, 1, 31, C.wood2); px(0, 112, LO_W, 1, C.wood2); px(0, 124, LO_W, 1, C.wood2);
    px(0, 92, LO_W, 2, C.wood2); for (let x = 4; x < LO_W; x += 20) px(x, 92, 2, 12, C.wood2);
    px(26, 0, 3, 104, "#5e3b1a"); px(29, 8, 26, 50, "#f2ead6"); px(29, 8, 1, 50, "#d6ccb0");
  }
  function furnace(t, x0) {
    px(x0, 0, LO_W - x0, LO_H, "#3a2420");
    for (let y = 0; y < LO_H; y += 6) for (let x = x0 + ((y / 6) % 2) * 6; x < LO_W; x += 12) px(x, y, 11, 5, "#46302a");
    const fx = x0 + 70, fl = 0.6 + 0.4 * Math.sin(t * 13) * Math.sin(t * 7);
    for (let i = 0; i < 22; i++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((i - 11) / 11) ** 2)) * 16); px(fx - hw - 3, 60 + i, (hw + 3) * 2, 1, "#5a3a30"); }
    disc(fx, 74, 9, `rgba(255,${150 + 60 * fl},40,1)`); disc(fx, 76, 5, "#fff0a0");
    px(x0, 110, LO_W - x0, 25, "#5e3b1a"); px(x0, 110, LO_W - x0, 1, "#8a5a2b");
    person(x0 + 34, 110, { t, cloth: "#3b3b4f", face: 1, arm: "up" });
  }
  SC.copies = (lt, d, t, s) => {
    const w = (n) => word(s, n), fireAt = w(17) - 0.1, backAt = w(22) - 0.1;
    if (lt < fireAt) {
      deck(t);
      const bub = seg(lt, w(5), w(5) + 0.35);
      if (bub > 0) {
        lx.save(); lx.globalAlpha = bub;
        for (let y = -16; y <= 16; y++) { const hw = Math.round(Math.sqrt(1 - (y / 17) ** 2) * 26); px(160 - hw, 40 + y, hw * 2, 1, "#ffffff"); }
        disc(118, 66, 3, "#ffffff"); disc(110, 74, 2, "#ffffff");
        accori(146, 40, 2.2);
        lx.restore();
      }
      wren(88, 118, t, { s: 3, hat: true, sparkle: lt > w(10) && lt < w(14) });
      if (lt > w(14)) { const k = easeOut(seg(lt, w(14), w(14) + 0.4)); furnace(t, Math.round(lerp(LO_W, 120, k))); px(Math.round(lerp(LO_W, 120, k)) - 1, 0, 2, LO_H, "#1a1026");
        for (let i = 0; i < 3; i++) { const kb = seg(lt, w(14) + 0.6 + i * 0.35, w(14) + 0.9 + i * 0.35); if (kb > 0) accori(Math.round(lerp(190, 200 + i * 12, kb)), Math.round(104 - Math.sin(kb * Math.PI) * 10), 1.2, { copy: true }); } }
      blitLo();
      where("YOU, THE TRADER", "a European ship, 1500s", lt, w(14));
      body("= GLASS?", X(178), X(40), 50, "#1a1026", { alpha: bub * (1 - seg(lt, w(14), w(14) + 0.3)), shadow: false });
      lab("I CAN MAKE THAT!", 720, 200, seg(lt, w(10), w(10) + 0.3), 1 - seg(lt, w(14), w(14) + 0.3), { size: 46, bg: C.gold });
      lab("VENICE · HOLLAND", X(180), 120, seg(lt, w(14) + 0.3, w(14) + 0.6), 1, { size: 40 });
      lab("COPIES", X(206), X(88), seg(lt, w(15) + 0.5, w(15) + 0.8), 1, { size: 34, bg: "#9fc4f0" });
      return;
    }
    if (lt < backAt) {
      const ck = seg(lt, fireAt + 0.8, fireAt + 1.1);
      ground(100, "#2a2140", "#33284d");
      fire(120, 100, t);
      accori(84, 86, 2);
      if (ck > 0) cracked(156, 86, ck); else accori(156, 86, 2, { copy: true });
      blitLo();
      text("REAL", X(84), X(108), 40, C.ink); text("COPY", X(156), X(108), 40, ck > 0 ? C.bad : C.ink);
      body("Glass copies “will not bear the heat of fire”", WIDTH / 2, 170, 54, C.gold, { alpha: seg(lt, fireAt, fireAt + 0.4) });
      body("a Portuguese pilot, c. 1540", WIDTH / 2, 245, 34, C.muted, { alpha: seg(lt, fireAt + 0.3, fireAt + 0.7) });
      return;
    }
    market(t);
    px(126, 100, 60, 4, C.wood); px(130, 104, 2, 10, C.wood2); px(180, 104, 2, 10, C.wood2);
    person(158, 100, { t, cloth: "#2e86c1", face: -1, arm: seg(lt, backAt + 0.2, backAt + 0.9) < 1 ? "up" : null });
    wren(84, 118, t, { s: 2, hat: true, sad: lt > backAt + 1 });
    const kb = easeInOut(seg(lt, backAt + 0.1, backAt + 0.9));
    accori(Math.round(lerp(144, 100, kb)), Math.round(lerp(94, 92, kb) - Math.sin(kb * Math.PI) * 10), 1.4, { copy: true });
    blitLo();
    stamp("NOT FOOLED", WIDTH / 2, 260, seg(lt, w(23), w(23) + 0.25), { size: 80 });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ b4 · new plan: beads by the ton */
  function warehouse() {
    px(0, 0, LO_W, 100, "#4a3020"); for (let x = 0; x < LO_W; x += 10) px(x, 0, 1, 100, "#3b2615");
    px(0, 100, LO_W, 35, "#2e2014"); px(0, 100, LO_W, 1, "#5e3b1a");
    px(20, 14, 40, 26, "#6b7a8f"); px(39, 14, 2, 26, "#3b2615"); px(20, 26, 40, 2, "#3b2615");
  }
  // beads poured from the barrels: n beads, each landing on the floor
  function pour(lt, t0, rate, nMax) {
    const n = Math.min(nMax, Math.floor(Math.max(0, lt - t0) * rate));
    for (let i = 0; i < n; i++) {
      const born = t0 + i / rate, age = clamp((lt - born) / 0.45, 0, 1);
      const sx = [42, 66, 90][i % 3], tx = 20 + hash(i) * 210, ty = 132 - Math.floor(hash(i + 5) * 30 * Math.pow(1 - Math.abs(tx - 70) / 160, 2));
      const x = lerp(sx, tx, age), y = lerp(92, ty, age) - Math.sin(age * Math.PI) * 12;
      px(x, y, 2, 2, BEADC[i % BEADC.length]);
    }
  }
  SC.beadflood = (lt, d, t, s) => {
    const w = (n) => word(s, n), cut = w(2) - 0.1, liver = w(19) - 0.1, coast = w(32) - 0.1;
    if (lt < cut) {
      deck(t);
      const k = seg(lt, 0.1, 0.8);
      wren(110, 118, t, { s: 3, hat: true });
      if (k < 1) accori(Math.round(lerp(130, -10, k)), Math.round(70 - Math.sin(k * Math.PI) * 50), 1.6, { copy: true });
      blitLo();
      lab("NEW PLAN", WIDTH / 2, 200, seg(lt, 0.2, 0.5), 1, { size: 60, bg: C.gold });
      return;
    }
    if (lt < liver) {
      warehouse();
      for (const [i, x] of [42, 66, 90].entries()) { if (lt < cut + 0.2) barrel(x, 100); else { px(x - 8, 88, 16, 12, "#7a4a22"); px(x - 8, 88, 3, 12, "#3b2615"); px(x + 4, 88, 2, 12, "#3b2615"); px(x + 7, 90, 2, 8, "#1a1010"); } }
      pour(lt, cut + 0.2, 60, 260);
      pour(lt, w(12), 90, 260 + Math.floor(seg(lt, w(12), liver) * 200));
      blitLo();
      where("VENICE", "glass beads for export", lt - cut, liver - cut);
      const ky = seg(lt, w(7), w(11));
      if (ky > 0) { text(String(Math.round(lerp(1600, 1780, easeInOut(ky)))), 1540, 190, 110, C.gold, { alpha: Math.min(1, ky * 4) }); body("the late 1700s", 1540, 270, 36, C.ink, { alpha: seg(lt, w(9), w(10)) }); }
      const kc = seg(lt, w(12), w(16));
      if (kc > 0) {
        const n = Math.round(Math.pow(easeOut(kc), 2) * 10000000);
        ctx.fillStyle = "rgba(18,13,29,.8)"; ctx.fillRect(1000, 360, 860, 270);
        text("BEADS A YEAR", 1430, 410, 40, C.muted);
        text(kc < 1 ? n.toLocaleString("en-US") : "10,000,000+", 1430, 500, 84, C.ink);
        text("TENS OF MILLIONS", 1430, 585, 44, C.gold, { alpha: seg(lt, w(14), w(14) + 0.3) });
      }
      return;
    }
    if (lt < coast) {
      // Liverpool: 28 grams of gold buys nearly 50 kilos of beads
      sky(0, 100, "#7a8698", "#9aa6b6");
      for (let i = 0; i < 6; i++) px(i * 44 - 4, 30 + (i % 3) * 8, 36, 70, i % 2 ? "#6a4030" : "#7a4a38");
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) px(i * 44 + 4 + (j % 2) * 14, 40 + (i % 3) * 8 + Math.floor(j / 2) * 18, 6, 8, "#2a2030");
      px(0, 100, LO_W, 35, "#4a4a52"); px(0, 100, LO_W, 2, "#6a6a72");
      px(20, 92, 90, 4, C.wood); px(26, 96, 3, 10, C.wood2); px(100, 96, 3, 10, C.wood2);
      goldCoin(64, 84, 6);
      const ks = seg(lt, w(21), w(30)), n = Math.max(1, Math.ceil(ks * 7));
      const spots = [[134, 118], [148, 118], [162, 118], [176, 118], [141, 107], [155, 107], [169, 107]];
      for (let i = 0; i < n; i++) { const [x, y] = spots[i]; bigSack(x, y + 0); }
      const cam = seg(lt, w(28), w(28) + 0.4);
      if (cam > 0) wren(lerp(260, 216, easeOut(cam)), 134, t, { s: 2, hat: true });
      blitLo();
      where("LIVERPOOL", "1760s–1780s", lt - liver, coast - liver);
      text("1 OUNCE OF GOLD", X(64), 390, 40, C.ink);
      text("28 GRAMS", X(64), 490, 84, C.gold);
      text("BUYS", 980, 690, 50, C.muted, { alpha: seg(lt, w(27), w(28)) });
      const kg = Math.round(47 * Math.min(n, 7) / 7);
      text("BEADS", X(160), 390, 40, C.ink);
      text(`${kg} KILOS`, X(160), 490, 84, C.gold);
      lab("NEARLY 50 KG OF BEADS", X(160), 290, seg(lt, w(30), w(30) + 0.3), 1, { size: 36, bg: C.gold });
      lab("THAT'S MY MOVE!", X(200), 860, cam, 1, { size: 32, bg: "#ffd0e6" });
      body("Liverpool prices, 1760s–1780s (one firm's books)", WIDTH / 2, 1040, 30, C.ink, { alpha: 0.8 * seg(lt, w(30), w(30) + 0.5) });
      return;
    }
    // back on the coast: the merchant bargains hard
    market(t);
    px(126, 100, 60, 4, C.wood); px(130, 104, 2, 10, C.wood2); px(180, 104, 2, 10, C.wood2);
    const shake = Math.floor((lt - coast) * 5) % 2 ? 1 : -1;
    person(158, 100, { t, cloth: "#2e86c1", face: shake, arm: "up" });
    wren(80, 118, t, { s: 2, hat: true, sad: lt > coast + 1.2 });
    bigSack(98, 118, { open: true });
    blitLo();
    lab("MORE!", X(158), X(70), seg(lt, coast + 0.3, coast + 0.6), 1, { size: 44 });
    stamp("HARD BARGAINING", WIDTH / 2, 220, seg(lt, w(35), w(35) + 0.25), { size: 64, color: C.gold });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ b5 · cargo (grave, muted, no people drawn) */
  function cloth(x, y) { px(x, y, 10, 6, "#8a3a3a"); for (let i = 0; i < 10; i += 3) px(x + i, y, 1, 6, "#c8a050"); px(x + 9, y + 1, 2, 4, "#6a2a2a"); }
  function ironBar(x, y) { px(x, y + 2, 12, 3, "#6f7480"); px(x, y + 2, 12, 1, "#9aa3b5"); }
  function musket(x, y) { px(x, y + 3, 14, 1, "#3b3b44"); px(x + 9, y + 3, 5, 3, "#5e3b1a"); px(x + 12, y + 5, 2, 1, "#5e3b1a"); }
  function tusk(x, y) { for (let i = 0; i < 12; i++) px(x + i, y + Math.round(Math.pow((i - 6) / 6, 2) * 4) - 4, 2, 2, "#efe6cf"); }
  SC.cargo = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 66, "#4a3e5a", "#9a7a6a");
    sea(t, 66, { c: "#24304a", c2: "#1c2640", hi: "#3d4f70", speed: 0.25 });
    for (let x = 180; x < LO_W; x++) px(x, 64 - Math.min(10, (x - 180) * 0.3), 1, 6 + Math.min(10, (x - 180) * 0.3), "#3a3a2a");
    const sx = Math.round(lerp(200, 70, lt / d));
    lx.save(); lx.translate(sx * 2, 0); lx.scale(-1, 1); schooner(sx, 92, t); lx.restore();
    const gone = 1 - seg(lt, w(14), w(14) + 1.2);
    lx.save(); lx.globalAlpha = gone;
    const items = [[cloth, w(5), -20], [ironBar, w(6), -4], [musket, w(8), 12]];
    for (const [f, at, dx] of items) if (lt > at) f(sx + dx - 5, 80);
    if (lt > w(11)) goldPile(212, 60, 1);
    if (lt > w(13)) tusk(222, 58);
    lx.restore();
    ctx.filter = "saturate(0.55) brightness(0.85)"; blitLo(); ctx.filter = "none";
    where("THE ATLANTIC", "1700s", lt, w(14));
    ["CLOTH", "IRON", "GUNS"].forEach((str, i) => body(str, X(sx + items[i][2]), X(74), 38, C.ink, { alpha: gone * seg(lt, items[i][1], items[i][1] + 0.3) }));
    body("gold · ivory", X(216), X(46), 36, C.ink, { alpha: gone * seg(lt, w(11), w(11) + 0.3) });
    const kt = seg(lt, w(20), w(20) + 1.0);
    body("Glass beads helped pay for", WIDTH / 2, 230, 60, C.ink, { alpha: kt });
    body("the Atlantic slave trade.", WIDTH / 2, 310, 60, C.ink, { alpha: kt });
    fadeOut(lt, d, 1.0);
  };

  /* ================================================================ b6 · the felt moment: same string, less food */
  const STR = { x: 72, y: 66, n: 20, dx: 6 };
  function compound(t) {
    sky(0, 46, "#f0b27a", "#f8d9a8"); px(0, 46, LO_W, 8, "#5a7aa0"); for (let i = 0; i < 10; i++) px((hash(i) * LO_W + t * 2) % LO_W, 48 + hash(i + 3) * 5, 4, 1, "#8ab0d0");
    ground(54, "#b8864a", "#a0723c");
    hut(24, 82, "#a4782e"); pots(6, 92);
    person(30, 122, { t, cloth: "#d68910", face: 1 }); headwrap(30, 122, "#2e86c1"); kid(42, 122, "#c0392b");
  }
  function savingsString(t, o = {}) {
    const n = o.n ?? STR.n;
    px(STR.x - 3, STR.y + 1, Math.max(0, (n - 1) * STR.dx + 9), 1, "#5e3b1a");
    for (let i = 0; i < n; i++) {
      const x = STR.x + i * STR.dx, y = STR.y - 1;
      if (o.accori != null && i === o.accori) accori(x + 1, y + 2, 1, { glow: o.glow }); else sbead(x, y, BEADC[i % 5], 3);
    }
    if (o.ring) { lx.strokeStyle = o.ring; lx.lineWidth = 1; lx.strokeRect(STR.x - 5.5, STR.y - 5.5, (STR.n - 1) * STR.dx + 14, 12); }
  }
  // baskets in one row, the last ones popping off as `left` drops
  function basketRow(left, gone, o = {}) {
    for (let i = 0; i < 12; i++) {
      const x = 72 + i * 13, y = 108;
      if (i < left) bigBasket(x, y, { ring: o.ring });
      else if (gone[i] != null && gone[i] < 1) { lx.save(); lx.globalAlpha = 1 - gone[i]; bigBasket(x, y + Math.round(gone[i] * 8)); lx.restore(); }
    }
  }
  SC.savings = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    compound(t);
    const ships = [w(18), w(22), w(25)], counts = [12, 8, 5, 3];
    let shipsIn = 0; for (const a of ships) if (lt > a + 0.6) shipsIn++;
    const left = counts[shipsIn];
    // ships cross the horizon; each drops a puff of new beads into the market
    ships.forEach((a, j) => {
      const k = seg(lt, a - 0.6, a + 1.8);
      if (k > 0 && k < 1) miniShip(lerp(250, -12, k), 53);
      const kp = seg(lt, a + 0.4, a + 0.8);
      for (let i = 0; i < 26 * kp; i++) px(70 + hash(i + j * 40) * 160, 78 + hash(i + j * 40 + 7) * 22, 2, 2, BEADC[(i + j) % 5]);
    });
    const nb = Math.floor(seg(lt, w(4), w(10)) * STR.n);
    if (nb > 0) savingsString(t, { n: nb, ring: lt > w(29) ? "#ffffff" : null });
    const kb = seg(lt, w(11), w(13));
    if (kb > 0) {
      const gone = {}; for (let j = 0; j < shipsIn; j++) for (let i = counts[j + 1]; i < counts[j]; i++) gone[i] = seg(lt, ships[j] + 0.6, ships[j] + 1.0);
      lx.save(); lx.globalAlpha = kb; basketRow(left, gone, { ring: lt > w(31) ? C.bad : null }); lx.restore();
    }
    blitLo();
    text("IMAGINE", 70, 60, 36, C.muted, { align: "left", alpha: seg(lt, w(4), w(4) + 0.4) });
    lab(lt > w(29) ? "SAME STRING" : "YOUR FAMILY'S SAVINGS", X(STR.x + 57), X(STR.y) - 90, seg(lt, w(4), w(4) + 0.3) * (lt > w(29) ? seg(lt, w(29), w(29) + 0.3) : 1), 1, { size: 40, bg: lt > w(29) ? "#ffffff" : C.gold });
    if (kb > 0) {
      const at = shipsIn ? ships[shipsIn - 1] + 0.6 : w(11);
      lab(`BUYS ${left} BASKETS OF FOOD`, X(150), X(96) - 6, seg(lt, at, at + 0.3), 1, { size: 44, bg: shipsIn ? "#ffb3b3" : C.gold });
      if (shipsIn) { text("WAS 12", X(150), X(96) + 76, 36, C.muted); ctx.fillStyle = C.muted; ctx.fillRect(X(150) - 90, X(96) + 74, 180, 5); }
    }
    if (lt > ships[0] - 0.4) text(`SHIPS WITH NEW BEADS: ${shipsIn}`, 1860, 60, 34, C.ink, { align: "right" });
    stamp("LESS FOOD", 1420, 930, seg(lt, w(31), w(31) + 0.25), { size: 64 });
  };

  /* ================================================================ b7 · unless the string held an accori */
  SC.accorihold = (lt, d, t, s) => {
    const w = (n) => word(s, n), scaleAt = w(10) - 0.1;
    if (lt < scaleAt) {
      compound(t);
      for (let j = 0; j < 3; j++) for (let i = 0; i < 26; i++) px(70 + hash(i + j * 40) * 160, 78 + hash(i + j * 40 + 7) * 22, 2, 2, BEADC[(i + j) % 5]);
      const g = seg(lt, w(1), w(5));
      savingsString(t, { accori: g > 0 ? 10 : null, glow: g > 0 ? 0.6 + 0.4 * Math.sin(t * 5) : 0 });
      const ka = seg(lt, w(4), w(4) + 0.4);
      basketRow(3, {});
      if (ka > 0) { lx.save(); lx.globalAlpha = ka; for (let i = 0; i < 3; i++) bigBasket(124 + i * 14, 84, { ring: C.gold }); lx.restore(); }
      const k = seg(lt, w(5), w(5) + 2.4); if (k > 0 && k < 1) miniShip(lerp(250, -12, k), 53);
      blitLo();
      text("IMAGINE", 70, 60, 36, C.muted, { align: "left" });
      lab("THE ACCORI STILL BUYS 3", X(144), X(84) - 70, ka, 1, { size: 40, bg: "#9fe0ff" });
      stamp("CAN'T BE COPIED", 1500, 940, seg(lt, w(6), w(6) + 0.25), { size: 56, color: C.leaf });
      fadeOut(lt, scaleAt, 0.3);
      return;
    }
    // the b2 scale again, 200 years on: one accori, its weight in gold
    market(t, { sky: "#e9b07a", sky2: "#f6d8a8" });
    const pour = seg(lt, w(19), w(23)), tilt = lerp(5, 0, easeInOut(pour));
    const p = balance(120, 118, tilt, { L: 34, h: 44 });
    goldPile(p.rx, p.ry, pour);
    if (pour > 0 && pour < 1) for (let i = 0; i < 5; i++) px(p.rx - 1 + (i % 2), p.ry - 30 + ((t * 60 + i * 6) % 26), 1, 2, C.gold);
    accori(p.lx, p.ly - 7, 1.6);
    blitLo();
    const ky = seg(lt, scaleAt, w(13));
    text(ky < 0.5 ? "1500s" : "c. 1700", WIDTH / 2, 150, 110, C.gold, { alpha: Math.abs(ky * 2 - 1) });
    lab("STILL WEIGHED AGAINST GOLD", WIDTH / 2, 290, seg(lt, w(23), w(23) + 0.3), 1, { size: 44, bg: C.gold });
    body("Willem Bosman, Dutch trader, c. 1700", WIDTH / 2, 1040, 32, C.ink, { alpha: 0.85 * seg(lt, w(15), w(15) + 0.4) });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ b8 · callback: Ulm Hollow */
  function stall(x, base) { px(x - 18, base - 10, 36, 3, C.wood); px(x - 16, base - 7, 2, 7, C.wood2); px(x + 14, base - 7, 2, 7, C.wood2);
    px(x - 17, base - 30, 2, 20, C.wood2); px(x + 15, base - 30, 2, 20, C.wood2); for (let i = 0; i < 38; i += 6) px(x - 19 + i, base - 34, 6, 5, i % 12 ? "#ff6fb5" : "#ffd0e6"); }
  SC.beadcallback = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(16) - 0.1;
    if (lt < split) {
      sky(0, 96, "#2a1f45", "#3a2a5c"); ground(96, "#3d2f5a", "#4a3a6c");
      cave(206, 34, 56, 64, t); stall(70, 106);
      if (lt < w(7)) icon("lum", 64, 84);
      const walk = easeInOut(seg(lt, w(6) - 0.6, w(6) + 0.2)), wx = lerp(176, 100, walk);
      Art.drawAlien(lx, wx, 108, "wren", t);
      if (lt < w(7)) for (let i = 0; i < 3; i++) icon("pen", wx - 14 + i * 7, 84 - (i % 2) * 4);
      else icon("lum", wx - 6, 82);
      const q = seg(lt, w(9) - 0.3, w(9) + 0.3);
      if (q > 0) { lx.save(); lx.globalAlpha = q; Art.drawAlien(lx, 132, 112, "sela", t); Art.drawAlien(lx, 156, 112, "dov", t); lx.restore(); }
      const kp = seg(lt, w(11), w(11) + 0.4);
      if (kp > 0) for (let i = 0; i < 4; i++) icon("pen", 120 + i * 9, 80 - Math.round(easeOut(kp) * 6));
      blitLo();
      where("ULM HOLLOW", "from EP 01", lt, split);
      const price = lt < w(9) ? 1 : lt < w(9) + 0.7 ? 4 : 8, at = price === 1 ? w(6) : price === 4 ? w(9) : w(9) + 0.7;
      lab(`LUMFRUIT: ${price} PENTAJA`, X(70), X(58), seg(lt, at, at + 0.25) * seg(lt, w(6), w(6) + 0.3), 1, { size: 40, bg: price === 1 ? C.gold : "#ffb3b3" });
      if (lt > w(7)) text("WREN PAID 1", X(100), X(108) + 40, 34, C.gold, { alpha: seg(lt, w(7), w(7) + 0.3) * (1 - seg(lt, w(11), w(11) + 0.3)) });
      lab("4 SAVED PENTAJA = HALF A LUMFRUIT", X(140), 990, kp, 1, { size: 34, bg: "#ffd0e6" });
      return;
    }
    // split: Wren the bead trader | Wren with pentaja
    sky(0, 70, "#e9b07a", "#f6d8a8"); ground(70, C.sand, C.sand2);
    px(120, 0, 120, 70, "#2a1f45"); px(120, 70, 120, 65, "#3d2f5a");
    px(119, 0, 2, LO_H, "#120d1d");
    const sad = seg(lt, w(23), w(23) + 0.6);
    if (sad > 0) {
      lx.save(); lx.globalAlpha = sad;
      for (let i = 0; i < 10; i++) sbead(14 + i * 5, 96, BEADC[i % 5], 3); px(12, 97, 52, 1, "#5e3b1a");
      person(22, 124, { t, cloth: "#d68910" }); headwrap(22, 124, "#2e86c1"); kid(34, 124, "#c0392b");
      Art.drawAlien(lx, 214, 122, "sela", t); px(222, 112, 6, 5, "#8a5a2b");
      lx.restore();
    }
    wren(76, 122, t, { s: 2, hat: true, sad: sad > 0.5 }); bigSack(92, 122, { open: true });
    wren(166, 122, t, { s: 2, sad: sad > 0.5 }); for (let i = 0; i < 3; i++) icon("pen", 178 + i * 8, 108 - (i % 2) * 4);
    blitLo();
    text("1700s", X(60), 620, 34, "#1a1026", { shadow: false }); text("ULM HOLLOW", X(180), 620, 34, C.muted);
    body("When you're Wren,", WIDTH / 2, 150, 64, C.gold, { alpha: seg(lt, split, split + 0.4) * (1 - seg(lt, w(23) - 0.5, w(23) - 0.1)) });
    body("it feels like winning.", WIDTH / 2, 235, 64, C.gold, { alpha: seg(lt, split + 0.3, split + 0.7) * (1 - seg(lt, w(23) - 0.5, w(23) - 0.1)) });
    if (sad > 0) { ctx.fillStyle = `rgba(18,13,29,${0.85 * sad})`; ctx.fillRect(0, 90, WIDTH, 200); }
    text("SOMEBODY ALWAYS PAYS.", WIDTH / 2, 160, 72, C.pen, { alpha: sad });
    body("whoever saved the old money", WIDTH / 2, 250, 44, C.ink, { alpha: seg(lt, w(24), w(24) + 0.5) });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ b9 · next: wampum */
  function belt(x0, y0, cols) {
    for (let c = 0; c < cols; c++) for (let r = 0; r < 7; r++) {
      const dm = Math.abs(r - 3) + Math.abs((c % 10) - 5) <= 3, col = dm ? "#f4ecff" : "#5a2a7a";
      px(x0 + c * 4, y0 + r * 3, 3, 2, col); px(x0 + c * 4, y0 + r * 3, 1, 1, dm ? "#ffffff" : "#7a4a9a");
    }
  }
  SC.nextwampum = (lt, d, t, s) => {
    const w = (n) => word(s, n), beltAt = w(4) - 0.1;
    if (lt < beltAt) {
      px(0, 0, LO_W, LO_H, "#14243f"); for (let i = 0; i < 40; i++) px(hash(i) * LO_W, hash(i + 40) * LO_H, 3, 1, "#1d3358");
      for (let y = 0; y < LO_H; y++) { const w1 = 60 - Math.abs(y - 40) * 0.5 - (y > 70 ? (y - 70) * 0.8 : 0); if (w1 > 0) px(0, y, w1, 1, "#3f7a4a"); }
      for (let y = 10; y < LO_H; y++) { const x1 = 176 + (y < 60 ? (60 - y) * 0.3 : (y - 60) * 0.5); px(x1, y, LO_W - x1, 1, "#9a7a3a"); }
      bead(204, 80, 1);
      const k = seg(lt, 0.4, beltAt);
      for (let i = 0; i < 40 * k; i += 2) { const u = i / 40; px(lerp(196, 48, u), lerp(70, 50, u) - Math.sin(u * Math.PI) * 22, 2, 1, C.gold); }
      blitLo();
      text("NEXT", WIDTH / 2, 120, 60, C.muted);
      text("✓", X(214), X(64), 70, C.leaf, { font: "'Space Grotesk'", weight: 700 });
      text("NORTH AMERICA", X(40), X(98), 40, C.ink, { alpha: seg(lt, w(1), w(1) + 0.4) });
      return;
    }
    px(0, 0, LO_W, LO_H, C.bg);
    const kb = seg(lt, beltAt, beltAt + 0.5);
    lx.save(); lx.globalAlpha = kb; belt(20, 52, 40); lx.restore();
    const kd = seg(lt, w(9) - 0.2, w(9) + 0.3);
    if (kd > 0) {
      // a hand drill: the spindle spins faster and faster, beads pop out
      const ts = Math.max(0, lt - w(9)), ph = Math.floor(ts * (3 + ts * 4) * 2);
      px(196, 70, 3, 40, "#9aa3b5"); px(186, 70, 23, 3, C.wood);
      for (let i = 0; i < 6; i++) px(196 + ((i + ph) % 2), 74 + i * 6, 2, 3, "#5e6676");
      px(190, 110, 16, 6, "#e9e3d2");
      const n = Math.floor(ts * (3 + ts * 3));
      for (let i = 0; i < Math.min(n, 60); i++) { const a = clamp((ts - i / (3 + ts * 3)) * 2, 0, 1); px(lerp(198, 120 + hash(i) * 70, a), lerp(110, 124 - hash(i + 3) * 8, a) - Math.sin(a * Math.PI) * 12, 2, 2, i % 3 ? "#f4ecff" : "#5a2a7a"); }
    }
    blitLo();
    text("CHAPTER 3", WIDTH / 2, 160, 44, C.muted, { alpha: kb });
    text("WAMPUM", WIDTH / 2, 250, 100, C.gold, { alpha: kb });
    lab("METAL DRILLS", X(197), X(60) - 30, kd, 1, { size: 36, bg: "#c9d0dc" });
    fadeOut(lt, d, 1.0);
  };
})();
