/* ============================================================
   Pixel art: good icons, alien villagers, the village map.
   Everything is drawn in code; no image files.
   ============================================================ */
(function () {
'use strict';

const ICONS = {
  lum: { pal: { g: '#5fbf4a', y: '#ffd23f', Y: '#fff3a0', W: '#ffffff', o: '#d9932b' }, px: [
    '......gg....',
    '.....g......',
    '...yyyyy....',
    '..yWYYyyy...',
    '.yWYYYyyyy..',
    '.yYYYyyyyyo.',
    '.yYyyyyyyyo.',
    '.yyyyyyyyoo.',
    '..yyyyyyoo..',
    '...ooooooo..',
    '............',
    '............'] },
  bog: { pal: { b: '#8fd16a', B: '#c8f2a8', d: '#4f8a3a' }, px: [
    '............',
    '...bb..bb...',
    '..bBBbbBBb..',
    '.bBBbbbbBbb.',
    'bBbbbbbbbbbb',
    'bbbbbbbbbbbd',
    '.bbbbbbbbbd.',
    'bbbbbbbbbbdd',
    '.bdbbbbdbdd.',
    '..dd.dd.dd..',
    '............',
    '............'] },
  ket: { pal: { k: '#9aa3b5', K: '#d3d8e4', d: '#5b6274', o: '#ff8a3d', O: '#ffd23f' }, px: [
    '............',
    '...kkkkk....',
    '..kKKkkkk...',
    '.kKkkkokkk..',
    '.kkkkoOokkk.',
    'kkkkkkokkkkd',
    'kkkokkkkkkdd',
    'kkoOokkkkddd',
    '.kkokkkkdddd',
    '..dddddddd..',
    '............',
    '............'] },
  snm: { pal: { j: '#b58a5a', w: '#e9f0ff', W: '#ffffff', s: '#a9b6d6' }, px: [
    '............',
    '....jjjj....',
    '....j..j....',
    '...wwwwww...',
    '..wWwwwwww..',
    '..wWwwwwww..',
    '..wwwwwwws..',
    '..wwwwwwws..',
    '..wwwwwwss..',
    '...ssssss...',
    '............',
    '............'] },
  dri: { pal: { p: '#c77dff', P: '#ecc8ff', q: '#7d3fb8', s: '#efe6d6', '~': '#4de1e8' }, px: [
    '............',
    '....pppp....',
    '..pPPpppp...',
    '.pPpppPpppp.',
    'pppppppppppq',
    'qqqqqqqqqqqq',
    '.....ss.....',
    '.....ss.....',
    '......s.....',
    '............',
    '..~......~..',
    '............'] },
  pen: { pal: { p: '#ff6fb5', P: '#ffb3d9', W: '#ffffff', d: '#b8337a' }, px: [
    '............',
    '.....P......',
    '....PWp.....',
    '...PWppp....',
    '..PWpppppp..',
    '.PPppppppppd',
    '..pppppppdd.',
    '..ppppppddd.',
    '...pppppdd..',
    '...ddddddd..',
    '............',
    '............'] },
  zir: { pal: { z: '#4de1e8', Z: '#c4fbff', c: '#1f8f9a' }, px: [
    '............',
    '....zzzz....',
    '..zZZzzzzz..',
    '.zZzzzzzzzz.',
    '.zZzz..zzzc.',
    '.zzz....zzc.',
    '.zzz....zzc.',
    '.zzzz..zzcc.',
    '..zzzzzzcc..',
    '....cccc....',
    '............',
    '............'] },
};

const iconCanvas = {};
const iconURL = {};
for (const g in ICONS) {
  const c = document.createElement('canvas'); c.width = 12; c.height = 12;
  const x = c.getContext('2d');
  ICONS[g].px.forEach((row, y) => [...row].forEach((ch, i) => {
    const col = ICONS[g].pal[ch]; if (!col) return;
    x.fillStyle = col; x.fillRect(i, y, 1, 1);
  }));
  iconCanvas[g] = c; iconURL[g] = c.toDataURL();
}

/* ---------- villagers ---------- */
const LOOKS = {
  you:  { body: '#f2a65a', dark: '#b8692b', belly: '#ffd9a8', eyes: 2, top: 'pack' },
  mira: { body: '#7fd36b', dark: '#3f8a34', belly: '#d4f7c2', eyes: 2, top: 'leaf' },
  bob:  { body: '#8d93a6', dark: '#555b6e', belly: '#c3c8d6', eyes: 1, top: 'none', wide: true },
  sela: { body: '#eef2ff', dark: '#a5afd0', belly: '#ffffff', eyes: 2, top: 'fluff' },
  dov:  { body: '#b27ae8', dark: '#6c3aa3', belly: '#e4c9ff', eyes: 3, top: 'cap' },
  rod:  { body: '#ff8ac2', dark: '#b8407c', belly: '#ffd0e6', eyes: 2, top: 'stalks' },
  hesk: { body: '#5cc8cf', dark: '#2a7e86', belly: '#bff3f5', eyes: 1, top: 'beard' },
};

const ROWS = [4, 6, 8, 10, 10, 12, 12, 12, 12, 12, 10, 8];

function drawAlien(ctx, cx, feetY, id, t) {
  const L = LOOKS[id];
  const phase = id.charCodeAt(0) * 0.7;
  const hop = Math.sin(t * 3 + phase) > 0.6 ? -1 : 0;
  const w = L.wide ? 2 : 0;
  const top = Math.round(feetY - 15 + hop);
  cx = Math.round(cx);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(cx - 5 - w / 2, feetY - 1, 10 + w, 2);
  // feet
  ctx.fillStyle = L.dark;
  ctx.fillRect(cx - 4, feetY - 3 + hop, 3, 2);
  ctx.fillRect(cx + 1, feetY - 3 + hop, 3, 2);
  // body
  ROWS.forEach((rw, i) => {
    rw += w;
    const x = cx - rw / 2, y = top + i;
    ctx.fillStyle = L.body; ctx.fillRect(x, y, rw, 1);
    ctx.fillStyle = L.dark; ctx.fillRect(x + rw - 1, y, 1, 1);
    if (i >= 7) { ctx.fillStyle = L.belly; ctx.fillRect(cx - 2, y, 4, 1); }
  });
  // eyes (they blink)
  const blink = (t * 1.3 + phase) % 4 < 0.12;
  const ey = top + 4;
  const xs = L.eyes === 1 ? [0] : L.eyes === 2 ? [-2, 2] : [-3, 0, 3];
  for (const dx of xs) {
    ctx.fillStyle = '#fff'; ctx.fillRect(cx + dx - 1, ey, 2, blink ? 1 : 2);
    if (!blink) { ctx.fillStyle = '#1a1026'; ctx.fillRect(cx + dx, ey + 1, 1, 1); }
  }
  // tops
  ctx.fillStyle = L.dark;
  if (L.top === 'leaf') { ctx.fillStyle = '#ffd23f'; ctx.fillRect(cx - 1, top - 3, 2, 3); ctx.fillStyle = '#5fbf4a'; ctx.fillRect(cx + 1, top - 3, 3, 1); }
  if (L.top === 'stalks') { ctx.fillRect(cx - 3, top - 3, 1, 3); ctx.fillRect(cx + 2, top - 3, 1, 3); ctx.fillStyle = '#fff'; ctx.fillRect(cx - 4, top - 4, 2, 1); ctx.fillRect(cx + 2, top - 4, 2, 1); }
  if (L.top === 'cap') { ctx.fillStyle = '#7d3fb8'; ctx.fillRect(cx - 5, top - 1, 10, 2); ctx.fillRect(cx - 3, top - 3, 6, 2); }
  if (L.top === 'fluff') { ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 4, top - 2, 3, 2); ctx.fillRect(cx - 1, top - 3, 3, 3); ctx.fillRect(cx + 2, top - 2, 3, 2); }
  if (L.top === 'beard') { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(cx - 3, top + 7, 6, 3); ctx.fillRect(cx - 2, top + 10, 4, 2); }
  if (L.top === 'pack') { ctx.fillStyle = '#8a5a2b'; ctx.fillRect(cx - 7, top + 5, 3, 6); ctx.fillStyle = '#5fbf4a'; ctx.fillRect(cx - 7, top + 4, 3, 1); }
}

function drawPortrait(canvas, id, t = 0) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAlien(ctx, canvas.width / 2, canvas.height - 3, id, t);
}

