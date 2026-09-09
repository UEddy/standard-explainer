/* ---------------------------------------------------------------------------
   quiz.js
   Piece 3: a three question check after scene 13.

   Not a test. There is no score, no percentage and no retry gate, because a
   wrong answer here is the most useful thing that can happen: it is the moment a
   misconception gets named. Every wrong option below is one somebody would
   actually arrive with after reading this page once, and getting one wrong opens
   the explanation and a way back to the scene that taught it.

   One question per tentpole, always in the order the page taught them: the
   locked money, the delay, the overhang. Five variants per slot, one drawn per
   slot per run, options shuffled inside each question. That is 125 sets before
   shuffling. Nothing is stored anywhere, so a reload draws a fresh set, and the
   close says so.

   The rule the explanations are written under: every claim about the protocol
   must be on the verified list in CONTENT.md. Where a number is only in the toy
   it is named as illustrative. Fifteen explanations is a lot of surface for an
   unverified claim to creep into, so the bank lives in CONTENT.md too and this
   file and that one have to be edited together.
   --------------------------------------------------------------------------- */

(function(){
  'use strict';

  var ROOT = document.getElementById('scene-quiz');
  if(!ROOT) return;
  var P = 'qz-';
  function el(id){ return document.getElementById(P + id); }

  /* ------------------------------------------------------------------
     The bank. `correct` is the index in the authored order below, which
     is not what the reader sees: options are shuffled per run. Authored
     positions are spread 4 / 4 / 4 / 3 across the fifteen so that the
     bank itself carries no positional bias if the shuffle ever failed.
     ------------------------------------------------------------------ */

  var BANK = {

    /* ---- slot A: the locked money, scene 10 ---- */
    a: [
      {
        q: 'A Branch of yours has earned a balance. How do you get it into your wallet?',
        o: ['Retire the Branch. It pays out, and it can never be reopened.',
            'Withdraw the balance and leave the Branch open to keep earning.',
            'Wait for the lock-up to expire, then claim it.',
            'Sell the Branch to somebody who wants the position.'],
        c: 0,
        why: 'Earned $STANDARD accrues inside the system and is claimed only by retiring a Branch, and a retired Branch cannot be reopened. There is no partial withdrawal and nothing that releases it on a timer.'
      },
      {
        q: 'Your Charter has four Branches earning. You retire one of them. What happens to the other three?',
        o: ['Nothing. Retiring a Branch retires the whole Charter.',
            'They keep earning. Only the retired Branch is gone.',
            'They pay out too, because the Charter has been claimed.',
            'They stop earning until you open a replacement Branch.'],
        c: 1,
        why: 'New issuance is divided across all open Branches, so retiring one destroys that Branch and leaves the rest earning. A Charter opens with one Branch and can grow to ten.'
      },
      {
        q: 'Bankers are earning steadily, yet circulating supply stays quiet for a long time. Why?',
        o: ['There is a cap on how much can be claimed per day.',
            'The protocol pauses claims while the price is falling.',
            'Claiming costs you the Branch that earns, so it gets put off.',
            'Earnings are released gradually on a vesting schedule.'],
        c: 2,
        why: 'The only way to claim is to retire the Branch permanently, so a balance can sit unclaimed indefinitely. It is a decision rather than a schedule: nothing releases it over time.'
      },
      {
        q: 'An accrued balance that nobody has claimed yet. Is it real?',
        o: ['No. It only exists once the Branch is retired and the tokens are minted.',
            'Yes, and it is already included in the circulating supply figure.',
            'Only up to whatever is left of the issuance budget.',
            'Yes. It is a real claim, it is simply not counted in supply yet.'],
        c: 3,
        why: 'Those balances are real claims on the same supply, and they are not counted in totalSupply until they convert, which happens when a Banker retires a Branch. Nothing new is created at that moment.'
      },
      {
        q: 'What does taking your earnings out cost you?',
        o: ['The Branch itself. It is destroyed and cannot be reopened.',
            'A percentage of the amount you claim.',
            'A cooldown, after which that Branch earns again.',
            'Your Charter, which is surrendered with the claim.'],
        c: 0,
        why: 'Retiring the Branch is what releases the balance, and a retired Branch cannot be reopened. That is the part that cannot be undone.'
      }
    ],

    /* ---- slot B: the delay, scene 11 ---- */
    b: [
      {
        q: 'Issuance is not responding to what just happened. Why not?',
        o: ['It is waiting for enough votes to confirm the change.',
            'It reacts on a lag, a couple of epochs after the flow that caused it.',
            'It only responds once the price has moved far enough.',
            'It ignores flows below a minimum size.'],
        c: 1,
        why: 'Issuance reacts on a lag, on the order of a couple of epochs after the flow that caused it. There is no DAO and no governance vote anywhere in that path.'
      },
      {
        q: 'You keep adjusting because nothing seems to be happening. What are you actually building up?',
        o: ['Nothing. Each new adjustment replaces the last one.',
            'A penalty, because rapid changes get throttled.',
            'A queue of corrections that will all land together, and land too hard.',
            'A stronger response, because the system counts how insistent you are.'],
        c: 2,
        why: 'Every correction made while waiting is one that was not needed, and they arrive together. The response comes a couple of epochs late, so everything done in between is still on its way.'
      },
      {
        q: 'Who has to behave badly for the overshoot to happen?',
        o: ['Large holders timing the epoch boundary.',
            'Bankers voting themselves higher issuance.',
            'Anyone willing to pay enough to move the flow.',
            'Nobody. The delay produces it on its own.'],
        c: 3,
        why: 'The overshoot comes from the lag itself, not from anybody deciding it should happen. There is no DAO and no governance vote, so there is nothing to vote for, and the only input to policy is net flow of ETH into or out of the pool.'
      },
      {
        q: 'What does the protocol actually read when it sets issuance?',
        o: ['Net flow of ETH into or out of the pool.',
            'The price of $STANDARD against ETH.',
            'A price oracle, averaged across the epoch.',
            'The total value held across all open Branches.'],
        c: 0,
        why: 'Net flow of ETH into or out of the one Uniswap v4 pool is the only input to policy. No price target, no oracle and no committee, and it reacts on a lag of roughly a couple of epochs.'
      },
      {
        q: 'The delay between a flow and its effect gets longer. What happens to the overshoot?',
        o: ['It shrinks. The system has longer to average things out.',
            'It gets worse, because more uncorrected corrections are in flight.',
            'It is unchanged. A longer delay only moves when it arrives.',
            'It disappears. The flow will have reversed before it lands.'],
        c: 1,
        why: 'A longer lag means more adjustments get made before any of them land, and they still land together. The lag in the protocol itself is on the order of a couple of epochs; the pipe lengths in the toy above are illustrative.'
      }
    ],

    /* ---- slot C: the overhang, scene 12 ---- */
    c: [
      {
        q: 'A lot of accrued claims convert at once. Where do those tokens come from?',
        o: ['They are minted fresh, so supply ends up above what was planned.',
            'They come out of the genesis position locked in the pool.',
            'They already existed as claims. Nothing new is minted.',
            'The protocol buys them back first, then releases them.'],
        c: 2,
        why: 'Those balances are real claims, just not counted in totalSupply until a Banker retires a Branch. Converting moves them into the counted number, and the hard cap of 1,000,000,000 is untouched.'
      },
      {
        q: 'Circulating supply looks low and steady. What does that tell you on its own?',
        o: ['That issuance has been conservative so far.',
            'That holders are confident and are not selling.',
            'That the buyback has been quietly absorbing supply.',
            'Very little. Large claims may exist that it does not count yet.'],
        c: 3,
        why: 'Earned balances accrue inside the system and are not counted in totalSupply until they convert, so the number can be low precisely because claims are waiting outside it. How much is waiting is not public, so this is a thing to check rather than a thing to assume.'
      },
      {
        q: 'Could the buybacks absorb a large conversion arriving all at once?',
        o: ['Not quickly. They are capped at a fraction of a percent of the pool per hour.',
            'Yes. That is exactly what the vault is for.',
            'Yes, if the vault is large enough on the day.',
            'No, because the protocol does not buy back at all.'],
        c: 0,
        why: 'Buybacks are throttled to at most the smaller of 10 percent of the vault balance and 0.2 percent of pool reserves per hour, roughly no more than 5 percent of pool depth per day at launch. Support at that rate cannot meet a rush in an afternoon.'
      },
      {
        q: 'Which three unknowns decide whether the overhang matters at all?',
        o: ['The hard cap, the burn rate and the epoch length.',
            'How much has accrued, how few hands hold it, how deep the pool is.',
            'The number of Charters issued and the price they went for.',
            'The team share, the revenue split and the resolution fee.'],
        c: 1,
        why: 'Those three are the unknowns the page ends on, and none of them is public: how much has accrued, how concentrated it is, and how deep the pool will be on the day it converts.'
      },
      {
        q: 'Does the hard cap protect you from the overhang?',
        o: ['Yes. Nothing can push supply past 1,000,000,000.',
            'No. Converting the claims pushes total supply above the cap.',
            'No. The claims are already inside the cap. They are just not counted yet.',
            'Yes. Burning has lowered the maximum below what has accrued.'],
        c: 2,
        why: 'The cap of 1,000,000,000 holds, and burns only ever lower it, so conversion never breaches it. The claims sit inside that cap already. What changes is how much of it counts as circulating.'
      }
    ]
  };

  var SLOTS = [
    { key: 'a', label: 'The locked money', scene: 'scene-10', sceneName: 'scene 10, the locked money' },
    { key: 'b', label: 'The delay',        scene: 'scene-11', sceneName: 'scene 11, the delay' },
    { key: 'c', label: 'The overhang',     scene: 'scene-12', sceneName: 'scene 12, the overhang' }
  ];

  /* ---------------- draw ---------------- */

  function pick(list){ return list[Math.floor(Math.random() * list.length)]; }

  function shuffled(n){
    var a = [], i, j, t;
    for(i = 0; i < n; i++) a.push(i);
    for(i = n - 1; i > 0; i--){
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function draw(){
    return SLOTS.map(function(slot){
      var v = pick(BANK[slot.key]);
      var order = shuffled(v.o.length);
      return {
        slot: slot,
        q: v.q,
        why: v.why,
        options: order.map(function(k){ return v.o[k]; }),
        correct: order.indexOf(v.c)
      };
    });
  }

  /* ---------------- state ---------------- */

  var sim = null;
  var set = draw();
  var at = 0;
  var answered = false;

  var stepEl = el('step'), qEl = el('question'), optsEl = el('options'),
      whyBox = el('why'), whyEl = el('explain'), replayEl = el('replay'),
      replayLink = el('replayLink'), nextEl = el('next'),
      cardEl = el('card'), endEl = el('end'), againEl = el('again'),
      tagEl = el('tag');

  function clearOptions(){
    while(optsEl.firstChild) optsEl.removeChild(optsEl.firstChild);
  }

  function show(){
    var item = set[at];
    answered = false;

    cardEl.setAttribute('data-slot', item.slot.key);
    stepEl.textContent = 'Question ' + (at + 1) + ' of 3';
    tagEl.textContent = item.slot.label;
    qEl.textContent = item.q;

    clearOptions();
    item.options.forEach(function(text, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qz-opt';
      b.setAttribute('data-state', 'idle');
      b.textContent = text;
      b.addEventListener('click', function(){ answer(i, b); });
      optsEl.appendChild(b);
    });

    whyBox.hidden = true;
    replayEl.hidden = true;
    nextEl.hidden = true;
    nextEl.textContent = (at === set.length - 1) ? 'Finish' : 'Next question';
  }

  function answer(i, btn){
    if(answered) return;
    answered = true;

    /* The standfirst introduces the quiz and has done its job by the first
       answer. Folding it here buys back the height the explanation needs, and it
       shifts the card up rather than down, so the movement reveals the answer
       instead of pushing it further away. */
    ROOT.setAttribute('data-started', 'true');

    var item = set[at];
    var right = (i === item.correct);
    var buttons = optsEl.querySelectorAll('.qz-opt');

    for(var k = 0; k < buttons.length; k++){
      buttons[k].disabled = true;
      /* The correct option is always marked, including when the reader got it
         wrong. Being told only that you were wrong teaches nothing.

         Everything nobody picked folds away, which is both the clearer
         comparison and the only way this fits a phone. Measured at 412 x 780
         with all four kept: thirteen of the fifteen had their explanation cut
         off and every one of them put the way forward below the fold. */
      if(k === item.correct) buttons[k].setAttribute('data-state', 'right');
      else if(buttons[k] === btn) buttons[k].setAttribute('data-state', 'wrong');
      else buttons[k].setAttribute('data-state', 'gone');
    }

    whyEl.textContent = item.why;
    whyBox.hidden = false;
    whyBox.setAttribute('data-right', right ? 'true' : 'false');

    /* A wrong answer earns a way back to the scene that taught it. A right one
       does not need one, and offering it anyway reads as a consolation prize. */
    if(!right){
      replayLink.setAttribute('href', '#' + item.slot.scene);
      replayLink.textContent = 'Replay ' + item.slot.sceneName;
      replayEl.hidden = false;
    }

    nextEl.hidden = false;

    /* Note for anyone tempted to solve the fold with a scroll instead: it does
       not work here. scrollIntoView on the Next button moves nothing, because
       the section sits exactly on its own snap point and proximity snapping
       pulls the page straight back. The fold has to be won by the card being
       shorter, which is what folding the unpicked options away does. */
  }

  nextEl.addEventListener('click', function(){
    if(at < set.length - 1){ at++; show(); qEl.focus(); }
    else finish();
  });

  function finish(){
    cardEl.hidden = true;
    endEl.hidden = false;
    againEl.focus();
  }

  againEl.addEventListener('click', function(){
    set = draw();
    at = 0;
    endEl.hidden = true;
    cardEl.hidden = false;
    show();
    qEl.focus();
  });

  show();
  /* Registered so the quiz is a scene like any other and shows up in the debug
     overlay. It has no simulate and no render: every transition here is CSS, and
     the one piece of timing it needed turned out to be better solved by not
     having any. */
  sim = SceneLoop.register({ root: ROOT });

})();
