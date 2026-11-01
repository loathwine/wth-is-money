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
  wren:  { body: '#ff8ac2', dark: '#b8407c', belly: '#ffd0e6', eyes: 2, top: 'stalks' },
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

/* ---------- your family: close-up faces whose mood shows how home is doing ---------- */
// mood: ok (smile) | hungry (frown, droopy eyes) | weak (grey, half-shut eyes, strength 1) |
//       sick (green, eyes shut, sweat) | worse (greener, flushed) | gone (a grey outline and a candle: they died)
const KIN = {
  gran: { hair: '#f4ecff', top: 'gran', shawl: '#8a7bb0', shawlD: '#5d4f86' },
  tam:  { hair: '#5fbf4a', top: 'sprout', small: true, shawl: '#4f9a3c', shawlD: '#2f6a24' },
  ola:  { hair: '#7a3f8a', top: 'bun', shawl: '#c0567a', shawlD: '#8a3456' },
};
const FACE = { ok: ['#f2a65a', '#b8692b', '#ffd9a8'], hungry: ['#d99a5e', '#9a5f2e', '#f0caa0'], weak: ['#b8997e', '#7a6250', '#d8c2ac'],
  sick: ['#b7c86a', '#6f8a3a', '#dfeaa8'], worse: ['#93b85a', '#55752c', '#cfe39a'] };
