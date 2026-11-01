/* ============================================================
   EP 01 · The Barter Market — the playable village.
   The economy lives in sim.js; the evening dialogue in evening.js;
   this file is input, drawing and story.
   ============================================================ */
(function () {
'use strict';

const { GOODS, IDS } = Sim;
const { STALLS, DOOR, HUT, TREES, STONE, TILE, PHONE } = Art;
const $ = s => document.querySelector(s);
const NPCS = ['mira', 'bob', 'sela', 'dov', 'wren', 'hesk'];
const params = new URLSearchParams(location.search);
const TOUCH = matchMedia('(pointer: coarse)').matches;
const NARROW = () => matchMedia('(max-width: 900px)').matches;
const SEED = +(params.get('seed') ?? 39);   // the default village: Dov away while Gran is sick, lean nights after the cave, a jar that ends up buying 1 mushroom
// Phone controls (the pack strip and GO HOME under the village, no side panel) on a portrait phone
// (Art.PHONE: the tall map) and on a phone held sideways (the wide map, the strip as a rail on the right).
const LANDQ = matchMedia('(pointer: coarse) and (max-height: 500px) and (orientation: landscape)');
const UI = PHONE || LANDQ.matches;
const MOVIE = '../../video/ep02/barter/out/ep02-barter.mp4';
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

// Driftcap is the medicine: always the floating-mushroom icon, called "medicine" on cards and chips.
const UINAME = { dri: 'Medicine' };
const GN = g => UINAME[g] || GOODS[g].name;
const SHORT = { lum: 'lumfruit', bog: 'bogwool', ket: 'stone', snm: 'milk', dri: 'medicine', pen: 'pentaja', zir: 'zirnet' };
const icon = (g, cls = '') => `<img class="gi ${cls}" src="${Art.iconURL[g]}" alt="${GN(g)}" title="${GN(g)}">`;
const gname = (g, n = 1) => g === 'dri' ? (n === 1 ? 'mushroom' : 'mushrooms') : GOODS[g].name + (n === 1 || /s$|wool$|milk$|ja$|net$/.test(GOODS[g].name) ? '' : 's');
const FEST = Sim.FESTIVAL;
const KIN = { gran: 'Gran', tam: 'Tam', ola: 'Ola' };   // what the family calls each other
const face = (id, mood = 'ok', cls = '') => `<img class="face ${mood} ${cls}" src="${Art.faceURL(id, mood)}" alt="${famName(id)}">`;
const famName = id => Sim.FAMILY.find(f => f.id === id).name;
const famFaces = (cls = '') => Sim.FAMILY.map(f => face(f.id, 'ok', cls)).join('');
// where you start each morning: in the plaza by the standing stone, not at your door
const START = PHONE ? { x: STONE.x + 26, y: STONE.y + 4 } : { x: STONE.x, y: STONE.y + 30 };
const nm = id => Sim.VILLAGERS.find(v => v.id === id).name;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const WORD = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

const LINES = {
  mira: { hi: ['Fresh lumfruit! Still glowing.', 'Lumfruit, picked this morning.'], no: ['What would I do with {g}?', 'No thanks, I\'ve no use for {g}.'] },
  bob:  { hi: ['Kettlestone. Heavy. Good.', 'Bob has stones.'], no: ['{g}? Nah.', 'Bob no need {g}.'] },
  sela: { hi: ['Snarlmilk! Drink it before it sours.', 'Milk from my snarls. Fresh today.'], no: ['Hmm, {g}? Not for me.', 'I\'d never get rid of {g}.'] },
  dov:  { hi: ['Driftcap! The medicine mushroom. It floats, you know.', 'Medicine for what ails you. Fresh driftcap.'], no: ['{g}? Can\'t heal anyone with that.', 'Not {g}, friend.'] },
  wren:  { hi: ['Pentaja! Pretty, aren\'t they? Took me ages to find these.'], rich: ['Pentaja! Plenty more where these came from!', 'Need pentaja? I\'ve got LOTS.'], no: ['{g}? Pass.', 'Nah, not {g}.'] },
  hesk: { hi: ['Zirnet. Found this one in the riverbed. Took me days.', 'A zirnet never chips. Never.'], no: ['Hrm. {g}? No.', 'At my age? No {g}.'] },
};

/* ---------- state ---------- */
const S = {
  w: null,
  phase: 'intro',            // intro | market | dialog | night | story
  p: { x: START.x, y: START.y, target: null, talkTo: null, face: 1 },
  keys: {},
  flags: {},
  bubbles: [],               // { who, html, no, until }
  morning: [],               // queued morning trades to replay as bubbles
  ticker: [],
  journal: [],
  knownNeeds: {},            // npc -> true once you've talked to them
  dlg: { npc: null, x: null },
  flyers: [],                // goods in the air between stalls
  route: null,               // { target, steps, i } while following a route
  plan: null,                // { g, routes } shown in the pack tab (desktop)
  lastNotes: null,
  score: { nights: 0, fed: 0, sickNights: 0 },   // for the festival
  today: {},                 // what happened at the market today, for the evening: { refusal, indirect, money, zir, firstLum }
  tut: null,                 // the day-one tutorial: { step, npc, t }
  jarPlan: null,             // 'zir' after you said yes to moving Gran's jar
  jarChoice: null,           // 'moved' | 'kept'
  eve: null,                 // the evening scene while it's open
  startedAt: performance.now(),
};

/* ---------- boot ---------- */
const canvas = $('#world');
canvas.width = Art.MW * TILE; canvas.height = Art.MH * TILE;
if (UI) document.body.classList.add('phone');
const setLand = () => document.body.classList.toggle('land', UI && LANDQ.matches);
setLand(); LANDQ.addEventListener?.('change', setLand);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const bg = Art.buildBackground();
const skip = +(params.get('skip') || 0);
const TUT = params.get('tut') === '1' || (!skip && params.get('tut') !== '0' && !store.get('wth-ep01-tut'));

function newGame() {
  S.w = Sim.createWorld({ seed: SEED });
  S.flags = {}; S.journal = []; S.ticker = []; S.knownNeeds = {}; S.bubbles = [];
  S.lastNotes = snapshotNotes();
  renderAll();
  // dev shortcuts: ?skip=12 plays 12 days on autopilot; &talk=mira opens a stall; &tab=village
  if (skip) {
    for (const k of ['refusal', 'indirect']) S.flags[k] = true;
    for (let i = 0; i < skip; i++) {
      Sim.startDay(S.w); autoShop(); S.w.playerAuto = true; Sim.endDay(S.w); S.w.playerAuto = false;
      S.score.nights++; if (!S.w.events.some(e => e.type === 'short' && e.g === 'lum')) S.score.fed++;
      if (S.w.events.some(e => e.type === 'wren')) S.flags.wrenNight = true;
    }
    S.started = true;
    beginDay();
    while (S.morningReplay.length) { const t = S.morningReplay.shift(); S.w.trades.push(t); showTrade(t); }
    if (params.get('talk')) { openDialog(params.get('talk')); if (params.get('pick') && S.phase === 'dialog') { S.dlg.x = params.get('pick'); renderDialog(); } if (params.get('find') && S.phase === 'dialog') findWay(params.get('find')); }
    if (params.get('plan')) { plan(params.get('plan')); if (params.get('follow') && S.plan) followRoute(S.plan.routes[0]); }
    if (params.get('tab')) { $('#tab-village').hidden = false; showTab(params.get('tab')); }
    if (params.get('story') !== '1') S.flags = Object.assign(S.flags, { money: true, wren: true, inflation: true, zir: true, end: true });
    return;
  }
  showIntro();
}

// ?skip: the dev autopilot shops the way the 🧭 helper would (medicine first, the jar may pay), then trades like a local.
function autoShop() {
  const w = S.w, you = w.byId.you;
  const keep = { dri: w.family.sick ? w.family.sick.left : 0, lum: 2, ket: 1 };
  for (const [g, n] of Object.entries(keep)) {
    for (let tries = 0; tries < 3 && Sim.count(you, g) < n; tries++) {
      const r = routesFor(g).find(r => Object.keys(r.spent).every(y => y === g || !keep[y] || Sim.count(you, y) - r.spent[y] >= keep[y]));
      if (!r || !r.steps.every(st => Sim.routeStep(w, st))) break;
    }
  }
}

function beginDay() {
  Sim.startDay(S.w);
  S.phase = 'market';
  document.body.classList.remove('dusk');
  S.p.x = START.x; S.p.y = START.y; S.p.target = null;
  S.tradedToday = false; S.started = true; S.today = S.morningFlags || {}; S.morningFlags = null;
  S.jarMorning = { ...S.w.family.jar };
  S.route = null; S.plan = null; renderRoute();
  S.morning = S.w.trades.slice();
  S.w.trades.length = 0;  // re-added as they're replayed, so stats see them
  S.morningReplay = S.morning.slice();
  if (S.w.day === 1) { S.w.trades.push(...S.morningReplay); S.morningReplay = []; }   // day one: a calm plaza
  S.nextMorningAt = performance.now() + 600;
  addTicker(`<b>Day ${S.w.day}.</b> The market is open. ${awayText()}`);
  if (S.w.day === 1 && TUT && !S.tutDone) S.tut = { step: 1, npc: tutSeller() };
  if (S.w.day === 2 && !S.helpBlinked) { S.helpBlinked = true; bump($('#btn-help')); setTimeout(() => bump($('#btn-help')), 700); }
  diffNotes();
  renderAll();
  music();
}

function awayText() {
  const away = NPCS.filter(id => !S.w.byId[id].present).map(nm);
  if (!away.length) return 'Everyone is here today.';
  return `${away.join(' and ')} didn't come today.`;
}

/* ---------- the first screen: a short welcome, the movie, or straight in ---------- */
function showIntro() {
  S.phase = 'intro';
  $('#intro-body').innerHTML = `
    <h2>Welcome to Ulm Hollow</h2>
    <div class="fam-row">${famFaces('big')}<span>Gran, Little Tam and Aunt Ola: your family.</span></div>
    <p>Every night they need ${icon('lum')} <b>1 lumfruit</b>. You make ${icon('bog')} <b>bogwool</b>, which nobody can eat.</p>
    <p>There is no money here. You swap.</p>
    <p class="goal">🎯 Reach the <b>festival on day ${FEST}</b> with everyone at the table.</p>`;
  $('#intro').hidden = false;
  $('#movie-wrap').hidden = false;   // the poster, as a preview
  const watch = $('#btn-watch'), video = $('#movie');
  // a movie that isn't there (not rendered yet, offline): hide the option quietly
  const noMovie = () => { watch.hidden = true; $('#movie-wrap').hidden = true; if (S.phase === 'intro' && !$('#intro-body').hidden) return; if (S.phase === 'intro') startGame(); };
  fetch(MOVIE, { method: 'HEAD' }).then(r => { if (!r.ok) noMovie(); }).catch(noMovie);
  video.addEventListener('error', noMovie);
  watch.onclick = () => {
    $('#intro-body').hidden = true; watch.hidden = true;
    $('#movie-wrap').hidden = false; $('#movie-wrap').classList.add('playing'); $('#btn-skip').textContent = 'SKIP ▶▶';
    if (!video.src) video.src = MOVIE;
    video.controls = true;   // if the browser won't start it by itself, its own ▶ is right there
    try { const tr = video.textTracks[0]; if (tr) { tr.mode = 'hidden'; tr.oncuechange = () => { const c = tr.activeCues && tr.activeCues[0]; $('#movie-cap').textContent = c ? c.text : ''; }; } } catch {}
    video.play().catch(() => {});
  };
  video.onended = startGame;
  video.onclick = () => { if (!$('#movie-wrap').classList.contains('playing')) { if (!watch.hidden) watch.onclick(); } else if (video.paused) video.play().catch(() => {}); else video.pause(); };
  $('#btn-skip').onclick = startGame;
}
function startGame() {
  if (S.phase !== 'intro') return;
  const video = $('#movie'); try { video.pause(); } catch {}
  $('#intro').hidden = true;
  S.started = true;
  beginDay();
}

/* ---------- input ---------- */
addEventListener('keydown', e => {
  if (S.phase !== 'market') return;
  const k = e.key.toLowerCase();
  S.keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'e' || k === ' ' || k === 'enter') interact();
  if (k === 'h') homeTap();
});
addEventListener('keyup', e => { S.keys[e.key.toLowerCase()] = false; });

canvas.addEventListener('pointerdown', e => {
  if (S.phase !== 'market') return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * canvas.width;
  const y = (e.clientY - r.top) / r.height * canvas.height;
  // clicked a stall? walk to its front and talk
  for (const id of NPCS) {
    const s = STALLS[id];
    if (x > s.counter.x - 4 && x < s.counter.x + s.counter.w + 4 && y > s.counter.y - 32 && y < s.counter.y + s.counter.h + 16) {   // + the name tag under it (the tutorial pointer aims there)
      walkTo({ x: s.front.x, y: s.front.y, talk: id }); return;
    }
  }
  // the hut: go home (on a phone straight away; its door may be off the bottom of the screen)
  if (x > HUT.x && x < HUT.x + HUT.w && y > HUT.y && y < HUT.y + HUT.h + 14) { if (UI) homeTap(); else walkTo({ x: DOOR.x, y: DOOR.y + 8, home: true }); return; }
  walkTo({ x, y });
});

$('#overlay').addEventListener('click', e => { if (e.target.closest('[data-interact]') && S.phase === 'market') interact(); });
if (TOUCH) $('#hint').innerHTML = 'Tap a stall to trade.';
$('#btn-home').onclick = homeTap;
$('#btn-help').onclick = help;
$('#status').onclick = help;
document.querySelectorAll('.tab').forEach(b => b.onclick = () => showTab(b.dataset.tab));
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeDialog());
$('#dialog').addEventListener('click', e => { if (e.target.id === 'dialog') closeDialog(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.phase === 'dialog') closeDialog();
  if ((e.key === 'Enter' || e.key === ' ') && S.phase === 'story') { e.preventDefault(); $('#story-ok').click(); }
  if ((e.key === 'Enter' || e.key === ' ') && S.eve && S.eve.ready) { e.preventDefault(); const b = $('#eve-actions [data-next]'); if (b) b.click(); }
});

