import { gsap, ScrollTrigger } from '../lib/motion';
import { SplitText } from 'gsap/SplitText';
import { $, $$, env, MQ, SCRUB } from '../lib/env';

gsap.registerPlugin(SplitText);

/** Top scroll-progress line. */
export function initNav() {
  const bar = $('.progress span');
  if (!bar) return;
  const set = gsap.quickSetter(bar, 'scaleX');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => set(s.progress) });
}

/** 6. Rotating badge that speeds up with scroll velocity + service cards rise in. */
export function initMake() {
  const section = $('.make');
  if (!section || !env.fx) return;
  const spin = gsap.to('.badge__spin', { rotation: 360, svgOrigin: '100 100', duration: 22, ease: 'none', repeat: -1, paused: true });
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: (s) => (s.isActive ? spin.play() : spin.pause()),
    onUpdate: (s) => {
      const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 220, 9);
      gsap.to(spin, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(spin, { timeScale: 1, duration: 1.2 }); } });
    },
  });
  const cards = $$('.service', section);
  gsap.set(cards, { y: 50, opacity: 0 });
  ScrollTrigger.batch(cards, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }) });
}

/** 7. Sideways steps: pinned scrub on desktop, native swipe on mobile. */
export function initProcess() {
  const section = $('.process');
  if (!section || !env.fx) return;
  const viewport = $('.process__viewport', section)!;
  const track = $('.process__track', section)!;
  const mm = gsap.matchMedia();
  mm.add(MQ.desktop, () => {
    const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    const size = () => { section.style.height = dist() > 0 ? `${dist() + innerHeight}px` : ''; };
    size();
    ScrollTrigger.addEventListener('refreshInit', size);
    const tw = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true, toggleClass: 'is-active' },
    });
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', size);
      tw.scrollTrigger?.kill(); tw.kill();
      section.style.height = '';
      gsap.set(track, { clearProps: 'x' });
    };
  });
}

/** Headline word reveals. */
export function initHeadlines() {
  if (!env.fx) return;
  $$('.contact__title, .about__hi').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', aria: 'auto' });
    gsap.set(split.words, { yPercent: 40, opacity: 0 });
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(split.words, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.06 }),
    });
  });
}

/** 8. Enquiry form → pre-filled email, with a copy fallback. */
export function initContact() {
  const form = $<HTMLFormElement>('.enquiry');
  if (!form) return;
  const status = $('.enquiry__status', form)!;
  const brand = $<HTMLInputElement>('#f-brand', form)!;
  const email = form.dataset.email!;

  const message = () => {
    const f = new FormData(form);
    const deliverables = f.getAll('deliverables').join(', ') || '—';
    const line = (k: string, v: FormDataEntryValue | null) => `${k}: ${String(v ?? '').trim() || '—'}`;
    return [
      'Hi! We would love to work with you on a UGC collaboration.', '',
      line('Brand', f.get('brand')), line('Website / Instagram', f.get('site')), line('Product', f.get('product')),
      `Deliverables: ${deliverables}`, line('Budget', f.get('budget')), line('Timeline', f.get('timeline')), '',
      String(f.get('message') ?? '').trim(),
    ].join('\n').trim();
  };
  const say = (text: string, error = false) => { status.textContent = text; status.classList.toggle('is-error', error); };
  const valid = () => {
    const ok = brand.value.trim().length > 0;
    brand.setAttribute('aria-invalid', String(!ok));
    if (!ok) { say('Please add your brand name.', true); brand.focus(); }
    return ok;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    const subject = `UGC collaboration: ${brand.value.trim()}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message())}`;
    say(`Opening your email app… If nothing happens, use "Copy message" and send it to ${email}.`);
  });
  $('.enquiry__copy', form)!.addEventListener('click', async () => {
    if (!valid()) return;
    const text = message();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    say(`Copied! Paste it into an email to ${email} or a DM.`);
  });
}
