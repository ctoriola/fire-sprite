/* ==========================================================================
   Lord,Saint,Sinner — site behaviour
   ========================================================================== */

document.documentElement.classList.remove("no-js");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable: state lives for this page view only */
    }
  },
};

/* ---------- Toast ---------- */

const toast = (() => {
  let el, timer;
  return (msg) => {
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-visible"), 2800);
  };
})();

/* ---------- Header ---------- */

(function header() {
  const bar = $(".site-header");
  const toggle = $(".menu-toggle");
  if (!bar) return;
  const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!toggle) return;
  const close = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
})();

/* ---------- Reveal ---------- */

(function reveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((el) => el.classList.add("is-visible"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---------- Filters ---------- */

(function filters() {
  $$("[data-filters]").forEach((group) => {
    const scope = $(group.dataset.filters);
    if (!scope) return;
    const buttons = $$(".filter-btn", group);
    const empty = $("[data-empty]", scope.parentElement);
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        let shown = 0;
        buttons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });
        $$("[data-filter-item]", scope).forEach((item) => {
          const match = value === "all" || item.dataset.filterItem.split(" ").includes(value);
          item.classList.toggle("is-hidden", !match);
          if (match) shown++;
        });
        if (empty) empty.classList.toggle("is-hidden", shown > 0);
      })
    );
  });
})();

/* ==========================================================================
   Player — a small WebAudio synth stands in for the real masters.
   Each track has its own tempo, key and chord progression.
   ========================================================================== */

const TRACKS = {
  "fever-psalm": { title: "Fever Psalm", album: "SINNER", art: "single-fever-psalm.svg", bpm: 92, root: 50, prog: [0, -4, 3, -2], feel: "trap", time: "3:41" },
  "original-sin": { title: "Original Sin", album: "SINNER", art: "cover-sinner.svg", bpm: 70, root: 45, prog: [0, 1, 0, -2], feel: "slow", time: "4:12" },
  "red-light-revelation": { title: "Red Light Revelation", album: "SINNER", art: "cover-sinner.svg", bpm: 118, root: 52, prog: [0, -2, -4, -5], feel: "pulse", time: "3:28" },
  "burn-slow": { title: "Burn Slow (feat. Nia Okafor)", album: "SINNER", art: "cover-sinner.svg", bpm: 76, root: 48, prog: [0, 5, 3, -2], feel: "slow", time: "4:05" },
  "serpent-tongue": { title: "Serpent Tongue", album: "SINNER", art: "single-serpent-tongue.svg", bpm: 140, root: 46, prog: [0, 0, 1, -1], feel: "trap", time: "2:58" },
  "devil-in-the-choir": { title: "Devil in the Choir", album: "SINNER", art: "cover-sinner.svg", bpm: 84, root: 50, prog: [0, -4, -2, -5], feel: "choir", time: "3:50" },
  "after-mass": { title: "After Mass", album: "SINNER", art: "cover-sinner.svg", bpm: 100, root: 53, prog: [0, 3, -2, 5], feel: "pulse", time: "3:17" },
  "wicked-grace": { title: "Wicked Grace", album: "SINNER", art: "cover-sinner.svg", bpm: 88, root: 47, prog: [0, -3, -5, -1], feel: "trap", time: "3:33" },
  "forbidden": { title: "Forbidden", album: "SINNER", art: "single-forbidden.svg", bpm: 108, root: 49, prog: [0, 5, 7, 3], feel: "pulse", time: "3:02" },
  "seventh-deadly": { title: "Seventh Deadly", album: "SINNER", art: "cover-sinner.svg", bpm: 96, root: 44, prog: [0, 1, -2, -4], feel: "trap", time: "3:45" },
  "absolution": { title: "Absolution", album: "SINNER", art: "cover-sinner.svg", bpm: 64, root: 52, prog: [0, -4, 5, 3], feel: "choir", time: "5:20" },
  "halo-static": { title: "Halo Static", album: "SAINT", art: "single-halo-static.svg", bpm: 112, root: 55, prog: [0, 5, -3, 3], feel: "pulse", time: "3:24" },
  "stained-glass": { title: "Stained Glass", album: "SAINT", art: "single-stained-glass.svg", bpm: 80, root: 52, prog: [0, -4, 3, 5], feel: "choir", time: "4:01" },
  "candlelight": { title: "Candlelight", album: "SAINT", art: "single-candlelight.svg", bpm: 68, root: 57, prog: [0, 3, -2, -4], feel: "slow", time: "3:56" },
  "throne-of-glass": { title: "Throne of Glass", album: "LORD", art: "cover-lord.svg", bpm: 86, root: 45, prog: [0, -2, -4, -5], feel: "trap", time: "3:39" },
  "coronation": { title: "Coronation", album: "LORD", art: "cover-lord.svg", bpm: 74, root: 43, prog: [0, 3, 5, 1], feel: "choir", time: "2:47" },
};
const PREVIEW_SECONDS = 45;

