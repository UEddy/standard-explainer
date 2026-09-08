# The Standard Reserve, explained

An independent, animated explainer for The Standard Reserve. Static site, vanilla
HTML, CSS and JavaScript. No build step, no dependencies, no network calls beyond
the page's own files. Not affiliated with or endorsed by the protocol.

**Status:** 3 of 13 scenes built. Scene 10 (the locked money), scene 11 (the delay),
scene 12 (the overhang).

## Preview locally

PowerShell, from the repo root:

```powershell
python -m http.server 8177 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8177/>. Any static server works. Opening `index.html`
directly from the filesystem also works, though some browsers restrict `file://`.

To stop the server, press Ctrl+C in that window.

## Deploy

The repo is the site, so both of these need no configuration:

- **Vercel:** `vercel --prod` from the repo root, or connect the repo and accept
  the defaults. There is no build command and no output directory.
- **GitHub Pages:** push to `main`, then Settings, Pages, deploy from branch
  `main` and folder `/ (root)`.

## Layout

```
index.html            the whole page: masthead, one <section> per scene, footer
css/base.css          palette, type, cards, controls. Shared by every scene
css/scene-NN.css      only what that one scene needs
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

Two traps worth knowing, both already hit once:

- Anything drawn outside the scene root, such as a fixed position overlay, must be
  cleared in `onPause`, or it will follow the reader down the page.
- A play-once beat must be armed by its own stage coming into view, not by the
  scene registering. A scene root is much taller than its stage, so arming on
  activation fires the beat while the reader is still on the headline. Scene 12
  shows the pattern.

## Ground rules for content

- No wallet connection, no Web3 libraries, no `window.ethereum`. The site never
  asks for anything.
- The disclaimer appears in the header and again in the footer.
- No invented protocol parameters. Anything not confirmed in public material is
  either omitted or labelled illustrative on screen.
- No em dashes or en dashes in copy or code.
- Portrait phone first, no horizontal scrolling.
- `prefers-reduced-motion` gets a still fallback that still teaches the idea.

## Still outstanding

- Scenes 1 to 9 and 13.
- `CONTENT.md`, holding every line of user facing copy in one place.
- Scene 11 predates `base.css` and still carries a little duplicated shell CSS in
  `css/scene-11.css`. Harmless, worth tidying.
