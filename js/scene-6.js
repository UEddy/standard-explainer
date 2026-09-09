/* Scene 6: the Charter. Someone tries to take the licence away and it snaps
   back, because it is bound to whoever holds it.

   Piece 2 made this a real drag, replacing the one shot tug as the main event.
   Feeling it fight your thumb teaches soulbound in a way that watching it
   happen does not: the resistance is a tanh, so the card saturates at REACH no
   matter how far the finger travels. Pull as hard as you like and it goes
   exactly nowhere new. That is the property, expressed as a force curve rather
   than as a caption.

   The one shot tug is kept as the arrival animation, so a reader who never
   touches it still sees the idea. Grabbing the card takes over from it
   mid-flight. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-6');
  var P = 's6-';
  function el(id){ return document.getElementById(P + id); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim, startT = null;

  var PULL = 0.55;        /* seconds spent being dragged away, in the intro */
  var REACH = 54;         /* how far it gets before the tether stops it */

  var cardEl = el('card'), tetherEl = el('tether');
  var boundEl = el('bound'), lockEl = el('lock');
  var hint = el('poke');

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function clamp(v,a,b){ return v < a ? a : (v > b ? b : v); }
  function ease(t){ return 1 - Math.pow(1 - t, 3); }
  function atanh(x){ return 0.5 * Math.log((1 + x) / (1 - x)); }

  /* ---------- state ----------
     d is normalised displacement: 1 means the card is out at REACH. The intro
     drives it from a clock, a drag drives it from a thumb, and a release hands
     it to a spring. Everything downstream reads d and does not care which. */
  var mode = 'intro';                 /* intro | held | free */
  var d = 0, v = 0;
  var rawBase = 0;
  var revealed = false;               /* latched: the conclusion, once shown, stays */
  var revealP = 0;

  /* Underdamped, so releasing it visibly fights back rather than gliding home.
     Reduced motion gets the same spring critically damped: it still answers the
     thumb and still snaps back, it just does not oscillate on the way. */
  var K = 260, C = REDUCED ? 2 * Math.sqrt(260) : 13;

  Poke.drag(el('grab'), {
    onStart: function(){
      mode = 'held';
      v = 0;
      Poke.hintUsed(hint);
      /* pick up from wherever it currently is, so grabbing mid intro or mid
         snap-back does not make the card jump under the finger */
      rawBase = REACH * atanh(clamp(d, -0.995, 0.995));
    },
    onMove: function(pt){
      if(mode !== 'held') return;
      /* the tether, as a force curve. tanh saturates, so REACH is a wall the
         card approaches and never passes however far the finger goes. */
      d = Math.tanh((rawBase + pt.dx) / REACH);
    },
    onEnd: function(){
      if(mode !== 'held') return;
      mode = 'free';
      revealed = true;
    }
  });

  function simulate(step){
    if(mode === 'free'){
      v += (-K * d - C * v) * step;
      d += v * step;
      if(Math.abs(d) < 0.002 && Math.abs(v) < 0.02){ d = 0; v = 0; }
    }
    /* the lock and the label are the conclusion, so they arrive once the reader
       has actually let go of it, or once the intro has settled on its own.
       Latched, because picking the card up a second time must not take the
       conclusion back off the screen. */
    if(!revealed && mode === 'intro' && startT !== null &&
       (sim.elapsed - startT) > PULL + 0.75){ revealed = true; }
    if(revealed && revealP < 1){
      var k = REDUCED ? 1 : (1 - Math.exp(-step / 0.22));
      revealP += (1 - revealP) * k;
      if(1 - revealP < 0.004) revealP = 1;
    }
  }

  function render(){
    if(mode === 'intro'){
      var t = (startT === null) ? 0 : (sim.elapsed - startT);
      if(t < PULL){
        d = ease(clamp01(t / PULL));
      } else {
        /* released: a damped spring, so it visibly fights back rather than sliding home */
        var u = t - PULL;
        d = Math.exp(-u * 6.5) * Math.cos(u * 15);
      }
    }

    var dx = REACH * d, dy = 15 * d, rot = 6 * d;
    cardEl.setAttribute('transform',
      'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') rotate(' +
      rot.toFixed(2) + ' 180 120)');

    /* the tether runs from the anchor to the card's left edge and stretches */
    tetherEl.setAttribute('x2', (96 + dx).toFixed(1));
    tetherEl.setAttribute('y2', (120 + dy).toFixed(1));
    /* a stretched cord thins, which is most of what makes it read as taut */
    tetherEl.setAttribute('stroke-width', (5 - 1.5 * clamp01(Math.abs(d))).toFixed(2));

    lockEl.setAttribute('opacity', revealP.toFixed(2));
    boundEl.setAttribute('opacity', revealP.toFixed(2));
  }

  render();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
  if(REDUCED){
    /* no intro to watch: the card sits home and bound, and the drag still works */
    mode = 'free'; d = 0; revealed = true; revealP = 1; render();
  } else {
    sim.playOnce(el('stage'), 0.35, function(){ startT = sim.elapsed; });
  }
})();
