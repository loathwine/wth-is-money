// Headless run of the barter village. Usage: node tools/simrun.js [seed] [days] [--many N]
const Sim = require('../lessons/01-barter/sim.js');
const args = process.argv.slice(2);
const many = args.includes('--many') ? +args[args.indexOf('--many') + 1] : 0;
const days = +(args[1] ?? 40);
const short = { lum: 'L', bog: 'B', ket: 'K', snm: 'S', dri: 'D', pen: 'P', zir: 'Z' };

function run(seed, verbose) {
  const w = Sim.createWorld({ seed, playerAuto: true });
  for (let d = 0; d < days; d++) {
    Sim.startDay(w); Sim.endDay(w);
    const s = w.history[w.history.length - 1];
    if (verbose) {
      const m = Sim.IDS.map(g => short[g] + ':' + s.moneyness[g].toFixed(2)).join(' ');
      const p = s.price.pen != null ? s.price.pen.toFixed(2) : '  - ';
      const z = s.price.zir != null ? s.price.zir.toFixed(2) : '  - ';
      const hunger = w.agents.filter(a => Object.values(a.hunger).some(h => h > 0)).map(a => a.id).join(',');
      const med = Sim.IDS.map(g => short[g] + s.medium[g]).join(' ');
      console.log(`d${String(s.day).padStart(2)} ${m}  L/P ${p} L/Z ${z} med[${med}] ${w.rodDay === s.day + 1 ? 'ROD!' : ''} short:${hunger}`);
    }
  }
  return w;
}

if (many) {
  const tally = {}, at = {};
  for (let s = 1; s <= many; s++) {
    const w = run(s, false);
    const pre = w.history[Math.min(w.history.length - 1, (w.rodDay ?? days) - 1)];
    const fin = w.history[w.history.length - 1];
    const top = g => Sim.IDS.reduce((a, b) => (g.moneyness[b] > g.moneyness[a] ? b : a));
    const k = top(pre) + '→' + top(fin);
    tally[k] = (tally[k] || 0) + 1;
    at[w.rodDay] = (at[w.rodDay] || 0) + 1;
  }
  console.log('winner before Rod → after:', tally);
  console.log('rod day:', at);
} else run(+(args[0] ?? 7), true);
