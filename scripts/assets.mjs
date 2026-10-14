#!/usr/bin/env node
// npm run assets [-- --force]
// Turns everything in raw/ into web-ready media in public/media/ and writes src/content/media.json.
// Files are only rebuilt when the raw file is newer than the output (use --force to rebuild all).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'raw');
const OUT = path.join(ROOT, 'public', 'media');
const DEBUG = path.join(ROOT, '.assets-debug');
const MANIFEST = path.join(ROOT, 'src', 'content', 'media.json');
const FORCE = process.argv.includes('--force');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const IMAGE_WIDTHS = [480, 960, 1600];
const CUTOUT_HEIGHTS = [1000, 1400, 1800];
const LIMITS = { video: 2 * 1024 * 1024, preview: 400 * 1024 };
const INK = '#13142A';
const PAPER = '#F1F2F7';

const report = [];
const kb = (b) => `${(b / 1024).toFixed(0)} KB`;
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const webPath = (p) => '/' + path.relative(path.join(ROOT, 'public'), p).split(path.sep).join('/');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

function fresh(src, outs) {
  if (FORCE) return false;
  const t = fs.statSync(src).mtimeMs;
  return outs.every((o) => fs.existsSync(o) && fs.statSync(o).mtimeMs >= t);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`Could not run ${cmd}: ${r.error.message}. Is it installed and on PATH?`);
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${(r.stderr || '').split('\n').slice(-15).join('\n')}`);
  return r.stdout;
}

function track(file, note = '') {
  report.push({ file: rel(file), size: fs.statSync(file).size, note });
}

// Which videos keep their audio track (opt-in per video with "audio": true in the content file).
function audioVideos() {
  const file = path.resolve(ROOT, process.env.CREATOR || 'src/content/creator.json');
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    return new Set((c.videos || []).filter((v) => v.audio).map((v) => v.src));
  } catch {
    return new Set();
  }
}

// ---------- images ----------
async function processImage(src, key) {
  const base = path.join(OUT, key.replace(/\.[^.]+$/, ''));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const meta = await sharp(src).metadata();
  const widths = IMAGE_WIDTHS.filter((w) => w < meta.width);
  if (widths.length < IMAGE_WIDTHS.length) widths.push(meta.width);
  const entry = { kind: 'image', width: meta.width, height: meta.height, avif: [], webp: [] };
  for (const w of [...new Set(widths)]) {
    for (const fmt of ['avif', 'webp']) {
      const out = `${base}-${w}.${fmt}`;
      if (!fresh(src, [out])) {
        const img = sharp(src).resize({ width: w, withoutEnlargement: true });
        await (fmt === 'avif' ? img.avif({ quality: 52, effort: 5 }) : img.webp({ quality: 78 })).toFile(out);
      }
      entry[fmt].push({ w, src: webPath(out) });
      track(out);
    }
  }
  return entry;
}

// ---------- cut-outs ----------
async function hasRealAlpha(src) {
  const { channels, isOpaque } = await sharp(src).stats();
  return channels.length === 4 && !isOpaque;
}

function removeBackground(src) {
  const tmp = path.join(DEBUG, `rembg-${path.basename(src, path.extname(src))}.png`);
  fs.mkdirSync(DEBUG, { recursive: true });
  try {
    run('rembg', ['i', '-m', 'isnet-general-use', src, tmp]);
  } catch (e) {
    throw new Error(
      `${rel(src)} has no transparent background and rembg could not run.\n` +
        `  Fix: pip install "rembg[cli]" (Python 3.10–3.12 recommended), or export the cut-out as a transparent PNG.\n  ${e.message}`
    );
  }
  return tmp;
}

// Erode the alpha by 1px (kills the light halo around hair) then feather it slightly; crop to the subject.
async function refineAlpha(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3];
  const eroded = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          m = Math.min(m, a[yy * w + xx]);
        }
      eroded[y * w + x] = m;
    }
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          s += eroded[yy * w + xx];
        }
      const v = Math.round(s / 9);
      data[(y * w + x) * 4 + 3] = v;
      if (v > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .png()
    .toBuffer();
}

async function processCutout(src, key) {
  const base = path.join(OUT, key.replace(/\.[^.]+$/, ''));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const srcH = (await sharp(src).metadata()).height;
  const heights = [...new Set([...CUTOUT_HEIGHTS.filter((h) => h < srcH * 0.92), Math.min(CUTOUT_HEIGHTS.at(-1), srcH)])];
  const outs = heights.map((h) => `${base}-${h}h.webp`);
  const debugOut = path.join(DEBUG, `${key.replace(/[\\/]/g, '_').replace(/\.[^.]+$/, '')}-preview.png`);
  let refined;
  if (!fresh(src, [...outs, debugOut])) {
    const input = (await hasRealAlpha(src)) ? src : removeBackground(src);
    refined = await refineAlpha(input);
    for (const [i, h] of heights.entries()) {
      await sharp(refined).resize({ height: h, withoutEnlargement: true })
        .webp({ quality: 76, alphaQuality: 85, effort: 6, smartSubsample: true }).toFile(outs[i]);
    }
    // Debug preview: the cut-out over ink and over paper, side by side.
    const small = await sharp(refined).resize({ height: 800 }).png().toBuffer();
    const sm = await sharp(small).metadata();
    fs.mkdirSync(DEBUG, { recursive: true });
    await sharp({ create: { width: sm.width * 2 + 60, height: 860, channels: 4, background: INK } })
      .composite([
        { input: { create: { width: sm.width + 30, height: 860, channels: 4, background: PAPER } }, left: sm.width + 30, top: 0 },
        { input: small, left: 15, top: 30 },
        { input: small, left: sm.width + 45, top: 30 },
      ])
      .png().toFile(debugOut);
  }
  const entry = { kind: 'cutout', webp: [] };
  for (const o of outs) {
    const m = await sharp(o).metadata();
    entry.webp.push({ w: m.width, h: m.height, src: webPath(o) });
    entry.width = m.width;
    entry.height = m.height;
    track(o);
  }
  return entry;
}

// ---------- videos ----------
function probe(src) {
  const out = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type:format=duration', '-of', 'json', src]));
  return {
    duration: Number(out.format.duration),
    hasAudio: out.streams.some((s) => s.codec_type === 'audio'),
  };
}

const VF = (w, h) => `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=30,format=yuv420p`;

// Encode, and if the result is over the limit, retry with a higher CRF.
function encodeUnder(limit, startCrf, step, build, out) {
  for (let crf = startCrf, i = 0; i < 5; crf += step, i++) {
    run('ffmpeg', ['-y', '-v', 'error', ...build(crf), out]);
    if (fs.statSync(out).size <= limit) return;
  }
}

async function processVideo(src, key, keepAudio) {
  const base = path.join(OUT, key.replace(/\.[^.]+$/, ''));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const info = probe(src);
  const audio = keepAudio && info.hasAudio;
  const o = {
    mp4: `${base}.mp4`, webm: `${base}.webm`, preview: `${base}-preview.mp4`,
    poster: `${base}-poster.jpg`, posterSm: `${base}-poster-sm.jpg`,
    thumbs: [1, 2, 3, 4].map((n) => `${base}-t${n}.webp`),
  };
  const all = [o.mp4, o.webm, o.preview, o.poster, o.posterSm, ...o.thumbs];
  if (!fresh(src, all)) {
    const a = audio ? ['-c:a', 'aac', '-b:a', '96k'] : ['-an'];
    const aw = audio ? ['-c:a', 'libopus', '-b:a', '64k'] : ['-an'];
    console.log(`  encoding ${key} …`);
    encodeUnder(LIMITS.video, 25, 3, (crf) => ['-i', src, '-vf', VF(720, 1280), '-c:v', 'libx264', '-profile:v', 'high',
      '-preset', 'slow', '-crf', String(crf), '-maxrate', '1600k', '-bufsize', '3200k', ...a, '-movflags', '+faststart'], o.mp4);
    encodeUnder(LIMITS.video, 36, 4, (crf) => ['-i', src, '-vf', VF(720, 1280), '-c:v', 'libvpx-vp9', '-crf', String(crf),
      '-b:v', '1300k', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3', ...aw], o.webm);
    const len = Math.min(6, info.duration).toFixed(2);
    encodeUnder(LIMITS.preview, 30, 3, (crf) => ['-i', src, '-t', len, '-vf', VF(360, 640), '-c:v', 'libx264', '-profile:v', 'main',
      '-preset', 'slow', '-crf', String(crf), '-maxrate', '480k', '-bufsize', '960k', '-an', '-movflags', '+faststart'], o.preview);
    // Poster: the most representative frame of the first second (skips black/blurry first frames).
    run('ffmpeg', ['-y', '-v', 'error', '-t', '1', '-i', src, '-vf', `thumbnail=30,${VF(720, 1280)}`, '-frames:v', '1', '-q:v', '4', o.poster]);
    run('ffmpeg', ['-y', '-v', 'error', '-t', '1', '-i', src, '-vf', `thumbnail=30,${VF(360, 640)}`, '-frames:v', '1', '-q:v', '5', o.posterSm]);
    for (const [i, f] of [0.15, 0.38, 0.62, 0.85].entries()) {
      run('ffmpeg', ['-y', '-v', 'error', '-ss', (info.duration * f).toFixed(2), '-i', src, '-vf', VF(240, 426),
        '-frames:v', '1', '-c:v', 'libwebp', '-quality', '70', o.thumbs[i]]);
    }
  }
  for (const f of all) {
    const size = fs.statSync(f).size;
    const over = (f === o.preview && size > LIMITS.preview) || ((f === o.mp4 || f === o.webm) && size > LIMITS.video);
    track(f, over ? 'OVER LIMIT' : '');
  }
  return {
    kind: 'video',
    duration: Number(info.duration.toFixed(2)),
    hasAudio: audio,
    mp4: webPath(o.mp4), webm: webPath(o.webm), preview: webPath(o.preview),
    poster: webPath(o.poster), posterSm: webPath(o.posterSm),
    thumbs: o.thumbs.map(webPath),
  };
}

// ---------- main ----------
async function main() {
  if (!fs.existsSync(RAW)) throw new Error('No raw/ folder found next to package.json.');
  const files = walk(RAW).filter((f) => !path.basename(f).startsWith('.'));
  const keepAudio = audioVideos();
  const manifest = {};
  const errors = [];
  for (const file of files) {
    const key = path.relative(RAW, file).split(path.sep).join('/');
    const ext = path.extname(file).toLowerCase();
    try {
      if (IMAGE_EXT.has(ext)) {
        manifest[key] = /cutout/i.test(path.basename(file)) ? await processCutout(file, key) : await processImage(file, key);
        console.log(`✓ ${key}`);
      } else if (VIDEO_EXT.has(ext)) {
        manifest[key] = await processVideo(file, key, keepAudio.has(key));
        console.log(`✓ ${key}`);
      }
    } catch (e) {
      errors.push(`✗ ${key}\n  ${e.message}`);
    }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log('\nSize report');
  console.log('-----------');
  let total = 0;
  for (const r of report) {
    total += r.size;
    console.log(`${kb(r.size).padStart(8)}  ${r.file}${r.note ? '   ⚠ ' + r.note : ''}`);
  }
  console.log(`${kb(total).padStart(8)}  total in public/media`);
  const cut = Object.entries(manifest).filter(([k, v]) => v.kind === 'cutout' && /cover/i.test(k));
  for (const [k, v] of cut) console.log(`  first-screen cut-out ${k}: ${v.webp.map((x) => `${x.h}h ${kb(fs.statSync(path.join(ROOT, 'public', x.src)).size)}`).join(', ')}`);
  console.log(`\nDebug previews of cut-outs: ${rel(DEBUG)}/`);
  console.log(`Manifest: ${rel(MANIFEST)}`);
  if (errors.length) {
    console.error('\nSome files could not be processed:\n' + errors.join('\n'));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