const player = (() => {
  let ctx, master, analyser, data;
  let current = null;
  let playing = false;
  let beat = 0;
  let nextBeat = 0;
  let timer = null;
  let startedAt = 0;
  let elapsed = 0;
  let queue = Object.keys(TRACKS);
  const listeners = new Set();

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    delay.connect(fb).connect(delay);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    data = new Uint8Array(analyser.frequencyBinCount);
    master.connect(lp);
    lp.connect(analyser);
    lp.connect(delay);
    delay.connect(analyser);
    analyser.connect(ctx.destination);
    return true;
  }

  function tone(freq, start, len, type, gain, dest = master) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.12, len / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, start + len);
    o.connect(g).connect(dest);
    o.start(start);
    o.stop(start + len + 0.05);
  }

  function kick(t, big) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(big ? 120 : 150, t);
    o.frequency.exponentialRampToValueAtTime(big ? 38 : 48, t + (big ? 0.5 : 0.18));
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.9 : 0.3));
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 1);
  }

  function noise(t, len, gain, hp) {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f).connect(g).connect(master);
    src.start(t);
  }

  function schedule() {
    const t = TRACKS[current];
    const spb = 60 / t.bpm;
    const eighth = spb / 2;
    while (nextBeat < ctx.currentTime + 0.25) {
      const step = beat % 16; // eighth notes in a two-bar phrase
      const bar = Math.floor(beat / 8) % t.prog.length;
      const root = t.root + t.prog[bar];
      const chord = [root, root + 3, root + 7, root + 10];
      const at = nextBeat;

      if (step % 8 === 0) {
        const padType = t.feel === "choir" ? "sine" : "triangle";
        chord.forEach((n, i) => tone(midi(n + 12), at, eighth * 8.2, padType, 0.05 - i * 0.006));
        if (t.feel === "choir") chord.forEach((n) => tone(midi(n + 24) * 1.003, at + 0.05, eighth * 8, "sine", 0.018));
        tone(midi(root - 12), at, eighth * (t.feel === "trap" ? 6 : 3.5), "sine", 0.22);
      }

      if (t.feel === "trap") {
        if (step === 0 || step === 5 || step === 10) kick(at, true);
        if (step === 4 || step === 12) noise(at, 0.22, 0.28, 1400);
        noise(at, 0.04, 0.07, 7000);
        if (step % 2) noise(at + eighth / 2, 0.03, 0.04, 8000);
      } else if (t.feel === "pulse") {
        if (step % 2 === 0) kick(at, false);
        if (step === 4 || step === 12) noise(at, 0.18, 0.22, 1800);
        noise(at + eighth / 2, 0.04, 0.06, 6500);
        tone(midi(root + 12), at, eighth * 0.9, "sawtooth", 0.018);
      } else if (t.feel === "slow") {
        if (step === 0 || step === 11) kick(at, true);
        if (step === 8) noise(at, 0.3, 0.2, 1200);
        if (step % 4 === 2) noise(at, 0.05, 0.05, 7000);
      } else {
        if (step === 0) kick(at, true);
        if (step === 8) noise(at, 0.5, 0.08, 3000);
      }

      const arp = [0, 7, 10, 12, 15, 12, 10, 7];
      if (t.feel !== "choir" || step % 2 === 0) {
        tone(midi(root + 12 + arp[step % 8]), at, eighth * 0.9, t.feel === "choir" ? "sine" : "square", t.feel === "choir" ? 0.03 : 0.012);
      }

      nextBeat += eighth;
      beat++;
    }
  }

  function position() {
    if (!current) return 0;
    return playing ? elapsed + (ctx.currentTime - startedAt) : elapsed;
  }

  function emit() {
    listeners.forEach((fn) => fn({ id: current, playing, track: TRACKS[current] }));
  }

  function play(id) {
    if (!TRACKS[id] || !init()) {
      if (!ctx) toast("Audio playback isn't supported in this browser.");
      return;
    }
    if (ctx.state === "suspended") ctx.resume();
    if (id !== current) {
      current = id;
      beat = 0;
      elapsed = 0;
      nextBeat = ctx.currentTime + 0.06;
    } else {
      nextBeat = ctx.currentTime + 0.06;
    }
    startedAt = ctx.currentTime;
    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.05);
    clearInterval(timer);
    timer = setInterval(() => {
      schedule();
      if (position() >= PREVIEW_SECONDS) next();
    }, 50);
    schedule();
    emit();
  }

  function pause() {
    if (!playing) return;
    elapsed = position();
    playing = false;
    clearInterval(timer);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
    emit();
  }

  function toggle(id) {
    if (playing && (!id || id === current)) pause();
    else play(id || current || queue[0]);
  }

  function step(dir) {
    const i = queue.indexOf(current);
    const nextId = queue[(i + dir + queue.length) % queue.length];
    current = null;
    play(nextId);
  }
  const next = () => step(1);
  const prev = () => step(-1);

  function levels(count) {
    const out = new Array(count).fill(0);
    if (!analyser || !playing) return out;
    analyser.getByteFrequencyData(data);
    const span = Math.floor((data.length * 0.7) / count);
    for (let i = 0; i < count; i++) {
      let sum = 0;
      for (let j = 0; j < span; j++) sum += data[i * span + j];
      out[i] = sum / span / 255;
    }
    return out;
  }

  return {
    play, pause, toggle, next, prev, levels, position,
    setQueue(ids) { if (ids.length) queue = ids; },
    on(fn) { listeners.add(fn); },
    get current() { return current; },
    get playing() { return playing; },
  };
})();

