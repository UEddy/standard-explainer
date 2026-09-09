/* ---------------------------------------------------------------------------
   presentation.js
   Piece 1: the page reads as a sequence of scenes rather than one long article.

   Three jobs, all event driven. Nothing here starts a loop or a timer: the
   entrance and the progress marks both ride IntersectionObserver, and the
   keyboard handler only runs when a key is pressed.

   Vertical snapping was chosen over pinned horizontal because only five of the
   thirteen scenes fit a phone screen and the three tentpoles run to roughly two
   and a half each. Horizontal would also have fought scene 11's rotary drag and
   scene 12's slider, which both need the horizontal axis for themselves.
   --------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  var REDUCED = !!(global.matchMedia &&
                   global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var doc = document.documentElement;

  /* Set before first paint so nothing flashes hidden. If this script never runs,
     the CSS leaves every section visible. */
  doc.setAttribute('data-entrances', 'on');

  var sections = [].slice.call(document.querySelectorAll('.masthead, .scene'));
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  if (!sections.length) return;

  /* ---------------- entrance ----------------
     One way. Coming back to a scene does not replay it: scenes arrive and settle. */
  if (global.IntersectionObserver) {
    var entrance = new global.IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.setAttribute('data-entered', 'true');
          entrance.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.15 });
    for (var s = 0; s < sections.length; s++) entrance.observe(sections[s]);
  } else {
    for (var t = 0; t < sections.length; t++) sections[t].setAttribute('data-entered', 'true');
  }

  /* ---------------- progress marks ---------------- */
  var marks = [];
  if (scenes.length) {
    var bar = document.createElement('div');
    bar.className = 'progress-marks';
    bar.setAttribute('aria-hidden', 'true');   /* decorative: the headings carry the real structure */
    for (var m = 0; m < scenes.length; m++) {
      var dot = document.createElement('span');
      bar.appendChild(dot);
      marks.push(dot);
    }
    document.body.appendChild(bar);
  }

  if (global.IntersectionObserver && marks.length) {
    var ratios = [];
    for (var r = 0; r < scenes.length; r++) ratios.push(0);

    var progress = new global.IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var idx = scenes.indexOf(entries[i].target);
        if (idx >= 0) ratios[idx] = entries[i].intersectionRatio;
      }
      var best = -1, bestRatio = 0.02;
      for (var j = 0; j < ratios.length; j++) {
        if (ratios[j] > bestRatio) { bestRatio = ratios[j]; best = j; }
      }
      for (var k = 0; k < marks.length; k++) {
        marks[k].setAttribute('data-on', k === best ? 'true' : 'false');
        marks[k].setAttribute('data-past', (best > -1 && k < best) ? 'true' : 'false');
      }
    }, { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] });

    for (var p = 0; p < scenes.length; p++) progress.observe(scenes[p]);
  }

  /* ---------------- keyboard ----------------
     A control only blocks the keys it actually uses.

     A range input and scene 11's dial genuinely consume arrows, paging and
     Home/End, so navigation stays out of their way entirely. A plain button
     consumes Space and Enter and nothing else, so Page Up and Page Down still
     move the page while a Branch slot or an auction button has focus. Radios
     take the arrows for roving within their group, but not paging.

     This is the same class of bug as the dial swallowing Ctrl+End: a control
     quietly eating a key it has no use for. */
  function consumesKey(el, key) {
    if (!el || el === document.body || el === doc) return false;
    var tag = (el.tagName || '').toLowerCase();
    var role = el.getAttribute ? el.getAttribute('role') : null;
    var arrow = key.indexOf('Arrow') === 0;
    var paging = key === 'PageUp' || key === 'PageDown' || key === 'Home' || key === 'End';

    if (tag === 'input' && el.type === 'range') return arrow || paging;
    if (role === 'slider') return arrow || paging;
    if (role === 'radio') return arrow;
    if (tag === 'textarea' || tag === 'select' || el.isContentEditable) return true;
    if (tag === 'input') return true;
    return false;
  }

  /* Roving within a radiogroup, so the arrows a radio claims actually do
     something. Scene 9's lever, scene 12's pool depth, scene 7's crowd. */
  document.addEventListener('keydown', function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var el = document.activeElement;
    if (!el || !el.getAttribute || el.getAttribute('role') !== 'radio') return;
    var k = ev.key;
    var fwd = (k === 'ArrowRight' || k === 'ArrowDown');
    var back = (k === 'ArrowLeft' || k === 'ArrowUp');
    if (!fwd && !back) return;
    var group = el.closest ? el.closest('[role="radiogroup"]') : null;
    if (!group) return;
    var items = [].slice.call(group.querySelectorAll('[role="radio"]'));
    var i = items.indexOf(el);
    if (i < 0) return;
    var next = fwd ? i + 1 : i - 1;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    ev.preventDefault();
    items[next].focus();
    items[next].click();
  });

  function currentIndex() {
    var best = 0, bestVisible = -1, vh = global.innerHeight;
    for (var i = 0; i < sections.length; i++) {
      var box = sections[i].getBoundingClientRect();
      var visible = Math.min(box.bottom, vh) - Math.max(box.top, 0);
      if (visible > bestVisible) { bestVisible = visible; best = i; }
    }
    return best;
  }

  function move(dir) {
    var i = currentIndex();
    var box = sections[i].getBoundingClientRect();
    var vh = global.innerHeight;
    var behavior = REDUCED ? 'auto' : 'smooth';

    /* A scene taller than the screen is paged through rather than skipped over,
       so keyboard readers do not lose the bottom half of scene 11 or 12. */
    if (box.height > vh + 4) {
      if (dir > 0 && box.bottom > vh + 4) {
        global.scrollBy({ top: Math.round(vh * 0.85), behavior: behavior });
        return;
      }
      if (dir < 0 && box.top < -4) {
        global.scrollBy({ top: -Math.round(vh * 0.85), behavior: behavior });
        return;
      }
    }

    var j = i + dir;
    if (j < 0) j = 0;
    if (j > sections.length - 1) j = sections.length - 1;
    sections[j].scrollIntoView({ behavior: behavior, block: 'start' });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;   /* leave browser shortcuts alone */
    var k = ev.key;
    var fwd = (k === 'ArrowDown' || k === 'PageDown');
    var back = (k === 'ArrowUp' || k === 'PageUp');
    if (!fwd && !back) return;
    if (consumesKey(document.activeElement, k)) return;
    ev.preventDefault();
    move(fwd ? 1 : -1);
  });

  global.Presentation = {
    sections: function () { return sections.slice(); },
    currentIndex: currentIndex,
    go: move
  };

})(window);
