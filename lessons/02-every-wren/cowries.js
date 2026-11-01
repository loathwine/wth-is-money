/* EP 02 · Chapter 4 minigame: Goat money.
   Buy one goat before sunset, three times: the 1840s, 1871, 1890. The goat always costs one silver dollar;
   the shells for that dollar follow the real Dahomey rates (2,000 → 10,000 → 20,000), so the load grows
   from a pouch to two head-loads. Tap (or hold) to step; tap faster than the load settles and it spills. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#cw"), g = cv.getContext("2d"), ui = $("#game-ui"), card = $("#cw-card"), hud = $("#cw-hud"), tapBtn = $("#cw-tap"), coach = $("#cw-coach"), game = $("#game");
  const W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  const params = new URLSearchParams(location.search);
  const _ = null;
  // the chapter's song: F major pentatonic marimba; each round drops a step and gets heavier
  const MEL = [[77, _, 79, 81, _, 84, 81, _], [79, _, 77, _, 74, _, 77, _], [81, 84, 86, _, 84, 81, 79, _], [77, _, _, 74, 77, _, _, _]];
  Chip.SONGS.cowries = { bpm: 104, style: "island", chords: [53, 48, 50, 48], melody: MEL };
  Chip.SONGS.cowries2 = { bpm: 96, style: "island", chords: [51, 46, 48, 46], melody: MEL.map((b) => b.map((m) => m && m - 2)) };
  Chip.SONGS.cowries3 = { bpm: 84, style: "mystery", chords: [50, 46, 48, 45], melody: [[74, _, _, 72, 69, _, _, _], [70, _, _, 69, 67, _, _, _], [72, _, 74, _, 72, _, 69, _], [69, _, _, _, 62, _, _, _]] };

  // Real: shells per silver dollar, Dahomey coast (Law 1995; Skertchly 1874; via Pont Cháfer 2025). Game: the goat price (1 dollar), loads, timers.
  // Timers tuned for a first try on a phone (tools: a strategy sim in the DESIGN note): a player who waits for STEP and
  // reacts makes 1871 with ~5–9 s and 1890 with ~3–10 s left; holding the button makes both with ~6–7 s; mashing (~7 taps a second) scrapes 1871 with ~2 s after ~15 spills and loses 1890.
  const ROUNDS = [
    { year: "THE 1840s", short: "1840s", shells: 2000, g: 1, time: 25, song: "cowries", jar: 1 },
    { year: "1871", short: "1871", shells: 10000, g: 2, time: 28, song: "cowries2", jar: 1 / 5 },
    { year: "1890", short: "1890", shells: 20000, g: 2, time: 50, song: "cowries3", jar: 1 / 10 },
  ];
  const CAP = 10000;      // shells per head-load (20 kg of Zanzibar shells): a game value, a rough real head-load
  const TAU = 0.5;        // seconds for the sway to settle
  const FULL = 0.3;       // a step needs this long for its full length: mashing faster only shuffles (light trips must not beat careful heavy ones)
  const SAFE = 0.9;       // the button says STEP only when one more step keeps the sway under this (a spill needs > 1), so a tap on STEP never spills
  const SCOOP = 1.2;      // seconds on your knees picking up the shells after a spill (nothing is lost, only time)
  const HEAVY = 5;        // kg: from here the load sways, and the button shows STEP / WAIT
  const kick = (kg) => 0.06 + 0.5 * kg / 20;             // sway added per step
  const stepsFor = (kg) => 7 + 17 * Math.min(kg, 20) / 20; // steps for the whole walk (9 with the pouch, 24 with a 20 kg basket)
  const holdDt = (kg) => Math.max(FULL, -TAU * Math.log(1 - Math.min(0.95, kick(kg) / SAFE)) * 1.7);   // holding = safe but slow (0.83 s a step at 20 kg)
  const TUT_KEY = "wth-ep02-cowries-tut";

  const S = { phase: "idle", r: 0, x: 0, dir: 1, carry: 0, delivered: 0, sway: 0, swayT: 0, stagger: 0, left: 0, t: 0, steps: 0, walk: 0, holding: false, holdNext: 0,
    parts: [], spilled: [], goats: 0, got: [], log: [], msg: "", msgT: 0, best: 0, end: 0, tut: 0, tutN: 0, g: 0 };
  try { S.best = +localStorage.getItem("wth-ep02-cowries-best") || 0; } catch {}
  let tutDone = false;
  try { tutDone = localStorage.getItem(TUT_KEY) === "1"; } catch {}
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const R = () => ROUNDS[S.r];
  const kg = () => S.carry * (S.g || R().g) / 1000;
  const mustWait = () => kg() >= HEAVY && (S.stagger > 0 || S.sway + kick(kg()) > SAFE);
  const decode = (b) => ({ goats: Math.floor(b / 1000), spare: (b % 1000) / 10 });

  /* ---------- tiny synth for steps and the goat (Chip has no pitch control); respects the mute button ---------- */
  let ac = null;
  function beep(f, dur, type = "square", vol = 0.05, f2, vib) {
    if (Chip.muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vib; lg.gain.value = f * 0.06; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
      v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(v); v.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  const bleat = () => { beep(520, 0.4, "square", 0.05, 430, 28); setTimeout(() => beep(470, 0.3, "square", 0.04, 400, 30), 420); };

  /* ---------- drawing kit (pixels in the 240×160 canvas) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`; };
  const at2 = (x, y, fn) => { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(2, 2); fn(); g.restore(); };   // sprites at 2×, feet at (0,0)
  const SKIN = "#8a5534", SKIN2 = "#6b3f24", SHELL = "#f3e6c6", SHELLD = "#8c7650";
  function folk(o) {
    const b = o.walk ? o.step % 2 : 0, f = o.face || 1;
    px(-3, -1, 6, 1, "rgba(0,0,0,.3)");
    px(-2, -4 - b, 1, 3, SKIN2); px(1, -4 - (o.walk ? 1 - b : 0), 1, 3, SKIN2);
    px(-2, -7, 4, 3, o.cloth); px(-2, -11, 4, 4, o.top || SKIN); px(-2, -15, 4, 4, SKIN); px(-2, -16, 4, 1, o.hair || "#1a1010");
    px(f > 0 ? 1 : -2, -14, 1, 1, "#1a1010");
    if (o.wrap) { px(-3, -18, 6, 3, o.wrap); px(-2, -19, 4, 1, o.wrap); }
    if (o.arms === "up") { px(-3, -19, 1, 8, SKIN); px(2, -19, 1, 8, SKIN); } else px(f > 0 ? 2 : -3, -10, 1, 4, SKIN);
  }
  function goat(f = 1, chew = 0) {
    const m = (x) => (f > 0 ? x : -x - 1);
    px(-4, -1, 9, 1, "rgba(0,0,0,.25)");
    for (const lx of [-4, -2, 2, 4]) px(m(lx), -3, 1, 3, "#5e574a");
    px(m(-5) - (f > 0 ? 0 : 9), -7, 10, 4, "#e8e0d0"); px(m(-2) - (f > 0 ? 0 : 3), -7, 4, 2, "#8a6a4a");
    px(m(4) - (f > 0 ? 0 : 3), -10, 4, 4, "#e8e0d0"); px(m(7), -9 + chew, 1, 1, "#1a1010"); px(m(6), -9, 1, 1, "#1a1010");
    px(m(4), -12, 1, 2, "#8a7a5a"); px(m(6), -12, 1, 2, "#8a7a5a"); px(m(5), -6, 1, 2, "#d8d0c0"); px(m(-6), -8, 1, 2, "#e8e0d0");
  }
  function jar(x, base, h = 9) {
    for (let i = 0; i < h; i++) { const u = i / h, hw = Math.round(u > 0.85 ? 2 : 2 + 3 * Math.sin(Math.PI * u / 0.85)); px(x - hw, base - i - 1, hw * 2, 1, i % 3 ? "#a0522d" : "#8a4322"); }
    px(x - 2, base - h - 1, 4, 1, SHELL);
  }
  function hut(x, base) {
    at2(x, base, () => {
      px(-14, -12, 28, 12, "#8a5a3a"); px(-14, -12, 28, 1, "#6b4426"); px(-3, -9, 6, 9, "#2a1a10");
      for (let i = 0; i < 9; i++) px(-17 + i, -13 - i, 34 - 2 * i, 1, i % 2 ? "#a4782e" : "#c49a4a");
    });
  }
  function stall(x, base, t) {
    at2(x, base, () => {
      px(-14, -18, 1, 18, "#5e3b1a"); px(13, -18, 1, 18, "#5e3b1a");
      for (let i = 0; i < 30; i++) px(-15 + i, -21 + (i % 6 < 3 ? 0 : 1), 1, 4, i % 6 < 3 ? "#16a085" : "#f2ead6");
      px(-12, -8, 24, 2, "#8a5a2b");
    });
  }
  function scene(t) {
    const r = R(), lim = r.time, sunK = S.phase === "walk" ? 1 - S.left / lim : S.phase === "sunset" ? 1 : S.phase === "bought" ? Math.min(0.85, 1 - S.left / lim) : 0.05;
    const sky1 = sunK < 0.6 ? mix("#7fc4f0", "#f0a860", sunK / 0.6) : mix("#f0a860", "#3a2a5c", (sunK - 0.6) / 0.4);
    const sky2 = sunK < 0.6 ? mix("#cfe9f8", "#f8d890", sunK / 0.6) : mix("#f8d890", "#8a4a6a", (sunK - 0.6) / 0.4);
    for (let i = 0; i < 8; i++) px(0, i * 14, W, 15, mix(rgbHex(sky1), rgbHex(sky2), i / 7));
    disc(196, 18 + sunK * 92, 9, sunK < 0.7 ? "#ffe680" : "#ff8a4a");
    const cam = Math.max(0, Math.min(144, wx() - 100));
    // far hills and palms (parallax)
    for (let x = 0; x < W; x++) { const h = 10 + Math.sin((x + cam * 0.4) * 0.05) * 5 + Math.sin((x + cam * 0.4) * 0.13) * 2; px(x, 112 - h, 1, h, sunK > 0.8 ? "#3a4a3a" : "#5f8a4a"); }
    for (let i = 0; i < 6; i++) { const x = ((i * 70 + 20) - cam * 0.7); if (x < -20 || x > W + 20) continue; for (let k = 0; k < 16; k++) px(x + Math.round(Math.sin(k / 16 * 1.4) * 3), 112 - k, 2, 1, "#5e3b1a"); for (const [dx, dy] of [[-6, 1], [-4, -1], [5, 1], [3, -2]]) for (let k = 0; k <= 5; k++) px(x + 3 + Math.round(dx * k / 5), 96 + Math.round(dy * k / 5 + (k > 2 ? (k - 2) * 0.6 : 0)), 2, 1, k % 2 ? "#2f7d4a" : "#8fd16a"); }
    px(0, 112, W, H - 112, "#c98a52"); px(0, 124, W, 10, "#d9a066");
    for (let i = 0; i < 30; i++) { const x = (hash(i) * 384 - cam); if (x > -2 && x < W) px(x, 114 + hash(i + 9) * 44, 2, 1, "#b5763f"); }
    // hut + grandmother + her jar; the stall with the seller and the goat
    hut(30 - cam, 124);
    at2(66 - cam, 126, () => { folk({ cloth: "#7d3c98", wrap: "#ffd23f", face: 1, hair: "#d8d8d8" }); jar(-6, 0); });
    stall(352 - cam, 126, t);
    at2(352 - cam, 126, () => folk({ cloth: "#16a085", wrap: "#c0392b", face: -1 }));
    if (S.phase !== "bought") at2(372 - cam, 128, () => goat(-1, Math.floor(t * 3) % 2));
    for (const p of S.spilled) px(p.x - cam, p.y, 2, 1, SHELL);
    // the player
    const k = kg(), sx = Math.round(S.sway * 4 * Math.sin(S.swayT * 9)), facing = S.dir;
    const down = S.stagger > 0 && k >= HEAVY;   // after a spill: the basket is on the ground while you scoop the shells back in
    at2(wx() - cam, 128, () => {
      folk({ cloth: "#2e86c1", face: facing, walk: !down, step: S.steps, arms: k >= HEAVY && !down ? "up" : null });
      if (k >= HEAVY) {   // head-load basket, heaped with shells
        const bw = Math.round(8 + k * 0.4), bh = Math.round(3 + k * 0.15), bx = down ? (facing > 0 ? 3 : -3 - bw) : -bw / 2 + sx, by = down ? -bh : -19 - bh;
        px(bx, by, bw, bh, "#b8862e"); px(bx, by, bw, 1, "#d9a84a");
        for (let i = 0; i < bw - 2; i += 2) px(bx + 1 + i, by - 1 - (i % 4 ? 1 : 0), 2, 1, SHELL);
      } else if (k > 0) { px(2, -9, 3, 4, "#8a5a2b"); px(2, -9, 3, 1, SHELL); }
    });
    if (S.phase === "bought") at2(wx() - cam - 16 * S.dir, 128, () => goat(S.dir, 0));
    for (const p of S.parts) px(p.x - cam, p.y, 2, 1, SHELL);
    // sway meter over the player's head
    if ((S.phase === "walk" || S.phase === "tut") && k >= HEAVY && !down) {
      const mx = wx() - cam - 12, my = 66 - k * 0.3;
      px(mx, my, 24, 5, "#1a1026"); px(mx + 1, my + 1, Math.round(22 * Math.min(1, S.sway)), 3, mustWait() ? "#ff5a5a" : "#8fd16a");
    }
    if (sunK > 0.75) px(0, 0, W, H, `rgba(20,10,40,${(sunK - 0.75) * 1.4})`);
    if (S.msgT > 0) {   // short messages only (one glance); big when they fit
      g.textAlign = "center"; g.font = "16px Silkscreen";
      if (g.measureText(S.msg).width > W - 12) g.font = "8px Silkscreen";
      g.fillStyle = "#1a1026"; g.fillText(S.msg, W / 2 + 1, 37); g.fillStyle = S.msgC || "#ffd23f"; g.fillText(S.msg, W / 2, 36); g.textAlign = "left";
    }
  }
  function rgbHex(c) { if (c[0] === "#") return c; const [r, gg, b] = c.match(/\d+/g).map(Number); return "#" + [r, gg, b].map((v) => v.toString(16).padStart(2, "0")).join(""); }
  const wx = () => 86 + S.x * 232;

  /* ---------- flow: start → card → walk → bought / sunset → next card … → result ---------- */
  function panel(html, res = false) { ui.innerHTML = html ? `<div class="panel">${html}</div>` : ""; ui.classList.toggle("cw-res", res); }   // cw-res: the tall result panel
  function startPanel() {
    S.phase = "idle";
    const b = decode(S.best);
    panel(`<h3>GOAT MONEY</h3><p>Buy one goat before sunset, in the 1840s, 1871 and 1890. You pay in cowrie shells.</p>
      <p class="muted">${TOUCH ? "Tap the big button to step." : "Space, → or click to step."} Heavy loads spill if you rush.</p>
      <div class="row">${tutDone ? `<button class="btn ghost" data-tut>PRACTICE</button>` : ""}<button class="btn" data-go>START</button></div>
      ${S.best ? `<p class="muted">Best: ${b.goats} goat${b.goats === 1 ? "" : "s"}${b.goats === 3 ? ` · ${b.spare.toFixed(1)} s to spare` : ""}</p>` : ""}`);
    ui.querySelector("[data-go]").onclick = start;
    const t = ui.querySelector("[data-tut]"); if (t) t.onclick = () => { Chip.sfx("pop"); panel(""); play(true); tutorial(); };
  }
  function start() {
    Chip.sfx("pop");
    Object.assign(S, { r: 0, goats: 0, got: [], log: [], spilled: [] });
    panel(""); play(true);
    if (!tutDone) tutorial(); else showCard();
  }
  // Phones: the run takes over the screen (portrait or sideways); the menus come back to the page after.
  const PHONE = Ep02.PHONE;
  function play(on) {
    if (PHONE) document.body.classList.toggle("cw-play", on);
    hud.hidden = tapBtn.hidden = !on; coach.hidden = true;
    if (on && !PHONE) game.scrollIntoView({ block: "start", behavior: "smooth" });   // desktop: the canvas, the coach and the button all in view
  }

  /* ---------- the try-it tutorial: one instruction at a time, the sun stands still, nothing is lost ---------- */
  const TUT = [
    null,
    { say: TOUCH ? "Tap the yellow button.<br>One tap = one step." : "Press Space (or click the button).<br>One press = one step.", need: 1 },
    { say: TOUCH ? "Now <b>hold</b> it down.<br>You keep walking." : "Now <b>hold</b> Space down.<br>You keep walking.", need: 2 },
    { say: "A <b>20 kg</b> basket of shells!<br>Step only when it says <b class=\"ok\">STEP</b>.<br>On <b class=\"no\">WAIT</b> it spills.", need: 3 },
    { say: "Good! Now the real thing.<br>Buy a goat <b>before sunset</b>.", need: 0 },
  ];
  function tutorial() {
    Object.assign(S, { phase: "tut", r: 0, g: 1, tut: 0, carry: 2000, delivered: 0, x: 0, dir: 1, sway: 0, stagger: 0, steps: 0, lastStep: 0, holding: false, parts: [], spilled: [], msgT: 0, left: ROUNDS[0].time });
    Chip.song(Chip.SONGS.cowries);
    hud.hidden = true; coach.hidden = false;
    tutStep(1);
  }
  function tutStep(n) {
    S.tut = n; S.tutN = 0; S.tutTaps = 0; S.holding = false; S.tutAt = performance.now();
    if (n === 3) { S.g = 2; S.carry = CAP; S.sway = 0; Chip.sfx("thud"); }
    const t = TUT[n], dots = t.need > 1 ? `<span class="cw-dots">${"<i></i>".repeat(t.need)}</span>` : "";
    coach.innerHTML = `<p class="cw-tag pixel">PRACTICE ${n < 4 ? `${n}/3` : "✓"}</p><p class="cw-say">${t.say}</p>${dots}
      ${n < 4 ? `<button class="cw-skip" data-skip>skip practice ›</button>` : ""}`;
    const sk = coach.querySelector("[data-skip]"); if (sk) sk.onclick = (e) => { e.stopPropagation(); endTutorial(); };
    renderBtn(true);
  }
  function tutCount() {   // one more good try of the current instruction
    const t = TUT[S.tut]; if (!t || !t.need) return;
    S.tutN++;
    coach.querySelectorAll(".cw-dots i").forEach((d, i) => d.classList.toggle("on", i < S.tutN));
    if (S.tutN >= t.need) { const n = S.tut; S.tut = -n; Chip.sfx("chime"); setTimeout(() => { if (S.phase === "tut" && S.tut === -n) tutStep(n + 1); }, 650); }
  }
  function endTutorial() {
    tutDone = true; try { localStorage.setItem(TUT_KEY, "1"); } catch {}
    Object.assign(S, { g: 0, tut: 0, holding: false, spilled: [], parts: [] });
    coach.hidden = true; coach.innerHTML = ""; hud.hidden = false;
    Object.assign(S, { r: 0, goats: 0, got: [], log: [] });
    showCard();
  }

  function jarHTML(f, first) {
    const txt = first ? `Grandmother saved <b>2,000 shells</b> in her jar. That's <b>1 goat</b>. She keeps them.`
      : `Grandmother's jar: still <b>2,000 shells</b>. Now that's <b>${f > 0.15 ? "1/5 of a goat" : "1/10 of a goat"}</b>.`;
    return `<div class="cw-jar"><canvas class="px" width="64" height="24" data-f="${f}"></canvas><span>${txt}</span></div>`;
  }
  function lastRoundLine() {   // how the round before went, so nobody has to read it while the sun is moving
    const p = S.log[S.r - 1]; if (!p) return "";
    const y = ROUNDS[S.r - 1].short;
    return p.ok ? `<p class="cw-prev ok">✓ ${y}: goat bought${p.left >= 0.05 ? `, ${p.left.toFixed(1)} s of sun to spare` : ""}${p.spills ? ` · ${p.spills} spill${p.spills === 1 ? "" : "s"}` : ""}</p>`
      : `<p class="cw-prev no">✗ ${y}: the sun set. No goat.</p>`;
  }
  function showCard() {
    const r = R(); Object.assign(S, { phase: "card", delivered: 0, carry: 0, left: r.time, x: 0, dir: 1, parts: [], spilled: [], g: 0, holding: false }); renderHud();
    const lines = S.r === 0
      ? `<p>A goat costs <b>1 silver dollar</b>.<br>That's <b class="gold">2,000 shells</b>: a 2 kg pouch.</p>${jarHTML(r.jar, true)}`
      : S.r === 1
        ? `<p>Same goat. Same silver dollar.<br>Now: <b class="gold">10,000 shells</b>.<br>20 kg on your head.</p>${jarHTML(r.jar)}<p class="cw-tip">Step on <b class="ok">STEP</b>. Wait on <b class="no">WAIT</b>.</p>`
        : `<p>Same goat. Same silver dollar.<br>Now: <b class="gold">20,000 shells</b>. 40 kg.</p><p class="cw-tip">Too much for one head: <b>two trips</b>.<br>Carry 10,000, walk home, carry 10,000.</p>${jarHTML(r.jar)}`;
    card.innerHTML = `<div class="cw-in">${lastRoundLine()}<p class="cw-year pixel">${r.year}</p>${lines}<p class="cw-sun pixel">SUNSET IN ${r.time} s</p><button class="btn cw-go" data-go>GO ›</button></div>`;
    card.hidden = false;
    card.querySelectorAll("canvas[data-f]").forEach(drawJarGoat);
    const shown = performance.now();   // a mashing thumb must not skip the jar: ignore taps for the first 0.9 s
    const goBtn = card.querySelector("[data-go]"); goBtn.disabled = true; setTimeout(() => { goBtn.disabled = false; }, 900);
    const go = () => { if (performance.now() - shown < 900) return; card.hidden = true; card.onclick = null; beginRound(); };
    card.onclick = go;
    Chip.song(Chip.SONGS[r.song]);
  }
  function drawJarGoat(c) {
    const f = +c.dataset.f, x = c.getContext("2d"); x.imageSmoothingEnabled = false;
    const P = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    for (let i = 0; i < 16; i++) { const u = i / 16, hw = Math.round(u > 0.85 ? 3 : 3 + 4 * Math.sin(Math.PI * u / 0.85)); P(10 - hw, 22 - i, hw * 2, 1, i % 3 ? "#a0522d" : "#8a4322"); }
    P(7, 5, 6, 1, SHELL);
    P(20, 11, 6, 2, "#ab9fcb"); P(20, 14, 6, 2, "#ab9fcb");   // "="
    const gx = 32, cut = gx + 2 + Math.max(2, Math.round(23 * f));   // goat spans gx+2..gx+25
    const goatPx = [[gx + 2, 8, 18, 8], [gx + 18, 3, 7, 7], [gx + 19, 0, 1, 3], [gx + 23, 0, 1, 3], [gx + 3, 16, 2, 6], [gx + 8, 16, 2, 6], [gx + 13, 16, 2, 6], [gx + 17, 16, 2, 6]];
    for (const [a, b, w, h] of goatPx) { const w1 = Math.max(0, Math.min(w, cut - a)); if (w1) P(a, b, w1, h, "#ffd23f"); if (w - w1 > 0) P(a + w1, b, w - w1, h, "#4a3d70"); }
  }
  function beginRound() {
    const r = R();
    Object.assign(S, { phase: "walk", x: 0, dir: 1, delivered: 0, carry: Math.min(CAP, r.shells), sway: 0, stagger: 0, left: r.time, steps: 0, walk: 0, trips: 1, spills: 0, holdNext: 0, lastStep: 0, parts: [], spilled: [], msgT: 0, g: 0 });
    flash("→ TO THE GOAT", "#ffd23f", 1.6);
    renderHud(); renderBtn(true);
  }
  function flash(msg, c, dur = 1.2) { S.msg = msg; S.msgC = c; S.msgT = dur; }
  function step() {
    if (S.phase === "card") { card.onclick && card.onclick(); return; }
    if (S.phase === "tut" && S.tut === 4) { if (performance.now() - S.tutAt > 900) { Chip.sfx("pop"); endTutorial(); } return; }   // a thumb still tapping must not skip "now the real thing"
    if ((S.phase !== "walk" && S.phase !== "tut") || S.stagger > 0 || S.tut < 0) return;
    const k = kg(), onStep = !mustWait();   // what the button said when the thumb came down
    S.sway += kick(k); S.steps++; S.walk++;
    beep(900 - 500 * Math.min(1, k / 20), 0.06, "square", 0.035);
    if (S.sway > 1) return spill();
    const now = performance.now() / 1000, f = Math.min(1, (now - S.lastStep) / FULL); S.lastStep = now;
    if (S.phase === "tut") {   // practice: walk up and down the yard, never reaching the seller
      S.x = Math.max(0, Math.min(0.75, S.x + S.dir * f / stepsFor(k)));
      if (S.x >= 0.75) S.dir = -1; else if (S.x <= 0) S.dir = 1;
      if (S.tut === 1 || (S.tut === 2 && S.holdStep) || (S.tut === 3 && onStep)) tutCount();
      else if (S.tut === 2 && !S.holdStep && ++S.tutTaps === 3) coach.querySelector(".cw-say").innerHTML = TOUCH ? "Don't let go!<br>Keep your thumb <b>on</b> the button." : "Don't let go!<br>Keep Space <b>pressed down</b>.";
      else if (S.tut === 3 && !onStep) coach.querySelector(".cw-say").innerHTML = "Lucky, it didn't spill!<br>That one doesn't count.<br>Wait for <b class=\"ok\">STEP</b>.";
      return;
    }
    S.x = Math.max(0, Math.min(1, S.x + S.dir * f / stepsFor(k)));
    if (S.dir > 0 && S.x >= 1) arriveSeller();
    else if (S.dir < 0 && S.x <= 0) arriveHut();
    renderHud();
  }
  // A spill costs time, not shells: you put the basket down and scoop them back in (SCOOP seconds).
  function spill() {
    S.sway = 0; S.stagger = SCOOP; S.spills = (S.spills || 0) + 1; S.holding = false;
    for (let i = 0; i < 14; i++) S.parts.push({ x: wx() + (Math.random() - 0.5) * 8, y: 88, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40 });
    flash("SPILL!", "#ff5a5a", SCOOP);
    Chip.sfx("clink"); setTimeout(() => Chip.sfx("clink"), 90); setTimeout(() => Chip.sfx("thud"), 160);
    if (navigator.vibrate) try { navigator.vibrate(60); } catch {}
    if (S.phase === "tut") coach.querySelector(".cw-say").innerHTML = "Spilled! Too fast.<br>Wait until it says <b class=\"ok\">STEP</b>.";
    renderBtn(true);
  }
  function arriveSeller() {
    S.delivered += S.carry; S.carry = 0; S.dir = -1;
    const r = R();
    if (S.delivered >= r.shells) return buy();
    Chip.sfx("chime");
    flash("← HOME FOR MORE", "#ffd23f", 1.8);
  }
  function arriveHut() {
    S.carry = Math.min(CAP, R().shells - S.delivered); S.dir = 1; S.trips++; S.sway = 0;
    Chip.sfx("pop"); flash("LOADED! →", "#f4ecff", 1.2);
  }
  function buy() {
    S.goats++; S.got.push(S.r); S.phase = "bought"; S.end = 0; S.holding = false;
    S.log[S.r] = { ok: true, left: S.left, steps: S.steps, trips: S.trips, spills: S.spills };
    Chip.sfx("chime"); bleat();
    flash("GOAT BOUGHT!", "#8fd16a", 2.2);
    renderHud(); renderBtn(true);
  }
  function sunset() {
    S.phase = "sunset"; S.end = 0; S.holding = false;
    S.log[S.r] = { ok: false, left: 0, steps: S.steps, trips: S.trips, spills: S.spills };
    Chip.sfx("sad"); flash("SUNSET!", "#ff8a7a", 2.4);
    renderHud(); renderBtn(true);
  }
  function nextRound() {
    if (S.r < ROUNDS.length - 1) { S.r++; showCard(); } else finish();
  }
  function renderHud() {
    const r = R(), k = kg();
    hud.innerHTML = `<span class="cw-y pixel">${r.short}</span>
      <span><small>PAID</small><b>${fmt(Math.min(S.delivered, r.shells))}</b><small>of ${fmt(r.shells)}</small></span>
      <span><small>LOAD</small><b>${k ? (k < 10 ? k.toFixed(1) : Math.round(k)) + " kg" : "–"}</b></span>
      <span class="${S.left < 6 && S.phase === "walk" ? "bad" : ""}"><small>SUN</small><b>${Math.ceil(S.left)} s</b></span>`;
  }
  // The big button tells you when to step: STEP (gold) or WAIT (red, with the sway filling a bar) for heavy loads.
  const lbl = tapBtn.querySelector(".cw-lbl"), sub = tapBtn.querySelector("small"), meter = tapBtn.querySelector(".cw-meter"), fill = meter.querySelector("i");
  let btnKey = "";
  function renderBtn(force) {
    const k = kg(), heavy = k >= HEAVY && (S.phase === "walk" || S.phase === "tut") && S.tut !== 4;
    let state = "step", text = "STEP", small = TOUCH ? "tap · or hold" : "Space · or hold";
    if (S.phase === "tut" && S.tut === 4) { state = performance.now() - S.tutAt > 900 ? "go" : "idle"; text = "START ›"; small = "the 1840s"; }
    else if (S.phase === "bought" || S.phase === "sunset" || S.tut < 0) { state = "idle"; text = S.phase === "sunset" ? "SUNSET" : "✓"; small = S.phase === "tut" ? "" : `goats: ${S.goats} of 3`; }
    else if (S.stagger > 0) { state = "wait"; text = "WAIT"; small = "picking up shells…"; }
    else if (heavy && mustWait()) { state = "wait"; text = "WAIT"; small = "the load is swaying"; }
    else if (heavy) small = "tap · or hold";
    if (heavy) fill.style.width = `${Math.round(100 * Math.min(1, S.sway))}%`;
    const key = state + text + small + heavy;
    if (!force && key === btnKey) return;
    btnKey = key;
    tapBtn.dataset.state = state; lbl.textContent = text; sub.textContent = small; meter.hidden = !heavy;
  }

  function finish() {
    play(false);
    S.phase = "result";
    const last = S.log[2] || {}, first = S.log[0] || {}, spare = last.ok ? last.left : 0;
    const score = S.goats * 1000 + Math.round(spare * 10);
    const newBest = score > S.best;
    if (newBest) { S.best = score; try { localStorage.setItem("wth-ep02-cowries-best", score); } catch {} }
    Chip.song(Chip.SONGS.mystery);
    const head = last.ok ? `${S.goats} GOAT${S.goats === 1 ? "" : "S"} · ${spare.toFixed(1)} s TO SPARE` : `SUNSET · ${S.goats} GOAT${S.goats === 1 ? "" : "S"}`;
    const taps = (l) => (l.steps ? `${l.steps} steps` : ""), most = Math.max(1, first.steps || 0, last.steps || 0);
    const bar = (l) => `<i style="width:${Math.max(4, Math.round(100 * (l.steps || 0) / most))}%"></i>`;   // bar = steps walked
    panel(`<h3>${head}</h3>
      ${last.ok ? `<p>Same goat, same silver dollar.</p>` : `<p>Twenty thousand shells is a lot to carry before the market closes. The seller would rather have the silver dollar. Wouldn't you?</p><p class="muted">Tip: tap only when the button says STEP, or just hold it down.</p>`}
      <div class="cw-cmp">
        <div><b class="gold">1840s</b>2,000 shells · 2 kg<br><span class="muted">${taps(first)}</span>${bar(first)}</div>
        <div><b class="bad">1890</b>20,000 shells · 40 kg<br><span class="muted">${last.trips || 2} trips · ${taps(last)}</span>${bar(last)}</div>
      </div>
      <p>Grandmother's <b>2,000 shells</b> bought a goat in the 1840s. By 1890: <b>a tenth of one</b>. She never spent a shell. Why? Traders shipped in <b>billions</b> of cheap shells, so each shell bought less.</p>
      <p class="cw-real"><b>In real life:</b> like €2,000 saved in a drawer that, a lifetime later, buys what €200 used to.</p>
      <p class="muted cw-note">Real: shells per silver dollar on the Dahomey coast (about 2,000, 10,000, 20,000). Game: the goat's price, the loads, the timer.${newBest ? " · New best!" : ""}</p>
      <div class="row"><button class="btn ghost" data-again>${last.ok ? "PLAY AGAIN" : "TRY AGAIN"}</button><button class="btn" data-done>CONTINUE</button></div>`, true);
    ui.querySelector("[data-again]").onclick = () => { Chip.sfx("pop"); start(); };
    ui.querySelector("[data-done]").onclick = () => { panel(""); S.phase = "done"; Chip.stop(); revealWren(); };
    Chip.sfx(last.ok ? "chime" : "sad");
    (ui.firstElementChild || ui).scrollIntoView({ block: PHONE ? "start" : "center" });   // phones: the panel's top at the top, so its buttons fit too
  }
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false;
    Art.drawPortrait($("#wren-portrait"), "wren", 0);
    const n = Ep02.next(), link = $("#wren-next");
    link.innerHTML = n ? `<a class="btn" href="${n.href}">NEXT: ${n.name.toUpperCase()} →</a>` : `<span class="muted">Next: is there money with no cave? <span class="pixel">(coming soon)</span></span>`;
    $("#wren-card").scrollIntoView({ behavior: "smooth", block: "center" });
    Ep02.done("cowries");
    startPanel();
  }

  /* ---------- input: one button. Tap = one step; hold = steady safe steps ---------- */
  const live = () => S.phase === "walk" || S.phase === "card" || S.phase === "tut";
  function down(e) {
    if (!live()) return;
    if (e) e.preventDefault();
    if (S.phase === "card" || (S.phase === "tut" && S.tut === 4)) { step(); return; }
    S.holding = true; S.holdNext = holdDt(kg()); step();
  }
  const up = () => { S.holding = false; };
  tapBtn.addEventListener("pointerdown", down);
  cv.addEventListener("pointerdown", (e) => { if (S.phase === "walk" || S.phase === "tut") down(e); });
  addEventListener("pointerup", up); addEventListener("pointercancel", up);
  addEventListener("keydown", (e) => {
    if (![" ", "ArrowRight", "Enter", "d", "D"].includes(e.key)) return;
    if (!live()) return;
    e.preventDefault(); if (!e.repeat) down();
  });
  addEventListener("keyup", (e) => { if ([" ", "ArrowRight", "Enter", "d", "D"].includes(e.key)) up(); });
  tapBtn.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- loop ---------- */
  function update(dt) {
    S.swayT += dt;
    S.msgT = Math.max(0, S.msgT - dt);
    S.sway *= Math.exp(-dt / TAU);
    if (S.stagger > 0) { S.stagger = Math.max(0, S.stagger - dt); if (!S.stagger) S.spilled = []; }   // scooped back in
    for (const p of S.parts) { p.vy += 160 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y >= 120 + (p.x % 5)) { S.spilled.push({ x: p.x, y: 120 + (p.x % 5) }); p.dead = true; } }
    S.parts = S.parts.filter((p) => !p.dead);
    if (S.holding && (S.phase === "walk" || S.phase === "tut")) { S.holdNext -= dt; if (S.holdNext <= 0) { S.holdNext = holdDt(kg()); S.holdStep = true; step(); S.holdStep = false; } }
    if (S.phase === "walk") {
      S.left -= dt;
      if (S.left <= 0 && S.phase === "walk") { S.left = 0; sunset(); }
      if (Math.ceil(S.left) !== S._lastSec) { S._lastSec = Math.ceil(S.left); renderHud(); if (S.left < 5 && S.left > 0) Chip.sfx("pop"); }
    } else if (S.phase === "bought") {
      S.end += dt; S.x = Math.max(0, S.x - dt * 0.35); S.swayT += dt;
      if (S.end > 2.2) nextRound();
    } else if (S.phase === "sunset") {
      S.end += dt; if (S.end > 2.4) nextRound();
    }
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); scene(now / 1000); renderBtn();
    requestAnimationFrame(frame);
  }
  if (TOUCH) $("#cw-hint").textContent = "Tap the big button to step, or hold it.";
  startPanel(); renderHud(); play(false);
  requestAnimationFrame(frame);
  if (params.has("done")) revealWren();
  window.__cw = S; window.__cwStep = step;
})();
