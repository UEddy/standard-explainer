# The Standard Reserve, explained

An independent, animated explainer for The Standard Reserve. Static site, vanilla
HTML, CSS and JavaScript. No build step, no dependencies, no network calls beyond
the page's own files. Not affiliated with or endorsed by the protocol.

**Status:** all 13 scenes built. A polish pass has not been done.

## Preview locally

PowerShell, from the repo root:

```powershell
python -m http.server 8177 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8177/>. Any static server works. Opening `index.html`
directly from the filesystem also works, though some browsers restrict `file://`.

To stop the server, press Ctrl+C in that window.

## Deploy

The repo is the site. It is deployed on **GitHub Pages** and that is the only
target: push to `main` and it goes live at
<https://ueddy.github.io/standard-explainer/>. No build command, no output
directory, nothing to configure. Vercel was considered and dropped.

**A caching note.** GitHub Pages serves assets with a ten minute max-age, so
after a push a returning reader can run new HTML against an old `js/scene-NN.js`
for a few minutes. This bit repeatedly during development and produced changes
that appeared not to work. If you are checking a change and it looks like it did
not land, hard reload before believing it.

## Layout

```
index.html            the whole page: masthead, one <section> per scene, footer
css/base.css          palette, type, cards, controls. Shared by every scene
css/scene-NN.css      only what that one scene needs
js/presentation.js    scroll-snap navigation, entrances, progress marks
js/scene-loop.js      one shared rAF loop for the page
js/scene-NN.js        one IIFE per scene
```

## Two conventions every new scene must follow

**1. Namespace every id.** All scenes live in one document, so ids collide. Each
scene uses a `sNN-` prefix in markup and resolves it in one place:

```js
var ROOT = document.getElementById('scene-12');
var P = 's12-';
function el(id){ return document.getElementById(P + id); }
```

Anything that is not an id lookup must still be scoped to the scene, so use
`ROOT.querySelectorAll(...)`, never `document.querySelectorAll(...)`. The same
applies to SVG fragment references such as `url(#s11-tempGrad)`.

**2. Never start your own loop or timer.** Register with the shared loop, which
runs one `requestAnimationFrame` chain for the whole page and ticks only the
scenes that are on screen:

```js
var sim = SceneLoop.register({
  root: ROOT,
  step: 1/60,          // fixed simulation step
  simulate: fn(step),  // 0 to N times per frame
  render: fn(dt),      // once per frame
  onPause: fn(),       // clear anything that outlives the scene
  onResume: fn(away, s)
});
```

Use `sim.after(seconds, fn)` rather than `setTimeout`, so timers cannot fire at a
scene nobody is looking at. `SceneLoop.reducedMotion` is resolved once and shared.
See the header of `js/scene-loop.js` for the full contract.

**3. A play-once beat uses `sim.playOnce`.** It arms off the stage rather than the
scene, waits on the scene clock, and defers rather than firing at a stage that has
scrolled out of view:

```js
sim.playOnce(el('stage'), 0.3, function(){ startT = sim.elapsed; });
```

The animation should be a pure function of time since that fires, so there is no
state to keep in step and no way to end up half played. Under reduced motion, set
the start time into the past and render once immediately, so the finished picture
is there without waiting to be scrolled to.

Add `?debug` to the URL for an on-page readout of the loop, each scene's clock and
the largest frame gap seen. It is the only way to check any of this on a phone.

Two traps worth knowing, both already hit once:

- Anything drawn outside the scene root, such as a fixed position overlay, must be
  cleared in `onPause`, or it will follow the reader down the page.
- A play-once beat must be armed by its own stage coming into view, not by the
  scene registering. A scene root is much taller than its stage, so arming on
  activation fires the beat while the reader is still on the headline. Scene 12
  shows the pattern.

## The presentation layer

`js/presentation.js` and the presentation block in `base.css` turn the page into
a sequence. Three things a new scene inherits automatically, and one it has to
respect.

**Inherited.** Every `.masthead` and `.scene` is `min-height:100dvh`, a grid with
`align-content:safe center`, and a proximity snap point at its top. Its direct
children get the lateral entrance the first time the section is seen, staggered
by `nth-child`. A mark is added to the progress bar for every `.scene`, so a new
scene needs no registration.

**Snapping is `proximity`, never `mandatory`.** Eight of the fourteen sections
are taller than a phone screen, scene 12 at about 2.7 of them. Mandatory snapping
would make the bottom of those unreachable. Proximity assists on approach and
lets go otherwise, which is also how a tall scene exempts itself: it simply never
gets pulled.