function drawFace(ctx, id, mood = 'ok') {
  const K = KIN[id], [body, dark, cheek] = FACE[mood] || FACE.ok, sm = K.small ? 1 : 0;
  const px = (x, y, w = 1, h = 1, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  ctx.clearRect(0, 0, 16, 16);
  const rows = sm ? [6, 8, 10, 10, 10, 10, 10, 8, 6] : [6, 10, 12, 12, 12, 12, 12, 12, 10, 6];
  const top = 16 - rows.length - 1;
  if (mood === 'gone') {   // an outline where they used to be, and a small candle
    rows.forEach((w, i) => { px(8 - w / 2, top + i, 1, 1, '#6c5f93'); px(8 + w / 2 - 1, top + i, 1, 1, '#6c5f93'); });
    px(8 - rows[0] / 2, top, rows[0], 1, '#6c5f93'); px(8 - rows[rows.length - 1] / 2, top + rows.length - 1, rows[rows.length - 1], 1, '#6c5f93');
    px(12, 10, 2, 5, '#f4ecff'); px(12, 8, 2, 2, '#ffd23f'); px(12, 7, 1, 1, '#ff8a3d');
    return;
  }
  rows.forEach((w, i) => { px(8 - w / 2, top + i, w, 1, body); px(8 + w / 2 - 1, top + i, 1, 1, dark); });
  // hair / tops
  if (K.top === 'gran') { px(4, top - 1, 8, 2, K.hair); px(3, top + 1, 2, 3, K.hair); px(11, top + 1, 2, 3, K.hair); }
  if (K.top === 'sprout') { px(8, top - 3, 1, 3, '#3f8a34'); px(9, top - 3, 2, 1, K.hair); px(6, top - 2, 2, 1, K.hair); }
  if (K.top === 'bun') { px(6, top - 3, 4, 3, K.hair); px(4, top, 8, 1, K.hair); }
  // eyes
  const ey = top + (sm ? 3 : 4), ex = sm ? [6, 9] : [5, 9];
  for (const x of ex) {
    if (mood === 'sick' || mood === 'worse') px(x, ey + 1, 2, 1, '#1a1026');                 // shut
    else if (mood === 'hungry' || mood === 'weak') { px(x, ey + 1, 2, 1, '#fff'); px(x + (x < 8 ? 1 : 0), ey + 1, 1, 1, '#1a1026'); px(x, ey, 2, 1, dark); }
    else { px(x, ey, 2, 2, '#fff'); px(x + (x < 8 ? 1 : 0), ey + 1, 1, 1, '#1a1026'); }
  }
  if (id === 'gran' && mood !== 'sick' && mood !== 'worse') { px(4, ey - 1, 4, 1, '#c9a77c'); px(9, ey - 1, 4, 1, '#c9a77c'); }   // spectacles
  // mouth
  const my = ey + (sm ? 3 : 4), mx = sm ? 6 : 6;
  if (mood === 'ok') { px(mx, my, 1, 1, '#1a1026'); px(mx + 1, my + 1, 2, 1, '#1a1026'); px(mx + 3, my, 1, 1, '#1a1026'); px(mx - 2, my - 1, 1, 1, cheek); px(mx + 5, my - 1, 1, 1, cheek); }
  else if (mood === 'hungry') { px(mx, my + 1, 1, 1, '#1a1026'); px(mx + 1, my, 2, 1, '#1a1026'); px(mx + 3, my + 1, 1, 1, '#1a1026'); }
  else if (mood === 'weak') { px(mx, my + 1, 4, 1, '#1a1026'); px(3, ey + 2, 1, 2, '#9a8a9a'); }
  else { px(mx, my, 4, 1, '#1a1026'); px(mx + 1, my, 1, 1, '#ff8ac2'); }
  if (mood === 'sick' || mood === 'worse') px(13, ey - 1, 1, 2, '#4de1e8');                    // sweat
  if (mood === 'worse') { px(3, my - 1, 2, 1, '#ff6f6f'); px(11, my - 1, 2, 1, '#ff6f6f'); }  // fever
}
const faceCache = {}, faceCanvases = {};
function faceCanvas(id, mood = 'ok') {
  const k = id + mood;
  if (!faceCanvases[k]) { const c = document.createElement('canvas'); c.width = c.height = 16; drawFace(c.getContext('2d'), id, mood); faceCanvases[k] = c; }
  return faceCanvases[k];
}
function faceURL(id, mood = 'ok') {
  const k = id + mood;
  if (!faceCache[k]) faceCache[k] = faceCanvas(id, mood).toDataURL();
  return faceCache[k];
}

/* ---------- home in the evening ----------
   drawKin: one family member, 16×24, at the table. drawHome: the whole room, 176×132,
   H = { members: [{ id, mood, hp, alive, inBed }], bowl, crust, dose, jar: { pen, zir }, cave, caveNight,
         fire, dark, festival, t } */
const HOME_W = 176, HOME_H = 132;
const SEATS = { gran: 60, tam: 84, ola: 108 };   // x centre of each chair
function drawKin(ctx, id, mood, x, y) {
  const K = KIN[id], sm = K.small ? 3 : 0, slump = mood === 'weak' ? 2 : 0;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(a), Math.round(b), w, h); };
  const bw = K.small ? 10 : 12, by = y + 15 + sm + slump;
  const col = mood === 'weak' ? '#7d708f' : K.shawl, colD = mood === 'weak' ? '#544a63' : K.shawlD;
  px(x + 8 - bw / 2, by, bw, 24 - 15 - sm, col); px(x + 8 + bw / 2 - 1, by, 1, 24 - 15 - sm, colD);
  px(x + 8 - bw / 2 - 1, by + 1, 1, 5, colD); px(x + 8 + bw / 2, by + 1, 1, 5, colD);   // arms
  const skin = (FACE[mood] || FACE.ok)[0];
  if (mood === 'hungry' || mood === 'weak') px(x + 6, by + 4, 4, 2, skin);   // a hand on the belly
  else { px(x + 8 - bw / 2 - 1, by + 6, 2, 2, skin); px(x + 8 + bw / 2 - 1, by + 6, 2, 2, skin); }
  ctx.drawImage(faceCanvas(id, mood === 'weak' ? 'weak' : mood === 'hungry' ? 'hungry' : 'ok'), Math.round(x), Math.round(y + sm + slump));
}
function drawCandle(ctx, x, y, t) {
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  ctx.fillStyle = 'rgba(255, 210, 63, .14)'; ctx.beginPath(); ctx.arc(x + 1, y - 2, 9, 0, 7); ctx.fill();
  px(x - 1, y + 6, 4, 1, '#9aa3b5');
  px(x, y, 2, 6, '#f4ecff'); px(x + 1, y, 1, 6, '#c9bdd9');
  const f = Math.sin(t * 9) > 0 ? 0 : 1;
  px(x, y - 3 + f, 2, 3 - f, '#ffd23f'); px(x, y - 4 + f, 1, 1, '#ff8a3d');
}
function drawHome(ctx, H) {
  const t = H.t || 0, W = HOME_W;
  const px = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(a), Math.round(b), w, h); };
  ctx.clearRect(0, 0, W, HOME_H);
  // back wall: planks; floor: boards
  px(0, 0, W, 96, '#5a3d2b');
  for (let y = 4; y < 96; y += 8) px(0, y, W, 1, '#6e4a33');
  for (let i = 0; i < 12; i++) px(Math.floor(hash(i, 3) * W), 6 + Math.floor(hash(i, 7) * 10) * 8 + 2, 6, 1, '#4a3222');
  px(0, 0, W, 4, '#3a2718');
  px(0, 96, W, 36, '#3a2718');
  for (let y = 100; y < HOME_H; y += 7) px(0, y, W, 1, '#2c1d12');
  px(0, 96, W, 2, '#2a1a12');
  // window: the night sky (Wren's cave is up the hill)
  const wx = 64, wy = 12, ww = 40, wh = 32;
  px(wx - 3, wy - 3, ww + 6, wh + 6, '#2a1a12');
  px(wx, wy, ww, wh, H.festival ? '#2a1850' : '#16103a');
  for (let i = 0; i < 7; i++) px(wx + 2 + Math.floor(hash(i, 11) * (ww - 4)), wy + 2 + Math.floor(hash(i, 13) * (wh - 8)), 1, 1, '#ab9fcb');
  px(wx + 27, wy + 5, 6, 6, '#fff3a0'); px(wx + 26, wy + 6, 1, 4, '#fff3a0'); px(wx + 33, wy + 6, 1, 4, '#fff3a0'); px(wx + 30, wy + 6, 3, 3, '#e8d880');
  px(wx, wy + wh - 6, ww, 6, '#1f4a3f'); px(wx + 8, wy + wh - 9, 10, 3, '#1f4a3f'); px(wx + 22, wy + wh - 11, 14, 5, '#173a31');
  if (H.cave) for (let i = 0; i < 5; i++) {   // pentaja glints drifting down from the hill
    const gx = wx + ((t * 6 + i * 9) % ww), gy = wy + 4 + ((i * 7 + t * 3) % (wh - 10));
    px(gx, gy, 1, 1, '#ff6fb5'); if (i % 2) px(gx + 1, gy, 1, 1, '#ffb3d9');
  }
  if (H.caveNight) { ctx.fillStyle = `rgba(255, 111, 181, ${0.25 + 0.25 * Math.max(0, Math.sin(t * 3))})`; ctx.fillRect(wx, wy, ww, wh); }
  if (H.festival) for (let i = 0; i < 5; i++) { const lx = wx + 4 + i * 8; px(lx, wy + 4 + (i % 2) * 2, 4, 5, ['#ffd23f', '#ff6fb5', '#4de1e8', '#8fd16a', '#ff8a3d'][i]); }
  px(wx + ww / 2 - 1, wy, 2, wh, '#2a1a12'); px(wx, wy + wh / 2 - 1, ww, 2, '#2a1a12');
  // shelf with Gran's jar: one pixel cluster per crystal
  px(118, 44, 46, 3, '#9c6c47'); px(118, 47, 46, 1, '#5a3a25'); px(122, 47, 2, 5, '#5a3a25'); px(158, 47, 2, 5, '#5a3a25');
  const jx = 132, jy = 24;
  px(jx + 3, jy, 10, 2, '#9c6c47');
  px(jx, jy + 3, 16, 17, 'rgba(196, 251, 255, .18)'); px(jx, jy + 3, 1, 17, '#c4fbff'); px(jx + 15, jy + 3, 1, 17, '#7fb8c0'); px(jx, jy + 19, 16, 1, '#7fb8c0');
  px(jx + 2, jy + 2, 12, 1, '#c4fbff');
  const J = H.jar || { pen: 0, zir: 0 }, crystals = [...Array(Math.min(J.pen, 16)).fill('#ff6fb5'), ...Array(Math.min(J.zir, 8)).fill('#4de1e8')];
  crystals.forEach((c, i) => { const cx = jx + 2 + (i % 4) * 3, cy = jy + 16 - Math.floor(i / 4) * 3; px(cx, cy, 2, 2, c); px(cx, cy, 1, 1, '#fff'); });
  if (H.cave && J.pen) { px(jx + 11, jy + 6, 1, 3, '#8a8a8a'); px(jx + 10, jy + 9, 1, 3, '#8a8a8a'); px(jx + 11, jy + 12, 1, 2, '#8a8a8a'); }
  // hearth: lit when the tools are fine, embers when they broke
  px(4, 46, 40, 50, '#4a3f68'); px(4, 46, 40, 4, '#6c5f93');
  for (let y = 50; y < 96; y += 6) for (let x = 4 + ((y / 6) % 2) * 5; x < 44; x += 10) px(x, y, 1, 6, '#3a3052');
  px(10, 64, 28, 32, '#1a1026');
  if (H.fire !== false) {
    const f = i => Math.round(Math.sin(t * 8 + i * 1.7) * 2);
    px(14, 90, 20, 4, '#5b3a25');
    px(16, 80 + f(1), 6, 11 - f(1), '#ff8a3d'); px(22, 76 + f(2), 6, 15 - f(2), '#ff8a3d'); px(28, 82 + f(3), 4, 9 - f(3), '#ff8a3d');
    px(18, 84 + f(4), 3, 7, '#ffd23f'); px(23, 81 + f(5), 4, 10, '#ffd23f'); px(24, 86, 2, 4, '#fff3a0');
  } else { px(14, 90, 20, 4, '#3a2a1e'); px(18, 89, 3, 2, '#b8401f'); px(25, 90, 4, 1, '#ff5a2a'); px(29, 89, 2, 1, '#8a2a1a'); }
  // bed (right): whoever is sick lies in it
  const sick = H.members.find(m => m.alive && m.inBed);
  px(128, 92, 46, 4, '#7a5235'); px(168, 78, 6, 34, '#7a5235'); px(128, 96, 4, 16, '#5a3a25'); px(170, 96, 4, 16, '#5a3a25');
  px(152, 86, 16, 8, '#f4ecff');
  if (sick) ctx.drawImage(faceCanvas(sick.id, sick.mood === 'worse' ? 'worse' : 'sick'), 152, 76);
  px(128, 88, sick ? 26 : 40, 9, '#4e3f78'); px(128, 88, sick ? 26 : 40, 1, '#6c5f93');
  if (sick) { px(130, 86, 20, 3, '#4e3f78'); px(130, 86, 20, 1, '#6c5f93'); }
  if (H.dose) ctx.drawImage(iconCanvas.dri, 132, 108);   // tonight's mushroom by the bed
  // the family at the table (dead: an empty chair and a candle)
  for (const m of H.members) {
    const cx = SEATS[m.id];
    px(cx - 6, 58, 12, 3, '#6e4a33'); px(cx - 6, 58, 2, 34, '#6e4a33'); px(cx + 4, 58, 2, 34, '#6e4a33');   // chair back
    if (m.alive && !m.inBed) drawKin(ctx, m.id, m.mood, cx - 8, 62);
  }
  px(44, 88, 80, 4, '#9c6c47'); px(44, 92, 80, 4, '#7a5235'); px(48, 96, 3, 18, '#5a3a25'); px(117, 96, 3, 18, '#5a3a25');
  // the bowl: tonight's lumfruit, glowing
  const bx = 76;
  if (H.bowl > 0) { ctx.fillStyle = 'rgba(255, 210, 63, .18)'; ctx.beginPath(); ctx.arc(bx + 8, 86, 12, 0, 7); ctx.fill(); }
  for (let i = 0; i < Math.min(3, H.bowl || 0); i++) ctx.drawImage(iconCanvas.lum, bx + [2, -3, 7][i], i ? 80 : 78);
  px(bx - 1, 88, 18, 2, '#e8d0a0'); px(bx, 90, 16, 3, '#b8743a'); px(bx + 2, 93, 12, 1, '#7a4a22');
  if (H.crust && !(H.members.find(m => m.id === H.crust) || {}).inBed) { const cx = SEATS[H.crust]; px(cx - 3, 89, 6, 3, '#a8743a'); px(cx - 2, 88, 4, 1, '#c9945a'); }
  for (const m of H.members) if (!m.alive) drawCandle(ctx, SEATS[m.id] - 1, 80, t);
  // you, by the door
  drawAlien(ctx, 22, 124, 'you', t * 0.3);
  // strength: three pips on the floor under each person (in bed: under the bed)
  for (const m of H.members) {
    if (!m.alive) continue;
    const cx = m.inBed ? 150 : SEATS[m.id];
    for (let i = 0; i < 3; i++) {
      const on = i < m.hp, x = cx - 7 + i * 5, y = 120;
      px(x, y, 4, 4, '#1a1026'); px(x + 1, y + 1, 2, 2, on ? (m.hp <= 1 ? '#ff5a5a' : '#ff6fb5') : '#3a2d5c');
    }
  }
  if (H.dark) { ctx.fillStyle = `rgba(10, 4, 30, ${H.dark})`; ctx.fillRect(0, 0, W, HOME_H); }
}

