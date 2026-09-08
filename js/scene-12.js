(function(){
  'use strict';

  var REDUCED = SceneLoop.reducedMotion;
  var sim;

  /* ---------- illustrative constants. Only the 1 billion cap is verified. ---------- */
  var PER_BRICK = 5e6;
  var BASE = 24;             /* bricks already circulating: 120M */
  var CLAIMS = 36;           /* bricks accrued but not counted: 180M */
  var DEPTHS = [40e6, 120e6, 400e6];
  var DEPTH_NAME = ['a thin pool', 'a middling pool', 'a deep pool'];
  var depth = 1;

  /* ---------- geometry ---------- */
  var BW = 50, BH = 13, GX = 4, COLS = 6, X0 = 20, ROW = 17;
  var LINE = 200;
  function aboveXY(slot){
    return { x: X0 + (slot % COLS) * (BW + GX), y: 181 - Math.floor(slot / COLS) * ROW };
  }
  function belowXY(slot){
    return { x: X0 + (slot % COLS) * (BW + GX), y: 206 + Math.floor(slot / COLS) * ROW };
  }

  /* This scene owns one section of a shared page, so every lookup is namespaced
     to it. Nothing here may reach outside ROOT. */
  var ROOT = document.getElementById('scene-12');
  var P = 's12-';
  function el(id){ return document.getElementById(P + id); }
  function svgEl(n){ return document.createElementNS('http://www.w3.org/2000/svg', n); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function fmtM(n){ return Math.round(n/1e6) + 'M'; }
  function lerp(a,b,t){ return a+(b-a)*t; }

  var C_LOCKED = [91,62,155], C_CIRC = [224,85,47];
  function brickColour(t){
    return 'rgb('+Math.round(lerp(C_LOCKED[0],C_CIRC[0],t))+','+
                  Math.round(lerp(C_LOCKED[1],C_CIRC[1],t))+','+
                  Math.round(lerp(C_LOCKED[2],C_CIRC[2],t))+')';
  }

  /* ---------- bricks ---------- */
  (function buildBase(){
    var g = el('baseBricks');
    for(var s=0; s<BASE; s++){
      var p = aboveXY(s);
      var r = svgEl('rect');
      r.setAttribute('x', p.x); r.setAttribute('y', p.y);
      r.setAttribute('width', BW); r.setAttribute('height', BH);
      r.setAttribute('rx', 3.5);
      r.setAttribute('fill', '#E0552F');
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      g.appendChild(r);
    }
  })();

  var claims = [];
  (function buildClaims(){
    var g = el('claimBricks');
    for(var i=0; i<CLAIMS; i++){
      var p = belowXY(i);
      var r = svgEl('rect');
      r.setAttribute('width', BW); r.setAttribute('height', BH);
      r.setAttribute('rx', 3.5);
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      g.appendChild(r);
      claims.push({ el:r, x:p.x, y:p.y, tx:p.x, ty:p.y });
    }
  })();

  /* ---------- state ---------- */
  var share = 0;                 /* 0 to 1 */
  var converted = 0;             /* whole bricks */
  var revealP = REDUCED ? 1 : 0;
  var revealTarget = REDUCED ? 1 : 0;
  var revealArmed = false;
  var stageVisible = false;
  var revealDue = false;

  function retarget(){
    converted = Math.round(share * CLAIMS);
    var below = 0;
    for(var i=0; i<CLAIMS; i++){
      var p = (i < converted) ? aboveXY(BASE + i) : belowXY(below++);
      claims[i].tx = p.x;
      claims[i].ty = p.y;
    }
  }
  retarget();
  for(var k=0; k<CLAIMS; k++){ claims[k].x = claims[k].tx; claims[k].y = claims[k].ty; }

  /* ---------- price ---------- */
  function priceRatio(convertedTokens){
    var S = DEPTHS[depth];
    var r = S / (S + convertedTokens);
    return r * r;            /* constant product: price scales with the square */
  }

  var GX0 = 6, GX1 = 334, GY_TOP = 16, GY_BOT = 118;
  function cy(ratio){ return GY_BOT - clamp(ratio,0,1) * (GY_BOT - GY_TOP); }

  function drawCurve(){
    var pts = [];
    for(var i=0; i<=60; i++){
      var f = i/60;
      var x = GX0 + f * (GX1 - GX0);
      pts.push(x.toFixed(1) + ',' + cy(priceRatio(f * CLAIMS * PER_BRICK)).toFixed(1));
    }
    el('curve').setAttribute('points', pts.join(' '));
  }
  drawCurve();

  /* ---------- controls ---------- */
  var WORDS = [[0.001,'Nobody is leaving'],[0.2,'A few head out'],[0.5,'A steady stream'],[0.85,'Most of them'],[2,'Everyone at once']];
  function shareWord(f){
    for(var i=0;i<WORDS.length;i++) if(f < WORDS[i][0]) return WORDS[i][1];
    return WORDS[WORDS.length-1][1];
  }

  var exitEl = el('exit');
  exitEl.addEventListener('input', function(){
    share = parseFloat(exitEl.value) / 100;
    el('exitNum').textContent = Math.round(share*100) + '%';
    el('exitWord').textContent = shareWord(share);
    exitEl.setAttribute('aria-valuetext', Math.round(share*100) + ' percent, ' + shareWord(share).toLowerCase());
    retarget();
    reveal();
  });

  var segBtns = ROOT.querySelectorAll('.seg button');
  Array.prototype.forEach.call(segBtns, function(b){
    b.addEventListener('click', function(){
      depth = parseInt(b.getAttribute('data-d'), 10);
      Array.prototype.forEach.call(segBtns, function(o){
        o.setAttribute('aria-checked', o === b ? 'true' : 'false');
      });
      drawCurve();
      render(0);
    });
  });

  /* The reveal is the scene's one automatic beat, and it is owed to the reader
     rather than to the clock. It is armed by the stage itself coming properly into
     view, not by the scene registering, because on the assembled page the scene
     wrapper starts a screen or more above the stage: arming on activation would
     open the water while the reader was still on the headline, and they would
     arrive to a scene that had already given itself away.

     Once armed it waits on the scene clock, so a reader who scrolls past spends
     only the time they actually looked. If it comes due while the stage is out of
     view it waits instead of firing blind. It never replays: revealTarget stays
     set, so coming back shows the revealed state. */
  function reveal(){ revealTarget = 1; revealArmed = true; revealDue = false; }

  function stageCameIntoView(){
    if(revealTarget) return;
    if(revealDue){ reveal(); return; }
    if(revealArmed) return;
    revealArmed = true;
    sim.after(1.0, function(){
      if(revealTarget) return;
      if(stageVisible) reveal(); else revealDue = true;
    });
  }

  function watchStage(){
    if(!window.IntersectionObserver) return;
    new IntersectionObserver(function(entries){
      var e = entries[entries.length-1];
      stageVisible = e.isIntersecting && e.intersectionRatio >= 0.4;
      if(stageVisible) stageCameIntoView();
    }, { threshold: [0, 0.4, 0.75] }).observe(el('stage'));
  }

  /* ---------- simulation ---------- */
  function simulate(step){
    var k = 1 - Math.exp(-step / 0.16);
    for(var i=0; i<CLAIMS; i++){
      var b = claims[i];
      b.x += (b.tx - b.x) * k;
      b.y += (b.ty - b.y) * k;
    }
    if(revealP !== revealTarget){
      revealP += (revealTarget - revealP) * (1 - Math.exp(-step / 0.28));
      if(Math.abs(revealTarget - revealP) < 0.002) revealP = revealTarget;
    }
  }

  /* ---------- drawing ---------- */
  var rCounted = el('rCounted'), rClaims = el('rClaims'), hintEl = el('hint');
  var waterEl = el('water'), dl1 = el('deepLabel'), dl2 = el('deepLabel2');
  var priceNum = el('priceNum'), markEl = el('mark'), dotEl = el('dot');
  var calmG = el('calm'), calmNum = el('calmNum');
  var lastHint = '';

  function render(){
    for(var i=0; i<CLAIMS; i++){
      var b = claims[i];
      b.el.setAttribute('x', b.x.toFixed(1));
      b.el.setAttribute('y', b.y.toFixed(1));
      /* a brick turns from locked violet to circulating coral as it breaks the surface */
      b.el.setAttribute('fill', brickColour(clamp((LINE - (b.y + BH)) / 26, 0, 1)));
    }

    waterEl.setAttribute('opacity', (0.92 - 0.58 * revealP).toFixed(3));
    dl1.setAttribute('opacity', revealP.toFixed(3));
    dl2.setAttribute('opacity', revealP.toFixed(3));

    var convTokens = converted * PER_BRICK;
    var countedNow = BASE * PER_BRICK + convTokens;
    calmNum.textContent = fmtM(countedNow);
    /* the calm number holds only while nothing is converting. The moment claims
       start crossing the line it loses its authority, and the stack takes its place. */
    calmG.setAttribute('opacity', clamp(1 - (converted / CLAIMS) / 0.13, 0, 1).toFixed(3));
    rCounted.textContent = fmtM(countedNow);
    rClaims.textContent = fmtM((CLAIMS - converted) * PER_BRICK);

    var ratio = priceRatio(convTokens);
    var pct = Math.round((ratio - 1) * 100);
    priceNum.innerHTML = (pct === 0 ? '0%' : pct + '%') + '<span class="unit"> vs today</span>';
    priceNum.style.color = pct <= -25 ? 'var(--contract)' : 'var(--ink)';

    var x = GX0 + share * (GX1 - GX0);
    markEl.setAttribute('x1', x.toFixed(1)); markEl.setAttribute('x2', x.toFixed(1));
    dotEl.setAttribute('cx', x.toFixed(1));
    dotEl.setAttribute('cy', cy(ratio).toFixed(1));

    var msg;
    if(converted === 0){
      msg = 'Nothing has converted. The supply number looks small and steady.';
    } else {
      msg = '<b>' + fmtM(convTokens) + '</b> just became supply. No new tokens were minted. ' +
            'These claims already existed, in ' + DEPTH_NAME[depth] + '.';
    }
    if(msg !== lastHint){ hintEl.innerHTML = msg; lastHint = msg; }
  }

  /* ---------- go ---------- */
  render();
  sim = SceneLoop.register({
    root: ROOT,
    step: 1/60,
    simulate: simulate,
    render: render,
    /* only used where there is no IntersectionObserver to watch the stage */
    onResume: function(away, s){
      if(window.IntersectionObserver) return;
      if(!revealArmed && !revealTarget){ revealArmed = true; s.after(1.0, reveal); }
    }
  });
  watchStage();
})();
