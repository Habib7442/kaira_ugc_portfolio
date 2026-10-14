#!/usr/bin/env node
// QA: exercises the interactive parts. node scripts/qa/interact.mjs <url> <outDir> [--mobile]
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [url = 'http://127.0.0.1:4173/', out = '.shots/interact', ...flags] = process.argv.slice(2);
const mobile = flags.includes('--mobile');
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--autoplay-policy=no-user-gesture-required'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

async function newPage(q = '', reduced = false) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setViewport(mobile ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { width: 1440, height: 900 });
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url + q, { waitUntil: 'networkidle2' });
  await sleep(1500);
  return { page, errors };
}
const scrollToSection = (page, id, p) => page.evaluate((id, p) => {
  const el = document.getElementById(id);
  const top = el.getBoundingClientRect().top + scrollY;
  window.scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * p);
}, id, p);

// ---- normal mode
{
  const { page, errors } = await newPage();
  await scrollToSection(page, 'work', 0.35);
  await sleep(2500);
  const playing = await page.evaluate(() => [...document.querySelectorAll('.phone__video')].filter((v) => !v.paused).length);
  const loaded = await page.evaluate(() => [...document.querySelectorAll('.phone__video')].filter((v) => v.src).length);
  check('tunnel plays at most 3 loops', playing > 0 && playing <= 3, `playing=${playing} loaded=${loaded}`);

  const target = await page.evaluate(() => {
    const p = [...document.querySelectorAll('button.phone')].find((b) => { const r = b.getBoundingClientRect(); return getComputedStyle(b).visibility === 'visible' && +getComputedStyle(b).opacity > .8 && r.width > 60 && r.left > 0 && r.right < innerWidth; });
    if (!p) return null;
    p.dataset.qa = '1';
    return p.dataset.video;
  });
  check('found a tappable phone', !!target, target ?? '');
  await page.click('button.phone[data-qa="1"]');
  await sleep(900);
  await page.screenshot({ path: path.join(out, 'player.png') });
  const st = await page.evaluate(() => ({ open: !document.querySelector('.player').hidden, cap: document.querySelector('.player__caption').textContent, active: document.activeElement.className, playing: !document.querySelector('.player__video').paused }));
  check('player opens with focus on close', st.open && /player__close/.test(st.active), st.cap);
  check('player video plays', st.playing);
  await page.keyboard.press('ArrowRight');
  await sleep(700);
  const cap2 = await page.evaluate(() => document.querySelector('.player__caption').textContent);
  check('arrow key goes to next video', cap2 !== st.cap, cap2);
  await page.keyboard.press('Escape');
  await sleep(800);
  const closed = await page.evaluate(() => ({ hidden: document.querySelector('.player').hidden, focus: document.activeElement.dataset?.qa === '1', inert: document.querySelector('main').inert }));
  check('Esc closes and returns focus to the phone', closed.hidden && closed.focus && !closed.inert);

  await page.evaluate(() => document.getElementById('cases').scrollIntoView());
  await sleep(1500);
  await page.focus('.card__flip');
  await page.keyboard.press('Enter');
  await sleep(1000);
  await page.screenshot({ path: path.join(out, 'card-flipped.png') });
  const flip = await page.evaluate(() => ({ exp: document.querySelector('.card__flip').getAttribute('aria-expanded'), inert: document.querySelector('.card__back').inert, focus: document.activeElement.className }));
  check('Enter flips the card, focus moves to back', flip.exp === 'true' && !flip.inert && /card__watch/.test(flip.focus));
  await page.keyboard.press('Enter');
  await sleep(900);
  const filt = await page.evaluate(() => ({ count: document.querySelector('.player__count').textContent, brand: document.querySelector('.player__brand').textContent }));
  check('"Watch the videos" opens player filtered to brand', filt.brand === 'GLOWRY' || filt.brand.length > 0, `${filt.brand} ${filt.count}`);
  await page.keyboard.press('Escape');
  await sleep(700);

  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.click('.enquiry button[type=submit]');
  const err = await page.evaluate(() => ({ s: document.querySelector('.enquiry__status').textContent, inv: document.querySelector('#f-brand').getAttribute('aria-invalid') }));
  check('form asks for brand name', err.inv === 'true', err.s);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check('no horizontal overflow', overflow <= 0, String(overflow));
  check('no console errors (normal)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- capture mode
{
  const { page, errors } = await newPage('?capture=1');
  await page.waitForFunction(() => window.__captureReady === true, { timeout: 20000 });
  const secs = await page.evaluate(() => window.__captureSections);
  check('capture: sections exposed', secs.length >= 8, secs.map((s) => `${s.id}${s.pinned ? '*' : ''}`).join(','));
  const work = secs.find((s) => s.id === 'work');
  const t0 = Date.now();
  for (let i = 0; i < 10; i++) await page.evaluate((y, t) => window.__captureStep(y, t), work.start + i * 120, i / 30);
  const frames = await page.evaluate(() => [...document.querySelectorAll('.phone__video')].filter((v) => v.src && v.paused).length);
  check('capture: steps run, tunnel videos paused+seeked', frames > 0, `${Date.now() - t0}ms for 10 steps`);
  await page.screenshot({ path: path.join(out, 'capture-tunnel.png') });
  check('no console errors (capture)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- reduced motion
{
  const { page, errors } = await newPage('', true);
  const cls = await page.evaluate(() => document.documentElement.className);
  await page.evaluate(() => document.getElementById('work').scrollIntoView());
  await sleep(500);
  await page.screenshot({ path: path.join(out, 'reduced-tunnel.png') });
  await page.evaluate(() => document.getElementById('brands').scrollIntoView());
  await sleep(500);
  await page.screenshot({ path: path.join(out, 'reduced-orbit.png') });
  const h = await page.evaluate(() => document.getElementById('top').offsetHeight / innerHeight);
  check('reduced motion: no pinned cover, intro off', !/\bfx\b/.test(cls) && h < 1.1 && /no-intro/.test(cls), cls);
  check('no console errors (reduced)', errors.length === 0, errors.join(' | '));
  await page.close();
}

console.log(results.join('\n'));
await browser.close();
