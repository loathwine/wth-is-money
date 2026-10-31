/* EP 02 · scenes for the hook and chapter 1 (Yap).
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   W(n) = the moment word n of the narration is spoken, so visuals land on the words. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, rai, person, sea, sky, palm,
    canoe, schooner, pig, basket, icon, alien, text, body, label, stamp, where, blitLo, fadeOut, SC,
    ground, hut, cave, bead, cowrie, coin, axe, sack, chart } = T;
  const X = (x) => x * K;  // lo-res → hi-res coordinates for labels

  /* ================================================================ HOOK */
  // h1 · "Remember Rod? He found a cave full of pentaja... and the money of a whole village stopped working."
  SC.rodcave = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 96, "#2a1f45", "#3a2a5c");
    ground(96, "#3d2f5a", "#4a3a6c");
    cave(178, 34, 70, 64, t);
    // pentaja pouring out of the cave and piling up
    const spill = seg(lt, w(4), w(4) + 4.5), n = Math.floor(spill * 60);
    for (let i = 0; i < n; i++) {
      const born = w(4) + i * 0.075, age = lt - born;
      const tx = 160 - hash(i) * 110 * Math.sqrt(hash(i + 7)), ty = 98 - Math.floor(hash(i + 3) * 4) - (i > 30 ? 4 : 0) - (i > 48 ? 4 : 0);
      const fx = lerp(178, tx, clamp(age / 0.6, 0, 1)), fy = lerp(80, ty, clamp(age / 0.6, 0, 1)) - Math.sin(clamp(age / 0.6, 0, 1) * Math.PI) * 18;
      icon("pen", fx - 6, fy - 12);
    }
    alien("rod", 150, 99, t);
    blitLo();
    text("PREVIOUSLY · ULM HOLLOW", 70, 70, 36, C.muted, { align: "left", alpha: 1 - seg(lt, d - 0.5, d) });
    const k = seg(lt, w(9), w(9) + 2.5);
    if (k > 0) {
      chart(110, 170, 640, 380, [{ color: C.pen, pts: [0.06, 0.07, 0.06, 0.08, 0.07, 0.1, 0.18, 0.35, 0.55, 0.7, 0.85, 0.95] }], easeOut(k), { title: "PRICE OF A LUMFRUIT, IN PENTAJA" });
      stamp("BROKEN", 430, 420, seg(lt, w(15), w(15) + 0.25), { size: 70 });
    }
    fadeOut(lt, d, 0.3);
  };

  // h2 · "Rod is made up. But every money in history has had a Rod. A stone wheel. A glass bead. A seashell. A silver coin. Each time, ..."
  SC.montage = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 60; i++) px(hash(i) * LO_W, hash(i + 60) * LO_H, 1, 1, C.line);
    const solo = 1 - seg(lt, w(5), w(5) + 0.5);
    if (solo > 0) { lx.save(); lx.globalAlpha = solo; alien("rod", 120, 84, t); lx.restore(); }
    const slots = seg(lt, w(5), w(5) + 0.5);
    if (slots > 0) for (let i = 0; i < 4; i++) { const x = 36 + i * 56; lx.save(); lx.globalAlpha = slots * 0.8; px(x - 16, 46, 32, 32, C.panel); px(x - 15, 47, 30, 30, C.bg2); lx.restore(); }
    const items = [
      { at: w(13), draw: (x, y) => rai(x, y, 14), name: "STONE" },
      { at: w(16), draw: (x, y) => bead(x, y, 1.6), name: "GLASS BEAD" },
      { at: w(19), draw: (x, y) => cowrie(x, y, 1.8), name: "SHELL" },
      { at: w(21), draw: (x, y) => coin(x, y, 9, 1.4), name: "SILVER" },
    ];
    items.forEach((it, i) => {
      const k = seg(lt, it.at, it.at + 0.35); if (k <= 0) return;
      const x = 36 + i * 56, y = 62 - Math.round((1 - easeOut(k)) * 20);
      lx.save(); lx.globalAlpha = k; it.draw(x, y); lx.restore();
    });
    blitLo();
    if (solo > 0) stamp("MADE UP", WIDTH / 2, 520, seg(lt, w(2), w(2) + 0.25) * (solo > 0.5 ? 1 : 0), { size: 80, color: C.gold });
    if (slots > 0) for (let i = 0; i < 4; i++) if (lt < items[i].at) text("?", X(36 + i * 56), X(62), 90, C.dim, { alpha: slots });
    text("EVERY MONEY IN HISTORY", WIDTH / 2, 230, 56, C.gold, { alpha: seg(lt, w(5), w(5) + 0.5) });
    items.forEach((it, i) => {
      const k = seg(lt, it.at, it.at + 0.35); if (k <= 0) return;
      text(it.name, X(36 + i * 56), X(92), 34, C.ink, { alpha: k });
      stamp("CAVE!", X(36 + i * 56), X(62), seg(lt, w(24) + i * 0.3, w(24) + i * 0.3 + 0.22), { size: 46 });
    });
    fadeOut(lt, d, 0.3);
  };

  // h3 · "This is: Every Rod in History."
  SC.title = (lt, d, t) => {
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    for (let i = 0; i < 80; i++) { const tw = Math.sin(t * 2 + i) > 0.3; if (tw) px(hash(i) * LO_W, hash(i + 80) * LO_H, 1, 1, i % 3 ? C.line : C.pen); }
    alien("rod", 196, 118, t);
    icon("pen", 204, 100); icon("pen", 182, 106);
    blitLo();
    const k = seg(lt, 0.3, 0.9);
    ctx.save(); ctx.globalAlpha = k;
    text("EVERY ROD", WIDTH / 2, 400, 150, C.gold, { alpha: k });
    text("IN HISTORY", WIDTH / 2, 570, 150, C.gold, { alpha: k });
    ctx.restore();
    text("WTH IS MONEY? · EPISODE 2", WIDTH / 2, 730, 40, C.muted, { alpha: seg(lt, 1.0, 1.6) });
    fadeOut(lt, d, 0.5);
  };

  /* ================================================================ CHAPTER 1 · YAP */
  // y1 · map: Yap and Palau; a canoe makes the crossing
  const YAP = [176, 34], PALAU = [58, 104];
  function island(cx, cy, r, t, o = {}) {
    disc(cx, cy, r + 3, "#2f6fa8");                   // shallows
    disc(cx, cy, r + 1, C.sand);
    disc(cx, cy, r - 1, C.jungle);
    for (let i = 0; i < 6; i++) px(cx - r + 2 + hash(i + cx) * (2 * r - 4), cy - r + 2 + hash(i + cy) * (2 * r - 4), 2, 2, C.jungle2);
  }
  SC.map = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sea(t, 0, { speed: 0.4 });
    island(...YAP, 9, t);
    island(PALAU[0], PALAU[1], 7, t); island(PALAU[0] + 9, PALAU[1] - 10, 4, t); island(PALAU[0] - 8, PALAU[1] + 10, 3, t);
    // the route, dotted, drawn in as the narration gets there
    const kr = seg(lt, w(19), w(30));
    for (let i = 0; i <= 40 * kr; i++) {
      const u = i / 40, x = lerp(YAP[0] - 8, PALAU[0] + 10, u), y = lerp(YAP[1] + 8, PALAU[1] - 8, u) + Math.sin(u * Math.PI) * 10;
      if (i % 2 === 0) px(x, y, 2, 1, C.foam);
    }
    if (kr > 0) {
      const u = easeInOut(kr), x = lerp(YAP[0] - 8, PALAU[0] + 10, u), y = lerp(YAP[1] + 8, PALAU[1] - 8, u) + Math.sin(u * Math.PI) * 10;
      canoe(x, y - 2, { w: 12, crew: 1, t });
    }
    blitLo();
    where("WESTERN PACIFIC", "a few hundred years ago, and up to around 1900", lt, d);
    label("YAP", X(YAP[0]) + 40, X(YAP[1]) - 140, { k: seg(lt, w(3), w(3) + 0.4), size: 44 });
    label("PALAU", X(PALAU[0]) + 30, X(PALAU[1]) + 170, { k: seg(lt, w(33), w(33) + 0.4), size: 44 });
    label("~450 KM OF OPEN OCEAN", 1180, 660, { k: seg(lt, w(26), w(26) + 0.4), size: 34, bg: C.gold });
  };

  // y2 · quarrying with shell tools, then the voyage home (not all rafts make it)
  SC.quarry = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(21.5);
    if (lt < split) {
      sky(0, 108, "#9ad4f2", "#d6effa");
      // pale limestone cliff
      for (let y = 18; y < 110; y++) { const x1 = 120 + Math.round(Math.sin(y * 0.3) * 3) + (110 - y) * 0.4; px(x1, y, LO_W - x1, 1, y % 7 ? "#ddd5bf" : "#cfc6ad"); }
      ground(108, "#b8ad8e", "#a39878");
      palm(30, 108, t, 22); palm(52, 108, t, 16);
      // the wheel being carved out of the rock face
      const carve = seg(lt, w(5), w(13));
      const r = 15, cx = 172, cy = 74;
      if (carve > 0) {
        lx.save(); lx.globalAlpha = 0.25 + 0.75 * carve; rai(cx, cy, r, { hole: carve < 0.9 ? C.stone : C.stone3 }); lx.restore();
        if (carve < 1) for (let i = 0; i < 3; i++) { const a = t * 9 + i * 2; px(cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2), 1, 1, "#fff"); }
      }
      if (seg(lt, w(15), w(15) + 0.3) > 0) disc(cx, cy, 3, "#6d6656");
      person(146, 108, { t, arm: "up", cloth: "#c0392b", face: 1 });
      person(196, 108, { t: t + 0.4, arm: "up", cloth: "#d68910", face: -1 });
      blitLo();
      where("PALAU", "quarrying with shell tools", lt, split);
      label("RAI", X(172), X(46), { k: seg(lt, w(19), w(19) + 0.35), size: 54, bg: C.gold });
    } else {
      const lt2 = lt - split, storm = seg(lt, w(29), w(29) + 1.2);
      sky(0, 54, storm > 0.5 ? "#41506b" : "#e9a86a", storm > 0.5 ? "#5b6b85" : "#f6cf8e");
      sea(t, 54, { speed: 1 + storm * 2 });
      const sink = seg(lt, w(31), w(34) + 0.8);
      canoe(30 + lt2 * 9, 76 + Math.sin(t * 2) * 1.5, { stone: true, stoneR: 6, t, tilt: storm * 3 * Math.sin(t * 3) });
      canoe(130 + lt2 * 6, 98 + Math.sin(t * 2 + 1) * 1.5 + sink * 6, { stone: true, stoneR: 7, stoneAlpha: 1 - sink, t, tilt: storm * (6 + sink * 10) * Math.sin(t * 2.2), crew: 2 });
      if (storm > 0) for (let i = 0; i < 90 * storm; i++) px((hash(i) * LO_W + t * 60) % LO_W, (hash(i + 9) * LO_H + t * 140) % LO_H, 1, 3, "rgba(200,220,255,.5)");
      if (sink > 0) for (let i = 0; i < 6; i++) px(140 + lt2 * 6 + Math.sin(i + t * 4) * 6, 104 + sink * 20 + i * 2, 1, 1, C.foam);
      blitLo();
    }
  };

  // y3 · what a stone was worth
  SC.prices = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 96, "#8fd0f0", "#cdebf8");
    ground(96, C.sand, C.sand2);
    palm(14, 98, t, 26); palm(226, 98, t, 22); hut(52, 97);
    const hi = seg(lt, w(24), w(24) + 0.4);
    rai(96, 86, 7, { dull: hi > 0 }); rai(128, 80, 13); rai(168, 72, 22, { dull: hi > 0 });
    if (hi > 0) { const glow = 0.5 + 0.5 * Math.sin(t * 6); px(113, 63, 30, 1, `rgba(255,210,63,${glow})`); }
    // what it buys: a pig, or fifty baskets
    const kp = seg(lt, w(33), w(33) + 0.4), kb = seg(lt, w(36), w(40));
    if (kp > 0) pig(Math.round(lerp(250, 186, easeOut(kp))), 108);
    for (let i = 0; i < Math.floor(kb * 50); i++) basket(8 + (i % 17) * 7, 128 - Math.floor(i / 17) * 5);
    blitLo();
    where("YAP · VALUE", "", lt, d);
    const rows = [["SIZE", w(8)], ["WHITENESS", w(11)], ["HOW HARD IT WAS TO GET HOME", w(17)]];
    rows.forEach(([str, at], i) => {
      const k = seg(lt, at, at + 0.3);
      if (k > 0) body("✓ " + str, 1150, 210 + i * 64, 44, C.ink, { align: "left", alpha: k * (1 - 0.6 * hi) });
    });
    label("~2 FEET ACROSS", X(128), X(52), { k: hi, size: 34 });
    if (kp > 0) label("= 1 BIG PIG", X(196), X(100) - 30, { k: kp, size: 32, bg: "#f2a7b8" });
    if (kb > 0) label("OR 50 BASKETS OF FOOD", 520, 900, { k: seg(lt, w(36), w(36) + 0.3), size: 34, bg: C.gold });
  };

  // y4 · a ledger in everyone's heads; the fortune at the bottom of the sea
  SC.ledger = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(24.5);
    if (lt < split) {
      sky(0, 100, "#8fd0f0", "#cdebf8"); ground(100, C.sand, C.sand2);
      hut(34, 100, "#3f6fb8"); hut(206, 100, "#c0392b");
      rai(120, 70, 30);
      person(84, 101, { t, cloth: "#3f6fb8" }); person(158, 101, { t, cloth: "#c0392b", face: -1 });
      // villagers watching: the whole village is the ledger
      for (let i = 0; i < 6; i++) person(20 + i * 40 + (i > 2 ? 20 : 0), 128, { t: t + i, cloth: ["#d68910", "#2e86c1", "#7d3c98", "#c0392b", "#16a085", "#d68910"][i], face: i < 3 ? 1 : -1 });
      blitLo();
      const flip = seg(lt, w(15), w(15) + 0.4);
      const col = flip < 0.5 ? "#3f6fb8" : "#c0392b";
      ctx.save(); ctx.translate(X(120), X(30)); const sc = 1 + 0.25 * Math.sin(flip * Math.PI); ctx.scale(sc, sc);
      ctx.fillStyle = "#fff8e8"; ctx.fillRect(-190, -42, 380, 84); ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 6; ctx.strokeRect(-190, -42, 380, 84);
      text("OWNER:", -40, 4, 36, "#1a1026", { shadow: false }); ctx.fillStyle = col; ctx.fillRect(70, -24, 80, 48);
      ctx.restore();
      if (lt > w(17)) for (let i = 0; i < 6; i++) { const k = seg(lt, w(17) + i * 0.15, w(17) + i * 0.15 + 0.3); label("!", X(20 + i * 40 + (i > 2 ? 20 : 0)), X(104), { k, size: 30 }); }
      label("DISTANCE MOVED: 0 CM", 1440, 960, { k: seg(lt, w(19), w(19) + 0.4), size: 30, bg: C.gold });
    } else {
      // cross-section: the stone on the seabed, the family's house on the shore above
      sky(0, 40, "#8fd0f0", "#cdebf8");
      px(0, 40, LO_W, LO_H - 40, "#1d4f8a");
      for (let y = 40; y < LO_H; y++) px(0, y, LO_W, 1, `rgba(5,15,40,${(y - 40) / 140})`);
      for (let i = 0; i < 30; i++) px((hash(i) * LO_W + t * 4) % LO_W, 41, 4, 1, C.seaHi);
      for (let x = 0; x < 80; x++) px(x, 30 + Math.max(0, (x - 40) * 0.3), 1, 40, C.sand);   // shore
      hut(28, 34, "#3f6fb8"); palm(60, 36, t, 14);
      for (let x = 0; x < LO_W; x++) px(x, 122 + Math.round(Math.sin(x * 0.2) * 1.5), 1, 20, "#3a3324");
      const sinkK = seg(lt, split, split + 2.4);
      rai(160, lerp(46, 108, easeInOut(sinkK)), 14, { alpha: 0.9 });
      for (let i = 0; i < 5; i++) { const fx = (200 + t * (6 + i) * (i % 2 ? 1 : -1) + i * 50) % 260 - 10; px(fx, 70 + i * 9, 4, 2, "#e8a33c"); px(fx + (i % 2 ? -1 : 4), 70 + i * 9, 1, 2, "#e8a33c"); }
      blitLo();
      label("A FAMILY FORTUNE", X(160), 690, { k: seg(lt, w(26), w(26) + 0.4), size: 34 });
      stamp("STILL COUNTED", 1250, 470, seg(lt, w(44), w(44) + 0.25), { size: 54, color: C.leaf, rot: -0.1 });
    }
  };

  // (not in the cut: kept for the gold finale, Friedman's Yap ↔ Banque de France parallel)
  // y5 · German fines: black crosses, then fixed roads
  SC.crosses = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 92, "#8fd0f0", "#cdebf8"); ground(92, C.sand, C.sand2);
    const fixed = seg(lt, w(23), w(23) + 1.2), erase = seg(lt, w(26), w(26) + 0.8);
    // the path along the bottom: rough coral blocks, then smooth
    for (let x = 0; x < LO_W; x += 6) {
      const r = (1 - fixed) * (hash(x) * 3);
      px(x, 116 + r, 5, 8 - r, fixed > hash(x + 1) ? "#d9cfae" : "#a8a089");
    }
    const xs = [40, 92, 144, 196];
    const walk = seg(lt, w(12), w(18) + 0.6);
    const ox = lerp(20, 210, walk);
    xs.forEach((x, i) => rai(x, 74, 15, { cross: ox > x + 4 && erase < 1 && !(erase > 0 && hash(i) < erase) }));
    if (walk > 0 && walk < 1) person(ox, 110, { t, hat: "pith", walk: true, arm: "up" });
    else if (walk >= 1) person(210, 110, { t, hat: "pith" });
    if (fixed > 0) for (let i = 0; i < 3; i++) person(30 + i * 70 + fixed * 20, 128, { t: t + i, arm: "up", cloth: ["#c0392b", "#d68910", "#2e86c1"][i] });
    blitLo();
    where("YAP · GERMAN COLONY", "1899–1914", lt, d);
    label("STONES MOVED: 0", 1500, 140, { k: seg(lt, w(19), w(19) + 0.4), size: 32, bg: C.gold });
    stamp("FINE PAID", WIDTH / 2, 260, seg(lt, w(27), w(27) + 0.25), { size: 70, color: C.leaf });
  };

  // y6 · O'Keefe's schooner and his offer
  SC.schooner = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sky(0, 56, "#8fd0f0", "#cdebf8"); sea(t, 56);
    // Yap on the right
    for (let x = 170; x < LO_W; x++) px(x, 50 - Math.min(14, (x - 170) * 0.5), 1, 30, C.sand);
    for (let x = 180; x < LO_W; x++) px(x, 40 - Math.min(10, (x - 180) * 0.4), 1, 14, C.jungle);
    palm(196, 46, t, 18); palm(220, 44, t, 14); hut(214, 50);
    const wreck = 1 - seg(lt, w(13), w(14) + 0.5);
    if (wreck > 0) { lx.save(); lx.globalAlpha = wreck; px(120, 84, 22, 3, C.wood2); px(128, 76, 2, 9, C.wood2); px(108, 92, 8, 2, C.wood); lx.restore(); }
    const arrive = seg(lt, w(15), w(20));
    if (arrive > 0) schooner(lerp(-40, 110, easeOut(arrive)), 80, t, { stones: lt > w(31) ? 5 : 0 });
    // the deal: stones go to the island, dried coconut goes to the ship
    const deal = seg(lt, w(32), w(36));
    for (let i = 0; i < 3; i++) { const u = (deal * 3 - i * 0.4); if (u > 0 && u < 1) rai(lerp(120, 200, u), 60 - Math.sin(u * Math.PI) * 14, 3); }
    const coco = seg(lt, w(40), w(44));
    for (let i = 0; i < 3; i++) { const u = (coco * 3 - i * 0.4); if (u > 0 && u < 1) sack(lerp(196, 120, u), 58 - Math.sin(u * Math.PI) * 14); }
    blitLo();
    where("1871 · DAVID O'KEEFE", "Irish-American sea captain", lt, d);
    const kt = seg(lt, w(21), w(21) + 0.35);
    if (kt > 0) { label("SHIP + IRON TOOLS", 700, 230, { k: kt, size: 34, bg: C.gold }); }
    if (deal > 0) label("STONES →", 1300, 330, { k: seg(lt, w(32), w(32) + 0.3), size: 30 });
    if (coco > 0) label("← DRIED COCONUT", 1260, 420, { k: seg(lt, w(40), w(40) + 0.3), size: 30 });
  };

  // y7 · the flood of stones, 1840 → 1929
  SC.flood = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    sea(t, 0, { speed: 0.3 });
    const cx = 78, cy = 68;
    disc(cx, cy, 52, "#2f6fa8"); disc(cx, cy, 49, C.sand); disc(cx, cy, 45, C.jungle);
    for (let i = 0; i < 14; i++) px(cx - 40 + hash(i) * 80, cy - 40 + hash(i + 20) * 80, 3, 3, C.jungle2);
    const k = seg(lt, w(9), w(19));
    const n = 6 + Math.floor(easeInOut(k) * 300);
    for (let i = 0; i < n; i++) {
      const a = hash(i + 3) * Math.PI * 2, r = Math.sqrt(hash(i + 11)) * 42;
      px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2, i < 6 ? C.gold : C.stone);
    }
    // a twelve-foot stone with a person for scale
    const kg = seg(lt, w(22), w(22) + 0.6);
    if (kg > 0) { ground(118, "#2a4a2a", "#335a33"); lx.save(); lx.globalAlpha = kg; rai(186, 118 - 46, 44); person(222, 120, { t }); lx.restore(); }
    blitLo();
    const year = Math.round(lerp(1840, 1929, easeInOut(k)));
    const count = k < 0.05 ? "RARE" : (k >= 1 ? "13,000+" : Math.round(easeInOut(k) * 13000).toLocaleString("en-US"));
    text(String(year), 1420, 200, 110, C.gold, { alpha: 1 - kg });
    text("STONES ON YAP: " + count, 1420, 320, 44, C.ink, { alpha: 1 - kg });
    if (kg > 0) label("12 FEET", X(186), X(18), { k: kg, size: 40, bg: C.gold });
  };

  // y8 · the discount: old stones vs O'Keefe stones
  SC.discount = (lt, d, t, s) => {
    const w = (n) => word(s, n), split = w(8);
    if (lt < split) {
      sky(0, 96, "#2a1f45", "#3a2a5c"); ground(96, "#3d2f5a", "#4a3a6c");
      cave(150, 34, 70, 64, t); alien("rod", 120, 99, t);
      for (let i = 0; i < 20; i++) icon("pen", 60 + hash(i) * 120, 86 - hash(i + 4) * 6);
      blitLo();
      label("SOUND FAMILIAR?", WIDTH / 2, 200, { k: seg(lt, 0.2, 0.6), size: 50 });
      return;
    }
    sky(0, 96, "#8fd0f0", "#cdebf8"); ground(96, C.sand, C.sand2);
    rai(70, 76, 18); rai(170, 76, 18);
    canoe(70, 40, { w: 18, crew: 1, t }); schooner(170, 42, t);
    // price bars made of food baskets
    const kb = seg(lt, w(23), w(26));
    const old = Math.floor(18 * easeOut(kb)), neu = Math.floor(6 * easeOut(kb));
    for (let i = 0; i < old; i++) basket(48 + (i % 6) * 8, 128 - Math.floor(i / 6) * 5);
    for (let i = 0; i < neu; i++) basket(148 + (i % 6) * 8, 128 - Math.floor(i / 6) * 5);
    blitLo();
    text("OLD STONE", X(70), 812, 40, C.ink, { alpha: seg(lt, split, split + 0.4) });
    body("by canoe · cost lives", X(70), 856, 30, C.ink, { alpha: seg(lt, split, split + 0.4) });
    text("O'KEEFE STONE", X(170), 812, 40, C.ink, { alpha: seg(lt, split + 0.3, split + 0.7) });
    body("by ship · easy", X(170), 856, 30, C.ink, { alpha: seg(lt, split + 0.3, split + 0.7) });
    if (kb > 0) stamp("LESS", X(214), X(76), seg(lt, w(25), w(25) + 0.25), { size: 64 });
    stamp("SPOTTED", WIDTH / 2, 520, seg(lt, w(38), w(38) + 0.25), { size: 80, color: C.leaf });
    body("Source: Bryan, “Island Money”, Cleveland Fed (2004), citing Gillilland (1975)", WIDTH / 2, 36, 24, C.ink, { alpha: 0.7 * seg(lt, w(14), w(14) + 0.5) });
  };

  // y9 · back to Ulm Hollow; teaser
  SC.callback = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    ground(110, "#2a2140", "#33284d");
    const tease = seg(lt, w(24), w(24) + 0.5), tease2 = seg(lt, w(24) + 0.5, w(24) + 1.1);
    lx.save(); lx.globalAlpha = 1 - tease;
    alien("rod", 150, 112, t); icon("pen", 156, 92);
    alien("hesk", 190, 112, t); icon("zir", 196, 92);
    lx.restore();
    if (tease2 > 0) { lx.save(); lx.globalAlpha = tease2; bead(120, 66, 3); lx.restore(); }
    blitLo();
    const kc = seg(lt, 0.2, w(9));
    if (tease < 1) {
      ctx.save(); ctx.globalAlpha = 1 - tease;
      chart(100, 140, 760, 460, [
        { color: C.pen, pts: [0.05, 0.2, 0.45, 0.75, 0.9, 0.95, 0.6, 0.3, 0.12, 0.05, 0.03] },
        { color: C.zir, pts: [0.05, 0.08, 0.1, 0.15, 0.2, 0.22, 0.4, 0.6, 0.72, 0.78, 0.8] },
      ], easeOut(kc), { title: "WHO TAKES IT AS MONEY · ULM HOLLOW" });
      ctx.restore();
      label("EASY TO MAKE → STOPS BEING MONEY", WIDTH / 2, 700, { k: seg(lt, w(10), w(10) + 0.4) * (1 - tease), size: 40, bg: C.gold });
      label("YAP: ✓ SPOTTED IT", 1460, 300, { k: seg(lt, w(21), w(21) + 0.4) * (1 - tease), size: 36, bg: C.leaf });
    }
    if (tease2 > 0) { text("NEXT", WIDTH / 2, 200, 50, C.muted, { alpha: tease2 }); text("GLASS BEADS", WIDTH / 2, 880, 90, C.gold, { alpha: tease2 }); }
    fadeOut(lt, d, 1.0);
  };
})();