/* Wire every [data-play] control to the player */
(function playerUI() {
  const IMG = "assets/img/";
  const controls = $$("[data-play]");

  // Tracks not in TRACKS get stable synth settings derived from their id
  const FEELS = ["slow", "pulse", "trap", "choir"];
  const PROGS = [[0, -4, 3, -2], [0, 5, 3, -2], [0, -2, -4, -5], [0, 3, -2, 5], [0, 1, -2, -4]];
  controls.forEach((el) => {
    const id = el.dataset.play;
    if (TRACKS[id]) return;
    let h = 0;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    TRACKS[id] = {
      title: el.dataset.title || id.replace(/-/g, " "),
      album: el.dataset.album || "",
      art: el.dataset.art || "cover-sinner.svg",
      bpm: 64 + (h % 64),
      root: 43 + (h % 14),
      prog: PROGS[h % PROGS.length],
      feel: FEELS[(h >> 3) % FEELS.length],
    };
  });

  // Tracklists define the queue for "next" / "previous"
  const list = $("[data-queue]");
  if (list) player.setQueue($$("[data-play]", list).map((el) => el.dataset.play));

  controls.forEach((el) =>
    el.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      e.preventDefault();
      player.toggle(el.dataset.play);
    })
  );
  $$(".track[data-play]").forEach((row) =>
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        player.toggle(row.dataset.play);
      }
    })
  );

  // Mini player
  const mini = document.createElement("div");
  mini.className = "mini-player";
  mini.setAttribute("aria-label", "Now playing");
  mini.innerHTML = `
    <img alt="" src="${IMG}cover-sinner.svg">
    <div class="info"><div class="t">&nbsp;</div><div class="a">Lord,Saint,Sinner &middot; preview</div><div class="bar"><i></i></div></div>
    <div class="ctrls">
      <button type="button" data-mini="prev" aria-label="Previous track"><svg viewBox="0 0 16 16"><path d="M3 2h2v12H3zM14 2v12L6 8z" fill="currentColor"/></svg></button>
      <button type="button" class="main" data-mini="toggle" aria-label="Play or pause"><svg class="i-play" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" fill="currentColor"/></svg><svg class="i-pause" viewBox="0 0 16 16"><path d="M3 2h4v12H3zM9 2h4v12H9z" fill="currentColor"/></svg></button>
      <button type="button" data-mini="next" aria-label="Next track"><svg viewBox="0 0 16 16"><path d="M11 2h2v12h-2zM2 2v12l8-6z" fill="currentColor"/></svg></button>
    </div>`;
  document.body.appendChild(mini);
  $("[data-mini=toggle]", mini).addEventListener("click", () => player.toggle());
  $("[data-mini=next]", mini).addEventListener("click", () => player.next());
  $("[data-mini=prev]", mini).addEventListener("click", () => player.prev());
  const bar = $(".bar i", mini);

  player.on(({ id, playing, track }) => {
    mini.classList.add("is-visible");
    mini.classList.toggle("is-playing", playing);
    $(".t", mini).textContent = track.title;
    $("img", mini).src = IMG + track.art;
    document.body.classList.toggle("is-playing", playing);
    controls.forEach((el) => {
      const on = el.dataset.play === id;
      el.classList.toggle("is-current", on);
      el.classList.toggle("is-playing", on && playing);
      el.classList.toggle("paused", on && !playing);
      if (el.matches("button")) el.setAttribute("aria-pressed", String(on && playing));
    });
    $$("[data-now-title]").forEach((el) => (el.textContent = track.title));
  });

  // Waveforms + progress bar animation
  const waves = $$(".wave");
  waves.forEach((w) => {
    const n = Number(w.dataset.bars || 14);
    w.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--h:${18 + ((i * 37) % 60)}%"></i>`).join("");
  });
  const bars = waves.map((w) => $$("i", w));
  let idle = 0;
  (function frame() {
    if (player.current) bar.style.width = `${Math.min(100, (player.position() / PREVIEW_SECONDS) * 100)}%`;
    if (bars.length) {
      const lv = player.levels(16);
      idle += 0.03;
      bars.forEach((set, side) =>
        set.forEach((b, i) => {
          const v = player.playing
            ? 0.12 + lv[(side ? set.length - 1 - i : i) % 16] * 0.95
            : 0.2 + 0.18 * Math.abs(Math.sin(idle + i * 0.7 + side));
          b.style.height = `${Math.min(100, v * 100)}%`;
        })
      );
    }
    requestAnimationFrame(frame);
  })();
})();

