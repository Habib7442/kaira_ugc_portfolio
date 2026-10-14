# Recording the showcase reel

Open the site with `?capture=1`. In this mode:

- Lenis is off. GSAP's ticker no longer drives time (`gsap.updateRoot` is removed and `lagSmoothing(0)` is set), so **time only moves when you call `__captureStep`**.
- Every scroll animation uses `scrub: true`, so a given scroll position always renders the same frame.
- CSS transitions and animations are disabled. The opening is skipped.
- The tunnel's videos never play. They're paused and **seeked to the frame time**, and each step waits for the `seeked` event.
- All images load eagerly before `__captureReady` turns true.

## API (on `window`)

| | |
|---|---|
| `__captureReady` | `true` once fonts, images and scroll measurements are ready |
| `__captureSections` | `[{ id, start, end, pinned }]`: scroll positions (px) of each section. `pinned` sections have a sticky stage between `start` and `end - innerHeight`. |
| `__captureStep(scrollY, t)` | Scrolls to `scrollY`, renders GSAP at time `t` (seconds), seeks visible videos to `t`, then waits a few frames for the compositor (4 by default; set `?settle=N` to change it). Returns a Promise. |

## Puppeteer sketch

```js
// 390×693 CSS px at 2.77× = a 1080×1920 vertical video using the mobile layout
const H = 693;
await page.setViewport({ width: 390, height: H, deviceScaleFactor: 2.77, isMobile: true, hasTouch: true });
await page.goto('https://your-site/?capture=1', { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__captureReady === true);
const sections = await page.evaluate(() => window.__captureSections);

const fps = 30;
const shots = [
  // [sectionId, seconds] — scroll through each pinned section at its own pace
  ['top', 3], ['work', 7], ['brands', 4], ['cases', 3],
];
let frame = 0;
for (const [id, secs] of shots) {
  const s = sections.find((x) => x.id === id);
  const from = s.start, to = s.pinned ? s.end - H : s.end - H / 2;
  const n = Math.round(secs * fps);
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const ease = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2; // easeInOutQuad
    await page.evaluate((y, t) => window.__captureStep(y, t), Math.round(from + (to - from) * ease), frame / fps);
    await page.screenshot({ path: `frames/${String(frame++).padStart(5, '0')}.png` });
  }
}
```

Feed `frames/` into Remotion (or `ffmpeg -framerate 30 -i frames/%05d.png -pix_fmt yuv420p reel.mp4`).

Tips:
- To show a card flipping, click `.card__flip` with `page.click` between steps. The flip is a GSAP tween, so it advances with `t`.
- **Only move `t` forward.** Effects that start when a section scrolls in (counters, sticker pops, the polaroid developing) begin at the `t` of that moment. Re-record from the top instead of stepping back.
- Keep `t` increasing steadily even while the scroll position holds still, so loops and the rotating badge keep moving.
- The layout switches at 768 CSS px: use the 390-wide viewport above for vertical reels and `{ width: 1920, height: 1080, deviceScaleFactor: 1 }` for the desktop version.

Check that recordings are repeatable: `node scripts/qa/capture-check.mjs http://localhost:4173/?capture=1` records the same sequence twice and compares the frames.
