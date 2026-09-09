/* Scene 9: the two regimes. One slider, two vaults, and only one of them is ever
   awake. Money coming in buys hard assets. Money going out buys the token back
   and burns it, at a rate that is deliberately throttled.

   The throttle is the part worth feeling: even with the flow pinned to the floor,
   the burn comes out as a drip, and the readout says which of the two limits is
   the one actually holding it back. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-9');
  var P = 's9-';
  function el(id){ return document.getElementById(P + id); }
  function svgEl(n){ return document.createElementNS('http://www.w3.org/2000/svg', n); }

  var sim;
  var flow = 0;              /* -1 out, +1 in */
  var reserves = 0;          /* hard assets bought during expansion */
  var vault = 0;             /* contraction vault, waiting to be spent */
  var burned = 0;

  /* All illustrative. One second of this toy stands for one hour of protocol time,
     which is the period the whitepaper states the buyback limits over. */
  var REVENUE = 260;         /* protocol revenue per hour, before the 70/15/15 split */
  var TO_VAULT = 0.70;       /* verified: 70 percent goes to whichever vault is active */
  var POOL = 900000;         /* pool reserves */
  var CAP_VAULT = 0.10;      /* verified: at most 10 percent of the vault balance per hour */
  var CAP_POOL = 0.002;      /* verified: at most 0.2 percent of pool reserves per hour */

  var INGOTS = 18;
  var ingots = [];
  (function build(){
    var g = el('ingots');
    for(var i = 0; i < INGOTS; i++){
      var col = i % 3, row = Math.floor(i / 3);
      var r = svgEl('rect');
      r.setAttribute('x', 30 + col * 30);
      r.setAttribute('y', 186 - row * 15);
      r.setAttribute('width', 26);
      r.setAttribute('height', 11);
      r.setAttribute('rx', 2.5);
      r.setAttribute('fill', '#C8922A');
      r.setAttribute('stroke', '#241E18');
      r.setAttribute('stroke-width', 1.6);
      r.setAttribute('opacity', 0);
      g.appendChild(r);
      ingots.push(r);
    }
  })();

  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }

  var slider = el('flow');
  slider.addEventListener('input', function(){
    flow = parseInt(slider.value, 10) / 100;
    slider.setAttribute('aria-valuetext', flowWord());
  });

  function flowWord(){
    if(flow > 0.15) return 'money coming in, expansion';
    if(flow < -0.15) return 'money going out, contraction';
    return 'level, neither regime';
  }

  function simulate(step){
    var rev = REVENUE * Math.abs(flow) * TO_VAULT * step;
    if(flow > 0.02){
      reserves += rev;
      vault = Math.max(0, vault - vault * 0.04 * step);   /* the other vault drains away */
    } else if(flow < -0.02){
      vault += rev;
    }
    /* buybacks run whenever there is anything in the contraction vault */
    if(vault > 0){
      var spend = Math.min(CAP_VAULT * vault, CAP_POOL * POOL) * step;
      spend = Math.min(spend, vault);
      vault -= spend;
      burned += spend;
    }
  }

  var expandCard = el('expand'), contractCard = el('contract');
  var reserveNum = el('reserveNum'), flowNum = el('flowNum'), burnedNum = el('burnedNum');
  var throttleEl = el('throttle'), fillEl = el('vaultFill'), wordEl = el('word');
  var lastThrottle = '', lastWord = '';

  function render(){
    var expanding = flow > 0.02, contracting = flow < -0.02;

    expandCard.setAttribute('opacity', expanding ? 1 : 0.32);
    contractCard.setAttribute('opacity', contracting || vault > 1 ? 1 : 0.32);

    var shown = Math.min(INGOTS, Math.floor(reserves / 900));
    for(var i = 0; i < INGOTS; i++) ingots[i].setAttribute('opacity', i < shown ? 1 : 0);

    var h = clamp(vault / 4000, 0, 1) * 86;
    fillEl.setAttribute('y', (192 - h).toFixed(1));
    fillEl.setAttribute('height', h.toFixed(1));

    reserveNum.textContent = fmt(reserves);
    burnedNum.textContent = fmt(burned);
    flowNum.textContent = (flow > 0 ? '+' : '') + Math.round(flow * 100) + '%';

    /* which of the two verified limits is actually binding right now */
    var msg;
    if(vault <= 0.5){
      msg = 'nothing to spend';
    } else if(CAP_VAULT * vault < CAP_POOL * POOL){
      msg = 'held back by the 10% of vault limit';
    } else {
      msg = 'held back by the 0.2% of pool depth limit';
    }
    msg = 'vault ' + fmt(vault) + ', ' + msg;
    if(msg !== lastThrottle){ throttleEl.textContent = msg; lastThrottle = msg; }

    var w = expanding ? 'Expansion' : (contracting ? 'Contraction' : 'Neither');
    if(w !== lastWord){
      wordEl.textContent = w;
      wordEl.style.color = expanding ? 'var(--expand)' : (contracting ? 'var(--contract)' : 'var(--ink)');
      lastWord = w;
    }
  }

  render();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
})();
