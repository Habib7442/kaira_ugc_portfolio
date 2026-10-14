import { gsap } from '../lib/motion';
import { $, $$, env, MQ, SCRUB } from '../lib/env';

// Starting depths for each letter (px). Positive = closer, but always behind the cut-out layer.
const DEPTHS = [14, -18, 24, -8, 10, -22, 18, -12, 6, -16];

export function initCover() {
  const section = $('.cover');
  if (!section || !env.fx) return;
  const scene = $('.cover__scene', section)!;
  const letters = $$('.cover__letter', section);
  const figure = $('.cover__figure img', section)!;

  letters.forEach((l, i) => gsap.set(l, { z: DEPTHS[i % DEPTHS.length] }));

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
    const { mobile } = ctx.conditions as { mobile: boolean };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: SCRUB, toggleClass: 'is-active' },
    });
    // 0 → .55: letters fly back to different depths; she steps forward.
    tl.to(letters, {
      z: (i) => -500 - ((i * 337) % 900),
      y: (i) => (i % 2 ? -1 : 1) * (mobile ? 30 : 60),
      rotationY: (i) => (i - (letters.length - 1) / 2) * 9,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4,
    }, 0)
      .to(figure, { scale: 1.12, yPercent: -3, duration: 0.55 }, 0)
      .to('.cover__meta, .cover__bottom, .cover__tag', { opacity: 0, y: -20, duration: 0.2, stagger: 0.02 }, 0.02)
      // .4 → 1: the whole scene tilts back and dissolves into the next section.
      .to(scene, { rotationX: 12, duration: 0.6 }, 0.4)
      .to(scene, { opacity: 0, duration: 0.35 }, 0.65);
    return () => tl.kill();
  });

  // Desktop: subtle mouse parallax on three layers.
  if (!env.touch && !env.capture) {
    const layers = [
      { el: $('.cover__name', section)!, k: -14 },
      { el: $('.cover__figure', section)!, k: 8 },
      { el: $('.cover__bg', section)!, k: -24 },
    ].map(({ el, k }) => ({ k, x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }) }));
    section.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * l.k); l.y(ny * l.k * 0.6); });
    });
  }
}

/** Marks the opening as seen so returning visitors skip it. */
export function initIntro() {
  const html = document.documentElement;
  if (html.classList.contains('no-intro') || !html.classList.contains('fx')) return;
  setTimeout(() => {
    try { localStorage.setItem('btp-seen', '1'); } catch { /* private mode */ }
  }, 1050);
}
