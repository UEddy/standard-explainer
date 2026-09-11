/* ---------------------------------------------------------------------------
   capture.js
   A repeatable scripted demo recording of the live site.

   Run:  node capture.js
   Out:  out/demo-framed.mp4  (1080 x 1920, in a generated phone body)
         out/demo-raw.mp4     (780 x 1688, full bleed)
         out/still-*.png      (frames pulled at the strongest moments)

   Everything tunable is in CFG. Nothing below CFG needs reading to retime a
   shot.

   Two things about this site that shaped the script:

   1. Every section is a full viewport tall, and scenes 10, 11 and 12 run to
      1.8, 2.35 and 2.57 screens. Neither the top of a scene nor one page down
      from it frames any of the three shots: scene 11 at its top shows the shower
      with only 75px of the dial, and one page down shows the dial with the
      shower gone. So each shot seats at an intermediate framing computed from
      the elements that have to share the frame.

      These framings were worked out while the page still used scroll snapping,
      which has since been removed. They did not depend on it and still hold; the
      only thing that changed is that there is no longer anything that could pull
      a seated frame off its mark.

   2. Scene 12's arrival narration is the best moment in the clip and it is
      order dependent. "You closed one to get paid. Now everyone." only fires
      because shot 3 retires a Branch before shot 4 arrives at scene 12. Reorder
      the shots and that line silently becomes the generic one. It is checked
      for by name in verify(), so the dependency fails loudly instead.
   --------------------------------------------------------------------------- */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

/* ======================= CFG ======================= */

const CFG = {
  url: 'https://standard-explainer.vercel.app/',

  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  video: { width: 780, height: 1688 },

  touchIndicator: true,      /* the fingertip overlay, injected at capture time */
  phoneFrame: true,          /* composite into a generated phone body */

  maxTakes: 3,               /* a take that fails verification is discarded whole */

  /* Scene 10 accrues at 9 a second against a column worth 900, so a column
     needs 100 seconds to fill and arriving cold makes the vault read as an
     empty box. Its clock only runs while it is on screen, so it cannot be
     banked in the background: it has to be banked by actually sitting there.
     This dwell happens before the first shot, which means it lands entirely
     inside the lead-in that gets trimmed off, and costs the clip nothing. */
  preAccrueMs: 35000,

  /* Milliseconds. The budget lands at roughly 26 to 28 seconds. */
  shot: {
    hook:      { hold: 2400 },
    shower:    { drag: 1400, dialTo: 95, gap: 2000, scald: 1400 },
    branch:    { travel: 1500, settle: 1200, hold: 2200, aftermath: 2400 },
    overhang:  { travelCoarse: 1700, sprint: 700, calm: 500, reveal: 1800,
                 slider: 1800, sliderTo: 0.58, hold: 1600 },
    close:     { hold: 2000 }
  },

  /* Scene 12's reveal arms when its stage passes 40 percent visible and fires
     1.0s later on the scene clock. The sprint has to cover the distance from
     that threshold to the settle point inside that second, or the reveal plays
     off screen mid scroll and the shot is dead. */
  revealDeadlineMs: 1000,

  out: { dir: 'out', raw: 'demo-raw.mp4', framed: 'demo-framed.mp4' },

  frame: {
    canvas: { w: 1080, h: 1920 },
    bezel: 28,
    radius: 74,
    background: '#FBF2E2'     /* --paper, from base.css. Not white, not black. */
  }
};

/* ======================= the fingertip ======================= */

/* Injected with addInitScript so it exists only during capture and never in the
   deployed site. It listens passively and never calls preventDefault, is
   pointer-events none, and is appended to <body> at a fixed position so it
   cannot affect layout or reach a scene. */
