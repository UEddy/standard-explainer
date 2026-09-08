(function(){
  'use strict';

  var REDUCED = SceneLoop.reducedMotion;
  var sim;                     /* the shared clock, assigned at the bottom */

  /* ---------- model constants ---------- */
  var TMIN = 10, TMAX = 52;
  var COMFORT_LO = 37, COMFORT_HI = 41, SCALD = 46, CHILL = 32;
  var MIND = 0.4, MAXD = 6.0;
  var TAU = 0.22;              /* mixing in the head, keeps it smooth rather than steppy */
  var STEP = 1/60;             /* fixed simulation step */
  var WINDOW = 14;             /* seconds shown on the trace */
  var IDLE_CAP = 20;           /* seconds of no input after which the streak stops counting */

  /* ---------- state ---------- */
  var RN = Math.ceil(MAXD/STEP) + 8;
  var ring = new Float32Array(RN);
  var head = 0;

  var dial = 0;                /* 0 to 100 */
  var water = TMIN;
  var delay = 1.8;
  var lastChange = -99, delayChanged = -99;
  var bestStreak = 0, streak = 0, scalds = 0, scaldLatch = false;
  var samples = [];
  var frozenTrace = false;     /* reduced motion holds the worked example until first touch */

  /* ---------- helpers ---------- */
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function tempOf(v){ return TMIN + (TMAX-TMIN)*v/100; }
  function valOf(t){ return (t-TMIN)/(TMAX-TMIN)*100; }
  function ringAt(age){
    var i = (head - Math.round(age/STEP)) % RN;
    if(i < 0) i += RN;
    return ring[i];
  }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function mix(c1,c2,t){
    return 'rgb('+Math.round(lerp(c1[0],c2[0],t))+','+Math.round(lerp(c1[1],c2[1],t))+','+Math.round(lerp(c1[2],c2[2],t))+')';
  }
  var C_COLD=[46,111,183], C_GOOD=[46,158,103], C_HOT=[224,85,47], C_SCALD=[203,50,32];
  function tempColor(t){
    if(t <= CHILL) return 'rgb(46,111,183)';
    if(t < COMFORT_LO) return mix(C_COLD, C_GOOD, (t-CHILL)/(COMFORT_LO-CHILL));
    if(t <= COMFORT_HI) return 'rgb(46,158,103)';
    if(t < SCALD) return mix(C_GOOD, C_HOT, (t-COMFORT_HI)/(SCALD-COMFORT_HI));
    return mix(C_HOT, C_SCALD, clamp((t-SCALD)/4, 0, 1));
  }
  /* This scene owns one section of a shared page, so every lookup is namespaced
     to it. Nothing here may reach outside ROOT. */
  var ROOT = document.getElementById('scene-11');
  var P = 's11-';
  function el(id){ return document.getElementById(P + id); }
  function svgEl(n){ return document.createElementNS('http://www.w3.org/2000/svg', n); }

  /* ================= PIPE ================= */
  var pipeCase = el('pipeCase'), pipeBore = el('pipeBore'), slugG = el('slugs');
  var slugEls = [], slugFrac = [];

  function buildPipe(){
    /* More delay means visibly more pipe: the coils are the honest picture of the lag. */
    var coils = clamp(Math.round(1 + (delay-MIND)/(MAXD-MIND)*4), 1, 5);
    var yBot = 372, yTop = 104;
    var stepY = (yBot-yTop)/coils;
    var xs = [140, 30];
    var pts = [[44,392],[44,yBot]];
    var y = yBot, x = 44, r, nx;
    for(r=0; r<coils; r++){
      nx = xs[r%2];
      pts.push([nx, y]);
      y = yBot - (r+1)*stepY;
      pts.push([nx, y]);
      x = nx;
    }
    pts.push([x, 80]);
    pts.push([250, 80]);
    pts.push([250, 96]);

    var d = 'M ' + pts.map(function(p){ return p[0]+' '+p[1]; }).join(' L ');
    pipeCase.setAttribute('d', d);
    pipeBore.setAttribute('d', d);

    /* Water already in the pipe. Nearest the tap is what you just ordered,
       nearest the head is what is about to land on you. */
    var n = Math.round(13 + delay*5.2);
    var total = pipeCase.getTotalLength();
    while(slugG.firstChild) slugG.removeChild(slugG.firstChild);
    slugEls = []; slugFrac = [];
    for(var i=0; i<n; i++){
      var f = i/(n-1);
      var p = pipeCase.getPointAtLength(f*total);
      var c = svgEl('circle');
      c.setAttribute('cx', p.x.toFixed(2));
      c.setAttribute('cy', p.y.toFixed(2));
      c.setAttribute('r', '5.6');
      slugG.appendChild(c);
      slugEls.push(c);
      slugFrac.push(f);
    }
  }

  /* ================= FALLING WATER ================= */
  var waterG = el('water'), dropEls = [];
  (function makeDrops(){
    var cols = [230, 242, 254, 266];
    for(var c=0; c<cols.length; c++){
      for(var r=0; r<5; r++){
        var d = svgEl('rect');
        d.setAttribute('x', cols[c]-2.2);
        d.setAttribute('y', 118 + r*46);
        d.setAttribute('width', 4.5);
        d.setAttribute('height', 20);
        d.setAttribute('rx', 2.2);
        d.setAttribute('class', 'drop');
        d.style.animationDelay = (-(c*0.11)).toFixed(2)+'s';
        waterG.appendChild(d);
        dropEls.push(d);
      }
    }
  })();

  /* ================= DIAL GEOMETRY ================= */
  var A0 = -135, A1 = 135, SPAN = 270;
  function polar(r,a){
    var rad = a*Math.PI/180;
    return { x: 100 + r*Math.sin(rad), y: 100 - r*Math.cos(rad) };
  }
  function angleOf(v){ return A0 + SPAN*v/100; }
  function arc(r,a,b){
    var p0 = polar(r,a), p1 = polar(r,b);
    var large = Math.abs(b-a) > 180 ? 1 : 0;
    var sweep = b > a ? 1 : 0;
    return 'M '+p0.x.toFixed(2)+' '+p0.y.toFixed(2)+' A '+r+' '+r+' 0 '+large+' '+sweep+' '+p1.x.toFixed(2)+' '+p1.y.toFixed(2);
  }
  el('track').setAttribute('d', arc(66, A0, A1));
  el('band').setAttribute('d', arc(66, angleOf(valOf(COMFORT_LO)), angleOf(valOf(COMFORT_HI))));
  (function ticks(){
    var g = el('ticks');
    for(var i=0; i<=10; i++){
      var a = A0 + SPAN*i/10;
      var p1 = polar(78,a), p2 = polar(84,a);
      var l = svgEl('line');
      l.setAttribute('x1', p1.x.toFixed(2)); l.setAttribute('y1', p1.y.toFixed(2));
      l.setAttribute('x2', p2.x.toFixed(2)); l.setAttribute('y2', p2.y.toFixed(2));
      l.setAttribute('stroke', '#241E18');
      l.setAttribute('stroke-width', (i===0||i===10) ? 3.5 : 2);
      l.setAttribute('stroke-linecap', 'round');
      l.setAttribute('opacity', (i===0||i===10) ? 1 : 0.35);
      g.appendChild(l);
    }
  })();

  /* ================= TRACE GEOMETRY ================= */
  var GX0=6, GX1=334, GY0=14, GY1=138;
  function gy(t){ return GY1 - (clamp(t,TMIN,TMAX)-TMIN)/(TMAX-TMIN)*(GY1-GY0); }
  el('bandRect').setAttribute('y', gy(COMFORT_HI).toFixed(2));
  el('bandRect').setAttribute('height', (gy(COMFORT_LO)-gy(COMFORT_HI)).toFixed(2));
  el('scaldLine').setAttribute('y1', gy(SCALD).toFixed(2));
  el('scaldLine').setAttribute('y2', gy(SCALD).toFixed(2));
  el('scaldTxt').setAttribute('y', (gy(SCALD)-4).toFixed(2));
  el('bandTxt').setAttribute('y', (gy(COMFORT_LO)+11).toFixed(2));

  /* ================= INPUT: the dial ================= */
  var dialEl = el('dial');
  var dragging = false;
  var lastAngle = null;

  function thawTrace(){
    if(frozenTrace){ frozenTrace = false; samples = []; }
  }

  function setDial(v, fromUser){
    v = clamp(v, 0, 100);
    if(v !== dial){
      dial = v;
      if(fromUser !== false){ lastChange = sim.elapsed; thawTrace(); }
    }
    var t = tempOf(dial);
    dialEl.setAttribute('aria-valuenow', t.toFixed(0));
    dialEl.setAttribute('aria-valuetext', t.toFixed(0)+' degrees requested');
  }

  function eventAngle(ev){
    var r = dialEl.getBoundingClientRect();
    var cx = r.left + r.width/2, cy = r.top + r.height/2;
    return Math.atan2(ev.clientX-cx, -(ev.clientY-cy)) * 180/Math.PI;
  }
  function fromPointer(ev){
    var a = eventAngle(ev);
    /* The dial has a dead zone at the bottom. If a drag sweeps straight across it,
       pin to the end we were heading for rather than flipping cold to scalding. */
    if(dragging && lastAngle !== null && Math.abs(a-lastAngle) > 180){
      a = (lastAngle > 0) ? A1 : A0;
    }
    lastAngle = a;
    var v = (a > A1) ? 100 : ((a < A0) ? 0 : (a-A0)/SPAN*100);
    setDial(v);
  }
  dialEl.addEventListener('pointerdown', function(ev){
    ev.preventDefault();
    dialEl.focus();
    try { dialEl.setPointerCapture(ev.pointerId); } catch(e){}
    lastAngle = null;
    fromPointer(ev);
    dragging = true;
  });
  dialEl.addEventListener('pointermove', function(ev){
    if(!dragging) return;
    ev.preventDefault();
    fromPointer(ev);
  });
  function endDrag(){ dragging = false; lastAngle = null; }
  dialEl.addEventListener('pointerup', endDrag);
  dialEl.addEventListener('pointercancel', endDrag);
  dialEl.addEventListener('lostpointercapture', endDrag);

  dialEl.addEventListener('keydown', function(ev){
    /* leave browser shortcuts alone: Ctrl+End should still jump down the page */
    if(ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var k = ev.key, s = ev.shiftKey ? 6 : 1.6;
    if(k === 'ArrowUp' || k === 'ArrowRight') setDial(dial + s);
    else if(k === 'ArrowDown' || k === 'ArrowLeft') setDial(dial - s);
    else if(k === 'PageUp') setDial(dial + 12);
    else if(k === 'PageDown') setDial(dial - 12);
    else if(k === 'Home') setDial(0);
    else if(k === 'End') setDial(100);
    else return;
    ev.preventDefault();
  });

  /* ================= INPUT: the pipe ================= */
  var delayEl = el('delay');
  var WORDS = [[1.0,'Just there'],[2.0,'A fair walk'],[3.5,'Across the house'],[5.0,'Down the street'],[99,'Somewhere else entirely']];
  function delayWord(d){
    for(var i=0; i<WORDS.length; i++) if(d < WORDS[i][0]) return WORDS[i][1];
    return WORDS[WORDS.length-1][1];
  }
  delayEl.addEventListener('input', function(){
    delay = parseFloat(delayEl.value);
    delayChanged = sim.elapsed;
    el('delayNum').textContent = delay.toFixed(1)+' s';
    el('delayWord').textContent = delayWord(delay);
    delayEl.setAttribute('aria-valuetext', delay.toFixed(1)+' seconds of pipe');
    buildPipe();
    thawTrace();
    /* a new pipe is a new attempt, so the score starts again */
    bestStreak = 0; streak = 0; scalds = 0;
  });

  /* ================= SCALD FLASH ================= */
  var flashEl = el('flash'), flashTimer = 0;
  function flash(){
    if(REDUCED) return;
    flashEl.classList.add('on');
    if(flashTimer) sim.clear(flashTimer);
    /* on the scene clock, so it cannot fire at a scene that is no longer running */
    flashTimer = sim.after(0.09, unflash);
  }
  function unflash(){
    flashTimer = 0;
    flashEl.classList.remove('on');
  }

  /* ================= RENDER ================= */
  var rAsked=el('rAsked'), rWater=el('rWater'), hintEl=el('hint');
  var needle=el('needle'), grip=el('grip'), ghost=el('ghost'), flightArc=el('flightArc');
  var dialNum=el('dialNum'), steam=el('steam'), pool=el('pool'), bather=el('bather');
  var mouth=el('mouth'), mouthO=el('mouthO'), brows=el('brows');
  var lineAsked=el('lineAsked'), lineWater=el('lineWater'), dotWater=el('dotWater');
  var sBest=el('sBest'), sNow=el('sNow'), sScald=el('sScald');
  var lastHint = '';

  function renderDial(){
    var ha = angleOf(dial);
    var p = polar(58, ha), g = polar(66, ha);
    needle.setAttribute('x2', p.x.toFixed(2)); needle.setAttribute('y2', p.y.toFixed(2));
    grip.setAttribute('cx', g.x.toFixed(2)); grip.setAttribute('cy', g.y.toFixed(2));

    /* the ghost marker is what is actually landing on you right now */
    var ga = angleOf(clamp(valOf(water), 0, 100));
    var gp = polar(47, ga);
    ghost.setAttribute('cx', gp.x.toFixed(2));
    ghost.setAttribute('cy', gp.y.toFixed(2));
    ghost.setAttribute('fill', tempColor(water));

    if(Math.abs(ha-ga) > 2){
      flightArc.setAttribute('d', arc(47, ga, ha));
      flightArc.setAttribute('opacity', 0.85);
    } else {
      flightArc.setAttribute('opacity', 0);
    }
    dialNum.textContent = tempOf(dial).toFixed(0)+'°';
  }

  function renderStage(){
    var col = tempColor(water), i;
    for(i=0; i<dropEls.length; i++) dropEls[i].setAttribute('fill', col);
    pool.setAttribute('fill', col);
    for(i=0; i<slugEls.length; i++){
      slugEls[i].setAttribute('fill', tempColor(tempOf(ringAt(slugFrac[i]*delay))));
    }
    steam.setAttribute('opacity', clamp((water-42)/5, 0, 1).toFixed(2));

    var cold = water < CHILL;
    var hot = water >= SCALD;
    var good = water >= COMFORT_LO && water <= COMFORT_HI;
    mouthO.setAttribute('opacity', hot ? 1 : 0);
    mouth.setAttribute('opacity', hot ? 0 : 1);
    mouth.setAttribute('d', good ? 'M242 211 q8 8 16 0' : (cold ? 'M241 214 q4.5 -4 9 0 q4.5 4 9 0' : 'M242 213 h16'));
    brows.setAttribute('opacity', hot ? 1 : 0);
    if(cold) bather.classList.add('shiver'); else bather.classList.remove('shiver');
  }

  function renderTrace(){
    if(!samples.length) return;
    var t1 = samples[samples.length-1].t, t0 = t1 - WINDOW;
    var a = [], w = [], i, s, x;
    for(i=0; i<samples.length; i++){
      s = samples[i];
      x = GX0 + (s.t-t0)/WINDOW*(GX1-GX0);
      if(x < GX0) continue;
      a.push(x.toFixed(1)+','+gy(s.a).toFixed(1));
      w.push(x.toFixed(1)+','+gy(s.w).toFixed(1));
    }
    lineAsked.setAttribute('points', a.join(' '));
    lineWater.setAttribute('points', w.join(' '));
    var lastW = samples[samples.length-1].w;
    dotWater.setAttribute('cx', GX1);
    dotWater.setAttribute('cy', gy(lastW).toFixed(1));
    dotWater.setAttribute('fill', tempColor(lastW));
  }

  function renderHint(){
    var inFlight = Math.max(0, delay - (sim.elapsed-lastChange));
    var msg;
    if(water >= SCALD){
      msg = '<b>Too hot.</b> That is the water you asked for ' + delay.toFixed(1) + ' seconds ago.';
    } else if(water >= COMFORT_LO && water <= COMFORT_HI){
      msg = '<b>Just right.</b> Hold still. Anything you change now lands in ' + delay.toFixed(1) + 's.';
    } else if(inFlight > 0.15){
      msg = 'Still travelling. Your last change reaches you in <b>' + inFlight.toFixed(1) + 's</b>.';
    } else if(water < CHILL){
      msg = '<b>Cold.</b> Everything you have asked for has already arrived.';
    } else {
      msg = (water < COMFORT_LO) ? 'Nearly warm enough.' : 'A bit too warm.';
    }
    if(msg !== lastHint){ hintEl.innerHTML = msg; lastHint = msg; }
  }

  /* ================= SIMULATION ================= */
  /* One fixed step of water travelling down the pipe. The shared loop decides
     how often this runs, and stops calling it when the scene is off screen. */
  function simulate(step){
    head = (head+1) % RN;
    ring[head] = dial;

    var target = tempOf(ringAt(delay));
    water += (target-water) * (1 - Math.exp(-step/TAU));

    /* Holding the band counts only while the reader is actually playing. A page
       left sitting in the band is not a steady hand, so the clock stops. */
    if(water >= COMFORT_LO && water <= COMFORT_HI){
      if(sim.elapsed - lastChange < IDLE_CAP){
        streak += step;
        if(streak > bestStreak) bestStreak = streak;
      }
    } else {
      streak = 0;
    }
    if(water >= SCALD && !scaldLatch){
      scaldLatch = true;
      /* do not punish a scald that was caused purely by dragging the pipe slider */
      if(sim.elapsed - delayChanged > 0.6){ scalds++; flash(); }
    }
    if(water < SCALD-1.5) scaldLatch = false;
  }

  var gAcc = 0;
  function render(dt){
    gAcc += dt;
    if(gAcc >= 0.04 && !frozenTrace){
      gAcc = 0;
      samples.push({ t: sim.elapsed, a: tempOf(dial), w: water });
      while(samples.length && samples[0].t < sim.elapsed-WINDOW-0.5) samples.shift();
      renderTrace();
    }

    rAsked.textContent = tempOf(dial).toFixed(1)+'°';
    rWater.textContent = water.toFixed(1)+'°';
    rWater.style.color = tempColor(water);
    sBest.textContent = bestStreak.toFixed(1)+'s';
    sNow.textContent = streak.toFixed(1)+'s';
    sScald.textContent = String(scalds);

    renderDial();
    renderStage();
    renderHint();
  }

  /* ================= SEED ================= */
  function seedExample(){
    /* Reduced motion: run the same model over a canned pair of hands, so the finished
       overshoot is already on the chart before anything moves. */
    var d = 2.6, w = TMIN, hist = [], out = [];
    var n = Math.round(WINDOW/STEP);
    function askedAt(t){
      if(t < 2.0) return 0;
      if(t < 4.6) return 58;
      if(t < 7.6) return 92;
      if(t < 10.4) return 24;
      return 70;
    }
    for(var i=0; i<n; i++){
      var t = i*STEP;
      hist.push(askedAt(t));
      var back = Math.max(0, i - Math.round(d/STEP));
      w += (tempOf(hist[back]) - w) * (1 - Math.exp(-STEP/TAU));
      if(i % 3 === 0) out.push({ t: sim.elapsed - WINDOW + t, a: tempOf(askedAt(t)), w: w });
    }
    samples = out;
    frozenTrace = true;
    renderTrace();
  }

  /* ================= GO ================= */
  el('delayNum').textContent = delay.toFixed(1)+' s';
  el('delayWord').textContent = delayWord(delay);
  buildPipe();
  setDial(0, false);
  renderDial();
  renderStage();

  sim = SceneLoop.register({
    root: ROOT,
    step: STEP,
    simulate: simulate,
    render: render,
    /* a stuck red overlay would follow the reader down the page, so clear it */
    onPause: unflash
  });

  if(REDUCED) seedExample();
})();
