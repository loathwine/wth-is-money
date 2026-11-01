// Can a player who only uses the route finder keep their family fed and healthy, before and after Wren's cave?
// Each morning: while someone at home is sick, the medicine first (findRoutes offers Gran's jar too),
// then top up lumfruit to 2 and kettlestone to 1 via findRoutes. With --save, then sell spare bogwool
// (above 3) for the listed goods, the way a saver would. With --paywith=pen, pay Dov for medicine
// straight from the pack's pentaja when you can. --foodfirst buys food before medicine; --nojar empties the jar.
// Then go home. Reports how often each villager went hungry, how the sicknesses went, and who died
// (strength: see sim.js; untreated sickness kills on the 3rd night, the 2nd if hungry too).
// --lazy: a careless player: one route a day for lumfruit only, never medicine, never the jar.
// --crust=sick|tam|weakest: who gets the last crust on a hungry night (default: the sick one).
// Usage: node tools/routebot.js [seeds=8] [days=FESTIVAL-1] [--save=zir,pen] [--paywith=pen] [--medfirst] [--nosick]
//        [--set=you.rate=2] [--sick=NATURAL=4] [--foodfirst] [--nojar] [--lazy] [--crust=tam] [--verbose=SEED]
const Sim = require('../lessons/01-barter/sim.js');
const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return [a.slice(2, i < 0 ? undefined : i), i < 0 ? '1' : a.slice(i + 1)]; }));
const seeds = +(pos[0] ?? 8), days = +(pos[1] ?? Sim.FESTIVAL - 1), verbose = +(opt.verbose ?? 0);
const save = opt.save ? opt.save.split(',') : [];
const paywith = opt.paywith ? opt.paywith.split(',') : [];
// --set=you.rate=2,dov.needs.bog=1 tweaks villagers for a quick what-if
for (const kv of (opt.set ? opt.set.split(',') : [])) {
  const [path, v] = kv.split('='), keys = path.split('.');
  const id = keys.shift();
  let o = Sim.VILLAGERS.find(x => x.id === id);
  while (keys.length > 1) { const k = keys.shift(); o = o[k] = o[k] || {}; }
  o[keys[0]] = +v;
}
// --sick=NATURAL=4,WORSE_RATE=1 tweaks the sickness rules
for (const kv of (opt.sick ? opt.sick.split(',') : [])) { const [k, v] = kv.split('='); Sim.SICK[k] = +v; }
const ids = Sim.VILLAGERS.map(v => v.id);
// shopping order: the medicine first (--foodfirst: food first)
const want = opt.lazy ? { lum: 1 } : opt.foodfirst ? { lum: 2, dri: 0, ket: 1 } : { dri: 0, lum: 2, ket: 1 };   // dri: the doses still needed
const deaths = [];                      // { seed, who, night, cause }
let minHp = Sim.HP, critNights = 0;
const hungry = { pre: {}, post: {} }, nDays = { pre: 0, post: 0 };
let ms = 0, calls = 0;
// sickness: per episode, pre/post cave
const ep = { pre: [], post: [] };       // { nights, natural, worse, failedDays, price, spent }
const sickDays = { pre: 0, post: 0 };   // market days spent with someone sick
const failDays = { pre: 0, post: 0 };   // ...and you went home without all the doses
const lost = { pre: 0, post: 0 };       // bogwool not made because of sickness
const tired = { pre: 0, post: 0 };      // days you worked slower after two hungry nights
const jarEnd = [];
const hard = [];                        // per village: hard nights after the cave (hungry, or someone sick at strength 1)
const log = (s, ...a) => { if (verbose === s) console.log(...a); };

