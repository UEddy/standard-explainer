/* ---------------------------------------------------------------------------
   scene-loop.js
   One shared clock for every interactive scene on the page.

   Why this exists: thirteen scenes, several of them live simulations. If each
   scene ran its own requestAnimationFrame loop they would all keep running
   while the reader is nowhere near them, which flattens a phone battery and
   makes scrolling stutter. This module keeps exactly one rAF loop for the
   whole page, ticks only the scenes that are on screen, and cancels the loop
   outright when none of them are. Six live scenes cost one loop, not six.

   Register a scene and keep the handle:

     var sim = SceneLoop.register({
       root: document.getElementById('scene-11'),   // required
       step: 1/60,           // optional fixed simulation step, in seconds
       simulate: fn(step),   // called 0 to N times per frame at that fixed step
       render: fn(dt),       // called once per frame
       onPause: fn(),
       onResume: fn(awaySeconds),
       margin: '120px'       // how early to wake, as an IntersectionObserver rootMargin
     });

   The handle carries:

     sim.elapsed        seconds of simulated time, advancing only while active
     sim.active         true while running
     sim.after(s, fn)   a timer on the scene clock, so it cannot fire while paused
     sim.every(s, fn)   the same, repeating
     sim.clear(id)
     sim.pause()        hold this scene even when it is on screen
     sim.resume()
     sim.destroy()

   A scene is active only when it is on screen AND the tab is visible. Its root
   element carries data-scene-active="true|false", and this module injects one
   rule that pauses every CSS animation inside an inactive scene, so decorative
   motion suspends along with the simulation without each scene wiring it up.

   Timing contract, so scenes do not each reinvent it:
     - dt is clamped, so a scene never receives a huge catch up step.
     - Resuming sets dt to roughly one frame. There is no attempt to replay the
       time a scene spent paused, because that is exactly the work we are
       trying not to do.
     - A fixed step scene gets a bounded number of steps per frame, and its
       accumulator is dropped rather than allowed to spiral if it falls behind.
   --------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  var scenes = [];
  var observers = {};        /* rootMargin -> IntersectionObserver, shared per margin */
  var rafId = 0;
  var lastTs = 0;
  var nextTimerId = 1;
  var frozen = false;        /* set while the page is in the back/forward cache */
  var peakDt = 0;            /* largest raw gap between frames, for diagnosis */

  var canObserve = !!global.IntersectionObserver;

  function now() {
    return (global.performance && global.performance.now) ? global.performance.now() : Date.now();
  }

  /* One rule for the whole page: an inactive scene stops its CSS animation too. */
  function injectStyle() {
    if (document.getElementById('scene-loop-css')) return;
    var s = document.createElement('style');
    s.id = 'scene-loop-css';
    s.textContent =
      '[data-scene-active="false"],[data-scene-active="false"] *{' +
      'animation-play-state:paused !important}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------------- the single loop ---------------- */

  function schedule() {
    if (!rafId) rafId = global.requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId) { global.cancelAnimationFrame(rafId); rafId = 0; }
    lastTs = 0;
  }

  function anyActive() {
    for (var i = 0; i < scenes.length; i++) if (scenes[i].active) return true;
    return false;
  }

  function runTimers(s) {
    if (!s.timers.length) return;
    /* Copy first: a callback may add or clear timers while we are walking. */
    var due = [], i, t;
    for (i = 0; i < s.timers.length; i++) {
      if (s.timers[i].at <= s.elapsed) due.push(s.timers[i]);
    }
    for (i = 0; i < due.length; i++) {
      t = due[i];
      if (t.repeat > 0) {
        t.at += t.repeat;
      } else {
        var k = s.timers.indexOf(t);
        if (k >= 0) s.timers.splice(k, 1);
      }
      t.fn(s);
    }
  }

  function frame(ts) {
    rafId = 0;
    var dt = lastTs ? (ts - lastTs) / 1000 : 0;
    lastTs = ts;
    if (dt < 0) dt = 0;
    if (dt > peakDt) peakDt = dt;

    var live = 0;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (!s.active) continue;
      live++;

      var d = dt > s.maxStep ? s.maxStep : dt;

      if (s.step > 0 && s.simulate) {
        s.acc += d;
        var n = 0;
        while (s.acc >= s.step && n < s.maxCatchUp) {
          s.elapsed += s.step;
          s.simulate(s.step, s);
          s.acc -= s.step;
          n++;
        }
        if (n === s.maxCatchUp) s.acc = 0;   /* fell behind: drop it, do not spiral */
      } else {
        s.elapsed += d;
        if (s.simulate) s.simulate(d, s);
      }

      runTimers(s);
      if (s.render) s.render(d, s);
    }

    if (live > 0) schedule(); else stop();
  }

  /* ---------------- activation ---------------- */

  function wanted(s) {
    return s.onScreen && !s.held && !frozen && !document.hidden;
  }

  function sync(s) {
    var on = wanted(s);
    if (on === s.active) return;
    s.active = on;
    if (s.root) s.root.setAttribute('data-scene-active', on ? 'true' : 'false');

    if (on) {
      s.acc = 0;
      var away = s.pausedAt ? (now() - s.pausedAt) / 1000 : 0;
      s.pausedAt = 0;
      if (s.onResume) s.onResume(away, s);
      /* Paint once on the way back in, so a scene that had state changed while it
         was paused is never shown stale for a frame. */
      if (s.render) s.render(0, s);
      schedule();
    } else {
      s.pausedAt = now();
      if (s.onPause) s.onPause(s);
      if (!anyActive()) stop();
    }
  }

  function syncAll() {
    for (var i = 0; i < scenes.length; i++) sync(scenes[i]);
  }

  /* One observer for every scene's stage, shared the same way the root
     observers are. Callbacks hang off the element. */
  var stageOb = null;
  function stageWatcher() {
    if (!stageOb) {
      stageOb = new global.IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var cb = entries[i].target.__sceneLoopStage;
          if (cb) cb(entries[i].intersectionRatio, entries[i].isIntersecting);
        }
      }, { threshold: [0, 0.4, 0.75] });
    }
    return stageOb;
  }

  function observerFor(margin) {
    if (!canObserve) return null;
    if (!observers[margin]) {
      observers[margin] = new global.IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var s = entries[i].target.__sceneLoop;
          if (!s) continue;
          s.onScreen = entries[i].isIntersecting;
          sync(s);
        }
      }, { rootMargin: margin });
    }
    return observers[margin];
  }

  /* ---------------- public ---------------- */

  function register(opts) {
    injectStyle();

    var s = {
      root: opts.root || null,
      simulate: opts.simulate || null,
      render: opts.render || null,
      onPause: opts.onPause || null,
      onResume: opts.onResume || null,
      step: opts.step || 0,
      maxStep: opts.maxStep || 0.25,
      maxCatchUp: opts.maxCatchUp || 25,
      margin: opts.margin || '120px',

      onScreen: !canObserve,     /* no observer means we cannot tell, so assume on screen */
      held: false,
      active: false,
      acc: 0,
      elapsed: 0,
      pausedAt: 0,
      timers: []
    };

    s.after = function (seconds, fn) {
      var id = nextTimerId++;
      s.timers.push({ id: id, at: s.elapsed + seconds, repeat: 0, fn: fn });
      return id;
    };
    s.every = function (seconds, fn) {
      var id = nextTimerId++;
      s.timers.push({ id: id, at: s.elapsed + seconds, repeat: seconds, fn: fn });
      return id;
    };
    s.clear = function (id) {
      for (var i = 0; i < s.timers.length; i++) {
        if (s.timers[i].id === id) { s.timers.splice(i, 1); return; }
      }
    };
    /* A beat that plays once, owed to the reader rather than to the clock.
       Armed by the stage coming properly into view, never by the scene
       registering: a scene root is much taller than its stage, so arming on
       activation fires the beat while the reader is still on the headline and
       they arrive to a scene that has already given itself away. Then it waits
       on the scene clock, so scrolling past spends only the time actually spent
       looking, and if it comes due while the stage is out of view it waits
       rather than firing blind. */
    s.playOnce = function (stageEl, delay, fn) {
      var armed = false, done = false, due = false, visible = false;

      function fire() { if (!done) { done = true; fn(s); } }

      function look() {
        if (done) return;
        if (due) { fire(); return; }
        if (armed) return;
        armed = true;
        s.after(delay, function () {
          if (done) return;
          if (visible) fire(); else due = true;
        });
      }

      if (!stageEl || !global.IntersectionObserver) {
        s.after(delay, fire);      /* cannot tell what is on screen */
        return;
      }
      stageEl.__sceneLoopStage = function (ratio, intersecting) {
        visible = intersecting && ratio >= 0.4;
        if (visible) look();
      };
      stageWatcher().observe(stageEl);
    };

    s.pause = function () { s.held = true; sync(s); };
    s.resume = function () { s.held = false; sync(s); };
    s.destroy = function () {
      var ob = observers[s.margin];
      if (ob && s.root) ob.unobserve(s.root);
      if (s.root) { delete s.root.__sceneLoop; s.root.removeAttribute('data-scene-active'); }
      var i = scenes.indexOf(s);
      if (i >= 0) scenes.splice(i, 1);
      s.active = false;
      s.timers.length = 0;
      if (!anyActive()) stop();
    };

    scenes.push(s);

    if (s.root) {
      s.root.__sceneLoop = s;
      s.root.setAttribute('data-scene-active', 'false');
      var ob = observerFor(s.margin);
      if (ob) ob.observe(s.root); else sync(s);
    } else {
      sync(s);
    }

    return s;
  }

  document.addEventListener('visibilitychange', syncAll);

  /* pagehide and pageshow are the back/forward cache path, which on mobile Safari
     is the ordinary way a reader leaves and returns. They must go through the same
     deactivate and reactivate that everything else does. Stopping the loop without
     marking the scenes inactive would leave sync() thinking nothing had changed on
     the way back in, so it would never reschedule and every scene would freeze for
     good. Whether that happened used to depend on whether visibilitychange fired
     first, which made it intermittent. */
  global.addEventListener('pagehide', function () { frozen = true; syncAll(); stop(); });
  global.addEventListener('pageshow', function () {
    frozen = false;
    lastTs = 0;
    syncAll();
    /* belt and braces: never leave an active scene without a loop to tick it */
    if (anyActive()) schedule();
  });

  /* ---------------- on device diagnostics ----------------
     Add #debug to the URL to pin a readout to the page. It exists because a
     phone has no console you can reach without a Mac, and the questions that
     matter on a phone are not questions you can answer by looking:
     did the loop actually stop, did it come back, and did the clock jump.

       wall     real seconds since load
       elapsed  simulated seconds per scene, which only advance while active
       peak dt  largest raw gap between two frames, so a suspend shows up here
       step cap the most simulated time any one frame is allowed to apply

     If peak dt reads 40s after an unlock but elapsed only moved a fraction of a
     second, the clamp did its job and nothing jumped. The readout drives its own
     rAF, so debug mode never lets the page fully idle. Do not leave it on. */
  function pad(str, n) {
    str = String(str);
    while (str.length < n) str += ' ';
    return str;
  }

  function startDebug() {
    var box = document.createElement('div');
    box.id = 'scene-loop-debug';
    box.setAttribute('style',
      'position:fixed;left:6px;right:6px;z-index:99999;' +
      'bottom:calc(6px + env(safe-area-inset-bottom));' +
      'font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;' +
      'background:rgba(20,16,12,.93);color:#FBF2E2;padding:8px 10px;' +
      'border-radius:10px;pointer-events:none;white-space:pre;');
    (document.body || document.documentElement).appendChild(box);

    var t0 = now();
    (function paint() {
      var lines = [];
      var stuck = anyActive() && !rafId;
      lines.push('wall ' + ((now() - t0) / 1000).toFixed(1) + 's' +
                 '   loop ' + (rafId ? 'RUNNING' : 'stopped') +
                 '   active ' + activeCount());
      lines.push('peak dt ' + peakDt.toFixed(2) + 's   step cap 0.25s');
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        lines.push(pad(s.root ? s.root.id : 'scene' + i, 10) +
                   (s.active ? 'ON  ' : 'off ') +
                   'elapsed ' + pad(s.elapsed.toFixed(2) + 's', 9) +
                   'timers ' + s.timers.length);
      }
      if (stuck) lines.push('*** FROZEN: scenes are active but the loop is stopped ***');
      box.textContent = lines.join('\n');
      global.requestAnimationFrame(paint);
    })();
  }

  function activeCount() {
    var n = 0;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].active) n++;
    return n;
  }

  if (/(^|[#?&])debug/.test(global.location.hash + global.location.search)) {
    if (document.body) startDebug();
    else document.addEventListener('DOMContentLoaded', startDebug);
  }

  global.SceneLoop = {
    register: register,
    debug: startDebug,
    peakDt: function () { return peakDt; },
    /* Every scene needs a still fallback, so ask once and share the answer. */
    reducedMotion: !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches),
    activeCount: activeCount,
    running: function () { return !!rafId; }
  };

})(window);
