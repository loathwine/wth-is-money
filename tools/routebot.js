// Can a player who only uses the route finder keep their family fed, before and after Rod's cave?
// Each morning: top up lumfruit to 2 and kettlestone to 1 via findRoutes. With --save, then sell
// spare bogwool (above 3) for the listed goods, the way a saver would. Then go home.
// Reports how often each villager went hungry.
// Usage: node tools/routebot.js [seeds=8] [days=32] [--save=zir,pen] [--set=you.rate=2] [--verbose=SEED]
const Sim = require('../lessons/01-barter/sim.js');
const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return [a.slice(2, i < 0 ? undefined : i), i < 0 ? '1' : a.slice(i + 1)]; }));
const seeds = +(pos[0] ?? 8), days = +(pos[1] ?? 32), verbose = +(opt.verbose ?? 0);
const save = opt.save ? opt.save.split(',') : [];
// --set=you.rate=2,dov.needs.bog=1 tweaks villagers for a quick what-if
for (const kv of (opt.set ? opt.set.split(',') : [])) {
  const [path, v] = kv.split('='), keys = path.split('.');
  const id = keys.shift();
  let o = Sim.VILLAGERS.find(x => x.id === id);
  while (keys.length > 1) { const k = keys.shift(); o = o[k] = o[k] || {}; }
  o[keys[0]] = +v;
}
const ids = Sim.VILLAGERS.map(v => v.id);
const want = { lum: 2, ket: 1 };
const hungry = { pre: {}, post: {} }, nDays = { pre: 0, post: 0 };
let ms = 0, calls = 0;
const log = (s, ...a) => { if (verbose === s) console.log(...a); };

for (let s = 1; s <= seeds; s++) {
  const w = Sim.createWorld({ seed: s }), you = w.byId.you;
  for (let d = 0; d < days; d++) {
    Sim.startDay(w);
    for (const g in want) {
      for (let tries = 0; tries < 4 && Sim.count(you, g) < want[g]; tries++) {
        const t0 = performance.now();
        const r = Sim.findRoutes(w, g, 1)[0];
        ms += performance.now() - t0; calls++;
        if (!r) { log(s, `d${w.day} no route to ${g}`, Object.fromEntries(Sim.IDS.map(x => [x, Sim.count(you, x)]))); break; }
        let ok = true;
        for (const st of r.steps) if (!Sim.playerTrade(w, st.npc, st.x, st.n, st.y, st.k)) { ok = false; break; }
        log(s, `d${w.day} ${g}: ${r.steps.map(st => `${st.npc}:${st.k}${st.y}->${st.n}${st.x}`).join(' | ')}${ok ? '' : ' BROKE'}`);
        if (!ok) break;
      }
    }
    for (let t = 0; save.length && t < 4 && Sim.count(you, 'bog') > 3; t++) {
      let best = null;
      for (const m of save) for (const a of w.agents) if (a.present && a.id !== 'you') {
        const q = Sim.quote(w, a.id, m, 'bog');
        if (q && q.ok && (!best || q.n / q.k > best.q.n / best.q.k)) best = { a: a.id, m, q };
      }
      if (!best || !Sim.playerTrade(w, best.a, best.m, best.q.n, 'bog', best.q.k)) break;
      log(s, `d${w.day} save: ${best.a}:${best.q.k}bog->${best.q.n}${best.m}`);
    }
    you.present = false;
    Sim.endDay(w);
    const k = w.rodDay && w.day > w.rodDay ? 'post' : 'pre';
    nDays[k]++;
    for (const id of ids) if (w.byId[id].hunger.lum > 0) hungry[k][id] = (hungry[k][id] || 0) + 1;
  }
}
const pct = k => ids.map(id => `${id} ${Math.round(100 * (hungry[k][id] || 0) / Math.max(1, nDays[k]))}%`).join('  ');
console.log(`save: ${save.join(',') || 'nothing'}  set: ${opt.set || '-'}`);
console.log(`hungry before the cave: ${pct('pre')}`);
console.log(`hungry after the cave:  ${pct('post')}`);
console.log(`findRoutes: ${(ms / calls).toFixed(1)} ms per call`);
