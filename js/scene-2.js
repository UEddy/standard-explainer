/* Scene 2: one currency. A container fills with supply, the counter runs up to
   one billion, and then both stop dead against the lid.

   The bricks are the same bricks as scene 12, deliberately: a coral brick means
   a unit of circulating supply everywhere on this page. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-2');
  var P = 's2-';
  function el(id){ return document.getElementById(P + id); }
  function svgEl(n){ return document.createElementNS('http://www.w3.org/2000/svg', n); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim, startT = null;

  var CAP = 1000000000;
  var COLS = 6, ROWS = 9, N = COLS * ROWS;
  var BW = 36, BH = 12, GX = 4, ROWP = 16;
  var X0 = 62, FLOOR = 196;   /* bottom row sits just clear of the vessel floor */
  var FILL_TIME = 1.9;

  var bricks = [];
  (function build(){
    var g = el('bricks');
    for(var i = 0; i < N; i++){
      var r = svgEl('rect');
      r.setAttribute('x', X0 + (i % COLS) * (BW + GX));
      r.setAttribute('y', FLOOR - Math.floor(i / COLS) * ROWP - BH);
      r.setAttribute('width', BW);
      r.setAttribute('height', BH);
      r.setAttribute('rx', 3);
      r.setAttribute('fill', '#E0552F');
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      r.setAttribute('opacity', 0);
      g.appendChild(r);
      bricks.push(r);
    }
  })();

  var counter = el('counter'), lid = el('lid'), capLine = el('capLine'), stop = el('stop');

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(t){ return 1 - Math.pow(1 - t, 2.2); }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }

  function render(){
    var t = (startT === null) ? 0 : (sim.elapsed - startT);
    var p = ease(clamp01(t / FILL_TIME));
    var filled = Math.round(p * N);

    for(var i = 0; i < N; i++) bricks[i].setAttribute('opacity', i < filled ? 1 : 0);

    /* the counter lands on the real number, not near it */
    counter.textContent = (filled >= N) ? fmt(CAP) : fmt(CAP * filled / N);

    /* one thunk as it hits the ceiling, then nothing ever again */
    var hit = clamp01((t - FILL_TIME) / 0.16);
    var settle = (hit > 0 && hit < 1) ? Math.sin(hit * Math.PI) * 2.5 : 0;
    lid.setAttribute('transform', 'translate(0 ' + settle.toFixed(2) + ')');
    capLine.setAttribute('opacity', clamp01((t - FILL_TIME + 0.3) / 0.4).toFixed(2));
    stop.setAttribute('opacity', clamp01((t - FILL_TIME - 0.25) / 0.45).toFixed(2));
  }

  render();
  sim = SceneLoop.register({ root: ROOT, render: render });
  if(REDUCED){ startT = -99; render(); }
  else sim.playOnce(el('stage'), 0.3, function(){ startT = sim.elapsed; });
})();
