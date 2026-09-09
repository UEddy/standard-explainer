# Build prompt: presentation feel, touchable scenes, and an end quiz

Three separate pieces of work. Do them in the order given and stop between each. Do not
start this until the scene 9 lever, the scene 7 slots, and the whitepaper number check are
finished, since piece 1 changes the layout every scene sits in.

---

## Piece 1: make it feel like a presentation, not a page

**The problem.** Reading it on a phone, it reads as a normal long web page. Scenes flow into
each other, nothing owns the screen, and the animations feel like decoration on an article
rather than slides that arrive.

**What I originally asked for was side-to-side movement on scroll.** Consider it, then tell me
which of these you recommend and why. I want your judgement, not compliance.

- **Option A, vertical scroll-snap.** Each scene becomes a full-viewport section with
  `scroll-snap-align`. Scenes arrive one at a time and settle. Content slides in laterally
  from the side as each scene lands, so there is horizontal motion without horizontal scroll.
- **Option B, pinned horizontal scroll.** The page pins and scenes translate sideways as the
  reader scrolls down. More striking, and the effect I originally described.

My concern with B is that it needs a library, it competes with Android Chrome's back-swipe
gesture, and it is hard to keep feeling right on a small screen. If you can do B well without
those costs, argue for it. Otherwise A, and I would rather have A done properly than B done
nervously.

**Whichever you pick, these matter:**

- Use `dvh` not `vh`. The Android URL bar collapsing mid-scroll must not resize scenes or
  retrigger the observers.
- Scenes that currently need more than one screen of height must be redesigned to fit one, or
  be allowed to exempt themselves from snapping. Do not let anything get cut off.
- Snapping changes how the scenes enter and leave the viewport, so check that `sim.playOnce`
  still arms correctly. Its 40% stage visibility threshold was written for free scrolling and
  may behave differently when sections snap into place.
- A subtle persistent progress indicator, thirteen marks or a thin bar, so the reader knows
  how much is left. Presentations tell you where you are.
- Keyboard: arrow keys and Page Up or Page Down should move between scenes.
- Under `prefers-reduced-motion`, snapping is fine but lateral entrance animation is not.

---

## Piece 2: make more of it touchable

**The problem.** Six of thirteen scenes are watch-only. The site is meant to feel like a toy
and too much of it is a video.

**The rule.** Do not add more controls. You correctly reduced control repetition in the last
pass and I do not want that undone. What I want is *ambient* interactivity: things that
respond to touch without being an instrument. A reader should be able to poke almost anything
and have it react, even where there is nothing to operate.

Specifically:

- **Scene 6, the Charter. This is a real change, not ambient.** I previously told you to make
  it non-interactive and that was wrong. Let the reader actually grab the card and drag it.
  The tether stretches, resists, and snaps it back when released. Feeling it fight your thumb
  teaches soulbound far better than watching it happen. Keep the one-shot tug as the arrival
  animation for readers who never touch it.
- **Scene 1.** Let the reader drag along the market line and have the emission line stay
  flatly indifferent under their finger. The indifference is the point, so make it something
  they can push against.
- **Scene 2.** Let bricks be nudged, and let the lid be pushed against and refuse to move.
- **Scene 5.** Let the reader tap the removed governance controls and have them do visibly
  nothing. An empty socket that responds to a tap with nothing at all is a better joke than
  one that ignores you.
- **Scene 3 and scene 13 stay completely static.** They are the two rests in the page and
  they run no JavaScript. Do not touch them.

Everything here must be optional. Nothing added in this piece may gate understanding, and
every scene must still teach its idea to someone who only scrolls.

---

## Piece 3: a three question check at the end

After scene 13, a short Duolingo-style check. Not a test. A moment where the reader finds out
they actually understood something, which is the payoff for having read the whole thing.

**Content.** Three questions, one per tentpole, in this order:

1. **The locked money.** The idea from scene 10: earnings accrue inside the system and the
   only way to claim them is to close a Branch, permanently.
2. **The delay.** The idea from scene 11: policy reacts on a lag, so acting on what you feel
   right now means overshooting.
3. **The overhang.** The idea from scene 12: circulating supply can look low precisely
   because large claims exist that are not counted yet.

Three or four options each. Wrong answers must be plausible and must be the actual
misconceptions a first-time reader would hold, not filler. If a wrong option is obviously
silly, the question teaches nothing.

**Behaviour.**

- Immediate feedback on tap. Correct settles green, wrong settles red, and both reveal a one
  or two sentence explanation of *why*.
- A wrong answer is not a failure. No score shaming, no percentage, no retry gate. The
  explanation is the point.
- A wrong answer must link back to the scene that taught it, so the reader can jump up and
  re-play that scene.
- One question on screen at a time.
- At the end, a short close and the official site link. No score out of three.

**Visual.** It must not look like a form bolted onto the end. Use `base.css`: the existing
card shell, the existing palette, the established colour roles. Violet still means claims that
are not counted and coral still means supply in circulation, including inside the quiz. If a
question is about the overhang, the colours in that question should agree with scene 12.

**Technical.** Do not import a quiz library. It runs on the shared scene loop like everything
else, it is keyboard operable with visible focus, and answers are held in memory only. No
storage, no analytics, no network.

---

## Constraints that still apply to all three pieces

- No wallet code, no Web3 libraries, no external requests beyond fonts.
- No em dashes or en dashes anywhere.
- No invented protocol parameters. The quiz explanations especially must only assert things
  in the verified list in `CONTENT.md`.
- Namespace every new id. Never start a private loop or timer, use the shared scene loop.
- Portrait at 390px and 320px, no horizontal overflow.
- Add all new user-facing copy to `CONTENT.md`, including the quiz questions, options, and
  explanations.

## Stop points

Stop and show me after piece 1. Stop and show me after piece 2. Stop and show me after
piece 3. Do not run them together.
