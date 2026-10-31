/* EP 02 · shared props for every chapter's scenes: ground, huts, the cave, beads, cowries, coins, charts.
   Loaded after scene.js; adds to window.TR. */
(function () {
  "use strict";
  const T = window.TR;
  const { ctx, lx, LO_W, LO_H, C, hash, px, disc, text } = T;
  /* ---------- small props ---------- */
  function ground(top, c1, c2) { px(0, top, LO_W, LO_H - top, c1); for (let i = 0; i < 40; i++) px(hash(i) * LO_W, top + 2 + hash(i + 40) * (LO_H - top - 3), 2, 1, c2); }
  function hut(x, base, roof = "#a4782e") {
    px(x - 12, base - 10, 24, 10, "#7a5a32"); px(x - 3, base - 7, 6, 7, "#2a1a10");
    for (let i = 0; i < 9; i++) px(x - 15 + i, base - 11 - i, 30 - 2 * i, 1, i % 2 ? roof : "#c49a4a");
  }
  function cave(x, y, w, h, t) {
    for (let i = 0; i < h; i++) { const hw = w / 2 + Math.round(Math.sin(i * 0.7) * 2) + i * 0.4; px(x - hw, y + i, hw * 2, 1, i % 4 ? "#5a4570" : "#4a3860"); }
    for (let i = 0; i < h * 0.7; i++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow(1 - i / (h * 0.7), 2))) * w * 0.25); px(x - hw, y + h * 0.3 + i, hw * 2, 1, "#0d0814"); }
    const g = 0.5 + 0.5 * Math.sin(t * 3);
    px(x - 3, y + h * 0.55, 2, 2, `rgba(255,111,181,${0.4 + 0.5 * g})`); px(x + 4, y + h * 0.7, 2, 2, `rgba(255,111,181,${0.9 - 0.5 * g})`);
  }
  function bead(cx, cy, s = 1) {  // an aggry-style glass bead: blue body, red/yellow chevrons
    for (let y = -5; y <= 5; y++) { const hw = Math.round(Math.sqrt(1 - (y / 6) ** 2) * 8); px(cx - hw * s, cy + y * s, hw * 2 * s, s, "#2e5fb8"); }
    for (let i = -6; i <= 6; i += 4) for (let y = -4; y <= 4; y++) px(cx + (i + Math.abs(y) * 0.6) * s, cy + y * s, s * 2, s, Math.abs(y) % 4 < 2 ? "#e0402f" : "#ffd23f");
    px(cx - 9 * s, cy - s, 2 * s, 2 * s, "#0d0814"); px(cx + 7 * s, cy - s, 2 * s, 2 * s, "#0d0814");
  }
  function cowrie(cx, cy, s = 1) {
    for (let y = -6; y <= 6; y++) { const hw = Math.round(Math.sqrt(1 - (y / 7) ** 2) * 5); px(cx - hw * s, cy + y * s, hw * 2 * s, s, y < -3 ? "#fffaf0" : "#efe2c2"); }
    px(cx - s / 2, cy - 5 * s, s, 10 * s, "#8c7650");
    for (let y = -4; y <= 4; y += 2) { px(cx - 2 * s, cy + y * s, s, s, "#8c7650"); px(cx + s, cy + y * s, s, s, "#8c7650"); }
  }
  function coin(cx, cy, r, s = 1) {
    disc(cx, cy, r * s, "#9aa3b5"); disc(cx, cy, (r - 2) * s, "#c9d0dc");
    px(cx - 2 * s, cy - 4 * s, 4 * s, 6 * s, "#7c8596"); px(cx - 3 * s, cy - 2 * s, s, 2 * s, "#7c8596"); px(cx - 1 * s, cy - 6 * s, 3 * s, 2 * s, "#7c8596");
  }
  function axe(x, y) { px(x, y, 1, 10, C.wood); px(x - 1, y, 5, 3, "#9aa3b5"); px(x + 3, y - 1, 2, 5, "#c9d0dc"); }
  function sack(x, y) { px(x, y, 7, 7, "#b89a64"); px(x + 1, y - 1, 5, 1, "#8c7650"); px(x + 2, y + 2, 3, 1, "#8c7650"); }
  // a little line chart drawn in hi-res: pts in [0,1], drawn up to k
  function chart(x, y, w, h, series, k, o = {}) {
    ctx.fillStyle = "rgba(18,13,29,.85)"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    if (o.title) text(o.title, x + w / 2, y + 36, 26, C.muted);
    for (const s of series) {
      const n = s.pts.length, upto = Math.max(1, Math.floor((n - 1) * k));
      ctx.strokeStyle = s.color; ctx.lineWidth = 10; ctx.lineJoin = "round"; ctx.beginPath();
      for (let i = 0; i <= upto; i++) { const px_ = x + 30 + (w - 60) * i / (n - 1), py = y + h - 30 - (h - 90) * s.pts[i]; i ? ctx.lineTo(px_, py) : ctx.moveTo(px_, py); }
      ctx.stroke();
    }
  }

  Object.assign(T, { ground, hut, cave, bead, cowrie, coin, axe, sack, chart });
})();
