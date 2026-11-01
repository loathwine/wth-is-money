/* ============================================================
   EP 01 · The Barter Market — the playable village.
   The economy lives in sim.js; this file is input, drawing and story.
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
const SEED = +(params.get('seed') ?? 6);
// Phone controls (bottom bar, sheets) on a portrait phone (Art.PHONE: the tall map) and on a phone held
// sideways (the wide map, the bar as a rail on the right).
const LANDQ = matchMedia('(pointer: coarse) and (max-height: 500px) and (orientation: landscape)');
const UI = PHONE || LANDQ.matches;

const icon = (g, cls = '') => `<img class="gi ${cls}" src="${Art.iconURL[g]}" alt="${GOODS[g].name}" title="${GOODS[g].name}">`;
const gname = (g, n = 1) => GOODS[g].name + (n === 1 || /s$|wool$|milk$/.test(GOODS[g].name) ? '' : 's');
const FEST = Sim.FESTIVAL;
const face = (id, mood = 'ok', cls = '') => `<img class="face ${mood} ${cls}" src="${Art.faceURL(id, mood)}" alt="${famName(id)}">`;
const famName = id => Sim.FAMILY.find(f => f.id === id).name;
const famFaces = (cls = '') => Sim.FAMILY.map(f => face(f.id, 'ok', cls)).join('');
// where you start each morning: in the plaza by the standing stone, not at your door
const START = PHONE ? { x: STONE.x + 26, y: STONE.y + 4 } : { x: STONE.x, y: STONE.y + 30 };
const nm = id => Sim.VILLAGERS.find(v => v.id === id).name;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const LINES = {
  mira: { hi: ['Fresh lumfruit! Still glowing.', 'Lumfruit, picked this morning.'], no: ['What would I do with {g}?', 'No thanks, I\'ve no use for {g}.'] },
  bob:  { hi: ['Kettlestone. Heavy. Good.', 'Bob has stones.'], no: ['{g}? Nah.', 'Bob no need {g}.'] },
  sela: { hi: ['Snarlmilk! Drink it before it sours.', 'Milk from my snarls. Fresh today.'], no: ['Hmm, {g}? Not for me.', 'I\'d never get rid of {g}.'] },
  dov:  { hi: ['Driftcaps. They float, you know. Medicine.', 'Driftcap for what ails you.'], no: ['{g}? Can\'t heal anyone with that.', 'Not {g}, friend.'] },
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
  plan: null,                // { g, routes } shown in the pack tab
  lastNotes: null,
  score: { nights: 0, fed: 0, sickNights: 0 },   // for the festival
  autoRun: false,            // ⏩ days pass on their own until something happens
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

function newGame() {
  S.w = Sim.createWorld({ seed: SEED });
  S.flags = {}; S.journal = []; S.ticker = []; S.knownNeeds = {}; S.bubbles = [];
  S.lastNotes = snapshotNotes();
  renderAll();
  // dev shortcuts: ?skip=12 plays 12 days on autopilot; &talk=mira opens a stall; &tab=village
  const skip = +(params.get('skip') || 0);
  if (skip) {
    for (const k of ['refusal', 'indirect']) S.flags[k] = true;
    for (let i = 0; i < skip; i++) { Sim.startDay(S.w); S.w.playerAuto = true; Sim.endDay(S.w); S.w.playerAuto = false; }
    beginDay();
    while (S.morningReplay.length) { const t = S.morningReplay.shift(); S.w.trades.push(t); showTrade(t); }
    if (params.get('talk')) { openDialog(params.get('talk')); if (params.get('pick') && S.phase === 'dialog') { S.dlg.x = params.get('pick'); renderDialog(); } if (params.get('find') && S.phase === 'dialog') findWay(params.get('find')); }
    if (params.get('plan')) { plan(params.get('plan')); if (params.get('follow')) followRoute(S.plan.routes[0]); }
    if (params.get('tab')) { $('#tab-village').hidden = false; showTab(params.get('tab')); }
    if (params.get('story') !== '1') S.flags = Object.assign(S.flags, { money: true, wren: true, inflation: true, zir: true, end: true, sickSeen: S.w.family.episodes.length });
    return;
  }
  story(introCard(), () => beginDay(), 'WALK TO THE MARKET');
}

function beginDay() {
  Sim.startDay(S.w);
  S.phase = 'market';
  S.p.x = START.x; S.p.y = START.y; S.p.target = null;
  S.tradedToday = false; S.started = true;
  S.route = null; S.plan = null; renderRoute();
  S.morning = S.w.trades.slice();
  S.w.trades.length = 0;  // re-added as they're replayed, so stats see them
  S.morningReplay = S.morning.slice();
  S.nextMorningAt = performance.now() + 600;
  addTicker(`<b>Day ${S.w.day}.</b> The market is open. ${awayText()}`);
  diffNotes();
  renderAll();
  if (S.autoRun) autoDay();
}

function awayText() {
  const away = NPCS.filter(id => !S.w.byId[id].present).map(nm);
  if (!away.length) return 'Everyone is here today.';
  return `${away.join(' and ')} ${away.length > 1 ? 'didn\'t' : 'didn\'t'} come today.`;
}

/* ---------- input ---------- */
addEventListener('keydown', e => {
  if (S.phase !== 'market') return;
  const k = e.key.toLowerCase();
  S.keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'e' || k === ' ' || k === 'enter') interact();
});
addEventListener('keyup', e => { S.keys[e.key.toLowerCase()] = false; });

canvas.addEventListener('pointerdown', e => {
  if (UI && sheetOpen()) { closeSheet(); return; }
  if (S.autoRun) stopAuto();
  if (S.phase !== 'market') return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * canvas.width;
  const y = (e.clientY - r.top) / r.height * canvas.height;
  // clicked a stall? walk to its front and talk
  for (const id of NPCS) {
    const s = STALLS[id];
    if (x > s.counter.x - 4 && x < s.counter.x + s.counter.w + 4 && y > s.counter.y - 32 && y < s.counter.y + s.counter.h + 6) {
      walkTo({ x: s.front.x, y: s.front.y, talk: id }); return;
    }
  }
  if (Math.hypot(x - DOOR.x, y - (DOOR.y - 10)) < 24) { walkTo({ x: DOOR.x, y: DOOR.y + 8, home: true }); return; }
  walkTo({ x, y });
});

$('#overlay').addEventListener('click', e => { if (e.target.closest('[data-interact]') && S.phase === 'market') interact(); });
if (TOUCH) $('#hint').innerHTML = 'Tap to walk. Tap a stall to trade.';
$('#btn-home').onclick = () => { if (S.phase === 'market' && sureHome()) goHome(); };
$('#btn-auto').onclick = () => S.autoRun ? stopAuto() : startAuto();
document.querySelectorAll('.tab').forEach(b => b.onclick = () => showTab(b.dataset.tab));
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeDialog());
$('#dialog').addEventListener('click', e => { if (e.target.id === 'dialog') closeDialog(); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.phase === 'dialog') closeDialog();
  if ((e.key === 'Enter' || e.key === ' ') && S.phase === 'story') { e.preventDefault(); $('#story-ok').click(); }
});