const TOUCH_JS = `
(() => {
  const CSS = \`
    #__cap_touch { position:fixed; inset:0; pointer-events:none; z-index:2147483647; }
    #__cap_touch .d, #__cap_touch .t {
      position:absolute; border-radius:50%; transform:translate(-50%,-50%);
      pointer-events:none; will-change:transform,opacity;
    }
    #__cap_touch .d {
      width:44px; height:44px;
      background:rgba(36,30,24,.20);
      box-shadow:0 0 0 2px rgba(36,30,24,.22) inset;
      opacity:0; transition:opacity .18s ease-out, width .12s ease-out, height .12s ease-out, background .12s ease-out;
    }
    #__cap_touch .d.on { opacity:1; }
    #__cap_touch .d.press {
      width:34px; height:34px;
      background:rgba(36,30,24,.42);
      box-shadow:0 0 0 3px rgba(36,30,24,.30) inset;
    }
    /* a press and hold has to visibly intensify, because on scene 10 the hold
       is the whole point of the shot */
    #__cap_touch .d.hold { animation:__capHold 2.2s ease-out forwards; }
    @keyframes __capHold {
      0%   { box-shadow:0 0 0 3px rgba(36,30,24,.30) inset, 0 0 0 0 rgba(36,30,24,.30); }
      100% { box-shadow:0 0 0 3px rgba(36,30,24,.30) inset, 0 0 0 18px rgba(36,30,24,0); }
    }
    #__cap_touch .t { width:14px; height:14px; background:rgba(36,30,24,.22); opacity:.7; }
  \`;
  let root, dot, down = false, hideT = 0, last = null;

  function mount(){
    if(root) return;
    const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    root = document.createElement('div'); root.id = '__cap_touch';
    dot = document.createElement('div'); dot.className = 'd';
    root.appendChild(dot); document.body.appendChild(root);
  }

  function trail(x, y){
    if(!down || !last) return;
    const dx = x - last.x, dy = y - last.y;
    if(dx*dx + dy*dy < 90) return;      /* only while actually travelling */
    const t = document.createElement('div');
    t.className = 't'; t.style.left = x + 'px'; t.style.top = y + 'px';
    root.appendChild(t);
    t.animate([{opacity:.55, transform:'translate(-50%,-50%) scale(1)'},
               {opacity:0,   transform:'translate(-50%,-50%) scale(.4)'}],
              {duration:420, easing:'ease-out'}).onfinish = () => t.remove();
    last = {x, y};
  }

  function move(e){
    mount();
    const x = e.clientX, y = e.clientY;
    dot.style.left = x + 'px'; dot.style.top = y + 'px';
    dot.classList.add('on');
    trail(x, y);
    clearTimeout(hideT);
    /* idle: fade out rather than leave a dot parked on screen */
    if(!down) hideT = setTimeout(() => dot.classList.remove('on'), 900);
  }

  addEventListener('pointermove', move, { passive:true, capture:true });
  addEventListener('pointerdown', e => {
    mount(); down = true; last = { x:e.clientX, y:e.clientY };
    move(e); dot.classList.add('press', 'hold');
  }, { passive:true, capture:true });
  addEventListener('pointerup', () => {
    down = false; last = null;
    dot.classList.remove('press', 'hold');
    clearTimeout(hideT);
    hideT = setTimeout(() => dot.classList.remove('on'), 700);
  }, { passive:true, capture:true });

  if(document.body) mount();
  else addEventListener('DOMContentLoaded', mount);
})();
`;

/* ======================= small helpers ======================= */

const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(...a);

function ffmpegPath(){
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch (e) {
    return require('@ffmpeg-installer/ffmpeg').path;
  }
}

function ff(args){
  execFileSync(ffmpegPath(), args, { stdio: ['ignore', 'ignore', 'pipe'] });
}

/* Where to sit so every named element shares the frame, clear of the narrator
   bar. Element anchored on purpose: the pixel values in the shot list are
   today's, and this recomputes them rather than trusting them. */
