/* EP 02 · Chapter 1 minigame: Canoe run.
   Pick a stone, paddle it from Palau to Yap through reefs and a storm, then watch O'Keefe's
   ship sail past with ten. Few stones ever made it home, so each was precious; his made them common. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const cv = $("#canoe"), g = cv.getContext("2d"), ui = $("#game-ui");
  const W = cv.width, H = cv.height;
  g.imageSmoothingEnabled = false;
  const params = new URLSearchParams(location.search);

  // Values for the ~2-foot stone are Furness's (a big pig or fifty baskets); the others are game numbers.
  const STONES = {
    small: { name: "SMALL", spans: 1, r: 4, baskets: 10, steer: 125, desc: "light, nimble, worth ~10 baskets" },
    medium: { name: "MEDIUM", spans: 3, r: 7, baskets: 50, steer: 90, desc: "~2 ft · a big pig, or 50 baskets" },
    large: { name: "LARGE", spans: 6, r: 11, baskets: 200, steer: 60, desc: "heavy, slow to steer, ~200 baskets" },
  };
  const OKEEFE_SHARE = 0.3;   // illustrative: "traded at an appropriately reduced value"
  const RUN = 35;             // seconds of paddling
  const HEARTS = 4;

  const S = { phase: "pick", stone: null, y: H / 2, target: H / 2, hearts: 3, t: 0, dist: 0, rocks: [], hitAt: -9, next: 1, keys: {}, best: 0, end: 0 };
  try { S.best = +localStorage.getItem("wth-ep02-yap-best") || 0; } catch {}

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

  /* ---------- UI panels ---------- */
  function panel(html) { ui.innerHTML = html ? `<div class="panel">${html}</div>` : ""; }
  function pickPanel() {
    S.phase = "pick";
    panel(`<h3>CHOOSE YOUR STONE</h3><p>It's about 450 km from Palau to Yap, in a canoe.</p>
      <div class="choices">${Object.entries(STONES).map(([k, s], i) => `<button class="choice" data-k="${k}"><span class="t">${i + 1} · ${s.name}</span><span class="d">${s.desc}</span></button>`).join("")}</div>
      ${S.best ? `<p class="muted">Best haul so far: ${S.best} baskets</p>` : ""}`);
    ui.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => start(b.dataset.k)));
  }
  function start(k) {
    Chip.sfx("pop");
    Object.assign(S, { phase: "run", stone: STONES[k], y: H * 0.6, target: H * 0.6, hearts: HEARTS, t: 0, dist: 0, rocks: [], hitAt: -9, next: 1.2, end: 0, sunk: false });
    panel("");
    if (PHONE) playMode(true);
    Chip.song(Chip.SONGS.yap);
  }
  // Phones: the run takes over the whole screen (and asks to turn sideways); menus return to the page.
  const PHONE = Ep02.PHONE, playMode = Ep02.playMode;
  function finish() {
    if (PHONE) playMode(false);
    const s = S.stone, sunk = S.sunk, value = sunk ? 0 : s.baskets, ok = Math.round(s.baskets * OKEEFE_SHARE);
    S.phase = "result";
    if (value > S.best) { S.best = value; try { localStorage.setItem("wth-ep02-yap-best", value); } catch {} }
    Chip.song(Chip.SONGS.mystery);
    panel(sunk ? `<h3>LOST AT SEA</h3>
        <p>The storm took your ${s.name.toLowerCase()} stone. It's on the bottom of the ocean now.</p>
        <p class="long">On Yap, that might not even matter. Furness heard of a family whose fortune was a stone lost in a storm generations earlier, and <b>the village still counted it</b>.</p>
        <p class="short">On Yap, a stone lost at sea <b>could still count</b> as someone's fortune.</p>
        <p>Meanwhile O'Keefe's ship brought <b>ten</b> that trip. One the size of yours traded for only ~${ok} baskets: there were suddenly lots of them.</p>
        <div class="row"><button class="btn" data-again>TRY AGAIN</button><button class="btn ghost" data-done>CONTINUE</button></div>`
      : `<h3>HOME, WITH A ${s.name} STONE</h3>
        <p>You risked your crew and your canoe. Then O'Keefe's sailing ship went past with <b>ten</b>.</p>
        <div class="versus">
          <div><b class="gold">YOUR STONE</b>worth ~${value} baskets of food<div class="bar"><span class="fill" style="width:100%"></span></div></div>
          <div><b class="muted">AN O'KEEFE STONE, SAME SIZE</b>worth ~${ok} baskets: a ship could bring ten at a time<div class="bar"><span class="fill" style="width:${OKEEFE_SHARE * 100}%;background:var(--muted)"></span></div></div>
        </div>
        <p class="muted" style="font-size:13px">"~${ok}" is a game number. The sources only say his stones traded for "an appropriately reduced value".</p>
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
  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (S.phase === "pick" && ["1", "2", "3"].includes(k)) start(Object.keys(STONES)[+k - 1]);
    if (S.phase === "run" && ["arrowup", "arrowdown", "w", "s"].includes(k)) { S.keys[k] = true; e.preventDefault(); }
  });
  addEventListener("keyup", (e) => { S.keys[e.key.toLowerCase()] = false; });
  const pointerY = (e) => { const r = cv.getBoundingClientRect(); return Math.max(0, Math.min(H, (e.clientY - r.top) / r.height * H)); };
  // the whole game box takes drags, so on a phone the black bars around the sea steer too
  $("#game").addEventListener("pointerdown", (e) => { if (S.phase === "run") { S.drag = true; S.target = pointerY(e); } });
  addEventListener("pointermove", (e) => { if (S.drag && S.phase === "run") S.target = pointerY(e); });
  addEventListener("pointerup", () => { S.drag = false; });
  if (matchMedia("(pointer: coarse)").matches) $("#steer-hint").innerHTML = "Drag up and down on the sea to steer.";

  /* ---------- simulation ---------- */
  const TOP = 56, BOT = H - 12;
  function update(dt) {
    if (S.phase === "run") {
      S.t += dt;
      const storm = Math.min(1, Math.max(0, (S.t - 12) / 6)), speed = 70 + 40 * (S.t / RUN) + 20 * storm;
      S.dist += speed * dt;
      // steering: keys nudge the target, the boat eases toward it at the stone's steer rate
      const k = S.keys;
      if (k.arrowup || k.w) S.target -= 170 * dt;
      if (k.arrowdown || k.s) S.target += 170 * dt;
      S.target = Math.max(TOP, Math.min(BOT, S.target));
      const dy = S.target - S.y, step = S.stone.steer * dt;
      S.y += Math.abs(dy) < step ? dy : Math.sign(dy) * step;
      // reefs
      S.next -= dt;
      if (S.next <= 0 && S.t < RUN - 3) {
        const n = 1 + (Math.random() < 0.15 + 0.3 * storm ? 1 : 0);
        for (let i = 0; i < n; i++) S.rocks.push({ x: W + 20 + i * 30, y: TOP + Math.random() * (BOT - TOP), s: 4 + Math.random() * 5 });
        S.next = Math.max(0.7, 1.5 - S.t * 0.02 - storm * 0.25);
      }
      for (const r of S.rocks) r.x -= speed * dt;
      S.rocks = S.rocks.filter((r) => r.x > -30);
      const hx = 60, hr = 10 + S.stone.r * 0.3;
      if (S.t - S.hitAt > 1.6) for (const r of S.rocks) {
        if (Math.abs(r.x - hx) < hr + r.s * 0.8 && Math.abs(r.y - S.y + 4) < r.s * 0.6 + 4) {
          S.hearts--; S.hitAt = S.t; Chip.sfx("thud");
          if (S.hearts <= 0) { S.sunk = true; S.phase = "sinking"; S.end = S.t; Chip.sfx("splash"); }
          break;
        }
      }
      if (S.t >= RUN && S.phase === "run") { S.phase = "arrive"; S.end = S.t; Chip.sfx("chime"); }
    } else if (S.phase === "arrive" || S.phase === "sinking") {
      S.t += dt; S.dist += 40 * dt;
      for (const r of S.rocks) r.x -= 60 * dt;
      if (S.t - S.end > (S.phase === "arrive" ? 5 : 2.2)) finish();
    }
  }

  function draw(now) {
    const t = now / 1000;
    if (S.phase === "pick" || S.phase === "done" || (S.phase === "result" && !S.stone)) {
      seaBg(t, 0); S.dist += 0.4;
      island(205, 70);
      canoe(150, 110 + Math.sin(t * 2) * 1.5, t, STONES.medium);
      return;
    }
    const storm = S.phase === "run" ? Math.min(1, Math.max(0, (S.t - 12) / 6)) * (S.t > RUN - 6 ? Math.max(0, (RUN - S.t) / 3) : 1) : 0;
    const shake = S.t - S.hitAt < 0.25 ? Math.round(Math.sin(S.t * 90) * 2) : 0;
    g.save(); g.translate(shake, 0);
    seaBg(t, storm);
    const home = !S.sunk && (S.phase === "arrive" || S.phase === "result");   // a lost run stays out at sea
    if (home) {
      const k = Math.min(1, (S.t - S.end) / 2);
      island(W - 120 * k, 66);
      const sk = (S.t - S.end - 1.2) / 3.5;
      if (sk > 0) schooner(-60 + sk * (W + 120), 92, t);
    }
    for (const r of S.rocks) rock(r);
    const sinking = S.phase === "sinking" ? Math.min(1, (S.t - S.end) / 1.5) : 0;
    const bx = home ? 60 + Math.min(1, (S.t - S.end) / 2) * 120 : 60;
    const blink = S.t - S.hitAt < 1.6 && Math.floor(S.t * 12) % 2;
    if (!blink) canoe(bx, S.y + Math.sin(t * 3) * 1.2, t, sinking || S.sunk ? null : S.stone, storm * 4 * Math.sin(t * 3));
    if (sinking) rai(bx, S.y + sinking * 40, S.stone.r);
    g.restore();
    // HUD: hearts, progress Palau → Yap
    for (let i = 0; i < HEARTS; i++) { const c = i < S.hearts ? "#ff5a7a" : "#3a2d5c"; px(6 + i * 10, 6, 3, 2, c); px(10 + i * 10, 6, 3, 2, c); px(6 + i * 10, 8, 7, 3, c); px(7 + i * 10, 11, 5, 1, c); px(8 + i * 10, 12, 3, 1, c); }
    const k = Math.min(1, S.t / RUN);
    px(110, 8, 140, 2, "#3a2d5c"); px(110, 8, 140 * k, 2, "#ffd23f"); px(110 + 140 * k - 2, 5, 4, 8, "#ffd23f");
    g.font = "8px Silkscreen"; g.fillStyle = "#f4ecff"; g.fillText("PALAU", 80, 12); g.fillText("YAP", 256, 12);
    if (S.phase === "run" && S.t < 2.5) { g.font = "10px Silkscreen"; g.textAlign = "center"; g.fillStyle = "#1a1026"; g.fillText("STEER: ↑ ↓  OR DRAG", W / 2, 34); g.textAlign = "left"; }
    if (storm > 0.3 && S.t < 22) { g.font = "10px Silkscreen"; g.textAlign = "center"; g.fillStyle = "#ffd23f"; g.fillText("STORM!", W / 2, 34); g.textAlign = "left"; }
    if (S.phase === "arrive" && S.t - S.end > 1.4) { g.font = "9px Silkscreen"; g.textAlign = "center"; g.fillStyle = "#1a1026"; g.fillText("…O'KEEFE'S SHIP, WITH TEN", W / 2, 34); g.textAlign = "left"; }
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
