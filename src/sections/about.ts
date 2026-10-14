import { gsap, ScrollTrigger } from '../lib/motion';
import { $, $$, compact, env } from '../lib/env';

export function initAbout() {
  const section = $('.about');
  if (!section) return;
  const polaroid = $('.polaroid', section)!;
  const img = $('.polaroid__img img', section)!;
  const blank = $('.polaroid__blank', section)!;
  const chips = $$('.chips .sticker', section);
  const nums = $$<HTMLElement>('.stat__num', section);

  if (!env.fx) {
    gsap.set(blank, { opacity: 0 });
    return;
  }

  // Photo "develops": blank grey square → photo (opacity, blur, saturation) over 1.2s.
  gsap.set(img, { opacity: 0, filter: 'blur(14px) saturate(0) brightness(1.25)' });
  ScrollTrigger.create({
    trigger: polaroid, start: 'top 75%', once: true,
    onEnter: () => {
      gsap.timeline()
        .to(blank, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0)
        .to(img, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
        .to(img, { filter: 'blur(0px) saturate(1) brightness(1)', duration: 1.2, ease: 'power2.out' }, 0);
    },
  });

  // Niche chips pop in like stickers.
  gsap.set(chips, { scale: 0, rotation: -25, opacity: 0 });
  ScrollTrigger.create({
    trigger: '.chips', start: 'top 85%', once: true,
    onEnter: () => gsap.to(chips, { scale: 1, rotation: (_i: number, el: Element) => parseFloat(getComputedStyle(el as Element).getPropertyValue('--r')) || 0, opacity: 1, duration: 0.55, ease: 'back.out(2.2)', stagger: 0.08 }),
  });

  // Rolling counters.
  ScrollTrigger.create({
    trigger: '.stats', start: 'top 90%', once: true,
    onEnter: () => nums.forEach((el) => {
      const target = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = compact(Math.round(o.v)); } });
    }),
  });

  // Polaroid tilt: cursor on desktop, gyroscope on phones that allow it without a prompt, otherwise a gentle sway.
  const rx = gsap.quickTo(polaroid, 'rotationX', { duration: 0.6, ease: 'power3' });
  const ry = gsap.quickTo(polaroid, 'rotationY', { duration: 0.6, ease: 'power3' });
  gsap.set(polaroid, { rotation: -4 });
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
  if (!env.touch && !env.capture) {
    section.addEventListener('pointermove', (e) => {
      const r = polaroid.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const ny = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      ry(gsap.utils.clamp(-16, 16, nx * 30));
      rx(gsap.utils.clamp(-14, 14, -ny * 26));
    });
    section.addEventListener('pointerleave', () => { rx(0); ry(0); });
  } else if (!env.capture && DOE && typeof DOE.requestPermission !== 'function') {
    let got = false;
    const sway = startSway(polaroid);
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (!got) { got = true; sway.kill(); }
      ry(gsap.utils.clamp(-14, 14, e.gamma * 0.5));
      rx(gsap.utils.clamp(-12, 12, (e.beta - 45) * -0.4));
    });
  } else {
    startSway(polaroid);
  }
}

function startSway(el: HTMLElement) {
  return gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
    .fromTo(el, { rotationY: -7, rotationX: 3 }, { rotationY: 7, rotationX: -3, duration: 3.2 });
}
