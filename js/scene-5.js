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
  var told = false;

  /* The second line is owed to every reader, not only the ones who press.
     Whether a control was removed or merely switched off is part of what this
     scene is for, so it cannot sit behind an interaction: a reader who only
     scrolls would be left with an instruction and no answer to it. It arrives
     on its own once the panel has finished emptying, and a press only brings it
     forward. */
  var SETTLED = FIRST + rows.length * GAP + 1.5;

  function tell(){
    if(told) return;
    told = true;
    if(hint) hint.textContent = 'They are not disabled. They are gone.';
  }

  Array.prototype.forEach.call(rows, function(row){
    /* Deliberately empty of consequence. The pressed state lives in CSS and
       nothing here changes data-gone, the code panel, or anything else. */
    Poke.press(row, { onDown: tell });
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
    if(t >= SETTLED) tell();
  }

  render();
  sim = SceneLoop.register({ root: ROOT, render: render });
  if(REDUCED){ startT = -99; render(); }   /* -99 is past SETTLED, so the line is already there */
  else sim.playOnce(el('stage'), 0.3, function(){ startT = sim.elapsed; });
})();