function showTab(t) {
  document.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.tab === t); if (b.dataset.tab === t) b.classList.remove('new'); });
  for (const p of ['pack', 'notes', 'village']) $('#pane-' + p).hidden = p !== t;
  if (t === 'village') renderVillage();
}

function nearest() {
  const p = S.p;
  if (Math.hypot(p.x - DOOR.x, p.y - DOOR.y) < 18) return { home: true };
  for (const id of NPCS) {
    const f = STALLS[id].front;
    if (Math.abs(p.x - f.x) < 26 && Math.abs(p.y - f.y) < 14) return { npc: id };
  }
  return null;
}

function interact() {
  const n = nearest();
  if (!n) return;
  if (n.home) homeTap();
  else openDialog(n.npc);
}

/* ---------- movement ---------- */
function solid(x, y) {
  if (x < 4 || y < 10 || x > canvas.width - 4 || y > canvas.height - 3) return true;
  if (x > HUT.x + 4 && x < HUT.x + HUT.w - 4 && y > HUT.y + 20 && y < HUT.y + HUT.h + 2) return true;
  for (const id of NPCS) {
    const c = STALLS[id].counter;
    if (x > c.x - 3 && x < c.x + c.w + 3 && y > c.y - 26 && y < c.y + c.h + 3) return true;
  }
  if (x > STONE.x - 8 && x < STONE.x + 24 && y > STONE.y - 8 && y < STONE.y + 26) return true; // standing stone
  for (const [tx, ty] of TREES) if (Math.abs(x - tx) < 5 && y > ty + 4 && y < ty + 13) return true;
  return false;
}

// Breadth-first search on an 8px grid, so click-to-walk and routes go around stalls.
const CELL = 8;
function findPath(fx, fy, tx, ty) {
  const W = Math.ceil(canvas.width / CELL), H = Math.ceil(canvas.height / CELL);
  const cell = (x, y) => [Math.min(W - 1, Math.max(0, Math.floor(x / CELL))), Math.min(H - 1, Math.max(0, Math.floor(y / CELL)))];
  const open = (cx, cy) => !solid(cx * CELL + CELL / 2, cy * CELL + CELL / 2);
  const [sx, sy] = cell(fx, fy), [gx, gy] = cell(tx, ty);
  const prev = new Int32Array(W * H).fill(-1), q = [sy * W + sx];
  prev[sy * W + sx] = sy * W + sx;
  while (q.length) {
    const i = q.shift(), cx = i % W, cy = (i / W) | 0;
    if (cx === gx && cy === gy) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy, j = ny * W + nx;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[j] !== -1 || !open(nx, ny)) continue;
      prev[j] = i; q.push(j);
    }
  }
  let i = gy * W + gx;
  if (prev[i] === -1) return null;
  const pts = [{ x: tx, y: ty }];
  while (i !== sy * W + sx) { i = prev[i]; pts.unshift({ x: (i % W) * CELL + CELL / 2, y: ((i / W) | 0) * CELL + CELL / 2 }); }
  pts.shift();   // the cell we're standing in
  return pts;
}
function walkTo(t) {
  S.p.target = t;
  S.p.path = findPath(S.p.x, S.p.y, t.x, t.y) || [{ x: t.x, y: t.y }];
}

function update(dt) {
  if (S.phase !== 'market') return;
  const p = S.p, k = S.keys;
  let vx = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
  let vy = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0);
  if (vx || vy) p.target = null;
  if (p.target && !vx && !vy) {
    if (!p.path || !p.path.length) p.path = [{ x: p.target.x, y: p.target.y }];
    const wp = p.path[0];
    const dx = wp.x - p.x, dy = wp.y - p.y, d = Math.hypot(dx, dy);
    if (d < 3) {
      p.path.shift();
      if (p.path.length) return;
      const t = p.target; p.target = null;
      if (t.talk) openDialog(t.talk);
      if (t.home) homeTap();
      return;
    }
    vx = dx / d; vy = dy / d;
  }
  const len = Math.hypot(vx, vy); if (!len) return;
  const sp = (UI ? 130 : 100) * dt;
  vx = vx / len * sp; vy = vy / len * sp;
  if (vx) p.face = Math.sign(vx);
  const ox = p.x, oy = p.y;
  if (!solid(p.x + vx, p.y)) p.x += vx;
  if (!solid(p.x, p.y + vy)) p.y += vy;
  // following a path whose cells are open: don't snag on a corner pixel
  if (p.target && p.x === ox && p.y === oy) { p.x += vx; p.y += vy; }
}

