/* Scene 5: one authority. A governance panel empties itself, one control at a
   time, and what is left is the code.

   The rows are ordinary HTML with a CSS transition, driven by a class the render
   pass toggles. Nothing here needs a canvas or a physics step. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-5');
  var P = 's5-';
  function el(id){ return document.getElementById(P + id); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim, startT = null;

  var rows = ROOT.querySelectorAll('.gov-row');
  var codeEl = el('code');
  var GAP = 0.26;        /* seconds between one control going and the next */
  var FIRST = 0.25;

  function render(){
    var t = (startT === null) ? 0 : (sim.elapsed - startT);
    for(var i = 0; i < rows.length; i++){
      var gone = t >= FIRST + i * GAP;
      if(gone !== (rows[i].getAttribute('data-gone') === 'true')){
        rows[i].setAttribute('data-gone', gone ? 'true' : 'false');
      }
    }
    var done = t >= FIRST + rows.length * GAP + 0.25;
    if(done !== (codeEl.getAttribute('data-on') === 'true')){
      codeEl.setAttribute('data-on', done ? 'true' : 'false');
    }
  }

  render();
  sim = SceneLoop.register({ root: ROOT, render: render });
  if(REDUCED){ startT = -99; render(); }
  else sim.playOnce(el('stage'), 0.3, function(){ startT = sim.elapsed; });
})();
