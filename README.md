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

## Where it lives

**https://standard-explainer.vercel.app** is the canonical URL. It is the link to
share, the one `<link rel="canonical">` points at, and the one `capture.js`
records. There is one address on purpose; if you change it, change it here, in
`CFG.url` at the top of `capture.js`, and in the canonical tag in `index.html`,
and nowhere else needs to know.

Vercel is connected to the GitHub repo, so a push to `main` deploys production.
Deploying from a working directory with `vercel deploy --prod` also works and is
how the project was created, but prefer the push: the repo is then the only thing
that decides what is live.

`vercel.json` declares no framework and no build, since the site is static, and
sets `must-revalidate` on `css/` and `js/` because the filenames are not content
hashed and the default long cache reproduces the "my change did not land"
confusion. `.vercelignore` keeps the build prompts, the test harnesses and the
capture tooling out of the upload, which matters because `vercel deploy` uploads
the working directory rather than the git tree, and one of those prompts is
deliberately not in the public repo.

Note that the per deployment URLs, the ones with a hash in them, sit behind
Vercel SSO and return a 302 to a login. Only the alias above is public. Verified
from a clean browser with no cookies: 200, no redirect, no cookies set, all
assets 200, no console errors.

**GitHub Pages is retired.** It served https://ueddy.github.io/standard-explainer/
from `main` until Vercel became canonical. It was turned off rather than left
running: both copies were fed by `main` so they could not actually drift, but two
public addresses for one page splits links and invites the wrong one being
shared. It can be turned back on from the repository settings in a few seconds if
Vercel is ever unavailable.

## Layout

