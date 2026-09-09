/* Scene 7: Branches and dilution. Issuance is divided across every open Branch
   in the system, so the pie is fixed and you are only ever changing your share
   of it. Opening more Branches raises your slice. Everyone else opening more
   lowers it again, and lowers what each individual Branch is worth for
   everybody, including you. */
(function(){
  'use strict';

  var ROOT = document.getElementById('scene-7');
  var P = 's7-';
  function el(id){ return document.getElementById(P + id); }

  var sim;
  var mine = 1;          /* verified: a Charter opens with one Branch, max ten */
  var others = 120;      /* illustrative */

  var CX = 180, CY = 118, RO = 84, RI = 48;

  function pt(r, a){
    var rad = a * Math.PI / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  }
  function wedge(ro, ri, a0, a1){
    var large = (a1 - a0) > 180 ? 1 : 0;
    var p0 = pt(ro, a0), p1 = pt(ro, a1), p2 = pt(ri, a1), p3 = pt(ri, a0);
    return 'M ' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) +
           ' A ' + ro + ' ' + ro + ' 0 ' + large + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
           ' L ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) +
           ' A ' + ri + ' ' + ri + ' 0 ' + large + ' 0 ' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' Z';
  }

  var mineEl = el('mine'), shareEl = el('share'), perEl = el('per');
  var mineNum = el('mineNum'), mineLbl = el('mineLbl'), hintEl = el('hint');
  var lastHint = '';

  /* Ten slots, tapped open one at a time. A Charter always has at least its
     first Branch, so slot one cannot be closed. Tapping an open slot closes
     everything above it, which is how retirement works in scene 10 too. */
  var slots = [];
  (function buildSlots(){
    var host = el('slots');
    for(var i = 0; i < 10; i++){
      (function(n){
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = n + 1;
        b.setAttribute('aria-pressed', n === 0 ? 'true' : 'false');
        b.setAttribute('aria-label', 'Branch ' + (n + 1) +
          (n === 0 ? ', always open' : ', tap to open or close'));
        b.addEventListener('click', function(){
          mine = (n + 1 === mine) ? Math.max(1, n) : n + 1;
          draw();
        });
        host.appendChild(b);
        slots.push(b);
      })(i);
    }
  })();

  var segBtns = ROOT.querySelectorAll('.seg button');
  Array.prototype.forEach.call(segBtns, function(b){
    b.addEventListener('click', function(){
      others = parseInt(b.getAttribute('data-others'), 10);
      Array.prototype.forEach.call(segBtns, function(o){
        o.setAttribute('aria-checked', o === b ? 'true' : 'false');
      });
      draw();
    });
  });

  function draw(){
    var total = mine + others;
    var share = mine / total;
    var per = 1 / total;

    /* a sliver still has to be visible, so the wedge never renders as nothing */
    var sweep = Math.max(share * 360, 1.2);
    mineEl.setAttribute('d', wedge(RO, RI, -90, -90 + sweep));

    shareEl.textContent = (share * 100).toFixed(share < 0.1 ? 2 : 1) + '%';
    perEl.textContent = (per * 100).toFixed(2) + '%';
    mineNum.textContent = mine;
    mineLbl.textContent = mine;
    for(var k = 0; k < slots.length; k++){
      slots[k].setAttribute('aria-pressed', k < mine ? 'true' : 'false');
    }

    var msg;
    if(mine === 10 && others >= 400){
      msg = 'You opened every Branch you are allowed. So did everyone else, and your slice is thinner than when you had one.';
    } else if(mine >= 6){
      msg = 'More Branches, more of the pie. Every one you open also makes each Branch worth a little less.';
    } else if(others >= 400){
      msg = 'You did nothing. Everyone else expanded, and your share fell anyway.';
    } else {
      msg = 'Issuance is divided across every open Branch. The pie does not grow when you open one.';
    }
    if(msg !== lastHint){ hintEl.textContent = msg; lastHint = msg; }
  }

  draw();
  /* nothing here moves on its own, but it still registers so it pauses with the
     rest of the page and repaints correctly on the way back in */
  sim = SceneLoop.register({ root: ROOT, render: function(){} });
})();