/* ---------- map ---------- */
// Phones get a portrait village (two columns of stalls, home at the bottom) that fills the screen.
// ?phone=1 / ?phone=0 force either layout.
const q = new URLSearchParams(location.search).get('phone');
const PHONE = q != null ? q === '1' : matchMedia('(max-width: 700px)').matches;
// On a phone the map is 14 tiles wide and as tall as the screen allows (22–28 tiles, leaving room for the trade log); the plaza
// stays put and the grass around your hut grows or shrinks.
const TILE = 16, MW = PHONE ? 14 : 24;
const MH = PHONE ? Math.max(22, Math.min(28, Math.floor(MW * (innerHeight - 170) / innerWidth))) : 14;
const B = (MH - 24) * TILE; // phone: how far the hut and its garden move down from the 24-row layout

// Stalls: counter tile row + leftmost tile column. NPC stands just behind (north of) the counter.
const STALLS = PHONE ? {
  mira: { tx: 2, ty: 3 }, bob:  { tx: 9, ty: 3 },
  sela: { tx: 2, ty: 8 }, dov:  { tx: 9, ty: 8 },
  rod:  { tx: 2, ty: 13 }, hesk: { tx: 9, ty: 13 },
} : {
  mira: { tx: 9,  ty: 3 }, bob:  { tx: 14, ty: 3 }, sela: { tx: 19, ty: 3 },
  dov:  { tx: 9,  ty: 9 }, rod:  { tx: 14, ty: 9 }, hesk: { tx: 19, ty: 9 },
};
const AWNING = { mira: '#ffd23f', bob: '#9aa3b5', sela: '#e9f0ff', dov: '#c77dff', rod: '#ff6fb5', hesk: '#4de1e8' };
for (const id in STALLS) {
  const s = STALLS[id];
  s.npc = { x: s.tx * TILE + 24, y: s.ty * TILE + 6 };
  s.counter = { x: s.tx * TILE, y: s.ty * TILE + 4, w: 48, h: 12 };
  s.front = { x: s.tx * TILE + 24, y: s.ty * TILE + 26 };
}
const HUT = PHONE ? { x: 20, y: 282 + B, w: 80, h: 72 } : { x: 16, y: 40, w: 80, h: 72 };
const DOOR = { x: HUT.x + 40, y: HUT.y + HUT.h + 12 };
const TREES = PHONE ? [[200, 300], [212, 352], [140, 336], [112, 306], [130, 296]].map(([x, y]) => [x, y + B]) : [[20, 20], [100, 26], [24, 180], [70, 200], [112, 170], [372, 120], [120, 92]];
// the glowing standing stone in the middle of the plaza
const STONE = PHONE ? { x: 112, y: 250 } : { x: 15 * TILE + 8, y: 6 * TILE + 8 };

function hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return (h ^ (h >>> 16)) / 4294967296; }

function buildBackground() {
  const c = document.createElement('canvas'); c.width = MW * TILE; c.height = MH * TILE;
  const ctx = c.getContext('2d');
  const isPlaza = PHONE ? (tx, ty) => tx >= 1 && tx <= 12 && ty >= 1 && ty <= 16 : (tx, ty) => tx >= 8 && ty >= 1 && ty <= 12;
  const isPath = PHONE ? (tx, ty) => (ty === MH - 1 && tx >= 3 && tx <= 10) || (tx === 10 && ty >= 17 && ty <= MH - 1)
    : (tx, ty) => (ty === 8 && tx >= 3 && tx <= 6) || (tx === 6 && ty >= 6 && ty <= 8) || (ty === 6 && tx >= 6 && tx < 8);
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const X = tx * TILE, Y = ty * TILE;
    if (isPlaza(tx, ty)) {
      ctx.fillStyle = (tx + ty) % 2 ? '#3b3152' : '#40355a'; ctx.fillRect(X, Y, TILE, TILE);
      ctx.fillStyle = '#2c2440'; ctx.fillRect(X, Y + 15, TILE, 1); ctx.fillRect(X + 15, Y, 1, TILE);
      if (hash(tx, ty) < 0.3) { ctx.fillStyle = '#4a3f68'; ctx.fillRect(X + 4, Y + 5, 3, 2); }
    } else if (isPath(tx, ty)) {
      ctx.fillStyle = '#6b5640'; ctx.fillRect(X, Y, TILE, TILE);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#7d6649'; ctx.fillRect(X + Math.floor(hash(tx * 7 + i, ty) * 15), Y + Math.floor(hash(tx, ty * 5 + i) * 15), 2, 1); }
    } else {
      ctx.fillStyle = '#1f4a3f'; ctx.fillRect(X, Y, TILE, TILE);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = hash(tx * 13 + i, ty * 3) < 0.5 ? '#2a5e4f' : '#173a31';
        ctx.fillRect(X + Math.floor(hash(tx + i * 31, ty) * 15), Y + Math.floor(hash(tx, ty + i * 17) * 14), 1, 2);
      }
      if (hash(tx * 3, ty * 11) < 0.06) { ctx.fillStyle = '#ff8ac2'; ctx.fillRect(X + 7, Y + 7, 2, 2); }
    }
  }
  // plaza centrepiece: a glowing standing stone
  const ox = STONE.x, oy = STONE.y;
  ctx.fillStyle = '#2c2440'; ctx.fillRect(ox - 8, oy + 6, 16, 4);
  ctx.fillStyle = '#5a4a86'; ctx.fillRect(ox - 4, oy - 12, 8, 20);
  ctx.fillStyle = '#7b66b5'; ctx.fillRect(ox - 4, oy - 12, 3, 20);
  ctx.fillStyle = '#4de1e8'; ctx.fillRect(ox - 1, oy - 8, 2, 2); ctx.fillRect(ox - 1, oy - 3, 2, 2);
  // hut
  const h = HUT;
  ctx.fillStyle = '#5a3d2b'; ctx.fillRect(h.x + 6, h.y + 30, h.w - 12, h.h - 30);
  ctx.fillStyle = '#6e4a33'; for (let y = h.y + 34; y < h.y + h.h; y += 6) ctx.fillRect(h.x + 6, y, h.w - 12, 1);
  for (let i = 0; i < 34; i++) { ctx.fillStyle = i % 4 ? '#8fd16a' : '#4f8a3a'; ctx.fillRect(h.x + h.w / 2 - (i + 4), h.y + i, 2 * (i + 4), 1); }
  ctx.fillStyle = '#2a1a12'; ctx.fillRect(DOOR.x - 7, h.y + h.h - 22, 14, 22);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(DOOR.x + 3, h.y + h.h - 12, 2, 2);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(h.x + 14, h.y + 44, 10, 8); ctx.fillRect(h.x + h.w - 24, h.y + 44, 10, 8);
  // trees
  for (const [x, y] of TREES) drawTree(ctx, x, y);
  return c;
}

