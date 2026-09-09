/* Scene 6: the Charter. Someone tries to take the licence away and it snaps
   back, because it is bound to whoever holds it.

   Not interactive on purpose. A one shot tug reads the same as letting the
   reader drag it, and it cannot be missed or fumbled on a phone. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-6');
  var P = 's6-';
  function el(id){ return document.getElementById(P + id); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim, startT = null;

  var PULL = 0.55;        /* seconds spent being dragged away */
  var REACH = 54;         /* how far it gets before the tether stops it */

  var cardEl = el('card'), tetherEl = el('tether');
  var boundEl = el('bound'), lockEl = el('lock');

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(t){ return 1 - Math.pow(1 - t, 3); }

  function render(){
    var t = (startT === null) ? 0 : (sim.elapsed - startT);
    var d;

    if(t < PULL){
      d = ease(clamp01(t / PULL));
    } else {
      /* released: a damped spring, so it visibly fights back rather than sliding home */
      var u = t - PULL;
      d = Math.exp(-u * 6.5) * Math.cos(u * 15);
    }

    var dx = REACH * d, dy = 15 * d, rot = 6 * d;
    cardEl.setAttribute('transform',
      'translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') rotate(' +
      rot.toFixed(2) + ' 180 120)');

    /* the tether runs from the anchor to the card's left edge and stretches */
    tetherEl.setAttribute('x2', (96 + dx).toFixed(1));
    tetherEl.setAttribute('y2', (120 + dy).toFixed(1));

    var settled = clamp01((t - PULL - 0.75) / 0.5);
    lockEl.setAttribute('opacity', settled.toFixed(2));
    boundEl.setAttribute('opacity', settled.toFixed(2));
  }

  render();
  sim = SceneLoop.register({ root: ROOT, render: render });
  if(REDUCED){ startT = -99; render(); }
  else sim.playOnce(el('stage'), 0.35, function(){ startT = sim.elapsed; });
})();
