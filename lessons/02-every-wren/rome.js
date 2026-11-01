/* EP 02 · Chapter 5 minigame: The Emperor's Mint (see rome.DESIGN.md).
   Ten pay days, AD 14 → 270. Hold MINT to pay the legions; out of silver? add copper. Prices catch up a year later,
   and Marcus, a retired soldier, watches his 3,000 coins buy less bread every year. AD 301: fix prices by law.
   Game model: each year's silver makes one melt, so a copper tap thins every coin of that year (simpler than real mints).
   Pacing (phone first): a first run starts with a practice year that waits for each action; a year's clock only starts
   when you press MINT; anything worth reading is a card that pauses the game and waits for a tap. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#mint-cv"), g = cv.getContext("2d"), ui = $("#game-ui"), ctl = $("#controls"), popEl = $("#pop"), skipEl = $("#skip");
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
  const TUT_Y = { ad: 0, ev: "Pay your soldiers", g: 1, n: 6 };
  // FILL: seconds of holding MINT to pay a whole year. A year lasts WINDOW seconds once you press MINT, plus TAP_TIME for
  // each copper tap that year needs (0 to 3): a first-time thumb needs about a second to see OUT OF SILVER and tap.
  // CARD: the year card shows at least this long before MINT starts the clock. BEAT: the market reacts.
  const SILVER = 60, TUT_SILVER = 50, FILL = 2.6, WINDOW = 4.4, TAP_TIME = 1.1, CARD = 1.0, BEAT = 1.7, JAR = 3000;
  const PHONE = Ep02.PHONE, COARSE = matchMedia("(pointer: coarse)").matches;
  const TUT_KEY = "wth-ep02-rome-tut";
  const tutSeen = () => { try { return localStorage.getItem(TUT_KEY) === "1"; } catch { return false; } };
  const tutDone = () => { try { localStorage.setItem(TUT_KEY, "1"); } catch {} };

  const S = { phase: "idle", y: 0, pt: 0, t: 0, p: 98, price: 1, paid: 0, bill: 60, silver: SILVER, hold: false, anger: 0, met: 0, taps: 0, score: 0, best: 0,
    tut: 0, paused: false, seen: {}, hidden: 0, loaves: 32, fx: [], parts: [], prevPrice: 1, mutinyAt: 0, history: [], clinkAt: 0, flash: -9 };
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

  /* ---------- drawing kit (game pixels; on a 390px phone one game pixel is about 2 CSS px, so text is size 6 or more) ---------- */
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
  function measure(s, size, body = false) { g.font = body ? `700 ${size}px 'Space Grotesk'` : `${size}px Silkscreen`; return g.measureText(s).width; }
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
  function arrowDown(cx, y, c) { for (let i = 0; i < 5; i++) px(cx - 5 + i, y + i, 11 - i * 2, 1, c); }
  function zone(z, fn) { g.save(); g.translate(z.x, z.y); g.beginPath(); g.rect(0, 0, 180, 100); g.clip(); fn(); g.restore(); }

  /* ---------- the model ---------- */
  const yr = () => S.tut ? TUT_Y : YEARS[Math.min(S.y, YEARS.length - 1)];
  const capacity = () => S.silver * 98 / S.p;            // coins this year's silver makes at the current purity
  const owed = () => Math.max(0, S.bill - S.paid);
  const isOut = () => S.phase === "mint" && owed() > 0.01 && S.paid >= capacity() - 0.01;
  const days = (price) => Math.floor(JAR / price);
  function bread(d, short) {
    d = Math.floor(d);
    if (d >= 730) return `${Math.floor(d / 365)} YEARS`;
    if (d >= 365) return "1 YEAR";
    if (d >= 14) return `${Math.round(d / 7)} WEEKS`;
    if (d >= 2) return `${d} DAYS`;
    return d === 1 ? "1 DAY" : short ? "< 1 DAY" : "LESS THAN A DAY";
  }
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pct = (p) => (p >= 10 ? Math.round(p) : p >= 1 ? p.toFixed(1) : p.toFixed(2)) + "%";
  const priceStr = (p) => p < 9.95 ? String(+p.toFixed(2)) : fmt(p);   // 1.25, 1.56 … then whole coins

  function startYear() {
    const Y = yr();
    S.phase = "card"; S.pt = 0; S.paid = 0; S.bill = Math.round(SILVER * Y.g * S.price); S.metAt = 0;
    let k = 0; while (capacity() * Math.pow(1.25, k) < S.bill - 0.01 && k < 6) k++;   // copper taps this year needs
    S.win = WINDOW + TAP_TIME * k;
    Chip.sfx("pop");
  }
  function copper() {
    if (S.paused || (S.phase !== "card" && S.phase !== "mint")) return;
    if (S.tut === 1 || S.tut === 3) return;   // practice: one step at a time
    S.p *= 0.8; S.taps++; S.flash = S.t;
    Chip.sfx("thud");
    Chip.SONGS.rome.chords = BASS.map((c) => c - Math.min(6, S.taps));   // each melt sounds a bit cheaper
    S.hidden = Math.min(12, S.hidden + 3);   // old silver coins hop into the pot under the stall (people keep the good coins)
    if (S.tut === 2) S.tut = 3;
  }
  function endYear() {
    const met = S.paid >= S.bill - 0.01;
    if (met) { S.met++; S.score += 100; } else { S.anger++; Chip.sfx("sad"); }
    S.history.push({ ad: yr().ad, p: S.p, met });
    S.prevPrice = S.price; S.price = 98 / S.p;   // prices catch up next year
    S.phase = "beat"; S.pt = 0;
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

  /* ---------- cards: the game pauses, the card waits for a tap (or Space / Enter) ---------- */
  let popAt = 0, popThen = null;
  function pop(title, body, label, then) {
    S.paused = true; S.hold = false; popThen = then; popAt = performance.now();
    popEl.innerHTML = `<div class="pop-card" role="dialog" aria-live="polite"><h3>${title}</h3>${body}<button class="btn" id="pop-ok">${label}</button></div>`;
    popEl.hidden = false;
    $("#pop-ok").onclick = popOk;
  }
  function popOk() {
    if (popEl.hidden || performance.now() - popAt < 400) return;   // a thumb still on MINT can't dismiss it by accident
    popEl.hidden = true; popEl.innerHTML = ""; S.paused = false; Chip.sfx("pop");
    const f = popThen; popThen = null; if (f) f();
  }
  function closePop() { popEl.hidden = true; popEl.innerHTML = ""; S.paused = false; popThen = null; }
  // after a year's market beat, at most one lesson card, each shown once per run
  function beatCard() {
    const last = S.history[S.history.length - 1];
    if (last && !last.met && !S.seen.unpaid) {
      S.seen.unpaid = true;
      return ["NOT PAID!", `<p>The soldiers are angry. <b>3 unpaid years</b> and they pick a new emperor.</p><p>Tip: you can tap <b>+ COPPER</b> more than once, even before you press MINT.</p>`];
    }
    if (S.price > 1.01 && !S.seen.rise) {
      S.seen.rise = true;
      return ["BREAD COSTS MORE", `<p>One loaf: <b>1 coin → <span class="bad">${priceStr(S.price)} coins</span></b>.</p><p>Same bread. But each coin has less silver now, so the baker wants more coins.</p><p>That's <b>inflation</b>.</p>`];
    }
    if (days(S.price) < 365 && !S.seen.marcus) {
      S.seen.marcus = true;
      return ["MARCUS'S JAR", `<p>His 3,000 coins bought <b>8 years</b> of bread.</p><p>Now: <b class="bad">${bread(days(S.price)).toLowerCase()}</b> of bread.</p><p>Nobody touched his jar. Prices rose, so each coin in it buys less.</p>`];
    }
    return null;
  }

  /* ---------- UI panels and controls ---------- */
  let bMint = null, bCopper = null;
  function panel(html) { ui.innerHTML = html ? `<div class="panel">${html}</div>` : ""; }
  function controls(kind) {
    ctl.hidden = kind === "none"; ctl.style.visibility = ""; bMint = bCopper = null;
    if (kind === "play") {
      ctl.innerHTML = `<button class="ctl copper" id="b-copper">+ COPPER<small>${COARSE ? "out of silver? tap" : "key C"}</small></button>
        <button class="ctl mint" id="b-mint">HOLD TO MINT<small>${COARSE ? "keep your thumb on it" : "hold Space"}</small></button>`;
      const m = bMint = $("#b-mint"); bCopper = $("#b-copper");
      m.addEventListener("pointerdown", (e) => { e.preventDefault(); if (!S.paused) S.hold = true; try { m.setPointerCapture(e.pointerId); } catch {} });
      for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) m.addEventListener(ev, () => { S.hold = false; });
      m.addEventListener("contextmenu", (e) => e.preventDefault());
      bCopper.addEventListener("pointerdown", (e) => { e.preventDefault(); copper(); });
    } else if (kind === "finale") {
      ctl.innerHTML = `<button class="ctl honest" disabled>MAKE COINS HONEST AGAIN<small>you'd need ${fmt(98 / S.p)}× more silver</small></button>
        <button class="ctl fix" id="b-fix">FIX PRICES BY LAW<small>${COARSE ? "tap" : "key F"}</small></button>`;
      $("#b-fix").onclick = fix;
    }
  }
  // which button to press now: it pulses; a button that does nothing right now is dimmed
  function buttonHints() {
    if (!bMint) return;
    const out = isOut(), waiting = S.phase === "card" && S.pt >= CARD;
    bMint.classList.toggle("pulse", !S.hold && !out && (S.tut === 1 || S.tut === 3 || waiting));
    bMint.classList.toggle("off", out);
    bCopper.classList.toggle("pulse", out);
    bCopper.classList.toggle("off", S.tut === 1 || S.tut === 3);
  }
  function startPanel() {
    S.phase = "idle";
    controls("none");
    const seen = tutSeen();
    panel(`<h3>THE EMPEROR'S MINT</h3>
      <p>You are the emperor. Pay your army every year, <b>AD 14 to 270</b>.</p>
      <p class="muted">Watch Marcus and his jar of savings.</p>
      <div class="row">${seen ? `<button class="btn ghost" id="b-tut">HOW TO PLAY</button>` : ""}<button class="btn" id="b-start">${seen ? "PLAY" : "START"}</button></div>
      ${S.best ? `<p class="muted">Best score: ${fmt(S.best)}</p>` : ""}`);
    $("#b-start").onclick = () => start();
    if (seen) $("#b-tut").onclick = startTut;
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
  function reset() {
    Object.assign(S, { y: 0, p: 98, price: 1, prevPrice: 1, anger: 0, met: 0, taps: 0, score: 0, seen: {}, hidden: 0, loaves: 32, fx: [], parts: [], mutinyAt: 0, history: [], hold: false,
      tut: 0, silver: SILVER, edictCard: false });
    closePop();
    Chip.SONGS.rome.chords = BASS.slice();
  }
  function begin() {
    panel(""); playing(true); controls("play");
    if (!document.body.classList.contains("playing")) $("#game").scrollIntoView({ behavior: "smooth", block: "center" });
    Chip.song(Chip.SONGS.rome);
  }
  // practice year: one instruction at a time, no clock; it waits for you to do each thing once
  function startTut() {
    reset(); begin();
    S.tut = 1; S.silver = TUT_SILVER; S.phase = "mint"; S.pt = 0; S.paid = 0; S.bill = 60; S.metAt = 0;
    skipEl.hidden = false;
  }
  function endTut() {
    tutDone(); skipEl.hidden = true;
    pop("READY?", `<p>Now the real years, <b>AD 14 to 270</b>.</p><p>Each year, pay before the yellow bar runs out. It starts when you press MINT.</p><p>Keep an eye on <b>Marcus's jar</b> at the bottom.</p>`, "START: AD 14", () => start(true));
  }
  function start(skipTut) {
    if (!skipTut && !tutSeen()) { startTut(); return; }
    skipEl.hidden = true;
    reset(); begin();
    startYear();
  }
  skipEl.onclick = () => { tutDone(); start(true); };
  const MAXP = () => { const n = Math.round(S.price); return n >= 20 ? 10 : Math.max(1, Math.floor(n / 2)); };
  function finale() {
    S.phase = "finale"; S.pt = 0; S.hold = false;
    controls("finale"); Chip.song(Chip.SONGS.mystery);
  }
  function fix() {
    if (S.phase !== "finale" || S.paused) return;
    S.phase = "edict"; S.pt = 0; S.edictCard = false; ctl.style.visibility = "hidden"; Chip.sfx("thud");
  }
  function finish() {
    closePop(); playing(false);
    S.phase = "result"; controls("none");
    const mutiny = !!S.mutinyAt, n = Math.round(S.price), d = days(S.price);
    if (!mutiny) S.score += d;
    if (S.score > S.best) { S.best = S.score; try { localStorage.setItem("wth-ep02-rome-best", S.best); } catch {} }
    const money = (100 / n).toFixed(2);
    panel(`<h3>${mutiny ? `MUTINY, AD ${S.mutinyAt}` : "ALL LEGIONS PAID, AD 14–270"}</h3>
      ${mutiny ? `<p>Three years without pay, so the soldiers picked a new emperor. That happened to many real emperors.</p>` : ""}
      <div class="facts">
        <div><b>SILVER IN THE COIN</b>98% → <span class="bad">${pct(S.p)}</span><i>Real Rome by 270: under 5%</i></div>
        <div><b>ONE LOAF</b>1 coin → <span class="bad">${fmt(n)} coins</span><i>Real Egypt: wheat 8 → 300 drachmas a sack (AD 100 → 293)</i></div>
      </div>
      <p>Marcus's 3,000 coins: <b>8 years of bread → <span class="${d < 365 ? "bad" : "gold"}">${bread(d).toLowerCase()}</span></b>.</p>
      <p>Nobody touched his jar. ${mutiny ? "Thinner coins" : "Your thinner coins"} pushed up every price.</p>
      <p class="irl"><b>In real life:</b> when prices rise ${fmt(n)}×, €100 kept in a drawer buys what €${money} used to.</p>
      <p class="score">SCORE <b>${fmt(S.score)}</b> · best ${fmt(S.best)}<span class="muted"> (${S.met} pay days × 100${mutiny ? "; Marcus only counts if you reach AD 270" : ` + ${fmt(d)} days of Marcus's bread`})</span></p>
      <div class="row"><button class="btn ghost" id="b-again">${mutiny ? "TRY AGAIN" : "PLAY AGAIN"}</button><button class="btn" id="b-done">CONTINUE</button></div>`);
    $("#b-again").onclick = () => { Chip.sfx("pop"); start(true); };
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
    if (!popEl.hidden) { if ((k === " " || k === "enter") && !e.repeat) { e.preventDefault(); popOk(); } else if (k === " ") e.preventDefault(); return; }
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
    // the year card stays until you press MINT: the clock never runs while you read
    if (S.phase === "card" && S.pt >= CARD && S.hold) { S.phase = "mint"; S.pt = 0; }
    else if (S.phase === "mint") {
      if (S.hold && owed() > 0 && !isOut() && !S.metAt) {
        const amt = Math.min(S.bill / FILL * dt, owed(), capacity() - S.paid);
        S.paid += amt;
        S.spawn = (S.spawn || 0) + amt * Math.min(1, 40 / S.bill);
        while (S.spawn >= 1) { S.spawn--; S.parts.push({ born: S.t, i: Math.floor(Math.random() * Y.n), dx: Math.random() * 10 - 5 }); }
        if (S.t - S.clinkAt > 0.09) { S.clinkAt = S.t; Chip.sfx("clink"); }
      }
      if (!S.metAt && S.paid >= S.bill - 0.01) { S.paid = S.bill; S.metAt = S.pt; Chip.sfx("chime"); }
      if (isOut() && !S.outAt) { S.outAt = S.t; Chip.sfx("pop"); if (S.tut === 1) S.tut = 2; }
      if (!isOut()) S.outAt = 0;
      if (S.tut) { if (S.metAt && S.pt - S.metAt > 0.8) endTut(); }
      else if ((S.metAt && S.pt - S.metAt > 0.5) || S.pt >= S.win) endYear();
    } else if (S.phase === "beat") {
      // the market reacts: loaves pop off Marcus's shelf
      const want = Math.round(32 * clamp(days(S.price) / JAR, 0, 1));
      if (S.loaves > want && S.pt > 0.25 && S.t - (S.popAt || 0) > 0.06) { S.loaves--; S.popAt = S.t; S.fx.push({ born: S.t, i: S.loaves }); if (S.loaves % 3 === 0) Chip.sfx("pop"); }
      if (S.pt >= BEAT && S.loaves <= want) {
        const next = () => { S.y++; if (S.y >= YEARS.length) finale(); else startYear(); };
        const c = beatCard();
        if (c) pop(c[0], c[1], "OK", next); else next();
      }
    } else if (S.phase === "mutiny" && S.pt > 0.9) {
      pop("MUTINY!", `<p>3 unpaid years. The soldiers pick a new emperor.</p><p>The new emperor adds more copper and pays them.</p>`, "JUMP TO AD 301",
        () => { successor(); S.loaves = Math.round(32 * clamp(days(S.price) / JAR, 0, 1)); finale(); });
    } else if (S.phase === "edict") {
      const k = Math.floor((S.pt - 1.6) / 0.55);
      if (k >= 0 && k < 4 && k !== S.lastBaker) { S.lastBaker = k; Chip.sfx("pop"); }
      if (S.pt > 0.6 && !S.cheered) { S.cheered = true; Chip.sfx("chime"); }
      if (S.pt > 5.2 && !S.edictCard) {
        S.edictCard = true;
        const mx = MAXP();
        pop("NO BREAD", `<p>The law says: max ${mx} coins a loaf. But baking one costs about ${fmt(S.price)} coins. So bakers stop selling.</p><p>Marcus: “At ${mx} coins I could buy ${fmt(JAR / mx)} loaves… if there were any.”</p><p class="muted small">A writer of the time: “men were afraid to put anything up for sale.”</p>`, "SEE RESULT", finish);
      }
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
    const lastUnpaid = (S.phase === "beat" || S.phase === "mutiny") && S.history.length && !S.history[S.history.length - 1].met;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * sp, f = clamp(frac * n - i, 0, 1);
      g.save(); g.translate(Math.round(x), 94); g.scale(2, 2);
      roman(0, 0, { t: t + i, tunic: "#a8281e", helmet: true, shield: true, arm: f >= 1 ? "up" : null, angry: lastUnpaid });
      g.restore();
      px(x - 5, 46, 10, 3, "#1a1026"); px(x - 5, 46, 10 * f, 3, f >= 1 ? "#8fd16a" : "#ffd23f");
    }
    for (const q of S.parts) { const k = (S.t - q.born) / 0.5, x = x0 + q.i * sp + q.dx * (1 - k); coin(x, lerp(110, 50, k) - Math.sin(k * Math.PI) * 6, 2, S.p); }
    // year card
    const ka = S.phase === "card" ? clamp(S.pt / 0.25, 0, 1) : 1, off = (1 - ka) * -60;
    txt(S.tut ? "PRACTICE" : "AD " + Y.ad, 6 + off, 9, 10, "#ffd23f", { align: "left" });
    txt(Y.ev, 6 + off, 21, 8, "#1a1026", { align: "left", body: true, shadow: false });
    txt(`PAY ${fmt(Math.floor(S.paid + 0.01))} / ${fmt(S.bill)}`, 174, 33, 7, "#1a1026", { align: "right", shadow: false });
    if (!S.tut) for (let i = 0; i < 3; i++) { const c = i < S.anger ? "#ff5a5a" : "rgba(26,16,38,.25)"; px(150 + i * 9, 4, 6, 3, c); px(151 + i * 9, 3, 4, 1, c); px(152 + i * 9, 1, 2, 2, i < S.anger ? "#c0392b" : "rgba(26,16,38,.25)"); }
    // the year's clock: a fat bar that empties
    if (S.phase === "mint" && !S.metAt && !S.tut) { const k = 1 - S.pt / S.win; px(0, 95, 180, 5, "rgba(26,16,38,.5)"); px(0, 95, 180 * k, 5, k < 0.3 ? "#ff5a5a" : "#ffd23f"); }
    if (S.metAt) { px(60, 51, 60, 18, "#1a1026"); txt("PAID!", 90, 60, 12, "#8fd16a"); }
    if (lastUnpaid && S.phase === "beat") { px(36, 51, 108, 18, "#1a1026"); txt("NOT PAID!", 90, 60, 12, "#ff5a5a"); }
    if (S.phase === "mutiny") { px(0, 0, 180, 100, "rgba(120,0,0,.55)"); txt("MUTINY!", 90, 50, 16, "#fff"); }
  }
  function mint(t) {
    px(0, 0, 180, 100, "#5a1f24"); for (let y = 10; y < 100; y += 22) px(0, y, 180, 1, "#4a181d");
    // the silver vat: what's left of this year's silver
    const left = clamp(1 - S.paid / capacity(), 0, 1), out = isOut();
    px(10, 32, 26, 52, "#1a1026"); px(12, 34, 22, 48, "#3a2d24"); px(12, 34 + 48 * (1 - left), 22, 48 * left, "#d7dde8"); px(12, 34 + 48 * (1 - left), 3, 48 * left, "#ffffff");
    txt("SILVER", 23, 26, 6, "#f4ecff");
    // the big coin: spins while minting, flashes on a copper tap
    const spin = S.hold && S.phase === "mint" && !out && !S.metAt ? Math.abs(Math.cos(t * 9)) : 1, fl = S.t - S.flash < 0.3;
    coin(88, 48, 18, S.p, Math.max(0.15, spin));
    if (fl) disc(88, 48, 20, "rgba(255,138,58,.45)");
    txt("SILVER IN COIN", 88, 76, 6, "#a99cc8");
    txt(pct(S.p), 88, 89, 11, S.p > 90 ? "#e6ebf2" : S.p > 30 ? "#ffd23f" : "#ff8a3a");
    // will the silver cover the pay day?
    const need = Math.ceil(owed()), can = Math.floor(capacity() - S.paid + 0.01), short = can < need;
    txt("OWED", 150, 34, 6, "#a99cc8"); txt(fmt(need), 150, 46, 11, short ? "#ff5a5a" : "#f4ecff");
    txt("CAN MAKE", 150, 64, 6, "#a99cc8"); txt(fmt(can), 150, 76, 11, short ? "#ff5a5a" : "#8fd16a");
    const blink = Math.floor(t * 4) % 2;
    if (out) {
      px(38, 2, 104, 24, "#1a1026");
      txt("OUT OF SILVER!", 90, 9, 8, blink ? "#ff5a5a" : "#ffd23f"); txt("TAP + COPPER", 90, 20, 7, "#ffd23f");
    } else if (S.phase === "card" && S.pt >= CARD && !S.hold) {
      px(46, 2, 88, 16, "#1a1026"); txt("HOLD MINT", 90, 10, 8, blink ? "#ffd23f" : "#f4ecff");
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
    const pop = S.phase === "beat" && S.pt < 0.6 && S.price > S.prevPrice * 1.01 ? 1 + 0.3 * Math.sin(S.pt / 0.6 * Math.PI) : 1;
    // the tag: "LOAF" over the price and a little coin
    const ps = priceStr(p), pw = measure(ps, 8), tw = Math.max(34, Math.ceil(pw) + 16), up = p > 1.005;
    g.save(); g.translate(sx + 2, top + 30); g.scale(pop, pop);
    px(-tw / 2, -10, tw, 21, "#fff8e8"); px(-tw / 2, -10, tw, 1, "#1a1026"); px(-tw / 2, 10, tw, 1, "#1a1026"); px(-tw / 2, -10, 1, 21, "#1a1026"); px(tw / 2 - 1, -10, 1, 21, "#1a1026");
    txt("1 LOAF", 0, -4, 6, "#1a1026", { shadow: false });
    txt(ps, -5, 5, 8, up ? "#c0392b" : "#1a1026", { shadow: false }); coin(pw / 2 + 1, 5, 3, S.p);
    g.restore();
    // Marcus, his jar, and the shelf of bread his savings buy
    roman(84, base, { t: t * 0.3, tunic: "#8a4a3a", beard: "#cfcfcf", hair: "#cfcfcf" });
    jar(100, base);
    txt("MARCUS", 92, base + 7, 6, "#1a1026", { shadow: false });
    txt("3,000", 100, base - 24, 7, "#1a1026", { shadow: false });
    px(118, top + 14, 58, 44, "#7a5236"); for (let r = 0; r < 4; r++) px(118, top + 23 + r * 11, 58, 1, "#4a2f19");
    for (let i = 0; i < S.loaves; i++) loaf(121 + (i % 8) * 7, top + 18 + Math.floor(i / 8) * 11);
    for (const q of S.fx) { const k = (S.t - q.born) / 0.6; g.save(); g.globalAlpha = 1 - k; loaf(121 + (q.i % 8) * 7, top + 18 + Math.floor(q.i / 8) * 11 - k * 10); g.restore(); }
    txt("JAR BUYS", 147, top + 66, 6, "#1a1026", { shadow: false });
    const d = days(p), b = bread(d, true), bs = measure(b, 9) > 58 ? 7 : 9;
    txt(b, 147, top + 78, bs, d >= 365 ? "#1a1026" : "#c0392b", { shadow: false });
    txt("OF BREAD", 147, top + 90, 6, "#1a1026", { shadow: false });
  }
  // practice: one big instruction over the market strip, pointing down at the buttons
  function coach() {
    if (!S.tut || S.metAt || S.paused) return;
    const s = S.tut === 1 ? (COARSE ? "Hold the MINT button to pay your soldiers" : "Hold MINT (or Space) to pay your soldiers")
      : S.tut === 2 ? (COARSE ? "Out of silver! Tap + COPPER" : "Out of silver! Tap + COPPER (or C)")
      : "Copper: more coins, less silver in each. Hold MINT again";
    const lines = wrap(s, 160, 11);
    px(0, 0, 180, 100, "rgba(18,13,29,.93)"); px(0, 0, 180, 2, "#ffd23f");
    const y0 = 46 - (lines.length - 1) * 7.5;
    lines.forEach((l, i) => txt(l, 90, y0 + i * 15, 11, "#f4ecff", { body: true }));
    arrowDown(90, 86 + (Math.floor(S.t * 3) % 2) * 2, "#ffd23f");
  }
  function timeline(x, y, w) {
    px(x, y, w, 1, "#3a2d5c");
    YEARS.forEach((Y, i) => { const cx = x + w * i / (YEARS.length - 1), h = S.history[i]; px(cx - 1, y - 1, 3, 3, h ? (h.met ? "#8fd16a" : "#ff5a5a") : i === S.y ? "#ffd23f" : "#6c5f93"); });
  }
  function info() {
    px(0, 0, 180, 100, "#120d1d");
    txt("THE EMPEROR'S MINT", 90, 10, 7, "#ffd23f");
    if (S.tut) txt("PRACTICE", 90, 26, 8, "#a99cc8");
    else { timeline(14, 24, 152); txt("AD 14", 14, 33, 6, "#a99cc8", { align: "left" }); txt("AD 270", 166, 33, 6, "#a99cc8", { align: "right" }); }
    txt(`SCORE ${fmt(S.score)}`, 90, 48, 7, "#f4ecff");
    if (S.phase !== "idle") txt("Hold MINT · out of silver? + COPPER", 90, 70, 7, "#a99cc8", { body: true });
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
      px(x - 18, base - 53, 36, 14, capped ? "#ffe2d6" : "#fff8e8"); px(x - 18, base - 53, 36, 1, "#1a1026");
      txt(capped ? `MAX ${mx}` : `${fmt(n)}`, x, base - 46, 7, capped ? "#c0392b" : "#1a1026", { shadow: false });
    });
    // Marcus and his jar, front and centre
    const mxp = L.portrait ? 70 : 150;
    g.save(); g.translate(mxp, H - 6); g.scale(2, 2); roman(0, 0, { t: t * 0.3, tunic: "#8a4a3a", beard: "#cfcfcf", hair: "#cfcfcf" }); jar(14, 0); g.restore();
    // the crowd cheers, briefly
    if (e > 0.6 && e < 1.6) for (let i = 0; i < 8; i++) txt("!", 20 + i * (W - 40) / 7, base + 16 - Math.abs(Math.sin(t * 8 + i)) * 4, 8, "#ffd23f");
    if (e > 0) { const k = clamp(e / 0.25, 0, 1); px(W / 2 - 32, lerp(-40, 8, k), 64, 26, "#8f8a80"); txt("PRICE LAW", W / 2, lerp(-40, 8, k) + 8, 7, "#2a2420", { shadow: false }); txt("AD 301", W / 2, lerp(-40, 8, k) + 18, 6, "#2a2420", { shadow: false }); }
    const forSale = e < 0 ? 40 : Math.max(0, Math.round(40 - 40 * clamp((e - 1.6) / (0.55 * stalls.length + 0.8), 0, 1)));
    if (e < 0) {   // waits for your tap on FIX PRICES BY LAW: no clock
      const lines = wrap(`AD 301. A loaf costs ${fmt(n)} coins. Under Augustus: 1. The crowd blames the bakers.`, W - 30, 9);
      px(8, 6, W - 16, lines.length * 12 + 10, "rgba(18,13,29,.88)");
      lines.forEach((l, i) => txt(l, W / 2, 17 + i * 12, 9, "#f4ecff", { body: true }));
    } else txt(`LOAVES FOR SALE: ${forSale}`, W / 2, 48, 8, forSale ? "#1a1026" : "#c0392b", { shadow: false });
  }
  function draw(now) {
    layout();
    const t = now / 1000;
    g.setTransform(K, 0, 0, K, 0, 0); g.imageSmoothingEnabled = false;
    g.fillStyle = "#120d1d"; g.fillRect(0, 0, L.w, L.h);
    if (S.phase === "finale" || S.phase === "edict" || ((S.phase === "result" || S.phase === "done") && S.y >= YEARS.length)) { finaleScene(t); return; }
    zone(L.camp, () => camp(t)); zone(L.mint, () => mint(t)); zone(L.market, () => market(t));
    if (S.tut) zone(L.market, coach);
    if (L.info) zone(L.info, info);
    if (L.hud) {
      px(0, 0, 180, 20, "#120d1d");
      if (S.tut) txt("PRACTICE", 8, 10, 7, "#a99cc8", { align: "left" });
      else { txt(`YEAR ${Math.min(S.y + 1, 10)}/10`, 6, 10, 6, "#a99cc8", { align: "left" }); timeline(60, 10, 80); }
      txt(`${fmt(S.score)}`, 174, 10, 7, "#f4ecff", { align: "right" });
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.paused) { /* a card is up: everything waits */ }
    else if (S.phase !== "idle" && S.phase !== "result" && S.phase !== "done") update(dt); else S.t += dt;
    buttonHints();
    draw(now);
    requestAnimationFrame(frame);
  }
  if (COARSE) $("#mint-hint").innerHTML = "Hold <b>MINT</b> with your thumb, tap <b>+ COPPER</b> when the silver runs out.";
  startPanel();
  requestAnimationFrame(frame);
  if (params.has("done")) revealWren();
  window.__rome = S;
  window.__romeApi = { start, startTut, copper, fix, finish, popOk };
})();
