/* ============================================================
   EP 01 · The Barter Market — the playable village.
   The economy lives in sim.js; this file is input, drawing and story.
   ============================================================ */
(function () {
'use strict';

const { GOODS, IDS } = Sim;
const { STALLS, DOOR, HUT, TREES, STONE, TILE, PHONE } = Art;
const $ = s => document.querySelector(s);
const NPCS = ['mira', 'bob', 'sela', 'dov', 'rod', 'hesk'];
const params = new URLSearchParams(location.search);
const TOUCH = matchMedia('(pointer: coarse)').matches;
const NARROW = () => matchMedia('(max-width: 900px)').matches;
const SEED = +(params.get('seed') ?? 6);

const icon = (g, cls = '') => `<img class="gi ${cls}" src="${Art.iconURL[g]}" alt="${GOODS[g].name}" title="${GOODS[g].name}">`;
const gname = (g, n = 1) => GOODS[g].name + (n === 1 || /s$/.test(GOODS[g].name) ? '' : 's');
const nm = id => Sim.VILLAGERS.find(v => v.id === id).name;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const LINES = {
  mira: { hi: ['Fresh lumfruit! Still glowing.', 'Lumfruit, picked this morning.'], no: ['What would I do with {g}?', 'No thanks, I\'ve no use for {g}.'] },
  bob:  { hi: ['Kettlestone. Heavy. Good.', 'Bob has stones.'], no: ['{g}? Nah.', 'Bob no need {g}.'] },
  sela: { hi: ['Snarlmilk! Drink it before it sours.', 'Milk from my snarls. Fresh today.'], no: ['Hmm, {g}? Not for me.', 'I\'d never get rid of {g}.'] },
  dov:  { hi: ['Driftcaps. They float, you know. Medicine.', 'Driftcap for what ails you.'], no: ['{g}? Can\'t heal anyone with that.', 'Not {g}, friend.'] },
  rod:  { hi: ['Pentaja! Pretty, aren\'t they? Took me ages to find these.'], rich: ['Pentaja! Plenty more where these came from!', 'Need pentaja? I\'ve got LOTS.'], no: ['{g}? Pass.', 'Nah, not {g}.'] },
  hesk: { hi: ['Zirnet. Found this one in the riverbed. Took me days.', 'A zirnet never chips. Never.'], no: ['Hrm. {g}? No.', 'At my age? No {g}.'] },
};

/* ---------- state ---------- */
const S = {
  w: null,
  phase: 'intro',            // intro | market | dialog | night | story
  p: { x: DOOR.x, y: DOOR.y + 12, target: null, talkTo: null, face: 1 },
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
  startedAt: performance.now(),
};

/* ---------- boot ---------- */
const canvas = $('#world');
canvas.width = Art.MW * TILE; canvas.height = Art.MH * TILE;
if (PHONE) document.body.classList.add('phone');
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
    if (params.get('story') !== '1') S.flags = Object.assign(S.flags, { money: true, rod: true, inflation: true, zir: true, end: true });
    return;
  }
  story(introCard(), () => beginDay(), 'WALK TO THE MARKET');
}

function beginDay() {
  Sim.startDay(S.w);
  S.phase = 'market';
  S.p.x = DOOR.x; S.p.y = DOOR.y + 12; S.p.target = null;
  S.route = null; S.plan = null; renderRoute();
  S.morning = S.w.trades.slice();
  S.w.trades.length = 0;  // re-added as they're replayed, so stats see them
  S.morningReplay = S.morning.slice();
  S.nextMorningAt = performance.now() + 600;
  addTicker(`<b>Day ${S.w.day}.</b> The market is open. ${awayText()}`);
  diffNotes();
  renderAll();
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
  if (PHONE && sheetOpen()) { closeSheet(); return; }
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
$('#btn-home').onclick = () => { if (S.phase === 'market') goHome(); };
$('#btn-auto').onclick = () => { if (S.phase === 'market') goHome(true); };
document.querySelectorAll('.tab').forEach(b => b.onclick = () => showTab(b.dataset.tab));
document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeDialog);
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
  const sp = 70 * dt;
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
  S.nextMorningAt = now + 1100;
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
  $('#d-say').textContent = '"' + pick(id === 'rod' && S.w.rodDay && S.w.day >= S.w.rodDay ? L.rich : L.hi) + '"';
  $('#dialog').hidden = false;
  renderDialog();
}