async function frameFor(page, ids, topPad, stopBefore){
  return page.evaluate(({ ids, topPad, stopBefore }) => {
    const reserve = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--narrator-h')) || 34;
    const floor = innerHeight - reserve - 8;
    const boxes = ids.map(id => {
      const e = document.getElementById(id);
      if(!e) throw new Error('missing element for framing: ' + id);
      const b = e.getBoundingClientRect();
      return { top: b.top + scrollY, bot: b.bottom + scrollY };
    });
    const top = Math.min(...boxes.map(b => b.top));
    const bot = Math.max(...boxes.map(b => b.bot));
    const slack = Math.max(0, floor - (bot - top));
    /* Bias the slack downwards. Centring looks tidier in the abstract and is
       worse here: it lifts the frame into whatever paragraph sits above the
       stage and puts a sentence with its head cut off at the top of the shot.
       Sitting the stage near the top instead spends the slack on the controls
       and readouts underneath, which is what the shot is about. */
    const pad = Math.min(topPad == null ? 24 : topPad, slack);
    let y = top - pad;

    /* Whatever the leftover slack is spent on, it must not be the top half of
       the next card clipped off by the narrator bar, which reads as a rendering
       fault rather than as a page. stopBefore names the block that has to stay
       out of frame entirely, and the frame is pulled up until it does. What
       shows above instead is a couple of lines of the paragraph the reader
       scrolled past, which is just what a scrolled page looks like. */
    if(stopBefore){
      const hit = document.querySelector(stopBefore);
      /* resolve to the whole card, so naming anything inside it works and
         nth-of-type counting mistakes are impossible */
      const st = hit && (hit.closest('.card') || hit);
      if(st){
        const hide = st.getBoundingClientRect().top + scrollY - floor;
        if(hide < y) y = hide;
      }
    }
    y = Math.min(y, top - 4);
    return { y: Math.round(y), span: Math.round(bot - top), floor: Math.round(floor) };
  }, { ids, topPad, stopBefore });
}

/* Eased, in page, so it looks hand driven and does not re-engage snapping. */
async function glideTo(page, y, ms){
  await page.evaluate(({ y, ms }) => new Promise(done => {
    const from = scrollY, delta = y - from, t0 = performance.now();
    const ease = t => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2);
    (function step(){
      const t = Math.min(1, (performance.now() - t0) / ms);
      scrollTo(0, from + delta * ease(t));
      if(t < 1) requestAnimationFrame(step); else done();
    })();
  }), { y, ms });
}

async function centreOf(page, id){
  return page.evaluate(id => {
    const b = document.getElementById(id).getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height,
             left: b.left, top: b.top };
  }, id);
}

/* A human drag: many small eased steps, never one jump. */
async function dragPath(page, points, ms){
  if(!points.length) return;
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  const per = ms / points.length;
  for(const p of points.slice(1)){
    await page.mouse.move(p.x, p.y);
    await sleep(per);
  }
  await page.mouse.up();
}

/* ======================= the dial ======================= */

/* Scene 11's dial is its own svg, viewBox 0 0 200 200, centre 100,100, grip
   orbiting at r 66. The track arc encodes where dial 0 and dial 100 sit, so the
   sweep is read out of the page rather than guessed at. */
async function dialGeometry(page){
  return page.evaluate(() => {
    const svg = document.getElementById('s11-dial');
    const d = document.getElementById('s11-track').getAttribute('d');
    const n = (d.match(/-?[\d.]+/g) || []).map(Number);
    if(n.length < 9) throw new Error('could not read the dial track arc');
    const [x0, y0] = [n[0], n[1]];
    const sweepFlag = n[6];
    const [x1, y1] = [n[7], n[8]];
    const a0 = Math.atan2(y0 - 100, x0 - 100);
    const a1 = Math.atan2(y1 - 100, x1 - 100);
    let delta = a1 - a0;
    /* walk the way the arc was actually drawn */
    if(sweepFlag === 1){ while(delta <= 0) delta += Math.PI * 2; }
    else { while(delta >= 0) delta -= Math.PI * 2; }
    const m = svg.getScreenCTM();
    return { a0, delta, r: 66,
             ctm: { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f } };
  });
}

