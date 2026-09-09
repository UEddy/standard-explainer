/* Scene 1: the problem. A wild market draws itself, then a dead flat emission
   schedule is laid straight through it without acknowledging any of it.

   The drawing is a pure function of time since the beat was armed, so there is
   no state to keep in step and no way for it to end up half played.

   Ambient (piece 2): the reader can drag a probe along the chart. The market
   readout under their finger swings between ripping and crashing; the schedule
   readout says UNCHANGED at every x they can reach. The indifference is the
   lesson, so it needs to be something they can push against and fail to move,
   not just a flat line they are told about. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-1');
  var P = 's1-';
  function el(id){ return document.getElementById(P + id); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim, startT = null;

  /* hand picked so the chaos reads well at phone size */
  var MARKET = [[20,150],[44,118],[68,170],[92,94],[116,188],[140,62],[164,142],
                [188,44],[212,180],[236,108],[260,196],[284,86],[308,160],[332,122]];
  var FLAT_Y = 120;
  var X_MIN = MARKET[0][0], X_MAX = MARKET[MARKET.length-1][0];

  var marketEl = el('market'), flatEl = el('flat');
  var tagMarket = el('tagMarket'), tagFlat = el('tagFlat'), punch = el('punch');

  /* build the market path and measure it once, so the reveal is a dash offset */
  marketEl.setAttribute('d', 'M ' + MARKET.map(function(p){ return p[0]+' '+p[1]; }).join(' L '));
  flatEl.setAttribute('d', 'M 20 ' + FLAT_Y + ' L 340 ' + FLAT_Y);
  var marketLen = marketEl.getTotalLength();
  var flatLen = flatEl.getTotalLength();
  marketEl.setAttribute('stroke-dasharray', marketLen);
  flatEl.setAttribute('stroke-dasharray', flatLen);

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function clamp(v,a,b){ return v < a ? a : (v > b ? b : v); }
  function ease(t){ return 1 - Math.pow(1 - t, 3); }

  /* ---------- the probe ---------- */
  var probe = el('probe'), pLine = el('pLine'), pMarket = el('pMarket'),
      pFlat = el('pFlat'), pWord = el('pWord'), pFlatWord = el('pFlatWord');
  var hint = el('poke');

  var probeX = 180, probeP = 0, probeTarget = 0;

  /* the market is a polyline, so its height at any x is a straight
     interpolation between the two points either side */
  function marketAt(x){
    for(var i = 0; i < MARKET.length - 1; i++){
      var a = MARKET[i], b = MARKET[i+1];
      if(x <= b[0]){
        var f = (x - a[0]) / (b[0] - a[0]);
        return { y: a[1] + (b[1] - a[1]) * f, slope: (b[1] - a[1]) / (b[0] - a[0]) };
      }
    }
    var last = MARKET[MARKET.length-1], prev = MARKET[MARKET.length-2];
    return { y: last[1], slope: (last[1] - prev[1]) / (last[0] - prev[0]) };
  }

  /* y grows downward in SVG, so a negative slope is the market going up */
  function marketWord(slope){
    if(slope <= -2.5) return 'RIPPING';
    if(slope <= -0.8) return 'CLIMBING';
    if(slope <   0.8) return 'DRIFTING';
    if(slope <   2.5) return 'SLIDING';
    return 'CRASHING';
  }

  function grab(pt){
    probeTarget = 1;
    probeX = clamp(pt.x, X_MIN, X_MAX);
    Poke.hintUsed(hint);
    /* poking during the draw finishes it, so nobody ends up dragging a probe
       across a line that is only half there */
    if(startT === null || (sim.elapsed - startT) < 2.9) startT = sim.elapsed - 3.2;
  }

  Poke.drag(el('grab'), {
    onStart: grab,
    onMove: grab,
    onEnd: function(){ probeTarget = 0; }
  });

  function simulate(step){
    var k = REDUCED ? 1 : (1 - Math.exp(-step / 0.09));
    probeP += (probeTarget - probeP) * k;
    if(Math.abs(probeTarget - probeP) < 0.002) probeP = probeTarget;
  }

  function render(){
    var t = (startT === null) ? 0 : (sim.elapsed - startT);

    /* the market happens first, because it was always happening */
    var m = ease(clamp01(t / 1.15));
    marketEl.setAttribute('stroke-dashoffset', (marketLen * (1 - m)).toFixed(1));
    tagMarket.setAttribute('opacity', clamp01((t - 0.5) / 0.4).toFixed(2));

    /* then the schedule is laid straight through it, at one steady speed,
       because that is the point: it is not reacting to anything */
    var f = clamp01((t - 1.25) / 0.85);
    flatEl.setAttribute('stroke-dashoffset', (flatLen * (1 - f)).toFixed(1));
    tagFlat.setAttribute('opacity', clamp01((t - 1.9) / 0.4).toFixed(2));
    punch.setAttribute('opacity', clamp01((t - 2.3) / 0.5).toFixed(2));

    probe.setAttribute('opacity', probeP.toFixed(3));
    if(probeP < 0.004) return;

    var x = probeX.toFixed(1);
    var mk = marketAt(probeX);
    pLine.setAttribute('x1', x); pLine.setAttribute('x2', x);
    pMarket.setAttribute('cx', x); pMarket.setAttribute('cy', mk.y.toFixed(1));
    pFlat.setAttribute('cx', x);
    pFlat.setAttribute('cy', FLAT_Y);

    /* the word sits under the dot when the market is high, over it when low,
       so it never lands on top of the schedule tag in the corner */
    var above = mk.y > 76;
    pWord.setAttribute('x', x);
    pWord.setAttribute('y', (mk.y + (above ? -14 : 24)).toFixed(1));
    var w = marketWord(mk.slope);
    if(pWord.textContent !== w) pWord.textContent = w;

    /* pFlatWord never changes its text, ever. It only steps aside to the far
       end of the line when the probe would land on top of it, because the one
       thing that must never happen is the reader failing to read it. */
    if(probeX > 208){
      pFlatWord.setAttribute('x', 22); pFlatWord.setAttribute('text-anchor', 'start');
    } else {
      pFlatWord.setAttribute('x', 338); pFlatWord.setAttribute('text-anchor', 'end');
    }
  }

  render();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
  if(REDUCED){
    startT = -99;                        /* paint the finished picture at once, */
    render();                            /* without waiting to be scrolled to */
  } else {
    sim.playOnce(el('stage'), 0.35, function(){ startT = sim.elapsed; });
  }
})();