```
index.html            the whole page: masthead, one <section> per scene, footer
css/base.css          palette, type, cards, controls. Shared by every scene
css/scene-NN.css      only what that one scene needs
js/presentation.js    scroll-snap navigation, entrances, progress marks
js/poke.js            shared ambient touch: drag, press, SVG coordinates
js/scene-loop.js      one shared rAF loop for the page
js/scene-NN.js        one IIFE per scene
js/quiz.js            the end check: question bank, draw, shuffle
js/narrator.js        the narrator: lines, triggers, the bar
css/narrator.css      the narrator only
tools/bank-to-content.js   regenerates the bank section of CONTENT.md
css/quiz.css          the end check only
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

## Ambient touch

`js/poke.js` is the shared half of piece 2, for the same reason the scene loop is
shared: four scenes needed the same gesture handling and the page snaps, so a
scene that got it wrong would trap the reader inside itself.

**Nothing in it ever calls `preventDefault`.** A draggable declares its axis and
the browser keeps the other one. `Poke.drag` sets `touch-action: pan-y`, so a
vertical swipe scrolls the page and never reaches the scene at all, and the
moment the browser claims a gesture as a scroll it sends `pointercancel`, which
ends the drag cleanly. There is no free-axis drag in the API on purpose: the only
way to get one on a phone is `touch-action: none`, which is a scroll trap sitting
in the middle of a scene.

`Poke.press` is a pressed state and nothing else. Scene 5 depends on the nothing
else.

Coordinates come back in SVG user space, so a scene compares them against the
numbers already in its own markup rather than against screen pixels.

**No tab stops, no keyboard equivalents.** These are pokes. Nothing built on them
may gate understanding, and every one of these scenes still teaches its idea to
someone who only scrolls, so six focusable decorations would only clutter the
keyboard path piece 1 built for the reader who needs it.

**One trap worth knowing about.** A render pass that skips writing when an offset
is zero drops the final write, the one that puts a settled thing back where it
belongs. The simulation then believes it is home while the screen keeps the last
displaced frame forever. Scene 2 hit this and now compares against the last value
written, not against zero.

## The end check

Three questions after scene 13, in `js/quiz.js`. One per tentpole, always in the
order the page taught them, five variants per slot, one drawn per slot per run
with the options shuffled inside each question. 125 sets before shuffling.
Nothing is stored anywhere, so a reload draws a fresh set, and "Try three more"
redraws in place.

**Generation is one way: `js/quiz.js` to `CONTENT.md`, never back.** The bank
between the markers in `CONTENT.md` is written by `node tools/bank-to-content.js`
and is overwritten every time it runs, so editing a question there changes
nothing a reader sees and is lost on the next run. Edit `BANK` in `js/quiz.js`,
then run the script. The prose above those markers is hand written and is safe
to edit.

Fifteen explanations is a lot of surface for an unverified claim to creep in on,
so every one of them may assert only what is on the verified list in
`CONTENT.md`, and anything from a toy is named illustrative. The overhang slot
needs the most care, because it is the one place the page says anything about
risk: keep it to the mechanism and to what is not public, and let it say plainly
that the size of the thing is unknown rather than implied.

**A wrong answer is not a failure state.** No score, no percentage, no retry
gate, and the end card shows no total. The correct option is always revealed,
including when the reader got it wrong, because being told only that you were
wrong teaches nothing. A wrong answer additionally offers the scene that taught
it; a right answer does not, since offering it anyway reads as a consolation
prize.

**Two colour systems run in the same card and must not merge.** The slot tag
carries the site's meaning colours: violet for claims not counted in supply,
violet under a coral rule for the overhang, and plain ink for the delay, since
scene 11 has its own temperature language and nothing should borrow it. The
answer states are a separate axis, drawn as soft fills so a right answer never
reads as scene 9's expansion regime.

**Height is the constraint that shaped the interaction.** The explanation is the
payoff and it has to be on screen with the way forward, on a phone, without a
scroll. Two things that do not work: keeping all four options visible, which put
the explanation below the fold in 13 of 15 questions and the Next button below
it in all 15; and calling `scrollIntoView` to fix that, which moves nothing at
all, because the section sits on its own snap point and proximity snapping pulls
the page straight back. What works is the card being shorter: the options nobody
picked fold away, and the standfirst folds on the first answer. All 60
combinations of 15 questions by 4 picks now fit one screen at 412 x 780 and at
320 x 780.

## The narrator

One line fixed at the foot of the screen, in `js/narrator.js`. No character and
no face, because a portrait competing with a scene that runs to two and a half
screens on a phone costs more space than it earns.

**It does not touch scenes 10, 11 or 12, and it must not need to.** SceneLoop
keeps one scene object per root element, so registering a second scene on the
same root would clobber the first. The narrator instead reads the handle those
scenes already publish on their roots and borrows their clocks, so its timers
pause off screen like everything else. Reader actions come from state the scenes
already write to the DOM: scene 10's "gone for good" counter, scene 12's slider
value. Adding a scene to the narrator should stay a matter of adding lines and a
watcher, never of editing the scene.

**Only the scenes with lines reserve room for the bar.** `narrator.js` marks
them `data-narrated="true"` and the CSS keys off that, so scenes 2 and 6 keep the
one screen fit piece 1 bought them, and the reserved space follows the lines when
the other ten get written. On any scene without lines the bar is hushed, and
hushed means `visibility:hidden` rather than just faded, so its live region does
not leave a stale line for a screen reader to find.

**Scenes 3 and 13 are narrated and still run no JavaScript.** The narrator is a
page level module that watches sections from outside with an IntersectionObserver
and reads `__sceneLoop` off a root only if one is there, so neither scene is
registered with the loop and neither gains a script. What that costs them is
timing: with no clock there is no idle nudge, no dwell measurement and so no skim
line, and no way for a line to fade itself out. Arrival lines only, which suits
both, one being a rest and the other the close.

**Skim lines are capped at two a session.** A skim line takes precedence over the
arrival line of wherever the reader went, which is right once and wrong nine
times; without the cap a brisk reader gets a column of "Skipped:" lines instead
of the thread between scenes.

**There are no departure lines and there should not be.** Leaving one scene and
arriving at the next resolve in the same observer callback, so a parting line is
always overwritten by the arrival line of wherever the reader went. Skim lines
survive because they fire on the way into another narrated scene and take
precedence there. If a parting thought is worth keeping, it belongs to the next
scene as an arrival line.

**Every line fits one row at 412px**, roughly 45 characters, with two rows as the
hard ceiling for a narrow screen or large text. Copy lives in `CONTENT.md` with
its triggers; there is no generator, so change both.

Voice is optional, off by default, and uses the browser's own `speechSynthesis`,
so it costs no bytes and no key. The toggle is not rendered at all where
`speechSynthesis` is missing. The choice is memory only.

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
weight. Scenes 1, 2 and 6 open on a play-once animation and then answer a finger
without ever requiring one. Scenes 3 and 13 have no script at all, which is the
one thing about them that must not change.

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

## The demo capture

`node capture.js` drives real Chrome through the live Vercel site, records it,
and writes `out/demo-framed.mp4` (1080 x 1920, in a generated phone body),
`out/demo-raw.mp4` (780 x 1688, full bleed) and four stills. About 26 seconds, no
audio, roughly 4 MB each. Needs `npm install` first; the browser is not
downloaded, `channel: 'chrome'` uses the installed one.

**All shot timings are in `CFG` at the top of the file.** Nothing below it needs
reading to retime a shot.

**What the snapping layout did to the shot list.** At the two positions the
presentation layer naturally produces, a snap point or one page down, none of the
three shots frames: scene 11 at its snap point shows the shower with 75px of the
dial, and one page down shows the dial with the shower gone. So each shot seats
at an intermediate framing computed from the elements that have to share the
frame, which is a legitimate reading position because proximity assists and never
grabs. The scrolls are programmatic and eased, which also keeps them from
re-engaging snapping.

**Three timing dependencies that are easy to break.**

- *The reveal race.* Scene 12's stage arms its reveal at 40 percent visible and
  fires 1.0s later. The descent is therefore two legs, a transit and then a
  sprint that must cover the last stretch inside that second, or the reveal plays
  off screen mid scroll. Measured and checked every run; it lands around 710ms.
- *The empty vault.* Scene 10 accrues 9 a second against a column worth 900, so a
  column needs 100 seconds and arriving cold makes the vault read as an empty
  box. Its clock only runs while it is on screen, so `preAccrueMs` sits on scene
  10 before the first shot. That happens inside the lead-in, which is trimmed, so
  it costs the clip nothing.
- *The lead-in itself.* Page load, the pre-accrue dwell and seating are all in the
  recording, about 45 seconds of it. It is trimmed by measurement rather than a
  guessed constant, so the clip opens on the shower and never on a masthead.

**The check worth keeping.** Scene 12's arrival narration, "You closed one to get
paid. Now everyone.", only fires because shot 3 retires a Branch before shot 4
arrives at scene 12. Reorder the shots and the narrator quietly falls back to the
generic line with no other symptom. `verify()` asserts that line by name, and
also asserts the generic one never appeared. It is checked against a trace of
every line said during the take, not against the final line, because by the end
the narrator has rightly moved on to the slider line.

A take that fails any check is discarded whole and re-recorded, up to
`maxTakes`. Nothing half broken gets written.

## Known untested

- **Proximity snapping has not been re-checked with real wheel events since the
  `padding-block` fix.** CDP wheel events route to the top frame, so they hit the
  harness page rather than the iframe, and the same test at desktop width is not
  representative of a phone. What is checked: parking at scene 11's last
  screenful, a full viewport short of scene 12's snap point, produces zero drift,
  and the real-wheel version passed before the padding change. Removing the
  padding moved the snap points but not the snap strength. Worth one pass on real
  hardware if the chance comes up.

## Still outstanding

### The queue, in order

Each brief stops for review before the next. The dependencies are real, not
preferences: piece 1 changes the layout every later piece sits in.

1. ~~**Piece 1, presentation feel**~~ (`presentation-quiz-prompt.md`). Done.
   Option A, vertical scroll-snap with proximity and a lateral entrance, chosen
   over pinned horizontal because only 6 of 14 sections fit one screen at
   412 x 780 and the three tentpoles run to roughly two and a half each. See
   "The presentation layer" above.
2. ~~**Piece 2, ambient interactivity**~~ (same file). Done. No new controls.
   Scene 1 has a probe the reader drags along the chart, scene 2's stack shoves
   and its lid refuses, scene 5's removed controls depress and do nothing, and
   scene 6 is a real drag with a saturating tether. Scenes 3 and 13 remain
   static and script free. See "Ambient touch" above.
3. ~~**Piece 3, the end quiz**~~ (same file, plus the amendment at its foot).
   Done. Fifteen questions, five variants per slot, drawn and shuffled per run.
   See "The end check" above.
4. ~~**Piece 4, the narrator**~~ (`narrator-prompt.md`, plus the amendment at
   its foot). Done. System plus lines for all fourteen sections, written in two
   passes. See "The narrator" above.
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
