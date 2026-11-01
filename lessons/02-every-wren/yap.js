/* EP 02 · Chapter 1 minigame: Canoe run.
   Pick a stone, paddle it from Palau to Yap through reefs and a storm, then watch O'Keefe's
   ship sail past with ten. Few stones ever made it home, so each was precious; his made them common. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#canoe"), g = cv.getContext("2d"), ui = $("#game-ui");
  const W = cv.width, H = cv.height;
  const TOP = 56, BOT = H - 12, HX = 60;   // the canoe's lane: top and bottom of the sea, and its x
  g.imageSmoothingEnabled = false;
  const params = new URLSearchParams(location.search);

  // Values for the ~2-foot stone are Furness's (a big pig or fifty baskets); the others are game numbers.
  const STONES = {
    small: { name: "SMALL", spans: 1, r: 4, baskets: 10, steer: 140, desc: "light, nimble, worth ~10 baskets" },
    medium: { name: "MEDIUM", spans: 3, r: 7, baskets: 50, steer: 105, desc: "~2 ft · a big pig, or 50 baskets" },
    large: { name: "LARGE", spans: 6, r: 11, baskets: 200, steer: 75, desc: "heavy, slow to steer, ~200 baskets" },
  };
  const OKEEFE_SHARE = 0.3;   // illustrative: "traded at an appropriately reduced value"
  const RUN = 40;             // seconds of paddling
  const HEARTS = 4;
  const TUT_KEY = "wth-ep02-yap-tut";   // "1" once the practice paddle is done (or skipped)

  const S = { phase: "pick", stone: null, y: H / 2, target: H / 2, hearts: 3, t: 0, dist: 0, rocks: [], hitAt: -9, next: 1, keys: {}, best: 0, end: 0 };
  try { S.best = +localStorage.getItem("wth-ep02-yap-best") || 0; } catch {}
  let tutDone = false;
  try { tutDone = localStorage.getItem(TUT_KEY) === "1"; } catch {}
  const TOUCH = matchMedia("(pointer: coarse)").matches;

  /* ---------- drawing kit (pixels in the 320×180 canvas) ---------- */
  const px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); } }
  function rai(cx, cy, r) {
    disc(cx + 1, cy + 1, r, "rgba(0,0,0,.35)"); disc(cx, cy, r, "#e9e3d2");
    for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); px(cx + hw - Math.max(1, r * 0.25), cy + y, Math.max(1, r * 0.25), 1, "#bdb5a0"); }
    if (r >= 3) disc(cx, cy, Math.max(1, Math.round(r * 0.22)), "#8c8471");
  }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function person(x, feet, t, cloth) {
    px(x - 2, feet - 7, 4, 3, cloth); px(x - 2, feet - 11, 4, 4, "#8a5534"); px(x - 2, feet - 15, 4, 4, "#8a5534"); px(x - 2, feet - 16, 4, 1, "#1a1010");
    px(x + 1, feet - 14, 1, 1, "#1a1010"); px(x + 2, feet - 15 - (Math.floor(t * 6) % 2), 1, 4, "#8a5534");
  }
  function canoe(x, y, t, stone, tilt = 0) {
    const w = 30;
    for (let i = 0; i < w; i++) { const dy = Math.round(tilt * (i / w - 0.5)); px(x - w / 2 + i, y + dy, 1, 2, "#8a5a2b"); px(x - w / 2 + i, y + 2 + dy, 1, 1, "#5e3b1a"); }
    px(x - w / 2 + 3, y + 6, w - 6, 1, "#5e3b1a"); px(x - 8, y + 3, 1, 3, "#5e3b1a"); px(x + 8, y + 3, 1, 3, "#5e3b1a");
    if (stone) rai(x, y - stone.r + 1, stone.r);
    person(x - 11, y, t, "#c0392b"); person(x + 11, y, t + 0.3, "#d68910");
  }
  function schooner(x, y, t) {
    y = Math.round(y + Math.sin(t * 1.6));
    for (let i = 0; i < 70; i++) { const d = i < 8 ? 8 - i : i > 64 ? i - 64 : 0; px(x - 35 + i, y + Math.floor(d / 2), 1, 8 - Math.floor(d / 2), "#4a2f19"); }
    for (const [mx, mh] of [[-12, 44], [14, 50]]) { px(x + mx, y - mh, 2, mh, "#3b2615"); px(x + mx - 14, y - mh + 4, 14, mh - 10, "#f2ead6"); px(x + mx + 2, y - mh + 8, 10, mh - 18, "#f2ead6"); }
    for (let i = 0; i < 10; i++) rai(x - 28 + (i % 5) * 12, y - 4 - Math.floor(i / 5) * 7, 4);
  }
  function rock(r) {
    const { x, y, s } = r;
    px(x - s, y - s * 0.6, s * 2, s * 1.2, "#5b5348"); px(x - s + 2, y - s * 0.6, s * 2 - 4, 2, "#8a8072");
    px(x - s - 2, y + s * 0.6 - 2, s * 2 + 4, 3, "#cfe6ff");
  }
  function seaBg(t, storm) {
    px(0, 0, W, 40, storm > 0.5 ? "#4a5770" : "#8fd0f0"); px(0, 20, W, 20, storm > 0.5 ? "#5b6b85" : "#cdebf8");
    px(0, 40, W, H - 40, storm > 0.5 ? "#173f70" : "#1d4f8a");
    for (let i = 0; i < 90; i++) {
      const y = 42 + Math.floor(hash(i) * (H - 44));
      const x = W - ((hash(i + 99) * W + S.dist * (1 + hash(i + 7))) % (W + 20)) + 10;
      px(x, y, 3 + Math.floor(hash(i + 3) * 4), 1, hash(i + 5) < 0.6 ? "#173f70" : "#4f8fd1");
    }
    if (storm > 0) for (let i = 0; i < 120 * storm; i++) px((hash(i) * W - t * 50) % W + W * (((hash(i) * W - t * 50) % W) < 0), (hash(i + 9) * H + t * 160) % H, 1, 3, "rgba(200,220,255,.45)");
  }
  function island(x, y) {   // a low sandy island with jungle and a couple of palms; x = left edge, y = waterline
    const w = 110;
    for (let i = 0; i < w; i++) { const h = Math.min(14, i * 0.4, (w - i) * 0.4); px(x + i, y - h, 1, h + 3, "#e8d39a"); }
    for (let i = 10; i < w - 10; i++) { const h = Math.min(10, (i - 10) * 0.45, (w - 10 - i) * 0.45); px(x + i, y - 4 - h, 1, h, i % 7 ? "#2f7d4a" : "#1f5a35"); }
    for (const [dx, h] of [[30, 16], [70, 20]]) {
      for (let k = 0; k < h; k++) px(x + dx + Math.round(Math.sin(k / h * 1.3) * 3), y - 10 - k, 2, 1, "#8a5a2b");
      const tx = x + dx + 3, ty = y - 10 - h;
      for (const [ex, ey] of [[-7, 2], [-5, -1], [6, 2], [4, -2]]) for (let k = 0; k <= 5; k++) px(tx + Math.round(ex * k / 5), ty + Math.round(ey * k / 5 + (k > 2 ? k - 2 : 0) * 0.6), 2, 1, k % 2 ? "#2f7d4a" : "#8fd16a");
    }
    px(x + 48, y - 18, 14, 6, "#7a5a32"); for (let k = 0; k < 6; k++) px(x + 45 + k, y - 19 - k, 20 - 2 * k, 1, k % 2 ? "#a4782e" : "#c49a4a");
  }

  // pixel helpers for the practice paddle: a pulsing ring (where to go) and chevrons (which way)
  function ring(cx, cy, r, c) { for (let a = 0; a < Math.PI * 2; a += 0.12) px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 1, c); }
  function chevron(x, y, dir, c) { for (let i = -4; i <= 4; i++) px(x + i, y - dir * Math.abs(i) * 0.75, 1, 2, c); }

  /* ---------- UI: the panel under/over the sea (menus), and the coach (lines and cards during play) ---------- */
  const coachEl = $("#yap-coach");
  let coachKey = "";
  // one line or card at a time; "low" puts it at the bottom of the sea, "card" in the middle (on a phone held upright it sits under the sea)
  function coach(key, html, where = "") {
    if (key === coachKey) return;
    coachKey = key;
    coachEl.hidden = !html;
    coachEl.className = "yap-coach" + (where ? " " + where : "");
    coachEl.innerHTML = html || "";
    coachEl.querySelectorAll("[data-skip]").forEach((b) => (b.onclick = () => { Chip.sfx("pop"); markTut(); ready(false); }));
    coachEl.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go()));
    coachEl.querySelectorAll("[data-end]").forEach((b) => (b.onclick = () => { Chip.sfx("pop"); finish(); }));
    const btn = coachEl.querySelector(".btn");
    if (btn) try { btn.focus({ preventScroll: true }); } catch {}
  }
  function panel(html) { ui.innerHTML = html ? `<div class="panel">${html}</div>` : ""; }
  function markTut() { tutDone = true; S.wantTut = false; try { localStorage.setItem(TUT_KEY, "1"); } catch {} }

  function pickPanel() {
    S.phase = "pick";
    panel(`<h3>CHOOSE YOUR STONE</h3><p>It's about 450 km from Palau to Yap, in a canoe.</p>
      <div class="choices">${Object.entries(STONES).map(([k, s], i) => `<button class="choice" data-k="${k}"><span class="t">${i + 1} · ${s.name}</span><span class="d">${s.desc}</span></button>`).join("")}</div>
      ${S.best ? `<p class="muted">Best haul so far: ${S.best} baskets</p>` : ""}
      ${tutDone ? `<button class="yap-again" data-tut>Practice steering again</button>` : S.wantTut ? `<p class="muted">Practice is on: pick a stone.</p>` : ""}`);
    ui.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => start(b.dataset.k)));
    const t = ui.querySelector("[data-tut]");
    if (t) t.onclick = () => { Chip.sfx("pop"); tutDone = false; S.wantTut = true; try { localStorage.removeItem(TUT_KEY); } catch {} pickPanel(); };
  }
  // a stone is chosen: first time, a practice paddle; after that, straight to the "ready?" card
  function start(k) {
    Chip.sfx("pop");
    Object.assign(S, { stone: STONES[k], y: H * 0.6, target: H * 0.6, hearts: HEARTS, t: 0, dist: 0, rocks: [], hitAt: -9, next: 1.5, end: 0, sunk: false, drag: null });
    panel("");
    if (PHONE) playMode(true);
    Chip.song(Chip.SONGS.yap);
    if (tutDone) ready(false); else tutStep("up");
  }

  /* ---------- the practice paddle: one instruction at a time, each waits until you've done it ---------- */
  const UPY = TOP + 10, DOWNY = BOT - 10;
  const SAY = TOUCH
    ? { up: "Drag your finger <b>up</b>.", down: "Now drag <b>down</b>.", tip: "Drag anywhere on the screen." }
    : { up: "Press <b>↑</b> to paddle up.", down: "Now press <b>↓</b>.", tip: "Or drag with the mouse. W and S work too." };
  function tutStep(step) {
    S.phase = "tut"; S.tut = step; S.tutWait = 0.6;
    const n = { up: 1, down: 2, rock: 3 }[step];
    const say = step === "up" ? `${SAY.up}<small>${SAY.tip}</small>`
      : step === "down" ? SAY.down
      : "A rock! <b>Steer around it.</b>";
    coach("tut-" + step, `<span class="step-n">PRACTICE ${n}/3</span><span class="say">${say}</span><button class="skip" data-skip>skip practice</button>`);
  }
  function ready(afterTut) {
    S.phase = "ready"; S.rocks = []; S.drag = null;
    coach("ready", `<b class="big">${afterTut ? "NICE! NOW THE REAL TRIP" : "READY?"}</b>
      <p>Bring your <b>${S.stone.name.toLowerCase()}</b> stone home to Yap.</p>
      <p><span class="hearts">♥♥♥♥</span> Hit 4 rocks and it sinks.</p>
      <p>Halfway there: a storm.</p>
      <button class="btn" data-go>GO ▶</button>`, "card");
  }
  function go() {
    Chip.sfx("pop");
    Object.assign(S, { phase: "run", hearts: HEARTS, t: 0, dist: 0, rocks: [], hitAt: -9, next: 1.5, end: 0, sunk: false });
    coach("", "");
  }
  // Phones: the run takes over the whole screen (and asks to turn sideways); menus return to the page.
  const PHONE = Ep02.PHONE, playMode = Ep02.playMode;
  function finish() {
    if (S.phase === "result") return;
    coach("", "");
    if (PHONE) playMode(false);
    const s = S.stone, sunk = S.sunk, value = sunk ? 0 : s.baskets, ok = Math.round(s.baskets * OKEEFE_SHARE);
    S.phase = "result";
    if (value > S.best) { S.best = value; try { localStorage.setItem("wth-ep02-yap-best", value); } catch {} }
    Chip.song(Chip.SONGS.mystery);
    panel(sunk ? `<h3>LOST AT SEA</h3>
        <p>The sea took your ${s.name.toLowerCase()} stone. It's on the bottom of the ocean now.</p>
        <p class="long">On Yap, that might not even matter. Furness heard of a family whose fortune was a stone lost in a storm generations earlier, and <b>the village still counted it</b>.</p>
        <p class="short">On Yap, a stone lost at sea <b>could still count</b> as someone's fortune.</p>
        <p>Meanwhile O'Keefe's ship brought <b>ten</b>, easily. One the size of yours was worth only ~${ok} baskets: everyone knew it came the easy way.</p>
        <div class="row"><button class="btn" data-again>TRY AGAIN</button><button class="btn ghost" data-done>CONTINUE</button></div>`
      : `<h3>HOME, WITH A ${s.name} STONE</h3>
        <p>Your stone came the hard way, by canoe. O'Keefe's ship brought <b>ten</b>, easily.</p>
        <div class="versus">
          <div><b class="gold">YOUR STONE</b>worth ~${value} baskets of food<div class="bar"><span class="fill" style="width:100%"></span></div></div>
          <div><b class="muted">O'KEEFE'S, SAME SIZE</b>worth only ~${ok} baskets<div class="bar"><span class="fill" style="width:${OKEEFE_SHARE * 100}%;background:var(--muted)"></span></div></div>
        </div>
        <p>On Yap, people knew how each stone got there. The easy ones counted for less, so <b>yours kept its value</b>.</p>
        <p class="muted" style="font-size:13px">~${ok} is a game number. Old reports only say his stones were worth less.</p>
        <div class="row"><button class="btn ghost" data-again>PLAY AGAIN</button><button class="btn" data-done>CONTINUE</button></div>`);
    ui.querySelector("[data-again]").onclick = () => { Chip.sfx("pop"); pickPanel(); };
    ui.querySelector("[data-done]").onclick = () => { panel(""); S.phase = "done"; revealWren(); };
    Chip.sfx(sunk ? "sad" : "chime");
    // phones: leaving full screen resets the scroll, so wait for the layout to settle, then show the result
    if (PHONE) { const show = () => ui.scrollIntoView({ block: "start" }); requestAnimationFrame(() => requestAnimationFrame(show)); setTimeout(show, 350); }
  }
  function revealWren() {
    $("#wren-step").hidden = false; $("#wren-card").hidden = false;
    Art.drawPortrait($("#wren-portrait"), "wren", 0);
    const nx = Ep02.next(), a = $("#next-ch");
    if (nx && a) { a.href = nx.href; a.textContent = `NEXT: ${nx.name.toUpperCase()} ▶`; }
    Ep02.done("yap");   // re-renders the chapter bar: do it before scrolling, so nothing interrupts the scroll
    $("#wren-step").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- input ---------- */
  const steering = () => S.phase === "run" || S.phase === "tut";
  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (S.phase === "pick" && ["1", "2", "3"].includes(k)) start(Object.keys(STONES)[+k - 1]);
    if (steering() && ["arrowup", "arrowdown", "w", "s"].includes(k)) { S.keys[k] = true; e.preventDefault(); }
  });
  addEventListener("keyup", (e) => { S.keys[e.key.toLowerCase()] = false; });
  // drag steering is relative: move your finger up and the canoe goes up, wherever you touch (your thumb never hides the canoe)
  const GAIN = 1.3;
  $("#game").addEventListener("pointerdown", (e) => {
    if (!steering() || e.target.closest("button")) return;
    S.drag = { y0: e.clientY, t0: S.target };
  });
  addEventListener("pointermove", (e) => {
    if (!S.drag || !steering()) return;
    const r = cv.getBoundingClientRect(), raw = S.drag.t0 + (e.clientY - S.drag.y0) / r.height * H * GAIN;
    S.target = Math.max(TOP, Math.min(BOT, raw));
    if (raw !== S.target) S.drag = { y0: e.clientY, t0: S.target };   // pushing past the edge doesn't build up a dead zone
  });
  addEventListener("pointerup", () => { S.drag = null; });
  addEventListener("pointercancel", () => { S.drag = null; });
  if (TOUCH) $("#steer-hint").innerHTML = "Drag up and down to steer.";

  /* ---------- simulation ---------- */
  const stormAt = (t) => Math.min(1, Math.max(0, (t - 16) / 6)) * (t > RUN - 6 ? Math.max(0, (RUN - t) / 3) : 1);
  function steer(dt) {
    const k = S.keys;
    if (k.arrowup || k.w) S.target -= 150 * dt;
    if (k.arrowdown || k.s) S.target += 150 * dt;
    S.target = Math.max(TOP, Math.min(BOT, S.target));
    const dy = S.target - S.y, step = S.stone.steer * dt;
    S.y += Math.abs(dy) < step ? dy : Math.sign(dy) * step;
  }
  const hits = (r) => Math.abs(r.x - HX) < 10 + S.stone.r * 0.3 + r.s * 0.7 && Math.abs(r.y - S.y + 4) < r.s * 0.55 + 4;
  function update(dt) {
    if (S.phase === "tut" || S.phase === "ready") {
      S.t += dt; S.dist += 30 * dt;
      if (S.phase === "ready") return;
      steer(dt);
      S.tutWait -= dt;
      if (S.tut === "up" && S.y <= UPY + 6) { Chip.sfx("chime"); tutStep("down"); }
      else if (S.tut === "down" && S.y >= DOWNY - 6) { Chip.sfx("chime"); tutStep("rock"); }
      else if (S.tut === "rock") {
        if (!S.rocks.length && S.tutWait <= 0) S.rocks.push({ x: W + 12, y: S.y - 4, s: 8 });   // right in your lane
        for (const r of S.rocks) r.x -= 55 * dt;
        const r = S.rocks[0];
        if (r && hits(r)) {
          Chip.sfx("thud"); S.hitAt = S.t; S.rocks = []; S.tutWait = 1.2;
          coach("tut-bump", `<span class="step-n">PRACTICE 3/3</span><span class="say">Bump! Rocks break your canoe.<br><b>Try again.</b></span><button class="skip" data-skip>skip practice</button>`);
        } else if (r && r.x < HX - 26) { Chip.sfx("chime"); markTut(); ready(true); }
        else if (r && coachKey === "tut-bump") tutStep("rock");
      }
      return;
    }
    if (S.phase === "run") {
      S.t += dt;
      const storm = stormAt(S.t), speed = 45 + 20 * (S.t / RUN) + 10 * storm;   // was 70-130: a phone sea is small
      S.dist += speed * dt;
      steer(dt);
      // reefs
      S.next -= dt;
      if (S.next <= 0 && S.t < RUN - 4) {
        const n = 1 + (Math.random() < 0.05 + 0.15 * storm ? 1 : 0);
        // 1 rock in 5 heads for your lane, and rocks reach the very top and bottom: no safe spot to park the canoe
        // (before, a canoe left at the top edge was almost never hit: it reached Yap without steering)
        for (let i = 0; i < n; i++) {
          const aim = i === 0 && Math.random() < 0.2, y = aim ? S.y - 4 + (Math.random() * 2 - 1) * 6 : TOP - 6 + Math.random() * (BOT - TOP + 6);
          S.rocks.push({ x: W + 20 + i * 30, y: Math.max(TOP - 6, Math.min(BOT, y)), s: 4 + Math.random() * 5 });
        }
        S.next = Math.max(1.6, 2.5 - S.t * 0.018 - storm * 0.3);   // replica: a first-timer who watches ~1.5 s ahead loses 0-1 hearts; never steering sinks ~4 runs in 5
      }
      for (const r of S.rocks) r.x -= speed * dt;
      S.rocks = S.rocks.filter((r) => r.x > -30);
      if (S.t - S.hitAt > 1.8) for (const r of S.rocks) {
        if (hits(r)) {
          S.hearts--; S.hitAt = S.t; Chip.sfx("thud");
          if (S.hearts <= 0) { S.sunk = true; S.phase = "sinking"; S.end = S.t; Chip.sfx("splash"); }
          break;
        }
      }
      if (S.t >= RUN && S.phase === "run") { S.phase = "arrive"; S.end = S.t; Chip.sfx("chime"); }
    } else if (S.phase === "arrive" || S.phase === "sinking") {
      S.t += dt; S.dist += 40 * dt;
      for (const r of S.rocks) r.x -= 60 * dt;
      // after the clock stops: the story beats wait for a tap, nothing to read in a hurry
      const k = S.t - S.end;
      if (S.phase === "sinking") {
        if (k > 1.6) coach("sunk", `<b class="big">SUNK!</b><span class="say">The sea took your stone.</span><button class="btn" data-end>WHAT NOW? ▶</button>`, "low");
      } else if (k > SHIP_AT + 2.6) coach("ship2", `<b class="big">A SHIP WITH TEN STONES</b><span class="say">O'Keefe's ship brings ten at once. No paddling.</span><button class="btn" data-end>WHAT'S MY STONE WORTH? ▶</button>`, "low");
      else if (k > SHIP_AT) coach("ship", `<b class="big">…WAIT. WHAT'S THAT?</b>`, "low");
      else if (k > 0.3) coach("home", `<b class="big">YOU MADE IT HOME!</b>`, "low");
    }
  }
  const SHIP_AT = 2.2, SHIP_DUR = 3.5;

  function draw(now) {
    const t = now / 1000;
    if (S.phase === "pick" || S.phase === "done" || (S.phase === "result" && !S.stone)) {
      seaBg(t, 0); S.dist += 0.4;
      island(205, 70);
      canoe(150, 110 + Math.sin(t * 2) * 1.5, t, STONES.medium);
      return;
    }
    const practice = S.phase === "tut" || S.phase === "ready";
    const storm = S.phase === "run" ? stormAt(S.t) : 0;
    const shake = S.t - S.hitAt < 0.25 ? Math.round(Math.sin(S.t * 90) * 2) : 0;
    g.save(); g.translate(shake, 0);
    seaBg(t, storm);
    const home = !S.sunk && (S.phase === "arrive" || S.phase === "result");   // a lost run stays out at sea
    if (home) {
      const k = Math.min(1, (S.t - S.end) / 2);
      island(W - 120 * k, 66);
      const sk = (S.t - S.end - SHIP_AT) / SHIP_DUR;
      if (sk > 0) schooner(-60 + (1 - Math.pow(1 - Math.min(1, sk), 2)) * 170, 92, t);   // sails in and stops, so you can look at it
    }
    for (const r of S.rocks) rock(r);
    // practice: a ring where to go, chevrons pointing the way
    if (S.phase === "tut" && (S.tut === "up" || S.tut === "down")) {
      const ty = S.tut === "up" ? UPY : DOWNY, dir = S.tut === "up" ? -1 : 1, pulse = 9 + Math.sin(t * 6) * 1.5;
      ring(HX, ty - 2, pulse, "#ffd23f"); ring(HX, ty - 2, pulse + 1, "#ffd23f");
      for (let i = 0; i < 3; i++) { const yy = S.y - 6 + dir * (16 + i * 9 + ((t * 18) % 9)); if (dir * (ty - yy) > 6) chevron(HX + 26, yy, dir, "#ffd23f"); }
    }
    if (S.phase === "tut" && S.tut === "rock" && S.rocks[0]) {
      const r = S.rocks[0]; ring(r.x, r.y, r.s + 5 + Math.sin(t * 6), "#ff5a7a");
    }
    const sinking = S.phase === "sinking" ? Math.min(1, (S.t - S.end) / 1.5) : 0;
    const bx = home ? 60 + Math.min(1, (S.t - S.end) / 2) * 120 : 60;
    const blink = S.t - S.hitAt < (practice ? 0.8 : 1.8) && Math.floor(S.t * 12) % 2;
    if (!blink) canoe(bx, S.y + Math.sin(t * 3) * 1.2, t, sinking || S.sunk ? null : S.stone, storm * 4 * Math.sin(t * 3));
    if (sinking) rai(bx, S.y + sinking * 40, S.stone.r);
    g.restore();
    if (practice) return;   // the coach line sits over the sky; no clock while practising
    // HUD: hearts, progress Palau → Yap
    for (let i = 0; i < HEARTS; i++) { const c = i < S.hearts ? "#ff5a7a" : "#3a2d5c"; px(6 + i * 10, 6, 3, 2, c); px(10 + i * 10, 6, 3, 2, c); px(6 + i * 10, 8, 7, 3, c); px(7 + i * 10, 11, 5, 1, c); px(8 + i * 10, 12, 3, 1, c); }
    const k = Math.min(1, S.t / RUN);
    px(110, 8, 140, 2, "#3a2d5c"); px(110, 8, 140 * k, 2, "#ffd23f"); px(110 + 140 * k - 2, 5, 4, 8, "#ffd23f");
    g.font = "8px Silkscreen"; g.fillStyle = "#f4ecff"; g.fillText("PALAU", 80, 12); g.fillText("YAP", 256, 12);
    if (S.phase === "run" && storm > 0.3 && S.t < 26) { g.font = "12px Silkscreen"; g.textAlign = "center"; g.fillStyle = "#ffd23f"; g.fillText("STORM!", W / 2, 34); g.textAlign = "left"; }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); draw(now);
    requestAnimationFrame(frame);
  }
  pickPanel();
  requestAnimationFrame(frame);
  if (params.has("done")) revealWren();
  window.__yap = S;
})();
