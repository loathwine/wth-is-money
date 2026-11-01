/* EP 02 · scenes for chapter 5 (Rome): when Wren is the emperor.
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   w(n) = the moment word n of the narration is spoken, so visuals land on the words. Romans are real people:
   drawn plainly and respectfully; Wren (the EP 01 alien) only appears as the Ulm Hollow callback. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, sky, palm,
    icon, alien, text, body, label, stamp, where, blitLo, fadeOut, SC, ground, cave, chart } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels

  /* ================================================================ Roman props (lo-res) */
  const R = { skin: "#c68a5c", skin2: "#9c6640", hair: "#2a1a10", grey: "#cfcfcf", purple: "#6c2a8a", purple2: "#4a1c60", red: "#a8281e", red2: "#7a1c14",
    steel: "#9aa3b5", steel2: "#6c7384", laurel: "#b8c23a", marble: "#e9e3d2", marble2: "#bdb5a0", clay: "#b5562f", clay2: "#8a3e1f", bread: "#c07a35", bread2: "#e2a75c" };
  const mixHex = (a, b, k) => { const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return "#" + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k, 0, 1))).toString(16).padStart(2, "0")).join(""); };
  // draw fn() scaled by s around (x, y): crisp, since s is a whole number
  function big(x, y, s, fn) { lx.save(); lx.translate(Math.round(x), Math.round(y)); lx.scale(s, s); fn(); lx.restore(); }
  function faded(a, fn) { if (a <= 0) return; lx.save(); lx.globalAlpha *= a; fn(); lx.restore(); }

  // a Roman: o = { tunic, face, t, walk, beard, hair, laurel, toga, helmet, shield, spear, arm: 'up'|'point'|'out', sack }
  function roman(x, feet, o = {}) {
    const f = o.face || 1, t = o.t || 0, bob = o.walk ? Math.floor(t * 8) % 2 : 0;
    x = Math.round(x); feet = Math.round(feet);
    const sk = o.skin || R.skin, sk2 = R.skin2;
    px(x - 3, feet - 1, 7, 1, "rgba(0,0,0,.3)");
    px(x - 2, feet - 4 - (o.walk ? bob : 0), 1, 3, sk2); px(x + 1, feet - 4 - (o.walk ? 1 - bob : 0), 1, 3, sk2);
    px(x - 2, feet - 2, 1, 1, "#4a2f19"); px(x + 1, feet - 2, 1, 1, "#4a2f19");
    px(x - 2, feet - 11, 4, 7, o.tunic || "#d8cdb0");
    if (o.helmet) px(x - 2, feet - 7, 4, 1, "#5e3b1a");                                   // belt
    if (o.toga) for (let i = 0; i < 5; i++) px(x - 2 + Math.floor(i * 0.8), feet - 11 + i, 2, 1, o.toga);
    px(x - 2, feet - 15, 4, 4, sk);                                                      // head
    px(x - 2, feet - 16, 4, 1, o.hair || R.hair); px(x + (f > 0 ? -2 : 1), feet - 15, 1, 2, o.hair || R.hair);
    px(x + (f > 0 ? 1 : -2), feet - 14, 1, 1, "#1a1010");                               // eye
    px(x + (f > 0 ? 2 : -3), feet - 13, 1, 1, sk);                                      // nose
    if (o.beard) { px(x - 2, feet - 12, 4, 1, o.beard); px(x + (f > 0 ? 0 : -1), feet - 11, 2, 1, o.beard); }
    if (o.laurel) { px(x - 3, feet - 16, 1, 2, R.laurel); px(x + 2, feet - 16, 1, 2, R.laurel); px(x - 2, feet - 17, 1, 1, R.laurel); px(x + 1, feet - 17, 1, 1, R.laurel); }
    if (o.helmet) {
      px(x - 3, feet - 17, 6, 2, R.steel); px(x - 2, feet - 18, 4, 1, R.steel); px(x - 1, feet - 20, 2, 2, "#c0392b"); px(x + (f > 0 ? -3 : 2), feet - 15, 1, 3, R.steel2);
    }
    const ax = x + (f > 0 ? 2 : -3);
    if (o.arm === "up") px(ax, feet - 15 - (Math.floor(t * 6) % 2), 1, 4, sk);
    else if (o.arm === "point") px(f > 0 ? x + 2 : x - 5, feet - 11, 3, 1, sk);
    else if (o.arm === "out") px(f > 0 ? x + 2 : x - 4, feet - 9, 2, 1, sk);
    else px(ax, feet - 10, 1, 4, sk);
    if (o.spear) { px(x + (f > 0 ? 3 : -4), feet - 24, 1, 22, "#6b4a2a"); px(x + (f > 0 ? 3 : -4), feet - 26, 1, 2, "#d6dbe4"); }
    if (o.shield) { const sx = f > 0 ? x + 1 : x - 5; px(sx, feet - 12, 4, 9, R.red); px(sx, feet - 12, 4, 1, C.gold); px(sx, feet - 4, 4, 1, C.gold); px(sx + 1, feet - 9, 2, 2, C.gold); }
    if (o.sack) { px(x + (f > 0 ? -6 : 3), feet - 14, 4, 5, "#b89a64"); px(x + (f > 0 ? -5 : 4), feet - 15, 2, 1, "#8c7650"); }
  }
  const legionary = (x, feet, o = {}) => roman(x, feet, { tunic: R.red, helmet: true, shield: true, ...o });

  // a coin whose colour follows its silver: p = 0.98 (Augustus) … 0.04 (AD 270); sx squashes it sideways (spin)
  const HEAD = ["..LLL....", ".LLLLL...", ".######..", "..######.", "..#####..", "...####..", "...###...", "..#####..", ".#######.", "#########"];
  function dcoin(cx, cy, r, p, o = {}) {
    const m = Math.pow(clamp((0.98 - p) / 0.94, 0, 1), 0.8), sx = o.sx ?? 1;
    const rim = mixHex("#7c8596", "#6e3517", m), face = mixHex("#d7dde8", "#c0652f", m), hi = mixHex("#ffffff", "#f0a870", m), rel = mixHex("#9aa3b5", "#8e4722", m);
    if (r <= 2) { px(cx - 2 * sx, cy - 1, 4 * sx + 1, 3, rim); px(cx - 1 * sx, cy - 1, 2 * sx + 1, 2, face); px(cx - 1 * sx, cy - 1, 1, 1, hi); return; }
    const hwAt = (rr, y) => Math.floor(Math.sqrt(Math.max(0, rr * rr - y * y + rr * 0.6)) * sx);
    const row = (rr, c) => { lx.fillStyle = c; for (let y = -rr; y <= rr; y++) { const hw = hwAt(rr, y); lx.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } };
    if (o.shadow !== false) { lx.fillStyle = "rgba(0,0,0,.35)"; lx.fillRect(Math.round(cx - r * sx + 1), Math.round(cy + r), Math.round(2 * r * sx), Math.max(1, Math.round(r / 6))); }
    row(r, rim);
    const ri = r - Math.max(1, Math.round(r / 7));
    row(ri, face);
    const hw1 = Math.max(1, Math.round(r / 9));   // a shine along the upper-left edge
    for (let y = -ri + 1; y <= Math.round(ri * 0.2); y++) px(cx - hwAt(ri, y), cy + y, hw1, 1, hi);
    if (r >= 6 && sx > 0.3) {   // the emperor's head in profile, with a laurel
      const u = Math.max(1, Math.round(r / 11)), uw = u * sx, x0 = cx - 4.5 * uw, y0 = cy - 5 * u;
      HEAD.forEach((line, j) => [...line].forEach((ch, i) => { if (ch !== ".") px(x0 + i * uw, y0 + j * u, Math.ceil(uw), u, ch === "L" ? (m < 0.5 ? "#8a9a3a" : "#6e5a1a") : rel); }));
    }
  }
  // a vertical gauge: how much silver is in the coin
  function gauge(x, y, w, h, frac) {
    px(x - 1, y - 1, w + 2, h + 2, "#1a1026"); px(x, y, w, h, "#7a3c1c");
    const fh = Math.round(h * clamp(frac, 0, 1));
    px(x, y + h - fh, w, fh, "#d7dde8"); px(x, y + h - fh, 1, fh, "#ffffff");
  }
  function column(x, base, h) {
    px(x - 6, base - h, 12, 2, R.marble); px(x - 5, base - h + 2, 10, 1, R.marble2);
    px(x - 4, base - h + 3, 8, h - 5, R.marble); px(x - 2, base - h + 3, 1, h - 5, R.marble2); px(x + 1, base - h + 3, 1, h - 5, R.marble2); px(x + 3, base - h + 3, 1, h - 5, R.marble2);
    px(x - 5, base - 2, 10, 2, R.marble2);
  }
  function wrenRoyal(x, feet, t, o = {}) {   // Wren in a purple cloak and a laurel wreath
    const hop = Math.sin(t * 3 + 119 * 0.7) > 0.6 ? -1 : 0, top = Math.round(feet - 15 + hop) - (o.lift || 0); x = Math.round(x);
    px(x - 7, top + 6, 14, 8, R.purple); px(x - 7, top + 13, 14, 1, C.gold);
    alien("wren", x, feet - (o.lift || 0), t);
    px(x - 6, top + 1, 2, 1, R.laurel); px(x - 7, top + 2, 1, 2, R.laurel); px(x + 4, top + 1, 2, 1, R.laurel); px(x + 6, top + 2, 1, 2, R.laurel);
    px(x - 4, top, 2, 1, C.gold); px(x + 2, top, 2, 1, C.gold);
  }
  function loaf(x, y) { px(x, y + 1, 6, 2, R.bread); px(x + 1, y, 4, 1, R.bread2); px(x + 1, y + 1, 1, 1, R.bread2); px(x + 3, y + 1, 1, 1, R.bread2); }
  function amphora(x, base) { px(x - 2, base - 8, 5, 5, R.clay); px(x - 1, base - 3, 3, 2, R.clay); px(x, base - 1, 1, 1, R.clay2); px(x - 1, base - 10, 3, 2, R.clay2); px(x - 3, base - 9, 1, 2, R.clay2); px(x + 3, base - 9, 1, 2, R.clay2); }
  function jar(x, base) {
    for (let y = 0; y < 16; y++) { const hw = Math.round(Math.sin((y + 2) / 18 * Math.PI) * 9); px(x - hw, base - 16 + y, hw * 2, 1, y % 5 === 2 ? R.clay2 : R.clay); }
    px(x - 5, base - 19, 10, 3, R.clay2); px(x - 4, base - 20, 8, 1, R.clay);
    for (let i = 0; i < 4; i++) disc(x - 3 + i * 2, base - 21, 1, "#c9d0dc");
  }
  function crucible(x, y, liquid, t) {
    for (let i = 0; i < 6; i++) { const fx = x - 8 + i * 3, fh = 4 + Math.round(3 * Math.abs(Math.sin(t * 9 + i * 1.7))); px(fx, y + 16 - fh, 2, fh, i % 2 ? "#ff8a2a" : C.gold); }
    px(x - 12, y + 16, 24, 2, "#3a2d24");
    for (let i = 0; i < 12; i++) { const hw = 11 - Math.floor(i / 3); px(x - hw, y + i, hw * 2, 1, i % 4 ? "#4a4a52" : "#5b5b66"); }
    px(x - 10, y + 1, 20, 3, liquid); px(x - 6, y + 1, 5, 1, "rgba(255,255,255,.6)");
  }
  function hammerDie(x, base, k) {   // k = 0 up, 1 striking
    px(x - 5, base - 12, 10, 12, "#5b5348"); px(x - 4, base - 12, 8, 1, "#8a8072");
    const hy = base - 14 - Math.round((1 - k) * 14);
    px(x - 6, hy - 6, 12, 6, "#6c6f7a"); px(x - 6, hy - 6, 12, 1, "#9aa3b5"); px(x + 6, hy - 4, 16, 2, "#6b4a2a");
    if (k > 0.85) for (let i = 0; i < 6; i++) px(x - 8 + hash(i) * 16, base - 14 - hash(i + 3) * 5, 1, 1, C.gold);
  }
  function tablet(x, y, w, h, o = {}) {
    px(x + 3, y + 3, w, h, "rgba(0,0,0,.4)"); px(x, y, w, h, "#8f8a80"); px(x + 2, y + 2, w - 4, h - 4, "#a39e93");
    for (let i = 0; i < 16; i++) px(x + 4 + hash(i + x) * (w - 8), y + 4 + hash(i + 7) * (h - 8), 2, 1, "#96918a");
    if (o.crack) { const n = Math.floor(o.crack * 14); for (let i = 0; i < n; i++) px(x + w / 2 + Math.round(Math.sin(i * 1.7) * 3), y + i * h / 14, 1, Math.ceil(h / 14), "#3a3530"); }
  }
  function stall(x, base, awn, k = 1) {   // k < 1 drops the awning
    px(x - 15, base - 28, 2, 28, "#5e3b1a"); px(x + 13, base - 28, 2, 28, "#5e3b1a");
    for (let i = 0; i < 8; i++) { const dy = Math.round((1 - k) * (i * 1.6)); px(x - 17 + i * 4, base - 32 + dy, 4, 6, i % 2 ? awn : "#f2ead6"); }
    px(x - 15, base - 10, 30, 10, "#8a5a2b"); px(x - 15, base - 10, 30, 1, "#a8763e");
  }
  function sackBig(x, base) {
    px(x - 13, base - 1, 28, 2, "rgba(0,0,0,.3)");
    for (let y = 0; y < 26; y++) { const hw = Math.round(9 + Math.sin(y / 26 * Math.PI) * 5); px(x - hw, base - 26 + y, hw * 2, 1, y % 6 === 3 ? "#a88a54" : "#c9a868"); }
    px(x - 6, base - 29, 12, 3, "#8c7650");
    for (let i = 0; i < 7; i++) { px(x - 6 + i * 2, base - 36 + (i % 2) * 2, 1, 7, "#c9a23a"); px(x - 7 + i * 2, base - 37 + (i % 2) * 2, 3, 2, C.gold); }
  }

  /* ================================================================ r1 · title */
  SC.rometitle = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 112, "#1d1230", "#2a1a45");
    for (let i = 0; i < 50; i++) if (Math.sin(t * 2 + i) > -0.2) px(hash(i) * LO_W, hash(i + 50) * 80, 1, 1, i % 4 ? C.line : C.gold);
    px(0, 112, LO_W, 23, "#3a2d5c"); for (let x = 0; x < LO_W; x += 12) px(x, 112, 1, 23, "#2a2140");
    for (const x of [18, 44, 196, 222]) column(x, 112, 64);
    px(6, 46, 52, 3, R.marble); px(184, 46, 52, 3, R.marble);
    const kw = seg(lt, w(4), w(4) + 1.2), wx = lerp(250, 150, easeOut(kw));
    px(142, 104, 16, 8, C.gold); px(144, 100, 12, 4, "#b8862e");                    // a stool-throne
    if (kw > 0) wrenRoyal(wx, kw < 1 ? 112 : 100, t);
    const kc = seg(lt, w(4) + 1.3, w(4) + 1.7);
    if (kc > 0) dcoin(163, 92 - 4 * easeOut(kc), 4, 0.98, { sx: Math.abs(Math.cos(t * 3)) });
    blitLo();
    text("CHAPTER 5", WIDTH / 2, 170, 44, C.muted, { alpha: seg(lt, 0.2, 0.7) });
    const kt = seg(lt, w(2), w(2) + 0.4);
    if (kt > 0) text("ROME", WIDTH / 2, lerp(-120, 360, easeOut(kt)), 200, C.gold);
    text("WHEN WREN IS THE EMPEROR", WIDTH / 2, 560, 52, C.ink, { alpha: seg(lt, w(4) + 0.3, w(4) + 0.8) });
    fadeOut(lt, d, 0.5);
  };

  /* ================================================================ r2 · the denarius */
  SC.denarius = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 84, "#8fc8ea", "#cfe7f4");
    for (let x = 0; x < LO_W; x++) px(x, 70 - Math.round(6 + Math.sin(x * 0.05) * 5 + Math.sin(x * 0.13) * 2), 1, 20, "#7fa860");
    ground(84, "#a39878", "#8c8166");
    for (let y = 100; y < LO_H; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < LO_W; x += 12) px(x, y, 11, 5, "#b9ae8e");   // paved road
    column(214, 84, 40); column(232, 84, 40);
    big(46, 128, 2, () => legionary(0, 0, { t, face: 1, arm: lt > w(12) ? "out" : null }));
    // the coin spins in, then pays out six small coins into the soldier's hand
    const kc = seg(lt, w(9), w(9) + 0.6), cx = 128, cy = 50;
    if (kc > 0) dcoin(cx, lerp(-20, cy, easeOut(kc)), 18, 0.98, { sx: kc < 1 ? Math.abs(Math.cos(kc * 9)) : 1 });
    for (let i = 0; i < 6; i++) {
      const k = seg(lt, w(12) + i * 0.12, w(12) + i * 0.12 + 0.5); if (k <= 0) continue;
      const hx = 58 + (i % 3) * 3, hy = 106 - Math.floor(i / 3) * 2;
      dcoin(lerp(cx, hx, k), lerp(cy + 10, hy, k) - Math.sin(k * Math.PI) * 16, 2, 0.98, { shadow: false });
    }
    const kg = seg(lt, w(19.5), w(22));
    if (lt > w(17)) gauge(160, 30, 9, 44, 0.98 * easeOut(kg));
    blitLo();
    where("ROMAN EMPIRE", "about 2,000 years ago", lt, d);
    label("AUGUSTUS · RULED 27 BC – AD 14", X(128), 650, { k: seg(lt, w(17), w(17) + 0.4), size: 36 });
    label("A SOLDIER'S PAY: 225 DENARII A YEAR", WIDTH / 2, 1000, { k: seg(lt, w(12) + 0.4, w(12) + 0.8), size: 34, bg: C.gold });
    if (kg > 0) {
      ctx.save(); ctx.globalAlpha = kg; ctx.fillStyle = "rgba(18,13,29,.85)"; ctx.fillRect(1420, 260, 360, 320); ctx.restore();
      text(`${Math.round(98 * easeOut(kg))}%`, 1600, 360, 120, "#e6ebf2", { alpha: kg });
      text("SILVER", 1600, 470, 52, C.ink, { alpha: kg });
      body("other 2%: bits of other metal", 1600, 540, 24, C.ink, { alpha: seg(lt, w(22), w(22) + 0.5) });
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r3 · the legions */
  function palace(t) {
    px(0, 0, LO_W, 110, "#5a1f24"); for (let y = 10; y < 110; y += 20) px(0, y, LO_W, 1, "#4a181d");
    for (const x of [20, 220]) column(x, 110, 100);
    px(0, 110, LO_W, 25, "#c9bfa6"); for (let x = 0; x < LO_W; x += 16) px(x, 110, 1, 25, "#b3a98f");
  }
  SC.legions = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(5) + 0.4;
    if (lt < split) {
      sky(0, 60, "#c8b48a", "#e8d6a8"); ground(60, "#a39878", "#8c8166");
      const frz = Math.min(lt, w(5));
      for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) {
        const x = ((i * 18 + frz * 14 + r * 9) % 300) - 30, f = 72 + r * 24;
        legionary(x, f, { t: frz + i * 0.3, walk: lt < w(5), spear: true });
      }
      blitLo();
      const dim = seg(lt, w(5), split); if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim * 0.7})`; ctx.fillRect(0, 0, WIDTH, H); }
      label("ROME RAN ON ITS ARMY", WIDTH / 2, 120, { k: seg(lt, w(1), w(1) + 0.4) * (1 - dim), size: 40, bg: C.gold });
      return;
    }
    palace(t);
    // the dying emperor in bed, two sons at his side
    px(46, 92, 64, 3, "#6b4a2a"); px(46, 95, 3, 12, "#5e3b1a"); px(107, 95, 3, 12, "#5e3b1a"); px(44, 84, 4, 11, "#6b4a2a");
    px(48, 86, 60, 6, "#f2ead6"); px(64, 84, 44, 8, R.purple); px(64, 84, 44, 1, C.gold);
    px(50, 82, 12, 4, "#ffffff"); px(52, 79, 6, 5, R.skin); px(52, 78, 6, 1, R.grey); px(51, 83, 6, 2, R.grey); px(56, 80, 1, 1, "#1a1010");
    roman(130, 108, { t, face: -1, tunic: "#e8e0c8", toga: R.purple, hair: "#3a2414" });
    roman(146, 108, { t: t + 1, face: -1, tunic: "#e8e0c8", toga: R.purple, hair: "#1a1010" });
    // the soldiers in front; coins pour onto them on "rich"
    for (let i = 0; i < 9; i++) legionary(28 + i * 24, 132, { t: t + i, spear: true, face: i % 2 ? -1 : 1, arm: lt > w(15) ? "up" : null });
    for (let i = 0; i < 46; i++) {
      const born = w(15) + i * 0.05, age = lt - born; if (age < 0) continue;
      const y = Math.min(124 - (i % 4), -6 + age * 140), x = 18 + hash(i) * 204;
      dcoin(x, y, 2, 0.98, { shadow: false });
    }
    blitLo();
    const ks = seg(lt, w(12), w(12) + 0.6);
    if (ks > 0) {
      ctx.save(); ctx.globalAlpha = ks;
      const sw = 1100 * easeOut(ks);
      ctx.fillStyle = "#f2e2b8"; ctx.fillRect(WIDTH / 2 - sw / 2, 170, sw, 230); ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 8; ctx.strokeRect(WIDTH / 2 - sw / 2, 170, sw, 230);
      ctx.restore();
      if (ks > 0.6) {
        body("“Enrich the soldiers,", WIDTH / 2, 240, 56, "#2a1a10", { shadow: false });
        body("and scorn all other men.”", WIDTH / 2, 310, 56, "#2a1a10", { shadow: false });
        body("Septimius Severus, dying, AD 211 · as reported by Cassius Dio", WIDTH / 2, 370, 26, "#5e3b1a", { shadow: false });
      }
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r4 · melt it down */
  SC.melt = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(14);
    if (lt < split) {
      palace(t);
      // the treasury chest; soldiers carry the silver away faster than it comes in
      const left = Math.round(lerp(24, 3, seg(lt, 0.3, w(8))));
      px(92, 96, 56, 14, "#6b4a2a"); px(92, 96, 56, 2, "#8a5a2b"); px(92, 103, 56, 1, C.gold); px(117, 100, 6, 5, C.gold);
      for (let i = 0; i < left; i++) dcoin(100 + (i % 8) * 6, 92 - Math.floor(i / 8) * 3, 3, 0.98, { shadow: false });
      for (let i = 0; i < 4; i++) {
        const u = ((lt * 0.5 + i * 0.25) % 1), x = i % 2 ? lerp(150, 250, u) : lerp(90, -10, u);
        legionary(x, 128, { t: t + i, walk: true, face: i % 2 ? 1 : -1 }); dcoin(x + (i % 2 ? 3 : -3), 117, 2, 0.98, { shadow: false });
      }
      // battles at every border: crossed swords flash at the screen edges
      for (let i = 0; i < 4; i++) if (Math.sin(t * 5 + i * 2) > 0.3 && lt < w(9)) {
        const x = i % 2 ? 222 : 14, y = 20 + Math.floor(i / 2) * 26;
        for (let k = 0; k < 9; k++) { px(x - 4 + k, y - 4 + k, 1, 1, "#e8edf5"); px(x + 4 - k, y - 4 + k, 1, 1, "#e8edf5"); }
      }
      // Wren's cameo: "that's my move"
      const kw = seg(lt, w(12), w(12) + 0.3) * (1 - seg(lt, split - 0.3, split));
      if (kw > 0) { wrenRoyal(156, 96 + Math.round((1 - kw) * 14), t); icon("pen", 162, 66 + Math.round((1 - kw) * 14)); }
      blitLo();
      label("SILVER IN: A LITTLE · PAY OUT: A LOT", WIDTH / 2, 140, { k: seg(lt, w(2), w(2) + 0.4), size: 38, bg: C.gold });
      if (kw > 0) label("HEY, THAT'S MY MOVE!", X(170), X(56) - 40, { k: kw, size: 34 });
      return;
    }
    // inside the mint: melt, add copper, strike more
    palace(t);
    const kc = seg(lt, w(17), w(19)), liquid = mixHex("#f4f7fb", "#ff8a3a", kc);
    big(56, 62, 2, () => crucible(0, 0, liquid, t));
    for (let i = 0; i < 4; i++) { const k = seg(lt, split + i * 0.2, split + i * 0.2 + 0.4); if (k > 0 && k < 1) dcoin(38 + i * 12, lerp(10, 64, k), 5, 0.98); }
    const ki = seg(lt, w(18), w(19)); if (ki > 0 && ki < 1) { const iy = lerp(4, 60, ki * ki); px(42, iy, 28, 8, "#b5562f"); px(42, iy, 28, 2, "#e08a55"); }
    // three strikes: 4 → 8 → 16 coins
    const strikes = [0, 1, 2].map((i) => w(20) + i * 0.28);
    const hit = strikes.reduce((n, a) => n + (lt >= a ? 1 : 0), 0);
    const near = Math.min(...strikes.map((a) => Math.abs(lt - a)));
    big(126, 112, 2, () => hammerDie(0, 0, lt > w(19.5) ? clamp(1 - near * 6, 0, 1) : 0));
    const n = hit === 0 ? 0 : 4 * Math.pow(2, hit - 1);
    for (let i = 0; i < n; i++) dcoin(164 + (i % 5) * 9, 124 - Math.floor(i / 5) * 7 - (i % 2) * 2, 4, 0.55, { shadow: false });
    blitLo();
    label("MELT", X(56), 330, { k: seg(lt, split, split + 0.3), size: 40 });
    if (kc > 0) label("+ CHEAP COPPER", X(56), 420, { k: seg(lt, w(17), w(17) + 0.3), size: 36, bg: "#e59a63" });
    if (n > 0) text(["", "4", "4 → 8", "4 → 8 → 16"][hit] + " COINS", 1380, 640, 50, C.gold);
    label("SAME SILVER · MORE COINS", WIDTH / 2, 160, { k: seg(lt, w(22), w(22) + 0.4), size: 44, bg: C.gold });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r5 · four coins */
  SC.fourcoins = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 40; i++) px(hash(i) * LO_W, hash(i + 40) * LO_H, 1, 1, C.line);
    const slots = [
      { x: 36, p: 0.98, show: 0.2, label: "AD 14", pct: "98%" },
      { x: 92, p: 0.8, show: 0.8, label: "NERO, AD 64", pct: "~80%" },
      { x: 148, p: 0.5, show: w(3), label: "AD 194", pct: "~50%" },
      { x: 204, p: 0.04, show: w(11), label: "AD 270", pct: "UNDER 5%" },
    ];
    const zoom = easeInOut(seg(lt, w(16), w(16) + 0.9)), others = 1 - zoom;
    slots.forEach((c, i) => {
      const k = seg(lt, c.show, c.show + 0.35); if (k <= 0) return;
      if (i === 3) return;
      faded(k * others, () => {
        dcoin(c.x, 44, Math.round(14 * pop(k)) || 1, c.p);
        gauge(c.x - 5, 66, 10, 40, c.p);
      });
    });
    // the last coin: drains, zooms in, then a thumb rubs the silver skin off
    const k4 = seg(lt, w(11), w(11) + 0.35);
    if (k4 > 0) {
      const drain = seg(lt, w(12), w(14.5)), cx = lerp(204, 120, zoom), cy = lerp(44, 64, zoom), r = Math.round(lerp(14 * pop(k4), 50, zoom));
      if (others > 0) faded(others, () => gauge(199, 66, 10, 40, lerp(0.98, 0.04, drain)));
      dcoin(cx, cy, r, 0.9, { shadow: zoom < 0.5 });
      const rub = seg(lt, w(19), w(21) + 0.4);
      if (rub > 0) {   // left of the thumb the skin is gone: plain copper, with a few silver flecks at the edge
        const sweep = cx - r + rub * 2.2 * r;
        lx.save(); lx.beginPath(); lx.rect(0, 0, Math.round(sweep), LO_H); lx.clip(); dcoin(cx, cy, r, 0.04, { shadow: false }); lx.restore();
        for (let i = 0; i < 26; i++) { const fy = cy - r + 4 + hash(i) * (2 * r - 8), fx = sweep - 2 - hash(i + 9) * 8; if (Math.hypot(fx - cx, fy - cy) < r - 3) px(fx, fy, 2, 1, "#e6ebf2"); }
        if (rub < 1) { const tx = Math.min(sweep, cx + r); px(tx - 6, cy - 6, 12, 22, R.skin); px(tx - 5, cy - 6, 10, 5, "#e8b58e"); px(tx - 6, cy + 16, 12, 10, R.skin2); }
      }
    }
    blitLo();
    text("SILVER IN ONE ROMAN COIN", WIDTH / 2, 80, 44, C.muted, { alpha: 1 - seg(zoom, 0, 0.3) });
    slots.forEach((c, i) => {
      const k = seg(lt, c.show, c.show + 0.35); if (k <= 0) return;
      const a = k * others;
      text(c.label, X(c.x), 905, 34, C.ink, { alpha: a });
      text(c.pct, X(c.x), 975, i === 3 ? 44 : 50, i === 3 ? C.bad : i === 0 ? "#e6ebf2" : C.gold, { alpha: a });
    });
    if (zoom > 0) {
      text("AD 270", WIDTH / 2, 90, 60, C.gold, { alpha: zoom });
      body("still looks like silver…", WIDTH / 2, 160, 40, C.ink, { alpha: zoom * (1 - seg(lt, w(19), w(19) + 0.3)) });
      stamp("SILVER SKIN, COPPER INSIDE", WIDTH / 2, 960, seg(lt, w(21), w(21) + 0.25), { size: 56, rot: -0.05 });
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r6 · wheat in Egypt */
  // price of a sack in drachmas by year: creeps 8 → 16 by 260, then leaps to 300 by 293 (Scheidel 2008; Robertson 2015)
  const wheatAt = (y) => y <= 260 ? 8 + 8 * (y - 100) / 160 : y <= 293 ? 16 + 284 * Math.pow((y - 260) / 33, 2) : 300;
  SC.wheat = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 60, "#f2c27a", "#f7dca6");
    px(0, 60, LO_W, 10, "#2f7aa8"); for (let i = 0; i < 20; i++) px((hash(i) * LO_W + t * 5) % LO_W, 62 + hash(i + 3) * 6, 4, 1, "#7fbce0");
    palm(16, 60, t, 18); palm(84, 60, t, 14);
    ground(70, C.sand, C.sand2);
    const ks = seg(lt, w(4), w(4) + 0.4);
    if (ks > 0) big(46, 124, 2, () => sackBig(0, 0));
    blitLo();
    where("ROMAN EGYPT", "the empire's breadbasket", lt, d);
    // the year, the price tag, and the chart drawing itself along
    const creep = seg(lt, w(16), w(22.5)), leap = seg(lt, w(23), w(29.5));
    const yr = lt < w(16) ? 100 : lt < w(23) ? Math.round(lerp(100, 260, creep)) : Math.round(lerp(260, 293, leap));
    const price = lt < w(23) ? 8 + 2 * Math.floor(creep * 4 + 0.001) : Math.round(wheatAt(yr));
    const kyr = seg(lt, w(13), w(13) + 0.4);
    if (kyr > 0) text("AD " + yr, 1500, 120, 70, C.gold, { alpha: kyr });
    const kt = seg(lt, w(9), w(9) + 0.3);
    if (kt > 0) {
      const sz = lerp(110, 170, clamp((price - 16) / 284, 0, 1)), cx = 760, cy = 560;
      ctx.save(); ctx.font = `${sz}px Silkscreen`; const tw = ctx.measureText(String(price)).width + sz * 0.6, th = sz * 1.4;
      const sc = pop(kt); ctx.translate(cx, cy); ctx.scale(sc, sc);
      ctx.strokeStyle = "#5e3b1a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-tw / 2, -th / 2 + 20); ctx.lineTo(-300, -60); ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(-tw / 2 + 10, -th / 2 + 10, tw, th);
      ctx.fillStyle = price > 16 ? "#ffe2d6" : "#fff8e8"; ctx.fillRect(-tw / 2, -th / 2, tw, th); ctx.strokeStyle = "#1a1026"; ctx.strokeRect(-tw / 2, -th / 2, tw, th);
      ctx.restore();
      text(String(price), cx, cy + 6, sz, price > 16 ? C.bad : "#1a1026", { shadow: false, alpha: kt });
      text("DRACHMAS", cx, cy + 140, 40, C.ink, { alpha: kt });
    }
    label("1 SACK OF WHEAT ≈ 30 KG", X(46), 1030, { k: seg(lt, w(5), w(5) + 0.4), size: 30 });
    body("drachma = Egypt's unit of money", 760, 330, 30, C.ink, { alpha: seg(lt, w(10), w(10) + 0.4) * (1 - seg(lt, w(16), w(16) + 0.3)) });
    if (lt > w(16) && lt < w(23)) label("CREEPING UP…", 760, 300, { k: seg(lt, w(16), w(16) + 0.3), size: 36 });
    if (lt > w(23)) label("THEN A LEAP!", 760, 270, { k: seg(lt, w(23), w(23) + 0.3), size: 44, bg: C.bad, color: "#fff" });
    const kch = seg(lt, w(15), w(15) + 0.5);
    if (kch > 0) {
      const pts = []; for (let y = 100; y <= Math.max(101, yr); y += 3) pts.push(wheatAt(y) / 300);
      pts.push(wheatAt(yr) / 300);
      const cx0 = 1150, cw = 700, cy0 = 220, ch = 600;
      ctx.save(); ctx.globalAlpha = kch;
      chart(cx0, cy0, cw, ch, [{ color: C.gold, pts }], 1, { title: "PRICE OF A SACK, DRACHMAS" });
      // the chart spans AD 100 → 300; redraw the line at true x positions
      ctx.fillStyle = "rgba(18,13,29,1)"; ctx.fillRect(cx0 + 4, cy0 + 60, cw - 8, ch - 64);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 10; ctx.lineJoin = "round"; ctx.beginPath();
      const PX = (y) => cx0 + 30 + (cw - 60) * (y - 100) / 200, PY = (v) => cy0 + ch - 30 - (ch - 90) * v / 300;
      for (let y = 100; y <= yr; y += 2) { y === 100 ? ctx.moveTo(PX(y), PY(wheatAt(y))) : ctx.lineTo(PX(y), PY(wheatAt(y))); }
      ctx.lineTo(PX(yr), PY(wheatAt(yr))); ctx.stroke();
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(PX(yr), PY(price), 12, 0, 7); ctx.fill();
      text("AD 100", PX(100) + 20, cy0 + ch + 30, 26, C.muted); text("AD 300", PX(300) - 20, cy0 + ch + 30, 26, C.muted);
      text("8", PX(100) + 10, PY(8) - 40, 32, C.ink);
      if (yr >= 260) text("16", PX(260) - 10, PY(16) - 40, 32, C.ink);
      if (yr >= 293) text("300", PX(293) - 70, PY(300) + 10, 40, C.gold);
      ctx.restore();
      body("flat for a long time… then a cliff", cx0 + cw / 2, cy0 + ch + 90, 34, C.ink, { alpha: seg(lt, w(29), w(30)) });
    }
  };

  /* ================================================================ r7 · the jar */
  SC.jar = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    px(0, 0, LO_W, 110, "#7a5236"); for (let i = 0; i < 30; i++) px(hash(i) * LO_W, hash(i + 9) * 108, 3, 1, "#6b4630");
    px(0, 110, LO_W, 25, "#5e3b1a"); for (let x = 0; x < LO_W; x += 14) px(x, 110, 1, 25, "#4a2f19");
    // the door (locked), the jar, the family
    px(6, 58, 22, 52, "#4a2f19"); px(8, 60, 18, 50, "#6b4a2a"); px(16, 60, 1, 50, "#4a2f19");
    const kl = seg(lt, w(19), w(19) + 0.3);
    if (kl > 0) { px(22, 82, 5, 5, C.gold); px(23, 79, 3, 3, "#1a1026"); px(24, 80, 1, 2, "#7a5236"); }
    big(46, 112, 2, () => jar(0, 0));
    big(74, 112, 2, () => roman(0, 0, { t, tunic: "#3f6fb8" })); big(98, 112, 2, () => roman(0, 0, { t: t + 1, tunic: "#d68910", hair: "#5a2a14", face: -1 }));
    big(86, 112, 1, () => roman(0, 0, { t: t + 2, tunic: "#16a085" }));
    // the shelf of bread: 52 loaves = a year (one a week); they vanish down to ~1.4 (ten days)
    for (let r = 0; r < 4; r++) px(108, 30 + r * 12 + 4, 122, 2, "#4a2f19");
    const gone = seg(lt, w(9), w(18)), left = Math.max(1.4, 52 - gone * 50.6);
    const whole = Math.floor(left);
    for (let i = 0; i < whole; i++) loaf(110 + (i % 13) * 9, 30 + Math.floor(i / 13) * 12);
    if (left - whole > 0.2) { px(110 + (whole % 13) * 9, 31 + Math.floor(whole / 13) * 12, 3, 2, R.bread); }
    // the mint keeps hammering: a small inset
    const km = seg(lt, w(23), w(23) + 0.4);
    if (km > 0) faded(km, () => {
      px(146, 76, 90, 50, "#1a1026"); px(148, 78, 86, 46, "#5a1f24");
      const sk = Math.abs(Math.sin(lt * 7));
      hammerDie(176, 120, sk > 0.8 ? 1 : sk);
      for (let i = 0; i < Math.min(24, Math.floor((lt - w(23)) * 8)); i++) dcoin(200 + (i % 6) * 5, 120 - Math.floor(i / 6) * 4, 2, 0.1, { shadow: false });
    });
    blitLo();
    const yr = gone < 0.02 ? "AD 100" : gone < 1 ? "LATER…" : "AD 300";
    const big1 = gone >= 1 ? "≈ 10 DAYS OF BREAD" : gone > 0.02 ? `${Math.round(left)} WEEKS OF BREAD` : "1 YEAR OF BREAD";
    text(yr, X(166), 130, 44, C.muted, { alpha: seg(lt, w(2), w(2) + 0.4) });
    text(big1, X(166), 200, 54, gone >= 1 ? C.bad : C.gold, { alpha: seg(lt, w(2), w(2) + 0.4) });
    label("SAVINGS", X(46), X(64), { k: seg(lt, 0.3, 0.8), size: 30 });
    label("SAME SUM", X(46), X(64) + 70, { k: seg(lt, w(12), w(12) + 0.4), size: 30, bg: C.gold });
    label("✓ NOTHING STOLEN", X(30), X(46), { k: seg(lt, w(19.5), w(19.5) + 0.4), size: 30, bg: C.leaf });
    if (km > 0) text("THE MINT", X(191), X(72), 34, C.gold, { alpha: km });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r8 · the edict */
  SC.edict = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    palace(t);
    tablet(88, 8, 146, 118);
    const ke = seg(lt, w(5), w(5) + 0.4), shrink = seg(lt, w(7), w(9));
    if (ke > 0) {
      big(30, 120, 3, () => roman(0, 0, { t, tunic: "#e8e0c8", toga: R.purple, laurel: true, beard: "#6a6a6a", hair: "#5a5a5a", arm: lt > w(7) ? "point" : null }));
      const sc = lerp(3, 1, shrink);
      lx.save(); lx.translate(68, 120); lx.scale(Math.max(1, Math.round(sc)), Math.max(1, Math.round(sc))); roman(0, 0, { t, face: -1, tunic: "#d68910", sack: true }); lx.restore();
    }
    blitLo();
    text("EDICT ON MAXIMUM PRICES", X(161), 150, 46, "#2a2420", { shadow: false, alpha: seg(lt, 0.2, 0.7) });
    text("AD 301", X(161), 215, 40, "#4a4440", { shadow: false, alpha: seg(lt, 0.2, 0.7) });
    if (ke > 0) label("DIOCLETIAN", X(30), 1020, { k: ke, size: 30 });
    label("GREED!", X(44), 300, { k: seg(lt, w(8), w(8) + 0.3), size: 44, bg: C.bad, color: "#fff" });
    const rows = [["WHEAT, 1 ARMY MEASURE", "100"], ["PORK, 1 POUND", "12"], ["FARM WORKER, 1 DAY", "25"], ["…AND OVER 1,000 MORE", ""]];
    rows.forEach(([a, b], i) => {
      const k = seg(lt, w(11) + i * 0.45, w(11) + i * 0.45 + 0.3); if (k <= 0) return;
      text(a, 760, 330 + i * 100, 42, "#2a2420", { align: "left", shadow: false, alpha: k });
      if (b) text(b, 1810, 330 + i * 100, 52, "#2a2420", { align: "right", shadow: false, alpha: k });
    });
    body("max prices, in denarii · the worker also gets meals", X(161), 730, 32, "#3a3430", { shadow: false, alpha: seg(lt, w(14), w(14) + 0.4) });
    stamp("CHARGE MORE: DEATH", X(161), 850, seg(lt, w(23), w(23) + 0.25), { size: 60 });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r9 · empty stalls */
  SC.emptystalls = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 104, "#c8b48a", "#e8d6a8");
    for (const x of [6, 234]) column(x, 104, 80);
    ground(104, "#a39878", "#8c8166");
    const drop = seg(lt, w(22), w(22) + 1.2), crack = seg(lt, w(21), w(22));
    faded(1 - drop, () => tablet(104, 4 + Math.round(easeInOut(drop) * 60), 32, 26, { crack }));
    // three market stalls at double size (half-res coordinates inside big())
    const xs = [22, 60, 98], awn = ["#c0392b", "#d68910", "#2e86c1"];
    const leaveA = w(13), leaveB = w(18.5);
    big(0, 0, 2, () => xs.forEach((x, i) => {
      const lk = seg(lt, leaveA + i * (leaveB - leaveA) / 3, leaveA + (i + 0.9) * (leaveB - leaveA) / 3);
      const out = i === 0 ? -1 : 1, sx = x + out * easeInOut(clamp(lk * 1.6 - 0.4, 0, 1)) * 70;
      roman(sx, lk > 0.25 ? 60 : 50, { t: t + i, face: lk > 0.25 ? out : 1, tunic: ["#e8e0c8", "#3f6fb8", "#7d3c98"][i], walk: lk > 0.25 && lk < 1, sack: lk > 0.2 });
      stall(x, 60, awn[i], i === 1 ? 1 - seg(lt, w(6), w(6) + 0.3) : 1);
      if (lk < 0.2) {
        if (i === 0) for (let j = 0; j < 4; j++) loaf(x - 12 + j * 7, 47);
        if (i === 1) for (let j = 0; j < 4; j++) amphora(x - 9 + j * 6, 50);
        if (i === 2) for (let j = 0; j < 3; j++) { px(x - 12 + j * 9, 44, 7, 6, ["#c0392b", "#f2ead6", "#2e86c1"][j]); px(x - 12 + j * 9, 44, 7, 1, "rgba(255,255,255,.4)"); }
      }
    }));
    big(120, 134, 2, () => legionary(0, 0, { t, spear: true }));
    blitLo();
    const flash = seg(lt, w(6), w(6) + 0.15) * (1 - seg(lt, w(6) + 0.15, w(6) + 0.5));
    if (flash > 0) { ctx.fillStyle = `rgba(200,20,20,${0.35 * flash})`; ctx.fillRect(0, 0, WIDTH, H); }
    xs.forEach((x) => label("MAX PRICE", X(x * 2), X(68), { k: seg(lt, 0.3, 0.7), size: 26, bg: "#fff8e8" }));
    body("A writer of the time: Lactantius, a critic of Diocletian", 40, 1045, 32, C.ink, { align: "left", alpha: seg(lt, 0.3, 0.8) });
    body("“men were afraid to put anything up for sale”", WIDTH / 2, 330, 40, "#2a1a10", { shadow: false, alpha: seg(lt, w(13), w(13) + 0.4) * (1 - seg(lt, w(18), w(18) + 0.3)) });
    label("PRICE: CAPPED · GOODS: GONE", WIDTH / 2, 330, { k: seg(lt, w(18.3), w(18.3) + 0.4), size: 44, bg: C.gold });
    stamp("LAW DROPPED", WIDTH / 2, 160, seg(lt, w(22), w(22) + 0.25), { size: 70 });
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ r10 · callback + teaser */
  SC.callback = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    // left: Ulm Hollow at night, the cave, Wren and spilling pentaja
    sky(0, 100, "#1d1530", "#2a1f45"); px(0, 100, 119, 35, "#3d2f5a");
    cave(54, 44, 56, 56, t);
    const spill = seg(lt, w(2), w(2) + 2), n = Math.floor(spill * 22);
    for (let i = 0; i < n; i++) { const k = clamp((lt - w(2) - i * 0.09) / 0.5, 0, 1); icon("pen", lerp(54, 10 + hash(i) * 70, k) - 6, lerp(84, 100 - hash(i + 2) * 6, k) - 12 - Math.sin(k * Math.PI) * 10); }
    const shrug = seg(lt, w(16.5), w(16.5) + 0.6);
    wrenRoyal(90, 112, t, { lift: shrug > 0 && shrug < 1 ? Math.round(Math.abs(Math.sin(shrug * Math.PI * 2)) * 3) : 0 });
    // right: a Roman building, hammering
    px(121, 0, 119, 100, "#7fb6dc"); px(121, 60, 119, 40, "#a6cde6"); px(121, 100, 119, 35, "#a39878");
    for (let i = 0; i < 18; i++) px(132 + i, 32 - i * 0.5, 96 - 2 * i, 1, i % 3 ? R.marble : R.marble2);   // pediment
    px(128, 32, 104, 4, R.marble2);
    for (const x of [140, 160, 200, 220]) column(x, 100, 62);
    const door = seg(lt, w(15.5), w(15.5) + 0.4);
    if (door < 1) { px(170, 62, 20, 38, "#2a1a10"); px(172, 64, 16, 36, "#3a2414"); }
    if (door > 0) faded(door, () => {
      for (let i = 0; i < 38; i++) { const hw = Math.round(Math.min(10, 3 + i * 0.5) + Math.sin(i * 1.3) * 1); px(180 - hw, 62 + i, hw * 2, 1, i % 5 ? "#5a4570" : "#4a3860"); px(180 - hw + 2, 62 + i, Math.max(0, hw * 2 - 4), 1, "#0d0814"); }
      const g = 0.5 + 0.5 * Math.sin(t * 3); px(177, 84, 2, 2, `rgba(255,111,181,${0.4 + 0.5 * g})`); px(183, 92, 2, 2, `rgba(255,111,181,${0.9 - 0.5 * g})`);
    });
    if (lt > w(9)) { const k = Math.abs(Math.sin(lt * 6)); if (k > 0.9) for (let i = 0; i < 4; i++) px(176 + hash(i + Math.floor(lt * 6)) * 10, 58 - hash(i) * 6, 1, 1, C.gold); }
    px(119, 0, 2, LO_H, "#120d1d");
    blitLo();
    label("ULM HOLLOW · LUCK", X(60), 960, { k: seg(lt, 0.2, 0.6), size: 34, bg: C.pen });
    label("ROME · NO LUCK NEEDED", X(180), 960, { k: seg(lt, w(9), w(9) + 0.4), size: 34, bg: C.gold });
    const flip = seg(lt, w(15.5), w(15.5) + 0.3);
    ctx.save(); ctx.translate(X(180), X(39)); ctx.scale(1, Math.abs(Math.cos(flip * Math.PI)) || 0.01);
    ctx.fillStyle = "#fff8e8"; ctx.fillRect(-120, -26, 240, 52); ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 5; ctx.strokeRect(-120, -26, 240, 52);
    text(flip < 0.5 ? "SPQR" : "MINT", 0, 3, 40, flip < 0.5 ? "#1a1026" : C.bad, { shadow: false });
    ctx.restore();
    text("CAVE = MINT", WIDTH / 2, 150, 90, C.gold, { alpha: seg(lt, w(16), w(16) + 0.4) });
    // teaser: everything dims, a gold bar glows
    const tz = seg(lt, w(19), w(19) + 0.6);
    if (tz > 0) {
      ctx.fillStyle = `rgba(10,6,18,${0.88 * tz})`; ctx.fillRect(0, 0, WIDTH, H);
      const g = 0.6 + 0.4 * Math.sin(t * 3);
      ctx.save(); ctx.globalAlpha = tz;
      ctx.fillStyle = `rgba(255,210,63,${0.18 * g})`; ctx.beginPath(); ctx.arc(WIDTH / 2, 560, 260, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#b8862e"; ctx.fillRect(WIDTH / 2 - 180, 500, 360, 130); ctx.fillStyle = C.gold; ctx.fillRect(WIDTH / 2 - 150, 500, 300, 90); ctx.fillStyle = "#fff2b0"; ctx.fillRect(WIDTH / 2 - 140, 510, 120, 14);
      ctx.restore();
      text("?", WIDTH / 2, 360, 140, C.gold, { alpha: tz });
      text("NEXT · FINALE", WIDTH / 2, 760, 44, C.muted, { alpha: seg(lt, w(19) + 0.4, w(19) + 0.9) });
      text("MONEY WITH NO CAVE?", WIDTH / 2, 850, 76, C.ink, { alpha: seg(lt, w(19) + 0.6, w(19) + 1.1) });
    }
    fadeOut(lt, d, 1.0);
  };
})();
