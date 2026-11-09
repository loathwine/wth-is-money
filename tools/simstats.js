// Robustness check of EP 01's story arc across many villages, with the player on autopilot (trading like a
// local in the afternoon, never opening Gran's jar). Mirrors the game's beats:
//   the money card (w.moneyDay: pentaja steadily taken, or forced on Sim.ARC.CARD_MAX) and which other good
//   it names as passing hand to hand; Gran's reveal that evening; the storm; Wren's cave the morning after it;
//   Aunt Ola's sickness 2 nights after the cave; the festival.
// Also: how much Gran's jar (Sim.JAR pentaja) buys, in driftcap mushrooms (Sim.SICK.DOSES cure one sickness),
// before the cave, when Ola falls sick and at the festival; how far lumfruit's pentaja price rises; and who an
// autopilot player loses (they can't use the jar, so the storm is deadly for them: see routebot.js for real players).
// Usage: node tools/simstats.js [seeds=40] [days=FESTIVAL-1]
const Sim = require('../lessons/01-barter/sim.js');
const seeds = +(process.argv[2] ?? 40), days = +(process.argv[3] ?? Sim.FESTIVAL - 1);
const med = a => { const b = a.filter(isFinite).sort((x, y) => x - y); return b.length ? b[b.length >> 1] : '-'; };
const hist = a => JSON.stringify(a.reduce((o, v) => (o[v] = (o[v] || 0) + 1, o), {}));
const moneyDay = [], steady = [], other = [], reveal = [], storm = [], caveDay = [], olaNight = [], rise = [], jarFest = [], jarOla = [], medP = [], deaths = [];
let third = 0, thirdOla = 0, deadVillages = 0; const thirdNot = [];
const mush = (w, pen) => Sim.jarDoses(w, Sim.medTrend(w), { pen, zir: 0 });
for (let s = 1; s <= seeds; s++) {
  const w = Sim.createWorld({ seed: s });
  let olaDoses = null;
  for (let d = 0; d < days; d++) {
    Sim.startDay(w);
    if (w.moneyDay === w.day) { const n = Sim.moneyNote(w); other.push(n.other || 'none'); }
    w.playerAuto = true; Sim.endDay(w); w.playerAuto = false;
    const sick = w.events.find(e => e.type === 'sick' && e.afterCave);
    if (sick && olaDoses == null) { olaNight.push(w.day - 1); olaDoses = mush(w, Sim.JAR); }
  }
  moneyDay.push(w.moneyDay); steady.push(w.moneySteady ? 1 : 0); reveal.push(w.family.revealDay);
  storm.push(w.storm ? `${w.storm.from}-${w.storm.to}` : '-'); caveDay.push(w.caveDay);
  const H = w.history, r = w.caveDay ?? days;
  const price = a => { const v = a.map(h => h.price.pen).filter(x => x != null); return v.reduce((x, y) => x + y, 0) / v.length; };
  rise.push(price(H.slice(-3)) / price(H.slice(1, r)));
  const before = Sim.medPriceBefore(w), b = Math.floor(Sim.JAR * Sim.SICK.DOSES / before), now = mush(w, Sim.JAR);
  jarFest.push(`${b}→${now}`); if (olaDoses != null) jarOla.push(`${b}→${olaDoses}`);
  medP.push(`${before}→${Sim.medTrend(w).pen}`);
  if (3 * now <= b) third++; else thirdNot.push(s);
  if (olaDoses != null && 3 * olaDoses <= b) thirdOla++;
  if (w.family.dead.length) deadVillages++;
  deaths.push(...w.family.dead.map(d => `s${s}:${d.who}@${d.day}${d.cause === 'storm' ? '(storm)' : ''}`));
}
console.log(`money card on day (median) ${med(moneyDay)}: ${hist(moneyDay)}; pentaja steadily taken by then in ${steady.reduce((a, b) => a + b, 0)}/${seeds} (else it comes on day ${Sim.ARC.CARD_MAX} anyway)`);
console.log(`  the other good the card names as passing hand to hand: ${hist(other)}`);
console.log(`Gran's reveal on night ${hist(reveal)}; storm market days ${hist(storm)}; cave on day ${hist(caveDay)}; Ola falls sick on night ${hist(olaNight)} (${olaNight.length}/${seeds} villages: autopilot families may have lost Ola already)`);
console.log(`lumfruit's pentaja price, last 3 days vs before the cave (×), median ${med(rise).toFixed(1)}`);
console.log(`Dov's medicine in pentaja, before the cave → at the festival (median ${med(medP.map(j => +j.split('→')[0]))} → ${med(medP.map(j => +j.split('→')[1]))}): ${medP.join(' ')}`);
console.log(`Gran's ${Sim.JAR} pentaja in mushrooms, before the cave → the night Ola falls sick (median ${med(jarOla.map(j => +j.split('→')[0]))} → ${med(jarOla.map(j => +j.split('→')[1]))}): a third or less in ${thirdOla}/${jarOla.length}`);
console.log(`Gran's ${Sim.JAR} pentaja in mushrooms, before the cave → at the festival (median ${med(jarFest.map(j => +j.split('→')[0]))} → ${med(jarFest.map(j => +j.split('→')[1]))}): ${jarFest.join(' ')}`);
console.log(`the jar buys at most a third of what it did before the cave, at the festival, in ${third}/${seeds} villages (not in: ${thirdNot.join(',') || '-'})`);
console.log(`autopilot player (never opens the jar): someone died in ${deadVillages}/${seeds} villages: ${deaths.join(' ') || '-'}`);