**`padding-block` on `.masthead, .scene` is 0 and must stay there.** `min-height`
is border box, so padding comes straight out of the content box. Scenes 2 and 6
carry about 740px against a 780px screen and a 34px gutter was enough to push
both of them below the fold. Vertical breathing room comes from the scene's own
`<header>` and from the trailing margin on its last card.

**The one thing a new scene must respect: do not swallow navigation keys.**
`presentation.js` moves between scenes on the arrows and Page Up / Page Down, and
it steps out of the way of any control that genuinely uses the key pressed. A
range input and scene 11's `role="slider"` dial claim the arrows, paging and
Home / End. A `role="radio"` claims the arrows only, and gets roving within its
`role="radiogroup"` in exchange. Everything else, including plain buttons like
scene 7's Branch slots and scene 9's lever, lets paging through. If a new control
needs a key, declare it in `consumesKey`; do not call `preventDefault` in the
scene.

## Ground rules for content

- No wallet connection, no Web3 libraries, no `window.ethereum`. The site never
  asks for anything.
- The disclaimer appears in the header and again in the footer.
- No invented protocol parameters. Anything not confirmed in public material is
  either omitted or labelled illustrative on screen.
- No em dashes or en dashes in copy or code.
- Portrait phone first, no horizontal scrolling.
- `prefers-reduced-motion` gets a still fallback that still teaches the idea.

## Scene weights

Scenes 1, 2, 3 and 5 are connective tissue: one stage, one term line, no lesson
card. Scene 3 is a still diagram with no script at all, which is deliberate. It
gives the page a breath between two animated scenes and the first toy, and it
costs nothing to run. Not every scene needs a clock.

Scenes 4, 7, 8, 9, 10, 11 and 12 carry an interaction and earn their extra
weight. Scenes 1, 2 and 6 are play-once animations. Scenes 3 and 13 have no
script at all.

## Testing

Development and checking is done in desktop Chrome, plus an iframe harness at
412px and 320px for portrait layout (`_phonetest.html`, gitignored so it never
deploys). Add `?debug` to the URL for the on-page readout of the shared loop,
each scene's clock and the largest frame gap seen.

**Anything animated has to be checked with the Chrome window actually visible.**
If the window is minimised or fully occluded, Chrome reports `document.hidden`
as true, stops `requestAnimationFrame` entirely and throttles IntersectionObserver
delivery. SceneLoop then correctly parks every scene, and a probe run against
that state reads as "no animation fired" when nothing is wrong. Faking
`document.hidden` does not help, because rAF still will not run. Check
`document.hidden` first and raise the window before trusting a negative result.

**The target phone is a Samsung S24, Android Chrome.** There is no iOS device in
play and no device testing is being done, so anything that can only be settled on
hardware is settled by reasoning and by keeping to safe ground: `dvh` rather than
`vh`, no reliance on iOS-only behaviour, and no gestures that fight Android
Chrome's back-swipe from the left edge.

## Still outstanding

### The queue, in order

Each brief stops for review before the next. The dependencies are real, not
preferences: piece 1 changes the layout every later piece sits in.

1. ~~**Piece 1, presentation feel**~~ (`presentation-quiz-prompt.md`). Done.
   Option A, vertical scroll-snap with proximity and a lateral entrance, chosen
   over pinned horizontal because only 6 of 14 sections fit one screen at
   412 x 780 and the three tentpoles run to roughly two and a half each. See
   "The presentation layer" above.
2. **Piece 2, ambient interactivity** (same file). No new controls. Scene 6 gains
   a real drag. Scenes 3 and 13 stay static and script free.
3. **Piece 3, the end quiz** (same file, plus the amendment at its foot).
   Fifteen questions, five variants per slot, drawn and shuffled per run.
4. **Piece 4, the narrator** (`narrator-prompt.md`). Depends on the layout piece
   1 settles. Stop point is the system plus lines for scenes 10, 11 and 12 only.
5. **Video capture** (`video-capture-prompt.md` plus
   `video-capture-amendment.md`). Explicitly waits for piece 1 to ship, because
   the shot list assumes vertical scrolling and would need rewriting as scene
   advances if scenes end up snapping.
- Scene 11 predates `base.css` and still carries a little duplicated shell CSS in
  `css/scene-11.css`. Harmless, worth tidying.
- Scene 12 has its own copy of the play-once arming logic, written before
  `sim.playOnce` existed. It works; it could adopt the shared helper.

Copy lives in `CONTENT.md`, including which numbers are verified and which are
illustrative. Edit there first.
