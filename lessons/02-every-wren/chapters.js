/* EP 02 · shared bits for every chapter page: the chapter bar, progress, the mute button,
   and the phone "play mode" (game fills the screen, sideways if the phone allows).
   A chapter page sets <body data-ch="beads"> and loads this before its game script.
   Ep02.done("beads") marks the chapter finished (✓ in the bar); Ep02.playMode(true|false) wraps #game. */
(function () {
  "use strict";
  const CHAPTERS = [
    { ch: "yap", n: 1, name: "Yap", href: "index.html" },
    { ch: "beads", n: 2, name: "Glass beads", href: "beads.html" },
    { ch: "wampum", n: 3, name: "Wampum", href: "wampum.html" },
    { ch: "cowries", n: 4, name: "Cowries", href: "cowries.html" },
    { ch: "rome", n: 5, name: "Rome", href: "rome.html" },
    { ch: "gold", n: 6, name: "Gold?", href: null },
  ];
  const here = document.body.dataset.ch || "yap";
  const isDone = (ch) => { try { return localStorage.getItem(`wth-ep02-${ch}-done`) === "1"; } catch { return false; } };

  function renderBar() {
    const nav = document.getElementById("chapters");
    if (!nav) return;
    nav.innerHTML = CHAPTERS.map((c) => c.href
      ? `<a class="ch${c.ch === here ? " on" : ""}${isDone(c.ch) ? " done" : ""}" href="${c.href}"${c.ch === here ? ' aria-current="page"' : ""}><b>${c.n}</b> ${c.name}</a>`
      : `<span class="ch soon"><b>${c.n}</b> ${c.name}</span>`).join("");
    // centre the current chapter by scrolling the bar sideways only (scrollIntoView would also scroll the page)
    const on = nav.querySelector(".on");
    if (on) nav.scrollLeft = on.offsetLeft - nav.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2;
  }
  // the "next chapter" link for a page's final card
  function next() {
    const i = CHAPTERS.findIndex((c) => c.ch === here);
    return CHAPTERS.slice(i + 1).find((c) => c.href) || null;
  }
  function done(ch = here) {
    try { localStorage.setItem(`wth-ep02-${ch}-done`, "1"); } catch {}
    renderBar();
  }

  const PHONE = matchMedia("(max-width: 700px), (pointer: coarse) and (max-height: 500px)").matches;
  function playMode(on) {
    if (!PHONE) return;
    document.body.classList.toggle("playing", on);
    const el = document.getElementById("game");
    try {
      if (on && el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().then(() => screen.orientation?.lock?.("landscape")).catch(() => {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {}
  }

  const mute = document.getElementById("mute");
  if (mute && window.Chip) {
    const label = () => { mute.textContent = Chip.muted ? "♪ OFF" : "♪ ON"; };
    mute.onclick = () => { Chip.setMuted(!Chip.muted); label(); };
    label();
  }
  // movies: play inline on iPhones; one that isn't rendered yet becomes a short note instead of a dead black box
  document.querySelectorAll("video.movie").forEach((v) => {
    v.playsInline = true;
    const gone = () => { const p = document.createElement("p"); p.className = "movie-soon pixel"; p.textContent = "THE MOVIE FOR THIS CHAPTER IS STILL BEING MADE. PLAY THE GAME BELOW ▼"; v.replaceWith(p); };
    v.addEventListener("error", gone);
    if (v.error) gone();   // it may have failed before this script ran
  });
  renderBar();
  window.Ep02 = { CHAPTERS, here, done, isDone, next, playMode, PHONE };
})();
