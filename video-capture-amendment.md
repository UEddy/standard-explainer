# Amendment to video-capture-prompt.md: phone frame and simulated touch

Append this to the video capture work. Everything in the original prompt still applies, with
the additions and overrides below.

---

## The change

The clip should look like someone using the site on a phone. Two additions.

**1. A visible touch indicator, injected at capture time.**

Right now a scripted mouse drag is invisible in the recording, so the dial turns and the
Branch cracks with nothing apparently causing it. That reads as a video, not a demo.

Inject an overlay into the page via Playwright's `addInitScript` so it exists only during
capture and never in the deployed site:

- A soft translucent circle that follows the pointer, similar to Android's "show taps"
  developer option.
- It presses in and brightens on pointer down, releases on pointer up.
- On a press and hold, such as retiring a Branch in scene 10, it should visibly persist and
  intensify for the duration of the hold, because that hold is the whole point of the shot.
- On a drag, a short fading trail behind it so the motion path is legible.
- `pointer-events: none`, high z-index, and it must not alter layout or trigger any scene.
- Idle between actions: fade it out rather than leaving a dot parked on screen.

Keep it restrained. It should read as a fingertip, not a cursor effect.

**2. Composite the recording into a phone frame.**

After capture, composite the video into a phone body and output at 1080 x 1920.

- Generate the frame yourself, a rounded rectangle with a bezel, a subtle screen inset and a
  soft drop shadow, on a flat background. Do not download a device mockup image, since the
  licensing on those is usually unclear and I am posting this publicly.
- Background should be a flat colour taken from `base.css` so the clip is visually of a piece
  with the site. Not white, not black.
- No hand, no arm, no desk photo. The frame and the touch indicator are enough.
- No branding, no watermark, no captions.

**3. Output both versions.**

- `out/demo-framed.mp4`, the phone frame version, 1080 x 1920.
- `out/demo-raw.mp4`, full bleed with the touch indicator but no frame.

Full bleed sometimes plays better in a feed, so I want to compare rather than guess. Both
H.264, yuv420p, faststart, no audio.

---

## Override on shot timings

The original shot list assumes vertical scrolling. **Do not build the capture until piece 1 of
`presentation-quiz-prompt.md` has shipped**, since the page structure is about to change. If
scenes end up snapping into place, every scroll instruction in the shot list needs rewriting
as a scene advance instead.

When you do rewrite it, the three moments stay the same and in the same order: the shower
overshoot, the Branch breaking, the overhang rising. Those are still the whole clip.

---

## Everything else stands

The self-verification requirement is unchanged and matters more now, not less. Confirm from
the page that the scald fired, the Branch reached its broken state, and at least one claim
converted, before producing either output. A framed clip of a failed take is still a failed
take.

Config object at the top of `capture.js` for all timings, plus a flag to toggle the touch
indicator and the frame independently, so I can retune without reading the script body.
