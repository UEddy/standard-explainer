/* Scene 8: the Dutch auction. The price falls until someone buys. The tension is
   real because a rival is waiting at a price you cannot see, and the payoff is
   that what you spend is burned rather than banked.

   The auction runs on the scene clock, so the price only falls while somebody is
   actually watching it. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-8');
  var P = 's8-';
  function el(id){ return document.getElementById(P + id); }

  var REDUCED = SceneLoop.reducedMotion;
  var sim;

  /* Prices are illustrative. The shape is not: the whitepaper specifies
     exponential decay from the open toward a floor across 24 hours, and a fixed
     number of licences per day. The day ends when they sell out or time runs
     out, whichever comes first. */
  var START = 4200, FLOOR = 900, FALL = 9.0;   /* seconds of scene time stands for 24h */
  var STOCK = 100;                             /* licences on sale each day */

  var state = 'idle';        /* idle, live, won, lost */
  var t0 = 0, price = START, soldOutAt = 0, left = STOCK, burned = 0, rounds = 0;
  var flashT = -99;

  var priceEl = el('price'), barEl = el('bar'), statusEl = el('status');
  var burnedEl = el('burned'), pileEl = el('pile'), flameEl = el('flame');
  var btn = el('go'), hintEl = el('hint'), leftEl = el('left');

  var BAR_TOP = 54, BAR_BOT = 196;

  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function newRound(){
    state = 'live';
    t0 = sim.elapsed;
    price = START;
    left = STOCK;
    /* the price at which the day's stock runs out is hidden, which is the whole
       reason waiting costs something */
    soldOutAt = FLOOR * 1.15 + Math.random() * (START * 0.55 - FLOOR * 1.15);
    rounds++;
    draw();
  }

  function buy(){
    if(state !== 'live') { newRound(); return; }
    state = 'won';
    burned += price;
    flashT = sim.elapsed;
    draw();
  }

  btn.addEventListener('click', buy);

  function simulate(step){
    if(state !== 'live') return;
    var u = clamp01((sim.elapsed - t0) / FALL);
    /* exponential decay from the open toward the floor, per the whitepaper */
    price = START * Math.pow(FLOOR / START, u);

    /* other Bankers step in as it gets cheap, so the stock drains as price falls */
    var gone = (START - price) / (START - soldOutAt);
    left = Math.max(0, Math.round(STOCK * (1 - clamp01(gone))));
    if(left <= 0){
      price = soldOutAt;
      state = 'lost';
    }
  }

  function draw(){
    priceEl.textContent = fmt(price);

    var p = (price - FLOOR) / (START - FLOOR);
    var h = (BAR_BOT - BAR_TOP) * clamp01(p);
    barEl.setAttribute('y', (BAR_BOT - h).toFixed(1));
    barEl.setAttribute('height', h.toFixed(1));

    var col = state === 'won' ? '#2E9E67' : (state === 'lost' ? '#8FA5B8' : '#E0552F');
    barEl.setAttribute('fill', col);
    priceEl.setAttribute('fill', col);

    /* the burn pile only ever grows, across rounds */
    leftEl.textContent = left;
    var pileH = Math.min(52, burned / 260);
    pileEl.setAttribute('y', (206 - pileH).toFixed(1));
    pileEl.setAttribute('height', pileH.toFixed(1));
    burnedEl.textContent = fmt(burned);

    var label, hint;
    if(state === 'idle'){
      label = 'Start the auction'; statusEl.textContent = 'READY';
      hint = 'A hundred licences go on sale each day at a price that starts high and falls.';
    } else if(state === 'live'){
      label = 'Buy a licence'; statusEl.textContent = 'FALLING';
      hint = 'Wait, and it gets cheaper. Wait too long, and the day sells out.';
    } else if(state === 'won'){
      label = 'Run another day'; statusEl.textContent = 'YOU BOUGHT ONE';
      hint = 'You paid ' + fmt(price) + ' $STANDARD. None of it went to a treasury. All of it was burned.';
    } else {
      label = 'Run another day'; statusEl.textContent = 'SOLD OUT';
      hint = 'The last of the day went at ' + fmt(price) + '. Unsold licences do not roll over, and tomorrow opens from that price.';
    }
    if(btn.textContent !== label) btn.textContent = label;
    if(hintEl.textContent !== hint) hintEl.textContent = hint;

    statusEl.setAttribute('fill', col);
  }

  function render(){
    draw();
    var f = REDUCED ? 0 : clamp01(1 - (sim.elapsed - flashT) / 0.9);
    flameEl.setAttribute('opacity', (0.25 + 0.75 * f).toFixed(2));
    flameEl.setAttribute('transform', 'scale(1 ' + (1 + 0.25 * f).toFixed(3) + ') translate(0 ' +
      (-52 * 0.25 * f).toFixed(2) + ')');
  }

  draw();
  sim = SceneLoop.register({ root: ROOT, step: 1/60, simulate: simulate, render: render });
  /* the first auction starts itself once the stage is actually being looked at */
  sim.playOnce(el('stage'), 0.5, function(){ if(state === 'idle') newRound(); });
})();