/* ---------- map ---------- */
// Phones get a portrait village (two columns of stalls, home at the bottom) that fills the screen.
// ?phone=1 / ?phone=0 force either layout.
const q = new URLSearchParams(location.search).get('phone');
const PHONE = q != null ? q === '1' : matchMedia('(max-width: 700px)').matches;
// On a phone the map is 14 tiles wide and as tall as the screen allows (18–28 tiles, leaving about 220px for the bars, the pack strip
// and GO HOME); the plaza stays put and the grass around your hut grows or shrinks. On a short screen the hut sits just under the
// plaza and the bottom of the map is cut off: only its roof and door show.
const TILE = 16, MW = PHONE ? 14 : 24;
const MH = PHONE ? Math.max(18, Math.min(28, Math.floor(MW * (innerHeight - 220) / innerWidth))) : 14;
const B = Math.max(-8, (MH - 24) * TILE); // phone: how far the hut and its garden move down from the 24-row layout

// Stalls: counter tile row + leftmost tile column. NPC stands just behind (north of) the counter.
const STALLS = PHONE ? {
  mira: { tx: 2, ty: 3 }, bob:  { tx: 9, ty: 3 },
  sela: { tx: 2, ty: 8 }, dov:  { tx: 9, ty: 8 },
  wren:  { tx: 2, ty: 13 }, hesk: { tx: 9, ty: 13 },
} : {
  mira: { tx: 9,  ty: 3 }, bob:  { tx: 14, ty: 3 }, sela: { tx: 19, ty: 3 },
  dov:  { tx: 9,  ty: 9 }, wren:  { tx: 14, ty: 9 }, hesk: { tx: 19, ty: 9 },
};
const AWNING = { mira: '#ffd23f', bob: '#9aa3b5', sela: '#e9f0ff', dov: '#c77dff', wren: '#ff6fb5', hesk: '#4de1e8' };
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

window.Art = { ICONS, iconCanvas, iconURL, LOOKS, drawAlien, drawPortrait, drawFace, faceURL, faceCanvas, buildBackground, drawStall, drawTree,
  drawKin, drawHome, drawCandle, HOME_W, HOME_H, STALLS, HUT, DOOR, TREES, STONE, TILE, MW, MH, PHONE };
})();