/* ---------- Video visualiser modal ---------- */

(function videos() {
  const triggers = $$("[data-video]");
  if (!triggers.length) return;
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Video");
  modal.innerHTML = `
    <div class="modal-box">
      <button class="icon-btn modal-close" type="button" aria-label="Close"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2"/></svg></button>
      <div class="visualizer"><canvas></canvas><img alt=""></div>
      <div class="modal-body"><span class="kicker" data-v-kicker></span><h2 class="display h3" style="margin:12px 0 10px" data-v-title></h2><p class="muted" data-v-desc></p></div>
    </div>`;
  document.body.appendChild(modal);
  const canvas = $("canvas", modal);
  const g = canvas.getContext("2d");
  let open = false;
  let lastFocus = null;

  function draw() {
    if (!open) return;
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    const lv = player.levels(48);
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    grad.addColorStop(0, "#ff7a2e");
    grad.addColorStop(0.5, "#8c1405");
    grad.addColorStop(1, "#140302");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const r = Math.min(w, h) * 0.3;
    g.save();
    g.translate(w / 2, h / 2);
    for (let i = 0; i < 96; i++) {
      const v = lv[i % 48];
      const a = (i / 96) * Math.PI * 2;
      const len = r * 0.08 + v * r * 0.9;
      g.rotate((Math.PI * 2) / 96);
      g.fillStyle = `rgba(255, ${200 + v * 55}, ${150 + v * 100}, ${0.35 + v * 0.65})`;
      g.fillRect(r, -2 * devicePixelRatio, len, 4 * devicePixelRatio);
      void a;
    }
    g.restore();
    requestAnimationFrame(draw);
  }

  function show(el) {
    const id = el.dataset.video;
    const t = TRACKS[id];
    lastFocus = el;
    $("img", modal).src = "assets/img/" + (el.dataset.art || t.art);
    $("[data-v-kicker]", modal).textContent = el.dataset.kind || "Official visualiser";
    $("[data-v-title]", modal).textContent = el.dataset.title || t.title;
    $("[data-v-desc]", modal).textContent = el.dataset.desc || "";
    modal.classList.add("is-open");
    open = true;
    player.play(id);
    draw();
    $(".modal-close", modal).focus();
  }
  function hide() {
    modal.classList.remove("is-open");
    open = false;
    player.pause();
    if (lastFocus) lastFocus.focus();
  }
  triggers.forEach((el) => el.addEventListener("click", () => show(el)));
  $(".modal-close", modal).addEventListener("click", hide);
  modal.addEventListener("click", (e) => e.target === modal && hide());
  document.addEventListener("keydown", (e) => open && e.key === "Escape" && hide());
})();

