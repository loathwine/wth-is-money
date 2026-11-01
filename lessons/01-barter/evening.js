/* ============================================================
   EP 01 · Evening at home: what the family says each night.
   All the copy lives here. game.js builds a context from the night's
   events (c) and calls Evening.pick(c), which returns 1-3 lines:
   the two highest triggers that fire tonight (one line or one short
   exchange each), plus a flavour line when fewer than two fired.
   Each speaker talks at most once a night; the dead never speak.
   No pronouns for Wren, ever.
   ============================================================ */
(function (root) {
'use strict';

const NAME = { gran: 'Gran', tam: 'Tam', ola: 'Ola', you: 'You' };

// Each trigger: when(c) → true if it fires; pool: options, each one line { who, text } or an
// exchange [ {…}, {…} ]. who may be 'any' (an adult who is up and about), or 'sick' / 'cured' /
// 'crust' (that person). self: true lets the sick one speak from bed.
const TRIGGERS = [
  { id: 'day1', when: c => c.night === 1 && !c.hungry, pool: [
    [{ who: 'gran', text: 'Lumfruit! You found it. Well done.' }, { who: 'tam', text: 'What did {seller} want for it?' }, { who: 'you', text: '{paid}. No money here: everything is a swap.' }],
  ] },
  { id: 'S1', when: c => c.fellSick && !c.fellSick.afterCave, pool: [
    [{ who: 'ola', text: '{sick} is burning up. We need medicine: driftcap, the floating mushroom Dov sells. Two of them.' },
     { who: 'gran', self: true, text: 'Take crystals from my jar for Dov. That\'s what they\'re for.' }],
    [{ who: 'any', text: '{sick} is burning up. We need medicine: driftcap, the floating mushroom Dov sells. Two of them.' },
     { who: 'tam', text: 'Gran\'s jar can pay Dov! Can\'t it?' }],
  ] },
  { id: 'S1b', when: c => c.fellSick && c.fellSick.afterCave, pool: [
    [{ who: 'any', text: '{sick} has the fever. Two mushrooms from Dov... I hope the jar still covers it.' },
     { who: 'gran', self: true, when: c => c.medLag, text: 'Dov still asks only {med} crystals for the medicine. Go first thing, before Dov catches on.' }],
    [{ who: 'any', text: '{sick} has the fever. Two mushrooms from Dov... I hope the jar still covers it.' },
     { who: 'tam', text: 'Gran\'s jar has {jarPen} crystals. Is that still enough?' }],
  ] },
  { id: 'S2', when: c => c.stillSick && c.noMed && c.sickHp === 1, pool: [
    { who: 'any', text: '{sick} won\'t get through another night like this. Medicine. Tomorrow, whatever it costs.' },
    { who: 'any', text: '{sick} hardly woke today. Two mushrooms from Dov tomorrow, or we lose {sick}.' },
  ] },
  // the jar choice sits high up, so it's never crowded out (it comes once, the evening after the inflation card)
  { id: 'Z1', choice: 'jar', when: c => c.jarAsk, pool: [
    { who: 'ola', text: 'Pentaja buys less every day. Hesk\'s zirnet can\'t be dug up faster. Should we move Gran\'s jar into zirnet?' },
    { who: 'gran', text: 'Hesk finds one zirnet every few days. Nobody can make more. Should my jar go into zirnet?' },
  ] },
  { id: 'S3', when: c => c.stillSick && c.noMed, pool: [
    { who: 'tam', text: '{sick} is still sick. Didn\'t Dov have any mushrooms?' },
    { who: 'any', text: 'No medicine again. {sick} is getting weaker.' },
  ] },
  { id: 'S4', cool: 1, when: c => c.dose && c.stillSick, pool: [
    { who: 'any', text: 'One mushroom down, {left} to go.' },
    { who: 'tam', text: '{sick} ate a floating mushroom! Yuck. {left} more to go.' },
  ] },
  { id: 'S5', when: c => c.cured, pool: [
    { who: 'cured', text: 'I feel like myself again. Thank you.' },
    { who: 'tam', text: '{cured} is better! {cured} is better!' },
  ] },
  { id: 'H2', when: c => c.hungry && c.hungryRun >= 2, pool: [
    { who: 'ola', text: 'Two nights with no food. I can\'t work like this, and neither can you.' },
    { who: 'gran', text: 'Two empty nights. Lumfruit first tomorrow, before anything else.' },
  ] },
  { id: 'H1', when: c => c.hungry, pool: [
    { who: 'crust', when: c => c.crust && c.crust !== c.sickWho, text: 'Thank you for the crust.' },
    { who: 'gran', text: 'We\'ve had lean nights before. Tomorrow, lumfruit first.' },
    { who: 'tam', when: c => c.crust !== 'tam', text: 'My tummy is rumbling.' },
  ] },
  { id: 'C1', when: c => c.caveNight, pool: [
    [{ who: 'tam', text: 'The hill is glowing pink! Hesk says Wren found a cave full of pentaja.' },
     { who: 'gran', text: 'A whole cave of them? Hm. Then they\'re not so rare any more.' }],
  ] },
  { id: 'C2', when: c => c.dayAfterCave, pool: [
    { who: 'gran', text: 'Crystals I waited years for, and Wren digs up ten a day now. Hm.' },
    { who: 'tam', text: 'Wren gave me a pentaja for nothing! Wren has a whole sack.' },
  ] },
  { id: 'P1', cool: 2, when: c => c.price && c.price.rise >= 2, pool: [
    { who: 'ola', text: '{priceLine}' },
    [{ who: 'tam', text: 'Why does fruit cost more crystals now? Is the fruit bigger?' }, { who: 'gran', text: 'No, child. There are just more crystals.' }],
  ] },
  { id: 'P2', cool: 2, when: c => c.jarFell, pool: [
    { who: 'gran', text: 'My jar bought {jarBefore} mushrooms before Wren\'s cave. Now {jarNow}. Same crystals.' },
  ] },
  { id: 'Z2', when: c => c.zirToday, pool: [
    { who: 'ola', text: 'Everyone wants zirnet now. Funny how fast that changed.' },
  ] },
  { id: 'R', when: c => c.refusal, pool: [
    [{ who: 'tam', text: 'Why wouldn\'t {rNpc} take our {rGood}?' }, { who: 'gran', text: '{rNpc} didn\'t need it, love. A swap needs two people who each want what the other has.' }],
  ] },
  { id: 'I', when: c => c.indirect && !c.fellSick, pool: [
    [{ who: 'tam', text: 'You got {iGood}? We can\'t even use that!' }, { who: 'you', text: 'It\'s not for us. Someone else takes it for what we need.' }],
  ] },
  { id: 'M', when: c => c.money, pool: [
    [{ who: 'tam', text: 'Everyone takes pentaja now. You can\'t eat a pentaja! Why?' }, { who: 'gran', text: 'Because they know someone else will take it, child.' }],
  ] },
  { id: 'T', when: c => c.toolsBroke, pool: [
    { who: 'ola', text: 'The tools broke. Without kettlestone from Bob, you\'ll make half the bogwool.' },
    { who: 'gran', text: 'The tools broke again. Bob has kettlestone.' },
  ] },
  { id: 'G', when: c => c.missing, pool: [
    { who: 'tam', text: 'I miss {dead}.' },
    { who: 'any', text: 'We still set a place for {dead}.' },
  ] },
  { id: 'F', flavour: true, when: () => true, pool: [
    { who: 'tam', text: 'Lumfruit again! My favourite.' },
    { who: 'gran', when: c => c.vars.n >= 2, text: '{n} nights to the festival.' },
    { who: 'gran', when: c => c.vars.n === 1, text: 'One more night, then the festival.' },
    { who: 'gran', when: c => c.vars.n <= 0, text: 'The festival is tomorrow. We made it this far.' },
    { who: 'ola', text: 'Fed and warm. That\'s a good day.' },
    { who: 'tam', text: 'When I\'m big I\'ll raise bogwool too.' },
    { who: 'gran', when: c => c.vars.n >= 2, text: 'Eat slowly, Tam. The festival is in {n} nights.' },
  ] },
];

const last = {};   // trigger id → the last option shown (so it isn't repeated next time)
const lastNight = {};   // trigger id → the night it last spoke (cool: nights to wait before it may speak again)

function fill(text, c) { return text.replace(/\{(\w+)\}/g, (_, k) => c.vars[k] != null ? c.vars[k] : ''); }

// Who actually says a line: a family member who is alive, not yet spoken tonight, and up (unless self).
function speaker(l, c, spoken) {
  const ok = id => (id === 'you' || (c.alive[id] && (id !== c.sickWho || l.self || l.who === 'cured'))) && !spoken.has(id);
  if (l.when && !l.when(c)) return null;
  if (l.who === 'any') return ['ola', 'gran', 'tam'].find(ok) || null;   // an adult if one can, else Tam
  const id = l.who === 'sick' ? c.sickWho : l.who === 'cured' ? c.curedWho : l.who === 'crust' ? c.crust : l.who;
  return id && ok(id) ? id : null;
}

function pick(c) {
  if (c.died) return { death: true, lines: deathLines(c) };
  const out = [], spoken = new Set();
  let fired = 0, choice = null;
  for (const T of TRIGGERS) {
    if (fired >= 2 || out.length >= 3) break;
    if (T.flavour && fired) break;
    if (!T.when(c)) continue;
    if (T.cool && lastNight[T.id] != null && c.night - lastNight[T.id] <= T.cool) continue;
    // options whose speakers can all talk; prefer one not shown last time
    const opts = T.pool.map((o, i) => ({ i, lines: [].concat(o) })).filter(o => {
      const s = new Set(spoken), ls = o.lines.filter(l => !l.when || l.when(c));
      return ls.length && ls.every(l => { const id = speaker(l, c, s); if (!id) return false; s.add(id); return true; });
    });
    if (!opts.length) continue;
    const fresh = opts.filter(o => o.i !== last[T.id]);
    const o = (fresh.length ? fresh : opts)[Math.floor(Math.random() * (fresh.length ? fresh : opts).length)];
    last[T.id] = o.i;
    for (const l of o.lines) {
      if (l.when && !l.when(c)) continue;
      if (out.length >= 3) break;
      const id = speaker(l, c, spoken); spoken.add(id);
      out.push({ who: id, name: NAME[id], text: fill(l.text, c) });
    }
    fired++; lastNight[T.id] = c.night;
    if (T.choice) choice = T.choice;
  }
  return { lines: out, choice };
}

// The night someone dies: one line, from the eldest who is left.
function deathLines(c) {
  const d = c.died;
  if (d.who === 'gran' && c.alive.ola) return [{ who: 'ola', name: 'Ola', text: 'Gran\'s chair is empty tonight. Her jar is still on the shelf.' }];
  if (d.who === 'ola' && c.alive.gran) return [{ who: 'gran', name: 'Gran', text: 'Ola\'s place at the table is empty. We\'ll set it anyway, for a while.' }];
  return [{ who: 'tam', name: 'Tam', text: 'It\'s just us now.' }];
}

root.Evening = { TRIGGERS, NAME, pick };
})(typeof window !== 'undefined' ? window : globalThis);
