import { gsap, ScrollTrigger } from '../lib/motion';
import { $, $$, env, MQ, SCRUB } from '../lib/env';
import { openPlayer } from './player';

export function initCases() {
  const section = $('.cases');
  if (!section) return;
  const deck = $('.cases__deck', section)!;
  const cards = $$('.card', section);

  cards.forEach((card) => {
    const inner = $('.card__inner', card)!;
    const front = $<HTMLButtonElement>('.card__flip', card)!;
    const back = $('.card__back', card)!;
    const flip = (on: boolean, focus = true) => {
      card.classList.toggle('is-flipped', on);
      front.setAttribute('aria-expanded', String(on));
      back.inert = !on;
      gsap.to(inner, { rotationY: on ? 180 : 0, duration: env.fx ? 0.75 : 0, ease: 'power3.inOut' });
      if (focus) (on ? $<HTMLButtonElement>('.card__watch', back) : front)?.focus({ preventScroll: true });
    };
    front.addEventListener('click', () => flip(true));
    $('.card__unflip', card)!.addEventListener('click', () => flip(false));
    back.addEventListener('click', (e) => { if (!(e.target as Element).closest('button, a')) flip(false); });
    $('.card__watch', card)!.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement;
      openPlayer({ brand: btn.dataset.brand, origin: btn });
    });
  });

  if (!env.fx) return;

  const mm = gsap.matchMedia();
  // Desktop: a stack in the middle fans out into a row as you scroll.
  mm.add(MQ.desktop, () => {
    const offsets = () => {
      const d = deck.getBoundingClientRect();
      const mid = d.left + d.width / 2;
      return cards.map((c) => { const r = c.getBoundingClientRect(); return mid - (r.left + r.width / 2); });
    };
    let dx = offsets();
    const mid = (cards.length - 1) / 2;
    const tl = gsap.fromTo(cards,
      { x: (i) => dx[i], y: (i) => -i * 6, rotation: (i) => (i - mid) * 7, rotationY: 0 },
      {
        x: 0, y: 0, rotation: 0, ease: 'power2.out', stagger: 0.04,
        scrollTrigger: {
          trigger: deck, start: 'top 85%', end: 'center 55%', scrub: SCRUB, toggleClass: { targets: section, className: 'is-active' },
          invalidateOnRefresh: true,
          onRefreshInit: () => { gsap.set(cards, { x: 0, y: 0, rotation: 0 }); dx = offsets(); },
        },
      });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(cards, { clearProps: 'x,y,rotation' }); };
  });
  // Mobile: cards are dealt from a stack into the swipeable carousel once.
  mm.add(MQ.mobile, () => {
    gsap.set(cards, { xPercent: (i) => -i * 104, rotation: (i) => i * 5, y: (i) => i * 4 });
    const st = ScrollTrigger.create({
      trigger: deck, start: 'top 75%', once: true,
      onEnter: () => gsap.to(cards, { xPercent: 0, rotation: 0, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }),
    });
    return () => { st.kill(); gsap.set(cards, { clearProps: 'xPercent,rotation,y' }); };
  });
}
