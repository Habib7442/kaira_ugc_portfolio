#!/usr/bin/env node
// Runs after `vite build`: prints what the first screen downloads (compressed, as sent over the wire).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BUDGET = 450 * 1024;
if (!fs.existsSync(DIST)) { console.error('No dist/ folder. Run "npm run build" first.'); process.exit(1); }

const kb = (b) => `${(b / 1024).toFixed(1)} KB`.padStart(9);
const br = (file) => zlib.brotliCompressSync(fs.readFileSync(file)).length;
const raw = (file) => fs.statSync(file).size;

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const local = (u) => path.join(DIST, u.replace(/^\//, ''));
const css = [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
const js = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
// Fonts needed above the fold: display (cover name), serif italic (tagline), Inter (UI).
const fonts = ['/fonts/big-shoulders-display-latin-900-normal.woff2', '/fonts/instrument-serif-latin-400-italic.woff2', '/fonts/inter-latin-wght-normal.woff2'];
// Cover cut-outs from the preload hints (largest candidate = worst case on a 3× phone).
const preloads = [...html.matchAll(/imagesrcset="([^"]+)"[^>]*media="([^"]+)"/g)].map((m) => ({ media: m[2], files: m[1].split(',').map((s) => s.trim().split(' ')[0]) }));

const rows = [
  ['index.html', br(path.join(DIST, 'index.html'))],
  ...css.map((f) => [f, br(local(f))]),
  ...js.map((f) => [f, br(local(f))]),
  ...fonts.map((f) => [f, raw(local(f))]),
];
const base = rows.reduce((s, [, b]) => s + b, 0);
console.log('\nFirst screen (brotli for text, raw for fonts/images)');
rows.forEach(([f, b]) => console.log(`${kb(b)}  ${f}`));
let worst = 0;
for (const p of preloads) {
  const sizes = p.files.map((f) => raw(local(f)));
  const max = Math.max(...sizes);
  worst = Math.max(worst, max);
  console.log(`${kb(Math.min(...sizes))}–${kb(max).trim()}  cover cut-out ${p.media}`);
}
const total = base + worst;
console.log(`${kb(total)}  TOTAL (worst case)   budget ${kb(BUDGET).trim()}  ${total <= BUDGET ? '✓ under budget' : '✗ OVER BUDGET'}\n`);
if (total > BUDGET) process.exitCode = 1;
