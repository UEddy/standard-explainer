/* Scene 4: one signal. Two buttons push ETH into the pool or take it out, and a
   single needle answers. There is nothing else on the instrument, because there
   is nothing else the protocol reads.

   Flow decays back to level on its own, so the toy has to be pushed to be held.
   That is the honest shape of a flow reading: it is a rate, not a balance. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-4');
  var P = 's4-';
  function el(id){ return document.getElementById(P + id); }

  var sim;
  var flow = 0;        /* -1 to 1, the target the needle chases */
  var needle = 0;      /* what the needle is actually showing */

  var PUSH = 0.38;     /* one tap should read as money moving, not as a rounding error */
  var DECAY = 2.2;     /* seconds for a push to fade back to level */
  var LAG = 0.14;      /* needle inertia, so it has some weight */
  var SPAN = 74;       /* degrees either side of level */

  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
  function polar(r, a){
    var rad = a * Math.PI / 180;
    return { x: 180 + r * Math.sin(rad), y: 176 - r * Math.cos(rad) };
  }
  function arc(r, a, b){
    var p0 = polar(r, a), p1 = polar(r, b);
    return 'M ' + p0.x.toFixed(1) + ' ' + p0.y.toFixed(1) +
           ' A ' + r + ' ' + r + ' 0 0 ' + (b > a ? 1 : 0) + ' ' +
           p1.x.toFixed(1) + ' ' + p1.y.toFixed(1);
  }

  el('arcOut').setAttribute('d', arc(118, -SPAN, -6));
  el('arcIn').setAttribute('d', arc(118, 6, SPAN));
  (function ticks(){
    var g = el('ticks');
    for(var i = -4; i <= 4; i++){
      var a = (i / 4) * SPAN;
      var p1 = polar(104, a), p2 = polar(112, a);
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', p1.x.toFixed(1)); l.setAttribute('y1', p1.y.toFixed(1));
      l.setAttribute('x2', p2.x.toFixed(1)); l.setAttribute('y2', p2.y.toFixed(1));
      l.setAttribute('stroke', '#241E18');
      l.setAttribute('stroke-width', i === 0 ? 3.5 : 1.8);
      l.setAttribute('stroke-linecap', 'round');
      l.setAttribute('opacity', i === 0 ? 1 : 0.4);
      g.appendChild(l);
    }
  })();

  function push(dir){
    flow = clamp(flow + dir * PUSH, -1, 1);
  }
  el('in').addEventListener('click', function(){ push(1); });
  el('out').addEventListener('click', function(){ push(-1); });

  function simulate(step){
    flow *= Math.exp(-step / DECAY);
    if(Math.abs(flow) < 0.001) flow = 0;
    needle += (flow - needle) * (1 - Math.exp(-step / LAG));
  }

  var needleEl = el('needle'), hubEl = el('hub'), wordEl = el('word'), pulseEl = el('pulse');
  var lastWord = '';

  function word(v){
    if(v > 0.62) return 'pouring in';
    if(v > 0.22) return 'money coming in';
    if(v > 0.06) return 'a trickle in';
    if(v < -0.62) return 'draining out';
    if(v < -0.22) return 'money going out';
    if(v < -0.06) return 'a trickle out';
    return 'level';
  }

  function render(){
    var a = needle * SPAN;
    var tip = polar(96, a);
    needleEl.setAttribute('x2', tip.x.toFixed(1));
    needleEl.setAttribute('y2', tip.y.toFixed(1));

    var col = needle > 0.06 ? '#2E9E67' : (needle < -0.06 ? '#CB3220' : '#241E18');
    needleEl.setAttribute('stroke', col);
    hubEl.setAttribute('fill', col);

    /* the arc only lights on the side the money is actually moving */
    el('arcIn').setAttribute('opacity', (0.18 + 0.82 * clamp(needle, 0, 1)).toFixed(2));
    el('arcOut').setAttribute('opacity', (0.18 + 0.82 * clamp(-needle, 0, 1)).toFixed(2));
    pulseEl.setAttribute('r', (7 + Math.abs(needle) * 5).toFixed(1));
    pulseEl.setAttribute('fill', col);

    var w = word(needle);
    if(w !== lastWord){ wordEl.textContent = w; lastWord = w; }
    wordEl.style.color = col;
  }

  render();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
})();