function drawTree(ctx, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - 8, y + 10, 16, 3);
  ctx.fillStyle = '#5b3a6e'; ctx.fillRect(x - 2, y - 2, 4, 13);
  ctx.fillStyle = '#2f9e8f'; ctx.fillRect(x - 9, y - 12, 18, 10); ctx.fillRect(x - 6, y - 16, 12, 4);
  ctx.fillStyle = '#4de1c4'; ctx.fillRect(x - 6, y - 13, 5, 3); ctx.fillRect(x + 2, y - 9, 3, 2);
}

function drawStall(ctx, id, goods, open) {
  const s = STALLS[id];
  const { x, y, w, h } = s.counter;
  // awning posts + canopy
  ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x + 1, y - 26, 2, 26); ctx.fillRect(x + w - 3, y - 26, 2, 26);
  for (let i = 0; i < w; i += 8) {
    ctx.fillStyle = open ? ((i / 8) % 2 ? AWNING[id] : '#f4ecff') : '#4a3f68';
    ctx.fillRect(x + i, y - 30, 8, 7);
  }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y - 23, w, 2);
  // counter
  ctx.fillStyle = '#7a5235'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#9c6c47'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = '#5a3a25'; ctx.fillRect(x, y + h - 2, w, 2);
  if (!open) {
    ctx.fillStyle = '#4a3f68'; ctx.fillRect(x + 2, y - 2, w - 4, h);
    ctx.fillStyle = '#6c5f93'; ctx.fillRect(x + 2, y - 2, w - 4, 2);
    return;
  }
  // wares on display
  goods.slice(0, 3).forEach((g, i) => ctx.drawImage(iconCanvas[g], x + 4 + i * 14, y - 7));
}

window.Art = { ICONS, iconCanvas, iconURL, LOOKS, drawAlien, drawPortrait, buildBackground, drawStall, drawTree,
  STALLS, HUT, DOOR, TREES, STONE, TILE, MW, MH, PHONE };
})();
