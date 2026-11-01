// Robustness check: across many seeds, does pentaja become money, and does the village
// move to zirnet after Wren's cave, before the harvest festival ends the lesson? Mirrors the game:
// the player only trades on autopilot in the afternoon (as with the AUTO DAY button).
// Also: on which day the game's story cards would fire (money, cave, zirnet), and how much
// Gran's jar (Sim.JAR pentaja) buys before the cave and at the festival, in driftcap mushrooms
// (Sim.SICK.DOSES of them cure one sickness). And when the second sickness comes, and how many
// family members an autopilot player (who never opens the jar) loses.
// Usage: node tools/simstats.js [seeds=40] [days=FESTIVAL-1]
const Sim = require('../lessons/01-barter/sim.js');
const seeds = +(process.argv[2] ?? 40), days = +(process.argv[3] ?? Sim.FESTIVAL - 1);
const avg = (H, g) => H.reduce((s, h) => s + h.moneyness[g], 0) / Math.max(1, H.length);
const med = a => { const b = a.filter(isFinite).sort((x, y) => x - y); return b[b.length >> 1]; };
const top = h => Sim.IDS.reduce((a, b) => (h.moneyness[b] > h.moneyness[a] ? b : a));
let penMoney = 0, zirSwitch = 0, zirCard = 0, deadVillages = 0; const rise = [], rows = [], moneyDay = [], caveDay = {}, zirDay = [], jar = [], sick2 = [], deaths = [], medP = []; let third = 0; const thirdNot = [];
for (let s = 1; s <= seeds; s++) {
  const w = Sim.createWorld({ seed: s });
  for (let d = 0; d < days; d++) { Sim.startDay(w); w.playerAuto = true; Sim.endDay(w); w.playerAuto = false; }
  const H = w.history, r = w.caveDay ?? days;
  const pre = H.slice(Math.max(1, r - 4), r), post = H.slice(-5);
  const pp = avg(pre, 'pen'), pz = avg(pre, 'zir'), qp = avg(post, 'pen'), qz = avg(post, 'zir');
  if (pp >= 0.5 && pp > pz) penMoney++;
  if (qz >= 0.5 && qz > qp) zirSwitch++;
  // the game's cards: money on day >= 4 when the top good's 3-day moneyness >= 0.5; zirnet > 2 days after the cave
  // when zirnet's 3-day moneyness beats pentaja's by 0.15 (history[i] is the evening of day i, read the next morning)
  const m3 = (i, g) => avg(H.slice(Math.max(0, i - 2), i + 1), g);
  const md = H.findIndex((h, i) => i >= 3 && m3(i, top(h)) >= 0.5);
  moneyDay.push(md < 0 ? Infinity : md + 1);
  caveDay[w.caveDay] = (caveDay[w.caveDay] || 0) + 1;
  const zd = H.findIndex((h, i) => w.caveDay && i + 1 > w.caveDay + 2 && m3(i, 'zir') > m3(i, 'pen') + 0.15);
  if (zd >= 0) { zirCard++; zirDay.push(zd + 1 - w.caveDay); }
  const price = a => { const v = a.map(h => h.price.pen).filter(x => x != null); return v.reduce((x, y) => x + y, 0) / v.length; };
  rise.push(price(H.slice(-5)) / price(H.slice(1, r)));
  const before = Sim.medPriceBefore(w), now = Sim.medPriceNow(w).pen;
  jar.push(`${Math.floor(Sim.JAR * Sim.SICK.DOSES / before)}→${Sim.jarDoses(w, Sim.medTrend(w), { pen: Sim.JAR, zir: 0 })}`);
  medP.push(`${before}→${Sim.medTrend(w).pen}`);
  if (3 * Sim.jarDoses(w, Sim.medTrend(w), { pen: Sim.JAR, zir: 0 }) <= Math.floor(Sim.JAR * Sim.SICK.DOSES / before)) third++; else thirdNot.push(s);
  const e2 = w.family.episodes[1]; sick2.push(e2 ? e2.since : Infinity);
  if (w.family.dead.length) deadVillages++;
  deaths.push(...w.family.dead.map(d => `s${s}:${d.who}@${d.day}`));
  rows.push(`${s}:${pp.toFixed(1)}/${pz.toFixed(1)}→${qp.toFixed(1)}/${qz.toFixed(1)}`);
}
console.log(rows.join(' '));
console.log(`pentaja is money before the cave: ${penMoney}/${seeds}`);
console.log(`village switches to zirnet by the festival (day ${Sim.FESTIVAL}): ${zirSwitch}/${seeds}; the zirnet card fires in ${zirCard}/${seeds}, median ${med(zirDay)} days after the cave`);
console.log(`money card on day (median) ${med(moneyDay)}; cave on day: ${JSON.stringify(caveDay)}`);
console.log(`lumfruit price rise (×), median: ${med(rise).toFixed(1)}`);
console.log(`second sickness on night (median) ${med(sick2)}: ${sick2.join(',')}`);
console.log(`Gran's jar of ${Sim.JAR} pentaja in mushrooms, before the cave → at the festival (median ${med(jar.map(j => +j.split('→')[0]))} → ${med(jar.map(j => +j.split('→')[1]))}): ${jar.join(' ')}`);
console.log(`Dov's price for the medicine in pentaja, before the cave → at the festival (median ${med(medP.map(j => +j.split('→')[0]))} → ${med(medP.map(j => +j.split('→')[1]))}): ${medP.join(' ')}`);
console.log(`the jar buys at most a third of what it did before the cave in ${third}/${seeds} villages (not in: ${thirdNot.join(',') || '-'})`);
console.log(`autopilot player (no jar, no route finder): someone died in ${deadVillages}/${seeds} villages: ${deaths.join(' ') || '-'}`);