function showTab(t) {
  document.querySelectorAll('.phonebar [data-sheet]').forEach(b => { b.classList.toggle('on', b.dataset.sheet === t && sheetOpen()); if (b.dataset.sheet === t) b.classList.remove('new'); });
  document.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.tab === t); if (b.dataset.tab === t) b.classList.remove('new'); });
  for (const p of ['pack', 'notes', 'village']) $('#pane-' + p).hidden = p !== t;
  if (t === 'village') renderVillage();
}

// phones: the side panel is a sheet that slides up over the village
const sheetOpen = () => $('#side').classList.contains('open');
function openSheet(t) { $('#side').classList.add('open'); showTab(t); }
function closeSheet() { $('#side').classList.remove('open'); document.querySelectorAll('.phonebar [data-sheet]').forEach(b => b.classList.remove('on')); }
document.querySelectorAll('.phonebar [data-sheet]').forEach(b => b.onclick = () =>
  sheetOpen() && b.classList.contains('on') ? closeSheet() : openSheet(b.dataset.sheet));
$('#sheet-close').onclick = closeSheet;
$('#pb-auto').onclick = () => { closeSheet(); $('#btn-auto').click(); };
$('#pb-home').onclick = () => { closeSheet(); $('#btn-home').click(); };

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
  if (n.home) goHome();
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
      if (t.home) goHome();
      return;
    }
    vx = dx / d; vy = dy / d;
  }
  const len = Math.hypot(vx, vy); if (!len) return;
  const sp = 100 * dt;
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

  // light: dawn → day → dusk across the real minutes you spend at the market
  if (S.phase === 'night' || S.phase === 'intro') { ctx.fillStyle = 'rgba(10,4,30,.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

/* ---------- overlay (HTML on top of the canvas) ---------- */
const overlay = $('#overlay');
function fitCanvas() {
  const fr = $('#world-frame').getBoundingClientRect();
  const k = Math.min(fr.width / canvas.width, fr.height / canvas.height);
  const w = Math.floor(canvas.width * k), h = Math.floor(canvas.height * k);
  if (canvas._w !== w || canvas._h !== h) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas._w = w; canvas._h = h; }
}
function layoutOverlay() {
  fitCanvas();
  const fr = $('#world-frame').getBoundingClientRect(), r = canvas.getBoundingClientRect();
  Object.assign(overlay.style, { left: (r.left - fr.left) + 'px', top: (r.top - fr.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
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
    if (n) {
      const pos = n.home ? { x: DOOR.x, y: DOOR.y - 26 } : { x: S.p.x, y: S.p.y - 22 };
      html.push(`<button class="prompt" data-interact style="left:${pos.x * k}px;top:${pos.y * k}px">${TOUCH ? 'TAP' : 'E'} · ${n.home ? 'go home' : 'talk to ' + nm(n.npc)}</button>`);
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
  S.nextMorningAt = now + (S.autoRun ? 300 : 750);
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

function addTicker(html) {
  S.ticker.unshift(html);
  S.ticker.length = Math.min(S.ticker.length, 30);
  $('#ticker').innerHTML = S.ticker.slice(0, 5).map((h, i) => `<div class="${i === 0 ? 'fresh' : ''}">${h}</div>`).join('');
}

/* ---------- trade table ---------- */
function openDialog(id) {
  closeSheet();
  const a = S.w.byId[id];
  if (!a.present) { bubble('you', `${nm(id)} isn't here today`, true); return; }
  S.phase = 'dialog';
  S.p.target = null; S.keys = {};
  const st = routeStep();
  S.dlg = { npc: id, x: st && st.npc === id ? st.x : null, find: null, routes: null, learned: false };
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
  const list = gs => gs.map(g => icon(g, 'sm') + ' ' + GOODS[g].name).join(', ');
  $('#d-looking').innerHTML = `Makes ${icon(a.makes, 'sm')} ${GOODS[a.makes].name} · Needs ${list(Object.keys(a.needs))}${Object.keys(a.keeps).length ? ' · Likes to own ' + list(Object.keys(a.keeps)) : ''}`;
  $('#d-their-label').textContent = `${nm(npc).toUpperCase()}'S STALL · pick what you want`;

  // Every price at this stall, for everything you could pay with (held or not).
  const stall = IDS.filter(g => Sim.count(a, g) > 0);
  const Q = {};
  for (const x of stall) { Q[x] = {}; for (const y of IDS) if (y !== x) Q[x][y] = Sim.quote(w, npc, x, y); }
  const affordable = x => IDS.filter(y => Q[x][y] && Q[x][y].ok)
    .map(y => ({ y, ...Q[x][y], cost: myCost(y, Q[x][y].k) / Q[x][y].n }))
    .sort((p, q) => p.cost - q.cost);
  const jarQ = Object.fromEntries(stall.map(g => [g, Sim.jarQuote(w, npc, g)]));
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
    const badge = best ? `for ${best.k}${icon(best.y)}${best.n > 1 ? ` <span>(get ${best.n})</span>` : ''}` : jq ? `🫙 ${jq.k}${icon(jq.y)}` : '✗ nothing you have';
    return `<button class="gcard ${g === x ? 'on' : ''} ${best || jq ? 'can' : 'cant'}" data-g="${g}">${icon(g, 'big')}<span class="nm">${GOODS[g].name}</span><span class="ct">×${Sim.count(a, g)}</span><span class="badge">${badge}</span></button>`;
  }).join('') : '<p class="empty">Sold out.</p>';
  document.querySelectorAll('#d-theirs .gcard').forEach(b => b.onclick = () => { S.dlg.x = b.dataset.g; S.dlg.find = null; renderDialog(); });

  // bottom row: your pack, each card saying what it does for the selected good
  const mine = IDS.filter(g => Sim.count(you, g) > 0);
  $('#d-mine').innerHTML = mine.length ? mine.map(y => {
    const q = x && y !== x ? Q[x][y] : null;
    const badge = !x || y === x ? '&nbsp;' : !q ? '✗ won\'t take' : !q.ok ? `wants ${q.k}, you have ${Sim.count(you, y)}` : `${q.k} → ${q.n}${icon(x)}`;
    return `<div class="gcard ${q && q.ok ? 'can' : x && y !== x ? 'cant' : ''}" data-y="${y}">${icon(y, 'big')}<span class="nm">${GOODS[y].name}</span><span class="ct">×${Sim.count(you, y)}</span><span class="badge">${badge}</span></div>`;
  }).join('') : '<p class="empty" style="color:#c9a77c">Your pack is empty.</p>';

  // middle: the deals, or why there aren't any
  const step = routeStep();
  let deal = '';
  if (x) {
    const ok = affordable(x), jq = jarQ[x];
    deal += `<h4>FOR ${icon(x)} ${GOODS[x].name.toUpperCase()} ${nm(npc).toUpperCase()} WOULD TAKE</h4>`;
    // Gran's jar: medicine while someone is sick, zirnet (your savings) after the cave
    if (jq) {
      const isStep = step && step.jar && step.npc === npc && step.x === x;
      deal += `<div class="deal-row jar ${isStep ? 'route' : ''}"><span class="terms">give <b>${jq.k}</b> ${icon(jq.y)}<span class="from"> from 🫙</span><span class="arrow">→</span>get <b>${jq.n}</b> ${icon(x)}<span class="gn"> ${x === 'zir' ? 'into the jar' : gname(x, jq.n)}</span></span><button class="btn small" data-jar data-y="${jq.y}" data-k="${jq.k}" data-n="${jq.n}">${x === 'zir' ? 'SWAP' : 'PAY'}</button></div>`;
      // the jar overpaying for medicine away from Dov (Wren may want 7 of its 8 crystals for one driftcap)
      const tr = x === 'dri' && npc !== 'dov' ? Sim.family(w).trend[jq.y] : null;
      if (tr && jq.k / jq.n > tr / Sim.SICK.DOSES * 2) deal += `<p class="dear">⚠ Dear! Dov usually asks about ${tr} ${icon(jq.y, 'sm')} for ${Sim.SICK.DOSES} ${icon('dri', 'sm')}.</p>`;
    }
    // the route's own step comes first, with its amounts (it may need 2 of x, where the plain deal gives 1)
    const rs = step && !step.jar && step.npc === npc && step.x === x && Sim.count(you, step.y) >= step.k ? step : null;
    const row = (o, isStep) => `<div class="deal-row ${isStep ? 'route' : ''}" data-y="${o.y}"><span class="terms">give <b>${o.k}</b> ${icon(o.y)}<span class="gn"> ${GOODS[o.y].name}</span><span class="arrow">→</span>get <b>${o.n}</b> ${icon(x)}<span class="gn"> ${gname(x, o.n)}</span>${isStep ? ' <span class="tag">← <span class="long">YOUR </span>ROUTE</span>' : ''}</span><button class="btn small" data-y="${o.y}" data-k="${o.k}" data-n="${o.n}">TRADE</button></div>`;
    if (rs) deal += row(rs, true);
    if (ok.length) {
      deal += ok.filter(o => !rs || o.y !== rs.y || o.k !== rs.k || o.n !== rs.n)
        .map(o => row(o, !rs && step && step.npc === npc && step.x === x && step.y === o.y)).join('');
    } else if (!jq && !rs) {
      const wantsIt = IDS.filter(y => Q[x][y] && !Sim.count(you, y));
      deal += `<p class="nodeal">✗ Nothing in your pack works. ${wantsIt.length ? `${nm(npc)} would take ${wantsIt.slice(0, 4).map(y => icon(y)).join(' ')} for it.` : ''}</p>`;
      if (S.dlg.find !== x) deal += `<button class="btn small" data-find="${x}">🧭 FIND A WAY TO GET ${GOODS[x].name.toUpperCase()}</button>`;
    }
  }
  if (S.dlg.find) deal += routesHTML(S.dlg.find, S.dlg.routes);
  $('#d-deal').innerHTML = deal || '<p class="empty">Nothing on the stall.</p>';
  document.querySelectorAll('#d-deal [data-k]').forEach(b => b.onclick = () => doTrade(npc, x, +b.dataset.n, b.dataset.y, +b.dataset.k, 'jar' in b.dataset, mid(b)));
  document.querySelectorAll('#d-deal .deal-row').forEach(r => {
    r.onmouseenter = () => document.querySelector(`#d-mine [data-y="${r.dataset.y}"]`)?.classList.add('lit');
    r.onmouseleave = () => document.querySelector(`#d-mine [data-y="${r.dataset.y}"]`)?.classList.remove('lit');
  });
  document.querySelectorAll('#d-deal [data-find]').forEach(b => b.onclick = () => findWay(b.dataset.find));
  bindFollow('#d-deal');

  // the acceptable set, including things you don't have
  $('#d-takes').innerHTML = `<span class="lbl">${nm(npc)} takes (for something on the stall). ${TOUCH ? 'Tap' : 'Click'} one you don't have to find a way to get it:</span><div class="chips">${IDS.filter(y => y !== a.makes).map(y => {
    const t = takes[y], have = Sim.count(you, y) > 0, need = !!a.wants[y];
    const cls = need ? 'need' : t ? 'yes' : 'no';
    const mk = need ? '★ needs' : t ? '✓' : '✗';
    const price = t ? ` ${t.k}→${t.n}${icon(t.x)}` : '';
    const tip = need ? `${nm(npc)} needs ${GOODS[y].name.toLowerCase()}` : t ? `${nm(npc)} doesn't need it, but would take it to trade on` : `${nm(npc)} won't take ${GOODS[y].name.toLowerCase()}`;
    const tag = t && !have ? 'button' : 'span';
    return `<${tag} class="chip ${cls} ${have ? 'have' : ''}" ${tag === 'button' ? `data-find="${y}"` : ''} title="${tip}">${icon(y)}<span class="mk">${mk}</span>${price}</${tag}>`;
  }).join('')}</div><p class="hint-line"><span class="gold">★</span> needs it · <span class="leaf">✓</span> takes it without needing it · green ring: you have some</p>`;
  document.querySelectorAll('#d-takes [data-find]').forEach(b => b.onclick = () => findWay(b.dataset.find));

  const refused = x && mine.find(y => y !== x && !Q[x][y]);
  if (refused && !S.flags.sawRefusal) S.flags.sawRefusal = { npc, g: refused };
  diffNotes();
}

// The 🧭 helper: for medicine, all the doses still missing at once if it can, else one at a time.
function routesFor(g) {
  const F = S.w.family, n = g === 'dri' && F.sick ? Math.max(1, F.sick.left - Sim.count(S.w.byId.you, 'dri')) : 1;
  // never pay with what home needs tonight (the medicine you just bought, the last lumfruit, the tools' kettlestone)
  const you = S.w.byId.you, keep = { dri: F.sick ? F.sick.left : 0, lum: 1, ket: you.acc.ket + you.needs.ket >= 1 - 1e-9 ? 1 : 0 };
  const safe = r => Object.keys(r.spent).every(y => y === g || !keep[y] || Sim.count(you, y) - r.spent[y] >= keep[y]);
  const all = [...Sim.findRoutes(S.w, g, n), ...(n > 1 ? Sim.findRoutes(S.w, g, 1) : [])].filter(safe), top = all.slice(0, 3);
  const jar = all.find(r => r.jar);   // the sick card points at the jar, so always offer it
  if (jar && !top.includes(jar)) top[Math.min(2, top.length)] = jar;
  return top;
}
function findWay(g) {
  S.dlg.find = g;
  S.dlg.routes = routesFor(g);
  renderDialog();
}

/* ---------- routes: "Sela takes bogwool, Mira takes snarlmilk" ---------- */
function routesHTML(g, routes) {
  if (!routes || !routes.length) return `<p class="nodeal" style="margin-top:8px">🧭 No chain of swaps gets you ${GOODS[g].name.toLowerCase()} today. Come back tomorrow, when stalls have changed.</p>`;
  S.shownRoutes = routes;
  return `<h4 style="margin-top:10px">🧭 WAYS TO GET ${icon(g)} ${GOODS[g].name.toUpperCase()}</h4><div class="routes">${routes.map((r, i) => `
    <div class="route-card"><ol>${r.steps.map(s => `<li><b>${nm(s.npc)}</b>: give ${s.k} ${icon(s.y)}${s.jar ? ' from 🫙' : ''} → get ${s.n} ${icon(s.x)}</li>`).join('')}</ol><button class="btn small" data-follow="${i}">FOLLOW</button></div>`).join('')}</div>`;
}
function bindFollow(sel) {
  document.querySelectorAll(sel + ' [data-follow]').forEach(b => b.onclick = () => followRoute(S.shownRoutes[+b.dataset.follow]));
}
function followRoute(r) {
  S.route = { target: r.target, steps: r.steps, i: 0 };
  S.plan = null;
  closeSheet();
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
  S.tradedToday = true;
  if (jar && x === 'zir') S.penToZir = (S.penToZir || 0) + k;
  sfx(jar || [x, y].some(g => g === 'pen' || g === 'zir') ? 'coin' : 'pop');
  bubble('you', `${jar ? '🫙' : ''}${k}${icon(y, 'sm')} → ${n}${icon(x, 'sm')}`);
  fly('you', npc, y, k); fly(npc, 'you', x, n);
  feed(t);
  if (t.indirectA && !S.flags.indirect && x !== S.w.byId.you.makes) S.flags.indirectPending = { npc, x, y };
  const routeDone = advanceRoute(npc, x);
  S.dlg.find = null; S.dlg.routes = null;
  const st = routeStep();
  if (st && st.npc === npc) S.dlg.x = st.x;
  renderDialog(); renderPack(); renderTop(); diffNotes();
  if (pt) floatAt(`+${n} ${icon(x)}`, pt.x, pt.y - 30, 'good');
  const card = document.querySelector(`#d-mine [data-y="${x}"]`); if (card) bump(card);
  // that did it (a need filled, or the next step is at another stall): close the table and get going
  const now = homeNeed(), filled = routeDone || (needWas.g === x && (now.g !== x || now.cls !== needWas.cls));
  const tok = S.dlg.tok = (S.dlg.tok || 0) + 1;
  if ((st && st.npc !== npc) || (!st && filled)) setTimeout(() => {
    if (S.phase !== 'dialog' || S.dlg.npc !== npc || S.dlg.tok !== tok) return;
    closeDialog(() => { if (S.route) walkToStep(); });
    if (filled && Sim.count(S.w.byId.you, x)) homeLand(x, n, npc);
  }, 650);
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

/* ---------- route markers on the map ---------- */
// day one, until your first swap: a bouncing marker over Mira's stall (she sells lumfruit)
const firstDay = () => S.w.day === 1 && !S.tradedToday && !S.route && S.w.byId.you.hunger.lum === 0;
function drawHint(t) {
  if (!firstDay() || S.phase !== 'market') return;
  const p = STALLS.mira.npc, y = p.y - 36 + Math.round(Math.sin(t * 6) * 3);
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

/* ---------- day end ---------- */
function goHome(auto = false) {
  S.phase = 'night';
  S.p.target = null; S.keys = {};
  // finish replaying the morning instantly so nothing is lost
  while (S.morningReplay?.length) S.w.trades.push(S.morningReplay.shift());
  const w = S.w, you = w.byId.you;
  const before = Object.fromEntries(IDS.map(g => [g, Sim.count(you, g)]));
  const tradesBefore = w.trades.length;
  if (auto) {
    // autopilot: secure food and tools the way the 🧭 helper would, then trade like a local
    // (the medicine first while someone is sick; the jar may pay for it)
    const keep = { dri: w.family.sick ? w.family.sick.left : 0, lum: 2, ket: 1 };   // don't pay with what home needs tonight
    for (const [g, n] of Object.entries(keep)) {
      for (let tries = 0; tries < 3 && Sim.count(you, g) < n; tries++) {
        const r = routesFor(g).find(r => Object.keys(r.spent).every(y => y === g || !keep[y] || Sim.count(you, y) - r.spent[y] >= keep[y]));
        if (!r) break;
        if (!r.steps.every(st => Sim.routeStep(w, st))) break;
      }
    }
    w.playerAuto = true;
  } else you.present = false;
  const afternoon = w.trades.length;
  Sim.endDay(w);
  w.playerAuto = false;
  const autoTrades = auto ? w.trades.slice(tradesBefore).filter(t => !t.refused && (t.a === 'you' || t.b === 'you')) : [];
  const away = w.trades.slice(afternoon).filter(t => !t.refused && t.a !== 'you' && t.b !== 'you');
  S.route = null; renderRoute();
  const ev = w.events.slice();
  S.score.nights++;
  const hungry = ev.some(e => e.type === 'short' && e.g === 'lum');
  if (!hungry) S.score.fed++;
  if (w.family.sick) S.score.sickNights++;
  diffNotes();
  renderAll();
  const has = t => ev.some(e => e.type === t);
  const next = () => { if (!checkStory(() => beginDay())) beginDay(); };
  // ⏩ a quiet night just flashes by; anything that needs you (hunger, broken tools, sickness) stops the run
  if (S.autoRun && auto && !ev.some(e => e.type === 'short' || ['sick', 'worse', 'nomed'].includes(e.type))) {
    sfx(has('cured') ? 'cured' : 'tick');
    if (has('cured')) bump($('#family .faces'));
    toast(nightToast(ev, autoTrades), 1500);
    S.autoT = setTimeout(next, 650);
    return;
  }
  if (S.autoRun) stopAuto();
  sfx(has('sick') ? 'sick' : has('cured') ? 'cured' : hungry || has('worse') ? 'sad' : 'night');
  story(nightCard(ev, autoTrades, away), next, 'NEXT DAY ▶', { text: '⏩ AUTO', fn: () => { S.autoRun = true; renderTop(); next(); } });
}

// One line for a night that flashed by on ⏩: "Night 6 · ate · +2 bogwool · 3 swaps"
function nightToast(ev, autoTrades) {
  const made = ev.filter(e => e.type === 'made').reduce((s, e) => s + e.n, 0);
  const bits = [`🌙 <b>Night ${S.w.day - 1}</b>`, '🍽️ ate'];
  if (made) bits.push(`+${made} ${icon('bog', 'sm')}`);
  if (autoTrades.length) bits.push(`🤝 ${autoTrades.length}`);
  for (const e of ev) {
    if (e.type === 'dose') bits.push(`💊 ${e.name}`);
    if (e.type === 'cured') bits.push(`💜 ${e.name} is better!`);
  }
  return bits.join(' · ') + '<span class="stop">tap to stop</span>';
}

/* ---------- side panels ---------- */
function renderAll() { renderTop(); renderPack(); renderNotes(); if (!$('#pane-village').hidden) renderVillage(); }

// The family's mood: whoever is sick looks sick; everyone looks glum after a hungry night.
function moodOf(id, F = Sim.family(S.w)) {
  if (F.who === id) return F.worse ? 'worse' : 'sick';
  return F.hungry > 0 ? 'hungry' : 'ok';
}
// The one thing home needs most for tonight that the 🧭 helper can get today: { g, html, cls }.
// A need nobody at the market can fill today is skipped (else "needs driftcap" hides "no lumfruit" and the family goes hungry).
function homeNeed() {
  const w = S.w, you = w.byId.you, F = Sim.family(w), list = [];
  if (F.sick && F.dosesHave < F.dosesNeeded) list.push({ g: 'dri', cls: 'bad', html: `🤒 ${F.name} is sick: needs ${F.dosesNeeded - F.dosesHave} ${icon('dri', 'sm')} driftcap`, none: `🤒 ${F.name} is sick · no ${icon('dri', 'sm')} driftcap today` });
  if (!Sim.count(you, 'lum')) list.push({ g: 'lum', cls: 'bad', html: `🍽️ No ${icon('lum', 'sm')} lumfruit for tonight`, none: `🍽️ No ${icon('lum', 'sm')} lumfruit to be had today` });
  if (!Sim.count(you, 'ket') && you.acc.ket + you.needs.ket >= 1 - 1e-9) list.push({ g: 'ket', cls: 'warn', html: `🔨 Tools break tonight: need ${icon('ket', 'sm')} kettlestone`, none: `🔨 Tools break tonight · no ${icon('ket', 'sm')} kettlestone today` });
  if (Sim.count(you, 'lum') < 2) list.push({ g: 'lum', cls: 'ok', html: `✓ Fed tonight · 1 more ${icon('lum', 'sm')} for tomorrow?` });
  if (!Sim.count(you, 'ket')) list.push({ g: 'ket', cls: 'ok', html: `✓ Fed tonight · tools need ${icon('ket', 'sm')} soon` });
  const open = S.phase === 'market' || S.phase === 'dialog';
  const n = list.find(n => !open || canGet(n.g)), stuck = list.find(n => n.cls !== 'ok');
  if (n) return n;
  if (stuck) return { g: null, cls: stuck.cls, html: stuck.none };
  return { g: null, cls: 'ok', html: `✓ All set · festival on day ${FEST}` };
}
// Can the 🧭 helper find any way to get g right now? Cached until the day, your pack or the jar changes.
function canGet(g) {
  const w = S.w, you = w.byId.you, key = [g, w.day, ...IDS.map(y => Sim.count(you, y)), w.family.jar.pen, w.family.jar.zir, w.family.sick ? w.family.sick.left : 0].join();
  if (S.canGetDay !== w.day) { S.canGetDay = w.day; S.canGet = {}; }
  if (!(key in S.canGet)) S.canGet[key] = routesFor(g).length > 0;
  return S.canGet[key];
}

function renderTop() {
  const w = S.w, F = Sim.family(w);
  const night = S.phase === 'night', day = night ? w.day - 1 : w.day;
  $('#day-label').innerHTML = `DAY ${day}${day < FEST ? `<span class="of">/${FEST}</span>` : ''}`;
  $('#phase-label').textContent = night ? '· night' : '· market';
  // the family, and Gran's jar priced in medicines at today's prices
  const meds = F.jarMeds, J = F.jar;
  if (S.jarWas != null && meds < S.jarWas) { S.jarDrop = performance.now(); sfx('drain'); }
  S.jarWas = meds;
  const jarTip = `Gran's jar: ${J.pen} pentaja${J.zir ? ` and ${J.zir} zirnet` : ''}. Today that buys ${meds} medicine${meds === 1 ? '' : 's'} from Dov.`;
  $('#family').innerHTML = `<button class="faces" data-plan-home title="Your family">${Sim.FAMILY.map(f => face(f.id, moodOf(f.id, F))).join('')}</button>
    <button class="jar ${performance.now() - (S.jarDrop || -1e9) < 4000 ? 'drop' : ''}" data-jar title="${jarTip}">🫙<b>${J.pen}</b>${icon('pen', 'sm')}${J.zir ? `<b>${J.zir}</b>${icon('zir', 'sm')}` : ''}${S.started ? `<span class="eq">≈ ${meds}💊</span>` : ''}</button>`;
  const need = S.phase === 'market' && firstDay() ? { g: null, cls: 'warn', html: `👆 ${TOUCH ? 'Tap' : 'Click'} a stall to trade. Mira has ${icon('lum', 'sm')} lumfruit.` }
    : S.phase === 'market' || S.phase === 'dialog' ? homeNeed() : null;
  const st = $('#status');
  st.className = 'status ' + (need ? need.cls : '');
  st.innerHTML = need ? `${need.html}${need.g ? ` <span class="go">🧭</span>` : ''}` : night ? 'Night at home.' : `Goal: keep your family fed and healthy until the harvest festival, day ${FEST}.`;
  st.onclick = () => need && need.g && plan(need.g);
  $('#pb-village').hidden = $('#tab-village').hidden;
  $('#pb-village').classList.toggle('new', $('#tab-village').classList.contains('new'));
  $('#pb-home').classList.toggle('home', !!S.tradedToday);
  $('#pb-auto').innerHTML = S.autoRun ? '<span>⏸</span>STOP' : '<span>⏩</span>AUTO';
  $('#pb-auto').classList.toggle('on', S.autoRun);
  $('#btn-auto').textContent = S.autoRun ? '⏸ STOP' : '⏩ AUTO DAYS';
  music();
  $('#family [data-plan-home]').onclick = () => { const n = homeNeed(); if (n.g && S.phase === 'market') plan(n.g); else bubble('you', n.html, false, 2500); };
  $('#family [data-jar]').onclick = () => { addTicker('🫙 ' + jarTip + ' Keep it for emergencies.'); bubble('you', `🫙 ${J.pen}${icon('pen', 'sm')} ≈ ${meds} 💊 medicine${meds === 1 ? '' : 's'}`, false, 2500); };
}

function renderPack() {
  const you = S.w.byId.you;
  const load = Sim.load(you);
  const P = S.plan;
  $('#pane-pack').innerHTML = `
    <div class="planner"><div class="lbl">🧭 Find a way to get…</div>
      <div class="chips">${IDS.filter(g => g !== you.makes).map(g => `<button class="chip ${P && P.g === g ? 'on' : ''}" data-plan="${g}">${icon(g)} ${GOODS[g].name}</button>`).join('')}</div>
      ${P ? (S.phase === 'market' || S.phase === 'dialog' ? routesHTML(P.g, P.routes) : '<p class="hint-line">The market is closed.</p>') : ''}
    </div>
    ${jarHTML()}
    <div class="pack-load">Pack: ${load.toFixed(1)} / ${Sim.CAP} <div class="bar"><i style="width:${Math.min(100, load / Sim.CAP * 100)}%"></i></div></div>
    ${IDS.map(g => {
      const c = Sim.count(you, g), G = GOODS[g];
      const ages = you.inv[g];
      const fresh = G.rot === Infinity ? 'never rots' : c ? `oldest goes bad in ${G.rot - Math.max(...ages)} day${G.rot - Math.max(...ages) === 1 ? '' : 's'}` : `rots after ${G.rot} days`;
      return `<div class="inv-row ${c ? '' : 'zero'}">${icon(g)}<div><div class="nm">${G.name}${g === you.makes ? ' <span class="muted">· you make this</span>' : ''}${you.needs[g] ? ' <span class="gold">· family needs</span>' : ''}</div><div class="meta">${G.blurb} Size ${G.size}. ${fresh}.</div></div><span class="ct">${c}</span></div>`;
    }).join('')}`;
  document.querySelectorAll('#pane-pack [data-plan]').forEach(b => b.onclick = () => plan(b.dataset.plan));
  bindFollow('#pane-pack');
}

function jarHTML() {
  const F = Sim.family(S.w), J = F.jar;
  const use = F.sick ? `${F.name} is sick: the jar can pay Dov for medicine.` : S.w.caveDay && S.w.day >= S.w.caveDay ? 'Hesk may swap zirnet for it.' : 'Only for emergencies, like medicine.';
  return `<div class="jar-row">🫙 <div><b>Gran's jar</b> · ${J.pen} ${icon('pen', 'sm')}${J.zir ? ` ${J.zir} ${icon('zir', 'sm')}` : ''} · buys <b>${F.jarMeds}</b> 💊 medicine${F.jarMeds === 1 ? '' : 's'} today<div class="meta">${use}</div></div></div>`;
}

function plan(g) {
  if (UI) openSheet('pack'); else showTab('pack');
  if (NARROW() && !UI) $('.side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  S.plan = { g, routes: S.phase === 'market' || S.phase === 'dialog' ? routesFor(g) : [] };
  renderPack();
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
  const you = S.w.byId.you, out = {};
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
    <p class="muted" style="font-size:13px">Line going up = each pentaja buys less. Each villager keeps a notebook just like yours. These charts add them all up. ${H[H.length - 1].moneyness[top] > 0 ? `Right now the most widely accepted good is ${icon(top)} <b>${GOODS[top].name}</b>.` : 'Right now nobody takes anything they don\'t need.'}</p>`;
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
  $('#story-body').innerHTML = html.replace(/(<img class="gi[^>]*>(?:<\/b>)?)(?=[.,:;!?)])/g, '$1\u2060');   // no line break between an icon and its full stop
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

function introCard() {
  return `
    <h2>Welcome to Ulm Hollow</h2>
    <p class="big">Why does a piece of paper buy bread? Let's start a village with no money at all, and see.</p>
    <div class="fam-row">${famFaces('big')}<span>Gran, Little Tam and Aunt Ola: your family.</span></div>
    <p>You raise ${icon('bog')} <b>bogwool</b>, 2 a day. Your family needs ${icon('lum')} <b>1 lumfruit</b> a day to eat, and ${icon('ket')} <b>1 kettlestone</b> every 3 days for tools.</p>
    <p>🫙 <b>Gran's jar</b> holds 8 ${icon('pen')} pentaja, pretty crystals she collects. Keep them for a rainy day.</p>
    <p class="goal">🎯 Keep your family fed and healthy until the <b>harvest festival on day ${FEST}</b>.</p>
    <p class="muted">There are no prices here. ${TOUCH ? 'Tap' : 'Click'} a stall to see what people will swap.</p>`;
}

function nightCard(ev, autoTrades, away) {
  const lines = [];
  for (const t of autoTrades) {
    const mine = t.a === 'you' ? { got: [t.n, t.x], gave: [t.k, t.y], who: t.b } : { got: [t.k, t.y], gave: [t.n, t.x], who: t.a };
    lines.push(`<li>🤝 You traded ${mine.gave[0]} ${icon(mine.gave[1], 'sm')}${t.jar ? ' from the jar' : ''} to ${nm(mine.who)} for ${mine.got[0]} ${icon(mine.got[1], 'sm')}</li>`);
  }
  const hungry = ev.some(e => e.type === 'short' && e.g === 'lum');
  for (const e of ev) {
    if (e.type === 'short' && e.g === 'lum') lines.push(`<li>😟 <b>Your family went hungry.</b> No ${icon('lum', 'sm')} lumfruit in the pack.${S.w.byId.you.hunger.lum >= 2 ? ' Two nights in a row: you were too tired to work hard.' : ''}</li>`);
    if (e.type === 'short' && e.g === 'ket') lines.push(`<li>🔨 <b>Your tools broke.</b> Your family needs 1 ${icon('ket', 'sm')} kettlestone every 3 days. You'll make less bogwool.</li>`);
    if (e.type === 'dose') lines.push(`<li>💊 ${e.name} took ${e.n} ${icon('dri', 'sm')} driftcap. ${e.left} more to go.</li>`);
    if (e.type === 'nomed') lines.push(`<li>🤒 No ${icon('dri', 'sm')} driftcap for ${e.name} tonight.</li>`);
    if (e.type === 'worse') lines.push(`<li>🤒 <b>${e.name} got worse.</b> You can't make any bogwool until ${e.name} is better.</li>`);
    if (e.type === 'cured') lines.push(`<li>💜 <b>${e.name} is better!</b>${e.natural ? ' It passed on its own, slowly.' : ''}</li>`);
    if (e.type === 'sick') lines.push(`<li>🤒 <b>${e.name} fell sick in the night.</b></li>`);
    if (e.type === 'rot') lines.push(`<li>🤢 ${e.n} ${icon(e.g, 'sm')} ${gname(e.g, e.n).toLowerCase()} went bad.</li>`);
    if (e.type === 'made') lines.push(`<li>🧶 You made ${e.n} ${icon(e.g, 'sm')} bogwool.</li>`);
    if (e.type === 'plenty') lines.push(`<li>📦 You already have plenty of bogwool, so you didn't make more.</li>`);
    if (e.type === 'full') lines.push(`<li>🎒 Your pack is full!</li>`);
    if (e.type === 'junk') lines.push(`<li>🗑️ You left a ${icon(e.g, 'sm')} at home. It wasn't worth carrying.</li>`);
  }
  if (!hungry) lines.unshift(`<li>🍽️ Your family ate.${S.w.family.sick ? '' : ' Everyone\'s happy.'}</li>`);
  const fam = Sim.FAMILY.map(f => face(f.id, moodOf(f.id), 'big')).join('');
  const seen = away.slice(0, 3).map(t => `<li class="feedline">${tradeLine(t)}</li>`).join('');
  return `<h2>Night falls · Day ${S.w.day - 1}</h2><div class="fam-row">${fam}</div><ul class="night-list">${lines.join('')}</ul>
    ${away.length ? `<h3 class="pixel sub">WHILE YOU WERE HOME · ${away.length} SWAP${away.length === 1 ? '' : 'S'}</h3><ul class="night-list ticker-like">${seen}</ul>` : ''}`;
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
  return `Before Wren's cave, ${n} ${icon('lum', 'sm')} lumfruit cost <b>${pa}</b> ${icon('pen', 'sm')}.<br>Now the same ${n} cost <b class="pen">${pb}</b> ${icon('pen', 'sm')}.`;
}
// What the jar buys in medicines, before the cave and today: '' when that hasn't changed.
function jarLine(lead) {
  const w = S.w, J = w.family.jar, before = Sim.medPriceBefore(w), now = Sim.medPriceNow(w).pen;
  if (!J.pen || !before || !now) return J.zir ? `<p>🫙 The jar is in ${icon('zir', 'sm')} zirnet now. It still buys ${Sim.family(w).jarMeds} 💊.</p>` : '';
  const a = Math.floor(J.pen / before), b = Math.floor(J.pen / now);
  return a > b ? `<p>🫙 ${lead || 'Gran\'s jar'}: ${J.pen} ${icon('pen', 'sm')}. Before the cave that bought <b>${a}</b> 💊 medicine${a === 1 ? '' : 's'}. Today: <b class="pen">${b || 'not even 1'}</b>.</p>` : '';
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
function checkStory(then) {
  const w = S.w, f = S.flags, F = w.family;
  const fire = (key, html, ok, after, alt, cls) => {
    f[key] = true; stopAuto();
    sfx({ refusal: 'nope', indirect: 'tada', money: 'chime', wren: 'thud', inflation: 'sad', zir: 'chime', end: 'fanfare' }[key] || (key.startsWith('sick') ? 'sick' : 'pop'));
    const go = fn => () => { renderAll(); if (fn) fn(); if (then) then(); else checkStory(); };
    music();
    story(html, go(after), ok, alt && { text: alt.text, fn: go(alt.fn) }, cls); return true;
  };

  if (!f.refusal && f.sawRefusal && S.phase === 'market') {
    const { npc, g } = f.sawRefusal;
    return fire('refusal', `
      <h2>${nm(npc)} doesn't want your ${GOODS[g].name.toLowerCase()}</h2>
      <p>${nm(npc)} has something you want. But you have nothing ${nm(npc)} wants.</p>
      <p>That's the problem with barter: a swap only works when <b>each of you wants exactly what the other has</b>.</p>
      <p class="muted">Your <b>NOTEBOOK</b> keeps track of who takes what.</p>`);
  }
  if (!f.indirect && f.indirectPending && S.phase === 'market') {
    const { x } = f.indirectPending;
    const fans = NPCS.filter(id => w.byId.you.note[id][x] >= 0.6).map(nm);
    return fire('indirect', `
      <h2>You just bought something you can't use</h2>
      <p>Your family has no use for ${icon(x)} <b>${GOODS[x].name.toLowerCase()}</b>. You took it because ${fans.length ? '<b>' + fans.slice(0, 2).join('</b> and <b>') + '</b>' : 'someone'} will take it for what you really need.</p>
      <p class="big">That's <b class="gold">indirect exchange</b>: taking something not to use, but to trade it on.</p>`);
  }
  // someone at home falls sick: once before the cave (the jar pays easily), once after (it barely can)
  const ep = F.episodes.length;
  if (F.sick && (f.sickSeen || 0) < ep) {
    const s = F.sick, med = Sim.medPriceNow(w).pen, tr = Sim.family(w).trend.pen || med, J = F.jar;   // tr: as the top bar counts it
    f.sickSeen = ep;
    const after = s.afterCave && s.before && med && med > s.before, lag = s.afterCave && s.before && med && !after && J.pen;
    if (lag) return fire('sick' + ep, `
      <h2>${face(s.who, 'sick', 'big')} ${s.name} is sick</h2>
      <p>${s.name} needs <b>${s.left} ${icon('dri', 'sm')} driftcap</b>. ${lumRise().b > lumRise().a * 1.5 ? 'Lumfruit costs far more pentaja since Wren\'s cave, but ' : ''}Dov still asks only <b>${med}</b> ${icon('pen', 'sm')} for it, like before the cave.</p>
      <p class="big">Prices don't all rise at once. Pay from the jar <b>before Dov catches on</b>.</p>
      <p class="muted">${TOUCH ? 'Tap' : 'Click'} the line under the faces for help.</p>`, 'HURRY');
    return fire('sick' + ep, after ? `
      <h2>${face(s.who, 'sick', 'big')} ${s.name} is sick</h2>
      <p>Same medicine, same Dov. Before Wren's cave it cost <b>${s.before} ${icon('pen', 'sm')}</b>. Today: <b class="pen">${med} ${icon('pen', 'sm')}</b>.</p>
      ${jarLine('The jar') || `<p>🫙 The jar holds ${J.pen} ${icon('pen', 'sm')}.</p>`}
      <p class="big">The crystals didn't change. They just buy less. That's <b class="pen">inflation</b>, at home.</p>` : `
      <h2>${face(s.who, 'sick', 'big')} ${s.name} is sick</h2>
      <p>${s.name} needs <b>${s.left} ${icon('dri', 'sm')} driftcap</b>, Dov's medicine. Until then you make only 1 bogwool a day.</p>
      ${J.pen && tr ? `<p>🫙 Gran's jar can pay: the medicine costs about <b>${tr} ${icon('pen', 'sm')}</b> of its ${J.pen}.</p>` : `<p>Look for driftcap at the market.</p>`}
      <p class="muted">${TOUCH ? 'Tap' : 'Click'} the line under the faces for help.</p>`, after ? 'OUCH' : 'OK');
  }
  const top = topMoney();
  if (!f.money && w.day >= 4 && recentMoneyness(top) >= 0.5 && S.phase === 'market') {
    f.moneyGood = top;
    $('#tab-village').hidden = false; $('#tab-village').classList.add('new');
    const G = GOODS[top];
    const why = [];
    if (G.rot === Infinity) why.push('it never rots'); else why.push(`it lasts ${G.rot} days`);
    if (G.size < 1) why.push('it\'s tiny');
    if (Sim.VILLAGERS.find(v => v.makes === top).rate < 1) why.push('nobody can make much of it');
    const liked = Sim.VILLAGERS.some(v => v.keeps && v.keeps[top]) ? ` People already liked owning a few${top === 'pen' ? ', like Gran' : ''}, so taking the first one was easy.` : '';
    return fire('money', `
      <h2>Something is happening in Ulm Hollow</h2>
      <p>More and more villagers take ${icon(top)} <b>${G.name.toLowerCase()}</b> with <b>no use for it</b>. They take it because they know <i>others</i> will.</p>
      <p>Why ${G.name.toLowerCase()}? ${why.join(', ').replace(/, ([^,]*)$/, ' and $1').replace(/^./, c => c.toUpperCase())}.${liked}</p>
      <p class="big">A good people take only to trade it on is called <b class="pen">money</b>.</p>
      <p class="muted">In real life: that's exactly what a euro or a dollar is. You can't eat it. You take it because you know the baker will.</p>
      <p class="quote long">"Money has not been generated by law. In its origin it is a social, and not a state-institution." Carl Menger, <i>On the Origins of Money</i>, 1892</p>`,
      'SHOW ME', () => UI ? openSheet('village') : showTab('village'));
  }
  if (!f.wren && w.caveDay && w.day >= w.caveDay) {
    return fire('wren', `
      <h2>Wren found a cave full of pentaja</h2>
      <p>Wren used to dig up one every two days. Now: <b class="pen">ten a day</b>.</p>
      <p>Wren spends them right away, while prices are still the old ones. Soon every pentaja buys less${F.jar.pen ? `, even the ${F.jar.pen} in Gran's jar` : ''}.</p>
      <p class="muted">Hesk's zirnet can't be found any faster. Hesk might swap some for the jar's pentaja.</p>
      <p class="muted long">In an old fable, a wren became king of the birds by riding on the eagle's back. It won without doing the work.</p>`);
  }
  const rise = w.caveDay && w.day >= w.caveDay + 4 ? lumRise() : null;   // wait (a few days at most) until the rise shows in whole numbers
  if (!f.inflation && rise && (rise.b > rise.a * 1.25 || w.day >= w.caveDay + 8)) {
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
    return fire('zir', `
      <h2>The village is quietly switching</h2>
      <p>Fewer villagers take ${icon('pen', 'sm')} pentaja now. More ask for ${icon('zir', 'sm')} <b class="zir">zirnet</b>. Hesk still finds only one every few days, and nobody can make more. So people keep their savings in zirnet.</p>
      <p class="big">Your savings are only as safe as <b>the limit on making more money</b>.</p>
      <p class="muted">In real life: where prices rise fast, as in Argentina or Turkey, many families save in US dollars or gold instead.</p>`);
  }
  if (!f.end && w.day >= FEST) {
    S.fest = true;
    return fire('end', endScreen(), '▶ EP 02', () => { location.href = '../02-every-wren/'; },
      { text: 'KEEP PLAYING', fn: () => { S.fest = false; music(); } }, 'end');
  }
  return false;
}

/* ---------- the festival: score and end screen ---------- */
const median = a => { const b = a.filter(v => v != null && isFinite(v)).sort((p, q) => p - q); return b.length ? b[(b.length - 1) >> 1] : null; };
// How many lumfruit (= days of food) one y buys (y: pen | zir), now or before the cave: from the lumfruit trades;
// zirnet by way of Dov's medicine prices (zirnet-for-lumfruit swaps are rare and jumpy).
function lumPer(y, before = false) {
  const w = S.w, H = before ? w.history.slice(1, w.caveDay || undefined) : w.history.slice(1).slice(-4);
  if (y === 'zir') {
    const p = lumPer('pen', before), m = before ? { pen: Sim.medPriceBefore(w), zir: Sim.medPriceBefore(w, 'zir') } : Sim.medTrend(w);
    if (p && m.pen && m.zir) return p * m.pen / m.zir;
  }
  const p = median(H.map(h => h.price[y]));
  if (p) return 1 / p;
  if (before) return null;
  const q = Sim.quote(w, 'mira', 'lum', y);
  return q ? q.n / q.k : null;
}
const days = v => v == null ? '?' : v < 1 ? 'less than 1 day' : `${Math.floor(v)} day${Math.floor(v) === 1 ? '' : 's'}`;
function endScreen() {
  const w = S.w, sc = S.score, J = w.family.jar, eps = w.family.episodes;
  const cured = eps.filter(e => e.cured && !e.natural).length;
  const lp = lumPer('pen'), lz = lumPer('zir'), lb = lumPer('pen', true);
  // the jar in days of food (lumfruit), before the cave and now
  // "was": the same crystals before the cave (what's in the jar, plus any pentaja you swapped for zirnet), as the cards count it
  const base = J.pen + (S.penToZir || 0);
  const R = lumRise(), bk = R.a && R.b ? basket(R.a, R.b) : null;   // "before" as the inflation card counted it
  const foodNow = (J.pen ? J.pen * (lp || 0) : 0) + (J.zir ? J.zir * (lz || 0) : 0), foodBefore = !base ? null : bk ? base * bk.n / bk.pa : lb ? base * lb : null;
  // ...and in medicines, Dov's steady prices (as in the top bar), with the what-ifs: kept in zirnet since before the cave, or left in pentaja
  const F = Sim.family(w), m = F.trend, mb = { pen: Sim.medPriceBefore(w), zir: Sim.medPriceBefore(w, 'zir') };
  const meds = F.jarMeds, medsBefore = mb.pen && base ? Math.floor(base / mb.pen) : null;
  const ifZir = mb.pen && mb.zir && m.zir && base ? Math.floor(base / mb.pen * mb.zir / m.zir) : null;
  const ifPen = m.pen ? Math.floor((J.pen + (S.penToZir || 0)) / m.pen) : null;
  const score = sc.fed * 10 + cured * 25 + meds * 10;
  const max = sc.nights * 10 + eps.length * 25 + Math.max(meds, ifZir || 0, medsBefore || 0) * 10;
  const stars = score >= max * 0.8 ? 3 : score >= max * 0.55 ? 2 : score >= max * 0.3 ? 1 : 0;
  let best = 0; try { best = +localStorage.getItem('wth-ep01-best') || 0; if (score > best) localStorage.setItem('wth-ep01-best', score); } catch {}
  const isBest = score > best;
  if (isBest && best) setTimeout(() => sfx('tada'), 900);
  const pill = n => `${n} 💊`;
  const food = foodBefore && foodBefore > foodNow + 0.5 ? `In food: before Wren's cave the jar fed your family for <b>${days(foodBefore)}</b>. Today: <b class="pen">${days(foodNow)}</b>. ` : '';
  const what = S.penToZir && ifPen != null && ifPen < meds ? `You moved some into ${icon('zir', 'sm')} zirnet. Left as pentaja it would buy only <b class="pen">${pill(ifPen)}</b>.`
    : ifZir != null && ifZir > meds ? `Saved in ${icon('zir', 'sm')} zirnet instead, it would buy about <b class="zir">${pill(ifZir)}</b> today${medsBefore != null && ifZir > medsBefore ? ', more than before the cave' : ''}.` : '';
  return `<div class="endscreen">
    <h2>🎉 The harvest festival!</h2>
    <div class="fam-row">${Sim.FAMILY.map(m => face(m.id, moodOf(m.id), 'big')).join('')}<span class="stars">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></span></div>
    <div class="score">
      <div class="srow"><span>🍽️ Nights your family ate</span><b>${sc.fed} / ${sc.nights}</b></div>
      ${eps.length ? `<div class="srow"><span>💊 Sicknesses cured with medicine</span><b>${cured} / ${eps.length}</b></div>` : ''}
      <div class="srow"><span>🫙 Gran's jar now buys</span><b>${pill(meds)}${medsBefore && medsBefore > meds ? ` <small>was ${medsBefore}</small>` : ''}</b></div>
      ${food || what ? `<p class="cmp">${food}${what}</p>` : ''}
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
const sfx = n => { try { if (window.Chip) Chip.sfx(n); } catch {} };
// the right loop for this moment (switches only when it changes)
function music() {
  if (!window.Chip || !S.started) return;
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
// goods flying from a screen point into the top bar; the target bumps when they land
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
// what you just got for home flies from the stall to the faces
function homeLand(x, n, npc) {
  const to = $('#family .faces');
  sfx('whoosh');
  flyInto(x, n, mapPt(STALLS[npc].npc), to, () => {
    sfx('tada');
    const m = mid(to); floatAt(`+${n} ${icon(x, 'sm')}${homeNeed().g ? '' : ' ✓'}`, m.x, m.y + 16, 'good');
  });
}

// a line over the village for a few seconds
function toast(html, ms = 2200) {
  const el = $('#toast'); el.innerHTML = html; el.hidden = false;
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  clearTimeout(S.toastT); S.toastT = setTimeout(() => { el.hidden = true; }, ms);
}
$('#toast').onclick = () => { if (S.autoRun) { stopAuto(); toast('⏸ Stopped. You take over tomorrow.', 1500); } };

/* ---------- fewer taps ---------- */
// ⏩ AUTO: days pass on their own (you trade on autopilot) until something needs you
function startAuto() { S.autoRun = true; closeSheet(); sfx('whoosh'); renderTop(); if (S.phase === 'market') goHome(true); }
function stopAuto() { if (!S.autoRun) return; S.autoRun = false; clearTimeout(S.autoT); renderTop(); }
function autoDay() { clearTimeout(S.autoT); S.autoT = setTimeout(() => { if (S.autoRun && S.phase === 'market') goHome(true); }, 1200); }
// HOME with nothing for tonight and no trade yet: ask once (a stray tap shouldn't cost a day)
function sureHome() {
  const n = homeNeed(), now = performance.now();
  if (S.tradedToday || n.cls !== 'bad' || !n.g || now - (S.homeAsk || 0) < 4000) return true;
  S.homeAsk = now; sfx('nope'); shake($('#status'));
  toast(`${n.html}. <b>Tap 🏠 again</b> to go home anyway.`, 4000);
  return false;
}

/* ---------- loop ---------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt);
  replayMorning(now);
  draw(now / 1000);
  renderOverlay(now);
  if (S.phase === 'dialog' && now - (S.lastPortrait || 0) > 120) { Art.drawPortrait($('#portrait'), S.dlg.npc, now / 1000); S.lastPortrait = now; }
  if (S.phase === 'market' && !S.storyCheckAt) S.storyCheckAt = now;
  if (S.phase === 'market' && now - S.storyCheckAt > 500) { S.storyCheckAt = now; checkStory(); }
  requestAnimationFrame(frame);
}

newGame();
requestAnimationFrame(frame);
window.__S = S; // handy in the console
})();