function closeDialog() {
  $('#dialog').hidden = true;
  if (S.phase === 'dialog') S.phase = 'market';
  checkStory();
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
    const best = affordable(g)[0];
    const badge = best ? `for ${best.k}${icon(best.y)}${best.n > 1 ? ` <span>(get ${best.n})</span>` : ''}` : '✗ nothing you have';
    return `<button class="gcard ${g === x ? 'on' : ''} ${best ? 'can' : 'cant'}" data-g="${g}">${icon(g, 'big')}<span class="nm">${GOODS[g].name}</span><span class="ct">×${Sim.count(a, g)}</span><span class="badge">${badge}</span></button>`;
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
    const ok = affordable(x);
    deal += `<h4>FOR ${icon(x)} ${GOODS[x].name.toUpperCase()} ${nm(npc).toUpperCase()} WOULD TAKE</h4>`;
    if (ok.length) {
      deal += ok.map(o => {
        const isStep = step && step.npc === npc && step.x === x && step.y === o.y;
        return `<div class="deal-row ${isStep ? 'route' : ''}" data-y="${o.y}"><span class="terms">give <b>${o.k}</b> ${icon(o.y)}<span class="gn"> ${GOODS[o.y].name}</span><span class="arrow">→</span>get <b>${o.n}</b> ${icon(x)}<span class="gn"> ${gname(x, o.n)}</span>${isStep ? ' <span class="tag">← <span class="long">YOUR </span>ROUTE</span>' : ''}</span><button class="btn small" data-y="${o.y}" data-k="${o.k}" data-n="${o.n}">TRADE</button></div>`;
      }).join('');
    } else {
      const wantsIt = IDS.filter(y => Q[x][y] && !Sim.count(you, y));
      deal += `<p class="nodeal">✗ Nothing in your pack works. ${wantsIt.length ? `${nm(npc)} would take ${wantsIt.slice(0, 4).map(y => icon(y)).join(' ')} for it.` : ''}</p>`;
      if (S.dlg.find !== x) deal += `<button class="btn small" data-find="${x}">🧭 FIND A WAY TO GET ${GOODS[x].name.toUpperCase()}</button>`;
    }
  }
  if (S.dlg.find) deal += routesHTML(S.dlg.find, S.dlg.routes);
  $('#d-deal').innerHTML = deal || '<p class="empty">Nothing on the stall.</p>';
  document.querySelectorAll('#d-deal [data-k]').forEach(b => b.onclick = () => doTrade(npc, x, +b.dataset.n, b.dataset.y, +b.dataset.k));
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

function findWay(g) {
  S.dlg.find = g;
  S.dlg.routes = Sim.findRoutes(S.w, g, 1).slice(0, 3);
  renderDialog();
}

/* ---------- routes: "Sela takes bogwool, Mira takes snarlmilk" ---------- */
function routesHTML(g, routes) {
  if (!routes || !routes.length) return `<p class="nodeal" style="margin-top:8px">🧭 No chain of swaps gets you ${GOODS[g].name.toLowerCase()} today. Come back tomorrow, when stalls have changed.</p>`;
  S.shownRoutes = routes;
  return `<h4 style="margin-top:10px">🧭 WAYS TO GET ${icon(g)} ${GOODS[g].name.toUpperCase()}</h4><div class="routes">${routes.map((r, i) => `
    <div class="route-card"><ol>${r.steps.map(s => `<li><b>${nm(s.npc)}</b>: give ${s.k} ${icon(s.y)} → get ${s.n} ${icon(s.x)}</li>`).join('')}</ol><button class="btn small" data-follow="${i}">FOLLOW</button></div>`).join('')}</div>`;
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
    closeDialog();
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
  if (r.i >= r.steps.length) {
    bubble('you', `✓ got ${icon(r.target, 'sm')}`);
    addTicker(`🧭 Route done: you got ${gname(r.target)}.`);
    S.route = null;
  }
  renderRoute();
}
function renderRoute() {
  const el = $('#route-banner'), r = S.route;
  if (!r) { el.hidden = true; return; }
  const st = r.steps[r.i];
  const q = Sim.quote(S.w, st.npc, st.x, st.y);
  const broken = !S.w.byId[st.npc].present || !q || (!q.ok && Sim.count(S.w.byId.you, st.y) < q.k);
  el.hidden = false;
  el.innerHTML = `🧭 ${icon(r.target)} <span class="steps">${r.steps.map((s, i) => `<span class="st ${i === r.i ? 'now' : i < r.i ? 'done' : ''}">${i + 1}. ${nm(s.npc)}: ${s.k}${icon(s.y)}→${s.n}${icon(s.x)}</span>`).join('')}</span>
    ${broken ? '<span class="bad">this route stopped working</span>' : '<button data-go>GO</button>'}<button class="x" data-x title="Stop following">✕</button>`;
  el.querySelector('[data-go]')?.addEventListener('click', walkToStep);
  el.querySelector('[data-x]').onclick = () => { S.route = null; renderRoute(); };
}

