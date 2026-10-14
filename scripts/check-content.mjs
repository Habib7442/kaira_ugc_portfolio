#!/usr/bin/env node
// npm run check-content
// Checks creator.json (or the file in $CREATOR) and explains every problem in plain words.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.resolve(ROOT, process.env.CREATOR || 'src/content/creator.json');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/creator.schema.json'), 'utf8'));
const manifestFile = path.join(ROOT, 'src/content/media.json');

const errors = [];
const warnings = [];
const short = path.relative(ROOT, file);

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`✗ ${short} is not valid JSON.\n  ${e.message}\n  Tip: look for a missing comma or quote near that position.`);
  process.exit(1);
}

// 1. Schema
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const where = (p) => (p ? p.replace(/^\//, '').replace(/\/(\d+)/g, '[$1]').replace(/\//g, ' → ') : 'top level');
if (!validate(data)) {
  for (const e of validate.errors) {
    const at = where(e.instancePath);
    switch (e.keyword) {
      case 'required': errors.push(`Missing "${e.params.missingProperty}" in ${at}.`); break;
      case 'additionalProperties': errors.push(`Unknown field "${e.params.additionalProperty}" in ${at}. Check the spelling (fields are case-sensitive).`); break;
      case 'enum': errors.push(`${at} must be one of: ${e.params.allowedValues.join(', ')}.`); break;
      case 'pattern':
        if (at.endsWith('email')) errors.push(`${at} doesn't look like an email address.`);
        else if (/handle|instagram/.test(at)) errors.push(`${at} should be the handle only, without @ or a URL (letters, numbers, dots, underscores).`);
        else if (/theme/.test(at)) errors.push(`${at} must be a 6-digit hex colour like #D6FF3D.`);
        else if (/whatsapp/.test(at)) errors.push(`${at} should be a phone number in international format, e.g. +91 98765 43210.`);
        else errors.push(`${at} should be a path inside raw/ like "creator/photo.png" (no leading slash).`);
        break;
      case 'maxLength': errors.push(`${at} is too long (max ${e.params.limit} characters). Shorter text looks better on phones.`); break;
      case 'minLength': errors.push(`${at} is too short or empty.`); break;
      case 'maxItems': errors.push(`${at} has too many items (max ${e.params.limit}).`); break;
      case 'minItems': errors.push(`${at} needs at least ${e.params.limit} item(s).`); break;
      case 'type': errors.push(`${at} should be a ${e.params.type}.`); break;
      default: errors.push(`${at}: ${e.message}.`);
    }
  }
}

// 2. Cross-checks
if (errors.length === 0) {
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;
  if (!manifest) errors.push('src/content/media.json is missing. Run "npm run assets" first.');
  const media = (p, at, kinds) => {
    if (!manifest) return;
    const m = manifest[p];
    if (!fs.existsSync(path.join(ROOT, 'raw', p))) errors.push(`${at}: raw/${p} does not exist.`);
    else if (!m) errors.push(`${at}: raw/${p} has not been processed yet. Run "npm run assets".`);
    else if (!kinds.includes(m.kind)) errors.push(`${at}: raw/${p} is a ${m.kind}, expected ${kinds.join(' or ')}. Cut-out files must have "cutout" in their name.`);
  };
  const ph = data.photos;
  media(ph.coverCutout, 'photos → coverCutout', ['cutout']);
  if (ph.coverCutoutMobile) media(ph.coverCutoutMobile, 'photos → coverCutoutMobile', ['cutout']);
  media(ph.orbitCutout, 'photos → orbitCutout', ['cutout']);
  media(ph.polaroid, 'photos → polaroid', ['image']);
  if (ph.master) media(ph.master, 'photos → master', ['image', 'cutout']);

  const ids = new Set();
  data.videos.forEach((v, i) => {
    if (ids.has(v.id)) errors.push(`videos[${i}]: the id "${v.id}" is used twice. Each video needs its own id.`);
    ids.add(v.id);
    media(v.src, `videos[${i}] (${v.id})`, ['video']);
    if (v.poster) media(v.poster, `videos[${i}] poster`, ['image']);
  });
  const brandNames = new Set(data.brands.map((b) => b.name.toUpperCase()));
  data.videos.forEach((v, i) => {
    if (!brandNames.has(v.brand.toUpperCase())) warnings.push(`videos[${i}] brand "${v.brand}" is not in the brands list (it won't appear in the orbit).`);
  });
  data.caseStudies.forEach((c, i) => {
    media(c.image, `caseStudies[${i}] (${c.brand}) image`, ['image']);
    c.videoIds.forEach((id) => { if (!ids.has(id)) errors.push(`caseStudies[${i}] (${c.brand}) points to video "${id}", but no video has that id.`); });
  });
  if (data.showPrices) {
    data.services.forEach((s, i) => { if (s.fromPrice == null) warnings.push(`services[${i}] (${s.name}) has no fromPrice, so it will say "Rates on request".`); });
  }
  if (data.firstName.length > 8) warnings.push(`firstName "${data.firstName}" is long; the cover word will be smaller. A nickname often looks better.`);
  if (data.videos.length < 4) warnings.push(`Only ${data.videos.length} video(s). The tunnel looks best with 6 or more.`);
  if (data.demo === false && (data.stats.demo || /example\.com$/.test(data.contact.email))) warnings.push('demo is false but stats are still marked demo or the email is a placeholder.');

  // Theme contrast: ink text must be readable on lime and paper (WCAG AA 4.5:1).
  const t = { ink: '#13142A', paper: '#F1F2F7', lime: '#D6FF3D', lavender: '#B8A6FF', ...(data.theme || {}) };
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  for (const bg of ['lime', 'paper', 'lavender']) {
    const r = ratio(t.ink, t[bg]);
    if (r < 4.5) errors.push(`theme: ink text on ${bg} has contrast ${r.toFixed(2)}:1 (needs 4.5:1). Pick a lighter ${bg} or a darker ink.`);
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`\n✗ ${short} has ${errors.length} problem(s):\n`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  console.error('');
  process.exit(1);
}
console.log(`✓ ${short} looks good (${data.videos.length} videos, ${data.brands.length} brands, ${data.caseStudies.length} case studies).`);
