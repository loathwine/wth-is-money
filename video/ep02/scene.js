/* EP 02 · Every Rod in History: the video engine and shared drawing kit.
   window.TIMELINE = [{ id, scene, t0, t1, voice, speech }]  (seconds; built by build.py from the narration clips)
   window.renderFrame(t) draws the frame at time t. Everything is a pure function of t, so renders are repeatable.
   Pixel art goes on a 240×135 canvas (`lx`) that is scaled ×8; crisp text is drawn on top at 1920×1080. */
(function () {
  "use strict";
  const cv = document.getElementById("c"), ctx = cv.getContext("2d");
  const W = 1920, H = 1080, LO_W = 240, LO_H = 135, K = W / LO_W;
  const lo = document.createElement("canvas"); lo.width = LO_W; lo.height = LO_H;
  const lx = lo.getContext("2d");

  // EP 01's "Bazaar" palette, plus ocean and island colours
  const C = { bg: "#120d1d", bg2: "#1a1328", panel: "#231a36", line: "#3a2d5c", ink: "#f4ecff", muted: "#a99cc8", dim: "#6c5f93",
    gold: "#ffd23f", pen: "#ff6fb5", zir: "#4de1e8", leaf: "#8fd16a", bad: "#ff5a5a",
    sea: "#1d4f8a", sea2: "#173f70", seaHi: "#4f8fd1", foam: "#cfe6ff", sand: "#e8d39a", sand2: "#c9b177", jungle: "#2f7d4a", jungle2: "#1f5a35",
    stone: "#e9e3d2", stone2: "#bdb5a0", stone3: "#8c8471", wood: "#8a5a2b", wood2: "#5e3b1a", skin: "#8a5534", skin2: "#6b3f24", sky: "#7fc4f0", sky2: "#bfe3f7" };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const hexA = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;
  // pop: 0 → 1 with a small overshoot, for things that appear
  const pop = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 + 0.25 * Math.sin(k * Math.PI) * (1 - k) * 2 - Math.pow(1 - k, 3));

  /* ---------- lo-res pixel helpers (coordinates in the 240×135 grid) ---------- */
  const px = (x, y, w, h, c) => { lx.fillStyle = c; lx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function disc(cx, cy, r, c) {  // a filled pixel circle
    lx.fillStyle = c;
    for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); lx.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); }
  }
  // a rai stone, face-on: white limestone wheel with a hole, shaded on the right
  function rai(cx, cy, r, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0) return;
    lx.save(); lx.globalAlpha = a;
    disc(cx + 1, cy + 1, r, "rgba(0,0,0,.35)");
    disc(cx, cy, r, o.dull ? C.stone2 : C.stone);
    for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); px(cx + hw - Math.max(1, r * 0.25), cy + y, Math.max(1, r * 0.25), 1, o.dull ? C.stone3 : C.stone2); }
    if (r >= 3) disc(cx, cy, Math.max(1, Math.round(r * 0.22)), o.hole || C.stone3);
    if (o.cross) { const s = Math.round(r * 0.6); for (let i = -s; i <= s; i++) { px(cx + i, cy + i, 2, 2, "#141018"); px(cx + i, cy - i, 2, 2, "#141018"); } }
    lx.restore();
  }
  // a simple pixel islander (real people, so no aliens): skin, wrap, optional carried thing
  function person(x, feet, o = {}) {
    const t = o.t || 0, bob = o.walk ? (Math.floor(t * 8) % 2) : 0, f = o.face || 1;
    x = Math.round(x); feet = Math.round(feet);
    px(x - 3, feet - 1, 6, 1, "rgba(0,0,0,.3)");
    px(x - 2, feet - 4 + (o.walk ? -bob : 0), 1, 3, o.skin2 || C.skin2); px(x + 1, feet - 4 + (o.walk ? bob - 1 : 0), 1, 3, o.skin2 || C.skin2);
    px(x - 2, feet - 7, 4, 3, o.cloth || "#c0392b");                 // wrap
    px(x - 2, feet - 11, 4, 4, o.skin || C.skin);                     // torso
    px(x - 2, feet - 15, 4, 4, o.skin || C.skin);                     // head
    px(x - 2, feet - 16, 4, 1, o.hair || "#1a1010");
    px(x + (f > 0 ? 1 : -2), feet - 14, 1, 1, "#1a1010");             // eye
    if (o.hat === "pith") { px(x - 4, feet - 17, 8, 1, "#e8e0c8"); px(x - 2, feet - 19, 4, 2, "#e8e0c8"); px(x - 2, feet - 11, 4, 4, "#e8e0c8"); px(x - 2, feet - 7, 4, 3, "#d6cfb4"); }
    if (o.hat === "cap") { px(x - 3, feet - 17, 6, 2, "#1d2440"); px(x + (f > 0 ? 2 : -4), feet - 16, 3, 1, "#1d2440"); px(x - 2, feet - 11, 4, 4, "#2b3560"); px(x - 2, feet - 7, 4, 3, "#2b3560"); }
    if (o.arm === "up") px(x + f * 2, feet - 15 - (Math.floor(t * 6) % 2), 1, 4, o.skin || C.skin);
    else px(x + f * 2, feet - 10, 1, 4, o.skin || C.skin);
  }
  function sea(t, top = 0, o = {}) {
    px(0, top, LO_W, LO_H - top, o.c || C.sea);
    for (let i = 0; i < 70; i++) {  // drifting wave dashes
      const y = top + 2 + Math.floor(hash(i) * (LO_H - top - 3));
      const x = ((hash(i + 99) * LO_W + t * (6 + hash(i + 7) * 6) * (o.speed ?? 1)) % (LO_W + 20)) - 10;
      px(x, y, 3 + Math.floor(hash(i + 3) * 4), 1, hash(i + 5) < 0.6 ? (o.c2 || C.sea2) : (o.hi || C.seaHi));
    }
  }
  function sky(top, bottom, c1 = C.sky, c2 = C.sky2) {
    const n = 6;
    for (let i = 0; i < n; i++) px(0, top + (bottom - top) * i / n, LO_W, (bottom - top) / n + 1, i < n / 2 ? c1 : c2);
  }
  function palm(x, base, t, h = 16) {
    for (let i = 0; i < h; i++) px(x + Math.round(Math.sin(i / h * 1.4) * 3), base - i, 2, 1, i % 3 ? C.wood : C.wood2);
    const tx = x + Math.round(Math.sin(1.4) * 3), ty = base - h, sw = Math.round(Math.sin(t * 1.5 + x) * 1);
    for (const [dx, dy] of [[-6, 1], [-4, -1], [5, 1], [3, -2], [0, -3]]) {
      const steps = 5;
      for (let s = 0; s <= steps; s++) px(tx + Math.round(dx * s / steps) + (s > 3 ? sw : 0), ty + Math.round(dy * s / steps + (s > 2 ? (s - 2) * 0.6 : 0)), 2, 1, s % 2 ? C.jungle : C.leaf);
    }
  }
  // canoe or raft, with a stone on board; `tilt` in pixels (storms)
  function canoe(x, y, o = {}) {
    x = Math.round(x); y = Math.round(y);
    const w = o.w || 26, tilt = Math.round(o.tilt || 0);
    for (let i = 0; i < w; i++) { const dy = Math.round(tilt * (i / w - 0.5)); px(x - w / 2 + i, y + dy, 1, 2, C.wood); px(x - w / 2 + i, y + 2 + dy, 1, 1, C.wood2); }
    px(x - w / 2 + 2, y + 5, w - 4, 1, C.wood2);                // outrigger
    if (o.stone) rai(x + (o.stoneDx || 0), y - (o.stoneR || 5) + 1, o.stoneR || 5, { alpha: o.stoneAlpha ?? 1 });
    for (let i = 0; i < (o.crew ?? 2); i++) person(x - w / 2 + 4 + i * (w - 8), y, { t: o.t, arm: "up", cloth: ["#c0392b", "#d68910", "#2e86c1"][i % 3], face: 1 });
  }
  function schooner(x, y, t, o = {}) {
    x = Math.round(x); y = Math.round(y + Math.sin(t * 1.6) * 1);
    const L = 64;
    for (let i = 0; i < L; i++) { const d = i < 8 ? 8 - i : i > L - 6 ? i - (L - 6) : 0; px(x - L / 2 + i, y + Math.floor(d / 2), 1, 7 - Math.floor(d / 2), i % 9 === 0 ? "#3b2615" : "#4a2f19"); }
    px(x - L / 2 + 2, y + 2, L - 6, 1, "#c99a4a");
    for (const [mx, mh] of [[-12, 40], [12, 46]]) {
      px(x + mx, y - mh, 2, mh, "#3b2615");
      px(x + mx - 13, y - mh + 4, 13, mh - 10, "#f2ead6"); px(x + mx - 13, y - mh + 4, 1, mh - 10, "#d6ccb0");
      px(x + mx + 2, y - mh + 8, 9, mh - 18, "#f2ead6");
    }
    px(x + L / 2 - 2, y - 2, 14, 1, "#3b2615");                  // bowsprit
    for (let i = 0; i < (o.stones || 0); i++) rai(x - 22 + i * 9, y - 4 - (i % 2) * 2, 4);
  }
  function pig(x, y) { px(x, y, 9, 5, "#f2a7b8"); px(x + 8, y + 1, 3, 3, "#f2a7b8"); px(x + 10, y + 2, 1, 1, "#c96b84"); px(x + 1, y + 5, 1, 2, "#c96b84"); px(x + 6, y + 5, 1, 2, "#c96b84"); px(x + 8, y + 1, 1, 1, "#1a1010"); px(x - 1, y + 1, 1, 1, "#c96b84"); }
  function basket(x, y) { px(x, y, 6, 4, "#b8862e"); px(x, y, 6, 1, "#d9a84a"); px(x + 1, y - 1, 2, 1, "#5fbf4a"); px(x + 3, y - 2, 2, 2, "#8a6a3a"); }
  // EP 01 goods and villagers, straight from the game's art
  const icon = (g, x, y, s = 1) => { lx.imageSmoothingEnabled = false; lx.drawImage(Art.iconCanvas[g], Math.round(x), Math.round(y), 12 * s, 12 * s); };
  const alien = (id, x, feet, t) => Art.drawAlien(lx, x, feet, id, t);

  /* ---------- hi-res overlay text ---------- */
  function text(str, x, y, size, color, o = {}) {
    ctx.save();
    ctx.globalAlpha *= o.alpha ?? 1;
    ctx.font = `${o.weight || ""} ${size}px ${o.font || "Silkscreen"}`.trim();
    ctx.textAlign = o.align || "center"; ctx.textBaseline = "middle";
    if (o.shadow !== false) { ctx.fillStyle = "rgba(0,0,0,.65)"; ctx.fillText(str, x + size * 0.08, y + size * 0.08); }
    ctx.fillStyle = color; ctx.fillText(str, x, y);
    ctx.restore();
  }
  const body = (str, x, y, size, color, o = {}) => text(str, x, y, size, color, { font: "'Space Grotesk'", weight: 700, ...o });
  // a label box in hi-res pixels; k = appear progress
  function label(str, x, y, o = {}) {
    const k = o.k ?? 1; if (k <= 0) return;
    const size = o.size || 34;
    ctx.save(); ctx.font = `${size}px Silkscreen`;
    const w = ctx.measureText(str).width + size * 1.1, h = size * 1.7;
    const s = pop(k);
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
    ctx.fillStyle = o.bg || "#fff8e8"; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = o.color || "#1a1026"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(str, 0, 4);
    ctx.restore();
  }
  // a big rubber stamp, slammed on at k
  function stamp(str, x, y, k, o = {}) {
    if (k <= 0) return;
    const s = k < 1 ? 1 + 1.5 * Math.pow(1 - k, 2) : 1, a = Math.min(1, k * 2);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.18); ctx.scale(s, s); ctx.globalAlpha = a * 0.92;
    const size = o.size || 64; ctx.font = `${size}px Silkscreen`;
    const w = ctx.measureText(str).width + size * 0.9, h = size * 1.6, c = o.color || C.bad;
    ctx.strokeStyle = c; ctx.lineWidth = size * 0.13; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = c; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(str, 0, size * 0.07);
    ctx.restore();
  }
  // corner caption: place / year
  function where(str, sub, lt, d) {
    const a = seg(lt, 0.2, 0.7) * (1 - seg(lt, d - 0.6, d));
    if (a <= 0) return;
    text(str, 70, 70, 40, C.gold, { align: "left", alpha: a });
    if (sub) body(sub, 72, 122, 30, C.ink, { align: "left", alpha: a });
  }
  function blitLo() { ctx.imageSmoothingEnabled = false; ctx.drawImage(lo, 0, 0, W, H); }
  const fadeOut = (lt, d, len = 0.6) => { const k = seg(lt, d - len, d); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } };

  // when (seconds into the scene) word n of the narration is spoken, assuming an even pace; n may be fractional
  function word(s, n) {
    const words = s.text.split(/\s+/).filter(Boolean).length || 1;
    const lead = s.voice - s.t0, clip = s.speech - lead;
    return lead + clip * clamp(n / words, 0, 1);
  }
  const SC = {};
  window.TR = { word, ctx, lx, W, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, hexA, pop, px, disc, rai, person, sea, sky, palm, canoe,
    schooner, pig, basket, icon, alien, text, body, label, stamp, where, blitLo, fadeOut, SC };

  /* ---------- frame ---------- */
  window.renderFrame = function (t) {
    const TL = window.TIMELINE;
    let s = TL[TL.length - 1];
    for (const x of TL) if (t >= x.t0 && t < x.t1) { s = x; break; }
    const lt = t - s.t0, d = s.t1 - s.t0;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalAlpha = 1;
    lx.fillStyle = C.bg; lx.fillRect(0, 0, LO_W, LO_H);
    try { (SC[s.scene] || (() => blitLo()))(lt, d, t, s); }
    catch (e) { console.error(`scene ${s.id} @ ${t.toFixed(2)}s: ${e.message}`); window.__sceneErrors = (window.__sceneErrors || 0) + 1; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    const dip = s.dip ? 1 - seg(lt, 0, 0.5) : 0;   // "dip": true in narration.json fades a segment in from black
    const a = Math.max(dip, 1 - seg(t, 0, 0.5));
    if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); }
  };
  window.sceneReady = Promise.all(["40px Silkscreen", "700 30px 'Space Grotesk'"].map((f) => document.fonts.load(f))).then(() => true);
})();