/* ---------- Article reader ---------- */

(function articles() {
  const triggers = $$("[data-article]");
  if (!triggers.length) return;
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Article");
  modal.innerHTML = `<div class="modal-box"><button class="icon-btn modal-close" type="button" aria-label="Close"><svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="2"/></svg></button><div class="modal-body article"></div></div>`;
  document.body.appendChild(modal);
  const body = $(".article", modal);
  let lastFocus;
  const hide = () => {
    modal.classList.remove("is-open");
    if (lastFocus) lastFocus.focus();
  };
  triggers.forEach((el) =>
    el.addEventListener("click", (e) => {
      const tpl = document.getElementById(el.dataset.article);
      if (!tpl) return;
      e.preventDefault();
      lastFocus = el;
      body.innerHTML = "";
      body.appendChild(tpl.content.cloneNode(true));
      modal.classList.add("is-open");
      $(".modal-box", modal).scrollTop = 0;
      $(".modal-close", modal).focus();
    })
  );
  $(".modal-close", modal).addEventListener("click", hide);
  modal.addEventListener("click", (e) => e.target === modal && hide());
  document.addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("is-open") && hide());
})();

/* ---------- Forms ---------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

(function newsletter() {
  $$("form[data-newsletter]").forEach((form) => {
    const input = $("input[type=email]", form);
    const note = $(".form-note", form.parentElement) || $(".form-note", form);
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = EMAIL.test(input.value.trim());
      if (note) {
        note.textContent = ok
          ? "You're in. Watch your inbox for the next sermon."
          : "That email doesn't look right — try again.";
        note.className = "form-note " + (ok ? "is-ok" : "is-error");
      } else {
        toast(ok ? "You're on the list." : "Please enter a valid email.");
      }
      if (ok) form.reset();
    });
  });
})();

(function validate() {
  $$("form[data-validate]").forEach((form) => {
    const note = $(".form-note", form);
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let first = null;
      $$("[required]", form).forEach((input) => {
        const field = input.closest(".field") || input.parentElement;
        const err = $(".error", field);
        let msg = "";
        const v = input.type === "checkbox" ? input.checked : input.value.trim();
        if (!v) msg = input.type === "checkbox" ? "Please confirm to continue." : "This field is required.";
        else if (input.type === "email" && !EMAIL.test(v)) msg = "Enter a valid email address.";
        field.classList.toggle("has-error", !!msg);
        if (err) err.textContent = msg;
        input.setAttribute("aria-invalid", String(!!msg));
        if (msg && !first) first = input;
      });
      if (first) {
        first.focus();
        if (note) {
          note.textContent = "Please fix the highlighted fields.";
          note.className = "form-note is-error";
        }
        return;
      }
      if (note) {
        note.textContent = form.dataset.success || "Thanks — your message has been sent. We'll reply within 3 working days.";
        note.className = "form-note is-ok";
      }
      form.reset();
    });
  });
})();

/* ---------- Shop cart ---------- */

