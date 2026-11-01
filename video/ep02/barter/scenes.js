/* EP 01 intro movie · "How the market works" (Ulm Hollow, before money).
   Built on the EP 02 engine (scene.js, props.js). The villagers, faces and goods are EP 01's own art (lessons/01-barter/art.js,
   loaded by scene.html as window.Art), so the movie looks like the game.
   Each scene is SC[name](lt, d, t, s): lt = seconds into the segment, d = its length, s = the timeline entry.
   w(n) = the moment word n of the narration is spoken (see SCRIPT.md). No spoilers: no cave, no prices, no inflation. */
(function () {
  "use strict";
  const T = window.TR;
  const { word, ctx, lx, W: WIDTH, H, LO_W, LO_H, K, C, clamp, seg, easeOut, easeInOut, lerp, hash, pop, px, disc, text, body, label, blitLo, fadeOut, SC } = T;
  const X = (x) => x * K;  // lo-res → hi-res

  /* ---------------------------------------------------------------- EP 01 colours */
  const AWN = { mira: "#ffd23f", bob: "#9aa3b5", sela: "#e9f0ff", dov: "#c77dff", wren: "#ff6fb5", hesk: "#4de1e8" };
  const SELLS = { mira: "lum", bob: "ket", sela: "snm", dov: "dri", wren: "pen", hesk: "zir" };
  const ORDER = ["mira", "bob", "sela", "dov", "wren", "hesk"];
  const NAME = { mira: "MIRA", bob: "BOB", sela: "SELA", dov: "DOV", wren: "WREN", hesk: "HESK" };
  const GREEN = "#8fd16a", WARM = "#f2a65a";

  /* ---------------------------------------------------------------- sprites at any size */
  const scr = document.createElement("canvas"); scr.width = 32; scr.height = 40; const sx = scr.getContext("2d");
  // an EP 01 villager, s× bigger, drawn into the lo-res frame (feet at `feet`)
  function alienS(id, x, feet, t, s = 1, o = {}) {
    if (s === 1 && !o.alpha) { T.alien(id, x, feet, t); return; }
    sx.clearRect(0, 0, 32, 40); Art.drawAlien(sx, 16, 36, id, t);
    lx.save(); lx.imageSmoothingEnabled = false; lx.globalAlpha = o.alpha ?? 1;
    lx.drawImage(scr, Math.round(x - 16 * s), Math.round(feet - 36 * s), 32 * s, 40 * s); lx.restore();
  }
  const fc = document.createElement("canvas"); fc.width = fc.height = 16; const fx = fc.getContext("2d");
  // a family face (gran / tam / ola; mood ok | hungry | sick | worse), centre cx,cy, s× in lo-res
  function faceS(id, mood, cx, cy, s = 3, a = 1) {
    Art.drawFace(fx, id, mood);
    lx.save(); lx.imageSmoothingEnabled = false; lx.globalAlpha = a;
    lx.drawImage(fc, Math.round(cx - 8 * s), Math.round(cy - 8 * s), 16 * s, 16 * s); lx.restore();
  }
  // a family face in hi-res (for insets and cards)
  function hface(id, mood, cx, cy, size, a = 1) {
    Art.drawFace(fx, id, mood);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha *= a; ctx.drawImage(fc, cx - size / 2, cy - size / 2, size, size); ctx.restore();
  }
  // a goods icon (lum bog ket snm dri pen zir), centred, lo-res
  function icoS(g, cx, cy, s = 1, a = 1) {
    lx.save(); lx.imageSmoothingEnabled = false; lx.globalAlpha = a;
    lx.drawImage(Art.iconCanvas[g], Math.round(cx - 6 * s), Math.round(cy - 6 * s), 12 * s, 12 * s); lx.restore();
  }
  // a goods icon in hi-res
  function hico(g, cx, cy, size, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha *= a; ctx.drawImage(Art.iconCanvas[g], cx - size / 2, cy - size / 2, size, size); ctx.restore();
  }
  // soft hi-res glow
  function glow(cx, cy, r, color, a = 1) {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, T.hexA(color, 0.55 * a)); g.addColorStop(1, T.hexA(color, 0));
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  }
  // hi-res arrow
  function arrow(x1, y1, x2, y2, c = C.ink, lw = 12, k = 1) {
    if (k <= 0) return;
    const x = lerp(x1, x2, k), y = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = lw * 2.4;
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x - Math.cos(a) * hd * 0.6, y - Math.sin(a) * hd * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.5) * hd, y - Math.sin(a - 0.5) * hd); ctx.lineTo(x - Math.cos(a + 0.5) * hd, y - Math.sin(a + 0.5) * hd); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // a big red ✗ / green ✓, popped in at k
  function cross(cx, cy, r, k) {
    if (k <= 0) return; const s = pop(k);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineCap = "round";
    for (const [c, lw] of [["#1a1026", r * 0.42], [C.bad, r * 0.26]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke(); }
    ctx.restore();
  }
  function check(cx, cy, r, k) {
    if (k <= 0) return; const s = pop(k);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const [c, lw] of [["#1a1026", r * 0.42], [C.leaf, r * 0.26]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(-r * 0.3, r * 0.7); ctx.lineTo(r, -r * 0.8); ctx.stroke(); }
    ctx.restore();
  }
  // a speech / thought bubble (hi-res): box centred at x,y; tail to (tx,ty); k = pop
  function bubble(x, y, w, h, tx, ty, k, o = {}) {
    if (k <= 0) return false;
    const s = pop(k);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const bg = o.bg || "#fff8e8";
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.roundRect(-w / 2 + 10, -h / 2 + 10, w, h, 28); ctx.fill();
    ctx.fillStyle = bg; ctx.strokeStyle = "#1a1026"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 28); ctx.fill(); ctx.stroke();
    const dx = (tx - x) / s, dy = (ty - y) / s;
    if (o.thought) {
      for (const [f, r] of [[0.62, 18], [0.85, 11]]) { ctx.beginPath(); ctx.arc(dx * f, dy * f, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    } else {
      const bx = clamp(dx * 0.35, -w / 2 + 40, w / 2 - 40), by = dy > 0 ? h / 2 - 4 : -h / 2 + 4;
      ctx.beginPath(); ctx.moveTo(bx - 26, by); ctx.lineTo(dx * 0.8, dy * 0.8); ctx.lineTo(bx + 26, by); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx - 26, by); ctx.lineTo(dx * 0.8, dy * 0.8); ctx.lineTo(bx + 26, by); ctx.stroke();
      ctx.fillStyle = bg; ctx.fillRect(bx - 22, by - (dy > 0 ? 6 : -2), 44, 6);
    }
    ctx.restore();
    return s;
  }
  // a name tag in Space Grotesk (mixed case reads better than Silkscreen for names)
  function tag(str, x, y, k = 1, o = {}) {
    if (k <= 0) return;
    const size = o.size || 60;
    ctx.save(); ctx.font = `700 ${size}px 'Space Grotesk'`;
    const w = ctx.measureText(str).width + size * 0.8, h = size * 1.35, s = pop(k);
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 6, w, h, 18); ctx.fill();
    ctx.fillStyle = o.bg || "rgba(26,16,38,.88)"; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill();
    ctx.fillStyle = o.color || C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(str, 0, 2);
    ctx.restore();
  }
  // something flying along an arc between two hi-res points over [a, b] (seconds); returns [x, y] or null
  function fly(lt, a, b, p0, p1, hgt = 160) {
    const k = seg(lt, a, b); if (k <= 0 || k >= 1) return null;
    const e = easeInOut(k);
    return [lerp(p0[0], p1[0], e), lerp(p0[1], p1[1], e) - Math.sin(Math.PI * e) * hgt];
  }
  // three strength pips (hi-res)
  function pips(cx, cy, n, r = 30, flick = 0) {
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * r * 2.6, on = i < n, fl = i === n && flick > 0;
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = on ? "#ff6f8e" : fl ? T.hexA("#ff6f8e", flick) : "rgba(26,16,38,.75)"; ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = "#1a1026"; ctx.stroke();
      if (on) { ctx.fillStyle = "#ffc2d1"; ctx.fillRect(x - r * 0.45, cy - r * 0.5, r * 0.35, r * 0.3); }
    }
  }

  /* ---------------------------------------------------------------- the camera: draw the world on the lo canvas, then blit a window of it */
  function cam(cx, cy, z) {
    const vw = LO_W / z, vh = LO_H / z;
    const x0 = clamp(cx - vw / 2, 0, LO_W - vw), y0 = clamp(cy - vh / 2, 0, LO_H - vh);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(lx.canvas, x0, y0, vw, vh, 0, 0, WIDTH, H);
    const k = WIDTH / vw;
    return (x, y) => [(x - x0) * k, (y - y0) * k];   // lo world → hi screen
  }

  /* ---------------------------------------------------------------- scenery */
  function skyBands(top, bot, cols) { const n = cols.length; for (let i = 0; i < n; i++) px(0, top + (bot - top) * i / n, LO_W, (bot - top) / n + 1, cols[i]); }
  const DAWN = ["#1a1030", "#2a1a45", "#46275e", "#73376a", "#b45a6e", "#e8896a"];
  const NIGHT = ["#0b0818", "#120d24", "#1a1330", "#211838", "#2a1f45", "#33264f"];
  function stars(top, bot, t, a = 1, n = 40) { for (let i = 0; i < n; i++) if ((t * 0.7 + hash(i + 9)) % 3 > 0.25) px(hash(i) * LO_W, top + hash(i + 40) * (bot - top), 1, 1, `rgba(244,236,255,${a * (0.4 + 0.6 * hash(i + 3))})`); }
  function grass(top, bot = LO_H, ox = 0) {
    px(0, top, LO_W, bot - top, "#1f4a3f");
    for (let i = 0; i < 160; i++) {
      const x = ((hash(i) * 400 - ox) % 400 + 400) % 400; if (x > LO_W) continue;
      px(x, top + 1 + hash(i + 50) * (bot - top - 2), 1, 2, hash(i + 7) < 0.5 ? "#2a5e4f" : "#173a31");
      if (hash(i + 99) < 0.08) px(x + 2, top + 2 + hash(i + 51) * (bot - top - 4), 2, 2, "#ff8ac2");
    }
  }
  function plazaFloor(top, bot = LO_H) {
    for (let y = top; y < bot; y += 8) for (let x = 0; x < LO_W; x += 8) {
      px(x, y, 8, 8, ((x + y) / 8) % 2 ? "#3b3152" : "#40355a"); px(x, y + 7, 8, 1, "#2c2440"); px(x + 7, y, 1, 8, "#2c2440");
      if (hash(x * 7 + y) < 0.25) px(x + 2, y + 3, 2, 1, "#4a3f68");
    }
  }
  function hills(base, ox, c, amp, f, seed) { for (let x = 0; x < LO_W; x++) { const u = x + ox; const h = amp * (0.6 + 0.4 * Math.sin(u * f + seed) + 0.25 * Math.sin(u * f * 2.7 + seed * 3)); px(x, base - h, 1, h + 1, c); } }
  // a stall: counter at (x, y) w wide, the keeper behind it, goods on show
  function stall(id, x, y, t, o = {}) {
    const w = o.w || 34, open = o.open !== false;
    if (open && o.keeper !== false) alienS(id, x + w / 2 + (o.shake ? Math.round(Math.sin(t * 22) * 1.5) : 0), y + 6, t);
    px(x + 1, y - 26, 2, 26, "#3a2a1e"); px(x + w - 3, y - 26, 2, 26, "#3a2a1e");
    for (let i = 0; i < w; i += 6) px(x + i, y - 30, Math.min(6, w - i), 7, open ? ((i / 6) % 2 ? AWN[id] : "#f4ecff") : "#4a3f68");
    px(x, y - 23, w, 2, "rgba(0,0,0,.25)");
    px(x, y, w, 12, "#7a5235"); px(x, y, w, 3, "#9c6c47"); px(x, y + 10, w, 2, "#5a3a25");
    if (!open) { px(x + 2, y - 2, w - 4, 12, "#4a3f68"); px(x + 2, y - 2, w - 4, 2, "#6c5f93"); return; }
    const g = SELLS[id], n = o.n ?? 2;
    for (let i = 0; i < n; i++) { const fl = g === "dri" ? Math.round(Math.sin(t * 2.5 + i) * 1.5) - 2 : 0; icoS(g, x + 9 + i * 14, y - 6 + fl); }
  }
  const STALL_X = (i) => 6 + i * 39, STALL_Y = 58;
  // the market: dawn sky, a row of teal trees, the plaza and its six stalls
  function market(t, o = {}) {
    skyBands(0, 30, o.sky || DAWN);
    if (o.sun !== false) { disc(196, 24, 9, "#ffd8a0"); disc(196, 24, 7, "#fff1cf"); }
    hills(30, 0, "#2a1f45", 6, 0.05, 1);
    grass(28, 40);
    for (let i = 0; i < 9; i++) Art.drawTree(lx, 8 + i * 28 + (i % 2) * 6, 26 + (i % 3));
    plazaFloor(40);
    ORDER.forEach((id, i) => stall(id, STALL_X(i), STALL_Y, t, { open: !(o.closed || []).includes(id), shake: o.shake === id }));
    // the standing stone (centre of the plaza, as in the game)
    const sx0 = 120, sy0 = 112;
    px(sx0 - 6, sy0 + 6, 12, 3, "#2c2440"); px(sx0 - 3, sy0 - 10, 6, 17, "#5a4a86"); px(sx0 - 3, sy0 - 10, 2, 17, "#7b66b5");
    px(sx0 - 1, sy0 - 6, 2, 2, "#4de1e8"); px(sx0 - 1, sy0 - 1, 2, 2, "#4de1e8");
  }
  // the hut from outside (EP 01's: plank walls, a green bogwool-thatch roof, gold windows)
  function hutOut(x, y, w = 80, h = 72) {
    px(x + 6, y + 30, w - 12, h - 30, "#5a3d2b");
    for (let yy = y + 34; yy < y + h; yy += 6) px(x + 6, yy, w - 12, 1, "#6e4a33");
    for (let i = 0; i < 34; i++) px(x + w / 2 - (i + 4), y + i, 2 * (i + 4), 1, i % 4 ? "#8fd16a" : "#4f8a3a");
    px(x + w / 2 - 7, y + h - 22, 14, 22, "#2a1a12"); px(x + w / 2 + 3, y + h - 12, 2, 2, C.gold);
    px(x + 14, y + 44, 10, 8, C.gold); px(x + w - 24, y + 44, 10, 8, C.gold);
  }
  // a bogwool tuft (lo-res puff), r = size
  function puff(cx, cy, r) {
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; disc(cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.45, Math.max(1, Math.round(r * 0.45)), "#4f8a3a"); }
    disc(cx, cy, Math.round(r * 0.75), GREEN);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.4; disc(cx + Math.cos(a) * r * 0.45, cy - 1 + Math.sin(a) * r * 0.35, Math.max(1, Math.round(r * 0.28)), "#c8f2a8"); }
  }
  function reeds(x, base, t, n = 5) { for (let i = 0; i < n; i++) { const xx = x + i * 3, h = 8 + (i * 5) % 6, sw = Math.round(Math.sin(t * 1.5 + xx) * 0.8); px(xx, base - h, 1, h, "#2f7d4a"); px(xx + sw, base - h - 3, 1, 3, "#8a5a2b"); } }
  // inside the hut: plank walls, a floor, a window (sky by o.win: "night" | "rain" | "dawn")
  function room(t, o = {}) {
    px(0, 0, LO_W, LO_H, "#3a2618");
    for (let x = 0; x < LO_W; x += 12) { px(x, 0, 1, LO_H, "#2e1e13"); px(x + 3, 0, 1, LO_H, "#44301f"); }
    for (let i = 0; i < 30; i++) px(hash(i) * LO_W, hash(i + 30) * 110, 2, 1, "#2e1e13");
    px(0, 116, LO_W, LO_H - 116, "#24160e"); px(0, 116, LO_W, 2, "#5a3d2b");
    for (let x = 0; x < LO_W; x += 20) px(x, 118, 1, LO_H - 118, "#1a0f09");
    if (o.win) {
      const [wx, wy, ww, wh] = o.winAt || [180, 14, 40, 30];
      px(wx - 3, wy - 3, ww + 6, wh + 6, "#6e4a33");
      const wc = o.win === "rain" ? ["#2a3046", "#323a55", "#3a4462"] : NIGHT.slice(2);
      for (let i = 0; i < wc.length; i++) px(wx, wy + wh * i / wc.length, ww, wh / wc.length + 1, wc[i]);
      lx.save(); lx.beginPath(); lx.rect(wx, wy, ww, wh); lx.clip();
      if (o.win === "rain") for (let i = 0; i < 26; i++) { const yy = wy + ((hash(i) * wh + t * 60) % wh), xx = wx + hash(i + 4) * ww; px(xx, yy, 1, 3, "#9fb7e8"); }
      else { for (let i = 0; i < 10; i++) px(wx + hash(i) * ww, wy + hash(i + 3) * wh * 0.8, 1, 1, "#f4ecff"); if (o.moon) { disc(wx + ww * 0.7, wy + wh * 0.35, 4, "#fff3d0"); disc(wx + ww * 0.7 + 2, wy + wh * 0.35 - 1, 3, NIGHT[3]); } }
      lx.restore();
      px(wx + ww / 2 - 1, wy, 2, wh, "#6e4a33"); px(wx, wy + wh / 2 - 1, ww, 2, "#6e4a33");
    }
  }
  // Gran's jar: a squat clay jar with a cloth lid, pink crystals peeking out
  function jar(cx, base, h = 40, open = 0, t = 0) {
    for (let i = 0; i < h; i++) {
      const u = i / h, hw = Math.round(u > 0.9 ? 9 : u > 0.78 ? 7 : 8 + 9 * Math.sin(Math.PI * u / 0.78));
      px(cx - hw, base - i - 1, hw * 2, 1, u > 0.78 && u <= 0.9 ? "#7a3d22" : "#b0603a");
      px(cx + hw - Math.max(1, Math.round(hw / 3)), base - i - 1, Math.max(1, Math.round(hw / 3)), 1, "#7a3d22");
      if (u > 0.2 && u < 0.65) px(cx - hw + 2, base - i - 1, 2, 1, "#d68a5a");
    }
    for (let i = 0; i < 3; i++) px(cx - 12, base - Math.round(h * 0.42) + i * 3, 24, 1, "#7a3d22");   // painted bands
    if (open < 1) { px(cx - 10, base - h - 3, 20, 4, "#c77dff"); px(cx - 10, base - h + 1, 20, 1, "#7d3fb8"); px(cx - 1, base - h - 5, 3, 2, "#7d3fb8"); }
    for (let i = 0; i < 4; i++) { const g = (Math.sin(t * 4 + i * 1.7) + 1) / 2; px(cx - 6 + i * 4, base - h - 1 - (open ? 1 : 0), 2, 2, g > 0.7 ? "#ffffff" : "#ff6fb5"); }
  }
  function bowl(cx, y, w = 22) { for (let i = 0; i < 6; i++) { const hw = Math.round(w / 2 - i * i * 0.35); px(cx - hw, y + i, hw * 2, 1, i < 1 ? "#c49a6c" : "#8a5a2b"); } }
  function table(x0, x1, y) { px(x0, y, x1 - x0, 4, "#8a5a2b"); px(x0, y, x1 - x0, 1, "#b07a45"); px(x0, y + 4, x1 - x0, 1, "#5e3b1a"); px(x0 + 4, y + 5, 3, 20, "#5e3b1a"); px(x1 - 7, y + 5, 3, 20, "#5e3b1a"); }
  function candle(x, y, t) { px(x - 2, y, 4, 9, "#f4ecff"); px(x - 3, y + 9, 6, 2, "#8a5a2b"); const f = Math.round(Math.sin(t * 13) + Math.sin(t * 7.3)); px(x - 1, y - 4 + (f > 0 ? 0 : 1), 2, 4, C.gold); px(x, y - 3, 1, 2, "#ff8a3d"); }
  // a seated family member (face + a little body behind the table)
  function sitter(id, mood, cx, faceY, s = 3, t = 0) {
    const sm = id === "tam" ? 1 : 0, body = { ok: "#f2a65a", hungry: "#d99a5e", sick: "#b7c86a", worse: "#93b85a" }[mood] || "#f2a65a";
    const bw = (sm ? 8 : 10) * s, bob = Math.sin(t * 2 + cx) > 0.7 ? -1 : 0;
    px(cx - bw / 2, faceY + 6 * s + bob, bw, 30, body); px(cx + bw / 2 - s, faceY + 6 * s + bob, s, 30, "#b8692b");
    px(cx - 3 * s, faceY + 7 * s + bob, 6 * s, 30, id === "gran" ? "#c77dff" : id === "tam" ? "#5fbf4a" : "#ff8ac2");   // a tunic
    faceS(id, mood, cx, faceY + bob, s);
  }

  /* ================================================================ i1 · valley */
  // "This is Ulm Hollow, a village on a faraway world. Nobody here has heard of money."
  SC.valley = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const camX = lerp(0, 150, easeInOut(seg(lt, 0, d)));
    skyBands(0, 70, DAWN); stars(0, 40, t, 1 - seg(lt, 0, d) * 0.6, 50);
    disc(Math.round(60 - camX * 0.1), 30, 16, "#3d2f63"); disc(Math.round(56 - camX * 0.1), 27, 13, "#5a4a86");   // a big pale planet in the sky
    disc(Math.round(206 - camX * 0.15), 52, 10, "#ffd8a0"); disc(Math.round(206 - camX * 0.15), 52, 8, "#fff1cf");  // rising sun
    hills(78, camX * 0.25, "#2a1f45", 16, 0.035, 2);
    hills(88, camX * 0.5, "#352a55", 12, 0.05, 5);
    grass(86, LO_H, camX);
    // swamp on the far left with bogwool tufts and reeds
    const off = (x) => Math.round(x - camX);
    px(off(-10), 104, 120, 20, "#1d3a4a"); for (let i = 0; i < 18; i++) px(off(hash(i) * 110), 106 + hash(i + 3) * 16, 4, 1, "#2f5a6e");
    for (let i = 0; i < 6; i++) puff(off(12 + i * 17), 104 + (i % 2) * 6, 4);
    reeds(off(4), 106, t); reeds(off(70), 112, t); reeds(off(96), 104, t, 4);
    Art.drawTree(lx, off(130), 96); Art.drawTree(lx, off(250), 98); Art.drawTree(lx, off(352), 94);
    hutOut(off(150), 46, 80, 72);
    // the plaza and its six stalls, small and far
    px(off(250), 92, 140, 26, "#3b3152"); for (let x = 0; x < 140; x += 6) px(off(250 + x), 92, 1, 26, "#2c2440");
    ORDER.forEach((id, i) => {
      const x0 = off(254 + i * 22);
      px(x0, 82, 18, 5, AWN[id]); px(x0, 84, 18, 1, "#f4ecff"); px(x0 + 1, 87, 1, 9, "#3a2a1e"); px(x0 + 16, 87, 1, 9, "#3a2a1e");
      px(x0, 96, 18, 5, "#7a5235"); px(x0, 96, 18, 1, "#9c6c47");
    });
    alienS("you", off(190), 124, t);
    blitLo();
    const k = seg(lt, 0.3, 0.9), out = 1 - seg(lt, d - 0.7, d - 0.1);
    text("WTH IS MONEY? · EPISODE 1", WIDTH / 2, 150, 56, C.muted, { alpha: k * out });
    const kt = seg(lt, Math.min(w(2), 1.0), Math.min(w(2), 1.0) + 0.4);
    if (kt > 0) { ctx.save(); ctx.globalAlpha = out; ctx.translate(WIDTH / 2, 290); ctx.scale(pop(kt), pop(kt)); text("ULM HOLLOW", 0, 0, 150, C.gold); ctx.restore(); }
    body("how the market works", WIDTH / 2, 420, 68, C.ink, { alpha: seg(lt, 1.3, 1.9) * out });
    tag("No money here.", WIDTH / 2, 940, seg(lt, w(10), w(10) + 0.4) * out, { size: 60 });
  };

  /* ================================================================ i2 · family */
  // "This is you, and your family: Gran, Little Tam and Aunt Ola. Each night, they need one lumfruit."
  SC.family = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    room(t, { win: "night", moon: true, winAt: [100, 10, 40, 26] });
    const fam = [["gran", 108, w(6), "Gran"], ["tam", 156, w(7.5), "Little Tam"], ["ola", 204, w(10), "Aunt Ola"]];
    for (const [id, x, at] of fam) { const k = seg(lt, at, at + 0.35); if (k > 0) sitter(id, "ok", x, Math.round(lerp(96, 64, easeOut(k))), 3, t); }
    table(78, 236, 92);
    bowl(132, 86, 26);
    const kl = seg(lt, w(16) - 0.2, w(16) + 0.4);
    if (kl > 0 && kl < 1) icoS("lum", 132, lerp(20, 82, easeOut(kl)), 2);
    alienS("you", 38, 126, t, 4);
    blitLo();
    if (kl > 0) glow(X(132), X(82), 260, C.gold, kl * (0.7 + 0.3 * Math.sin(t * 4)));
    if (kl >= 1) hico("lum", X(132), X(82), 192);
    tag("You", X(38), 260, seg(lt, w(1), w(1) + 0.35), { bg: WARM, color: "#1a1026", size: 64 });
    for (const [id, x, at, nm] of fam) tag(nm, X(x), 262, seg(lt, at, at + 0.35), { size: 58 });
    const kn = seg(lt, w(12), w(12) + 0.4);
    if (kn > 0) { label("1 LUMFRUIT EVERY NIGHT", X(150), 1000, { k: kn, size: 56, bg: C.gold }); }
    fadeOut(lt, d, 0.35);
  };

  /* ================================================================ i3 · bogwool */
  // "You raise bogwool, two a day. It keeps forever. But nobody can eat it."
  SC.bogwool = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    skyBands(0, 60, ["#3a2a5e", "#5a3a72", "#8a4a7a", "#c46a6e", "#e8896a"]);
    hills(66, 0, "#2a1f45", 12, 0.04, 3);
    grass(62, 100);
    px(0, 96, LO_W, LO_H - 96, "#1d3a4a"); for (let i = 0; i < 40; i++) px(hash(i) * LO_W, 98 + hash(i + 3) * 36, 5, 1, hash(i + 1) < 0.5 ? "#2f5a6e" : "#16303d");
    for (let i = 0; i < 5; i++) puff(150 + i * 18, 100 + (i % 2) * 5, 6);
    reeds(140, 100, t); reeds(232, 98, t, 3); reeds(10, 99, t);
    hutOut(4, 26, 64, 58);
    // the day's bogwool: two big tufts pop out next to you
    const k1 = seg(lt, w(3), w(3) + 0.3), k2 = seg(lt, w(4), w(4) + 0.3);
    alienS("you", 62, 112, t, 3);
    blitLo();
    hico("bog", 925, 440, 220 * pop(k1), k1 > 0 ? 1 : 0);
    hico("bog", 1155, 440, 220 * pop(k2), k2 > 0 ? 1 : 0);
    tag("Bogwool", 1040, 250, seg(lt, w(2), w(2) + 0.35), { bg: GREEN, color: "#1a1026", size: 64 });
    label("+2 A DAY", 1040, 640, { k: seg(lt, w(4), w(4) + 0.4), size: 60, bg: C.gold });
    label("KEEPS FOREVER", 1040, 780, { k: seg(lt, w(7), w(7) + 0.4), size: 60, bg: "#c8f2a8" });
    // "nobody can eat it": Tam tries a bite
    const kt = seg(lt, w(9), w(9) + 0.4);
    if (kt > 0) {
      const cx = 1640, cy = 520;
      ctx.save(); ctx.globalAlpha = Math.min(1, kt * 2);
      ctx.fillStyle = "rgba(18,13,29,.9)"; ctx.beginPath(); ctx.roundRect(cx - 230, cy - 270, 460, 560, 30); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.stroke();
      ctx.restore();
      const bite = lt > w(11);
      hface("tam", bite ? "hungry" : "ok", cx, cy - 40, 320, Math.min(1, kt * 2));
      hico("bog", cx + 40 + (bite ? 0 : 60 * (1 - easeOut(seg(lt, w(9), w(11))))), cy + 70, 130, Math.min(1, kt * 2));
      cross(cx + 40, cy + 70, 80, seg(lt, w(12), w(12) + 0.3));
      body("Little Tam", cx, cy + 230, 56, C.ink, { alpha: Math.min(1, kt * 2) });
      label("CAN'T EAT IT", cx, cy - 340, { k: seg(lt, w(12), w(12) + 0.4), size: 60, bg: "#ffb3b3" });
    }
    fadeOut(lt, d, 0.35);
  };

  /* ================================================================ i4 · market */
  // "So every morning, you go to the market and swap: your bogwool for someone's lumfruit."
  SC.market = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    market(t);
    const kw = seg(lt, 0.2, w(8)), yx = lerp(-12, 40, easeOut(kw));
    alienS("you", yx, 110, kw < 1 ? t * 4 : t);
    const S = cam(lerp(120, 70, easeInOut(seg(lt, w(9), w(10)))), lerp(68, 82, easeInOut(seg(lt, w(9), w(10)))), lerp(1, 1.6, easeInOut(seg(lt, w(9), w(10)))));
    const names = 1 - seg(lt, w(9) - 0.3, w(9));
    ORDER.forEach((id, i) => { const [x, y] = S(STALL_X(i) + 17, STALL_Y + 22); tag(NAME[id].charAt(0) + NAME[id].slice(1).toLowerCase(), x, y, seg(lt, w(4) + i * 0.12, w(4) + i * 0.12 + 0.3) * names, { size: 56 }); });
    // the swap: two tufts of bogwool to Mira, one lumfruit back
    const you = S(yx, 92), mira = S(STALL_X(0) + 17, STALL_Y - 4);
    const swap = seg(lt, w(10), w(14) + 0.6) > 0;
    if (swap) {
      for (let i = 0; i < 2; i++) { const p = fly(lt, w(10) + i * 0.15, w(11) + 0.4 + i * 0.15, [you[0] + 40, you[1] - 60], [mira[0] + 60 + i * 50, mira[1] + 30], 140); if (p) hico("bog", p[0], p[1], 120); }
      const p = fly(lt, w(13), w(14) + 0.3, [mira[0] + 40, mira[1] + 30], [you[0] + 120, you[1] - 80], 160); if (p) hico("lum", p[0], p[1], 130);
      if (lt > w(14) + 0.3) { glow(you[0] + 120, you[1] - 80, 150, C.gold, 0.8); hico("lum", you[0] + 120, you[1] - 80, 130); }
      // the swap, spelled out
      const kb = seg(lt, w(10), w(10) + 0.4);
      if (kb > 0) {
        const bx = 1340, by = 300;
        ctx.save(); ctx.globalAlpha = Math.min(1, kb * 2); ctx.fillStyle = "rgba(18,13,29,.88)"; ctx.beginPath(); ctx.roundRect(bx - 400, by - 170, 800, 340, 30); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
        text("SWAP", bx, by - 100, 64, C.gold, { alpha: kb });
        hico("bog", bx - 230, by + 50, 150, kb); arrow(bx - 120, by + 50, bx + 110, by + 50, C.ink, 14, seg(lt, w(11), w(12)));
        hico("lum", bx + 230, by + 50, 150, seg(lt, w(13), w(13) + 0.3));
      }
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ i5 · refusal */
  // "But a swap only works if they want what you have. Today, Mira has lumfruit, but doesn't want bogwool. Now what?"
  SC.refusal = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const shake = lt > w(16) && lt < w(18) + 0.6;
    market(t, { closed: ["bob"], shake: shake ? "mira" : null });
    alienS("you", 40, 104, t);
    const S = cam(70, 72, 1.4);
    const you = S(40, 92), mira = S(STALL_X(0) + 17, STALL_Y - 8);
    // your thought: lumfruit (you want what Mira has)
    if (bubble(you[0] + 360, you[1] - 110, 300, 210, you[0] + 60, you[1] - 60, seg(lt, 0.3, 0.7), { thought: true })) {
      body("want", you[0] + 360, you[1] - 170, 56, "#1a1026", { shadow: false }); hico("lum", you[0] + 360, you[1] - 75, 110);
    }
    // you hold out your bogwool
    const offer = [you[0] + 120, you[1] - 40];
    hico("bog", offer[0], offer[1], 120, seg(lt, w(2), w(2) + 0.3));
    // Mira: has lumfruit, but wants something else
    if (bubble(mira[0] + 420, mira[1] - 20, 420, 210, mira[0] + 120, mira[1], seg(lt, w(5), w(5) + 0.4), { thought: true })) {
      body("want", mira[0] + 420, mira[1] - 80, 56, "#1a1026", { shadow: false });
      if (lt < w(15)) text("?", mira[0] + 420, mira[1] + 15, 110, "#1a1026", { shadow: false });
      else { hico("bog", mira[0] + 420, mira[1] + 15, 110); cross(mira[0] + 420, mira[1] + 15, 52, seg(lt, w(17), w(17) + 0.3)); }
    }
    tag("Mira", mira[0], mira[1] + 210, seg(lt, w(11), w(11) + 0.3), { size: 60, bg: C.gold, color: "#1a1026" });
    cross(offer[0], offer[1], 70, seg(lt, w(17), w(17) + 0.3));
    if (lt > w(16)) bubble(mira[0] + 60, 110, 420, 120, mira[0], mira[1] - 30, seg(lt, w(16), w(16) + 0.3)) && text("NO THANKS", mira[0] + 60, 110, 56, "#1a1026", { shadow: false });
    // "Now what?" and a hungry little face waiting at home
    const kn = seg(lt, w(19), w(19) + 0.35);
    if (kn > 0) {
      ctx.save(); ctx.translate(1500, 560); ctx.scale(pop(kn), pop(kn)); text("NOW WHAT?", 0, 0, 100, C.gold); ctx.restore();
      ctx.save(); ctx.globalAlpha = kn; ctx.fillStyle = "rgba(18,13,29,.9)"; ctx.beginPath(); ctx.roundRect(1380, 680, 240, 300, 26); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
      hface("tam", "hungry", 1500, 800, 200, kn); body("at home", 1500, 935, 56, C.muted, { alpha: kn });
    }
    fadeOut(lt, d, 0.3);
  };

  /* ================================================================ i6 · chain */
  // "Maybe Sela takes your bogwool for milk, and Mira takes the milk. Find the chain, and dinner is saved."
  SC.chain = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    market(t, { closed: ["bob"] });
    const selaX = STALL_X(2) + 17, miraX = STALL_X(0) + 17;
    // you walk: to Sela, swap, back to Mira, swap
    const k1 = seg(lt, 0.1, w(1) + 0.2), k2 = seg(lt, w(6.5), w(8) + 0.1);
    const yx = k2 > 0 ? lerp(selaX - 4, 40, easeInOut(k2)) : lerp(40, selaX - 4, easeInOut(k1));
    const walking = (k1 > 0 && k1 < 1) || (k2 > 0 && k2 < 1);
    alienS("you", yx, 104, walking ? t * 4 : t);
    const S = cam(80, 72, 1.4);
    const you = S(yx, 94), sela = S(selaX, STALL_Y - 4), mira = S(miraX, STALL_Y - 4);
    // Mira's wish, from the start: milk
    if (bubble(mira[0] + 420, mira[1] + 40, 300, 210, mira[0] + 120, mira[1], 1 - seg(lt, w(11), w(11) + 0.3), { thought: true })) {
      body("want", mira[0] + 420, mira[1] - 20, 56, "#1a1026", { shadow: false }); hico("snm", mira[0] + 420, mira[1] + 75, 110);
    }
    tag("Sela", sela[0], sela[1] + 210, seg(lt, w(1), w(1) + 0.3) * (1 - seg(lt, w(12), w(12) + 0.3)), { size: 58, bg: "#e9f0ff", color: "#1a1026" });
    // swap 1: bogwool → Sela, milk → you
    let p = fly(lt, w(3), w(4) + 0.3, [you[0] + 60, you[1] - 80], [sela[0], sela[1] + 40], 120); if (p) hico("bog", p[0], p[1], 120);
    p = fly(lt, w(5), w(6) + 0.2, [sela[0], sela[1] + 40], [you[0] + 70, you[1] - 90], 120); if (p) hico("snm", p[0], p[1], 120);
    const hasMilk = lt > w(6) + 0.2 && lt < w(9);
    if (hasMilk) hico("snm", you[0] + 70, you[1] - 90, 120);
    // swap 2: milk → Mira, lumfruit → you
    p = fly(lt, w(9), w(10) + 0.3, [you[0] + 70, you[1] - 90], [mira[0], mira[1] + 40], 120); if (p) hico("snm", p[0], p[1], 120);
    p = fly(lt, w(10.5), w(11.5), [mira[0], mira[1] + 40], [you[0] + 80, you[1] - 100], 140); if (p) hico("lum", p[0], p[1], 130);
    if (lt > w(11.5)) { glow(you[0] + 80, you[1] - 100, 150, C.gold, 0.8); hico("lum", you[0] + 80, you[1] - 100, 130); }
    // the chain, spelled out along the bottom
    const kc = seg(lt, w(12), w(12) + 0.4);
    if (kc > 0) {
      const y = 520;
      ctx.fillStyle = `rgba(10,6,18,${0.6 * kc})`; ctx.fillRect(0, 0, WIDTH, H);
      ctx.save(); ctx.globalAlpha = Math.min(1, kc * 2); ctx.fillStyle = "rgba(18,13,29,.95)"; ctx.beginPath(); ctx.roundRect(200, y - 110, 1520, 220, 30); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
      const xs = [340, 660, 960, 1260, 1580];
      hico("bog", xs[0], y, 130, kc); arrow(xs[0] + 90, y, xs[1] - 90, y, C.ink, 12, seg(lt, w(12), w(13)));
      body("Sela", xs[1], y, 60, "#e9f0ff", { alpha: seg(lt, w(12.5), w(13)) });
      arrow(xs[1] + 90, y, xs[2] - 80, y, C.ink, 12, seg(lt, w(13), w(13.5)));
      hico("snm", xs[2], y, 130, seg(lt, w(13), w(13.5)));
      arrow(xs[2] + 80, y, xs[3] - 90, y, C.ink, 12, seg(lt, w(13.5), w(14)));
      body("Mira", xs[3], y, 60, C.gold, { alpha: seg(lt, w(13.5), w(14)) });
      arrow(xs[3] + 90, y, xs[4] - 90, y, C.ink, 12, seg(lt, w(14), w(14.5)));
      hico("lum", xs[4], y, 130, seg(lt, w(14), w(14.5)));
      text("THE CHAIN", 960, y - 170, 60, C.gold, { alpha: kc });
    }
    const kd = seg(lt, w(16), w(16) + 0.35);
    if (kd > 0) { check(620, 800, 80, kd); label("DINNER SAVED!", 1060, 800, { k: kd, size: 64, bg: C.leaf }); }
    fadeOut(lt, d, 0.35);
  };

  /* ================================================================ i7 · medicine */
  // "Sometimes someone at home falls sick. They need medicine: two driftcap mushrooms, from Dov. Each night without it, they get weaker. And a person can die."
  SC.medicine = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    room(t, { win: "night", moon: true, winAt: [92, 12, 36, 26] });
    // Gran in bed
    px(14, 86, 112, 8, "#6e4a33"); px(14, 94, 4, 22, "#5a3d2b"); px(122, 94, 4, 22, "#5a3d2b"); px(10, 64, 6, 52, "#5a3d2b");   // bed frame + headboard
    px(18, 74, 34, 12, "#f4ecff"); px(18, 84, 34, 2, "#c9bfe0");                                                            // pillow
    const sickAt = w(4.5), nightK = seg(lt, w(14), w(20) + 0.4);
    const mood = lt < sickAt ? "ok" : lt < w(19) ? "sick" : "worse";
    faceS("gran", mood, 36, 72, 3);
    px(48, 78, 76, 12, "#6c3aa3"); for (let x = 50; x < 124; x += 8) px(x, 78, 4, 12, "#7d3fb8"); px(48, 78, 76, 1, "#b27ae8");   // quilt
    // nights pass in the window: the moon slides across
    if (nightK > 0) { const mx = lerp(94, 126, nightK), my = 20 - Math.sin(nightK * Math.PI) * 4; disc(mx, my, 3, "#fff3d0"); }
    const dark = seg(lt, w(21), w(25) + 0.4);
    candle(140, 100, t);
    // the medicine panel (right): Dov's driftcap, floating
    const kp = seg(lt, w(6), w(6) + 0.5) * (1 - seg(lt, w(14), w(14) + 0.5));
    if (kp > 0) {
      lx.save(); lx.globalAlpha = kp;
      px(140, 6, 96, 116, "#120d1d"); px(140, 6, 96, 2, "#3a2d5c"); px(140, 120, 96, 2, "#3a2d5c"); px(140, 6, 2, 116, "#3a2d5c"); px(234, 6, 2, 116, "#3a2d5c");
      for (let y = 96; y < 120; y += 8) for (let x = 142; x < 234; x += 8) px(x, y, 8, 8, ((x + y) / 8) % 2 ? "#3b3152" : "#40355a");
      lx.restore();
      alienS("dov", 210, 116, t, 2, { alpha: kp });
    }
    blitLo();
    if (kp > 0) {
      const bobY = (i) => Math.sin(t * 2.4 + i * 1.3) * 18;
      const two = seg(lt, w(9), w(9) + 0.35);
      ctx.save(); ctx.globalAlpha = kp;
      const mx = X(166), my = 560;
      glow(mx, my + bobY(0), 190, "#c77dff", 0.9);
      hico("dri", mx - (two > 0 ? 100 * easeOut(two) : 0), my + bobY(0), 220);
      if (two > 0) { glow(mx + 100, my + bobY(1), 190, "#c77dff", 0.9 * two); hico("dri", mx + 100, my + bobY(1), 220 * pop(two)); }
      ctx.restore();
      label("MEDICINE", X(188), 150, { k: seg(lt, w(8), w(8) + 0.35) * kp, size: 64, bg: "#ecc8ff" });
      body("driftcap mushrooms", X(188), 270, 56, C.ink, { alpha: seg(lt, w(10), w(10) + 0.4) * kp });
      if (two > 0) text("× 2", X(166), 760, 80, C.gold, { alpha: kp * two });
      tag("Dov", X(210), 990, seg(lt, w(13), w(13) + 0.3) * kp, { size: 56, bg: "#c77dff", color: "#1a1026" });
    }
    tag("Gran", X(36), 400, seg(lt, 0.3, 0.7) * (1 - dark), { size: 58 });
    if (lt > sickAt) tag("sick", X(36) + 190, 400, seg(lt, sickAt, sickAt + 0.3) * (1 - dark), { size: 58, bg: "#b7c86a", color: "#1a1026" });
    // strength: 3 pips; one is lost each night without medicine
    const n = lt < w(16) ? 3 : lt < w(19.5) ? 2 : 1;
    const ks = seg(lt, sickAt, sickAt + 0.4);
    if (ks > 0) {
      ctx.save(); ctx.globalAlpha = ks;
      text("STRENGTH", X(70), 840, 56, C.ink);
      pips(X(70), 940, n, 34, 0); ctx.restore();
      const lost = (at) => { const k = seg(lt, at, at + 0.9); if (k > 0 && k < 1) text("−1", X(70) + 260, 940 - k * 60, 64, C.bad, { alpha: 1 - k }); };
      lost(w(16)); lost(w(19.5));
      const kn = seg(lt, w(14) + 0.3, w(14) + 0.7) * (1 - dark);
      if (kn > 0) { text("EACH NIGHT WITHOUT", 1320, 420, 64, C.ink, { alpha: kn }); text("MEDICINE: −1", 1320, 520, 64, "#ff8a9a", { alpha: kn }); }
    }
    // dark: the room dims to the candle; the last pip flickers
    if (dark > 0) {
      ctx.fillStyle = `rgba(6,3,12,${0.78 * dark})`; ctx.fillRect(0, 0, WIDTH, H);
      glow(X(140), X(97), 420, C.gold, dark * (0.8 + 0.1 * Math.sin(t * 11)));
      const fl = lt > w(24) ? Math.max(0, 1 - (lt - w(24)) / 1.2) * (0.5 + 0.5 * Math.sin(t * 20)) : 1;
      pips(X(70), 940, 0, 34, fl);
      text("STRENGTH", X(70), 840, 56, C.muted, { alpha: dark });
    }
    fadeOut(lt, d, 0.6);
  };

  /* ================================================================ i8 · jar */
  // "Gran's jar holds eight pink pentaja crystals: pretty, not much use. Saved for a rainy day."
  SC.jar = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    const rain = lt > w(12.5);
    room(t, { win: rain ? "rain" : "night", winAt: [170, 14, 50, 40] });
    px(40, 96, 120, 5, "#8a5a2b"); px(40, 96, 120, 1, "#b07a45"); px(46, 101, 4, 8, "#5e3b1a"); px(150, 101, 4, 8, "#5e3b1a");   // the shelf
    const ko = seg(lt, w(2), w(3));
    jar(78, 96, 44, ko, t);
    sitter("gran", "ok", 200, 78, 3, t);
    blitLo();
    // eight crystals rise out of the jar into an arc, glinting
    const kc = seg(lt, w(3), w(6));
    for (let i = 0; i < 8; i++) {
      const k = seg(kc, i / 10, i / 10 + 0.25); if (k <= 0) continue;
      const a = Math.PI * (1 - i / 7), tx = X(78) + Math.cos(a) * 360, ty = 470 - Math.sin(a) * 230;
      const x = lerp(X(78), tx, easeOut(k)), y = lerp(X(52), ty, easeOut(k)) + Math.sin(t * 2 + i) * 8;
      glow(x, y, 90, "#ff6fb5", 0.6 + 0.4 * Math.sin(t * 5 + i * 1.3));
      hico("pen", x, y, 110);
    }
    tag("Gran's jar", X(78), 990, seg(lt, w(0), w(0) + 0.35), { size: 60 });
    label("8 PENTAJA", X(78), 350, { k: seg(lt, w(3), w(3) + 0.4), size: 64, bg: "#ffb3d9" });
    body("pretty, not much use", X(78), 880, 56, C.ink, { alpha: seg(lt, w(7), w(7) + 0.4) });
    label("FOR A RAINY DAY", 1080, 700, { k: seg(lt, w(13), w(13) + 0.4), size: 56, bg: "#c4d4ff" });
    fadeOut(lt, d, 0.35);
  };

  /* ================================================================ i9 · goal */
  // "The harvest festival is on day twelve. Get there with everyone still at the table."
  SC.goal = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    skyBands(0, 80, NIGHT); stars(0, 70, t, 1, 60);
    grass(80);
    // lanterns strung across
    const cols = Object.values(AWN);
    for (let x = 0; x < LO_W; x++) px(x, 18 + Math.round(Math.sin(x / LO_W * Math.PI * 3) ** 2 * 8), 1, 1, "#5a4a86");
    const lan = [];
    for (let i = 0; i < 12; i++) { const x = 10 + i * 20, y = 18 + Math.round(Math.sin(x / LO_W * Math.PI * 3) ** 2 * 8); px(x - 2, y + 1, 4, 5, cols[i % 6]); px(x - 1, y + 6, 2, 1, "#3a2a1e"); lan.push([x, y + 3, cols[i % 6]]); }
    const kt = seg(lt, w(7), w(7) + 0.5);
    if (kt > 0) {
      table(36, 204, 110);
      const fam = [["gran", 80], ["tam", 120], ["ola", 160]];
      for (const [id, x] of fam) sitter(id, "ok", x, Math.round(lerp(110, 88, easeOut(kt))), 2, t);
      table(36, 204, 110);
      for (let i = 0; i < 5; i++) icoS(["lum", "snm", "lum", "dri", "lum"][i], 64 + i * 28, 104);
      alienS("you", 216, 124, t, 2);
    }
    blitLo();
    for (const [x, y, c] of lan) glow(X(x), X(y), 90, c, 0.6 + 0.2 * Math.sin(t * 3 + x));
    text("HARVEST FESTIVAL", WIDTH / 2, 330, 80, C.gold, { alpha: seg(lt, w(1), w(1) + 0.4) * (1 - kt) });
    // the days tick up to 12
    const kd = seg(lt, w(4), w(6) + 0.2);
    if (kd > 0) {
      const day = Math.max(1, Math.round(easeInOut(kd) * 12));
      const y = lerp(560, 300, easeInOut(kt));
      ctx.save(); ctx.translate(WIDTH / 2, y); const sc = lerp(1, 0.6, easeInOut(kt)); ctx.scale(sc, sc);
      text(`DAY ${day}`, 0, 0, 170, day === 12 ? C.gold : C.ink); ctx.restore();
    }
    if (kt > 0) body("with everyone still at the table", WIDTH / 2, 430, 64, C.ink, { alpha: seg(lt, w(9), w(9) + 0.5) });
    fadeOut(lt, d, 0.4);
  };

  /* ================================================================ i10 · go */
  // "There is no money in Ulm Hollow. Not yet. Can you keep your family fed until the festival?"
  SC.go = (lt, d, t, s) => {
    const w = (n) => word(s, n);
    market(t);
    alienS("you", 120, 132, t, 2);
    cam(120, 72, 1.05);
    const k1 = seg(lt, w(2), w(2) + 0.35), k2 = seg(lt, w(7), w(7) + 0.35), kq = seg(lt, w(9), w(9) + 0.5);
    if (k1 > 0) { ctx.fillStyle = `rgba(18,13,29,${0.75 * k1})`; ctx.fillRect(0, 50, WIDTH, 170); }
    text("NO MONEY.", WIDTH / 2 - (k2 > 0 ? 300 : 0), 130, 96, C.ink, { alpha: k1 * (1 - kq) });
    if (k2 > 0) { ctx.save(); ctx.globalAlpha = 1 - kq; ctx.translate(WIDTH / 2 + 330, 130); ctx.scale(pop(k2), pop(k2)); text("NOT YET.", 0, 0, 96, C.gold); ctx.restore(); }
    if (kq > 0) {
      ctx.fillStyle = `rgba(18,13,29,${0.86 * kq})`; ctx.fillRect(0, 0, WIDTH, H);
      const fam = [["gran", 760], ["tam", 960], ["ola", 1160]];
      for (const [id, x] of fam) hface(id, "ok", x, 330, 190, kq);
      body("Can you keep your family fed", WIDTH / 2, 560, 84, C.ink, { alpha: kq });
      body("until the festival?", WIDTH / 2, 670, 84, C.gold, { alpha: seg(lt, w(14), w(14) + 0.5) });
      text("DAY 1 STARTS NOW", WIDTH / 2, 860, 56, C.muted, { alpha: seg(lt, w(17), w(17) + 0.6) });
    }
    fadeOut(lt, d, 0.9);
  };
})();