/* ---------- drawing ---------- */
function draw(t) {
  ctx.drawImage(bg, 0, 0);
  const w = S.w;
  const sprites = [];
  for (const id of NPCS) {
    const a = w.byId[id];
    const s = STALLS[id];
    const wares = IDS.filter(g => Sim.count(a, g) > 0).sort((x, y) => (y === a.makes) - (x === a.makes) || Sim.count(a, y) - Sim.count(a, x));
    sprites.push({ y: s.counter.y - 1, f: () => { if (a.present) Art.drawAlien(ctx, s.npc.x, s.npc.y, id, t); } });
    sprites.push({ y: s.counter.y + 1, f: () => Art.drawStall(ctx, id, wares, a.present) });
  }
  sprites.push({ y: S.p.y, f: () => Art.drawAlien(ctx, S.p.x, S.p.y, 'you', S.phase === 'market' && (S.keys.w || S.keys.a || S.keys.s || S.keys.d || S.p.target) ? t * 3 : t) });
  sprites.sort((a, b) => a.y - b.y).forEach(s => s.f());
  drawRoute(t);
  drawHint(t);
  drawFlyers(performance.now());
  if (S.phase === 'night' || S.phase === 'intro') { ctx.fillStyle = 'rgba(10,4,30,.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

/* ---------- overlay (HTML on top of the canvas) ---------- */
const overlay = $('#overlay');
function fitCanvas() {
  const fr = $('#world-frame').getBoundingClientRect();
  // phone: fill the width; on a short screen the bottom of the map (the grass and the hut) is cut off,
  // but never the plaza (down to about y 286): then the map shrinks instead
  let k = Math.min(fr.width / canvas.width, fr.height / canvas.height);
  if (PHONE) { k = fr.width / canvas.width; if (Math.min(canvas.height, 300) * k > fr.height) k = fr.height / Math.min(canvas.height, 300); }
  const w = Math.floor(canvas.width * k), h = Math.floor(canvas.height * k);
  if (canvas._w !== w || canvas._h !== h) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas._w = w; canvas._h = h; }
}
function layoutOverlay() {
  fitCanvas();
  const fr = $('#world-frame').getBoundingClientRect(), r = canvas.getBoundingClientRect();
  Object.assign(overlay.style, { left: (r.left - fr.left) + 'px', top: (r.top - fr.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
  const dock = $('#dock').getBoundingClientRect().height;
  if (dock !== S.dockH) { S.dockH = dock; document.documentElement.style.setProperty('--dock', dock + 'px'); }
  return r.width / canvas.width;
}

function renderOverlay(now) {
  const k = layoutOverlay();
  const html = [];
  for (const id of NPCS) {
    const a = S.w.byId[id], s = STALLS[id];
    html.push(`<div class="nametag ${a.present ? '' : 'away'}" style="left:${s.npc.x * k}px;top:${(s.counter.y + s.counter.h + 1) * k}px">${nm(id)}${a.present ? '' : ' · away'}</div>`);
  }
  S.bubbles = S.bubbles.filter(b => b.until > now);
  for (const b of S.bubbles) {
    const pos = b.who === 'you' ? { x: S.p.x, y: S.p.y - 20 } : { x: STALLS[b.who].npc.x, y: STALLS[b.who].npc.y - 20 };
    html.push(`<div class="bubble ${b.no ? 'no' : ''}" style="left:${pos.x * k}px;top:${pos.y * k}px">${b.html}</div>`);
  }
  if (S.phase === 'market') {
    const n = nearest();
    if (n && !n.home) {
      const pos = { x: S.p.x, y: S.p.y - 22 };
      html.push(`<button class="prompt" data-interact style="left:${pos.x * k}px;top:${pos.y * k}px">${TOUCH ? 'TAP' : 'E'} · talk to ${nm(n.npc)}</button>`);
    }
  }
  const out = html.join('');
  if (out !== overlay._last) { overlay.innerHTML = out; overlay._last = out; }
}

function bubble(who, html, no = false, ms = 2200) {
  S.bubbles = S.bubbles.filter(b => b.who !== who);
  S.bubbles.push({ who, html, no, until: performance.now() + ms });
}

/* ---------- morning replay: you watch the locals trade ---------- */
function replayMorning(now) {
  if (S.phase !== 'market' || !S.morningReplay?.length || now < S.nextMorningAt) return;
  const t = S.morningReplay.shift();
  S.w.trades.push(t);
  S.nextMorningAt = now + 750;
  showTrade(t);
}

function showTrade(t) {
  if (t.refused) {
    bubble(t.b, `✗ ${icon(t.refused, 'sm')}`, true);
    addTicker(`${nm(t.b)} refused ${gname(t.refused)} from ${nm(t.a)}.`);
    return;
  }
  bubble(t.a, `${t.k}${icon(t.y, 'sm')} → ${t.n}${icon(t.x, 'sm')}`);
  bubble(t.b, `${t.n}${icon(t.x, 'sm')} → ${t.k}${icon(t.y, 'sm')}`);
  fly(t.a, t.b, t.y, t.k); fly(t.b, t.a, t.x, t.n);
  feed(t);
  diffNotes();
}

// One line per swap: who gave what, and a tag when someone took a good they have no use for.
function tradeLine(t) {
  const who = id => `<span class="who">${id === 'you' ? 'You' : nm(id)}</span>`;
  const tags = [];
  if (t.indirectA) tags.push(`${t.a === 'you' ? 'you' : nm(t.a)}: ${icon(t.x)} to trade on`);
  if (t.indirectB) tags.push(`${t.b === 'you' ? 'you' : nm(t.b)}: ${icon(t.y)} to trade on`);
  return `${who(t.a)} ${t.k}${icon(t.y)} <span class="swap">⇄</span> ${t.n}${icon(t.x)} ${who(t.b)}${tags.map(x => `<span class="tag" title="Took a good they don't use, to trade it on later">${x}</span>`).join('')}`;
}
function feed(t) { addTicker(tradeLine(t)); }

// the trade log under the village (desktop only)
function addTicker(html) {
  S.ticker.unshift(html);
  S.ticker.length = Math.min(S.ticker.length, 30);
  if (!UI) $('#ticker').innerHTML = S.ticker.slice(0, 5).map((h, i) => `<div class="${i === 0 ? 'fresh' : ''}">${h}</div>`).join('');
}

/* ---------- trade table ---------- */
function openDialog(id) {
  const a = S.w.byId[id];
  if (!a.present) { bubble('you', `${nm(id)} isn't here today`, true); toast(`${nm(id)} is away today.`, 1800); return; }
  S.phase = 'dialog';
  S.p.target = null; S.keys = {};
  const st = routeStep();
  S.dlg = { npc: id, x: st && st.npc === id ? st.x : (S.tut && S.tut.step <= 2 && id === S.tut.npc ? 'lum' : null), find: null, routes: null, learned: false, inline: null };
  S.knownNeeds[id] = true;
  const L = LINES[id];
  $('#d-say').textContent = '"' + pick(id === 'wren' && S.w.caveDay && S.w.day >= S.w.caveDay ? L.rich : L.hi) + '"';
  $('#dialog').hidden = false;
  renderDialog();
}

// then: what to do once any story card this sets off is closed (e.g. walk on to the next route stop)
function closeDialog(then) {
  $('#dialog').hidden = true;
  if (S.phase === 'dialog') S.phase = 'market';
  if (!checkStory(then) && then) then();
}

// What one unit of y is worth to you right now (so we suggest paying with spare stuff, not food).
function myCost(y, k) { const you = S.w.byId.you; let c = 0; for (let i = 0; i < k; i++) c += Sim.val(S.w, you, y, Sim.count(you, y) - i); return c; }

function renderDialog() {
  const { npc } = S.dlg;
  const w = S.w, a = w.byId[npc], you = w.byId.you;
  Art.drawPortrait($('#portrait'), npc, performance.now() / 1000);
  $('#d-name').textContent = nm(npc);
  const list = gs => gs.map(g => icon(g, 'sm') + ' ' + (UI ? SHORT[g] : GN(g))).join(', ');
  $('#d-looking').innerHTML = UI ? `Grows ${icon(a.makes, 'sm')} ${SHORT[a.makes]} · Needs ${list(Object.keys(a.needs))}`
    : `Makes ${icon(a.makes, 'sm')} ${GN(a.makes)} · Needs ${list(Object.keys(a.needs))}${Object.keys(a.keeps).length ? ' · Likes to own ' + list(Object.keys(a.keeps)) : ''}`;
  $('#d-their-label').textContent = UI ? 'WHAT DO YOU WANT?' : `${nm(npc).toUpperCase()}'S STALL · pick what you want`;

  // Every price at this stall, for everything you could pay with (held or not).
  const stall = IDS.filter(g => Sim.count(a, g) > 0);
  const Q = {};
  for (const x of stall) { Q[x] = {}; for (const y of IDS) if (y !== x) Q[x][y] = Sim.quote(w, npc, x, y); }
  const affordable = x => IDS.filter(y => Q[x][y] && Q[x][y].ok)
    .map(y => ({ y, ...Q[x][y], cost: myCost(y, Q[x][y].k) / Q[x][y].n }))
    .sort((p, q) => p.cost - q.cost);
  const jarQ = Object.fromEntries(stall.map(g => [g, g === 'zir' && S.jarPlan === 'zir' && npc === 'hesk' ? jarZirStep() : Sim.jarQuote(w, npc, g)]));
  if (!stall.includes(S.dlg.x) && jarQ.dri && w.family.sick && npc === 'dov') S.dlg.x = 'dri';   // (elsewhere the jar overpays)
  if (!stall.includes(S.dlg.x)) S.dlg.x = stall.find(x => x === a.makes && affordable(x).length) || stall.find(x => affordable(x).length) || (stall.includes(a.makes) ? a.makes : stall[0]) || null;
  const x = S.dlg.x;

  // What they'd take for anything on the stall: the "acceptable set".
  const takes = {};
  for (const y of IDS) {
    let best = null;
    for (const g of stall) { const q = Q[g][y]; if (q && (!best || q.n / q.k > best.n / best.k)) best = { x: g, ...q }; }
    takes[y] = best;
  }
  if (!S.dlg.learned) {   // asking is how you learn: it all goes in your notebook
    S.dlg.learned = true;
    for (const y of IDS) {
      const cur = you.note[npc][y] ?? 0.1;
      you.note[npc][y] = a.wants[y] ? 1 : takes[y] ? Math.max(cur, 0.8) : cur * 0.3;
    }
  }

  // top row: their goods
  $('#d-theirs').innerHTML = stall.length ? stall.map(g => {
    const best = affordable(g)[0], jq = jarQ[g];
    const badge = best ? (UI && best.n > 1 ? `${best.k}${icon(best.y)}→${best.n}` : `for ${best.k}${icon(best.y)}${best.n > 1 ? ` <span>(get ${best.n})</span>` : ''}`) : jq ? `🫙 ${jq.k}${icon(jq.y)}` : UI ? '✗' : '✗ nothing you have';
    return `<button class="gcard ${g === x ? 'on' : ''} ${best || jq ? 'can' : 'cant'}" data-g="${g}">${icon(g, 'big')}<span class="nm">${UI ? SHORT[g] : GN(g)}</span><span class="ct">×${Sim.count(a, g)}</span><span class="badge">${badge}</span></button>`;
  }).join('') : '<p class="empty">Sold out.</p>';
  document.querySelectorAll('#d-theirs .gcard').forEach(b => b.onclick = () => { S.dlg.x = b.dataset.g; S.dlg.find = null; renderDialog(); });

  // bottom row: your pack, each card saying what it does for the selected good (desktop; phones see the strip)
  const mine = IDS.filter(g => Sim.count(you, g) > 0);
  $('#d-mine').innerHTML = mine.length ? mine.map(y => {
    const q = x && y !== x ? Q[x][y] : null;
    const badge = !x || y === x ? '&nbsp;' : !q ? '✗ won\'t take' : !q.ok ? `wants ${q.k}, you have ${Sim.count(you, y)}` : `${q.k} → ${q.n}${icon(x)}`;
    return `<div class="gcard ${q && q.ok ? 'can' : x && y !== x ? 'cant' : ''}" data-y="${y}">${icon(y, 'big')}<span class="nm">${GN(y)}</span><span class="ct">×${Sim.count(you, y)}</span><span class="badge">${badge}</span></div>`;
  }).join('') : '<p class="empty" style="color:#c9a77c">Your pack is empty.</p>';

  // middle: the deals, or why there aren't any
  const step = routeStep();
  let deal = '', nothing = false;
  if (x) {
    const ok = affordable(x), jq = jarQ[x];
    deal += `<h4>FOR ${icon(x)} ${GN(x).toUpperCase()}, ${nm(npc).toUpperCase()} TAKES</h4>`;
    // Gran's jar: medicine while someone is sick, zirnet (your savings) after the cave
    if (jq) {
      const isStep = step && step.jar && step.npc === npc && step.x === x;
      deal += `<div class="deal-row jar ${isStep ? 'route' : ''}"><span class="terms">give <b>${jq.fromPack ? jq.fromJar : jq.k}</b> ${icon(jq.y)}<span class="from"> from 🫙</span>${jq.fromPack ? ` + <b>${jq.fromPack}</b> ${icon(jq.y)}` : ''}<span class="arrow">→</span>get <b>${jq.n}</b> ${icon(x)}<span class="gn"> ${x === 'zir' ? 'into the jar' : gname(x, jq.n)}</span></span><button class="btn small" data-jar data-y="${jq.y}" data-k="${jq.k}" data-n="${jq.n}">${x === 'zir' ? 'SWAP' : 'PAY'}</button></div>`;
      // the jar overpaying for medicine away from Dov (Wren may want 7 of its 8 crystals for one driftcap)
      const tr = x === 'dri' && npc !== 'dov' ? Sim.family(w).trend[jq.y] : null;
      if (tr && jq.k / jq.n > tr / Sim.SICK.DOSES * 2) deal += `<p class="dear">⚠ Dear! Dov usually asks about ${tr} ${icon(jq.y, 'sm')} for ${Sim.SICK.DOSES} ${icon('dri', 'sm')}.</p>`;
    }
    // the route's own step comes first, with its amounts (it may need 2 of x, where the plain deal gives 1)
    let rs = step && !step.jar && step.npc === npc && step.x === x && Sim.count(you, step.y) >= step.k ? step : null;
    // the same payment buys more here (1 bogwool for 4 lumfruit, not 1): point at the better deal
    const better = rs && ok.filter(o => o.y === rs.y && o.k <= rs.k && o.n >= rs.n && (o.k < rs.k || o.n > rs.n)).sort((p, q) => q.n / q.k - p.n / p.k)[0];
    if (better) rs = { ...rs, k: better.k, n: better.n };
    const row = (o, isStep) => `<div class="deal-row ${isStep ? 'route' : ''}" data-y="${o.y}"><span class="terms">give <b>${o.k}</b> ${icon(o.y)}<span class="gn"> ${GN(o.y)}</span><span class="arrow">→</span>get <b>${o.n}</b> ${icon(x)}<span class="gn"> ${gname(x, o.n)}</span>${isStep ? ' <span class="tag">← <span class="long">YOUR </span>ROUTE</span>' : ''}</span><button class="btn small" data-y="${o.y}" data-k="${o.k}" data-n="${o.n}">TRADE</button></div>`;
    if (rs) deal += row(rs, true);
    if (ok.length) {
      deal += ok.filter(o => !rs || o.y !== rs.y || o.k !== rs.k || o.n !== rs.n)
        .map(o => row(o, !rs && step && step.npc === npc && step.x === x && step.y === o.y)).join('');
    } else if (!jq && !rs) {
      nothing = true;
      const wantsIt = IDS.filter(y => Q[x][y] && !Sim.count(you, y));
      deal += `<p class="nodeal">✗ Nothing in your pack works. ${wantsIt.length ? `${nm(npc)} would take ${wantsIt.slice(0, 4).map(y => icon(y)).join(' ')} for it.` : ''}</p>`;
      if (S.dlg.find !== x) deal += `<button class="btn small find" data-find="${x}">🧭 FIND A WAY TO GET ${GN(x).toUpperCase()}</button>`;
    }
  }
  // phones: the first refusal and the first indirect trade are a line here, not a card
  // (a real refusal: something in your pack they won't take at all, not just "you ran out";
  //  and not right after they took something from you: then they've just had enough of it)
  const refusedNow = x ? mine.filter(y => y !== x && !Q[x][y]) : [];
  if (UI && nothing && refusedNow.length && !S.flags.refusal && !S.dlg.traded) { S.flags.refusal = true; S.today.refusal = { npc, g: refusedNow.includes('bog') ? 'bog' : refusedNow[0] }; S.dlg.inline = 'refusal'; }
  if (S.dlg.inline === 'refusal') deal += `<p class="inline amber">✗ ${nm(npc)} has what you want, but you have nothing ${nm(npc)} wants. That's the trouble with barter.</p>`;
  if (S.dlg.inline === 'indirect') deal += `<p class="inline green">You took ${icon(S.today.indirect.x, 'sm')} to trade it on, not to use. That's <b>indirect exchange</b>.</p>`;
  if (S.dlg.find) deal += routesHTML(S.dlg.find, S.dlg.routes);
  $('#d-deal').innerHTML = deal || '<p class="empty">Nothing on the stall.</p>';
  document.querySelectorAll('#d-deal [data-k]').forEach(b => b.onclick = () => doTrade(npc, x, +b.dataset.n, b.dataset.y, +b.dataset.k, 'jar' in b.dataset, mid(b)));
  document.querySelectorAll('#d-deal .deal-row').forEach(r => {
    r.onmouseenter = () => document.querySelector(`#d-mine [data-y="${r.dataset.y}"]`)?.classList.add('lit');
    r.onmouseleave = () => document.querySelector(`#d-mine [data-y="${r.dataset.y}"]`)?.classList.remove('lit');
  });
  document.querySelectorAll('#d-deal [data-find]').forEach(b => b.onclick = () => UI ? (closeDialog(), plan(b.dataset.find)) : findWay(b.dataset.find));
  bindFollow('#d-deal');

  // the acceptable set, including things you don't have (desktop)
  if (!UI) {
    $('#d-takes').innerHTML = `<span class="lbl">${nm(npc)} takes (for something on the stall). ${TOUCH ? 'Tap' : 'Click'} one you don't have to find a way to get it:</span><div class="chips">${IDS.filter(y => y !== a.makes).map(y => {
      const t = takes[y], have = Sim.count(you, y) > 0, need = !!a.wants[y];
      const cls = need ? 'need' : t ? 'yes' : 'no';
      const mk = need ? '★ needs' : t ? '✓' : '✗';
      const price = t ? ` ${t.k}→${t.n}${icon(t.x)}` : '';
      const tip = need ? `${nm(npc)} needs ${GN(y).toLowerCase()}` : t ? `${nm(npc)} doesn't need it, but would take it to trade on` : `${nm(npc)} won't take ${GN(y).toLowerCase()}`;
      const tag = t && !have ? 'button' : 'span';
      return `<${tag} class="chip ${cls} ${have ? 'have' : ''}" ${tag === 'button' ? `data-find="${y}"` : ''} title="${tip}">${icon(y)}<span class="mk">${mk}</span>${price}</${tag}>`;
    }).join('')}</div><p class="hint-line"><span class="gold">★</span> needs it · <span class="leaf">✓</span> takes it without needing it · green ring: you have some</p>`;
    document.querySelectorAll('#d-takes [data-find]').forEach(b => b.onclick = () => findWay(b.dataset.find));
  }

  const refused = x && mine.find(y => y !== x && !Q[x][y]);
  if (refused && !S.flags.sawRefusal) S.flags.sawRefusal = { npc, g: refused };
  diffNotes();
}

// The 🧭 helper: for medicine, all the doses still missing at once if it can, else one at a time.
function routesFor(g) {
  if (g === 'jarzir') { const st = jarZirStep(); return st ? [{ target: 'zir', need: st.n, steps: [st], spent: {}, jar: { pen: st.k }, cost: 0 }] : []; }
  const F = S.w.family, n = g === 'dri' && F.sick ? Math.max(1, F.sick.left - Sim.count(S.w.byId.you, 'dri')) : 1;
  // never pay with what home needs tonight (the medicine you just bought, the last lumfruit, the tools' kettlestone)
  const you = S.w.byId.you, keep = { dri: F.sick ? F.sick.left : 0, lum: 1, ket: you.acc.ket + you.needs.ket >= 1 - 1e-9 ? 1 : 0 };
  const safe = r => Object.keys(r.spent).every(y => y === g || !keep[y] || Sim.count(you, y) - r.spent[y] >= keep[y]);
  const all = [...Sim.findRoutes(S.w, g, n), ...(n > 1 ? Sim.findRoutes(S.w, g, 1) : [])].filter(safe), top = all.slice(0, 3);
  const jar = all.find(r => r.jar);   // the jar can pay for medicine, so always offer it
  if (jar && !top.includes(jar)) top[Math.min(2, top.length)] = jar;
  return top;
}
// Moving Gran's jar into zirnet: as many zirnet as Hesk will swap for the jar's pentaja today.
function jarZirStep() {
  const w = S.w, J = w.family.jar, hesk = w.byId.hesk;
  if (!hesk.present || !J.pen || !Sim.jarFor(w, 'zir')) return null;
  for (let n = Sim.count(hesk, 'zir'); n >= 1; n--) {
    const q = Sim.jarQuote(w, 'hesk', 'zir', n);
    if (q && q.n === n) return { npc: 'hesk', x: 'zir', n, y: q.y, k: q.k, jar: true };
  }
  return null;
}
function findWay(g) {
  S.dlg.find = g;
  S.dlg.routes = routesFor(g);
  renderDialog();
}

/* ---------- routes: "Sela takes bogwool, Mira takes snarlmilk" ---------- */
function routesHTML(g, routes) {
  if (!routes || !routes.length) return `<p class="nodeal" style="margin-top:8px">🧭 No chain of swaps gets you ${GN(g).toLowerCase()} today. Come back tomorrow, when stalls have changed.</p>`;
  S.shownRoutes = routes;
  return `<h4 style="margin-top:10px">🧭 WAYS TO GET ${icon(g)} ${GN(g).toUpperCase()}</h4><div class="routes">${routes.map((r, i) => `
    <div class="route-card"><ol>${r.steps.map(s => `<li><b>${nm(s.npc)}</b>: give ${s.k} ${icon(s.y)}${s.jar ? ' from 🫙' : ''} → get ${s.n} ${icon(s.x)}</li>`).join('')}</ol><button class="btn small" data-follow="${i}">FOLLOW</button></div>`).join('')}</div>`;
}
function bindFollow(sel) {
  document.querySelectorAll(sel + ' [data-follow]').forEach(b => b.onclick = () => followRoute(S.shownRoutes[+b.dataset.follow]));
}
function followRoute(r) {
  if (!r) return;
  S.route = { target: r.target, steps: r.steps, i: 0 };
  S.plan = null;
  if (S.phase === 'dialog') {
    const st = r.steps[0];
    if (st.npc === S.dlg.npc) { S.dlg.x = st.x; S.dlg.find = null; renderDialog(); renderRoute(); return; }
    renderPack(); renderRoute(); closeDialog(walkToStep); return;
  }
  renderPack(); renderRoute();
  walkToStep();
}
function routeStep() { return S.route ? S.route.steps[S.route.i] : null; }
function walkToStep() {
  const st = routeStep(); if (!st || S.phase !== 'market') return;
  const f = STALLS[st.npc].front;
  walkTo({ x: f.x, y: f.y, talk: st.npc });
}
function advanceRoute(npc, x) {
  const r = S.route; if (!r) return;
  const st = r.steps[r.i];
  if (st.npc !== npc || st.x !== x) return;
  r.i++;
  let done = false;
  if (r.i >= r.steps.length) {
    bubble('you', `✓ got ${icon(r.target, 'sm')}`);
    addTicker(`🧭 Route done: you got ${gname(r.target)}.`);
    S.route = null; done = true;
  }
  renderRoute();
  return done;
}
function renderRoute() {
  const el = $('#route-banner'), r = S.route;
  if (!r) { el.hidden = true; return; }
  const st = r.steps[r.i];
  const q = st.jar ? Sim.jarQuote(S.w, st.npc, st.x, st.n) : Sim.quote(S.w, st.npc, st.x, st.y);
  const broken = !S.w.byId[st.npc].present || !q || (!st.jar && !q.ok && Sim.count(S.w.byId.you, st.y) < q.k);
  el.hidden = false;
  el.innerHTML = `🧭 ${icon(r.target)} <span class="steps">${r.steps.map((s, i) => `<span class="st ${i === r.i ? 'now' : i < r.i ? 'done' : ''}">${i + 1}. ${nm(s.npc)}: ${s.jar ? '🫙' : ''}${s.k}${icon(s.y)}→${s.n}${icon(s.x)}</span>`).join('')}</span>
    ${broken ? '<span class="bad">this route stopped working</span>' : '<button data-go>GO</button>'}<button class="x" data-x title="Stop following">✕</button>`;
  el.querySelector('[data-go]')?.addEventListener('click', walkToStep);
  el.querySelector('[data-x]').onclick = () => { S.route = null; renderRoute(); };
}

function doTrade(npc, x, n, y, k, jar = false, pt = null) {
  const needWas = homeNeed();
  const t = jar ? Sim.jarTrade(S.w, npc, x, n, k, y) : Sim.playerTrade(S.w, npc, x, n, y, k);
  if (!t) { bubble(npc, '✗', true); sfx('nope'); renderDialog(); shake($('#d-deal')); return; }
  S.tradedToday = true; S.dlg.traded = true;
  if (x === 'lum' && !S.today.firstLum) S.today.firstLum = { npc, k, y };
  if (jar && x === 'zir') { S.penToZir = (S.penToZir || 0) + k; if (S.jarPlan === 'zir') { S.jarPlan = null; S.w.family.jarPlan = null; S.jarChoice = 'moved'; toast(`🫙 Gran's jar now holds ${S.w.family.jar.zir} ${icon('zir', 'sm')} zirnet.`, 3000); } }
  sfx(jar || [x, y].some(g => g === 'pen' || g === 'zir') ? 'coin' : 'pop');
  bubble('you', `${jar ? '🫙' : ''}${k}${icon(y, 'sm')} → ${n}${icon(x, 'sm')}`);
  fly('you', npc, y, k); fly(npc, 'you', x, n);
  feed(t);
  if (t.indirectA && !S.flags.indirect && x !== S.w.byId.you.makes) {
    if (UI) { S.flags.indirect = true; S.today.indirect = { npc, x, y }; S.dlg.inline = 'indirect'; }
    else S.flags.indirectPending = { npc, x, y };
  }
  const routeDone = advanceRoute(npc, x);
  S.dlg.find = null; S.dlg.routes = null;
  const st = routeStep();
  if (st && st.npc === npc) S.dlg.x = st.x;
  if (S.tut && S.tut.step === 2 && Sim.count(S.w.byId.you, 'lum')) { S.tut.step = 3; S.tut.t = 0; }
  renderDialog(); renderPack(); renderTop(); renderStrip(); diffNotes();
  if (pt) floatAt(`+${n} ${icon(x)}`, pt.x, pt.y - 30, 'good');
  const card = document.querySelector(`#d-mine [data-y="${x}"]`); if (card) bump(card);
  // that did it (a need filled, or the next step is at another stall): close the table and get going
  const now = homeNeed(), filled = routeDone || (needWas.g === x && (now.g !== x || now.cls !== needWas.cls));
  const tok = S.dlg.tok = (S.dlg.tok || 0) + 1;
  if ((st && st.npc !== npc) || (!st && filled) || S.w.day === 1) setTimeout(() => {
    if (S.phase !== 'dialog' || S.dlg.npc !== npc || S.dlg.tok !== tok) return;
    closeDialog(() => { if (S.route) walkToStep(); });
    if (Sim.count(S.w.byId.you, x)) homeLand(x, n, npc);
  }, S.dlg.inline === 'indirect' ? 2200 : 800);
}

/* ---------- goods flying between stalls ---------- */
function spot(who) { return who === 'you' ? { x: S.p.x, y: S.p.y - 10 } : { x: STALLS[who].npc.x, y: STALLS[who].npc.y - 8 }; }
function fly(from, to, g, n) {
  const a = spot(from), b = spot(to), now = performance.now();
  for (let i = 0; i < Math.min(n, 4); i++) S.flyers.push({ g, a, b, t0: now + i * 120, dur: 700 });
}
function drawFlyers(now) {
  S.flyers = S.flyers.filter(f => now < f.t0 + f.dur);
  for (const f of S.flyers) {
    const u = (now - f.t0) / f.dur; if (u < 0) continue;
    const x = f.a.x + (f.b.x - f.a.x) * u, y = f.a.y + (f.b.y - f.a.y) * u - Math.sin(u * Math.PI) * 22;
    ctx.drawImage(Art.iconCanvas[f.g], Math.round(x - 6), Math.round(y - 6));
  }
}

/* ---------- markers on the map ---------- */
// Day one: who sells lumfruit for what you have (Mira if Mira can).
function tutSeller() {
  const w = S.w, q = Sim.quote(w, 'mira', 'lum', 'bog');
  if (q && q.ok) return 'mira';
  const r = Sim.findRoutes(w, 'lum', 1).find(r => r.steps.length === 1);
  return r ? r.steps[0].npc : 'mira';
}
// day one without the tutorial, until your first swap: a bouncing marker over the lumfruit seller
const firstDay = () => S.w.day === 1 && !S.tradedToday && !S.route && !S.tut && S.w.byId.you.hunger.lum === 0;
function drawHint(t) {
  if (!firstDay() || S.phase !== 'market') return;
  S.hintNpc = S.hintNpc || tutSeller();
  const p = STALLS[S.hintNpc].npc, y = p.y - 36 + Math.round(Math.sin(t * 6) * 3);
  ctx.fillStyle = '#1a1026'; ctx.fillRect(p.x - 5, y - 2, 10, 9); ctx.fillRect(p.x - 2, y + 7, 4, 4);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(p.x - 4, y - 1, 8, 7); ctx.fillRect(p.x - 1, y + 6, 2, 4);
  ctx.fillStyle = '#1a1026'; ctx.fillRect(p.x - 1, y, 2, 3); ctx.fillRect(p.x - 1, y + 4, 2, 1);
}
function drawRoute(t) {
  const r = S.route; if (!r || S.phase === 'night') return;
  r.steps.forEach((s, i) => {
    if (i < r.i) return;
    const p = STALLS[s.npc].npc, now = i === r.i;
    const y = p.y - 34 + (now ? Math.round(Math.sin(t * 6) * 2) : 0);
    ctx.fillStyle = '#1a1026'; ctx.fillRect(p.x - 6, y - 6, 12, 12);
    ctx.fillStyle = now ? '#ffd23f' : '#8a7bb0'; ctx.fillRect(p.x - 5, y - 5, 10, 10);
    ctx.fillStyle = '#1a1026'; ctx.font = '8px Silkscreen'; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), p.x, y + 3); ctx.textAlign = 'left';
    if (now) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(p.x - 1, y + 6, 2, 3); ctx.fillRect(p.x - 3, y + 8, 6, 1); }
  });
}

/* ---------- the day-one tutorial: one pointer at a time ---------- */
function tutorial(now) {
  const T = S.tut, el = $('#pointer');
  if (!T || (S.phase !== 'market' && S.phase !== 'dialog')) { el.hidden = true; return; }
  const name = nm(T.npc);
  let at = null, text = '';
  if (T.step <= 2 && S.phase === 'market' && Sim.count(S.w.byId.you, 'lum')) { T.step = 3; T.t = 0; }
  if (T.step === 1) {
    if (S.phase === 'dialog' && S.dlg.npc === T.npc) T.step = 2;
    else if (S.phase === 'dialog') { at = rectPt($('#dialog .close')); text = `Not this one. Close it, then tap ${name}.`; }
    else { const s = STALLS[T.npc], p = mapPt({ x: s.npc.x, y: s.counter.y + s.counter.h + 12 }); at = { x: p.x, y: p.y, below: true }; text = `Your family needs 1 ${icon('lum', 'sm')} tonight. ${name} has some. Tap ${name}.`; }
  }
  if (T.step === 2) {
    if (S.phase !== 'dialog') T.step = 1;
    else {
      const b = document.querySelector('#d-deal .deal-row:not(.jar) [data-k]');
      if (b) { const k = +b.dataset.k, y = b.dataset.y, r = b.getBoundingClientRect(); at = { x: r.left + r.width / 2, y: r.bottom, below: true }; const n = +b.dataset.n || 1; text = `${name} gives ${n} lumfruit for ${k} ${gname(y, k).toLowerCase()}. Tap TRADE.`; }
    }
  }
  if (T.step === 3) {
    if (S.phase === 'dialog') { el.hidden = true; return; }
    T.t = T.t || now;
    const chip = document.querySelector('#strip [data-g="lum"]');
    at = rectPt(chip); text = 'Dinner is in your pack.';
    if (now - T.t > 1800) T.step = 4;
  }
  if (T.step === 4) {
    if (S.phase === 'dialog') { el.hidden = true; return; }
    at = rectPt($('#btn-home')); text = 'That\'s the day. Tap GO HOME.';
  }
  if (!at) { el.hidden = true; return; }
  el.hidden = false;
  if (el._text !== text) { $('#pointer-text').innerHTML = text; el._text = text; }
  // the bubble sits above the target, inside the screen
  el.classList.toggle('below', !!at.below);
  const bw = el.offsetWidth, x = Math.max(8, Math.min(innerWidth - bw - 8, at.x - bw / 2));
  el.style.left = x + 'px'; el.style.top = (at.below ? at.y + 2 : at.y - el.offsetHeight - 2) + 'px';
  $('#pointer .arrow').style.left = (at.x - x - 10) + 'px';
}
function rectPt(e) { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top }; }
$('#pointer').onclick = () => { if (S.tut && S.tut.step === 3) S.tut.step = 4; };

