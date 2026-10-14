import type { CutoutEntry, ImageEntry, Manifest, MediaEntry, VideoEntry } from '../content/types.ts';

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const attr = (o: Record<string, string | number | boolean | undefined>): string =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');

export function getMedia<K extends MediaEntry['kind']>(m: Manifest, key: string, kind: K): Extract<MediaEntry, { kind: K }> {
  const e = m[key];
  if (!e) throw new Error(`Media "${key}" is missing from media.json. Run "npm run assets".`);
  if (e.kind !== kind) throw new Error(`Media "${key}" is a ${e.kind}, expected ${kind}.`);
  return e as Extract<MediaEntry, { kind: K }>;
}

interface PicOpts { alt: string; sizes: string; cls?: string; imgCls?: string; lazy?: boolean; priority?: boolean }

export function picture(e: ImageEntry, o: PicOpts): string {
  const set = (list: { w: number; src: string }[]) => list.map((x) => `${x.src} ${x.w}w`).join(', ');
  const fallback = e.webp[Math.min(1, e.webp.length - 1)];
  return `<picture${o.cls ? ` class="${o.cls}"` : ''}><source type="image/avif" srcset="${set(e.avif)}" sizes="${o.sizes}"><source type="image/webp" srcset="${set(e.webp)}" sizes="${o.sizes}"><img ${attr({
    src: fallback.src, width: e.width, height: e.height, alt: o.alt, class: o.imgCls,
    loading: o.lazy === false ? undefined : 'lazy', decoding: 'async', fetchpriority: o.priority ? 'high' : undefined,
  })}></picture>`;
}

export const cutoutSet = (e: CutoutEntry) => e.webp.map((x) => `${x.src} ${x.w}w`).join(', ');

export function cutoutImg(e: CutoutEntry, o: PicOpts): string {
  return `<img ${attr({
    src: e.webp[0].src, srcset: cutoutSet(e), sizes: o.sizes, width: e.width, height: e.height, alt: o.alt, class: o.imgCls,
    loading: o.lazy === false ? undefined : 'lazy', decoding: 'async', fetchpriority: o.priority ? 'high' : undefined,
  })}>`;
}

export const compact = (n: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const money = (n: number, cur = '₹') =>
  `<span class="cur">${esc(cur)}</span>${new Intl.NumberFormat(cur === '₹' ? 'en-IN' : 'en').format(n)}`;

export type { VideoEntry };

const ICON_PATHS: Record<string, string> = {
  brief: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  script: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/>',
  shoot: '<rect x="3" y="7" width="13" height="11" rx="3"/><path d="M16 11l5-3v9l-5-3"/>',
  deliver: '<path d="M4 12l5 5L20 6"/>',
  edit: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5L20 18M8.5 15.5L20 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  flip: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
};

export const icon = (name: string, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] ?? ICON_PATHS.brief}</svg>`;
