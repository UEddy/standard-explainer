/* Scene 2: one currency. A container fills with supply, the counter runs up to
   one billion, and then both stop dead against the lid.

   The bricks are the same bricks as scene 12, deliberately: a coral brick means
   a unit of circulating supply everywhere on this page.

   Ambient (piece 2): the stack answers a finger. Drag across it and the blocks
   shove out of the way and settle back into the same slots; press the lid and
   the stack compresses against it. Both are the same lesson from the other
   side. You can move the supply around as much as you like and there is still
   exactly as much of it, and the ceiling is not a soft thing you can lean on. */
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
      var bx = X0 + (i % COLS) * (BW + GX);
      var by = FLOOR - Math.floor(i / COLS) * ROWP - BH;
      r.setAttribute('x', bx);
      r.setAttribute('y', by);
      r.setAttribute('width', BW);
      r.setAttribute('height', BH);
      r.setAttribute('rx', 3);
      /* the genesis row is drawn differently: it was never issued to anyone */
      r.setAttribute('fill', i < GENESIS ? '#F0B49E' : '#E0552F');
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      r.setAttribute('opacity', i < GENESIS ? 1 : 0);
      g.appendChild(r);
      /* wx and wy are the offsets last written to the DOM. Without them the
         render skip below would drop the final write, the one that puts a brick
         back in its slot, and the stack would keep every nudge forever. */
      bricks.push({ el: r, bx: bx, by: by, row: Math.floor(i / COLS),
                    cx: bx + BW/2, cy: by + BH/2,
                    ox: 0, oy: 0, vx: 0, vy: 0, wx: 0, wy: 0 });
    }
  })();

  var counter = el('counter'), lid = el('lid'), capLine = el('capLine'), stop = el('stop');

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(t){ return 1 - Math.pow(1 - t, 2.2); }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }

  /* ---------- ambient ---------- */
  var hint = el('poke');
  var visible = GENESIS;               /* how many bricks the fill has revealed */

  /* Underdamped so a nudged brick visibly wobbles back rather than gliding
     home. Under reduced motion the same spring is critically damped: it still
     answers the finger, it just does not oscillate. */
  var K = 200, C = REDUCED ? 2 * Math.sqrt(200) : 11;

  /* The reach is an ellipse, not a circle, because the bricks are: they sit 48
     apart across and 14 apart up. A circle wide enough to catch the brick next
     to the finger would reach five rows down the column, so the whole stack
     moved in a vertical stripe. These radii catch the neighbour either side
     lightly and the rows above and below more, which is what a shove into a
     stack of flat blocks actually looks like. */
  var RX = 56, RY = 30;

  function shove(pt){
    Poke.hintUsed(hint);
    for(var i = 0; i < N; i++){
      if(i >= visible) break;
      var b = bricks[i];
      var dx = (b.cx + b.ox) - pt.x, dy = (b.cy + b.oy) - pt.y;
      var nd = Math.sqrt((dx/RX)*(dx/RX) + (dy/RY)*(dy/RY));
      if(nd > 1) continue;
      var force = (1 - nd) * 210;
      var d = Math.sqrt(dx*dx + dy*dy);
      if(d < 0.001){ dx = 1; dy = 0; d = 1; }
      b.vx += (dx / d) * force;
      b.vy += (dy / d) * force * 0.5;   /* sideways reads better than airborne */
    }
  }

  Poke.drag(el('grab'), { onStart: shove, onMove: shove });

  /* The lid. Pressing it does not move it, because it cannot be moved: what
     gives is the stack underneath. */
  var push = 0, pushTarget = 0;
  Poke.press(el('lidHit'), {
    onDown: function(){ pushTarget = 1; Poke.hintUsed(hint); },
    onUp:   function(){ pushTarget = 0; }
  });

  function simulate(step){
    for(var i = 0; i < N; i++){
      var b = bricks[i];
      if(b.ox === 0 && b.oy === 0 && b.vx === 0 && b.vy === 0) continue;
      b.vx += (-K * b.ox - C * b.vx) * step;
      b.vy += (-K * b.oy - C * b.vy) * step;
      b.ox += b.vx * step;
      b.oy += b.vy * step;
      if(Math.abs(b.ox) < 0.02 && Math.abs(b.vx) < 0.06){ b.ox = 0; b.vx = 0; }
      if(Math.abs(b.oy) < 0.02 && Math.abs(b.vy) < 0.06){ b.oy = 0; b.vy = 0; }
    }
    var k = REDUCED ? 1 : (1 - Math.exp(-step / 0.07));
    push += (pushTarget - push) * k;
    if(Math.abs(pushTarget - push) < 0.003) push = pushTarget;
  }

  function render(){
    var t = (startT === null) ? 0 : (sim.elapsed - startT);
    var p = ease(clamp01(t / FILL_TIME));
    var filled = GENESIS + Math.round(p * (N - GENESIS));
    visible = filled;

    for(var i = GENESIS; i < N; i++) bricks[i].el.setAttribute('opacity', i < filled ? 1 : 0);

    /* The stack squashes against the lid, most at the top where there is most
       stack beneath it to give. The lid itself never moves.

       The skip compares against what was last written rather than against zero.
       Skipping on "offset is zero" looks equivalent and is not: it drops the one
       write that puts a settled brick back in its slot, so every nudge stays on
       screen forever while the simulation believes the stack is home. */
    for(var j = 0; j < N; j++){
      var b = bricks[j];
      var ox = b.ox, oy = b.oy + push * 2.4 * (b.row / (ROWS - 1));
      if(ox === b.wx && oy === b.wy) continue;
      b.wx = ox; b.wy = oy;
      b.el.setAttribute('x', (b.bx + ox).toFixed(2));
      b.el.setAttribute('y', (b.by + oy).toFixed(2));
    }

    /* the counter lands on the real number, not near it, and then nothing any
       finger does to this picture changes it again */
    counter.textContent = (filled >= N) ? fmt(CAP) : fmt(filled * PER_BRICK);

    /* one thunk as it hits the ceiling, then nothing ever again */
    var hit = clamp01((t - FILL_TIME) / 0.16);
    var settle = (hit > 0 && hit < 1) ? Math.sin(hit * Math.PI) * 2.5 : 0;
    lid.setAttribute('transform', 'translate(0 ' + settle.toFixed(2) + ')');
    capLine.setAttribute('opacity',
      Math.max(clamp01((t - FILL_TIME + 0.3) / 0.4), push).toFixed(2));
    capLine.setAttribute('stroke-width', (2 + push * 1.6).toFixed(2));
    stop.setAttribute('opacity', clamp01((t - FILL_TIME - 0.25) / 0.45).toFixed(2));
  }

  render();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
  if(REDUCED){ startT = -99; render(); }
  else sim.playOnce(el('stage'), 0.3, function(){ startT = sim.elapsed; });
})();