/* ---------- day end ---------- */
// GO HOME: always there. With nothing for tonight and a way to get it still open, the first tap only warns.
function homeTap() {
  if (S.phase === 'dialog') { $('#dialog').hidden = true; S.phase = 'market'; }
  if (S.phase !== 'market') return;
  const n = homeNeed(), now = performance.now(), b = $('#btn-home');
  const risky = n.g && (n.g === 'lum' || n.g === 'dri') && n.cls !== 'ok';
  if (risky && now - (S.homeArm || -1e9) > 4000) {
    S.homeArm = now; sfx('nope'); shake($('#status'));
    b.classList.add('armed'); b.innerHTML = n.g === 'dri' ? 'NO MEDICINE YET · TAP AGAIN' : 'NO FOOD YET · TAP AGAIN';
    clearTimeout(S.armT); S.armT = setTimeout(homeLabel, 4000);
    return;
  }
  homeLabel();
  goHome();
}
function homeLabel() { const b = $('#btn-home'); b.classList.remove('armed'); b.innerHTML = '🏠 GO HOME ▶'; }

function goHome() {
  S.phase = 'night';
  S.p.target = null; S.keys = {};
  if (S.tut) { S.tut = null; S.tutDone = true; store.set('wth-ep01-tut', '1'); $('#pointer').hidden = true; }
  // finish replaying the morning instantly so nothing is lost
  while (S.morningReplay?.length) S.w.trades.push(S.morningReplay.shift());
  S.route = null; renderRoute();
  document.body.classList.add('dusk');
  sfx('whoosh');
  renderTop();
  const w = S.w;
  setTimeout(() => {
    // no lumfruit tonight: first, who gets the last crust?
    if (Sim.hungryTonight(w) && Sim.aliveCount(w) >= 2) showEvening({ choice: 'crust' });
    else nightFall();
  }, 350);
}

function nightFall(crust) {
  const w = S.w, you = w.byId.you;
  if (crust) w.family.crust = crust;
  you.present = false;
  const dosesWas = Sim.family(w).jarDoses;
  Sim.endDay(w);
  const ev = w.events.slice();
  S.score.nights++;
  const hungry = ev.some(e => e.type === 'short' && e.g === 'lum');
  if (!hungry) S.score.fed++;
  if (w.family.sick) S.score.sickNights++;
  if (ev.some(e => e.type === 'wren')) S.flags.wrenNight = true;
  diffNotes();
  renderAll();
  const has = t => ev.some(e => e.type === t);
  sfx(has('died') ? 'sad' : has('sick') ? 'sick' : has('cured') ? 'cured' : hungry || has('worse') ? 'sad' : 'night');
  showEvening({ ev, dosesWas });
}

