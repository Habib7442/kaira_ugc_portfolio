#!/usr/bin/env node
// npm run media-kit — makes a one-page A4 media kit PDF from creator.json (needs Chrome or Edge).
// Output: public/media-kit.pdf (set contact.mediaKitUrl to "/media-kit.pdf"), or skip this
// and point mediaKitUrl at the creator's own PDF.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const c = JSON.parse(fs.readFileSync(path.resolve(ROOT, process.env.CREATOR || 'src/content/creator.json'), 'utf8'));
const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/media.json'), 'utf8'));
const CHROMES = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const chrome = CHROMES.find((p) => fs.existsSync(p));
if (!chrome) { console.error('Chrome/Edge not found. Set CHROME=/path/to/chrome'); process.exit(1); }

const t = { ink: '#13142A', paper: '#F1F2F7', lime: '#D6FF3D', lavender: '#B8A6FF', ...(c.theme || {}) };
const esc = (s) => String(s).replace(/[&<>"]/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[x]);
const file = (p) => pathToFileURL(path.join(ROOT, 'public', p)).href;
const fmt = (n) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const cut = m[c.photos.orbitCutout].webp[0].src;
const thumbs = c.videos.slice(0, 6).map((v) => m[v.src].posterSm);
const font = (f) => file(`/fonts/${f}`);
const stats = [['Followers', c.stats.followers], ['Avg. views', c.stats.avgViews], ['Brands', c.stats.brands]].filter(([, v]) => v != null);
const price = (p) => (c.showPrices && p != null ? `from ${c.currency ?? '₹'}${new Intl.NumberFormat('en-IN').format(p)}` : 'Rates on request');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:BSD;font-weight:900;src:url(${font('big-shoulders-display-latin-900-normal.woff2')})}
@font-face{font-family:IS;font-style:italic;src:url(${font('instrument-serif-latin-400-italic.woff2')})}
@font-face{font-family:Inter;font-weight:100 900;src:url(${font('inter-latin-wght-normal.woff2')})}
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{width:210mm;height:297mm;font:10.5pt/1.45 Inter,sans-serif;color:${t.ink};background:${t.paper};padding:14mm;display:grid;grid-template-rows:auto auto auto 1fr auto;gap:8mm}
h1{font:900 64pt/.82 BSD;text-transform:uppercase}h2{font:900 18pt/1 BSD;text-transform:uppercase;margin-bottom:3mm}
.top{display:grid;grid-template-columns:1fr 62mm;gap:8mm;align-items:end}.serif{font:italic 17pt/1.15 IS}
.hero{position:relative;height:72mm;border-radius:8mm;background:${t.lime};overflow:hidden}.hero img{position:absolute;bottom:0;left:50%;height:100%;transform:translateX(-50%)}
.tag{display:inline-block;padding:1mm 3mm;border:1px solid ${t.ink};border-radius:10mm;background:${t.lime};font-weight:700;font-size:8.5pt;margin:0 1.5mm 1.5mm 0}
.stats{display:flex;gap:10mm}.stats b{display:block;font:900 30pt/1 BSD}.demo{font-size:7.5pt;opacity:.7}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8mm}.thumbs{display:grid;grid-template-columns:repeat(6,1fr);gap:2.5mm}.thumbs img{width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:3mm}
ul{list-style:none}li{padding:1.4mm 0;border-bottom:1px dashed rgba(19,20,42,.3);display:flex;justify-content:space-between;gap:4mm}
.foot{display:flex;justify-content:space-between;align-items:end;border-top:1.5px solid ${t.ink};padding-top:4mm}.foot b{font:900 16pt BSD}
</style></head><body>
<div class="top"><div><p class="serif">UGC creator · ${esc(c.location)}</p><h1>${esc(c.name)}</h1><p style="margin-top:4mm;max-width:105mm">${esc(c.tagline)}</p>
<p style="margin-top:4mm">${c.niches.map((n) => `<span class="tag">${esc(n)}</span>`).join('')}</p></div>
<div class="hero"><img src="${file(cut)}"></div></div>
<div><div class="stats">${stats.map(([l, v]) => `<div><b>${fmt(v)}</b>${l}</div>`).join('')}</div>${c.stats.demo ? '<p class="demo">Demo figures</p>' : ''}</div>
<div class="thumbs">${thumbs.map((s) => `<img src="${file(s)}">`).join('')}</div>
<div class="grid"><div><h2>Services</h2><ul>${c.services.map((s) => `<li><span>${esc(s.name)}</span><span>${esc(price(s.fromPrice))}</span></li>`).join('')}</ul></div>
<div><h2>Brands</h2><p>${c.brands.map((b) => esc(b.name)).join(' · ')}</p><h2 style="margin-top:6mm">Details</h2><p>Languages: ${esc(c.languages.join(', '))}<br>Turnaround: ${esc(c.turnaround)}</p></div></div>
<div class="foot"><div><b>${esc(c.contact.email)}</b><br>${c.contact.instagram ? '@' + esc(c.contact.instagram) : ''}</div>${c.demo ? '<p class="demo" style="max-width:80mm;text-align:right">Concept demo. The creator, brands and figures are fictional.</p>' : ''}</div>
</body></html>`;

const tmp = path.join(ROOT, '.assets-debug', 'media-kit.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, html);
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const out = path.join(ROOT, 'public', 'media-kit.pdf');
await page.pdf({ path: out, format: 'A4', printBackground: true });
await browser.close();
console.log(`✓ ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
