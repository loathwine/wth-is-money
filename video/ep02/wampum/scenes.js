/* EP 02 · scenes for chapter 3 (Wampum): when the tools changed.
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   w(n) = the moment word n of the narration is spoken (indices as in SCRIPT.md), so visuals land on the words.
   Art guardrails (SCRIPT.md): Eastern Woodlands people as ordinary working people, generic belt patterns, no clichés. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, sky, icon, alien, text, body,
    label, stamp, where, blitLo, fadeOut, SC, ground, cave, cowrie, coin } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels

  /* ---------------------------------------------------------------- colours + small helpers */
  const WH = "#f3efe2", WH2 = "#c9c1ab", PU = "#6a2c7a", PU2 = "#a46cc0", GREY = "#8d8a84", GREY2 = "#6a6862";
  const NSK = "#a0643e", DEER = "#a8794a", DEER2 = "#7f5a35", ESK = "#e8b38c", COAT = "#2f2b3d", HAT = "#18141f", LINEN = "#f2ead6";
  const IRON = "#5d6577", IRON2 = "#c9d3e6", STONEP = "#9c937f";
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c); };
  const dim = (a) => { if (a > 0) { lx.fillStyle = `rgba(10,8,20,${a})`; lx.fillRect(0, 0, LO_W, LO_H); } };
  const stars = (n, c = "#3a4a7a") => { for (let i = 0; i < n; i++) px(hash(i) * LO_W, hash(i + 50) * LO_H, 1, 1, c); };
  // a tube bead lying flat (3×2), white or purple; grey = rough/fake
  function wb(x, y, kind) {
    const [a, b] = kind === "p" ? [PU, PU2] : kind === "g" ? [GREY2, GREY] : [WH2, WH];
    px(x, y, 3, 2, a); px(x, y, 3, 1, b);
  }
  // a string of beads from (x,y), n beads, pattern: "w" white, "p" purple, "a" alternating 4+2
  function strand(x, y, n, pat = "w", o = {}) {
    px(x - 1, y + 1, n * 4 + 1, 1, "#4a3220");
    for (let i = 0; i < n; i++) wb(x + i * 4, y + (o.sag ? Math.round(Math.sin(i / Math.max(1, n - 1) * Math.PI) * o.sag) : 0), pat === "a" ? (i % 6 < 4 ? "w" : "p") : pat === "g" ? (hash(i + x) < 0.6 ? "g" : "w") : pat);
  }
  // hi-res bead (for things drawn over hi-res cards); s = pixel size
  function hb(x, y, kind, s = 10) {
    const [a, b] = kind === "p" ? [PU, PU2] : [WH2, WH];
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(x - 1.5 * s + s * 0.4, y - s + s * 0.4, 3 * s, 2 * s);
    ctx.fillStyle = a; ctx.fillRect(x - 1.5 * s, y - s, 3 * s, 2 * s);
    ctx.fillStyle = b; ctx.fillRect(x - 1.5 * s, y - s, 3 * s, s);
  }
  // a person: o.skin, o.hair, o.top (shirt/coat; bare if unset), o.bot, o.hat ("cap" = 1600s capotain), o.long (hair length), o.arm, o.crouch
  function fig(x, f, o = {}) {
    x = Math.round(x); f = Math.round(f);
    const t = o.t || 0, fc = o.face || 1, sk = o.skin || NSK, hair = o.hair || "#1a1010", bot = o.bot || DEER, c = o.crouch ? 3 : 0;
    const b = o.walk ? Math.floor(t * 8) % 2 : 0, top = o.top || sk;
    px(x - 3, f - 1, 7, 1, "rgba(0,0,0,.3)");
    if (!c) { px(x - 2, f - 4 - (o.walk ? b : 0), 1, 3, o.leg || bot); px(x + 1, f - 4 - (o.walk ? 1 - b : 0), 1, 3, o.leg || bot); }
    else { px(x - 3, f - 2, 2, 2, o.leg || bot); px(x + 1, f - 2, 2, 2, o.leg || bot); }
    px(x - 2, f - 7 + c, 4, 3, bot);
    if (o.skirt) px(x - 3, f - 5 + c, 6, 3, bot);
    px(x - 2, f - 11 + c, 4, 4, top);
    if (o.collar) px(x - 2, f - 11 + c, 4, 1, o.collar);
    const nod = o.nod ? Math.round(Math.max(0, Math.sin(t * 9)) ) : 0;
    px(x - 2, f - 15 + c + nod, 4, 4, sk);
    px(x - 2, f - 16 + c + nod, 4, 1, hair);
    if (o.long) px(fc > 0 ? x - 2 : x + 1, f - 15 + c + nod, 1, o.long, hair);
    if (o.grey) { px(x - 2, f - 16 + c, 4, 1, "#d8d4cc"); px(fc > 0 ? x - 2 : x + 1, f - 15 + c, 1, 2, "#d8d4cc"); }
    px(x + (fc > 0 ? 1 : -2), f - 14 + c + nod, 1, 1, "#1a1010");
    if (o.hat === "cap") { px(x - 3, f - 16 + c, 6, 1, HAT); px(x - 2, f - 19 + c, 4, 3, HAT); }
    if (o.hat === "coif") { px(x - 2, f - 17 + c, 4, 2, LINEN); px(fc > 0 ? x - 2 : x + 1, f - 15 + c, 1, 2, LINEN); }
    const arm = o.armC || top;
    if (o.arm === "up") px(x + fc * 2, f - 15 + c - (Math.floor(t * 6) % 2), 1, 4, arm);
    else if (o.arm === "out") { px(x + (fc > 0 ? 2 : -4), f - 10 + c, 3, 1, arm); px(x + (fc > 0 ? 4 : -4), f - 10 + c, 1, 1, sk); }
    else if (o.arm === "fold") { px(x - 2, f - 9 + c, 4, 1, o.armC || "#1a1010"); px(x - 3, f - 10 + c, 1, 2, arm); px(x + 2, f - 10 + c, 1, 2, arm); }
    else px(x + fc * 2, f - 10 + c, 1, 4, arm);
    return { hx: x + fc * 4, hy: f - 10 + c };
  }
  const native = (x, f, o = {}) => fig(x, f, { skin: NSK, bot: DEER, long: 4, ...o });
  const colonist = (x, f, o = {}) => fig(x, f, { skin: ESK, hair: "#5a3a22", top: COAT, bot: "#3b3346", collar: LINEN, hat: "cap", leg: "#d8d0bc", ...o });

  function wetu(x, base, w = 26, h = 16) {   // a bark-covered dome house
    for (let i = 0; i < h; i++) { const hw = Math.round(Math.sqrt(1 - Math.pow(1 - i / h, 2)) * w / 2); px(x - hw, base - i, hw * 2, 1, i % 3 ? "#7a6a52" : "#665741"); }
    for (let k = -2; k <= 2; k++) line(x + k * 5, base, x + k * 3, base - h + 2, "#584a36");
    px(x - 3, base - 7, 6, 7, "#1e150d");
  }
  function pine(x, base, h = 18) { px(x, base - 3, 2, 3, C.wood2); for (let i = 0; i < h; i++) px(x + 1 - Math.round((h - i) * 0.35), base - 3 - i, Math.round((h - i) * 0.7) + 1, 1, i % 4 ? "#2c5a3c" : "#244a32"); }
  function whelk(cx, cy, s = 1, glow = 0) {   // knobbed whelk: a spiral shell, aperture on the right
    for (let y = -13; y <= 13; y++) { const hw = Math.round(Math.sqrt(1 - Math.pow(y / 14, 2)) * 9); px(cx - hw, cy + y, hw * 2, 1, y % 5 === 0 ? "#b89a6a" : "#d9c39a"); }
    for (let i = 0; i < 9; i++) px(cx - Math.round(i * 0.5), cy - 14 - i, Math.max(1, 6 - i * 0.6), 1, i % 3 ? "#c9b07e" : "#a88a5a");
    for (let i = 0; i < 7; i++) px(cx + 1, cy + 13 + i, 2, 1, "#c9b07e");
    for (const k of [-9, -3, 3]) px(cx - 8 + Math.abs(k), cy + k, 3, 1, "#8f7448");   // knobs
    for (let y = -8; y <= 10; y++) px(cx + 2, cy + y, 5 - Math.abs(y) / 4, 1, "#f6e6c8");
    if (glow > 0) for (let y = -10; y <= 12; y++) px(cx + 2, cy + y, 2, 1, `rgba(255,255,255,${glow})`);
  }
  function quahog(cx, cy, glow = 0) {   // a round clam with a purple inner edge
    disc(cx, cy + 1, 13, glow > 0 ? `rgb(${Math.round(106 + 80 * glow)},${Math.round(44 + 60 * glow)},${Math.round(122 + 80 * glow)})` : PU);
    disc(cx, cy - 1, 12, "#d8d4cc");
    for (let r = 4; r <= 11; r += 3) for (let a = 0; a < Math.PI; a += 0.08) px(cx + Math.cos(a + Math.PI) * r, cy - 1 - Math.sin(a) * r * 0.85 + r * 0.25, 1, 1, "#bfb9ae");
    px(cx - 2, cy - 13, 4, 2, "#a8a294");
  }
  // a pump drill: shaft, crossbar riding up and down on cords, stone flywheel, point (stone or iron) into a shell blank
  function pumpDrill(cx, top, ph, o = {}) {
    const L = o.L || 70, bar = top + 10 + (L * 0.45) * (0.5 - 0.5 * Math.cos(ph)), fw = top + L * 0.72, hw = o.w || 20;
    px(cx - 1, top, 2, L, "#9a6a36");
    if (Math.sin(ph * 3) > 0) px(cx - 1, top + 4, 1, L - 8, "#6e4a24");                 // the shaft spinning
    line(cx - hw + 1, bar, cx, top + 1, "#d8c8a0"); line(cx + hw - 1, bar, cx, top + 1, "#d8c8a0");
    px(cx - hw, bar, hw * 2, 3, "#7a4a22"); px(cx - hw, bar, hw * 2, 1, "#a0703a");
    disc(cx, fw, o.fr || 8, "#8c8471"); disc(cx, fw, (o.fr || 8) - 2, "#a39a84");
    px(cx + Math.round(Math.cos(ph * 2) * 5), fw + Math.round(Math.sin(ph * 2) * 2), 2, 2, "#5c5546");
    if (o.iron) { px(cx - 1, top + L, 2, 5, IRON); px(cx, top + L + 1, 1, 2, IRON2); } else px(cx - 1, top + L, 2, 5, STONEP);
    // the blank in a little clamp
    px(cx - 7, top + L + 5, 14, 4, "#6e4a24"); px(cx - 5, top + L + 3, 10, 3, WH);
    if (o.hands !== false) { px(cx - hw - 2, bar - 1, 4, 5, o.skin || NSK); px(cx + hw - 2, bar - 1, 4, 5, o.skin || NSK); px(cx - hw - 6, bar + 2, 5, 3, DEER2); px(cx + hw + 1, bar + 2, 5, 3, DEER2); }
    if (o.dust) for (let i = 0; i < 5; i++) px(cx - 6 + hash(i + Math.floor(ph * 2)) * 12, top + L + 1 - hash(i + 9 + Math.floor(ph * 3)) * 4, 1, 1, "#fff");
  }
  function dish(cx, y, n, o = {}) {   // a wooden dish with n beads heaped in it
    px(cx - 12, y, 24, 3, "#7a4a22"); px(cx - 10, y + 3, 20, 1, "#5e3b1a");
    for (let i = 0; i < n; i++) {
      const row = Math.floor(Math.sqrt(i * 2.2)), inRow = i - Math.floor(row * row / 2.2), wdt = Math.max(1, 6 - Math.floor(row / 2));
      wb(cx - 10 + ((inRow % wdt) * 4 + (row % 2) * 2) + Math.floor(row / 2) * 2, y - 2 - row * 2, o.kind ? o.kind(i) : (i % 5 === 4 ? "p" : "w"));
    }
  }
  function heap(cx, base, h, w, greyFrac = 0, pat = 0.25) {   // a mound of loose beads
    for (let y = 0; y < h; y += 2) {
      const hw = Math.round(w / 2 * Math.sqrt(Math.max(0, 1 - Math.pow(y / h, 2))));
      for (let x = -hw; x < hw; x += 3) { const r = hash(x * 7 + y * 131 + cx); wb(cx + x + (y % 4 ? 1 : 0), base - y - 2, r < greyFrac ? "g" : r < greyFrac + pat ? "p" : "w"); }
    }
  }
  function pelt(cx, cy, r = 10) {   // a beaver pelt stretched on a round hoop
    disc(cx, cy, r + 1, "#b07a3a"); disc(cx, cy, r, "#5e3a1e"); disc(cx, cy, r - 2, "#74482a"); disc(cx - 1, cy - 1, Math.max(1, r - 5), "#86583a");
    for (let i = 0; i < 6; i++) px(cx - r + 3 + hash(i + cx) * (2 * r - 6), cy - r + 3 + hash(i + 3) * (2 * r - 6), 2, 1, "#4a2c16");
  }
  function belt(cx, cy, k = 1, o = {}) {   // a generic white belt with purple diamonds; k = rows built
    const cols = o.cols || 40, rows = 7, bw = 3, bh = 4, x0 = cx - cols * bw / 2, y0 = cy - rows * bh / 2;
    const shown = Math.ceil(k * rows);
    for (let r = rows - 1; r >= rows - shown; r--) for (let c = 0; c < cols; c++) {
      const dd = Math.abs((c % 10) - 4.5) + Math.abs(r - 3), purple = (dd >= 2.5 && dd <= 3.5) || r === 0 || r === rows - 1;
      px(x0 + c * bw, y0 + r * bh, bw - 1, bh - 1, purple ? PU : WH); px(x0 + c * bw, y0 + r * bh, bw - 1, 1, purple ? PU2 : "#ffffff");
    }
    if (k >= 1) { px(x0 - 6, cy - 1, 6, 1, "#4a3220"); px(x0 + cols * bw, cy - 1, 6, 1, "#4a3220"); for (let i = 0; i < 4; i++) { px(x0 - 8 - i, cy - 3 + i * 2, 3, 1, "#4a3220"); px(x0 + cols * bw + 5 + i, cy - 3 + i * 2, 3, 1, "#4a3220"); } }
  }
  function ship(x, y, t) {   // a 1600s sailing ship: high stern, three masts, square sails
    x = Math.round(x); y = Math.round(y + Math.sin(t * 1.4));
    for (let i = 0; i < 56; i++) { const d = i < 8 ? 8 - i : 0, st = i > 44 ? 5 : 0; px(x - 28 + i, y + Math.floor(d / 2) - st, 1, 8 - Math.floor(d / 2) + st, i % 7 === 0 ? "#3b2615" : "#5a3a1c"); }
    px(x - 26, y + 2, 52, 1, "#c99a4a"); px(x + 16, y - 6, 12, 1, "#c99a4a");
    for (const [mx, mh] of [[-14, 30], [2, 38], [18, 26]]) {
      px(x + mx, y - mh, 1, mh, "#3b2615");
      px(x + mx - 7, y - mh + 4, 15, 9, "#efe6cf"); px(x + mx - 6, y - mh + 15, 13, 8, "#efe6cf"); px(x + mx - 7, y - mh + 12, 15, 1, "#d6ccb0");
    }
    px(x - 34, y - 2, 8, 1, "#3b2615");
    px(x + 2, y - 42, 5, 2, "#c0392b");
  }
  function scale(cx, top, w = 40) {   // a balance: post, beam, two pans (level); returns pan centres
    px(cx - 1, top, 2, 44, "#5e3b1a"); px(cx - 8, top + 44, 16, 3, "#5e3b1a"); px(cx - w, top, w * 2, 2, "#8a5a2b"); disc(cx, top, 2, C.gold);
    for (const sx of [-1, 1]) { const pxx = cx + sx * (w - 2); line(pxx, top + 2, pxx - 9, top + 20, "#c9b177"); line(pxx, top + 2, pxx + 9, top + 20, "#c9b177"); px(pxx - 12, top + 20, 24, 2, "#b8862e"); px(pxx - 10, top + 22, 20, 1, "#8a6420"); }
    return [[cx - w + 2, top + 20], [cx + w - 2, top + 20]];
  }
  function windmill(x, base, t) {
    for (let i = 0; i < 26; i++) px(x - 5 + i * 0.12, base - i, 10 - i * 0.24, 1, i % 4 ? "#8a7a62" : "#7a6a52");
    const hx = x, hy = base - 26, a = t * 1.2;
    for (let k = 0; k < 4; k++) { const ang = a + k * Math.PI / 2; for (let r = 2; r < 16; r++) px(hx + Math.cos(ang) * r, hy + Math.sin(ang) * r, 2, 2, r % 3 ? "#efe6cf" : "#5e3b1a"); }
    disc(hx, hy, 1, "#3b2615");
  }
  function gable(x, base, w, h, c) {   // a Dutch house with a stepped gable
    px(x, base - h, w, h, c); for (let s = 0; s < 3; s++) px(x + 2 + s * 2, base - h - 3 - s * 3, w - 4 - s * 4, 3, c);
    px(x + 2, base - h + 3, 3, 3, "#f6d77a"); px(x + w - 5, base - h + 3, 3, 3, "#f6d77a"); px(x + w / 2 - 2, base - 6, 4, 6, "#3b2615");
  }
  function loaf(x, y, a = 1) { lx.save(); lx.globalAlpha = a; px(x, y, 8, 4, "#c8873a"); px(x + 1, y - 1, 6, 1, "#d99a4a"); px(x + 2, y + 1, 1, 1, "#9a5a22"); px(x + 5, y + 1, 1, 1, "#9a5a22"); lx.restore(); }
  function sackL(x, y, s = 1) { px(x, y, 9 * s, 9 * s, "#b89a64"); px(x + s, y - s, 7 * s, s, "#8c7650"); px(x + 3 * s, y - 2 * s, 3 * s, s, "#8c7650"); px(x + 2 * s, y + 3 * s, 5 * s, s, "#8c7650"); }
  function sun(x, y) { disc(x, y, 4, "#ffd23f"); disc(x, y, 2, "#fff2b0"); }
  // hi-res parchment: unrolled to k
  function parchment(x, y, w, h, k, o = {}) {
    if (k <= 0) return;
    const hh = h * easeOut(k);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02);
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(-w / 2 + 14, -hh / 2 + 14, w, hh);
    ctx.fillStyle = "#efe1b8"; ctx.fillRect(-w / 2, -hh / 2, w, hh);
    ctx.fillStyle = "#d9c48e"; ctx.fillRect(-w / 2, -hh / 2, w, 18); ctx.fillRect(-w / 2, hh / 2 - 18, w, 18);
    ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -hh / 2, w, hh);
    ctx.restore();
  }
  const ink = "#2a1a10";
  const card = (a) => { ctx.fillStyle = `rgba(14,10,24,${a})`; ctx.fillRect(0, 0, WIDTH, H); };

  /* ================================================================ w1 · title */
  // "Chapter three. Wampum: when the tools changed."
  function bigBead(cx, cy, kind, ph) {
    const s = Math.cos(ph), half = Math.round(3 + 9 * Math.abs(s)), [a, b, sh] = kind === "p" ? [PU, PU2, "#4a1d56"] : [WH2, WH, "#a39a84"];
    for (let y = -7; y <= 7; y++) { const round = Math.round(Math.sqrt(1 - Math.pow(y / 8, 2)) * 2); px(cx - half - round, cy + y, (half + round) * 2, 1, y < -3 ? b : y > 3 ? sh : a); }
    if (Math.abs(s) < 0.35) disc(cx, cy, 2, "#0e1630");
  }
  SC.wtitle = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    px(0, 0, LO_W, LO_H, "#0e1630"); stars(70);
    for (let a = 0; a < Math.PI * 2; a += 0.05) px(120 + Math.cos(a) * 34, 50 + Math.sin(a) * 30, 2, 2, Math.floor(a / 0.05) % 6 < 4 ? "#2a3a6a" : PU);
    bigBead(102, 50, "w", t * 1.3); bigBead(138, 50, "p", t * 1.3 + 1.2);
    const g = seg(lt, w(5), w(5) + 0.25) * (1 - seg(lt, w(5) + 0.4, w(5) + 1.0));
    if (g > 0) { lx.save(); lx.globalAlpha = g; px(110, 37, 1, 7, "#fff"); px(107, 40, 7, 1, "#fff"); lx.restore(); }
    blitLo();
    text("CHAPTER 3", WIDTH / 2, 130, 48, C.muted, { alpha: seg(lt, w(0), w(0) + 0.4) });
    const k = seg(lt, w(2), w(2) + 0.35);
    if (k > 0) { ctx.save(); ctx.translate(WIDTH / 2, 820); ctx.scale(pop(k), pop(k)); text("WAMPUM", 0, 0, 160, C.gold); ctx.restore(); }
    body("when the tools changed", WIDTH / 2, 950, 56, C.ink, { alpha: seg(lt, w(3), w(3) + 0.4) });
    fadeOut(lt, d, 0.5);
  };

  /* ================================================================ w2 · the shore */
  // "On America's northeast coast, people made beads from shells: white from the whelk, purple from the quahog clam. Wampum."
  function inset(k, t) {   // a small map: Cape Cod to Long Island
    const x0 = 166, y0 = 4, w = 70, h = 46;
    lx.save(); lx.globalAlpha = k;
    px(x0 - 1, y0 - 1, w + 2, h + 2, "#120d1d"); px(x0, y0, w, h, "#2d5f86");
    for (let y = y0; y < y0 + h; y++) {
      const r = y - y0, coast = r < 18 ? 234 - r * 1.5 : r < 26 ? 207 : r < 30 ? 205 - (r - 26) * 6 : 180 - (r - 30) * 0.4;
      px(x0, y, coast - x0, 1, "#5d7a4a");
      if (r >= 19 && r <= 21) px(207, y, 12, 1, "#5d7a4a");          // Cape Cod's arm
      if (r >= 14 && r <= 19) px(217, y, 2, 1, "#5d7a4a");
    }
    px(182, y0 + 33, 22, 2, "#5d7a4a"); px(204, y0 + 32, 3, 2, "#5d7a4a");   // Long Island
    if (Math.floor(t * 3) % 2 === 0) px(199, y0 + 26, 2, 2, C.gold);
    lx.restore();
  }
  SC.wshore = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 46, "#8fa8b8", "#b9c9cf");
    px(0, 46, LO_W, 16, "#4f7f96");
    for (let i = 0; i < 20; i++) px((hash(i) * LO_W + t * 5) % LO_W, 48 + hash(i + 3) * 12, 4, 1, "#6f9fb6");
    px(0, 62, LO_W, 73, "#6f7a5c");
    for (let i = 0; i < 70; i++) px(hash(i + 7) * LO_W, 64 + hash(i + 17) * 70, 3, 1, i % 3 ? "#5f6a4e" : "#8fa8b8");
    px(0, 58, 70, 18, "#4f6a3a"); pine(8, 64, 22); pine(58, 62, 16);
    wetu(34, 72);
    native(90, 104, { t, crouch: true, face: 1 }); native(132, 98, { t, crouch: true, face: -1, skirt: true, long: 6 }); native(172, 110, { t, crouch: true, face: 1 });
    T.basket(96, 100); T.basket(160, 106);
    const sp = seg(lt, w(8.5), w(9) + 0.3);
    dim(0.6 * sp);
    if (lt > w(1)) inset(seg(lt, w(1), w(1) + 0.5) * (1 - sp * 0.8), t);
    // whelk → a white bead; quahog → a purple bead
    const kw = seg(lt, w(9), w(9) + 0.35), kq = seg(lt, w(13), w(13) + 0.35);
    if (kw > 0) { const y = 76 + (1 - easeOut(kw)) * 30; whelk(56, y, 1, seg(lt, w(10), w(11))); }
    if (kq > 0) { const y = 76 + (1 - easeOut(kq)) * 30; quahog(184, y, seg(lt, w(14), w(15.5))); }
    const fw = seg(lt, w(11), w(12)), fq = seg(lt, w(16), w(17));
    const kS = seg(lt, w(17.6), w(18) + 0.9);
    if (fw > 0 && kS < 1) { const u = easeOut(fw); lx.save(); lx.globalAlpha = 1 - kS; for (let i = 0; i < 3; i++) wb(lerp(58, 92, u) + i * 0, lerp(70, 50, u) - Math.sin(u * Math.PI) * 10, "w"); lx.restore(); }
    if (fq > 0 && kS < 1) { const u = easeOut(fq); lx.save(); lx.globalAlpha = 1 - kS; wb(lerp(184, 146, u), lerp(78, 50, u) - Math.sin(u * Math.PI) * 10, "p"); lx.restore(); }
    if (kS > 0) { const n = Math.floor(kS * 58); px(4, 125, n * 4, 1, "#4a3220"); for (let i = 0; i < n; i++) { px(4 + i * 4, 123, 3, 3, i % 6 < 4 ? WH2 : PU); px(4 + i * 4, 123, 3, 1, i % 6 < 4 ? WH : PU2); } }
    blitLo();
    where("THE NORTHEAST COAST", "North America · 1600s", lt, d);
    if (lt > w(1)) { const a = seg(lt, w(1), w(1) + 0.5) * (1 - sp * 0.8); body("NEW ENGLAND", X(190), X(9), 22, C.ink, { alpha: a }); body("LONG ISLAND", X(195), X(44), 22, C.ink, { alpha: a }); }
    if (fw > 0) label("WHITE · WHELK", X(56), X(40), { k: fw, size: 34 });
    if (fq > 0) label("PURPLE · QUAHOG", X(184), X(40), { k: fq, size: 34, bg: "#e6c8f2" });
    if (kS > 0) label("WAMPUM", WIDTH / 2, 880, { k: seg(lt, w(18), w(18) + 0.35), size: 64, bg: C.gold });
  };

  /* ================================================================ w3 · by hand, with stone */
  // "Each bead was cut, drilled and polished by hand, with stone. Slow work. Strung into belts, wampum sealed treaties between nations."
  function bench(t) {   // the workbench backdrop shared by w3 and w5
    px(0, 0, LO_W, 104, "#3a2a1e");
    for (let i = 0; i < 40; i++) px(hash(i) * LO_W, hash(i + 5) * 100, 1, 6 + hash(i + 9) * 10, "#33251a");
    px(0, 104, LO_W, 31, "#8a5a2b"); px(0, 104, LO_W, 2, "#a8743c"); for (let i = 0; i < 8; i++) px(hash(i + 3) * LO_W, 110 + hash(i) * 20, 20, 1, "#7a4a22");
  }
  SC.wstone = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(13);
    if (lt < split) {
      bench(t);
      const sunK = seg(lt, w(9), split);
      px(178, 8, 54, 30, "#6aa0c8"); px(178, 30, 54, 8, "#4f7a3a"); px(176, 6, 58, 2, "#5e3b1a"); px(176, 38, 58, 2, "#5e3b1a");   // a little window
      if (sunK > 0 || lt < w(9)) { const a = lerp(Math.PI, 0, sunK); lx.save(); lx.beginPath(); lx.rect(178, 8, 54, 22); lx.clip(); sun(205 + Math.cos(a) * 22, 30 - Math.sin(a) * 18); lx.restore(); }
      const cutK = seg(lt, w(3), w(3) + 0.2), drillK = seg(lt, w(4), w(10)), ph = drillK > 0 ? (lt - w(4)) * Math.PI * 2 * 0.9 : 0;
      if (cutK < 1) { quahog(84, 100, 0); }
      pumpDrill(84, 18, ph, { dust: lt > w(6) && lt < w(9) });
      if (cutK > 0 && cutK < 1) for (let i = 0; i < 6; i++) px(84 + (hash(i) - 0.5) * 30 * cutK, 96 - hash(i + 4) * 14 * cutK, 2, 1, "#d8d4cc");
      // the dish fills: 1 bead at "stone", then crawling
      const n = lt < w(10) ? 0 : lt < w(11.6) ? 1 : lt < w(12.6) ? 2 : 3;
      dish(150, 108, n);
      blitLo();
      where("BEFORE IRON", "every bead drilled with stone", lt, split);
      // progress bar for the bead being drilled
      if (lt > w(4) - 0.2) {
        const bx = 1080, by = 480, bw = 560;
        text("1 BEAD", bx + bw / 2, by - 50, 40, C.ink);
        ctx.fillStyle = "#120d1d"; ctx.fillRect(bx, by, bw, 44); ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.strokeRect(bx, by, bw, 44);
        ctx.fillStyle = drillK >= 1 ? C.leaf : C.gold; ctx.fillRect(bx + 6, by + 6, (bw - 12) * drillK, 32);
      }
      if (n > 0) text(`BEADS: ${n}`, X(150), 980, 64, C.gold, { alpha: seg(lt, w(10), w(10) + 0.3) });
      if (lt > w(11)) label("SLOW WORK", 1360, 660, { k: seg(lt, w(11), w(11) + 0.35), size: 40 });
    } else {
      // the beads become a belt: row by row, then two hands hold it
      px(0, 0, LO_W, LO_H, "#24170f");
      for (let r = 60; r > 0; r -= 6) disc(120, 66, r, `rgba(255,190,110,${0.018})`);
      const kb = seg(lt, split, w(16.5));
      belt(120, 64, kb);
      if (kb < 1) for (let i = 0; i < 8; i++) { const u = (kb * 7 + i * 0.13) % 1; wb(60 + hash(i) * 120, lerp(130, 64, u), i % 3 ? "w" : "p"); }
      const kh = easeOut(seg(lt, w(17), w(17) + 0.7));
      if (kh > 0) {
        const lxx = lerp(-30, 52, kh), rx = lerp(270, 188, kh);
        px(lxx - 40, 62, 40, 6, DEER2); px(lxx, 60, 6, 9, NSK); px(lxx + 2, 59, 4, 2, NSK);
        px(rx, 62, 40, 6, "#5e4630"); px(rx - 6, 60, 6, 9, "#8a5434"); px(rx - 6, 59, 4, 2, "#8a5434");
      }
      blitLo();
      label("A BELT = A PROMISE", WIDTH / 2, 820, { k: seg(lt, w(17.5), w(17.5) + 0.35), size: 48, bg: C.gold });
      body("strung wampum: belts sealed treaties between nations", WIDTH / 2, 940, 34, C.muted, { alpha: seg(lt, w(18), w(18) + 0.5) });
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ w4 · colonists, furs, the 1637 law */
  // "European colonists arrived with almost no coins. Inland nations took wampum for furs, so colonists used it as money.
  //  In sixteen thirty-seven, Massachusetts made it legal small change: six beads to a penny."
  SC.wlaw = (lt, d, t, s) => {
    const w = (n) => word(s, n), p2 = w(7), p3 = w(19);
    if (lt < p2) {
      sky(0, 60, "#9ccbe6", "#d4ecf6");
      px(0, 60, 130, 40, C.sea); for (let i = 0; i < 24; i++) px((hash(i) * 130 + t * 6) % 130, 62 + hash(i + 2) * 36, 4, 1, C.seaHi);
      for (let x = 100; x < LO_W; x++) px(x, 56 + Math.max(0, 40 - (x - 100) * 0.9), 1, 80, C.sand);
      px(0, 100, LO_W, 35, C.sand); px(0, 100, 100, 3, C.foam);
      pine(204, 60, 26); pine(226, 62, 20);
      ship(lerp(-40, 50, easeOut(seg(lt, 0, w(2.5)))), 86, t);
      const walk = seg(lt, w(1.5), w(4));
      colonist(lerp(96, 140, walk), 116, { t, walk: walk > 0 && walk < 1, face: 1 });
      colonist(lerp(84, 118, walk), 120, { t: t + 0.3, walk: walk > 0 && walk < 1, face: 1, hat: "coif", top: "#5a4a3a", bot: "#5a4a3a", collar: LINEN, skirt: true, leg: "#5a4a3a" });
      const kp = seg(lt, w(4), w(4) + 0.3);
      if (kp > 0) {   // the purse turned out: one coin rolls away
        px(144, 104 - kp * 3, 5, 5, "#7a4a22"); px(145, 103 - kp * 3, 3, 1, "#5e3b1a");
        const ru = seg(lt, w(4.5), w(6.5)); coin(148 + ru * 70, 114 + Math.abs(Math.sin(ru * 9)) * -3 * (1 - ru), 2, 1);
      }
      blitLo();
      where("NEW ENGLAND", "1620s–1630s · colonists arrive", lt, p2);
      label("COINS: ALMOST NONE", 1300, 360, { k: seg(lt, w(5), w(5) + 0.35), size: 40, bg: C.gold });
    } else if (lt < p3) {
      // a trading post: inland trader (left) · colonist with wampum (middle) · colonist with grain (right)
      sky(0, 70, "#9ccbe6", "#d4ecf6");
      for (let x = 0; x < LO_W; x += 5) { px(x, 34 + (x % 10 ? 1 : 0), 4, 40, "#7a5a32"); px(x + 1, 32 + (x % 10 ? 1 : 0), 2, 2, "#7a5a32"); }
      ground(74, "#8a7a52", "#7a6a42");
      px(90, 96, 60, 4, "#8a5a2b"); px(92, 100, 2, 12, "#5e3b1a"); px(146, 100, 2, 12, "#5e3b1a");   // a table
      const kB = seg(lt, w(9), w(10)), nod = lt > w(10.5) && lt < w(12);
      const kF = easeInOut(seg(lt, w(11.5), w(13)));
      const kC = easeInOut(seg(lt, w(14), w(16))), kG = easeInOut(seg(lt, w(16), w(18)));
      native(46, 116, { t, face: 1, long: 6, top: DEER, arm: "out", nod });
      colonist(120, 116, { t, face: kC > 0 ? 1 : -1, arm: "out" });
      colonist(196, 116, { t, face: -1, top: "#4a5a3a", arm: "out" });
      // furs: from the trader's pile onto the table
      for (let i = 0; i < 3; i++) pelt(lerp(22, 104 + i * 8, kF) , lerp(110 - i * 7, 88 - i * 2, kF), 6);
      // the wampum string: colonist → trader (weighed), then a second string colonist → grain seller
      const sx = lerp(108, 54, easeOut(kB)), sy = 104 - (nod ? Math.round(Math.sin(t * 9)) : 0);
      strand(sx, sy, 5, "a", { sag: 1 });
      if (lt > w(13)) strand(lerp(124, 184, kC), 104, 5, "a", { sag: 1 });
      sackL(lerp(198, 132, kG), 96 - 2, 1);
      blitLo();
      where("TRADING POST", "1620s-1630s", lt - p2, p3 - p2);
      label("FURS FOR WAMPUM", 560, 220, { k: seg(lt, w(11.5), w(11.5) + 0.35), size: 40, bg: C.gold });
      if (lt > w(14)) label("WAMPUM = MONEY", 1360, 220, { k: seg(lt, w(15.5), w(15.5) + 0.35), size: 40, bg: C.gold });
      if (lt > w(7)) body("inland trader", X(46), X(124), 30, C.ink, { alpha: seg(lt, w(7), w(7) + 0.4) });
      if (lt > w(13)) body("colonists", X(158), X(124), 30, C.ink, { alpha: seg(lt, w(13), w(13) + 0.4) });
    } else {
      px(0, 0, LO_W, LO_H, "#1a1328"); stars(40, "#2a2140");
      blitLo();
      parchment(WIDTH / 2, 470, 1180, 760, seg(lt, p3, p3 + 0.6));
      const a = seg(lt, p3 + 0.3, p3 + 0.7);
      text("MASSACHUSETTS · 1637", WIDTH / 2, 190, 64, ink, { alpha: a, shadow: false });
      text("WAMPUM", 880, 380, 72, ink, { alpha: a, shadow: false });
      body("an order of the General Court", WIDTH / 2, 255, 34, "#6a4a2a", { alpha: a, shadow: false });
      stamp("LEGAL", 1340, 380, seg(lt, w(25), w(25) + 0.25), { size: 58, color: "#2f8a3a" });
      for (let i = 0; i < 6; i++) { const k = seg(lt, w(28) + i * 0.18, w(28) + i * 0.18 + 0.2); if (k > 0) { ctx.save(); ctx.translate(520 + i * 100, 540); ctx.scale(pop(k), pop(k)); hb(0, 0, "w", 16); ctx.restore(); } }
      const kp = seg(lt, w(31.5), w(31.5) + 0.3);
      if (kp > 0) {
        text("=", 1150, 540, 90, ink, { alpha: kp, shadow: false });
        ctx.save(); ctx.translate(1300, 540); ctx.scale(pop(kp), pop(kp));
        ctx.fillStyle = "#7c8596"; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.fill(); ctx.fillStyle = "#c9d0dc"; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill();
        text("1", 0, 4, 60, "#5a6070", { shadow: false }); ctx.restore();
        text("6 BEADS = 1 PENNY", WIDTH / 2, 700, 76, ink, { alpha: kp, shadow: false });
        body("legal for small sums: under 12 pence", WIDTH / 2, 780, 36, "#6a4a2a", { alpha: kp, shadow: false });
      }
    }
  };

  /* ================================================================ w5 · iron drill points */
  // "The newcomers also brought iron. Coastal makers switched to iron drill points: far faster than stone. Beads multiplied. Rough ones and fakes poured in too."
  SC.wiron = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(9), p3 = w(17.6);
    if (lt < split) {
      bench(t);
      const drop = seg(lt, w(3.5), w(4)), take = easeInOut(seg(lt, w(5.5), w(7.5))), iron = lt > w(7.5);
      pumpDrill(84, 18, iron ? (lt - w(7.5)) * Math.PI * 2 * 2.2 : 0, { iron, hands: iron });
      if (lt > w(3.5) && !iron) {
        const ax = lerp(140, 84, take), ay = take > 0 ? lerp(101, 88, take) : lerp(20, 101, easeOut(drop));
        px(ax - 6, ay, 12, 2, IRON); px(ax + 4, ay, 2, 2, IRON2); px(ax - 8, ay - 1, 4, 4, "#7a4a22");
        if (drop >= 1 && take === 0 && Math.floor(t * 4) % 2) { px(ax + 6, ay - 3, 1, 3, "#fff"); px(ax + 5, ay - 2, 3, 1, "#fff"); }
        if (take > 0) { px(ax + 2, ay - 2, 5, 5, NSK); px(ax + 7, ay, 60, 4, DEER2); }
      }
      if (lt > w(6.5)) { const u = seg(lt, w(6.5), w(7.5)); px(lerp(84, 64, u), lerp(88, 104, u), 3, 4, STONEP); }
      blitLo();
      where("THE COAST · 1630s-1640s", "iron from Europe", lt, split);
      if (lt > w(4)) label("IRON DRILL POINT", 1300, 760, { k: seg(lt, w(4), w(4) + 0.35), size: 40, bg: C.gold });
      if (lt > w(7)) body("the makers' own choice: more beads to trade", 1300, 850, 32, C.ink, { alpha: seg(lt, w(7), w(7) + 0.5) });
    } else if (lt < p3) {
      // split screen: stone vs iron, same work
      px(0, 0, 120, LO_H, "#3a2a1e"); px(120, 0, 120, LO_H, "#2e2433");
      px(0, 104, LO_W, 31, "#8a5a2b"); px(0, 104, LO_W, 2, "#a8743c"); px(119, 0, 2, LO_H, "#120d1d");
      const tt = lt - split, nS = Math.min(2, Math.floor(tt / 2.2) + 1);
      const kI = seg(lt, split, w(16)), nI = Math.round(1 + 89 * Math.pow(kI, 1.6)), over = seg(lt, w(16), w(17.5));
      pumpDrill(60, 22, tt * Math.PI * 2 * 0.9, { L: 60, fr: 7 });
      pumpDrill(180, 22, tt * Math.PI * 2 * 5, { L: 60, fr: 7, iron: true, dust: true });
      dish(60, 112, nS * 3 > 0 ? nS : 0);
      heap(180, 116, Math.min(26, 3 + nI * 0.22 + over * 8), 24 + Math.min(34, nI * 0.3) + over * 30, 0, 0.25);
      if (over > 0) { px(122, 74, 118, 2, "#5e3b1a"); for (let i = 0; i < 4; i++) heap(136 + i * 30, 74, 2 + over * 6, 8 + over * 10); }
      blitLo();
      text("STONE", X(60), 90, 54, C.muted); text(lt > w(12) ? "IRON: FAR FASTER" : "IRON", X(180), 90, lt > w(12) ? 46 : 54, C.gold);
      const fl = lt > w(12) && lt < w(14) && Math.floor(t * 8) % 2;
      text(`BEADS: ${nS}`, X(60), 980, 60, fl ? C.gold : C.ink);
      text(`BEADS: ${nI}`, X(180), 980, 60, fl ? C.gold : C.ink);
      body("counts are illustrative: no record says how much faster", WIDTH / 2, 1050, 24, C.muted, { alpha: 0.85 });
    } else {
      // the village pile, then rough beads and fakes on top
      sky(0, 70, "#9ab8c8", "#c9dbe2"); ground(70, "#6f7a5c", "#5f6a4e");
      wetu(30, 74, 22, 14); wetu(210, 74, 22, 14); pine(60, 72, 18); pine(180, 70, 22);
      const kr = seg(lt, w(18), w(23)), cart = seg(lt, w(21.5), w(23.5));
      const hh = 26 + kr * 20 + easeOut(cart) * 70, ww = 110 + kr * 30 + cart * 110;
      heap(120, 134, Math.min(hh, 128), ww, 0.12 + 0.35 * kr + 0.15 * cart);
      // the handcart from the right, tipping its load
      if (cart > 0 || lt > w(21)) {
        const cx = lerp(270, 196, easeOut(seg(lt, w(21), w(22)))), tip = seg(lt, w(22), w(22.6));
        lx.save(); lx.translate(cx, 100); lx.rotate(-tip * 0.6);
        px(-16, -12, 32, 12, "#7a4a22"); px(-16, -12, 32, 2, "#9a6a36"); heap(0, -11, 6 * (1 - cart), 26, 0.7);
        lx.restore(); disc(cx, 104, 5, "#3b2615"); disc(cx, 104, 2, "#7a4a22");
        if (tip > 0 && cart < 1) for (let i = 0; i < 14; i++) { const u = (t * 2 + hash(i)) % 1; wb(cx - 18 - u * 20 + hash(i + 3) * 6, 88 + u * 20, hash(i) < 0.7 ? "g" : "w"); }
      }
      blitLo();
      where("BEADS MULTIPLIED", "rough ones and fakes too", lt, d);
      // big close-ups of a good bead, a rough one and a fake
      const big = (x, kind, chip, hole, k) => {
        if (k <= 0) return; ctx.save(); ctx.translate(x, 330); ctx.scale(pop(k), pop(k));
        ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(-82, -42, 180, 100);
        ctx.fillStyle = kind === "w" ? WH : GREY; ctx.fillRect(-90, -50, 180, 100);
        ctx.fillStyle = kind === "w" ? WH2 : GREY2; ctx.fillRect(-90, 20, 180, 30);
        if (chip) { ctx.fillStyle = "#2b2433"; ctx.fillRect(40, -50, 50, 30); ctx.fillRect(-90, 30, 30, 20); ctx.fillRect(-20, -50, 20, 14); }
        if (hole) { ctx.fillStyle = "#1a1220"; ctx.fillRect(-90, -8, 18, 16); }
        ctx.restore();
      };
      ctx.fillStyle = "rgba(14,10,24,.82)"; ctx.fillRect(360, 230, 1200, 300 * seg(lt, p3, p3 + 0.2));
      big(560, "w", false, true, seg(lt, p3, p3 + 0.3)); big(960, "g", true, true, seg(lt, w(18), w(18) + 0.3)); big(1360, "g", true, false, seg(lt, w(21), w(21) + 0.3));
      if (lt > p3) text("GOOD", 560, 440, 40, C.leaf);
      if (lt > w(18)) text("ROUGH", 960, 440, 40, C.bad);
      if (lt > w(21)) { text("FAKE", 1360, 440, 40, C.bad); body("no hole · wrong shell or stone", 1360, 490, 26, C.ink); }
      if (cart > 0.3) { ctx.fillStyle = "rgba(14,10,24,.8)"; ctx.fillRect(560, 570, 800, 140); }
      if (cart > 0.3) stamp("POURED IN", WIDTH / 2, 640, seg(lt, w(22.5), w(22.5) + 0.25), { size: 64 });
    }
  };

  /* ================================================================ w6 · the beaver pelt, 640 → 3,200 beads */
  // "In Dutch New Amsterdam, a beaver pelt cost about six hundred and forty beads in sixteen forty-one. By sixteen sixty-two: three thousand two hundred.
  //  Same pelt. Five times the beads. That's inflation: the pelt didn't change. The beads got cheap."
  const PTS = [[1641, 640], [1650, 1200], [1658, 2240], [1662, 3200]];
  SC.wbeaver = (lt, d, t, s) => {
    const w = (n) => word(s, n), p2 = w(4.5), p3 = w(29.6);
    if (lt < p2) {
      sky(0, 80, "#9ccbe6", "#d4ecf6");
      px(0, 96, LO_W, 39, C.sea); for (let i = 0; i < 30; i++) px((hash(i) * LO_W + t * 4) % LO_W, 98 + hash(i + 2) * 34, 4, 1, C.seaHi);
      px(0, 80, LO_W, 16, "#7a8a5a");
      // the fort, its flag, the windmill, the houses
      px(14, 64, 60, 18, "#8c8471"); for (let x = 14; x < 74; x += 6) px(x, 61, 3, 3, "#8c8471"); px(40, 36, 1, 28, "#3b2615");
      px(41, 36, 12, 3, "#e8902a"); px(41, 39, 12, 3, "#f4f0e6"); px(41, 42, 12, 3, "#2e5fb8");
      windmill(94, 80, t);
      [["#a0522d", 18], ["#8a3a2a", 22], ["#b0603a", 16], ["#7a4a3a", 20]].forEach(([c, h], i) => gable(112 + i * 22, 82, 18, h, c));
      ship(214, 116, t);
      blitLo();
      where("NEW AMSTERDAM", "a Dutch town · today: New York City", lt, p3);
    } else if (lt < p3) {
      // inside: a balance. Pelt on the left, strings of white wampum on the right (each string ≈ 300 beads)
      px(0, 0, LO_W, LO_H, "#3a2a1e"); for (let x = 0; x < LO_W; x += 12) px(x, 0, 1, 104, "#2e2117");
      px(0, 104, LO_W, 31, "#5e3b1a"); px(0, 104, LO_W, 2, "#7a4a22");
      const [L, R] = scale(84, 58, 44);
      const kp = seg(lt, w(5), w(5) + 0.35);
      if (kp > 0) pelt(L[0], L[1] - 10 - (1 - easeOut(kp)) * 30, 10);
      // the price steps: 1641 → 1650s → 1658 → 1662
      const kA = seg(lt, w(9), w(13)), steps = [w(17), w(19), w(21.5)];
      let i = 0; while (i < 3 && lt >= steps[i]) i++;
      const from = PTS[Math.max(0, i - 1)][1], to = PTS[i][1], kk = i > 0 ? seg(lt, steps[i - 1], steps[i - 1] + 0.6) : 1;
      const beads = i === 0 ? Math.round(640 * kA) : Math.round(lerp(from, to, easeOut(kk)));
      const rows = beads / 300;
      for (let r = 0; r < Math.ceil(rows - 0.01); r++) {
        const part = Math.min(1, rows - r), n = Math.max(1, Math.round(6 * part));
        strand(R[0] - 11 + (r % 2) * 2 + Math.round((hash(r) - 0.5) * 3), R[1] - 2 - r * 3, n, "w");
      }
      if (lt > w(24)) { const p = 1 + Math.max(0, Math.sin((lt - w(24)) * 8)) * 0.6 * (1 - seg(lt, w(24), w(25.5))); if (p > 1.05) disc(L[0], L[1] - 10, 12, "rgba(255,210,63,.35)"); }
      blitLo();
      where("NEW AMSTERDAM", "a Dutch town · today: New York City", lt, p3);
      const yr = i === 0 ? "1641" : i === 1 ? "1650s" : String(PTS[i][0]);
      const ka = seg(lt, w(9), w(9) + 0.3);
      text(yr, 1480, 300, 120, C.gold, { alpha: ka });
      text(beads.toLocaleString("en-US"), 1480, 470, 130, C.ink, { alpha: ka });
      body("white beads for one beaver pelt", 1480, 570, 36, C.muted, { alpha: ka });
      text("1 BEAVER PELT", X(L[0]), X(L[1]) + 90, 30, C.ink, { alpha: kp });
      text("1 STRING = ABOUT 300 BEADS", X(R[0]), X(R[1]) + 90, 26, C.muted, { alpha: ka });
      if (lt > w(24)) { label("SAME", X(L[0]), X(L[1]) - 260, { k: seg(lt, w(24), w(24) + 0.3), size: 44, bg: C.leaf }); body("in silver: no rise", X(L[0]), X(L[1]) + 140, 28, C.muted, { alpha: seg(lt, w(24.5), w(25)) }); }
      if (lt > w(26)) stamp("5 TIMES THE BEADS", 1480, 760, seg(lt, w(26), w(26) + 0.25), { size: 60, color: C.gold });
    } else {
      // the card: inflation = the pelt stayed, the beads got cheap. A bar chart along the bottom.
      px(0, 0, LO_W, LO_H, "#120d1d");
      const k1 = seg(lt, w(32), w(32) + 0.3), k2 = seg(lt, w(36), w(36) + 0.3);
      if (k1 > 0) pelt(30, 40, 9);
      if (k2 > 0) { lx.save(); lx.globalAlpha = k2; px(24, 63, 13, 8, WH2); px(24, 63, 13, 4, WH); px(22, 66, 3, 2, "#120d1d"); lx.restore(); }
      blitLo();
      text("INFLATION", WIDTH / 2, 120, 110, C.gold, { alpha: seg(lt, p3, p3 + 0.3) });
      body("the pelt didn't change: still one pelt", 420, X(40), 50, C.ink, { align: "left", alpha: k1 });
      body("the beads got cheap: each bead buys less", 420, X(67), 50, C.ink, { align: "left", alpha: k2 });
      if (k2 > 0) { ctx.save(); ctx.globalAlpha = k2; ctx.fillStyle = C.bad; ctx.fillRect(330, X(67) - 50, 18, 60); ctx.beginPath(); ctx.moveTo(312, X(67) + 10); ctx.lineTo(366, X(67) + 10); ctx.lineTo(339, X(67) + 50); ctx.fill(); ctx.restore(); }
      // bars
      const kc = seg(lt, p3 + 0.2, p3 + 1.6), bx = 300, by = 1000, bw = 1320, bh = 330;
      text("ONE BEAVER PELT, IN WHITE BEADS", WIDTH / 2, by - bh - 30, 30, C.muted, { alpha: kc });
      PTS.forEach(([y, v], j) => {
        const x = bx + j * (bw / 4) + 50, hgt = bh * (v / 3200) * easeOut(seg(kc, j * 0.2, j * 0.2 + 0.4));
        ctx.fillStyle = j === 3 ? C.gold : WH2; ctx.fillRect(x, by - hgt, bw / 4 - 100, hgt);
        if (hgt > 1) { text(v.toLocaleString("en-US"), x + (bw / 4 - 100) / 2, by - hgt - 28, 34, C.ink); text(j === 1 ? "1650s" : String(y), x + (bw / 4 - 100) / 2, by + 30, 30, C.muted); }
      });
      body("after L. Jordan, Notre Dame, from Dutch records", WIDTH - 40, 1062, 22, C.dim, { align: "right" });
    }
  };

  /* ================================================================ w7 · savers lose; bakers say no */
  // "If you saved wampum, or earned it, it bought less and less. You did nothing wrong. In sixteen fifty-eight, the town's leaders complained that bakers and brewers would hardly take the beads."
  SC.wbakers = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(16);
    if (lt < split) {
      px(0, 0, LO_W, LO_H, "#4a3624"); for (let x = 0; x < LO_W; x += 10) px(x, 0, 1, 100, "#3e2c1c");
      px(0, 100, LO_W, 35, "#5e3b1a"); px(0, 100, LO_W, 2, "#7a4a22");
      // the saver, the basket, the wage-earner
      px(30, 92, 14, 2, "#7a4a22"); px(32, 94, 2, 6, "#5e3b1a"); px(40, 94, 2, 6, "#5e3b1a");     // stool
      colonist(37, 93, { t, hat: "coif", top: "#5a4a6a", bot: "#5a4a6a", skirt: true, grey: true, leg: "#5a4a6a" });
      px(52, 88, 18, 12, "#b8862e"); px(52, 88, 18, 2, "#d9a84a"); for (let i = 0; i < 3; i++) strand(53 + i, 85 - i * 2, 4, "w", { sag: 1 });
      const kw = seg(lt, w(5), w(5) + 0.6);
      colonist(196, 100, { t, top: "#6a5a3a", arm: "out", face: -1 });
      if (kw > 0) strand(lerp(240, 186, easeOut(kw)), 89, 3, "w");
      // loaves on a shelf: what the savings buy (4 → 3)
      px(96, 78, 52, 2, "#7a4a22");
      const lose = seg(lt, w(10), w(11));
      for (let j = 0; j < 4; j++) loaf(98 + j * 12, 73 + (j === 3 ? lose * 30 : 0), j === 3 ? 1 - lose : 1);
      if (lt > w(12) && lt < split) { const q = seg(lt, w(12), w(12) + 0.3); lx.save(); lx.globalAlpha = q; px(36, 68, 3, 1, C.gold); px(38, 69, 1, 2, C.gold); px(37, 71, 1, 1, C.gold); px(37, 73, 1, 1, C.gold); lx.restore(); }
      blitLo();
      where("NEW AMSTERDAM", "1650s", lt, split);
      // the rate sign, repainted
      const kr = seg(lt, w(7), w(8.5));
      ctx.fillStyle = "#e9dcb8"; ctx.fillRect(560, 170, 800, 120); ctx.strokeStyle = "#5e3b1a"; ctx.lineWidth = 8; ctx.strokeRect(560, 170, 800, 120);
      text(kr < 0.5 ? "6 BEADS = 1 STIVER" : "8 BEADS = 1 STIVER", 960, 232, 52, kr < 0.5 ? ink : "#a01818", { shadow: false });
      if (kr > 0 && kr < 1) { ctx.fillStyle = "#e9dcb8"; ctx.fillRect(560 + 800 * Math.max(0, kr * 2 - 1), 178, 120, 104); ctx.fillStyle = "#c0392b"; ctx.fillRect(560 + 800 * kr, 178, 30, 104); }
      body("a stiver was a small Dutch coin, like a penny", 960, 330, 30, C.ink);
      label("SAVINGS: 240 BEADS", X(60), 870, { k: seg(lt, w(2), w(2) + 0.35), size: 34 });
      if (kw > 0) label("WAGES", X(212), X(80), { k: kw, size: 34 });
      const after = lt > w(9.5);
      if (lt > w(3)) body(after ? "240 beads = 30 stivers = 3 loaves" : "240 beads = 40 stivers = 4 loaves", WIDTH / 2, 990, 48, after ? C.bad : C.gold, { alpha: seg(lt, w(3), w(3) + 0.4) });
      if (lt > w(12)) label("SAME BEADS. LESS BREAD.", 1400, 560, { k: seg(lt, w(12), w(12) + 0.35), size: 36, bg: C.gold });
    } else {
      // a street: bakery and brewery; a boat unloads more strings at the quay
      sky(0, 100, "#9ccbe6", "#d4ecf6");
      gable(8, 100, 44, 46, "#a0522d"); gable(60, 100, 40, 40, "#8a3a2a");
      px(18, 58, 18, 8, "#e9dcb8"); loaf(23, 60); px(70, 64, 18, 8, "#e9dcb8"); px(75, 65, 8, 6, "#8a5a2b"); px(75, 67, 8, 1, "#5e3b1a");
      ground(100, "#8c8471", "#7a7262");
      px(150, 100, 90, 35, C.sea); for (let i = 0; i < 12; i++) px(150 + (hash(i) * 90 + t * 4) % 90, 104 + hash(i + 2) * 28, 4, 1, C.seaHi);
      px(146, 98, 4, 37, "#5e3b1a");
      const by = 110 + Math.sin(t * 1.5);
      px(168, by, 50, 6, "#5a3a1c"); px(190, by - 22, 1, 22, "#3b2615"); px(182, by - 20, 16, 12, "#efe6cf");
      for (let i = 0; i < 4; i++) { const u = ((lt - split) * 0.7 + i * 0.25) % 1; strand(lerp(176, 140, u), by - 4 - Math.sin(u * Math.PI) * 10, 4, "w"); }
      heap(130, 100, 10 + (lt - split) * 0.8, 26);
      const fold = lt > w(24.5), push = easeInOut(seg(lt, w(27.5), w(29)));
      colonist(30, 102, { t, hat: null, hair: "#c9a26a", top: "#f2ead6", bot: "#6a5a3a", collar: null, arm: fold ? "fold" : undefined, armC: "#e9b98f", face: 1 });
      colonist(56, 104, { t, top: "#6a5a3a", arm: "out", face: -1 });
      strand(lerp(38, 52, push), 93, 3, "w");
      blitLo();
      where("NEW AMSTERDAM · 1658", "", lt - split, d - split);
      label("FROM NEW ENGLAND", X(190), X(78), { k: seg(lt, w(19), w(19) + 0.35), size: 32 });
      if (lt > w(25)) {
        const k = seg(lt, w(25), w(25) + 0.3); ctx.save(); ctx.globalAlpha = k;
        ctx.fillStyle = "#fff8e8"; ctx.fillRect(330, 360, 620, 110); ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 6; ctx.strokeRect(330, 360, 620, 110);
        ctx.beginPath(); ctx.moveTo(360, 470); ctx.lineTo(300, 520); ctx.lineTo(420, 470); ctx.fillStyle = "#fff8e8"; ctx.fill();
        text("MORE BEADS? NO THANKS.", 640, 415, 38, "#1a1026", { shadow: false }); ctx.restore();
      }
      body("baker", X(30), X(108), 30, C.ink, { alpha: seg(lt, w(24), w(24) + 0.4) });
      if (lt > w(27)) {
        const k = seg(lt, w(27), w(27) + 0.5); ctx.fillStyle = `rgba(14,10,24,${0.88 * k})`; ctx.fillRect(0, 900, WIDTH, 180);
        body("“…so oversupplied that it is not considered valuable anymore.”", WIDTH / 2, 960, 44, C.ink, { alpha: k, font: "'Space Grotesk'", weight: 500 });
        body("town leaders of New Amsterdam, petition of 1658", WIDTH / 2, 1028, 28, C.muted, { alpha: k });
      }
    }
  };

  /* ================================================================ w8 · repeal; belts still matter; money fades */
  // "In sixteen sixty-one, with Boston now minting silver coins, Massachusetts dropped wampum as legal money. Wampum belts still matter today. But as money, it faded away."
  SC.wfade = (lt, d, t, s) => {
    const w = (n) => word(s, n), p2 = w(14.8), p3 = w(19.8);
    if (lt < p2) {
      px(0, 0, LO_W, LO_H, "#1a1328"); stars(40, "#2a2140");
      // the Boston press stamping a silver coin
      const hit = (Math.max(0, lt - w(5)) % 1.1) / 1.1, pressY = lt > w(5) ? 40 + Math.round(10 * Math.max(0, Math.sin(hit * Math.PI))) : 40;
      px(178, 24, 44, 4, "#5e3b1a"); px(178, 24, 4, 72, "#5e3b1a"); px(218, 24, 4, 72, "#5e3b1a"); px(178, 92, 44, 6, "#5e3b1a");
      px(199, 28, 2, pressY - 28, "#9aa3b5"); px(190, pressY, 20, 4, "#7c8596");
      if (lt > w(4.5)) { disc(200, 86, 6, "#9aa3b5"); disc(200, 86, 5, "#c9d0dc"); }
      blitLo();
      parchment(620, 520, 900, 640, 1);
      text("MASSACHUSETTS · 1661", 620, 300, 52, ink, { shadow: false });
      text("WAMPUM", 620, 470, 90, ink, { shadow: false });
      const kR = seg(lt, w(10), w(10) + 0.25);
      ctx.save(); ctx.globalAlpha = 1 - 0.75 * kR; stamp("LEGAL", 620, 690, 1, { size: 72, color: "#2f8a3a" }); ctx.restore();
      stamp("REPEALED", 640, 650, kR, { size: 92, rot: -0.12 });
      if (lt > w(4.5)) { text("NE", X(200), X(86) + 4, 44, "#5a6070", { shadow: false }); label("BOSTON MINT · 1652", X(200), 160, { k: seg(lt, w(4), w(4) + 0.35), size: 32 }); body("silver coins", X(200), 870, 34, C.ink); }
    } else if (lt < p3) {
      // a respectful still: the belt, warmly lit
      px(0, 0, LO_W, LO_H, "#24170f");
      for (let r = 70; r > 0; r -= 5) disc(120, 62, r, "rgba(255,190,110,.02)");
      belt(120, 62, 1, { cols: 48 });
      blitLo();
      text("WAMPUM BELTS", WIDTH / 2, 230, 64, C.gold, { alpha: seg(lt, p2, p2 + 0.5) });
      body("still made and used today", WIDTH / 2, 800, 48, C.ink, { alpha: seg(lt, w(17), w(17) + 0.6) });
    } else {
      // as money: the strings on a shop counter fade, bead by bead; silver coins stay
      px(0, 0, LO_W, LO_H, "#3a2a1e"); px(0, 90, LO_W, 45, "#7a4a22"); px(0, 90, LO_W, 2, "#9a6a36");
      const kf = seg(lt, w(23), w(25.5) + 0.6);
      for (let r = 0; r < 6; r++) for (let i = 0; i < 12; i++) if (hash(r * 31 + i) > kf) wb(52 + i * 4 + (r % 2) * 2, 86 - r * 3, (r + i) % 5 === 0 ? "p" : "w");
      const kc = seg(lt, p3 + 0.3, p3 + 1.2);
      if (kc > 0) for (let i = 0; i < 3; i++) { disc(156 + i * 16, 84, 6, "#9aa3b5"); disc(156 + i * 16, 84, 5, "#c9d0dc"); }
      blitLo();
      where("AFTER 1661", "slowly out of use as money", lt - p3, d - p3);
      if (kc > 0) { for (let i = 0; i < 3; i++) text("NE", X(156 + i * 16), X(84) + 4, 34, "#5a6070", { shadow: false, alpha: kc }); }
      fadeOut(lt, d, 0.4);
    }
  };

  /* ================================================================ w9 · callback to Ulm Hollow; next: cowries */
  // "In Ulm Hollow, Wren found a cave. Here, the cave was an iron drill. Same story. Next: cowries, the money that got too heavy to carry."
  SC.wcallback = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(15.8);
    if (lt < split) {
      // left: Ulm Hollow · right: the iron drill as a "cave"
      px(0, 0, 119, LO_H, "#2a1f45"); px(0, 96, 119, 39, "#3d2f5a");
      px(121, 0, 119, LO_H, "#2e2117"); px(121, 104, 119, 31, "#8a5a2b"); px(119, 0, 2, LO_H, "#120d1d");
      cave(66, 34, 56, 62, t);
      const kw = seg(lt, w(3), w(3) + 0.3), kp = seg(lt, w(5.5), w(5.5) + 2.2);
      if (kw > 0) { lx.save(); lx.globalAlpha = kw; alien("wren", 26, 99, t); lx.restore(); }
      for (let i = 0; i < Math.floor(kp * 18); i++) { const u = clamp((kp * 18 - i) / 3, 0, 1); icon("pen", lerp(62, 40 + hash(i) * 70, u) - 6, lerp(80, 96 - hash(i + 2) * 6, u) - 12 - Math.sin(u * Math.PI) * 10); }
      // the drill inside a cave-shaped glow
      const kc = seg(lt, w(8), w(9.5));
      if (kc > 0) for (let a = 0; a < Math.PI; a += 0.03) px(180 + Math.cos(a) * 44, 104 - Math.sin(a) * 90 * kc, 2, 2, hash(Math.floor(a * 40)) < 0.5 ? "#5a4570" : "#4a3860");
      pumpDrill(180, 22, lt > w(9) ? (lt - w(9)) * Math.PI * 2 * 4 : 0, { L: 60, fr: 7, iron: true });
      const kb = seg(lt, w(9.5), w(13.5));
      heap(156, 110, Math.min(14, kb * 16), 10 + kb * 36);
      blitLo();
      text("ULM HOLLOW", X(60), 70, 44, C.pen, { alpha: seg(lt, w(1), w(1) + 0.4) });
      text("THE COAST, 1600s", X(180), 70, 44, C.gold, { alpha: seg(lt, w(7), w(7) + 0.4) });
      body("a cave of pentaja", X(60), 1010, 36, C.ink, { alpha: seg(lt, w(5), w(5) + 0.4) });
      body("an iron drill", X(180), 1010, 36, C.ink, { alpha: seg(lt, w(12), w(12) + 0.4) });
      const ke = seg(lt, w(14), w(14) + 0.25);
      if (ke > 0) { ctx.save(); ctx.translate(WIDTH / 2, 540); ctx.scale(pop(ke), pop(ke)); ctx.fillStyle = "#120d1d"; ctx.fillRect(-90, -90, 180, 180); ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.strokeRect(-90, -90, 180, 180); text("=", 0, 6, 150, C.gold); ctx.restore(); }
      if (lt > w(14.5)) label("MONEY GOT CHEAP TO MAKE", WIDTH / 2, 800, { k: seg(lt, w(14.5), w(14.5) + 0.3), size: 40, bg: C.gold });
    } else {
      // next: cowries. One shell, then many, then a heavy sack
      px(0, 0, LO_W, LO_H, C.bg); stars(50, C.line);
      px(0, 118, LO_W, 17, "#1a1328");
      const km = seg(lt, w(19), w(22.5)), drop = seg(lt, w(22.6), w(23.2));
      if (km <= 0) cowrie(120, 70, 3);
      else if (drop <= 0) { const n = Math.floor(km * 60); for (let i = 0; i < n; i++) cowrie(80 + hash(i) * 80, 40 + hash(i + 5) * 60, 1); }
      if (drop > 0) {
        const y = lerp(-20, 82, easeInOut(drop)), sq = drop >= 1 ? Math.max(0, 1 - (lt - w(23.2)) * 4) : 0;
        px(96 - sq * 4, y + sq * 4, 48 + sq * 8, 36 - sq * 4, "#b89a64"); px(100, y - 4, 40, 4, "#8c7650"); px(112, y - 8, 16, 4, "#8c7650"); px(104, y + 10, 32, 2, "#8c7650");
        for (let i = 0; i < 6; i++) cowrie(104 + i * 6, y + 4, 1);
        if (drop >= 1) for (let i = 0; i < 10; i++) px(90 + hash(i) * 60, 116 - hash(i + 3) * 6 * sq, 2, 1, "#4a3a6c");
      }
      blitLo();
      if (km <= 0) text("?", WIDTH / 2 + 180, 470, 120, C.dim);
      text("NEXT", WIDTH / 2, 150, 50, C.muted, { alpha: seg(lt, split, split + 0.4) });
      text("CHAPTER 4 · COWRIES", WIDTH / 2, 960, 80, C.gold, { alpha: seg(lt, w(17), w(17) + 0.4) });
      fadeOut(lt, d, 1.0);
    }
  };
})();