/* ---------- evening at home ---------- */
function homeScene(extra = {}) {
  const w = S.w, F = w.family, you = w.byId.you, night = S.phase === 'night' && !extra.before ? w.day - 1 : w.day;
  const members = Sim.FAMILY.map(f => {
    const hp = F.hp[f.id], sick = F.sick && F.sick.who === f.id;
    return { id: f.id, hp, alive: hp > 0, inBed: !!sick, mood: sick ? (F.sick.worse || hp <= 1 ? 'worse' : 'sick') : hp <= 1 ? 'weak' : you.hunger.lum > 0 && F.lastCrust !== f.id ? 'hungry' : 'ok' };
  });
  return { members, bowl: Sim.count(you, 'lum'), jar: { ...F.jar }, cave: w.caveDay != null && night >= w.caveDay - 1, fire: you.hunger.ket === 0, festival: !!S.fest, ...extra };
}

function showEvening(o) {
  const w = S.w, F = w.family, el = $('#evening');
  S.eve = { o, t0: performance.now(), ready: false };
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  const lines = $('#eve-lines'), facts = $('#eve-facts'), act = $('#eve-actions'), kin = $('#eve-kin'), q = $('#eve-q');
  lines.innerHTML = ''; facts.innerHTML = ''; act.innerHTML = ''; q.innerHTML = ''; kin.innerHTML = '';
  if (o.choice === 'crust') {
    // before the night: the empty bowl and one crust. The faces are the buttons.
    $('#eve-head').textContent = `NIGHT ${w.day} · NO FOOD`;
    S.eve.scene = homeScene({ before: true, bowl: 0 });
    q.innerHTML = `No ${icon('lum', 'sm')} lumfruit tonight. There's one crust left. <b>Who gets it?</b><span class="eve-sub">The others go to bed hungry and lose 1 strength.</span>`;
    kin.className = 'eve-kin choose';
    kin.innerHTML = Sim.FAMILY.filter(f => F.hp[f.id] > 0).map(f => {
      const sick = F.sick && F.sick.who === f.id;
      return `<button data-crust="${f.id}">${face(f.id, sick ? 'sick' : F.hp[f.id] <= 1 ? 'weak' : 'ok', 'big')}<span>${KIN[f.id]}</span>${pipsHTML(F.hp[f.id])}${sick ? '<em>sick</em>' : ''}</button>`;
    }).join('');
    kin.querySelectorAll('[data-crust]').forEach(b => b.onclick = () => { sfx('pop'); F.lastCrust = b.dataset.crust; nightFall(b.dataset.crust); });
    S.eve.ready = true;
    return;
  }
  const ev = o.ev, night = w.day - 1, left = FEST - w.day;
  const died = ev.find(e => e.type === 'died');
  const crustEv = ev.find(e => e.type === 'crust');
  if (!crustEv) F.lastCrust = null;
  // left: nights still to come before the festival morning (0 tonight = the festival is tomorrow)
  $('#eve-head').textContent = `NIGHT ${night}` + (left > 1 ? ` · ${left} nights to the festival` : left === 1 ? ' · one more night to the festival' : left === 0 ? ' · the festival is tomorrow!' : '');
  S.eve.scene = homeScene({ caveNight: ev.some(e => e.type === 'wren'), dose: ev.some(e => e.type === 'dose' || (e.type === 'cured' && !e.natural)), crust: crustEv && crustEv.who, dark: died ? 0.35 : 0 });
  // names under the picture, at each seat
  kin.className = 'eve-kin';
  kin.innerHTML = S.eve.scene.members.map(m => `<span style="left:${((m.inBed && m.alive ? 150 : { gran: 60, tam: 84, ola: 108 }[m.id]) / Art.HOME_W * 100).toFixed(1)}%" class="${m.alive ? '' : 'gone'}">${m.alive ? KIN[m.id] : '🕯️'}</span>`).join('');
  const c = eveningContext(ev, o);
  const pick = Evening.pick(c);
  S.eve.lines = pick.lines;
  facts.innerHTML = died ? (died.cause === 'hungry+sick' ? 'Sick, with no medicine, and too little food.' : 'Sick, with no medicine.') : factsLine(ev);
  lines.innerHTML = pick.lines.map((l, i) => `<p class="say-line" style="animation-delay:${0.5 + i * 0.5}s">${l.who === 'you' ? `<img class="face sm" src="${youURL()}" alt="You">` : face(l.who, 'ok', 'sm')}<span><b>${l.name}:</b> “${l.text}”</span></p>`).join('');
  if (died) { try { if (window.Chip && !Chip.muted) { Chip.stop(); clearTimeout(S.mournT); S.mournT = setTimeout(() => { if (S.eve) Chip.song(SONGS.mourn); }, 2000); } } catch {} }
  const nextLabel = died ? 'GO ON' : w.day >= FEST && !S.flags.end ? 'TO THE FESTIVAL ▶' : 'NEXT DAY ▶';
  const next = () => {
    $('#evening').hidden = true; S.eve = null;   // story cards (Wren, inflation, the festival) come up over the morning
    if (!checkStory(() => beginDay())) beginDay();
  };
  if (pick.choice === 'jar') {
    S.jarAsked = true;
    act.innerHTML = `<button class="btn" data-yes>YES, TOMORROW</button><button class="btn ghost" data-no>KEEP THE CRYSTALS</button>`;
    act.querySelector('[data-yes]').onclick = () => { S.jarPlan = 'zir'; F.jarPlan = 'zir'; S.jarChoice = 'plan'; sfx('coin'); act.innerHTML = `<button class="btn" data-next>${nextLabel}</button>`; act.querySelector('[data-next]').onclick = next; };
    act.querySelector('[data-no]').onclick = () => { S.jarChoice = 'kept'; sfx('pop'); act.innerHTML = `<button class="btn" data-next>${nextLabel}</button>`; act.querySelector('[data-next]').onclick = next; };
  } else {
    act.innerHTML = `<button class="btn" data-next disabled>${nextLabel}</button>`;
    const b = act.querySelector('[data-next]');
    b.onclick = next;
    setTimeout(() => { b.disabled = false; if (S.eve) S.eve.ready = true; }, 600);
  }
  $('#evening .card').onclick = e => { if (!e.target.closest('button')) lines.classList.add('all'); };
  lines.classList.remove('all');
  S.jarDosesWas = Sim.family(w).jarDoses;
}
let _you;
function youURL() { if (!_you) { const c = document.createElement('canvas'); c.width = 20; c.height = 20; Art.drawAlien(c.getContext('2d'), 10, 19, 'you', 0); _you = c.toDataURL(); } return _you; }
function pipsHTML(hp) { return `<span class="pips">${[0, 1, 2].map(i => `<i class="${i < hp ? (hp <= 1 ? 'on low' : 'on') : ''}"></i>`).join('')}</span>`; }

// Everything evening.js needs to pick tonight's lines, with real numbers from the sim.
function eveningContext(ev, o) {
  const w = S.w, F = w.family, night = w.day - 1, has = t => ev.some(e => e.type === t), get = t => ev.find(e => e.type === t);
  const sick = F.sick, fell = get('sick'), cured = get('cured'), died = get('died'), crust = get('crust');
  const H = w.history, cave = w.caveDay != null && night >= w.caveDay;
  const short = id => KIN[id] || id;
  const vars = { n: FEST - w.day, left: sick ? sick.left : 0, sick: sick ? short(sick.who) : '', cured: cured ? short(cured.who) : '' };
  // lumfruit in pentaja: today vs before the cave
  let price = null;
  if (cave) {
    const before = lumRise().a, now = carry(H.map(h => h.price.pen)).pop();   // "before" as the inflation card counts it (so the two never disagree)
    if (before && now) {
      const nr = Math.max(1, Math.round(now));
      price = { rise: now / before, now: nr };
      vars.priceLine = before >= 0.75 ? `${nr} crystals for one lumfruit today! Before Wren's cave it was ${Math.max(1, Math.round(before))}.`
        : `${nr} crystal${nr === 1 ? '' : 's'} for one lumfruit today! Before Wren's cave, one crystal bought ${Math.round(1 / before)} lumfruit.`;
    }
  }
  // the jar in mushrooms: before the cave vs today
  const J = F.jar, mb = Sim.medPriceBefore(w), dosesNow = Sim.family(w).jarDoses;
  const dosesBefore = mb && J.pen ? Math.floor((J.pen * Sim.SICK.DOSES) / mb) + (J.zir ? dosesNow : 0) : null;
  vars.jarBefore = dosesBefore; vars.jarNow = dosesNow; vars.jarPen = J.pen;
  const jarFell = cave && dosesBefore != null && dosesNow < dosesBefore && o.dosesWas != null && dosesNow < o.dosesWas;
  // moving the jar into zirnet: once, the first evening after the inflation card, while there are still
  // at least two market days left to do it (never on the last evenings)
  const jarAsk = cave && S.flags.inflation && !S.jarAsked && !S.jarPlan && !died && J.pen > 0 && night <= FEST - 3;
  // Dov hasn't caught on yet: the medicine still costs what it did before the cave
  const med = Sim.medPriceNow(w).pen, medBefore = Sim.medPriceBefore(w);
  vars.med = med;
  const medLag = fell && fell.afterCave && med && medBefore && med <= medBefore && J.pen >= med;
  const fl = S.today.firstLum;
  if (fl) { vars.seller = nm(fl.npc); vars.paid = `${WORD[fl.k] || fl.k} ${gname(fl.y, fl.k).toLowerCase()}`; }
  if (S.today.refusal) { vars.rNpc = nm(S.today.refusal.npc); vars.rGood = gname(S.today.refusal.g, 2).toLowerCase(); }
  if (S.today.indirect) vars.iGood = gname(S.today.indirect.x, 2).toLowerCase();
  const lost = F.dead.find(d => night - d.day >= 1 && night - d.day <= 2);
  if (lost) vars.dead = short(lost.who);
  return {
    night, vars, hungry: has('short') && ev.some(e => e.type === 'short' && e.g === 'lum'), hungryRun: F.hungryRun, crust: crust && crust.who,
    alive: Object.fromEntries(Sim.FAMILY.map(f => [f.id, F.hp[f.id] > 0])),
    sickWho: sick ? sick.who : null, fellSick: fell ? { afterCave: fell.afterCave } : null,
    stillSick: !!sick && !fell, noMed: has('nomed'), dose: has('dose'), sickHp: sick ? F.hp[sick.who] : null,
    cured: !!cured, curedWho: cured && cured.who, died: died ? { who: died.who } : null,
    caveNight: has('wren'), dayAfterCave: w.caveDay != null && night === w.caveDay,
    price, jarFell, jarAsk, medLag, zirToday: !!S.today.zir,
    refusal: !!S.today.refusal, indirect: !!S.today.indirect, money: !!S.today.money,
    toolsBroke: ev.some(e => e.type === 'short' && e.g === 'ket'), missing: !!lost && !died,
  };
}

// One muted line of what happened, from the night's events.
function factsLine(ev) {
  const bits = [], w = S.w, J = w.family.jar, jm = S.jarMorning || J;
  const made = ev.filter(e => e.type === 'made').reduce((s, e) => s + e.n, 0);
  if (made) bits.push(`+${made} ${icon('bog', 'sm')} made`);
  if (ev.some(e => e.type === 'short' && e.g === 'lum')) bits.push(`no ${icon('lum', 'sm')} to eat`);
  else bits.push(`ate ${icon('lum', 'sm')}`);
  for (const e of ev) {
    if (e.type === 'dose') bits.push(`${e.n} ${icon('dri', 'sm')} taken`);
    if (e.type === 'cured' && !e.natural) bits.push(`${icon('dri', 'sm')} cured ${KIN[e.who]}`);
    if (e.type === 'rot') bits.push(`${e.n} ${icon(e.g, 'sm')} went bad`);
    if (e.type === 'short' && e.g === 'ket') bits.push('🛠 tools broke');
    if (e.type === 'worse') bits.push(`${KIN[e.who]} got worse · no bogwool made while nursing`);
    if (e.type === 'full') bits.push('🎒 pack full');
  }
  const spent = jm.pen - J.pen, gotZir = J.zir - (jm.zir || 0);
  if (spent > 0) bits.push(`🫙 −${spent} ${icon('pen', 'sm')}${gotZir > 0 ? ` +${gotZir} ${icon('zir', 'sm')}` : ''}`);
  return bits.join(' · ');
}

/* ---------- side panels (desktop) and the bars ---------- */
function renderAll() { renderTop(); renderStrip(); renderPack(); renderNotes(); if (!$('#pane-village').hidden) renderVillage(); }

