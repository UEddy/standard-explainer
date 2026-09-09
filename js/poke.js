/* ---------------------------------------------------------------------------
   poke.js
   Ambient touch, shared.

   Piece 2 makes four watch-only scenes answer a finger, and all four need the
   same three things: pointer events that treat a mouse and a thumb alike, client
   coordinates translated into SVG user space, and a gesture that never steals a
   scroll.

   That last one is why this is one module and not four copies of the same
   handler. The page snaps now, so a scene that called preventDefault on a
   vertical drag would trap the reader inside it. Nothing here ever calls
   preventDefault. A draggable declares the axis it wants and the browser keeps
   the other one: `touch-action: pan-y` means a vertical swipe scrolls the page
   and never reaches the scene, and the moment the browser decides a gesture is a
   scroll it sends pointercancel, which ends the drag cleanly. There is
   deliberately no free-axis drag, because the only way to get one on a phone is
   `touch-action: none`, and that is a scroll trap sitting in the middle of a
   scene.

   Nothing built on this is required to understand any scene. There are no tab
   stops and no keyboard equivalents, on purpose: these are pokes, and six
   focusable decorations would clutter the keyboard path that piece 1 just built
   for the reader who actually needs it.
   --------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  /* Walk out to the owning <svg>, so coordinates come back in viewBox user
     space rather than screen pixels and a scene can compare them directly
     against the numbers in its own markup. */
  function svgRootOf(el) {
    var n = el;
    while (n && n.ownerSVGElement) n = n.ownerSVGElement;
    return (n && n.tagName && n.tagName.toLowerCase() === 'svg') ? n : null;
  }

  function toUser(svg, cx, cy) {
    var m = svg.getScreenCTM();
    if (!m || !m.inverse) return null;
    var i = m.inverse();
    return { x: cx * i.a + cy * i.c + i.e, y: cx * i.b + cy * i.d + i.f };
  }

  /* drag(el, {onStart, onMove, onEnd})
     Reports {x, y, dx, dy}: absolute position in user space, and delta from
     where the finger went down. Vertical scrolling is left to the browser. */
  function drag(el, opts) {
    opts = opts || {};
    el.style.touchAction = 'pan-y';
    el.style.webkitUserSelect = 'none';
    el.style.userSelect = 'none';

    var svg = svgRootOf(el);
    var id = null, origin = null;

    function point(ev) {
      if (svg) {
        var p = toUser(svg, ev.clientX, ev.clientY);
        if (p) return p;
      }
      var r = el.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    el.addEventListener('pointerdown', function (ev) {
      if (id !== null) return;            /* one finger, whichever arrived first */
      id = ev.pointerId;
      origin = point(ev);
      if (el.setPointerCapture) {
        try { el.setPointerCapture(id); } catch (e) { /* capture is a nicety */ }
      }
      if (opts.onStart) opts.onStart({ x: origin.x, y: origin.y, dx: 0, dy: 0 });
    });

    el.addEventListener('pointermove', function (ev) {
      if (ev.pointerId !== id) return;
      var p = point(ev);
      if (opts.onMove) {
        opts.onMove({ x: p.x, y: p.y, dx: p.x - origin.x, dy: p.y - origin.y });
      }
    });

    /* pointercancel is the important one: it is what arrives when the browser
       takes the gesture back to scroll the page. */
    function end(ev) {
      if (ev.pointerId !== id) return;
      id = null;
      if (opts.onEnd) opts.onEnd();
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  /* press(el, {onDown, onUp})
     A pressed state and nothing else. Scene 5 depends on the nothing else: an
     empty socket that acknowledges the press and then does absolutely nothing is
     the joke, and a socket that ignores you entirely is just broken. */
  function press(el, opts) {
    opts = opts || {};
    el.style.touchAction = 'manipulation';
    el.setAttribute('data-pressed', 'false');

    function down(ev) {
      el.setAttribute('data-pressed', 'true');
      if (opts.onDown) opts.onDown(el, ev);
    }
    function up() {
      if (el.getAttribute('data-pressed') !== 'true') return;
      el.setAttribute('data-pressed', 'false');
      if (opts.onUp) opts.onUp(el);
    }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', up);
  }

  /* The one line under a stage that says the stage is touchable. It goes once
     the reader has touched it, and stays gone: it has done its job and the space
     it occupied is kept so nothing reflows. */
  function hintUsed(el) {
    if (el) el.setAttribute('data-done', 'true');
  }

  global.Poke = { drag: drag, press: press, hintUsed: hintUsed, toUser: toUser };

})(window);
