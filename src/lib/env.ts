// Flags are decided by the inline script in index.html before first paint.
const cl = document.documentElement.classList;

export const env = {
  /** motion allowed (not prefers-reduced-motion) */
  fx: cl.contains('fx'),
  /** full 3D tunnel (motion allowed and not a low-power device) */
  fx3d: cl.contains('fx3d'),
  capture: cl.contains('is-capture'),
  touch: cl.contains('is-touch'),
};

/** Scroll-linked animations: exact (true) in capture mode, lightly smoothed otherwise. */
export const SCRUB: true | number = env.capture ? true : 0.5;

export const MQ = { desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' } as const;
export const isMobile = () => matchMedia(MQ.mobile).matches;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
