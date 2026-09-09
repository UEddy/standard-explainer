/* Scene 1: the problem. A wild market draws itself, then a dead flat emission
   schedule is laid straight through it without acknowledging any of it.

   The whole animation is a pure function of time since the beat was armed, so
   there is no state to keep in step and no way for it to end up half played. */
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
  function ease(t){ return 1 - Math.pow(1 - t, 3); }

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
  }

  render();
  sim = SceneLoop.register({ root: ROOT, render: render });
  if(REDUCED){
    startT = -99;                        /* paint the finished picture at once, */
    render();                            /* without waiting to be scrolled to */
  } else {
    sim.playOnce(el('stage'), 0.35, function(){ startT = sim.elapsed; });
  }
})();