(function cart() {
  const KEY = "lss-cart";
  let items = store.get(KEY, []);
  const counters = $$(".cart-count");
  const drawer = $(".drawer");
  const money = (n) => "£" + n.toFixed(2).replace(/\.00$/, "");

  function save() {
    store.set(KEY, items);
    render();
  }

  function render() {
    const count = items.reduce((s, i) => s + i.qty, 0);
    counters.forEach((c) => {
      c.textContent = count || "";
      c.dataset.count = count;
    });
    if (!drawer) return;
    const body = $(".drawer-body", drawer);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    $("[data-cart-total]", drawer).textContent = money(total);
    $("[data-checkout]", drawer).classList.toggle("is-disabled", !items.length);
    if (!items.length) {
      body.innerHTML = `<p class="cart-empty">Your cart is empty.<br>Go on, sin a little.</p>`;
      return;
    }
    body.innerHTML = items
      .map(
        (i, n) => `
        <div class="cart-item">
          <img src="assets/img/${i.img}" alt="">
          <div>
            <h4>${i.name}</h4>
            <small>${i.size ? "Size " + i.size + " · " : ""}${money(i.price)}</small>
            <div class="qty">
              <button type="button" data-q="${n}" data-d="-1" aria-label="Decrease quantity">&minus;</button>
              <span>${i.qty}</span>
              <button type="button" data-q="${n}" data-d="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <b>${money(i.qty * i.price)}</b>
        </div>`
      )
      .join("");
  }

  const openCart = () => {
    document.body.classList.add("cart-open");
    if (drawer) $(".icon-btn", drawer).focus();
  };
  const closeCart = () => document.body.classList.remove("cart-open");

  $$("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".product");
      const sizeSel = card && $(".size-select", card);
      const size = sizeSel ? sizeSel.value : "";
      if (sizeSel && !size) {
        sizeSel.focus();
        toast("Pick a size first.");
        return;
      }
      const { add: id, name, price, img } = btn.dataset;
      const found = items.find((i) => i.id === id && i.size === size);
      if (found) found.qty++;
      else items.push({ id, name, price: Number(price), img, size, qty: 1 });
      save();
      toast(`${name} added to cart`);
    })
  );

  if (drawer) {
    $$("[data-open-cart]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.preventDefault();
        openCart();
      })
    );
    $(".icon-btn", drawer).addEventListener("click", closeCart);
    $(".drawer-backdrop").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());
    drawer.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (!b) return;
      const item = items[Number(b.dataset.q)];
      item.qty += Number(b.dataset.d);
      if (item.qty <= 0) items.splice(Number(b.dataset.q), 1);
      save();
    });
    $("[data-checkout]", drawer).addEventListener("click", (e) => {
      e.preventDefault();
      toast("Checkout opens with the store launch on 1 October.");
    });
    if (location.hash === "#cart") openCart();
  }
  render();
})();

/* ---------- Footer year ---------- */

$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
