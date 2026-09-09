# Build prompt, piece 4: the narrator

Do this after pieces 1, 2 and 3. It depends on the layout piece 1 settles.

---

## Why

Thirteen scenes currently teach in isolation. Each has a stage and a term line, and nothing
carries the reader between them or acknowledges what they just did. The result reads as a
document with animations rather than something guiding you through an argument.

A narrator fixes that. Not a mascot, not a tutorial, and not a second set of captions.

## What it is

A persistent voice in a fixed position that speaks in short lines, reacts to the reader, and
carries the thread from scene to scene.

**Default is text, not audio.** This gets opened on phones, usually muted, often in public.
Autoplay audio is blocked in most browsers and resented in the rest.

**Optional voice, via the browser.** A small speaker toggle, off by default, using the Web
Speech API `SpeechSynthesis`. It is built into the browser, so it costs zero bytes, needs no
API key and no audio files. Quality varies by device and that is acceptable for an optional
extra. If `speechSynthesis` is unavailable, hide the toggle rather than showing a dead
control. Remember the choice in memory only, no storage.

## What it must do

**React to behaviour, not just position.** This is the whole difference between a narrator and
a caption. It should notice things the scene itself does not:

- The reader arriving, and what they are about to be shown.
- The reader doing something, and what it meant. "You opened four. So did everyone else."
- The reader doing nothing. Idling on an interactive scene for a while earns a nudge toward
  the control, once, not repeatedly.
- The reader exploring hard. Someone who drags a slider through its whole range deserves
  acknowledgement rather than silence.
- The reader moving on quickly, which can be met with a one-line summary of what they skipped.

**Carry the argument between scenes.** The strongest lines are the ones that connect. Arriving
at scene 12 after scene 10 is an opportunity: the reader has already broken a Branch to get
paid, and now they are about to see what happens when everyone does that at once. Say so.

## What it must not do

- **Never restate what the scene already says.** Scene 11 already prints "That is the water you
  asked for 6.0 seconds ago." The narrator saying the same thing is noise. Audit every existing
  term line and caption before writing narrator copy, and stay off their territory.
- Never block, cover, or compete with the stage. On a 390px portrait screen the stage wins.
- Never gate progress. Nothing waits on the narrator finishing.
- Never be twee. No exclamation marks, no cheerleading, no "Great job!". The site's tone is
  plain and slightly dry, and the narrator holds that line. It is closer to a good museum guide
  than to a game tutorial.
- Never speak over itself. A new line replaces the old one cleanly.
- Never assert anything outside the verified list in `CONTENT.md`.

## Form

You decide the visual treatment, and you have the constraint that matters: full-viewport
scenes on a phone leave very little room. A character with a face is likely to cost more space
than it earns, but if you can make one work without crowding the stage, argue for it.

Whatever you choose, it sits in the same place on every scene, uses `base.css`, and reads as
part of the site rather than an overlay bolted on.

It must be dismissible. A reader who wants to just look at the thing should be able to turn it
off, and that choice persists across scenes for the session.

## Accessibility

- The narrator region is an `aria-live="polite"` region so screen reader users get the lines
  without them interrupting.
- Under `prefers-reduced-motion`, lines appear without animated entrances.
- Both toggles, dismiss and voice, are keyboard operable with visible focus.

## For the demo video

Do not use voice narration in the capture. X autoplays muted, so most viewers never hear it.
The narrator's text lines will appear in the recording naturally as part of the page, which is
the right amount. Do not add burned-in subtitles on top of that.

## Copy

All narrator lines go in `CONTENT.md` in a dedicated section, grouped by scene, with the
behavioural triggers noted next to each line. This will be revised heavily and it must be
editable in one place without touching code.

Write the lines short. One sentence is usually right, two is the maximum, and any line that
needs three is trying to do the scene's job for it.

## Stop point

Build the narrator system plus the lines for scenes 10, 11 and 12 only. Those are the three
tentpoles and they will tell us whether the voice is working. Stop and show me before writing
lines for the other ten.

---

## Amendment, added 2026-09-09 by the user

Three decisions taken in advance. They are settled, not open for a case to be
re-argued when the work starts.

### The narrator is silent during the quiz

The quiz is where the reader speaks, so the narrator gets out of the way. Two
lines only:

- One as the quiz opens, handing over.
- One at the very end.

Nothing between questions. No reaction to a right answer, no consolation for a
wrong one. The quiz already gives per-question feedback and an explanation, and a
second voice on top of that is exactly the "second set of captions" this brief
forbids.

### Form is a single line of height

Not a portrait, not a character with a face. A character competing with a scene
that runs to 2.68 screens on a phone is a bad trade, and the space argument is
already accepted. Build it as one line unless something in the shipped piece 1
layout genuinely changes the picture, in which case say what changed.

### Scene 11 gets arrival and departure only

Scene 11's hint line already narrates continuously: it prints the water
temperature, the delay, and "That is the water you asked for 6.0 seconds ago."
The narrator has almost nothing left to say there that would not be restatement.
One line on arrival, one on leaving.

The general rule behind that: **resist the pull to put the most commentary on the
best scene.** The strongest scenes are the ones already doing the teaching, so
they need the narrator least. The lines that earn their place are the ones
carrying the argument between scenes, not the ones sitting on top of a scene that
is working.
