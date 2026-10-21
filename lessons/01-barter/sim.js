/* ============================================================
   Barter village simulation.

   Nothing here is scripted to make a particular good "money".
   Every villager, including the player, keeps a notebook of who
   accepted or refused which good. A good is worth holding for
   trade (not for use) roughly in proportion to how many others
   the holder believes will take it, discounted by:
     - rot        (will it survive until I can pass it on?)
     - size       (will it fit in my pack?)
     - s2f        (stock-to-flow: is new supply diluting it?)
   Whichever good wins that feedback loop becomes money.

   Works as a classic <script> (window.Sim) and under Node.
   ============================================================ */
(function (root) {
'use strict';

const GOODS = {
  lum: { name: 'Lumfruit',    rot: 3,        size: 1,   color: '#ffd23f', blurb: 'A glowing fruit. One feeds a family for a day. Goes mushy after 3 days.' },
  bog: { name: 'Bogwool',     rot: Infinity, size: 2,   color: '#8fd16a', blurb: 'Springy swamp fleece. Keeps forever, but bulky.' },
  ket: { name: 'Kettlestone', rot: Infinity, size: 3,   color: '#9aa3b5', blurb: 'A heavy stone that holds heat. Tools are made from it.' },
  snm: { name: 'Snarlmilk',   rot: 2,        size: 1,   color: '#e9f0ff', blurb: 'Milk from a snarl beast. Sours after 2 days.' },
  dri: { name: 'Driftcap',    rot: 4,        size: 1,   color: '#c77dff', blurb: 'A floating mushroom used as medicine. Wilts after 4 days.' },
  pen: { name: 'Pentaja',     rot: Infinity, size: 0.2, color: '#ff6fb5', blurb: 'A tiny five-sided crystal. Pretty. Rod digs one up now and then.' },
  zir: { name: 'Zirnet',      rot: Infinity, size: 0.2, color: '#4de1e8', blurb: 'A blue bead that never chips. Old Hesk finds one every few days.' },
};
const IDS = Object.keys(GOODS);

// needs: units consumed per day. keeps: trinkets they like to own (never used up).
// Nobody's surplus lines up neatly with anyone's needs.
const VILLAGERS = [
  { id: 'you',  name: 'You',  makes: 'bog', rate: 2,   needs: { lum: 1, ket: 1 / 3 },             attend: 1 },
  { id: 'mira', name: 'Mira', makes: 'lum', rate: 10,   needs: { snm: 1, dri: 0.5 }, keeps: { pen: 2 }, attend: 0.85 },
  { id: 'bob',  name: 'Bob',  makes: 'ket', rate: 2,   needs: { lum: 1 }, keeps: { pen: 2 },         attend: 0.7 },
  { id: 'sela', name: 'Sela', makes: 'snm', rate: 4,   needs: { bog: 1, lum: 1 }, keeps: { zir: 1 }, attend: 0.85 },
  { id: 'dov',  name: 'Dov',  makes: 'dri', rate: 3,   needs: { ket: 1 / 3, snm: 1, bog: 0.5 }, keeps: { pen: 1 }, attend: 0.8 },
  { id: 'rod',  name: 'Rod',  makes: 'pen', rate: 0.5, needs: { lum: 1, dri: 0.5 },               attend: 0.75 },
  { id: 'hesk', name: 'Hesk', makes: 'zir', rate: 0.3, needs: { bog: 0.5, lum: 1 },               attend: 0.6 },
];

const MAKER = Object.fromEntries(VILLAGERS.map(v => [v.makes, v.id]));
const CAP = 30;          // pack capacity, in size units
const HORIZON = 2;       // days of needs a villager likes to have on hand
const PRIOR = 0.1;       // belief that a stranger accepts a good nobody has seen traded
const W = 9;             // what a widely accepted, durable good is worth for trading
const EPS = 0.05;
const HASSLE = 1.5;
const HAUL = 8;         // most size units of one good anyone takes in a single swap     // a villager won't bother with a swap unless it's clearly worth it
const PLAN_TRUST = 0.6;  // how much a known 'X takes Y' is worth vs. holding the need itself
const JUNK = 0.5;        // below this a unit isn't worth carrying; it's left at home
const STOCK_LIMIT = 8;   // stop producing once you hold this many of your own good
const MONEY_BAR = 2.5;  // exchange value at which a villager 'takes it as payment'

function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function createWorld(opts = {}) {
  const seed = opts.seed ?? 7;
  const w = {
    day: 1, seed, rand: rng(seed),
    playerAuto: opts.playerAuto ?? false,
    rodDay: null, rodStrikeAt: opts.rodStrikeAt ?? { minDay: 14, maxDay: 28, moneyness: 0.5 },
    agents: [], byId: {},
    produced: Object.fromEntries(IDS.map(g => [g, []])), // per-day production, last 7 days
    s2f: Object.fromEntries(IDS.map(g => [g, 1])),
    history: [],   // per-day stats
    events: [],    // today's notable happenings (for the UI)
    trades: [],    // today's trades
  };
  for (const v of VILLAGERS) {
    const a = {
      ...v, needs: { ...v.needs }, keeps: { ...v.keeps }, wants: { ...v.needs, ...v.keeps }, inv: Object.fromEntries(IDS.map(g => [g, []])),
      acc: Object.fromEntries(IDS.map(g => [g, 0])), prodAcc: 0,
      hunger: Object.fromEntries(IDS.map(g => [g, 0])),
      note: {}, seen: {}, present: true,
    };
    // Starting packs: some of your own good, a little food, and a few inherited trinkets.
    give(a, v.makes, v.makes === 'pen' ? 6 : v.makes === 'zir' ? 4 : Math.max(4, Math.min(10, Math.ceil(v.rate * 1.5))));
    if (v.makes !== 'lum') give(a, 'lum', 2);
    if (v.id !== 'you' && v.makes !== 'pen' && w.rand() < 0.5) give(a, 'pen', 1);   // a few old trinkets lying around
    if (v.id !== 'you' && v.makes !== 'zir' && w.rand() < 0.5) give(a, 'zir', 1);
    w.agents.push(a); w.byId[a.id] = a;
  }
  for (const a of w.agents) for (const b of w.agents) if (a !== b) {
    a.note[b.id] = Object.fromEntries(IDS.map(g => [g, null]));
    a.seen[b.id] = null;
  }
  recomputeS2F(w);
  w.history.push(stats(w));
  return w;
}

/* ---------- inventory ---------- */
function count(a, g) { return a.inv[g].length; }
function load(a) { let l = 0; for (const g of IDS) l += a.inv[g].length * GOODS[g].size; return l; }
function give(a, g, n, age = 0) { for (let i = 0; i < n; i++) a.inv[g].push(age); }
function take(a, g, n) {
  // oldest units go first (ages are kept in descending order after sort)
  a.inv[g].sort((x, y) => y - x);
  return a.inv[g].splice(0, n);
}

/* ---------- valuation ---------- */
function wantUnits(a, g) {
  if (a.keeps[g]) return a.keeps[g];
  const r = a.needs[g]; return r ? Math.max(1, Math.ceil(r * HORIZON)) : 0;
}

function useVal(a, g, k) {
  if (a.keeps[g]) return k <= a.keeps[g] ? 7 : 0;
  const r = a.needs[g]; if (!r) return 0;
  const want = wantUnits(a, g);
  const U = (g === 'lum' ? 14 : 10) * (1 + 0.5 * Math.min(2, a.hunger[g]));
  if (k <= want) return U;
  return U * 0.3 * Math.pow(0.6, k - want - 1);
}

function saleability(a, g) {
  let s = 0, n = 0;
  for (const j in a.note) { const v = a.note[j][g]; s += v == null ? PRIOR : v; n++; }
  return n ? s / n : 0;
}

function keepFactor(g) { const r = GOODS[g].rot; return r === Infinity ? 1 : Math.max(0, 1 - 2 / r); }

function exchVal(w, a, g, k) {
  const keep = keepFactor(g); if (!keep) return 0;
  const m = saleability(a, g);
  return W * Math.pow(m, 1.2) * keep * w.s2f[g] * Math.pow(0.92, k - 1) / (1 + 0.5 * GOODS[g].size);
}

// The thought experiment, literally: "Bob sells kettlestone and Bob takes driftcap,
// so a driftcap is worth something to me even though I'll never use one."
function planVal(w, a, g, k) {
  const keep = keepFactor(g); if (!keep) return 0;
  let best = 0;
  for (const x in a.wants) {
    if (x === g || count(a, x) >= wantUnits(a, x)) continue;
    const maker = MAKER[x]; if (maker === a.id) continue;
    const p = a.note[maker][g] ?? PRIOR;
    best = Math.max(best, PLAN_TRUST * useVal(a, x, count(a, x) + 1) * p * keep);
  }
  return best * Math.pow(0.6, k - 1);
}

function val(w, a, g, k) { return k < 1 ? 0 : Math.max(useVal(a, g, k), exchVal(w, a, g, k), planVal(w, a, g, k)); }
function lossOf(w, a, g, n) { let s = count(a, g), L = 0; for (let i = 0; i < n; i++) L += val(w, a, g, s - i); return L; }
function gainOf(w, a, g, n) { let s = count(a, g), G = 0; for (let i = 1; i <= n; i++) G += val(w, a, g, s + i); return G; }

/* ---------- deals ---------- */
// A receives n of x from B, B receives k of y from A.
function evalDeal(w, A, B, x, n, y, k, hypothetical = false) {
  if (count(B, x) < n || (!hypothetical && count(A, y) < k)) return null;
  if (k * GOODS[y].size > HAUL || n * GOODS[x].size > HAUL) return null;   // nobody lugs home a mountain of it
  if (load(A) + n * GOODS[x].size - k * GOODS[y].size > CAP + 1e-9) return null;
  if (load(B) + k * GOODS[y].size - n * GOODS[x].size > CAP + 1e-9) return null;
  const gA = gainOf(w, A, x, n) - lossOf(w, A, y, k);
  const gB = gainOf(w, B, y, k) - lossOf(w, B, x, n);
  return { x, n, y, k, gA, gB };
}

const SHAPES = [];
for (let k = 1; k <= 8; k++) SHAPES.push([1, k]);
for (let n = 2; n <= 6; n++) SHAPES.push([n, 1]);

function bestDeal(w, A, B) {
  let best = null, bestScore = 0;
  for (const x of IDS) {
    if (!count(B, x)) continue;
    for (const y of IDS) {
      if (y === x || !count(A, y)) continue;
      for (const [n, k] of SHAPES) {
        const d = evalDeal(w, A, B, x, n, y, k);
        if (!d || d.gA <= HASSLE || d.gB <= HASSLE) continue;
        const score = d.gA * d.gB;
        if (score > bestScore) { bestScore = score; best = d; }
      }
    }
  }
  return best;
}

// Cheapest k of y that B would accept for n of x. null = refuses y at any amount.
// short = they'd take it, but you don't have that many.
function askPrice(w, buyer, seller, x, n, y) {
  for (let k = 1; k * GOODS[y].size <= HAUL; k++) {
    const d = evalDeal(w, buyer, seller, x, n, y, k, true);
    if (d && d.gB > HASSLE) return { k, short: count(buyer, y) < k, gBuyer: d.gA };
  }
  return null;
}

/* ---------- observation ---------- */
function observe(w, who, g, accepted, participants) {
  for (const o of w.agents) {
    if (!o.present || o === who) continue;
    const alpha = participants.includes(o) ? 0.6 : 0.35;
    const cur = o.note[who.id][g] ?? PRIOR;
    // stated needs are known facts; don't let one refusal overwrite them
    if (o.note[who.id][g] === 1 && who.wants[g]) continue;
    o.note[who.id][g] = cur + alpha * ((accepted ? 1 : 0) - cur);
  }
}

function learnNeeds(o, a) { for (const g in a.wants) o.note[a.id][g] = 1; }

function execDeal(w, A, B, d, why) {
  learnNeeds(A, B); learnNeeds(B, A);
  const xs = take(B, d.x, d.n); for (const age of xs) A.inv[d.x].push(age);
  const ys = take(A, d.y, d.k); for (const age of ys) B.inv[d.y].push(age);
  observe(w, B, d.y, true, [A, B]);
  observe(w, A, d.x, true, [A, B]);
  const t = { day: w.day, a: A.id, b: B.id, x: d.x, n: d.n, y: d.y, k: d.k,
    indirectA: !A.wants[d.x], indirectB: !B.wants[d.y], why };
  w.trades.push(t);
  return t;
}

function refuse(w, A, B, y) {
  learnNeeds(A, B);
  observe(w, B, y, false, [A, B]);
  w.trades.push({ day: w.day, a: A.id, b: B.id, refused: y });
}

/* ---------- the day ---------- */
function startDay(w) {
  w.events = []; w.trades = [];
  for (const a of w.agents) {
    a.present = a.id === 'you' || w.day === 1 ? true : w.rand() < a.attend;   // everyone turns up on day one
  }
  for (const a of w.agents) if (a.present) for (const o of w.agents) if (o !== a && o.present) o.seen[a.id] = w.day;
  // Locals chat at the stalls: each NPC catches up with one other villager a day.
  // (The player learns needs by walking up and talking.)
  const here = w.agents.filter(a => a.present);
  for (const o of here) {
    if (o.id === 'you') continue;
    const others = here.filter(a => a !== o);
    if (others.length && w.rand() < 0.5) learnNeeds(o, others[Math.floor(w.rand() * others.length)]);
  }
  tradeRounds(w, 2);   // the early crowd; the player arrives mid-morning
}

function traders(w) { return w.agents.filter(a => a.present && (a.id !== 'you' || w.playerAuto)); }

function tradeRounds(w, rounds) {
  for (let r = 0; r < rounds; r++) {
    const order = shuffle(w, traders(w));
    for (const A of order) {
      let best = null, partner = null;
      for (const B of order) {
        if (B === A) continue;
        const d = bestDeal(w, A, B);
        if (d && (!best || d.gA * d.gB > best.gA * best.gB)) { best = d; partner = B; }
      }
      if (best) { execDeal(w, A, partner, best); continue; }
      // Nothing works: ask around for what you need and get refused (everyone hears).
      for (const g in A.wants) {
        if (count(A, g) >= wantUnits(A, g)) continue;
        const seller = order.find(B => B !== A && count(B, g) > 0);
        if (!seller) continue;
        const offers = IDS.filter(y => y !== g && count(A, y) > 0 && !A.wants[y])
          .sort((p, q) => count(A, q) - count(A, p)).slice(0, 2);
        for (const y of offers) if (!askPrice(w, A, seller, g, 1, y)) refuse(w, A, seller, y);
        break;
      }
    }
  }
}

function endDay(w) {
  tradeRounds(w, 4);   // the afternoon, after the player heads home
  const ev = w.events;
  for (const a of w.agents) {
    // eat and use
    for (const g in a.needs) {
      a.acc[g] += a.needs[g];
      while (a.acc[g] >= 1) {
        a.acc[g] -= 1;
        if (count(a, g)) { take(a, g, 1); a.hunger[g] = 0; }
        else { a.hunger[g]++; if (a.id === 'you') ev.push({ type: 'short', g }); }
      }
    }
    // rot
    for (const g of IDS) {
      const r = GOODS[g].rot; if (r === Infinity) continue;
      const before = a.inv[g].length;
      a.inv[g] = a.inv[g].map(x => x + 1).filter(x => x < r);
      const lost = before - a.inv[g].length;
      if (lost && a.id === 'you') ev.push({ type: 'rot', g, n: lost });
    }
  }
  // leave junk at home: units not worth carrying to market tomorrow
  for (const a of w.agents) {
    for (const g of IDS) {
      if (g === a.makes) continue;
      while (count(a, g) && val(w, a, g, count(a, g)) < JUNK) {
        take(a, g, 1);
        if (a.id === 'you') ev.push({ type: 'junk', g });
      }
    }
  }
  // produce
  const prodToday = Object.fromEntries(IDS.map(g => [g, 0]));
  for (const a of w.agents) {
    let rate = a.rate;
    if (a.id === 'you' && a.hunger.ket > 0) rate = Math.max(1, Math.floor(rate / 2)); // no tools
    a.prodAcc += rate;
    let made = 0;
    while (a.prodAcc >= 1) {
      a.prodAcc -= 1;
      // nobody makes more than they could ever hope to move
      if (count(a, a.makes) >= Math.max(STOCK_LIMIT, 2 * a.rate)) { if (a.id === 'you') ev.push({ type: 'plenty' }); break; }
      if (load(a) + GOODS[a.makes].size > CAP + 1e-9) { if (a.id === 'you') ev.push({ type: 'full' }); break; }
      give(a, a.makes, 1); made++;
    }
    if (a.prodAcc > 1) a.prodAcc = 1;
    prodToday[a.makes] += made;
    if (a.id === 'you' && made) ev.push({ type: 'made', g: a.makes, n: made });
  }
  for (const g of IDS) { w.produced[g].push(prodToday[g]); if (w.produced[g].length > 7) w.produced[g].shift(); }
  recomputeS2F(w);

  // Rod strikes a pentaja vein once pentaja has become the thing everyone takes.
  const st = stats(w);
  const rs = w.rodStrikeAt;
  if (rs && w.rodDay == null && w.day >= rs.minDay && (st.moneyness.pen >= rs.moneyness || w.day >= rs.maxDay)) {
    w.rodDay = w.day + 1;
    w.byId.rod.rate = 10;
    ev.push({ type: 'rod' });
  }
  w.history.push(st);
  w.day++;
}

function recomputeS2F(w) {
  for (const g of IDS) {
    let stock = 0; for (const a of w.agents) stock += count(a, g);
    const flow = w.produced[g].reduce((s, x) => s + x, 0);
    w.s2f[g] = 1 / (1 + 2 * flow / Math.max(1, stock));
  }
}

/* ---------- stats ---------- */
// "Moneyness": share of villagers who'd take a good without needing it,
// i.e. whose exchange value for one more unit beats a modest bar.
function stats(w) {
  const npcs = w.agents.filter(a => a.id !== 'you');
  const moneyness = {}, holding = {};
  for (const g of IDS) {
    let yes = 0, pool = 0, h = 0;
    for (const a of npcs) {
      if (a.wants[g] || a.makes === g) continue;   // only ask people with no use for it
      pool++;
      if (exchVal(w, a, g, count(a, g) + 1) >= MONEY_BAR) yes++;
      h += count(a, g);
    }
    moneyness[g] = pool ? yes / pool : 0;
    holding[g] = h;
  }
  // price of a lumfruit in pentaja / zirnet, from today's trades
  const price = {};
  for (const m of ['pen', 'zir']) {
    let q = 0, n = 0;
    for (const t of w.trades) {
      if (t.refused) continue;
      if (t.x === 'lum' && t.y === m) { q += t.k; n += t.n; }
      if (t.y === 'lum' && t.x === m) { q += t.n; n += t.k; }
    }
    price[m] = n ? q / n : null;
  }
  // which goods served as the go-between: accepted by someone who doesn't need it
  const medium = Object.fromEntries(IDS.map(g => [g, 0]));
  for (const t of w.trades) {
    if (t.refused) continue;
    if (t.indirectA) medium[t.x] += t.n;
    if (t.indirectB) medium[t.y] += t.k;
  }
  const indirect = w.trades.filter(t => !t.refused && (t.indirectA || t.indirectB)).length;
  const total = w.trades.filter(t => !t.refused).length;
  return { day: w.day, moneyness, medium, holding, price, indirect, total, s2f: { ...w.s2f } };
}

function shuffle(w, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(w.rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* ---------- player actions ---------- */
function playerTrade(w, sellerId, x, n, y, k) {
  const A = w.byId.you, B = w.byId[sellerId];
  const d = evalDeal(w, A, B, x, n, y, k);
  if (!d || d.gB <= HASSLE) { refuse(w, A, B, y); return null; }
  return execDeal(w, A, B, d, 'player');
}

function playerAsk(w, sellerId, x, n) {
  // What would the seller take for n of x? Every answer is something you observed.
  const A = w.byId.you, B = w.byId[sellerId];
  const out = {};
  for (const y of IDS) {
    if (y === x) continue;
    const p = askPrice(w, A, B, x, n, y);
    out[y] = p;
    // the answer itself is information
    const cur = A.note[B.id][y] ?? PRIOR;
    A.note[B.id][y] = p ? Math.max(cur, 0.8) : cur * 0.3;
  }
  for (const g in B.wants) A.note[B.id][g] = 1;
  return out;
}

// The player's best terms at a stall: the fewest y for one x, or, if a single y
// already does it, the most x for one y. null = they won't take y for x at all.
// Works for goods you don't hold too (have = how many you could actually pay).
function quote(w, sellerId, x, y) {
  const A = w.byId.you, B = w.byId[sellerId];
  if (!count(B, x)) return null;
  const p = askPrice(w, A, B, x, 1, y);
  if (!p) return null;
  let n = 1;
  if (p.k === 1) {
    for (let m = 2; m <= count(B, x) && m * GOODS[x].size <= HAUL; m++) {
      const d = evalDeal(w, A, B, x, m, y, 1, true);
      if (d && d.gB > HASSLE) n = m; else break;
    }
  }
  return { n, k: p.k, ok: count(A, y) >= p.k };
}

// Everything a seller would take, as the cheapest price for one of their goods.
// { y: { x, k, n } | null } — what the "takes" strip in the trade table shows.
function takes(w, sellerId) {
  const B = w.byId[sellerId], out = {};
  for (const y of IDS) {
    let best = null;
    for (const x of IDS) {
      if (x === y || !count(B, x)) continue;
      const q = quote(w, sellerId, x, y);
      if (q && (!best || q.n / q.k > best.n / best.k)) best = { x, ...q };
    }
    out[y] = best;
  }
  return out;
}

// "Go to Sela, swap bogwool for snarlmilk, then take the snarlmilk to Mira."
// Chains of up to `maxHops` swaps, among villagers at the market today, that
// end with `need` of `target` in your pack. Nobody trades while you're at the
// market, so a route found now stays good until you change your own pack.
function findRoutes(w, target, need = 1, maxHops = 3) {
  const you = w.byId.you;
  const sellers = w.agents.filter(a => a.present && a.id !== 'you');
  const memo = new Map();
  // chains (in execution order) that get `n` of `g`
  function get(g, n, hops) {
    const key = g + n + ':' + hops;
    if (memo.has(key)) return memo.get(key);
    const out = [];
    memo.set(key, out);
    for (const B of sellers) {
      if (count(B, g) < n) continue;
      for (const y of IDS) {
        if (y === g) continue;
        const p = askPrice(w, you, B, g, n, y);
        if (!p) continue;
        const step = { npc: B.id, x: g, n, y, k: p.k };
        const short = p.k - count(you, y);
        if (short <= 0) { out.push([step]); continue; }
        if (hops <= 1) continue;
        for (const sub of get(y, short, hops - 1)) {
          if (sub.some(s => s.y === g || s.x === g)) continue;   // no going in circles
          if (sub[sub.length - 1].npc === B.id) continue;          // pointless double-swap at one stall
          out.push([...sub, step]);
        }
      }
    }
    return out;
  }
  const routes = get(target, need, maxHops).map(steps => {
    // cost: what it takes out of your pack (by your own valuation), plus a walk per stop
    const spent = {};
    for (const s of steps) if (!steps.some(t => t.x === s.y)) spent[s.y] = (spent[s.y] || 0) + s.k;
    let cost = steps.length * 2;
    for (const g in spent) cost += lossOf(w, you, g, Math.min(spent[g], count(you, g)));
    return { target, need, steps, spent, cost };
  });
  routes.sort((a, b) => a.cost - b.cost);
  const seen = new Set();
  return routes.filter(r => {
    const sig = r.steps.map(s => s.npc + s.y).join('>');
    if (seen.has(sig)) return false;
    seen.add(sig); return true;
  });
}

const Sim = {
  GOODS, IDS, VILLAGERS, CAP, HAUL, createWorld, startDay, endDay, stats,
  count, load, val, planVal, useVal, exchVal, saleability, playerTrade, playerAsk, askPrice, wantUnits,
  quote, takes, findRoutes,
};
root.Sim = Sim;
if (typeof module !== 'undefined') module.exports = Sim;
})(typeof window !== 'undefined' ? window : globalThis);
