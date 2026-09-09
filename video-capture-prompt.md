# Build prompt: scripted demo video capture

## What you are building

A repeatable script that drives a real Chrome browser through the live site on a scripted
path, records it, and outputs an mp4 sized for X. Not a screen recording I make by hand, and
not generated video. A script I can rerun after every change to get a fresh clip.

Target: `https://ueddy.github.io/standard-explainer/` (no `?debug`).

Output: `out/demo.mp4`, portrait, roughly 30 seconds, no audio, under 15 MB.

---

## Why portrait and why short

The clip is for X, where it autoplays muted in a mobile feed. So:

- Portrait, 390 x 844 viewport at deviceScaleFactor 2, which matches the phone layout the
  site was built for.
- Under 35 seconds. Attention is gone before that.
- No audio track at all.
- The first two seconds have to show something moving. Do not open on a static masthead.
- H.264 mp4. X will not reliably play webm.

---

## The shot list

Do not scroll the whole page. Thirteen scenes is a tour, not a demo. Show three things being
touched, because the entire point of the site is that you can touch it.

**Shot 1, hook (0 to 3s).** Open partway into scene 11 so the shower is already on screen.
Do not start at the top of the page. Do not show a masthead.

**Shot 2, the shower (3 to 13s).** The hero shot, and the one worth the most seconds.
- Drag the dial up in one deliberate sweep, human-paced, not an instant jump.
- Hold still. The purple arc between hand and arrival should be clearly visible while
  nothing happens.
- Let the scald land. Wait a beat on the red flash and the caption.
- **Verify the scald actually fired before committing the take.** Read it from the page,
  do not assume it. If no scald fired, adjust the drag and re-record. A shower demo where
  nobody gets burned is a failed take.

**Shot 3, breaking a branch (13 to 21s).** Scroll to scene 10.
- Press and hold one Branch. Hold long enough that the crack visibly spreads.
- Let it snap. Pause on the aftermath: tokens in the wallet, that column dead.
- This shot sells irreversibility, so do not cut early.

**Shot 4, the overhang (21 to 30s).** Scroll to scene 12.
- Arrive before the reveal beat fires so the water is still opaque and the scene looks calm.
- Let the reveal play. That is the moment.
- Then drag the exit slider so claim bricks rise through the waterline and turn coral.

**Shot 5, close (30 to 33s).** Hold on the last frame for a beat. Nothing else. Do not add
an end card, a logo, or a URL overlay. I will write the URL in the post.

---

## Technical

- Playwright, launched with `channel: 'chrome'` so it uses the Chrome already installed and
  does not download a browser. Bandwidth matters here.
- Use Playwright's `recordVideo` on the browser context. It captures compositor frames in
  real time, which is what this site needs, because the scenes run on a real-time clock.
  Do not build a screenshot loop and stitch frames. The simulation would advance between
  captures and the motion would come out fast-forwarded and wrong.
- Convert the recorded webm to mp4 with ffmpeg, H.264, yuv420p, faststart, no audio.
  If ffmpeg is not on PATH, use the npm package `@ffmpeg-installer/ffmpeg` rather than asking
  me to install anything system-wide.
- All movement must look human. Mouse drags in many small steps with easing, never a single
  jump. Scrolls smooth and eased, never instant. Deliberate pauses after each action so a
  viewer has time to register what changed.
- Everything in one file, `capture.js`, with the shot timings in a config object at the top
  so I can retune without reading the script body.
- PowerShell commands only. Windows, repo under `C:\Users\Eddy\dev`.

## Correctness checks the script must do itself

Do not hand me a take you have not verified. Before conversion, confirm from the page that:

- The scene 11 scald fired.
- The scene 10 Branch actually reached its broken state.
- The scene 12 reveal played, and at least one brick converted to circulating.

If any check fails, retry that shot rather than producing a broken clip. Report which checks
passed.

## Deliverables

1. `capture.js`
2. `out/demo.mp4`
3. Three or four still frames pulled from the video at the strongest moments, saved as pngs,
   since a good still is worth having for the post itself.
4. A short section in the README: how to rerun, and where to change shot timings.

## Do not

- Do not add music, captions, subtitles, zoom effects, or transitions.
- Do not add a watermark or branding overlay.
- Do not speed up or slow down the footage. The pacing of the animations is the product.
- Do not scroll through scenes that are not in the shot list.