function doTrade(npc, x, n, y, k) {
  const t = Sim.playerTrade(S.w, npc, x, n, y, k);
  if (!t) { bubble(npc, '✗', true); renderDialog(); return; }
  bubble('you', `${k}${icon(y, 'sm')} → ${n}${icon(x, 'sm')}`);
  fly('you', npc, y, k); fly(npc, 'you', x, n);
  feed(t);
  if (t.indirectA && !S.flags.indirect) S.flags.indirectPending = { npc, x, y };
  advanceRoute(npc, x);
  S.dlg.find = null; S.dlg.routes = null;
  const st = routeStep();
  if (st && st.npc === npc) S.dlg.x = st.x;
  renderDialog(); renderPack(); renderTop(); diffNotes();
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
    for (const [g, n] of [['lum', 2], ['ket', 1]]) {
      for (let tries = 0; tries < 3 && Sim.count(you, g) < n; tries++) {
        const r = Sim.findRoutes(w, g, 1)[0]; if (!r) break;
        if (!r.steps.every(st => Sim.playerTrade(w, st.npc, st.x, st.n, st.y, st.k))) break;
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
  diffNotes();
  renderAll();
  story(nightCard(ev, autoTrades, away), () => { if (!checkStory(() => beginDay())) beginDay(); });
}

/* ---------- side panels ---------- */
function renderAll() { renderTop(); renderPack(); renderNotes(); if (!$('#pane-village').hidden) renderVillage(); }

function renderTop() {
  const w = S.w, you = w.byId.you;
  $('#day-label').textContent = `DAY ${w.day}`;
  $('#phase-label').textContent = S.phase === 'night' ? '· night' : '· market';
  const fam = Object.keys(you.needs).map(g => {
    const per = you.needs[g];
    const days = Math.floor((Sim.count(you, g) + you.acc[g]) / per);
    const bad = you.hunger[g] > 0;
    return `<span class="need ${bad ? 'bad' : 'ok'}" data-plan="${g}" title="Click to find a way to get more. Your family uses ${per < 1 ? 'one every ' + Math.round(1 / per) + ' days' : per + ' a day'}">${icon(g, 'sm')} ${PHONE ? `<b>${days}d</b>` : `<b>${days}</b>&nbsp;day${days === 1 ? '' : 's'} left${bad ? ' · SHORT' : ''}`}</span>`;
  }).join('');
  $('#family').innerHTML = `<span>Family:</span>${fam}`;
  $('#pb-village').hidden = $('#tab-village').hidden;
  $('#pb-village').classList.toggle('new', $('#tab-village').classList.contains('new'));
  document.querySelectorAll('#family [data-plan]').forEach(b => b.onclick = () => plan(b.dataset.plan));
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

function plan(g) {
  if (PHONE) openSheet('pack'); else showTab('pack');
  if (NARROW() && !PHONE) $('.side').scrollIntoView({ behavior: 'smooth', block: 'start' });
  S.plan = { g, routes: S.phase === 'market' || S.phase === 'dialog' ? Sim.findRoutes(S.w, g, 1).slice(0, 3) : [] };
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
    <div class="chart-title">WHO TAKES WHAT WITHOUT NEEDING IT</div>
    <canvas class="chart" id="c-money" width="640" height="300"></canvas>
    <div class="chart-legend">${IDS.map(g => `<span>${icon(g, 'sm')}<span style="color:${COLORS[g]}">${Math.round(H[H.length - 1].moneyness[g] * 100)}%</span></span>`).join('')}</div>
    <div class="chart-title">PRICE OF 1 ${icon('lum', 'sm')} IN ${icon('pen', 'sm')} PENTAJA ${S.flags.zir ? 'AND ' + icon('zir', 'sm') + ' ZIRNET' : ''}</div>
    <canvas class="chart" id="c-price" width="640" height="300"></canvas>
    <p class="muted" style="font-size:13px">Each villager keeps a notebook just like yours. These charts add them all up. ${H[H.length - 1].moneyness[top] > 0 ? `Right now the most widely accepted good is ${icon(top)} <b>${GOODS[top].name}</b>.` : 'Right now nobody takes anything they don\'t need.'}</p>`;
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
  if (S.w.rodDay) {
    const i = S.w.rodDay - 1;
    g.strokeStyle = '#ff6fb5'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(X(i), pad / 2); g.lineTo(X(i), Hh - pad); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ff6fb5'; g.fillText('Rod\'s cave', X(i) + 6, pad);
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
function story(html, done, okText = 'OK') {
  const prev = S.phase;
  S.phase = 'story';
  $('#story-body').innerHTML = html;
  $('#story-ok').textContent = okText;
  $('#story').hidden = false;
  $('#story-ok').onclick = () => {
    $('#story').hidden = true;
    S.phase = prev === 'story' ? 'market' : prev;
    if (done) done();
  };
}

function introCard() {
  return `
    <h2>Welcome to Ulm Hollow</h2>
    <p class="big long">You live in a small village on a strange little world.</p>
    <p>Your family raises ${icon('bog')} <b>bogwool</b>. You make 2 a day. But your family needs other things:</p>
    <ul class="night-list">
      <li>${icon('lum')} <b>1 lumfruit</b> every day, to eat</li>
      <li>${icon('ket')} <b>1 kettlestone</b> every 3 days, for tools.<span class="long"> Without tools you make less bogwool.</span></li>
    </ul>
    <p>You make neither. But there's a market every morning, and everyone brings what they have.</p>
    <p class="muted long">Nobody will tell you what anything is worth. Walk to a stall and find out. Stuck? The 🧭 helper works out chains of swaps, just like you could with your notebook.</p>
    <p class="muted short">Tap a stall to trade. Tap your family's needs at the top to find a way to get them.</p>`;
}

function nightCard(ev, autoTrades, away) {
  const you = S.w.byId.you, lines = [];
  for (const t of autoTrades) {
    const mine = t.a === 'you' ? { got: [t.n, t.x], gave: [t.k, t.y], who: t.b } : { got: [t.k, t.y], gave: [t.n, t.x], who: t.a };
    lines.push(`<li>🤝 You traded ${mine.gave[0]} ${icon(mine.gave[1], 'sm')} to ${nm(mine.who)} for ${mine.got[0]} ${icon(mine.got[1], 'sm')}</li>`);
  }
  for (const e of ev) {
    if (e.type === 'short' && e.g === 'lum') lines.push(`<li>😟 <b>Your family went hungry.</b> No ${icon('lum', 'sm')} lumfruit in the pack.</li>`);
    if (e.type === 'short' && e.g === 'ket') lines.push(`<li>🔨 <b>Your tools broke.</b> No ${icon('ket', 'sm')} kettlestone. You'll make less bogwool.</li>`);
    if (e.type === 'rot') lines.push(`<li>🤢 ${e.n} ${icon(e.g, 'sm')} ${gname(e.g, e.n).toLowerCase()} went bad.</li>`);
    if (e.type === 'made') lines.push(`<li>🧶 You made ${e.n} ${icon(e.g, 'sm')} ${gname(e.g, e.n).toLowerCase()}.</li>`);
    if (e.type === 'plenty') lines.push(`<li>📦 You already have plenty of bogwool, so you didn't make more.</li>`);
    if (e.type === 'full') lines.push(`<li>🎒 Your pack is full!</li>`);
    if (e.type === 'junk') lines.push(`<li>🗑️ You left a ${icon(e.g, 'sm')} at home. It wasn't worth carrying.</li>`);
  }
  const ate = !ev.some(e => e.type === 'short' && e.g === 'lum');
  if (ate) lines.unshift(`<li>🍽️ Your family ate. Everyone's happy.</li>`);
  const seen = away.slice(0, 5).map(t => `<li class="feedline">${tradeLine(t)}</li>`).join('');
  return `<h2>Night falls · Day ${S.w.day - 1}</h2><ul class="night-list">${lines.join('')}</ul>
    ${away.length ? `<h3 class="pixel sub">WHILE YOU WERE HOME · ${away.length} SWAP${away.length === 1 ? '' : 'S'}</h3><ul class="night-list ticker-like">${seen}</ul>${away.length > 5 ? `<p class="muted" style="font-size:13px">…and ${away.length - 5} more.</p>` : ''}` : ''}
    ${ev.some(e => e.type === 'rod') ? '' : '<p class="muted">Tomorrow the market opens again.</p>'}`;
}

// Story beats fire on what the simulation actually did, not on a fixed script.
function checkStory(then) {
  const w = S.w, f = S.flags;
  const fire = (key, html, ok) => { f[key] = true; story(html, () => { renderAll(); if (then) then(); else checkStory(); }, ok); return true; };

  if (!f.refusal && f.sawRefusal && S.phase === 'market') {
    const { npc, g } = f.sawRefusal;
    return fire('refusal', `
      <h2>${nm(npc)} doesn't want your ${GOODS[g].name.toLowerCase()}</h2>
      <p>${nm(npc)} has something you want. But you have nothing ${nm(npc)} wants.</p>
      <p>This is the basic problem with barter. A swap only works when <b>each side wants exactly what the other has</b>. Economists call it the <i>double coincidence of wants</i>.</p>
      <p class="long">Your <b>NOTEBOOK</b> is keeping track of what you learn. Who <i>does</i> want what you've got?</p>`);
  }
  if (!f.indirect && f.indirectPending && S.phase === 'market') {
    const { x, y } = f.indirectPending;
    const fans = NPCS.filter(id => w.byId.you.note[id][x] >= 0.6).map(nm);
    return fire('indirect', `
      <h2>You just bought something you can't use</h2>
      <p>Your family has no use for ${icon(x)} <b>${GOODS[x].name.toLowerCase()}</b>. You traded for it anyway, because you think ${fans.length ? '<b>' + fans.slice(0, 2).join('</b> and <b>') + '</b>' : 'someone'} will take it for what you really need.</p>
      <p class="big">That's <b class="gold">indirect exchange</b>: taking something not to use, but to trade it on.</p>
      <p class="long">Keep that in mind. Everyone in Ulm Hollow is doing the same calculation, every market day.</p>`);
  }
  const top = topMoney();
  if (!f.money && w.day >= 4 && recentMoneyness(top) >= 0.5 && S.phase === 'market') {
    f.moneyGood = top;
    $('#tab-village').hidden = false; $('#tab-village').classList.add('new');
    const G = GOODS[top];
    const why = [];
    if (G.rot === Infinity) why.push('it never rots'); else why.push(`it lasts ${G.rot} days`);
    if (G.size < 1) why.push('it\'s tiny, so a pack holds dozens');
    if (Sim.VILLAGERS.find(v => v.makes === top).rate < 1) why.push('nobody can make much of it');
    return fire('money', `
      <h2>Something is happening in Ulm Hollow</h2>
      <p>Look at the new <b>VILLAGE</b> <span class="long">tab</span><span class="short">button</span>. More and more villagers take ${icon(top)} <b>${G.name.toLowerCase()}</b> even though they have <b>no use for it</b>. They take it because they know <i>others</i> will take it.</p>
      <p class="long">And every time someone accepts it, it becomes a little more useful to accept. Nobody voted. Nobody decided. It just… happened.</p>
      <p>Why ${G.name.toLowerCase()}? Everyone eats lumfruit, but it goes mushy in 3 days. Kettlestone is useful, but too heavy to carry around. ${G.name}: ${why.join(', ')}.</p>
      <p class="big">A good that people hold only to trade away again is called <b class="pen">money</b>.</p>
      <p class="quote long">"…the most saleable of goods became the ones everyone accepts in exchange." Carl Menger, <i>On the Origin of Money</i>, 1892 (paraphrased)</p>`, 'SHOW ME');
  }
  if (!f.rod && w.rodDay && w.day >= w.rodDay) {
    return fire('rod', `
      <h2>News at the market</h2>
      <p class="big"><b class="pen">Rod found a cave full of pentaja.</b></p>
      <p>Rod used to dig up a pentaja every couple of days. Now he's bringing out <b>ten a day</b>.</p>
      <p class="long">Lucky Rod! He can buy whatever he wants now. But think about what that means for everyone else's pentaja…</p>`);
  }
  if (!f.inflation && w.rodDay && w.day >= w.rodDay + 4) {
    const H = w.history;
    const pre = H.slice(0, w.rodDay - 1).map(h => h.price.pen).filter(v => v != null);
    const post = H.slice(-4).map(h => h.price.pen).filter(v => v != null);
    const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
    if (pre.length && post.length) {
      const a = avg(pre), b = avg(post);
      const mine = Sim.count(w.byId.you, 'pen');
      $('#tab-village').classList.add('new');
      return fire('inflation', `
        <h2>Your pentaja buys less</h2>
        <p>Before Rod's cave, a lumfruit cost about <b>${a.toFixed(1)}</b> ${icon('pen', 'sm')}.<br>Now it costs about <b class="pen">${b.toFixed(1)}</b> ${icon('pen', 'sm')}.</p>
        <p class="long">Nothing about lumfruit changed. There are just a lot more pentaja chasing the same lumfruit.</p>
        ${mine ? `<p>You're holding <b>${mine}</b> pentaja. That used to buy about ${Math.floor(mine / a)} lumfruit. Today it buys about ${Math.floor(mine / b)}.</p>` : ''}
        <p class="big">Rod didn't steal from anyone. But everyone who <b>saved</b> in pentaja just paid for his shopping.</p>`, 'OOF');
    }
  }
  if (!f.zir && w.rodDay && w.day > w.rodDay + 2 && recentMoneyness('zir') > recentMoneyness('pen') + 0.15) {
    $('#tab-village').classList.add('new');
    return fire('zir', `
      <h2>The village is quietly switching</h2>
      <p>Fewer villagers will take ${icon('pen')} pentaja now. More of them are asking for ${icon('zir')} <b class="zir">zirnet</b>.</p>
      <p class="long">Old Hesk still finds one every few days, cave or no cave. Nobody can suddenly make lots more zirnet. That makes it a better place to keep your savings.</p>
      <p class="big">Money is only as good as <b>how hard it is to make more of it</b>.</p>`);
  }
  if (!f.end && w.rodDay && w.day >= w.rodDay + 10 && f.rod) {
    return fire('end', `
      <h2>What just happened</h2>
      <ul class="night-list">
        <li>1. Barter was painful. You rarely had what the other person wanted.</li>
        <li>2. So you, and everyone else, started taking goods you didn't need, just to trade them on.</li>
        <li>3. The goods that were easiest to pass on (durable, small, scarce) won. One became <b class="pen">money</b>. Nobody planned it.</li>
        <li>4. Then Rod found a way to make lots more of it. Prices rose. Savers lost out.</li>
        <li>5. ${f.zir ? 'The village moved to something harder to make: zirnet.' : 'Nobody trusts pentaja like before. The village is looking for something harder to make.'}</li>
      </ul>
      <p class="long">This has happened again and again in human history: shells, beads, stones, metal. Each time, someone found a cave.</p>
      <p class="big">Next: <b>Every Rod in History.</b></p>
      <p class="muted long">You can keep playing. Try a different village: add <code>?seed=3</code> to the address.</p>`, 'KEEP PLAYING');
  }
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
