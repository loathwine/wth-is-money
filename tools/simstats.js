// Robustness check: across many seeds, does pentaja become money, and does the village
// move to zirnet after Rod's cave? Mirrors the game: the player only trades on autopilot
// in the afternoon (as with the AUTO DAY button).
// Usage: node tools/simstats.js [seeds=40] [days=32]
const Sim = require('../lessons/01-barter/sim.js');
const seeds = +(process.argv[2] ?? 40), days = +(process.argv[3] ?? 32);
const avg = (H, g) => H.reduce((s, h) => s + h.moneyness[g], 0) / Math.max(1, H.length);
const med = a => { const b = a.filter(isFinite).sort((x, y) => x - y); return b[b.length >> 1]; };
let penMoney = 0, zirSwitch = 0; const rise = [], rows = [];
for (let s = 1; s <= seeds; s++) {
  const w = Sim.createWorld({ seed: s });
  for (let d = 0; d < days; d++) { Sim.startDay(w); w.playerAuto = true; Sim.endDay(w); w.playerAuto = false; }
  const r = w.rodDay ?? days;
  const pre = w.history.slice(Math.max(1, r - 6), r), post = w.history.slice(-6);
  const pp = avg(pre, 'pen'), pz = avg(pre, 'zir'), qp = avg(post, 'pen'), qz = avg(post, 'zir');
  if (pp >= 0.5 && pp > pz) penMoney++;
  if (qz >= 0.5 && qz > qp) zirSwitch++;
  const price = a => { const v = a.map(h => h.price.pen).filter(x => x != null); return v.reduce((x, y) => x + y, 0) / v.length; };
  rise.push(price(w.history.slice(-8)) / price(w.history.slice(1, r)));
  rows.push(`${s}:${pp.toFixed(1)}/${pz.toFixed(1)}→${qp.toFixed(1)}/${qz.toFixed(1)}`);
}
console.log(rows.join(' '));
console.log(`pentaja is money before the cave: ${penMoney}/${seeds}`);
console.log(`village switches to zirnet after: ${zirSwitch}/${seeds}`);
console.log(`lumfruit price rise (×), median: ${med(rise).toFixed(1)}`);