// The family's mood: whoever is sick looks sick; the weak look weak; everyone looks glum after a hungry night.
function moodOf(id) {
  const F = S.w.family, hp = F.hp[id];
  if (hp <= 0) return 'gone';
  if (F.sick && F.sick.who === id) return F.sick.worse || hp <= 1 ? 'worse' : 'sick';
  if (hp <= 1) return 'weak';
  return S.w.byId.you.hunger.lum > 0 ? 'hungry' : 'ok';
}
// What home needs tonight: { lum, dri, ket } (0 = nothing).
function tonightNeeds() {
  const w = S.w, you = w.byId.you, F = w.family;
  return { lum: you.acc.lum + you.needs.lum >= 1 - 1e-9 ? 1 : 0, dri: F.sick ? F.sick.left : 0, ket: you.acc.ket + you.needs.ket >= 1 - 1e-9 ? 1 : 0 };
}
// The one thing home needs most for tonight that the 🧭 helper can get today: { g, html, cls }.
// A need nobody at the market can fill today is skipped (else "needs medicine" hides "no lumfruit" and the family goes hungry).
function homeNeed() {
  const w = S.w, you = w.byId.you, F = Sim.family(w), list = [], N = tonightNeeds();
  const mush = icon('dri', 'sm');
  if (F.sick && F.dosesHave < F.dosesNeeded) {
    const n = F.dosesNeeded - F.dosesHave, who = KIN[F.who];
    list.push(F.critical
      ? { g: 'dri', cls: 'crit', html: `${who} won't last the night without ${n} ${mush} medicine (Dov)`, none: `${mush} ${who} needs medicine tonight · nobody has any today` }
      : { g: 'dri', cls: 'bad', html: `${mush} ${who} is sick: needs ${n} ${mush} medicine (Dov)`, none: `${mush} ${who} is sick · no medicine to be had today` });
  }
  if (N.lum && !Sim.count(you, 'lum')) list.push({ g: 'lum', cls: 'bad', html: `${icon('lum', 'sm')} Tonight: 1 lumfruit. You have none.`, none: `${icon('lum', 'sm')} No lumfruit to be had today` });
  if (S.jarPlan === 'zir' && F.jar.pen) list.push({ g: 'jarzir', cls: 'warn', html: `🫙 Take Gran's jar to Hesk for ${icon('zir', 'sm')} zirnet`, none: `🫙 Hesk won't swap zirnet for the jar today` });
  if (N.ket && !Sim.count(you, 'ket')) list.push({ g: 'ket', cls: 'warn', html: `${icon('ket', 'sm')} Tools break tonight: need 1 kettlestone (Bob)`, none: `${icon('ket', 'sm')} Tools break tonight · no kettlestone today` });
  if (Sim.count(you, 'lum') < 2) list.push({ g: 'lum', cls: 'ok', html: `✓ Fed tonight · 1 more ${icon('lum', 'sm')} for tomorrow?` });
  if (!Sim.count(you, 'ket')) list.push({ g: 'ket', cls: 'ok', html: `✓ Fed tonight · tools need ${icon('ket', 'sm')} soon` });
  const open = S.phase === 'market' || S.phase === 'dialog';
  const n = list.find(n => !open || canGet(n.g)), stuck = list.find(n => n.cls !== 'ok');
  if (n && (!stuck || list.indexOf(n) <= list.indexOf(stuck) || n.cls !== 'ok')) return n;
  if (stuck) return { g: null, cls: stuck.cls === 'crit' ? 'crit' : stuck.cls, html: stuck.none };
  return { g: null, cls: 'ok', html: `✓ All set · festival on day ${FEST}` };
}
// Can the 🧭 helper find any way to get g right now? Cached until the day, your pack or the jar changes.
function canGet(g) {
  const w = S.w, you = w.byId.you, key = [g, w.day, ...IDS.map(y => Sim.count(you, y)), w.family.jar.pen, w.family.jar.zir, w.family.sick ? w.family.sick.left : 0].join();
  if (S.canGetDay !== w.day) { S.canGetDay = w.day; S.canGet = {}; }
  if (!(key in S.canGet)) S.canGet[key] = routesFor(g).length > 0;
  return S.canGet[key];
}

// 🧭 HELP (and the status line): get what home needs most, by the cheapest chain of swaps.
function help() {
  if (S.phase === 'dialog') { const n = homeNeed(); if (n.g) { closeDialog(); plan(n.g); } return; }
  if (S.phase !== 'market') return;
  const n = homeNeed();
  if (n.g) plan(n.g);
  else toast(n.cls === 'ok' ? 'All set for tonight. Tap 🏠 GO HOME when you\'re ready.' : n.html, 2600);
}

function renderTop() {
  const w = S.w;
  const night = S.phase === 'night', day = night ? w.day - 1 : w.day;
  $('#day-label').innerHTML = night ? `NIGHT ${day}` : `DAY ${day}${day < FEST ? `<span class="of"> of ${FEST}</span>` : ''}`;
  $('#phase-label').textContent = UI || night ? '' : '· market';
  $('#family').innerHTML = `<button class="faces" data-plan-home title="Your family">${Sim.FAMILY.map(f => {
    const hp = w.family.hp[f.id];
    return `<span class="kin">${face(f.id, moodOf(f.id))}${hp > 0 ? pipsHTML(hp) : '<span class="pips"></span>'}</span>`;
  }).join('')}</button>`;
  const need = S.phase === 'market' && firstDay() ? { g: null, cls: 'warn', html: `👆 ${TOUCH ? 'Tap' : 'Click'} a stall to trade. ${nm(S.hintNpc || tutSeller())} has ${icon('lum', 'sm')} lumfruit.` }
    : S.phase === 'market' || S.phase === 'dialog' ? homeNeed() : null;
  const st = $('#status');
  st.className = 'status ' + (need ? need.cls : '');
  st.innerHTML = need ? `<span class="txt">${need.html}</span>${need.g ? ` <span class="go">🧭</span>` : ''}` : night ? 'Night at home.' : `Goal: reach the festival on day ${FEST} with everyone at the table.`;
  music();
  $('#family [data-plan-home]').onclick = () => { const n = homeNeed(); if (n.g && S.phase === 'market') plan(n.g); else toast(famLine(), 2600); };
}
function famLine() {
  const F = S.w.family;
  return Sim.FAMILY.map(f => F.hp[f.id] > 0 ? `${KIN[f.id]} ${'●'.repeat(F.hp[f.id])}${'○'.repeat(Sim.HP - F.hp[f.id])}` : `🕯️ ${KIN[f.id]}`).join(' · ') + ' · strength';
}

// The pack strip under the village: what home needs tonight first, then bogwool, then the rest; Gran's jar on the right.
function renderStrip() {
  const w = S.w, you = w.byId.you, F = Sim.family(w), N = tonightNeeds();
  const order = ['lum', 'dri', 'ket'].filter(g => N[g]);
  if (!order.includes('bog')) order.push('bog');
  for (const g of IDS) if (!order.includes(g) && Sim.count(you, g) > 0) order.push(g);
  const many = order.length > 5;
  const chips = order.map(g => {
    const c = Sim.count(you, g), need = N[g], st = need ? (c >= need ? 'met' : 'need') : '';
    const lbl = need ? (c >= need ? '✓ ready' : `need ${need - c}`) : SHORT[g];
    return `<button class="sg ${st} ${c ? '' : 'zero'}" data-g="${g}" aria-label="${GN(g)}: ${c}">${icon(g)}<b>${c}</b>${many && !need ? '' : `<span>${lbl}</span>`}</button>`;
  }).join('');
  const doses = F.jarDoses, J = F.jar;
  // flash when the jar loses worth after Wren's cave (not for Dov's day-to-day price wobbles before it, nor on day one)
  const afterCave = w.caveDay != null && w.day >= w.caveDay;
  if (S.jarWas != null && doses < S.jarWas && afterCave && S.phase !== 'intro') { S.jarDrop = performance.now(); sfx('drain'); }
  S.jarWas = doses;
  const drop = performance.now() - (S.jarDrop || -1e9) < 4000;
  const full = Sim.load(you) >= Sim.CAP - 0.5;
  if (full && !S.fullWarned) { S.fullWarned = true; toast('🎒 Your pack is full. Trade some bogwool away.', 2600); }
  if (!full) S.fullWarned = false;
  const el = $('#strip');
  el.classList.toggle('full', full);
  el.innerHTML = `<div class="sgs ${many ? 'many' : ''}">${chips}</div><button class="sjar ${drop ? 'drop' : ''}" data-jar aria-label="Gran's jar"><span class="l1">🫙 <b>${J.pen}</b>${icon('pen', 'sm')}${J.zir ? `<b>${J.zir}</b>${icon('zir', 'sm')}` : ''}</span><span class="l2">≈ ${doses} ${icon('dri', 'sm')}</span></button>`;
  el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { if (S.tut && S.tut.step === 3) S.tut.step = 4; const g = b.dataset.g; toast(`${icon(g)} <b>${g === 'dri' ? 'Driftcap medicine' : GOODS[g].name}</b>. ${blurb(g)} You have ${Sim.count(you, g)}.`, 3200); });
  el.querySelector('[data-jar]').onclick = () => toast(`🫙 <b>Gran's jar</b>: ${J.pen} pentaja${J.zir ? ` and ${J.zir} zirnet` : ''}. Today Dov would give about ${doses} ${icon('dri', 'sm')} medicine for it. Keep it for emergencies.`, 4000);
}
function blurb(g) { return g === 'dri' ? 'Dov grows it. Two of them cure a sickness. Wilts after 4 days.' : g === 'lum' ? 'One feeds your family for a night. Goes mushy after 3 days.' : GOODS[g].blurb; }

function renderPack() {
  if (UI) return;
  const you = S.w.byId.you;
  const load = Sim.load(you);
  const P = S.plan;
  $('#pane-pack').innerHTML = `
    <div class="planner"><div class="lbl">🧭 Find a way to get…</div>
      <div class="chips">${IDS.filter(g => g !== you.makes).map(g => `<button class="chip ${P && P.g === g ? 'on' : ''}" data-plan="${g}">${icon(g)} ${GN(g)}</button>`).join('')}</div>
      ${P ? (S.phase === 'market' || S.phase === 'dialog' ? routesHTML(P.g, P.routes) : '<p class="hint-line">The market is closed.</p>') : ''}
    </div>
    ${jarHTML()}
    <div class="pack-load">Pack: ${load.toFixed(1)} / ${Sim.CAP} <div class="bar"><i style="width:${Math.min(100, load / Sim.CAP * 100)}%"></i></div></div>
    ${IDS.map(g => {
      const c = Sim.count(you, g), G = GOODS[g];
      const ages = you.inv[g];
      const fresh = G.rot === Infinity ? 'never rots' : c ? `oldest goes bad in ${G.rot - Math.max(...ages)} day${G.rot - Math.max(...ages) === 1 ? '' : 's'}` : `rots after ${G.rot} days`;
      return `<div class="inv-row ${c ? '' : 'zero'}">${icon(g)}<div><div class="nm">${g === 'dri' ? 'Medicine (driftcap)' : G.name}${g === you.makes ? ' <span class="muted">· you make this</span>' : ''}${you.needs[g] ? ' <span class="gold">· family needs</span>' : ''}</div><div class="meta">${G.blurb} Size ${G.size}. ${fresh}.</div></div><span class="ct">${c}</span></div>`;
    }).join('')}`;
  document.querySelectorAll('#pane-pack [data-plan]').forEach(b => b.onclick = () => plan(b.dataset.plan));
  bindFollow('#pane-pack');
}

function jarHTML() {
  const F = Sim.family(S.w), J = F.jar;
  const use = F.sick ? `${KIN[F.who]} is sick: the jar can pay Dov for medicine.` : S.w.caveDay && S.w.day >= S.w.caveDay ? 'Hesk may swap zirnet for it.' : 'Only for emergencies, like medicine.';
  return `<div class="jar-row">🫙 <div><b>Gran's jar</b> · ${J.pen} ${icon('pen', 'sm')}${J.zir ? ` ${J.zir} ${icon('zir', 'sm')}` : ''} · buys about <b>${F.jarDoses}</b> ${icon('dri', 'sm')} medicine mushrooms today<div class="meta">${use}</div></div></div>`;
}

