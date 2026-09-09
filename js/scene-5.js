/* Scene 5: one authority. A governance panel empties itself, one control at a
   time, and what is left is the code.

   The rows are ordinary HTML with a CSS transition, driven by a class the render
   pass toggles. Nothing here needs a canvas or a physics step.

   Ambient (piece 2): the emptied controls can be pressed, and they answer the
   press and then do absolutely nothing. That is the whole interaction and it is
   meant to be. A socket that ignores you reads as a broken page; a socket that
   depresses under your thumb and produces no result reads as a control that has
   been taken out, which is the distinction the scene is about. */
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

  /* ---------- ambient ---------- */
  var hint = el('poke');
  var pressed = false;

  Array.prototype.forEach.call(rows, function(row){
    Poke.press(row, {
      onDown: function(){
        /* Deliberately empty of consequence. The pressed state lives in CSS and
           nothing here changes data-gone, the code panel, or anything else.
           The one thing that does happen is the line below the panel saying
           what just failed to happen, once. */
        if(pressed) return;
        pressed = true;
        if(hint) hint.textContent = 'Nothing. They are not disabled, they are gone.';
      }
    });
  });

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
