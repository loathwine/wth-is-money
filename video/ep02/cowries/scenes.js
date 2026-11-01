/* EP 02 · scenes for chapter 4 (Cowries).
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   W(n) = the moment word n of the narration is spoken (see SCRIPT.md for the cue list). */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, person, sea, sky, palm,
    schooner, icon, alien, text, body, label, stamp, where, blitLo, fadeOut, SC, ground, hut, cave, cowrie, coin, sack } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  /* ---------------------------------------------------------------- chapter props */
  const SHELL = "#f3e6c6", SHELL2 = "#c9b177", SHELLD = "#8c7650";
  const tiny = (x, y) => { px(x - 1, y, 3, 2, SHELL); px(x, y, 1, 2, SHELLD); };           // a cowrie, 3×2
  // a "head" of 2,000 shells: a fat tied bundle
  function head(cx, cy, r = 6) {
    disc(cx + 1, cy + 1, r, "rgba(0,0,0,.35)"); disc(cx, cy, r, SHELL2); disc(cx - 1, cy - 1, r - 1, SHELL);
    for (let i = 0; i < r * 3; i++) px(cx - r + 1 + hash(i + cx) * (2 * r - 2), cy - r + 2 + hash(i + cy * 3) * (2 * r - 3), 1, 1, SHELLD);
    px(cx - 2, cy - r - 1, 4, 2, C.wood2); px(cx - 1, cy - r - 3, 1, 2, C.wood2); px(cx + 1, cy - r - 3, 1, 2, C.wood2);
  }
  // clay pot of palm oil
  function pot(x, base, s = 1) {
    for (let i = 0; i < 7 * s; i++) { const u = i / (7 * s), hw = Math.round((2.5 + 2 * Math.sin(Math.PI * Math.min(1, u / 0.85))) * s); px(x - hw, base - i - 1, hw * 2, 1, i % 3 ? "#a4532c" : "#8a4322"); }
    px(x - 2 * s, base - 8 * s, 4 * s, s, "#e8742a"); px(x - 2 * s, base - 8 * s - 1, 4 * s, 1, "#7a3a1c");
  }
  // savings jar (terracotta), with shells showing at the mouth
  function jar(cx, base, h = 30) {
    for (let i = 0; i < h; i++) {
      const u = i / h, hw = Math.round(u > 0.92 ? 8 : u > 0.8 ? 6 : 7 + 8 * Math.sin(Math.PI * u / 0.8));
      px(cx - hw, base - i - 1, hw * 2, 1, u > 0.8 && u <= 0.92 ? "#7a3d22" : "#a0522d");
      px(cx + hw - Math.max(1, hw / 3), base - i - 1, Math.max(1, hw / 3), 1, "#7a3d22");
      px(cx - hw + 2, base - i - 1, 1, 1, u > 0.2 && u < 0.7 ? "#c4703f" : "#a0522d");
    }
    for (let i = 0; i < 6; i++) tiny(cx - 5 + i * 2, base - h - 1 + (i % 2));
  }
  // maize dough ball (kenkey) in its leaf
  const kenkey = (x, y) => { disc(x, y, 5, "#6aa84f"); disc(x, y - 1, 3, "#efe6cf"); px(x - 1, y - 3, 2, 1, "#fffaf0"); };
  // a small merchant brig; flag = colour of its little pennant
  function brig(x, y, t, flag, sc = 1) {
    x = Math.round(x); y = Math.round(y + Math.sin(t * 1.6 + x) * 0.7);
    const L = 26 * sc;
    for (let i = 0; i < L; i++) { const dd = i < 4 ? 4 - i : i > L - 3 ? i - (L - 3) : 0; px(x - L / 2 + i, y + Math.floor(dd / 2), 1, 4 * sc - Math.floor(dd / 2), "#4a2f19"); }
    for (const [mx, mh] of [[-5 * sc, 16 * sc], [5 * sc, 19 * sc]]) {
      px(x + mx, y - mh, 1, mh, "#3b2615"); px(x + mx - 5 * sc, y - mh + 3, 5 * sc, mh - 6 * sc, "#f2ead6"); px(x + mx + 1, y - mh + 4, 3 * sc, mh - 8 * sc, "#e2d8c0");
    }
    if (flag) { px(x + 5 * sc + 1, y - 19 * sc, 3, 1, flag[0]); px(x + 5 * sc + 1, y - 19 * sc + 1, 3, 1, flag[1] || flag[0]); }
  }
  const mini = (x, y) => { px(x - 3, y, 7, 2, "#4a2f19"); px(x, y - 5, 1, 5, "#3b2615"); px(x - 2, y - 4, 2, 3, "#f2ead6"); px(x + 1, y - 4, 2, 3, "#f2ead6"); };
  // a market woman / trader: a person with a head-wrap
  function vendor(x, feet, o = {}) { person(x, feet, o); if (o.wrap) { px(x - 3, feet - 18, 6, 3, o.wrap); px(x - 2, feet - 19, 4, 1, o.wrap); } }
  // a fluffy bogwool bale (EP 01)
  function bale(cx, cy, r, t = 0) {
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; disc(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.55, Math.max(2, Math.round(r * 0.45)), "#4f8a3a"); }
    disc(cx, cy, Math.round(r * 0.8), "#8fd16a");
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3; disc(cx + Math.cos(a) * r * 0.55, cy - 1 + Math.sin(a) * r * 0.42, Math.max(1, Math.round(r * 0.3)), i % 2 ? "#8fd16a" : "#c8f2a8"); }
  }
  // a pixel ellipse (coins seen spinning)
  function ell(cx, cy, rx, ry, c) { for (let y = -ry; y <= ry; y++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.4)) ** 2))); if (hw > 0) px(cx - hw, cy + y, hw * 2, 1, c); } }
  // a silhouette of an EP 01 alien (drawn into a scratch canvas, then tinted)
  const sil = document.createElement("canvas"); sil.width = 30; sil.height = 30; const sx = sil.getContext("2d");
  function silhouette(id, x, feet, t, color) {
    sx.globalCompositeOperation = "source-over"; sx.clearRect(0, 0, 30, 30); Art.drawAlien(sx, 15, 26, id, t);
    sx.globalCompositeOperation = "source-in"; sx.fillStyle = color; sx.fillRect(0, 0, 30, 30);
    lx.drawImage(sil, Math.round(x - 15), Math.round(feet - 26));
  }
  // an open hand (palm up) or a fist, reaching in from the left
  function hand(x, y, closed, cloth = "#2e86c1") {
    const sk = C.skin, sk2 = C.skin2;
    px(x - 46, y - 2, 12, 12, cloth); px(x - 46, y - 2, 12, 1, "#1f5f8a");
    px(x - 34, y, 22, 8, sk); px(x - 34, y + 7, 22, 1, sk2);
    if (!closed) {
      px(x - 14, y - 1, 16, 8, sk); px(x - 14, y + 6, 16, 2, sk2);           // palm
      for (let i = 0; i < 4; i++) px(x + 2, y + i * 2, 9 - Math.abs(i - 1), 2, i % 2 ? sk2 : sk);  // fingers
      px(x - 12, y - 6, 3, 6, sk); px(x - 12, y - 7, 3, 1, sk2);             // thumb up
    } else {
      px(x - 14, y - 4, 15, 13, sk); px(x - 14, y + 8, 15, 1, sk2);
      for (let i = 0; i < 4; i++) px(x - 3, y - 3 + i * 3, 4, 1, sk2);
      px(x - 15, y - 6, 10, 3, sk); px(x - 15, y - 4, 10, 1, sk2);            // thumb over the top
    }
  }

  /* ---------------------------------------------------------------- the map (map units; Africa ≈ 115 wide) */
  const AFRICA = [[6, 16], [15, 5], [30, 1], [45, 3], [60, 4], [72, 2], [82, 5], [86, 12], [92, 22], [98, 30], [106, 34], [113, 35], [108, 46], [102, 56], [100, 64], [97, 74],
    [95, 84], [90, 94], [84, 102], [76, 108], [68, 112], [60, 111], [55, 104], [52, 94], [50, 84], [48, 74], [46, 64], [42, 58], [34, 57], [24, 56], [16, 52], [9, 46], [3, 38], [2, 28]];
  const ARABIA = [[88, 2], [100, 4], [112, 10], [124, 18], [128, 26], [116, 34], [106, 30], [98, 22], [92, 12]];
  const INDIA = [[140, 8], [160, 4], [176, 10], [174, 22], [166, 36], [160, 46], [155, 36], [150, 24], [142, 18]];
  const EUROPE = [[-4, -14], [0, -24], [14, -30], [30, -36], [48, -38], [70, -34], [92, -30], [100, -20], [96, -10], [84, -8], [74, -12], [64, -6], [54, -12], [40, -10], [30, -6], [22, -8], [14, -6], [4, -6]];
  const PLACES = { maldives: [153, 58], hamburg: [44, -32], zanzibar: [102, 64], dahomey: [32, 57], wa: [31, 49] };
  function rows(pts, ox, oy, s, cb) {  // scanline-fill a polygon: cb(y, x0, x1) per row
    const P = pts.map(([x, y]) => [ox + x * s, oy + y * s]);
    const y0 = Math.max(0, Math.floor(Math.min(...P.map((p) => p[1])))), y1 = Math.min(LO_H - 1, Math.ceil(Math.max(...P.map((p) => p[1]))));
    for (let y = y0; y <= y1; y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length]; if ((ay <= yc) !== (by <= yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) cb(y, Math.round(xs[i]), Math.round(xs[i + 1]));
    }
  }
  function worldMap(ox, oy, s, t, o = {}) {
    const at = (p) => [ox + p[0] * s, oy + p[1] * s];
    sea(t, 0, { speed: 0.3 });
    const lands = [AFRICA, ARABIA, INDIA].concat(o.europe ? [EUROPE] : []);
    for (const g of lands) rows(g, ox + 1, oy + 1, s, (y, a, b) => px(a, y, b - a, 1, "rgba(8,25,55,.55)"));
    for (const g of lands) rows(g, ox, oy, s, (y, a, b) => px(a, y, b - a, 1, "#7fa24e"));
    rows(AFRICA, ox, oy, s, (y, a, b) => { const my = (y - oy) / s; if (my < 26) for (let x = a; x < b; x++) if (my < 20 || (x + y) % 2) px(x, y, 1, 1, "#c9b56a"); });
    ell(ox + 108 * s, oy + 86 * s, Math.max(1, Math.round(3 * s)), Math.round(9 * s), "#7fa24e");      // Madagascar
    const z = at(PLACES.zanzibar); px(z[0] + 1, z[1] - 1, 2, 3, "#7fa24e");
    const k = o.wash || 0;
    if (k > 0) {
      const [cx, cy] = at(PLACES.wa), rx = 25 * s * k, ry = 9 * s * k;
      rows(AFRICA, ox, oy, s, (y, a, b) => {
        const dy = (y + 0.5 - cy) / ry; if (Math.abs(dy) >= 1) return;
        const hw = rx * Math.sqrt(1 - dy * dy), l = Math.max(a, Math.round(cx - hw)), r = Math.min(b, Math.round(cx + hw));
        if (r > l) { px(l, y, r - l, 1, "#f3e3b8"); for (let x = l; x < r; x++) if ((x * 3 + y * 5) % 7 === 0) px(x, y, 1, 1, "#c9a96a"); }
      });
    }
    return at;
  }
  // a dotted route along map points, drawn up to k; returns the point at k
  function route(P, k, c = C.foam) {
    const L = []; let tot = 0;
    for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(l); tot += l; }
    let d = tot * clamp(k, 0, 1), pos = P[0];
    for (let dist = 0, i = 0; i < L.length; i++) {
      for (let u = 0; u < L[i]; u += 1) { if (dist + u > d) break; if (Math.floor(dist + u) % 4 === 0) px(lerp(P[i][0], P[i + 1][0], u / L[i]), lerp(P[i][1], P[i + 1][1], u / L[i]), 1, 1, c); }
      if (dist + L[i] >= d) { const u = (d - dist) / L[i]; pos = [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)]; return pos; }
      dist += L[i]; pos = P[i + 1];
    }
    return pos;
  }

  /* ================================================================ CHAPTER 4 · COWRIES */
  // c0 · "Chapter four. Cowries: the money that got too heavy to carry."
  SC.ctitle = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    for (let i = 0; i < 70; i++) px(hash(i) * LO_W, hash(i + 70) * LO_H, 1, 1, C.line);
    const sag = lt > w(8) ? 2 + Math.round(Math.sin(clamp((lt - w(8)) * 12, 0, Math.PI)) * 2) : 0;
    for (let i = 0; i < 40; i++) {
      const born = 0.2 + i * 0.07, age = lt - born; if (age < 0) continue;
      const x = 14 + hash(i) * 212, hill = 14 * Math.exp(-(((x - 120) / 60) ** 2));
      const rest = 128 - hill - Math.floor(hash(i + 5) * 3) * 4 + sag;
      cowrie(x, lerp(-10, rest, Math.min(1, (age / 0.9) ** 2)), 1);
    }
    blitLo();
    text("CHAPTER 4", WIDTH / 2, 280, 40, C.muted, { alpha: seg(lt, 0.3, 0.8) });
    const kt = seg(lt, w(2), w(2) + 0.35);
    if (kt > 0) { ctx.save(); ctx.translate(WIDTH / 2, 420); ctx.scale(pop(kt), pop(kt)); text("COWRIES", 0, 0, 150, C.gold); ctx.restore(); }
    body("the money that got too heavy to carry", WIDTH / 2, 560 + (lt > w(8) ? 6 : 0), 44, C.ink, { alpha: seg(lt, w(3), w(3) + 0.5) });
    fadeOut(lt, d, 0.4);
  };

  // c1 · cowrie country on the map; the shells came from the Maldives
  SC.shellmap = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const ox = 40, oy = 14, sc = 0.95;
    const at = worldMap(ox, oy, sc, t, { wash: easeOut(seg(lt, w(2), w(5) + 0.6)) });
    const km = seg(lt, w(18), w(18) + 2.2), M = at(PLACES.maldives);
    if (km > 0) {
      route([[153, 58], [136, 88], [112, 116], [80, 121], [62, 119], [44, 108], [34, 92], [28, 72], [30, 60]].map(at), easeInOut(km), C.gold);
      if (Math.floor(t * 4) % 2 || km > 0.9) disc(M[0], M[1], 2, C.gold);
    }
    const kc = seg(lt, w(9), w(9) + 0.35);
    if (kc > 0) { lx.save(); lx.globalAlpha = kc; cowrie(222, 104 - (1 - easeOut(kc)) * 10, 3); lx.restore(); }
    blitLo();
    where("WEST AFRICA", "from the 1300s on", lt, d);   // no end date: inland, shells stayed in use into the 1930s
    label("COWRIE COUNTRY", X(46), X(86), { k: seg(lt, w(4), w(4) + 0.4), size: 32, bg: "#f3e3b8" });
    if (kc > 0) { text("A COWRIE", X(222), X(80), 30, C.ink, { alpha: kc }); label("≈ 1 GRAM", X(222), X(127), { k: kc, size: 28 }); }
    if (km > 0) label("MALDIVES", X(M[0]) + 190, X(M[1]), { k: seg(lt, w(18), w(18) + 0.4), size: 34, bg: C.gold });
    if (km > 0) body("Indian Ocean", X(160), X(116), 30, C.foam, { alpha: seg(lt, w(21), w(21) + 0.5) * 0.85 });
  };

  // c2 · counting: one shell, a string of 40, a head of 2,000
  SC.strings = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    for (let y = 0; y < LO_H; y += 4) for (let x = 0; x < LO_W; x += 4) px(x, y, 4, 4, ((x + y) / 4) % 2 ? "#c49a52" : "#b38845");   // woven mat
    for (let y = 0; y < LO_H; y += 8) px(0, y, LO_W, 1, "#9c7538");
    const ks = seg(lt, w(9), w(9) + 0.6), kh = seg(lt, w(13), w(13) + 0.6), kb = seg(lt, w(13) + 0.7, w(13) + 1.3);
    // before the string: one big shell between two hands
    const one = 1 - seg(lt, w(9) - 0.2, w(9) + 0.2);
    if (one > 0) {
      lx.save(); lx.globalAlpha = one; cowrie(120, 64, 2);
      for (const [hx0, f] of [[84, 1], [156, -1]]) {   // two hands, counting
        px(hx0 - 6, 104, 12, 32, C.skin); px(hx0 + (f > 0 ? 4 : -6), 104, 2, 32, C.skin2);
        px(hx0 - 8, 92, 16, 14, C.skin); px(hx0 - 8, 105, 16, 1, C.skin2);
        for (let i = 0; i < 4; i++) { px(hx0 - 8 + i * 4, 85 + (i === 1 || i === 2 ? -1 : 1), 3, 8, C.skin); px(hx0 - 8 + i * 4 + 3, 87, 1, 6, C.skin2); }
        px(f > 0 ? hx0 + 8 : hx0 - 13, 96, 5, 4, C.skin); px(f > 0 ? hx0 + 8 : hx0 - 13, 99, 5, 1, C.skin2);
      }
      lx.restore();
    }
    // the string of 40, growing on a cord
    const n40 = Math.floor(ks * 40), sx0 = 36;
    if (ks > 0) { px(sx0, 12, 1, n40 * 2.6 + 2, C.wood2); for (let i = 0; i < n40; i++) tiny(sx0, 14 + i * 2.6); }
    // fifty strings, then squeezed into one head
    const n50 = Math.floor(kh * 50), hx = 160, hy = 72;
    for (let i = 0; i < n50; i++) {
      const x0 = 66 + i * 3.4, x = lerp(x0, hx, easeInOut(kb)), a = 1 - kb;
      if (a <= 0) break;
      lx.save(); lx.globalAlpha = a; px(x, 22, 1, 100, C.wood2); for (let j = 0; j < 40; j += 2) tiny(x, 24 + j * 2.4); lx.restore();
    }
    if (kb > 0) head(hx, hy, Math.round(6 + 16 * easeOut(kb)));
    blitLo();
    label("1 SHELL = VERY LITTLE", WIDTH / 2, 200, { k: seg(lt, w(1), w(1) + 0.4) * one, size: 36 });
    if (ks > 0) { text(String(Math.max(1, n40)), X(sx0) + 110, 160, 70, C.gold); label("STRING = 40", X(sx0) + 40, X(124), { k: seg(lt, w(11), w(11) + 0.4), size: 32 }); }
    if (kh > 0) text(fmt(kb > 0 ? 2000 : Math.max(40, n50 * 40)), X(hx), 120, 80, C.gold);
    if (kb > 0) { label("HEAD = 2,000", X(hx), X(hy) + 250, { k: kb, size: 40, bg: C.gold }); label("≈ 2 KG · A BAG OF FLOUR", X(hx), X(hy) + 345, { k: seg(lt, w(13) + 0.9, w(13) + 1.3), size: 30 }); }
  };

  // c3 · a coastal market; ships bring shells by the ton; the slave trade; palm oil
  SC.ships = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(10);
    if (lt < split) {
      sky(0, 70, "#8fd0f0", "#cdebf8"); ground(70, "#c98a52", "#b5763f");
      const stalls = [[40, "#c0392b"], [120, "#d68910"], [200, "#16a085"]];
      for (const [x, c] of stalls) {
        px(x - 22, 62, 1, 34, C.wood2); px(x + 21, 62, 1, 34, C.wood2);
        for (let i = 0; i < 44; i++) px(x - 22 + i, 56 + (i % 8 < 4 ? 0 : 1), 1, 6, i % 8 < 4 ? c : "#f2ead6");
        for (let k = 0; k < 5; k++) { const sx = x - 16 + k * 8; px(sx, 62, 1, 12, C.wood2); for (let j = 0; j < 4; j++) tiny(sx, 63 + j * 3); }  // shell strings for sale
        px(x - 20, 86, 40, 4, C.wood); px(x - 20, 86, 40, 1, "#a87240");
        for (let k = 0; k < 4; k++) { disc(x - 13 + k * 9, 84, 3, ["#8a5a2b", "#e8742a", "#5fbf4a", "#c9a35a"][k]); }
        vendor(x, 86, { t: t + x, cloth: c, wrap: c, arm: "up" });
      }
      // buyers paying with strings of shells
      const cols = ["#2e86c1", "#7d3c98", "#c0392b", "#d68910", "#16a085"];
      for (let i = 0; i < 5; i++) {
        const x = 18 + i * 50 + Math.sin(t * 0.6 + i) * 4;
        vendor(x, 118, { t: t + i, cloth: cols[i], wrap: i % 2 ? cols[(i + 2) % 5] : null, face: i % 2 ? -1 : 1 });
        const u = (t * 0.7 + i * 0.37) % 1; if (u < 0.5) { const yy = 104 - Math.sin(u * 2 * Math.PI) * 8; px(x + 3, yy - 4, 1, 8, C.wood2); tiny(x + 3, yy - 3); tiny(x + 3, yy); }
      }
      blitLo();
      where("WEST AFRICAN COAST", "1600s–1800s", lt, split);
      label("THEIR MARKETS RAN ON SHELLS", WIDTH / 2, X(30), { k: seg(lt, w(5), w(5) + 0.4), size: 36, bg: C.gold });
      return;
    }
    const dusk = seg(lt, split, split + 1);
    const dark = seg(lt, w(18), w(18) + 1) * (1 - seg(lt, w(22), w(22) + 1.4));
    sky(0, 44, dusk < 0.5 ? "#8fd0f0" : "#e9a86a", dusk < 0.5 ? "#cdebf8" : "#f6cf8e");
    sea(t, 44, { speed: 0.5 }); for (let x = 0; x < LO_W; x++) px(x, 84 + Math.round(Math.sin(x * 0.15 + t * 2)), 1, 2, C.foam);
    px(0, 86, LO_W, LO_H - 86, C.sand); for (let i = 0; i < 40; i++) px(hash(i) * LO_W, 88 + hash(i + 40) * 45, 2, 1, C.sand2);
    schooner(176, 54, t);
    const ferry = lt - split, nSacks = Math.min(18, Math.floor(ferry / 0.45));
    if (ferry > 0) { const u = (ferry / 1.8) % 1; T.canoe(lerp(150, 96, easeInOut(u)), lerp(62, 82, u), { w: 22, crew: 2, t }); if (u < 0.85) { sack(lerp(150, 96, easeInOut(u)) - 7, lerp(62, 82, u) - 8); sack(lerp(150, 96, easeInOut(u)), lerp(62, 82, u) - 8); } }
    for (let i = 0; i < nSacks; i++) sack(30 + (i % 6) * 8, 116 - Math.floor(i / 6) * 7);
    const oil = seg(lt, w(22) + 0.8, w(24));
    if (oil > 0) {
      for (let i = 0; i < Math.floor(oil * 6); i++) pot(140 + (i % 3) * 12, 124 - Math.floor(i / 3) * 10);
      vendor(124, 124, { t, cloth: "#d68910", wrap: "#d68910", face: -1 }); vendor(92, 124, { t: t + 1, cloth: "#2e86c1", face: 1, arm: "up" });
    }
    if (dark > 0) px(0, 0, LO_W, LO_H, `rgba(8,4,14,${0.9 * dark})`);
    blitLo();
    label("ONE SHIP, 1720s: ABOUT 12 TONNES OF SHELLS", WIDTH / 2, 1000, { k: seg(lt, w(14), w(14) + 0.4) * (1 - dark), size: 30, bg: C.gold });
    text("CENTURIES OF THE SLAVE TRADE", WIDTH / 2, H / 2, 54, "#f2ead6", { alpha: dark });
    label("1800s · PALM OIL", X(152), X(84) - 40, { k: seg(lt, w(24), w(24) + 0.4), size: 34, bg: "#e8742a" });
  };

  // c4 · 1845: a Hamburg firm finds cheap shells in Zanzibar
  SC.zanzibar = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const at = worldMap(78, 36, 0.85, t, { europe: true });
    const Hm = at(PLACES.hamburg), Z = at(PLACES.zanzibar), D = at(PLACES.dahomey);
    // the reef round Zanzibar
    const kr = seg(lt, w(10), w(10) + 0.4);
    if (kr > 0) for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; px(Z[0] + 2 + Math.cos(a) * 5, Z[1] + Math.sin(a) * 6, 1, 1, i % 3 ? "#4fd1c5" : "#ff8a7a"); }
    // Hamburg warehouse
    px(Hm[0] - 3, Hm[1] - 3, 7, 4, "#8a4b2b"); px(Hm[0] - 4, Hm[1] - 4, 9, 1, "#5e2b16");
    const out = [[44, -32], [8, -22], [-6, 0], [-8, 30], [6, 58], [40, 82], [56, 116], [76, 118], [100, 92], [104, 66]];
    const back = [[104, 66], [100, 92], [76, 118], [56, 116], [42, 86], [32, 60]];
    const k1 = seg(lt, w(4), w(10)), k2 = seg(lt, w(21), w(24));
    if (k1 > 0 && k2 <= 0) { const p = route(out.map(at), easeInOut(k1)); mini(p[0], p[1]); }
    if (k2 > 0) { route(out.map(at), 1, "rgba(207,230,255,.35)"); const p = route(back.map(at), easeInOut(k2), C.gold); mini(p[0], p[1]); }
    if (k2 > 0.95 && Math.floor(t * 4) % 2) disc(D[0], D[1], 2, C.gold);
    // left panel: the reef trade, then the two shells, then their prices
    const kp = seg(lt, w(11), w(11) + 0.3), kc = seg(lt, w(15), w(15) + 0.3), kpr = seg(lt, w(18), w(18) + 0.5);
    if (kp > 0) {
      px(4, 26, 66, 104, "#1a1328"); px(5, 27, 64, 102, kc > 0 ? "#231a36" : "#2a7fa8");
      if (kc <= 0) {
        for (let x = 5; x < 69; x++) px(x, 100 + Math.round(Math.sin(x * 0.4) * 2), 1, 29, "#4fd1c5");
        for (let i = 0; i < 12; i++) disc(10 + hash(i) * 54, 112 + hash(i + 3) * 12, 2, i % 2 ? "#ff8a7a" : "#e05a6a");
        px(5, 27, 64, 30, "#9ad4f2");
        vendor(30, 100, { t, cloth: "#f2ead6", hat: null, face: 1, arm: "up" });
        px(38, 92, 12, 8, "#b8862e"); px(38, 92, 12, 1, "#d9a84a"); for (let i = 0; i < 5; i++) tiny(40 + i * 2, 91);
      } else {
        lx.save(); lx.globalAlpha = kc;
        cowrie(22, 58, 2); cowrie(52, 58, 3);
        for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; px(52 + Math.cos(a) * 9, 56 + Math.sin(a) * 12, 1, 1, "#ffb43a"); }   // the gold ring of M. annulus
        if (kpr > 0) { const hi = Math.round(26 * easeOut(kpr)), lo = Math.round(8 * easeOut(kpr)); px(16, 124 - hi, 12, hi, C.bad); px(46, 124 - lo, 12, lo, C.leaf); }
        lx.restore();
      }
    }
    if (lt > w(23)) alien("wren", 226, 130, t);
    blitLo();
    where("1845", "HAMBURG → ZANZIBAR", lt, d);
    label("HAMBURG", X(Hm[0]) + 150, X(Hm[1]) + 10, { k: seg(lt, w(4), w(4) + 0.4), size: 30 });
    label("ZANZIBAR", X(Z[0]) + 170, X(Z[1]) + 10, { k: seg(lt, w(10), w(10) + 0.4), size: 30 });
    stamp("REEF!", X(Z[0]) + 170, X(Z[1]) - 130, seg(lt, w(10), w(10) + 0.25), { size: 50 });
    if (k2 > 0.9) label("DAHOMEY", X(D[0]) - 10, X(D[1]) + 70, { k: seg(lt, w(25), w(25) + 0.4), size: 30, bg: C.gold });
    if (kp > 0 && kc <= 0) { body("gathered alive", X(37), X(66), 26, C.ink, { alpha: kp }); body("on East African reefs", X(37), X(66) + 34, 26, C.ink, { alpha: kp }); }
    if (kc > 0) {
      text("MALDIVES", X(22), X(36), 28, C.ink, { alpha: kc }); body("≈ 1 g", X(22), X(84), 36, C.ink, { alpha: kc });
      text("ZANZIBAR", X(52), X(36), 28, C.gold, { alpha: kc }); body("≈ 2 g", X(52), X(84), 36, C.gold, { alpha: kc });
      if (kpr > 0) { for (const [x, str, hh, c] of [[22, "HIGH", 26, C.bad], [52, "LOW", 8, C.leaf]]) { const y = X(124 - hh * easeOut(kpr)) - 62; text(str, X(x), y - 6, 28, c, { alpha: kpr }); text("PRICE", X(x), y + 28, 28, c, { alpha: kpr }); } }
    }
    const kw = seg(lt, w(23), w(23) + 0.2) * (1 - seg(lt, w(23) + 1.6, w(23) + 1.9));
    if (kw > 0) label("HEY, THAT'S MY MOVE", 1570, 900, { k: kw, size: 32, bg: "#ffd0e6" });
  };

  // c5 · the flood of shells onto the beach at Ouidah
  SC.shellflood = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 40, "#8fd0f0", "#cdebf8"); sea(t, 40, { speed: 0.4 });
    for (let x = 0; x < LO_W; x++) px(x, 76 + Math.round(Math.sin(x * 0.15 + t * 2)), 1, 2, C.foam);
    px(0, 78, LO_W, LO_H - 78, C.sand); for (let i = 0; i < 40; i++) px(hash(i) * LO_W, 80 + hash(i + 40) * 52, 2, 1, C.sand2);
    palm(10, 96, t, 20); palm(230, 94, t, 18);
    const flags = [["#1a1010", "#e0402f"], ["#f2ead6", "#e0402f"], ["#2e5fb8", "#f2ead6"], ["#1a1010", "#ffd23f"], ["#f2ead6", "#2e5fb8"], ["#e0402f", "#f2ead6"]];
    const ships = [[120, 50], [60, 44], [180, 46], [30, 56], [90, 60], [210, 58]];
    const nShips = lt < w(1) ? 1 : lt < w(3) ? 3 : 6;
    ships.slice(0, nShips).forEach(([x, y], i) => brig(x, y, t, flags[i]));
    // the dune of shells
    const kd = easeInOut(seg(lt, w(12), w(19) + 0.5)), Hd = 4 + 46 * kd;
    for (let x = 0; x < LO_W; x++) {
      const h = Math.round(Hd * Math.exp(-(((x - 120) / (60 + 50 * kd)) ** 2)));
      if (h > 0) { px(x, 135 - h, 1, h, SHELL2); for (let y = 135 - h; y < 135; y += 2) if (hash(x * 7 + y) < 0.45) px(x, y, 1, 1, hash(x + y) < 0.5 ? SHELL : SHELLD); px(x, 135 - h, 1, 1, SHELL); }
    }
    if (lt > w(12) && lt < w(19) + 0.5) ships.slice(0, nShips).forEach(([x, y], i) => {  // streams from every ship
      for (let j = 0; j < 8; j++) { const u = (t * 1.3 + j / 8 + i * 0.13) % 1; px(lerp(x, 120 + (x - 120) * 0.4, u), lerp(y + 4, 135 - Hd, u) - Math.sin(u * Math.PI) * 8, 2, 1, SHELL); }
    });
    // merchants trading palm oil for sacks
    const km = seg(lt, w(5), w(5) + 0.5);
    if (km > 0 && kd < 0.6) {
      lx.save(); lx.globalAlpha = km * (1 - kd / 0.6);
      vendor(100, 104, { t, cloth: "#d68910", wrap: "#7d3c98", face: 1, arm: lt > w(9) ? "up" : null }); pot(88, 104); pot(80, 104);
      vendor(140, 104, { t: t + 1, cloth: "#16a085", wrap: "#c0392b", face: -1 }); sack(148, 97); sack(156, 97); sack(152, 90);
      lx.restore();
    }
    blitLo();
    where("OUIDAH · DAHOMEY", "1845–1880", lt, d);
    label("CHEAPER PER SHELL", X(120), X(78) - 30, { k: seg(lt, w(10), w(10) + 0.4) * (1 - seg(lt, w(12), w(12) + 0.4)), size: 32, bg: C.gold });
    const ky = seg(lt, w(12), w(19) + 0.5);
    if (ky > 0) text(String(Math.round(lerp(1845, 1880, ky))), 1700, 90, 80, C.gold);
    const kb = seg(lt, w(16), w(16) + 0.4);
    if (kb > 0) {
      label("≈ 16,000,000,000 SHELLS", WIDTH / 2, 330, { k: kb, size: 60, bg: C.gold });
      label("≈ 1,000 FOR EVERY PERSON IN THE REGION", WIDTH / 2, 460, { k: seg(lt, w(18), w(18) + 0.4), size: 32 });
      body("one estimate", WIDTH / 2 + 380, 402, 32, C.ink, { alpha: kb * 0.8 });
    }
  };

  // c6 · the saver's loss: the dollar goes from 2,000 to 20,000 shells; the jar stays at 2,000
  const STOPS = [[0, "1840s", 2000], [14, "1864", 5000], [16, "1871", 10000], [18, "1880s", 20000]];
  SC.jar = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(23);   // hold the scale (and the ×10) through "A family that had"
    const wall = () => { px(0, 0, LO_W, 100, "#6b4426"); for (let i = 0; i < 60; i++) px(hash(i) * LO_W, hash(i + 9) * 98, 3, 1, "#5e3b1a"); px(0, 100, LO_W, 35, "#4a2f19"); for (let i = 0; i < 30; i++) px(hash(i + 3) * LO_W, 102 + hash(i + 5) * 30, 2, 1, "#3b2615"); };
    if (lt < split) {
      wall();
      px(14, 26, 22, 30, "#e9a86a"); px(14, 26, 22, 2, "#3b2615"); px(24, 26, 2, 30, "#3b2615");   // a window of evening light
      jar(30, 116, 22);
      const ks = seg(lt, w(3), w(3) + 0.5);
      const stop = STOPS.filter(([n]) => lt >= w(n)).pop(), need = stop[2] / 2000;
      const heads = lt < w(14) ? 1 : Math.min(10, 1 + Math.floor(9 * seg(lt, w(14), w(19))));
      const tilt = Math.round(clamp((need - heads) / need, 0, 1) * 8);
      if (ks > 0) {
        lx.save(); lx.globalAlpha = ks;
        const cx = 128, by = 40;
        px(cx - 1, by, 3, 76, C.wood2); px(cx - 10, 114, 22, 4, C.wood2); disc(cx, by, 3, C.wood);
        for (let i = -44; i <= 44; i++) px(cx + i, by + Math.round(-tilt * i / 44), 1, 2, C.wood);
        const L = [cx - 44, by + tilt], R = [cx + 44, by - tilt];
        for (const [x, y] of [L, R]) { px(x - 10, y, 1, 22, "#3b2615"); px(x + 10, y, 1, 22, "#3b2615"); px(x - 14, y + 22, 29, 3, "#8c8471"); px(x - 12, y + 25, 25, 1, "#5e574a"); }
        coin(L[0], L[1] + 15, 7);
        const pile = [[0, 0], [-8, 0], [8, 0], [-4, -8], [4, -8], [-12, 0], [12, 0], [0, -16], [-8, -16], [8, -16]];
        for (let i = 0; i < heads; i++) { const [dx, dy] = pile[i]; head(R[0] + dx, R[1] + 16 + dy, 4); }
        lx.restore();
      } else coin(128, 92, 7);
      blitLo();
      if (ks > 0) {
        text(stop[1], 960, 110, 50, C.muted, { alpha: ks });
        text(`1 DOLLAR = ${fmt(stop[2])} SHELLS`, 960, 200, 70, C.gold, { alpha: ks });
        label("1 SILVER DOLLAR", X(84), X(78), { k: ks, size: 32 });
      }
      if (lt > w(19)) stamp("×10", 1640, 560, seg(lt, w(19), w(19) + 0.25), { size: 120, color: C.gold, rot: -0.12 });
      return;
    }
    // inside the hut, pushed in: the family and its jar (drawn at 2×)
    const lt2 = lt - split;
    lx.save(); lx.scale(2, 2);
    px(0, 0, 120, 52, "#6b4426"); for (let i = 0; i < 30; i++) px(hash(i) * 120, hash(i + 9) * 50, 2, 1, "#5e3b1a"); px(0, 52, 120, 16, "#4a2f19");
    person(18, 56, { t, cloth: "#2e86c1" }); vendor(30, 56, { t: t + 0.5, cloth: "#c0392b", wrap: "#d68910", face: 1 });
    px(40, 48, 4, 3, "#8e44ad"); px(40, 45, 4, 3, C.skin); px(40, 41, 4, 4, C.skin); px(40, 40, 4, 1, "#1a1010"); px(43, 42, 1, 1, "#1a1010"); px(40, 51, 1, 4, C.skin2); px(43, 51, 1, 4, C.skin2);  // a child
    jar(68, 62, 20);
    lx.restore();
    blitLo();
    label("SAVINGS: 2,000 SHELLS", X(136), 870, { k: seg(lt2, 0.3, 0.7), size: 32, bg: C.gold });
    // the dollar, sliced into ten: nine slices fade
    const kp = seg(lt, w(28), w(28) + 0.4), kf = seg(lt, w(31), w(33));
    if (kp > 0) {
      const cx = 1440, cy = 360, r = 170;
      ctx.save(); ctx.globalAlpha = kp;
      for (let i = 0; i < 10; i++) {
        const a0 = -Math.PI / 2 + i * Math.PI / 5, gone = i > 0 ? seg(kf, (i - 1) / 9 * 0.7, (i - 1) / 9 * 0.7 + 0.3) : 0;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a0 + Math.PI / 5); ctx.closePath();
        ctx.fillStyle = gone > 0.5 ? "#2a2040" : i === 0 ? "#dfe5ee" : "#c9d0dc"; ctx.fill();
        ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 6; ctx.stroke();
      }
      ctx.restore();
      text("1 SILVER DOLLAR", cx, cy - r - 50, 34, C.ink, { alpha: kp });
      if (kf > 0) label("= 1/10 OF A DOLLAR", cx, cy + r + 64, { k: seg(lt, w(31), w(31) + 0.4), size: 44, bg: C.gold });
    }
    if (lt > w(35)) label("SHELLS SPENT: 0", X(136), 1010, { k: seg(lt, w(36), w(36) + 0.4), size: 32 });
    const kn = seg(lt, w(38), w(38) + 0.6);
    if (kn > 0) {
      body("Food rose too. In Abomey, a ball of maize dough:", 70, 90, 34, C.muted, { alpha: kn, align: "left" });
      body("3 shells in 1858 → 12 in 1864", 70, 144, 44, C.ink, { alpha: kn, align: "left" });
    }
    fadeOut(lt, d, 0.4);
  };

  // c7 · the money got heavy: one shilling or a sack of 4,000 shells
  SC.heavy = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(24);
    const street = () => {
      sky(0, 30, "#8fd0f0", "#cdebf8"); px(0, 26, LO_W, 30, "#b9a17a"); for (let x = 0; x < LO_W; x += 12) px(x, 24, 10, 2, "#7a4a2b");
      for (let b = 0; b < 3; b++) {   // Lagos houses: two floors, verandas, iron roofs
        const x = 6 + b * 82, wd = 70;
        px(x, 22, wd, 4, "#8a4b2b"); px(x, 26, wd, 30, b % 2 ? "#e8d8b4" : "#d4b98a");
        for (let k = 0; k < 4; k++) { px(x + 6 + k * 16, 30, 6, 8, "#3b2615"); px(x + 6 + k * 16, 44, 6, 10, "#3b2615"); px(x + 5 + k * 16, 29, 1, 10, "#2e86c1"); px(x + 12 + k * 16, 29, 1, 10, "#2e86c1"); }
        px(x, 40, wd, 1, C.wood2);
      }
      ground(56, "#b5763f", "#9c6232");
    };
    const shake = lt > w(4) && lt < w(4) + 0.3 ? Math.round(Math.sin(lt * 80)) : 0;
    lx.save(); lx.translate(shake, 0);
    if (lt < split) {
      street();
      px(0, 0, LO_W, LO_H, "rgba(18,13,29,.45)");
      // the hand with one shilling, and a sack filling with 4,000 shells
      const ko = seg(lt, w(10), w(10) + 0.4), closed = lt > w(20) + 0.2;
      lx.save(); lx.scale(2, 2);
      if (ko > 0) { hand(44, 50, closed); if (!closed) coin(40, 44, 6); }
      lx.restore();
      const kf = seg(lt, w(16), w(18) + 0.4), sh = Math.round(14 + 34 * easeOut(kf)), kd = seg(lt, w(4) - 0.25, w(4));
      if (kd > 0) lx.translate(0, -Math.round((1 - kd) * 120));   // the sack drops in on "heavy"
      if (kd > 0) {
        for (let j = 0; j < 14 && kf > 0 && kf < 1; j++) { const u = (t * 2 + j / 14) % 1; tiny(176 + (hash(j) - 0.5) * 14, lerp(-4, 120 - sh, u)); }
        px(156, 122 - sh, 40, sh, "#b89a64"); px(156, 122 - sh, 40, 2, "#8c7650"); px(189, 122 - sh, 7, sh, "#9c8250");
        for (let i = 0; i < 11; i++) tiny(159 + i * 3, 121 - sh); px(154, 122, 44, 2, "rgba(0,0,0,.35)");
      }
      lx.restore();
      blitLo();
      where("LAGOS", "about 1900", lt, d);
      if (ko > 0) { label("1 SILVER SHILLING", X(72), X(46), { k: ko, size: 32 }); body("5.7 grams", X(72), X(46) + 70, 42, C.ink, { alpha: ko }); }
      if (kf > 0) {
        label("4,000 SHELLS", X(176), X(46), { k: kf, size: 34, bg: C.gold });
        const kg = Math.max(1, Math.round(4 * easeOut(kf)));
        text(`≈ ${kg}–${kg * 2} KG`, X(176), X(130), 50, C.gold, { alpha: kf });
      }
      if (lt > w(19)) text("=", WIDTH / 2, 780, 140, C.gold, { alpha: seg(lt, w(19), w(19) + 0.3) });
      return;
    }
    // a woman lifts the sack onto her head and walks off under the load (drawn at 2×)
    const lt2 = lt - split, lift = seg(lt2, 0, 0.8), walk = Math.max(0, lt2 - 0.8);
    lx.scale(2, 2);
    street();
    const x = 40 + walk * 7, sway = walk > 0 ? Math.round(Math.sin(walk * 4)) : 0;
    vendor(x, 64, { t: walk > 0 ? t : 0, walk: walk > 0, cloth: "#7d3c98", wrap: "#ffd23f", arm: "up" });
    const sy = lerp(62, 64 - 16, easeInOut(lift));
    px(x - 6 + sway, sy - 8, 12, 8, "#b89a64"); px(x - 6 + sway, sy - 8, 12, 1, "#8c7650"); px(x + 3 + sway, sy - 8, 3, 8, "#9c8250");
    lx.restore();
    blitLo();
    const kn = seg(lt2, 0.4, 1);
    if (kn > 0) { ctx.fillStyle = `rgba(18,13,29,${0.8 * kn})`; ctx.fillRect(0, 985, WIDTH, 70); }
    body("The same 2,000 shells: about 4 shillings in the 1850s → half a shilling around 1900", WIDTH / 2, 1020, 34, C.ink, { alpha: kn });
    stamp("1904: SOUTHERN NIGERIA BANS NEW SHELLS", 1250, 200, seg(lt, w(28), w(28) + 0.3), { size: 30, color: "#7a1f1f", rot: -0.06 });
    fadeOut(lt, d, 0.4);
  };

  // c8 · back to Ulm Hollow: a flooded money turns into bogwool; teaser for Rome
  SC.ccallback = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const night = () => { for (let i = 0; i < 60; i++) px(hash(i) * LO_W, hash(i + 60) * 90, 1, 1, C.line); ground(104, "#2a2140", "#33284d"); };
    if (lt < w(9)) {
      night();
      // a stall with a small window; the bale won't go through
      px(150, 60, 60, 44, "#5a4570"); px(146, 54, 68, 8, C.pen); for (let i = 0; i < 68; i += 8) px(146 + i, 54, 4, 8, "#ffd0e6");
      px(172, 76, 16, 14, "#0d0814"); alien("mira", 180, 92, t);
      const push = seg(lt, w(4), w(7)), bump = push > 0.7 ? Math.sin((push - 0.7) / 0.3 * Math.PI) * 4 : 0;
      bale(lerp(70, 128, Math.min(push, 0.7) / 0.7) - bump, 80, 22, t);
      alien("wren", lerp(36, 94, Math.min(push, 0.7) / 0.7) - bump, 104, t);
      blitLo();
      text("PREVIOUSLY · ULM HOLLOW", 70, 70, 36, C.muted, { align: "left" });
      label("BOGWOOL", X(70), X(46), { k: seg(lt, w(3), w(3) + 0.4) * (1 - push), size: 32, bg: "#c8f2a8" });
      stamp("NOT MONEY", WIDTH / 2, 260, seg(lt, w(8), w(8) + 0.25), { size: 70 });
      return;
    }
    if (lt < w(17)) {
      night();
      bale(60, 72, 26, t); alien("wren", 100, 104, t);
      px(119, 0, 2, LO_H, C.line);
      const km = easeInOut(seg(lt, w(12), w(16)));
      vendor(200, 104, { t, cloth: "#7d3c98", wrap: "#ffd23f" });
      if (km < 1) { const sh = Math.round(20 + 26 * km); lx.save(); lx.globalAlpha = 1 - km * 0.8; px(160 - sh / 2, 104 - sh, sh, sh, "#b89a64"); px(160 - sh / 2, 104 - sh, sh, 2, "#8c7650"); lx.restore(); }
      if (km > 0) { lx.save(); lx.globalAlpha = km; bale(160, 104 - 22 * (0.6 + 0.4 * km), Math.round(12 + 14 * km), t); lx.restore(); }
      blitLo();
      text("ULM HOLLOW", X(60), 120, 34, C.muted); text("LAGOS, 1900", X(180), 120, 34, C.muted);
      label("FLOODED MONEY = BOGWOOL", WIDTH / 2, 940, { k: seg(lt, w(14), w(14) + 0.4), size: 40, bg: C.gold });
      return;
    }
    if (lt < w(25)) {
      night();
      cave(60, 40, 60, 60, t); alien("wren", 34, 104, t);
      px(119, 0, 2, LO_H, C.line);
      for (let x = 122; x < LO_W; x++) px(x, 80, 1, LO_H - 80, "#2a7fa8");
      for (let i = 0; i < 16; i++) disc(130 + hash(i) * 104, 100 + hash(i + 2) * 30, 3, i % 2 ? "#ff8a7a" : "#e05a6a");
      for (let x = 122; x < LO_W; x++) px(x, 80 + Math.round(Math.sin(x * 0.3 + t * 2)), 1, 1, C.foam);
      brig(180, 76, t, ["#1a1010", "#e0402f"]);
      blitLo();
      stamp("CAVE", X(60), 300, seg(lt, w(20), w(20) + 0.25), { size: 80 });
      stamp("REEF", X(180), 300, seg(lt, w(24), w(24) + 0.25), { size: 80 });
      label("WREN", X(60), 960, { size: 36, bg: "#ffd0e6" }); label("HAMBURG", X(180), 960, { size: 36, bg: "#9ad4f2" });
      return;
    }
    // teaser: a silver coin spins inside a laurel wreath, and flips to a stamped emperor
    const k = lt - w(25), flip = seg(lt, w(31) - 0.4, w(31));
    const wr = seg(k, 0.2, 1.6);
    const ko = Math.max(0, Math.sin(t * 25)) > 0.3 && lt > w(28) && lt < w(28) + 0.8;
    if (ko) silhouette("wren", 120, 100, t, "#3a2d5c");
    for (let i = 0; i < 28 * wr; i++) { const a = Math.PI * 0.6 + i / 28 * Math.PI * 1.8; const r = 30; px(120 + Math.cos(a) * r, 66 + Math.sin(a) * r, 3, 2, i % 2 ? C.leaf : C.jungle); }
    const spin = lt < w(31) - 0.4 ? Math.abs(Math.cos(t * 3)) : Math.abs(Math.cos(flip * Math.PI)), rx = Math.max(1, Math.round(20 * spin));
    ell(120, 66, rx, 20, "#9aa3b5"); ell(120, 66, Math.max(1, rx - 2), 18, "#c9d0dc");
    if (flip > 0.5 && rx > 10) {
      // the emperor's profile, with a cave stamped over it
      const PROF = [[-12, -6, 2], [-11, -8, 4], [-10, -9, 5], [-9, -9, 6], [-8, -9, 6], [-7, -9, 6], [-6, -9, 6], [-5, -9, 6], [-4, -9, 7], [-3, -8, 8], [-2, -8, 9], [-1, -8, 7],
        [0, -8, 6], [1, -8, 7], [2, -7, 6], [3, -6, 5], [4, -5, 2], [5, -5, 2], [6, -5, 2], [7, -6, 2], [8, -8, 3], [9, -10, 4], [10, -11, 5], [11, -11, 5]];
      for (const [y, a, b] of PROF) px(120 + a * spin, 66 + y, Math.max(1, (b - a) * spin), 1, "#7c8596");
      for (let i = -8; i <= 4; i += 2) px(120 + i * spin, 66 - 9 + Math.abs(i + 2) * 0.3, Math.max(1, 2 * spin), 1, C.leaf);   // his laurel
      for (let i = 0; i < 8; i++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - ((7 - i) / 8) ** 2)) * 4); px(120 + (-1 - hw) * spin, 62 + i, Math.max(1, hw * 2 * spin), 1, "#1a1026"); }   // the cave stamp
      px(120 - 1 * spin, 67, 1, 1, C.pen);
    }
    blitLo();
    text("NEXT", WIDTH / 2, 130, 50, C.muted, { alpha: seg(k, 0.3, 0.8) });
    text("ROME", WIDTH / 2, 940, 90, C.gold, { alpha: seg(k, 0.6, 1.2) });
    fadeOut(lt, d, 1.0);
  };
})();