function plan(g) {
  if (UI) {   // phones: no planner sheet; follow the best way straight away
    if (S.phase !== 'market' && S.phase !== 'dialog') return;
    const routes = routesFor(g);
    if (!routes.length) { toast(noWay(g), 2600); return; }
    followRoute(routes[0]);
    const r = S.route;
    if (r) toast(`🧭 ${r.steps.map((s, i) => `${i + 1}. ${nm(s.npc)}`).join(' → ')}: follow the gold marker.`, 2200);
    return;
  }
  showTab('pack');
  if (NARROW()) $('.side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  S.plan = { g, routes: S.phase === 'market' || S.phase === 'dialog' ? routesFor(g) : [] };
  if (S.plan.routes.length === 1 && g === 'jarzir') { followRoute(S.plan.routes[0]); return; }
  renderPack();
}
function noWay(g) {
  if (g === 'jarzir') return 'Hesk won\'t swap zirnet for the jar today. Try tomorrow.';
  const maker = Sim.VILLAGERS.find(v => v.makes === g);
  const away = maker && !S.w.byId[maker.id].present;
  return `No way to get ${GN(g).toLowerCase()} today.${away ? ` ${maker.name} is away.` : ' Nobody will swap for what you have.'}`;
}

function noteCell(id, g) {
  const v = S.w.byId.you.note[id][g];
  if (S.knownNeeds[id] && S.w.byId[id].wants[g]) return '<td class="need" title="Needs it">★</td>';
  if (v == null) return '<td class="unk" title="No idea yet">·</td>';
  if (v >= 0.6) return '<td class="yes" title="Seen accepting it">✓</td>';
  if (v <= 0.25) return '<td class="no" title="Seen refusing it">✗</td>';
  return '<td class="unk" title="Mixed signals">~</td>';
}

function renderNotes() {
  if (UI) return;
  const w = S.w;
  $('#pane-notes').innerHTML = `
    <table class="notes-table"><tr><th class="who">who</th>${IDS.map(g => `<th>${icon(g, 'sm')}</th>`).join('')}<th>seen</th></tr>
    ${NPCS.map(id => `<tr><th class="who">${icon(w.byId[id].makes, 'sm')} ${nm(id)}</th>${IDS.map(g => noteCell(id, g)).join('')}<td class="muted">${w.byId[id].present ? 'today' : (w.byId.you.seen[id] ? 'd' + w.byId.you.seen[id] : '—')}</td></tr>`).join('')}
    </table>
    <p class="legend"><span class="gold">★</span> needs it · <span class="leaf">✓</span> takes it · <span style="color:var(--bad)">✗</span> refused it · · unknown. Filled in from what you hear and see.</p>
    <div class="journal">${S.journal.slice().reverse().map(j => `<div>${j}</div>`).join('') || '<div>Nothing noted yet. Go talk to someone.</div>'}</div>`;
}

// Turn changes in your notebook into journal lines.
function snapshotNotes() {
  const out = {};
  for (const id of NPCS) for (const g of IDS) out[id + ':' + g] = noteCell(id, g);
  return out;
}
function diffNotes() {
  const now = snapshotNotes(), prev = S.lastNotes || {};
  const needs = {}, takes = [], refuses = [];
  for (const key in now) {
    if (now[key] === prev[key]) continue;
    const [id, g] = key.split(':');
    if (now[key].includes('★')) (needs[id] = needs[id] || []).push(g);
    else if (now[key].includes('✓')) takes.push([id, g]);
    else if (now[key].includes('✗')) refuses.push([id, g]);
  }
  const d = `<span class="muted">d${S.w.day}</span>`;
  for (const id in needs) S.journal.push(`${d} <b>${nm(id)}</b> needs ${needs[id].map(g => icon(g, 'sm')).join(' ')}`);
  for (const [id, g] of takes) S.journal.push(`${d} <b>${nm(id)}</b> takes ${icon(g, 'sm')} ${S.w.byId[id].wants[g] ? '' : '<span class="pen">without needing it</span>'}`);
  for (const [id, g] of refuses) S.journal.push(`${d} <b>${nm(id)}</b> refused ${icon(g, 'sm')}`);
  S.lastNotes = now;
  renderNotes();
}

/* ---------- village charts ---------- */
const COLORS = Object.fromEntries(IDS.map(g => [g, GOODS[g].color]));
function renderVillage() {
  const w = S.w, H = w.history;
  const top = topMoney();
  $('#pane-village').innerHTML = `
    <div class="chart-title">HOW MANY VILLAGERS TAKE IT AS PAYMENT (WITHOUT NEEDING IT)</div>
    <canvas class="chart" id="c-money" width="640" height="300"></canvas>
    <div class="chart-legend">${IDS.map(g => `<span>${icon(g, 'sm')}<span style="color:${COLORS[g]}">${Math.round(recentMoneyness(g) * 100)}%</span></span>`).join('')}</div>
    <div class="chart-title">HOW MANY ${icon('pen', 'sm')} PENTAJA ${S.flags.zir ? 'OR ' + icon('zir', 'sm') + ' ZIRNET ' : ''}FOR ONE ${icon('lum', 'sm')} LUMFRUIT</div>
    <canvas class="chart" id="c-price" width="640" height="300"></canvas>
    <p class="muted" style="font-size:13px">Line going up = each pentaja buys less. Each villager keeps a notebook just like yours. These charts add them all up. ${H[H.length - 1].moneyness[top] > 0 ? `Right now the most widely accepted good is ${icon(top)} <b>${GN(top)}</b>.` : 'Right now nobody takes anything they don\'t need.'}</p>`;
  lineChart($('#c-money'), IDS.map(g => ({ color: COLORS[g], pts: H.map(h => h.moneyness[g]) })), 1, '%');
  const series = [{ color: COLORS.pen, pts: carry(H.map(h => h.price.pen)) }];
  if (S.flags.zir) series.push({ color: COLORS.zir, pts: carry(H.map(h => h.price.zir)) });
  lineChart($('#c-price'), series, null, '');
}
function carry(a) { let last = null; return a.map(v => (v == null ? last : (last = v))); }
function smooth(a, k = 3) { return a.map((v, i) => { const s = a.slice(Math.max(0, i - k + 1), i + 1).filter(x => x != null); return s.length ? s.reduce((p, q) => p + q, 0) / s.length : null; }); }

function lineChart(c, series, maxY, unit) {
  const g = c.getContext('2d'), W = c.width, Hh = c.height, pad = 30;
  g.clearRect(0, 0, W, Hh);
  const n = Math.max(2, ...series.map(s => s.pts.length));
  const m = maxY ?? Math.max(1, ...series.flatMap(s => s.pts.filter(v => v != null))) * 1.1;
  g.strokeStyle = '#3a2d5c'; g.lineWidth = 1; g.fillStyle = '#6c5f93'; g.font = '18px Space Grotesk';
  for (let i = 0; i <= 4; i++) {
    const y = Hh - pad - (Hh - 2 * pad) * i / 4;
    g.beginPath(); g.moveTo(pad, y); g.lineTo(W - 8, y); g.stroke();
    g.fillText(unit === '%' ? Math.round(m * i / 4 * 100) + '%' : (m * i / 4).toFixed(1), 2, y - 3);
  }
  const X = i => pad + (W - pad - 10) * i / (n - 1);
  const Y = v => Hh - pad - (Hh - 2 * pad) * v / m;
  if (S.w.caveDay) {
    const i = S.w.caveDay - 1;
    g.strokeStyle = '#ff6fb5'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(i), pad / 2); g.lineTo(X(i), Hh - pad); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ff6fb5'; g.fillText('Wren\'s cave', X(i) + 6, pad);
  }
  for (const s of series) {
    const pts = unit === '%' ? smooth(s.pts) : s.pts;
    g.strokeStyle = s.color; g.lineWidth = 4; g.beginPath();
    let started = false;
    pts.forEach((v, i) => { if (v == null) return; if (!started) { g.moveTo(X(i), Y(v)); started = true; } else g.lineTo(X(i), Y(v)); });
    g.stroke();
  }
  g.fillStyle = '#6c5f93'; g.fillText('day 1', pad, Hh - 6); g.fillText('day ' + n, W - 70, Hh - 6);
}

function topMoney(h = S.w.history[S.w.history.length - 1]) {
  return IDS.reduce((a, b) => (h.moneyness[b] > h.moneyness[a] ? b : a));
}
function recentMoneyness(g, days = 3) {
  const H = S.w.history.slice(-days);
  return H.reduce((s, h) => s + h.moneyness[g], 0) / H.length;
}

