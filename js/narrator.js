/* ---------------------------------------------------------------------------
   narrator.js
   Piece 4: a voice that carries the thread between scenes.

   Not a caption track and not a second set of hints. The rule every line here is
   written under is that it may not say what the scene already says: scene 11
   prints "That is the water you asked for 6.0 seconds ago", so the narrator has
   nothing to add while you are in it and says nothing. The lines that earn their
   place are the ones that connect one scene to the next, or that name what a
   reader just did, or that summarise what somebody skipped.

   Form is one line, fixed at the foot of the screen, no character and no face.
   A portrait competing with a scene that runs to two and a half screens on a
   phone is a bad trade for the space it costs.

   How it watches, and why it does not touch scenes 10, 11 or 12. SceneLoop
   stores one scene object per root element, so a second registration on the same
   root would clobber the first. Instead the narrator reads the handle those
   scenes already publish and borrows their clocks, which means its timers pause
   off screen exactly like everything else and not one line of those three files
   had to change. Reader actions are read the same way, from state the scenes
   already write to the DOM: scene 10's "gone for good" counter, scene 12's
   slider.

   Stop point for this pass: the system plus lines for scenes 10, 11 and 12, and
   the two the quiz gets. The other ten scenes are deliberately silent.
   --------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  var IDLE = 9;        /* seconds on an interactive scene before one nudge */
  var SKIM = 7;        /* under this and the reader did nothing: they skipped it */

  /* A skim line beats the arrival line of wherever the reader went, which is
     right once and wrong nine times. With every scene narrated, somebody moving
     at a brisk pace trips the skim test on all of them and gets a column of
     "Skipped:" lines instead of the connective tissue, which is nagging and is
     the one tone this is not allowed to take. Say it twice, then stop and let
     the arrival lines through. */
  var MAX_SKIMS = 2;
  var skimsSaid = 0;

  /* ------------------------------------------------------------------
     The lines. Copy also lives in CONTENT.md with its triggers, and the
     two files have to be edited together. Keep them short: one sentence
     is usually right, and anything needing three is doing the scene's
     job for it.
     ------------------------------------------------------------------ */
  /* There are no departure lines here and that is deliberate. leave() and
     enter() both resolve in one observer callback, so a parting line is always
     overwritten by the arrival line of wherever the reader went, and leaving the
     narrated stretch altogether has to hush the bar rather than park a line over
     scenes that reserve no room for it. A line nobody can read is not a line.
     Scene 12's parting thought, that three numbers decide whether the overhang
     matters and none of them are public, belongs to scene 13 as an arrival line
     and should be written there when the other ten scenes are done.

     Skim lines survive because they fire on the way into another narrated scene
     and win precedence there, which is exactly where they are worth having. */
  var LINES = {

    /* Scenes 1 to 9 and 13, written second. None of them gets an idle nudge:
       every one already carries an on screen hint that points at its own
       control, and a second voice saying the same thing is the restatement this
       whole file exists to avoid. What they get is the connective tissue, which
       is the thing no single scene can say about itself. */

    'scene-1': {
      arrive: 'The rest of the page is a reply to this.',
      skim:   'Skipped: the number is set once, then never.'
    },

    'scene-2': {
      arrive: 'That one prints forever. This one cannot.',
      skim:   'Skipped: a ceiling that only ever falls.'
    },

    /* No skim line, and there could not be one: scene 3 runs no JavaScript, so
       it has no clock and dwell cannot be measured. Arrival only, which suits a
       scene that exists to be a rest anyway. */
    'scene-3': {
      arrive: 'One place. Everything after this follows.'
    },

    'scene-4': {
      arrive: 'Everything later is downstream of this needle.',
      skim:   'Skipped: net flow in or out is the only input.'
    },

    'scene-5': {
      arrive: 'Nothing above it can overrule that needle.',
      skim:   'Skipped: there is no vote, and no override.'
    },

    'scene-6': {
      arrive: 'You were watching. Now you hold one.',
      skim:   'Skipped: the licence cannot leave your hands.'
    },

    'scene-7': {
      arrive: 'You have one bank. It can become ten.',
      skim:   'Skipped: more Branches, thinner slice each.'
    },

    'scene-8': {
      arrive: 'Growing is not free. This is the bill.',
      skim:   'Skipped: you pay to expand, and it is burned.'
    },

    'scene-9': {
      arrive: 'That burn was one licence. Here it is policy.',
      /* not "it defends slowly": steady state throughput is the same either
         way, and the asymmetry is that money in is spent on arrival while money
         out pools first and leaves in capped steps */
      skim:   'Skipped: money out leaves in capped steps.'
    },

    'scene-10': {
      arrive:  'Scene 9 was money leaving. This has not.',
      idle:    'It accrues whether you decide or not.',
      first:   'That was a decision, not a withdrawal.',
      more:    'Twice. The rate on the left is the cost.',
      all:     'Fully paid, permanently out.',
      skim:    'Skipped: getting paid closes the Branch.'
    },

    /* Arrival and departure only, on purpose. Scene 11's hint line narrates
       continuously already, and a second voice over the top of it is noise. */
    'scene-11': {
      arrive:  'That was a choice. This one is not.'
    },

    'scene-12': {
      arrive:      'What scene 10 cost one Banker, now at scale.',
      arriveActed: 'You closed one to get paid. Now everyone.',
      idle:        'Nothing converts until somebody decides to.',
      moved:       'Buybacks exist, at under a percent an hour.',
      explored:    'Both ends are guesses. So is the middle.',
      skim:        'Skipped: the number leaves out real claims.'
    },

    /* Scene 12's parting thought, recorded in CONTENT.md as belonging here.
       Scene 13 runs no JavaScript either, so this is arrival only and it has no
       clock to fade itself on. */
    'scene-13': {
      arrive: 'Three numbers decide it. None are public.'
    },

    /* The quiz is where the reader speaks, so the narrator hands over and then
       stays out of it. One line as it opens, one at the very end, nothing
       between questions. */
    'scene-quiz': {
      arrive: 'Your turn. The wrong ones teach more.',
      done:   'Check the source. This page included.'
    }
  };

  var WATCHED = ['scene-1', 'scene-2', 'scene-3', 'scene-4', 'scene-5',
                 'scene-6', 'scene-7', 'scene-8', 'scene-9',
                 'scene-10', 'scene-11', 'scene-12', 'scene-13', 'scene-quiz'];

  /* Scenes where the line is a handover rather than company: say it, then fade
     out and leave the screen alone. The quiz is the whole list, because it is
     the one place the reader is doing the talking and a line parked under the
     options for the length of three questions is exactly the clutter the brief
     rules out. Seconds on the scene's own clock, so it does not tick while the
     reader is somewhere else. */
  var STEP_BACK = { 'scene-quiz': 6 };

  /* ---------------- the bar ---------------- */

  var dismissed = false, voiceOn = false, current = null, lastSaid = '';
  var bar, textEl, voiceBtn, closeBtn;
  var canSpeak = !!(global.speechSynthesis && global.SpeechSynthesisUtterance);

  function build(){
    bar = document.createElement('div');
    bar.className = 'narrator';
    bar.setAttribute('data-on', 'false');

    textEl = document.createElement('p');
    textEl.className = 'narrator-line';
    textEl.setAttribute('aria-live', 'polite');

    var tools = document.createElement('div');
    tools.className = 'narrator-tools';

    if(canSpeak){
      voiceBtn = document.createElement('button');
      voiceBtn.type = 'button';
      voiceBtn.className = 'narrator-btn';
      voiceBtn.setAttribute('aria-pressed', 'false');
      voiceBtn.setAttribute('aria-label', 'Read the narrator lines aloud');
      voiceBtn.title = 'Read aloud';
      voiceBtn.textContent = 'speak';
      voiceBtn.addEventListener('click', function(){
        voiceOn = !voiceOn;
        voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
        if(!voiceOn && global.speechSynthesis.cancel) global.speechSynthesis.cancel();
        else if(voiceOn && lastSaid) speak(lastSaid);
      });
      tools.appendChild(voiceBtn);
    }

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'narrator-btn';
    closeBtn.setAttribute('aria-label', 'Turn the narrator off');
    closeBtn.title = 'Turn off';
    closeBtn.textContent = 'off';
    closeBtn.addEventListener('click', dismiss);
    tools.appendChild(closeBtn);

    bar.appendChild(textEl);
    bar.appendChild(tools);
    document.body.appendChild(bar);
  }

  function dismiss(){
    dismissed = true;
    bar.setAttribute('data-on', 'false');
    bar.setAttribute('hidden', 'hidden');
    document.documentElement.removeAttribute('data-narrator');
    if(canSpeak && global.speechSynthesis.cancel) global.speechSynthesis.cancel();
  }

  function speak(text){
    if(!voiceOn || !canSpeak) return;
    try {
      global.speechSynthesis.cancel();      /* never speak over itself */
      var u = new global.SpeechSynthesisUtterance(text);
      u.rate = 1; u.pitch = 1;
      global.speechSynthesis.speak(u);
    } catch(e){ /* an optional extra, so a failure here is not worth reporting */ }
  }

  function say(text){
    if(dismissed || !text || text === lastSaid) return;
    lastSaid = text;
    textEl.textContent = text;
    bar.setAttribute('data-on', 'true');
    /* the bar sizes itself, and the sections reserve exactly that much so no
       line of any scene ever ends up underneath it */
    document.documentElement.style.setProperty('--narrator-h', bar.offsetHeight + 'px');
    speak(text);
  }

  function hush(){
    if(dismissed) return;
    bar.setAttribute('data-on', 'false');
    lastSaid = '';
    if(canSpeak && global.speechSynthesis.cancel) global.speechSynthesis.cancel();
  }

  /* ---------------- per scene bookkeeping ---------------- */

  function State(id){
    this.id = id;
    this.el = document.getElementById(id);
    this.lines = LINES[id];
    this.enteredAt = null;      /* the scene's own clock, so time off screen is free */
    this.acted = false;
    this.idleTimer = null;
    this.saidIdle = false;
    this.saidExplored = false;
    this.saidMoved = false;
    this.backTimer = null;
  }

  State.prototype.sim = function(){
    /* SceneLoop publishes the scene object on its root. Read only: registering a
       second scene on the same root would overwrite the first one. */
    return this.el ? this.el.__sceneLoop : null;
  };

  var states = {};
  var retired = 0;             /* scene 10 Branches the reader actually closed */

  function armIdle(st){
    var sim = st.sim();
    if(!sim || !st.lines.idle || st.saidIdle || st.acted) return;
    if(st.idleTimer !== null) sim.clear(st.idleTimer);
    st.idleTimer = sim.after(IDLE, function(){
      st.idleTimer = null;
      if(st.acted || st.saidIdle || current !== st.id) return;
      st.saidIdle = true;
      say(st.lines.idle);
    });
  }

  function acted(st){
    if(st.acted) return;
    st.acted = true;
    var sim = st.sim();
    if(sim && st.idleTimer !== null){ sim.clear(st.idleTimer); st.idleTimer = null; }
  }

  /* Arms the scene's timers and hands back the line it would like to say. It
     does not say it, because whoever the reader just left may have something
     that matters more. */
  function enter(st){
    var sim = st.sim();
    st.enteredAt = sim ? sim.elapsed : 0;
    armIdle(st);
    stepBack(st);
    /* the connective form of the line, where the reader has earned it */
    if(st.id === 'scene-12' && retired > 0 && st.lines.arriveActed) return st.lines.arriveActed;
    return st.lines.arrive || null;
  }

  function stepBack(st){
    var after = STEP_BACK[st.id];
    var sim = st.sim();
    if(!after || !sim) return;
    if(st.backTimer !== null && st.backTimer !== undefined) sim.clear(st.backTimer);
    st.backTimer = sim.after(after, function(){
      st.backTimer = null;
      if(current === st.id) hush();
    });
  }

  function leave(st){
    var sim = st.sim();
    var dwell = (sim && st.enteredAt !== null) ? (sim.elapsed - st.enteredAt) : 99;
    if(sim && st.idleTimer !== null){ sim.clear(st.idleTimer); st.idleTimer = null; }
    if(sim && st.backTimer !== null){ sim.clear(st.backTimer); st.backTimer = null; }
    st.enteredAt = null;

    if(!st.acted && dwell < SKIM && st.lines.skim && skimsSaid < MAX_SKIMS){
      skimsSaid++;
      return st.lines.skim;
    }
    return null;
  }

  /* ---------------- what the reader did ----------------
     All of this is read from state the scenes already write, so scenes 10, 11
     and 12 are untouched. */

  function watchScene10(st){
    var gone = document.getElementById('s10-sGone');
    if(!gone || !global.MutationObserver) return;
    new global.MutationObserver(function(){
      var n = parseInt(gone.textContent, 10);
      if(!(n > retired)) return;            /* the reset button counts down, not up */
      retired = n;
      acted(st);
      if(current !== st.id) return;
      if(n >= 4 && st.lines.all) say(st.lines.all);
      else if(n === 1) say(st.lines.first);
      else say(st.lines.more);
    }).observe(gone, { childList: true, characterData: true, subtree: true });
  }

  function watchScene12(st){
    var slider = document.getElementById('s12-exit');
    if(!slider) return;
    var lo = null, hi = null;
    slider.addEventListener('input', function(){
      var v = parseFloat(slider.value);
      lo = (lo === null) ? v : Math.min(lo, v);
      hi = (hi === null) ? v : Math.max(hi, v);
      acted(st);
      if(current !== st.id) return;
      /* swept most of the range: that is somebody testing it, not reading it */
      if(!st.saidExplored && (hi - lo) >= 60){ st.saidExplored = true; say(st.lines.explored); return; }
      if(!st.saidMoved && v >= 45){ st.saidMoved = true; say(st.lines.moved); }
    });
  }

  function watchQuiz(st){
    var again = document.getElementById('qz-again');
    var end = document.getElementById('qz-end');
    if(!end || !global.MutationObserver) return;
    /* the close card appearing is the quiz finishing, and it is the only thing
       in there the narrator is allowed to react to */
    new global.MutationObserver(function(){
      if(end.hidden || current !== st.id) return;
      acted(st);
      say(st.lines.done);
      /* the last line on the page, so it stays put rather than stepping back */
    }).observe(end, { attributes: true, attributeFilter: ['hidden'] });
    if(again) again.addEventListener('click', function(){ say(st.lines.arrive); stepBack(st); });
  }

  /* ---------------- go ---------------- */

  var ratios = {};

  function onSee(entries){
    for(var i = 0; i < entries.length; i++){
      ratios[entries[i].target.id] = entries[i].intersectionRatio;
    }
    /* whichever watched scene the reader is most inside is the one being
       narrated, and 0.3 is high enough that passing the edge of one on the way
       to another does not count as arriving */
    var best = null, bestRatio = 0.3;
    for(var k in ratios){
      if(!Object.prototype.hasOwnProperty.call(ratios, k)) continue;
      if(ratios[k] > bestRatio){ bestRatio = ratios[k]; best = k; }
    }
    if(best === current) return;

    var skimmed = (current && states[current]) ? leave(states[current]) : null;
    current = best;

    /* Off the narrated stretch entirely: say nothing and get off the screen.
       Scenes with no lines reserve no room for the bar, so a line parked over
       them would sit on top of their content. */
    if(!current || !states[current]){ hush(); return; }

    var arrival = enter(states[current]);

    /* Naming what somebody just skipped beats greeting them somewhere new, so a
       skim line wins where there is one. Both of these resolve in this single
       callback, so only one of them can be heard. */
    if(skimmed) say(skimmed);
    else if(arrival) say(arrival);
    else hush();
  }

  global.Narrator = {
    say: say,
    dismiss: dismiss,
    isDismissed: function(){ return dismissed; },
    current: function(){ return current; }
  };

  (function init(){
    var any = false, i;
    for(i = 0; i < WATCHED.length; i++){
      if(document.getElementById(WATCHED[i])){
        states[WATCHED[i]] = new State(WATCHED[i]);
        any = true;
      }
    }
    if(!any) return;

    build();
    document.documentElement.setAttribute('data-narrator', 'on');
    document.documentElement.style.setProperty('--narrator-h', bar.offsetHeight + 'px');

    /* Only the scenes that actually get spoken to reserve room for the bar. On
       every other scene the bar is faded out and covering nothing, so charging
       them for it would cost scenes 2 and 6 the one screen fit piece 1 bought
       them. Marking the scenes rather than naming them in CSS means the reserved
       space follows the lines when the other ten get written. */
    for(var w = 0; w < WATCHED.length; w++){
      var wEl = document.getElementById(WATCHED[w]);
      if(wEl) wEl.setAttribute('data-narrated', 'true');
    }

    if(states['scene-10']) watchScene10(states['scene-10']);
    if(states['scene-12']) watchScene12(states['scene-12']);
    if(states['scene-quiz']) watchQuiz(states['scene-quiz']);

    /* any touch inside a watched scene counts as the reader being present, which
       is enough to call off the idle nudge even where nothing else is tracked */
    for(var k in states){
      if(!Object.prototype.hasOwnProperty.call(states, k)) continue;
      (function(st){
        if(st.el) st.el.addEventListener('pointerdown', function(){ acted(st); }, true);
      })(states[k]);
    }

    if(!global.IntersectionObserver) return;
    var ob = new global.IntersectionObserver(onSee, { threshold: [0, 0.3, 0.5, 0.8] });
    for(i = 0; i < WATCHED.length; i++){
      var el = document.getElementById(WATCHED[i]);
      if(el) ob.observe(el);
    }
  })();

})(window);
