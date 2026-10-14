#!/usr/bin/env node
// QA helper: screenshots the running site at several scroll positions.
// node scripts/shots.mjs <url> <width>x<height> <outDir> [y1,y2,...|sections] [--mobile]
// Positions can be pixels, "s:<section-id>:<0..1>" (progress through a section), or "max".
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [url = 'http://localhost:4173/', size = '1440x900', out = '.shots', list = '0', ...flags] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const mobile = flags.includes('--mobile');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
await page.setViewport({ width, height, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
if (mobile) await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 Instagram 350.0.0.0');
await page.goto(url, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1600));

const resolveY = (spec) => page.evaluate((spec) => {
  if (spec === 'max') return document.documentElement.scrollHeight - innerHeight;
  if (spec.startsWith('s:')) {
    const [, id, p] = spec.split(':');
    const el = document.getElementById(id);
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + scrollY;
    const span = Math.max(0, el.offsetHeight - innerHeight);
    return Math.round(top + span * Number(p));
  }
  return Number(spec);
}, spec);

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
for (const [i, spec] of list.split(',').entries()) {
  const y = await resolveY(spec);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 1300));
  const file = path.join(out, `${String(i).padStart(2, '0')}-${spec.replace(/[:]/g, '_')}.png`);
  await page.screenshot({ path: file });
  console.log(file, 'y=', y);
}
console.log('horizontal overflow px:', overflow);
console.log(logs.length ? logs.join('\n') : 'no console errors');
await browser.close();
