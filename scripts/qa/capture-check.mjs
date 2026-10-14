// QA: two separate recordings of the same (scrollY, t) sequence must give the same frames.
// node scripts/qa/capture-check.mjs [url]
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const url = process.argv[2] || 'http://127.0.0.1:4174/?capture=1';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });

async function record() {
  const p = await browser.newPage();
  await p.setViewport({ width: 390, height: 693, deviceScaleFactor: 2.77, isMobile: true, hasTouch: true });
  await p.goto(url, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => window.__captureReady === true, { timeout: 30000 });
  const secs = await p.evaluate(() => window.__captureSections);
  const frames = [];
  let t = 0;
  for (const id of ['top', 'work', 'brands', 'cases']) {
    const s = secs.find((x) => x.id === id);
    for (const f of [0.2, 0.5, 0.8]) {
      t += 0.5;
      const y = Math.round(s.start + Math.max(0, s.end - s.start - 693) * f);
      await p.evaluate((y, t) => window.__captureStep(y, t), y, t);
      frames.push({ id: `${id}@${f}`, buf: await p.screenshot() });
    }
  }
  await p.close();
  return frames;
}

const diff = async (a, b) => {
  const [x, y] = await Promise.all([a, b].map((buf) => sharp(buf).greyscale().raw().toBuffer()));
  let big = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 24) big++;
  return (100 * big) / x.length;
};

const [A, B] = [await record(), await record()];
let ok = true;
for (let i = 0; i < A.length; i++) {
  const pct = await diff(A[i].buf, B[i].buf);
  const pass = pct < 0.05;
  ok &&= pass;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${A[i].id.padEnd(12)} ${pct.toFixed(3)}% pixels differ`);
}
await browser.close();
process.exitCode = ok ? 0 : 1;
