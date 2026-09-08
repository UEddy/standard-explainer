(function(){
  'use strict';

  var REDUCED = SceneLoop.reducedMotion;
  var sim;

  /* ---------- illustrative constants ---------- */
  var N = 4;                 /* Branches open at the start */
  var RATE = 9;              /* $STANDARD per Branch per second */
  var FULL = 900;            /* what a full column is worth, for the drawing only */
  var HOLD = 0.85;           /* seconds of holding needed to retire */
  var RELEASE = 0.22;        /* how fast an abandoned hold springs back */
  var DRAIN = REDUCED ? 0.06 : 0.7;

  /* ---------- geometry ---------- */
  var COL_X = [55, 121, 187, 253], COL_W = 52;
  var FLOOR = 246, TOPY = 76, MAXH = FLOOR - TOPY;

  /* This scene owns one section of a shared page, so every lookup is namespaced
     to it. Nothing here may reach outside ROOT. */
  var ROOT = document.getElementById('scene-10');
  var P = 's10-';
  function el(id){ return document.getElementById(P + id); }
  function svgEl(n){ return document.createElementNS('http://www.w3.org/2000/svg', n); }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function smooth(t){ return t*t*(3-2*t); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }

  /* ---------- state ---------- */
  var branches = [];
  var wallet = 0;
  var lastHint = '', lastRetired = 0;

  function fresh(){
    branches = [];
    for(var i=0;i<N;i++){
      branches.push({ i:i, open:true, accrued:0, hold:0, holding:false,
                      payout:0, paid:0, drainT:1, show:0 });
    }
    wallet = 0;
    lastRetired = 0;
  }
  fresh();

  /* ---------- build the vault columns and feeds ---------- */
  var colEls = [], colG = el('cols'), feedG = el('feeds');
  (function build(){
    for(var i=0;i<N;i++){
      var r = svgEl('rect');
      r.setAttribute('x', COL_X[i]);
      r.setAttribute('width', COL_W);
      r.setAttribute('rx', 7);
      r.setAttribute('fill', '#5B3E9B');
      colG.appendChild(r);
      colEls.push(r);

      var cx = COL_X[i] + COL_W/2;
      var casing = svgEl('path');
      casing.setAttribute('d', 'M '+cx+' 258 V 276');
      casing.setAttribute('stroke', '#241E18');
      casing.setAttribute('stroke-width', 11);
      casing.setAttribute('stroke-linecap', 'round');
      feedG.appendChild(casing);
      var bore = svgEl('path');
      bore.setAttribute('d', 'M '+cx+' 258 V 274');
      bore.setAttribute('stroke', '#5B3E9B');
      bore.setAttribute('stroke-width', 5);
      bore.setAttribute('stroke-linecap', 'round');
      bore.setAttribute('class', 'feedbore');
      feedG.appendChild(bore);

      var lab = svgEl('text');
      lab.setAttribute('x', cx);
      lab.setAttribute('y', 255);   /* below the vault floor, so a full column cannot hide it */
      lab.setAttribute('text-anchor', 'middle');
      lab.setAttribute('font-family', 'ui-monospace,Consolas,monospace');
      lab.setAttribute('font-size', 9);
      lab.setAttribute('fill', '#6E6053');
      lab.textContent = String(i+1);
      colG.appendChild(lab);
    }
  })();
  var feedBores = ROOT.querySelectorAll('.feedbore');

  /* ---------- build the Branch buttons ---------- */
  var btns = [], amtEls = [], fillEls = [], crackEls = [], bldgEls = [];
  (function buildButtons(){
    var host = el('branches');
    for(var i=0;i<N;i++){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'branch';
      b.id = P + 'branch' + i;
      b.setAttribute('aria-label', 'Retire Branch '+(i+1)+'. Press and hold. This cannot be undone.');
      b.innerHTML =
        '<span class="bname">Branch '+(i+1)+'</span>' +
        '<svg class="bldg" viewBox="0 0 48 42" aria-hidden="true">' +
          '<g class="body">' +
            '<path d="M24 5 L45 17 H3 Z" fill="#5B3E9B" stroke="#241E18" stroke-width="2.5" stroke-linejoin="round"/>' +
            '<rect x="7" y="17" width="34" height="16" fill="#5B3E9B" stroke="#241E18" stroke-width="2.5"/>' +
            '<rect x="11" y="20" width="5" height="10" fill="#FFFCF5"/>' +
            '<rect x="21" y="20" width="5" height="10" fill="#FFFCF5"/>' +
            '<rect x="31" y="20" width="5" height="10" fill="#FFFCF5"/>' +
            '<rect x="3" y="33" width="42" height="6" rx="2" fill="#241E18"/>' +
          '</g>' +
          '<path class="crack" d="M24 6 L20 15 L28 20 L21 27 L26 34" fill="none" stroke="#241E18" ' +
                'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" ' +
                'stroke-dasharray="46" stroke-dashoffset="46"/>' +
        '</svg>' +
        '<span class="bamt">0</span>' +
        '<span class="hold"><span class="holdfill"></span></span>';
      host.appendChild(b);
      btns.push(b);
      amtEls.push(b.querySelector('.bamt'));
      fillEls.push(b.querySelector('.holdfill'));
      crackEls.push(b.querySelector('.crack'));
      bldgEls.push(b.querySelector('.body'));
      wire(b, i);
    }
  })();

  /* ---------- holding ---------- */
  function startHold(i){
    var b = branches[i];
    if(!b.open) return;
    b.holding = true;
  }
  function endHold(i){
    branches[i].holding = false;
  }
  function wire(btn, i){
    btn.addEventListener('pointerdown', function(ev){
      if(!branches[i].open) return;
      ev.preventDefault();
      try { btn.setPointerCapture(ev.pointerId); } catch(e){}
      startHold(i);
    });
    btn.addEventListener('pointerup', function(){ endHold(i); });
    btn.addEventListener('pointercancel', function(){ endHold(i); });
    btn.addEventListener('lostpointercapture', function(){ endHold(i); });
    btn.addEventListener('keydown', function(ev){
      if(ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); startHold(i); }
    });
    btn.addEventListener('keyup', function(ev){
      if(ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); endHold(i); }
    });
    btn.addEventListener('blur', function(){ endHold(i); });
  }

  function retire(b){
    b.open = false;
    b.holding = false;
    b.hold = 0;
    b.payout = b.accrued;
    b.paid = 0;
    b.drainT = 0;
    b.accrued = 0;
    lastRetired = b.i + 1;

    var btn = btns[b.i];
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('aria-label', 'Branch '+(b.i+1)+' is retired. It cannot be reopened.');
    bldgEls[b.i].querySelectorAll('[fill="#5B3E9B"]').forEach(function(n){ n.setAttribute('fill', '#C6BCAE'); });
    if(!REDUCED){
      btn.classList.remove('snap');
      void btn.offsetWidth;
      btn.classList.add('snap');
    }
    if(feedBores[b.i]) feedBores[b.i].setAttribute('stroke', '#D8CEBE');
  }

  /* ---------- simulation ---------- */
  function simulate(step){
    for(var i=0;i<N;i++){
      var b = branches[i];

      if(b.open){
        b.accrued += RATE * step;
        if(b.holding){
          b.hold += step / HOLD;
          if(b.hold >= 1){ b.hold = 1; retire(b); }
        } else if(b.hold > 0){
          b.hold = Math.max(0, b.hold - step / RELEASE);
        }
        b.show = b.accrued;
      } else if(b.drainT < 1){
        b.drainT = Math.min(1, b.drainT + step / DRAIN);
        var e = smooth(b.drainT);
        var target = b.payout * e;
        wallet += target - b.paid;
        b.paid = target;
        b.show = b.payout * (1 - e);
      } else {
        b.show = 0;
      }
    }
  }

  /* ---------- drawing ---------- */
  var rLocked = el('rLocked'), rWallet = el('rWallet'), hintEl = el('hint');
  var sRate = el('sRate'), sOpen = el('sOpen'), sGone = el('sGone');

  function render(){
    var locked = 0, open = 0, holdingAny = false;

    for(var i=0;i<N;i++){
      var b = branches[i];
      locked += b.show;
      if(b.open) open++;
      if(b.holding) holdingAny = true;

      var h = clamp(b.show / FULL, 0, 1) * MAXH;
      var r = colEls[i];
      r.setAttribute('y', (FLOOR - h).toFixed(1));
      r.setAttribute('height', h.toFixed(1));

      amtEls[i].textContent = b.open ? fmt(b.accrued) : 'gone';
      fillEls[i].style.width = (b.hold * 100).toFixed(1) + '%';
      /* a retired Branch keeps its crack: the damage is the point */
      crackEls[i].setAttribute('stroke-dashoffset', b.open ? (46 * (1 - b.hold)).toFixed(1) : 0);
    }

    rLocked.textContent = fmt(locked);
    rWallet.textContent = fmt(wallet);
    sRate.textContent = fmt(open * RATE);
    sOpen.textContent = String(open);
    sGone.textContent = String(N - open);

    var msg;
    if(open === 0){
      msg = '<b>Every token is yours.</b> Nothing earns any more.';
    } else if(holdingAny){
      msg = '<b>Keep holding.</b> This cannot be undone.';
    } else if(lastRetired){
      msg = 'Branch ' + lastRetired + ' paid out and is gone. It will never earn again.';
    } else {
      msg = 'None of this is yours yet. Press and hold a Branch to take its share.';
    }
    if(msg !== lastHint){ hintEl.innerHTML = msg; lastHint = msg; }
  }

  /* ---------- reset ---------- */
  el('reset').addEventListener('click', function(){
    fresh();
    for(var i=0;i<N;i++){
      btns[i].removeAttribute('aria-disabled');
      btns[i].setAttribute('aria-label', 'Retire Branch '+(i+1)+'. Press and hold. This cannot be undone.');
      btns[i].classList.remove('snap');
      bldgEls[i].querySelectorAll('[fill="#C6BCAE"]').forEach(function(n){ n.setAttribute('fill', '#5B3E9B'); });
      if(feedBores[i]) feedBores[i].setAttribute('stroke', '#5B3E9B');
    }
    lastHint = '';
    render();
  });

  /* ---------- go ---------- */
  render();
  sim = SceneLoop.register({
    root: ROOT,
    step: 1/60,
    simulate: simulate,
    render: render,
    /* a hold must not survive the scene going away underneath the reader */
    onPause: function(){ for(var i=0;i<N;i++) branches[i].holding = false; }
  });
})();