function dialPoint(geo, v){
  const a = geo.a0 + geo.delta * (v / 100);
  const ux = 100 + geo.r * Math.cos(a);
  const uy = 100 + geo.r * Math.sin(a);
  const m = geo.ctm;
  return { x: ux * m.a + uy * m.c + m.e, y: ux * m.b + uy * m.d + m.f };
}

/* ======================= the shots ======================= */

async function runShots(page, marks){
  const S = CFG.shot;
  const at = name => marks.push({ name, t: Date.now() });

  /* ---- shot 1, hook. Already seated. Water is falling, so the first frame
     moves; no masthead is ever on screen. ---- */
  at('hook');
  await sleep(S.hook.hold);

  /* ---- shot 2, the shower ---- */
  at('shower-drag');
  const geo = await dialGeometry(page);
  const steps = 26;
  const pts = [];
  for(let i = 0; i <= steps; i++){
    const t = i / steps;
    const eased = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
    pts.push(dialPoint(geo, eased * S.shower.dialTo));
  }
  await dragPath(page, pts, S.shower.drag);

  at('shower-gap');
  await sleep(S.shower.gap);          /* the two chips diverge, nothing arrives */

  at('shower-scald');
  await sleep(S.shower.scald);        /* the flash and the caption */

  /* ---- shot 3, breaking a Branch. Scene advance upward, not a scroll. ---- */
  at('to-branch');
  const vault = await frameFor(page, ['s10-stage', 's10-branches', 's10-hint'],
                               24, '#scene-10 .lesson');
  await glideTo(page, vault.y, S.branch.travel);
  await sleep(S.branch.settle);

  at('branch-hold');
  const branch = await page.evaluate(() => {
    const b = document.querySelectorAll('#s10-branches button, #s10-branches [role="button"]');
    const el = b[1] || b[0];
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(branch.x, branch.y);
  await page.mouse.down();
  await sleep(S.branch.hold);         /* the crack spreads */
  await page.mouse.up();

  at('branch-aftermath');
  await sleep(S.branch.aftermath);    /* tokens in the wallet, that column dead */

  /* ---- shot 4, the overhang. Two legs: a transit past scene 11, then a
     sprint that has to beat the reveal. ---- */
  at('to-overhang');
  /* stop before the price chart card, so the exit window card ends the frame */
  const over = await frameFor(page, ['s12-stage', 's12-exit'],
                              24, '#s12-chart');
  const armY = await page.evaluate(() => {
    const b = document.getElementById('s12-stage').getBoundingClientRect();
    return Math.round(b.top + scrollY + b.height * 0.4 - innerHeight);
  });
  await glideTo(page, armY, S.overhang.travelCoarse);
  const sprintStart = Date.now();
  await glideTo(page, over.y, S.overhang.sprint);
  const sprintMs = Date.now() - sprintStart;

  at('overhang-calm');
  await sleep(S.overhang.calm);

  at('overhang-reveal');
  await sleep(S.overhang.reveal);

  at('overhang-slider');
  const ex = await centreOf(page, 's12-exit');
  const x0 = ex.left + 10, x1 = ex.left + ex.w * S.overhang.sliderTo;
  const sp = [];
  for(let i = 0; i <= 22; i++){
    const t = i / 22;
    const eased = 1 - Math.pow(1 - t, 3);
    sp.push({ x: x0 + (x1 - x0) * eased, y: ex.y });
  }
  await dragPath(page, sp, S.overhang.slider);
  await sleep(S.overhang.hold);

  /* ---- shot 5, close ---- */
  at('close');
  await sleep(S.close.hold);

  return { sprintMs };
}

/* ======================= verification ======================= */

async function readState(page){
  return page.evaluate(() => {
    const txt = id => { const e = document.getElementById(id); return e ? e.textContent.trim() : null; };
    const attr = (id, a) => { const e = document.getElementById(id); return e ? e.getAttribute(a) : null; };
    const nl = document.querySelector('.narrator-line');
    return {
      scald: parseInt(txt('s11-sScald') || '0', 10),
      gone: parseInt(txt('s10-sGone') || '0', 10),
      water: parseFloat(attr('s12-water', 'opacity') || '1'),
      counted: txt('s12-rCounted'),
      claims: txt('s12-rClaims'),
      exit: parseFloat((document.getElementById('s12-exit') || {}).value || '0'),
      narrator: nl ? nl.textContent.trim() : null,
      trace: (window.__nt || []).map(x => x.line)
    };
  });
}

const CONNECTIVE = 'You closed one to get paid. Now everyone.';
/* the fallback that appears instead if shot 3 no longer precedes shot 4 */
const GENERIC = 'What scene 10 cost one Banker, now at scale.';

function verify(before, after, sprintMs){
  const checks = [
    { name: 'scene 11 scald fired',
      ok: after.scald > before.scald,
      got: before.scald + ' -> ' + after.scald },

    { name: 'scene 10 Branch reached its broken state',
      ok: after.gone > before.gone,
      got: before.gone + ' -> ' + after.gone },

    { name: 'scene 12 reveal played',
      ok: after.water < 0.5,
      got: 'water opacity ' + after.water },

    { name: 'at least one claim converted to circulating',
      ok: after.exit > 0 && after.counted !== before.counted,
      got: 'exit ' + after.exit + '%, counted ' + before.counted + ' -> ' + after.counted },

    /* The moment worth protecting. This line only exists because shot 3 retires
       a Branch before shot 4 arrives at scene 12. If the shots are ever
       reordered the narrator quietly falls back to the generic arrival line and
       the best beat in the clip disappears with no other symptom.

       Checked against the trace rather than the final line, because by the end
       of the take the narrator has rightly moved on to the slider line. */
    { name: 'scene 12 arrival narration is the order dependent one',
      ok: (after.trace || []).includes(CONNECTIVE),
      got: (after.trace || []).includes(CONNECTIVE)
             ? 'said on arrival'
             : 'never said. trace: ' + JSON.stringify(after.trace) },

    { name: 'the generic scene 12 arrival line was NOT used',
      ok: !(after.trace || []).includes(GENERIC),
      got: (after.trace || []).includes(GENERIC) ? 'generic line appeared' : 'absent, as intended' },

    { name: 'the sprint into scene 12 beat the reveal deadline',
      ok: sprintMs < CFG.revealDeadlineMs,
      got: sprintMs + 'ms of ' + CFG.revealDeadlineMs + 'ms' }
  ];
  return checks;
}

/* ======================= the phone body ======================= */

/* Drawn here and screenshotted, so nothing is downloaded and there is no
   licensing question about a device mockup. One png with alpha: the flat
   background and the phone body everywhere, transparent only where the screen
   goes, so the video shows through with rounded corners. */
async function buildFrame(browser, screen){
  const f = CFG.frame;
  const page = await browser.newPage({
    viewport: { width: f.canvas.w, height: f.canvas.h },
    deviceScaleFactor: 1
  });

  const bodyW = screen.w + f.bezel * 2;
  const bodyH = screen.h + f.bezel * 2;
  const bodyX = Math.round((f.canvas.w - bodyW) / 2);
  const bodyY = Math.round((f.canvas.h - bodyH) / 2);
  const scrX = bodyX + f.bezel;
  const scrY = bodyY + f.bezel;
  const scrR = Math.max(8, f.radius - f.bezel + 6);

  /* An SVG mask, not a CSS mask. The CSS approach punches the hole at the
     content box, which is a rectangle with square corners, and square screen
     corners inside a rounded body look broken. A mask lets the hole carry its
     own radius. omitBackground makes the masked area genuinely transparent in
     the png, so the video shows through it and nothing else. */
  await page.setContent(`<!doctype html><style>
    html,body{margin:0;background:transparent;width:${f.canvas.w}px;height:${f.canvas.h}px;overflow:hidden}
    svg{display:block}
  </style>
  <svg width="${f.canvas.w}" height="${f.canvas.h}" viewBox="0 0 ${f.canvas.w} ${f.canvas.h}"
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <mask id="hole" maskUnits="userSpaceOnUse">
        <rect width="${f.canvas.w}" height="${f.canvas.h}" fill="#fff"/>
        <rect x="${scrX}" y="${scrY}" width="${screen.w}" height="${screen.h}"
              rx="${scrR}" fill="#000"/>
      </mask>
      <filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#241E18" flood-opacity="0.26"/>
        <feDropShadow dx="0" dy="4"  stdDeviation="7"  flood-color="#241E18" flood-opacity="0.18"/>
      </filter>
    </defs>
    <g mask="url(#hole)">
      <rect width="${f.canvas.w}" height="${f.canvas.h}" fill="${f.background}"/>
      <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${f.radius}"
            fill="#241E18" filter="url(#soft)"/>
      <rect x="${scrX - 1.5}" y="${scrY - 1.5}" width="${screen.w + 3}" height="${screen.h + 3}"
            rx="${scrR + 1.5}" fill="none" stroke="#FFF8E9" stroke-opacity="0.12" stroke-width="3"/>
    </g>
  </svg>`);

  const out = path.join(CFG.out.dir, 'phone-frame.png');
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
  return { png: out, screenX: scrX, screenY: scrY };
}

/* ======================= main ======================= */

async function take(browser, n){
  const dir = path.join(CFG.out.dir, 'raw-' + n);
  fs.mkdirSync(dir, { recursive: true });

  const ctxT0 = Date.now();          /* recording starts about here */
  const ctx = await browser.newContext({
    viewport: CFG.viewport,
    deviceScaleFactor: CFG.deviceScaleFactor,
    isMobile: false,
    recordVideo: { dir, size: CFG.viewport },   /* native; upscaled by ffmpeg */
    reducedMotion: 'no-preference'
  });
  if(CFG.touchIndicator) await ctx.addInitScript(TOUCH_JS);

  const page = await ctx.newPage();
  await page.goto(CFG.url, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.SceneLoop && !!document.querySelector('.narrator'));

  /* Sit on scene 10 first so its columns have something in them by the time
     shot 3 arrives. All of this is inside the trimmed lead-in. */
  if(CFG.preAccrueMs > 0){
    const v = await frameFor(page, ['s10-stage', 's10-branches', 's10-hint'],
                             24, '#scene-10 .lesson');
    await page.evaluate(y => scrollTo(0, y), v.y);
    await sleep(CFG.preAccrueMs);
  }

  /* Seat on the shower before a single frame is recorded that could show a
     masthead. Two passes, because the first scroll changes what is laid out. */
  const ids = ['s11-stage', 's11-bather', 's11-track'];
  let f = await frameFor(page, ids);
  await page.evaluate(y => scrollTo(0, y), f.y);
  await sleep(350);
  f = await frameFor(page, ids);
  await page.evaluate(y => scrollTo(0, y), f.y);
  await sleep(700);

  /* Every line the narrator says during the take, in order. The arrival line
     cannot be checked at the end of the run: by then the narrator has correctly
     moved on to scene 12's slider line, which is exactly what the first three
     takes reported. Trace it instead. */
  await page.evaluate(() => {
    window.__nt = [];
    const el = document.querySelector('.narrator-line');
    const push = () => {
      const t = (el.textContent || '').trim();
      if(!t) return;
      const last = window.__nt[window.__nt.length - 1];
      if(!last || last.line !== t) window.__nt.push({ line: t, at: Math.round(performance.now()) });
    };
    push();
    new MutationObserver(push).observe(el, { childList: true, characterData: true, subtree: true });
  });

  const before = await readState(page);
  const marks = [];
  const t0 = Date.now();
  const { sprintMs } = await runShots(page, marks);
  const after = await readState(page);
  const durationMs = Date.now() - t0;

  await page.close();
  await ctx.close();

  const webm = fs.readdirSync(dir).filter(x => x.endsWith('.webm')).map(x => path.join(dir, x))[0];
  const checks = verify(before, after, sprintMs);
  /* Everything before the first shot is page load, seating and settling, and
     it is all in the recording. Measured, not guessed at, so the clip opens on
     the shower and never on a masthead. */
  return { webm, checks, marks, t0, durationMs, dir, trace: after.trace,
           leadInMs: t0 - ctxT0 };
}

(async () => {
  fs.mkdirSync(CFG.out.dir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });

  let good = null;
  for(let n = 1; n <= CFG.maxTakes && !good; n++){
    log('\n=== take ' + n + ' ===');
    const r = await take(browser, n);
    for(const c of r.checks) log((c.ok ? '  pass  ' : '  FAIL  ') + c.name + '   [' + c.got + ']');
    log('  duration ' + (r.durationMs / 1000).toFixed(1) + 's');
    if(r.checks.every(c => c.ok)){
      good = r;
      log('  narration in order: ' + JSON.stringify(r.trace, null, 0));
    }
    else log('  discarding this take whole rather than shipping a broken clip');
  }

  if(!good){
    log('\nno take passed every check. nothing written.');
    await browser.close();
    process.exit(1);
  }

  const lead = (good.leadInMs / 1000).toFixed(3);
  const dur  = (good.durationMs / 1000).toFixed(3);
  log('\ntrimming ' + lead + 's of load and seating, keeping ' + dur + 's');

  /* raw, full bleed. -ss after -i so the seek is frame accurate rather than
     landing on whichever keyframe is nearest. */
  const raw = path.join(CFG.out.dir, CFG.out.raw);
  ff(['-y', '-i', good.webm, '-ss', lead, '-t', dur,
      '-vf', 'scale=' + CFG.video.width + ':' + CFG.video.height + ':flags=lanczos',
      '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', raw]);
  log('\nwrote ' + raw);

  /* framed */
  if(CFG.phoneFrame){
    const scr = { w: CFG.video.width, h: CFG.video.height };
    const fr = await buildFrame(browser, scr);
    const framed = path.join(CFG.out.dir, CFG.out.framed);
    ff(['-y', '-i', raw, '-i', fr.png,
        '-filter_complex',
        `color=c=black:s=${CFG.frame.canvas.w}x${CFG.frame.canvas.h}[bg];` +
        `[bg][0:v]overlay=${fr.screenX}:${fr.screenY}:shortest=1[t];` +
        `[t][1:v]overlay=0:0:eof_action=repeat[v]`,
        '-map', '[v]', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', framed]);
    log('wrote ' + framed);
  }

  /* stills at the strongest moments */
  const want = ['shower-scald', 'branch-aftermath', 'overhang-reveal', 'overhang-slider'];
  const src = CFG.phoneFrame ? path.join(CFG.out.dir, CFG.out.framed) : raw;
  for(const name of want){
    const m = good.marks.find(x => x.name === name);
    if(!m) continue;
    const at = Math.max(0.1, (m.t - good.t0) / 1000 + 0.9);
    const png = path.join(CFG.out.dir, 'still-' + name + '.png');
    ff(['-y', '-ss', at.toFixed(2), '-i', src, '-frames:v', '1', png]);
    log('wrote ' + png + '  (t=' + at.toFixed(2) + 's)');
  }

  const sz = f => (fs.statSync(f).size / 1048576).toFixed(2) + ' MB';
  log('\nraw    ' + sz(raw));
  if(CFG.phoneFrame) log('framed ' + sz(path.join(CFG.out.dir, CFG.out.framed)));
  log('all checks passed on take that was kept.');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
