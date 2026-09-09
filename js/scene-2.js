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

  /* 50 bricks of 20,000,000 each. The bottom row is the 100,000,000 genesis
     position, which is the only pre-mint and is locked in the pool forever. The
     45 above it are the entire issuance budget, and that is all there is. */
  var CAP = 1000000000, PER_BRICK = 20000000;
  var COLS = 5, ROWS = 10, N = COLS * ROWS;
  var GENESIS = COLS;                  /* one row, 100,000,000 */
  var BW = 44, BH = 11, GX = 4, ROWP = 14;
  var X0 = 62, FLOOR = 196;
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
      /* the genesis row is drawn differently: it was never issued to anyone */
      r.setAttribute('fill', i < GENESIS ? '#F0B49E' : '#E0552F');
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      r.setAttribute('opacity', i < GENESIS ? 1 : 0);
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
    var filled = GENESIS + Math.round(p * (N - GENESIS));

    for(var i = GENESIS; i < N; i++) bricks[i].setAttribute('opacity', i < filled ? 1 : 0);

    /* the counter lands on the real number, not near it */
    counter.textContent = (filled >= N) ? fmt(CAP) : fmt(filled * PER_BRICK);

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