/* ---------- story ---------- */
// A card with OK (done) and, optionally, a second button alt = { text, fn }; cls styles the card (e.g. 'end').
function story(html, done, okText = 'OK', alt = null, cls = '') {
  const prev = S.phase;
  S.phase = 'story';
  $('#story-body').innerHTML = html.replace(/(<img class="gi[^>]*>(?:<\/b>)?)(?=[.,:;!?)])/g, '$1⁠');   // no line break between an icon and its full stop
  $('#story-ok').textContent = okText;
  const ab = $('#story-alt'), card = $('#story .card');
  ab.hidden = !alt; if (alt) ab.textContent = alt.text;
  card.className = 'card story ' + cls;
  $('#story').hidden = false;
  card.scrollTop = 0;
  const close = fn => () => { $('#story').hidden = true; S.phase = prev === 'story' ? 'market' : prev; if (fn) fn(); };
  $('#story-ok').onclick = close(done);
  ab.onclick = alt ? close(alt.fn) : null;
}

// One basket of lumfruit, priced in whole pentaja before the cave and now (a, b = pentaja per lumfruit):
// "2 lumfruit cost 1 pentaja. Now the same 2 cost 8." Ten times the basket when rounding would hide the change.
function basket(a, b) {
  let n = a < 1 ? Math.round(1 / a) : 1;
  if (Math.round(n * b) <= Math.max(1, Math.round(n * a))) n *= 10;
  return { n, pa: Math.max(1, Math.round(n * a)), pb: Math.round(n * b) };
}
function priceChange(a, b) {
  const { n, pa, pb } = basket(a, b);
  return `Before Wren's cave, ${n} ${icon('lum', 'sm')} lumfruit cost <b>${pa}</b> ${icon('pen', 'sm')}.<br>Now ${n === 1 ? 'it costs' : `the same ${n} cost`} <b class="pen">${pb}</b> ${icon('pen', 'sm')}.`;
}

// Pentaja per lumfruit: a = before the cave (average), b = the last 3 days.
function lumRise() {
  const H = S.w.history, avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  return { a: avg(H.slice(1, S.w.caveDay).map(h => h.price.pen).filter(v => v != null)), b: avg(H.slice(-3).map(h => h.price.pen).filter(v => v != null)) };
}
// The jar in days of food (1 lumfruit a day), before the cave and now, at the basket prices the card just showed.
function jarFood(a, b) {
  const J = S.w.family.jar, { n, pa, pb } = basket(a, b), fa = Math.floor(J.pen * n / pa), fb = Math.floor(J.pen * n / pb);
  return J.pen && fa > fb ? `<p>🫙 Gran's ${J.pen} ${icon('pen', 'sm')} used to buy <b>${fa} days</b> of food. Today: <b class="pen">${fb ? fb + ' day' + (fb === 1 ? '' : 's') : 'not even 1 day'}</b>.</p>` : '';
}

// Story beats fire on what the simulation actually did, not on a fixed script.
// (Sickness has no card: it happens at home, in the evening scene.)
function checkStory(then) {
  const w = S.w, f = S.flags, F = w.family;
  const fire = (key, html, ok, after, alt, cls) => {
    f[key] = true;
    sfx({ refusal: 'nope', indirect: 'tada', money: 'chime', wren: 'thud', inflation: 'sad', zir: 'chime', end: 'fanfare' }[key] || 'pop');
    // after a card, any other card that's due comes next (so a card on the festival morning can't push the festival back a day)
    const go = fn => () => { renderAll(); if (fn) fn(); if (then) { if (!checkStory(then)) then(); } else checkStory(); };
    music();
    story(html, go(after), ok, alt && { text: alt.text, fn: go(alt.fn) }, cls); return true;
  };

  if (!UI && !f.refusal && f.sawRefusal && S.phase === 'market') {
    const { npc, g } = f.sawRefusal;
    return fire('refusal', `
      <h2>${nm(npc)} doesn't want your ${GN(g).toLowerCase()}</h2>
      <p>${nm(npc)} has something you want. But you have nothing ${nm(npc)} wants.</p>
      <p>That's the problem with barter: a swap only works when <b>each of you wants exactly what the other has</b>.</p>
      <p class="muted">Your <b>NOTEBOOK</b> keeps track of who takes what.</p>`);
  }
  if (!UI && !f.indirect && f.indirectPending && S.phase === 'market') {
    const { x } = f.indirectPending;
    const fans = NPCS.filter(id => w.byId.you.note[id][x] >= 0.6).map(nm);
    S.today.indirect = f.indirectPending;
    return fire('indirect', `
      <h2>You just bought something you can't use</h2>
      <p>Your family has no use for ${icon(x)} <b>${GN(x).toLowerCase()}</b>. You took it because ${fans.length ? '<b>' + fans.slice(0, 2).join('</b> and <b>') + '</b>' : 'someone'} will take it for what you really need.</p>
      <p class="big">That's <b class="gold">indirect exchange</b>: taking something not to use, but to trade it on.</p>`);
  }
  const top = topMoney();
  if (!f.money && w.day >= 4 && recentMoneyness(top) >= 0.5 && (S.phase === 'market' || S.phase === 'night')) {
    f.moneyGood = top; todayFlag('money');
    $('#tab-village').hidden = false; $('#tab-village').classList.add('new');
    const G = GOODS[top];
    const why = [];
    if (G.rot === Infinity) why.push('it never rots'); else why.push(`it lasts ${G.rot} days`);
    if (G.size < 1) why.push('it\'s tiny');
    if (Sim.VILLAGERS.find(v => v.makes === top).rate < 1) why.push('nobody can make much of it');
    const liked = Sim.VILLAGERS.some(v => v.keeps && v.keeps[top]) ? ` People already liked owning a few${top === 'pen' ? ', like Gran' : ''}.` : '';
    const r = fire('money', `
      <h2>Something is happening in Ulm Hollow</h2>
      <p>More and more villagers take ${icon(top)} <b>${GN(top).toLowerCase()}</b> with <b>no use for it</b>. They take it because they know <i>others</i> will.</p>
      ${UI ? `<canvas class="chart inline" id="c-inline" width="680" height="300"></canvas><p class="chart-cap">Villagers who take ${icon(top, 'sm')} ${GN(top).toLowerCase()} as payment, day by day</p>` : ''}
      <p class="long">Why ${GN(top).toLowerCase()}? ${why.join(', ').replace(/, ([^,]*)$/, ' and $1').replace(/^./, c => c.toUpperCase())}.${liked}</p>
      <p class="big">A good people take only to trade it on is called <b class="pen">money</b>.</p>
      <p class="muted">In real life: you can't eat a euro either. You take it because you know the baker will.</p>
      <p class="quote long">"Money has not been generated by law. In its origin it is a social, and not a state-institution." Carl Menger, <i>On the Origins of Money</i>, 1892</p>`,
      UI ? 'OK' : 'SHOW ME', UI ? null : () => showTab('village'));
    if (UI) lineChart($('#c-inline'), [{ color: COLORS[top], pts: w.history.map(h => h.moneyness[top]) }], 1, '%');
    return r;
  }
  if (!f.wren && w.caveDay && w.day >= w.caveDay) {
    return fire('wren', `
      <h2>Wren found a cave full of pentaja</h2>
      <p>Wren used to dig up one every two days. Now: <b class="pen">ten a day</b>.</p>
      <p>Wren spends them right away, at the old prices. Soon every pentaja buys less${F.jar.pen ? `, even the ${F.jar.pen} in Gran's jar` : ''}.</p>
      <p class="muted long">Hesk's zirnet can't be found any faster. In an old fable, a wren became king of the birds by riding on the eagle's back. It won without doing the work.</p>`);
  }
  const rise = w.caveDay && w.day >= w.caveDay + 3 ? lumRise() : null;   // wait (a few days at most) until the rise shows in whole numbers
  if (!f.inflation && rise && (rise.b > rise.a * 1.25 || w.day >= w.caveDay + 5)) {
    const { a, b } = rise;
    $('#tab-village').classList.add('new');
    return fire('inflation', `
      <h2>Your pentaja buys less</h2>
      ${a && b && b > a ? `<p>${priceChange(a, b)}</p>` : ''}
      <p>Lumfruit didn't change. There's just far more pentaja around, so each one buys less. That's <b class="pen">inflation</b>.</p>
      ${a && b && b > a ? jarFood(a, b) : ''}
      <p>Wren spent first, at the old prices. Everyone who <b>saved</b> pentaja paid the difference.</p>
      <p class="muted">In real life: a dollar saved in the year 2000 buys only about half as much today.</p>`, 'OOF');
  }
  if (!f.zir && w.caveDay && w.day > w.caveDay + 2 && recentMoneyness('zir') > recentMoneyness('pen') + 0.15) {
    $('#tab-village').classList.add('new');
    todayFlag('zir');
    return fire('zir', `
      <h2>The village is quietly switching</h2>
      <p>Fewer villagers take ${icon('pen', 'sm')} pentaja now. More ask for ${icon('zir', 'sm')} <b class="zir">zirnet</b>. Hesk still finds only one every few days, and nobody can make more. So people keep their savings in zirnet.</p>
      <p class="big">Your savings are only as safe as <b>the limit on making more money</b>.</p>
      <p class="muted">In real life: where prices rise fast, as in Argentina or Turkey, many families save in US dollars or gold instead.</p>`);
  }
  if (!f.end && w.day >= FEST) {
    S.fest = true;
    const r = fire('end', endScreen(), '▶ EP 02', () => { location.href = '../02-every-wren/'; },
      { text: 'KEEP PLAYING', fn: () => { S.fest = false; music(); } }, 'end');
    const c = $('#fest-canvas');
    if (c) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; Art.drawHome(g, homeScene({ festival: true, before: true, bowl: 3, fire: true })); }
    return r;
  }
  return false;
}

// A card that fires in the morning (before the market opens) counts for that day's evening.
function todayFlag(k) { (S.phase === 'night' ? (S.morningFlags = S.morningFlags || {}) : S.today)[k] = true; }

/* ---------- the festival: score and end screen ---------- */
const median = a => { const b = a.filter(v => v != null && isFinite(v)).sort((p, q) => p - q); return b.length ? b[(b.length - 1) >> 1] : null; };
function endScreen() {
  const w = S.w, sc = S.score, J = w.family.jar, eps = w.family.episodes, dead = w.family.dead, D = Sim.SICK.DOSES;
  const cured = eps.filter(e => e.cured && !e.natural).length;
  // "was": the same crystals before the cave (what's in the jar, plus any pentaja you swapped for zirnet), as the cards count it
  const base = J.pen + (S.penToZir || 0);
  // ...in medicine mushrooms, at Dov's steady prices (as in the strip); ifZir: had it all been in zirnet since before the cave (for the best score)
  const F = Sim.family(w), m = F.trend, mb = { pen: Sim.medPriceBefore(w), zir: Sim.medPriceBefore(w, 'zir') };
  const meds = F.jarDoses, medsBefore = mb.pen && base ? Math.floor(base * D / mb.pen) : null;
  const ifZir = mb.pen && mb.zir && m.zir && base ? Math.floor(base / mb.pen * mb.zir * D / m.zir) : null;
  const alive = Sim.FAMILY.length - dead.length;
  const score = sc.fed * 10 + cured * 25 + meds * 5 + alive * 40;
  const max = sc.nights * 10 + eps.filter(e => e.cured || e.died).length * 25 + Math.max(meds, ifZir || 0, medsBefore || 0) * 5 + Sim.FAMILY.length * 40;
  const stars = Math.max(0, (score >= max * 0.8 ? 3 : score >= max * 0.55 ? 2 : score >= max * 0.3 ? 1 : 0) - dead.length);
  let best = 0; try { best = +localStorage.getItem('wth-ep01-best') || 0; if (score > best) localStorage.setItem('wth-ep01-best', score); } catch {}
  const isBest = score > best;
  if (isBest && best) setTimeout(() => sfx('tada'), 900);
  const mush = n => `${n} ${icon('dri', 'sm')}`;
  // the ones who didn't make it, tied to what happened to the jar
  let memorial = '';
  if (dead.length) {
    const names = dead.map(d => KIN[d.who]);
    const bits = dead.map(d => {
      const e = eps.find(e => e.who === d.who && e.died === d.day);
      if (e && e.afterCave && medsBefore && medsBefore > meds) return `${KIN[d.who]} fell sick after Wren's cave, and the jar that once bought ${medsBefore} mushrooms bought only ${Math.max(meds, 0)}.`;
      if (e && e.afterCave) return `${KIN[d.who]} fell sick after Wren's cave, when every crystal bought less.`;
      return `${KIN[d.who]} fell sick on night ${e ? e.since : d.day - 1} and didn't get medicine in time.${!e || e.afterCave ? '' : ' The crystals in the jar could have paid Dov for it.'}`;
    });
    memorial = `<p class="memorial">🕯️ ${names.join(' and ')} didn't see the festival. ${bits.join(' ')}</p>`;
  }
  // the jar, in one sentence: what's in it, and what those crystals bought before the cave and now
  const jarLine = !J.pen && !J.zir ? `🫙 Gran's jar is empty: its crystals paid Dov for medicine.`
    : J.zir ? `🫙 You moved Gran's jar into ${icon('zir', 'sm')} zirnet: it holds ${J.zir} zirnet${J.pen ? ` and ${J.pen} pentaja` : ''}.${medsBefore != null ? ` Before Wren's cave, its crystals bought ${mush(medsBefore)} medicine. Now: <b class="zir">${mush(meds)}</b>.` : ` Now it buys ${mush(meds)} medicine.`}`
    : medsBefore != null ? `🫙 Gran's jar: ${J.pen} ${icon('pen', 'sm')} pentaja. Before Wren's cave: ${mush(medsBefore)} medicine. Now: <b class="pen">${mush(meds)}</b>.`
    : `🫙 Gran's jar: ${J.pen} ${icon('pen', 'sm')} pentaja. Now it buys ${mush(meds)} medicine.`;
  return `<div class="endscreen">
    <h2>🎉 The harvest festival!</h2>
    <div class="fest-pic"><canvas id="fest-canvas" class="px" width="${Art.HOME_W}" height="${Art.HOME_H}"></canvas><span class="stars">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></span></div>
    ${memorial}
    <div class="score">
      <div class="srow"><span>🍽️ Nights your family ate</span><b>${sc.fed} / ${sc.nights}</b></div>
      <div class="srow"><span>❤️ Made it to the festival</span><b>${alive} / ${Sim.FAMILY.length}</b></div>
      ${eps.length ? `<div class="srow"><span>${icon('dri', 'sm')} Sicknesses cured</span><b>${cured} / ${eps.length}</b></div>` : ''}
      <p class="cmp jarline">${jarLine}</p>
      <div class="total pixel">SCORE ${score}${isBest && best ? ' <span class="gold">NEW BEST!</span>' : best ? ` <span class="muted">· BEST ${Math.max(best, score)}</span>` : ''}</div>
    </div>
    <h3 class="pixel sub">WHAT YOU SAW</h3>
    <ol class="take">
      <li>Nobody invented money. People picked the thing that was easiest to pass on.</li>
      <li>When someone can make lots more of it, each one buys less. That's <b class="pen">inflation</b>.</li>
      <li>Whoever gets the new money first wins. Savers lose.</li>
    </ol>
    <p class="muted">In real life: euros and dollars aren't dug out of a cave. Central banks and ordinary banks create them, mostly when they lend. When a lot more is made, prices rise and savings buy less.</p>
    <p class="again">Next: <b>EP 02 · Every Wren in History</b>. Or <a href="?seed=${1 + Math.floor(Math.random() * 99)}">🔁 play a new village</a> and beat your score.</p>
  </div>`;
}

/* ---------- sound and juice ---------- */
const _ = null;
const SONGS = {   // calm market; tense after the cave; brighter once the village moves to zirnet; slow while someone is sick
  market: { bpm: 84, style: 'calm', chords: [60, 65, 60, 67, 60, 65, 60, 67], melody: [[72, _, 76, _, 79, _, 76, _], [77, _, 76, _, 72, _, _, _], [76, _, 79, _, 84, _, 81, 79], [79, _, _, 74, _, _, _, _],
    [72, _, 76, _, 79, _, 81, _], [81, _, 79, _, 77, _, 76, _], [76, _, 74, _, 72, _, _, 74], [74, _, _, 71, _, _, _, _]] },
  tense: { bpm: 96, style: 'mystery', chords: [57, 53, 55, 52], melody: [[69, _, _, 72, _, _, 71, _], [69, _, _, _, 65, _, _, _], [67, _, 71, _, 74, _, 72, _], [71, _, _, _, 68, _, _, _]] },
  zir: { bpm: 92, style: 'calm', chords: [62, 67, 69, 62], melody: [[74, _, 78, _, 81, _, 78, _], [79, _, 78, _, 74, _, _, _], [76, _, 78, _, 81, _, 83, _], [81, _, _, 78, 74, _, _, _]] },
  sick: { bpm: 66, style: 'calm', arp: [0, 3, 7, 12], chords: [57, 52, 53, 52], melody: [[69, _, _, _, 67, _, _, _], [64, _, _, _, _, _, _, _], [65, _, _, _, 64, _, _, _], [64, _, _, _, 59, _, _, _]] },
  fest: { bpm: 126, style: 'island', chords: [60, 65, 67, 60], melody: [[72, 74, 76, _, 79, _, 76, _], [77, _, 81, _, 79, 77, 76, _], [74, 76, 77, _, 79, _, 74, _], [72, _, 76, _, 72, _, _, _]] },
};
SONGS.mourn = { ...SONGS.sick, bpm: 50 };
const sfx = n => { try { if (window.Chip) Chip.sfx(n); } catch {} };
// the right loop for this moment (switches only when it changes)
function music() {
  if (!window.Chip || !S.started || S.eve) return;
  const w = S.w, s = S.fest ? SONGS.fest : w.family.sick ? SONGS.sick : S.flags.zir ? SONGS.zir : w.caveDay && w.day >= w.caveDay ? SONGS.tense : SONGS.market;
  if (Chip.playing !== s) try { Chip.song(s); } catch {}
}
const muteBtn = $('#mute');
const muteLabel = () => { muteBtn.textContent = !window.Chip || Chip.muted ? '🔇' : '🔊'; muteBtn.classList.toggle('off', !window.Chip || Chip.muted); };
muteBtn.onclick = () => { if (!window.Chip) return; Chip.setMuted(!Chip.muted); muteLabel(); if (!Chip.muted) { music(); sfx('pop'); } };
muteLabel();

const mid = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
// "+1 🍋" rising and fading at a screen point
function floatAt(html, x, y, cls = '') {
  const el = document.createElement('div'); el.className = 'float ' + cls; el.innerHTML = html;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
}
// goods flying from a screen point into the pack strip; the target bumps when they land
function flyInto(g, n, from, toEl, then) {
  if (!toEl) return;
  const to = mid(toEl), tr = (p, k) => `translate(${p.x - 12}px, ${p.y - 12}px) scale(${k})`;
  for (let i = 0; i < Math.min(n, 3); i++) {
    const im = document.createElement('img'); im.className = 'gi flyer'; im.src = Art.iconURL[g]; im.alt = '';
    document.body.appendChild(im);
    const a = im.animate([{ transform: tr(from, 1.4) }, { transform: tr({ x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 50 }, 1.2), offset: 0.45 }, { transform: tr(to, 0.6) }],
      { duration: 650, delay: i * 90, easing: 'ease-in', fill: 'both' });
    a.onfinish = () => { im.remove(); if (i === 0) { bump(toEl); if (then) then(); } };
  }
}
// screen point of a spot on the village map
function mapPt(p) { const r = canvas.getBoundingClientRect(), k = r.width / canvas.width; return { x: r.left + p.x * k, y: r.top + p.y * k }; }
// what you just got for home flies from the stall into its chip in the pack strip
function homeLand(x, n, npc) {
  const to = document.querySelector(`#strip [data-g="${x}"]`) || $('#family .faces');
  sfx('whoosh');
  flyInto(x, n, mapPt(STALLS[npc].npc), to, () => {
    sfx('tada');
    const m = mid(to); floatAt(`+${n} ${icon(x, 'sm')}${homeNeed().g ? '' : ' ✓'}`, m.x, m.y - 20, 'good');
  });
}

// a line over the village for a few seconds
function toast(html, ms = 2200) {
  const el = $('#toast'); el.innerHTML = html; el.hidden = false;
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  clearTimeout(S.toastT); S.toastT = setTimeout(() => { el.hidden = true; }, ms);
}
$('#toast').onclick = () => { $('#toast').hidden = true; };

/* ---------- loop ---------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt);
  replayMorning(now);
  draw(now / 1000);
  renderOverlay(now);
  tutorial(now);
  if (S.eve && S.eve.scene) { const c = $('#eve-canvas'), g = c.getContext('2d'); g.imageSmoothingEnabled = false; Art.drawHome(g, { ...S.eve.scene, t: now / 1000 }); }
  if (S.phase === 'dialog' && now - (S.lastPortrait || 0) > 120) { Art.drawPortrait($('#portrait'), S.dlg.npc, now / 1000); S.lastPortrait = now; }
  if (S.phase === 'market' && !S.storyCheckAt) S.storyCheckAt = now;
  if (S.phase === 'market' && now - S.storyCheckAt > 500) { S.storyCheckAt = now; checkStory(); if (now - (S.stripAt || 0) > 1000) { S.stripAt = now; renderStrip(); } }
  requestAnimationFrame(frame);
}

newGame();
requestAnimationFrame(frame);
window.__S = S; window.__T = { plan, homeTap, help, homeNeed }; // handy in the console (and for tools/drive.js runs)
})();
