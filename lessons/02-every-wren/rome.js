/* EP 02 · Chapter 5 minigame: The Emperor's Mint (see rome.DESIGN.md).
   Ten pay days, AD 14 → 270. Hold MINT to pay the legions; out of silver? add copper. Prices catch up a year later,
   and Marcus, a retired soldier, watches his 3,000 coins buy less bread every year. AD 301: fix prices by law.
   Game model: each year's silver makes one melt, so a copper tap thins every coin of that year (simpler than real mints). */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#mint-cv"), g = cv.getContext("2d"), ui = $("#game-ui"), ctl = $("#controls");
  const params = new URLSearchParams(location.search);
  const _ = null;
  const BASS = [62, 58, 60, 57];   // D minor march (Dm Bb C A), the video's melody a bit faster
  Chip.SONGS.rome = { bpm: 120, style: "island", chords: BASS.slice(), melody: [[74, _, 74, 72, 70, _, 69, _], [70, _, 69, 67, 65, _, _, _], [67, _, 69, 70, 72, _, 70, _], [69, _, _, 65, 62, _, _, _]] };

  // Real events; g (how much the army costs) and the soldier counts are game values.
  const YEARS = [
    { ad: 14, ev: "Augustus: coins 98% silver", g: 1, n: 6 },
    { ad: 64, ev: "Great Fire of Rome", g: 1, n: 6 },
    { ad: 84, ev: "Domitian raises pay by a third", g: 1.2, n: 6 },
    { ad: 170, ev: "Plague and war on the Danube", g: 1.3, n: 7 },
    { ad: 197, ev: "Severus showers the army with money", g: 1.4, n: 7 },
    { ad: 212, ev: "Caracalla raises army pay again", g: 1.5, n: 8 },
    { ad: 238, ev: "Six emperors in one year", g: 1.6, n: 8 },
    { ad: 251, ev: "Plague", g: 1.6, n: 9 },
    { ad: 260, ev: "Emperor Valerian captured by Persia", g: 1.8, n: 9 },
    { ad: 270, ev: "Aurelian: war on every border", g: 1.9, n: 10 },
  ];
  const SILVER = 60, FILL = 2.0, WINDOW = 4.0, CARD = 0.8, BEAT = 1.1, TIPBEAT = 2.8, JAR = 3000;
  const PHONE = Ep02.PHONE;

  const S = { phase: "idle", y: 0, pt: 0, t: 0, p: 98, price: 1, paid: 0, bill: 60, cap: 60, hold: false, anger: 0, met: 0, taps: 0, score: 0, best: 0,
    tip: null, tips: {}, hidden: 0, loaves: 32, fx: [], parts: [], prevPrice: 1, mutinyAt: 0, history: [], clinkAt: 0, flash: -9 };
  try { S.best = +localStorage.getItem("wth-ep02-rome-best") || 0; } catch {}

  /* ---------- layout: three 180×100 zones; phones in portrait stack them, everything else puts the market on the right ---------- */
  const K = 3;   // backing pixels per game pixel: crisp pixel art and crisp text
  let L = null;
  function layout() {
    const portrait = document.body.classList.contains("playing") && innerHeight > innerWidth;
    if (L && L.portrait === portrait) return;
    const w = portrait ? 180 : 360, h = portrait ? 320 : 200;
    cv.width = w * K; cv.height = h * K; cv.classList.toggle("tall", portrait);
    L = portrait ? { portrait, w, h, hud: { x: 0, y: 0 }, camp: { x: 0, y: 20 }, mint: { x: 0, y: 120 }, market: { x: 0, y: 220 } }
      : { portrait, w, h, info: { x: 180, y: 0 }, camp: { x: 0, y: 0 }, mint: { x: 0, y: 100 }, market: { x: 180, y: 100 } };
  }

  /* ---------- drawing kit (game pixels) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const mixHex = (a, b, k) => { const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); return "#" + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), clamp(k, 0, 1))).toString(16).padStart(2, "0")).join(""); };
  function txt(s, x, y, size, color, o = {}) {
    g.save(); g.globalAlpha *= o.alpha ?? 1;
    g.font = o.body ? `700 ${size}px 'Space Grotesk'` : `${size}px Silkscreen`;
    g.textAlign = o.align || "center"; g.textBaseline = "middle";
    if (o.shadow !== false) { g.fillStyle = "rgba(0,0,0,.6)"; g.fillText(s, x + 0.6, y + 0.6); }
    g.fillStyle = color; g.fillText(s, x, y); g.restore();
  }
  function wrap(s, maxW, size, body = true) {
    g.font = body ? `700 ${size}px 'Space Grotesk'` : `${size}px Silkscreen`;
    const out = []; let line = "";
    for (const w of s.split(" ")) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    return line ? [...out, line] : out;
  }
  function disc(cx, cy, r, c, sx = 1) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(Math.max(0, r * r - y * y + r * 0.6)) * sx); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  // a coin coloured by its silver (98 = white silver … ~1 = copper)
  function coin(cx, cy, r, p, sx = 1) {
    const m = Math.pow(clamp((98 - p) / 94, 0, 1), 0.8);
    disc(cx, cy, r, mixHex("#7c8596", "#6e3517", m), sx); disc(cx, cy, r - Math.max(1, Math.round(r / 7)), mixHex("#d7dde8", "#c0652f", m), sx);
    if (r >= 6 && sx > 0.3) { const u = Math.max(1, Math.round(r / 9)), rel = mixHex("#9aa3b5", "#8e4722", m); px(cx - 2 * u * sx, cy - 4 * u, 4 * u * sx, 5 * u, rel); px(cx + 2 * u * sx, cy - 2 * u, u * sx, u, rel); px(cx - 3 * u * sx, cy + u, 6 * u * sx, 3 * u, rel); px(cx - 2 * u * sx, cy - 5 * u, 4 * u * sx, u, "#8a9a3a"); }
    else px(cx - sx, cy - 1, Math.max(1, sx), 1, mixHex("#ffffff", "#f0a870", m));
  }
  function roman(x, feet, o = {}) {
    const f = o.face || 1, t = o.t || 0, bob = o.walk ? Math.floor(t * 8) % 2 : 0, sk = "#c68a5c", sk2 = "#9c6640";
    x = Math.round(x); feet = Math.round(feet);
    px(x - 3, feet - 1, 7, 1, "rgba(0,0,0,.3)");
    px(x - 2, feet - 4 - bob, 1, 3, sk2); px(x + 1, feet - 4 - (o.walk ? 1 - bob : 0), 1, 3, sk2);
    px(x - 2, feet - 11, 4, 7, o.tunic || "#d8cdb0");
    px(x - 2, feet - 15, 4, 4, sk); px(x - 2, feet - 16, 4, 1, o.hair || "#2a1a10");
    px(x + (f > 0 ? 1 : -2), feet - 14, 1, 1, "#1a1010"); px(x + (f > 0 ? 2 : -3), feet - 13, 1, 1, sk);
    if (o.beard) { px(x - 2, feet - 12, 4, 1, o.beard); px(x + (f > 0 ? 0 : -1), feet - 11, 2, 1, o.beard); }
    if (o.helmet) { px(x - 2, feet - 7, 4, 1, "#5e3b1a"); px(x - 3, feet - 17, 6, 2, o.angry ? "#ff5a5a" : "#9aa3b5"); px(x - 2, feet - 18, 4, 1, o.angry ? "#ff5a5a" : "#9aa3b5"); px(x - 1, feet - 20, 2, 2, "#c0392b"); }
    if (o.arm === "up") px(x + (f > 0 ? 2 : -3), feet - 15 - (Math.floor(t * 6) % 2), 1, 4, sk); else px(x + (f > 0 ? 2 : -3), feet - 10, 1, 4, sk);
    if (o.shield) { px(x + 1, feet - 12, 4, 9, "#a8281e"); px(x + 1, feet - 12, 4, 1, "#ffd23f"); px(x + 2, feet - 9, 2, 2, "#ffd23f"); }
    if (o.sack) { px(x + (f > 0 ? -6 : 3), feet - 14, 4, 5, "#b89a64"); }
  }
  function loaf(x, y) { px(x, y + 1, 5, 2, "#c07a35"); px(x + 1, y, 3, 1, "#e2a75c"); }
  function jar(x, base) {
    for (let y = 0; y < 14; y++) { const hw = Math.round(Math.sin((y + 2) / 16 * Math.PI) * 8); px(x - hw, base - 14 + y, hw * 2, 1, y % 5 === 2 ? "#8a3e1f" : "#b5562f"); }
    px(x - 4, base - 17, 8, 3, "#8a3e1f"); for (let i = 0; i < 3; i++) px(x - 3 + i * 2, base - 18, 2, 1, "#c9d0dc");
  }
  function zone(z, fn) { g.save(); g.translate(z.x, z.y); g.beginPath(); g.rect(0, 0, 180, 100); g.clip(); fn(); g.restore(); }

  /* ---------- the model ---------- */
  const yr = () => YEARS[Math.min(S.y, YEARS.length - 1)];
  const capacity = () => SILVER * 98 / S.p;              // coins this year's silver makes at the current purity
  const owed = () => Math.max(0, S.bill - S.paid);
  const isOut = () => S.phase === "mint" && owed() > 0.01 && S.paid >= capacity() - 0.01;
  const days = (price) => Math.floor(JAR / price);
  function bread(d) {
    d = Math.floor(d);
    if (d >= 730) return `${Math.floor(d / 365)} YEARS`;
    if (d >= 365) return "1 YEAR";
    if (d >= 14) return `${Math.round(d / 7)} WEEKS`;
    if (d >= 2) return `${d} DAYS`;
    return d === 1 ? "1 DAY" : "LESS THAN A DAY";
  }
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pct = (p) => (p >= 10 ? Math.round(p) : p >= 1 ? p.toFixed(1) : p.toFixed(2)) + "%";

  function startYear() {
    const Y = yr();
    S.phase = "card"; S.pt = 0; S.paid = 0; S.bill = Math.round(SILVER * Y.g * S.price); S.metAt = 0; S.short = false;
    Chip.sfx("pop");
  }
  function copper() {
    if (S.phase !== "card" && S.phase !== "mint") return;
    S.p *= 0.8; S.taps++; S.flash = S.t;
    Chip.sfx("thud");
    Chip.SONGS.rome.chords = BASS.map((c) => c - Math.min(6, S.taps));   // each melt sounds a bit cheaper
    if (!S.tips.gresham) tip("gresham", "People hide the old silver coins and spend your new ones.");
    S.hidden = Math.min(12, S.hidden + 3);
  }
  function tip(key, str) { S.tips[key] = true; S.tip = { str, at: S.t }; }
  function endYear() {
    const met = S.paid >= S.bill - 0.01;
    if (met) { S.met++; S.score += 100; } else { S.anger++; Chip.sfx("sad"); }
    S.history.push({ ad: yr().ad, p: S.p, met });
    S.prevPrice = S.price; S.price = 98 / S.p;   // prices catch up next year
    if (S.price > S.prevPrice * 1.01 && !S.tips.rise) tip("rise", "Same bread, thinner coins, higher price. That's inflation.");
    S.phase = "beat"; S.pt = 0; S.beatLen = S.tip && S.t - S.tip.at < 0.2 ? TIPBEAT : BEAT;
    if (S.anger >= 3) { S.mutinyAt = yr().ad; S.phase = "mutiny"; S.pt = 0; Chip.sfx("thud"); }
  }
  // after a mutiny, a successor adds "just enough" copper for the rest of the years
  function successor() {
    while (++S.y < YEARS.length) {
      S.bill = Math.round(SILVER * yr().g * S.price);
      while (capacity() < S.bill) S.p *= 0.8;
      S.history.push({ ad: yr().ad, p: S.p, met: true, ff: true });
      S.price = 98 / S.p;
    }
  }

  /* ---------- UI panels and controls ---------- */
  function panel(html) { ui.innerHTML = html ? `<div class="panel">${html}</div>` : ""; }
  function controls(kind) {
    ctl.hidden = kind === "none";
    if (kind === "play") {
      ctl.innerHTML = `<button class="ctl copper" id="b-copper">+ COPPER<small>${PHONE ? "out of silver? tap" : "key C"}</small></button>
        <button class="ctl mint" id="b-mint">HOLD TO MINT<small>${PHONE ? "keep your thumb on it" : "hold Space"}</small></button>`;
      const m = $("#b-mint");
      m.addEventListener("pointerdown", (e) => { e.preventDefault(); S.hold = true; try { m.setPointerCapture(e.pointerId); } catch {} });
      for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) m.addEventListener(ev, () => { S.hold = false; });
      m.addEventListener("contextmenu", (e) => e.preventDefault());
      $("#b-copper").addEventListener("pointerdown", (e) => { e.preventDefault(); copper(); });
    } else if (kind === "finale") {
      ctl.innerHTML = `<button class="ctl honest" disabled>MAKE COINS HONEST AGAIN<small>you'd need ${fmt(98 / S.p)}× more silver</small></button>
        <button class="ctl fix" id="b-fix">FIX PRICES BY LAW<small>${PHONE ? "tap" : "key F"}</small></button>`;
      $("#b-fix").onclick = fix;
    }
  }
  function startPanel() {
    S.phase = "idle";
    controls("none");
    panel(`<h3>THE EMPEROR'S MINT</h3>
      <p>You are the emperor. Pay your soldiers every year, <b>AD 14 to 270</b>.</p>
      <p><b>Hold MINT</b> to strike coins. Out of silver? Tap <b>+ COPPER</b>: thinner coins, more of them.</p>
      <p class="muted">Keep an eye on Marcus, a retired soldier, and his jar of 3,000 coins.</p>
      <div class="row"><button class="btn" id="b-start">START</button></div>
      ${S.best ? `<p class="muted">Best score: ${fmt(S.best)}</p>` : ""}`);
    $("#b-start").onclick = start;
  }
  function playing(on) {   // phones: the game fills the screen (portrait or sideways, both work)
    if (!PHONE) return;
    document.body.classList.toggle("playing", on);
    const el = $("#game");
    try {
      if (on && el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {}
  }
  function start() {
    Object.assign(S, { y: 0, p: 98, price: 1, prevPrice: 1, anger: 0, met: 0, taps: 0, score: 0, tip: null, tips: {}, hidden: 0, loaves: 32, fx: [], parts: [], mutinyAt: 0, history: [], hold: false });
    Chip.SONGS.rome.chords = BASS.slice();
    panel(""); playing(true); controls("play");
    if (!document.body.classList.contains("playing")) $("#game").scrollIntoView({ behavior: "smooth", block: "center" });
    Chip.song(Chip.SONGS.rome);
    startYear();
  }
  const MAXP = () => { const n = Math.round(S.price); return n >= 20 ? 10 : Math.max(1, Math.floor(n / 2)); };
  function finale() {
    S.phase = "finale"; S.pt = 0; S.hold = false;
    controls("finale"); Chip.song(Chip.SONGS.mystery);
  }
  function fix() {
    if (S.phase !== "finale") return;
    S.phase = "edict"; S.pt = 0; controls("none"); Chip.sfx("thud");
  }
  function finish() {
    playing(false);
    S.phase = "result"; controls("none");
    const mutiny = !!S.mutinyAt, n = Math.round(S.price), d = days(S.price);
    if (!mutiny) S.score += d;
    if (S.score > S.best) { S.best = S.score; try { localStorage.setItem("wth-ep02-rome-best", S.best); } catch {} }
    const money = (100 / n).toFixed(2);
    const marcus = `<p>Marcus's 3,000 coins: <b>8 years of bread → <span class="${d < 30 ? "bad" : "gold"}">${bread(d).toLowerCase()}</span></b>.${d < 1 ? " You paid him in coins you made worthless." : " Nobody stole a coin."}</p>`;
    panel(`<h3>${mutiny ? `MUTINY, AD ${S.mutinyAt}` : "ALL LEGIONS PAID, AD 14–270"}</h3>
      ${mutiny ? `<p>Your coins stayed honest, so the soldiers went unpaid and picked a new emperor. That happened to many real emperors of this era.</p>
        <p>Your successor added the copper for you:</p>` : ""}
      <div class="facts">
        <div><b>SILVER IN THE COIN</b>98% → <span class="bad">${pct(S.p)}</span><i>Real Rome by 270: under 5%</i></div>
        <div><b>ONE LOAF</b>1 coin → <span class="bad">${fmt(n)} coins</span><i>Real Egypt: wheat 8 → 300 drachmas a sack (AD 100 → 293)</i></div>
      </div>
      ${marcus}
      <p>Then you capped prices by law, and <b>the bread disappeared</b>.</p>
      <p class="irl"><b>In real life:</b> when prices rise ${fmt(n)}×, €100 kept in a drawer buys what €${money} used to.</p>
      <p class="score">SCORE <b>${fmt(S.score)}</b> · best ${fmt(S.best)}<span class="muted"> (${S.met} pay days × 100${mutiny ? "; Marcus only counts if you reach AD 270" : ` + ${fmt(d)} days of Marcus's bread`})</span></p>
      <p class="muted small">Game numbers: 60 silver a year, a loaf at 1 coin, prices catching up in one year. Real: under Augustus a veteran's bonus of 3,000 denarii was 13 years of a soldier's pay; on Diocletian's price list of 301 it was 120 days of a farmhand's wage (plus meals).</p>
      <div class="row"><button class="btn ghost" id="b-again">${mutiny ? "TRY AGAIN" : "PLAY AGAIN"}</button><button class="btn" id="b-done">CONTINUE</button></div>`);
    $("#b-again").onclick = () => { Chip.sfx("pop"); start(); };
    $("#b-done").onclick = () => { panel(""); S.phase = "done"; Chip.stop(); revealWren(); };
    Chip.sfx(mutiny || d < 30 ? "sad" : "chime");
    setTimeout(() => ui.scrollIntoView({ behavior: "smooth", block: PHONE ? "start" : "center" }), 60);
  }
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false;
    const c = $("#wren-portrait"), x = c.getContext("2d");
    Art.drawPortrait(c, "wren", 0);
    x.fillStyle = "#b8c23a"; for (const [a, b, w, h] of [[4, 6, 2, 1], [3, 7, 1, 2], [14, 6, 2, 1], [16, 7, 1, 2]]) x.fillRect(a, b, w, h);
    x.fillStyle = "#ffd23f"; x.fillRect(6, 5, 2, 1); x.fillRect(12, 5, 2, 1);
    const nx = Ep02.next();
    $("#wren-next").innerHTML = nx ? `Next: <a href="${nx.href}">${nx.name}</a>` : "Next: is there money with no cave? <span class=\"pixel\">(coming soon)</span>";
    Ep02.done("rome");
    $("#wren-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- input ---------- */
  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (e.target.closest?.("button") && (k === " " || k === "enter") && S.phase !== "mint" && S.phase !== "card") return;   // let buttons click
    if (k === " " && (S.phase === "card" || S.phase === "mint" || S.phase === "beat")) { S.hold = true; e.preventDefault(); }
    if ((k === "c" || k === "arrowdown") && !e.repeat) { copper(); if (S.phase === "mint" || S.phase === "card") e.preventDefault(); }
    if ((k === "f" || k === "enter") && S.phase === "finale") { fix(); e.preventDefault(); }
  });
  addEventListener("keyup", (e) => { if (e.key === " ") S.hold = false; });
  addEventListener("blur", () => { S.hold = false; });
  addEventListener("resize", () => layout());

  /* ---------- simulation ---------- */
  function update(dt) {
    S.t += dt; S.pt += dt;
    const Y = yr();
    if (S.phase === "card" && S.pt >= CARD) { S.phase = "mint"; S.pt = 0; }
    else if (S.phase === "mint") {
      if (S.hold && owed() > 0 && !isOut() && !S.metAt) {
        const amt = Math.min(S.bill / FILL * dt, owed(), capacity() - S.paid);
        S.paid += amt;
        S.spawn = (S.spawn || 0) + amt * Math.min(1, 40 / S.bill);
        while (S.spawn >= 1) { S.spawn--; S.parts.push({ born: S.t, i: Math.floor(Math.random() * Y.n), dx: Math.random() * 10 - 5 }); }
        if (S.t - S.clinkAt > 0.09) { S.clinkAt = S.t; Chip.sfx("clink"); }
      }
      if (!S.metAt && S.paid >= S.bill - 0.01) { S.paid = S.bill; S.metAt = S.pt; Chip.sfx("chime"); }
      if (isOut() && !S.outAt) { S.outAt = S.t; Chip.sfx("pop"); }
      if (!isOut()) S.outAt = 0;
      if ((S.metAt && S.pt - S.metAt > 0.45) || S.pt >= WINDOW) endYear();
    } else if (S.phase === "beat") {
      // the market reacts: loaves pop off Marcus's shelf
      const want = Math.round(32 * clamp(days(S.price) / JAR, 0, 1));
      if (S.loaves > want && S.pt > 0.25 && S.t - (S.popAt || 0) > 0.06) { S.loaves--; S.popAt = S.t; S.fx.push({ born: S.t, i: S.loaves }); if (S.loaves % 3 === 0) Chip.sfx("pop"); }
      if (S.pt >= S.beatLen) { S.y++; if (S.y >= YEARS.length) finale(); else startYear(); }
    } else if (S.phase === "mutiny" && S.pt > 2.4) { successor(); S.loaves = Math.round(32 * clamp(days(S.price) / JAR, 0, 1)); finale(); }
    else if (S.phase === "edict") {
      const k = Math.floor((S.pt - 1.6) / 0.55);
      if (k >= 0 && k < 4 && k !== S.lastBaker) { S.lastBaker = k; Chip.sfx("pop"); }
      if (S.pt > 0.6 && !S.cheered) { S.cheered = true; Chip.sfx("chime"); }
      if (S.pt > 8.5) finish();
    }
    if (S.phase !== "edict") { S.lastBaker = -1; S.cheered = false; }
    S.parts = S.parts.filter((q) => S.t - q.born < 0.5);
    S.fx = S.fx.filter((q) => S.t - q.born < 0.6);
  }

  /* ---------- drawing ---------- */
  function camp(t) {
    const Y = yr(), n = Y.n;
    px(0, 0, 180, 62, "#d9c9a0"); px(0, 40, 180, 22, "#cdbb8e");
    for (const tx of [20, 150]) { for (let i = 0; i < 12; i++) px(tx - i, 40 + i, i * 2 + 1, 1, i % 3 ? "#e8e0c8" : "#c8bfa5"); px(tx - 1, 46, 3, 6, "#6b4a2a"); }
    px(0, 62, 180, 38, "#a39878"); for (let i = 0; i < 20; i++) px(hash(i) * 180, 64 + hash(i + 5) * 34, 2, 1, "#8c8166");
    const sp = Math.min(17, 168 / n), x0 = 90 - sp * (n - 1) / 2, frac = S.bill ? S.paid / S.bill : 0;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * sp, f = clamp(frac * n - i, 0, 1), angry = S.phase === "beat" && S.history.length && !S.history[S.history.length - 1].met;
      g.save(); g.translate(Math.round(x), 94); g.scale(2, 2);
      roman(0, 0, { t: t + i, tunic: "#a8281e", helmet: true, shield: true, arm: f >= 1 ? "up" : null, angry });
      g.restore();
      px(x - 5, 46, 10, 3, "#1a1026"); px(x - 5, 46, 10 * f, 3, f >= 1 ? "#8fd16a" : "#ffd23f");
    }
    for (const q of S.parts) { const k = (S.t - q.born) / 0.5, x = x0 + q.i * sp + q.dx * (1 - k); coin(x, lerp(110, 50, k) - Math.sin(k * Math.PI) * 6, 2, S.p); }
    // year card
    const ka = S.phase === "card" ? clamp(S.pt / 0.25, 0, 1) : 1, off = (1 - ka) * -60;
    txt("AD " + Y.ad, 6 + off, 9, 10, "#ffd23f", { align: "left" });
    txt(Y.ev, 6 + off, 21, 7, "#1a1026", { align: "left", body: true, shadow: false });
    txt(`PAY DAY: ${fmt(Math.floor(S.paid))} / ${fmt(S.bill)} COINS`, 174, 33, 6, "#1a1026", { align: "right", shadow: false });
    for (let i = 0; i < 3; i++) { const c = i < S.anger ? "#ff5a5a" : "rgba(26,16,38,.25)"; px(150 + i * 9, 4, 6, 3, c); px(151 + i * 9, 3, 4, 1, c); px(152 + i * 9, 1, 2, 2, i < S.anger ? "#c0392b" : "rgba(26,16,38,.25)"); }
    if (S.anger) txt("ANGRY", 176, 13, 5, "#a8281e", { align: "right", shadow: false });
    if (S.phase === "mint" && !S.metAt) { const k = 1 - S.pt / WINDOW; px(0, 98, 180 * k, 2, k < 0.3 ? "#ff5a5a" : "#ffd23f"); }
    if (S.metAt) txt("PAID!", 90, 60, 12, "#8fd16a");
    if (S.phase === "beat" && S.history.length && !S.history[S.history.length - 1].met) txt("NOT PAID! SOLDIERS ANGRY", 90, 60, 8, "#ff5a5a");
    if (S.phase === "mutiny") { px(0, 0, 180, 100, "rgba(120,0,0,.55)"); txt("MUTINY!", 90, 44, 16, "#fff"); txt("the soldiers pick a new emperor", 90, 62, 7, "#fff", { body: true }); }
  }
  function mint(t) {
    px(0, 0, 180, 100, "#5a1f24"); for (let y = 10; y < 100; y += 22) px(0, y, 180, 1, "#4a181d");
    // the silver vat: what's left of this year's silver
    const left = clamp(1 - S.paid / capacity(), 0, 1), out = isOut();
    px(10, 30, 26, 52, "#1a1026"); px(12, 32, 22, 48, "#3a2d24"); px(12, 32 + 48 * (1 - left), 22, 48 * left, "#d7dde8"); px(12, 32 + 48 * (1 - left), 3, 48 * left, "#ffffff");
    txt("SILVER", 23, 24, 6, "#f4ecff");
    txt(`${fmt(capacity() - S.paid)} COINS'`, 23, 88, 5, "#a99cc8"); txt("WORTH LEFT", 23, 94, 5, "#a99cc8");
    // the big coin: spins while minting, flashes on a copper tap
    const spin = S.hold && S.phase === "mint" && !out && !S.metAt ? Math.abs(Math.cos(t * 9)) : 1, fl = S.t - S.flash < 0.3;
    coin(88, 48, 18, S.p, Math.max(0.15, spin));
    if (fl) disc(88, 48, 20, "rgba(255,138,58,.45)");
    txt("SILVER IN EACH COIN", 88, 76, 6, "#a99cc8");
    txt(pct(S.p), 88, 88, 11, S.p > 90 ? "#e6ebf2" : S.p > 30 ? "#ffd23f" : "#ff8a3a");
    // will the silver cover the pay day?
    const need = Math.ceil(owed()), can = Math.floor(capacity() - S.paid + 0.01), short = can < need;
    txt("STILL OWED", 148, 24, 6, "#a99cc8"); txt(fmt(need), 148, 36, 11, short ? "#ff5a5a" : "#f4ecff");
    txt("SILVER FOR", 148, 52, 6, "#a99cc8"); txt(fmt(can), 148, 64, 11, short ? "#ff5a5a" : "#8fd16a");
    if (short && (S.phase === "mint" || S.phase === "card")) {
      const blink = Math.floor(t * 4) % 2;
      if (out) { px(48, 4, 84, 14, "#1a1026"); txt("OUT OF SILVER!", 90, 11, 8, blink ? "#ff5a5a" : "#ffd23f"); }
      txt(out ? "TAP + COPPER" : "NOT ENOUGH SILVER", 177, 85, 6, blink || !out ? "#ffd23f" : "#ff8a3a", { align: "right" });
    }
  }
  function market(t, h = 100) {
    const top = h - 100;
    px(0, 0, 180, h - 38, "#bfe3f7"); px(0, h - 38, 180, 38, "#cdbb8e");
    // the bread stall and its price tag
    const sx = 30, base = top + 84, p = S.phase === "beat" ? lerp(S.prevPrice, S.price, clamp((S.pt - 0.1) / 0.5, 0, 1)) : S.price;
    px(sx - 18, base - 30, 2, 30, "#5e3b1a"); px(sx + 16, base - 30, 2, 30, "#5e3b1a");
    for (let i = 0; i < 9; i++) px(sx - 20 + i * 4, base - 34, 4, 6, i % 2 ? "#c0392b" : "#f2ead6");
    roman(sx, base - 8, { t, tunic: "#e8e0c8" });
    px(sx - 18, base - 10, 36, 10, "#8a5a2b"); for (let i = 0; i < 5; i++) loaf(sx - 15 + i * 6, base - 13);
    // hidden old silver coins in a pot under the stall (Gresham)
    if (S.hidden) { px(sx - 26, base - 4, 8, 5, "#8a3e1f"); for (let i = 0; i < Math.min(5, S.hidden); i++) px(sx - 25 + i * 1.5, base - 5 - (i % 2), 2, 1, "#e6ebf2"); }
    const pop = S.phase === "beat" && S.pt < 0.5 && S.price > S.prevPrice * 1.01 ? 1 + 0.3 * Math.sin(S.pt / 0.5 * Math.PI) : 1;
    g.save(); g.translate(sx + 2, top + 30); g.scale(pop, pop);
    px(-17, -9, 34, 18, "#fff8e8"); px(-17, -9, 34, 1, "#1a1026"); px(-17, 8, 34, 1, "#1a1026"); px(-17, -9, 1, 18, "#1a1026"); px(16, -9, 1, 18, "#1a1026");
    txt("1 LOAF", 0, -4, 5, "#1a1026", { shadow: false }); txt(`${fmt(p)} ${Math.round(p) === 1 ? "COIN" : "COINS"}`, 0, 3, 7, Math.round(p) > 1 ? "#c0392b" : "#1a1026", { shadow: false });
    g.restore();
    // Marcus, his jar, and the shelf of bread his savings buy
    roman(84, base, { t: t * 0.3, tunic: "#8a4a3a", beard: "#cfcfcf", hair: "#cfcfcf" });
    jar(100, base);
    txt("MARCUS", 92, base + 6, 5, "#1a1026", { shadow: false });
    txt("3,000", 100, base - 30, 6, "#1a1026", { shadow: false }); txt("COINS", 100, base - 23, 5, "#1a1026", { shadow: false });
    px(118, top + 18, 58, 44, "#7a5236"); for (let r = 0; r < 4; r++) px(118, top + 27 + r * 11, 58, 1, "#4a2f19");
    for (let i = 0; i < S.loaves; i++) loaf(121 + (i % 8) * 7, top + 22 + Math.floor(i / 8) * 11);
    for (const q of S.fx) { const k = (S.t - q.born) / 0.6; g.save(); g.globalAlpha = 1 - k; loaf(121 + (q.i % 8) * 7, top + 22 + Math.floor(q.i / 8) * 11 - k * 10); g.restore(); }
    txt("HIS SAVINGS BUY", 147, top + 70, 5, "#1a1026", { shadow: false });
    const d = days(p);
    txt(bread(d), 147, top + 80, d >= 730 ? 9 : 8, d >= 365 ? "#1a1026" : "#c0392b", { shadow: false });
    txt("OF BREAD", 147, top + 90, 5, "#1a1026", { shadow: false });
  }
  function timeline(x, y, w) {
    px(x, y, w, 1, "#3a2d5c");
    YEARS.forEach((Y, i) => { const cx = x + w * i / (YEARS.length - 1), h = S.history[i]; px(cx - 1, y - 1, 3, 3, h ? (h.met ? "#8fd16a" : "#ff5a5a") : i === S.y ? "#ffd23f" : "#6c5f93"); });
  }
  function tipBox(x, y, w) {
    if (!S.tip || S.t - S.tip.at > 4.5) return;
    const a = clamp((S.t - S.tip.at) / 0.25, 0, 1) * clamp((4.5 - (S.t - S.tip.at)) / 0.4, 0, 1);
    const lines = wrap(S.tip.str, w - 12, 7);
    g.save(); g.globalAlpha = a;
    px(x, y, w, lines.length * 9 + 8, "#fff8e8"); px(x, y, w, 1, "#1a1026"); px(x, y + lines.length * 9 + 7, w, 1, "#1a1026");
    lines.forEach((l, i) => txt(l, x + w / 2, y + 8 + i * 9, 7, "#1a1026", { body: true, shadow: false }));
    g.restore();
  }
  function info() {
    px(0, 0, 180, 100, "#120d1d");
    txt("THE EMPEROR'S MINT", 90, 10, 7, "#ffd23f");
    timeline(14, 24, 152); txt("AD 14", 14, 32, 5, "#a99cc8", { align: "left" }); txt("AD 270", 166, 32, 5, "#a99cc8", { align: "right" });
    txt(`SCORE ${fmt(S.score)}`, 90, 44, 7, "#f4ecff");
    if (S.tip && S.t - S.tip.at < 4.5) tipBox(8, 54, 164);
    else txt(S.phase === "idle" ? "" : "Hold MINT · out of silver? + COPPER", 90, 66, 7, "#a99cc8", { body: true });
  }
  function finaleScene(t) {
    const W = L.w, H = L.h, n = Math.round(S.price), mx = MAXP(), e = S.phase === "edict" ? S.pt : S.phase === "result" || S.phase === "done" ? 99 : -1;   // the result keeps the empty market
    px(0, 0, W, H, "#bfe3f7"); px(0, H * 0.6, W, H * 0.4, "#cdbb8e");
    const stalls = L.portrait ? [36, 90, 144] : [50, 130, 210, 290], base = Math.round(H * 0.6) + 24;
    stalls.forEach((x, i) => {
      const leave = e > 1.6 + i * 0.55 ? clamp((e - 1.6 - i * 0.55) / 1.2, 0, 1) : 0, dir = i < stalls.length / 2 ? -1 : 1;
      if (leave < 1) roman(x + dir * leave * 140, leave > 0 ? base + 6 : base - 8, { t: t + i, face: leave > 0 ? dir : 1, walk: leave > 0, sack: leave > 0, tunic: ["#e8e0c8", "#3f6fb8", "#7d3c98", "#d68910"][i] });
      px(x - 18, base - 30, 2, 30, "#5e3b1a"); px(x + 16, base - 30, 2, 30, "#5e3b1a");
      for (let k = 0; k < 9; k++) px(x - 20 + k * 4, base - 34, 4, 6, k % 2 ? ["#c0392b", "#d68910", "#2e86c1", "#16a085"][i] : "#f2ead6");
      px(x - 18, base - 10, 36, 10, "#8a5a2b");
      if (leave === 0) for (let k = 0; k < 5; k++) loaf(x - 15 + k * 6, base - 13);
      const capped = e > 0.3;
      px(x - 13, base - 52, 26, 13, capped ? "#ffe2d6" : "#fff8e8"); px(x - 13, base - 52, 26, 1, "#1a1026");
      txt(capped ? `MAX ${mx}` : `${fmt(n)}`, x, base - 45, 6, capped ? "#c0392b" : "#1a1026", { shadow: false });
    });
    // Marcus and his jar, front and centre
    const mxp = L.portrait ? 70 : 150;
    g.save(); g.translate(mxp, H - 6); g.scale(2, 2); roman(0, 0, { t: t * 0.3, tunic: "#8a4a3a", beard: "#cfcfcf", hair: "#cfcfcf" }); jar(14, 0); g.restore();
    // the crowd cheers, briefly
    if (e > 0.6 && e < 1.6) for (let i = 0; i < 8; i++) txt("!", 20 + i * (W - 40) / 7, base + 16 - Math.abs(Math.sin(t * 8 + i)) * 4, 8, "#ffd23f");
    if (e > 0) { const k = clamp(e / 0.25, 0, 1); px(W / 2 - 30, lerp(-40, 8, k), 60, 26, "#8f8a80"); txt("PRICE LAW", W / 2, lerp(-40, 8, k) + 8, 6, "#2a2420", { shadow: false }); txt("AD 301", W / 2, lerp(-40, 8, k) + 17, 5, "#2a2420", { shadow: false }); }
    const forSale = e < 0 ? 40 : Math.max(0, Math.round(40 - 40 * clamp((e - 1.6) / (0.55 * stalls.length + 0.8), 0, 1)));
    // text
    if (e < 0) {
      const lines = wrap(`AD 301. In your Rome a loaf costs ${fmt(n)} coins. Under Augustus it cost 1. The crowd blames the bakers.`, W - 30, 8);
      px(8, 6, W - 16, lines.length * 10 + 10, "rgba(18,13,29,.88)");
      lines.forEach((l, i) => txt(l, W / 2, 16 + i * 10, 8, "#f4ecff", { body: true }));
    } else {
      txt(`LOAVES FOR SALE: ${forSale}`, W / 2, 46, 8, forSale ? "#1a1026" : "#c0392b", { shadow: false });
      if (e > 4.6) {
        const lines = wrap(`Marcus: "At ${mx} coins, I could buy ${fmt(JAR / mx)} loaves… if there were any."`, W - 40, 8);
        px(14, 56, W - 28, lines.length * 10 + 8, "#fff8e8");
        lines.forEach((l, i) => txt(l, W / 2, 65 + i * 10, 8, "#1a1026", { body: true, shadow: false }));
      }
      if (e > 6) txt(`A writer of the time: "men were afraid to put anything up for sale"`, W / 2, H - (L.portrait ? 96 : 50), L.portrait ? 5 : 6, "#1a1026", { body: true, shadow: false });
    }
  }
  function draw(now) {
    layout();
    const t = now / 1000;
    g.setTransform(K, 0, 0, K, 0, 0); g.imageSmoothingEnabled = false;
    g.fillStyle = "#120d1d"; g.fillRect(0, 0, L.w, L.h);
    if (S.phase === "finale" || S.phase === "edict" || ((S.phase === "result" || S.phase === "done") && S.y >= YEARS.length)) { finaleScene(t); return; }
    zone(L.camp, () => camp(t)); zone(L.mint, () => mint(t)); zone(L.market, () => market(t));
    if (L.info) zone(L.info, info);
    if (L.hud) {
      px(0, 0, 180, 20, "#120d1d"); timeline(46, 10, 88);
      txt("AD 14", 22, 10, 5, "#a99cc8"); txt(`${fmt(S.score)}`, 158, 10, 7, "#f4ecff");
      tipBox(6, 22, 168);   // over the year card (the HUD shows the year), never over STILL OWED / OUT OF SILVER
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.phase !== "idle" && S.phase !== "result" && S.phase !== "done") update(dt); else S.t += dt;
    draw(now);
    requestAnimationFrame(frame);
  }
  if (matchMedia("(pointer: coarse)").matches) $("#mint-hint").innerHTML = "Hold <b>MINT</b> with your thumb, tap <b>+ COPPER</b> when the silver runs out.";
  startPanel();
  requestAnimationFrame(frame);
  if (params.has("done")) revealWren();
  window.__rome = S;
  window.__romeApi = { start, copper, fix, finish };
})();