for (let s = 1; s <= seeds; s++) {
  const w = Sim.createWorld({ seed: s, sickness: !opt.nosick, jar: opt.nojar ? 0 : undefined, crust: opt.crust }), you = w.byId.you;
  const spentOn = new Map();   // episode -> { good: n } spent on medicine
  let hardN = 0;
  for (let d = 0; d < days; d++) {
    Sim.startDay(w);
    const sick = w.family.sick, phase = w.caveDay && w.day >= w.caveDay ? 'post' : 'pre';
    if ('dri' in want) want.dri = sick ? sick.left : 0;
    const spend = sick ? (spentOn.get(sick) || spentOn.set(sick, {}).get(sick)) : null;
    const before = Object.fromEntries(Sim.IDS.map(g => [g, Sim.count(you, g)])), jar0 = { ...w.family.jar };
    // a saver pays Dov straight from savings
    for (const m of paywith) {
      if (!sick || Sim.count(you, 'dri') >= want.dri || !w.byId.dov.present) break;
      const n = want.dri - Sim.count(you, 'dri');
      const p = Sim.askPrice(w, you, w.byId.dov, 'dri', n, m);
      if (p && !p.short && Sim.playerTrade(w, 'dov', 'dri', n, m, p.k)) log(s, `d${w.day} medicine: paid dov ${p.k}${m} for ${n}dri`);
    }
    for (const g in want) {
      for (let tries = 0; tries < (opt.lazy ? 1 : 4 + want[g]) && Sim.count(you, g) < want[g]; tries++) {
        const t0 = performance.now();
        // don't pay with what the family needs today (e.g. the medicine you just bought)
        const need = g === 'dri' ? want.dri - Sim.count(you, g) : 1;
        const r = [...Sim.findRoutes(w, g, need), ...(need > 1 ? Sim.findRoutes(w, g, 1) : [])].find(r => (!opt.lazy || !r.jar) && Object.keys(r.spent).every(y => !want[y] || y === g || Sim.count(you, y) - r.spent[y] >= want[y]));
        ms += performance.now() - t0; calls++;
        if (!r) { log(s, `d${w.day} no route to ${g}`, Object.fromEntries(Sim.IDS.map(x => [x, Sim.count(you, x)]))); break; }
        let ok = true;
        for (const st of r.steps) if (!Sim.routeStep(w, st)) { ok = false; break; }
        log(s, `d${w.day} ${g}: ${r.steps.map(st => `${st.npc}:${st.k}${st.y}${st.jar ? '(jar)' : ''}->${st.n}${st.x}`).join(' | ')}${ok ? '' : ' BROKE'}`);
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
    if (sick) {
      sickDays[phase]++;
      if (Sim.count(you, 'dri') < sick.left) { failDays[phase]++; log(s, `d${w.day} went home without medicine (${Sim.count(you, 'dri')}/${want.dri})`); }
      // what left the pack for the medicine (everything spent while someone is sick, minus food/tools bought)
      for (const g of Sim.IDS) if (g !== 'dri' && Sim.count(you, g) < before[g] && g !== 'bog') spend[g] = (spend[g] || 0) + before[g] - Sim.count(you, g);
      for (const g of ['pen', 'zir']) if (w.family.jar[g] < jar0[g]) spend['jar ' + g] = (spend['jar ' + g] || 0) + jar0[g] - w.family.jar[g];
    }
    you.present = false;
    Sim.endDay(w);
    for (const e of w.events) if (e.type === 'died') { deaths.push({ seed: s, who: e.who, night: w.day - 1, cause: e.cause }); log(s, `d${w.day - 1} DIED ${e.name} (${e.cause})`); }
    for (const id in w.family.hp) if (w.family.hp[id] > 0) minHp = Math.min(minHp, w.family.hp[id]);
    if (Sim.critical(w)) critNights++;
    if (w.caveDay && w.day - 1 >= w.caveDay && (w.events.some(e => e.type === 'short' && e.g === 'lum') || Sim.critical(w) || w.events.some(e => e.type === 'died'))) hardN++;
    // still sick when the bogwool was made tonight? (output is decided after the medicine)
    if (w.family.sick) lost[phase] += (you.hunger.ket > 0 || you.hunger.lum >= 2 ? 1 : you.rate) - Sim.outputRate(w);
    if (you.hunger.lum >= 2) tired[phase]++;
    for (const e of w.events) if (e.type === 'sick' || e.type === 'cured' || e.type === 'worse' || e.type === 'nomed' || e.type === 'dose')
      log(s, `d${w.day - 1} ${e.type} ${e.name}${e.price ? ' medicine costs ' + JSON.stringify(e.price) + (e.before != null ? ' (before the cave: ' + e.before + ' pentaja)' : '') : ''}`);
    const k = w.caveDay && w.day > w.caveDay ? 'post' : 'pre';
    nDays[k]++;
    for (const id of ids) if (w.byId[id].hunger.lum > 0) hungry[k][id] = (hungry[k][id] || 0) + 1;
  }
  jarEnd.push(w.family.jar.pen + '/' + w.family.jar.zir);
  hard.push(hardN);
  for (const e of w.family.episodes) (e.afterCave ? ep.post : ep.pre).push({ ...e, spent: spentOn.get(e) || {} });
}
const pct = k => ids.map(id => `${id} ${Math.round(100 * (hungry[k][id] || 0) / Math.max(1, nDays[k]))}%`).join('  ');
console.log(`save: ${save.join(',') || 'nothing'}${paywith.length ? '  pay medicine with: ' + paywith : ''}  set: ${opt.set || '-'}  sick: ${opt.nosick ? 'off' : JSON.stringify(Sim.SICK)}`);
console.log(`hungry before the cave: ${pct('pre')}`);
console.log(`hungry after the cave:  ${pct('post')}`);
console.log(`too hungry to work (2 hungry nights running): ${tired.pre} days before the cave, ${tired.post} after; jar at the end (pen/zir): ${jarEnd.join(' ')}`);
const med = a => { const b = a.filter(x => x != null).sort((x, y) => x - y); return b.length ? b[b.length >> 1] : '-'; };
for (const k of ['pre', 'post']) {
  const E = ep[k], n = E.length;
  if (!n) { console.log(`sick ${k === 'pre' ? 'before' : 'after '} the cave: none`); continue; }
  const avg = f => (E.reduce((s, e) => s + f(e), 0) / n).toFixed(1);
  console.log(`sick ${k === 'pre' ? 'before' : 'after '} the cave: ${n} times, ${avg(e => e.nights)} nights each, ` +
    `cured with medicine ${E.filter(e => e.cured && !e.natural).length}, got over it alone ${E.filter(e => e.natural).length}, ` +
    `died ${E.filter(e => e.died).length}, still sick at the end ${E.filter(e => !e.cured && !e.died).length}, got worse ${E.filter(e => e.worse).length}; ` +
    `went home without the medicine on ${failDays[k]}/${sickDays[k]} sick days; ${lost[k]} bogwool not made`);
  console.log(`  Dov's price for the medicine (${Sim.SICK.DOSES} driftcap): median ${med(E.map(e => e.price && e.price.pen))} pentaja / ${med(E.map(e => e.price && e.price.zir))} zirnet / ${med(E.map(e => e.price && e.price.bog))} bogwool` +
    (k === 'post' ? `; same village before the cave: ${med(E.map(e => e.before))} pentaja` : '') +
    `; per-sickness pentaja prices ${E.map(e => e.price && e.price.pen).join(',')}` +
    `; spent (median): ${[...Sim.IDS, 'jar pen'].map(g => [g, med(E.map(e => e.spent[g] || 0))]).filter(([, v]) => v).map(([g, v]) => v + ' ' + g).join(', ') || '-'}`);
}
const bySeed = new Set(deaths.map(d => d.seed));
console.log(`${opt.lazy ? 'LAZY player' : 'careful player'}, crust to ${opt.crust || 'sick'}: villages with no deaths ${seeds - bySeed.size}/${seeds}; at least one death ${bySeed.size}/${seeds} ` +
  `(${deaths.length} deaths: ${deaths.map(d => `s${d.seed} ${d.who} night ${d.night} ${d.cause}`).join(', ') || '-'})`);
const hist = {}; for (const h of hard) hist[h] = (hist[h] || 0) + 1;
console.log(`hard nights after the cave (hungry, or the sick one down to 1 strength): at least one in ${hard.filter(h => h > 0).length}/${seeds} villages, 1-3 in ${hard.filter(h => h >= 1 && h <= 3).length}/${seeds}; villages by count ${JSON.stringify(hist)}; per village ${hard.map((h, i) => `s${i + 1}:${h}`).join(' ')}`);
console.log(`lowest strength seen among the living: ${minHp}; nights someone was critical (sick, strength 1): ${critNights}`);
console.log(`findRoutes: ${(ms / calls).toFixed(1)} ms per call`);
