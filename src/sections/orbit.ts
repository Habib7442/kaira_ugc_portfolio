import { gsap, ScrollTrigger } from '../lib/motion';
import { $, $$, env, MQ, SCRUB } from '../lib/env';

const TILT = (70 * Math.PI) / 180; // ring tilted rotateX(70deg)
const PERSPECTIVE = 1100;

export function initOrbit() {
  const section = $('.orbit');
  if (!section) return;
  const stage = $('.orbit__stage', section)!;
  const pills = $$('.brand-pill', section);
  const count = $('.orbit__count', section);

  if (count && env.fx) {
    const n = Number(count.dataset.count);
    const o = { v: 0 };
    count.textContent = '0';
    ScrollTrigger.create({
      trigger: section, start: 'top 60%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: 1.4, ease: 'power2.out', onUpdate: () => { count.textContent = String(Math.round(o.v)); } }),
    });
  }
  if (!env.fx) return;

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
    const { mobile } = ctx.conditions as { mobile: boolean };
    const n = pills.length;
    const state = { rot: 0 };
    let R = 0;
    const measure = () => {
      const W = stage.clientWidth;
      R = mobile ? Math.min(W * 0.33, 170) : Math.min(W * 0.34, 540);
    };
    measure();

    // Each pill sits on a circle; the circle is tilted 70° so it reads as an ellipse.
    // Pills keep facing the viewer (the counter-rotation), are scaled by perspective,
    // and swap z-index with the cut-out (z-index 2) when they pass behind her.
    const render = () => {
      pills.forEach((p, i) => {
        const a = (i / n) * Math.PI * 2 + state.rot;
        const c = Math.cos(a);
        const x = R * Math.sin(a);
        const y = R * Math.cos(TILT) * c;
        const z = R * Math.sin(TILT) * c;
        const s = PERSPECTIVE / (PERSPECTIVE - z);
        const depth = (c + 1) / 2; // 0 back … 1 front
        p.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(s * (0.78 + depth * 0.22)).toFixed(3)})`;
        p.style.opacity = (0.38 + depth * 0.62).toFixed(3);
        p.style.zIndex = c >= 0 ? '3' : '1';
      });
    };

    const tl = gsap.to(state, {
      rot: -Math.PI * 2 * 1.15,
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: section, start: 'top bottom', end: 'bottom top', scrub: SCRUB, toggleClass: 'is-active',
        onRefresh: () => { measure(); render(); },
      },
    });
    render();
    return () => { tl.scrollTrigger?.kill(); tl.kill(); pills.forEach((p) => (p.style.cssText = '')); };
  });
}
